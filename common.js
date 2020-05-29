


const DefaultLatitude = 59.58;
const DefaultLongitude = 30.14;

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

// endless generator for arbitrary colors
// this is how to use it
// var k = 0;
// for (let c of colors()) {
//     console.log(c);
//     if (k++ > 10)
//         break;
// }
function* colors() {
    var c = ['#FF69B4', '#6B8E23', '#F08080', '#2E8B57', '#FFA500',
        '#20B2AA', '#A52A2A', '#1E90FF', '#8B008B'];
    var i = Math.floor(Math.random()*c.length);
    while (true) {
        yield c[(i++) % c.length];
    }
}

//////// some math ///////////////////////

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
        isClose: isClose,
    };
}
