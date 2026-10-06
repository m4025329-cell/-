/* Сквозное прохождение всей игры в браузере: все 16 месяцев, сцены, случаи, мини-игра, итоги, финал.
   node tools/e2e.js [профиль=phone] [сложность=norm] [снимки=0] */
const path=require('path'), fs=require('fs');
const PW=process.env.PW_PATH||'/opt/node-tools/node_modules/playwright'; const pw=require(PW), {chromium}=pw;
const FILE='file://'+path.join(__dirname,'..','index.html'); const OUT=path.join(__dirname,'..','dist','e2e'); fs.mkdirSync(OUT,{recursive:true});
const PROFILES={phone:Object.assign({},pw.devices['iPhone 13']), se:Object.assign({},pw.devices['iPhone SE']), pixel:Object.assign({},pw.devices['Pixel 7']), desktop:{viewport:{width:1280,height:800}}, pad:Object.assign({},pw.devices['iPad (gen 7)'])};
(async()=>{
  const which=process.argv[2]||'phone', diff=process.argv[3]||'norm', shots=process.argv[4]==='1'; const prof=PROFILES[which]; delete prof.defaultBrowserType;
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); const ctx=await b.newContext(Object.assign({colorScheme:which==='pad'?'dark':'light'},prof)); const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR '+e.message+' '+String(e.stack||'').split('\n').slice(0,3).join('>'))); p.on('console',m=>{ if(m.type()==='error') errs.push('CONSOLE '+m.text()); });
  await p.goto(FILE); await p.waitForTimeout(300);
  await p.evaluate(d=>{ const g=window.__game; g.A.newgameyes(); g.A.introskip(); g.U.setup.diff=d; g.U.setup.name='Тест'; g.U.setup.code='8Б'; g.A.startgame(); },diff);
  let guard=0, snapN=0; const seenScreens={};
  const snap=async tag=>{ if(!shots) return; if(snapN++>40) return; await p.waitForTimeout(500); await p.screenshot({path:path.join(OUT,`${which}-${String(snapN).padStart(2,'0')}-${tag}.png`)}); };
  while(guard++<900){
    const st=await p.evaluate(()=>{ const g=window.__game; return {scr:g.U.screen, m:g.S?g.S.month:0, tab:g.U.tab}; });
    const key=st.scr+(st.scr==='plan'?'':'')+':'+st.m; if(!seenScreens[key]){ seenScreens[key]=1; if([ 'act:1','scene:1','event:3','report:2','report:8','finale:16','final:17','lessonEnd:9','quiz:5','rush:4','act:9','scene:9','scene:10'].indexOf(key)>=0 || st.scr==='rush') await snap(key.replace(':','-')); }
    if(st.scr==='final') break;
    if(st.scr==='plan'){
      await p.evaluate(()=>{
        const g=window.__game, S=g.S, A=g.A, o=S.outlets[0], m=S.month;
        if(m===1){ A_menu(S,'veg',true); A_hire(S,o.id,'cln'); o.mk.smm=1; o.mk.flyer=1; }
        if(m>=2) A_lab(S,'raf'); if(m>=5){ A_lab(S,'cheesec'); }
        const order=['deco1','wifi','oven','seats','espro','fridge','terr','pos','kids'];
        S.outlets.forEach(x=>{ if(x.built||x.fmt==='fran') return; for(const e of order){ if(!x.eq[e] && S.cash>eqCost(S,x,EQD[e])+200000){ A_eq(S,x.id,e); break; } } if(S.cash>150000&&x.lvl.cook<3) A_train(S,x.id,'cook'); });
        if(m>=3) A_tax(S,'15');
        if(m>=9){ S.flags.expand=1; if(!S.invest) A_invest(S); const ids=['nnov','kazan','ekb']; for(const k of ids){ const c=openCost(S,k,'cafe'); if(cityOpenable(S,k).ok && S.cash>c.total+100000){ A_open(S,k,'cafe'); } } }
        if(S.cash<20000) A_borrow(S,200000);
      });
      // пройти по всем вкладкам кликами по настоящим кнопкам
      for(const t of ['menu','place','guests','money','net','home']){ if(t==='net' && !(await p.$('[data-tab=net]'))) continue; await p.click('[data-tab='+t+']'); await p.waitForTimeout(40); if(shots && st.m===2 && ['menu','place','guests','money'].includes(t)) await snap('plan-'+t); if(shots && st.m===10 && t==='net') await snap('plan-net'); }
      await p.click('[data-act=go]'); await p.waitForTimeout(60);
      if(await p.$('[data-act=goforce]')) await p.click('[data-act=goforce]');
      continue;
    }
    await p.evaluate(()=>{
      const g=window.__game, U=g.U, A=g.A; const clickAct=(a,attrs)=>{ const el=document.querySelector('[data-act='+a+']'); if(el) A[a](el,{target:el}); return !!el; };
      switch(U.screen){
        case 'act': A.actgo(); break;
        case 'last': A.actgo(); break;
        case 'scene': if(document.querySelector('[data-act=pick]')) clickAct('pick'); else clickAct('scenenext'); break;
        case 'event': if(document.querySelector('[data-act=evpick]')) { const els=document.querySelectorAll('[data-act=evpick]'); A.evpick(els[Math.floor(Math.random()*els.length)]); } else A.evnext(); break;
        case 'rush': { const R=U.rush; if(R){ R.served=10; A.rushskip(); } break; }
        case 'run': A.runskip(); break;
        case 'report': A.repnext(); break;
        case 'quiz': if(U.qz.picked==null && U.qz.i<U.qz.qs.length) { A.qpick({getAttribute:()=>String(U.qz.qs[U.qz.i].c)}); } else if(U.qz.i<U.qz.qs.length) A.qnext(); else A.quizend(); break;
        case 'lessonEnd': A.lesson2(); break;
        case 'finale': A.tofinal(); break;
      }
    });
    await p.waitForTimeout(25);
  }
  const res=await p.evaluate(()=>{ const g=window.__game, S=g.S; return {month:S.month, cash:Math.round(S.cash), cap:Math.round(capital(S)), cities:cityCountOpenWithFran(S), goal:goalMet(S), ach:Object.keys(S.ach).length, scr:g.U.screen, bad:/NaN|undefined|Infinity|\[object/.test(document.body.innerText)}; });
  if(shots) await snap('final');
  console.log(which, diff, JSON.stringify(res)); console.log(errs.length?errs.join('\n'):'ошибок нет'); await b.close(); process.exit(errs.length||res.bad?1:0);
})();
