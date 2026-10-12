/* Аудит удобства на телефоне: размер целей касания, расстояния, шрифты, переполнение по всем экранам.
   node tools/phone-audit.js [профиль] [--verbose] */
const path=require('path'), fs=require('fs');
require('./load.js'); const B=require('./bots.js');
const PW=process.env.PW_PATH||'/opt/node-tools/node_modules/playwright'; const pw=require(PW), {chromium}=pw;
const FILE='file://'+path.join(__dirname,'..','index.html');
const PROFILES={small:{viewport:{width:360,height:640},deviceScaleFactor:3,isMobile:true,hasTouch:true},phone:pw.devices['iPhone 13'],tall:pw.devices['Pixel 7'],se:pw.devices['iPhone SE']};
const which=(process.argv[2]&&!process.argv[2].startsWith('--'))?process.argv[2].split(','):['small','phone'];
const verbose=process.argv.includes('--verbose'); const MIN=44;
const mid=B.runTo(B.good({expand:true,lev:true,at:8}),'audit',10,'norm'); const SM=mid.s; SM.flags.expand=1; SM.name='Аня';
const fin=B.run(B.good({expand:true,lev:true,at:8}),'audit2','norm'); fin.name='Аня'; fin.final=true;
const baseU=()=>({seen:{},actSeen:{1:1,5:1,9:1,13:1},outlet:SM.outlets[0].id});
const SCREENS=[
 ['title',null,()=>{ window.__game.A.totitle&&0; }],
];
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); const agg={}; let total=0;
  for(const name of which){
    const opts=Object.assign({},PROFILES[name]); delete opts.defaultBrowserType; const ctx=await b.newContext(opts); const p=await ctx.newPage(); const errs=[];
    p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
    await p.goto(FILE); await p.waitForTimeout(300);
    async function setS(S,U,fn){ await p.evaluate(({S,U})=>{ window.__game.setState(S,U); },{S,U}); if(fn) await p.evaluate(fn); await p.waitForTimeout(250); }
    async function audit(label){
      const r=await p.evaluate(({MIN})=>{
        const out=[]; const vw=document.documentElement.clientWidth;
        const sel='button,[data-act],a[href],input,textarea,select,[role=button],[role=tab],[role=switch]';
        const els=Array.from(document.querySelectorAll(sel)).filter(e=>{ const s=getComputedStyle(e); if(s.visibility==='hidden'||s.display==='none') return false; const r=e.getBoundingClientRect(); if(r.width===0||r.height===0) return false; if(e.closest('[hidden]')) return false; if(e.disabled&&0) return false; return true; });
        const rects=els.map(e=>{ const r=e.getBoundingClientRect(); return {e,r:{x:r.left+scrollX,y:r.top+scrollY,w:r.width,h:r.height},t:(e.getAttribute('aria-label')||e.textContent||e.id||e.className||'').trim().replace(/\s+/g,' ').slice(0,34),act:e.getAttribute('data-act')||e.tagName.toLowerCase()}; });
        rects.forEach(a=>{ if(Math.min(a.r.w,a.r.h)<MIN-0.5){ const isInput=a.e.tagName==='INPUT'&&a.e.type==='range'; out.push({k:'small',t:a.t,act:a.act,w:Math.round(a.r.w),h:Math.round(a.r.h),range:isInput}); } });
        for(let i=0;i<rects.length;i++) for(let j=i+1;j<rects.length;j++){ const a=rects[i].r,b2=rects[j].r; if(rects[i].e.contains(rects[j].e)||rects[j].e.contains(rects[i].e)) continue; const dx=Math.max(b2.x-(a.x+a.w),a.x-(b2.x+b2.w)), dy=Math.max(b2.y-(a.y+a.h),a.y-(b2.y+b2.h)); const gap=Math.max(dx,dy); if(gap<4 && Math.min(a.w,a.h)>=20 && Math.min(b2.w,b2.h)>=20){ out.push({k:'tight',t:rects[i].t+' | '+rects[j].t,act:rects[i].act+'+'+rects[j].act,gap:Math.round(gap)}); } }
        let fs=0; const seen={}; document.querySelectorAll('body *').forEach(e=>{ if(e.closest('svg')||e.closest('[hidden]')) return; const s=getComputedStyle(e); if(s.display==='none'||s.visibility==='hidden') return; const own=Array.from(e.childNodes).filter(n=>n.nodeType===3&&n.textContent.trim().length>2); if(!own.length) return; const f=parseFloat(s.fontSize); if(f<12-0.01){ const key=e.className+'|'+f; if(!seen[key]){ seen[key]=1; out.push({k:'font',t:(e.className||e.tagName)+': '+own[0].textContent.trim().slice(0,24),px:f}); } } });
        if(document.documentElement.scrollWidth>vw+1) out.push({k:'overflow',t:'страница шире экрана',w:document.documentElement.scrollWidth});
        return out;
      },{MIN});
      r.forEach(x=>{ x.screen=label; x.dev=name; const key=x.k+'|'+(x.act||x.t); agg[key]=agg[key]||{x,n:0,screens:new Set()}; agg[key].n++; agg[key].screens.add(label); total++; });
    }
    /* титульный и поток новой игры */
    await audit('title');
    await p.evaluate(()=>window.__game.A.newgameyes()); await p.waitForTimeout(250); await audit('intro');
    await p.evaluate(()=>window.__game.A.introskip()); await p.waitForTimeout(250); await audit('setup');
    await p.evaluate(()=>{ window.__game.A.startgame(); }); await p.waitForTimeout(300); await audit('act');
    await p.evaluate(()=>window.__game.A.actgo()); await p.waitForTimeout(300); await audit('scene');
    /* план по вкладкам на состоянии из середины партии */
    for(const tab of ['home','menu','place','guests','net']){ await setS(SM,Object.assign(baseU(),{screen:'plan',tab,city:'sochi'})); await audit('plan-'+tab); }
    for(const sub of ['month','acc','ana','bank','cty']){ await setS(SM,Object.assign(baseU(),{screen:'plan',tab:'money',msub:sub})); await audit('money-'+sub); }
    /* окна */
    await setS(SM,Object.assign(baseU(),{screen:'plan',tab:'menu'}),()=>window.__game.A.menu()); await audit('modal-menu');
    await p.evaluate(()=>window.__game.A.closemodal());
    await p.evaluate(()=>{ window.__game.A.calc({getAttribute:()=>'latte'}); }); await p.waitForTimeout(250); await audit('modal-calc'); await p.evaluate(()=>window.__game.A.closemodal());
    /* месяц, итоги, проверка, финал, учитель, лист */
    await setS(SM,Object.assign(baseU(),{screen:'plan',tab:'home'})); await p.evaluate(()=>{ const g=window.__game; g.A.go(); }); await p.waitForTimeout(300);
    const scr=await p.evaluate(()=>window.__game.U.screen); if(scr==='plan'){ await p.evaluate(()=>window.__game.A.goforce()); await p.waitForTimeout(300); }
    await audit('run'); await p.evaluate(()=>window.__game.A.runskip()); await p.waitForTimeout(500); await audit('report');
    await setS(SM,Object.assign(baseU(),{screen:'quiz'}),()=>{ const g=window.__game; g.U.qz={act:2,qs:quizFor(g.S,2,g.S.lastR),i:0,picked:null,ok:0}; g.render(); }); await audit('quiz');
    await setS(fin,{screen:'final',seen:{},actSeen:{}}); await audit('final');
    await p.evaluate(()=>window.__game.A.sheet()); await p.waitForTimeout(300); await audit('sheet'); await p.evaluate(()=>window.__game.A.sheetclose());
    await setS(fin,{screen:'final'},()=>{ window.__game.A.teacher(); }); await audit('teacher');
    if(errs.length) console.log(name,errs.join('\n'));
    await ctx.close();
  }
  const rows=Object.values(agg).sort((a,b)=>(a.x.k<b.x.k?-1:1)||b.n-a.n);
  const by={small:[],tight:[],font:[],overflow:[]}; rows.forEach(r=>by[r.x.k].push(r));
  console.log('\nМАЛЕНЬКИЕ ЦЕЛИ (<'+MIN+'px): '+by.small.length);
  by.small.forEach(r=>console.log('  ',(r.x.act+'').padEnd(16),(r.x.w+'×'+r.x.h).padEnd(9),r.x.range?'[ползунок] ':'',JSON.stringify(r.x.t),'  экранов:',[...r.screens].slice(0,5).join(',')));
  console.log('\nТЕСНО (<4px между целями): '+by.tight.length); if(verbose) by.tight.forEach(r=>console.log('  ',r.x.act,r.x.gap+'px',JSON.stringify(r.x.t),[...r.screens].slice(0,4).join(',')));
  else by.tight.slice(0,14).forEach(r=>console.log('  ',r.x.act,r.x.gap+'px',JSON.stringify(r.x.t).slice(0,70),[...r.screens].slice(0,3).join(',')));
  console.log('\nМЕЛКИЙ ШРИФТ (<12px): '+by.font.length); by.font.slice(0,20).forEach(r=>console.log('  ',r.x.px+'px',JSON.stringify(r.x.t),[...r.screens].slice(0,3).join(',')));
  console.log('\nПЕРЕПОЛНЕНИЕ: '+by.overflow.length); by.overflow.forEach(r=>console.log('  ',r.x.t,r.x.w,[...r.screens].join(',')));
  await b.close();
})();
