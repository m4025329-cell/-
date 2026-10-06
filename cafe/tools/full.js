/* Полные скриншоты экранов (во всю высоту) на заданной ширине. node tools/full.js [ширина] [тема] */
const path=require('path'), fs=require('fs'); const PW=process.env.PW_PATH||'/opt/node-tools/node_modules/playwright'; const pw=require(PW), {chromium}=pw; const B=require('./bots.js');
const FILE='file://'+path.join(__dirname,'..','index.html'); const OUT=path.join(__dirname,'..','dist','full'); fs.mkdirSync(OUT,{recursive:true});
const W=+(process.argv[2]||390), th=process.argv[3]||'light';
const late=B.runTo(B.good({expand:true,lev:true,at:8,reserve:60000,pro:true}),'F1',12); const early=B.runTo(B.good({}),'F2',5);
const clone=o=>JSON.parse(JSON.stringify(o));
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); const ctx=await b.newContext({viewport:{width:W,height:844},isMobile:W<900,hasTouch:W<900,deviceScaleFactor:1,colorScheme:th}); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(FILE); await p.waitForTimeout(300);
  const set=async(name,S,U)=>{ await p.evaluate(({S,U})=>window.__game.setState(S,U),{S,U}); await p.waitForTimeout(500); await p.screenshot({path:path.join(OUT,`${W}-${th}-${name}.png`),fullPage:true}); };
  const sl=clone(late.s); const se=clone(early.s);
  for(const t of ['home','guests','money','net','place']) await set('late-'+t,clone(sl),{screen:'plan',tab:t,outlet:'o1',city:'nsk'});
  const R=clone(late.R); const S2=clone(late.s); await set('report',S2,{screen:'report',report:R});
  await set('final',clone(sl),{screen:'final'});
  await set('fifo',clone(se),{screen:'fifo',mg:{type:'fifo',round:0,wrong:0,right:0,items:[{n:'Молоко',g:'glass',c:'cold',d:3,taken:false},{n:'Мясо',g:'plate',c:'main',d:1,taken:false},{n:'Зелень',g:'salad',c:'salad',d:6,taken:true},{n:'Рыба',g:'fish',c:'main',d:2,taken:false},{n:'Яйца',g:'egg',c:'brek',d:8,taken:false},{n:'Творог',g:'bowl',c:'brek',d:4,taken:false}]},evGame:{t:'x'}});
  await set('change',clone(se),{screen:'change',mg:{type:'change',round:1,wrong:0,right:1,picked:null,q:{total:387,paid:500,ans:113,opts:[113,123,63]}}});
  console.log(errs.length?errs.join('\n'):'ошибок нет'); await b.close();
})();
