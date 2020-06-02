

// интервал таймера
var dT = 100;
// угловая скорость (градусов / dT )
var V = 5;
var Color = colors();


/*
 - большая полуось (a)
 - эксцентриситет (e)
 - аргумент перицентра (o = omega)
 - средняя аномалия (Mo)
 - наклонение (i)
 - долгота восходящего узла (Omega)
 ----------------------------------
 * r - радиус тела
 */

function Orbital(parent, a, e, o, m, r) {

    ////// параметры орбиты ////////////
    this.a = a;

    this.e = e;

    this.o = o;  // TODO

    this.m = 0;  // TODO

    // ставим начальную фазу просто по m
    this.t = Math.floor(Math.random()*100);

    // радиус
    this.r = Math.floor(Math.random()*10 + 3);

    // малая полуось
    this.b = a * Math.sqrt(1 - e*e);

    // фокальный параметр
    this.p = this.a * (1 - this.e*this.e);

    // расстояние от фокуса до тела
    this.getR = function() {
        return this.p / (1 - this.e*Math.cos(this.t));
    }

    /////////// собственные спутники /////////////////
    this.orbits = [];

    // svg
    this.svgGroup = null;
    this.svg

    if (parent != null) {
        this.updatePos = function() {
            var r = this.getR();
            // пересчет полярных в декартовы
            // учитываем сдвиг влево на фокальное расстояние (c = e*a)
            var t = 'translate('+(r*Math.cos(this.t) - this.e*this.a)+','+r*Math.sin(this.t)+')'
            this.svgGroup.setAttributeNS(null, 'transform', t);
        };
    } else {
        this.updatePos = function() { };
    }

    this.tick = function(dt) {
        this.t += dt;
        if (this.svgGroup == undefined) {
            return;
        }
        this.updatePos();
        for (var i in this.orbits) {
            // TODO: set periods
            this.orbits[i].tick(dt*5);
        }
    }

    // группа орбиты
    this.svg0 = svgEl(parent == null ? null : parent.svgGroup, 'g', {
        class: 'orbit',
        // сдвинуть влево на фокальное расстояние (c = e*a)
        // чтобы фокус был в 0
        transform: 'translate('+(-this.e*this.a)+',0)'+
        // повернуть орбиту на аргумент перицентра
        // против часовой
        ' rotate(-'+this.o+' '+(this.e*this.a)+' 0)'});
    // орбита
    svgEl(this.svg0, 'ellipse', {
        cx: 0, cy: 0, rx: this.a, ry: this.b,
        fill: 'none', stroke: '#D0D0D0'});
    // группа тела
    this.svgGroup = svgEl(this.svg0, 'g', { class: 'planet', transform: '' });
    // тело
    svgEl(this.svgGroup, 'circle', {
        cx: 0, cy: 0, r: this.r,
        fill: Color.next().value, stroke: 'none'});
    this.updatePos();

    if (parent == null) {
        return;
    }

    // parent.svgGroup.appendChild(g);
    parent.orbits.push(this);

};



/*
 * таймаут внутри объекта останавливается после нескольких раз
 * почему ???
 * используем внешнюю переменную
 */
var Tm = null;

function tick() {
    Img.tick();
    Tm = setTimeout(tick, dT);
}


/*
 - центр тяготения - в 0 0
 - направление на восходящий узел (откуда
     отсчитываем аргумент перицентра) - по оси X
*/

var Img = {

    svg: null, w: 0, h: 0,

    // центр системы
    center: null,

    init: function() {

        // очищаем
       // this.orbits.splice(0, this.orbits.length);
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
            viewBox: [0,0,this.w,this.h].join(' ')}
            );

        // центральное тело
        this.center = new Orbital(null, 0, 0, 0, 0);
        svgSetTransform(this.center.svg0, this.w/2, this.h/2, 1, 1);
        this.svg.appendChild(this.center.svg0);
        //
        page.onclick = this.toggle;
        // чтобы передать в event
        var __this = this;
        page.onkeypress = function(event) {
            switch(event.key) {
                case ' ':
                    __this.toggle();
                    break;
                case 'x':
                    __this.init();
                    break;
                case 'd':
                    __this.init();
                    __this.demo();
                    break;
                default:
                    return;
            }
        };
        return this;
    },

    tick: function() {
        for (var i in this.center.orbits) {
            this.center.orbits[i].tick(V * RadInDeg);
        }
    },

    demo: function() {
        for (var i=0; i<10; i++) {
            var a = Math.floor(Math.random()*250 + 50);
            var e = Math.random();
            var z = Math.floor(Math.random()*360);
            var o = new Orbital(Img.center, a, e, z);
            new Orbital(o, a/3, e/2, 0);
        }
        tick();
    },

    demo2: function() {
        for (var i=5; i<90; i+=5) {
            new Orbital(Img.center, 350*Math.sin(RadInDeg*i), 0, 0);
        }
        tick();
    },

    toggle: function() {
        if (Tm) {
            clearTimeout(Tm);
            Tm = null;
        } else {
            tick();
        }
    },

};

function start() {
    Img.init();
    Img.demo();
}
