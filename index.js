'use strict'
require('dotenv').config()
const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)
bot.start((ctx) => startLending(ctx))
bot.help((ctx) => getHelp(ctx))
bot.hears('start',(ctx) => startLending(ctx))
bot.hears('balance',(ctx) => getBalance(ctx))
bot.hears('stop',(ctx) => stopLending(ctx))
bot.launch()

function startLending(ctx) {
    ctx.reply('Starting to lend')
}

function stopLending(ctx) {
    ctx.reply('Stopping lending')
}

function getHelp(ctx) {
    ctx.reply('Sending help')
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))