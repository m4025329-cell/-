/* Снимки новых итогов месяца. node tools/report-shots.js [месяц=6] [exp=1 — раскрыть подробности] */
const path=require('path'),fs=require('fs'); require('./load.js'); const B=require('./bots.js');
const pw=require(process.env.PW_PATH||'/opt/node-tools/node_modules/playwright'); const {chromium}=pw;
const OUT=path.join(__dirname,'..','dist','shots'); fs.mkdirSync(OUT,{recursive:true});
(async()=>{
  const up=+(process.argv[2]||6), exp=process.argv[3]==='1'; const {s}=B.runTo(B.good({expand:true,lev:true,at:8}),'rep1',up,'easy'); s.name='Аня'; s.flags.expand=1;
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); const dev=Object.assign({},pw.devices['iPhone 13']); delete dev.defaultBrowserType;
  const p=await (await b.newContext(dev)).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
  await p.goto('file://'+path.join(__dirname,'..','index.html')); await p.waitForTimeout(300);
  await p.evaluate(({S})=>{ window.__game.setState(S,{screen:'plan',tab:'home',seen:{},actSeen:{1:1,5:1,9:1,13:1},outlet:S.outlets[0].id}); window.__game.A.go(); if(window.__game.U.screen==='plan') window.__game.A.goforce(); },{S:s});
  await p.waitForTimeout(500); await p.evaluate(()=>window.__game.A.runskip()); await p.waitForTimeout(900);
  console.log('экран:',await p.evaluate(()=>window.__game.U.screen));
  await p.screenshot({path:path.join(OUT,'rep-top.png')});
  await p.screenshot({path:path.join(OUT,'rep-full.png'),fullPage:true});
  if(exp){ await p.evaluate(()=>{ var U=window.__game.U; U.acc={tips:1,chk:1,out:1,days:1,fun:1,sold:1}; window.__game.render(true); }); await p.waitForTimeout(400); await p.screenshot({path:path.join(OUT,'rep-open.png'),fullPage:true}); }
  console.log(errs.length?errs.join('\n'):'ошибок нет'); await b.close();
})();
