import { CHAIN_ID } from '../utils/constants';

export interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  blockNumber: number;
  status: 'success' | 'pending' | 'failed';
  method?: string;
}

const EXPLORER_API_URLS: Record<number, string> = {
  114: 'https://coston2-explorer.flare.network/api', // Coston2 Testnet
  14: 'https://flare-explorer.flare.network/api',    // Flare Mainnet
};

/**
 * Fetch transaction history for a given address
 * Uses the Flare block explorer API
 */
export async function fetchTransactionHistory(
  address: string,
  limit: number = 10
): Promise<Transaction[]> {
  try {
    const explorerUrl = EXPLORER_API_URLS[CHAIN_ID];
    if (!explorerUrl) {
      console.error('No explorer API configured for chain ID:', CHAIN_ID);
      return [];
    }

    // Fetch transactions from block explorer API
    const url = `${explorerUrl}?module=account&action=txlist&address=${address}&sort=desc&limit=${limit}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== '1' || !data.result) {
      console.error('Failed to fetch transactions:', data.message);
      return [];
    }

    // Transform explorer API response to our Transaction format
    const transactions: Transaction[] = data.result.map((tx: any) => {
      const isOutgoing = tx.from.toLowerCase() === address.toLowerCase();
      const valueInEther = (Number(tx.value) / 1e18).toFixed(6);

      return {
        id: tx.hash,
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: valueInEther,
        timestamp: Number(tx.timeStamp),
        blockNumber: Number(tx.blockNumber),
        status: tx.txreceipt_status === '1' ? 'success' : 'failed',
        method: tx.functionName || (isOutgoing ? 'Send' : 'Receive'),
      };
    });

    return transactions;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return [];
  }
}

/**
 * Format transaction for display in UI
 */
export function formatTransactionForDisplay(tx: Transaction, userAddress: string) {
  const isOutgoing = tx.from.toLowerCase() === userAddress.toLowerCase();
  const amount = parseFloat(tx.value);

  return {
    id: tx.hash,
    name: isOutgoing ? `To ${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` : `From ${tx.from.slice(0, 6)}...${tx.from.slice(-4)}`,
    date: formatTimestamp(tx.timestamp),
    amount: isOutgoing ? -amount : amount,
    status: tx.status,
    hash: tx.hash,
    method: tx.method,
  };
}

/**
 * Format Unix timestamp to readable date
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays === 0) {
    return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }
}

/**
 * Get transaction explorer link
 */
export function getTransactionExplorerLink(txHash: string): string {
  const explorerUrls: Record<number, string> = {
    114: 'https://coston2-explorer.flare.network/tx',
    14: 'https://flare-explorer.flare.network/tx',
  };

  const baseUrl = explorerUrls[CHAIN_ID] || explorerUrls[114];
  return `${baseUrl}/${txHash}`;
}
