'use strict'
const ftx = require('./authentication')

class Wallet {
    /**
     * Get account balance
     */
    static async getBalances() {
        const timeStamp = +new Date
        const path = `wallet/balances`
        const signature = ftx.generateSignature('GET', timeStamp, path)
        return ftx.sendReq(signature, timeStamp, path)
    }

    /**
     * Get all account balances
     */
    static getAllBalances() {
        const timeStamp = +new Date
        const path = `wallet/all_balances`
        const signature = ftx.generateSignature('GET', timeStamp, path)
        return ftx.sendReq(signature, timeStamp, path)
    }

    /**
     * Get an array of supported coins in FTX wallet
     */
    static getCoins() {
        let timeStamp = +new Date
        let path = `wallet/coins`
        let signature = ftx.generateSignature('GET', timeStamp, path)
        return ftx.sendReq(signature, timeStamp, path)
    }
}//end of wallet

module.exports = Wallet