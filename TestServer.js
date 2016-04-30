var _ = require('lodash');
var express = require('express');
var Q = require('q');
var bodyParser = require('body-parser')

function TestServer(swagger, port) {
    this.app = express();
    this.swagger = swagger;
    this.port = port;

    this.app.use(bodyParser.raw());

    this._parseSwaggerDefinition();
}

TestServer.prototype._checkAuth = function(request) {
    if (!request.headers['x-dexiio-access']) {
        return false;
    }

    return !!request.headers['x-dexiio-account'];

};

TestServer.prototype._verifyRefSchema = function(object, parameter) {

    if (!parameter.schema) {
        return object;
    }

    var schema = this._getRefSchema(parameter);

    this._verifySchema(object, schema);

    return object;
};

TestServer.prototype._verifySchema = function(object, schema) {
    return _.isEqual(object, this._getSchemaExample(schema));
};

TestServer.prototype._getSchemaExample = function(schema) {
    return schema.exampleOutput.json;
};

TestServer.prototype._getRefSchema = function(def) {
    if (!def.schema) {
        return;
    }
    var definitionId = def.schema.$ref.replace('#/definitions/','');

    return this.swagger.definitions[definitionId];
};


TestServer.prototype._sendResponse = function(responseDef, response) {
    if (responseDef.schema) {
        var schema = this._getRefSchema(responseDef);
        response.status(200).send(this._getSchemaExample(schema));
        return;
    }

    if (responseDef.type === 'string' &&
        responseDef.format === 'byte') {
        response.setHeader('Content-Type', 'text/plain');
        response.status(200).send('RESPONSE');
        return;
    }

    if (!responseDef.type) {
        response.status(200).send('OK');
        return;
    }

    throw 'Unable to determine response from type: ' + responseDef.type;
};


TestServer.prototype._verifyRequest = function(def, request) {
    var parms = {};
    if (def.parameters) {
        def.parameters.forEach(function(parameter) {
            var value;
            switch(parameter.in) {
                case 'body':
                    value = request.body;
                    break;
                case 'query':
                    value = request.query[parameter.name];
                    break;
                case 'path':
                    value = request.params[parameter.name];
                    break;
            }

            if (parameter.required &&
                value === undefined) {
                throw 'Required parameter not available: ' + parameter.name;
            }

            if (value !== undefined) {
                parms[parameter.name] = value;
            }
        }, this);
    }
};

TestServer.prototype._parseSwaggerDefinition = function() {
    var me = this;
    _.each(this.swagger.paths, function(methods, path) {
        path = '/' + path.replace(/\}/g,'').replace(/\{/g,':');
        _.each(methods, function(def, method) {
            console.log('## TEST SERVER HANDLES', method, path);
            me.app[method]( path, me._makeHandler(def));
        });
    });

    me.app.all('/*', function(req, resp) {
        console.log('## Endpoint Not available ', req.method, req.url);
        resp.status(404).send('Not found');
    })
};

TestServer.prototype._makeHandler = function(def) {
    return function(request, response) {

        console.log('## TEST SERVER GOT REQUEST', request.method, request.url);

        if (!this._checkAuth(request)) {
            response.status(401).send('Unauthorized');
            return;
        }

        try {
            this._verifyRequest(def, request);
        } catch(e) {
            response.status(500).send(e);
            return;
        }

        var responseDef = def.responses['200'] || {};

        this._sendResponse(responseDef, response);
    }.bind(this);
};


TestServer.prototype.start = function() {
    return Q.Promise(function(resolve, reject) {
        this.server = this.app.listen(this.port, function (err) {
            if (err) {
                reject(err);
                return;
            }

            resolve();
        });
    }.bind(this));

};


TestServer.prototype.stop = function() {
    return Q.Promise(function(resolve, reject) {
        if (!this.server) {
            resolve();
            return;
        }

        this.server.close(function(err) {
            if (err) {
                reject(err);
                return;
            }

            resolve();
        });
    }.bind(this));

};


module.exports = TestServer;