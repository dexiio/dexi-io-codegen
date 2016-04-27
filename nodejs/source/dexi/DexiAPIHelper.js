var _ = require('lodash');
var request = require('request');

var DexiAPIResponse = require('./DexiAPIResponse');
var DexiAPIException = require('./DexiAPIException');


DexiAPIHelper.HTTP_GET = "GET";
DexiAPIHelper.HTTP_POST = "POST";
DexiAPIHelper.HTTP_PUT = "PUT";
DexiAPIHelper.HTTP_DELETE = "DELETE";

/**
 * Handles all HTTP requests to Dexi
 *
 * @param dexi {Dexi}
 * @param accountId {string}
 * @param accessKey {string}
 * @constructor
 */
function DexiAPIHelper(dexi, accountId, accessKey) {

    /**
     * @var {Dexi}
     */
    this.dexi = dexi;

    /**
     * @var {string}
     */
    this.accountId = accountId;

    /**
     * @var {string}
     */
    this.accessKey = accessKey;
}

/**
 * Send HTTP request to url - with optional requestBody
 *
 * @param url {string}
 * @param httpMethod {string} See class constants HTTP_*
 * @param requestBody {string|null}
 * @param requestHeaders {object} additional request headers
 * @returns {Promise<DexiAPIResponse>}
 * @throws {DexiAPIException}
 */
DexiAPIHelper.prototype.sendRequest = function (url, httpMethod, requestBody, requestHeaders) {
    if (!requestBody) {
        requestBody = null;
    }

    if (!requestHeaders) {
        requestHeaders = {};
    }

    var content = requestBody;
    var headers = {
        'X-DexiIO-Access': this.accessKey,
        'X-DexiIO-Account': this.accountId,
        'User-Agent': this.dexi.getUserAgent(),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };

    if (content) {
        headers['Content-Length'] = content.length;
    }

    _.each(requestHeaders, function(value, key) {
        headers[key] = value;
    });

    var opts = {
        url: this.dexi.getEndpoint() + '/' + url,
        method: method,
        headers: headers,
        body: content,
        timeout: this.dexi.getRequestTimeout()
    };

    return new Promise(function (resolve, reject) {
        request(opts, function (err, response, body) {
            if (err) {
                reject(err);
                return;
            }

            if (response.statusCode < 100 || response.statusCode > 399) {
                reject(new DexiAPIException('dexi.io request failed: ' + response.statusCode + ' ' + response.reason, url, response));
                return;
            }

            resolve(new DexiAPIResponse(response.statusCode, body, response.headers));
        });
    });
};

module.exports = DexiAPIHelper;