

/*
ra (а) прямое восхождение светила
dec (д) склонение светила
s0 гринвическое звездное время
lat (ф) широта места наблюдения
lon (л) долгота места наблюдения
*/
function equatorialToHorizontal(ra, dec, s0, lat, lon) {
    var t;// часовой угол
    var z; // зенитное расстояние в гориз. сист.
    var az; // азимут в гориз. сист. (от S? на запад)
    t = s0 + lon - ra;
    z = arccos(sin(lat)*sin(dec) + cos(lat)*cos(dec)*cos(t));
    if (Number.isNaN(z)) {
        throw 'Cos(z) > 1 !!!'
    }
    az = arccos((sin(lat)*cos(dec)*cos(t) - cos(lat)*sin(dec))/sin(z));
    if (Number.isNaN(az)) {
        throw 'Cos(az) > 1 !!!'
    }
    // TODO: sign ???
    return [Math.sign(t)*az, 90-z];
}


function getE2HTransform(s0, lat, lon) {
    var s = s0 + lon;
    var sinLat = sin(lat);
    var cosLat = cos(lat);
    return function(ra, dec) {
        var az, z, t;
        t = s - ra;
        var cosT = cos(t);
        var sinDec = sin(dec);
        var cosDec = cos(dec);
        z = arccos(sinLat*sinDec + cosLat*cosDec*cosT);
        az = arccos((sinLat*cosDec*cosT - cosLat*sinDec)/sin(z));
        return [Math.sign(t)*az, 90-z];
    };
}

function getE2HTransformMap(s0, lat, lon) {
    var s = s0 + lon;
    var sinLat = sin(lat);
    var cosLat = cos(lat);
    return function(ra, dec) {
        var az, z, t;
        t = s - ra;
        var cosT = cos(t);
        var sinDec = sin(dec);
        var cosDec = cos(dec);
        z = arccos(sinLat*sinDec + cosLat*cosDec*cosT);
        az = arccos((sinLat*cosDec*cosT - cosLat*sinDec)/sin(z));
        return [-1*Math.sign(t)*az, 90-z];
    };
}
