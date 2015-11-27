var request = require('request');
var fs = require('fs');
var Promise = require('bluebird');
var Menu = require('terminal-menu');
var moment = require('moment');
var util = require('./util.js');
var logger = require('winston');
var progressRequest = require('progress-request');


var trainFileUrl = "https://kyfw.12306.cn/otn/resources/js/query/train_list.js";

var filePath = "./temp/train_list.js";
/**
 * 抓取并保存车次列表
 */
var grabTrain = function(global) {
	var config = global.config;
	if (!(config.grab_train_list || config.grab_train_schedule)) {
		//不抓取 直接返回
		return Promise.resolve();
	}
	logger.info("开始抓取车次列表");
	//下载文件
	return progressRequest(trainFileUrl).then(function(data) {
		//选择日期
		return new Promise(function(resolve, reject) {
			//eval(data); //var train_list ={"2015-05-06":{"D":[{"station_train_code":"D1(北京-沈阳)","train_no":"24000000D10......
			//var trainList = JSON.parse(train_list);
			//显示MENU 供用户选择抓取哪一天车次
			//console.log(Object.keys(train_list));
			var train_list = (new Function(data + ' ; return train_list')());

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
					logger.info("您选择的抓取日期为" + label);
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
					end_station: RegExp.$3,
					train_no: train.train_no
				});
			});
		});
		trainList.data = data;
		logger.info("analyse " + trainList.data.length + " stations complete....");
		return Promise.resolve(trainList);
	}).then(function(trainList) {
		global.trainList = trainList;
		return util.saveData('train_list.json', JSON.stringify(trainList.data, null, 4));
	});

};

module.exports = grabTrain;

if (!module.parent) {
	var global = {
		config: require('../config.js')
	};
	grabTrain(require('../config.js')).then(function(res) {
		console.log(res.data);
	});
}