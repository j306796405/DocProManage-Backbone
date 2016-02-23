app.util = {
    sliceViLinks: function(viLinks, viLink){
        var sliceVILinks = [];
        for(var i= 0; i< viLinks.length; i++){
            if(viLinks[i].name === viLink.name && viLinks[i].path === viLink.path){
                return viLinks.splice(i,1);
            }
        }
    },
    uploadExtCheck: function(name){
        var reg = /.jpg$|.png$|.psd$/;
        return reg.test(name);
    },
    uploadThumbnail: function(name, path){
        var filePath = 'img/';
        if(/.psd$/.test(name)){
            filePath = filePath + 'img_ps.png';
        }else{
            filePath = path;
        }
        return filePath;
    },
    removeHTMLTag: function(str) {
        str = str.replace(/<\/?[^>]*>/g,''); //去除HTML tag
        str = str.replace(/[ | ]*\n/g,'\n'); //去除行尾空白
        //str = str.replace(/\n[\s| | ]*\r/g,'\n'); //去除多余空行
        str=str.replace(/&nbsp;/ig,' ');//去掉&nbsp;
        return str;
    },
    prefixZeroDate: function(num){
        var reg = /^\d{2}$/;
        return reg.test(num) ? num : '0' + num
    },
    //获得本季度的开始月份
    getQuarterStartMonth: function(month) {
        if (month <= 2) { return 0; }
        else if (month <= 5) { return 3; }
        else if (month <= 8) { return 6; }
        else { return 9; }
    },
}