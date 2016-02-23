var Q = require('q');
var Manage = require('./model');

var opt = {};
Q.fcall(function () {
	var deferred = Q.defer();
	Manage.getCountByGroup('变更', function(err, count){
		if(err){
			if (err) deferred.reject(new Error(err));
		}
		opt['变更'] = count;
		deferred.resolve();
	});

	return deferred.promise;
}).then(function () {
	var deferred = Q.defer();
	Manage.getCountByGroup('项目', function(err, count){
		if(err){
			if (err) deferred.reject(new Error(err));
		}
		opt['项目'] = count;
		deferred.resolve();
	})

	return deferred.promise;
}).then(function () {
	var deferred = Q.defer();
	Manage.getCountByGroup('团队', function(err, count){
		if(err){
			if (err) deferred.reject(new Error(err));
		}
		opt['团队'] = count;
		deferred.resolve();
	})

	return deferred.promise;
}).done(function () {
	console.log(opt);
}, function (err) {
	console.error('An error occurred:', err.stack);
});

