"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, WagmiProvider, createConfig } from 'wagmi'
import { flareTestnet} from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'

const client = new QueryClient()

export const connectors = [metaMask()];

export const wagmiConfig = createConfig({
    chains:[flareTestnet],
    connectors,
    multiInjectedProviderDiscovery:false,
    ssr:true,
    transports: {
        [flareTestnet.id]: http(),
    },
}); 


export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <WagmiProvider config={wagmiConfig}>
                  <QueryClientProvider client={client}>

            {children}
                  </QueryClientProvider>

        </WagmiProvider>
    );
};