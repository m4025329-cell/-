/* Проверка «кода класса»: одинаковый код даёт одинаковые случайности, разные коды дают разные,
   шум спроса по товару не зависит от остальных решений игрока. */
require('./load.js');

var bad = 0;
function ok(c, msg) { console.log((c ? 'ok   ' : 'FAIL ') + msg); if (!c) bad++; }

/* простая партия: на каждом месяце первые варианты событий, план Фила */
function play(seed, opts) {
  opts = opts || {};
  var s = newState('Т', { seed: seed }), caps = [];
  for (var m = 1; m <= TOTAL; m++) {
    s.month = m;
    var stages = (typeof stagesOf === 'function' ? stagesOf(s) : EVENTS[m - 1].stages(s));
    stages.forEach(function (st, i) { var c = st.choices.filter(function (c) { return !(c.req && c.req(s)) && !(fn(c.cost, s) > s.cash); })[0] || st.choices[st.choices.length - 1]; c.apply(s, rngFor(s, 'ev' + m + ':' + i)); coverDeficit(s); });
    if (opts.unlockAll) PROD_IDS.forEach(function (id) { s.unlocked[id] = true; });
    suggestPlan(s); runMonth(s); caps.push(ownerCapital(s));
  }
  return caps;
}
var a = play('КЛАСС-7'), b = play('КЛАСС-7'), c = play('другой');
ok(JSON.stringify(a) === JSON.stringify(b), 'один код: полностью одинаковая партия');
ok(JSON.stringify(a) !== JSON.stringify(c), 'другой код: партия отличается');

/* шум товара «брелок» в месяце 3 не зависит от того, открыты ли другие товары */
function keyDemand(unlockMini) {
  var s = newState('Т', { seed: 'ШУМ' }); s.month = 3; s.unlocked.mini = unlockMini; suggestPlan(s);
  var r = runMonth(s); return r.rows.key.demand;
}
ok(keyDemand(false) === keyDemand(true), 'шум спроса на брелоки не зависит от открытых товаров');

/* два вызова rngFor с одним тегом дают одну и ту же последовательность */
var s0 = newState('Т', { seed: 'X1' });
var r1 = rngFor(s0, 'ev3:0'), r2 = rngFor(s0, 'ev3:0');
ok(r1() === r2() && r1() === r2(), 'rngFor воспроизводим');

/* разные теги дают разные значения, а числа лежат в [0,1) */
var vals = []; for (var i = 0; i < 200; i++) vals.push(rand01(s0, 'k' + i));
ok(vals.every(function (v) { return v >= 0 && v < 1; }), 'rand01 в диапазоне [0,1)');
var mean = vals.reduce(function (x, y) { return x + y; }, 0) / vals.length;
ok(Math.abs(mean - 0.5) < 0.08, 'rand01 равномерен (среднее ' + mean.toFixed(3) + ')');

process.exit(bad ? 1 : 0);
