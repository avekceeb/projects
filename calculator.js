
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
var X0, X1, N;
var Marker;
var Value;
var Func;
var Draw, DrawArea, Grid;
var Legend;
var Scale;
var ScaleCorrection;
var ZeroCorrection;

// settings:
var Width = 400;
var Height = 400;
var PolarRadius = 180;
var TickSize = 30;
var Colors = ['#FF69B4', '#6B8E23', '#F08080', '#2E8B57', '#FFA500',
        '#20B2AA', '#A52A2A', '#1E90FF', '#8B008B'];
var Color = Colors[0];



if (typeof(String.prototype.trim) === "undefined") {
    String.prototype.trim = function() {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}


// some trigonometry
var RadInDeg = Math.PI/180;
function sin(deg) { return Math.sin(RadInDeg*deg); }

function cos(deg) { return Math.cos(RadInDeg*deg); }

function tan(deg) { return Math.sin(RadInDeg*deg); }



// some hours/minutes/seconds to degrees translation
function hms2float(h, m, s) {
    if (h < 0)
        return h - m/60.0 - s/3600.0;
    else
        return s/3600.0 + m/60.0 + h;
}

function hours2deg(h) { return h * 15.0; }

function deg2hours(deg) { return deg / 15.0 };

function float2hms(deg) {
    var degrees, minutes, seconds;
    var is_positive = (deg >= 0);
    degrees = Math.abs(deg)*3600;
    minutes = Math.floor(degrees/60);
    seconds = degrees % 60;
    degrees = Math.floor(minutes/60);
    minutes = minutes % 60;
    // !!! if deg = -0.1
    if (!is_positive) {
        degrees = -degrees;
    }
    return [degrees, minutes, seconds];
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
    if (h === undefined || Number.isNaN(parseInt(h))) {
        h = 0;
    }
    if (m === undefined || Number.isNaN(parseInt(m))) {
        m = 0;
    }
    if (s === undefined || Number.isNaN(parseFloat(s))) {
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
    var elHours = document.getElementById("hours");
    var elDegrees = document.getElementById("degrees");
    var elDms = document.getElementById("dms");
    var elHms = document.getElementById("hms");
    var h=0, hm=0, hs=0, d=0, dm=0, ds=0, hrs=0, deg=0;
    if (hms != null) {
        [h, hm, hs] = parseAngularString(hms);
        hrs = hms2float(h, hm, hs);
        deg = hours2deg(hrs);
        [d, dm, ds] = float2hms(deg);
    }
    if (dms != null) {
        [d, dm, ds] = parseAngularString(dms);
        deg = hms2float(d, dm, ds);
        hrs = deg2hours(deg);
        [h, hm, hs] = float2hms(hrs);
    }
    if (hour != null) {
        hrs = parseFloat(hour);
        if (Number.isNaN(hrs)) {
            hrs = 0;
        }
        deg = hours2deg(hrs);
        [h, hm, hs] = float2hms(hrs);
        [d, dm, ds] = float2hms(deg);
    }
    if (degree != null) {
        deg = parseFloat(degree);
        if (Number.isNaN(deg)) {
            deg = 0;
        }
        hrs = deg2hours(deg);
        [h, hm, hs] = float2hms(hrs);
        [d, dm, ds] = float2hms(deg);
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


function createAngular() {
    var table = document.createElement('table');

}


/*
function translateHMS(v) {
    horizontalFunction();
    var x, y, z;
    var x,y,z,d;
    var p = [];
    for (var t=0; t<=180; t+=1) {
            [x,y,z] = sphericalProjectionSchmidt(t, -(deg-90), PolarRadius);
            p.push([y,z].join(','));
    }
    d = 'M' + p.join(' L');
    svgLine(Draw, d, {stroke: '#A52A2A'});
}
*/

function start() {
    translateAngular('0h', null, null, null);
    Value = document.getElementById("value");
    Func = document.getElementById("function");
    Draw = document.getElementById("draw");
    DrawArea = document.getElementById("draw-area");
    Grid = document.getElementById("grid");
    Legend = document.getElementById("legend");
    ScaleCorrection = document.getElementById("scale-correction");
    ZeroCorrection = document.getElementById("zero-correction");
    X0 = document.getElementById("x0");
    X1 = document.getElementById("x1");
    N = document.getElementById("count");
    Func.value = 'x';
    N.value = '10';
    //DrawArea.setAttribute('onmousemove', 'showPoint(event)');
    //Marker = document.getElementById("marker");
}


function removeAll(e) {
    while (e.firstChild) {
        e.removeChild(e.lastChild);
    }
}


function createSvgElement(n) {
    return document.createElementNS("http://www.w3.org/2000/svg", n);
}
function svgEl(name, attrs) {
    var e = document.createElementNS("http://www.w3.org/2000/svg", name);
    if (attrs != undefined) {
        for (var k in attrs) {
            e.setAttribute(k, attrs[k]);
        }
    }
    return e;
}


function svgCircle(parent, cx, cy, r, attrs) {
    var c = svgEl('circle', {cx:cx, cy:cy, r:r});
    if (null != parent) {
        parent.appendChild(c);
    }
    if (attrs) {
        for (var k in attrs) {
            c.setAttribute(k, attrs[k]);
        }
    }
    return c;
}


function svgStraightLine(parent, x0, y0, dx, dy, attrs) {
    var c = svgEl('path');
    c.setAttribute('d', 'M'+x0+','+y0+' l'+dx+','+dy);
    if (null != parent) {
        parent.appendChild(c);
    }
    if (attrs) {
        for (var k in attrs) {
            c.setAttribute(k, attrs[k]);
        }
    }
    return c;
}


function svgLine(parent, d, attrs) {
    var c = svgEl('path');
    c.setAttribute('d', d);
    if (null != parent) {
        parent.appendChild(c);
    }
    if (attrs) {
        for (var k in attrs) {
            c.setAttribute(k, attrs[k]);
        }
    }
    return c;
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


function getX0() {
    return parseFloat(X0.value);
}


function getX1() {
    return parseFloat(X1.value);
}


function getN() {
    return parseFloat(N.value);
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
    Draw.setAttribute('transform',
        'translate(' + tx + ',' + ty + ') scale(1,-1)');
    Grid.setAttribute('transform',
        'translate(' + (TickSize - x0*sx) + ',' + (TickSize - y0*sy) + ')');
}


function getFunction() {
    // return new Function('x', 'y', 'return x + y');
    eval('f = function(x){ return (' + Func.value + ');}');
    return f; 
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
    l.innerHTML = "f(x)=" + Func.value;
    l.setAttribute('style', "color:" + Color);
    Legend.appendChild(l);
}


function drawTicks(x0, x1, y0, y1, sx, sy) {
    var ty = y0*sy;
    // X
    var xticks = getTicks(x0, x1);
    var xpath = createSvgElement('path');
    var d = [];
    var x, y;
    for (var i=0; i<xticks.length; i++) {
        x = xticks[i]*sx;
        d.push('M'+x+','+ty+' l0,'+(Height+TickSize));
        var txt = createSvgElement('text');
        txt.setAttribute('x', x);
        txt.setAttribute('y', ty+Height+TickSize);
        txt.innerHTML = '' + xticks[i];
        Grid.appendChild(txt);
    }
    xpath.setAttribute('d', d.join(' '));
    xpath.setAttribute('class', 'grid');
    Grid.appendChild(xpath);
    // Y
    var yticks = getTicks(y0, y1);
    var ypath = createSvgElement('path');
    var d = [];
    x = x0*sx-TickSize;
    for (var i=0; i<yticks.length; i++) {
        y = ty + (y1 - yticks[i])*sy;
        d.push('M'+x+','+y+' l'+(Width+TickSize)+ ',0');
        var txt = createSvgElement('text');
        txt.setAttribute('x', x);
        txt.setAttribute('y', y);
        txt.innerHTML = '' + yticks[i];
        Grid.appendChild(txt);
    }
    ypath.setAttribute('d', d.join(' '));
    ypath.setAttribute('class', 'grid');
    Grid.appendChild(ypath);
}


function gridToCartesian() {
    // not needed...
    Grid.setAttribute('transform', 'translate('+TickSize+','+TickSize+')');
}


function gridToHorizontal() {
    Grid.setAttribute('transform', 'translate('+(TickSize+Width/2)+','+(TickSize+Height/2)+') scale(1,-1)');
    Draw.setAttribute('transform', 'translate('+(TickSize+Width/2)+','+(TickSize+Height/2)+') scale(1,-1)');
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
    Grid.setAttribute('transform', 'translate('+(TickSize+Width/2)+','+(TickSize+Height/2)+') scale(1,-1)');
    Draw.setAttribute('transform', 'translate('+(TickSize+Width/2)+','+(TickSize+Height/2)+') scale(1,-1)');
    for (var r=PolarRadius; r>0; r-=PolarRadius/9) {
        var c = svgCircle(Grid, 0, 0, r, {class: 'grid'});
    }
    for (var a=0; a<180; a+=15) {
        svgStraightLine(Grid, -PolarRadius, 0, 2*PolarRadius, 0, {
            class: 'grid',
            transform: 'rotate('+a+')'});
    }
}


function gridToEqualAreaProjection() {
    Grid.setAttribute('transform', 'translate('+(TickSize+Width/2)+','+(TickSize+Height/2)+') scale(1,-1)');
    Draw.setAttribute('transform', 'translate('+(TickSize+Width/2)+','+(TickSize+Height/2)+') scale(1,-1)');
    for (var a=0; a<=90; a+=15) {
        //var c = svgCircle(Grid, 0, 0, PolarRadius*Math.tan(RadInDeg*(a)/2), {class: 'grid'});
        var c = svgCircle(Grid, 0, 0, PolarRadius*Math.sqrt(2)*Math.sin(RadInDeg*(a)/2), {class: 'grid'});
    }
    /*
    for (var a=0; a<180; a+=15) {
        svgStraightLine(Grid, -PolarRadius, 0, 2*PolarRadius, 0, {
            class: 'grid',
            transform: 'rotate('+a+')'});
    }*/
}


function addPoint(x, y, xreal, yreal) {
    var p = createSvgElement('circle');
    var t = createSvgElement('title');
    t.innerHTML = 'x: ' + xreal + ' y: ' + yreal;
    p.appendChild(t);
    p.setAttribute('cx', x);
    p.setAttribute('cy', y);
    p.setAttribute('r', '1%');
    p.setAttribute('class', 'point');
    p.setAttribute('fill', Color);
    //p.setAttribute('onmouseover', 'showPoint(this,'+xreal+','+yreal+')');
    Draw.appendChild(p);
}


function drawSeries(xs, ys, sx, sy) {
    // TODO: options: o * V --
    var path = createSvgElement('path');
    var p = [];
    var x, y;
    for (var i=0; i<xs.length; i++) {
        x = xs[i] * sx;
        y = ys[i] * sy;
        p.push("" + x + "," + y);
        addPoint(x, y, xs[i], ys[i]);
    }
    path.setAttribute('d', "M" + p.join(" L"));
    path.setAttribute('stroke', Color);
    Draw.appendChild(path);
}


function moveMarker(x, y) {
}


function drawFunction() {
    var x0, x1, y0, y1;
    var x0 = getX0();
    var x1 = getX1();
    var n = getN();
    var xs = getEquidistant(x0, x1, n);
    var ys = [];
    var f = getFunction();
    if (typeof(f) !== 'function') {
        // TODO
        alert("Error: invalid function!");
        return;
    }
    x0 = x1 = xs[0];
    y0 = y1 = f(x0);
    ys.push(y0);
    var y;
    for (var i=1; i<xs.length; i++) {
        x0 = Math.min(x0, xs[i]);
        x1 = Math.max(x1, xs[i]);
        y = f(xs[i]);
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
        ys.push(y);
    }
    var sx = Width / (x1 - x0);
    var sy = Height / (y1 - y0);
    // TODO: смотреть на флаг
    removeAll(Draw);
    removeAll(Grid);
    removeAll(Legend);
    gridToCartesian();
    //
    Color = Colors[Math.floor(Math.random()*Colors.length)];
    setZero(x0, x1, y0, y1, sx, sy);
    drawTicks(x0, x1, y0, y1, sx, sy);
    drawSeries(xs, ys, sx, sy);
    addLegend();
}


function spiralOfArchimed(f) {
    return (PolarRadius/360) * f;
}


function polarRose(f) {
    return PolarRadius * Math.cos(4 * RadInDeg * f);
}


function sphericalToCartesian(theta, fi, r) {
    var t = RadInDeg * theta;
    var f = RadInDeg * fi;
    var sin_t = Math.sin(t);
    return [
        r * sin_t * Math.cos(f),
        r * sin_t * Math.sin(f),
        r * Math.cos(t) ];
}


function sphericalProjectionSchmidt(theta, fi, r) {
    var t = RadInDeg * theta;
    var f = RadInDeg * fi;
    var sin_t = Math.sin(t);
    return [
        r * sin_t * Math.cos(f),
        r * sin_t * Math.sin(f),
        r * Math.cos(t) ];
}


function sphericalProjectionWulf(theta, fi, r) {
    var t = RadInDeg * theta;
    var f = RadInDeg * fi;
    var sin_t = Math.sin(t);
    return [
        r * sin_t * Math.cos(f),
        r * sin_t * Math.sin(f),
        r * Math.cos(t) ];
}



function polarToCartesian(f, r) {
    return [r * Math.cos(RadInDeg*f), r * Math.sin(RadInDeg*f)];
}


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

function projectionEqualArea() {
    removeAll(Draw);
    removeAll(Grid);
    removeAll(Legend);
    gridToEqualAreaProjection();
}
