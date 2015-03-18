var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');

var config = require('./config.js');
var util = require('./util.js');
var grabStation = require('./grab_station.js');
var grabTrain = require('./grab_train.js');
var grabSchedule = require('./grab_schedule.js');

var global = {};
global.config = config;
//车站
grabStation(global).then(function(){
	//车次
	return grabTrain(global);
}).then(function(){
	//时刻表
	return "";
	//return grabSchedule(global);
}).then(function(){
	console.log("done...");
});



/* //车站
if(config.grab_train_list||config.grab_station){
	console.log("grabing stations...");
	grabStation().then(function(stationList){
		//save
		return util.saveData('station_list.json',JSON.stringify(stationList.data , null ,4));
		
	}).then(function(){
		console.log("grab stations complete...");
	}).catch(function(err){
		console.log(err);
	});
}
 */

/* if(config.grab_train_list || config.grab_train_schedule){
	console.log("grabing train list...");
	grabTrain(config).then(function(trainList){
		if(config.grab_train_list){
			util.saveData('train_list.json' , JSON.stringify(trainList.data, null ,4));
		}
		return Promise.resolve(trainList);
	}).then(function(){
		console.log("grab train list complete...");
	}).catch(function(err){
		console.log(err);
	});
} */




