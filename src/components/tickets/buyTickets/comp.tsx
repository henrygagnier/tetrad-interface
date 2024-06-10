"use client";

import styles from "./comp.module.css";
import { useAccount, useBalance, useReadContract, useWriteContract } from 'wagmi';
import { lotteryContract, nullAddress, defaultChain } from "@/constants/config";
import { useState } from "react";
import { EditTickets } from "../editTickets/comp";
import { lotteryABI } from "@/abis/lottery";
import { ccLotteryABI } from "@/abis/ccLottery";
import { toFunctionSelector, encodeAbiParameters } from "viem";
import { useEstimateGas } from "wagmi";


export function BuyTickets() {
    const [numberOfTickets, setNumberOfTickets] = useState<string>("");
    const [tickets, setTickets] = useState<string[][]>([[]]);
    const [editTickets, setEditTickets] = useState<boolean>(false);

    const { address, chainId, isConnected } = useAccount();
    const { data: _balance } = useBalance({ address: address });
    const balance = _balance ? (Number(_balance.value) / 10 ** 18).toFixed(6) : 0;

    const { data: _price } = useReadContract({
        ...lotteryContract[defaultChain.chainId],
        functionName: 'price',
        chainId: defaultChain.chainId
    });

    const price = Number(_price || 0);

    const updateNumberOfTickets = (e: any) => {
        if (e.target.value != undefined) {
            if (Number(e.target.value) >= 0) {
                if (Number(e.target.value) > 100) {
                    setNumberOfTickets("100");
                    const result = [];
                    for (let i = 0; i < 100; i++) {
                        const innerArray = [];
                        for (let j = 0; j < 6; j++) {
                            innerArray.push(String(Math.floor(Math.random() * 10)));
                        }
                        result.push(innerArray);
                    }
                    setTickets(result);
                } else {
                    setNumberOfTickets(e ? e.target.value : "0");
                    const result = [];
                    for (let i = 0; i < Number(e.target.value); i++) {
                        const innerArray = [];
                        for (let j = 0; j < 6; j++) {
                            innerArray.push(String(Math.floor(Math.random() * 10)));
                        }
                        result.push(innerArray);
                    }
                    setTickets(result);
                }
            }
        }
    }

    const transformTicketsToBytes32 = (arr: string[][]) => {
        return arr.map(innerArray => {
            return Number("1" + innerArray.slice().reverse().join(''));
        });
    };

    const selector = toFunctionSelector(lotteryABI[0]);

    const buyTicketSelector = toFunctionSelector(ccLotteryABI[1]);

    const encodedParameters = encodeAbiParameters(
        lotteryABI[0].inputs,
        [transformTicketsToBytes32(tickets), address as `0x${string}`]
    );

    const encodedData = selector + encodedParameters.slice(2);

    const { data: estimatedGasData } = useEstimateGas({
        account: address,
        data: encodedData as `0x${string}`,
        to: lotteryContract[defaultChain.chainId].address,
        value: BigInt(price * tickets.length),
        chainId: defaultChain.chainId,
    });

    const estimatedGas = BigInt(estimatedGasData || 0);
    console.log(estimatedGas);

    const encodedParametersBuyTickets = encodeAbiParameters(
        ccLotteryABI[1].inputs,
        [transformTicketsToBytes32(tickets), BigInt(price * tickets.length), estimatedGas + BigInt(200000)]
    );

    const encodedDataBuyTickets = buyTicketSelector + encodedParametersBuyTickets.slice(2);

    const { data: estimatedGasBuyTickets } = useEstimateGas({
        account: address,
        data: encodedDataBuyTickets as `0x${string}`,
        to: lotteryContract[chainId ? chainId : 0].address,
        value: BigInt(price * tickets.length),
        chainId: chainId,
    });

    console.log(estimatedGasBuyTickets);
    console.log(encodedDataBuyTickets);

    const { data: _fee, error: _error } = useReadContract({
        ...lotteryContract[chainId || 0],
        functionName: 'estimateFeeBuyTickets',
        chainId: chainId || 0,
        args: [
            transformTicketsToBytes32(tickets),
            BigInt(price * tickets.length),
            estimatedGas + BigInt(200000)
        ],
    });

    console.log(_error);
    console.log([
        transformTicketsToBytes32(tickets),
        BigInt(price * tickets.length),
        estimatedGas + BigInt(200000)
    ])


    const { writeContract, error, isPending } = useWriteContract();
    const buyTickets = async () => {
        if ((Number(numberOfTickets) > 0 && numberOfTickets)) {
        const data = await writeContract({
            ...lotteryContract[chainId ? chainId : defaultChain.chainId],
            functionName: 'buyTicketsWithEther',
            args: chainId === defaultChain.chainId
                ? [transformTicketsToBytes32(tickets), address || nullAddress]
                : [
                    transformTicketsToBytes32(tickets),
                    BigInt(price * tickets.length),
                    estimatedGas + BigInt(200000)
                ],
            value: chainId === defaultChain.chainId
                ? BigInt(price * tickets.length)
                : BigInt(price * tickets.length + Number(_fee))
        });
        console.error(error);
    }
    }

    return (
        <div className={styles.wrapper}>
            {editTickets && <EditTickets setTickets={setTickets} setEditTickets={setEditTickets} numberOfTickets={Number(numberOfTickets)} tickets={tickets} />}
            <div className={styles.pop}>
                <p className={styles.header}>Buy Tickets</p>
                <div className={styles.content}>
                    <div className={styles.inputWrapper}>
                        <input className={styles.ticketInput} placeholder="0" onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()} type="number" min={0} value={numberOfTickets} onChange={(e) => updateNumberOfTickets(e)}></input>
                        <div>
                            <p className={styles.totalInputPrice}>{(price / 10**18 * Number(numberOfTickets)).toFixed(4)} ETH</p>
                        </div>
                    </div>
                    <p className={styles.totalInputPrice}>ETH Balance: {balance}</p>
                    <div className={styles.line}></div>
                    <div>
                        <p className={styles.label}>CCIP Fee</p>
                        <p className={styles.amount}>{(Number(_fee) / 10**18).toFixed(4)} ETH</p>
                    </div>
                    <div>
                        <p className={styles.label}>Tickets</p>
                        <p className={styles.amount}>{(price / 10**18 * Number(numberOfTickets)).toFixed(4)} ETH</p>
                    </div>
                    <div>
                        <p className={styles.label}>You pay</p>
                        <p className={styles.amount}>{(price / 10**18 * Number(numberOfTickets) + (Number(_fee) / 10**18)).toFixed(4)} ETH</p>
                    </div>

                    <button className={`${styles.buyButton} ${Number(numberOfTickets) > 0 && numberOfTickets && styles.buyButtonEnabled}`} onClick={() => buyTickets()}>{isPending ? "Purchasing..." : "Buy Instantly"}</button>
                    {Number(numberOfTickets) > 0 && numberOfTickets &&
                        <button className={styles.editButton} onClick={() => setEditTickets(true)}>Edit Numbers</button>
                    }
                    <p className={styles.disclaimer}>Results are all provably fair, using Chainlink VRF. The jackpot consistently grows, carrying rewards from previous rounds if no one won. Tickets cannot be edited after purchase.</p>

                </div>
            </div>
        </div>
    )
} 