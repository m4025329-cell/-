/* Проверка отчёта проекта и рабочего листа: экран и PDF. node tools/sheet-test.js */
const path=require('path'), fs=require('fs');
require('./load.js'); const B=require('./bots.js');
const PW=process.env.PW_PATH||'/opt/node-tools/node_modules/playwright'; const pw=require(PW), {chromium}=pw;
const FILE='file://'+path.join(__dirname,'..','index.html'); const OUT=path.join(__dirname,'..','dist','shots'); fs.mkdirSync(OUT,{recursive:true});
(async()=>{
  const s=B.run(B.good({expand:true,lev:true,at:8}),'sheet1','norm'); s.name='Анна Иванова'; s.cafe='Первый столик'; s.final=true; s.terms=Object.keys(TERMS).slice(0,34); s.quizScore=[1,1,0,1,1,1,0,1,1,1,0,1];
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const errs=[]; let failed=0; const ok=(c,m)=>{ if(!c){ failed++; console.log('  ПЛОХО: '+m); } };
  for(const [name,dev] of [['phone',Object.assign({},pw.devices['iPhone 13'])],['desktop',{viewport:{width:1280,height:900}}]]){
    delete dev.defaultBrowserType; const ctx=await b.newContext(dev); const p=await ctx.newPage();
    p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push('CONSOLE '+m.text()); });
    await p.goto(FILE); await p.waitForTimeout(300);
    await p.evaluate(({S})=>{ window.__game.setState(S,{screen:'final',seen:{},actSeen:{}}); },{S:s}); await p.waitForTimeout(400);
    await p.evaluate(()=>window.__game.A.sheet()); await p.waitForTimeout(400);
    const n=await p.$$eval('.pg',e=>e.length); ok(n===5,'страниц на экране без ключа: '+n);
    const hasKey=await p.$$eval('.pg.key',e=>e.length); ok(hasKey===0,'ключ виден ученику');
    const txt=await p.evaluate(()=>document.querySelector('.sh-pages').innerText); ok(!/NaN|undefined|Infinity/.test(txt),'в листе NaN или undefined');
    const ov=await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1||document.querySelector('.sheet').scrollWidth>document.querySelector('.sheet').clientWidth+1); ok(!ov,'горизонтальная прокрутка листа');
    await p.screenshot({path:path.join(OUT,`sheet-${name}-1.png`)});
    await p.evaluate(()=>document.querySelectorAll('.pg')[3].scrollIntoView()); await p.waitForTimeout(200); await p.screenshot({path:path.join(OUT,`sheet-${name}-4.png`)});
    if(name==='desktop'){
      await p.emulateMedia({media:'print'}); await p.pdf({path:path.join(OUT,'sheet.pdf'),format:'A4',printBackground:true,preferCSSPageSize:true});
      await p.emulateMedia({media:'screen'});
      await p.evaluate(()=>window.__game.A.sheetclose());
      /* режим учителя: код → ключ */
      const code=await p.evaluate(()=>{ return window.__exp?window.__exp():''; });
    }
    await ctx.close();
  }
  /* учитель: ключ по коду */
  { const dev=Object.assign({},pw.devices['iPhone 13']); delete dev.defaultBrowserType; const ctx=await b.newContext(dev), p=await ctx.newPage(); p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
    await p.goto(FILE); await p.waitForTimeout(300);
    await p.evaluate(({S})=>{ window.__game.setState(S,{screen:'final',seen:{},actSeen:{}}); },{S:s});
    const code=await p.evaluate(()=>{ const g=window.__game; let c=''; g.A.showcode(); c=document.getElementById('savecode').value; g.A.closemodal(); return c; });
    ok(code.length>1000,'код пуст');
    await p.evaluate(()=>window.__game.A.totitle()); await p.evaluate(()=>window.__game.A.teacher()); await p.waitForTimeout(200);
    await p.fill('#tc-code',code); await p.evaluate(()=>window.__game.A.tcopen()); await p.waitForTimeout(400);
    const k=await p.$$eval('.pg.key',e=>e.length); ok(k===1,'ключа нет в режиме учителя');
    const ktxt=await p.evaluate(()=>document.querySelector('.pg.key').innerText); ok(/Ответ:/.test(ktxt)&&!/NaN|undefined/.test(ktxt),'ключ пуст или с NaN');
    await p.evaluate(()=>document.querySelector('.pg.key').scrollIntoView()); await p.waitForTimeout(200); await p.screenshot({path:path.join(OUT,'sheet-key.png')});
    await ctx.close(); }
  console.log(errs.length?errs.join('\n'):'ошибок страницы нет'); console.log(failed?('ПРОВАЛОВ: '+failed):'всё хорошо');
  await b.close();
})();
