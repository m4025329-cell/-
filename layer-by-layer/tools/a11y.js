/* Доступность и перенос: клавиатура, фокус, имена кнопок, reduced-motion, перенос игры по коду */
const path=require('path');
const { chromium } = require(process.env.PW_PATH||'/opt/node-tools/node_modules/playwright');
const play=require('./play.js');
const FILE='file://'+path.join(__dirname,'..','index.html');
let fails=0; const ok=(c,msg)=>{ if(!c){ fails++; console.log('FAIL',msg); } else console.log('ok  ',msg); };
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  /* ---------- 1. клавиатура и имена ---------- */
  let ctx=await b.newContext({viewport:{width:1100,height:900}}); let p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
  await p.goto(FILE); await p.waitForTimeout(300);
  async function unnamed(){ return p.evaluate(()=>Array.from(document.querySelectorAll('button,a[href],input,textarea')).filter(e=>{ const t=(e.innerText||e.textContent||'').trim(); const l=e.getAttribute('aria-label')||''; const lab=e.id&&document.querySelector('label[for="'+e.id+'"]'); const ph=e.getAttribute('placeholder'); return !t && !l && !lab && !ph; }).map(e=>e.outerHTML.slice(0,90))); }
  ok((await unnamed()).length===0,'заставка: у всех кнопок и полей есть имя');
  ok((await p.$$('h1')).length===1,'заставка: ровно один h1');
  await p.focus('#pname'); await p.keyboard.type('Клава'); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
  ok(await p.evaluate(()=>document.activeElement&&document.activeElement.id==='pagetitle'),'после Enter фокус на заголовке нового экрана');
  ok((await p.$$('h1')).length===1,'пролог: ровно один h1');
  await play.skipIntro(p); await p.waitForTimeout(300);
  ok((await unnamed()).length===0,'сцена: у всех кнопок есть имя');
  ok((await p.$$('h1')).length===1,'сцена: ровно один h1');
  /* выбор с клавиатуры */
  await p.focus('.choice:not([disabled])'); await p.keyboard.press('Enter'); await p.waitForTimeout(200);
  ok(await p.evaluate(()=>!!(window.__game.U.res&&window.__game.U.res[0])),'выбор варианта клавишей Enter');
  await p.click('[data-act=scenenext]'); await p.waitForTimeout(300);
  if(await p.$('#modal .modal')){ ok(true,'при первом планировании открывается подсказка'); await p.keyboard.press('Escape'); ok(!(await p.$('#modal .modal')),'Escape закрывает окно'); }
  ok((await unnamed()).length===0,'план: у всех кнопок и ползунков есть имя');
  /* ползунок цены с клавиатуры */
  const before=await p.evaluate(()=>window.__game.S.plan.price.key);
  await p.focus('#pr-key'); for(let i=0;i<3;i++) await p.keyboard.press('ArrowRight'); await p.waitForTimeout(100);
  const after=await p.evaluate(()=>window.__game.S.plan.price.key);
  ok(after===before+15,'ползунок цены меняется стрелками: '+before+' → '+after);
  ok((await p.textContent('#pv-key')).replace(/\s/g,'')===(after+'₽'),'подпись цены обновляется при перемещении ползунка');
  /* кнопки +/− */
  await p.click('[data-act=step][data-k=qty][data-id=key][data-d="-1"]'); const q1=await p.evaluate(()=>window.__game.S.plan.qty.key);
  await p.click('[data-act=step][data-k=qty][data-id=key][data-d="1"]'); const q2=await p.evaluate(()=>window.__game.S.plan.qty.key);
  ok(q2===q1+1,'кнопки − и + меняют количество');
  /* окно словаря и возврат фокуса */
  await p.focus('[data-act=glossary]'); await p.keyboard.press('Enter'); await p.waitForTimeout(150);
  ok(!!(await p.$('#modal .modal')),'словарь открывается с клавиатуры');
  ok(await p.evaluate(()=>document.activeElement&&document.activeElement.closest('#modal')!==null),'фокус внутри окна');
  await p.keyboard.press('Escape'); await p.waitForTimeout(100);
  ok(await p.evaluate(()=>document.activeElement&&document.activeElement.getAttribute('data-act')==='glossary'),'после закрытия фокус возвращается на кнопку');
  ok(errs.length===0,'нет ошибок консоли'+(errs.length?': '+errs.join(' | '):''));
  await ctx.close();

  /* ---------- 2. reduced motion ---------- */
  ctx=await b.newContext({viewport:{width:1100,height:900},reducedMotion:'reduce'}); p=await ctx.newPage();
  await p.goto(FILE); await p.waitForTimeout(300);
  const dur=await p.evaluate(()=>getComputedStyle(document.querySelector('.hero-art .p-head')||document.body).animationDuration);
  ok(parseFloat(dur)<0.001,'reduced-motion: анимация принтера отключена ('+dur+')');
  await p.fill('#pname','Тихо'); await p.click('#startbtn'); await play.skipIntro(p);
  const en=await p.$$('.choice:not([disabled])'); await en[0].click(); await p.click('[data-act=scenenext]'); await p.waitForTimeout(200);
  if(await p.$('#modal .modal')) await p.click('#modal [data-act=closemodal]');
  await p.click('#gobtn'); await p.waitForTimeout(300);
  ok(await p.evaluate(()=>window.__game.U.screen==='report'),'reduced-motion: экран печати пропускается, сразу итоги');
  await ctx.close();

  /* ---------- 3. перенос по коду на другое устройство ---------- */
  ctx=await b.newContext({viewport:{width:1100,height:900}}); p=await ctx.newPage(); await p.goto(FILE); await p.waitForTimeout(300);
  await p.fill('#pname','Перенос'); await p.click('#startbtn'); await play.skipIntro(p);
  let g=0; while(g++<300){ const s=await p.evaluate(()=>window.__game.U.screen);
    if(s==='scene'){ const r=await p.evaluate(()=>{const u=window.__game.U; return !!(u.res||[])[u.stage||0];}); if(!r){ const e=await p.$$('.choice:not([disabled])'); await e[0].click(); } else await p.click('[data-act=scenenext]'); }
    else if(s==='plan'){ if(await p.$('#modal .modal')) await p.click('#modal [data-act=closemodal]'); await p.click('#gobtn'); }
    else if(s==='run') await p.click('[data-act=runskip]'); else if(s==='report') await p.click('[data-act=afterreport]');
    else if(s==='quiz'){ const q=await p.evaluate(()=>window.__game.U.quiz); if(q.picked==null) await (await p.$$('.qopt'))[0].click(); else await p.click('[data-act=qnext]'); }
    else if(s==='chapter') await p.click('[data-act=chapternext]'); else if(s==='lessonend') break; }
  const code=await p.inputValue('#savecode'); const cap=await p.evaluate(()=>ownerCapital(window.__game.S));
  ok(code.length>200,'код сохранения сформирован ('+code.length+' знаков)');
  await ctx.close();
  ctx=await b.newContext({viewport:{width:1100,height:900}}); p=await ctx.newPage(); await p.goto(FILE); await p.waitForTimeout(300);
  ok(!(await p.$('[data-act=continue]')),'на новом устройстве нет сохранения');
  await p.click('[data-act=loadcode]'); await p.fill('#loadcode','это не код'); await p.click('[data-act=doload]');
  ok((await p.textContent('#loaderr')).length>5,'неверный код: понятное сообщение об ошибке');
  await p.fill('#loadcode',code); await p.click('[data-act=doload]'); await p.waitForTimeout(300);
  const st=await p.evaluate(()=>({scr:window.__game.U.screen, cap:ownerCapital(window.__game.S), name:window.__game.S.name, month:window.__game.S.month}));
  ok(st.scr==='lessonend' && st.cap===cap && st.name==='Перенос' && st.month===9,'игра перенесена кодом: '+JSON.stringify(st));
  await p.click('[data-act=lessonnext]'); await p.waitForTimeout(200);
  ok(await p.evaluate(()=>window.__game.U.screen==='scene' && window.__game.S.month===9),'после загрузки можно продолжить с месяца 9');
  await ctx.close(); await b.close();
  console.log(fails?('\nПРОВАЛОВ: '+fails):'\nДоступность и перенос: всё в порядке'); process.exit(fails?1:0);
})().catch(e=>{ console.error('FAIL',e.message); process.exit(1); });
