'use client';

import { useRouter } from 'next/navigation';
import { DepositScreen, Transaction } from '../../src/components/mobile';
import { useAccount } from 'wagmi';

export default function MobileDepositPage() {
  const router = useRouter();
  const { address } = useAccount();

  // Mock recent deposits - replace with real API call
  const recentDeposits: Transaction[] = [
    {
      id: '1',
      name: 'Bank Transfer',
      date: 'Today, 2:30 PM',
      amount: 500.00,
      status: 'success',
    },
    {
      id: '2',
      name: 'Crypto Transfer',
      date: 'Yesterday, 5:45 PM',
      amount: 250.00,
      status: 'success',
    },
  ];

  const handleQRCode = () => {
    // Show QR code modal
    console.log('Show QR Code');
  };

  const handleShareLink = async () => {
    if (address) {
      // Share wallet address
      try {
        await navigator.share({
          title: 'My Wallet Address',
          text: `Send crypto to: ${address}`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(address);
      }
    }
  };

  return (
    <DepositScreen
      userName="Your Wallet"
      onBackClick={() => router.back()}
      onQRCodeClick={handleQRCode}
      onShareLinkClick={handleShareLink}
      recentTransactions={recentDeposits}
    />
  );
}
