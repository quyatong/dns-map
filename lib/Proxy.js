var _ = require('lodash');
var proxy = require('reverse-proxy');
var URI = require('uri-js');
var chalk = require('chalk');
var format = require('date-format');
var servers = {};

module.exports = function (options) {

    if (servers[options.port]) {
        _.merge(servers[options.port], options.map);
        return ;
    }

    proxy.createServer({
        port: options.port,
        map: function (config) {
            var maped = false;

            Object.keys(servers[options.port]).forEach(function (item) {
                if (new RegExp(item).test(config.path)) {
                    var targetUrl = servers[options.port][item];
                    var targetUri = URI.parse(targetUrl);

                    console.log(''
                        + chalk.magenta('[time: ' + format('hh:mm:ss.SSS', new Date()) + ']')
                        + chalk.cyan(' map: ')
                        + chalk.green(config.host + ':' + config.port  + config.path.split('?')[0])
                        + chalk.yellow(' ➫ ')
                        + chalk.green(targetUri.host + ':' + (targetUri.port || '80') + targetUri.path)
                    );

                    config.path = targetUri.path;
                    config.host = targetUri.host;
                    config.port = targetUri.port || 80;
                    config.headers.host = config.host;
                    maped = true;
                }
            });

            if (!maped) {
                console.log(''
                    + chalk.red('[time: ' + format('hh:mm:ss.SSS', new Date()) + ']')
                    + chalk.cyan(' map: ')
                    + chalk.green(config.host + ':' + config.port  + config.path.split('?')[0])
                );
            }

            return config;
        },
        mapHttpsReg: true
    });

    servers[options.port] = options.map;
};
