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

updateDatabase()

//Watchlist scene
const watchingScene = new BaseScene('watchingScene')
const watchHelp = `List of available commands:
/list - List of coins available on FTX
/show - Display current watchlist
/add <coin> - Add coin to your watchlist
/remove <coin> - Remove coin from your watchlist
/back - Return to main menu\n`
watchingScene.enter(ctx => ctx.reply(`Welcome to watch tower\n ${watchHelp}`))
watchingScene.help((ctx) => ctx.reply(watchHelp))
watchingScene.command('list', ctx => {
    const msg = displayCoinList()
    ctx.reply(msg)
})
watchingScene.command('show', ctx => {
    let list = ``
    if (database.watching.length > 0) {
        database.watching.forEach(coin => {
            list += `${coin}\n`
        })
    } else {
        list = `Watchlist is empty, Please use\n/add <coin> to add into your watchlist`
    }
    ctx.reply(list)
})
watchingScene.command('add', ctx => {
    const ticker = getTicker(ctx.message.text)
    const message = fileCtrl.addtoWatchlist(ticker)
    ctx.reply(message)
})
watchingScene.command('remove', ctx => {
    const ticker = getTicker(ctx.message.text)
    const message = fileCtrl.rmFromWatchlist(ticker)
    ctx.reply(message)
})
watchingScene.command('back', ctx => { return ctx.scene.leave() })
watchingScene.leave()

//Lending scene
const lendingScene = new BaseScene('lendingScene')
const lendingHelp = `List of available commands: 
/list - List of coins available for lending on FTX
/top10 - Top 10 estimated rates for the next hour
/top10crypto - Top 10 crypto estimated rates for the next hour
/watchlist - Your watchlist estimated rates for the next hour
/add <coin> - Add coin to your lending list
/remove <coin> - Remove coin from your lending list
/show - Display current lending list
/back - Return to main menu\n`
lendingScene.enter(ctx => ctx.reply(`Welcome to lending\n ${lendingHelp}`))
lendingScene.help(ctx => ctx.reply(lendingHelp))
lendingScene.command('list', ctx => {
    const msg = displayCoinList()
    ctx.reply(msg)
})
lendingScene.command('top10', async ctx => {
    const msg = await rateCtrl.getTop10Rates()
    ctx.reply(msg)
})
lendingScene.command('top10crypto', async ctx => {
    const msg = await rateCtrl.getTop10CryptoRates()
    ctx.reply(msg)
})
lendingScene.command('watchlist', async ctx => {
    const msg = await rateCtrl.getRatesByWatchlist(database.watching)
    ctx.reply(msg)
})
lendingScene.command('add', ctx => {
    const ticker = getTicker(ctx.message.text)
    const msg = fileCtrl.addToLendingList(ticker)
    ctx.reply(msg)
})
lendingScene.command('remove', ctx => {
    const ticker = getTicker(ctx.message.text)
    const msg = fileCtrl.rmFromLendinglist(ticker)
    ctx.reply(msg)
})
lendingScene.command('show', ctx => {
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
lendingScene.leave()

//Staking Scene

const stakingScene = new BaseScene('stakingScene')
const stakingHelp = `List of available commands:
/list - List of coins available for staking on FTX
/add <coin> - Add coin to your lending list
/remove <coin> - Remove coin from your lending list
/show - Display current staking list
/back - Return to main menu\n`
stakingScene.enter(ctx => ctx.reply(`Welcome to staking\n ${stakingHelp}`))
stakingScene.help(ctx => ctx.reply(stakingHelp))
stakingScene.command('list', ctx => {
    const msg = displayStakeList()
    ctx.reply(msg)
})
stakingScene.command('add', ctx => {
    const ticker = getTicker(ctx.message.text)
    const msg = fileCtrl.addToStakingList(ticker)
    ctx.reply(msg)
})
stakingScene.command('remove', ctx => {
    const ticker = getTicker(ctx.message.text)
    const msg = fileCtrl.rmFromStakingList(ticker)
    ctx.reply(msg)
})
stakingScene.command('show', ctx => {
    let list = ``
    if (database.staking.length > 0) {
        database.staking.forEach(coin => {
            list += `${coin}\n`
        })
    } else {
        list = `Staking list is empty, Please use\n/add <coin> to add into your staking list`
    }
    ctx.reply(list)
})
stakingScene.command('back', ctx => { return ctx.scene.leave() })
stakingScene.leave()

//Initiate Telegram Bot
const stage = new Stage([watchingScene, lendingScene, stakingScene])
const bot = new Telegraf(process.env.BOT_TOKEN)
bot.use(session())
bot.use(stage.middleware())
bot.help((ctx) => getHelp(ctx))
bot.start((ctx) => getHelp(ctx))
bot.command('startlend', ctx => startLending(ctx))
bot.command('startstake', ctx => startStaking(ctx))
bot.command('balance', async ctx => {
    let msg = await balanceCtrl.getBalance()
    ctx.reply(msg)
})
bot.command('update', async ctx => {
    ctx.reply('Updating database')
    await updateDatabase()
    ctx.reply('Updated database')
})
bot.command('watch', ctx => ctx.scene.enter('watchingScene'))
bot.command('lend', ctx => ctx.scene.enter('lendingScene'))
bot.command('stake', ctx => ctx.scene.enter('stakingScene'))
bot.command('whois', ctx => whois(ctx))
bot.command('stoplend', ctx => stopLending(ctx))
bot.command('stopstake', ctx => stopStaking(ctx))
bot.command('displaylogs', ctx => displayLogs(ctx))
bot.launch()

async function startLending(ctx) {
    const result = await jobCtrl.startLending()
    ctx.reply(result)
}

async function startStaking(ctx) {
    const result = await jobCtrl.startStaking()
    ctx.reply(result)
}

async function stopLending(ctx) {
    const result = await jobCtrl.stopLending()
    ctx.reply(result)
}

async function stopStaking(ctx) {
    const result = await jobCtrl.stopStaking()
    ctx.reply(result)
}

async function updateDatabase() {
    const stake = dbCtrl.getStakingDB()
    const lend = dbCtrl.getLendingDB()
    await Promise.all([lend, stake]).then(
        results => {
            fileCtrl.updateDB(results[0], results[1])
        }
    ).catch(
        error => {
            console.log(error)
        }
    )
}

function displayCoinList() {
    let list = `Last updated: ${new Date(database['coins']['lastUpdated']).toLocaleString()} \n`;
    database['coins']['lend'].forEach(coin => {
        list += `[${coin.id}] - ${coin.name} \n`
    })
    return list
}

function displayStakeList() {
    let list = `Last updated: ${new Date(database['coins']['lastUpdated']).toLocaleString()} \n`;
    database['coins']['stake'].forEach(coin => {
        list += `${coin} \n`
    })
    return list
}

async function displayLogs(ctx) {
    let result = `------------ Lending ------------\n`
    result += logCtrl.getLendingLogs()
    result += `------------ Staking ------------\n`
    result += logCtrl.getStakingLogs()
    ctx.reply(result)
}

function getTicker(text) {
    const value = text.split(" ")
    return value[1]?.toUpperCase()
}

function whois(ctx) {
    const value = ctx.message.text.split(" ")
    const ticker = value[1]?.toUpperCase()
    let result = `Missing coin ticker`
    if (ticker) {
        const doc = _.find(database.coins["lend"], coin => { return coin.id === ticker })
        result = (doc) ? doc.name : `${ticker} does not exist in the database, please try to update in /watchlist`
    }
    ctx.reply(`${result}`)
}

function getHelp(ctx) {
    const help = `List of commands:
/watch - Enter watchlist scene
/lend - Enter lending scene
/stake - Enter staking scene
/update - Update database
/balance - Check your current FTX account balance
/whois <coin> - Check the full name of the coin
/startlend - Start lending auto-compounding
/startstake - Start staking auto-compounding
/stoplend - Stop lending job & remove all lending offer
/stopstake - Stop staking job
/displaylogs - Display Lending Logs`
    ctx.reply(help)
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))