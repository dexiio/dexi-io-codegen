var log = require('./logger');
var _ = require('LoDash');
var ApiDefinition = require('./ApiDefinition');
var TestServer = require('./TestServer');

module.exports = function (grunt) {

	grunt.initConfig({
		jshint: {
			files: ['**/*.js', '!node_modules/**/*.js', '!output/**/*.js']
		},
		generate: {
			python: {
				baseClass: './python/PythonGenerator',
				destDir: './python/dist'
			},
			java: {
				baseClass: './java/JavaGenerator',
				destDir: './java/dist'
			},
			php: {
				baseClass: './php/PHPGenerator',
				destDir: './php/dist'
			},
			nodejs: {
				baseClass: './nodejs/NodeJSGenerator',
				destDir: './nodejs/dist'
			},
            dotnet: {
                baseClass: './dotnet/DotNetGenerator',
                destDir: './dotnet/dist'
            }
		},
        test_language: {
			python: {
				baseClass: './python/PythonGenerator',
				destDir: './python/dist'
			},
			java: {
				baseClass: './java/JavaGenerator',
				destDir: './java/dist'
			},
			php: {
				baseClass: './php/PHPGenerator',
				destDir: './php/dist'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('default', ['jshint', 'generate', 'test']);

	grunt.registerMultiTask('generate', 'Generate source code', function () {
		var definition = ApiDefinition.load();
		var GeneratorType = require(this.data.baseClass);

		var generator = new GeneratorType(definition, this.data.destDir);

		generator.generate();
	});

	grunt.registerMultiTask('test_language', 'Testing generated source code', function () {
        var definition = ApiDefinition.load();
		var GeneratorType = require(this.data.baseClass);

        var generator = new GeneratorType(definition, this.data.destDir);

        var done = this.async();

		generator.test().then(done).catch(done).done();
	});


    grunt.registerTask('test', [
        'test_server_start',
        'generate:java',
        'test_language:java',
        'test_server_stop'
    ]);

    var testServer;

    grunt.registerTask('test_server_start', 'Start test server', function () {
        if (testServer) {
            return;
        }
        var definition = ApiDefinition.load();

        var done = this.async();
        testServer = new TestServer(definition, 32432);
        testServer.start().then(done).catch(done).done();
    });

    grunt.registerTask('test_server_stop', 'Stop test server', function () {
        if (!testServer) {
            return;
        }
        var done = this.async();
        testServer.stop().then(done).catch(done).done();
    });

};
