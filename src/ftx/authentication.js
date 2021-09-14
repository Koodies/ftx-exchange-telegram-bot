'use strict'
require('dotenv').config()
const crypto = require('crypto')
const axios = require('axios')
axios.defaults.headers.common['User-Agent'] = 'koodies'
axios.defaults.headers.common['content-type'] = 'application/json'
axios.defaults.headers.common['Accept'] = 'application/json'
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
axios.defaults.headers.common['FTX-KEY'] = process.env.FTX_KEY
axios.defaults.keepAlive = true
axios.defaults.timeout = 90 * 1000
axios.defaults.keepAliveMsecs = 1000 * 60

class Authentication {
    static generateSignature(method, timeStamp, path, data = '') {
        path = `/api/${path}`
        let payload = ''
        if (method === 'GET' && data) {
            path += '?' + querystring.stringify(data);
        } else if (method === 'DELETE' && typeof data === 'number') {
            path += data;
        } else if (data) {
            payload = JSON.stringify(data);
        }
        return crypto.createHmac('sha256', process.env.FTX_SECRET).update(timeStamp + method + path + payload).digest('hex')
    }

    static sendReq(signature, timeStamp, path) {
        axios.defaults.headers.common['FTX-SIGN'] = signature
        axios.defaults.headers.common['FTX-TS'] = timeStamp
        return axios.get(`https://ftx.com/api/${path}`).then(
            res => {
                return (res.data.success) ? res.data.result : []
            }
        ).catch(
            error => {
                return { error: true, data: error }
            }
        )
    }

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