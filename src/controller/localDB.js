'use strict'
const wallet = require('../ftx/wallet')
const spotMargin = require('../ftx/spotMargin')

class LocalDB {
    static async getLendingCoinDatabase() {
        try {
            let rateRes = await spotMargin.getRates()
            let coinRes = await wallet.getCoins()
            if(rateRes.error || coinRes.error) return
            let listOfRates = rateRes.data
            let listOfCoins = coinRes.data
            let result = []
            listOfRates.forEach(rate => {
                let index = listOfCoins.findIndex(coin => coin['id'].match(rate['coin']))
                let { id, name, tokenizedEquity = false } = listOfCoins[index]
                result.push({id, name, tokenizedEquity})
            })
            return result
        } catch (error) {
            
        }
    }
}//end of LocalDB

module.exports = LocalDB