var Manage = require('./model'),
    moment = require('moment'),
    _ = require('underscore');


/*for(var i= 1; i<= 2; i++) {
    var doc = {
        "proName" : "批量测试数据" + i,
        "proClass" : "变更",
        "proDes" : "防爬虫页面优化",
        "cp4": 'cp4任务链接',
        "submitTime" : Date.now(),
        "createDate" : new Date(moment("2016-07-05", "YYYY-MM-DD")),
        "lowfiLink" : "<a target=\"_blank\" href=\"http://pic.c-ctrip.com/hotels121118/only_hotel/icon_tip.png\" style=\"background-color: rgb(255, 255, 255);\">http://pic.c-ctrip.com/hotels121118/only_hotel/icon_tip.png</a>",
        "cssLink" : "<a target=\"_blank\" href=\"http://hfdoc.qa.nt.ctripcorp.com/online/hotels121118/only_hotel.php?b=qunar_404_lzj\" style=\"background-color: rgb(255, 255, 255);\">http://hfdoc.qa.nt.ctripcorp.com/online/hotels121118/only_hotel.php?b=qunar_404_lzj</a><br>",
        "picsLink" : "无",
        "repository" : "dev/qunar_404_lzj",
        "tag" : [
            "Offline",
            "Mobile"
        ],
        "viLink" : [],
        "person" : [
            {
                "value" : "李志嘉",
                "group" : "CSS"
            },
            {
                "value" : "吴慧敏",
                "group" : "VI"
            },
            {
                "value" : "UI",
                "group" : "UI"
            },
            {
                "value" : "PM",
                "group" : "PM"
            }
        ]
    }
    var manage = new Manage(doc);
    manage.create(function (docs) {
        console.log('create success');
    })
}*/

//search test case
/*Manage.getPagingDataByKeyword('', 1, 10, function(err, datas){
    console.log(datas.length);
}, 'submitTime', -1)*/

//count test case
/*
Manage.getCountByKeyword('51', function(err, count){
    console.log(count);
}, 'submitTime', -1)*/

/*
//mongodb更新数组属性 查找person数组属性等于CSS的，更新isOperator属性等于true
db.getCollection('manage').update(
    {person: {$elemMatch: {group: 'CSS'}}},
    {$set: {'person.$.isOperator': true}},
    {multi: true}
);*/

/*
//因为createDate是新增字段，所以更新所有createDate日期为submitTime的日期
db.getCollection('manage').find().forEach(
    function(item){
        db.getCollection('manage').update({"_id":item._id},{"$set":{"createDate":item.submitTime}},false,true)
    }
)*/

/*
Manage.getCountByGroup('变更', function(err, count){
    if(err){
        console.log(err.toString());
    }
    return count;
});
*/


var startDate = new Date(moment("2015-06-31", "YYYY-MM-DD")),
    endDate = new Date(moment("2015-12-31", "YYYY-MM-DD").add(1, 'days'));
Manage.getCountByMonth(startDate, endDate, function(err, datas){
    if (err) {
        console.log(err);
        return;
    }
    var groupByDate = _.groupBy(datas, function (o) {
        var reg = /^0/,
            month = o._id.month,
            year = o._id.year;
        if(!reg.test(month) && month.length === 1){
            month = '0' + month;
        }
        return year + '-' + month;
    });

    var arrProClassGroup = null,
        datesKeyGroup = [];
    Manage.getDistinctByKey('proClass', null, function(err, result){
        arrProClassGroup = result;
        datesKeyGroup = _.keys(groupByDate);
        var oProClassGroup = {};
        //为proClass每月的值初始化
        for(var i = 0; i < arrProClassGroup.length; i++){
            for(var j = 0; j < _.keys(groupByDate).length; j++){
                if(!oProClassGroup[arrProClassGroup[i]]){
                    oProClassGroup[arrProClassGroup[i]] = [];
                }
                oProClassGroup[arrProClassGroup[i]][j] = 0;
            }
        }
        var decorateIndex = 0;
        _.each(groupByDate, function(datasPerMonth, key, list){
            for(var j = 0; j < datasPerMonth.length; j++){
                oProClassGroup[datasPerMonth[j]._id.proClass][decorateIndex] = datasPerMonth[j].count;
            }
            ++decorateIndex;
        })

        console.log(datesKeyGroup);
        console.log(oProClassGroup);
    })
});
