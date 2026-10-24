/* Первая неделя глазами ученика: клики по настоящим кнопкам, чек-лист, чип изменения прогноза.
   node tools/firstweek.js [профиль=phone] */
const path=require('path'),fs=require('fs');
const pw=require(process.env.PW_PATH||'/opt/node-tools/node_modules/playwright'); const {chromium}=pw;
const OUT=path.join(__dirname,'..','dist','shots'); fs.mkdirSync(OUT,{recursive:true});
let fails=0; const ok=(c,m)=>{ if(!c){ fails++; console.log('ПРОВАЛ:',m); } else console.log('ok:',m); };
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); const dev=Object.assign({},pw.devices[process.argv[2]==='se'?'iPhone SE':'iPhone 13']); delete dev.defaultBrowserType;
  const p=await (await b.newContext(dev)).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
  await p.goto('file://'+path.join(__dirname,'..','index.html')); await p.waitForTimeout(300);
  await p.evaluate(()=>{ const g=window.__game; g.A.newgameyes(); g.A.introskip(); g.U.setup.name='Аня'; g.U.setup.code='8Б'; g.A.startgame(); });
  for(let i=0;i<40;i++){ const scr=await p.evaluate(()=>window.__game.U.screen); if(scr==='plan') break;
    await p.evaluate(()=>{ const U=window.__game.U, A=window.__game.A; const c=a=>{ const el=document.querySelector('[data-act='+a+']'); if(el){ A[a](el,{target:el}); return 1; } return 0; }; if(U.screen==='act'||U.screen==='last') A.actgo(); else if(U.screen==='scene'){ c('pick')||c('scenenext'); } else if(U.screen==='event'){ c('evpick')||A.evnext(); } }); await p.waitForTimeout(40); }
  ok(await p.evaluate(()=>window.__game.U.screen)==='plan','дошли до плана месяца 1');
  ok(await p.evaluate(()=>!!document.querySelector('.chk')),'на главной есть список «Первая неделя»');
  const n0=await p.evaluate(()=>document.querySelectorAll('.chk li.done').length); ok(n0===0,'в начале ничего не отмечено ('+n0+')');
  await p.screenshot({path:path.join(OUT,'fw-1-home.png')});
  const prof0=await p.evaluate(()=>(()=>{ const S=window.__game.S; const c=cloneState(S); c.accepted=S.accepted.slice(); return Math.round(simMonth(c,{preview:true}).profit); })()); console.log('прогноз по умолчанию:',prof0);
  // деньги: разделы закрыты
  await p.click('[data-tab=money]'); await p.waitForTimeout(80);
  const locked=await p.evaluate(()=>document.querySelectorAll('.msub button.locked').length); ok(locked===4,'в «Деньгах» закрыто 4 раздела из 5 ('+locked+')');
  await p.click('.msub button.locked',{force:true}); await p.waitForTimeout(80); ok(await p.evaluate(()=>window.__game.U.msub!=='bank'&&window.__game.U.msub!=='acc'),'клик по закрытому разделу его не открывает');
  await p.screenshot({path:path.join(OUT,'fw-2-money.png')});
  // блюдо: салат
  await p.click('[data-tab=menu]'); await p.waitForTimeout(80);
  const veg=await p.$('[data-act=menutoggle][data-d=veg]'); ok(!!veg,'салат есть в меню блюд');
  if(veg){ await veg.scrollIntoViewIfNeeded(); await veg.click(); await p.waitForTimeout(150); }
  const chip=await p.evaluate(()=>{ const c=document.querySelector('.dchip'); return c?c.textContent:null; }); ok(!!chip&&/▲/.test(chip),'после добавления салата виден зелёный чип: '+chip);
  await p.screenshot({path:path.join(OUT,'fw-3-chip.png')});
  await p.click('[data-tab=guests]'); await p.waitForTimeout(80);
  const mk=await p.$('[data-act=mk][data-m=flyer]'); ok(!!mk,'кнопка листовок есть'); if(mk){ await mk.scrollIntoViewIfNeeded(); await mk.click(); await p.waitForTimeout(120); }
  await p.click('[data-tab=place]'); await p.waitForTimeout(80);
  await p.click('[data-tab=money]'); await p.waitForTimeout(80);
  await p.click('[data-tab=home]'); await p.waitForTimeout(150);
  const n1=await p.evaluate(()=>document.querySelectorAll('.chk li.done').length); ok(n1>=3,'после действий отмечено дел: '+n1+' из 4');
  await p.screenshot({path:path.join(OUT,'fw-4-home-done.png')});
  const prof1=await p.evaluate(()=>(()=>{ const S=window.__game.S; const c=cloneState(S); c.accepted=S.accepted.slice(); return Math.round(simMonth(c,{preview:true}).profit); })()); console.log('прогноз после дел:',prof1,'(было',prof0+')');
  ok(prof1>prof0,'прогноз после списка дел лучше, чем по умолчанию');
  await p.click('[data-act=go]'); await p.waitForTimeout(100); if(await p.$('[data-act=goforce]')) await p.click('[data-act=goforce]');
  await p.waitForTimeout(1500); await p.screenshot({path:path.join(OUT,'fw-5-live.png')});
  await p.evaluate(()=>window.__game.A.runskip()); await p.waitForTimeout(500);
  const pr=await p.evaluate(()=>window.__game.U.report&&Math.round(window.__game.U.report.profit)); console.log('прибыль месяца 1 по итогам:',pr);
  await p.screenshot({path:path.join(OUT,'fw-6-report.png')});
  console.log(errs.length?errs.join('\n'):'ошибок нет'); await b.close(); process.exit(fails||errs.length?1:0);
})();
