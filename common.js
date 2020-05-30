


const DefaultLatitude = 59.58;
const DefaultLongitude = 30.14;

//////  debug //////////////
var Debug = true;
dbg = function() {
    if (!Debug) {
        return;
    }
    var args = Array.prototype.slice.call(arguments);
    console.log(args.join(' | '));
}


if (typeof(String.prototype.trim) === "undefined") {
    String.prototype.trim = function() {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}


function padWithZeros(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}

/////// html //////////////
function getSizes() {
    var win = window,
        doc = document,
        docElem = doc.documentElement,
        body = doc.getElementsByTagName('body')[0],
        x = win.innerWidth || docElem.clientWidth || body.clientWidth,
        y = win.innerHeight|| docElem.clientHeight|| body.clientHeight;
    return [x, y];
}

function removeAll(e) {
    while (e.firstChild) {
        e.removeChild(e.lastChild);
    }
    return e;
}

// endless generator for arbitrary colors
// this is how to use it
// var k = 0;
// for (let c of colors()) {
//     console.log(c);
//     if (k++ > 10)
//         break;
// }
function* colors() {
    var c = ['#FF69B4', '#6B8E23', '#F08080', '#2E8B57', '#FFA500',
        '#20B2AA', '#A52A2A', '#1E90FF', '#8B008B'];
    var i = Math.floor(Math.random()*c.length);
    while (true) {
        yield c[(i++) % c.length];
    }
}

var russianMonth = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

var russianMonthGen = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня',
    'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];

var russianWeek = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда',
    'Четверг', 'Пятница', 'Суббота'];

function formatTime(h, m, s) {
    if (s) {
        return `${padWithZeros(h,2)}:${padWithZeros(m,2)}:${padWithZeros(s,2)}`;
    } else {
        return `${padWithZeros(h,2)}:${padWithZeros(m,2)}`;
    }
}


function formatRussianDate(d) {
    d = d || new Date();
    return `${formatTime(d.getHours(), d.getMinutes())}&nbsp;&nbsp;&nbsp;` +
        `${d.getDate()} ${russianMonthGen[d.getMonth()]}&nbsp;&nbsp;&nbsp;` +
        `${d.getFullYear()}&nbsp;&nbsp;&nbsp;${russianWeek[d.getDay()]}`;
}

function getEnglishMonthsCalendar(year, month) {
    // ихняя неделя начинается с воскресенья
    var firstDay = (new Date(year, month, 1)).getDay();
    var daysInMonth = 32 - new Date(year, month, 32).getDate();
    var extra = (firstDay + daysInMonth)%7;
    if (extra != 0) {
        extra = 7 - extra;
    }
    var m = new Array(firstDay + daysInMonth + extra);
    m.fill(0);
    for (let d=1; d<=daysInMonth; d++) {
        m[d+firstDay-1] = d;
    }
    return m;
}

function getMonthsCalendar(year, month) {
    // нормальная человеческая неделя
    // которая начинается с понедельника
    var m = getEnglishMonthsCalendar(year, month);
    if (m[0] == 0) {
        m.shift();
        m.push(0);
    } else {
        m = [0,0,0,0,0,0].concat(m);
        m.push(0);
    }
    return m;
}

//////// some math ///////////////////////

function isClose(a, b, absoluteTolerance) {
    absoluteTolerance = absoluteTolerance || 1e-3;
    return Math.abs(a - b) <= absoluteTolerance;
}



function getEquidistant(x0, x1, n) {
    // returns array of n+1 numbers between x0..x1
    var a = [];
    if (n <= 0) {
        return a;
    }
    a.push(x0);
    if (n == 1) {
        return a;
    }
    var dx = (x1 - x0)/n;
    for (var i=1; i<n; i++) {
        x0 += dx;
        a.push(x0);
    }
    a.push(x1);
    return(a);
}

function within(x, x0, x1, xmax) {
    if (x1 > x0) {
        return x > x0 && x < x1;
    } else {
        if (xmax == undefined) return false;
        return (x > x0 && x < xmax) || (x > 0 && x < x1);
    }
}

function seamless(x, xmin, xmax) {
    // на самом деле надо еще
    // x = x % (xmax - xmin)
    if (x < xmin) {
        return xmax - x;
    } else if (x > xmax) {
        return xmin + x - xmax;
    } else {
        return x;
    }
}

// module exporting
if (typeof module !== 'undefined') {
    module.exports = {
        isClose: isClose,
        getMonthsCalendar: getMonthsCalendar,
        getEnglishMonthsCalendar: getEnglishMonthsCalendar,
    };
}
