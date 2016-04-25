var log = require('../logger');
var _ = require('LoDash');
var handlebars = require('handlebars');
var fileUtil = require('../FileUtil');

var TEMPLATES_DIR = __dirname + '/source/templates';

function getLocalModelFromName(name) {
	var className = _.upperFirst(_.camelCase(name));
	return {
		className: className,
		import: 'com.dexi.client.models.' + className
	};
}

function getModelFromDefinition(definition, name) {
	var model = {};
	if (definition.schema && definition.schema.$ref) {
		var className = getLocalModelFromName(definition.schema.$ref.replace('#/definitions/', '')).className;
		model.className = className;
		model.import = 'com.dexi.client.models.' + className;
	} else if (definition.type === 'string' && definition.format === 'uuid') {
		model.import = 'java.util.UUID';
		model.className = 'UUID';
	} else if (definition.type === 'string') {
		model.className = 'String';
	} else if (definition.type === 'integer') {
		model.className = 'Long';
	} else if (definition.type === 'boolean') {
		model.className = 'Boolean';
	} else if (definition.type === 'array') {
		if (definition.items.$ref) {
			var arrayItemType = definition.items.$ref.replace('#/definitions/', '');
			model.import = 'java.util.List';
			model.className = 'List<' + getLocalModelFromName(arrayItemType).className + '>';
		} else if (definition.items && definition.items.type) {
			model.import = 'java.util.List';
			if (name === 'rows') {
				// TODO: fix swagger definition.
				// According to it, there should be a list of strings, but in fact there is a list of lists of strings.
				model.className = 'List<List<String>>';
			} else {
				model.className = 'List<' + getModelFromDefinition({type: definition.items.type}).className + '>';
			}
		}
	} else {
		log.error('Unsupported object type', definition);
		throw 'Unsupported object type: ' + JSON.stringify(definition);
	}
	return model;
}

function generateModel(definition, name, destDir) {
	log.debug('Generating model for', name);
	var model = _.cloneDeep(definition);
	model = _.assignIn(getLocalModelFromName(name), model);
	model.fields = [];
	model.imports = [];
	if (definition.type === 'array') {
		if (definition.additionalProperties) {
			model.template = 'list_model';
			model.listType = 'MapModel';
		} else {
			log.info('Skipping unsupported array model', name);
			return;
		}
	} else if (model.additionalProperties) {
		model.template = 'map_model';
	} else {
		model.template = 'base_model';
	}

	function getFieldFromType(definition, name, destDir) {
		var field = _.cloneDeep(definition);
		if (definition.enum) {
			field = _.assignIn(generateEnum(definition, name, destDir), field);
		} else {
			field = _.assignIn(getModelFromDefinition(definition, name), field);
		}
		field.fieldName = _.camelCase(name);
		field.paramName = name;
		field.getterName = 'get' + _.upperFirst(field.fieldName);
		field.setterName = 'set' + _.upperFirst(field.fieldName);
		if (field.fieldName === 'id') {
			model.hasId = true;
		}
		return field;
	}

	_.each(definition.properties, function (definition, name) {
		var field = getFieldFromType(definition, name, destDir);
		if (!field.className) {
			log.error('Unsupported object type: ' + definition.type);
			throw 'Unsupported object type: ' + definition.type;
		}
		if (field.import && !_.includes(model.imports, field.import)) {
			model.imports.push(field.import);
		}
		model.fields.push(field);
	});

	var template = handlebars.compile(fileUtil.read(TEMPLATES_DIR + '/models/' + model.template + '.handlebars'), {noEscape: true});
	fileUtil.write(destDir + '/' + model.className + '.java', template({
		model: _.assignIn(definition, model)
	}));
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
	getModelFromDefinition: getModelFromDefinition,
	generateModel: generateModel,
	generateEnum: generateEnum
};
