var fs = require('fs');
var path = require('path');

module.exports = function () {

	var rm = function (path) {
		if (fs.existsSync(path)) {
			fs.readdirSync(path).forEach(function (file, index) {
				var curPath = path + "/" + file;
				if (fs.lstatSync(curPath).isDirectory()) { // recurse
					rm(curPath);
				} else { // delete file
					fs.unlinkSync(curPath);
				}
			});
			fs.rmdirSync(path);
		}
	};

	var mkdir = function (path) {
        var parts = path.split(/\//g);
        var dir = parts.shift();

        parts.forEach(function(part) {
            dir += '/' + part;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
        });

	};

	var cp = function (src, dest) {
		var exists = fs.existsSync(src);
		var stats = exists && fs.statSync(src);
		var isDirectory = exists && stats.isDirectory();
		if (exists && isDirectory) {
			fs.mkdirSync(dest);
			fs.readdirSync(src).forEach(function (childItemName) {
				cp(path.join(src, childItemName), path.join(dest, childItemName));
			});
		} else {
			fs.linkSync(src, dest);
		}
	};

	var exists = function (dest) {
		return fs.existsSync(dest);
	};

	var read = function (path) {
		return fs.readFileSync(path, 'utf8');
	};

	var write = function (path, content) {
		fs.writeFileSync(path, content);
	};

	return {
		cp: cp,
		rm: rm,
		exists: exists,
		mkdir: mkdir,
		read: read,
		write: write
	};
}();
