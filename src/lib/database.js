'use strict'
const fs = require('fs')
const fileName = "../../database.json"
const file = require(fileName)

class Database {
    static save(newFile) {
        fs.writeFile(fileName, JSON.stringify(newFile), function writeJSON(err) {
            if (err) return console.log(err)
            console.log(`Successfully saved database.json`)
        })
    }
}//end of database

module.exports = Database