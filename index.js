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

    dnsHost: myIp(),
    dnsPort: 53,

    domain: '',
    ttl: 10000,

    forwardHost: '114.114.114.114',
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
