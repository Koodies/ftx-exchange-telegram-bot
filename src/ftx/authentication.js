'use strict'
require('dotenv').config()
const crypto = require('crypto')
const axios = require('axios')
axios.defaults.headers.common['User-Agent'] = 'koodies'
axios.defaults.headers.common['content-type'] = 'application/json'
axios.defaults.headers.common['Accept'] = 'application/json'
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
axios.defaults.headers.common['FTX-KEY'] = process.env.FTX_KEY
if(process.env.FTX_SUB) axios.defaults.headers.common['FTX-SUBACCOUNT'] = process.env.FTX_SUB
axios.defaults.keepAlive = true
axios.defaults.timeout = 90 * 1000
axios.defaults.keepAliveMsecs = 1000 * 60

class Authentication {
    /**
     * Generate signature for FTX api request
     * @param  {String} method      request method: GET, POST, PUT,DELETE
     * @param  {Integer} timeStamp  timestamp of the request
     * @param  {String} path    FTX API path
     * @param  {Object} data    Data to be added into the request in JSON
     */
    static generateSignature(method, timeStamp, path, data = '') {
        path = `/api/${path}`
        let payload = ''
        if (method === 'GET' && data) {
            path += '?' + URLSearchParams.stringify(data);
        } else if (method === 'DELETE' && typeof data === 'number') {
            path += data;
        } else if (data) {
            payload = JSON.stringify(data);
        }
        return crypto.createHmac('sha256', process.env.FTX_SECRET).update(timeStamp + method + path + payload).digest('hex')
    }

    /**
     * Send a GET request to FTX API using axios     
     * @param  {String} signature   signature generated using generateSignature method
     * @param  {Integer} timeStamp  timestamp of the request, must be the same as one used in signature
     * @param  {String} path        FTX API path
     */
    static sendReq(signature, timeStamp, path) {
        axios.defaults.headers.common['FTX-SIGN'] = signature
        axios.defaults.headers.common['FTX-TS'] = timeStamp
        return axios.get(`https://ftx.com/api/${path}`).then(
            res => {
                return { error: !res.data.success, data: res.data.result }
            }
        ).catch(
            error => {
                return { error: true, data: error }
            }
        )
    }

    /**
     * Send a POST request to FTX API using axios     
     * @param  {String} signature   signature generated using generateSignature method
     * @param  {Integer} timeStamp  timestamp of the request, must be the same as one used in signature
     * @param  {String} path        FTX API path
     * @param  {Object} data        JSON data required to process the POST request
     */
    static sendPostReq(signature, timeStamp, path, data) {
        axios.defaults.headers.common['FTX-SIGN'] = signature
        axios.defaults.headers.common['FTX-TS'] = timeStamp
        return axios.post(`https://ftx.com/api/${path}`, data).then(
            res => {
                return { error: !res.data.success, data: res.data.result }
            }
        ).catch(
            error => {
                return { error: true, data: error }
            }
        )
    }
}//end of Authentication

module.exports = Authentication