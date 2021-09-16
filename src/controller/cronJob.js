const _ = require('lodash')
const wallet = require('../ftx/wallet')
const spotMargin = require('../ftx/spotMargin')
const Cronjob = require('cron').CronJob;
const filePath = "../../database.json"
const file = require(filePath)
const account = (process.env.FTX_SUB) ? process.env.FTX_SUB : "main"
var lending = new Cronjob('0 55 * * * *', lendOut, null, false, 'America/Los_Angeles');

class CronJob {
    static start() {
        lendOut()
        lending.start()
        console.log('Lending Job Started')
    }

    static stop() {
        stopAllLend()
        lending.stop()
        console.log('Lending Job Stopped')
    }

}// end of CronJob

async function lendOut() {
    let coinRes = await spotMargin.getRates()
    let walletRes = await wallet.getAllBalances()

    if(walletRes.error || coinRes.error) return
    let listOfCoins = coinRes.data
    let listOfBalances = walletRes.data

    const listOfLending = file.lending
    listOfLending.forEach(async lend => {
        const balance = _.find(listOfBalances[account], coin => { return coin.coin === lend })
        const doc = _.find(listOfCoins, coin => { return coin.coin === lend })
        if(balance.availableWithoutBorrow === 0 || !doc) {
            console.log(`${coin.coin}: no funds`)
            return
        }
        let offerRes = await spotMargin.sendLendingOffer(lend, balance.availableWithoutBorrow)
        if (offerRes.error) console.log(`Error on lending: ${offerRes.data}`)
    })
}

async function stopAllLend() {
    let coinRes = await spotMargin.getLendingInfo()

    if(coinRes.error) return
    let listOfCoins = coinRes.data

    listOfCoins.forEach(async coin => {
        if(coin.offered === 0) return
        let result = await spotMargin.stopLendingOffer(coin.coin)
        if (result.error) console.log(`Error on lending: ${result.data}`)
    })
}

module.exports = CronJob