import {
  WEB3AUTH_NETWORK,
  WALLET_CONNECTORS,
    MFA_LEVELS,
  type Web3AuthOptions
} from '@web3auth/modal';
import { type Web3AuthContextConfig } from '@web3auth/modal/react';


// Web3Auth Options
export const web3AuthOptions: Web3AuthOptions = {
  clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || 'YOUR_WEB3AUTH_CLIENT_ID',
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  accountAbstractionConfig: {
    smartAccountType: 'metamask',
    chains: [
      {
        chainId: '0x72',
        bundlerConfig: {
          url: process.env.NEXT_PUBLIC_BUNDLER_URL || 'https://api.pimlico.io/v2/114/rpc?apikey=YOUR_API_KEY',
        },
      },
    ],
  },
  uiConfig: {
    appName: 'Zylo Finance',
    appUrl: typeof window !== 'undefined' ? window.location.origin : 'https://zylofinance.com',
    theme: {
      primary: '#B1CDFD',
    },
    mode: 'dark',
    defaultLanguage: 'en',
  },
  useAAWithExternalWallet: true,
  // Modal configuration for authentication methods
   modalConfig: {
    connectors: {
      [WALLET_CONNECTORS.AUTH]: {
        label: 'auth',
        loginMethods: {
          google: {
            name: 'google login',
            // logoDark: "url to your custom logo which will shown in dark mode",
          }
        },
        showOnModal: true, // set to false to hide all social login methods
      },
    },
    hideWalletDiscovery: true, // set to true to hide external wallets discovery
  },
  mfaLevel: MFA_LEVELS.MANDATORY,
};

// Web3Auth Context Configuration
export const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions,
};

export default web3AuthContextConfig;
