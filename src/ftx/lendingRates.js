'use strict'
require('dotenv').config()
var _ = require('lodash')
const ftx = require('./authentication')
const filePath = "../../database.json"
const file = require(filePath)

class LendingRates {
    /**
     * Get an array of rates of coin in desc order
     * @param  {Integer} count
     */
    static async getAllRates(count) {
        let arrayOfRates = await getRates()
        return getTopRates(arrayOfRates, count)
    }

    /**
     * Get an array of rates of crypto coins exluding tokenized stocks in desc order
     * @param  {Integer} count
     */
    static async getCryptoRates(count) {
        let arrayOfRates = await getRates()
        let arrayOfCryptoRates = []
        arrayOfRates.forEach(rate => {
            let doc = _.find(file.db, o => { return o.id === rate.coin })
            if (!doc || doc['tokenizedEquity']) return
            arrayOfCryptoRates.push(rate)
        })
        return getTopRates(arrayOfCryptoRates, count)

    }

    /**
     * Get an array of rates of coins under watchlist
     * @param  {} coins=[]
     */
    static async getRatesByWatchlist(coins = []) {
        const arrayOfRates = await getRates()
        let result = []
        coins.forEach(coin => {
            let index = arrayOfRates.findIndex(rates => rates['coin'].match(new RegExp((`^${coin.toUpperCase()}$`))))
            result.push(arrayOfRates[index])
        })
        return result
    }
}//end of lendingRates

/**
 * Get FTX current and estimate spot margin lending rates
 */
function getRates() {
    let timeStamp = +new Date
    let path = `spot_margin/lending_rates`
    let signature = ftx.generateSignature('GET', timeStamp, path)
    return ftx.sendReq(signature, timeStamp, path)
}

/**
 * Order the array of lending rates by estimated rates in descending order 
 * @param  {Array} arrayOfRates     Result from getRates()
 * @param  {Integer} count
 */
function getTopRates(arrayOfRates, count = 0) {
    let arrayOfOrderedRates = _.orderBy(arrayOfRates, ['estimate'], ['desc'])
    return (count === 0) ? arrayOfOrderedRates : arrayOfOrderedRates.slice(0, count - 1)
}

module.exports = LendingRates