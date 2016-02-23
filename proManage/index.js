var express = require('express'),
	Manage = require('./database/model'),
	formidable = require('formidable'),
	bodyParser = require('body-parser'),
	util = require('util'),
	path = require('path'),
	fs = require('fs'),
	moment = require('moment'),
	_ = require('underscore'),
	now = require('./now'),
	utils = require('./utils'),
	config = require('./config.js'),
	cookieParser = require('cookie-parser'),
	STATIC = config.STATIC,
	UPLOAD_DIR_TODAY = '',
	app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cookieParser());
app.use(express.static(STATIC));

// route
app.get('/', function(req, res) {
	res.redirect(config.map_path + '/app.html');
})

// 全部列表
app.get('/list', function(req, res) {
	var keyword = req.query.keyword,
		currentPage = req.query.currentPage,
		pageSize = req.query.pageSize;
	Manage.getPagingDataByKeyword(keyword, currentPage, pageSize, function(err, datas){
		if(err){
			console.log(err.toString());
			return res.send(err.toString());
		}
		utils.formatDatas(datas);
		res.send(datas);
	})
});

app.get('/paging', function(req, res){
	var keyword = req.query.keyword;
	Manage.getCountByKeyword(keyword, function(err, count){
		if(err){
			console.log(err.toString());
			return res.send(err.toString());
		}
		return res.send({count: count});
	})
})

// 添加项目
app.post("/item", function(req, res) {
	var content = req.body;
	var manage = {
		proName: content.proName,
		cp4: content.cp4,
		proClass: content.proClass,
		tag: content.tag,
		proDes: content.proDes,
		person: content.person,
		submitTime: new Date,
		createDate: new Date,
		lowfiLink: content.lowfiLink,
		viLink: content.viLink,
		cssLink: content.cssLink,
		picsLink: content.picsLink,
		repository: content.repository
	}
	var db = new Manage(manage);
	db.create(function(err, model){
		if(err){
			console.log(err.toString());
			return res.send(err.toString());
		}
		utils.formatData(model);
		res.send(model);
	})

});
// 删除项目
app.delete("/item/:id", function(req, res) {
	Manage.deleteById(req.param('id'),function(err, model){
		if(err){
			console.log(err.toString());
			return res.send(err.toString());
		}
		res.send(model);
	})
});

// 更新项目
app.patch("/item/:id", function(req, res) {
	req.body.submitTime = new Date;  //更新时间
	Manage.updateById(req.params.id, req.body , {new: true}, function(err, model){
		if(err){
			console.log(err.toString());
			return res.send(err.toString());
		}
		utils.formatData(model);
		res.send(model);
	})
});

// 项目详情
app.get("/item/:id", function(req, res) {
	Manage.getById(req.params.id, function(err, model){
		if(err){
			console.log(err.toString());
			return res.send(err.toString());
		}
		utils.formatData(model);
		res.send(model);
	})
});

// 图片上传
app.post("/upload", function(req, res) {
	UPLOAD_DIR_TODAY = config.UPLOAD_DIR + moment().format("YYYYMMDD");
	fs.exists(UPLOAD_DIR_TODAY, function (exists) {
		if(!exists){
			fs.mkdir(UPLOAD_DIR_TODAY,function(e){
				if(e){
					console.log('文件夹创建错误：' + e);
				}
				upload();
			});
		}else{
			upload();
		}
	});

	function upload(){
		var form = new formidable.IncomingForm(),
			files = [],
			fields = [],
			file_name = [];

		form.uploadDir = UPLOAD_DIR_TODAY;
		form.keepExtensions = true;     //保留后缀

		form
			.on('field', function (field, value) {
				fields.push([field, value]);
			})
			.on('file', function (field, file) {
				var fileJson = {};
				fileJson.name = file.name;
				fileJson.path = staticUploadPath(file.path);
				file_name.push(fileJson);

				files.push([field, file]);
			})
			.on('end', function () {
				res.send(file_name);
			});
		form.parse(req);
	};
});

// 图片删除
app.delete('/deletePic', function(req, res) {
	var imgPath = serverUploadPath(req.body.imgPath);
	fs.exists(imgPath, function( exists ){
		if(exists){
			fs.unlink(imgPath, function(err){
				if(err){
					return res.send(err.toString());
				}
				res.send('file is deleted');
			});
		}else{
			res.send(imgPath);
		}
	});
})

app.get('/report', function(req, res){
	var type = req.query.type,
		startDate = req.query.startDate,
		endDate = req.query.endDate,
		convertResult = {},
		typeGroupArr = [],
		echartsDate = {
			xData: [],
			yData: {}
		},
		startDate = new Date(moment(startDate, "YYYY-MM-DD")),
		endDate = new Date(moment(endDate, "YYYY-MM-DD").add(1, 'days')),
		currentDate = moment(startDate).startOf('month'); //设置为当月的第一天，方便统计和比较每一个月

	//获取type数组
	Manage.getDistinctByKey(type, null, function(err, result){
		if(err){
			console.log(err.toString());
			return res.send(err.toString());
		}
		typeGroupArr = result;
		//初始化echartData
		_.each(typeGroupArr, function(element, index){
			echartsDate.yData[element] = [];
		})

		Manage.getCountByMonth(type, startDate, endDate, function(err, result){

			//开始构造echarts xData数据
			echartsDate.xData = utils.listYearMonth(startDate, endDate);

			//将结果数据重新组合成对象，方便构造成echart可以数据
			_.each(result, function (element, index) {
				var node_id = element._id,
					node_count = element.count,
					date = '';
				date = moment(new Date(node_id.year, node_id.month - 1)).format("YYYY-MM");
				convertResult[date + '-' + node_id.groupType] = node_count;
			});

			//开始构造echarts yData数据
			for (var i = currentDate; currentDate < endDate;) {
				for (var j = 0; j < typeGroupArr.length; j++) {
					var key = currentDate.format("YYYY-MM") + '-' + typeGroupArr[j];
					if (convertResult[key]) {
						echartsDate.yData[typeGroupArr[j]].push(convertResult[key]);
					} else {
						echartsDate.yData[typeGroupArr[j]].push(0);
					}
				}
				currentDate.add(1, 'months');
			}

			res.send(echartsDate);
		})
	})
})

function staticUploadPath(dir){
	dir = path.relative(STATIC,dir);
	return dir;
}

function serverUploadPath(dir){
	return path.join(STATIC, dir);
}

app.listen(config.port);
