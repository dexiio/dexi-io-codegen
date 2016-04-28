var log = require('./logger');
var _ = require('lodash');
var fileUtil = require('./FileUtil');
var execSync = require('child_process').execSync;
var handlebars = require('handlebars');

handlebars.registerHelper('equal', function (lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if (lvalue != rvalue) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
});

handlebars.registerHelper('join', function (delimiter, arr, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper join needs 2 parameters");
    return new handlebars.SafeString(arr.join(delimiter));
});

handlebars.registerHelper('curly', function (str, options) {

    return new handlebars.SafeString('{' + str + '}');
});

handlebars.registerHelper('stringList', function (arr, options) {

    if (arr.length === 0) {
        return '';
    }

    if (arr.length === 1) {
        return new handlebars.SafeString('"' + arr[0] + '"');
    }

    var last = arr.pop();
    return new handlebars.SafeString(arr.join('", "') + ' or "' + last + '"');
});

function AbstractGenerator(definition, destDir) {
    this.name = 'AbstractGenerator';
    this.definition = definition;
    this.destDir = destDir;
    this.sourceDir = null;
    this.templatesDir = null;

    this.TYPE_UUID = 'UUID';
    this.TYPE_STRING = 'String';
    this.TYPE_BOOL = 'Boolean';
    this.TYPE_INT = 'Integer';
    this.TYPE_LONG = 'Long';
    this.TYPE_BINARY = 'byte[]';
    this.TYPE_MAP = 'Map<String,Object>';

    this.models = [];
    this.controllers = [];
    this.sources = [];
};

AbstractGenerator.prototype = {
    MODEL_TYPE_CLASS: 'class',
    MODEL_TYPE_LIST: 'list',
    MODEL_TYPE_MAP: 'map'
};

AbstractGenerator.prototype.getTemplate = function(path) {
    return handlebars.compile(fileUtil.read(this.templatesDir + '/' + path));
};

AbstractGenerator.prototype.preProcess = function () {
    var me = this;
	log.debug('Copying files from ', this.sourceDir, 'to', this.destDir);

	if (fileUtil.exists(this.destDir)) {
		log.debug('Destination directory exists, deleting..');
		fileUtil.rm(this.destDir);
	}

	fileUtil.mkdir(this.destDir);

	_.each(this.sources, function (filename) {
		fileUtil.cp(me.sourceDir + '/' + filename, me.destDir + '/' + filename);
	});
};


AbstractGenerator.prototype.generateModels = function () {
	throw 'Method not implemented';
};

AbstractGenerator.prototype.generateControllers = function () {
	throw 'Method not implemented';
};

AbstractGenerator.prototype.generateMain = function () {
	throw 'Method not implemented';
};

AbstractGenerator.prototype.getControllerFromName = function(name) {
    return {
        name: name,
        className: _.upperFirst(_.camelCase(name)) + 'Controller',
        methods: [],
        imports: []
    };
};

AbstractGenerator.prototype.getModelFromName = function(name) {
    var className = _.upperFirst(_.camelCase(name));
    return {
        name: name,
        className: className,
        type: this.MODEL_TYPE_CLASS,
        import: this.getImportPathForClass('models',className)
    };
};

AbstractGenerator.prototype.getImportPathForClass = function(type, className) {
    return type + '/' + className;
};


AbstractGenerator.prototype.toArrayModel = function(className) {
    return className + '[]';
};

AbstractGenerator.prototype.getModel = function(className) {
    return _.find(this.models, {className: className});
};

/**
 * Parses parameters and return types into something that can be generated as code
 * @param definition
 * @returns {*}
 */
AbstractGenerator.prototype.parseModelReference = function(definition) {
    var model = {};
    if (definition.schema && definition.schema.$ref) {
        return this.getModelFromName(definition.schema.$ref.replace('#/definitions/', ''));
    }
    if (definition.type === 'string' &&
        definition.format === 'uuid') {
        model.className = this.TYPE_UUID;
    } else if (definition.type === 'string' &&
        definition.format === 'byte') {
        model.className = this.TYPE_BINARY;
        model.isBinary = true;
    } else if (definition.type === 'string') {
        model.className = this.TYPE_STRING;
    } else if (definition.type === 'integer') {
        model.className = this.TYPE_INT;
    } else if (definition.type === 'boolean') {
        model.className = this.TYPE_BOOL;
    } else if (definition.type === 'array' && definition.items) {
        var listType = this.getListType(definition);
        model.import = null;
        model.className = this.toArrayModel(listType);
    } else {
        log.error('Unsupported object type', definition);
        throw 'Unsupported object type: ' + JSON.stringify(definition);
    }

    return model;
};

AbstractGenerator.prototype.getListType = function(definition) {
    if (definition.additionalProperties) {
        return this.TYPE_MAP;
    }
    if (definition.items.$ref) {
        return this.getModelFromName(definition.items.$ref.replace('#/definitions/', '')).className;
    } else if (definition.items.type) {
        return this.parseModelReference(definition.items).className;
    }

    throw 'Unsupported list type: ' + JSON.stringify(definition);
};

/**
 * Parse model definitions
 * @param definition
 */
AbstractGenerator.prototype.parseModel = function(modelName, definition) {
    var me = this;
    var model = _.cloneDeep(definition);
    model = _.assignIn(this.getModelFromName(modelName), model);
    model.fields = [];
    model.imports = [];

    if (model.type === 'array') {
        model.type = this.MODEL_TYPE_LIST;
        model.listType = this.getListType(definition);

    } else if (model.additionalProperties) {
        model.type = this.MODEL_TYPE_MAP;
    }

    _.each(definition.properties, function (definition, name) {
        var field = me.getFieldFromType(definition, name);
        if (!field.className) {
            log.error('Unsupported object type: ' + definition.type);
            throw 'Unsupported object type: ' + definition.type;
        }

        if (field.fieldName === 'id') {
            model.hasId = true;
        }

        if (field.import && !_.includes(model.imports, field.import)) {
            model.imports.push(field.import);
        }

        model.fields.push(field);
    });

    return model;
};

AbstractGenerator.prototype.ensureEnumModel = function(definition, name) {

    var out = this.getModelFromName(name);

    if (!_.find(this.models, {className: out.className})) {
        log.debug('Adding enum for', out.className);
        var model = _.cloneDeep(out);
        model.name = out.className;
        model.type = 'enum';
        model.enum = definition.enum;
        this.models.push(model);
    }

    return out;
};

AbstractGenerator.prototype.getFieldFromType = function(definition, name) {
    var field = _.cloneDeep(definition);
    if (definition.enum) {
        field = _.assignIn(this.ensureEnumModel(definition, name), field);
    } else {
        field = _.assignIn(this.parseModelReference(definition), field);
    }
    field.fieldName = _.camelCase(name);
    field.paramName = name;
    field.getterName = this.getGetterForField(field);
    field.setterName = this.getSetterForField(field);

    return field;
};

/**
 * Genereate getter name for field
 * @param field
 * @returns {string}
 */
AbstractGenerator.prototype.getGetterForField = function(field) {
    var getterPrefix = 'get';
    if (field.className === this.TYPE_BOOL) {
        getterPrefix = 'is';
    }
    return getterPrefix + _.upperFirst(field.fieldName);
};

/**
 * Generate setter name for field
 * @param field
 * @returns {string}
 */
AbstractGenerator.prototype.getSetterForField = function(field) {
    return 'set' + _.upperFirst(field.fieldName);
};

/**
 * Parse all models
 */
AbstractGenerator.prototype.parseModels = function() {
    var me = this;
    var models = this.models = [];

    _.each(this.definition.definitions, function (definition, name) {
        models.push(me.parseModel(name, definition));
    });
};

AbstractGenerator.prototype.parseController = function(controllerName, definition) {
    var me = this;
    var controller = _.cloneDeep(definition);

    controller = _.assignIn(this.getControllerFromName(controllerName), controller);
    controller.methods = [];
    controller.imports = [];

    _.each(definition, function (methodDefinitions, path) {
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
                var modelRef = me.parseModelReference(param);
                param.className = modelRef.className;
                if (modelRef.import) {
                    param.import = modelRef.import;
                }
                param.name = _.camelCase(param.name);

                method.parameters.push(param);

                if (param.in === 'body') {
                    method.hasBody = true;
                }

                if (param.import && !_.includes(controller.imports, param.import)) {
                    controller.imports.push(param.import);
                }
            });

            var responseDef = _.get(methodDefinition, 'responses[200]');
            if (responseDef && (responseDef.type || responseDef.schema)) {
                method.responseModel = me.parseModelReference(responseDef);
            }

            controller.methods.push(method);
        });
    });

    return controller;
};

/**
 * Parse all controllers
 */
AbstractGenerator.prototype.parseControllers = function() {
    var me = this;
    var controllers = {};
    _.each(this.definition.paths, function (pathDefinition, pathUrl) {
        log.debug('Processing path', pathUrl);
        var controllerName = pathUrl.split('/')[0];
        if (!controllers[controllerName]) {
            controllers[controllerName] = {};
        }
        var controller = controllers[controllerName];
        controller[pathUrl] = pathDefinition;
    });

    log.debug('Paths have been split into', Object.keys(controllers).length, 'controllers');

    var controllerList = [];
    _.each(controllers, function (pathDefinition, controllerName) {
        controllerList.push(me.parseController(controllerName, pathDefinition));
    });

    this.controllers = controllerList;
};

AbstractGenerator.prototype.generate = function () {
	log.debug('Generating source code for', this.name);

    log.debug('Reading models');
    this.parseModels();

    log.debug('Reading controllers');
    this.parseControllers();

    log.debug('Preprocessing');
	this.preProcess();

    log.debug('Generating models');
	this.generateModels();

    log.debug('Generating controllers');
	this.generateControllers();

    log.debug('Generating main file');
	this.generateMain();

    log.debug('Source generation done for', this.name);
};

AbstractGenerator.prototype.test = function () {
    log.debug('Testing generated code for', this.name);

    execSync("sh " + this.destDir + "/test.sh", {stdio: [0, 1, 2]});
};


module.exports = AbstractGenerator;
