

var assert = require('assert');
var common = require('./common');
var geom = require('./trigonometry');
var jd = require('./juliandate');
var bsc = require('./bright-star-catalog');


assert(0 == geom.sin(0));
assert(1 == geom.sin(90));
assert(1 == geom.cos(0));
assert(0 == geom.tg(0));
assert(common.isClose(1.9, geom.arccos(geom.cos(-1.9)), 1e-6));

assert(2446113.5 == jd.julianDate(1985, 2, 17));
assert(2458996.5 == jd.julianDate(2020, 05, 27));


assert(
    common.isClose(
        jd.siderealTime(jd.julianDate(1985, 2, 17)),
        -213.0830430353526,
        1e-9
    ));


console.log('May');
var c = common.getMonthsCalendar(2020, 4);
while (c.length>0) {
    console.log(c.splice(0, 7).join(' '));
}

console.log('March');
c = common.getMonthsCalendar(2020, 2);
while (c.length>0) {
    console.log(c.splice(0, 7).join(' '));
}

console.log('September');
c = common.getMonthsCalendar(2020, 8);
while (c.length>0) {
    console.log(c.splice(0, 7).join(' '));
}

console.log('February');
c = common.getMonthsCalendar(2020, 1);
while (c.length>0) {
    console.log(c.splice(0, 7).join(' '));
}
