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
 *
 */


var Map = {

    // координаты событий
    _x: -1, _y: -1, _moving: false,

    // коэффициенты для вычисления радиуса по зв. величине
    _b: -0.1, _c: 1.9,

    _min_mag: 5,  // минимальная величина

    svg: null, draw: null, w: 0, h: 0,

    ra0: 0, ra1: 0, dec0: 0, dec1: 0, decRange: 0,

    scaleX: 1, scaleY: 1,

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

    x2ra: function(x) {  // not used so far
            var ra = x/this.scaleX + this.ra0;
            if (ra >= 360) ra -= 360;
            return ra;
        },

    y2dec: function(y) { return y/this.scaleY; },

    checkVisible: function(s) {
        // порог: видимая величина
        if (this._min_mag < s.mag) return false;
        // сетка X не пересекает 0:
        return within(s.ra, this.ra0, this.ra1, 360) &&
            within(s.dec, this.dec0, this.dec1);
    },

    drawStar: function(s) {
        // видимая величина - радиус
        var r = this._c * (10 ** (this._b * s.mag/3));
        r = (6 - s.mag) * r;
        if (r < 1.5) r = 1.5;
        // спектральный класс
        var c = '#d0d0d0';
        switch (s.st[0]) {
            case 'O': c = '#99adff'; break; //голубой
            case 'B': c = '#c9d7ff'; break; //бело-голубой
            case 'A': c = '#f8f7ff'; break; //белый
            case 'F': c = '#fff4eb'; break; //желто-белый
            case 'G': c = '#fff2a1'; break; //желтый
            case 'K': c = '#ffc370'; break; //оранжевый
            case 'M': c = '#ff6161'; break; //красный
            default:
                dbg('Unknown spectral class: ', s.st);
        }
        var x = this.ra2x(s.ra);
        var y = this.dec2y(s.dec);
        var circle = svgCircle(this.draw, x, y, r, {
            'class': 'star', 'fill': c});
        var t = svgEl(circle, 'title');
        t.innerHTML =
            `${s.name} (${s.ra.toFixed(2)}&deg; ${s.dec.toFixed(2)}&deg;)`;
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
        this.redrawGrid();
        var s;
        for (i in BSC) {
            s = BSC[i];
            if ( ! this.checkVisible(s)) {
                continue;
            }
            this.drawStar(s);
        }
    },

    init: function() {

        var _it = this;
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
            viewBox: `0 0 ${this.w} ${this.h}`}
            );

        // background
        svgEl(this.svg, 'rect', {
            x: 0, y: 0, width: '100%', height: '100%',
            fill: '#000000', stroke: 'none'});

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
        this.draw = svgEl(this.svg, 'g', {
            transform:`translate(${this.w},${this.h}) scale(-1,-1)`});

        this.redrawMap();

        // события
        this.svg.onmousedown = function(e) {
            if (_it._moving) return;
            _it._x = parseInt(e.clientX);
            _it._y = parseInt(e.clientY);
            _it._moving = true;
        };

        this.svg.onmouseup = function(e) {
            if (!_it._moving) return;
            _it._moving = false;
            var dx = parseInt(e.clientX) - _it._x;
            var dy = parseInt(e.clientY) - _it._y;
            // сдвиг по X:
            // проворачиваем по кругу
            var ra = _it.ra0 + (dx / _it.scaleX);
            ra = seamless(ra, 0, 360);
            _it.ra0 = ra;
            _it.ra1 = seamless(ra + 90, 0, 360);
            // сдвиг по Y:
            // останавливаемся на -90 и на +90
            var dec = _it.dec0 + (dy / _it.scaleY);
            if (dy/_it.scaleY > _it.decRange || dy/_it.scaleY < -_it.decRange) {
                dbg('Too big leap!');
            } else if (dec < -90.0) {
                _it.dec0 = -90;
                _it.dec1 = _it.decRange - 90;
            } else if (dec > 90.0 - _it.decRange) {
                _it.dec0 = 90 - _it.decRange;
                _it.dec1 = 90;
            } else {
                _it.dec0 = dec;
                _it.dec1 = _it.dec0 + _it.decRange;
            }
            _it.redrawMap();
            dbg(_it);
        }
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
    dbg(Map);
}
