"use client";

import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';

interface KPICardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

const KPICard = ({ icon, value, label }: KPICardProps) => (
  <div className="bento-card span-3 kpi-card">
    <div className="kpi-header">
      <div className="kpi-icon">{icon}</div>
      <button className="kpi-menu-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>
    </div>
    <div className="kpi-value">{value}</div>
    <div className="kpi-label">{label}</div>
  </div>
);

export const KPICards = () => {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });

  const formatBalance = () => {
    if (!balance) return '$0.00';
    const formatted = formatUnits(balance.value, balance.decimals);
    const num = parseFloat(formatted);
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <>
      {/* Bank Balance */}
      <KPICard
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        }
        value={formatBalance()}
        label="Your bank balance"
      />

      {/* Uncategorized Transactions */}
      <KPICard
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        }
        value="12"
        label="Uncategorized transactions"
      />

      {/* Active Users */}
      <KPICard
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        }
        value="7"
        label="Employees working today"
      />

      {/* Weekly Spending */}
      <KPICard
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        }
        value="$3,287.49"
        label="This week's card spending"
      />
    </>
  );
};

export default KPICards;
