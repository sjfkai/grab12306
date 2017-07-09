//# grab12306 Configuration

module.exports = {

	/**
	 *选择需要抓取的列表
	 *NOTE:因为抓取时刻表必须抓取车站列表和车次列表，所以 grab_train_schedule=true 时即使其他为false也会抓取所有列表
	 */
	//抓取车站列表
	grab_station : true,
	//抓取车次列表
	grab_train_list : true,
	//抓取列车时刻表
	grab_train_schedule : true,

	//是否自动抓取最新日期的车次列表，如为false则需手动选择抓取日期
	grab_newest_train_list : true,

        // Skip trains until this number, to deal with failed grabs
        train_skip_grab_until : undefined,
    
        // wait this many miliseconds between downloads to avoid crashing the server
        wait_time_between_downloads : 2000,

	//保存路径
	path : './data',
};
