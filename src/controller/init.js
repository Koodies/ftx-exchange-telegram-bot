'use strict'
require('dotenv').config()
const filePath = "../../database.json"
const db = require(filePath)
const wallet = require('../ftx/wallet')
const fileCtrl = require('../controller/file')
const account = (process.env.FTX_SUB) ? process.env.FTX_SUB : "main"

async function init(ctx) {
    try {
        ctx.reply('Initializing')
        let walletRes = await wallet.getAllBalances()
        if (walletRes.error) throw new Error(`Error on retrieving rates & balances`)
        walletRes.data[account].forEach(coin => {
            if(coin.total !== 0) {
                fileCtrl.addToLendingList(coin.coin)
                fileCtrl.addToStakingList(coin.coin)
            }
        })
        let list = `---- Lend ----\n`
        const lendList = fileCtrl.getLendList()
        if (lendList.length > 0) {
            lendList.forEach(coin => {
                list += `${coin}\n`
            })
        }
        list += `---- Stake ----\n`
        const stakeList = fileCtrl.getStakeList()
        if (stakeList.length > 0) {
            stakeList.forEach(coin => {
                list += `${coin}\n`
            })
        }
        ctx.reply(`${list}\n/startlend - Start lending auto-compounding\n/startstake - Start staking auto-compounding`)
    } catch (error) {
        console.log(error)
    }
}//end of init

module.exports = init