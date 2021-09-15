# FTX-Telegram Bot ReadMe
A readme on how to 

# Table of contents
- [FTX-Telegram Bot ReadMe](#ftx-telegram-bot-readme)
- [Table of contents](#table-of-contents)
- [Setup](#setup)
- [Menu](#menu)
  - [Main](#main)
    - [start - Global](#start---global)
    - [stop - Global](#stop---global)
    - [balance - Global](#balance---global)
    - [watchlist](#watchlist)
    - [lending - Global](#lending---global)
    - [whois - Global](#whois---global)
  - [Watchlist](#watchlist-1)
    - [list](#list)
    - [update](#update)
    - [current](#current)
    - [add [coin]](#add-coin)
    - [remove [coin]](#remove-coin)
    - [back](#back)
  - [Lending](#lending)
    - [top10](#top10)
    - [top10cryto](#top10cryto)
    - [watchlist](#watchlist-2)
    - [add [coin]](#add-coin-1)
    - [remove [coin]](#remove-coin-1)
    - [back](#back-1)
- [Troubleshooting](#troubleshooting)
- [Others](#others)
  - [Authors](#authors)
  - [References](#references)

# Setup
[(Back to top)](#table-of-contents)

# Menu
[(Back to top)](#table-of-contents)

## Main
[(Back to top)](#table-of-contents)
### start - Global
Issue a /start command to start the hourly lending cron job

### stop - Global
Issue a /stop command to stop the hourly lending cron job and remove all funds from the lending pool.

### balance - Global
Issue a /balance command to view your current balance in your FTX account

### watchlist
Issue a /watchlist command to enter the watch list scene

### lending - Global
Issue a /lending command to enter the lending scene

### whois - Global
Issue a /whois command with a ticker symbol of the coin to get the full name of the coin

## Watchlist
[(Back to top)](#table-of-contents)
### list
Issue a /list command to list all the coins available for lending on FTX

### update
Issue a /update command to update the local database of coins

### current
Issue a /current command to display current watchlist saved locally

### add [coin]
Issue a /add USD command to add coin to your watchlist

### remove [coin]
Issue a /remove USD command to remove coin from your watchlist

### back
Issue a /back command to head back to the main menu

## Lending
[(Back to top)](#table-of-contents)
### top10
Issue a /top10 command to retrieve the first 10 highest rate coins inclusive of tokenize stocks

### top10cryto
Issue a /top10crypto command to retrieve the first 10 highest rates crypto coins

### watchlist
Issue a /watchlist command to retrieve all the rates of the coins under watchlist

### add [coin]
Issue a /add USD command to add USD into the lending list

### remove [coin]
Issue a /remove USD command to remove USD from the lending list

### back
Issue a /back command to head back to the main menu

# Troubleshooting
[(Back to top)](#table-of-contents)


# Others
[(Back to top)](#table-of-contents)
## Authors
[Koodies](https://github.com/koodies)

## References
[FTX API](https://docs.ftx.com/?python#rest-api)
