'use client';

/**
 * Mobile Component Showcase
 *
 * This component demonstrates all the Neo-brutalist mobile components.
 * Useful for testing and previewing the design system.
 */

import { useState } from 'react';
import MobileDashboard from './MobileDashboard';
import ActionCards from './ActionCards';
import GaugeWidget from './GaugeWidget';
import TransactionList, { Transaction } from './TransactionList';
import DepositScreen from './DepositScreen';
import BottomTabBar from './BottomTabBar';
import '../../styles/mobile-neo-brutalist.css';

const mockTransactions: Transaction[] = [
  {
    id: '1',
    name: 'John Doe',
    date: 'Today, 2:30 PM',
    amount: 250.00,
    status: 'success',
  },
  {
    id: '2',
    name: 'Sarah Smith',
    date: 'Today, 11:15 AM',
    amount: -89.99,
    status: 'success',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    date: 'Yesterday, 5:45 PM',
    amount: -150.00,
    status: 'pending',
  },
  {
    id: '4',
    name: 'Emily Davis',
    date: 'Jan 19, 3:20 PM',
    amount: 500.00,
    status: 'success',
  },
];

export default function ComponentShowcase() {
  const [activeScreen, setActiveScreen] = useState<'dashboard' | 'deposit'>('dashboard');

  if (activeScreen === 'deposit') {
    return (
      <div className="mobile-app">
        <DepositScreen
          userName="Your Wallet"
          onBackClick={() => setActiveScreen('dashboard')}
          onQRCodeClick={() => alert('QR Code clicked!')}
          onShareLinkClick={() => alert('Share Link clicked!')}
          recentTransactions={mockTransactions}
        />
      </div>
    );
  }

  return (
    <div className="mobile-app">
      <MobileDashboard
        balance="$12,845.50"
        onLinkClick={() => alert('Link clicked!')}
        onStatsClick={() => alert('Stats clicked!')}
      />

      <ActionCards
        onWithdrawClick={() => alert('Withdraw clicked!')}
        onDepositClick={() => setActiveScreen('deposit')}
      />

      <GaugeWidget
        percentage={64}
        title="Monthly Limit"
        onUpgradeClick={() => alert('Get Plus clicked!')}
      />

      <TransactionList
        transactions={mockTransactions}
        title="Recent Transactions"
      />

      <BottomTabBar />
    </div>
  );
}
