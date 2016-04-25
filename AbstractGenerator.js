var log = require('./logger');

function AbstractGenerator() {
	this.name = 'AbstractGenerator';
}

AbstractGenerator.preProcess = function (destDir) {
	throw 'Method not implemented';
};

AbstractGenerator.generateModels = function (definition, destDir) {
	throw 'Method not implemented';
};

AbstractGenerator.generateControllers = function (definition, destDir) {
	throw 'Method not implemented';
};

AbstractGenerator.generate = function (definition, destDir) {
	log.debug('Generating source code for', this.name);

	this.preProcess.call(this, destDir);
	this.generateModels.call(this, definition, destDir);
	this.generateControllers.call(this, definition, destDir);
};

AbstractGenerator.test = function () {
	throw 'Method not implemented';
};

module.exports = AbstractGenerator;
