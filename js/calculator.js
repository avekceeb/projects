

var chart;


function start() {
    chart = new Chart('map', 500, 400);
}


function showTab(evt, tab) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tab).style.display = "block";
    evt.currentTarget.className += " active";
    if (tab == 'angular-tab') {
        drawHorizontal();
	docEl('#hms').focus();
    }
    if (tab == 'parametric-tab') {
        drawHorizontal();
	docEl('#function-x-t').focus();
    }
    if (tab == 'univariate-tab') {
        drawHorizontal();
	docEl('#function').focus();
    }
}


function parseAngularString(v) {
    v = '' + v;
    var h, m, s;
    // заменяем градусы, минуты, секунды - пробелами
    v = v.replace(/d|h|m|s|ч|г|м|с|\u00b0|\u2032|\u2033/g, ' ');
    // TODO: длинный минус UTF8
    v = v.replace(/\u2012\u2013|\u2014|\u{e28892}/g, "-");
    // запятую - на точку
    v = v.replace(/,/g, '.');
    v = v.trim();
    [h, m, s] = v.split(/\s+/g, 3);
    if (h === undefined || isNaN(parseInt(h))) {
        h = 0;
    }
    if (m === undefined || isNaN(parseInt(m))) {
        m = 0;
    }
    if (s === undefined || isNaN(parseFloat(s))) {
        s = 0;
    }
    return [parseInt(h), parseInt(m), parseFloat(s)];
}

function formatDMS(d, m, s) {
    return `${d.toFixed()}\u00b0 ${m.toFixed()}\u2032 ${s.toFixed(2)}\u2033`;
}

function formatHMS(h, m, s) {
    return `${h.toFixed()}h ${m.toFixed()}\u2032 ${s.toFixed(2)}\u2033`;
}

function translateAngular(hour, degree, hms, dms) {
    var elHours = docEl("#hours");
    var elDegrees = docEl("#degrees");
    var elDms = docEl("#dms");
    var elHms = docEl("#hms");
    var h=0, hm=0, hs=0, d=0, dm=0, ds=0, hrs=0, deg=0;
    if (hms != null) {
        [h, hm, hs] = parseAngularString(hms);
        hrs = hms2float(h, hm, hs);
        deg = hours2deg(hrs);
        [d, dm, ds] = deg2hms(deg);
    }
    if (dms != null) {
        [d, dm, ds] = parseAngularString(dms);
        deg = hms2float(d, dm, ds);
        hrs = deg2hours(deg);
        [h, hm, hs] = deg2hms(hrs);
    }
    if (hour != null) {
        hrs = parseFloat(hour);
        if (Number.isNaN(hrs)) {
            hrs = 0;
        }
        deg = hours2deg(hrs);
        [h, hm, hs] = deg2hms(hrs);
        [d, dm, ds] = deg2hms(deg);
    }
    if (degree != null) {
        deg = parseFloat(degree);
        if (Number.isNaN(deg)) {
            deg = 0;
        }
        hrs = deg2hours(deg);
        [h, hm, hs] = deg2hms(hrs);
        [d, dm, ds] = deg2hms(deg);
    }
    // set values
    if (hour == null)
        elHours.value = hrs.toFixed(4) + 'h';
    if (degree == null)
        elDegrees.value = deg.toFixed(4) + '\u00b0';
    if (dms == null)
        elDms.value = formatDMS(d, dm, ds);
    if (hms == null)
        elHms.value = formatHMS(h, hm, hs);

    drawHorizontal();

}


function drawFunction() {
    var x0 = docFloat('#x0');
    var x1 = docFloat('#x1');
    var n = docInt('#count');
    var f = docFunction('#function', 'x');
    if (typeof(f) !== 'function') {
        // TODO
        alert("Error: invalid function!");
        return;
    }
    chart.grid().data(getEquidistant(x0, x1, n), f).show();
}


function drawPolarFunction() {
    let x0 = docFloat('#x0'),
        x1 = docFloat('#x1'),
        n = docInt('#count'),
        f = docFunction('#function', 'x');
    if (typeof(f) !== 'function') {
        throw ("Error: invalid function!");
    }
    let xs = [], ys = [], radius;
    for (let angle of getEquidistant(x0, x1, n)) {
        radius = f(angle);
        xs.push(radius * cos(angle));
        ys.push(radius * sin(angle));
    }
    chart.grid().data(xs, ys).show();
}


function drawParametricFunction() {
    var xt = docFunction("#function-x-t", 't');
    var yt = docFunction("#function-y-t", 't');
    if (typeof(xt) !== 'function' || typeof(yt) !== 'function') {
        alert("Error: invalid function!");
        return;
    }
    var t0 = docFloat("#t0");
    var t1 = docFloat("#t1");
    var n = docInt("#count-t");
    var ts = getEquidistant(t0, t1, n);
    chart.grid().data(ts.map(xt), ts.map(yt)).show();
}

function drawHorizontal() {
    let radius = 10;
    // TODO: as grid:
    chart.cleanup().nogrid();
    var x, y, z, d;
    // углы - как в Вики:
    // угол тета - от оси Z вниз
    // угол фи - от оси X против часовой
    // горизонтальная сетка
    for (var t=0; t<=180; t+=15) {
        let xs = [], ys = [];
        for (var f=90; f<=270; f+=5) {
            [x,y,z] = sphericalToCartesian(t, f, radius);
            xs.push(y);
            ys.push(z);
        }
        chart.data(xs, ys, {type:'line', color:'#d0d0d0'});
    }
    // вертикальная сетка
    for (var f=90; f<=270; f+=15) {
        let xs = [], ys = [];
        for (var t=0; t<=180; t+=5) {
            [x,y,z] = sphericalToCartesian(t, f, radius);
            xs.push(y);
            ys.push(z);
        }
        chart.data(xs, ys, {type:'line', color:'#d0d0d0'});
    }
    chart.show();
}


function cleanup() {
    chart.cleanup();
}

// function gridToPolar() {
//     setFrame();
//     for (var r=PolarRadius; r>0; r-=PolarRadius/9) {
//         svgCircle(Grid, 0, 0, r, {class: 'grid'});
//     }
//     for (var a=0; a<180; a+=15) {
//         svgStraightLine(Grid, -PolarRadius, 0, 2*PolarRadius, 0, {
//             class: 'grid',
//             transform: 'rotate('+a+')'});
//     }
// }

