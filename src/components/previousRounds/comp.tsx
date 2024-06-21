"use client";

import styles from "./comp.module.css";
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { firstRound, lotteryContract, rewardsBreakdown, defaultChain } from "@/constants/config";

interface LotteryData {
    rewardsPerBracket: bigint[];
    countWinnersPerBracket: bigint[];
    totalAmountCollected: bigint;
    finalNumber: number;
    amountCollected: bigint;
}

export const PreviousRounds = () => {
    const [round, setRound] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const { chainId } = useAccount();

    const updateRound = (e: any) => {
        if (e.target.value > Number(currentLotteryId) - firstRound + 1) {
            setRound(Number(currentLotteryId) - firstRound + 1)

        } else if (e.target.value === "0") {
            setRound(1);
        } else {
            setRound(e.target.value);
        }
    }

    const { data: currentLotteryId, isLoading: isLoadingCurrentLotteryId } = useReadContract({
        ...lotteryContract[defaultChain.chainId],
        functionName: 'viewCurrentLotteryId',
        chainId: defaultChain.chainId
    });

    const { data: lotteryData, isLoading: isLoadingLotteryData } = useReadContract({
        ...lotteryContract[defaultChain.chainId],
        functionName: 'viewLottery',
        chainId: defaultChain.chainId,
        args: [BigInt(round ? Number(round) + firstRound - 1 : 0)]
    }) as { data: LotteryData | undefined, isLoading: boolean };

    useEffect(() => {
        if (currentLotteryId) {
            setRound(Number(currentLotteryId) - firstRound + 1);
        }
    }, [currentLotteryId]);

    const { data: _price } = useReadContract({
        ...lotteryContract[defaultChain.chainId],
        functionName: 'price',
        chainId: defaultChain.chainId
      });
      
      const price = Number(_price) / 10 ** 18;

    useEffect(() => {
        setIsLoading(isLoadingCurrentLotteryId || isLoadingLotteryData);
    }, [isLoadingCurrentLotteryId, isLoadingLotteryData]);

    const roundDate = new Date((Number(round) + firstRound) * 86400000);

    const { writeContract, error } = useWriteContract();
    const drawLottery = async (_round: bigint) => {
        await writeContract({
            ...lotteryContract[defaultChain.chainId],
            functionName: 'drawLottery',
            args: [_round + BigInt(firstRound) - BigInt(1)],
            chainId: defaultChain.chainId
        });
        if (error) console.error(error);
    }

    const renderLotteryData = () => {
        if (!lotteryData) return null;

        const {
            rewardsPerBracket = [],
            countWinnersPerBracket = [],
            totalAmountCollected = BigInt(0),
            finalNumber = 0,
            amountCollected = BigInt(0)
        } = lotteryData;

        function convertNumbers(number: number): number[] {
            const numberStr = number.toString();

            const result: number[] = [];
            for (let i = 1; i < numberStr.length; i++) {
                result.push(parseInt(numberStr[i], 10));
            }

            return result;
        }

        return (
            <div className={styles.lotteryDetails}>
                <div>
                    <div className={styles.left}>
                        <p className={styles.header}>Winning Number</p>
                        <p className={styles.desc}>{new Date() < roundDate ? "Guess the numbers!" : Number(amountCollected || 0) === 0 ? "No participants this round!" : Number(finalNumber) !== 0 ? "Are you a winner?" : "The number isn't drawn yet!" + (chainId !== defaultChain.chainId ? " Draw the number on Arbitrum." : "")}</p>
                        { chainId === defaultChain.chainId && new Date() >= roundDate && Number(amountCollected || 0) !== 0 && Number(finalNumber) === 0 && <button onClick={() => drawLottery(BigInt(round))} className={styles.drawLottery}>Draw Lottery</button>}
                    </div>
                    

                    <div className={styles.right}>
                        {(new Date() < roundDate) ?
                                ["❔", "❔", "❔", "❔", "❔", "❔"].map((number, index) => (
                                    <div className={styles.lottoWrapper} key={index}>
                                        <p className={styles.lottoNumber}>
                                            {number}
                                        </p>
                                    </div>
                                ))
                             :
                            Number(amountCollected) === 0 ?
                                ["0", "0", "0", "0", "0", "0"].map((number, index) => (
                                    <div className={styles.lottoWrapper} key={index}>
                                        <p className={styles.lottoNumber}>
                                            {number}
                                        </p>
                                    </div>
                                ))
                                :
                                Number(finalNumber) !== 0 ?
                                (convertNumbers(finalNumber).reverse()).map((number, index) => (
                                    <div className={styles.lottoWrapper} key={index}>
                                        <p className={styles.lottoNumber}>
                                            {number}
                                        </p>
                                    </div>
                                )) :
                                ["❔", "❔", "❔", "❔", "❔", "❔"].map((number, index) => (
                                    <div className={styles.lottoWrapper} key={index}>
                                        <p className={styles.lottoNumber}>
                                            {number}
                                        </p>
                                    </div>
                                ))

                        }
                    </div>
                </div>
                <div className={styles.line}></div>
                <div className={styles.expanded}>
                    <div className={styles.left}>
                        <p className={styles.header}>Prize Pot</p>
                        <p className={styles.pot}>{Number(totalAmountCollected) / 10 ** 18} ETH</p>
                        <p className={styles.desc}>{(Number(amountCollected) / 10 ** 18) / price} tickets purchased this round</p>

                    </div>
                    <div className={styles.right}>
                        <p className={styles.desc}>Match your numbers with the winning number from left to right to earn a share of the prizes.</p>
                        {rewardsPerBracket.map((reward: BigInt, index: number) => (
                            <div key={index} className={styles.rewardCard}>
                                <p>Match first {index + 1}</p>
                                <p>
                                    {Number(countWinnersPerBracket[index]) === 0
                                        ? ((Number(reward) + Number(amountCollected) * rewardsBreakdown()[index]) / 10 ** 18).toFixed(5)
                                        : (Number(reward) / 10 ** 18 * Number(countWinnersPerBracket[index])).toFixed(5)
                                    } ETH
                                </p>
                                {Number(countWinnersPerBracket[index]) !== 0 && (
                                    <p>{Number(reward) / 10 ** 18} ETH each</p>
                                )}
                                <p>{Number(countWinnersPerBracket[index])} Winner{countWinnersPerBracket[index] !== BigInt(1) && "s"}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <p className={styles.inputLabel}>Round</p>
            <input
                className={styles.roundInput}
                onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                type="number"
                min={0}
                value={round}
                onChange={(e) => updateRound(e)}
            />
            <div className={styles.drawingInfo}>
                {new Date() > roundDate ? "Drawn" : "Drawing Upcoming"} {roundDate.toLocaleDateString() + ", " + roundDate.toLocaleTimeString()}
            </div>
            <div className={styles.line}></div>
            {isLoading ? (
                <div className={styles.loading}>Loading...</div>
            ) : (
                renderLotteryData()
            )}
        </div>
    );
}
