"use client";

import { useState, useEffect } from 'react';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { parseEther, formatEther, isAddress } from 'viem';
import { PrimeSdk } from '@etherspot/prime-sdk';
import { ZYLO_VAULT_ABI } from '../../contracts/abis';
import { CONTRACTS } from '../../contracts/config';
import { createSpendBatch, waitForUserOpReceipt } from '../../utils/etherspot';
import {
  CHAIN_ID,
  GAS_RESERVES,
  TX_STATUS,
  DECIMAL_PLACES,
  EXTERNAL_LINKS,
  getPaymasterUrl,
  type TxStatus
} from '../../utils/constants';

interface SendReceiveCardProps {
  primeSdk?: PrimeSdk | null;
}

export const SendReceiveCard = ({ primeSdk }: SendReceiveCardProps) => {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'send' | 'receive'>('send');
  const [sendMode, setSendMode] = useState<'flr' | 'yflr'>('flr');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [txStatus, setTxStatus] = useState<TxStatus>(TX_STATUS.IDLE);
  const [errorMessage, setErrorMessage] = useState('');
  const [txHash, setTxHash] = useState('');
  const [smartAccountAddress, setSmartAccountAddress] =
    useState<`0x${string}` | undefined>();

  // Get Smart Account address
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

  // Get Smart Account C2FLR balance (NOT EOA balance!)
  const { data: smartAccountBalance, refetch: refetchFlr } = useBalance({
    address: smartAccountAddress as `0x${string}`,
    chainId: CHAIN_ID,
  });

  // Get yFLR balance
  const { data: yFlrBalance, refetch: refetchYflr } = useReadContract({
    address: CONTRACTS.ZYLO_VAULT as `0x${string}`,
    abi: ZYLO_VAULT_ABI,
    functionName: 'balanceOf',
    chainId: CHAIN_ID,
    args: smartAccountAddress ? [smartAccountAddress] : undefined,
  });

  // Convert yFLR to underlying assets
  const { data: yFlrValue } = useReadContract({
    address: CONTRACTS.ZYLO_VAULT as `0x${string}`,
    abi: ZYLO_VAULT_ABI,
    functionName: 'convertToAssets',
    chainId: CHAIN_ID,
    args: yFlrBalance ? [yFlrBalance] : undefined,
    query: {
      enabled: !!yFlrBalance,
    },
  });


  const handleMaxClick = () => {
    if (sendMode === 'flr' && smartAccountBalance) {
      const maxAmount = smartAccountBalance.value - parseEther(GAS_RESERVES.SEND_FLR);
      if (maxAmount > BigInt(0)) {
        setSendAmount(formatEther(maxAmount));
      }
    } else if (sendMode === 'yflr' && yFlrValue) {
      const maxAmount = (yFlrValue as bigint) - parseEther(GAS_RESERVES.SEND_YFLR);
      if (maxAmount > BigInt(0)) {
        setSendAmount(formatEther(maxAmount));
      }
    }
  };

  const handleSend = async () => {
    if (!primeSdk || !smartAccountAddress || !sendAmount || !recipientAddress) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    if (!isAddress(recipientAddress)) {
      setErrorMessage('Invalid recipient address');
      return;
    }

  

    try {
      setIsSending(true);
      setTxStatus(TX_STATUS.PENDING);
      setErrorMessage('');

      const amountWei = parseEther(sendAmount);

      if (sendMode === 'yflr') {
        // Withdraw from vault and send C2FLR
        const userOpHash = await createSpendBatch(
          primeSdk,
          amountWei,
          recipientAddress as `0x${string}`,
        );
        setTxHash(userOpHash);
        await waitForUserOpReceipt(primeSdk, userOpHash);
      } else {
  // Direct C2FLR transfer from smart account
  await primeSdk.clearUserOpsFromBatch();
  await primeSdk.addUserOpsToBatch({
    to: recipientAddress as `0x${string}`,
    value: amountWei,
  });

  // MUST include paymaster here for gasless transfer
  const userOp = await primeSdk.estimate({
    paymasterDetails: {
      url: getPaymasterUrl(),
      context: { mode: 'sponsor', calculateGasLimits: true },
    },
  });
  
  const userOpHash = await primeSdk.send(userOp);
  setTxHash(userOpHash);
  await waitForUserOpReceipt(primeSdk, userOpHash);
}

      setTxStatus(TX_STATUS.SUCCESS);
      setSendAmount('');
      setRecipientAddress('');
    } catch (error: any) {
      console.error('Send failed:', error);
      setTxStatus(TX_STATUS.ERROR);
      setErrorMessage(error.message || 'Transaction failed');
    } finally {
      setIsSending(false);
    }
  };

  const resetStatus = () => {
    setTxStatus(TX_STATUS.IDLE);
    setErrorMessage('');
    setTxHash('');
  };

  if (!isConnected) {
    return (
      <div className="send-receive-card">
        <div className="send-receive-not-connected">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <p>Connect your wallet to send and receive</p>
        </div>
      </div>
    );
  }

  return (
    <div className="send-receive-card">
      {/* Header with Tabs */}
      <div className="send-receive-header">
        <h2 className="send-receive-title">Transfer</h2>
        <div className="send-receive-tabs">
          <button
            className={`send-receive-tab ${activeTab === 'send' ? 'active' : ''}`}
            onClick={() => setActiveTab('send')}
          >
            Send
          </button>
          <button
            className={`send-receive-tab ${activeTab === 'receive' ? 'active' : ''}`}
            onClick={() => setActiveTab('receive')}
          >
            Receive
          </button>
        </div>
      </div>

      {activeTab === 'send' ? (
        <div className="send-form">
          {/* Send Mode Toggle */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <button
              style={{
                flex: 1,
                padding: '0.5rem',
                background: sendMode === 'flr' ? '#E1C4E9' : 'rgba(225, 196, 233, 0.15)',
                border: sendMode === 'flr' ? '1px solid #E1C4E9' : '1px solid rgba(225, 196, 233, 0.3)',
                borderRadius: '0.5rem',
                color: sendMode === 'flr' ? '#070709' : 'rgba(225, 196, 233, 0.7)',
                fontSize: '0.6875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => setSendMode('flr')}
            >
              Send FLR
            </button>
            <button
              style={{
                flex: 1,
                padding: '0.5rem',
                background: sendMode === 'yflr' ? '#E1C4E9' : 'rgba(225, 196, 233, 0.15)',
                border: sendMode === 'yflr' ? '1px solid #E1C4E9' : '1px solid rgba(225, 196, 233, 0.3)',
                borderRadius: '0.5rem',
                color: sendMode === 'yflr' ? '#070709' : 'rgba(225, 196, 233, 0.7)',
                fontSize: '0.6875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => setSendMode('yflr')}
            >
              Spend yFLR
            </button>
          </div>

          {/* Balance Display */}
          <div className="balance-display">
            <span className="balance-label">Available Balance (Smart Account)</span>
            <span className="balance-value">
              {sendMode === 'flr'
                ? smartAccountBalance
                  ? `${parseFloat(formatEther(smartAccountBalance.value)).toFixed(DECIMAL_PLACES.BALANCE)} C2FLR`
                  : '0.00 C2FLR'
                : yFlrValue
                ? `${parseFloat(formatEther(yFlrValue as bigint)).toFixed(DECIMAL_PLACES.BALANCE)} C2FLR (from yFLR)`
                : '0.00 C2FLR'}
            </span>
          </div>

          {/* Recipient Address */}
          <div className="input-group">
            <label className="input-label">Recipient Address</label>
            <input
              type="text"
              className="send-input"
              placeholder="0x..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              disabled={isSending}
            />
          </div>

          {/* Amount Input */}
          <div className="input-group">
            <label className="input-label">Amount (FLR)</label>
            <div className="amount-input-wrapper">
              <input
                type="number"
                className="send-input amount-input"
                placeholder="0.00"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                disabled={isSending}
                step="0.01"
                min="0"
              />
              <button
                className="max-btn"
                onClick={handleMaxClick}
                disabled={isSending}
              >
                MAX
              </button>
            </div>
          </div>

          {/* Transaction Status */}
          {txStatus === TX_STATUS.PENDING && (
            <div className="tx-status pending">
              <div className="tx-spinner" />
              <span>Processing transaction...</span>
            </div>
          )}

          {txStatus === TX_STATUS.SUCCESS && (
            <div className="tx-status success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Transaction successful!</span>
            </div>
          )}

          {txStatus === TX_STATUS.ERROR && errorMessage && (
            <div className="send-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {txHash && (
            <div className="tx-hash">
              <span className="tx-hash-label">Tx Hash:</span>
              <span className="tx-hash-value">{txHash.slice(0, 10)}...{txHash.slice(-8)}</span>
            </div>
          )}

          {/* Send Button */}
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={isSending || !sendAmount || !recipientAddress || parseFloat(sendAmount) <= 0}
          >
            {isSending ? (
              <>
                <div className="btn-spinner" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                <span>{sendMode === 'yflr' ? 'Spend yFLR & Send' : 'Send FLR'}</span>
              </>
            )}
          </button>

          {/* Info for yFLR mode */}
          {sendMode === 'yflr' && (
            <div className="smart-account-info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>This will withdraw FLR from your vault and send it to the recipient</span>
            </div>
          )}

          {txStatus !== TX_STATUS.IDLE && txStatus !== TX_STATUS.PENDING && (
            <button
              style={{
                width: '100%',
                padding: '0.5rem',
                marginTop: '0.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '0.5rem',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.75rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
              onClick={resetStatus}
            >
              Make Another Transaction
            </button>
          )}
        </div>
      ) : (
        /* Receive Tab */
        <div className="receive-content">
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
              Your Smart Account Address
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '0.5rem'
            }}>
              <span style={{
                flex: 1,
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                color: 'white',
                wordBreak: 'break-all'
              }}>
                {smartAccountAddress || 'Loading...'}
              </span>
              <button
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(smartAccountAddress || '');
                }}
                disabled={!smartAccountAddress}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
          </div>

          <div className="qr-code-container">
            <div className="qr-code-placeholder">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
            <p className="qr-hint">Scan to receive</p>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <p style={{
              textAlign: 'center',
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '0.5rem'
            }}>
              Share this address to receive C2FLR or yFLR tokens
            </p>
            <p style={{
              textAlign: 'center',
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.5)'
            }}>
              Get test C2FLR from <a href={EXTERNAL_LINKS.COSTON2_FAUCET} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>Coston2 Faucet</a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
