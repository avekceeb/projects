
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


// arctg(tg(t)/sin(1))
//
// 90-arccos(cos(1)/sqrt(1 + tg(t)*tg(t)))

// module exporting
if (typeof module !== 'undefined') {
    module.exports = {
        sin: sin,
        cos: cos,
        tg: tg,
        arccos: arccos,
        hours2deg: hours2deg,
        deg2hours: deg2hours,
    };
}
