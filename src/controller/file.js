'use strict'
const fs = require('fs')
const filePath = `${__dirname}/../../database.json`
const file = require(filePath)

class File {
    static addtoWatchlist(coin) {
        file.watchlist.push(coin)
        saveDB(file)
    }

    static addToLendingList(coin) {
        file.lending.push(coin)
        saveDB(file)
    }

    static rmFromWatchlist(coin) {
        const index = file.watchlist.indexOf(coin)
        if (index === -1) {
            ctx.reply(`${coin} is not in the list`)
            return
        }
        file.watchlist.splice(index, 1)
        saveDB(file)
    }

    static rmFromLendinglist(coin) {
        const index = file.lending.indexOf(coin)
        if (index === -1) {
            ctx.reply(`${coin} is not in the lending list`)
            return
        }
        file.watchlist.splice(index, 1)
        saveDB(file)
    }

    static updateDB(coinsJSON) {
        file['db'] = coinsJSON
        file['lastUpdated'] = Date.now()
        saveDB(file)
    }

    static saveLogs(newLog) {
        let logs = file.logs
        logs.push(newLog)
        while(logs.length > 10) logs = logs.slice()
        file.logs = logs
        saveDB(file)
    }
}//end of LocalDB

function saveDB(newFile) {
    fs.writeFile(filePath, JSON.stringify(newFile), (err) => {
        if (err) return console.log(err)
        console.log(`Successfully saved database.json`)
    })
}

module.exports = File