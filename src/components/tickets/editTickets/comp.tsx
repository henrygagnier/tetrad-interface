"use client";

import styles from "./comp.module.css";
import { useAccount, useBalance, useReadContract, useWriteContract } from 'wagmi';
import { lotteryContract } from "@/constants/config";
import { useState, useEffect, useRef } from "react";
import { TicketInput } from "../ticketInput/comp";


interface EditTicketsProps {
    setEditTickets: React.Dispatch<React.SetStateAction<boolean>>;
    setTickets: React.Dispatch<React.SetStateAction<string[][]>>;
    numberOfTickets: number;
    tickets: string[][];
}

export function EditTickets({ setEditTickets, numberOfTickets, tickets, setTickets }: EditTicketsProps) {


    const { address } = useAccount();
    const { data: _balance } = useBalance({ address: address });
    const balance = _balance ? (Number(_balance.value) / 10 ** 18).toFixed(6) : 0;

    const { data: _price } = useReadContract({
        ...lotteryContract,
        functionName: 'price',
    });
    const price = Number(_price) / 10 ** 18;

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
            value: BigInt(price * tickets.length * 10 ** 18)
        });
        console.log(data);
        console.error(error);
    }

    const handleChange = (inputIndex: number, valueIndex: number, value: string) => {
        const newInputs = tickets.map((input, idx) =>
            idx === inputIndex ? input.map((val, i) => (i === valueIndex ? value : val)) : input
        );
        console.log(newInputs);
        setTickets(newInputs);
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.pop}>
                <p className={styles.header}>Edit Tickets</p>
                <div className={styles.content}>
                    <div>
                        <p className={styles.label}>You pay</p>
                        <p className={styles.amount}>{(price * Number(numberOfTickets)).toFixed(4)} ETH</p>
                    </div>
                    <div className={styles.line}></div>
                    {tickets.map((values, index) => (
                        <>
                            <p className={styles.ticketNumber}>#{index + 1}</p>
                            <TicketInput
                                key={index}
                                values={values}
                                onChange={(valueIndex, value) => handleChange(index, valueIndex, value)}
                            />
                        </>
                    ))}
                    <button className={styles.buyButton} onClick={() => buyTickets()}>Buy Tickets</button>
                    <button className={styles.buyButton} onClick={() => setEditTickets(false)}>Go Back</button>
                    <p className={styles.disclaimer}>Results are all provably fair, using Chainlink VRF. The jackpot consistently grows, carrying rewards from previous rounds if no one won. Tickets cannot be edited after purchase.</p>
                </div>
            </div>
        </div>
    )
} 