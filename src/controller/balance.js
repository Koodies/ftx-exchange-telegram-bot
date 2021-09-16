'use strict'
const wallet = require('../ftx/wallet')

class Balance {
    static async getBalance() {
        try {
            let arrayOfBalance = await wallet.getBalances()
            return generateBalanceSheet(arrayOfBalance)
        } catch (error) {
            return `No Balances Found`
        }
    }
}//end of Balance

function generateBalanceSheet(arrayOfBalance) {
    let message = `Balances: \n`
    let counter = 0
    arrayOfBalance.forEach(balance => {
        if(balance.total === 0) return
        counter++
        message += `[${balance.coin}] Total: ${balance.total}, Value: USD$${balance.usdValue.toFixed(2)} \n`
    })
    return (counter === 0) ? `No Balances` : message
}

module.exports = Balance