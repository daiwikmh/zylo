'use client';

import { ArrowLeft, QrCode, Share2 } from 'lucide-react';
import TransactionList, { Transaction } from './TransactionList';
import '../../styles/mobile-neo-brutalist.css';

interface DepositScreenProps {
  userName?: string;
  userAvatar?: string;
  onBackClick?: () => void;
  onQRCodeClick?: () => void;
  onShareLinkClick?: () => void;
  recentTransactions?: Transaction[];
}

export default function DepositScreen({
  userName = 'John Doe',
  userAvatar,
  onBackClick,
  onQRCodeClick,
  onShareLinkClick,
  recentTransactions
}: DepositScreenProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="mobile-deposit-screen">
      {/* Header */}
      <div className="mobile-deposit-header">
        <button className="mobile-deposit-back" onClick={onBackClick}>
          <ArrowLeft size={20} color="#FFF" strokeWidth={3} />
        </button>
        <h1 className="mobile-deposit-title">Deposit</h1>
        <div style={{ width: '40px' }} /> {/* Spacer for centering */}
      </div>

      {/* User Profile */}
      <div className="mobile-deposit-profile">
        <div className="mobile-deposit-avatar">
          {userAvatar || getInitials(userName)}
        </div>
        <div className="mobile-deposit-name">{userName}</div>
      </div>

      {/* Action Buttons */}
      <div className="mobile-deposit-buttons">
        <button
          className="mobile-deposit-button yellow"
          onClick={onQRCodeClick}
        >
          <QrCode size={48} color="#000" strokeWidth={3} />
          <span>QR Code</span>
        </button>

        <button
          className="mobile-deposit-button green"
          onClick={onShareLinkClick}
        >
          <Share2 size={48} color="#000" strokeWidth={3} />
          <span>Share Link</span>
        </button>
      </div>

      {/* Recent Transactions */}
      {recentTransactions && recentTransactions.length > 0 && (
        <TransactionList
          transactions={recentTransactions}
          title="Recent Deposits"
        />
      )}
    </div>
  );
}
