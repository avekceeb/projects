

var chart;


function start() {
    chart = new Chart('map', 500, 400);
    // reset univariate
    docSet('#function', 'sin(x)*cos(2*x)').focus();
    docSet('#x0', '-360');
    docSet('#x1', '180');
    docSet('#count', '100');
    drawFunction();
    // reset parametric
    docSet('#function-x-t', 'sin(2*t)').focus();
    docSet('#function-y-t', 'sin(3*t)');
    docSet('#t0', '0');
    docSet('#t1', '360');
    docSet('#count-t', '100');
    // reset polar
    docSet('#f0', '0');
    docSet('#f1', 360);
    docSet('#count-f', '100'),
    docEl('#f-series-type', 'cos(4*f)').focus();
    // reset angular
    docSet('#hms', '0h 0m 0s').focus();
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
    switch (tab) {
        case 'angular-tab': drawHorizontal(); break;
        case 'parametric-tab': drawParametricFunction(); break;
        case 'univariate-tab': drawFunction(); break;
        case 'polar-tab': drawPolarFunction(); break;
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
    let t = docEl('#series-type');
    try {
        var f = docFunction('#function', 'x');
        chart.cleanup().grid().data(
            getEquidistant(x0, x1, n), f,
                {'type':t.options[t.selectedIndex].value})
            .show();
    } catch (e) {
        return;
    }
}


function drawPolarFunction() {
    let f0 = docFloat('#f0'),
        f1 = docFloat('#f1'),
        n = docInt('#count-f'),
        t = docEl('#f-series-type'),
        f;
    try {
        f = docFunction('#function-r-f', 'f');
    } catch (e) {
        return;
    }
    let xs = [], ys = [], radius;
    for (let angle of getEquidistant(f0, f1, n)) {
        radius = f(angle);
        xs.push(radius * cos(angle));
        ys.push(radius * sin(angle));
    }
    chart.cleanup().grid().data(xs, ys,
        {'type':t.options[t.selectedIndex].value}).show();
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
    let t = docEl('#t-series-type');
    var ts = getEquidistant(t0, t1, n);
    chart.cleanup().grid().data(
        ts.map(xt), ts.map(yt), {'type':t.options[t.selectedIndex].value})
        .show();
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
