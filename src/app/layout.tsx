import type { Metadata } from "next";
import { Roboto as _font } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/constants/config";

import { Navbar } from "@/components/navbar/navbar/comp";

const font = _font({ subsets: ["latin"], weight: "400" });

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
      <body className={font.className}>
        <Web3Provider>
        <Navbar/>
        {children}
        </Web3Provider>
        </body>
    </html>
  );
}
