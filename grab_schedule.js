var Promise = require('bluebird');
var request = require("request");
Promise.promisifyAll(request);
var util = require('./util.js');

var scheduelUrl = "https://kyfw.12306.cn/otn/czxx/queryByTrainNo?train_no=:train_no&from_station_telecode=:from_station_telecode&to_station_telecode=:to_station_telecode&depart_date=:depart_date";

var grabSchedule = function(global) {
	var config = global.config;
	if (!(config.grab_train_schedule)) {
		//不抓取 直接返回
		return Promise.resolve();
	}
	console.log("开始抓取车次列表");

	var stationListArr = global.stationList.data;
	var trainListArr = global.trainList.data;
	var depart_date = global.trainList.date;

	return Promise.each(trainListArr, function(train) {

		//请求参数
		var train_no = train.train_no;
		var from_station_telecode = getStationTelecode(train.start_station, stationListArr);
		var to_station_telecode = getStationTelecode(train.start_station, stationListArr);

		if (!(train_no && from_station_telecode && to_station_telecode && depart_date)) {
			console.log(train.train + " 抓取失败 ");
			return Promise.resolve();
		}
		var url = util.formatUrl(scheduelUrl, {
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
			console.log(res[1]);
		});

	}).then(function() {
		console.log("车次列表抓取完成");
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
			end_sta: "天津",
			train_no: "24000C220309"
		}]
	};
	var global = {
		config: require('./config.js'),
		stationList: stationList,
		trainList: trainList
	};
	grabSchedule(global).then(function() {
		console.log("done");
	});
}