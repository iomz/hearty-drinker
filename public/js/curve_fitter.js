var graph = new Graph(document.getElementById("scratch"), 60, 1);
var genetic = Genetic.create();
genetic.optimize = Genetic.Optimize.Minimize;
genetic.select1 = Genetic.Select1.Tournament2;
genetic.select2 = Genetic.Select2.FittestRandom;
genetic.seed = function() {
    var a = [];
    var i;
    for (i = 0; i < this.userData["terms"]; ++i) {
        a.push(Math.random() - .01);
    }
    return a;
};
genetic.mutate = function(entity) {
    var drift = (Math.random() - .5) * 2 * .05;
    var i = Math.floor(Math.random() * entity.length);
    entity[i] += drift;
    return entity;
};
genetic.crossover = function(mother, father) {
    function lerp(a, b, p) {
        return a + (b - a) * p;
    }
    var len = mother.length;
    var i = Math.floor(Math.random() * len);
    var r = Math.random();
    var son = [].concat(father);
    var daughter = [].concat(mother);
    son[i] = lerp(father[i], mother[i], r);
    daughter[i] = lerp(mother[i], father[i], r);
    return [ son, daughter ];
};
genetic.evaluatePoly = function(coefficients, x) {
    var s = 0;
    var p = 1;
    var i;
    for (i = 0; i < coefficients.length; ++i) {
        s += p * coefficients[i];
        p *= x;
    }
    return s;
};
genetic.fitness = function(entity) {
    var sumSqErr = 0;
    var vertices = this.userData["vertices"];
    var i;
    for (i = 0; i < vertices.length; ++i) {
        var err = this.evaluatePoly(entity, vertices[i][0]) - vertices[i][1];
        sumSqErr += err * err;
    }
    return Math.sqrt(sumSqErr);
};

genetic.generation = function(pop, generation, stats) {};

genetic.notification = function(pop, generation, stats, isFinished) {
    function poly(entity) {
        var a = [];
        var i;
        for (i = entity.length - 1; i >= 0; --i) {
            var buf = entity[i].toPrecision(2);
            if (i > 1) buf += "<em><b>x<sup>" + i + "<sup></b></em>"; else if (i == 1) buf += "<em><b>x</b></em>";
            a.push(buf);
        }
        return a.join(" + ");
    }
    function lerp(a, b, p) {
        return a + (b - a) * p;
    }
    if (generation == 0) {
        graph.solutions = [];
    }
    $("#solution").html(poly(pop[0].entity));
    $("#generation").html(generation + 1);
    $("#bestfit").html(pop[0].fitness.toPrecision(4));
    $("#vertexerror").html((pop[0].fitness / graph.vertices.length).toPrecision(4));
    $("#avgbestfit").html(stats.mean.toPrecision(4));
    $("#errorstdev").html(stats.stdev.toPrecision(4));
    var last = graph.last || "";
    var str = pop[0].entity.join(",");
    if (last != str || isFinished) {
        if (last != str) {
            graph.solutions.push(pop[0].entity);
            graph.last = str;
        }
        graph.draw();
        var i;
        var start = Math.max(0, graph.solutions.length - 10);
        if (isFinished) {
            start = 0;
        }
        for (i = start; i < graph.solutions.length; ++i) {
            var p = (i - start) / (graph.solutions.length - start);
            var r = Math.round(lerp(90, 255, p));
            var g = Math.round(lerp(0, 255, 0));
            var b = Math.round(lerp(200, 50, p));
            var alpha = lerp(.5, 1, p);
            var strokeStyle = "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
            var lineWidth = Math.floor(lerp(10, 1, p));
            graph.drawFunction(graph.solutions[i], strokeStyle, lineWidth);
        }
        graph.drawVertices();
    }
};

function Graph(canvas, xmax, ymax) {
    this.canvas = document.getElementById("scratch");
    this.xmax = xmax;
    this.ymax = ymax;
    this.width = parseInt(canvas.style.width);
    this.height = parseInt(canvas.style.height);
    var dpr = window.devicePixelRatio || 1;
    canvas.width = this.width * dpr;
    canvas.height = this.height * dpr;
    this.ctx = canvas.getContext("2d");
    this.ctx.scale(dpr, dpr);
    this.bound = [ 0, this.width - 1, this.height - 1, 0 ];
    this.bound[0] += 25;
    this.bound[1] -= 25;
    this.bound[2] -= 25;
    this.bound[3] += 25;
    this.vertices = [];
    this.solutions = [];
}

Graph.prototype.drawFunction = function(coefficients, strokeStyle, lineWidth) {
    var ctx = this.ctx;
    ctx.save();
    var bound = this.bound;
    ctx.strokeStyle = strokeStyle;
    var xmax = this.xmax;
    var ymax = this.ymax;
    var xstride = (bound[1] - bound[3]) / xmax;
    var ystride = (bound[2] - bound[0]) / ymax;
    var inc = 1 / xstride;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    var x;
    for (x = 0; x < xmax; x += inc) {
        var cx = x * xstride + bound[3];
        var cy = bound[2] - genetic.evaluatePoly(coefficients, x) * ystride;
        if (x == 0) {
            ctx.moveTo(cx, cy);
        } else {
            ctx.lineTo(cx, cy);
        }
    }
    ctx.stroke();
    ctx.restore();
};

Graph.prototype.draw = function() {
    var ctx = this.ctx;
    ctx.save();
    var bound = this.bound;
    ctx.strokeStyle = "#fff";
    ctx.fillStyle = "#fff";
    ctx.clearRect(0, 0, this.width, this.height);
    var xmax = this.xmax;
    var ymax = this.ymax;
    var xstride = (bound[1] - bound[3]) / xmax;
    var ystride = (bound[2] - bound[0]) / ymax;
    var i;
    for (i = 0; i <= xmax; i+=5) {
        var cx = i * xstride + bound[3];
        var y = bound[2];
        ctx.strokeStyle = "#eee";
        ctx.beginPath();
        ctx.moveTo(cx, bound[0]);
        ctx.lineTo(cx, y);
        ctx.stroke();
    }
    for (i = 0; i <= ymax; i+=0.1) {
        var cx = bound[3];
        var y = bound[2] - i * ystride;
        ctx.beginPath();
        ctx.moveTo(cx, y);
        ctx.lineTo(bound[1], y);
        ctx.stroke();
    }
    ctx.beginPath();
    ctx.strokeStyle = "#bbb";
    ctx.moveTo(bound[3], bound[0]);
    ctx.lineTo(bound[3], bound[2]);
    ctx.lineTo(bound[1], bound[2]);
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.lineWidth = 1;
    var i;
    ctx.strokeStyle = "#000";
    for (i = 0; i <= xmax; i+=5) {
        var cx = i * xstride + bound[3];
        var y = bound[2];
        ctx.beginPath();
        ctx.moveTo(cx, y);
        ctx.lineTo(cx, y + 4);
        ctx.stroke();
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(i, cx, y + 16);
    }
    for (i = 0; i <= ymax; i+=0.1) {
        var cx = bound[3];
        var y = bound[2] - i * ystride;
        ctx.beginPath();
        ctx.moveTo(cx, y);
        ctx.lineTo(cx - 4, y);
        ctx.stroke();
        ctx.font = "12px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(i, cx - 8, y + 4);
    }
    ctx.restore();
};

Graph.prototype.drawVertices = function() {
    var ctx = this.ctx;
    ctx.save();
    var bound = this.bound;
    var xmax = this.xmax;
    var ymax = this.ymax;
    var xstride = (bound[1] - bound[3]) / xmax;
    var ystride = (bound[2] - bound[0]) / ymax;
    var i;
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;
    for (i = 0; i < this.vertices.length; ++i) {
        var cx = this.vertices[i][0] * xstride + bound[3];
        var cy = bound[2] - this.vertices[i][1] * ystride;
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
    ctx.restore();
};

$(document).ready(function() {
    graph.vertices = []; // [[x,y],[x2,y2],...]
    for ( var k  in logs ) {
        var minute = 5;
        for ( var i in logs[k].concentrations ) {
            graph.vertices.push( [minute, logs[k].concentrations[i]] );
            minute += 5;
        }
        break;
    }
    graph.draw();
    graph.drawVertices();
    var config = {
        iterations: 1000,
        size: 250,
        crossover: 0.2, // 0.0-1.0
        mutation: 0.4, // 0.0-1.0
        skip: 10
    };
    var degree = 2; // N-dimention
    var userData = {
        terms: parseInt(degree + 1),
        vertices: graph.vertices
    };
    genetic.evolve(config, userData);
});
