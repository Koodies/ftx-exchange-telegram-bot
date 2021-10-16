const _ = require('lodash')
const wallet = require('../ftx/wallet')
const spot = require('../ftx/spotMargin')
const fileCtrl = require('./file')
const Cronjob = require('cron').CronJob
const filePath = "../../database.json"
const file = require(filePath)
const account = (process.env.FTX_SUB) ? process.env.FTX_SUB : "main"
var lendJob = new Cronjob('0 50 * * * *', lending, null, false, 'America/Los_Angeles')

class CronJob {
    static async startLending() {
        try {
            if (lending.running) return `Its running`
            lending()
            lendJob.start()
            return (lending.running) ? `Successfully start lending` : `Failed to start lending`
        } catch (error) {
            return `${error.message}`
        }
    }
    static async stopLending() {
        try {
            if (!lending.running) return `Its not running`
            lendJob.stop()
            let { error, data } = await spot.getLendingInfo()
            if (error) throw new Error(`Error on retrieving lending information`)
            stopAllLend(data)
            return `Successfully stopped all offer(s)`
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

/**
 * Generate lending requests
 * @param  {Array} rateOfCoins
 * @param  {Array} balances
 */
function genLendReqs(rateOfCoins = [], balances = []) {
    const lendingList = file.lending
    let promises = []
    lendingList.forEach(ticker => {
        const rateDoc = _.find(rateOfCoins, rate => { return rate.coin === ticker })
        const balDoc = _.find(balances[account], balance => { return balance.coin === ticker })
        promises.push(genLendReqPromise(rateDoc, balDoc, ticker))
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