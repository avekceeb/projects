
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


function hours2deg(h) {
    return h * 15.0;
}

function deg2hours(deg) {
    return deg / 15.0
}


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
