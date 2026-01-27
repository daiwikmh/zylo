"use client";

import { useState, useEffect } from 'react';
import { useAccount, useConnectorClient } from 'wagmi';
import { PrimeSdk, Web3eip1193WalletProvider } from '@etherspot/prime-sdk';
import { YieldStakingCard } from '../../src/components/yield/YieldStakingCard';
import { fetchVaultAnalytics, fetchUserYieldStats, formatNumber, type YieldAnalytics, type UserYieldStats } from '../../src/services/analyticsService';
import { CHAIN_ID, DECIMAL_PLACES } from '../../src/utils/constants';

export default function AnalyticsPage() {
  const { address, isConnected } = useAccount();
  const { data: client } = useConnectorClient();
  const [primeSdk, setPrimeSdk] = useState<PrimeSdk | null>(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState<string>('');
  const [vaultAnalytics, setVaultAnalytics] = useState<YieldAnalytics | null>(null);
  const [userStats, setUserStats] = useState<UserYieldStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize Smart Account and Etherspot SDK
  useEffect(() => {
    const initSmartAccount = async () => {
      if (!client?.transport) return;

      try {
        const walletProvider = await Web3eip1193WalletProvider.connect(
          client.transport as any
        );

        const sdk = new PrimeSdk(walletProvider, {
          chainId: CHAIN_ID,
        });

        const smartAddress = await sdk.getCounterFactualAddress();
        setSmartAccountAddress(smartAddress);
        setPrimeSdk(sdk);
      } catch (error) {
        console.error('Failed to initialize smart account:', error);
      }
    };

    if (isConnected) {
      initSmartAccount();
    }
  }, [client, isConnected]);

  // Fetch analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);

        // Fetch vault-wide analytics
        const analytics = await fetchVaultAnalytics();
        setVaultAnalytics(analytics);

        // Fetch user-specific stats if connected
        if (smartAccountAddress) {
          const stats = await fetchUserYieldStats(smartAccountAddress);
          setUserStats(stats);
        }
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();

    // Refresh every 30 seconds
    const interval = setInterval(loadAnalytics, 30000);
    return () => clearInterval(interval);
  }, [smartAccountAddress]);

  if (!isConnected) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header-row">
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#E1C4E9" strokeWidth="2" style={{ margin: '0 auto 1.5rem' }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#070709', marginBottom: '0.5rem' }}>
              Connect Wallet to View Analytics
            </h2>
            <p style={{ color: '#232323', fontSize: '0.875rem', opacity: 0.7 }}>
              Track your yield performance and vault statistics
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-row">
        <div style={{ padding: '2rem 0' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: '#070709' }}>
            Analytics & Performance
          </h1>
          <p style={{ color: '#232323', fontSize: '0.875rem', opacity: 0.8 }}>
            Real-time vault analytics and your yield performance metrics
          </p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-main">
          {/* Yield Staking Card */}
          <YieldStakingCard primeSdk={primeSdk} />

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#232323', opacity: 0.7 }}>
              Loading analytics...
            </div>
          ) : (
            <>
              {/* Stats Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Total Vault Assets Card */}
                <div className="yield-card" style={{
                  background: '#070709',
                  color: '#E1C4E9',
                  border: '2px solid #232323',
                  boxShadow: '4px 4px 0px #232323'
                }}>
                  <div className="yield-card-header">
                    <div className="yield-icon-wrapper" style={{ background: '#E1C4E9' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#070709" strokeWidth="2.5">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                    </div>
                    <span className="yield-badge" style={{ background: 'rgba(225, 196, 233, 0.2)', color: '#E1C4E9', border: '1px solid #E1C4E9' }}>
                      Live
                    </span>
                  </div>
                  <div className="yield-value" style={{ color: '#E1C4E9', fontFamily: 'monospace' }}>
                    {formatNumber(vaultAnalytics?.totalAssets || 0, DECIMAL_PLACES.BALANCE)} FLR
                  </div>
                  <div className="yield-label" style={{ color: 'rgba(225, 196, 233, 0.7)' }}>Total Vault Assets</div>
                  <div className="yield-info" style={{ fontSize: '0.75rem', color: 'rgba(225, 196, 233, 0.6)', marginTop: '0.5rem' }}>
                    TVL: ${formatNumber(vaultAnalytics?.tvlUsd || 0, 2)} USD
                  </div>
                </div>

                {/* Total Yield Generated Card */}
                <div className="yield-card" style={{
                  background: '#070709',
                  color: '#E1C4E9',
                  border: '2px solid #232323',
                  boxShadow: '4px 4px 0px #232323'
                }}>
                  <div className="yield-card-header">
                    <div className="yield-icon-wrapper" style={{ background: '#E1C4E9' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#070709" strokeWidth="2.5">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                    <span className="yield-badge" style={{ background: 'rgba(225, 196, 233, 0.2)', color: '#E1C4E9', border: '1px solid #E1C4E9' }}>
                      Active
                    </span>
                  </div>
                  <div className="yield-value" style={{ color: '#E1C4E9', fontFamily: 'monospace' }}>
                    {formatNumber(vaultAnalytics?.totalYield || 0, DECIMAL_PLACES.BALANCE)} FLR
                  </div>
                  <div className="yield-label" style={{ color: 'rgba(225, 196, 233, 0.7)' }}>Total Yield Generated</div>
                  <div className="yield-info" style={{ fontSize: '0.75rem', color: 'rgba(225, 196, 233, 0.6)', marginTop: '0.5rem' }}>
                    APY: {formatNumber(vaultAnalytics?.apy || 0, 2)}%
                  </div>
                </div>

                {/* User Position Card (if user has deposits) */}
                {userStats && userStats.userShares > 0 && (
                  <div className="yield-card" style={{
                    background: '#070709',
                    color: '#E1C4E9',
                    border: '2px solid #E1C4E9',
                    boxShadow: '4px 4px 0px #E1C4E9'
                  }}>
                    <div className="yield-card-header">
                      <div className="yield-icon-wrapper" style={{ background: '#E1C4E9' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#070709" strokeWidth="2.5">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <span className="yield-badge" style={{ background: '#E1C4E9', color: '#070709' }}>
                        Your Position
                      </span>
                    </div>
                    <div className="yield-value" style={{ color: '#E1C4E9', fontFamily: 'monospace' }}>
                      {formatNumber(userStats.userAssets, DECIMAL_PLACES.BALANCE)} FLR
                    </div>
                    <div className="yield-label" style={{ color: 'rgba(225, 196, 233, 0.7)' }}>Your Assets</div>
                    <div className="yield-info" style={{ fontSize: '0.75rem', color: 'rgba(225, 196, 233, 0.6)', marginTop: '0.5rem' }}>
                      Yield Earned: {formatNumber(userStats.userYieldEarned, DECIMAL_PLACES.BALANCE)} FLR ({formatNumber(userStats.userPercentageOfPool, 2)}% of pool)
                    </div>
                  </div>
                )}
              </div>

              {/* Vault Info Card */}
              <div className="yield-graph-card" style={{
                background: '#070709',
                color: '#E1C4E9',
                border: '2px solid #232323',
                boxShadow: '4px 4px 0px #232323',
                padding: '2rem'
              }}>
                <div className="yield-graph-header" style={{ borderBottom: '2px solid #232323', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <h2 className="yield-graph-title" style={{ color: '#E1C4E9', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                      Vault Statistics
                    </h2>
                    <p className="yield-graph-subtitle" style={{ color: 'rgba(225, 196, 233, 0.7)', fontSize: '0.875rem' }}>
                      Real-time vault performance metrics
                    </p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1.5rem'
                }}>
                  <div className="yield-stat" style={{
                    padding: '1.5rem',
                    background: '#232323',
                    borderRadius: '0.75rem',
                    border: '2px solid #E1C4E9'
                  }}>
                    <span className="yield-stat-label" style={{ color: 'rgba(225, 196, 233, 0.7)', fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>
                      Share Price
                    </span>
                    <span className="yield-stat-value" style={{ color: '#E1C4E9', fontSize: '1.5rem', fontWeight: '700', fontFamily: 'monospace', display: 'block' }}>
                      {formatNumber(vaultAnalytics?.sharePrice || 1, 6)}
                    </span>
                    <span style={{ color: 'rgba(225, 196, 233, 0.6)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                      FLR per yFLR
                    </span>
                  </div>

                  <div className="yield-stat" style={{
                    padding: '1.5rem',
                    background: '#232323',
                    borderRadius: '0.75rem',
                    border: '2px solid #E1C4E9'
                  }}>
                    <span className="yield-stat-label" style={{ color: 'rgba(225, 196, 233, 0.7)', fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>
                      Total yFLR Supply
                    </span>
                    <span className="yield-stat-value" style={{ color: '#E1C4E9', fontSize: '1.5rem', fontWeight: '700', fontFamily: 'monospace', display: 'block' }}>
                      {formatNumber(vaultAnalytics?.totalShares || 0, DECIMAL_PLACES.BALANCE)}
                    </span>
                    <span style={{ color: 'rgba(225, 196, 233, 0.6)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                      Shares Minted
                    </span>
                  </div>

                  <div className="yield-stat" style={{
                    padding: '1.5rem',
                    background: '#232323',
                    borderRadius: '0.75rem',
                    border: '2px solid #E1C4E9'
                  }}>
                    <span className="yield-stat-label" style={{ color: 'rgba(225, 196, 233, 0.7)', fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>
                      Current APY
                    </span>
                    <span className="yield-stat-value" style={{ color: '#E1C4E9', fontSize: '1.5rem', fontWeight: '700', fontFamily: 'monospace', display: 'block' }}>
                      {formatNumber(vaultAnalytics?.apy || 0, 2)}%
                    </span>
                    <span style={{ color: 'rgba(225, 196, 233, 0.6)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                      Annual Percentage Yield
                    </span>
                  </div>
                </div>

                {/* Additional Info */}
                <div style={{
                  marginTop: '2rem',
                  padding: '1.5rem',
                  background: 'rgba(225, 196, 233, 0.1)',
                  borderRadius: '0.75rem',
                  border: '2px solid rgba(225, 196, 233, 0.3)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E1C4E9" strokeWidth="2" style={{ flexShrink: 0, marginTop: '0.125rem' }}>
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                    <div>
                      <p style={{ color: '#E1C4E9', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '0.5rem' }}>
                        <strong>How it works:</strong> The vault automatically compounds your yield by reinvesting FTSO rewards.
                        Your yFLR tokens represent your share of the growing pool, increasing in value as rewards are harvested.
                      </p>
                      {smartAccountAddress && (
                        <p style={{ color: 'rgba(225, 196, 233, 0.7)', fontSize: '0.75rem', fontFamily: 'monospace', marginTop: '1rem' }}>
                          Smart Account: {smartAccountAddress.slice(0, 10)}...{smartAccountAddress.slice(-8)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
