var util = require('../lib/util.js');
var chai = require('chai');
var should = chai.should();
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');

var readFile = Promise.promisify(fs.readFile);

describe('util.js' , function(){
	describe('#formatUrl(url, values)',function(){
		it('should return http://xxx.com?user=sjfkai when url == http://xxx.com?user=:user values={user:"sjfkai"}',function(){
			var url = "http://xxx.com?user=:user";
			var values = {
				user:"sjfkai"
			};
			util.formatUrl(url,values).should.be.equal("http://xxx.com?user=sjfkai");
		});
	});

	describe('#saveData(fileName, data)',function(){
		it('should save file ../data/saveData.test.json when fileName = saveData.test.json' , function(){
			var fileName = "saveData.test.json";
			var data = {
				value : "测试util.saveData方法"
			};
			var filePath = path.join(__dirname,'../','data',fileName);
			//为覆盖更多代码先删除已存在的文件
			if(fs.existsSync(filePath)){
				fs.unlinkSync(filePath);
			}

			data = JSON.stringify(data);

			return util.saveData(fileName,data).then(function(){
				fs.existsSync(filePath).should.be.true;
				return readFile(filePath);
			}).then(function(fileData){
				fileData.toString().should.equal(data);
				//删除
				fs.unlinkSync(filePath);
				return Promise.resolve();
			}).should.be.fulfilled;

		});
	});
	
	describe('#download(url)' , function(){
		var logger = require('winston');
		logger.remove(logger.transports.Console);
		
		it("should resolve and return content of www.baidu.com " ,function(){
			var url = "http://www.baidu.com";
			return util.download(url).then(function(data){
				//console.log(data);
				should.exist(data);
				return Promise.resolve();
			}).should.be.fulfilled;
		});
		
		it("should reject when url is not exists" ,function(){
			var url = "http://notexists.xxx";
			return util.download(url).then(function(data){
				//should.exists(data);
			}).should.be.rejected;
		});
	});
});
	
