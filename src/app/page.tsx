"use client";

import Image from "next/image";
import styles from "./page.module.css";

import { BuyTickets } from "@/components/tickets/buyTickets/comp";
import { Overlay } from "@/components/overlay/comp";
import { useState, useEffect } from "react";
import { PreviousRounds } from "@/components/previousRounds/comp";
import { YourTickets } from "@/components/yourTickets/comp";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";

export default function Home() {
  const [buyTicketsOpen, setBuyTicketsOpen] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { isConnected } = useAccount();
  return (
    <>
      {buyTicketsOpen &&
        <>
          <BuyTickets />
          <Overlay onClick={() => setBuyTicketsOpen(false)} />
        </>
      }
      <div className={styles.centered}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 166.23"><path fill="#0099ff" fill-opacity="1" d="M0,128L48,128C96,128,192,128,288,138.7C384,149,480,171,576,165.3C672,160,768,128,864,112C960,96,1056,96,1152,90.7C1248,85,1344,75,1392,69.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path></svg>
        <div className={styles.landing}>
          <p className={styles.lotteryName}>Win prizes shared across <span className={styles.blue}>every chain</span></p>
          <p className={styles.desc}>The first cross-chain lottery with new rolling-over prizes inspired by PancakeSwap and secured with Chainlink</p>
          {isClient && isConnected ?
            <button onClick={() => setBuyTicketsOpen(true)} className={styles.buyTicketsButton}>Buy Tickets</button>
            :
            <ConnectKitButton.Custom>
              {({ isConnected, isConnecting, show, hide, address, ensName, chain }) => {
                return (
                  <button className={styles.buyTicketsButton} onClick={show}>Connect</button>
                );
              }}
            </ConnectKitButton.Custom>
          }
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 128 1440 192"><path fill="#0099ff" fill-opacity="1" d="M0,128L48,144C96,160,192,192,288,197.3C384,203,480,181,576,165.3C672,149,768,139,864,149.3C960,160,1056,192,1152,192C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
      </div>
      <div className={styles.previousRounds}>
        <PreviousRounds />
      </div>
    </>
  );
}
