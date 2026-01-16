"use client";

import { Header } from '../header';
import { KPICards } from './KPICards';
import { StatsWidget } from './StatsWidget';
import { RevenueChart } from './RevenueChart';
import { RecentEmails } from './RecentEmails';
import { FormationStatus, TodoListWidget } from '../widgets';

export const Dashboard = () => {
  return (
    <div className="dashboard-layout">
      {/* Main Content */}
      <div className="dashboard-main">
        <Header />

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
        <div style={{ marginTop: '1.25rem' }}>
          <RecentEmails />
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="right-sidebar">
        <FormationStatus progress={30} estimatedDays="4-5 business days" />
        <TodoListWidget />
      </div>
    </div>
  );
};

export default Dashboard;
