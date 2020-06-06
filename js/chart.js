
// written by Dmitry Alexeev

function Chart(id, w, h, type) {

    var XInverted = false,
        YInverted = true,
        Pad = 30, // px
        Sx = 1, Sy = 1,
        X0 = 0, X1 = 0, Y0 = 0, Y1 = 0,
        X2P = function(x){return x*Sx;},
        Y2P = function(y){return y*Sy;},
        Data = [], // array of series [x] [y], [x] [y]...
        // TODO: if w < pad ???
        Root = new Svg(id, w, h),
        Width = w - Math.floor(Pad*1.3),
        Height = h - Math.floor(Pad*1.3),
        GridX = false,
        GridY = false,
        Chart = null;

    var Colors = (function*() {
        var c = ['#FF69B4', '#6B8E23', '#F08080', '#2E8B57', '#FFA500',
            '#20B2AA', '#A52A2A', '#1E90FF', '#8B008B'];
        var i = Math.floor(Math.random()*c.length);
        while (true) {
            yield c[(i++) % c.length];
        }
    })();


    function Series(xs, ys, attrs) {
        if (xs instanceof Array) {
            // Array
            this.xs = xs;
        } else if (typeof xs === 'object' && typeof xs.next === 'function') {
            // Generator
            this.xs = [];
            for (let i of xs) {
                this.xs.push(i);
            }
        } else {
            throw 'Bad X series!'
        }
        if (ys instanceof Array) {
            this.ys = ys;
        } else if (typeof ys === 'object' && typeof ys.next === 'function') {
            this.ys = [];
            for (let i of ys) {
                this.ys.push(i);
            }
        } else if (typeof ys === 'function') {
            this.ys = [];
            for (let i of this.xs) {
                this.ys.push(ys(i));
            }
        } else {
            throw 'Bad Y series!'
        }
        if (typeof attrs === 'object') {
            Object.assign(this, attrs);
        }
        // TODO: if xs.length > ys.length
        this.x0 = Math.min.apply(null, this.xs);
        this.x1 = Math.max.apply(null, this.xs);
        this.y0 = Math.min.apply(null, this.ys);
        this.y1 = Math.max.apply(null, this.ys);
    }

    function ticks(x0, x1) {
        var t = [];
        var dx = Math.pow(10, Math.round(Math.log10((x1 - x0)/10)));
        var count = (x1 - x0)/dx;
        if (count > 10) {
            dx *= 5;
        } else if (count < 2) {
            dx /= 2;
        }
        var t0 = Math.round(x0/dx + 0.5)*dx;
        for (var x=t0; x<x1; x+=dx) {
            t.push(x);
        }
        return t;
    }

    function rescale() {
        if (Data.length == 0) {
            X0 = 0;
            X1 = 0;
            Y0 = 0;
            Y1 = 0;
            return;
        }
        // find ranges for X and Y
        X0 = Data[0].x0;
        X1 = Data[0].x1;
        Y0 = Data[0].y0;
        Y1 = Data[0].y1;
        for (let i=1; i<Data.length; i++) {
            X0 = Math.min(X0, Data[i].x0);
            X1 = Math.max(X1, Data[i].x1);
            Y0 = Math.min(Y0, Data[i].y0);
            Y1 = Math.max(Y1, Data[i].y1);
        }
        Sx = Width / (X1 - X0);
        Sy = Height / (Y1 - Y0);
        // TODO: Tx Ty depends on X Y Inverted
        Chart.transform(-X0*Sx, Height+Y0*Sy,
            -1*XInverted+(!XInverted), -1*YInverted+(!YInverted));
        Root.g('ticks').transform(-X0*Sx, Height-Y0*Sy);
    }

    this.data = function(xs, ys, name, attrs) {
        Data.push(new Series(xs, ys, name, attrs));
        return this;
    }

    this.nodata = function() {
        Data.splice(0, Data.length);
        return this;
    }

    this.grid = function(type) {
        // polar | log
        type = type | 'cartesian';
        GridX = true;
        GridY = true;
        return this;
    }

    this.nogrid = function() {
        GridX = '';
        GridY = '';
        return this;
    }

    this.show = function() {
        Chart.clear();
        Root.g('ticks').clear();
        // find ranges and scales for current data
        rescale();
        if (X0==X1 || Y0==Y1) {
            return; // ranges invalid
        }
        // draw grid
        if (GridX && GridY) {
            // TODO: polar | log
            let grid = Chart.g('grid');
            let tick = Root.g('ticks');
            for (let t of ticks(X0, X1)) {
                grid.vline(X2P(t), Y2P(Y0), Y2P(Y1-Y0))
                    .set({stroke: '#d0d0d0', fill: 'none'});
                // ticks frame is not inverted y
                tick.text(X2P(t)+Pad, Y2P(Y0)+Pad, t)
                    .set('font-size', '14px');
            }
            for (let t of ticks(Y0, Y1)) {
                grid.hline(X2P(X0), Y2P(t), X2P(X1-X0))
                    .set({stroke: '#d0d0d0', fill: 'none'});
                // TODO: is there a more sane way???
                tick.text(X2P(X0), Y2P(2*Y0-t), t)
                    .set('font-size', '14px');
            }
        }
        // draw data
        for (let series of Data) {
            let type = series.type || 'line-dot-tip';
            let color = series.color ? series.color : Colors.next().value;
            let xs = series.xs.map(X2P);
            let ys = series.ys.map(Y2P);
            if (type.indexOf('line') !== -1) {
                Chart.path(xs, ys).color(color);
            }
            if (type.indexOf('dot') !== -1) {
                for (let i in xs) {
                    let d = Chart.circle(xs[i], ys[i], 2).color(color);
                    if (type.indexOf('tip') !== -1) {
                        // value in real scale
                        d.title(`${series.xs[i]} , ${series.ys[i]}`);
                    }
                }
            }
        }
    }

    this.cleanup = function() {
        this.nodata();
        this.show();
	return this;
    }

    this.child = function(parent) {
        Root.child(parent);
        return this;
    }

    Chart = Root.g('ticks')
        .parent()
        .g('pad').transform(Pad, 0)
        .rectangle(0, 0, Width, Height).set({fill: 'none', stroke: '#d0d0d0'})
        .parent()
        // initially: x - not inverted ; y - inverted
        .g('chart').transform(0, Height, 1, -1)
        .g('grid').parent();
}
