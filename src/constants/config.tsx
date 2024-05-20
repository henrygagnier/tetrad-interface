"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { arbitrumSepolia, arbitrum } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { ReactNode } from "react";
import { lotteryABI } from "@/abis/lottery";

export const chainDetails = [
  { name: "Arbitrum Sepolia", chainId: 421614, logo: "/arbitrum.webp" },
  { name: "Arbitrum Mainnet", chainId: 42161, logo: "/Arbitrum-logo.webp" },
]
export const defaultChain = chainDetails[0];

export const rewardsBreakdown = (): number[] => {
  return([0.15, 0.175, 0.2, 0.225, 0.1, 0.15]);
}

export const price = (): number => {
  return(0.0005);
}

export const firstRound: number = 19861;

export const lotteryContract = {
  abi: lotteryABI,
  address: "0xcf79dec98AEF1CDBa7f5F93b3bf1601fb205a395" as `0x${string}`
}

export const config = createConfig(
  getDefaultConfig({
    chains: [arbitrumSepolia, arbitrum],
    transports: {
      [arbitrumSepolia.id]: http(),
      [arbitrum.id]: http(),
    },

    walletConnectProjectId: "1a220f2c3d69be0e73a7d02da48942f5",
    appName: "Tetrad Finance",
  }),
);

const queryClient = new QueryClient();

export const Web3Provider = (props: { children: ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{props.children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};