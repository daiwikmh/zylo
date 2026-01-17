"use client";

import { useState, FormEvent, useEffect } from 'react';
import {
  useAccount,
  useBalance,
  useConnectorClient,
  BaseError,
} from 'wagmi';
import { Hex, parseEther, formatEther } from 'viem';
import { PrimeSdk, EtherspotBundler, Web3eip1193WalletProvider } from '@etherspot/prime-sdk';

type TabType = 'send' | 'receive';

export const SendReceiveCard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('send');
  const [copied, setCopied] = useState(false);
  const [smartAccountAddress, setSmartAccountAddress] = useState<string>('');
  const [primeSdk, setPrimeSdk] = useState<PrimeSdk | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string>('');
  const [txError, setTxError] = useState<string>('');
  const [txSuccess, setTxSuccess] = useState(false);

  const { address, isConnected } = useAccount();
  const { data: client } = useConnectorClient();

  // Use smart account address for balance if available, otherwise use EOA
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address: (smartAccountAddress as Hex) || address,
    chainId: 114
  });

  // Initialize Etherspot Prime SDK
  useEffect(() => {
    const initPrimeSdk = async () => {
      // client.transport is the EIP-1193 provider Etherspot needs
      if (!client?.transport) return;

      try {
        // 1. Wrap the provider in Etherspot's compatible class
        const walletProvider = await Web3eip1193WalletProvider.connect(
          client.transport as any
        );

        // 2. Initialize the SDK with the wrapped provider
        const sdk = new PrimeSdk(walletProvider, {
          chainId: 114, // Coston2
          bundlerProvider: new EtherspotBundler(
            114,
            process.env.NEXT_PUBLIC_ETHERSPOT_API_KEY || ''
          )
        });

        setPrimeSdk(sdk);

        // Get the Smart Account address
        const smartAddress = await sdk.getCounterFactualAddress();
        setSmartAccountAddress(smartAddress);
      } catch (error) {
        console.error('Failed to initialize Prime SDK:', error);
      }
    };

    initPrimeSdk();
  }, [client]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!client || !primeSdk) {
      setTxError('Smart Account not initialized');
      return;
    }

    const formData = new FormData(e.target as HTMLFormElement);
    const to = formData.get('address') as string;
    const value = formData.get('value') as string;

    setIsSubmitting(true);
    setTxError('');
    setTxSuccess(false);
    setTxHash('');

    try {
      // 1. Clear previous operations and add the new one
      await primeSdk.clearUserOpsFromBatch();
      await primeSdk.addUserOpsToBatch({
        to,
        value: parseEther(value)
      });

      // 2. Estimate and Send UserOperation
      const op = await primeSdk.estimate();
      const uoHash = await primeSdk.send(op);

      setTxHash(uoHash);
      setTxSuccess(true);
      console.log("Smart Account UserOp Hash:", uoHash);

      // Reset form
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error("Smart Account Transaction Failed:", err);
      setTxError((err as Error).message || 'Transaction failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  const copyAddress = async () => {
    const addressToCopy = smartAccountAddress || address;
    if (addressToCopy) {
      await navigator.clipboard.writeText(addressToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <div className="send-receive-card">
        <div className="send-receive-header">
          <h3 className="send-receive-title">Send & Receive</h3>
          <span className="smart-account-label">Smart Account</span>
        </div>
        <div className="send-receive-not-connected">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="6" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
            <circle cx="16" cy="14" r="2" />
          </svg>
          <p>Connect your wallet to send and receive crypto</p>
        </div>
      </div>
    );
  }

  return (
    <div className="send-receive-card">
      <div className="send-receive-header">
        <h3 className="send-receive-title">Send & Receive</h3>
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
        <form onSubmit={handleSubmit} className="send-form">
          {/* Balance Display */}
          <div className="balance-display">
            <span className="balance-label">Available Balance</span>
            <span className="balance-value">
              {balanceLoading ? (
                'Loading...'
              ) : balance ? (
                `${parseFloat(formatEther(balance.value)).toFixed(4)} ${balance.symbol}`
              ) : (
                '0.0000 C2FLR'
              )}
            </span>
          </div>

          {/* Smart Account Address Display */}
          {smartAccountAddress && (
            <div className="smart-account-address">
              <span className="smart-account-label-small">Smart Account:</span>
              <span className="smart-account-value">{truncateAddress(smartAccountAddress)}</span>
            </div>
          )}

          {/* Recipient Address Input */}
          <div className="input-group">
            <label className="input-label">Recipient Address</label>
            <input
              name="address"
              type="text"
              placeholder="0x..."
              className="send-input"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Amount Input */}
          <div className="input-group">
            <label className="input-label">Amount</label>
            <input
              name="value"
              type="number"
              placeholder="0.00"
              className="send-input"
              step="0.000000001"
              min="0"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Transaction Hash */}
          {txHash && (
            <div className="tx-hash">
              <span className="tx-hash-label">UserOp Hash:</span>
              <span className="tx-hash-value">{truncateAddress(txHash)}</span>
            </div>
          )}

          {/* Transaction Status */}
          {isSubmitting && (
            <div className="tx-status pending">
              <div className="tx-spinner" />
              <span>Submitting UserOperation...</span>
            </div>
          )}

          {txSuccess && (
            <div className="tx-status success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Transaction submitted successfully!</span>
            </div>
          )}

          {/* Error Message */}
          {txError && (
            <div className="send-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <span>{txError}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="send-btn"
            disabled={isSubmitting || !primeSdk}
          >
            {isSubmitting ? (
              <>
                <div className="btn-spinner" />
                Processing...
              </>
            ) : !primeSdk ? (
              <>Initializing Smart Account...</>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Send via Smart Account
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="receive-content">
          {/* Wallet Address Display */}
          <div className="receive-address-card">
            <span className="receive-label">Your Smart Account Address</span>
            <div className="receive-address">
              <span className="address-text">
                {smartAccountAddress ? truncateAddress(smartAccountAddress) : 'Loading...'}
              </span>
              <button
                className="copy-btn"
                onClick={copyAddress}
                title="Copy address"
                disabled={!smartAccountAddress}
              >
                {copied ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
            </div>
            <span className="receive-address-full">{smartAccountAddress || 'Loading...'}</span>
          </div>

          {/* Info Box */}
          <div className="smart-account-benefits">
            <h4>Benefits:</h4>
            <ul>
              <li>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Gasless transactions (optional)
              </li>
              <li>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Batch multiple operations
              </li>
              <li>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Enhanced security features
              </li>
            </ul>
          </div>

          {/* Balance Info */}
          <div className="receive-balance">
            <span className="balance-label">Current Balance</span>
            <span className="balance-value">
              {balanceLoading ? (
                'Loading...'
              ) : balance ? (
                `${parseFloat(formatEther(balance.value)).toFixed(4)} ${balance.symbol}`
              ) : (
                '0.0000 C2FLR'
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendReceiveCard;
