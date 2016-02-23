var now = new Date;
now.year = now.getFullYear();
now.month = adjustDate(now.getMonth() + 1);
now.date = adjustDate(now.getDate());
function adjustDate(val){
    if(val < 10){
        val = '0'+val
    }
    return val;
}
now = now.year + now.month + now.date+'/';

module.exports = now;