/* «Обезьяна»: случайно жмёт кнопки, двигает ползунки, вводит текст и проходит игру на разных устройствах.
   Ищет: ошибки в консоли, NaN/undefined на экране, наложение и выход за экран, зависания, потерю прогресса.
   Запуск: node tools/monkey.js [шагов=900] [профиль=all] [зерно=1] */
const path=require('path'), fs=require('fs');
const PW=process.env.PW_PATH||'/opt/node-tools/node_modules/playwright';
const pw=require(PW), { chromium }=pw;
const CHECK=require('./check.js');
const FILE='file://'+path.join(__dirname,'..','index.html');
const STEPS=+(process.argv[2]||900), WHICH=process.argv[3]||'all', SEED=+(process.argv[4]||1);
const OUT=process.env.MONKEY_OUT||path.join(__dirname,'..','dist','monkey'); fs.mkdirSync(OUT,{recursive:true});
const PROFILES={
  iphone:  Object.assign({}, pw.devices['iPhone 13']),
  iphonese:Object.assign({}, pw.devices['iPhone SE']),
  pixel:   Object.assign({}, pw.devices['Pixel 7']),
  galaxy:  {viewport:{width:360,height:740},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 13; SM-A135F) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36'},
  ipad:    Object.assign({}, pw.devices['iPad (gen 7)']),
  desktop: {viewport:{width:1366,height:768},deviceScaleFactor:1}
};
function rng(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const BAD_TEXT=/NaN|undefined|Infinity|\[object|null₽|null шт/;
async function run(name, prof, seed){
  const R=rng(seed*7919+name.length), b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const opts=Object.assign({},prof); delete opts.defaultBrowserType;
  const ctx=await b.newContext(Object.assign({colorScheme:R()<0.5?'dark':'light'},opts)); const p=await ctx.newPage();
  const issues=[], seen=new Set(); let shots=0;
  p.on('pageerror',e=>issues.push('PAGEERR '+e.message+' | '+String(e.stack||'').split('\n').slice(0,3).join(' > ')));
  p.on('console',m=>{ if(m.type()==='error') issues.push('CONSOLE '+m.text()); });
  await p.goto(FILE); await p.waitForTimeout(300);
  const snap=async tag=>{ if(shots++<6){ try{ await p.screenshot({path:path.join(OUT,`${name}-${seed}-${tag}.png`),fullPage:true}); }catch(e){} } };
  const state=()=>p.evaluate(()=>{ const g=window.__game; return g&&g.S?{scr:g.U.screen,tab:g.U.tab||'',m:g.S.month,cash:Math.round(g.S.cash)}:{scr:g&&g.U.screen||'?',tab:'',m:0,cash:0}; });
  let lastKey='', stuck=0, restarts=0, lastChange=Date.now();
  for(let i=0;i<STEPS;i++){
    const st=await state(); const key=st.scr+'|'+st.tab+'|'+st.m;
    if(key===lastKey) stuck=(Date.now()-lastChange>15000)?999:0; else { stuck=0; lastKey=key; lastChange=Date.now(); }
    /* проверки на новом экране */
    const ck=st.scr+'|'+st.tab+'|'+(st.m>=9?'late':'early');
    if(!seen.has(ck)){ seen.add(ck);
      await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(450);
      const bad=await p.evaluate(CHECK); bad.forEach(x=>issues.push(`LAYOUT ${name} ${ck}: ${x}`));
      const ov=await p.evaluate(()=>{ const VW=Math.min(innerWidth,(screen&&screen.width)||innerWidth); const off=[]; document.querySelectorAll('#app *, #modal *').forEach(e=>{ if(e.closest('.tabs,.flow:not(.v),.spark,svg')) return; const r=e.getBoundingClientRect(); if(r.width>0&&r.right>VW+1&&getComputedStyle(e).position!=='fixed') off.push((e.tagName+'.'+String(e.className).split(' ')[0]).slice(0,40)+' '+Math.round(r.right)); }); return [Math.max(document.documentElement.scrollWidth,innerWidth),VW,[...new Set(off)].slice(0,4)]; });
      if(ov[0]>ov[1]+1) issues.push(`OVERFLOW ${name} ${ck}: ${ov[0]}>${ov[1]} ${ov[2].join(' | ')}`);
      if(bad.length||ov[0]>ov[1]+1) await snap('layout-'+i);
    }
    const txt=await p.evaluate(()=>document.body.innerText); const m=BAD_TEXT.exec(txt);
    if(m){ issues.push(`BADTEXT ${name} ${ck}: «${txt.slice(Math.max(0,m.index-40),m.index+30).replace(/\n/g,' ')}»`); await snap('badtext-'+i); }
    /* выбор действия */
    if(st.scr==='final'||(stuck>40)){
      if(stuck>40) issues.push(`STUCK ${name} ${key}`);
      if(st.scr==='final'||stuck>40){ if(++restarts>2) break; await snap('end'+i); await p.evaluate(()=>{ try{ localStorage.clear(); }catch(e){} }); await p.goto(FILE); await p.waitForTimeout(300); lastKey=''; stuck=0; continue; }
    }
    const list=await p.evaluate(()=>{
      document.querySelectorAll('[data-mk]').forEach(e=>e.removeAttribute('data-mk'));
      const out=[]; const els=document.querySelectorAll('[data-act]:not([disabled]):not([aria-disabled=true]), input[type=range], #pname, #shopname, #classcode, #boardtxt, #loadcode');
      els.forEach(e=>{ const r=e.getBoundingClientRect(), cs=getComputedStyle(e); if(r.width>2&&r.height>2&&cs.visibility!=='hidden'&&cs.display!=='none'){ e.setAttribute('data-mk',String(out.length)); out.push({a:e.getAttribute('data-act')||'',t:e.tagName+':'+(e.type||''),mn:e.min,mx:e.max}); } });
      return out; });
    if(!list.length){ await p.waitForTimeout(200); continue; }
    const want=['oacc','qfdem','qffill','qtake','shire','sltry','go','gosure','runskip','afterreport','scenenext','chapternext','lessonnext','qnext','qcend','qcskip','slskip','slfinal','setupdone','introskip','tocalib','skipcalib','calibdone','start'];
    let pi=-1;
    if(R()<0.35){ const idx=list.map((x,i)=>want.includes(x.a)?i:-1).filter(i=>i>=0); if(idx.length) pi=idx[Math.floor(R()*idx.length)]; }
    if(pi<0) pi=Math.floor(R()*list.length);
    const pick=await p.$('[data-mk="'+pi+'"]'); if(!pick) continue;
    const act=list[pi].a, tag=list[pi].t;
    try{
      if(/range/.test(tag)){ const mn=+list[pi].mn, mx=+list[pi].mx, v=Math.round(mn+(mx-mn)*R()); await pick.evaluate((e,v)=>{ e.value=v; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); },v); }
      else if(/INPUT:text|TEXTAREA/.test(tag)){ await pick.fill(R()<0.3?'':('Ж'+Math.floor(R()*1000)+' <b>&"')); }
      else if(act==='loadcode'||act==='teacher'){ if(R()<0.5) await pick.click({timeout:2000}); }
      else if(act==='doload'){ await pick.click({timeout:2000}); }
      else { await p.evaluate(i=>{ const e=document.querySelector('[data-mk="'+i+'"]'); if(e) e.click(); },pi); }
    }catch(e){ if(!/Timeout|detached|not attached|intercepts/i.test(String(e))) issues.push('CLICKERR '+name+' '+act+' '+String(e).slice(0,120)); }
    if(R()<0.08) await p.keyboard.press(R()<0.5?'Escape':'Tab');
    await p.waitForTimeout(15);
  }
  const fin=await state(); await b.close();
  const uniq=[...new Set(issues)];
  return {name, steps:STEPS, final:fin, screens:seen.size, issues:uniq};
}
(async()=>{
  const names=WHICH==='all'?Object.keys(PROFILES):WHICH.split(',');
  let bad=0;
  for(const n of names){
    const r=await run(n,PROFILES[n],SEED);
    console.log(`${n.padEnd(9)} экранов ${String(r.screens).padStart(3)}  финал ${JSON.stringify(r.final)}  проблем ${r.issues.length}`);
    r.issues.slice(0,12).forEach(x=>console.log('   '+x.slice(0,260))); bad+=r.issues.length;
  }
  console.log(bad?('ПРОБЛЕМ: '+bad):'Обезьяна: проблем не найдено'); process.exit(bad?1:0);
})();
