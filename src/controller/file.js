'use strict'
const fs = require('fs')
const filePath = `${__dirname}/../../database.json`
const file = require(filePath)
const _ = require('lodash')

class File {
    static addtoWatchlist(coin) {
        if(!this.doesCoinExistInFile(coin)) return `${coin} is not found in database`
        const index = file.watchlist.indexOf(coin)
        if (index !== -1) return `${coin} is already on watchlist`
        file.watchlist.push(coin)
        saveDB(file)
        return `Added ${coin} into watchlist`
    }

    static addToLendingList(coin) {
        if(!this.doesCoinExistInFile(coin)) return `${coin} is not found in database`
        const index = file.lending.indexOf(coin)
        if(index !== -1) return `${coin} is already on lending list`
        file.lending.push(coin)
        saveDB(file)
        return `Added ${coin} into lending list`
    }

    static rmFromWatchlist(coin) {
        const index = file.watchlist.indexOf(coin)
        if (index === -1) return `${coin} is not in the watchlist`
        file.watchlist.splice(index, 1)
        saveDB(file)
        return `Removed ${coin} from watchlist`
    }

    static rmFromLendinglist(coin) {
        const index = file.lending.indexOf(coin)
        if (index === -1) return `${coin} is not in the lending list`
        file.lending.splice(index, 1)
        saveDB(file)
        return `Removed ${coin} from lending list`
    }

    static updateDB(coinsJSON) {
        file['db'] = coinsJSON
        file['lastUpdated'] = Date.now()
        saveDB(file)
    }

    static saveLogs(newLog) {
        let logs = file.logs
        logs.push(newLog)
        while(logs.length > 10) logs = logs.slice(1)
        file.logs = logs
        saveDB(file)
    }

    static doesCoinExistInFile(coin) {
        const doc = _.find(file.db, o => { return o.id === coin })
        return (!!doc)
    } 
}//end of LocalDB

function saveDB(newFile) {
    fs.writeFile(filePath, JSON.stringify(newFile), (err) => {
        if (err) return console.log(err)
        console.log(`Successfully saved database.json`)
    })
}

module.exports = File