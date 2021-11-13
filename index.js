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
const { Telegraf, session, Scenes: { Stage } } = require('telegraf')
const jobCtrl = require('./src/controller/cronJob')
const balanceCtrl = require('./src/controller/balance')
const logCtrl = require('./src/controller/logs')
const dbCtrl = require('./src/controller/db')
const fileCtrl = require('./src/controller/file')
const init = require('./src/controller/init')

updateDatabase()

const watchingScene = require('./src/scene/watch')
const lendingScene = require('./src/scene/lend')
const stakingScene = require('./src/scene/stake')

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
bot.command('init', ctx => init(ctx))
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

async function displayLogs(ctx) {
    let logs = ``
    if (jobCtrl.isLendRunning) {
        logs = `------------ Lending ------------\n`
        logs += logCtrl.getLendingLogs()
    }
    if (jobCtrl.isStakeRunning) {
        logs += `------------ Staking ------------\n`
        logs += logCtrl.getStakingLogs()
    }
    ctx.reply(logs)
}

function whois(ctx) {
    const value = ctx.message.text.split(" ")
    const ticker = value[1]?.toUpperCase()
    const name = fileCtrl.getTickerName(ticker)
    let result = (name) ? name : `${ticker} does not exist in the lending database, please try to run /update`
    ctx.reply(`${result}`)
}

function getHelp(ctx) {
    const help = `List of commands:
/watch - Enter watchlist scene
/lend - Enter lending scene
/stake - Enter staking scene
/update - Update database
/init - Initialize lending & staking list according to your current wallet balance
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