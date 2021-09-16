const ftx = require('./authentication')

class SpotMargin {

    /**
     * Send a POST request to FTX to start a lending on a coin
     * @param  {String} coin    Coin Ticker Symbol
     * @param  {Integer} size   Number of holding(s)
     */
    static sendLendingOffer(coin, size) {
        let timeStamp = +new Date
        let path = `spot_margin/offers`
        let data = { coin, size, rate: (1 / 365 / 24 / 100) }
        let signature = ftx.generateSignature('POST', timeStamp, path, data)
        return ftx.sendPostReq(signature, timeStamp, path, data)
    }

    /**
     * Send a POST request to FTX to stop a lending offer on a coin
     * @param  {String} coin    Coin Ticker Symbol
     */
    static stopLendingOffer(coin) {
        let timeStamp = +new Date
        let path = `spot_margin/offers`
        let data = { coin, size: 0, rate: (1 / 365 / 24 / 100) }
        let signature = ftx.generateSignature('POST', timeStamp, path, data)
        return ftx.sendPostReq(signature, timeStamp, path, data)
    }
    
    /**
     * Get FTX spot margin lending info
     */
    static getLendingInfo() {
        let timeStamp = +new Date
        let path = `spot_margin/lending_info`
        let signature = ftx.generateSignature('GET', timeStamp, path)
        return ftx.sendReq(signature, timeStamp, path)
    }

    /**
     * Get FTX current and estimate spot margin lending rates
     */
     static getRates() {
        let timeStamp = +new Date
        let path = `spot_margin/lending_rates`
        let signature = ftx.generateSignature('GET', timeStamp, path)
        return ftx.sendReq(signature, timeStamp, path)
    }
}// end of SpotMargin

module.exports = SpotMargin