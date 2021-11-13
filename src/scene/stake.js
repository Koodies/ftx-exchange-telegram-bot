//Staking Scene
const { Scenes: { BaseScene } } = require('telegraf')
const fileCtrl = require('../controller/file')

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
    const msg = fileCtrl.displayStakeList()
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
    const stakeList = fileCtrl.getStakeList()
    if (stakeList.length > 0) {
        stakeList.forEach(coin => {
            list += `${coin}\n`
        })
    } else {
        list = `Staking list is empty, Please use\n/add <coin> to add into your staking list`
    }
    ctx.reply(list)
})
stakingScene.command('back', ctx => { return ctx.scene.leave() })
stakingScene.leave()

function getTicker(text) {
    const value = text.split(" ")
    return value[1]?.toUpperCase()
}

module.exports = stakingScene