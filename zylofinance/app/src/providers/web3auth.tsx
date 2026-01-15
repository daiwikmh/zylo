"use client";

import { ReactNode } from "react";
import { WagmiProvider } from "@web3auth/modal/react/wagmi";
import { Web3AuthProvider } from "@web3auth/modal/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import web3AuthContextConfig from "./web3auth.config";
const queryClient = new QueryClient();

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <Web3AuthProvider config={web3AuthContextConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider>{children}</WagmiProvider>
      </QueryClientProvider>
    </Web3AuthProvider>
  );
};

// Re-export hooks for convenience
export {
  useWeb3Auth,
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
  useWeb3AuthUser,
} from "@web3auth/modal/react";

export { AUTH_CONNECTION, WALLET_CONNECTORS } from "@web3auth/modal";
