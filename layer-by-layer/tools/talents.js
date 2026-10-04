/* Калибровка талантов и сложности: средний капитал по ботам и политикам, разница с игрой без таланта.
   Запуск: node tools/talents.js [число партий на ячейку]. Параметры таланта можно менять так: TALP="des.dem=1.03" node tools/talents.js */
var sim = require('./sim.js');
var N = parseInt(process.argv[2] || '10', 10);
var cells = [['human', 'mid'], ['human', 'best'], ['avg', 'mid'], ['expert', 'mid']];
function avg(kind, pol, opts) { var a = 0; for (var sd = 1; sd <= N; sd++) a += sim.runGame(kind, pol, sd, false, opts).cap; return a / N; }
var base = cells.map(function (c) { return avg(c[0], c[1], { talent: null }); });
console.log('без таланта'.padEnd(14), base.map(function (x) { return (Math.round(x / 1000) + 'k').padStart(7); }).join(''), '   ячейки: ' + cells.map(function (c) { return c.join('/'); }).join(', '));
[null, 'eng', 'des', 'sel'].slice(1).forEach(function (tk) {
  var vals = cells.map(function (c) { return avg(c[0], c[1], { talent: tk }); });
  var rel = vals.map(function (v, i) { return (v / base[i] - 1) * 100; });
  var mean = rel.reduce(function (x, y) { return x + y; }, 0) / rel.length;
  console.log((TALENTS[tk].name).padEnd(14), rel.map(function (x) { return ((x >= 0 ? '+' : '') + x.toFixed(1) + '%').padStart(7); }).join(''), '   среднее ' + mean.toFixed(1) + '%');
});
['easy', 'hard'].forEach(function (dk) {
  var vals = cells.map(function (c) { return avg(c[0], c[1], { talent: null, diff: dk }); });
  var rel = vals.map(function (v, i) { return (v / base[i] - 1) * 100; });
  console.log(('сложность ' + dk).padEnd(14), rel.map(function (x) { return ((x >= 0 ? '+' : '') + x.toFixed(1) + '%').padStart(7); }).join(''));
});
