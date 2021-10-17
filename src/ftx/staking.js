const ftx = require('./authentication')

class Staking {
    /**
     * Get stakes on FTX
     */
    static getStakesBalance() {
        let timeStamp = +new Date
        let path = `staking/balances`
        let signature = ftx.generateSignature('GET', timeStamp, path)
        return ftx.sendReq(signature, timeStamp, path)
    }

    /**
     * Send a staking request
     * @param  {String} coin    Ticker Symbol
     * @param  {Integer} size   
     */
    static sendStakeReq(coin, size) {
        let timeStamp = +new Date
        let path = `srm_stakes/stakes`
        let data = {coin, size}
        let signature = ftx.generateSignature('POST', timeStamp, path, data)
        return ftx.sendPostReq(signature, timeStamp, path, data)
    }
}// end of Staking

module.exports = Staking