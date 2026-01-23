'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MobileDashboard,
  ActionCards,
  GaugeWidget,
  TransactionList,
  BottomTabBar,
  Transaction
} from '../mobile';
import { fetchPortfolioValue, PortfolioData } from '../../services/portfolioService';
import { useAccount } from 'wagmi';

export default function MobileDashboardView() {
  const router = useRouter();
  const { address } = useAccount();
  const [balance, setBalance] = useState('$0.00');
  const [percentage, setPercentage] = useState(64);

  // Mock transactions - replace with real API call
  const transactions: Transaction[] = [
    {
      id: '1',
      name: 'Received from Wallet',
      date: 'Today, 2:30 PM',
      amount: 250.00,
      status: 'success',
    },
    {
      id: '2',
      name: 'Sent to Exchange',
      date: 'Today, 11:15 AM',
      amount: -89.99,
      status: 'success',
    },
    {
      id: '3',
      name: 'Staking Reward',
      date: 'Yesterday, 5:45 PM',
      amount: 15.50,
      status: 'success',
    },
  ];

  useEffect(() => {
    const fetchBalance = async () => {
      if (!address) return;

      try {
        const portfolioData = await fetchPortfolioValue(address, address);
        const totalValue = portfolioData.grandTotalUsd;
        setBalance(`$${totalValue.toLocaleString()}`);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      }
    };

    fetchBalance();
    // Refresh every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [address]);

  const handleDeposit = () => {
    router.push('/mobile-deposit');
  };

  const handleWithdraw = () => {
    router.push('/send');
  };

  const handleUpgrade = () => {
    // Handle upgrade click
    console.log('Upgrade clicked');
  };

  return (
    <div className="mobile-app">
      <MobileDashboard
        balance={balance}
        onLinkClick={() => console.log('Link clicked')}
        onStatsClick={() => router.push('/analytics')}
      />

      <ActionCards
        onDepositClick={handleDeposit}
        onWithdrawClick={handleWithdraw}
      />

      <GaugeWidget
        percentage={percentage}
        title="Monthly Limit"
        onUpgradeClick={handleUpgrade}
      />

      <TransactionList transactions={transactions} />

      <BottomTabBar />
    </div>
  );
}
