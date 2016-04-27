var _ = require('lodash');
var DexiAPIException = require('./DexiAPIException');
var DexiAPIHelper = require('./DexiAPIHelper');


/**
 * The super class of all generated controllers. Provides all the tools - so that the generated classes just need to
 * combine them in the proper way.
 *
 * @param dexi {Dexi}
 * @param accountId {string}
 * @param accessToken {string}
 * @constructor
 */
function DexiAbstractController(dexi, accountId, accessToken) {
    /**
     * @type {Dexi}
     */
    this.dexi = dexi;

    /**
     *
     * @type {DexiAPIHelper}
     */
    this.api = new DexiAPIHelper(dexi, accountId, accessToken);

    /**
     *
     * @type {string}
     */
    this.accountId = accountId;

    /**
     *
     * @type {string}
     */
    this.accessToken = accessToken;
}

DexiAbstractController.prototype.makeUrl = function (urlPattern, urlParameters, queryParameters) {
    var url = urlPattern;

    _.each(urlParameters, function (value, key) {
        url = str_replace('{' + key + '}', value, url);
    });

    var queryParameterList = [];
    _.each(queryParameters, function (value, key) {
        queryParameterList.push(rawurlencode(key) + '=' + rawurlencode(value));
    });

    if (count(queryParameterList) > 0) {
        url += '?'.queryParameterList.join('&');
    }

    return url;
};

DexiAbstractController.prototype.serialize = function (object) {
    return JSON.stringify(object);
};

DexiAbstractController.prototype.deserialize = function (object) {
    return JSON.parse(object);
};

module.exports = DexiAbstractController;