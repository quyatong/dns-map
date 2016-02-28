
/**
 * 存储器
 */
function Store() {
    this.data = {};
}

/**
 * 获取key对应的值
 *
 * @param  {string}   key   key
 * @return {Object}         key对应的值
 */
Store.prototype.get = function(key) {
    return this.data[key];
};

/**
 * 获取key
 *
 * @param  {string}   key      key
 * @param  {string}   value    value
 */
Store.prototype.set = function (key, value) {
    this.data[key] = value;
};

/**
 * 删除key
 *
 * @param  {string}   key      key
 */
Store.prototype.del = function (key) {
    delete this.data[key];
};

/**
 * 获取列表
 *
 * @param  {Object}  存储数据列表
 */
Store.prototype.list = function (callback) {
    return this.data;
};

/**
 * 对外暴露接口
 */
module.exports = new Store();
