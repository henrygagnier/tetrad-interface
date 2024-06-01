"use client";

import Image from "next/image";
import styles from "./page.module.css";

import { BuyTickets } from "@/components/tickets/buyTickets/comp";
import { Overlay } from "@/components/overlay/comp";
import { useState } from "react";
import { PreviousRounds } from "@/components/previousRounds/comp";
import { YourTickets } from "@/components/yourTickets/comp";

export default function Home() {
  const [buyTicketsOpen, setBuyTicketsOpen] = useState<boolean>(false);
  return (
    <>
      {buyTicketsOpen &&
          <>
            <BuyTickets />
            <Overlay onClick={() => setBuyTicketsOpen(false)} />
          </>
        }
        <div className={styles.centered}>
          
      <div className={styles.landing}>
        <p className={styles.lotteryName}>Win prizes shared across <span className={styles.blue}>every chain</span></p>
        <p className={styles.desc}>The first cross-chain lottery with new rolling-over prizes inspired by PancakeSwap and secured with Chainlink</p>
        <button onClick={() => setBuyTicketsOpen(true)} className={styles.buyTicketsButton}>Buy Tickets</button>
      </div>
      </div>
      <div>
      </div>
      <div className={styles.previousRounds}>
        <PreviousRounds/>
      </div>
    </>
  );
}
