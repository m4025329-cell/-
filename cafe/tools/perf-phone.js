/* Скорость на слабом телефоне: процессор замедлен в 4 раза. node tools/perf-phone.js [rate] */
const path=require('path'); require('./load.js'); const B=require('./bots.js');
const PW=process.env.PW_PATH||'/opt/node-tools/node_modules/playwright'; const pw=require(PW), {chromium}=pw;
const FILE='file://'+path.join(__dirname,'..','index.html'); const RATE=+(process.argv[2]||4);
(async()=>{
  const {s}=B.runTo(B.good({expand:true,lev:true,at:8}),'perf',11,'norm'); s.flags.expand=1; s.name='Аня';
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const ctx=await b.newContext({viewport:{width:390,height:800},deviceScaleFactor:2,isMobile:true,hasTouch:true}); const p=await ctx.newPage(); const cdp=await ctx.newCDPSession(p);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:RATE});
  const t0=Date.now(); await p.goto(FILE,{waitUntil:'load'}); await p.waitForSelector('.hero'); const load=Date.now()-t0;
  const timing=async(label,fn)=>{ const ms=await p.evaluate(async fnSrc=>{ const f=new Function('return ('+fnSrc+')')(); const t=performance.now(); f(); await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))); return performance.now()-t; },fn.toString()); return {label,ms:Math.round(ms)}; };
  await p.evaluate(({S})=>{ window.__game.setState(S,{screen:'plan',tab:'home',seen:{},actSeen:{1:1,5:1,9:1,13:1},outlet:S.outlets[0].id}); },{S:s}); await p.waitForTimeout(500);
  const rows=[];
  for(const t of ['menu','place','guests','money','net','home']) rows.push(await timing('вкладка '+t,()=>window.__game.A.tab({getAttribute:()=>'%T%'}))); 
  console.log('загрузка до первого экрана: '+load+' мс (замедление ×'+RATE+')');
  const tabs=['menu','place','guests','money','net','home'];
  for(const t of tabs){ const ms=await p.evaluate(async t=>{ const tt=performance.now(); window.__game.A.tab({getAttribute:()=>t}); await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))); return performance.now()-tt; },t); console.log('  вкладка '+t.padEnd(7)+Math.round(ms)+' мс'); }
  for(const sub of ['acc','ana','bank','cty','month']){ await p.evaluate(()=>window.__game.A.tab({getAttribute:()=>'money'})); const ms=await p.evaluate(async sub=>{ const tt=performance.now(); window.__game.A.msub({getAttribute:()=>sub}); await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))); return performance.now()-tt; },sub); console.log('  деньги/'+sub.padEnd(6)+Math.round(ms)+' мс'); }
  const lab=await p.evaluate(async()=>{ const tt=performance.now(); window.__game.A.msub({getAttribute:()=>'ana'}); window.__game.A.plab({getAttribute:()=>window.__game.S.menu[1]}); await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))); return performance.now()-tt; }); console.log('  лаборатория цены (смена блюда) '+Math.round(lab)+' мс');
  const calc=await p.evaluate(async()=>{ const tt=performance.now(); window.__game.A.calc({getAttribute:()=>window.__game.S.menu[0]}); await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))); return performance.now()-tt; }); console.log('  калькуляция блюда '+Math.round(calc)+' мс'); await p.evaluate(()=>window.__game.A.closemodal());
  const go=await p.evaluate(async()=>{ const g=window.__game; g.U.goOK=true; const tt=performance.now(); g.A.go(); await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))); return performance.now()-tt; }); console.log('  запуск месяца '+Math.round(go)+' мс');
  await p.evaluate(()=>window.__game.A.runskip()); await p.waitForTimeout(400);
  const rep=await p.evaluate(async()=>{ const tt=performance.now(); window.__game.render(); await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))); return performance.now()-tt; }); console.log('  экран итогов (перерисовка) '+Math.round(rep)+' мс');
  await b.close();
})();
