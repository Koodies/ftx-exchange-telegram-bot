'use strict'
const fs = require('fs')
const filePath = `${__dirname}/../../database.json`
const db = require(filePath)
const _ = require('lodash')

class File {
    static displayCoinList() {
        let list = `Last updated: ${new Date(db['coins']['lastUpdated']).toLocaleString()} \n`;
        db['coins']['lend'].forEach(coin => {
            list += `[${coin.id}] - ${coin.name} \n`
        })
        return list
    }

    static displayStakeList() {
        let list = `Last updated: ${new Date(db['coins']['lastUpdated']).toLocaleString()} \n`;
        db['coins']['stake'].forEach(coin => {
            list += `${coin} \n`
        })
        return list
    }

    static getWatchList() {
        return db.watching
    }

    static getLendList() {
        return db.lending
    }

    static getStakeList() {
        return db.staking
    }

    static getTickerName(ticker) {
        const doc = _.find(db.coins["lend"], coin => { return coin.id === ticker })
        return doc?.name
    }

    /**
     * Add ticker to watchlist key on database.json
     * @param  {String} ticker  Coin Ticker Symbol
     */
    static addtoWatchlist(ticker) {
        if (!doesTickerExist(ticker)) return `${ticker} is not found in database`
        const index = db.watching.indexOf(ticker)
        if (index !== -1) return `${ticker} is already on watchlist`
        db.watching.push(ticker)
        saveDB(db)
        return `Added ${ticker} into watchlist`
    }

    /**
     * Add ticker to lending key on database.json
     * @param  {String} ticker    Coin Ticker Symbol
     */
    static addToLendingList(ticker) {
        if (!doesTickerExist(ticker)) return `${ticker} is not found in database`
        const index = db.lending.indexOf(ticker)
        if (index !== -1) return `${ticker} is already on lending list`
        db.lending.push(ticker)
        saveDB(db)
        return `Added ${ticker} into lending list`
    }

    /**
 * Add ticker to lending key on database.json
 * @param  {String} ticker    Coin Ticker Symbol
 */
    static addToStakingList(ticker) {
        if (!doesStakeExist(ticker)) return `${ticker} is not found in database`
        const index = db.staking.indexOf(ticker)
        if (index !== -1) return `${ticker} is already on lending list`
        db.staking.push(ticker)
        saveDB(db)
        return `Added ${ticker} into staking list`
    }

    /**
     * Remove ticker from watchlist key on database.json
     * @param  {String} ticker  Coin Ticker Symbol
     */
    static rmFromWatchlist(ticker) {
        const index = db.watching.indexOf(ticker)
        if (index === -1) return `${ticker} is not in the watchlist`
        db.watching.splice(index, 1)
        saveDB(db)
        return `Removed ${ticker} from watchlist`
    }

    /**
     * Remove ticker from lending key on database.json
     * @param  {String} ticker  Coin Ticker Symbol
     */
    static rmFromLendinglist(ticker) {
        const index = db.lending.indexOf(ticker)
        if (index === -1) return `${ticker} is not in the lending list`
        db.lending.splice(index, 1)
        saveDB(db)
        return `Removed ${ticker} from lending list`
    }

    /**
     * Remove ticker from staking key on database.json
     * @param  {String} ticker  Coin Ticker Symbol
     */
    static rmFromStakingList(ticker) {
        const index = db.staking.indexOf(ticker)
        if (index === -1) return `${ticker} is not in the staking list`
        db.staking.splice(index, 1)
        saveDB(db)
        return `Removed ${ticker} from staking list`
    }

    /**
     * @param  {Array} lendDocs=[]
     * @param  {Array} stakeDocs=[]
     */
    static updateDB(lendDocs = [], stakeDocs = []) {
        db.coins['lend'] = lendDocs
        db.coins['stake'] = stakeDocs
        db.coins['lastUpdated'] = Date.now()
        saveDB(db)
    }

    /**
     * Add lending cron job log into database.json
     * @param  {Object} log
     */
    static saveLendingLog(log) {
        let logs = db.lendLogs
        logs.push(log)
        while (logs.length > 5) logs = logs.slice(1)
        db.lendLogs = logs
        saveDB(db)
    }

    /**
     * Add staking cron job log into database.json
     * @param  {Object} log
     */
    static saveStakingLog(log) {
        let logs = db.stakeLogs
        logs.push(log)
        while (logs.length > 5) logs = logs.slice(1)
        db.stakeLogs = logs
        saveDB(db)
    }
}//end of File

/**
 * Overwrite JSON object into database path
 * @param  {Object} file
 */
function saveDB(file) {
    fs.writeFile(filePath, JSON.stringify(file), (err) => {
        if (err) return console.log(err)
    })
}

/**
 * Validate if lending ticker exist on database.json
 * @param  {String} ticker
 */
function doesTickerExist(ticker) {
    const coins = db.coins.lend
    const doc = _.find(coins, coin => { return coin.id === ticker })
    return (!!doc)
}

/**
 * Validate if stake ticker exist on database.json
 * @param  {String} ticker
 */
function doesStakeExist(ticker) {
    const coins = db.coins.stake
    return coins.includes(ticker)
}

module.exports = File