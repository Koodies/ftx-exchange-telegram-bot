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
            if(lending.running) return `Its running`
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
            if(!lending.running) return `Its not running`
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
    let arrayOfLendingResult = []
    listOfLending.forEach(async lend => {
        const balance = _.find(listOfBalances[account], coin => { return coin.coin === lend })
        const doc = _.find(listOfCoins, coin => { return coin.coin === lend })
        if (!doc || !balance || balance.availableWithoutBorrow === 0) {
            arrayOfLendingResult.push({ lendOut: false, coin: lend, exist: !!doc, inWallet: !!balance, balance: balance?.availableWithoutBorrow })
            return
        }
        let offerRes = await spotMargin.sendLendingOffer(lend, balance?.availableWithoutBorrow)
        if (offerRes.error) {
            arrayOfLendingResult.push({ lendOut: false, coin: lend, balance: balance?.availableWithoutBorrow, error: offerRes?.data })
            return
        }
        arrayOfLendingResult.push({ lendOut: true, coin: lend, balance: balance?.availableWithoutBorrow })
    })
    fileCtrl.saveLogs(arrayOfLendingResult)
    return arrayOfLendingResult
}

async function stopAllLend(data) {
    data.forEach(async coin => {
        if (coin.offered === 0) return
        let result = await spotMargin.stopLendingOffer(coin.coin)
        if (result.error) console.log(`Error on stopping lending: ${result.data}`)
    })
}

module.exports = CronJob