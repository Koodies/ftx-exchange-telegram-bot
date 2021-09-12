'use strict'
require('dotenv').config()
const { Telegraf, session, Scenes: { BaseScene, Stage }, Markup } = require('telegraf')
const lending = require('./src/ftx/lendingRates')
const wallet = require('./src/ftx/wallet')
const database = require('./src/lib/database')
const fileName = "./database.json"
const file = require(fileName)

//watch list scene
const watchListScene = new BaseScene('watchListScene')
const watchHelp = `List of available commands: 
/list - List of coins available on FTX
/current - Display watch list
/add <coin> - Top 10 estimated rates for the next hour
/remove <coin> - Your watchlist estimated rates for the next hour
/return - Return to main menu`
watchListScene.enter(ctx => ctx.reply(`welcome to watch tower\n ${watchHelp}`))
watchListScene.help((ctx) => ctx.reply(watchHelp))
watchListScene.command('list', ctx => {

})
watchListScene.command('update', ctx => {
    ctx.reply('Updated')
})
watchListScene.command('current', ctx => {
    let list = ``
    file.watchlist.forEach(coin =>{
        list += `${coin}\n`
    })
    ctx.reply(list)
})
watchListScene.command('add', ctx => {
    let value = ctx.message.text.split(" ")
    let coin = value[1].toUpperCase()
    file.watchlist.push(coin)
    database.save(file)
    ctx.reply(`Added ${coin}`)
})
watchListScene.command('remove', ctx => {
    let value = ctx.message.text.split(" ")
    let coin = value[1].toUpperCase()
    const index = file.watchlist.indexOf(coin)
    if (index === -1) {
        ctx.reply(`${coin} is not in the list`)
        return
    }
    file.watchlist.splice(index, 1)
    database.save(file)
    ctx.reply(`Removed ${coin}`)
})
watchListScene.command('return', ctx => { return ctx.scene.leave() })
watchListScene.leave(ctx => ctx.reply('Out from watchlist changes'))

//lending scene
const lendingScene = new BaseScene('lendingScene')
const lendingHelp = `List of available commands: 
/top10 - Top 10 estimated rates for the next hour
/top10crypto - Top 10 crypto estimated rates for the next hour
/watchlist - Your watchlist estimated rates for the next hour
/return - Return to main menu\n`
lendingScene.enter(ctx => ctx.reply(`Welcome to lending\n ${lendingHelp}`))
lendingScene.help(ctx => ctx.reply(lendingHelp))
lendingScene.command('top10', ctx => {
    getTop10Rates(ctx)
})
lendingScene.command('watchlist', ctx => {
    getWatchListRates(ctx)
})
lendingScene.command('start', ctx => {

})
lendingScene.command('return', ctx => { return ctx.scene.leave() })
lendingScene.leave(ctx => ctx.reply('Out from lending scene'))

//Initiate Telegram Bot
const stage = new Stage([watchListScene, lendingScene])
const bot = new Telegraf(process.env.BOT_TOKEN)
bot.use(session())
bot.use(stage.middleware())
bot.start((ctx) => startLending(ctx))
bot.help((ctx) => getHelp(ctx))
bot.hears('start', ctx => startLending(ctx))
bot.command('balance', ctx => getBalance(ctx))
bot.command('watchlist', ctx => ctx.scene.enter('watchListScene'))
bot.command('lending', ctx => ctx.scene.enter('lendingScene'))
bot.hears('stop', ctx => stopLending(ctx))
bot.launch()

function startLending(ctx) {
    ctx.reply('Starting to lend')
}

function stopLending(ctx) {
    ctx.reply('Stopping lending')
}

async function getBalance(ctx) {
    let balance = await wallet.getBalances()
    ctx.reply(`Balance: \n${balance}`)
}

function getHelp(ctx) {
    const help = `List of commands: 
    /watchlist
    /lending`
    ctx.reply(help)
}

async function getWatchListRates(ctx) {
    try {
        const results = await lending.getRatesByWatchlist(file.watchlist)
        const message = generateRatesMsg(results)
        ctx.reply(message)
    } catch (error) {
        console.log(`Error: ${error}`)
    }
}

async function getTop10Rates(ctx) {
    try {
        const results = await lending.getRatesByCount(10)
        const message = generateRatesMsg(results)
        ctx.reply(message)
    } catch (error) {
        console.log(`Error: ${error}`)
    }
}

function generateRatesMsg(results = []) {
    let message = ``
    results.forEach(result => {
        if (!result) return;
        let estimate = parseFloat(result.estimate * 24 * 365 * 100).toFixed(2) + "%"
        message += `[${result.coin}] Estimate: ${estimate} \n`
    })
    return message
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))