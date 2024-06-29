import styles from "./comp.module.css"

export const Info = () => {
    return(
        <div className={styles.container1}>
        <div className={styles.container}>
            <div>
            <p className={styles.header}>How To Play</p>
            <p className={styles.desc}>Learn how to play and win Tetrad Lottery.</p>
            </div>
           <div className={styles.section}>
            <p className={styles.title}>Tickets</p>
            <p className={styles.desc1}>Tickets cost <i>0.0005 ETH each</i> and can be purchased from Arbitrum One or Optimism. You can select 6 numbers from 0-9 for each ticket. 100% of your payment will be entered into the lottery prize pool.</p>
           </div>
           <div className={styles.section}>
            <p className={styles.title}>Rounds</p>
            <p className={styles.desc1}>Every 24 hours at 8:00 PM EST a new round starts. A provably fair random number is drawn by any user in Arbitrum using <i>Chainlink VRF,</i> and rewards in WETH can be claimed.</p>
           </div>
           <div className={styles.section}>
            <p className={styles.title}>Cross-chain</p>
            <p className={styles.desc1}>Users can buy tickets on Optimism, in which funds are automatically bridged to Arbitrum using <i>Chainlink CCIP.</i> Tickets can be claimed on Arbitrum if bought on Optimism, or claimed on Optimism if bought on Arbitrum.</p>
           </div>
           <div className={styles.section}>
            <p className={styles.title}>Rewards</p>
            <p className={styles.desc1}>A set percentage of the prize pot is put into each reward bracket. As the lottery grows, <i>percentages will be changed</i> to allow users to earn the greater amount of ETH.</p>
           </div>
           <div className={styles.section}>
            <p className={styles.title}>Winning</p>
            <p className={styles.desc1}>Reward brackets can be won be matching a certain number of lottery numbers from left-to-right. If someone has the ticket <i>123456</i> and the final number is <i>124456</i>, they would win a share of the prizes from the 2nd bracket, as they matched 1 and 2.</p>
           </div>
        </div>
        </div>
    )
}