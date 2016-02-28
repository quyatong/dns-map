var utils = require('./utils');

/**
 * TTL构造函数
 *
 * @param  {Object} store 存储器
 */
var TTL = function(store) {
    this.store = store;
};

/**
 * 检查器
 */
TTL.prototype.check = function () {
    var now = utils.getUnixTime();
    var store = this.store;

    // 检查所有的记录
    store.list(function (records) {
        Object
        .keys(records)
        .forEach(
            function (recordName) {
                var record = records[recordName];

                if (record.time + record.ttl < now) {
                    store.del(recordName);
                }
            }
        );
    });
};

/**
 * 开始 Time To Live
 */
TTL.prototype.start = function () {
    this.interval = setInterval(this.check.bind(this), 1000);
};

/**
 * 停止 Time To Live
 */
TTL.prototype.stop = function () {
    clearInterval(this.interval);
};

/**
 * TTL构造函数
 *
 * @param  {Object} store 存储器
 * @return {TTL}          TTL实例
 */
module.exports = TTL;
