var request = require('request');
var fs = require('fs');
var Promise = require('bluebird');
var Menu = require('terminal-menu');
var moment = require('moment');

var trainFileUrl = "https://kyfw.12306.cn/otn/resources/js/query/train_list.js";

var filePath = "./temp/train_list.js";
var grab_train = function(config) {

	//下载文件
	return new Promise(function(resolve, reject) {
/* 		//测试时使用本地文件
		if (fs.existsSync(filePath)) {
			fs.readFile(filePath, {
				encoding: 'utf8'
			}, function(err, data) {
				resolve(data);
			});
		} else { */
			var data = '';
			var fileLength = 1;
			request.get({
				url: trainFileUrl,
				strictSSL: false
			}).on("response", function(response) {
				fileLength = parseInt(response.headers['content-length']);
				console.log("file size : " + fileLength + "B");
			}).on("data", function(chunk) {
				data += chunk;
			}).on("end", function() {
				resolve(data);
				//关闭进度更新循环函数
				clearInterval(downloadProgress);
				console.log("下载中:            100%");
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
/* 		} */

	}).then(function(data) {
		//选择日期
		return new Promise(function(resolve, reject) {
			eval(data); //var train_list ={"2015-05-06":{"D":[{"station_train_code":"D1(北京-沈阳)","train_no":"24000000D10......
			//var trainList = JSON.parse(train_list);
			//显示MENU 供用户选择抓取哪一天车次
			//console.log(Object.keys(train_list));
			var dateList = Object.keys(train_list);
			//按时间排序
			dateList.sort(function(a, b) {
				var timeA = moment(a).unix();
				var timeB = moment(b).unix();
				if (timeA < timeB) {
					return 1;
				} else if (timeA > timeB) {
					return -1;
				} else {
					return 0;
				}
			});
			if (config.grab_newest_train_list) {
				//默认最新日期
				resolve({
					data: train_list[dateList[0]],
					date: dateList[0]
				});
			} else {
				//手动选择日期
				var menu = Menu({
					width: 50,
					x: 4,
					y: 2
				});
				menu.reset();
				menu.write('请选择需要抓取哪一天的车次列表:\n');
				menu.write('-------------------------------\n');
				for (var i = 0; i < dateList.length; i++) {
					menu.add(dateList[i]);
				}
				process.stdin.pipe(menu.createStream()).pipe(process.stdout);
				process.stdin.setRawMode(true);
				menu.on('close', function() {
					process.stdin.setRawMode(false);
					process.stdin.end();
				});
				menu.on('select', function(label) {
					menu.close();
					resolve({
						data: train_list[label],
						date: label
					});
				});
			}

		});

	}).then(function(trainList) { // trainList.data = {D:... ,T:... ,G:...,...
		//将车次 始发站终点站拆分开
		var data = [];
		Object.keys(trainList.data).forEach(function(key) {
			var l = trainList.data[key];
			l.forEach(function(train) {
				train.station_train_code.match(/(\S+)\((\S+)-(\S+)\)/g);
				data.push({
					train: RegExp.$1,
					start_station: RegExp.$2,
					end_sta: RegExp.$3,
					train_no: train.train_no
				});
			});
		});
		trainList.data = data;
		console.log("analyse " + trainList.data.length + " stations complete....");
		return Promise.resolve(trainList);
	});

};

module.exports = grab_train;

if (!module.parent) {
	grab_train(require('./config.js')).then(function(res) {
		console.log(res.data);
	});
}