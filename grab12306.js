var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var moment = require('moment');

var config = require('./config.js');
var util = require('./lib/util.js');
var grabStation = require('./lib/grab_station.js');
var grabTrain = require('./lib/grab_train.js');
var grabSchedule = require('./lib/grab_schedule.js');

var logger = require('winston');
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
	colorize: true
});
logger.add(logger.transports.File, {
	filename: 'grab12306.log'
});

var beginTime = moment();
var global = {};
global.config = config;
//车站
grabStation(global).then(function() {
	//车次
	return grabTrain(global);
}).then(function() {
	//时刻表
	return grabSchedule(global);
}).then(function() {
	var time = moment().subtract(beginTime);

	logger.info("所有抓取已完成，共耗时"+time.format("H时mm分ss秒"));
}).catch(logger.error);

