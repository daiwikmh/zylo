/**
 * Application-wide constants
 * Centralized configuration for repeated values across the application
 */

// ============================================
// CHAIN CONFIGURATION
// ============================================
export const CHAIN_ID = 114; // Coston2 Testnet

// ============================================
// ETHERSPOT / ARKA CONFIGURATION
// ============================================
export const ARKA_BASE_URL = 'https://arka.etherspot.io';

export const getPaymasterUrl = () => {
  const apiKey = process.env.NEXT_PUBLIC_ETHERSPOT_API_KEY;
  return `${ARKA_BASE_URL}?apiKey=${apiKey}&chainId=${CHAIN_ID}&useVp=true`;
};

// ============================================
// GAS RESERVE AMOUNTS (in ETH units)
// ============================================
export const GAS_RESERVES = {
  DEPOSIT: '0.5',      // Reserve for deposit transactions
  SEND_FLR: '0.1',     // Reserve for FLR transfers
  SEND_YFLR: '0.05',   // Reserve for yFLR spending
} as const;

// ============================================
// TRANSACTION TIMEOUTS (in milliseconds)
// ============================================
export const TIMEOUTS = {
  USER_OP_RECEIPT: 60000,    // 1 minute
  POLLING_INTERVAL: 2000,     // 2 seconds
} as const;

// ============================================
// YIELD / APY CONFIGURATION
// ============================================
export const YIELD_CONFIG = {
  APY: '12.5',  // Annual Percentage Yield
  COMPOUNDING: 'Daily',
  LOCK_PERIOD: 'None',
} as const;

// ============================================
// TRANSACTION STATUS
// ============================================
export const TX_STATUS = {
  IDLE: 'idle',
  PENDING: 'pending',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export type TxStatus = typeof TX_STATUS[keyof typeof TX_STATUS];

// ============================================
// FORMATTING
// ============================================
export const DECIMAL_PLACES = {
  BALANCE: 4,      // Display balance with 4 decimal places
  APY: 1,          // Display APY with 1 decimal place
} as const;

// ============================================
// EXTERNAL LINKS
// ============================================
export const EXTERNAL_LINKS = {
  COSTON2_FAUCET: 'https://faucet.flare.network/coston2',
  COSTON2_EXPLORER: 'https://coston2-explorer.flare.network',
} as const;
