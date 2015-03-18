var Promise = require('bluebird');
var fs = require('fs');
var mkdirp = require('mkdirp');
var config = require('./config');
var path = require('path');
var request = require('request');

var writeFile = Promise.promisify(require("fs").writeFile);

//将url中的:xxx 用 values.xxx 代替
exports.formatUrl = function(url , values){
	return url.replace(/\:(\w+)/g, function( match , key){
		if (values.hasOwnProperty(key)) {
		  return values[key];
		}
		return url;
	});
};

//保存文件到config中的path目录下
exports.saveData = function(filename ,data ){
	var dataDir = path.join(__dirname,config.path);
	if(!fs.existsSync(dataDir)){
		mkdirp.sync(dataDir);
	}
	var filePath = path.join(dataDir,filename);
	return writeFile(filePath,data);
};

//下载
exports.download = function(url){
	return new Promise(function(resolve, reject) {
			var data = '';
			var fileLength = 1;
			request.get({
				url: url,
				strictSSL: false
			}).on("response", function(response) {
				fileLength = parseInt(response.headers['content-length']);
				console.log("开始下载:"+url);
				console.log("file size : " + fileLength + "B");
			}).on("data", function(chunk) {
				data += chunk;
			}).on("end", function() {
				resolve(data);
				//关闭进度更新循环函数
				clearInterval(downloadProgress);
				console.log("下载中:            100%");
				console.log(url+"下载完毕");
			}).on("error", reject);
			//更新进度
			var lastLength = 0;
			var downloadProgress = setInterval(function() {
				var dataLength = data.length;
				var percent = parseInt(dataLength / fileLength * 100);
				var netSpeed = dataLength - lastLength;
				lastLength = dataLength;
				
				process.stdout.write("下载中:            "+percent + "%              " + dataLength + "/" + fileLength + "                " + netSpeed + "B/s             " + "\r");
			}, 1000);

	});
};

