/**
 * Created by zhangfeng on 2016/5/16.
 */
'use strict';
var retry_strategy = function (options) {
    if (options.error.code === 'ECONNREFUSED') {
        // End reconnecting on a specific error and flush all commands with a individual error
        return new Error('The server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
        // End reconnecting after a specific timeout and flush all commands with a individual error
        return new Error('Retry time exhausted');
    }
    if (options.times_connected > 10) {
        // End reconnecting with built in error
        return undefined;
    }
    // reconnect after
    return Math.max(options.attempt * 100, 3000);
}
module.exports = {
    apiHost: "m.lvmama.com",
    pic: process.env.NODE_ENV === 'production' ? "http://pic.lvmama.com/mobile/coding/node/pro/public/min" : '',
    version: '201608300033',
    redisReaderOption: {
        host: '192.168.0.63',
        port: 12201,
        retry_strategy: retry_strategy
    },
    redisWriterOption: {
        host: '192.168.0.63',
        port: 12200,
        retry_strategy: retry_strategy
    }
};