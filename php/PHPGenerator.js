var util = require('util');
var log = require('../logger');
var _ = require('LoDash');
var handlebars = require('handlebars');
var fileUtil = require('../FileUtil');
var AbstractGenerator = require('../AbstractGenerator');

function PHPGenerator() {
	AbstractGenerator.apply(this, arguments);
	this.name = 'PHPGenerator';
	this.sources = ['dexi','composer.json','test.sh'];
    this.sourceDir = __dirname + '/source';
    this.templatesDir = this.sourceDir + '/templates';

	this.TYPE_UUID = 'string';
	this.TYPE_STRING = 'string';
	this.TYPE_BOOL = 'boolean';
	this.TYPE_INT = 'integer';
	this.TYPE_LONG = 'long';
	this.TYPE_BINARY = 'DexiBinaryResponse';
	this.TYPE_MAP = 'object';
}

util.inherits(PHPGenerator, AbstractGenerator);

PHPGenerator.prototype.generateModels = function () {
	var template = this.getTemplate('model.handlebars');

    var modelsDir = this.destDir + '/dexi/models';

    fileUtil.mkdir(modelsDir);

    this.models.forEach(function(model) {
        if (model.type !== 'class') {
            return;
        }

        log.debug('Generating model for', model.name);
        var modelPath = modelsDir + '/' + model.className + '.php';

        fileUtil.write(modelPath, template({
            model: model
        }));

    }, this);
};
PHPGenerator.prototype.parseModelReference = function(definition) {
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

PHPGenerator.prototype.ensureEnumModel = function(definition) {
    var out = this.parseModelReference(definition);
    out.className = this.TYPE_STRING;
    return out;
};

PHPGenerator.prototype.generateControllers = function () {

	var controllersDir = this.destDir + '/dexi/controllers';

    fileUtil.mkdir(controllersDir);

    var template = this.getTemplate('controller.handlebars');

    this.controllers.forEach(function(controller) {
        log.debug('Generating controller for', controller.name);
        var controllerPath = controllersDir + '/' + controller.className + '.php';

        fileUtil.write(controllerPath, template({
            controller: controller
        }));

    }, this);

};

PHPGenerator.prototype.generateMain = function() {
    var mainFile = this.destDir + '/dexi/Dexi.php';

    var template = this.getTemplate('main.handlebars');

    log.debug('Generating main for PHP');

    fileUtil.write(mainFile, template({
        controllers: this.controllers,
        models: this.models
    }));
};

module.exports = PHPGenerator;
