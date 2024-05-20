"use client";

import Image from "next/image";
import styles from "./page.module.css";

import { BuyTickets } from "@/components/tickets/buyTickets/comp";
import { Overlay } from "@/components/overlay/comp";
import { useState } from "react";
import { PreviousRounds } from "@/components/previousRounds/comp";

export default function Home() {
  const [buyTicketsOpen, setBuyTicketsOpen] = useState<boolean>(false);
  return (
    <main>
      <div>
        <button onClick={() => setBuyTicketsOpen(true)}>Buy Tickets</button>
        {buyTicketsOpen &&
          <>
            <BuyTickets />
            <Overlay onClick={() => setBuyTicketsOpen(false)} />
          </>
        }
      </div>
      <div>
        <p>your tickets</p>
      </div>
      <div>
        <PreviousRounds/>
      </div>
    </main>
  );
}
