/* Снимки карты: node tools/shot.js имя x y масштаб [json-состояние] [ширина высота] [мс ожидания] */
const path=require('path'), fs=require('fs');
const pw=require(process.env.PW_PATH||'/opt/node-tools/node_modules/playwright'); const {chromium}=pw;
const OUT=path.join(__dirname,'..','dist','shots'); fs.mkdirSync(OUT,{recursive:true});
(async()=>{
  const a=process.argv.slice(2); const name=a[0]||'t', x=+(a[1]||1200), y=+(a[2]||850), s=+(a[3]||.6), st=a[4]?JSON.parse(a[4]):{}, w=+(a[5]||1300), h=+(a[6]||850), wait=+(a[7]||900);
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); const mobile=w<700;
  const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:mobile?2:1,isMobile:mobile,hasTouch:mobile,colorScheme:st.dark?'dark':'light',reducedMotion:'no-preference'}); const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message+' '+String(e.stack||'').split('\n').slice(0,3).join('>'))); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
  await p.goto('file://'+path.join(__dirname,'..','city-map.html')); await p.waitForTimeout(500);
  await p.evaluate(([x,y,s,st])=>{ const M=window.__map; if(st.month){ M.ST.month=st.month; M.ST.cal=[2,3,4,5,6,7,8,9,10,11,0,1,2,3,4,5][st.month-1]; M.renderDock(); } if(st.hour!=null) M.ST.hour=st.hour; if(st.weather) M.ST.weather=st.weather; if(st.play===false) M.ST.play=false; if(st.mode) M.setMode(st.mode); if(st.layers) Object.assign(M.ST.layers,st.layers); if(st.sel!==undefined) M.select(st.sel); else if(!st.keep) M.fly(x,y,s); if(st.train){ const T=M.LF.trains[0]; T.delay=0; T.d=st.train; T.stopped=false; } if(st.hrs!=null){ M.ST.hoursOpt=st.hrs; M.renderPanel(); } M.tick(); },[x,y,s,st]);
  await p.waitForTimeout(wait);
  await p.screenshot({path:path.join(OUT,name+'.png')});
  const ms=await p.evaluate(()=>window.__map.ms()); console.log(name,'статика',Math.round(ms||0),'мс'); console.log(errs.length?errs.join('\n'):'ошибок нет'); await b.close();
})();
