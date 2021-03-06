/*
 * Карта звездного неба
 * --------------------
 *
 * Что еще сделать:
 *    1) двигать
 *    2) менять контрастность
 *    3) астеризмы, созвездия
 *    4) менять сетку при переходе от экватора к полюсам
 *    5) заменить имена звезд
 *    6) названия созвездий (ссылки на вики)
 *    7) меню: ...
 *    8) zoom
 *    9) рисовать экватор, точки равноденствия, полюса, эклиптику...
 *
 */

var Map = {

    // координаты событий
    _x: -1, _y: -1, _moving: false,

    // коэффициенты для вычисления радиуса по зв. величине
    _b: -0.1, _c: 1.9,

    _min_mag: 5,  // минимальная величина

    svg: null, draw: null, tags: null,
    w: 0, h: 0,

    ra0: 0, ra1: 0, dec0: 0, dec1: 0, decRange: 0,

    scaleX: 1, scaleY: 1,

    e2h: function (r,d) {return [r,d];},

    ra2x: function(ra) {
            // бесшовная карта
            if (this.ra0 > this.ra1) {
                if (within(ra, 0, this.ra1)) {
                    ra += 360;
                }
            }
            return (ra - this.ra0) * this.scaleX;
        },

    dec2y: function(dec) {
        return (dec - this.dec0)* this.scaleY;
    },

    x2ra: function(x) {
            var ra = x/this.scaleX + this.ra0;
            // if (ra >= 360) ra -= 360;
            return ra;
        },

    y2dec: function(y) {
        return (this.h - y)/this.scaleY + this.dec0;
    },

    checkVisible: function(s) {
        // порог: видимая величина
        if (this._min_mag < s.mag) return false;
        // сетка X не пересекает 0:
        var alt, az;
        [az, alt] = this.e2h(s.ra, s.dec);
        return within(az, this.ra0, this.ra1, 360) &&
            within(alt, this.dec0, this.dec1);
        // return within(s.ra, this.ra0, this.ra1, 360) &&
        //     within(s.dec, this.dec0, this.dec1);
    },

    drawStar: function(s) {
        // видимая величина - радиус
        var r = this._c * (10 ** (this._b * s.mag/3));
        r = (6 - s.mag) * r;
        if (r < 1.5) r = 1.5;
        // спектральный класс
        var c = '#d0d0d0';
        var l = s.st[0];
        if (s.st.indexOf('g:') == 0) {
            l = s.st[2];
        } else if (['g', 'c', 'd'].indexOf(l) >= 0) {
            l = s.st[1];
        } else if (s.st.indexOf('sg') == 0) {
            l = s.st[2];
        }
        switch (l) {
            case 'W':
            case 'O': c = '#99adff'; break; //голубой
            case 'B': c = '#c9d7ff'; break; //бело-голубой
            case 'A': c = '#f8f7ff'; break; //белый
            case 'F': c = '#fff4eb'; break; //желто-белый
            case 'G': c = '#fff2a1'; break; //желтый
            case 'K': c = '#ffc370'; break; //оранжевый
            case 'M':
            case 'C':
            case 'S': c = '#ff6161'; break; //красный
            default:
                dbg('Unknown spectral class: ', s.st);
        }
        var az, alt;
        [az, alt] = this.e2h(s.ra, s.dec);
        // var x = this.ra2x(s.ra);
        // var y = this.dec2y(s.dec);
        var x = this.ra2x(az);
        var y = this.dec2y(alt);
        if (s.name.search(' ') > 0) {
            var letter = svgEl(this.tags, 'text',
                // tag frame is not reverted axes
                {x: this.w - x + r + 2, y: this.h - y - r - 2});
            letter.innerHTML = s.name.split(' ', 1)[0];
        }
        var circle = svgCircle(this.draw, x, y, r, {
            'class': 'star', 'fill': c});
        var t = svgEl(circle, 'title');
        t.innerHTML =
            `${s.name} (${s.ra.toFixed(2)}&deg; ${s.dec.toFixed(2)}&deg;)`;
    },

    drawRegion: function(r) {
        // TODO: check visibility
        for (let c of ConstellationBoundaries) {
            var points = [];
            var bounds = c['bounds'];
            for (let i of bounds) {
                var ra = parseFloat(i[0]);
                var dec = parseFloat(i[1]);
                points.push([this.ra2x(ra), this.dec2y(dec)].join(','));
            }
            svgEl(this.draw, 'polygon',
                {points: points.join(' '), 'class': 'hilitable'});
        }
    },

    redrawGrid: function() {
        // TODO: привязать сетку к целым значениям
        // вертикальная
        for (var r=this.ra0; this.w > this.ra2x(r); r+=10) {
            svgStraightLine(this.draw,
                this.ra2x(r), 0,
                0, this.h, {'class': 'grid'});
        }
        // горизонтальная
        for (var d=this.dec0; d<this.dec1; d+=10) {
            svgStraightLine(this.draw,
                this.ra2x(this.ra0), this.dec2y(d),
                this.w, 0, {'class': 'grid'});
        }
    },

    redrawMap: function() {
        removeAll(this.draw);
        removeAll(this.tags);
        this.drawRegion();
        this.redrawGrid();
        for (let s of BSC) {
            if (this.checkVisible(s)) {
                this.drawStar(s);
            }
        }
        // dbg(this);
    },

    shiftMap: function(dx, dy) {
        // сдвиг по X:
        // проворачиваем по кругу
        var ra = this.ra0 + (dx / this.scaleX);
        ra = seamless(ra, 0, 360);
        this.ra0 = ra;
        this.ra1 = seamless(ra + 90, 0, 360);
        // сдвиг по Y:
        // останавливаемся на -90 и на +90
        var dec = this.dec0 + (dy / this.scaleY);
        if (dy/this.scaleY > this.decRange || dy/this.scaleY < -this.decRange) {
            dbg('This should not happen');
        } else if (dec < -90.0) {
            this.dec0 = -90;
            this.dec1 = this.decRange - 90;
        } else if (dec > 90.0 - this.decRange) {
            this.dec0 = 90 - this.decRange;
            this.dec1 = 90;
        } else {
            this.dec0 = dec;
            this.dec1 = this.dec0 + this.decRange;
        }
        this.redrawMap();
    },

    init: function() {

        var that = this;
        // очищаем
        var page = document.getElementsByTagName("body")[0];
        removeAll(page);

        // размеры
        [w, h] = getSizes();
        this.w = w - 30;
        this.h = h - 30;

        // главный элемент
        this.svg = svgEl(page, 'svg', {
            width: this.w, height: this.h,
            version: '1.1',
            viewBox: `0 0 ${this.w} ${this.h}`});

        // background
        svgEl(this.svg, 'rect', {
            x: 0, y: 0, width: '100%', height: '100%',
            fill: '#000000', stroke: 'none'});

        if (true) {
            // возьмем начальную карту как:
            // c 2-х до 8-ми часов
            this.ra0 = hours2deg(2.0);
            this.ra1 = hours2deg(8.0);
            // берем масштаб по Y = масштаб по X:
            this.scaleX = this.scaleY = this.w / (this.ra1 - this.ra0);
            // масштаб по Х: raRange == 90 degrees = 6 hours
            // масштаб по Y:
            this.decRange = (this.h / this.scaleY);
            this.dec0 = -this.decRange/2;
            this.dec1 = this.decRange/2;
        } else {
            var jd = julianDateNow();
            var s0 = siderealTime(jd);
            this.e2h = getE2HTransformMap(s0, DefaultLatitude, DefaultLongitude);
            this.ra0 = -45.0;
            this.ra1 = 45.0;
            this.scaleX = this.scaleY = this.w / (this.ra1 - this.ra0);
            this.decRange = (this.h / this.scaleY);
            this.dec0 = 0;
            this.dec1 = this.decRange;
        }
        // создаем группу для звезд
        this.draw = svgEl(this.svg, 'g', {
            transform:`translate(${this.w},${this.h}) scale(-1,-1)`});


        this.tags = svgEl(this.svg, 'g', {visibility:"visible"});

        this.redrawMap();

        // события
        this.svg.onmousedown = function(e) {
            if (that._moving) return;
            that._x = parseInt(e.clientX);
            that._y = parseInt(e.clientY);
            that._moving = true;
        };

        this.svg.onmouseup = function(e) {
            if (!that._moving) return;
            that._moving = false;
        };

        this.svg.onmousemove = function(e) {
            if (!that._moving) return;
            var x = parseInt(e.clientX);
            var y = parseInt(e.clientY);
            var dx = x - that._x;
            var dy = y - that._y;
            that._x = x;
            that._y = y;
            that.shiftMap(dx, dy);
        };

        page.onkeydown = function(event) {
            var shiftStep = 50;
            switch (event.key) {
            case 'ArrowUp': that.shiftMap(0, shiftStep); break;
            case 'ArrowDown': that.shiftMap(0, -shiftStep); break;
            case 'ArrowLeft': that.shiftMap(shiftStep, 0); break;
            case 'ArrowRight': that.shiftMap(-shiftStep, 0); break;
            case ' ':
                if ('visible' == that.tags.getAttribute('visibility'))
                    that.tags.setAttribute('visibility', 'hidden');
                else
                    that.tags.setAttribute('visibility', 'visible');
                break;
            }
        };

        page.onwheel = function(event) {
            event.preventDefault();
            var k = 1 - 0.05 * Math.sign(event.deltaY);
            // TODO: take care of limits!
            dbg(that.x2ra(event.clientX), that.y2dec(event.clientY));
            // var centerRa = (that.ra1 + that.ra0) / 2;
            // var centerDec = (that.dec1 + that.dec0) / 2;
            // TODO: rescale function
            that.ra1 *= k;
            that.ra0 *= k;
            that.dec0 *= k;
            that.dec1 *= k;
            that.scaleX = that.scaleY = that.w / (that.ra1 - that.ra0);
            that.decRange = (that.h / that.scaleY);
            that.redrawMap();
        };
    },

    toString: function() {
        return `
width:   ${this.w}
height:  ${this.h}
scale-x: ${this.scaleX.toFixed(2)}
scale-y: ${this.scaleY.toFixed(2)}
RA:      ${this.ra0.toFixed(2)}..${this.ra1.toFixed(2)}
Dec:     ${this.dec0.toFixed(2)}..${this.dec1.toFixed(2)}
`;
    }

};



function start() {
    Map.init();
}
