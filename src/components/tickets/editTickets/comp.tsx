"use client";

import styles from "./comp.module.css";
import { useAccount, useBalance, useWriteContract, useEstimateGas, useReadContract } from 'wagmi';
import { encodeAbiParameters, toFunctionSelector } from "viem";
import { lotteryABI } from "@/abis/lottery";
import { lotteryContract, nullAddress, defaultChain } from "@/constants/config";
import { TicketInput } from "../ticketInput/comp";

interface EditTicketsProps {
    setEditTickets: React.Dispatch<React.SetStateAction<boolean>>;
    setTickets: React.Dispatch<React.SetStateAction<string[][]>>;
    numberOfTickets: number;
    tickets: string[][];
}

export function EditTickets({ setEditTickets, numberOfTickets, tickets, setTickets }: EditTicketsProps) {
    const { data: _price } = useReadContract({
        ...lotteryContract[defaultChain.chainId],
        functionName: 'price',
        chainId: defaultChain.chainId,
    });

    const price = Number(_price || 0);
    const { address, chainId } = useAccount();
    const { data: _balance } = useBalance({ address });
    const balance = _balance ? (Number(_balance.value) / 10 ** 18).toFixed(6) : 0;

    // Function to transform tickets into the required format for the blockchain
    const transformTicketsToBytes32 = (arr: string[][]) => {
        return arr.map(innerArray => {
            return Number("1" + innerArray.slice().reverse().join(''));
        });
    };

    console.log(transformTicketsToBytes32(tickets))

    const selector = toFunctionSelector(lotteryABI[0]);

    // Encode parameters for the contract
    const encodedParameters = encodeAbiParameters(
        lotteryABI[0].inputs,
        [transformTicketsToBytes32(tickets), address as `0x${string}`]
    );

    const encodedData = selector + encodedParameters.slice(2);

    // Estimate gas required
    const { data: estimatedGasData } = useEstimateGas({
        account: address,
        data: encodedData as `0x${string}`,
        to: lotteryContract[defaultChain.chainId].address,
        value: BigInt(price * tickets.length),
        chainId: defaultChain.chainId,
    });

    const estimatedGas = BigInt(estimatedGasData || 0);

    // Estimate fee for buying tickets
    const { data: _fee } = useReadContract({
        ...lotteryContract[chainId || 0],
        functionName: 'estimateFeeBuyTickets',
        chainId: chainId || 0,
        args: [
            transformTicketsToBytes32(tickets),
            BigInt(price * tickets.length),
            estimatedGas + BigInt(200000),
            address || nullAddress
        ],
    });

    const { writeContract, error, isPending } = useWriteContract();

    const buyTickets = async () => {
        if (Number(numberOfTickets) > 0 && numberOfTickets) {
        await writeContract({
            ...lotteryContract[chainId || defaultChain.chainId],
            functionName: 'buyTicketsWithEther',
            args: chainId === defaultChain.chainId
                ? [transformTicketsToBytes32(tickets), address || nullAddress]
                : [
                    transformTicketsToBytes32(tickets),
                    BigInt(price * tickets.length),
                    estimatedGas + BigInt(200000),
                    address || nullAddress
                ],
            value: chainId === defaultChain.chainId
                ? BigInt(price * tickets.length)
                : BigInt(price * tickets.length + Number(_fee))
        });
        if (error) {
            console.error(error);
        }
    }
    };

    const handleChange = (inputIndex: number, valueIndex: number, value: string) => {
        const newInputs = tickets.map((input, idx) =>
            idx === inputIndex ? input.map((val, i) => (i === valueIndex ? value : val)) : input
        );
        setTickets(newInputs);
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.pop}>
                <p className={styles.header}>Edit Tickets</p>
                <div className={styles.content}>
                { chainId != defaultChain.chainId && <><div>
                        <p className={styles.label}>CCIP Fee</p>
                        <p className={styles.amount}>{(Number(_fee) / 10**18).toFixed(4)} ETH</p>
                    </div>
                    <div>
                        <p className={styles.label}>Tickets</p>
                        <p className={styles.amount}>{(price / 10**18 * Number(numberOfTickets)).toFixed(4)} ETH</p>
                    </div></>}
                    <div>
                        <p className={styles.label}>You pay</p>
                        <p className={styles.amount}>{(price / 10**18 * Number(numberOfTickets) + (chainId != defaultChain.chainId ? (Number(_fee) / 10**18) : 0)).toFixed(4)} ETH</p>
                    </div>
                    <div className={styles.line}></div>
                    {tickets.map((values, index) => (
                        <div key={index}>
                            <p className={styles.ticketNumber}>#{index + 1}</p>
                            <TicketInput
                                values={values}
                                onChange={(valueIndex, value) => handleChange(index, valueIndex, value)}
                            />
                        </div>
                    ))}
                    <button className={styles.buyButton} onClick={buyTickets}>{isPending ? "Purchasing..." : "Buy Tickets"}</button>
                    <button className={styles.editButton} onClick={() => setEditTickets(false)}>Go Back</button>
                    <p className={styles.disclaimer}>
                        Results are all provably fair, using Chainlink VRF. The jackpot consistently grows, carrying rewards from previous rounds if no one won. Tickets cannot be edited after purchase.
                    </p>
                </div>
            </div>
        </div>
    );
}
