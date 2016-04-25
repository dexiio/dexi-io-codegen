var log = require('../logger');
var _ = require('LoDash');
var handlebars = require('handlebars');
var fileUtil = require('../FileUtil');

var TEMPLATES_DIR = __dirname + '/source/templates';

function getLocalModelFromName(name) {
	var className = _.upperFirst(_.camelCase(name));
	return {
		className: className,
		import: 'models/' + className + '.php'
	};
}

function getModelFromDefinition(definition, name) {
	var model = {};
	if (definition.schema && definition.schema.$ref) {
		var className = getLocalModelFromName(definition.schema.$ref.replace('#/definitions/', '')).className;
		model.className = className;
		model.import = 'models/' + className + '.php';
	} else if (definition.type === 'string' && definition.format === 'uuid') {
		model.className = 'string';
	} else if (definition.type === 'string') {
		model.className = 'string';
	} else if (definition.type === 'integer') {
		model.className = 'long';
	} else if (definition.type === 'boolean') {
		model.className = 'boolean';
	} else if (definition.type === 'array') {
		if (definition.items.$ref) {
			var arrayItemType = definition.items.$ref.replace('#/definitions/', '');
			model.import = null;
			model.className = getLocalModelFromName(arrayItemType).className + '[]';
		} else if (definition.items && definition.items.type) {
			model.import = null;
			if (name === 'rows') {
				// TODO: fix swagger definition.
				// According to it, there should be a list of strings, but in fact there is a list of lists of strings.
				model.className = 'string[][]';
			} else {
				model.className = getModelFromDefinition({type: definition.items.type}).className + '[]';
			}
		}
	} else {
		log.error('Unsupported object type', definition);
		throw 'Unsupported object type: ' + JSON.stringify(definition);
	}
	return model;
}

function generateEnum(definition, name, destDir) {
	log.debug('Generating enum for', name);
	var model = getLocalModelFromName(name);
	var modelTemplate = handlebars.compile(fileUtil.read(TEMPLATES_DIR + '/models/enum.handlebars'));
	fileUtil.write(destDir + '/' + model.className + '.java', modelTemplate({
		model: _.assignIn(definition, model)
	}));
	return model;
}

module.exports = {
	getLocalModelFromName: getLocalModelFromName,
	getModelFromDefinition: getModelFromDefinition
};
