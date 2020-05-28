

// Julian Day of 1 January 2000, 00:00 UTC
const jd2000 = 2451544.5;


function julianDate(y, m, d) {
    /*
    Days after 24 November 4714 BC
    https://www.aavso.org/jd-calculator
    https://en.wikipedia.org/wiki/Julian_day
    */
    y = parseInt(y);
    m = parseInt(m);
    d = parseFloat(d);
    if (m < 3) {
        y -= 1;
        m += 12;
    }
    var A = parseInt(y / 100);
    var B = 2 - A + parseInt(A / 4);
    // if (y <= 1582)
    //     B = 0
    var C = parseInt(365.25 * y);
    var D = parseInt(30.6001 * (m + 1));
    return B + C + D + d + 1720994.5;
}


function julianDateNow() {
    // Note: with seconds precision only !!!
    var now = new Date();
    var y = now.getUTCFullYear();
    var m = 1 + now.getUTCMonth();
    var d = now.getUTCDate();
    var h = now.getUTCHours();
    var min = now.getUTCMinutes();
    var sec = now.getUTCSeconds();
    return julianDate(y, m , d + h/24 + min/1440 + sec/86400);
}


function siderealTime(jd) {
    /*
    Greenwich Mean Sidereal Time at Longitude 0 (in degrees)
    https://www.aa.quae.nl/en/reken/sterrentijd.html
    https://hackage.haskell.org/package/astro
    */
    var dJD = jd - jd2000;
    return (
        99.967794687 +
        360.98564736628603 * dJD +
        2.907879e-13 * dJD * dJD +
        -5.302e-22 * dJD * dJD * dJD
    ) % 360 ;
}


// module exporting
if (typeof module !== 'undefined') {
    module.exports = {
        jd2000: jd2000,
        julianDate: julianDate,
        julianDateNow: julianDateNow,
        siderealTime: siderealTime,
    };
}
