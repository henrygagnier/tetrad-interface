"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { arbitrum, optimism } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { ReactNode } from "react";
import { lotteryABI } from "@/abis/lottery";
import { ccLotteryABI } from "@/abis/ccLottery";


export const chainDetails = [
  /*{ name: "Arbitrum Sepolia", chainId: 421614, logo: "/Arbitrum-logo.webp", WETH: "0xA8C0c11bf64AF62CDCA6f93D3769B88BdD7cb93D" },
  { name: "OP Sepolia", chainId: 11155420, logo: "/optimism.png" },*/
  { name: "Arbitrum One", chainId: 42161, logo: "/Arbitrum-logo.webp"},
  { name: "OP Mainnet", chainId: 10, logo: "/optimism.png" },
]

export const defaultChain = chainDetails[0];

export const nullAddress = "0x0000000000000000000000000000000000000000" as `0x${string}`;

export const rewardsBreakdown = (): number[] => {
  return ([0.15, 0.175, 0.2, 0.225, 0.1, 0.15]);
}

export const firstRound: number = 19894;

export const lotteryContract: Record<number, {abi: any, address: `0x${string}`}> = {
  [421614]: { // ARB Testnet
    abi: lotteryABI,
    address: "0xa9543f11db6e4fb276981b2d1b16dae8df96c886" as `0x${string}`
  },
  [42161]: { // ARB Mainnet
    abi: lotteryABI,
    address: "0x415b6B93bCbb308f199702Dff0a3617959C4B73A" as `0x${string}` //replace address
  },
  [11155420]: { // OP Testnet
    abi: ccLotteryABI,
    address: "0x5A4CEA5F8AF96d4481DDF565529BfCD1b8260Bed" as `0x${string}`
  },
  [10]: { // OP Mainnet
    abi: ccLotteryABI,
    address: "0x5746a1ec97d91c594e6042a7a42c8285c4c3a0ee" as `0x${string}` //replace address
  }
}

export const config = createConfig(
  getDefaultConfig({
    chains: [arbitrum, optimism],
    transports: {
      [arbitrum.id]: http(),
      [optimism.id]: http(),
    },

    walletConnectProjectId: "1a220f2c3d69be0e73a7d02da48942f5",
    appName: "Tetrad Lottery",
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