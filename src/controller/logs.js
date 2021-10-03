'use strict'
const fs = require('fs')
const filePath = `${__dirname}/../../database.json`
const file = require(filePath)

class Logs {
    static getLendingLogs() {
        let msgs = ``
        file.logs.forEach(log => {
            msgs += genLogMessage(log)
        })
        return msgs
    }
}//end of Logs

function genLogMessage(log) {
    let msg = `-------------------------------\nTime:  ${new Date(log['timestamp'])}\n`
    log['lend'].forEach(lendLog => {
        const { lendOut, coin, exist, inWallet, balance, error } = lendLog
        if(lendOut) {
            msg += `${coin} balance: ${balance}, ${lendOut}\n`
        } else {
            msg += `${coin} balance: ${balance}, ${lendOut} - ${error}, NotFound: ${exist} , Wallet: ${inWallet}\n`
        }
    })
    return msg
}

module.exports = Logs