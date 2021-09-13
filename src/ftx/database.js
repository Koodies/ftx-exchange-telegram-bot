'use strict'
require('dotenv').config()
var _ = require('lodash')
const ftx = require('./authentication')

class Database {
    static async getLendingCoinDatabase() {
        let listOfRates = await getRates()
        let listOfCoins = await getCoins()
        let result = []
        listOfRates.forEach(rate => {
            let index = listOfCoins.findIndex(coin => coin['id'].match(rate['coin']))
            let { id, name, tokenizedEquity = false } = listOfCoins[index]
            result.push({id, name, tokenizedEquity})
        })
        return result
    }
}//end of Database

function getRates() {
    let timeStamp = +new Date
    let path = `spot_margin/lending_rates`
    let signature = ftx.generateSignature('GET', timeStamp, path)
    return ftx.sendReq(signature, timeStamp, path)
}

function getCoins() {
    let timeStamp = +new Date
    let path = `wallet/coins`
    let signature = ftx.generateSignature('GET', timeStamp, path)
    return ftx.sendReq(signature, timeStamp, path)
}

module.exports = Database