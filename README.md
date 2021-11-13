# FTX-Telegram Bot ReadMe
A readme on how to set up and use FTX-Telegram hourly auto compounding lending & staking bot.

# Table of contents
- [FTX-Telegram Bot ReadMe](#ftx-telegram-bot-readme)
- [Table of contents](#table-of-contents)
- [Setup](#setup)
  - [Environment Required](#environment-required)
  - [Create a telegram bot](#create-a-telegram-bot)
  - [Create a FTX API & enable spot margin trading](#create-a-ftx-api--enable-spot-margin-trading)
  - [Environment Variables](#environment-variables)
  - [Setting up](#setting-up)
    - [Setting up with docker](#setting-up-with-docker)
    - [Setting up with nodejs](#setting-up-with-nodejs)
    - [Setting up on AWS [Coming Soon]](#setting-up-on-aws-coming-soon)
  - [Ready to spin](#ready-to-spin)
- [Menu](#menu)
  - [Main](#main)
  - [Watchlist](#watchlist)
  - [Lending](#lending)
  - [Staking](#staking)
- [Troubleshooting](#troubleshooting)
- [Others](#others)
  - [Authors](#authors)
  - [Tip me a Cup of Coffee](#tip-me-a-cup-of-coffee)
  - [References](#references)

# Setup
[(Back to top)](#table-of-contents)

## Environment Required
* A machine with nodejs or docker installed

## Create a telegram bot
1. Chat with [BotFather](https://core.telegram.org/bots#6-botfather)
2. BotFather will give you a token, something like 123456789:AbCdfGhIJKlmNoQQRsTUVwxyZ.
3. Paste the token under the .env file

## Create a FTX API & enable spot margin trading
1. Head over to https://ftx.com/profile
2. Select the API tab
3. Create API Key
4. Copy both the key and paste it under the .env file
5. Make sure none of the permissions are enabled
6. Select the Margin tab
7. Click on "Enable Spot Margin Trading"

*(Optional) - Create a sub account and specific it on the .env will allow you to segregate your lending. 

## Environment Variables
.env to be place in the same location as index.js
```
BOT_TOKEN=telegram-bot-token-here
FTX_KEY=ftx-api-key-here
FTX_SECRET=ftx-api-secret-here
FTX_SUB=ftx-sub-account-here        #Optional
```
## Setting up
### Setting up with docker
```
docker pull koodies/ftx-exchange-telegram-bot:1.2.0
docker run --env-file .env -d koodies/ftx-exchange-telegram-bot:1.2.0
```
Additional help: [Set up docker on windows](https://docs.docker.com/desktop/windows/install/)

### Setting up with nodejs

Additional help: [Setting up nodejs](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

### Setting up on AWS [Coming Soon]


## Ready to spin
1. Start a chat with your bot, link to the chat can be found on bot creation with BotFather
2. Enter /init to start populating your lending & staking list
3. Run /startlend or /startstake to start compounding!

# Menu
[(Back to top)](#table-of-contents)

## Main
[(Back to top)](#table-of-contents)
All commands under main are global commands
| Command | Description |
| ----------- | ----------- |
| /watch  | Enter the watch list scene |
| /lend | Enter the lending scene. |
| /stake | Enter the staking scene. |
| /update | Update the local database of coins |
| /init | Add coins with balance in current wallet into lending/staking list |
| /balance | View your current balance in your FTX account. |
| /whois | Query the full name of the coin. |
| /startlend | Start the hourly lending cron job |
| /startstake | Start the hourly staking cron job |
| /stoplend | Stop the hourly lending cron job and remove all funds from the lending pool |
| /stopstake | Stop the hourly staking cron job |
| /dispalylogs | Display last 5 logs |

## Watchlist
[(Back to top)](#table-of-contents)
| Command | Description |
| ----------- | ----------- |
| /list | list all the coins available for lending on FTX |
| /show | Display current watchlist saved locally |
| /add [ticker] | Issue a <code>/add USD</code> command to add coin to your watchlist |
| /remove [ticker] | Issue a <code>/remove USD</code> command to remove coin from your watchlist |
| /back | Head back to the main menu |

## Lending
[(Back to top)](#table-of-contents)
| Command | Description |
| ----------- | ----------- |
| /list | List all the coins available for lending on FTX |
| /top10 | List the first 10 highest rate coins inclusive of tokenize stocks |
| /top10crypto | List the first 10 highest rates crypto coins |
| /watchlist | List all the rates of the coins under your watchlist |
| /add [ticker] | Issue a <code>/add USD</code> command to add USD into the lending list |
| /remove [ticker] | Issue a <code>/remove USD</code> command to remove USD from the lending list |
| /show | Display current staking list |
| /back | Head back to the main menu |

## Staking
[(Back to top)](#table-of-contents)
| Command | Description |
| ----------- | ----------- |
| /list | Issue a /list command to list the coins available for staking on FTX |
| /add [ticker] | Issue a <code>/add USD</code> command to add USD into the staking list |
| /remove [ticker] | Issue a <code>/remove USD</code> command to remove USD from the staking list |
| /show | Display current staking list |
| /back | Head back to the main menu |

# Troubleshooting
[(Back to top)](#table-of-contents)


# Others
[(Back to top)](#table-of-contents)
## Authors
[Koodies](https://github.com/koodies)

## Tip me a Cup of Coffee
Use my referral [FTX Referral](https://ftx.com/#a=koodies4ever)\
[Tip me via FTX](https://ftx.us/pay/request?subscribe=false&id=1160&memoIsRequired=false&memo=&notes=&allowTip=true&fixedWidth=true)

## References
[FTX API](https://docs.ftx.com/?python#rest-api)
