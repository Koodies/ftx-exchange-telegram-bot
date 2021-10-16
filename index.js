'use strict'
const fs = require("fs");
const filePath = "./database.json"
const emptyDB = "./database-empty.json"
if (!fs.existsSync(filePath)) {
    let data = fs.readFileSync(emptyDB)
    fs.writeFileSync(filePath, data, { overwrite: false }, function (err) {
        if (err) throw err;
        console.log('database.json generated')
    })
}

require('dotenv').config()
const { Telegraf, session, Scenes: { BaseScene, Stage } } = require('telegraf')
const rateCtrl = require('./src/controller/rate')
const jobCtrl = require('./src/controller/cronJob')
const balanceCtrl = require('./src/controller/balance')
const logCtrl = require('./src/controller/logs')
const dbCtrl = require('./src/controller/db')
const fileCtrl = require('./src/controller/file')
const database = require(filePath)
const _ = require('lodash')

//watch list scene
const watchListScene = new BaseScene('watchListScene')
const watchHelp = `List of available commands:
/list - List of coins available on FTX
/update - Update local database
/current - Display current watchlist
/add <coin> - Add coin to your watchlist
/remove <coin> - Remove coin from your watchlist
/back - Return to main menu\n`
watchListScene.enter(ctx => ctx.reply(`Welcome to watch tower\n ${watchHelp}`))
watchListScene.help((ctx) => ctx.reply(watchHelp))
watchListScene.command('list', ctx => {
    let message = `Last updated: ${new Date(database['lastUpdated'])} \n`;
    database['db'].forEach(coin => {
        message += `[${coin.id}] - ${coin.name} \n`
    })
    ctx.reply(message)
})
watchListScene.command('update', async ctx => {
    const coins = await dbCtrl.getLendingDB()
    fileCtrl.updateDB(coins)
    ctx.reply('Updated database')
})
watchListScene.command('current', ctx => {
    let list = ``
    if (database.watchlist.length > 0) {
        database.watchlist.forEach(coin => {
            list += `${coin}\n`
        })
    } else {
        list = `Watchlist is empty, Please use\n/add <coin> to add into your watchlist`
    }
    ctx.reply(list)
})
watchListScene.command('add', ctx => {
    const value = ctx.message.text.split(" ")
    const ticker = value[1].toUpperCase()
    const message = fileCtrl.addtoWatchlist(ticker)
    ctx.reply(message)
})
watchListScene.command('remove', ctx => {
    const value = ctx.message.text.split(" ")
    const coin = value[1].toUpperCase()
    const message = fileCtrl.rmFromWatchlist(coin)
    ctx.reply(message)
})
watchListScene.command('back', ctx => { return ctx.scene.leave() })
watchListScene.leave(ctx => ctx.reply('Leaving watch tower'))

//lending scene
const lendingScene = new BaseScene('lendingScene')
const lendingHelp = `List of available commands: 
/top10 - Top 10 estimated rates for the next hour
/top10crypto - Top 10 crypto estimated rates for the next hour
/watchlist - Your watchlist estimated rates for the next hour
/add <coin> - Add coin to your lending list
/remove <coin> - Remove coin from your lending list
/list - Display lending list
/back - Return to main menu\n`
lendingScene.enter(ctx => ctx.reply(`Welcome to lending\n ${lendingHelp}`))
lendingScene.help(ctx => ctx.reply(lendingHelp))
lendingScene.command('top10', async ctx => {
    const msg = await rateCtrl.getTop10Rates()
    ctx.reply(msg)
})
lendingScene.command('top10crypto', async ctx => {
    const msg = await rateCtrl.getTop10CryptoRates()
    ctx.reply(msg)
})
lendingScene.command('watchlist', async ctx => {
    const message = await rateCtrl.getRatesByWatchlist(database.watchlist)
    ctx.reply(message)
})
lendingScene.command('add', ctx => {
    const value = ctx.message.text.split(" ")
    const coin = value[1].toUpperCase()
    const message = fileCtrl.addToLendingList(coin)
    ctx.reply(message)
})
lendingScene.command('remove', ctx => {
    const value = ctx.message.text.split(" ")
    const coin = value[1].toUpperCase()
    const message = fileCtrl.rmFromLendinglist(coin)
    ctx.reply(message)
})
lendingScene.command('list', ctx => {
    let list = ``
    if (database.lending.length > 0) {
        database.lending.forEach(coin => {
            list += `${coin}\n`
        })
    } else {
        list = `Lending list is empty, Please use\n/add <coin> to add into your lending list`
    }
    ctx.reply(list)
})
lendingScene.command('back', ctx => { return ctx.scene.leave() })
lendingScene.leave(ctx => ctx.reply('Leaving lending scene'))

//Initiate Telegram Bot
const stage = new Stage([watchListScene, lendingScene])
const bot = new Telegraf(process.env.BOT_TOKEN)
bot.use(session())
bot.use(stage.middleware())
bot.help((ctx) => getHelp(ctx))
bot.start((ctx) => getHelp(ctx))
bot.command('startlend', ctx => startLending(ctx))
bot.command('balance', async ctx => {
    let msg = await balanceCtrl.getBalance()
    ctx.reply(msg)
})
bot.command('watchlist', ctx => ctx.scene.enter('watchListScene'))
bot.command('lending', ctx => ctx.scene.enter('lendingScene'))
bot.command('whois', ctx => whois(ctx))
bot.command('stoplend', ctx => stopLending(ctx))
bot.command('displaylogs', ctx => displayLogs(ctx))
bot.launch()

async function startLending(ctx) {
    const result = await jobCtrl.startLending()
    ctx.reply(result)
}

async function stopLending(ctx) {
    const result = await jobCtrl.stopLending()
    ctx.reply(result)
}

async function displayLogs(ctx) {
    const result = logCtrl.getLendingLogs()
    ctx.reply(result)
}

function whois(ctx) {
    const value = ctx.message.text.split(" ")
    const coin = value[1]?.toUpperCase()
    let result = `Missing coin ticker symbol`
    if (coin) {
        const doc = _.find(database.db, o => { return o.id === coin })
        result = (doc) ? doc.name : `${coin} does not exist in the database, please try to update in /watchlist`
    }
    ctx.reply(`${result}`)
}

function getHelp(ctx) {
    const help = `List of commands:\n/watchlist - Enter watchlist scene\n/lending - Enter lending scene\n/balance - Check your current FTX account balance\n/whois <coin> - Check the full name of the coin\n/startlend - Start auto-compounding\n/stoplend - Stop lending\n/displaylogs - Display Lending Logs`
    ctx.reply(help)
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))