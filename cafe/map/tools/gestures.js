/* Жесты на телефоне: сдвиг, щипок, касание района, шторка, ползунки. node tools/gestures.js */
const path=require('path'); const pw=require(process.env.PW_PATH||'/opt/node-tools/node_modules/playwright');
let fails=0; const ok=(c,m)=>{ if(!c){ fails++; console.log('ПРОВАЛ:',m); } else console.log('ок:',m); };
(async()=>{
  const b=await pw.chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); const dev=Object.assign({},pw.devices['iPhone 13']); delete dev.defaultBrowserType;
  const ctx=await b.newContext(dev); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
  await p.goto('file://'+path.join(__dirname,'..','city-map.html')); await p.waitForTimeout(700);
  const cdp=await ctx.newCDPSession(p);
  const V=()=>p.evaluate(()=>{ const v=window.__map.APP.view; return {cx:v.cx,cy:v.cy,s:v.s}; });
  const v0=await V();
  await cdp.send('Input.synthesizeScrollGesture',{x:195,y:300,xDistance:-120,yDistance:-90,gestureSourceType:'touch',speed:600}); await p.waitForTimeout(400);
  const v1=await V(); ok(v1.cx>v0.cx+80&&v1.cy>v0.cy+60,'сдвиг пальцем двигает карту ('+Math.round(v1.cx-v0.cx)+', '+Math.round(v1.cy-v0.cy)+')');
  await cdp.send('Input.synthesizePinchGesture',{x:195,y:300,scaleFactor:2,relativeSpeed:400,gestureSourceType:'touch'}); await p.waitForTimeout(500);
  const v2=await V(); ok(v2.s>v1.s*1.6,'щипок приближает ('+v1.s.toFixed(2)+' → '+v2.s.toFixed(2)+')');
  await cdp.send('Input.synthesizePinchGesture',{x:195,y:250,scaleFactor:.6,relativeSpeed:300,gestureSourceType:'touch'}); await p.waitForTimeout(500);
  const v3=await V(); ok(v3.s<v2.s*.6,'обратный щипок отдаляет ('+v3.s.toFixed(2)+')');
  /* касание района */
  await p.evaluate(()=>{ window.__map.fly(1200,1150,.9); }); await p.waitForTimeout(300);
  await p.touchscreen.tap(195,300); await p.waitForTimeout(1500);
  const sel=await p.evaluate(()=>window.__map.ST.sel); ok(!!sel,'касание района выбирает его: '+sel);
  const st=await p.evaluate(()=>document.getElementById('panel').dataset.state); ok(st==='open','шторка раскрылась: '+st);
  const hd=await p.evaluate(()=>document.querySelector('.phead h2').textContent); ok(hd.length>3,'в шторке название района: '+hd);
  /* закрытие крестиком */
  await p.tap('.phead .xbtn'); await p.waitForTimeout(400); ok(await p.evaluate(()=>window.__map.ST.sel===null),'крестик снимает выбор');
  /* шторка: свернуть/развернуть */
  await p.tap('.grab'); await p.waitForTimeout(500); const st2=await p.evaluate(()=>document.getElementById('panel').dataset.state); ok(st2==='open'||st2==='peek','кнопка шторки меняет состояние: '+st2);
  /* ползунки */
  await p.evaluate(()=>{ const r=document.getElementById('r-time'); r.value=21.5; r.dispatchEvent(new Event('input',{bubbles:true})); }); await p.waitForTimeout(200);
  ok(await p.evaluate(()=>Math.abs(window.__map.ST.hour-21.5)<.01),'ползунок времени меняет время');
  await p.evaluate(()=>{ const r=document.getElementById('r-month'); r.value=11; r.dispatchEvent(new Event('input',{bubbles:true})); }); await p.waitForTimeout(200);
  ok(await p.evaluate(()=>window.__map.ST.month===11&&window.__map.ST.cal===0),'ползунок месяца меняет сезон (январь)');
  /* погода по кругу */
  const w0=await p.evaluate(()=>window.__map.ST.weather); await p.tap('#wx button[aria-pressed="true"]'); await p.waitForTimeout(150); const w1=await p.evaluate(()=>window.__map.ST.weather); ok(w0!==w1,'кнопка погоды переключает: '+w0+' → '+w1);
  /* кнопки слоёв */
  await p.tap('.chip[data-k="rivals"]'); await p.waitForTimeout(200); ok(await p.evaluate(()=>window.__map.ST.layers.rivals),'слой «Конкуренты» включается');
  /* размеры целей касания */
  const small=await p.evaluate(()=>{ const out=[]; document.querySelectorAll('button,input[type=range]').forEach(e=>{ const r=e.getBoundingClientRect(); if(r.width&&r.height&&(r.height<38||r.width<38)&&e.type!=='range'&&e.className!=='grab'&&getComputedStyle(e).display!=='none') out.push((e.id||e.className||e.tagName)+' '+Math.round(r.width)+'×'+Math.round(r.height)); }); return out; });
  ok(small.length===0,'все кнопки не меньше 38 px'+(small.length?': '+small.join('; '):''));
  ok(await p.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'нет горизонтальной прокрутки страницы');
  console.log(errs.length?errs.join('\n'):'ошибок страницы нет'); await b.close(); process.exit(fails||errs.length?1:0);
})();
