var dns = require('native-dns');
var consts = require('native-dns-packet').consts;
var utils = require('./utils');
var queryMatcher = require('./querymatcher');

/**
 * DNS 构造函数
 *
 * @param {Object} options  参数
 * @param {Object} store    存储器
 */
var DNS = function (options, store) {
    this.options = options;
    this.store = store;
    this.server = dns.createServer();

    this.forwardServer = {
        address: options.forwardHost,
        port: options.forwardPort,
        type: 'udp'
    };
};

/**
 * DNS继续查找
 *
 * @param  {Object} request  request对象
 * @param  {Object} response response对象
 */
DNS.prototype.forward = function (request, response) {

    var req = dns.Request({
        question: request,
        server: this.forwardServer,
        timeout: 60000
    });

    req.on('message', function(err, answer) {

        response.answer = answer.answer;
        response.authority = answer.authority;
        response.additional = answer.additional;
        response.edns_options = answer.edns_options;
        response.header.ra = 1;

        try {
            response.send();
        }
        catch(e) {
            req.cancel();
            console.log('ERROR: Error sending forward requrest: ', e);
        }
    });

    req.on('timeout', function () {
        req.cancel();
    });

    req.send();
};

DNS.prototype.respond = function(request, response, results) {

    // TODO : Populate also Authority & Additional based on results .. ?
    // TODO : Should results be sorted? CNAME pre A ?
    results.forEach(function(resp) {
        response.answer.push(resp);
    });

    // On some versions of glibc the resolver fails if response not advertised as recursive
    response.header.ra = 1;

    // TODO : Being able to validate each record would be nice!! For imporved error logging
    try {
        response.send();
    }
    catch(e) {
        response.header.rcode = 2; // <- SERVERFAIL
        response.answer = [];
        response.send();
        console.log('ERROR: Unable to validate responses. \nSome mismatch between your store data and record requirements?\n',e);
    }
};

/**
 * 处理请求
 *
 * @param  {Object} request  request对象
 * @param  {Object} response response对象
 */
DNS.prototype.handleRequest = function (request, response) {
    var _request = request.question[0];
    var query = _request.name;
    var answerTypes = this.filterTypes(this.pickAnswerTypes(_request.type));

    this.queryStore(query, answerTypes, function(results) {
        if (results.length === 0 && this.forwardServer) {
            // FORWARD
            this.forward(_request, response);
        }
        else {

            // RESPOND
            this.respond(request, response, results);
        }

    }.bind(this));
};

DNS.prototype.pickAnswerTypes = function(type) {
    return this.includeAnswerTypes(consts.QTYPE_TO_NAME[type]);
};

DNS.prototype.includeAnswerTypes = function(queryType) {
    switch (queryType) {
        case 'A':

            return ['A', 'CNAME'];

        case 'AAAA':

            var types = ['AAAA', 'CNAME'];
            if (this.options['ipv4-for-ipv6']) {
                types.push('A');
            }
            return types;

        default:
            return [queryType];
    }
};

DNS.prototype.filterTypes = function(responseTypes) {
    return responseTypes
        .filter(function(type) {
            return typeof dns[type] == 'function';
        });
};

/**
 * 查询存储器
 *
 * @param  {string}   query    查询字符串
 * @param  {Array}    types    类型列表
 * @param  {Function} callback 回调函数
 */
DNS.prototype.queryStore = function(query, types, callback) {
    var me = this;
    var results = [];

    var records = me.store.list();

    types.forEach(function(recordtype) {
        queryMatcher(records, query, recordtype)
        .forEach(function(record) {
            results.push(record);
        });
    });

    me.resolveCNAME(types, records, results);

    var _results = results.map(function(res) {
        return dns[res.type](res);
    });

    if (typeof callback === 'function') {
        callback(_results);
    }
};

/**
 * 解析CNAME
 *
 * @param  {Array}  types   类型列表
 * @param  {Object} records 记录列表
 * @param  {Array}  results 结果
 */
DNS.prototype.resolveCNAME = function(types, records, results) {

    if (types.indexOf('CNAME') < 0) {
        return;
    }

    if (types.indexOf('A') < 0 && types.indexOf('AAAA') < 0) {
        return;
    }

    results.forEach(function(res) {

        if (res.type != 'CNAME') {
            return;
        }

        if (results.filter(function(r) { return r.name == res.data; }).length > 0) {
            return;
        }

        if (types.indexOf('A') >= 0) {
            queryMatcher(records, res.data, 'A').forEach(function(record) {
                results.push(record);
            });
        }
        if (types.indexOf('AAAA') >= 0) {
            queryMatcher(records, res.data, 'AAAA').forEach(function(record) {
                results.push(record);
            });
        }
    });
};

/**
 * 启动 DNS Server
 */
DNS.prototype.start = function () {
    var me = this;
    var server = me.server;

    server.on('request', me.handleRequest.bind(me));

    server.on('listening', function () {
        utils.displayServiceStatus(
            'dns',
            'udp://' + me.options.dnsHost + ':' + me.options.dnsPort,
            true
        );
    });

    server.on('close', function () {
        utils.displayErrorMessage(
            'DNS socket unexpectedly closed',
            null,
            {
                exit: true
            }
        );
    });

    server.on('error', function (err) {
        utils.displayErrorMessage(
            'Unknown DNS error',
            err,
            {
                exit: true
            }
        );
    });

    server.on('socketError', function (err) {
        utils.displayErrorMessage(
            'DNS socket error occurred',
            err,
            {
                exit: true,
                hint: 'Port might be in use or you might not have permissions to bind to port. Try sudo?'
            }
        );
    });

    server.serve(me.options.dnsPort, me.options.dnsHost);
};

module.exports = DNS;
