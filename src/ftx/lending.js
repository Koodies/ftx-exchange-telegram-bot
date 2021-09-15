const _ = require('lodash')
const ftx = require('./authentication')
const lendingRates = require('./lendingRates')
const wallet = require('./wallet')
var Cronjob = require('cron').CronJob;
const filePath = "../../database.json"
const file = require(filePath)
const account = (process.env.FTX_SUB) ? process.env.FTX_SUB : "main"
var lending = new Cronjob('1 * * * * *', lendOut, null, false, 'America/Los_Angeles');

class LendingCron {
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

}// end of LendingCron

async function lendOut() {
    let listOfCoins = await lendingRates.getRates()
    let listOfBalances = await wallet.getAllBalances()
    const listOfLending = file.lending
    listOfLending.forEach(async lend => {
        const balance = _.find(listOfBalances[account], coin => { return coin.coin === lend })
        const doc = _.find(listOfCoins, coin => { return coin.coin === lend })
        if(balance.availableWithoutBorrow === 0 || !doc) {
            console.log(`${coin.coin}: no funds`)
            return
        }
        let result = await sendLendingOffer(lend, balance.availableWithoutBorrow)
        if (result.error) console.log(`Error on lending: ${result.data}`)
    })
}

async function stopAllLend() {
    let listOfCoins = await getLendingInfo()
    listOfCoins.forEach(async coin => {
        if(coin.offered === 0) return
        let result = await stopLendingOffer(coin.coin)
        if (result.error) console.log(`Error on lending: ${result.data}`)
    })
}

function sendLendingOffer(coin, size) {
    let timeStamp = +new Date
    let path = `spot_margin/offers`
    let data = { coin, size, rate: (1 / 365 / 24 / 100) }
    let signature = ftx.generateSignature('POST', timeStamp, path, data)
    return ftx.sendPostReq(signature, timeStamp, path, data)
}

function stopLendingOffer(coin) {
    let timeStamp = +new Date
    let path = `spot_margin/offers`
    let data = { coin, size: 0, rate: (1 / 365 / 24 / 100) }
    let signature = ftx.generateSignature('POST', timeStamp, path, data)
    return ftx.sendPostReq(signature, timeStamp, path, data)
}

function getLendingInfo() {
    let timeStamp = +new Date
    let path = `spot_margin/lending_info`
    let signature = ftx.generateSignature('GET', timeStamp, path)
    return ftx.sendReq(signature, timeStamp, path)
}

module.exports = LendingCron