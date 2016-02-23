var moment = require('moment'),
    util = {};

util.formatDatas = function(collection){
    for(var i= 0; i< collection.length; i++){
        var item = collection[i];
        item._doc.id = item._id;
        item._doc.createDate = moment(item.createDate).format('YYYY/MM/DD hh:mm a');
    }
    return collection;
}

util.formatData = function(model){
    if(model){
        model._doc.id = model._id;
        model._doc.createDate = moment(model.createDate).format('YYYY/MM/DD hh:mm a');
        return model;
    }
}

//列出时间范围内所有的YYYY-MM
util.listYearMonth = function(startDate, endDate){
    var list = [],
        currentDate = startDate;
    while(currentDate < endDate){
        currentDate = moment(currentDate).startOf('month');
        list.push(currentDate.format("YYYY-MM"));
        currentDate.add(1, 'months');
    }
    return list;
}

util.listYearMonth();
module.exports = util;