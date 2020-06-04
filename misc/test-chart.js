
var chart;

function start() {
    // let xs = getEquidistant(-100, 200, 20);
    // (new Chart('root', 800, 600))
    //     .child(B)
    //     .data(xs.map(x => x/10), xs.map(x => x*x/(30)))
    //     .data(xs, x => x*2, {type: 'dot'})
    //     .data((function*(){yield -50;yield -10; yield 50;})(), x => x*(-2), {type: 'line'})
    //     .grid()
    //     .show();
    chart = new Chart('map', 800, 600);

}

function drawFunction() {
    var x0 = docFloat('#x0');
    var x1 = docFloat('#x1');
    var n = docInt('#count');
    var f = docFunction('#function', 'x');
    if (typeof(f) !== 'function') {
        // TODO
        alert("Error: invalid function!");
        return;
    }
    chart.grid().data(getEquidistant(x0, x1, n), f).show();
}

function cleanup() {
    chart.cleanup();
}
