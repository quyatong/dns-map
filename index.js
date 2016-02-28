var _ = require('lodash');
var myIp = require('my-ip');
var store = require('./lib/store');

var DNS = require('./lib/DNS');
var TTL = require('./lib/TTL');
var Config = require('./lib/Config');

/**
 * 配置参数
 *
 * @type {Object}
 */
var options = {
    apihost: '127.0.0.1',
    apiport: 8080,

    dnsHost: myIp(),
    dnsPort: 53,

    domain: 'didialift.com',
    ttl: 10000,

    forwardHost: '8.8.8.8',
    forwardPort: 53
};

/**
 * 入口函数
 *
 * @param  {Object} program commander program
 */
exports.enter = function (program) {
    options = _.merge(options, program);

    // 启动dns解析
    new DNS(options, store).start();

    // 过期时间检查
    new TTL(store).start();

    if (options.config) {
        new Config(options, store).start();
    }
};
