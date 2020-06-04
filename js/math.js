
const RadInDeg = Math.PI/180;


function sin(deg) {
    return Math.sin(RadInDeg*deg);
}


function cos(deg) {
    return Math.cos(RadInDeg*deg);
}


function tg(deg) {
    return Math.tan(RadInDeg*deg);
}


function arccos(x) {
    return Math.acos(x) / RadInDeg;
}


function arctg(x) {
    return Math.atan(x) / RadInDeg;
}


function sqrt(x) {
    return Math.sqrt(x);
}


function hours2deg(h) {
    return h * 15.0;
}


function deg2hours(deg) {
    return deg / 15.0
}


function deg2hms(deg) {
    var degrees, minutes, seconds;
    var is_positive = (deg >= 0);
    degrees = Math.abs(deg)*3600;
    minutes = Math.floor(degrees/60);
    seconds = degrees % 60;
    degrees = Math.floor(minutes/60);
    minutes = minutes % 60;
    if (!is_positive) { // !!! if deg = -0.1
        degrees = -degrees;
    }
    return [degrees, minutes, seconds];
}


function hms2float(h, m, s) {
    if (h < 0)
        return h - m/60.0 - s/3600.0;
    else
        return s/3600.0 + m/60.0 + h;
}


function polarToCartesian(f, r) {
    return [r * Math.cos(RadInDeg*f), r * Math.sin(RadInDeg*f)];
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
        sin: sin,
        cos: cos,
        tg: tg,
        arccos: arccos,
        arctg: arctg,
        hours2deg: hours2deg,
        deg2hours: deg2hours,
    };
}
