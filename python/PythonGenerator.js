var util = require('util');
var log = require('../logger');
var handlebars = require('handlebars');
var fileUtil = require('../FileUtil');
var AbstractGenerator = require('../AbstractGenerator');

function PythonGenerator() {
	AbstractGenerator.apply(this, arguments);
	this.name = 'PythonGenerator';
	this.sourceDir = __dirname + '/source';
	this.templatesDir = this.sourceDir + '/templates';
	this.sources = ['dexi','test.py','test.sh','__init__.py'];
}

util.inherits(PythonGenerator, AbstractGenerator);

PythonGenerator.prototype.generateModels = function () {
	var modelsDir = this.destDir + '/dexi/models';

	fileUtil.mkdir(modelsDir);

	this.models.forEach(function(model) {

		var template;
		switch(model.type) {
			case 'class':
				template = this.getTemplate('models/base_model.handlebars');
				break;
			case 'list':
				template = this.getTemplate('models/list_model.handlebars');
				break;
			case 'map':
				template = this.getTemplate('models/map_model.handlebars');
				break;
			case 'enum':
				template = this.getTemplate('models/enum.handlebars');
				break;
			default:
				throw new Exception('Unknown model type: ' + model.type);
		}

		log.debug('Generating model for', model.name);
		var modelPath = modelsDir + '/' + model.className + '.py';

		fileUtil.write(modelPath, template({
			model: model
		}));

	}, this);
};

PythonGenerator.prototype.generateControllers = function () {

	var controllersDir = this.destDir + '/dexi/controllers';

	fileUtil.mkdir(controllersDir);

	var template = this.getTemplate('controller.handlebars');

	this.controllers.forEach(function(controller) {
		log.debug('Generating controller for', controller.name);
		var controllerPath = controllersDir + '/' + controller.className + '.py';

		fileUtil.write(controllerPath, template({
			controller: controller
		}));

	}, this);
};

PythonGenerator.prototype.toArrayModel = function(className) {
	return 'List<' + className + '>';
};


PythonGenerator.prototype.generateMain = function() {
	var mainFile = this.destDir + '/dexi/dexi.py';

	var template = this.getTemplate('main.handlebars');

	fileUtil.write(mainFile, template({
		controllers: this.controllers,
		models: this.models
	}));
};


module.exports = PythonGenerator;
