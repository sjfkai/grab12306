var request = require('request');
var Promise = require("bluebird");
Promise.promisifyAll(request);
var stationFilePath = "https://kyfw.12306.cn/otn/resources/js/framework/station_name.js";

var grab_station = function() {
	return request.getAsync({
		url: stationFilePath,
		strictSSL: false
	}).then(function(data) {
		console.log("download stations complete....");
		var stationsStr = data[1]; //"var station_names ='@bjb|北京北|VA……"
		eval(stationsStr);
		var tempStationList = station_names.split('@');
		var stationList = [];
		tempStationList.splice(0, 1);
		tempStationList.forEach(function(stationStr) {
			/*
				格式说明
				bjb|北京北|VAP|beijingbei|bjb|0
				[0] -->如果两个字 则为第一个字的首字母和第二个字的拼音前两个字母
						其他则为前两个字和最后一个字的首字母
				[1] -->车站名
				[2] -->telecode
				[3] -->拼音
				[4] -->拼音首字母
				[5] -->id
			*/
			var tempStation = stationStr.split('|');
			var station = {
				id: tempStation[5],
				station: tempStation[1],
				telecode: tempStation[2],
				pinyin: tempStation[3],
				sPinyin: tempStation[4],
				ssPinyin: tempStation[0]
			};
			stationList.push(station);
		});
		console.log("analyse " + tempStationList.length + " stations complete....");
		return Promise.resolve({
			data: stationList
		});

	});
	/* 	request({url : stationFilePath ,strictSSL : false}, function (error, response, body) {
		if(error){
			console.log(error);
		}
		if (!error && response.statusCode == 200) {
			console.log(body); // Show the HTML for the Google homepage. 
		}
	}); */
};

module.exports = grab_station;

if (!module.parent) {
	grab_station().then(function(trainList) {
		console.log(trainList);
	});
}