var fs = require('fs');
var path = require('path');
var log = require('./logger');

module.exports = function () {

	var load = function () {
		log.debug('Loading API definition');
		return require('./swagger2.json');
	};

	return {
		load: load
	};
}();
