var Tm = null;
var TmMap = 0;
/*
карта мира:

*/

var mapWidth = 720;
var mapHeight = 360;
// TODO: по-хорошему надо выставлять transform
// но он уже стоит в 2

function lon2xMap(lon) {
    var x = lon;
    if (x > 360)
        x -= 360;
    if (x < -360)
        x += 360;
    return x;
}

function lat2yMap(lat) {
    return lat;
}

function drawShadow() {
    var dt = new Date();
    var middayLon = 15*(12 - (dt.getUTCHours() + dt.getUTCMinutes() / 60 + dt.getUTCSeconds() / 3600));
    var middayX = lon2xMap(middayLon);
    var g = document.getElementById('overlay');
    removeAll(g);
    svgStraightLine(g, middayX, -180, 0, 180*2, {stroke: 'red', 'stroke-opacity':0.3, 'stroke-width':'0.5px'});
    var midnightLon = middayLon + 180;
    var midnightX = lon2xMap(midnightLon);
    svgStraightLine(g, midnightX, -180, 0, 180*2, {stroke: 'blue', 'stroke-opacity':0.3, 'stroke-width':'0.5px'});
    // TODO:
    // форма кривой края рассвет-закат
    // синусоида ? в равноденствии должна быть верт прямой...
    // var a = [];
    // for (let i=-180; i<=180; i+=5) {
    //     a.push(i);
    // }
    // svgPathFromFunction(g, function(x){return 90*cos(x);}, a, {fill:'none', stroke: '#00ff00'});
    // svgPathFromFunction(g, function(x){return arccos(cos(x)*cos(80))-90;}, a, {fill:'none', stroke: '#ff0000'});

}



function tick() {
    var d = document.getElementById('date');
    var utc = document.getElementById('date-utc');
    var j = document.getElementById('date-julian');
    var gst = document.getElementById('gst');
    var dt = new Date();
    var jd = julianDateNow(dt);
    var s = siderealTime(jd);
    d.innerHTML = formatRussianDate(dt);
    utc.innerHTML = `${formatTime(dt.getUTCHours(), dt.getUTCMinutes())} UTC`;
    j.innerHTML = `JD: ${jd.toFixed(2)}`;
    gst.innerHTML = `GST: ${s.toFixed(2)}&deg;`;
    // каледарь на месяц
    var m = document.getElementById('calendar-table');
    removeAll(m);
    var cal = getMonthsCalendar(dt.getFullYear(), dt.getMonth());
    while (cal.length > 0) {
        let week = cal.splice(0, 7);
        var tr = document.createElement('tr');
        for (let day of week) {
            var td = document.createElement('td');
            if (day != 0)
                td.innerHTML = day;
            if (day == dt.getDate())
                td.setAttribute('class', 'current');
            tr.appendChild(td);
        }
        m.appendChild(tr);
    }
    if (++TmMap >= 10) {
        TmMap = 0;
        drawShadow();
    }
    Tm = setTimeout(tick, 3000);
}
