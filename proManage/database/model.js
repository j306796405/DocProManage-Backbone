var mongoose = require('mongoose');
var config = require('./../config');
mongoose.connect(config.dbConnect);

// Schema 结构
var SCHEMA_OPTS = {
    proName : {type : String},
    cp4 : {type : String},
    person : {type : Array},
    proDes : {type : String},
    submitTime : {type : Date },//更新时间
    createDate : {type : Date },//创建时间
    lowfiLink : {type : String},
    viLink : {type : Array},
    cssLink : {type : String},
    picsLink : {type : String},
    proClass : {type : String},
    tag : {type : Array},
    repository : {type : String}
},
    manageSchema = new mongoose.Schema(SCHEMA_OPTS,{
    collection: 'manage'
});

var manageModel = mongoose.model('Manage', manageSchema);

function Manage(manage){
    this.proName = manage.proName;
    this.cp4 = manage.cp4;
    this.person = manage.person;
    this.proClass = manage.proClass;
    this.proDes = manage.proDes;
    this.tag = manage.tag;
    this.submitTime = manage.submitTime;
    this.createDate = manage.createDate;
    this.lowfiLink = manage.lowfiLink;
    this.viLink = manage.viLink;
    this.cssLink = manage.cssLink;
    this.picsLink = manage.picsLink;
    this.repository = manage.repository;
}

Manage.prototype.create = function(callback){
    var manage = {
        proName: this.proName,
        cp4 : this.cp4,
        person: this.person,
        proClass : this.proClass,
        proDes : this.proDes,
        tag : this.tag,
        submitTime: this.submitTime,
        createDate: this.createDate,
        lowfiLink: this.lowfiLink,
        viLink: this.viLink,
        cssLink: this.cssLink,
        picsLink: this.picsLink,
        repository: this.repository
    }

    var newManage = new manageModel(manage);

    newManage.save(function(err, manage){
        if(err){
            console.log(err.toString());
            return callback(err);
        }
        callback(null, manage);
    })
}

Manage.getAll = function(callback, key, sortWay){
    manageModel.find().select('_id proName submitTime person tag proClass').sort('-'+key).exec(callback);
}

Manage.getByName = function(name,callback, key, sortWay){
    var regName = new RegExp(name,'i');
    var mongoCollection = manageModel.find({"$or" :  [ { 'proName':regName }, {'person.value' : regName , 'person.group' : 'CSS'} ] });
    mongoCollection.select('_id proName submitTime person person tag proClass').sort('-'+key).exec(callback);
}

Manage.deleteById = function(id, callback){
    manageModel.findByIdAndRemove(id,function(err,model){
        callback(null, model);
    })
}

Manage.updateById = function(id, itemInfo, options, callback){
   
    manageModel.findByIdAndUpdate(id, {$set: itemInfo}, options, function(err,model){
        if(err){
            return callback(err, model);
        }
        callback(null, model);
    })
}

Manage.update = function (id, item, callback) {
    manageModel.update({_id: id}, {$set: item}, function (err, num) {
        callback(err, num);
    });
}

Manage.getById = function(id,callback){
   
    manageModel.findById(id,function(err,model){
        if(err){
            return callback(err, model);
        }
        callback(null, model);
    })
}

Manage.getPagingDataByKeyword = function (regName, page, pageSize, callback) {
    if(!regName){
        regName = /./;
    }else{
        regName = new RegExp(regName,'i');
    }
    manageModel
        .find({"$or": [
            {'proName': regName},
            //, isOperator: true 无需查找项目经办人 任意角色即可只要名字匹配
            {person: {$elemMatch: {value: regName, group: 'CSS'}}},
            {person: {$elemMatch: {value: regName, group: 'VI'}}},
            {person: {$elemMatch: {value: regName, group: 'UI'}}}
        ]})
        .sort('-createDate').skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(function(err,datas){
            callback(err, datas);
    });
}

Manage.getCountByKeyword = function (regName, callback) {
    if(!regName){
        regName = /./;
    }else{
        regName = new RegExp(regName,'i');
    }
    manageModel
        .find({"$or": [
            {'proName': regName},
            {person: {$elemMatch: {value: regName, group: 'CSS'}}},
            {person: {$elemMatch: {value: regName, group: 'VI'}}},
            {person: {$elemMatch: {value: regName, group: 'UI'}}}
        ]})
        .count(function (err, count) {
            callback(err, count);
        })
}

Manage.getCountByGroup = function(name, callback){
    manageModel.find({proClass: name}).count(function (err, count) {
        callback(err, count);
    })
}

Manage.getCountByMonth = function (type, startDate, endDate, callback) {
    var opts = [
        {
            $match: {
                createDate: {$gte: startDate, $lte: endDate}
            }
        },
        {
            $group: {
                _id : {
                    month: { $month: "$createDate" },
                    year: { $year: "$createDate" },
                    groupType: '$' + type
                },
                count: {$sum: 1}
            }
        },
        {
            $sort: {
                "_id": 1,
                type: 1
            }
        }
    ];
    //如果type字段是数组的话需要增加$unwind属性
    if(SCHEMA_OPTS[type].type === Array){
        var o_unwind = {$unwind: '$' + type};
        opts.unshift(o_unwind);
    }
    manageModel.aggregate(opts, function (err, result) {
        callback(err, result);
    });
}

Manage.getDistinctByKey = function (key, conditions, callback) {
    manageModel.distinct(key, conditions).exec(function(err,result) {
        callback(err, result);
    })
}

module.exports = Manage;