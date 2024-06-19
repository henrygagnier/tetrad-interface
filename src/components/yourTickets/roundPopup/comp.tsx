"use client"

import styles from "./comp.module.css";
import { firstRound, defaultChain, lotteryContract, nullAddress } from "@/constants/config";
import { useReadContract, useAccount, useWriteContract, useEstimateGas } from "wagmi";
import { toFunctionSelector, encodeAbiParameters } from "viem";
import { lotteryABI } from "@/abis/lottery";

interface roundPopupProps {
    round: number;
}

interface LotteryData {
    rewardsPerBracket: bigint[];
    countWinnersPerBracket: bigint[];
    totalAmountCollected: bigint;
    finalNumber: number;
    amountCollected: bigint;
}

export function RoundPopup({ round }: roundPopupProps) {
    const { address, chainId } = useAccount();

    const { writeContract, error, isPending } = useWriteContract();


    const { data: _roundDetails } = useReadContract({
        ...lotteryContract[defaultChain.chainId],
        functionName: 'viewUserInfoForLotteryId',
        args: [address as `0x${string}`, round, 0, 1000],
        chainId: defaultChain.chainId
    }) as { data: any[] };

    const { data: _finalNumber } = useReadContract({
        ...lotteryContract[defaultChain.chainId],
        functionName: 'viewLottery',
        args: [round],
        chainId: defaultChain.chainId
    }) as { data: LotteryData | undefined, isLoading: boolean };

    const {
        rewardsPerBracket = [],
        finalNumber = 0
    } = _finalNumber ? _finalNumber : {};

    function convertNumbers(number: number): number[] {
        const numberStr = number.toString();

        const result: number[] = [];
        for (let i = 1; i < numberStr.length; i++) {
            result.push(parseInt(numberStr[i], 10));
        }

        return result;
    }

    function lotteryResults(lotteryNumbers: [number[], bigint[]], winningNumber: number): { winners: [number[], number[], number[]], losers: [number[], number[]] } {
        const winningNumberStr = winningNumber.toString();
        
        const winners: [number[], number[], number[]] = [[], [], []];
        const losers: [number[], number[]] = [[], []];

        if (finalNumber === 0) {
            losers[0] = lotteryNumbers[0];
            losers[1] = lotteryNumbers[1].map((num) => Number(num));
            return { winners, losers }
        }
        
        for (let i = 0; i < lotteryNumbers[0].length; i++) {
            const numberStr = lotteryNumbers[0][i].toString();
            
            let isWinner = false;
                if (winningNumberStr.endsWith(numberStr.charAt(numberStr.length - 1))) {
                    isWinner = true;
                }
            
            if (isWinner) {
                var bracket = 0;
                for (let j = 0; j <= 6; j++) {
                    if (winningNumberStr.charAt(6 - j) === numberStr.charAt(6 - j) && bracket != 6) {
                        bracket++;
                    } else {
                        break;
                    }
                }
                winners[0].push(lotteryNumbers[0][i]);
                winners[1].push(Number(lotteryNumbers[1][i]));
                winners[2].push(bracket);
            } else {
                losers[0].push(lotteryNumbers[0][i]);
                losers[1].push(Number(lotteryNumbers[1][i]));
            }
        }
        
        return { winners, losers };
    }

    const claimed = _roundDetails ? _roundDetails[2].some((value: boolean) => value === true) : []
    const lotteryResultsWinners = _roundDetails ? lotteryResults([_roundDetails[1], _roundDetails[0]], finalNumber).winners[0] : [];
    const lotteryResultsWinnersIds = _roundDetails ? lotteryResults([_roundDetails[1], _roundDetails[0]], finalNumber).winners[1] : [];
    const lotteryResultsWinningBrackets = _roundDetails ? lotteryResults([_roundDetails[1], _roundDetails[0]], finalNumber).winners[2] : [];
    const lotteryResultsLosers = _roundDetails ? lotteryResults([_roundDetails[1], _roundDetails[0]], finalNumber).losers[0] : [];
    const lotteryResultsLosersIds = _roundDetails ? lotteryResults([_roundDetails[1], _roundDetails[0]], finalNumber).losers[1] : [];

    const totalRewards = lotteryResultsWinningBrackets.map((b: number) => rewardsPerBracket[b - 1]).reduce((accumulator, currentValue) => {
        return accumulator + Number(currentValue);
    }, 0) / 10**18;

    const selector = toFunctionSelector(lotteryABI[1]);

    // Encode parameters for the contract
    const encodedParameters = encodeAbiParameters(
        lotteryABI[1].inputs,
        [BigInt(round), lotteryResultsWinnersIds.map(num => BigInt(num)), lotteryResultsWinningBrackets.map(num => num !== 0 ? num - 1 : 0)]
    );

    const encodedData = selector + encodedParameters.slice(2);

    const { data: estimatedGasData } = useEstimateGas({
        account: address,
        data: encodedData as `0x${string}`,
        to: lotteryContract[defaultChain.chainId].address,
        value: BigInt(0),
        chainId: defaultChain.chainId,
    });

    const estimatedGas = BigInt(estimatedGasData || 0);

    const { data: _fee } = useReadContract({
        ...lotteryContract[chainId || 0],
        functionName: 'estimateFeeClaimTickets',
        chainId: chainId || 0,
        args: [
            BigInt(round), lotteryResultsWinnersIds, lotteryResultsWinningBrackets.map(num => num - 1),
            estimatedGas + BigInt(300000),
            address || nullAddress
        ],
    }) as { data: bigint };

    const claimTickets = async () => {
        await writeContract({
            ...lotteryContract[chainId || defaultChain.chainId],
            functionName: 'claimTickets',
            args: chainId === defaultChain.chainId
                ? [round, lotteryResultsWinnersIds, lotteryResultsWinningBrackets.map(num => num - 1)] as const
                : [round, lotteryResultsWinnersIds, lotteryResultsWinningBrackets.map(num => num - 1), estimatedGas + BigInt(300000), address] as const,
            value: chainId === defaultChain.chainId
                ? BigInt(0)
                : BigInt(_fee)
        });
    };

    return (
        <div className={styles.wrapper}>
            <main className={styles.pop}>
                <p className={styles.header}>Round {round - firstRound + 1}</p>
                <div className={styles.content}>
                    <p className={styles.title}>Final Number</p>
                    {Number(finalNumber) !== 0 ?
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
                        ))}
                        <div className={styles.line}></div>
                        <p className={styles.title}>Your Tickets</p>
                        <p className={styles.ticketCount}>🎫 Total Tickets: {_roundDetails ? _roundDetails[1].length : 0}</p>
                        <p className={styles.ticketCount}>🏆 Winning Tickets: {lotteryResultsWinners.length}</p>
                        <p>{}</p>
                    {_roundDetails && lotteryResultsWinners?.map((numbers: number, index: number) => {
                        return (
                            <div key={index}>
                                <p className={styles.ticketNumber}>#{lotteryResultsWinnersIds[index]}</p>
                                <div className={styles.container}>{convertNumbers(numbers).reverse().map((number, _index) => {
                                    return (<p key={_index} className={`${styles.number} ${lotteryResultsWinningBrackets[index] > _index && (_index === 0 ? (lotteryResultsWinningBrackets[index] === 1 ? styles.borderFull : styles.borderStart) : (lotteryResultsWinningBrackets[index] - 1 === _index ? styles.borderEnd : styles.border))}`}>{number}</p>)
                                })}</div>
                            </div>
                        )
                    })}
                    {_roundDetails && lotteryResultsLosers?.map((numbers: number, index: number) => {
                        return (
                            <div key={index}>
                                <p className={styles.ticketNumber}>#{lotteryResultsLosersIds[index]}</p>
                                <div className={styles.container}>{convertNumbers(numbers).reverse().map((number, _index) => {
                                    return (<p key={_index} className={styles.number}>{number}</p>)
                                })}</div>
                            </div>
                        )
                    })}
                    <div className={styles.line}></div>
                    {!claimed || lotteryResultsWinnersIds.length == 0 && <p>You get: {(chainId === defaultChain.chainId ? totalRewards : totalRewards).toFixed(6)} ETH</p>}
                    <button onClick={!claimed || lotteryResultsWinnersIds.length == 0 ? (() => claimTickets()) : () => {}} className={`${styles.buyButton} ${!claimed || lotteryResultsWinnersIds.length == 0 && styles.buyButtonEnabled}`}>{claimed ? "Claimed" : lotteryResultsWinnersIds.length == 0 ? Number(finalNumber) === 0 ? "Lottery Not Drawn" : "No Winning Tickets" : "Claim Prizes"}</button>
                </div>
            </main>
        </div>
    );
}
