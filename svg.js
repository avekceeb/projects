
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

// module exporting
/*
if (typeof module !== 'undefined') {
    module.exports = {
        svgEl: svgEl,
        svgStraightLine: svgStraightLine,
        svgCircle: svgCircle
    };
}
*/
