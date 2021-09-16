'use strict'
require('dotenv').config()
var _ = require('lodash')
const spotMargin = require('../ftx/spotMargin')
const filePath = "../../database.json"
const file = require(filePath)

class Rate {
    /**
     * Get an array of rates of coin in desc order
     * @param  {Integer} count
     */
    static async getAllRates(count) {
        const res = await spotMargin.getRates()
        if(res.error) return
        const arrayOfRates = res.data
        return getTopRates(arrayOfRates, count)
    }

    /**
     * Get an array of rates of crypto coins exluding tokenized stocks in desc order
     * @param  {Integer} count
     */
    static async getCryptoRates(count) {
        const res = await spotMargin.getRates()
        if(res.error) return
        const arrayOfRates = res.data
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
        const res = await spotMargin.getRates()
        if(res.error) return
        const arrayOfRates = res.data
        let result = []
        coins.forEach(coin => {
            let index = arrayOfRates.findIndex(rates => rates['coin'].match(new RegExp((`^${coin.toUpperCase()}$`))))
            result.push(arrayOfRates[index])
        })
        return result
    }
    
}//end of rate

/**
 * Order the array of lending rates by estimated rates in descending order 
 * @param  {Array} arrayOfRates     Result from getRates()
 * @param  {Integer} count
 */
function getTopRates(arrayOfRates, count = 0) {
    let arrayOfOrderedRates = _.orderBy(arrayOfRates, ['estimate'], ['desc'])
    return (count === 0) ? arrayOfOrderedRates : arrayOfOrderedRates.slice(0, count - 1)
}

module.exports = Rate