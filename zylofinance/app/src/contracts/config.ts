import { CHAIN_ID } from '../utils/constants';

// Contract Addresses on Coston2 Testnet (Chain ID: 114)
export const CONTRACTS = {
  ZYLO_VAULT: '0xEBeE2004E3D8cE6aD0E1aC6467Bc39da3907966E' as const,
  WNAT: '0x1D80c49BbBCd1C0911346656B529DF9E5c2F783d' as const, // WNat on Flare
  ASSET_MANAGER: '0xc1Ca88b937d0b528842F95d5731ffB586f4fbDFA' as const, // FAsset AssetManager
} as const;

// Flare Network Configuration
export const COSTON2_CHAIN = {
  id: CHAIN_ID,
  name: 'Coston2',
  network: 'coston2',
  nativeCurrency: {
    decimals: 18,
    name: 'Coston2 Flare',
    symbol: 'C2FLR',
  },
  rpcUrls: {
    default: {
      http: ['https://coston2-api.flare.network/ext/C/rpc'],
    },
    public: {
      http: ['https://coston2-api.flare.network/ext/C/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Coston2 Explorer',
      url: 'https://coston2-explorer.flare.network',
    },
  },
} as const;


// Token Symbols
export const TOKENS = {
  FLR: 'FLR',
  WNAT: 'WNat',
  YFLR: 'yFLR',
} as const;
