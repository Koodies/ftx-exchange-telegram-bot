'use strict'
require('dotenv').config()
var _ = require('lodash')
const ftx = require('./authentication')

class Wallet {
    static async getBalances() {
        try {
            let result = []
            const timeStamp = +new Date
            const path = `wallet/balances`
            const signature = ftx.generateSignature('GET', timeStamp, path)
            let balances = await ftx.sendReq(signature, timeStamp, path)
            balances.forEach(balance => {
                if(balance.total === 0) return
                result.push(`${balance.coin}: ${balance.total} - USD$${balance.usdValue.toFixed(2)}\n`)
            })
            return result
        } catch (error) {
            //console.log(error)
        }
    }

    static getAllBalances() {
        const timeStamp = +new Date
        const path = `wallet/all_balances`
        const signature = ftx.generateSignature('GET', timeStamp, path)
        return ftx.sendReq(signature, timeStamp, path)
    }
}//end of wallet

module.exports = Wallet