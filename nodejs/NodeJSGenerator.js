var util = require('util');
var log = require('../logger');
var _ = require('LoDash');
var handlebars = require('handlebars');
var fileUtil = require('../FileUtil');
var AbstractGenerator = require('../AbstractGenerator');

function NodeJSGenerator() {
	AbstractGenerator.apply(this, arguments);
	this.name = 'NodeJSGenerator';
	this.sources = ['dexi','package.json','test.sh'];
	this.sourceDir = __dirname + '/source';
	this.templatesDir = this.sourceDir + '/templates';

	this.TYPE_UUID = 'string';
	this.TYPE_STRING = 'string';
	this.TYPE_BOOL = 'boolean';
	this.TYPE_INT = 'number';
	this.TYPE_LONG = 'number';
	this.TYPE_BINARY = 'DexiBinaryResponse';
	this.TYPE_MAP = 'object';
}

util.inherits(NodeJSGenerator, AbstractGenerator);

NodeJSGenerator.prototype.generateModels = function () {
	var template = this.getTemplate('model.handlebars');

	var modelsDir = this.destDir + '/dexi/models';

	fileUtil.mkdir(modelsDir);

	this.models.forEach(function(model) {
		if (model.type !== 'class') {
			return;
		}

		log.debug('Generating model for', model.name);
		var modelPath = modelsDir + '/' + model.className + '.js';

		fileUtil.write(modelPath, template({
			model: model
		}));

	}, this);
};
NodeJSGenerator.prototype.parseModelReference = function(definition) {
	var out = AbstractGenerator.prototype.parseModelReference.apply(this, arguments);
	if (out.type === 'class') {
		var model = this.getModel(out.className);
		if (model && model.additionalProperties) {
			var objectModel = {
				name: this.TYPE_MAP,
				className: this.TYPE_MAP,
				type: this.MODEL_TYPE_MAP,
				import: null
			};

			if (model.type === this.MODEL_TYPE_LIST) {
				objectModel.className = this.toArrayModel(objectModel.className)
			}

			return objectModel;
		}

	}

	return out;
};

NodeJSGenerator.prototype.ensureEnumModel = function(definition) {
	var out = this.parseModelReference(definition);
	out.className = this.TYPE_STRING;
	return out;
};

NodeJSGenerator.prototype.generateControllers = function () {

	var controllersDir = this.destDir + '/dexi/controllers';

	fileUtil.mkdir(controllersDir);

	var template = this.getTemplate('controller.handlebars');

	this.controllers.forEach(function(controller) {
		log.debug('Generating controller for', controller.name);
		var controllerPath = controllersDir + '/' + controller.className + '.js';

		fileUtil.write(controllerPath, template({
			controller: controller
		}));

	}, this);

};

NodeJSGenerator.prototype.generateMain = function() {
	var mainFile = this.destDir + '/dexi/index.js';

	var template = this.getTemplate('main.handlebars');

	log.debug('Generating main for NodeJS');

	fileUtil.write(mainFile, template({
		controllers: this.controllers,
		models: this.models
	}));
};

module.exports = NodeJSGenerator;
