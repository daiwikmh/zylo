"use client";

import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { CHAIN_ID } from '../../utils/constants';

interface KPICardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

const KPICard = ({ icon, value, label }: KPICardProps) => (
  <div className="bento-card span-6 kpi-card">
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
  const { data: balance } = useBalance({ address, chainId: CHAIN_ID });

  const formatBalance = () => {
    if (!balance) return '$0.00';
    const formatted = formatUnits(balance.value, balance.decimals);
    const num = parseFloat(formatted);
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div style={{ height: '100%' }}>
      <KPICard
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        }
        value={formatBalance()}
        label="Wallet Balance"
      />
    </div>
  );
};

export default KPICards;
