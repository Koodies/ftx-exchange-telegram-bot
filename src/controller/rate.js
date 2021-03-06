'use strict'
require('dotenv').config()
var _ = require('lodash')
const spotMargin = require('../ftx/spotMargin')
const filePath = "../../database.json"
const database = require(filePath)

class Rate {
    /**
     * Get an array of rates of coin in desc order
     */
    static async getTop10Rates() {
        try {
            const res = await spotMargin.getRates()
            if(res.error) return
            const arrayOfRates = res.data
            let result = getTopRates(arrayOfRates, 10)
            return generateRatesMsg(result)
        } catch (error) {
            console.log(`Error: Fail to retrieve top 10 rates ${error}`)
            return `No rates found`
        }
    }

    /**
     * Get an array of rates of crypto coins exluding tokenized stocks in desc order
     */
    static async getTop10CryptoRates() {
        try {
            const res = await spotMargin.getRates()
            if(res.error) return
            const arrayOfRates = res.data
            let arrayOfCryptoRates = []
            arrayOfRates.forEach(rate => {
                let doc = _.find(database.coins.lend, o => { return o.id === rate.coin })
                if (!doc || doc['tokenizedEquity']) return
                arrayOfCryptoRates.push(rate)
            })
            let result = getTopRates(arrayOfCryptoRates, 10)
            return generateRatesMsg(result)
        } catch (error) {
            console.log(`Error: Fail to retrieve top 10 crypto rates ${error}`)
            return `No rates found`
        }
    }

    /**
     * Get an array of rates of coins under watchlist
     * @param  {Array} coins=[]
     */
    static async getRatesByWatchlist(coins = []) {
        try {
            if(coins.length === 0) throw new Error(`Watchlist is empty`)
            const res = await spotMargin.getRates()
            if(res.error) return
            const arrayOfRates = res.data
            let result = []
            coins.forEach(coin => {
                let index = arrayOfRates.findIndex(rates => rates['coin'].match(new RegExp((`^${coin.toUpperCase()}$`))))
                result.push(arrayOfRates[index])
            })
            return generateRatesMsg(result)
        } catch (error) {
            console.log(`Error: Fail to retrieve rates using watchlist ${error}`)
            return `No rates found`
        }
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

function generateRatesMsg(results = []) {
    let message = ``
    results.forEach(result => {
        if (!result) return
        let estimate = parseFloat(result.estimate * 24 * 365 * 100).toFixed(2) + "%"
        message += `[${result.coin}] Estimate: ${estimate} \n`
    })
    return message
}

module.exports = Rate