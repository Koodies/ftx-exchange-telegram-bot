const _ = require('lodash')
const wallet = require('../ftx/wallet')
const spotMargin = require('../ftx/spotMargin')
const fileCtrl = require('./file')
const Cronjob = require('cron').CronJob
const filePath = "../../database.json"
const file = require(filePath)
const account = (process.env.FTX_SUB) ? process.env.FTX_SUB : "main"
var lending = new Cronjob('0 50 * * * *', lendOut, null, false, 'America/Los_Angeles');

class CronJob {
    static async start() {
        try {
            if (lending.running) return `Its running`
            let coinRes = await spotMargin.getRates()
            let walletRes = await wallet.getAllBalances()
            if (walletRes.error || coinRes.error) throw new Error(`Error on retrieving rates & balances`)
            lendOut(coinRes.data, walletRes.data) //TODO: to add check, if got balances & return error msg on failure
            lending.start()
            return (lending.running) ? `Successfully start lending` : `Failed to start lending`
        } catch (error) {
            return `${error.message}`
        }
    }

    static async stop() {
        try {
            if (!lending.running) return `Its not running`
            lending.stop()
            let { error, data } = await spotMargin.getLendingInfo()
            if (error) throw new Error(`Error on retrieving lending information`)
            stopAllLend(data)   //TODO: to add check for failure
            return `Successfully stopped all offer(s)`
        } catch (error) {
            return `${error.message}`
        }
    }

}// end of CronJob

async function lendOut(listOfCoins, listOfBalances) {
    const listOfLending = file.lending
    let pLending = []
    listOfLending.forEach(lend => {
        pLending.push(lendPromise(listOfCoins, listOfBalances, lend))
    })
    await Promise.all(pLending).then(
        results => {
            fileCtrl.saveLogs({ lend: results, timestamp: Date.now() })
        }
    )
}

function lendPromise(listOfCoins, listOfBalances, lendCoin) {
    return new Promise(async (resolve, reject) => {
        const balance = _.find(listOfBalances[account], coin => { return coin.coin === lendCoin })
        const doc = _.find(listOfCoins, coin => { return coin.coin === lendCoin })
        if (!doc || !balance || balance.total === 0) resolve({ lendOut: false, coin: lendCoin, exist: !!doc, inWallet: !!balance, balance: balance?.total, error: 'Missing coin or balance' })
        let offerRes = await spotMargin.sendLendingOffer(lendCoin, balance?.total)
        if (offerRes.error) resolve({ lendOut: false, coin: lendCoin, exist: !!doc, inWallet: !!balance, balance: balance?.total, error: offerRes?.data })
        resolve({ lendOut: true, coin: lendCoin, exist: !!doc, inWallet: !!balance, balance: balance?.total })
    })
}

async function stopAllLend(data) {
    data.forEach(async coin => {
        if (coin.offered === 0) return
        let result = await spotMargin.stopLendingOffer(coin.coin)
        if (result.error) console.log(`Error on stopping lending: ${result.data}`)
    })
}

module.exports = CronJob