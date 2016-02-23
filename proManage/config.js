var path = require('path');

var config = {};
//local config
//config.dbConnect = 'mongodb://docmDEV:docmDEV@10.3.8.87/docmDEV';
config.dbConnect = 'mongodb://localhost/doc';
config.UPLOAD_DIR = './page/upload/';
config.STATIC = path.join(__dirname, 'page/');
config.port = 3000;
//local office
config.map_path = 'docmapp';
//local home
//config.map_path = '';

//DEV config
/*config.dbConnect = 'mongodb://docmDEV:docmDEV@10.3.8.87/docmDEV';
config.STATIC = path.join(__dirname, './../../hotel.ued/static/docmapp_static.beta/');
config.UPLOAD_DIR = path.join(config.STATIC, 'upload/');
config.map_path = 'docmapp_beta';
config.port = 3333;*/

//release config
/*config.dbConnect = 'mongodb://docmGA:docmGA_pass0d@10.3.8.87/docmGA';
config.UPLOAD_DIR = path.join(__dirname, './../../hotel.ued/static/docmapp_static/upload/');
config.STATIC = path.join(__dirname, './../../hotel.ued/static/docmapp_static/');
config.map_path = 'docmapp';
config.port = 3000;*/

module.exports = config;
