# grab12306
从12306抓取最新车站、车次、列车时刻表等数据 

## 功能简介
从12306抓取预售期(60天)内某一天的车站、车次和列车时刻表，并保存为`.json`文件。

为了让时刻表中车次按顺序排列，采用了单线抓取，所以完全抓取一次大约需要`20-30分钟`
## TIPS
因为有些车站的车票无法在12306购买（如P97北京西--九龙、金山卫站等），所以车次列表里存在的某些车次无法抓取其车站和车次详情。

## 如何用
	$ git clone https://github.com/sjfkai/grab12306.git
	
	$ cd grab12306
	
	$ node grab12306.js
	
## 结果示例

### 车站列表 station_list.json
```js
[
	{
		"id": "0",
		"station": "北京北",
		"telecode": "VAP",
		"pinyin": "beijingbei",
		"sPinyin": "bjb",
		"ssPinyin": "bjb"
	},
	{
		"id": "1",
		"station": "北京东",
		"telecode": "BOP",
		"pinyin": "beijingdong",
		"sPinyin": "bjd",
		"ssPinyin": "bjd"
	},
	{
		"id": "2",
		"station": "北京",
		"telecode": "BJP",
		"pinyin": "beijing",
		"sPinyin": "bj",
		"ssPinyin": "bji"
	},
	//...
	//...
]
```

### 车次列表 train_list.json
```js
[
	{
		"train": "D1",
		"start_station": "北京",
		"end_station": "沈阳",
		"train_no": "24000000D10O"
	},
	{
		"train": "D2",
		"start_station": "沈阳",
		"end_station": "北京",
		"train_no": "12000000D20F"
	},
	{
		"train": "D3",
		"start_station": "北京",
		"end_station": "沈阳北",
		"train_no": "24000000D30H"
	},
	{
		"train": "D4",
		"start_station": "沈阳北",
		"end_station": "北京",
		"train_no": "12000000D408"
	},
	//...
	//...
]
```

### 列车时刻表 train_schedule.json
```js
[
	{"station_no":"01","station_train_code":"D1","train_class_name":"动车","station_name":"北京","arrive_time":"18:08","start_time":"18:08","stopover_time":"----"},
	{"station_no":"02","station_train_code":"D1","train_class_name":"动车","station_name":"北戴河","arrive_time":"20:16","start_time":"20:17","stopover_time":"1分钟"},
	{"station_no":"03","station_train_code":"D1","train_class_name":"动车","station_name":"葫芦岛北","arrive_time":"21:28","start_time":"21:29","stopover_time":"1分钟"},
	{"station_no":"04","station_train_code":"D1","train_class_name":"动车","station_name":"盘锦北","arrive_time":"22:15","start_time":"22:16","stopover_time":"1分钟"},
	{"station_no":"05","station_train_code":"D1","train_class_name":"动车","station_name":"沈阳","arrive_time":"23:20","start_time":"23:20","stopover_time":"----"},
	{"station_no":"01","station_train_code":"D2","train_class_name":"动车","station_name":"沈阳","arrive_time":"09:19","start_time":"09:19","stopover_time":"----"},
	{"station_no":"02","station_train_code":"D2","train_class_name":"动车","station_name":"葫芦岛北","arrive_time":"10:49","start_time":"10:50","stopover_time":"1分钟"},
	{"station_no":"04","station_train_code":"D2","train_class_name":"动车","station_name":"北京","arrive_time":"14:06","start_time":"14:06","stopover_time":"----"},
	{"station_no":"01","station_train_code":"D3","train_class_name":"动车","station_name":"北京","arrive_time":"18:19","start_time":"18:19","stopover_time":"----"},
	{"station_no":"02","station_train_code":"D3","train_class_name":"动车","station_name":"秦皇岛","arrive_time":"20:37","start_time":"20:38","stopover_time":"1分钟"},
	{"station_no":"03","station_train_code":"D3","train_class_name":"动车","station_name":"葫芦岛北","arrive_time":"21:36","start_time":"21:37","stopover_time":"1分钟"},
	{"station_no":"04","station_train_code":"D3","train_class_name":"动车","station_name":"锦州南","arrive_time":"21:57","start_time":"21:58","stopover_time":"1分钟"},
	{"station_no":"05","station_train_code":"D3","train_class_name":"动车","station_name":"盘锦北","arrive_time":"22:27","start_time":"22:28","stopover_time":"1分钟"},
	{"station_no":"06","station_train_code":"D3","train_class_name":"动车","station_name":"沈阳北","arrive_time":"23:33","start_time":"23:33","stopover_time":"----"},
	{"station_no":"01","station_train_code":"D4","train_class_name":"动车","station_name":"沈阳北","arrive_time":"07:52","start_time":"07:52","stopover_time":"----"},
	{"station_no":"02","station_train_code":"D4","train_class_name":"动车","station_name":"盘锦北","arrive_time":"08:51","start_time":"08:52","stopover_time":"1分钟"},
	{"station_no":"03","station_train_code":"D4","train_class_name":"动车","station_name":"锦州南","arrive_time":"09:16","start_time":"09:17","stopover_time":"1分钟"},
	{"station_no":"04","station_train_code":"D4","train_class_name":"动车","station_name":"山海关","arrive_time":"10:18","start_time":"10:19","stopover_time":"1分钟"},
	{"station_no":"05","station_train_code":"D4","train_class_name":"动车","station_name":"北戴河","arrive_time":"10:49","start_time":"10:52","stopover_time":"3分钟"},
	{"station_no":"07","station_train_code":"D4","train_class_name":"动车","station_name":"北京","arrive_time":"13:00","start_time":"13:00","stopover_time":"----"},
	//...
	//...
]
```

## TODO
  - 直接提供下载链接
  - 可以存储到数据库
  - 增加其他有用的字段
  - 增加test !!!
