/**
 * Mobile API Service
 *
 * This service layer provides a clean interface for the mobile UI to interact
 * with your existing web app backend/blockchain services.
 *
 * Replace the mock functions below with actual API calls to your backend.
 */

import { getPortfolioData } from './portfolioService';

export interface UserBalance {
  totalBalance: number;
  balanceUSD: string;
  assets: Array<{
    symbol: string;
    balance: number;
    valueUSD: number;
  }>;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'transfer' | 'stake' | 'reward';
  amount: number;
  currency: string;
  status: 'success' | 'pending' | 'failed';
  timestamp: Date;
  from?: string;
  to?: string;
  txHash?: string;
}

export interface MonthlyLimit {
  used: number;
  total: number;
  percentage: number;
  resetDate: Date;
}

/**
 * Fetch user's total balance across all assets
 */
export async function getUserBalance(
  eoaAddress: string,
  smartAccountAddress: string
): Promise<UserBalance> {
  try {
    const portfolioData = await getPortfolioData(eoaAddress, smartAccountAddress);

    return {
      totalBalance: portfolioData.totalValue,
      balanceUSD: `$${portfolioData.totalValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      assets: [
        {
          symbol: 'FLR',
          balance: portfolioData.nativeBalance,
          valueUSD: portfolioData.nativeValueUSD,
        },
        {
          symbol: 'USDT',
          balance: portfolioData.usdtBalance,
          valueUSD: portfolioData.usdtValueUSD,
        },
        {
          symbol: 'XRP',
          balance: portfolioData.fxrpBalance,
          valueUSD: portfolioData.fxrpValueUSD,
        },
      ],
    };
  } catch (error) {
    console.error('Error fetching user balance:', error);
    throw error;
  }
}

/**
 * Fetch recent transactions
 *
 * TODO: Replace with actual API endpoint
 * Example: GET /api/transactions?address={address}&limit={limit}
 */
export async function getRecentTransactions(
  address: string,
  limit: number = 10
): Promise<Transaction[]> {
  // Mock implementation - replace with actual API call
  return [
    {
      id: '1',
      type: 'deposit',
      amount: 250.00,
      currency: 'FLR',
      status: 'success',
      timestamp: new Date(),
      to: address,
    },
    {
      id: '2',
      type: 'withdraw',
      amount: 89.99,
      currency: 'USDT',
      status: 'success',
      timestamp: new Date(Date.now() - 3600000),
      from: address,
    },
    {
      id: '3',
      type: 'reward',
      amount: 15.50,
      currency: 'FLR',
      status: 'success',
      timestamp: new Date(Date.now() - 86400000),
      to: address,
    },
  ];

  /* Example real implementation:
  const response = await fetch(`/api/transactions?address=${address}&limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return response.json();
  */
}

/**
 * Fetch monthly spending/transaction limit
 *
 * TODO: Replace with actual API endpoint
 * Example: GET /api/limits?address={address}
 */
export async function getMonthlyLimit(address: string): Promise<MonthlyLimit> {
  // Mock implementation - replace with actual API call
  return {
    used: 6400,
    total: 10000,
    percentage: 64,
    resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
  };

  /* Example real implementation:
  const response = await fetch(`/api/limits?address=${address}`);
  if (!response.ok) {
    throw new Error('Failed to fetch monthly limit');
  }
  return response.json();
  */
}

/**
 * Initiate a withdrawal
 *
 * TODO: Replace with actual API endpoint
 * Example: POST /api/withdraw
 */
export async function initiateWithdrawal(params: {
  from: string;
  to: string;
  amount: number;
  currency: string;
}): Promise<{ txHash: string; status: string }> {
  // Mock implementation - replace with actual API call
  console.log('Initiating withdrawal:', params);

  return {
    txHash: '0x' + Math.random().toString(16).substr(2),
    status: 'pending',
  };

  /* Example real implementation:
  const response = await fetch('/api/withdraw', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    throw new Error('Failed to initiate withdrawal');
  }
  return response.json();
  */
}

/**
 * Generate QR code for receiving funds
 *
 * TODO: Replace with actual QR code generation
 */
export async function generateDepositQRCode(address: string): Promise<string> {
  // Mock implementation - return data URL for QR code
  // In production, use a QR code library like `qrcode` or call your backend
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${address}`;

  /* Example real implementation using qrcode library:
  import QRCode from 'qrcode';
  return await QRCode.toDataURL(address);
  */
}

/**
 * Get shareable wallet link
 */
export function getShareableWalletLink(address: string): string {
  // Return a link that others can use to send funds
  return `https://zylo.finance/send?to=${address}`;
}
