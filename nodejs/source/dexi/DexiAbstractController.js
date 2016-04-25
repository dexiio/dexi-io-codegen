var DexiAPIException = require('./DexiAPIException');
var request = require('request');

DexiAbstractController.BASE_URI = "https://api.dexi.io";
DexiAbstractController.USER_AGENT = 'DexiIO-NodeJS/1.0';
DexiAbstractController.REQUEST_TIMEOUT = 3600;

function DexiAbstractController(accountId, accessToken) {
    this.accountId = accountId;
    this.accessToken = accessToken;

}

DexiAbstractController.prototype = {
    requestBoolean: function(url, method, body) {
        return this.request(url, method, body).then(function() {
            return true;
        });
    },
    requestJson: function(url, method, body) {
        return this.request(url, method, body).then(function(result) {
            return JSON.parse(result);
        });
    },
    processParameters: function(url, parms) {
        return url;
    },
    request: function(url, method, body) {

        var content = body ? JSON.stringify(body) : null;
        var headers = {
            'X-DexiIO-Access': this.accessToken,
            'X-DexiIO-Account': this.accountId,
            'User-Agent': DexiAbstractController.USER_AGENT,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        if (content) {
            headers['Content-Length'] = content.length;
        }

        var opts = {
            url: DexiAbstractController.BASE_URI + url,
            method: method,
            headers: headers,
            body: content,
            timeout: DexiAbstractController.REQUEST_TIMEOUT
        };

        return new Promise(function(resolve, reject) {
            request(opts, function(err, response, body) {
                if (err) {
                    reject(err);
                    return;
                }

                if (response.statusCode < 100 || response.statusCode > 399) {
                    reject(new DexiAPIException('dexi.io request failed: ' + response.statusCode + ' ' + response.reason, url, response));
                    return;
                }

                resolve(body);
            });
        });
    }
};

module.exports = DexiAbstractController;