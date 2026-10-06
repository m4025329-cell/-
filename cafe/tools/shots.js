/* Снимает ключевые экраны на разных устройствах для проверки глазами. node tools/shots.js [профиль] */
const path=require('path'), fs=require('fs');
const PW=process.env.PW_PATH||'/opt/node-tools/node_modules/playwright'; const pw=require(PW), {chromium}=pw;
const FILE='file://'+path.join(__dirname,'..','index.html'); const OUT=path.join(__dirname,'..','dist','shots'); fs.mkdirSync(OUT,{recursive:true});
const PROFILES={phone:Object.assign({},pw.devices['iPhone 13']), se:Object.assign({},pw.devices['iPhone SE']), desktop:{viewport:{width:1280,height:800}}, pad:Object.assign({},pw.devices['iPad (gen 7)'])};
(async()=>{
  const which=process.argv[2]||'phone'; const prof=PROFILES[which]; delete prof.defaultBrowserType;
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); const ctx=await b.newContext(Object.assign({colorScheme:process.argv[3]==='dark'?'dark':'light'},prof)); const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push('CONSOLE '+m.text()); });
  await p.goto(FILE); await p.waitForTimeout(500);
  const shot=async n=>{ await p.waitForTimeout(700); await p.screenshot({path:path.join(OUT,`${which}-${n}.png`),fullPage:false}); };
  await shot('01-title');
  await p.evaluate(()=>window.__game.A.newgameyes()); await shot('02-intro');
  await p.evaluate(()=>{ window.__game.A.introskip(); }); await shot('03-setup');
  await p.evaluate(()=>{ window.__game.A.startgame(); }); await shot('04-act');
  await p.evaluate(()=>{ window.__game.A.actgo(); }); await shot('05-scene');
  await p.click('.choice >> nth=1'); await shot('06-scene-res');
  await p.evaluate(()=>window.scrollTo(0,99999)); await p.waitForTimeout(300);
  await p.click('[data-act=scenenext]'); await p.waitForTimeout(300);
  await shot('07-plan-home');
  for(const t of ['menu','place','guests','money']){ await p.evaluate(t=>{ const g=window.__game; g.A.tab({getAttribute:()=>t}); },t); await shot('08-'+t); }
  console.log(errs.length?errs.join('\n'):'no errors');
  await b.close();
})();
