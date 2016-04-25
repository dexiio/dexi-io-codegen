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
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('default', ['jshint', 'generate', 'test']);

	grunt.registerMultiTask('generate', 'Generate source code', function () {
		var definition = ApiDefinition.load();
		var generator = require(this.data.baseClass);
		generator.generate(definition, this.data.destDir);
	});

	grunt.registerMultiTask('test', 'Testing generated source code', function () {
		var generator = require(this.data.baseClass);
		generator.test(this.data.destDir);
	});

};
