/* Снимает разделы «Деньги» на состоянии из середины партии. node tools/fin-shots.js [phone|se|desktop] [dark] */
const path=require('path'), fs=require('fs');
require('./load.js'); const B=require('./bots.js');
const PW=process.env.PW_PATH||'/opt/node-tools/node_modules/playwright'; const pw=require(PW), {chromium}=pw;
const FILE='file://'+path.join(__dirname,'..','index.html'); const OUT=path.join(__dirname,'..','dist','shots'); fs.mkdirSync(OUT,{recursive:true});
const PROFILES={phone:Object.assign({},pw.devices['iPhone 13']), se:Object.assign({},pw.devices['iPhone SE']), desktop:{viewport:{width:1280,height:900}}};
(async()=>{
  const which=process.argv[2]||'phone', dark=process.argv[3]==='dark', prof=PROFILES[which]; delete prof.defaultBrowserType;
  const up=+(process.argv[4]||10);
  const {s}=B.runTo(B.good({expand:true,lev:true,at:8}),'shot1',up,'norm'); s.flags.expand=1; s.name='Аня'; s.talent='cook';
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); const ctx=await b.newContext(Object.assign({colorScheme:dark?'dark':'light'},prof)); const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push('CONSOLE '+m.text()); });
  await p.goto(FILE); await p.waitForTimeout(400);
  await p.evaluate(({S})=>{ const g=window.__game; g.setState(S,{screen:'plan',tab:'money',msub:'month',seen:{},actSeen:{1:1,5:1,9:1,13:1},outlet:S.outlets[0].id}); },{S:s});
  const shot=async(n,full)=>{ await p.waitForTimeout(500); await p.screenshot({path:path.join(OUT,`fin-${which}${dark?'-d':''}-${n}.png`),fullPage:!!full}); };
  for(const sub of ['month','acc','ana','bank','cty']){
    await p.evaluate(sub=>{ const g=window.__game; g.A.msub({getAttribute:()=>sub}); },sub);
    await shot(sub,true);
  }
  console.log(errs.length?errs.join('\n'):'no errors');
  await b.close();
})();
