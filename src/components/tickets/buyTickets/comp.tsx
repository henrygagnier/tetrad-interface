"use client";

import styles from "./comp.module.css";
import { useAccount, useBalance, useReadContract, useWriteContract } from 'wagmi';
import { lotteryContract } from "@/constants/config";
import { useState, useEffect } from "react";
import { EditTickets } from "../editTickets/comp";

export function BuyTickets() {
    const [numberOfTickets, setNumberOfTickets] = useState<string>("");
    const [tickets, setTickets] = useState<string[][]>([[]]);
    const [editTickets, setEditTickets] = useState<boolean>(false);

    const { address } = useAccount();
    const { data: _balance } = useBalance({ address: address });
    const balance = _balance ? (Number(_balance.value) / 10 ** 18).toFixed(6) : 0;

    const { data: _price } = useReadContract({
        ...lotteryContract,
        functionName: 'price',
    });
    const price = Number(_price) / 10 ** 18;

    const updateNumberOfTickets = (e: any) => {
        if (e.target.value != undefined) {
            if (Number(e.target.value) >= 0) {
                if (Number(e.target.value) > 100) {
                    setNumberOfTickets("100");
                } else {
                    setNumberOfTickets(e ? e.target.value : "0");
                }
            }
        }
    }

    useEffect(() => {
        const result = [];
    for (let i = 0; i < Number(numberOfTickets); i++) {
        const innerArray = [];
        for (let j = 0; j < 6; j++) {
            innerArray.push(String(Math.floor(Math.random() * 10)));
        }
        result.push(innerArray);
    }
        setTickets(result);
    }, [numberOfTickets]);

    function transformTicketsToBytes32(arr: string[][]) {
        return arr.map(innerArray => {
            return Number("1" + innerArray.reverse().join(''));
        });
    }

    const { writeContract, error } = useWriteContract();
    const buyTickets = async () => {
        const data = await writeContract({
            ...lotteryContract,
            functionName: 'buyTickets',
            args: [transformTicketsToBytes32(tickets)],
            value: BigInt(price * tickets.length * 10**18)
        });
        console.error(error);
    }

    return (
        <div className={styles.wrapper}>
        { editTickets && <EditTickets setTickets={setTickets} setEditTickets={setEditTickets} numberOfTickets={Number(numberOfTickets)} tickets={tickets}/> }
        <div className={styles.pop}>
            <p className={styles.header}>Buy Tickets</p>
            <div className={styles.content}>
                <div className={styles.inputWrapper}>
                    <input className={styles.ticketInput} placeholder="0" onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()} type="number" min={0} value={numberOfTickets} onChange={(e) => updateNumberOfTickets(e)}></input>
                    <div>
                        <p className={styles.totalInputPrice}>{(price * Number(numberOfTickets)).toFixed(4)} ETH</p>
                    </div>
                </div>
                <p className={styles.totalInputPrice}>ETH Balance: {balance}</p>
                <div className={styles.line}></div>
                <div>
                    <p className={styles.label}>You pay</p>
                    <p className={styles.amount}>{(price * Number(numberOfTickets)).toFixed(4)} ETH</p>
                </div>
                <button className={styles.buyButton} onClick={() => buyTickets()}>Buy Instantly</button>
                <button className={styles.buyButton} onClick={() => setEditTickets(true)}>View/Edit Numbers</button>
                <p className={styles.disclaimer}>Results are all provably fair, using Chainlink VRF. The jackpot consistently grows, carrying rewards from previous rounds if no one won. Tickets cannot be edited after purchase.</p>
            
            </div>
        </div>
        </div>
    )
} 