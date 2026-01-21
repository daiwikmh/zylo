"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { PrimeSdk, Web3WalletProvider } from '@etherspot/prime-sdk';
import { useWeb3Auth } from '../../src/providers/web3auth';
import { SendReceiveCard } from '../../src/components/send/SendReceiveCard';
import { initEtherspotSDK } from '@/app/src/utils/etherspot';

export default function SendPage() {
  const { address, isConnected } = useAccount();
  const { provider: web3AuthProvider } = useWeb3Auth();
  const [primeSdk, setPrimeSdk] = useState<PrimeSdk | null>(null);

  // Initialize Etherspot SDK when connected
   useEffect(() => {
    if (!isConnected || !address || !web3AuthProvider) return;

    let mounted = true;

    (async () => {
      try {
        const sdk = await initEtherspotSDK(web3AuthProvider);
        if (mounted) setPrimeSdk(sdk);
      } catch (e) {
        console.error("Etherspot init failed:", e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isConnected, address, web3AuthProvider]);


  return (
    <div className="dashboard-container">
      <div className="dashboard-header-row">
        <div style={{ padding: '2rem 0' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--foreground)' }}>
            Send & Receive
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Transfer FLR or spend yFLR with your smart account
          </p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-main" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <SendReceiveCard primeSdk={primeSdk} />
        </div>
      </div>
    </div>
  );
}
