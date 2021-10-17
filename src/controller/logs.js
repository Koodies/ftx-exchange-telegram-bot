'use strict'
const fs = require('fs')
const filePath = `${__dirname}/../../database.json`
const database = require(filePath)

class Logs {
    static getLendingLogs() {
        let msgs = ``
        if(database.lendLogs?.length === 0) return `No logs found`
        database.lendLogs.forEach(log => {
            msgs += genLendLogMsg(log)
        })
        return msgs
    }

    static getStakingLogs() {
        let msgs = ``
        if(database.stakeLogs?.length === 0) return `No logs found`
        database.stakeLogs.forEach(log => {
            msgs += genStakeLogMsg(log)
        })
        return msgs
    }
}//end of Logs

function genLendLogMsg(logs) {
    let msg = `-------------------------------------------\nTime: ${new Date(logs['timestamp']).toLocaleString()}\n`
    logs['lend'].forEach(log => {
        const { lendOut, coin, exist, inWallet, balance, error } = log
        if(lendOut) {
            msg += `Success - [${coin}] balance: ${balance}\n`
        } else {
            msg += `Error - [${coin}] balance: ${balance} | ${error}\n`
        }
    })
    return msg
}

function genStakeLogMsg(logs) {
    let msg = `-------------------------------------------\nTime: ${new Date(logs['timestamp']).toLocaleString()}\n`
    logs['stake'].forEach(log => {
        const { stake, coin, availableWithoutBorrow, error } = log
        if(stake) {
            msg += `Success - [${coin}] balance: ${availableWithoutBorrow}\n`
        } else {
            msg += `Error - [${coin}] | ${error}\n`
        }
    })
    return msg
}

module.exports = Logs