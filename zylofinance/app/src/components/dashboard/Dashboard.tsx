"use client";

import { Header } from '../header';
import { KPICards } from './KPICards';
import { RevenueChart } from './RevenueChart';
import { SendReceiveCard } from '../widgets';
import { PortfolioValue } from './PortfolioValue';

export const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header-row">
        <Header />
      </div>

      <div className="dashboard-content">
        <div className="dashboard-main">
          <div className="dashboard-grid" style={{ marginBottom: '1.25rem' }}>
            <KPICards />
          </div>

          <div className="dashboard-row">
            <div className="stats-column">
              <PortfolioValue />
            </div>

            <div className="chart-column">
              <RevenueChart />
            </div>
          </div>
        </div>

        <div className="right-sidebar">
          <SendReceiveCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
