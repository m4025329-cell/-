/* Автопрогон игры в браузере (Playwright): ошибки консоли, скриншоты, прохождение всех экранов.
   Запуск: node tools/e2e.js [папка_для_скриншотов] [ширина] [тема: light|dark] [стратегия: smart|random] */
const path=require('path'), fs=require('fs');
const PW=process.env.PW_PATH||'/opt/node-tools/node_modules/playwright';
const { chromium } = require(PW);
const OUT=process.argv[2]||path.join(__dirname,'..','dist','shots');
const WIDTH=+(process.argv[3]||1280), THEME=process.argv[4]||'light', MODE=process.argv[5]||'smart';
fs.mkdirSync(OUT,{recursive:true});
const FILE='file://'+path.join(__dirname,'..','index.html');

const CHECK=require('./check.js');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const ctx=await b.newContext({viewport:{width:WIDTH,height:WIDTH<700?844:900},colorScheme:THEME,deviceScaleFactor:1});
  const p=await ctx.newPage(); const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push('CONSOLE '+m.text()); });
  await p.goto(FILE); await p.waitForTimeout(500);
  const FULL=new Set(['09-plan-m1','09-plan-m9','10-shop','11-fin','13-report-m4','13-report-m8','13-report-m16','17-final','15-chapter-m5','16-lessonend','06-scene-m5','07-scene-result-m1','07-scene-result-m9']);
  const shot=async n=>{ await p.waitForTimeout(n.startsWith('03')?2600:900); await p.screenshot({path:path.join(OUT,`${WIDTH}-${THEME}-${n}.png`),fullPage:FULL.has(n)}); };
  const U=()=>p.evaluate(()=>window.__game.U.screen);
  await shot('01-title');
  await p.fill('#pname','Алексей'); await p.click('#startbtn');
  await shot('02-intro1');
  await p.click('[data-act=intronext]'); await p.click('[data-act=intronext]'); await shot('03-intro3'); await p.click('[data-act=intronext]');
  await p.click('[data-act=tocalib]'); await shot('04-calib');
  const t=await p.evaluate(()=>window.__game.U.calib.t); await p.evaluate(v=>{const r=document.getElementById('calibrange'); r.value=v; r.dispatchEvent(new Event('input',{bubbles:true}));},t);
  await p.click('[data-act=calibfix]'); await shot('05-calibdone'); await p.click('[data-act=calibdone]');
  let seen={}, steps=0;
  while(steps++<500){
    const s=await U(); const month=await p.evaluate(()=>window.__game.S.month);
    const key=s+month; 
    if(!(seen['chk'+key]) && process.env.NOCHECK!=='1'){ seen['chk'+key]=1; await p.waitForTimeout(750); const bad=await p.evaluate(CHECK); bad.forEach(x=>errs.push('LAYOUT '+WIDTH+' '+s+' m'+month+': '+x)); }
    
    if(s==='scene'){
      const res=await p.evaluate(()=>{const u=window.__game.U; return (u.res||[])[u.stage||0]||null;});
      if(!res){ if(!seen['sc'+month]){ seen['sc'+month]=1; if([1,5,13].includes(month)) await shot('06-scene-m'+month); }
        const en=await p.$$('.choice:not([disabled])'); if(!en.length){ errs.push('NO ENABLED CHOICE month '+month); break; }
        const pick = MODE==='random' ? Math.floor(Math.random()*en.length) : 0; await en[pick].click();
        if(!seen['scr'+month]){ seen['scr'+month]=1; if([1,9].includes(month)) await shot('07-scene-result-m'+month); } }
      else await p.click('[data-act=scenenext]');
    } else if(s==='plan'){
      if(await p.$('#modal .modal')){ if(month===1) await shot('08-help'); await p.click('#modal [data-act=closemodal]'); }
      if(!seen['pl'+month]){ seen['pl'+month]=1; if([1,5,9,13].includes(month)) await shot('09-plan-m'+month); if(month===5){ await p.click('[data-t=shop]'); await shot('10-shop'); await p.click('[data-t=fin]'); await shot('11-fin'); await p.click('[data-t=biz]'); } }
      /* покупки умеренно */
      if(MODE==='smart'){ await p.evaluate(()=>{ const S=window.__game.S; const m=S.month; if([5,7,9,10].includes(m) && S.cash>60000){ buyPrinter && 0; } }); }
      const dis=await p.$eval('#gobtn',e=>e.disabled); if(dis){ errs.push('GO DISABLED month '+month); break; }
      await p.click('#gobtn');
    } else if(s==='run'){ if(!seen['run'+month]){ seen['run'+month]=1; if(month===2) await shot('12-run'); if(month===15) await shot('12-run-m15'); } await p.click('[data-act=runskip]'); }
    else if(s==='report'){ if(!seen['rp'+month]){ seen['rp'+month]=1; if([1,4,8,12,16].includes(month)) await shot('13-report-m'+month); } await p.click('[data-act=afterreport]'); }
    else if(s==='quiz'){ const q=await p.evaluate(()=>window.__game.U.quiz); if(q.picked==null){ if(!seen['qz'+month]){ seen['qz'+month]=1; await shot('14-quiz-m'+month); } const opts=await p.$$('.qopt'); await opts[MODE==='random'?Math.floor(Math.random()*4):0].click(); } else await p.click('[data-act=qnext]'); }
    else if(s==='chapter'){ if(!seen['ch'+month]){ seen['ch'+month]=1; await shot('15-chapter-m'+month); } await p.click('[data-act=chapternext]'); }
    else if(s==='lessonend'){ await shot('16-lessonend'); await p.click('[data-act=lessonnext]'); }
    else if(s==='final'){ await shot('17-final'); break; }
    else { errs.push('UNKNOWN SCREEN '+s); break; }
  }
  const fin=await p.evaluate(()=>({scr:window.__game.U.screen, month:window.__game.S.month, cap:ownerCapital(window.__game.S)}));
  const w=await p.evaluate(()=>[document.documentElement.scrollWidth, innerWidth]);
  console.log(JSON.stringify(fin), 'scrollWidth/innerWidth', w.join('/'), 'steps', steps);
  console.log(errs.length?errs.join('\n'):'no errors');
  await b.close();
})().catch(e=>{ console.error('E2E FAIL', e.message); process.exit(1); });
