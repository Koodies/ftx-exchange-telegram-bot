//Watchlist scene
const { Scenes: { BaseScene } } = require('telegraf')
const fileCtrl = require('../controller/file')

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
    const msg = fileCtrl.displayCoinList()
    ctx.reply(msg)
})
watchingScene.command('show', ctx => {
    let list = ``
    const watchlist = fileCtrl.getWatchList()
    if (watchlist.length > 0) {
        watchlist.forEach(coin => {
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

function getTicker(text) {
    const value = text.split(" ")
    return value[1]?.toUpperCase()
}

module.exports = watchingScene