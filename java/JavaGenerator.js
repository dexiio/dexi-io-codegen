var util = require('util');
var log = require('../logger');
var handlebars = require('handlebars');
var fileUtil = require('../FileUtil');
var AbstractGenerator = require('../AbstractGenerator');

function JavaGenerator() {
	AbstractGenerator.apply(this, arguments);
	this.name = 'JavaGenerator';
}

util.inherits(JavaGenerator, AbstractGenerator);

JavaGenerator.prototype.generateModels = function () {
	log.debug('Generating models');

	var modelsDir = this.destDir + '/src/main/java/io/dexi/client/models';

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
        var modelPath = modelsDir + '/' + model.className + '.java';

        fileUtil.write(modelPath, template({
            model: model
        }));

	}, this);
};

JavaGenerator.prototype.generateControllers = function () {

    var controllersDir = this.destDir + '/src/main/java/io/dexi/client/controllers';

    fileUtil.mkdir(controllersDir);

    var template = this.getTemplate('controller.handlebars');

    this.controllers.forEach(function(controller) {
        log.debug('Generating controller for', controller.name);
        var controllerPath = controllersDir + '/' + controller.className + '.java';

        fileUtil.write(controllerPath, template({
            controller: controller
        }));

    }, this);
};

NodeJSGenerator.prototype.generateMain = function() {
    var mainFile = this.destDir + '/src/main/java/io/dexi/client/Dexi.java';

    var template = this.getTemplate('main.handlebars');

    fileUtil.write(mainFile, template({
        controllers: this.controllers,
        models: this.models
    }));
};


module.exports = JavaGenerator;
