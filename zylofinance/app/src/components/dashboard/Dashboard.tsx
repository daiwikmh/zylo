"use client";

import { Header } from '../header';
import { KPICards } from './KPICards';
import { RevenueChart } from './RevenueChart';
import { RecentEmails } from './RecentEmails';
import { SendReceiveCard } from '../widgets';

export const Dashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Full Width Header */}
      <div className="dashboard-header-row">
        <Header />
      </div>

      {/* Content Area */}
      <div className="dashboard-content">
        {/* Main Content */}
        <div className="dashboard-main">
          {/* KPI Cards Row */}
          <div className="dashboard-grid">
            <KPICards />
          </div>

          {/* Second Row - Stats + Chart */}
          <div className="dashboard-row" style={{ marginTop: '1.25rem' }}>
            {/* Left Stats Column */}
            <div className="stats-column">
              <div className="bento-card stats-widget">
                <div className="stats-widget-header">New clients</div>
                <div className="stats-widget-value">
                  54
                  <span className="stats-widget-change positive">+18.7%</span>
                </div>
              </div>

              <div className="bento-card stats-widget" style={{ marginTop: '1rem' }}>
                <div className="stats-widget-header">Invoices overdue</div>
                <div className="stats-widget-value">
                  6
                  <span className="stats-widget-change positive">+2.7%</span>
                </div>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="chart-column">
              <RevenueChart />
            </div>
          </div>

          {/* Third Row - Emails */}
          {/* <div style={{ marginTop: '1.25rem' }}>
            <RecentEmails />
          </div> */}
        </div>

        {/* Right Sidebar - Send/Receive Card */}
        <div className="right-sidebar">
          <SendReceiveCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
