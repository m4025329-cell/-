/* Образцы отчёта для учителя: PDF без ключа (то, что получит ученик) и с ключом. node tools/make-sample.js */
const path=require('path'); require('./load.js'); const B=require('./bots.js');
const PW=process.env.PW_PATH||'/opt/node-tools/node_modules/playwright'; const pw=require(PW), {chromium}=pw;
const FILE='file://'+path.join(__dirname,'..','index.html'); const OUT=path.join(__dirname,'..','docs');
(async()=>{
  const s=B.run(B.good({expand:true,lev:true,at:8,pro:true}),'cls:8Б-пример','easy'); s.name='Анна Иванова (образец)'; s.cafe='Первый столик'; s.code='8Б'; s.final=true;
  s.terms=Object.keys(TERMS).slice(0,52); s.quizScore=[1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1];
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); const ctx=await b.newContext({viewport:{width:1100,height:900}}); const p=await ctx.newPage();
  await p.goto(FILE); await p.waitForTimeout(300);
  await p.evaluate(({S})=>{ window.__game.setState(S,{screen:'final',seen:{},actSeen:{}}); },{S:s}); await p.waitForTimeout(300);
  await p.evaluate(()=>window.__game.A.sheet()); await p.waitForTimeout(400); await p.emulateMedia({media:'print'});
  await p.pdf({path:path.join(OUT,'Образец-отчёта-ученика.pdf'),format:'A4',printBackground:true,preferCSSPageSize:true}); await p.emulateMedia({media:'screen'});
  const code=await p.evaluate(()=>{ window.__game.A.sheetclose(); window.__game.A.showcode(); const c=document.getElementById('savecode').value; window.__game.A.closemodal(); return c; });
  await p.evaluate(()=>window.__game.A.totitle()); await p.evaluate(()=>window.__game.A.teacher()); await p.waitForTimeout(200);
  await p.fill('#tc-code',code); await p.evaluate(()=>window.__game.A.tcopen()); await p.waitForTimeout(400); await p.emulateMedia({media:'print'});
  await p.pdf({path:path.join(OUT,'Образец-отчёта-с-ключом.pdf'),format:'A4',printBackground:true,preferCSSPageSize:true});
  const g=goalNow(s); console.log('образец: капитал',Math.round(g.cap),'города',g.cities,'рейтинг',g.rating.toFixed(1),'цель',goalMet(s),'баллы',autoScore(s).total.toFixed(1)); await b.close();
})();
