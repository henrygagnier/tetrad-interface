import type { Metadata } from "next";
import { Roboto, Syne } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/constants/config";

import { Navbar } from "@/components/navbar/navbar/comp";

const _Roboto = Roboto({ subsets: ["latin"], weight: "400" });
const _Syne = Syne({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Tetrad Finance | Revolutionizing Traditional Gaming",
  description: "Win massive prizes while playing on-chain and cross-chain games with friends on Optimism Mainnet and Arbitrum One.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${_Roboto.className} ${_Syne.className}`}>
        <Web3Provider>
        <Navbar/>
        {children}
        </Web3Provider>
        </body>
    </html>
  );
}
