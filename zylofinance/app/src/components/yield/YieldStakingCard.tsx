"use client";

import { useState, useEffect } from 'react';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { PrimeSdk } from '@etherspot/prime-sdk';
import { ZYLO_VAULT_ABI } from '../../contracts/abis';
import { CONTRACTS } from '../../contracts/config';
import { createDepositBatch, waitForUserOpReceipt } from '../../utils/etherspot';
import { waitForUserOperationReceipt } from 'viem/account-abstraction';

interface YieldStakingCardProps {
  primeSdk?: PrimeSdk | null;
}

export const YieldStakingCard = ({ primeSdk }: YieldStakingCardProps) => {
  const { address, isConnected } = useAccount();
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [txHash, setTxHash] = useState('');
  const [smartAccountAddress, setSmartAccountAddress] = useState<string>('');

  // Get Smart Account address
  useEffect(() => {
    async function getSmartAccount() {
      if (primeSdk) {
        try {
          const smartAddr = await primeSdk.getCounterFactualAddress();
          setSmartAccountAddress(smartAddr);
        } catch (error) {
          console.error('Failed to get smart account:', error);
        }
      }
    }
    getSmartAccount();
  }, [primeSdk]);

  // Get Smart Account C2FLR balance (NOT EOA balance!)
  const { data: smartAccountBalance } = useBalance({
    address: smartAccountAddress as `0x${string}`,
    chainId: 114,
  });

  // Get yFLR balance
  const { data: yFlrBalance, refetch: refetchYFlr } = useReadContract({
    address: CONTRACTS.ZYLO_VAULT,
    abi: ZYLO_VAULT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Convert yFLR to underlying FLR value
  const { data: yFlrValue } = useReadContract({
    address: CONTRACTS.ZYLO_VAULT,
    abi: ZYLO_VAULT_ABI,
    functionName: 'convertToAssets',
    args: yFlrBalance ? [yFlrBalance as bigint] : undefined,
  });

  const handleMaxClick = () => {
    if (smartAccountBalance) {
      // Reserve more C2FLR for gas (batched transactions need more gas)
      // Reserve 0.5 C2FLR to be safe
      const maxAmount = smartAccountBalance.value - parseEther('0.5');
      if (maxAmount > BigInt(0)) {
        setDepositAmount(formatEther(maxAmount));
      } else {
        setErrorMessage('Not enough C2FLR for gas. Keep at least 0.5 C2FLR for gas fees.');
      }
    }
  };

 const handleDeposit = async () => {
  if (!primeSdk || !smartAccountAddress || !depositAmount) {
    setErrorMessage('Please connect wallet and enter amount');
    return;
  }

  const amountWei = parseEther(depositAmount);

  // 1. UPDATED BALANCE CHECK: Only check if they have enough for the deposit itself
  // We no longer need the 0.5 C2FLR gas reserve because the Paymaster sponsors it!
  if (!smartAccountBalance || smartAccountBalance.value < amountWei) {
    setErrorMessage(`Insufficient balance. You need ${depositAmount} C2FLR to deposit.`);
    setTxStatus('error');
    return;
  } 

  try {
    setIsDepositing(true);
    setErrorMessage('');
    setTxStatus('pending');

    // 2. CALL THE UPDATED BATCH: 
    // This now correctly points to the 'depositFLR' function we fixed in etherspot.ts
    const userOpHash = await createDepositBatch(
      primeSdk,
      amountWei
    );
    
    setTxHash(userOpHash);

    // 3. WAIT FOR RECEIPT
    // Note: Confirmation on Flare/Coston2 usually takes 2-5 seconds
    const receipt = await waitForUserOpReceipt(primeSdk, userOpHash);
    
    if (receipt.success) {
      setTxStatus('success');
      setDepositAmount('');
      // Refetch both balances
      refetchYFlr();
    } else {
      throw new Error("Transaction execution failed on-chain");
    }

  } catch (error: any) {
    console.error('Deposit failed:', error);
    setTxStatus('error');

    // 4. PAYMASTER-SPECIFIC ERROR HANDLING
    let errorMsg = error.message || 'Transaction failed';
    
    if (errorMsg.includes('AA21') || errorMsg.includes('paymaster balance')) {
      errorMsg = 'Paymaster sponsorship failed. Please contact Zylo support to top up the gas tank.';
    } else if (errorMsg.includes('AA10')) {
      errorMsg = 'Smart Account deployment failed. Ensure your account is correctly initialized.';
    }

    setErrorMessage(errorMsg);
  } finally {
    setIsDepositing(false);
  }
};

  const resetStatus = () => {
    setTxStatus('idle');
    setErrorMessage('');
    setTxHash('');
  };

  if (!isConnected) {
    return (
      <div className="yield-staking-card">
        <div className="yield-staking-header">
          <h2 className="yield-staking-title">Start Earning Yield</h2>
          <span className="yield-badge-purple">APY 12.5%</span>
        </div>
        <div className="yield-not-connected">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <p>Connect your wallet to start earning yield</p>
        </div>
      </div>
    );
  }

  return (
    <div className="yield-staking-card">
      {/* Header */}
      <div className="yield-staking-header">
        <div>
          <h2 className="yield-staking-title">Deposit & Earn</h2>
          <p className="yield-staking-subtitle">Stake FLR to earn yFLR rewards</p>
        </div>
        <span className="yield-badge-purple">APY 12.5%</span>
      </div>

      {/* Smart Account Info */}
      {smartAccountAddress && (
        <div style={{
          padding: '0.75rem 1rem',
          background: 'rgba(7, 7, 9, 0.05)',
          borderRadius: '0.75rem',
          marginBottom: '1rem',
          fontSize: '0.75rem'
        }}>
          <div style={{ color: 'rgba(7, 7, 9, 0.6)', marginBottom: '0.25rem' }}>Smart Account Address</div>
          <div style={{ color: '#070709', fontFamily: 'monospace', fontWeight: '600', wordBreak: 'break-all' }}>
            {smartAccountAddress}
          </div>
        </div>
      )}

      {/* Balance Display */}
      <div className="yield-balance-grid">
        <div className="yield-balance-item">
          <span className="yield-balance-label">Smart Account C2FLR</span>
          <span className="yield-balance-value">
            {smartAccountBalance ? parseFloat(formatEther(smartAccountBalance.value)).toFixed(4) : '0.00'}
          </span>
        </div>
        <div className="yield-balance-item">
          <span className="yield-balance-label">Your yFLR</span>
          <span className="yield-balance-value purple">
            {yFlrBalance ? parseFloat(formatEther(yFlrBalance as bigint)).toFixed(4) : '0.00'}
          </span>
        </div>
        <div className="yield-balance-item">
          <span className="yield-balance-label">Value (C2FLR)</span>
          <span className="yield-balance-value">
            {yFlrValue ? parseFloat(formatEther(yFlrValue as bigint)).toFixed(4) : '0.00'}
          </span>
        </div>
      </div>

      {/* Info about funding smart account and gas */}
      <div style={{
        padding: '1rem',
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '0.75rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem'
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" style={{ flexShrink: 0, marginTop: '0.125rem' }}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      
      </div>

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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" style={{ flexShrink: 0, marginTop: '0.125rem' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div style={{ fontSize: '0.875rem', color: '#d97706' }}>
            <strong>No Balance!</strong> Send C2FLR to your Smart Account address above to get started.
          </div>
        </div>
      )}

      {/* Deposit Input */}
      <div className="yield-input-group">
        <label className="yield-input-label">Amount to Deposit (C2FLR)</label>
        <div className="yield-input-wrapper">
          <input
            type="number"
            className="yield-input"
            placeholder="0.00"
            value={depositAmount}
            onChange={(e) => {
              setDepositAmount(e.target.value);
              setErrorMessage(''); // Clear error when user types
            }}
            disabled={isDepositing}
            step="0.01"
            min="0"
          />
          <div className="yield-input-suffix">
            <span>C2FLR</span>
            <button
              className="max-btn"
              onClick={handleMaxClick}
              disabled={isDepositing || !smartAccountBalance}
            >
              MAX
            </button>
          </div>
        </div>
        
      </div>

      {/* Transaction Status */}
      {txStatus === 'pending' && errorMessage && errorMessage.includes('Deploying') && (
        <div className="tx-status pending">
          <div className="tx-spinner" />
          <span>{errorMessage}</span>
        </div>
      )}

      {txStatus === 'pending' && (!errorMessage || !errorMessage.includes('Deploying')) && (
        <div className="tx-status pending">
          <div className="tx-spinner" />
          <span>Processing deposit transaction...</span>
        </div>
      )}

      {txStatus === 'success' && (
        <div className="tx-status success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Deposit successful!</span>
        </div>
      )}

      {txStatus === 'error' && errorMessage && (
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
          <span className="tx-hash-label">Tx Hash:</span>
          <span className="tx-hash-value">{txHash.slice(0, 10)}...{txHash.slice(-8)}</span>
        </div>
      )}

      {/* Deposit Button */}
      <button
        className="yield-deposit-btn"
        onClick={handleDeposit}
        disabled={isDepositing || !depositAmount || parseFloat(depositAmount) <= 0}
      >
        {isDepositing ? (
          <>
            <div className="btn-spinner" />
            <span>Depositing...</span>
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
            <span>Deposit & Start Earning</span>
          </>
        )}
      </button>

      {/* Info Cards */}
      <div className="yield-info-grid">
        <div className="yield-info-card">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          <div>
            <div className="yield-info-label">Auto-Compounding</div>
            <div className="yield-info-value">Daily</div>
          </div>
        </div>
        <div className="yield-info-card">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <div>
            <div className="yield-info-label">Lock Period</div>
            <div className="yield-info-value">None</div>
          </div>
        </div>
      </div>

      {/* Reset Status on Close */}
      {txStatus !== 'idle' && txStatus !== 'pending' && (
        <button className="yield-reset-btn" onClick={resetStatus}>
          Make Another Deposit
        </button>
      )}
    </div>
  );
};
