'use strict'
const wallet = require('../ftx/wallet')
const spotMargin = require('../ftx/spotMargin')

class DB {
    /**
     * Generate an array of FTX lending coins to store in local database
     */
    static async getLendingDB() {
        try {
            let rateRes = await spotMargin.getRates()
            let coinRes = await wallet.getCoins()
            if(rateRes.error || coinRes.error) return
            let rates = rateRes.data
            let coins = coinRes.data
            let result = []
            rates.forEach(rate => {
                let index = coins.findIndex(coin => coin['id'].match(rate['coin']))
                let { id, name, tokenizedEquity = false } = coins[index]
                result.push({id, name, tokenizedEquity})
            })
            return result
        } catch (error) {
            
        }
    }
}//end of DB

module.exports = DB