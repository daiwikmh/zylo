import { CONTRACTS } from '../contracts/config';
import { ZYLO_VAULT_ABI } from '../contracts/abis';
import { CHAIN_ID } from '../utils/constants';
import { createPublicClient, http, formatEther } from 'viem';

// Configure public client for reading blockchain data
const getPublicClient = () => {
  const rpcUrls: Record<number, string> = {
    114: 'https://coston2-api.flare.network/ext/C/rpc', // Coston2
    14: 'https://flare-api.flare.network/ext/C/rpc',    // Flare
  };

  return createPublicClient({
    chain: {
      id: CHAIN_ID,
      name: CHAIN_ID === 114 ? 'Coston2' : 'Flare',
      network: CHAIN_ID === 114 ? 'coston2' : 'flare',
      nativeCurrency: {
        decimals: 18,
        name: 'FLR',
        symbol: 'FLR',
      },
      rpcUrls: {
        default: { http: [rpcUrls[CHAIN_ID]] },
        public: { http: [rpcUrls[CHAIN_ID]] },
      },
    },
    transport: http(),
  });
};

export interface YieldAnalytics {
  totalAssets: number;
  totalShares: number;
  totalYield: number;
  apy: number;
  tvlUsd: number;
  sharePrice: number;
}

export interface UserYieldStats {
  userShares: number;
  userAssets: number;
  userYieldEarned: number;
  userPercentageOfPool: number;
}

/**
 * Fetch vault analytics data
 */
export async function fetchVaultAnalytics(): Promise<YieldAnalytics> {
  try {
    const client = getPublicClient();

    // Fetch total assets in vault
    const totalAssets = await client.readContract({
      address: CONTRACTS.ZYLO_VAULT,
      abi: ZYLO_VAULT_ABI,
      functionName: 'totalAssets',
    }) as bigint;

    // Fetch total shares (yFLR supply)
    const totalShares = await client.readContract({
      address: CONTRACTS.ZYLO_VAULT,
      abi: ZYLO_VAULT_ABI,
      functionName: 'totalSupply',
    }) as bigint;

    const totalAssetsNum = parseFloat(formatEther(totalAssets));
    const totalSharesNum = parseFloat(formatEther(totalShares));

    // Calculate share price (assets per share)
    const sharePrice = totalSharesNum > 0 ? totalAssetsNum / totalSharesNum : 1;

    // Calculate total yield (assets - shares, since initial deposit creates 1:1)
    const totalYield = totalAssetsNum - totalSharesNum;

    // Calculate APY (this is a simplified calculation, you'd want historical data)
    // For now, using a placeholder based on yield
    const apy = totalSharesNum > 0 ? (totalYield / totalSharesNum) * 100 : 0;

    // TODO: Fetch FLR price from oracle or API to calculate TVL in USD
    // For now, using $0.05 as placeholder FLR price
    const flrPriceUsd = 0.05;
    const tvlUsd = totalAssetsNum * flrPriceUsd;

    return {
      totalAssets: totalAssetsNum,
      totalShares: totalSharesNum,
      totalYield: Math.max(0, totalYield),
      apy: Math.max(0, apy),
      tvlUsd,
      sharePrice,
    };
  } catch (error) {
    console.error('Error fetching vault analytics:', error);
    return {
      totalAssets: 0,
      totalShares: 0,
      totalYield: 0,
      apy: 0,
      tvlUsd: 0,
      sharePrice: 1,
    };
  }
}

/**
 * Fetch user-specific yield stats
 */
export async function fetchUserYieldStats(
  userAddress: string
): Promise<UserYieldStats> {
  try {
    const client = getPublicClient();

    // Fetch user's yFLR balance
    const userShares = await client.readContract({
      address: CONTRACTS.ZYLO_VAULT,
      abi: ZYLO_VAULT_ABI,
      functionName: 'balanceOf',
      args: [userAddress as `0x${string}`],
    }) as bigint;

    // Convert user shares to underlying assets
    const userAssets = await client.readContract({
      address: CONTRACTS.ZYLO_VAULT,
      abi: ZYLO_VAULT_ABI,
      functionName: 'convertToAssets',
      args: [userShares],
    }) as bigint;

    // Fetch total supply to calculate user's percentage
    const totalShares = await client.readContract({
      address: CONTRACTS.ZYLO_VAULT,
      abi: ZYLO_VAULT_ABI,
      functionName: 'totalSupply',
    }) as bigint;

    const userSharesNum = parseFloat(formatEther(userShares));
    const userAssetsNum = parseFloat(formatEther(userAssets));
    const totalSharesNum = parseFloat(formatEther(totalShares));

    // Calculate user's yield earned (assets - shares)
    const userYieldEarned = Math.max(0, userAssetsNum - userSharesNum);

    // Calculate user's percentage of pool
    const userPercentageOfPool = totalSharesNum > 0
      ? (userSharesNum / totalSharesNum) * 100
      : 0;

    return {
      userShares: userSharesNum,
      userAssets: userAssetsNum,
      userYieldEarned,
      userPercentageOfPool,
    };
  } catch (error) {
    console.error('Error fetching user yield stats:', error);
    return {
      userShares: 0,
      userAssets: 0,
      userYieldEarned: 0,
      userPercentageOfPool: 0,
    };
  }
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format number with decimals
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format percentage with sign
 */
export function formatPercentage(num: number, decimals: number = 2): string {
  const sign = num >= 0 ? '+' : '';
  return `${sign}${num.toFixed(decimals)}%`;
}
