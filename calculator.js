
/*
TODO:
*
* калькулятор !!!
*
* on mouse leave draw - remove marker
*
* ticks format 1.0e-00
*
* create Svg dynamically
*
* add units to Xs
*
* several lines simulataneously
*
* константы:
*     функции
*     добавлять маркеры
*
* перевод из одних едениц в другие (массово?)
*
* функция для генерации строки transform
*
* replacement long dash in UTF-8 Encoding: 0xE2 0x80 0x94
*
*/

// page elements:
// все это должно быть запрятано подальше
// после того как решу как лучше все это оформить
var Marker;
var Value;
var Draw, DrawArea, Grid;
var Legend;
var Scale;
var ScaleCorrection;
var ZeroCorrection;

// settings:
var Width = 500;
var Height = 400;
var PolarRadius = 180;
var TickSize = 30;

var color = colors();
var Color = color.next().value;


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
}


function start() {
    translateAngular('0h', null, null, null);
    Value = docEl("#value");
    Draw = docEl("#draw");
    DrawArea = docEl("#draw-area");
    Grid = docEl("#grid");
    Legend = docEl("#legend");
    ScaleCorrection = docEl("#scale-correction");
    ZeroCorrection = docEl("#zero-correction");
    //DrawArea.setAttribute('onmousemove', 'showPoint(event)');
    //Marker = document.getElementById("marker");
}


function getTicks(x0, x1) {
    var t = [];
    var dx = Math.pow(10, Math.round(Math.log10((x1 - x0)/10)));
    var count = (x1 - x0)/dx;
    if (count > 10) {
        dx *= 5;
    } else if (count < 2) {
        dx /= 2;
    }
    var t0 = Math.round(x0/dx + 0.5)*dx;
    for (var x=t0; x<x1; x+=dx) {
        t.push(x);
    }
    return t;
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


function setZero(x0, x1, y0, y1, sx, sy) {
    var tx = TickSize - x0*sx;
    var ty = Height + TickSize + y0*sy;
    svgSetTransform(Draw, tx, ty, 1, -1);
    svgSetTransform(Grid, TickSize - x0*sx, TickSize - y0*sy, 1, 1);
}


function showPoint(e) {
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = Height - (e.clientY - rect.top);
    //console.log(x, y);
    Marker.setAttribute('d', 'M0,'+y+' l'+Width+',0 M'+x+',0 l0,'+Height);
}


function addLegend() {
    var l = document.createElement('li');
    l.innerHTML = '-----';
    l.setAttribute('style', "color:" + Color);
    Legend.appendChild(l);
}


function drawTicks(x0, x1, y0, y1, sx, sy) {
    var ty = y0*sy;
    // X
    var xticks = getTicks(x0, x1);
    var d = [];
    var x, y;
    for (var i=0; i<xticks.length; i++) {
        x = xticks[i]*sx;
        d.push(`M${x},${ty} l0,${Height+TickSize}`);
        svgEl(Grid, 'text', {x: x, y: ty+Height+TickSize})
            .innerHTML = xticks[i].toFixed(2); // TODO: format (f.e. 0.00001)
    }
    svgEl(Grid, 'path', {d: d.join(' '), 'class': 'grid'});
    // Y
    var yticks = getTicks(y0, y1);
    var d = [];
    x = x0*sx-TickSize;
    for (var i=0; i<yticks.length; i++) {
        y = ty + (y1 - yticks[i])*sy;
        d.push(`M${x},${y} l${Width+TickSize},0`);
        svgEl(Grid, 'text', {x: x, y: y})
            .innerHTML = yticks[i].toFixed(2); ;// TODO: format
    }
    svgEl(Grid, 'path', {d: d.join(' '), 'class': 'grid'});
}


function gridToCartesian() {
    svgSetTransform(Grid, TickSize, TickSize, 1, 1);
}

function setFrame() {
    var transX = TickSize + Width / 2;
    var transY = TickSize + Height / 2;
    svgSetTransform(Grid, transX, transY, 1, 1);
    svgSetTransform(Draw, transX, transY, 1, -1);
}

function gridToHorizontal() {
    setFrame();
    svgCircle(Grid, 0, 0, PolarRadius, {class: 'grid'});
    var p = [];
    var x, y, z, d;
    // углы - как в Вики:
    // угол тета - от оси Z вниз
    // угол фи - от оси X против часовой
    // горизонтальная сетка
    for (var t=0; t<=180; t+=15) {
        p.length = 0;
        for (var f=90; f<=270; f+=5) {
            [x,y,z] = sphericalToCartesian(t, f, PolarRadius);
            p.push([y,z].join(','));
        }
        d = 'M' + p.join(' L');
        svgLine(Grid, d, {class: 'grid'});
    }
    // вертикальная сетка
    for (var f=90; f<=270; f+=15) {
        p.length = 0;
        for (var t=0; t<=180; t+=5) {
            [x,y,z] = sphericalToCartesian(t, f, PolarRadius);
            p.push([y,z].join(','));
        }
        d = 'M' + p.join(' L');
        svgLine(Grid, d, {class: 'grid'});
    }
}


function gridToPolar() {
    setFrame();
    for (var r=PolarRadius; r>0; r-=PolarRadius/9) {
        svgCircle(Grid, 0, 0, r, {class: 'grid'});
    }
    for (var a=0; a<180; a+=15) {
        svgStraightLine(Grid, -PolarRadius, 0, 2*PolarRadius, 0, {
            class: 'grid',
            transform: 'rotate('+a+')'});
    }
}


function addPoint(x, y, xreal, yreal) {
    var p = svgEl(Draw, 'circle', {
        'cx': x, 'cy': y, 'r': '0.5%', 'class': 'point', 'fill': Color});
    // TODO: format 0.00001 ....
    svgEl(p, 'title').innerHTML = `x: ${xreal.toFixed(2)} y: ${yreal.toFixed(2)}`;
    //p.setAttribute('onmouseover', 'showPoint(this,'+xreal+','+yreal+')');
}


function drawSeries(xs, ys, sx, sy) {
    // TODO: options: o * V --
    var p = [];
    var x, y;
    for (var i=0; i<xs.length; i++) {
        x = xs[i] * sx;
        y = ys[i] * sy;
        p.push("" + x + "," + y);
        addPoint(x, y, xs[i], ys[i]);
    }
    svgEl(Draw, 'path', {'d': "M" + p.join(" L"), 'stroke': Color});
}


function drawXY(xs, ys) {
    x0 = Math.min.apply(null, xs);
    x1 = Math.max.apply(null, xs);
    y0 = Math.min.apply(null, ys);
    y1 = Math.max.apply(null, ys);
    var sx = Width / (x1 - x0);
    var sy = Height / (y1 - y0);
    // TODO: смотреть на флаг
    removeAll(Draw);
    removeAll(Grid);
    removeAll(Legend);
    gridToCartesian();
    Color = color.next().value;
    setZero(x0, x1, y0, y1, sx, sy);
    drawTicks(x0, x1, y0, y1, sx, sy);
    drawSeries(xs, ys, sx, sy);
    addLegend();
}

function drawFunction() {
    var x0 = docFloat('#x0');
    var x1 = docFloat('#x1');
    var n = docInt('#count');
    var xs = getEquidistant(x0, x1, n);
    var f = docFunction('#function', 'x');
    if (typeof(f) !== 'function') {
        // TODO
        alert("Error: invalid function!");
        return;
    }
    var ys = xs.map(f);
    drawXY(xs, ys);
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
    var xs = ts.map(xt);
    var ys = ts.map(yt);
    drawXY(xs, ys);
}

////////////////////////////


function spiralOfArchimed(f) {
    return (PolarRadius/360) * f;
}


function polarRose(f) {
    return PolarRadius * Math.cos(4 * RadInDeg * f);
}


// function sphericalProjectionSchmidt(theta, fi, r) {
//     var t = RadInDeg * theta;
//     var f = RadInDeg * fi;
//     var sin_t = Math.sin(t);
//     return [
//         r * sin_t * Math.cos(f),
//         r * sin_t * Math.sin(f),
//         r * Math.cos(t) ];
// }
//
//
// function sphericalProjectionWulf(theta, fi, r) {
//     var t = RadInDeg * theta;
//     var f = RadInDeg * fi;
//     var sin_t = Math.sin(t);
//     return [
//         r * sin_t * Math.cos(f),
//         r * sin_t * Math.sin(f),
//         r * Math.cos(t) ];
// }
//

function polarFunction(f) {
    removeAll(Draw);
    removeAll(Grid);
    removeAll(Legend);
    gridToPolar();
    var p = [];
    var xy;
    for (var a=0; a<=360; a+=1) {
        xy = polarToCartesian(a, f(a));
        p.push(xy.join(','));
    }
    var d = 'M' + p.join(' L');
    svgLine(Draw, d, {stroke: '#909090'});
}


function horizontalFunction() {
    removeAll(Draw);
    removeAll(Grid);
    removeAll(Legend);
    gridToHorizontal();
    /*
    p = [];
    var x,y,z,d;
    for (var t=0; t<=90; t+=15) {
        p.length = 0;
        for (var f=90; f<=270; f+=5) {
            [x,y,z] = sphericalProjectionSchmidt(t, f, PolarRadius);
            p.push([y,z].join(','));
        }
        d = 'M' + p.join(' L');
        svgLine(Draw, d, {stroke: '#B09090'});
    }
    */
}



function gridToEqualAreaProjection() {
    setFrame();
    for (var a=0; a<=90; a+=15) {
        svgCircle(Grid, 0, 0, PolarRadius*Math.sqrt(2)*Math.sin(RadInDeg*(a)/2), {class: 'grid'});
    }
    for (var a=0; a<180; a+=15) {
        svgStraightLine(Grid, -PolarRadius, 0, 2*PolarRadius, 0, {
            class: 'grid',
            transform: 'rotate('+a+')'});
    }
}

function projectionEqualArea() {
    removeAll(Draw);
    removeAll(Grid);
    removeAll(Legend);
    gridToEqualAreaProjection();
}



function showShadow() {
    var xs, ys;
    [xs, ys] = getShadowTrack(5);
    drawXY(xs, ys);
}
