/* Проверка вёрстки на разных ширинах и темах: наложение текста, выход за экран, горизонтальная прокрутка.
   node tools/layout.js [ширины через запятую] */
const path=require('path'), fs=require('fs');
const PW=process.env.PW_PATH||'/opt/node-tools/node_modules/playwright'; const pw=require(PW), {chromium}=pw;
const CHECK=require('./check.js'); const B=require('./bots.js');
const FILE='file://'+path.join(__dirname,'..','index.html');
const widths=(process.argv[2]||'320,360,390,768,1024,1280').split(',').map(Number);
function clone(o){ return JSON.parse(JSON.stringify(o)); }
/* состояния для проверки */
const early=B.runTo(B.good({}),'L1',3), late=B.runTo(B.good({expand:true,lev:true,at:8,reserve:60000}),'L2',14);
function stateAt(base,m){ const s=clone(base.s); s.month=m; return s; }
function mkReport(base){ const s=clone(base.s), R=clone(base.R); const S2=clone(base.s); return {R:R,S:S2}; }
const cases=[];
const add=(name,S,U,opts)=>cases.push(Object.assign({name,S,U,wide:true},opts||{}));
add('title',null,{screen:'title'});
for(let i=0;i<4;i++) add('intro'+i,null,{screen:'intro',intro:i});
add('setup',null,{screen:'setup',setup:{name:'',cafe:'Первый столик',code:'',talent:'cook',diff:'norm'}});
[1,5,9,13].forEach(m=>add('act'+m,stateAt(early,m),{screen:'act',actSeen:{}}));
add('last',stateAt(late,16),{screen:'last',actSeen:{}});
for(let m=1;m<=16;m++){ add('scene'+m,stateAt(late,m),{screen:'scene',sc:{step:0,done:[]}},{wide:false}); }
for(const e of EVENTS_IDS()){ add('event-'+e,stateAt(late,10),{screen:'event',ev:{list:[e],i:0}},{wide:false}); }
function EVENTS_IDS(){ require('./load.js'); return EVENTS.map(e=>e.id); }
['home','menu','place','guests','money'].forEach(t=>{ add('plan-early-'+t,clone(early.s),{screen:'plan',tab:t,outlet:'o1'}); });
['home','menu','place','guests','money','net'].forEach(t=>{ add('plan-late-'+t,clone(late.s),{screen:'plan',tab:t,outlet:late.s.outlets[1]?late.s.outlets[1].id:'o1',city:'kazan'}); });
{ const r=mkReport(early); add('report-early',r.S,{screen:'report',report:r.R}); const r2=mkReport(late); add('report-late',r2.S,{screen:'report',report:r2.R,repOutlet:late.s.outlets[1]?late.s.outlets[1].id:null}); }
add('run',clone(early.s),{screen:'run',report:clone(early.R)});
add('quiz',clone(late.s),{screen:'quiz',qz:{act:2,qs:quizFor(late.s,2,late.R),i:0,picked:null,ok:0}});
{ const qs=quizFor(late.s,3,late.R); add('quiz-ans',clone(late.s),{screen:'quiz',qz:{act:3,qs:qs,i:0,picked:0,ok:0}}); add('quiz-end',clone(late.s),{screen:'quiz',qz:{act:3,qs:qs,i:3,picked:null,ok:2}}); }
add('fifo',clone(early.s),{screen:'fifo',mg:{type:'fifo',round:1,wrong:1,right:3,items:[{n:'Молоко',g:'glass',c:'cold',d:3,taken:false},{n:'Мясо',g:'plate',c:'main',d:1,taken:false},{n:'Зелень',g:'salad',c:'salad',d:6,taken:true},{n:'Рыба',g:'fish',c:'main',d:2,taken:false},{n:'Яйца',g:'egg',c:'brek',d:8,taken:false},{n:'Творог',g:'bowl',c:'brek',d:4,taken:false}]},evGame:{t:'x'}});
add('change',clone(early.s),{screen:'change',mg:{type:'change',round:1,wrong:0,right:1,picked:1,q:{total:387,paid:500,ans:113,opts:[113,123,63]}}});
add('rush',clone(early.s),{screen:'rush',rush:{t0:Date.now(),dur:24000,q:[{id:1,st:'coffee',at:Date.now(),life:6000},{id:2,st:'soup',at:Date.now(),life:6000}],served:2,miss:0,wrong:0,nid:3,next:Date.now()+5000,done:false}},{wide:false});
add('lessonEnd',stateAt(late,9),{screen:'lessonEnd'});
add('finale',stateAt(late,16),{screen:'finale'});
add('final',clone(late.s),{screen:'final'});
add('teacher',null,{screen:'teacher',teacherText:'Аня | кафе «А» | талант Кулинар | Обычно | код 8Б | месяц 16 из 16 | капитал 2400000 ₽ | города 4 | рейтинг 4,1 | цель достигнута | Золотая вилка | переигрываний 1 | викторина 6 | награды 12\nБоря | кафе «Б» | талант Делец | Трудно | месяц 10 из 16 | капитал 900000 ₽ | города 2 | рейтинг 3,8 | цель не достигнута | Без награды | переигрываний 0 | викторина 3 | награды 5'},{wide:false});
const modals=['menu','help','glossary','awards','recipes','showcode','loadcode'];
modals.forEach(a=>add('modal-'+a,clone(late.s),{screen:'plan',tab:'home',modal:a}));
const only=process.argv[3]; 
(async()=>{
  let bad=0;
  await Promise.all(widths.map(async W=>{
    const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
    const themes=(W===360||W===1280)?['light','dark']:['light'];
    for(const th of themes){
      const ctx=await b.newContext({viewport:{width:W,height:W<600?760:800},isMobile:W<900,hasTouch:W<900,deviceScaleFactor:1,colorScheme:th}); const p=await ctx.newPage();
      const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
      await p.goto(FILE); await p.waitForTimeout(250);
      for(const c of cases){
        if(only && c.name.indexOf(only)<0) continue;
        if(!c.wide && !(W===320||W===1280)) continue;
        await p.evaluate(({S,U,modal})=>{ const g=window.__game; g.setState(S,U); if(modal) g.A[modal]({getAttribute:()=>''},{}); },{S:c.S,U:c.U,modal:c.U.modal});
        await p.waitForTimeout(60);
        await p.evaluate(()=>window.scrollTo(0,0));
        const res=await p.evaluate(CHECK);
        const ov=await p.evaluate(()=>{ const VW=Math.min(innerWidth,(screen&&screen.width)||innerWidth); const off=[]; document.querySelectorAll('#app *,#modal *,#actionbar *,#tabbar *').forEach(e=>{ if(e.closest('svg,.outsel,.tabbar,.tblwrap,#fx,[hidden]')&&e.tagName!=='BUTTON') return; if(e.closest('.outsel,.tabbar,.tblwrap')) return; const r=e.getBoundingClientRect(); if(r.width>2&&(r.right>VW+2||r.left<-2)) off.push(e.tagName+'.'+String(e.className&&e.className.baseVal!==undefined?e.className.baseVal:e.className).split(' ')[0]); }); const docW=document.documentElement.scrollWidth; return {off:off.slice(0,4),docW:docW,VW:VW}; });
        const lines=res.concat(ov.off.length?['вне экрана: '+ov.off.join(', ')]:[]).concat(ov.docW>ov.VW+2?['горизонтальная прокрутка: '+ov.docW+' > '+ov.VW]:[]);
        if(lines.length){ bad++; console.log(`W${W} ${th} ${c.name}: ${lines.join(' | ')}`); }
      }
      if(errs.length){ bad++; console.log(`W${W} ${th} ОШИБКИ: ${errs.slice(0,3).join(' | ')}`); }
      await ctx.close();
    }
    await b.close();
  }));
  console.log(bad?('Найдено проблем: '+bad):'Вёрстка в порядке'); process.exit(bad?1:0);
})();
