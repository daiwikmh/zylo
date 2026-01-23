"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { PrimeSdk, Web3WalletProvider } from '@etherspot/prime-sdk';
import { useWeb3Auth } from '../../src/providers/web3auth';
import { YieldStakingCard } from '../../src/components/yield/YieldStakingCard';
import { initEtherspotSDK } from '@/app/src/utils/etherspot';

export default function analyticsPage() {
  const { address, isConnected } = useAccount();
  const { provider: web3AuthProvider } = useWeb3Auth();
  const [primeSdk, setPrimeSdk] = useState<PrimeSdk | null>(null);

  // Mock data for yield tracking
  const [totalAssets, setTotalAssets] = useState(125750.50);
  const [totalYield, setTotalYield] = useState(8432.75);
  const [yieldData, setYieldData] = useState([
    { time: '00:00', value: 8200 },
    { time: '04:00', value: 8250 },
    { time: '08:00', value: 8180 },
    { time: '12:00', value: 8350 },
    { time: '16:00', value: 8400 },
    { time: '20:00', value: 8432 },
  ]);

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

  // Simulate real-time yield updates
  useEffect(() => {
    const interval = setInterval(() => {
      setYieldData(prev => {
        const newData = [...prev];
        const lastValue = newData[newData.length - 1].value;
        const newValue = lastValue + (Math.random() - 0.4) * 50;

        newData.shift();
        newData.push({
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          value: Math.max(0, newValue)
        });

        setTotalYield(newValue);
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-row">
        <div style={{ padding: '2rem 0' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--foreground)' }}>
            Yield & Staking
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Deposit FLR to earn yield and track your real-time performance
          </p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-main">
          {/* Yield Staking Card */}
          <YieldStakingCard primeSdk={primeSdk} />

          {/* Stats Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {/* Total Assets Card */}
            <div className="yield-card" style={{ background: '#070709', color: 'white', border: '1px solid rgba(230, 217, 253, 0.2)' }}>
              <div className="yield-card-header">
                <div className="yield-icon-wrapper" style={{ background: 'linear-gradient(135deg, #E6D9FD 0%, #C5B3ED 100%)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#070709" strokeWidth="2.5">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <span className="yield-badge" style={{ background: 'rgba(230, 217, 253, 0.2)', color: '#E6D9FD' }}>
                  Live
                </span>
              </div>
              <div className="yield-value" style={{ color: 'white' }}>
                ${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="yield-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Total Assets</div>
              <div className="yield-change positive" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
                <span>+12.5%</span>
              </div>
            </div>

            {/* Total Yield Generated Card */}
            <div className="yield-card" style={{ background: '#070709', color: 'white', border: '1px solid rgba(230, 217, 253, 0.2)' }}>
              <div className="yield-card-header">
                <div className="yield-icon-wrapper" style={{ background: 'linear-gradient(135deg, #E6D9FD 0%, #C5B3ED 100%)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#070709" strokeWidth="2.5">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <span className="yield-badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
                  Active
                </span>
              </div>
              <div className="yield-value" style={{ color: 'white' }}>
                ${totalYield.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="yield-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Total Yield Generated</div>
              <div className="yield-change positive" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
                <span>+8.3%</span>
              </div>
            </div>
          </div>

          {/* Real-time Yield Graph */}
          <div className="yield-graph-card" style={{ background: '#070709', color: 'white', border: '1px solid rgba(230, 217, 253, 0.2)' }}>
            <div className="yield-graph-header" style={{ borderBottom: '1px solid rgba(230, 217, 253, 0.1)' }}>
              <div>
                <h2 className="yield-graph-title" style={{ color: 'white' }}>Real-Time Yield Performance</h2>
                <p className="yield-graph-subtitle" style={{ color: 'rgba(255,255,255,0.6)' }}>Last 24 hours</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C5B3ED' }}></div>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Yield</span>
                </div>
                <select
                  style={{
                    padding: '0.375rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(230, 217, 253, 0.2)',
                    background: 'rgba(0,0,0,0.3)',
                    fontSize: '0.75rem',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option>24H</option>
                  <option>7D</option>
                  <option>30D</option>
                  <option>1Y</option>
                </select>
              </div>
            </div>

            {/* Graph Area */}
            <div className="yield-graph-area">
              <svg width="100%" height="280" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="yieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#C5B3ED', stopOpacity: 0.3 }} />
                    <stop offset="100%" style={{ stopColor: '#C5B3ED', stopOpacity: 0.05 }} />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <line
                    key={i}
                    x1="0"
                    y1={i * 60 + 20}
                    x2="100%"
                    y2={i * 60 + 20}
                    stroke="rgba(230, 217, 253, 0.1)"
                    strokeWidth="1"
                  />
                ))}

                {/* Y-axis labels */}
                {[8600, 8500, 8400, 8300, 8200, 8100].map((value, i) => (
                  <text
                    key={i}
                    x="10"
                    y={i * 50 + 25}
                    fill="rgba(255,255,255,0.6)"
                    fontSize="10"
                    fontWeight="500"
                  >
                    ${value}
                  </text>
                ))}

                {/* Area Path */}
                <path
                  d={`
                    M 60 ${260 - ((yieldData[0].value - 8100) / 500) * 240}
                    ${yieldData.slice(1).map((d, i) => {
                      const x = 60 + ((i + 1) * (100 / yieldData.length)) * 10;
                      const y = 260 - ((d.value - 8100) / 500) * 240;
                      return `L ${x} ${y}`;
                    }).join(' ')}
                    L ${60 + (yieldData.length - 1) * (100 / yieldData.length) * 10} 260
                    L 60 260 Z
                  `}
                  fill="url(#yieldGradient)"
                />

                {/* Line Path */}
                <path
                  d={`
                    M 60 ${260 - ((yieldData[0].value - 8100) / 500) * 240}
                    ${yieldData.slice(1).map((d, i) => {
                      const x = 60 + ((i + 1) * (100 / yieldData.length)) * 10;
                      const y = 260 - ((d.value - 8100) / 500) * 240;
                      return `L ${x} ${y}`;
                    }).join(' ')}
                  `}
                  stroke="#C5B3ED"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data points */}
                {yieldData.map((d, i) => {
                  const x = 60 + (i * (100 / yieldData.length)) * 10;
                  const y = 260 - ((d.value - 8100) / 500) * 240;
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#C5B3ED"
                      stroke="#070709"
                      strokeWidth="2"
                    >
                      <title>${d.value.toFixed(2)} at {d.time}</title>
                    </circle>
                  );
                })}

                {/* X-axis labels */}
                {yieldData.map((d, i) => {
                  if (i % 1 === 0) {
                    const x = 60 + (i * (100 / yieldData.length)) * 10;
                    return (
                      <text
                        key={i}
                        x={x}
                        y="275"
                        fill="rgba(255,255,255,0.6)"
                        fontSize="10"
                        textAnchor="middle"
                        fontWeight="500"
                      >
                        {d.time}
                      </text>
                    );
                  }
                  return null;
                })}
              </svg>
            </div>

            {/* Stats Row */}
            <div className="yield-stats-row" style={{ borderTop: '1px solid rgba(230, 217, 253, 0.1)' }}>
              <div className="yield-stat">
                <span className="yield-stat-label" style={{ color: 'rgba(255,255,255,0.6)' }}>24h Change</span>
                <span className="yield-stat-value positive" style={{ color: '#10b981' }}>+$232.75 (2.8%)</span>
              </div>
              <div className="yield-stat">
                <span className="yield-stat-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Avg APY</span>
                <span className="yield-stat-value" style={{ color: 'white' }}>12.5%</span>
              </div>
              <div className="yield-stat">
                <span className="yield-stat-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Peak Yield</span>
                <span className="yield-stat-value" style={{ color: 'white' }}>$8,450.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
