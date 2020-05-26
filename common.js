
//////  debug //////////////
var Debug = true;
dbg = function() {
    if (!Debug) {
        return;
    }
    var args = Array.prototype.slice.call(arguments);
    console.log(args.join(' | '));
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


////////// svg ////////////////

function svgEl(parent, name, attrs) {
    var e = document.createElementNS("http://www.w3.org/2000/svg", name);
    if (attrs != undefined) {
        for (var k in attrs) {
            e.setAttribute(k, attrs[k]);
        }
    }
    if (parent != null) {
        parent.appendChild(e);
    }
    return e;
}


function svgStraightLine(parent, x0, y0, dx, dy, attrs) {
    attrs = attrs || {};
    attrs['d'] = `M ${x0},${y0} l${dx},${dy}`;
    var c = svgEl(parent, 'path', attrs);
    return c;
}


function svgCircle(parent, cx, cy, r, attrs) {
    attrs = attrs || {};
    attrs.cx = cx;
    attrs.cy = cy;
    attrs.r = r;
    var c = svgEl(parent, 'circle', attrs);
    return c;
}


//////// some math ///////////////////////

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


// some trigonometry
var RadInDeg = Math.PI/180;
function sin(deg) { return Math.sin(RadInDeg*deg); }

function cos(deg) { return Math.cos(RadInDeg*deg); }

function tan(deg) { return Math.sin(RadInDeg*deg); }



// some hours/minutes/seconds to degrees translation
function hours2deg(h) { return h * 15.0; }

function deg2hours(deg) { return deg / 15.0 };

