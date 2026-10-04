/* Скриншоты для Google Play: телефон 1080x1920 (9:16). Запуск из папки layer-by-layer:  node play/tools/make-screenshots.js */
const fs=require('fs'), path=require('path');
const PW=process.env.PW_PATH||'/opt/node-tools/node_modules/playwright';
const { chromium }=require(PW);
const play=require('../../tools/play.js');
const OUT=path.join(__dirname,'..','store','screenshots'), FILE='file://'+path.join(__dirname,'..','..','index.html');
fs.mkdirSync(OUT,{recursive:true});
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const ctx=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:3,colorScheme:'dark',isMobile:true,hasTouch:true});
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
  const hideToast=()=>p.evaluate(()=>{ const t=document.getElementById('toast'); if(t){ t.innerHTML=''; t.className=''; t.style.display='none'; } });
  const shot=async n=>{ await p.waitForTimeout(700); await hideToast(); await p.evaluate(()=>window.scrollTo(0,0)); await p.screenshot({path:path.join(OUT,n+'.png')}); };
  const scrollTo=async sel=>{ await p.evaluate(s=>{ const e=document.querySelector(s); if(e) e.scrollIntoView({block:'start'}); window.scrollBy(0,-120); },sel); await p.waitForTimeout(500); };
  const shotHere=async n=>{ await p.waitForTimeout(500); await hideToast(); await p.screenshot({path:path.join(OUT,n+'.png')}); };
  await p.goto(FILE); await p.waitForTimeout(600);
  await shot('01-start');
  await p.fill('#pname','Алексей'); await p.click('#startbtn');
  await p.click('[data-act=introskip]'); await p.waitForSelector('#setupgo');
  await p.fill('#shopname','Сопло и Ко'); await p.click('[data-act=ptalent][data-k=des]');
  await shotHere('02-setup');
  await p.click('#setupgo'); await p.click('[data-act=skipcalib]'); await p.waitForTimeout(500);
  await shot('03-scene');
  for(let i=0;i<4;i++){ if(await p.evaluate(()=>window.__game.U.screen)==='plan') break; if(await p.$('[data-act=choose]')) await p.click('[data-act=choose]'); if(await p.$('[data-act=scenenext]')) await p.click('[data-act=scenenext]'); await p.waitForTimeout(250); }
  if(await p.$('#modal .modal')) await p.click('#modal [data-act=closemodal]');
  await scrollTo('.offers'); await shotHere('04-orders');
  await p.click('[data-act=oacc]'); await p.click('[data-t=biz]'); await p.waitForTimeout(300);
  await p.click('[data-act=qfdem]'); await scrollTo('.flow'); await shotHere('05-print');
  /* поздняя игра: задания, склад, лаборатория, отчёт */
  await p.evaluate(()=>{ const S=newState('Алексей',{seed:'play'}); applySetup(S,{shop:'Сопло и Ко',talent:'des',diff:'norm'}); S.month=6; S.cash=84000; S.rep=48; S.unlocked.mini=true; S.unlocked.part=true; S.printers=[{t:'old',age:99},{t:'std',age:4},{t:'fast',age:2}]; S.space='cowork'; S.channel.market=true;
    S.fil.kg=14; S.fil.val=14*1380; S.history=[1,2,3,4,5].map(m=>({m,revenue:30000+m*6000,profit:6000+m*2500,cap:60000+m*18000,cash:50000,sold:200,util:0.9,hours:300,H:330}));
    S.team={sonya:3}; S.lab={done:{slicer:3},active:[{id:'nozzle',left:1,total:2}]}; S.quests={hundred:{state:'active',stage:1,left:4,start:3}};
    refreshUnlocks(S); window.__game.setState(S,{screen:'plan',tab:'quests',helpSeen:true,seen:{}}); });
  await p.waitForTimeout(600); await scrollTo('.quest'); await shotHere('06-quests');
  await p.click('[data-t=shop]'); await scrollTo('.upg'); await shotHere('07-lab');
  await p.click('[data-t=stock]'); await scrollTo('.fchart'); await shotHere('08-stock');
  await play.ready(p); await p.click('[data-t=biz]'); await p.click('#gobtn'); await p.waitForTimeout(300);
  if(await p.$('[data-act=gosure]')) await p.click('[data-act=gosure]');
  await p.click('[data-act=runskip]'); await p.waitForTimeout(500); await shot('09-report');
  console.log('ошибки консоли:',errs);
  await b.close();
})();
