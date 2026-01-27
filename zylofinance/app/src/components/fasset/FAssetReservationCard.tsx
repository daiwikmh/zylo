"use client";

import { useState, useEffect } from 'react';
import { useReadContract, useAccount, useBalance } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { PrimeSdk } from '@etherspot/prime-sdk';
import { ASSET_MANAGER_ABI } from '../../contracts/abis';
import { CONTRACTS } from '../../contracts/config';
import { createReserveCollateralBatch, waitForUserOpReceipt, parseCollateralReservedEvent } from '../../utils/etherspot';
import { CHAIN_ID, TX_STATUS, DECIMAL_PLACES, type TxStatus } from '../../utils/constants';

interface FAssetReservationCardProps {
  primeSdk?: PrimeSdk | null;
  onReservationComplete?: (data: ReservationData) => void;
}

export interface ReservationData {
  paymentReference: string;
  agentUnderlyingAddress: string;
  lots: number;
  totalAmountXRP: number;
  collateralReservationId: string;
}

// AvailableAgentInfo from getAvailableAgentsDetailedList
interface AvailableAgentInfo {
  agentVault: `0x${string}`;
  ownerManagementAddress: `0x${string}`;
  feeBIPS: bigint;
  mintingVaultCollateralRatioBIPS: bigint;
  mintingPoolCollateralRatioBIPS: bigint;
  freeCollateralLots: bigint;
  status: number;
}

// Full AgentInfo from getAgentInfo
interface FullAgentInfo {
  agentVault: `0x${string}`;
  collateralPool: `0x${string}`;
  collateralPoolToken: `0x${string}`;
  feeBIPS: bigint;
  poolFeeShareBIPS: bigint;
  mintingVariableFeeBIPS: bigint;
  freeCollateralLots: bigint;
  underlyingAddressString: string;
}

export const FAssetReservationCard = ({
  primeSdk,
  onReservationComplete,
}: FAssetReservationCardProps) => {
  const { address, isConnected } = useAccount();
  const [lots, setLots] = useState(1);
  const [isReserving, setIsReserving] = useState(false);
  const [txStatus, setTxStatus] = useState<TxStatus>(TX_STATUS.IDLE);
  const [errorMessage, setErrorMessage] = useState('');
  const [txHash, setTxHash] = useState('');
  const [smartAccountAddress, setSmartAccountAddress] = useState<`0x${string}` | undefined>();
  const [selectedAgentIndex, setSelectedAgentIndex] = useState<number>(0);

  // Get smart account address from primeSdk
  useEffect(() => {
    async function getSmartAccount() {
      if (primeSdk) {
        try {
          const smartAddr = await primeSdk.getCounterFactualAddress();
          setSmartAccountAddress(smartAddr as `0x${string}`);
        } catch (error) {
          console.error('Failed to get smart account:', error);
        }
      }
    }
    getSmartAccount();
  }, [primeSdk]);

  // Get Smart Account C2FLR balance
  const { data: smartAccountBalance } = useBalance({
    address: smartAccountAddress as `0x${string}`,
    chainId: CHAIN_ID,
  });

  // Fetch available agents (query first 5 agents)
  const { data: agentsData, isLoading: agentsLoading } = useReadContract({
    address: CONTRACTS.ASSET_MANAGER,
    abi: ASSET_MANAGER_ABI,
    functionName: 'getAvailableAgentsDetailedList',
    chainId: CHAIN_ID,
    args: [BigInt(0), BigInt(5)],
  });

  const availableAgents = (agentsData as any)?.[0] as AvailableAgentInfo[] || [];
  const selectedAvailableAgent = availableAgents[selectedAgentIndex];

  // Fetch full agent info to get underlyingAddressString (XRP address)
  const { data: fullAgentData, isLoading: fullAgentLoading } = useReadContract({
    address: CONTRACTS.ASSET_MANAGER,
    abi: ASSET_MANAGER_ABI,
    functionName: 'getAgentInfo',
    chainId: CHAIN_ID,
    args: selectedAvailableAgent ? [selectedAvailableAgent.agentVault] : undefined,
    query: {
      enabled: !!selectedAvailableAgent,
    },
  });

  const selectedFullAgent = fullAgentData as FullAgentInfo | undefined;

  // Get collateral reservation fee
  const { data: reservationFee } = useReadContract({
    address: CONTRACTS.ASSET_MANAGER,
    abi: ASSET_MANAGER_ABI,
    functionName: 'collateralReservationFee',
    chainId: CHAIN_ID,
    args: [BigInt(lots)],
  });

  // Check if selected agent has enough free collateral
  const hasEnoughCollateral = selectedAvailableAgent
    ? selectedAvailableAgent.freeCollateralLots >= BigInt(lots)
    : false;

  const handleReserveCollateral = async () => {
    if (!primeSdk || !smartAccountAddress || lots < 1) {
      setErrorMessage('Please connect wallet and enter valid lot size');
      return;
    }

    if (!selectedAvailableAgent) {
      setErrorMessage('Please select an agent');
      return;
    }

    if (!hasEnoughCollateral) {
      setErrorMessage(`Agent only has ${selectedAvailableAgent.freeCollateralLots.toString()} lots available. Please select a different agent or reduce lot size.`);
      return;
    }

    if (!reservationFee) {
      setErrorMessage('Unable to calculate reservation fee');
      return;
    }

    // Check if smart account has enough balance for CRF
    if (!smartAccountBalance || smartAccountBalance.value < reservationFee) {
      setErrorMessage(`Insufficient balance. You need ${formatEther(reservationFee)} C2FLR for the Collateral Reservation Fee.`);
      setTxStatus(TX_STATUS.ERROR);
      return;
    }

    try {
      setIsReserving(true);
      setErrorMessage('');
      setTxStatus(TX_STATUS.PENDING);

      const agentAddress = selectedAvailableAgent.agentVault;
      const lotsValue = BigInt(lots);
      const executor = smartAccountAddress;

      // Get agent's minting fee and add buffer for max acceptable fee
      // If agent charges 5% (500 BIPS), we accept up to 5%
      const maxMintingFeeBIPS = selectedAvailableAgent.feeBIPS;

      console.log('Reserving collateral with:', {
        agent: agentAddress,
        lots: lotsValue.toString(),
        maxMintingFeeBIPS: maxMintingFeeBIPS.toString(),
        executor,
        crf: formatEther(reservationFee),
        reservationFee: reservationFee.toString()
      });

      // Call the batch transaction helper with CRF as value
      const userOpHash = await createReserveCollateralBatch(
        primeSdk,
        agentAddress,
        lotsValue,
        maxMintingFeeBIPS,
        executor,
        reservationFee,
      );

      setTxHash(userOpHash);

      // Wait for receipt
      const receipt = await waitForUserOpReceipt(primeSdk, userOpHash);
      console.log('UserOp Receipt:', JSON.stringify(receipt, null, 2));

      if (receipt.success) {
        // Parse the CollateralReserved event
        const eventData = parseCollateralReservedEvent(receipt);

        // Calculate total XRP amount (value + fee in UBA/drops)
        const totalUBA = Number(eventData.valueUBA) + Number(eventData.feeUBA);
        const totalXRP = totalUBA / 1_000_000; // Convert drops to XRP
        console.log(`Total XRP to send: ${totalXRP} XRP`);
        const reservationData: ReservationData = {
          paymentReference: eventData.paymentReference as string,
          agentUnderlyingAddress: eventData.paymentAddress as string, // This is the XRP address from event
          lots,
          totalAmountXRP: totalXRP,
          collateralReservationId: eventData.collateralReservationId.toString(),
        };

        console.log('Reservation successful:', reservationData);
        setTxStatus(TX_STATUS.SUCCESS);

        // Notify parent component
        if (onReservationComplete) {
          onReservationComplete(reservationData);
        }
      } else {
        // Try to extract revert reason from receipt
        const revertReason = receipt.reason || 'Unknown on-chain error';
        console.error('Transaction failed on-chain. Reason:', revertReason);
        console.error('Full receipt:', receipt);
        throw new Error(`Transaction execution failed: ${revertReason}`);
      }
    } catch (error: any) {
      console.error('Reservation failed:', error);
      setTxStatus(TX_STATUS.ERROR);

      let errorMsg = error.message || 'Reservation failed';

      if (errorMsg.includes('AA21') || errorMsg.includes('paymaster balance')) {
        errorMsg = 'Paymaster sponsorship failed. Please contact Zylo support to top up the gas tank.';
      } else if (errorMsg.includes('AA10')) {
        errorMsg = 'Smart Account deployment failed. Ensure your account is correctly initialized.';
      } else if (errorMsg.includes('execution reverted')) {
        errorMsg = 'Transaction reverted. Please check agent availability and try again.';
      }

      setErrorMessage(errorMsg);
    } finally {
      setIsReserving(false);
    }
  };

  const resetStatus = () => {
    setTxStatus(TX_STATUS.IDLE);
    setErrorMessage('');
    setTxHash('');
  };

  if (!isConnected) {
    return (
      <div className="fasset-reservation-card" style={{
        background: '#0D0D0D',
        boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
        border: '1px solid rgba(168, 85, 247, 0.2)'
      }}>
        <div className="fasset-card-header">
          <h2 className="fasset-card-title" style={{ color: '#ffffff' }}>Reserve Collateral</h2>
          <span className="fasset-badge" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7' }}>Step 1</span>
        </div>
        <div className="fasset-not-connected">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Connect your wallet to reserve collateral</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fasset-reservation-card" style={{
      background: '#0D0D0D',
      boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
      border: '1px solid rgba(168, 85, 247, 0.2)'
    }}>
      {/* Header */}
      <div className="fasset-card-header">
        <div>
          <h2 className="fasset-card-title" style={{ color: '#ffffff' }}>Reserve Collateral</h2>
          <p className="fasset-card-subtitle" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Step 1: Choose your lot size and pay CRF</p>
        </div>
        <span className="fasset-badge" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7' }}>1 Lot = 10 XRP</span>
      </div>

      {/* Smart Account Info */}
      {smartAccountAddress && (
        <div style={{
          padding: '0.75rem 1rem',
          background: 'rgba(168, 85, 247, 0.1)',
          borderRadius: '0.75rem',
          marginBottom: '1rem',
          fontSize: '0.75rem',
          border: '1px solid rgba(168, 85, 247, 0.2)'
        }}>
          <div style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.25rem' }}>Smart Account Address</div>
          <div style={{ color: '#a855f7', fontFamily: 'monospace', fontWeight: '600', wordBreak: 'break-all' }}>
            {smartAccountAddress}
          </div>
        </div>
      )}

      {/* Balance Display */}
      <div className="fasset-info-box" style={{
        background: 'rgba(168, 85, 247, 0.05)',
        border: '1px solid rgba(168, 85, 247, 0.2)',
        color: 'rgba(255, 255, 255, 0.9)'
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <div>
          <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Smart Account Balance: </span>
          <strong style={{ color: '#a855f7' }}>
            {smartAccountBalance ? parseFloat(formatEther(smartAccountBalance.value)).toFixed(DECIMAL_PLACES.BALANCE) : '0.00'} C2FLR
          </strong>
        </div>
      </div>

      {/* Warning if no balance */}
      {smartAccountBalance && smartAccountBalance.value === BigInt(0) && (
        <div style={{
          padding: '1rem',
          background: 'rgba(251, 191, 36, 0.1)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          borderRadius: '0.75rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" style={{ flexShrink: 0, marginTop: '0.125rem' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div style={{ fontSize: '0.875rem', color: '#fbbf24' }}>
            <strong>No Balance!</strong> Send C2FLR to your Smart Account address above to get started.
          </div>
        </div>
      )}

      {/* Agent Selection */}
      <div className="fasset-input-group">
        <label className="fasset-input-label">Select Agent</label>
        {agentsLoading ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)' }}>
            Loading available agents...
          </div>
        ) : availableAgents.length === 0 ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)' }}>
            No agents available
          </div>
        ) : (
          <>
            <select
              className="fasset-input"
              value={selectedAgentIndex}
              onChange={(e) => {
                setSelectedAgentIndex(parseInt(e.target.value));
                setErrorMessage('');
              }}
              disabled={isReserving}
            >
              {availableAgents.map((agent: AvailableAgentInfo, index: number) => (
                <option key={agent.agentVault} value={index}>
                  Agent {index + 1} - {agent.freeCollateralLots.toString()} lots - Fee: {(Number(agent.feeBIPS) / 100).toFixed(2)}%
                </option>
              ))}
            </select>
            {selectedAvailableAgent && (
              <div className="fasset-input-hint" style={{ marginTop: '0.5rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                {fullAgentLoading ? (
                  <div>Loading agent details...</div>
                ) : selectedFullAgent ? (
                  <>
                    <div>XRP Address: {selectedFullAgent.underlyingAddressString}</div>
                    <div>Vault: {selectedAvailableAgent.agentVault.slice(0, 10)}...{selectedAvailableAgent.agentVault.slice(-8)}</div>
                  </>
                ) : (
                  <div>Vault: {selectedAvailableAgent.agentVault.slice(0, 10)}...{selectedAvailableAgent.agentVault.slice(-8)}</div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Lot Selection */}
      <div className="fasset-input-group">
        <label className="fasset-input-label">Number of Lots</label>
        <div className="fasset-input-wrapper">
          <input
            type="number"
            className="fasset-input"
            placeholder="1"
            value={lots}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              setLots(Math.max(1, value));
              setErrorMessage('');
            }}
            disabled={isReserving}
            min="1"
            step="1"
          />
          <div className="fasset-input-suffix">
            <span>Lots</span>
          </div>
        </div>
        <div className="fasset-input-hint">
          You will mint {lots * 10} testXRP ({lots} lot{lots > 1 ? 's' : ''})
        </div>
        {!hasEnoughCollateral && selectedAvailableAgent && (
          <div style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            ⚠️ Agent only has {selectedAvailableAgent.freeCollateralLots.toString()} lots available
          </div>
        )}
      </div>

      {/* Fee Display */}
      <div className="fasset-fee-display">
        <div className="fasset-fee-row">
          <span className="fasset-fee-label">Collateral Reservation Fee</span>
          <span className="fasset-fee-value">
            {reservationFee ? parseFloat(formatEther(reservationFee)).toFixed(6) : '0.000000'} C2FLR
          </span>
        </div>
        <div className="fasset-fee-row">
          <span className="fasset-fee-label">XRP to Send (Step 2)</span>
          <span className="fasset-fee-value">
            ≈ {(lots * 10 + 0.04).toFixed(2)} XRP
          </span>
        </div>
        {selectedAvailableAgent && (
          <div className="fasset-fee-row">
            <span className="fasset-fee-label">Minting Fee</span>
            <span className="fasset-fee-value">
              {(Number(selectedAvailableAgent.feeBIPS) / 100).toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      {/* Transaction Status */}
      {txStatus === TX_STATUS.PENDING && (
        <div className="tx-status pending">
          <div className="tx-spinner" />
          <span>Reserving collateral...</span>
        </div>
      )}

      {txStatus === TX_STATUS.SUCCESS && (
        <div className="tx-status success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Reservation successful! Proceed to Step 2</span>
        </div>
      )}

      {txStatus === TX_STATUS.ERROR && errorMessage && (
        <div className="tx-status error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      {txHash && (
        <div className="tx-hash-display">
          <span className="tx-hash-label">UserOp Hash:</span>
          <span className="tx-hash-value">{txHash.slice(0, 10)}...{txHash.slice(-8)}</span>
        </div>
      )}

      {/* Reserve Button */}
      <button
        className="fasset-reserve-btn"
        onClick={handleReserveCollateral}
        disabled={
          isReserving ||
          lots < 1 ||
          !reservationFee ||
          !smartAccountBalance ||
          smartAccountBalance.value < reservationFee ||
          !selectedAvailableAgent ||
          !hasEnoughCollateral ||
          agentsLoading ||
          fullAgentLoading
        }
      >
        {isReserving ? (
          <>
            <div className="btn-spinner" />
            <span>Reserving...</span>
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <span>Reserve Collateral</span>
          </>
        )}
      </button>

      {/* Reset Status on Close */}
      {txStatus !== TX_STATUS.IDLE && txStatus !== TX_STATUS.PENDING && (
        <button className="yield-reset-btn" onClick={resetStatus}>
          Make Another Reservation
        </button>
      )}
    </div>
  );
};
