var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');

var config = require('./config.js');
var util = require('./util.js');
var grabStation = require('./grab_station.js');

if(config.grab_station){
	console.log("grabing stations...");
	grabStation().then(function(stationList){
		//save
		return util.saveData('station_list.json',JSON.stringify(stationList , null ,4));
		
	}).then(function(){
		console.log("grab stations complete...");
	}).catch(function(err){
		console.log(err);
	});
}