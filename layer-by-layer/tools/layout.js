/* Стресс-проверка вёрстки: «богатое» состояние (8 принтеров, все товары, помощники, заказы, долги)
   на разных ширинах и в обеих темах. Ищет наложение текста, выход за экран и горизонтальную прокрутку.
   Запуск: node tools/layout.js [ширины через запятую] [папка для скриншотов] */
const path = require('path'), fs = require('fs');
const { chromium } = require(process.env.PW_PATH || '/opt/node-tools/node_modules/playwright');
const CHECK = require('./check.js');
const FILE = 'file://' + path.join(__dirname, '..', 'index.html');
const WIDTHS = (process.argv[2] || '360,390,768,1024,1440').split(',').map(Number);
const OUT = process.argv[3] || '';
if (OUT) fs.mkdirSync(OUT, { recursive: true });

function richState(month) {
  const S = newState('Стресс-тест');
  S.month = month; S.cash = 640000; S.savings = 120000; S.fund = 80000; S.loanLeft = 300000; S.loanStep = 25000; S.equity = 0.85;
  S.printers = [{ t: 'old', age: 99 }, { t: 'std', age: 5 }, { t: 'std', age: 5 }, { t: 'used', age: 9 }, { t: 'fast', age: 2 }, { t: 'fast', age: 2 }, { t: 'big', age: 1 }, { t: 'ind', age: 0 }];
  S.space = 'garage'; S.staff = { asst: 1, teen: 1 };
  S.unlocked = { key: true, stand: true, mini: true, part: true, proto: true };
  S.unlock = { deposit: true, fund: true, loan: true };
  S.channel = { market: true, site: true }; S.insurance = true; S.service = true; S.tax = 'profit';
  S.flags = { liza: 'partner', garageBonus: true, psu: true, eco: true, ally: true, alliance2: true, social: true };
  S.rep = 82; S.infl = 1.3; S.filIdx = 1.6; S.terms = Object.keys(TERMS);
  S.contracts = [{ prod: 'key', qty: 150, price: 120, penalty: 0.3, repLoss: 6, repGain: 3, label: 'Школа №17: 150 брелоков' }, { prod: 'proto', qty: 6, price: 3600, penalty: 0.3, repLoss: 6, repGain: 3, label: 'Прототипы для компании' }];
  addMod(S, 'dem', 1.2, 3, 'Ярмарка'); addMod(S, 'cost', 0.9, 2, 'Скидка на пластик'); addMod(S, 'fail', 0.02, 2, 'Усталость');
  for (let m = 1; m < month; m++) S.history.push({ m, revenue: 60000 + m * 20000, profit: -5000 + m * 9000, cap: 80000 + m * 60000, cash: 50000, sold: 100 + m * 20, util: 0.95, hours: 600, H: 640 });
  PROD_IDS.forEach(id => { S.inv[id] = 30; S.invVal[id] = 30 * 100; });
  suggestPlan(S);
  return S;
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const problems = [];
  for (const W of WIDTHS) for (const theme of ['light', 'dark']) {
    const ctx = await b.newContext({ viewport: { width: W, height: W < 700 ? 844 : 900 }, colorScheme: theme });
    if (process.env.SOUND) await ctx.addInitScript(() => { try { localStorage.setItem('lbl-sound', '1'); } catch (e) { } });
    const p = await ctx.newPage();
    p.on('pageerror', e => problems.push(`PAGEERR ${W} ${theme}: ${e.message}`));
    p.on('console', m => { if (m.type() === 'error') problems.push(`CONSOLE ${W} ${theme}: ${m.text()}`); });
    await p.goto(FILE); await p.waitForTimeout(250);
    const tag = `${W}-${theme}`;
    const check = async name => {
      await p.waitForTimeout(800);
      const bad = await p.evaluate(CHECK);
      bad.forEach(x => problems.push(`LAYOUT ${tag} ${name}: ${x}`));
      const w = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
      if (w[0] > w[1]) problems.push(`OVERFLOW ${tag} ${name}: scrollWidth ${w[0]} > ${w[1]}`);
      if (OUT) await p.screenshot({ path: path.join(OUT, `L-${tag}-${name}.png`), fullPage: true });
    };
    const U = () => p.evaluate(() => window.__game.U.screen);
    /* месяц 12: план (три вкладки), запуск, итоги, викторина, глава */
    /* richState живёт в Node, поэтому передаём его в страницу исходным текстом */
    await p.evaluate(`window.__rich=${richState.toString()}; window.__game.setState(window.__rich(12), {screen:'plan', tab:'biz', helpSeen:true});`);
    await check('plan-biz');
    await p.click('[data-t=shop]'); await check('plan-shop');
    await p.click('[data-t=fin]'); await check('plan-fin');
    await p.click('[data-t=biz]');
    await p.evaluate(() => window.__game.A.glossary()); await check('glossary'); await p.click('#modal [data-act=closemodal]');
    await p.click('#gobtn'); await check('run');
    await p.click('[data-act=runskip]'); await check('report');
    await p.click('[data-act=afterreport]');
    for (let i = 0; i < 20; i++) {
      const s = await U();
      if (s === 'quiz') {
        const q = await p.evaluate(() => window.__game.U.quiz);
        if (q.picked == null) { await p.click('.qopt'); await check('quiz-answer'); } else await p.click('[data-act=qnext]');
      } else if (s === 'chapter') { await check('chapter'); await p.click('[data-act=chapternext]'); }
      else if (s === 'lessonend') { await check('lessonend'); await p.click('[data-act=lessonnext]'); }
      else break;
    }
    /* финал: месяц 16 с богатым состоянием */
    await p.evaluate(`window.__game.setState(window.__rich(16), {screen:'plan', tab:'biz', helpSeen:true});`);
    await p.click('#gobtn'); await p.waitForTimeout(300); await p.click('[data-act=runskip]'); await p.click('[data-act=afterreport]');
    for (let i = 0; i < 30; i++) {
      const s = await U();
      if (s === 'quiz') { const q = await p.evaluate(() => window.__game.U.quiz); if (q.picked == null) await p.click('.qopt'); else await p.click('[data-act=qnext]'); }
      else if (s === 'chapter') await p.click('[data-act=chapternext]');
      else if (s === 'lessonend') await p.click('[data-act=lessonnext]');
      else if (s === 'final') { await check('final'); break; }
      else break;
    }
    await p.context().close();
  }
  await b.close();
  const uniq = [...new Set(problems)];
  console.log(uniq.length ? uniq.join('\n') : 'Вёрстка: проблем не найдено (' + WIDTHS.join(', ') + ' px, светлая и тёмная)');
  process.exit(uniq.length ? 1 : 0);
})().catch(e => { console.error('LAYOUT FAIL', e.message); process.exit(2); });
