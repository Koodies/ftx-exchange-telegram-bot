const _ = require('lodash')
const wallet = require('../ftx/wallet')
const spot = require('../ftx/spotMargin')
const stake = require('../ftx/staking')
const fileCtrl = require('./file')
const Cronjob = require('cron').CronJob
const filePath = "../../database.json"
const database = require(filePath)
const account = (process.env.FTX_SUB) ? process.env.FTX_SUB : "main"
var lendJob = new Cronjob('0 50 * * * *', lending, null, false, 'America/Los_Angeles')
var stakeJob = new Cronjob('0 50 * * * *', staking, null, false, 'America/Los_Angeles')

class CronJob {
    static async startLending() {
        try {
            if (lendJob.running) return `It's running`
            lending()
            lendJob.start()
            return (lendJob.running) ? `Successfully start lending` : `Failed to start lending`
        } catch (error) {
            return `${error.message}`
        }
    }

    static async startStaking() {
        try {
            if (stakeJob.running) return `Stake job is running`
            staking()
            stakeJob.start()
            return (stakeJob.running) ? `Successfully start staking` : `Failed to start staking`
        } catch (error) {
            return `${error.message}`
        }
    }

    static async stopLending() {
        try {
            if (!lendJob.running) return `Its not running`
            lendJob.stop()
            if (lendJob.running) return `Failed to stop lending job`
            let { error, data } = await spot.getLendingInfo()
            if (error) throw new Error(`Error on retrieving lending information`)
            stopAllLend(data)
            return `Successfully stopped all offer(s)`
        } catch (error) {
            return `${error.message}`
        }
    }

    static async stopStaking() {
        try {
            stakeJob.stop()
            return `Successfully stopped staking job`
        } catch (error) {
            return `${error.message}`
        }
    }
}// end of CronJob

async function lending() {
    let spotRes = await spot.getRates()
    let walletRes = await wallet.getAllBalances()
    if (walletRes.error || spotRes.error) throw new Error(`Error on retrieving rates & balances`)
    genLendReqs(spotRes.data, walletRes.data).then(
        results => {
            fileCtrl.saveLendingLog({ lend: results, timestamp: Date.now() })
        }
    )
}

async function staking() {
    let walletRes = await wallet.getAllBalances()
    if (walletRes.error) throw new Error(`Error on retrieving rates & balances`)
    const stakingList = database.staking
    const balances = walletRes.data[account]
    let wantToStake = []
    stakingList.forEach(ticker => {
        let stakeDoc = _.find(balances, balance => { return balance.coin === ticker })
        if(stakeDoc) wantToStake.push(stakeDoc)
    })
    genStakeReqs(wantToStake).then(
        results => {
            fileCtrl.saveStakingLog({ stake: results, timestamp: Date.now() })
        }
    )
}

/**
 * Generate lending requests
 * @param  {Array} rateOfCoins
 * @param  {Array} balances
 */
function genLendReqs(rateOfCoins = [], balances = []) {
    const lendingList = database.lending
    let promises = []
    lendingList.forEach(ticker => {
        const rateDoc = _.find(rateOfCoins, rate => { return rate.coin === ticker })
        const balDoc = _.find(balances[account], balance => { return balance.coin === ticker })
        promises.push(genLendReqPromise(rateDoc, balDoc, ticker))
    })
    return Promise.all(promises)
}

function genStakeReqs(balances) {
    let promises = []
    balances.forEach(balance => {
        promises.push(genStakeReqPromise(balance))
    })
    return Promise.all(promises)
}

/**
 * Generate lending request promise
 * @param  {Object} rate
 * @param  {Object} balance
 * @param  {String} coin
 */
function genLendReqPromise(rate, balance, coin) {
    return new Promise(async (resolve, reject) => {
        if (!rate || !balance || balance.total === 0) resolve({ lendOut: false, coin, exist: !!rate, inWallet: !!balance, balance: balance?.total, error: 'Missing coin or balance' })
        let offerRes = await spot.sendLendingOffer(coin, balance?.total)
        if (offerRes.error) resolve({ lendOut: false, coin, exist: !!rate, inWallet: !!balance, balance: balance?.total, error: offerRes?.data })
        resolve({ lendOut: true, coin, exist: !!rate, inWallet: !!balance, balance: balance?.total })
    })
}

function genStakeReqPromise(balance) {
    return new Promise(async (resolve, reject) => {
        const { coin, availableWithoutBorrow = 0 } = balance
        if (!coin || availableWithoutBorrow <= 0) resolve({ stake: false, coin, balance: availableWithoutBorrow, error: 'Missing coin or balance' })
        let stakeRes = await stake.sendStakeReq(coin, availableWithoutBorrow)
        if (stakeRes.error) resolve({ stake: false, coin, availableWithoutBorrow, error: stakeRes?.data })
        resolve({ stake: true, coin, availableWithoutBorrow })
    })
}

/**
 * Stop all lending using data of coins retrieved from FTX
 * @param  {Array} coins
 */
async function stopAllLend(coins) {
    coins.forEach(async coin => {
        if (coin.offered === 0) return
        let result = await spot.stopLendingOffer(coin.coin)
        if (result.error) console.log(`Error on stopping lending: ${result.data}`)
    })
}

module.exports = CronJob