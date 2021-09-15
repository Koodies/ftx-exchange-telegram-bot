'use strict'
require('dotenv').config()
var _ = require('lodash')
const ftx = require('./authentication')

class Wallet {
    static async getBalances() {
        try {
            const timeStamp = +new Date
            const path = `wallet/balances`
            const signature = ftx.generateSignature('GET', timeStamp, path)
            return await ftx.sendReq(signature, timeStamp, path)
        } catch (error) {
            return []
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