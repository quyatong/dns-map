var _ = require('lodash');
var chalk = require('chalk');

module.exports = {

    displayServiceStatus: function (service, meta, check) {
        console.log(''
            + chalk.green(this.fillSpaces(service, 6)) + ' '
            + this.fillSpaces(meta, 21) + ' '
            + (check ? chalk.green('✔') : '')
        );
    },

    displayErrorMessage : function (msg, err, props) {

        // console.log(chalk.red('ERROR: ') + msg, err);
        //
        // if (props.hint) {
        //     console.log(chalk.cyan('HINT: ') + props.hint);
        // }
        //
        // if (props.exit) {
        //     process.exit(1);
        // }
    },

    /**
     * 填充空格
     *
     * @param  {string} word 字符串
     * @param  {number} len  设定长度
     * @return {string}      填充空格后的字符串
     */
    fillSpaces : function (word, len) {

        while(word.length < len) {
            word = word + ' ';
        }

        return word;
    },

    /**
     * 包装
     *
     * @param  {string} name
     * @param  {Object} payload 额外参数
     * @param  {Object} options 全局配置
     * @return {Object}         包装后的配置
     */
    wrap: function (name, payload, options) {
        var domain = (payload.domain || options.domain);

        Object.keys(payload).forEach(function (key) {
            if (['A', 'AAAA', 'CNAME'].indexOf(key) > -1) {
                payload[key].push({address: options.dnsHost});
            }
        });

        return {
            name: name + '.' + domain,
            payload: _.merge(payload || {}, {
                domain: domain,
                ttl: payload.ttl || options.ttl,
                time: this.getUnixTime()
            })
        };
    },

    /**
     * 获取Unix时间
     *
     * @return {number} Unix时间
     */
    getUnixTime: function () {
        return Math.floor(new Date().getTime() / 1000);
    }
};
