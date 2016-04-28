var util = require('util');
var log = require('../logger');
var handlebars = require('handlebars');
var fileUtil = require('../FileUtil');
var AbstractGenerator = require('../AbstractGenerator');

function DotNetGenerator() {
	AbstractGenerator.apply(this, arguments);
	this.name = 'DotNetGenerator';
	this.sourceDir = __dirname + '/source';
	this.templatesDir = this.sourceDir + '/templates';
	this.sources = ['dexi'];
}

util.inherits(DotNetGenerator, AbstractGenerator);

DotNetGenerator.prototype.generateModels = function () {
	var modelsDir = this.destDir + '/dexi/models';

	fileUtil.mkdir(modelsDir);

	var template = this.getTemplate('model.handlebars');

	this.models.forEach(function(model) {

		log.debug('Generating model for', model.name);
		var modelPath = modelsDir + '/' + model.className + '.cs';

		fileUtil.write(modelPath, template({
			model: model
		}));

	}, this);
};

DotNetGenerator.prototype.generateControllers = function () {

	var controllersDir = this.destDir + '/dexi/controllers';

	fileUtil.mkdir(controllersDir);

	var template = this.getTemplate('controller.handlebars');

	this.controllers.forEach(function(controller) {
		log.debug('Generating controller for', controller.name);
		var controllerPath = controllersDir + '/' + controller.className + '.cs';

		fileUtil.write(controllerPath, template({
			controller: controller
		}));

	}, this);
};

DotNetGenerator.prototype.toArrayModel = function(className) {
	return 'List<' + className + '>';
};


DotNetGenerator.prototype.generateMain = function() {
	var mainFile = this.destDir + '/dexi/Dexi.cs';

	var template = this.getTemplate('main.handlebars');

	fileUtil.write(mainFile, template({
		controllers: this.controllers,
		models: this.models
	}));
};


module.exports = DotNetGenerator;
