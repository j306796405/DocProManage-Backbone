var fs = require('fs');
fs.mkdir('上传目录',function(e){
	if(e){
		console.log('文件夹创建错误：' + e);
	}
});