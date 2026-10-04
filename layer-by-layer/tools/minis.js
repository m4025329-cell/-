/* «Случаи в мастерской»: проверка структуры каждого события и оценка выгоды каждого варианта.
   node tools/minis.js          — структура: тексты, чипы, отсутствие NaN, инварианты
   node tools/minis.js eff [N]  — выгода: средний итоговый капитал при каждом варианте относительно месяца без случая */
require('./load.js');
var sim = require('./sim.js');
var mode = process.argv[2] || 'check';

function mulb(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function bad(x) { return typeof x !== 'number' || !isFinite(x); }
function richState(month) {
  var s = newState('Т', { seed: 'мини' + month });
  applySetup(s, { shop: 'Тест', talent: 'eng', diff: 'norm' });
  s.month = month; s.cash = 150000; s.rep = 40;
  s.printers = [{ t: 'old', age: 99 }, { t: 'std', age: 3 }, { t: 'std', age: 3 }];
  s.unlocked = { key: true, stand: true, mini: true, part: true, proto: true };
  s.unlock = { deposit: true, fund: true, loan: true }; s.tax = 'profit'; s.staff.asst = 1; s.space = 'garage';
  s.fil.kg = 12; s.fil.val = 12 * 1400; s.team = {sonya: 1};
  PROD_IDS.forEach(function (id) { s.inv[id] = 40; s.invVal[id] = 40 * 90; });
  for (var m = 1; m < month; m++) s.history.push({ m: m, revenue: 80000, profit: 20000, cap: 100000, cash: 50000, sold: 200, util: 0.95, hours: 300, H: 320 });
  return s;
}

if (mode === 'check') {
  var bads = 0, checked = 0;
  function fail(m) { bads++; console.log('FAIL ' + m); }
  MINI.forEach(function (e) {
    var month = Math.max(e.from, 2), s0 = richState(month);
    if (e.ok && !e.ok(s0)) { fail(e.id + ': не выполнены условия в «богатом» состоянии'); return; }
    var g = e.st(s0);
    if (!g.tag || !g.term || !TERMS[g.term]) fail(e.id + ': нет метки или неизвестный термин ' + g.term);
    if (!g.lines || g.lines.length < 2) fail(e.id + ': мало реплик');
    g.lines.forEach(function (l) { if (!l.t || !CHARS[l.who]) fail(e.id + ': плохая реплика ' + JSON.stringify(l)); if (/NaN|undefined|Infinity/.test(l.t)) fail(e.id + ': NaN в реплике'); });
    if (typeof fn(g.lesson, s0) !== 'string' || fn(g.lesson, s0).length < 40) fail(e.id + ': нет урока');
    var cs = choicesOf(s0, g);
    if (cs.length < 2) fail(e.id + ': меньше двух вариантов');
    cs.forEach(function (c, ci) {
      [0, 0.99].forEach(function (rv) {
        var s = richState(month); var gg = e.st(s), cc = choicesOf(s, gg)[ci];
        ['label', 'sub'].forEach(function (k) { var v = fn(cc[k], s); if (typeof v !== 'string' || /NaN|undefined|Infinity/.test(v)) fail(e.id + '/' + ci + ': плохой ' + k + ': ' + v); });
        var cost = fn(cc.cost, s) || 0; if (bad(cost) || cost < 0) fail(e.id + '/' + ci + ': плохая цена ' + cost);
        var cap0 = companyCapital(s), chips = cc.apply(s, function () { return rv; });
        if (!Array.isArray(chips) || !chips.length) fail(e.id + '/' + ci + ': apply не вернул чипы');
        (chips || []).forEach(function (ch) { if (!ch || typeof ch.t !== 'string' || /NaN|undefined|Infinity/.test(ch.t)) fail(e.id + '/' + ci + ': плохой чип ' + JSON.stringify(ch)); });
        if (cc.reply && (!cc.reply.t || /NaN|undefined/.test(cc.reply.t))) fail(e.id + '/' + ci + ': плохой ответ');
        var bag = { cash: s.cash, rep: s.rep, cap: ownerCapital(s), fk: s.fil.kg, fv: s.fil.val };
        for (var k in bag) if (bad(bag[k])) fail(e.id + '/' + ci + ': NaN в ' + k);
        if (s.fil.kg < -1e-9 || s.fil.val < -1e-6) fail(e.id + '/' + ci + ': отрицательный пластик');
        PROD_IDS.forEach(function (id) { if (s.inv[id] < 0 || s.invVal[id] < -1e-6) fail(e.id + '/' + ci + ': отрицательный склад ' + id); });
        if (s.rep < 0 || s.rep > 100) fail(e.id + '/' + ci + ': репутация вне диапазона');
        checked++;
      });
    });
  });
  /* выбор по коду класса: детерминирован и не повторяется */
  var seenAll = {}, games = 0, withMini = 0, perGame = 0;
  for (var sd = 1; sd <= 300; sd++) {
    var s = richState(1), n = 0; s.seed = 'К' + sd; s.history = []; s.miniSeen = []; s.mini = {};
    for (var m = 1; m <= TOTAL; m++) { s.month = m; var a = miniFor(s); var b = miniFor(s); if (a !== b) fail('miniFor не стабилен'); if (a) { n++; seenAll[a] = (seenAll[a] || 0) + 1; } }
    var s2 = richState(1); s2.seed = 'К' + sd; s2.history = []; s2.miniSeen = []; s2.mini = {}; for (m = 1; m <= TOTAL; m++) { s2.month = m; miniFor(s2); }
    if (JSON.stringify(s.mini) !== JSON.stringify(s2.mini)) fail('одинаковый код — разные случаи');
    games++; perGame += n; if (n) withMini++;
    var uniq = (s.miniSeen || []).filter(function (x, i, arr) { return arr.indexOf(x) === i; }).length; if (uniq !== (s.miniSeen || []).length) fail('случай повторился в одной партии');
  }
  console.log('случаев в игре: в среднем ' + (perGame / games).toFixed(2) + ', партий хотя бы с одним: ' + withMini + ' из ' + games);
  console.log('частота: ' + MINI.map(function (e) { return e.id + ' ' + (seenAll[e.id] || 0); }).join(', '));
  MINI.forEach(function (e) { if (!seenAll[e.id]) fail('случай ни разу не выпал: ' + e.id); });
  console.log(bads ? ('ПРОВАЛОВ: ' + bads) : ('Случаи: структура в порядке (' + MINI.length + ' событий, проверок ' + checked + ')'));
  process.exit(bads ? 1 : 0);
} else {
  var N = parseInt(process.argv[3] || '24', 10), kind = process.argv[4] || 'human', pol = process.argv[5] || 'mid';
  function avg(opts) { var a = 0; for (var sd = 1; sd <= N; sd++) a += sim.runGame(kind, pol, sd, false, opts).cap; return a / N; }
  var BASE = avg({ noMini: true });
  console.log('базовый капитал без случаев: ' + Math.round(BASE / 1000) + 'k (' + kind + '/' + pol + ', ' + N + ' партий)');
  MINI.forEach(function (e) {
    var months = [Math.min(e.to, Math.max(e.from, 3) + Math.floor((e.to - Math.max(e.from, 3)) / 2))];
    var b0 = BASE, g = e.st(richState(Math.max(e.from, 2))), n = choicesOf(richState(Math.max(e.from, 2)), g).length, row = [];
    for (var o = 0; o < n; o++) {
      var vals = months.map(function (m) { return avg({ noMini: true, force: { month: m, id: e.id, option: o } }); });
      var d = vals.reduce(function (a, v) { return a + v; }, 0) / vals.length - b0;
      row.push((d >= 0 ? '+' : '') + Math.round(d / 100) / 10 + 'k');
    }
    console.log(e.id.padEnd(12), row.join('  ').padEnd(30), '(базовый капитал ' + Math.round(b0 / 1000) + 'k)');
  });
}
