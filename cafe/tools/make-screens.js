/* Снимки для карточки установки приложения. node tools/make-screens.js */
const path=require('path'), fs=require('fs'); require('./load.js'); const B=require('./bots.js');
const PW=process.env.PW_PATH||'/opt/node-tools/node_modules/playwright'; const pw=require(PW), {chromium}=pw;
const FILE='file://'+path.join(__dirname,'..','index.html'); const OUT=path.join(__dirname,'..','screens'); fs.mkdirSync(OUT,{recursive:true});
(async()=>{
  const {s}=B.runTo(B.good({expand:true,lev:true,at:8}),'store',11,'norm'); s.flags.expand=1; s.name='Аня';
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  async function shot(dev,file,U,pre){ const ctx=await b.newContext(dev); const p=await ctx.newPage(); await p.goto(FILE); await p.waitForTimeout(300);
    await p.evaluate(({S,U})=>{ window.__game.setState(S,Object.assign({screen:'plan',seen:{},actSeen:{1:1,5:1,9:1,13:1},outlet:S.outlets[0].id},U)); },{S:s,U}); await p.waitForTimeout(500);
    if(pre) await p.evaluate(pre); await p.waitForTimeout(400); await p.screenshot({path:path.join(OUT,file)}); await ctx.close(); }
  const phone={viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,colorScheme:'light'};
  await shot(phone,'screen-1.png',{tab:'menu'},()=>window.scrollTo(0,140));
  await shot(phone,'screen-2.png',{tab:'money',msub:'ana'},()=>window.scrollTo(0,60));
  await shot(phone,'screen-3.png',{tab:'net',city:'sochi'},()=>window.scrollTo(0,40));
  await shot({viewport:{width:1280,height:720},deviceScaleFactor:1},'wide-1.png',{tab:'home'});
  await b.close();
})();
