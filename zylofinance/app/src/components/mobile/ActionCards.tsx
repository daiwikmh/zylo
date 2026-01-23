'use client';

import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import '../../styles/mobile-neo-brutalist.css';

interface ActionCardsProps {
  onWithdrawClick?: () => void;
  onDepositClick?: () => void;
}

export default function ActionCards({
  onWithdrawClick,
  onDepositClick
}: ActionCardsProps) {
  return (
    <div className="mobile-action-cards">
      {/* Withdraw Card */}
      <div className="mobile-action-card" onClick={onWithdrawClick}>
        <div className="mobile-action-card-icon">
          <ArrowUpCircle size={24} color="#000" strokeWidth={2} />
        </div>
        <div className="mobile-action-card-title">Withdraw</div>
      </div>

      {/* Deposit Card */}
      <div className="mobile-action-card" onClick={onDepositClick}>
        <div className="mobile-action-card-icon">
          <ArrowDownCircle size={24} color="#000" strokeWidth={2} />
        </div>
        <div className="mobile-action-card-title">Deposit</div>
      </div>
    </div>
  );
}
