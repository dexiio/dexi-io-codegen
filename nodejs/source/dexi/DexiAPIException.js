
function DexiAPIException (msg, url, response) {
    Exception.call(this, msg);

    this.response = response;
    this.url = url;

}

DexiAPIException.prototype = Object.create(Exception);


DexiAPIException.getResponse = function() {
    return this.response;
};

DexiAPIException.getUrl = function() {
    return this.url;
};

module.exports = DexiAPIException;