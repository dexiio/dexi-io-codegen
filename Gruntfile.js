var log = require('./logger');
var _ = require('LoDash');
var ApiDefinition = require('./ApiDefinition');

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
		test: {
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

	grunt.registerMultiTask('test', 'Testing generated source code', function () {
        var definition = ApiDefinition.load();
		var GeneratorType = require(this.data.baseClass);

        var generator = new GeneratorType(definition, this.data.destDir);

		generator.test();
	});

};
