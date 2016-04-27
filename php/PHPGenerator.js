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
	log.debug('No model generation for PHP');
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
