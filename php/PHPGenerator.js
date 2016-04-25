var util = require('util');
var log = require('../logger');
var sys = require('sys');
var execSync = require('child_process').execSync;
var _ = require('LoDash');
var handlebars = require('handlebars');
var fileUtil = require('../FileUtil');
var AbstractGenerator = require('../AbstractGenerator');
var controllerGenerator = require('./PHPControllerGenerator');

function PHPGenerator() {
	AbstractGenerator.apply(this, arguments);
	this.name = 'PHPGenerator';
}

util.inherits(PHPGenerator, AbstractGenerator);

var SRC_DIR = __dirname + '/source';

PHPGenerator.preProcess = function (destDir) {
	log.debug('Copying files from ', SRC_DIR, 'to', destDir);

	if (fileUtil.exists(destDir)) {
		log.debug('Destination directory exists, deleting..');
		fileUtil.rm(destDir);
	}
	fileUtil.mkdir(destDir);
	_.each(['dexi', 'composer.json', 'test.sh'], function (filename) {
		fileUtil.cp(SRC_DIR + '/' + filename, destDir + '/' + filename);
	});
};

PHPGenerator.generateModels = function (definition, destDir) {
	log.debug('No model generation for PHP');
};

PHPGenerator.generateControllers = function (definition, destDir) {
	log.debug('Generating controllers');
	var controllers = {};
	_.each(definition.paths, function (pathDefinition, pathUrl) {
		log.debug('Processing path', pathUrl);
		var controllerName = pathUrl.split('/')[0];
		if (!controllers[controllerName]) {
			controllers[controllerName] = {};
		}
		var controller = controllers[controllerName];
		controller[pathUrl] = pathDefinition;
	});
	log.debug('Paths have been split into', Object.keys(controllers).length, 'controllers');

	var controllersDir = destDir + '/dexi/controllers';
	_.each(controllers, function (pathDefinition, controllerName) {
		controllerGenerator.generateController(pathDefinition, controllerName, controllersDir);
	});
};

PHPGenerator.generate = function (definition, destDir) {
	this.super_.generate.apply(this, arguments);
};

PHPGenerator.test = function (destDir) {
	log.debug('Testing generated code for', this.name);

	execSync("sh " + destDir + "/test.sh", {stdio: [0, 1, 2]});
};

module.exports = PHPGenerator;
