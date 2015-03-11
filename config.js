//# grab12306 Configuration

module.exports = {
	//抓取车站列表
	grab_station : true,
	//抓取车次列表
	grab_train_list : true,
	//抓取列车时刻表
	grab_train_schedule : true,
	
	//是否自动抓取最新日期的车次列表，如为false则需手动选择抓取日期
	grab_newest_train_list : false,

	
	//保存路径
	path : './data',
};