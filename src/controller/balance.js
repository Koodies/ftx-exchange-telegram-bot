'use strict'
const wallet = require('../ftx/wallet')

class Balance {
    static async getBalance() {
        try {
            let res = await wallet.getBalances()
            if(res.error) throw new Error(res.error)
            return genBalanceSheet(res.data)
        } catch (error) {
            console.log(`Error: ${error}`)
            return `No balances found`
        }
    }
}//end of Balance

function genBalanceSheet(balances) {
    let message = `Balances: \n`
    let counter = 0
    balances.forEach(balance => {
        if(balance.total === 0) return
        counter++
        message += `[${balance.coin}] Total: ${balance.total}, Value: USD$${balance.usdValue.toFixed(2)} \n`
    })
    return (counter === 0) ? `No balances found` : message
}

module.exports = Balance