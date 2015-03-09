var Promise = require('bluebird');
var fs = require('fs');
var mkdirp = require('mkdirp');
var config = require('./config');
var path = require('path');

var writeFile = Promise.promisify(require("fs").writeFile);

//保存文件到config中的path目录下
exports.saveData = function(filename ,data ){
	var dataDir = path.join(__dirname,config.path);
	if(!fs.existsSync(dataDir)){
		mkdirp.sync(dataDir);
	}
	var filePath = path.join(dataDir,filename);
	return writeFile(filePath,data);
};

