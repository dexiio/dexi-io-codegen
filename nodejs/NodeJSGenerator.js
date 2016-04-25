var util = require('util');
var log = require('../logger');
var sys = require('sys');
var execSync = require('child_process').execSync;
var _ = require('LoDash');
var handlebars = require('handlebars');
var fileUtil = require('../FileUtil');
var AbstractGenerator = require('../AbstractGenerator');
var controllerGenerator = require('./NodeJSControllerGenerator');

function NodeJSGenerator() {
	AbstractGenerator.apply(this, arguments);
	this.name = 'NodeJSGenerator';
}

util.inherits(NodeJSGenerator, AbstractGenerator);

var SRC_DIR = __dirname + '/source';

NodeJSGenerator.preProcess = function (destDir) {
	log.debug('Copying files from ', SRC_DIR, 'to', destDir);

	if (fileUtil.exists(destDir)) {
		log.debug('Destination directory exists, deleting..');
		fileUtil.rm(destDir);
	}
	fileUtil.mkdir(destDir);
	_.each(['dexi', 'package.json', 'test.sh'], function (filename) {
		fileUtil.cp(SRC_DIR + '/' + filename, destDir + '/' + filename);
	});
};

NodeJSGenerator.generateModels = function (definition, destDir) {
	log.debug('No model generation for PHP');
};

NodeJSGenerator.generateControllers = function (definition, destDir) {
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

NodeJSGenerator.generate = function (definition, destDir) {
	this.super_.generate.apply(this, arguments);
};

NodeJSGenerator.test = function (destDir) {
	log.debug('Testing generated code for', this.name);

	execSync("sh " + destDir + "/test.sh", {stdio: [0, 1, 2]});
};

module.exports = NodeJSGenerator;
