/**
 * Wraps a HTTP response which contains binary data
 * @param response {DexiAPIResponse}
 * @constructor
 */
function DexiBinaryResponse(response) {
    /**
     *
     * @type {string}
     */
    this.data = response.getResponseBody();

    /**
     *
     * @type {string}
     */
    this.mimeType = response.getHeaders()['Content-Type'];
}

/**
 *
 * @returns {string}
 */
DexiBinaryResponse.prototype.getData = function() {
    return this.data;
};

/**
 *
 * @returns {string}
 */
DexiBinaryResponse.prototype.getMimeType = function() {
    return this.mimeType;
};

module.exports = DexiBinaryResponse;