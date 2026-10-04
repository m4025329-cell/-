/* Общие шаги для браузерных проверок: настройка мастерской и быстрый пропуск пролога */
exports.setup = async function (p, o) {
  o = o || {};
  await p.waitForSelector('#setupgo');
  if (o.shop) await p.fill('#shopname', o.shop);
  if (o.scn) await p.click('[data-act=pscn][data-k=' + o.scn + ']');
  await p.click('[data-act=ptalent][data-k=' + (o.talent || 'eng') + ']');
  if (o.diff) await p.click('[data-act=pdiff][data-k=' + o.diff + ']');
  if (o.code) await p.fill('#classcode', o.code);
  await p.click('#setupgo');
};
exports.skipIntro = async function (p, o) {
  await p.click('[data-act=introskip]');
  await exports.setup(p, o);
  await p.click('[data-act=skipcalib]');
};
/* Выполняет обучающие шаги первого месяца и просит Фила составить план: так тесты не упираются в блокировку кнопки «Запустить» */
exports.ready = async function (p) {
  await p.evaluate(() => {
    const g = window.__game, S = g.S;
    if (g.U.screen !== 'plan') return;
    makeBoard(S);
    if (S.month === 1) { const o = S.board.offers.find(x => x.state === 'open'); if (o) acceptOffer(S, o.id); }
    g.U.seen = Object.assign(g.U.seen || {}, { qty: true, biz: true, deal: true });
    g.A.suggest();
  });
  await p.waitForTimeout(80);
};
