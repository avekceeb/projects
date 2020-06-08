
function dbg() {
    console.log(Array.prototype.slice.call(arguments).join(' | '));
}


if (typeof(String.prototype.trim) === "undefined") {
    String.prototype.trim = function() {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}


function docEl(selector) {
    return document.querySelector(selector);
}

function docSet(selector, value) {
    let e = docEl(selector);
    //dbg(e.tagName, e.nodeName);
    if (e) {
        if ('TEXTAREA' === e.tagName)
            e.innerHTML = value;
        else
            e.setAttribute('value', value);
    }
    return e;
}

function docInt(selector) {
    return parseInt(docEl(selector).value);
}


function docFloat(selector) {
    return parseFloat(docEl(selector).value);
}

function docStr(selector) {
    return '' + docEl(selector).value;
}


function docFunction(selector, params) {
    let f;
    let args = Array.from(arguments);
    args.shift();
    let body = docStr(selector).trim();
    if (body.indexOf('function') > -1) {
        body = 'f = ' + body;
    } else if (body.indexOf('return') > -1) {
        body = `f = function(${args.join(',')}){ ${body} }`;
    } else {
        body = `f = function(${args.join(',')}){return (${body});}`;
    } // TODO: if body == ''
    eval(body);
    return f;
}


function padWithZeros(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}


// module exporting
if (typeof module !== 'undefined') {
    module.exports = {
    };
}
