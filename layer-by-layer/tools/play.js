/* Общие шаги для браузерных проверок: настройка мастерской и быстрый пропуск пролога */
exports.setup = async function (p, o) {
  o = o || {};
  await p.waitForSelector('#setupgo');
  if (o.shop) await p.fill('#shopname', o.shop);
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
