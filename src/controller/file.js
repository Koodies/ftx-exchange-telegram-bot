'use strict'
const fs = require('fs')
const filePath = `${__dirname}/../../database.json`
const db = require(filePath)
const _ = require('lodash')

class File {
    /**
     * Add ticker to watchlist key on database.json
     * @param  {String} ticker  Coin Ticker Symbol
     */
    static addtoWatchlist(ticker) {
        if(!doesTickerExist(ticker)) return `${ticker} is not found in database`
        const index = db.watchlist.indexOf(ticker)
        if (index !== -1) return `${ticker} is already on watchlist`
        db.watchlist.push(ticker)
        saveDB(db)
        return `Added ${ticker} into watchlist`
    }

    /**
     * Add ticker to lending key on database.json
     * @param  {String} ticker    Coin Ticker Symbol
     */
    static addToLendingList(ticker) {
        if(!doesTickerExist(ticker)) return `${ticker} is not found in database`
        const index = db.lending.indexOf(ticker)
        if(index !== -1) return `${ticker} is already on lending list`
        db.lending.push(ticker)
        saveDB(db)
        return `Added ${ticker} into lending list`
    }

    /**
     * Remove ticker from watchlist key on database.json
     * @param  {String} ticker  Coin Ticker Symbol
     */
    static rmFromWatchlist(ticker) {
        const index = db.watchlist.indexOf(ticker)
        if (index === -1) return `${ticker} is not in the watchlist`
        db.watchlist.splice(index, 1)
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
     * Update FTX coin listing
     * @param  {Array} coinDocs
     */
    static updateDB(coinDocs = []) {
        if(coinDocs.length === 0) return `Missing coin documents`
        db['db'] = coinDocs
        db['lastUpdated'] = Date.now()
        saveDB(db)
    }

    /**
     * Add lending cron job log into database.json
     * @param  {Object} log
     */
    static saveLendingLog(log) {
        let logs = db.logs
        logs.push(log)
        while(logs.length > 10) logs = logs.slice(1)
        db.logs = logs
        saveDB(db)
    }
}//end of LocalDB

/**
 * Overwrite JSON object into database path
 * @param  {Object} file
 */
function saveDB(file) {
    fs.writeFile(filePath, JSON.stringify(file), (err) => {
        if (err) return console.log(err)
        console.log(`Successfully saved database.json`)
    })
}

/**
 * Validate if ticker exist on database.json
 * @param  {String} ticker
 */
function doesTickerExist(ticker) {
    const doc = _.find(db.db, coin => { return coin.id === ticker })
    return (!!doc)
} 

module.exports = File