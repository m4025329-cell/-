/* Проверка сохранения: перезагрузка страницы на каждом типе экрана и возврат кнопкой «Продолжить» */
const path=require('path');
const { chromium } = require(process.env.PW_PATH||'/opt/node-tools/node_modules/playwright');
const FILE='file://'+path.join(__dirname,'..','index.html');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const ctx=await b.newContext({viewport:{width:1100,height:900}});
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
  await p.goto(FILE); await p.waitForTimeout(300);
  const snap=()=>p.evaluate(()=>{const g=window.__game; return {screen:g.U.screen, month:g.S.month, stage:g.U.stage||0, tab:g.U.tab||null, slide:g.U.slide||0, res:(g.U.res||[]).length, quiz:g.U.quiz?g.U.quiz.i+':'+g.U.quiz.picked:null, cash:Math.round(g.S.cash), cap:ownerCapital(g.S)};});
  const tested={}; let fails=0;
  async function check(label){
    if(tested[label]) return; tested[label]=1;
    const a=await snap(); await p.reload(); await p.waitForTimeout(250);
    const btn=await p.$('[data-act=continue]'); if(!btn){ fails++; console.log('FAIL',label,'нет кнопки «Продолжить»'); return; }
    await btn.click(); await p.waitForTimeout(250);
    const c=await snap(); const keys=['screen','month','stage','tab','slide','res','quiz','cash','cap']; const diff=keys.filter(k=>a[k]!==c[k]);
    if(diff.length){ fails++; console.log('FAIL',label,JSON.stringify(a),'=>',JSON.stringify(c)); } else console.log('ok  ',label);
  }
  await p.fill('#pname','Тест'); await p.click('#startbtn'); await p.click('[data-act=intronext]'); await check('intro-слайд 2');
  await p.click('[data-act=introskip]'); await p.click('[data-act=tocalib]'); await check('calib');
  await p.click('[data-act=calibfix]'); await check('calib-готово'); await p.click('[data-act=calibdone]');
  let guard=0;
  while(guard++<400){
    const s=await p.evaluate(()=>window.__game.U.screen); const month=await p.evaluate(()=>window.__game.S.month);
    if(s==='scene'){
      const st=await p.evaluate(()=>window.__game.U.stage||0), hasRes=await p.evaluate(()=>{const u=window.__game.U; return !!(u.res||[])[u.stage||0];});
      if(!hasRes){ await check('сцена до выбора (стадия '+st+', месяц '+(month===6||month===7||month===15?month:'*')+')'); const en=await p.$$('.choice:not([disabled])'); await en[0].click(); await check('сцена после выбора (стадия '+st+')'); }
      else await p.click('[data-act=scenenext]');
    } else if(s==='plan'){
      if(await p.$('#modal .modal')) await p.click('#modal [data-act=closemodal]');
      await check('план-печать'); await p.click('[data-t=shop]'); await check('план-мастерская'); await p.click('[data-t=fin]'); await check('план-финансы'); await p.click('[data-t=biz]');
      await p.click('#gobtn'); await check('печать (run)');
    } else if(s==='run'){ await p.click('[data-act=runskip]'); }
    else if(s==='report'){ await check('итоги месяца'); await p.click('[data-act=afterreport]'); }
    else if(s==='quiz'){ const q=await p.evaluate(()=>window.__game.U.quiz); if(q.picked==null){ await check('викторина до ответа'); await (await p.$$('.qopt'))[1].click(); await check('викторина после ответа'); } else await p.click('[data-act=qnext]'); }
    else if(s==='chapter'){ await check('конец акта'); await p.click('[data-act=chapternext]'); }
    else if(s==='lessonend'){ await check('конец урока 1'); await p.click('[data-act=lessonnext]'); }
    else if(s==='final'){ await check('финал'); break; }
  }
  /* перенос по коду на другое «устройство» */
  const code=await p.evaluate(()=>{ return null; });
  console.log(fails?('ПРОВАЛОВ: '+fails):'Сохранение: всё в порядке', errs.length?('\nОШИБКИ КОНСОЛИ: '+errs.join(' | ')):'');
  await b.close();
})().catch(e=>{ console.error('FAIL',e.message); process.exit(1); });
