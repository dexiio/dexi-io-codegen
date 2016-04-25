var log = require('../logger');
var _ = require('LoDash');
var handlebars = require('handlebars');
var fileUtil = require('../FileUtil');

var TEMPLATES_DIR = __dirname + '/source/templates';

function getLocalModelFromName(name) {
	var fileName = _.snakeCase(name);
	return {
		fileName: fileName,
		className: _.upperFirst(_.camelCase(name)),
		module: 'dexi.models.' + fileName
	};
}

function generateModel(definition, name, destDir) {
	log.debug('Generating model for', name);
	var model = getLocalModelFromName(name);
	model.fields = [];
	model.imports = [];

	if (definition.type === 'array') {
		model.template = 'list_model';
	} else if (definition.additionalProperties) {
		model.template = 'map_model';
	} else {
		model.template = 'base_model';
	}

	_.each(definition.properties, function (definition, name) {
		var field;
		if (definition.enum) {
			field = generateEnum(definition, name, destDir);
		} else {
			field = _.cloneDeep(definition);
		}
		field.fieldName = _.snakeCase(name);
		field.paramName = name;

		model.fields.push(field);
	});

	var template = handlebars.compile(fileUtil.read(TEMPLATES_DIR + '/models/' + model.template + '.handlebars'));
	fileUtil.write(destDir + '/' + model.fileName + '.py', template({
		model: _.assignIn(definition, model)
	}));
}

function generateEnum(definition, name, destDir) {
	log.debug('Generating enum for', name);
	var model = getLocalModelFromName(name);
	var modelTemplate = handlebars.compile(fileUtil.read(TEMPLATES_DIR + '/models/enum.handlebars'));
	fileUtil.write(destDir + '/' + model.fileName + '.py', modelTemplate({
		model: _.assignIn(definition, model)
	}));
	return model;
}

module.exports = {
	getLocalModelFromName: getLocalModelFromName,
	generateModel: generateModel,
	generateEnum: generateEnum
};
