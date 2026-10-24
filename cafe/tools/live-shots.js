/* Снимки «живого месяца» в разные моменты. node tools/live-shots.js [месяц=6] */
const path=require('path'),fs=require('fs'); require('./load.js'); const B=require('./bots.js');
const pw=require(process.env.PW_PATH||'/opt/node-tools/node_modules/playwright'); const {chromium}=pw;
const OUT=path.join(__dirname,'..','dist','shots'); fs.mkdirSync(OUT,{recursive:true});
(async()=>{
  const up=+(process.argv[2]||6); const {s}=B.runTo(B.good({expand:true,lev:true,at:8}),'live1',up,'easy'); s.name='Аня'; s.flags.expand=1;
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); const dev=Object.assign({},pw.devices['iPhone 13']); delete dev.defaultBrowserType;
  const p=await (await b.newContext(dev)).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
  await p.goto('file://'+path.join(__dirname,'..','index.html')); await p.waitForTimeout(300);
  await p.evaluate(({S})=>{ window.__game.setState(S,{screen:'plan',tab:'home',seen:{},actSeen:{1:1,5:1,9:1,13:1},outlet:S.outlets[0].id}); window.__game.A.go(); if(window.__game.U.screen==='plan') window.__game.A.goforce(); },{S:s}); 
  for(const t of [1200,3000,5200,8000]){ await p.waitForTimeout(t===1200?1200:t-[1200,3000,5200,8000][[1200,3000,5200,8000].indexOf(t)-1]); await p.screenshot({path:path.join(OUT,'live-'+t+'.png')}); }
  await p.waitForTimeout(3500); console.log('экран после смены:',await p.evaluate(()=>window.__game.U.screen));
  console.log(errs.length?errs.join('\n'):'ошибок нет'); await b.close();
})();
