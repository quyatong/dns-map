var path  = require('path');
var utils = require('./utils');
var Proxy = require('./proxy');

/**
 * 返回config file的绝对路径
 *
 * @param  {string} configFilePath 配置文件路径
 * @return {string}                配置文件绝对路径
 */
var pathToConfig = function (configFilePath) {

    if (!/^\//.test(configFilePath)) {
        configFilePath = process.cwd() + '/' + configFilePath;
    }

    return path.resolve(configFilePath);
};

/**
 * 缓存器构造函数
 *
 * @param  {Object} options 配置参数
 * @param  {Object} store   存储器
 */
var Config = function(options, store) {
    var records = require(pathToConfig(options.config)).records;

    this.options = options;
    this.store = store;
    this.records = records;
};

/**
 * 记录存储缓存器
 */
Config.prototype.populate = function () {
    var me = this;
    var store = this.store;

    this.records.forEach(function (record) {
        var warp = utils.wrap(record.name, record, me.options);

        store.set(warp.name, warp.payload);
    });
};

/**
 * 间隔毫秒
 *
 * @return {number}     间隔毫秒数
 */
Config.prototype.intervalMillis = function () {
    var interval = (this.options.ttl * 1000) - (this.options.ttl * 100);
    return interval > 1000 ? interval : 1000;
};

Config.prototype.proxy = function () {
    var me = this;
    var records = me.records;

    records.forEach(function (record) {
        if (record.proxy) {
            Proxy(record.proxy);
        }
    });

};

/**
 * 开始配置
 */
Config.prototype.start = function () {
    var me = this;

    me.populate();

    me.interval = setInterval(
        function () {
            me.populate();
        },
        me.intervalMillis()
    );

    me.proxy();
};

/**
 * 停止配置
 */
Config.prototype.stop = function () {
    clearInterval(this.interval);
};

module.exports = Config;
