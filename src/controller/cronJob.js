const _ = require('lodash')
const wallet = require('../ftx/wallet')
const spotMargin = require('../ftx/spotMargin')
const Cronjob = require('cron').CronJob;
const filePath = "../../database.json"
const file = require(filePath)
const account = (process.env.FTX_SUB) ? process.env.FTX_SUB : "main"
var lending = new Cronjob('0 50 * * * *', lendOut, null, false, 'America/Los_Angeles');

class CronJob {
    static async start() {
        try {
            let coinRes = await spotMargin.getRates()
            let walletRes = await wallet.getAllBalances()
            if (walletRes.error || coinRes.error) throw new Error(`Error on retrieving rates & balances`)
            lendOut(coinRes.data, walletRes.data) //TODO: to add check, if got balances & return error msg on failure
            lending.start()
            return `Successfully start lending`
        } catch (error) {
            return `${error.message}`
        }
    }

    static async stop() {
        try {
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
    listOfLending.forEach(async lend => {
        const balance = _.find(listOfBalances[account], coin => { return coin.coin === lend })
        const doc = _.find(listOfCoins, coin => { return coin.coin === lend })
        if (balance.availableWithoutBorrow === 0 || !doc) {
            console.log(`${lend}: no funds`)
            return
        }
        let offerRes = await spotMargin.sendLendingOffer(lend, balance.availableWithoutBorrow)
        if (offerRes.error) console.log(`Error on lending: ${offerRes.data}`)
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