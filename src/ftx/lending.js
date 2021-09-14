const _ = require('lodash')
const ftx = require('./authentication')
var Cronjob = require('cron').CronJob;
var lending = new Cronjob('1 * * * * *', lendOut, null, false, 'America/Los_Angeles');

class LendingCron {
    static start(){
        lending.start()
        console.log('Lending Job Started')
    }

    static stop() {
        stopLend()
        lending.stop()
        console.log('Lending Job Stopped')
    }

}// end of LendingCron

async function lendOut() {
    let listOfCoins = await getLendingInfo()
    const doc = _.find(listOfCoins, coin => { return coin.coin === "USD"})
    let result = await sendLendingOffer(doc.coin, doc.lendable, doc.minRate)
    console.log(result)
    if(result.error) console.log(`Error on lending: ${result.data}`)
}

async function stopLend() {
    let listOfCoins = await getLendingInfo()
    const doc = _.find(listOfCoins, coin => { return coin.coin === "USD"})
    let result = await stopLendingOffer(doc.coin, doc.minRate)
    console.log(result)
    if(result.error) console.log(`Error on lending: ${result.data}`)
}

function sendLendingOffer(coin, size, rate) {
    let timeStamp = +new Date
    let path = `spot_margin/offers`
    let data = { coin, size:1, rate: 1 }
    console.log(data)
    let signature = ftx.generateSignature('POST', timeStamp, path, data)
    return ftx.sendPostReq(signature, timeStamp, path, data)
}

function stopLendingOffer(coin, rate) {
    let timeStamp = +new Date
    let path = `spot_margin/offers`
    let data = { coin, size: 0, rate: 1 }
    console.log(data)
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