'use strict'
require('dotenv').config()
var _ = require('lodash')
const ftx = require('./authentication')

class LendingRates {
    static async getRatesByCount(count) {
        let listOfRates = await getRates()
        listOfRates = _.orderBy(listOfRates, ['estimate'],['desc'])
        return listOfRates.slice(0, count-1)
    }

    static async getRatesByWatchlist(coins = []) {
        const listOfRates = await getRates()
        let result = []
        coins.forEach(coin => {
            let index = listOfRates.findIndex(rates => rates['coin'].match(new RegExp((`^${coin.toUpperCase()}$`))))
            result.push(listOfRates[index])
        })
        return result
    }

    static async getLendingDatabase() {
        let listOfRates = await getRates()
        console.log(listOfRates)
        return 
    }
}//end of lendingRates

function getRates() {
    let timeStamp = +new Date
    let path = `spot_margin/lending_rates`
    let signature = ftx.generateSignature('GET', timeStamp, path)
    return ftx.sendReq(signature, timeStamp, path)
}

module.exports = LendingRates