var log = require('../logger');
var _ = require('LoDash');
var handlebars = require('handlebars');
var fileUtil = require('../FileUtil');
var modelGenerator = require('./DotNetModelGenerator');

var TEMPLATES_DIR = __dirname + '/source/templates';

function getControllerFromName(name) {
	return {
		className: _.upperFirst(_.camelCase(name)) + 'Controller'
	};
}

function generateController(pathDefinition, controllerName, destDir) {
	log.debug('Generating controller for', controllerName);
	var controller = getControllerFromName(controllerName);
	controller.methods = [];
	controller.imports = [];

	_.each(pathDefinition, function (methodDefinitions, path) {
		_.each(methodDefinitions, function (methodDefinition, methodType) {
			var method = _.cloneDeep(methodDefinition);
			method.name = _.camelCase(methodDefinition.operationId);
			if (_.indexOf(['continue', 'delete'], method.name) != -1) {
				method.name += '_';
			}
			method.type = methodType.toUpperCase();
			method.path = path;
			method.parameters = [];
			// we'll use all method parameters except for `body` as query parameters
			_.each(methodDefinition.parameters, function (paramDefinition) {
				var param = _.cloneDeep(paramDefinition);
				param.requestParam = param.name;
				var model = modelGenerator.getModelFromDefinition(param);
				param.className = model.className;
				if (model.import) {
					param.import = model.import;
				}
				param.name = _.camelCase(param.name);
				if (param.name !== 'body') {
					method.parameters.push(param);
				} else {
					method.hasBody = true;
					method.bodyClassName = param.className;
				}
				if (param.import && !_.includes(controller.imports, param.import)) {
					controller.imports.push(param.import);
				}
			});
			var responseRef = _.get(methodDefinition, 'responses[200].schema.$ref');
			if (responseRef) {
				var responseModelName = _.last(responseRef.split('/'));
				method.responseModel = modelGenerator.getLocalModelFromName(responseModelName);
				if (method.responseModel.import && !_.includes(controller.imports, method.responseModel.import)) {
					controller.imports.push(method.responseModel.import);
				}
			}
			if (method.type === 'GET' && !method.responseModel) {
				method.responseModel = {
					className: 'byte[]'
				};
			}
			controller.methods.push(method);
		});
	});

	handlebars.registerHelper('equal', function (lvalue, rvalue, options) {
		if (arguments.length < 3)
			throw new Error("Handlebars Helper equal needs 2 parameters");
		if (lvalue != rvalue) {
			return options.inverse(this);
		} else {
			return options.fn(this);
		}
	});

	var template = handlebars.compile(fileUtil.read(TEMPLATES_DIR + '/controllers/controller.handlebars'));
	fileUtil.write(destDir + '/' + controller.className + '.cs', template({
		controller: _.assignIn(pathDefinition, controller)
	}));
}

module.exports = {
	getControllerFromName: getControllerFromName,
	generateController: generateController
};
