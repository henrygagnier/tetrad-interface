"use client";

import styles from "./comp.module.css";
import { useReadContract, useAccount, useReadContracts } from "wagmi";
import { lotteryContract, defaultChain, firstRound } from "@/constants/config";
import { useState, useEffect } from "react";
import { RoundPopup } from "./roundPopup/comp";
import { Overlay } from "../overlay/comp";
import Image from "next/image";
import { BuyTickets } from "../tickets/buyTickets/comp";
import { ConnectKitButton } from "connectkit";

export const YourTickets = () => {
    const { address, isConnected } = useAccount();

    const [userTickets, setUserTickets] = useState<any[]>([]);
    const [rounds, setRounds] = useState<BigInt[]>([]);

    const [popup, setPopup] = useState(false);
    const [round, setRound] = useState(0);

    const [buyTicketsOpen, setBuyTicketsOpen] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

    const { data: _roundsJoined } = useReadContract({
        ...lotteryContract[defaultChain.chainId],
        functionName: 'viewRoundsJoined',
        args: [address as `0x${string}`],
        chainId: defaultChain.chainId
    });

    const roundsJoined = _roundsJoined as BigInt[];

    const { data: _userTickets } = useReadContracts({
        contracts: (roundsJoined && roundsJoined.length > 0 ? roundsJoined : []).map((id) => ({
            ...lotteryContract[defaultChain.chainId],
            functionName: 'viewUserInfoForLotteryId',
            args: [address as `0x${string}`, id, 0, 1000],
            chainId: defaultChain.chainId
        }))
    }) as { data: any[] };

    useEffect(() => {
        setRounds(roundsJoined);
        setUserTickets(_userTickets && _userTickets);
    }, [_userTickets]);

    const getRoundDate = (round: Number) => { return (new Date((Number(round) + firstRound) * 86400000)) }

    return (
        <>
        {buyTicketsOpen && (
        <>
          <BuyTickets />
          <Overlay onClick={() => setBuyTicketsOpen(false)} />
        </>
      )}
        <div className={styles.container}>
            <div className={styles.header}>Your Tickets</div>
            {userTickets && userTickets.length !== 0 ? <div className={styles.table}>
                <div className={styles.section}>
                    <p className={styles.heading}>Round</p>
                </div>
                <div className={styles.section}>
                    <p className={styles.heading}>Date</p>
                </div>
                <div className={styles.section}>
                    <p className={styles.heading}>Tickets</p>
                </div>
            </div> :
                <div className={styles.centered}>
                    <p>{!isConnected && isClient ? "Connect to see your tickets!" : "No tickets found!"}</p>
                    {isClient && isConnected ? (
            <button onClick={() => setBuyTicketsOpen(true)} className={styles.buyTicketsButton}>
              Buy Tickets
            </button>
          ) : (
            <ConnectKitButton.Custom>
              {({ show }) => (
                <button className={styles.buyTicketsButton} onClick={show}>
                  Connect
                </button>
              )}
            </ConnectKitButton.Custom>
          )}
                </div>}
            {(userTickets)?.map((round, index: number) => {
                return (<div key={index} className={styles.row} onClick={() => { setRound(Number(rounds[index])); setPopup(true) }}>
                    <div className={styles.section}>
                        {Number(rounds[index]) - firstRound + 1}
                    </div>
                    <div className={styles.section}>
                        {getRoundDate(Number(rounds[index]) - firstRound + 1).toLocaleDateString()}
                    </div>
                    <div className={styles.section}>
                        {round.result[1].length}
                    </div>
                    <div className={styles.arrow}>
                        <Image src={"chev-right.svg"} alt={"Open"} width={15} height={15} />
                    </div>
                </div>)
            })}
            {popup && <><RoundPopup round={round} /><Overlay onClick={() => setPopup(false)} /></>}
        </div>
        </>
    )
}