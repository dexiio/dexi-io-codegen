/**
 *
 * @param statusCode {number}
 * @param responseBody {string}
 * @param headers {object}
 * @constructor
 */
function DexiAPIResponse(statusCode, responseBody, headers) {
    /**
     *
     * @type {number}
     */
    this.statusCode = statusCode;

    /**
     *
     * @type {string}
     */
    this.responseBody = responseBody;

    /**
     *
     * @type {Object}
     */
    this.headers = headers;
}


/**
 * @returns {number}
 */
DexiAPIResponse.prototype.getStatusCode = function () {
    return this.statusCode;
};

/**
 * @param statusCode {number}
 */
DexiAPIResponse.prototype.setStatusCode = function (statusCode) {
    this.statusCode = statusCode;
};

/**
 * @returns {string}
 */
DexiAPIResponse.prototype.getResponseBody = function () {
    return this.responseBody;
};

/**
 * @param responseBody {string}
 */
DexiAPIResponse.prototype.setResponseBody = function (responseBody) {
    this.responseBody = responseBody;
};

/**
 * @returns {object}
 */
DexiAPIResponse.prototype.getHeaders = function () {
    return this.headers;
};

/**
 * @param headers {object}
 */
DexiAPIResponse.prototype.setHeaders = function (headers) {
    this.headers = headers;
};

module.exports = DexiAPIResponse;