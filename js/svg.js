
// written by Dmitry Alexeev

function Svg(id, w, h) {

    var that = this,
        width,
        height,
        xInverted = false,
        yInverted = false;

    function G(id) {
        SvgElement.call(this, 'g', id);
    }

    function Line(x0, y0, x1, y1, id) {
        SvgElement.call(this, 'path', id);
        if (typeof x0 === 'undefined')
            return;
        this.set('d', `M ${x0},${y0} l ${x1},${y1}`);
    }

    function Path(xs, ys, id) {
        SvgElement.call(this, 'path', id);
        if (!xs)
            return;
        let points = [];
        for (let i in xs) {
            points.push(`${xs[i]},${ys[i]}`);
        }
        this.set('d', 'M ' + points.join(' L'));
    }

    function Circle(x, y, r, id) {
        SvgElement.call(this, 'circle', id);
        this.set('cx', x);
        this.set('cy', y);
        this.set('r', r);
    }

    function Rectangle(x, y, w, h, id) {
        SvgElement.call(this, 'rect', id);
        this.set('x', x);
        this.set('y', y);
        this.set('width', w);
        this.set('height', h);
    }

    function Text(x, y, value, id) {
        SvgElement.call(this, 'text', id);
        this.set('x', x);
        this.set('y', y);
        this.e.innerHTML = value;
    }

    function SvgElement(tag, id, find) {
        // TODO: set / dont set props/meth depending on tag
        //this.tag = tag;
        this.e = null;
        this.p = null;
        if (id) {
            this.e = document.getElementById(id);
            // TODO: check tag ???
        }
        if ((!this.e) && (!find)) {
            this.e = document.createElementNS("http://www.w3.org/2000/svg", tag);
            if (id)
                this.e.setAttribute('id', id);
        }

        this.transform = function(tx, ty, sx, sy) {
            if (typeof sx === 'undefined') {
                sx = 1;
                sy = 1;
            }
            this.e.setAttribute('transform',
                `translate(${tx},${ty}) scale(${sx},${sy})`);
            return this;
        }

        this.set = function(k, v) {
            if (typeof k === 'object') {
                for (let i in k) {
                    this.e.setAttribute(i, k[i]);
                }
            } else {
                this.e.setAttribute(k, v);
            }
            return this;
        }

        // this.find = function(id) {
        //     return new SvgElement(null, id, true);
        // }

        this.child = function(parent) {
            if (typeof parent === 'string') {
                this.p = new SvgElement(null, parent);
                this.p.e.appendChild(this.e);
            } else if (!(parent instanceof Element)) {
                this.p = parent;
                this.p.e.appendChild(this.e);
            } else {
                parent.appendChild(this.e);
            }
            // TODO: else
            return this;
        }

        this.parent = function() {
            return this.p;
        }

        this.clear = function() {
            while (this.e.firstChild) {
                this.e.removeChild(this.e.lastChild);
            }
            return this;
        }

        this.color = function(color) {
            if (this instanceof Line || this instanceof Path) {
                this.e.setAttribute('stroke', color);
            }
            if (this instanceof Circle || this instanceof Rectangle) {
                this.e.setAttribute('fill', color);
            }
            return this;
        }

        this.g = function(id) {
            // Should these methods
            // return new objects???
            return (new G(id)).child(this);
            // return this;
        }

        this.line = function(x0, y0, x1, y1, id) {
            return (new Line(x0, y0, x1, y1, id)).child(this);
        }

        this.vline = function(x0, y0, l, id) {
            return (new Line(x0, y0, 0, l, id)).child(this);
        }

        this.hline = function(x0, y0, l, id) {
            return (new Line(x0, y0, l, 0, id)).child(this);
        }

        this.path = function(xs, ys, id) {
            return (new Path(xs, ys, id)).child(this);
        }

        this.circle = function(x, y, r, id) {
            return (new Circle(x, y, r, id)).child(this);
        }

        this.rectangle = function(x, y, w, h, id) {
            return (new Rectangle(x, y, w, h, id)).child(this);
        }

        this.text = function(x, y, value, id) {
            return (new Text(x, y, value, id)).child(this);
        }

        this.title = function(value, id) {
            return (new (function(){
                SvgElement.call(this, 'title', id);
                this.e.innerHTML = value;
            })).child(this);
        }
        // this.finish = function() {
        //     delete this.e;
        //     delete this.transform;
        // }
    }


    SvgElement.call(this, 'svg', id);
    width = w ||
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.getElementsByTagName('body')[0].clientWidth;
    height = h ||
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.getElementsByTagName('body')[0].clientHeight;
    this.set('width', width).set('height', height);
    this.set('viewBox', [0,0,width,height].join(' '));
}
