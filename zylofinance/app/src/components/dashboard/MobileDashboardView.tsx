'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useConnectorClient } from 'wagmi';
import { PrimeSdk, Web3eip1193WalletProvider } from '@etherspot/prime-sdk';
import {
  MobileDashboard,
  ActionCards,
  GaugeWidget,
  BottomTabBar
} from '../mobile';
import { fetchPortfolioValue } from '../../services/portfolioService';
import { CHAIN_ID } from '../../utils/constants';

export default function MobileDashboardView() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { data: client } = useConnectorClient();
  const [balance, setBalance] = useState('$0.00');
  const [smartAccountAddress, setSmartAccountAddress] = useState<string>('');
  const [percentage, setPercentage] = useState(0);

  // Initialize Smart Account
  useEffect(() => {
    const initSmartAccount = async () => {
      if (!client?.transport) return;

      try {
        const walletProvider = await Web3eip1193WalletProvider.connect(
          client.transport as any
        );

        const sdk = new PrimeSdk(walletProvider, {
          chainId: CHAIN_ID,
        });

        const smartAddress = await sdk.getCounterFactualAddress();
        setSmartAccountAddress(smartAddress);
      } catch (error) {
        console.error('Failed to get smart account:', error);
      }
    };

    if (isConnected) {
      initSmartAccount();
    }
  }, [client, isConnected]);

  // Fetch balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!address && !smartAccountAddress) return;

      try {
        const portfolioData = await fetchPortfolioValue(address, smartAccountAddress);
        const totalValue = portfolioData.grandTotalUsd;
        setBalance(`$${parseFloat(totalValue).toFixed(2)}`);

        // Calculate percentage based on TVL (for demo purposes, you can adjust this logic)
        const percentageValue = Math.min((parseFloat(totalValue) / 10000) * 100, 100);
        setPercentage(Math.floor(percentageValue));
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      }
    };

    fetchBalance();
    // Refresh every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [address, smartAccountAddress]);

  const handleDeposit = () => {
    router.push('/mobile-deposit');
  };

  const handleWithdraw = () => {
    router.push('/send');
  };

  const handleUpgrade = () => {
    router.push('/dashboard');
  };

  const handleConnectWallet = () => {
    // Trigger wallet connection
    router.push('/');
  };

  return (
    <div className="mobile-app">
      <MobileDashboard
        balance={balance}
        smartAccountAddress={smartAccountAddress}
        isConnected={isConnected}
        onLinkClick={() => router.push('/fxrp')}
        onStatsClick={() => router.push('/analytics')}
        onConnectWallet={handleConnectWallet}
      />

      {isConnected && (
        <>
          <ActionCards
            onDepositClick={handleDeposit}
            onWithdrawClick={handleWithdraw}
          />

          <GaugeWidget
            percentage={percentage}
            title="Portfolio Growth"
            onUpgradeClick={handleUpgrade}
          />
        </>
      )}

      <BottomTabBar />
    </div>
  );
}
