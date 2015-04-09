var Promise = require('bluebird');
var request = require("request");
Promise.promisifyAll(request);
var util = require('./util.js');
var logger = require('winston');

var scheduleUrl = "https://kyfw.12306.cn/otn/czxx/queryByTrainNo?train_no=:train_no&from_station_telecode=:from_station_telecode&to_station_telecode=:to_station_telecode&depart_date=:depart_date";

var grabSchedule = function(global) {
	var config = global.config;
	if (!(config.grab_train_schedule)) {
		//不抓取 直接返回
		return Promise.resolve();
	}
	logger.info("开始抓取车次列表");

	var stationListArr = global.stationList.data;
	var trainListArr = global.trainList.data;
	var depart_date = global.trainList.date;
	var scheduleSaver = global.scheduleSaver ? global.scheduleSaver :new util.ArraySaver("train_schedule.json");
	
	var arrLen = trainListArr.length; // 统计用
	var curr = 0;

	var errorList = []; //用来保存请求错误的车次 重新请求
	return Promise.each(trainListArr, function(train) {
		++curr;
		/* 		//测试递归抓取错误车次，为了节省时间
		if(errorList.length >= 10){
			logger.info("错误数量达到10个，此时递归，故跳过之后的车次");
			return Promise.resolve();
		} */
		logger.info("正在抓取车次：" + train.train + "(" + train.start_station + "-->" + train.end_station + ")   " + curr + "/" + arrLen);
		//请求参数
		var train_no = train.train_no;
		var from_station_telecode = getStationTelecode(train.start_station, stationListArr);
		var to_station_telecode = getStationTelecode(train.end_station, stationListArr);

		if (!(train_no && from_station_telecode && to_station_telecode && depart_date)) {
			logger.error(train.train + " 抓取失败 ");
			return Promise.resolve();
		}
		var url = util.formatUrl(scheduleUrl, {
			train_no: train_no,
			from_station_telecode: from_station_telecode,
			to_station_telecode: to_station_telecode,
			depart_date: depart_date,
		});
		//请求
		return request.getAsync({
			url: url,
			strictSSL: false
		}).then(function(res) {
			var data = JSON.parse(res[1]);
			if (!(data.httpstatus && data.httpstatus == 200)) {
				logger.error("request error 将尝试再次抓取 12306的数据为:" + res[1]);
				errorList.push(train);
				return Promise.resolve();
			}
			var scheduleFrom12306 = data.data.data;
			/* schedule =  
			[ { start_station_name: '北京南',
				arrive_time: '----',
				station_train_code: 'C2203',
				station_name: '北京南',
				train_class_name: '高速',
				service_type: '1',
				start_time: '07:00',
				stopover_time: '----',
				end_station_name: '天津',
				station_no: '01',
				isEnabled: true },
			  { arrive_time: '07:23',
				station_name: '武清',
				start_time: '07:24',
				stopover_time: '1分钟',
				station_no: '02',
				isEnabled: false },
			  { arrive_time: '07:38',
				station_name: '天津',
				start_time: '07:38',
				stopover_time: '----',
				station_no: '03',
				isEnabled: false } ]*/
			if (!scheduleFrom12306 || !scheduleFrom12306[0]) {
				logger.error("schedule from 12306 error 将尝试再次抓取 12306的数据为 :" + res[1]);
				errorList.push(train);
				return Promise.resolve();
			}
			//构建要保存的json数组
			var schedule = [];
			var station_train_code = scheduleFrom12306[0].station_train_code;
			var train_class_name = scheduleFrom12306[0].train_class_name;
			//有些实际不存在的车次则忽略
			if (station_train_code != train.train) {
				logger.warn(station_train_code + " 与 " + train.train + " 车次相同，所以不保存");
				return Promise.resolve();
			}
			for (var i = 0; i < scheduleFrom12306.length; i++) {
				var scheduleOne = scheduleFrom12306[i];
				schedule.push({
					station_no: scheduleOne.station_no,
					station_train_code: station_train_code,
					train_class_name: train_class_name,
					station_name: scheduleOne.station_name,
					arrive_time: scheduleOne.arrive_time == "----" ? scheduleOne.start_time : scheduleOne.arrive_time,
					start_time: scheduleOne.start_time,
					stopover_time: scheduleOne.stopover_time
				});
			}
			//console.log(schedule);
			//保存
			scheduleSaver.add(schedule);
			return Promise.resolve();
		});

	}).then(function() {
		//递归 处理出错的车次
		if (errorList.length > 0) {
			logger.info("重新抓取出错的车次，数量为:" + errorList.length);
			var trainList = {
				data: errorList,
				date: global.trainList.date
			};
			var newGlobal = {
				config: global.config,
				stationList: global.stationList,
				trainList: trainList,
				scheduleSaver : scheduleSaver
			};
			return grabSchedule(newGlobal);
		} else {
			scheduleSaver.end();
			logger.info("车次列表抓取完成");
			return Promise.resolve();
		}

	});


};


var getStationTelecode = function(station, stationListArr) {

	var stationTelecode = null;

	for (var i = 0; i < stationListArr.length; i++) {
		var stationNow = stationListArr[i];
		if (station == stationNow.station) {
			stationTelecode = stationNow.telecode;
			break;
		}
	}
	return stationTelecode;
};


module.exports = grabSchedule;

if (!module.parent) {
	//模拟
	var stationList = {
		data: [{
			id: "3",
			station: "北京南",
			telecode: "VNP",
			pinyin: "beijingnan",
			sPinyin: "bjn",
			ssPinyin: "bjn"
		}, {
			id: "15",
			station: "天津",
			telecode: "TJP",
			pinyin: "tianjin",
			sPinyin: "tj",
			ssPinyin: "tji"
		}]
	};
	var trainList = {
		date: "2015-05-17",
		data: [{
			train: "C2203",
			start_station: "北京南",
			end_station: "天津",
			train_no: "24000C220309"
		}]
	};
	var global = {
		config: require('../config.js'),
		stationList: stationList,
		trainList: trainList
	};
	grabSchedule(global).then(function() {
		console.log("done");
	});
}