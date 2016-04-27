/**
 *
 * @param msg {string}
 * @param url {string}
 * @param response {string}
 * @constructor
 */
function DexiAPIException (msg, url, response) {
    Exception.call(this, msg);

    this.response = response;
    this.url = url;

}

DexiAPIException.prototype = Object.create(Exception);


/**
 *
 * @returns {string}
 */
DexiAPIException.getResponse = function() {
    return this.response;
};

/**
 *
 * @returns {string}
 */
DexiAPIException.getUrl = function() {
    return this.url;
};

module.exports = DexiAPIException;