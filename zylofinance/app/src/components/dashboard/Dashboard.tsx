"use client";

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { PrimeSdk } from '@etherspot/prime-sdk';
import { isMobile } from '../../utils/platform';
import { useWeb3Auth } from '../../providers/web3auth';
import { initEtherspotSDK } from '../../utils/etherspot';
import { Header } from '../header';
import { KPICards } from './KPICards';
import { RevenueChart } from './RevenueChart';
import { SendReceiveCard } from '../widgets';
import { PortfolioValue } from './PortfolioValue';

export const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const { provider: web3AuthProvider } = useWeb3Auth();
  const [primeSdk, setPrimeSdk] = useState<PrimeSdk | null>(null);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    // Check if running on native mobile platform
    setIsNative(isMobile());
  }, []);

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

  

  // Render web version
  return (
    <div className="dashboard-container">
      <div className="dashboard-header-row">
        <Header />
      </div>

      <div className="dashboard-optimized-grid">
        {/* Top row: KPI + Portfolio */}
        <div className="grid-kpi-area">
          <KPICards />
        </div>

        <div className="grid-portfolio-area">
          <PortfolioValue />
        </div>

        {/* Middle: Chart */}
        <div className="grid-chart-area">
          <RevenueChart />
        </div>

        {/* Right: Send/Receive */}
        <div className="grid-send-area">
          <SendReceiveCard primeSdk={primeSdk} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
