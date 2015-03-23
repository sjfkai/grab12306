var Promise = require('bluebird');
var fs = require('fs');
var mkdirp = require('mkdirp');
var config = require('./config');
var path = require('path');
var request = require('request');
var logger = require('winston');

var writeFile = Promise.promisify(require("fs").writeFile);

//以队列形式保存数组为JSON文件的工具类
var ArraySaver = exports.ArraySaver = function(fileName) {

	this.q = []; //要保存的对象队列
	this.filePath = path.join(__dirname, config.path, fileName);
	this.isFirstRow = true; //第一行开头不写入逗号
	//timer
	this.isRunning = false;
	this.timer = null;

	//初始化 写入[
	var self = this;
	writeFile(this.filePath, "[\n").
	catch (function(err) {
		if ("ENOENT" === err.code) {
			mkdirp.sync(path.join(__dirname, config.path));
			return writeFile(self.filePath, "[");
		}
		return Promise.reject(err);
	});

};

ArraySaver.prototype.run = function() {
	if (this.isRunning) {
		return;
	}
	this.isRunning = true;
	var self = this;
	this.timer = setImmediate(function T() {
		var len = self.q.length;
		if (len <= 0) {
			self.isRunning = false;
			return;
		}

		var str = "";
		for (var i = 0; i < len; i++) {
			if(self.isFirstRow){
				self.isFirstRow = false;
				str +=  JSON.stringify(self.q[i]);
			}else{
				str +=  ",\n" + JSON.stringify(self.q[i]);
			}
		}
		//console.log(str);
		fs.appendFile(self.filePath, str);
		if (i > 0) {
			self.q.splice(0, i);
		}
		self.timer = setImmediate(T);
	});
};

ArraySaver.prototype.add = function(arr) {
	//console.log(arr);
	this.q = this.q.concat(arr);
	this.run();
};

ArraySaver.prototype.end = function() {
	//等待队列清空后写入 ]
	var self = this;
	setImmediate(function T() {
		if (self.q.length <= 0) {
			fs.appendFile(self.filePath, "]\n");
			return;
		}
		setImmediate(T);
	});
};


//将url中的:xxx 用 values.xxx 代替
exports.formatUrl = function(url, values) {
	return url.replace(/\:(\w+)/g, function(match, key) {
		if (values.hasOwnProperty(key)) {
			return values[key];
		}
		return url;
	});
};

//保存文件到config中的path目录下
exports.saveData = function(fileName, data) {
	var dataDir = path.join(__dirname, config.path);
	if (!fs.existsSync(dataDir)) {
		mkdirp.sync(dataDir);
	}
	var filePath = path.join(dataDir, fileName);
	return writeFile(filePath, data);
};

//下载
exports.download = function(url) {
	return new Promise(function(resolve, reject) {
		var chunks = [];
		var size = 0;
		var fileLength = 1;
		request.get({
			url: url,
			strictSSL: false
		}).on("response", function(response) {
			fileLength = parseInt(response.headers['content-length']);
			logger.info("开始下载:" + url);
			logger.info("file size : " + fileLength + "B");
		}).on("data", function(chunk) {
			chunks.push(chunk);
			size += chunk.length;
		}).on("end", function() {
			var buff = Buffer.concat(chunks, size);
			var data = buff.toString();
			resolve(data);
			//关闭进度更新循环函数
			clearInterval(downloadProgress);
			console.log("下载中:            100%");
			logger.info(url + "下载完毕");
		}).on("error", reject);
		//更新进度
		var lastLength = 0;
		var downloadProgress = setInterval(function() {
			var dataLength = size;
			var percent = parseInt(dataLength / fileLength * 100);
			var netSpeed = dataLength - lastLength;
			lastLength = dataLength;

			process.stdout.write("下载中:            " + percent + "%              " + dataLength + "/" + fileLength + "                " + netSpeed + "B/s             " + "\r");
		}, 1000);

	});
};