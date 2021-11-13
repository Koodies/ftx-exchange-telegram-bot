//Lending scene
const { Scenes: { BaseScene } } = require('telegraf')
const fileCtrl = require('../controller/file')
const rateCtrl = require('../controller/rate')

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
    const lendList = fileCtrl.getLendList()
    if (lendList.length > 0) {
        lendList.forEach(coin => {
            list += `${coin}\n`
        })
    } else {
        list = `Lending list is empty, Please use\n/add <coin> to add into your lending list`
    }
    ctx.reply(list)
})
lendingScene.command('back', ctx => { return ctx.scene.leave() })
lendingScene.leave()

function getTicker(text) {
    const value = text.split(" ")
    return value[1]?.toUpperCase()
}

module.exports = lendingScene