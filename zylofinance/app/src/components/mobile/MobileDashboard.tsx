'use client';

import { useState, useEffect } from 'react';
import { Link2, TrendingUp } from 'lucide-react';
import '../../styles/mobile-neo-brutalist.css';

interface MobileDashboardProps {
  balance: string;
  onLinkClick?: () => void;
  onStatsClick?: () => void;
}

export default function MobileDashboard({
  balance = '$12,845.50',
  onLinkClick,
  onStatsClick
}: MobileDashboardProps) {
  return (
    <div className="mobile-dashboard">
      {/* Header with Balance */}
      <div className="mobile-dashboard-header">
        <h1 className="mobile-dashboard-title">Financial Dashboard</h1>

        <div className="mobile-balance-card">
          <div className="mobile-balance-label">Total Balance</div>
          <div className="mobile-balance-amount">{balance}</div>

          <div className="mobile-action-buttons">
            <button
              className="mobile-action-button"
              onClick={onLinkClick}
              aria-label="Link Account"
            >
              <Link2 size={24} color="#000" strokeWidth={3} />
            </button>
            <button
              className="mobile-action-button"
              onClick={onStatsClick}
              aria-label="View Stats"
            >
              <TrendingUp size={24} color="#000" strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
