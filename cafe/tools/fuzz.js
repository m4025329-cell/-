/* Фаззинг движка: случайные (в том числе неверные) действия 16 месяцев подряд; проверяем, что нет исключений, NaN и выхода за границы. */
const B=require('./bots.js');
function rng(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function finite(o,path,bad){ if(typeof o==='number'){ if(!isFinite(o)) bad.push(path); } else if(o&&typeof o==='object'){ for(const k in o){ if(k==='lastR') continue; finite(o[k],path+'.'+k,bad); } } }
let problems=0;
const N=+(process.argv[2]||250);
for(let seed=1;seed<=N;seed++){
  const R=rng(seed*977), diffs=['easy','norm','hard'], s=newState({name:'Ф',seed:'f'+seed,diff:diffs[seed%3],talent:['cook','biz','host'][seed%3]});
  const ids=()=>s.outlets[Math.floor(R()*s.outlets.length)].id, pick=a=>a[Math.floor(R()*a.length)];
  let last=null;
  try{
    for(let m=1;m<=TOTAL;m++){
      s.month=m; if(m>=9) s.flags.expand=1; if(m>=2) s.flags.arsenMet=1; s.flags.sonyaMet=m>=5; s.flags.damirMet=m>=9;
      for(let k=0;k<25;k++){
        const a=Math.floor(R()*29), o=ids();
        switch(a){
          case 0: A_menu(s,pick(DISHES).id); break; case 1: A_price(s,pick(DISHES).id,R()*1500-100); break; case 2: A_lab(s,pick(DISHES).id); break;
          case 3: A_hire(s,o,pick(['cook','wait','bar','cln'])); break; case 4: A_fire(s,o,pick(['cook','wait','bar','cln'])); break;
          case 5: A_train(s,o,pick(['cook','wait','bar','cln'])); break; case 6: A_set(s,o,'hrs',Math.floor(R()*3)); A_set(s,o,'pay',Math.floor(R()*3)); break;
          case 7: A_set(s,o,'stock',1+Math.floor(R()*6)); A_set(s,o,'sup',pick(Object.keys(SUPPLIERS))); break;
          case 8: A_mk(s,o,pick(MKT).id); break; case 9: A_eq(s,o,pick(EQ).id); break; case 10: A_mgr(s,o); break;
          case 11: A_spec(s,pick(SPEC_IDS),o); break; case 12: A_hq(s,pick(HQUP).id); break;
          case 13: A_borrow(s,R()*600000); break; case 14: A_repay(s,R()*500000); break; case 15: A_invest(s); break;
          case 16: A_open(s,pick(CITY_IDS),pick(['cafe','rest']),'Т'); break; case 17: A_franchise(s,pick(CITY_IDS)); break;
          case 18: if(s.outlets.length>1&&R()<0.3) A_close(s,o); break; case 19: A_tax(s,pick(['6','15'])); A_here(s,o); break;
          case 20: { const b=makeBoard(s); if(b.offers.length){ const of=pick(b.offers); pick([A_accept,A_haggle,A_decline,A_unaccept])(s,of.id); } break; }
          case 22: A_dep(s,R()*400000); break; case 23: A_undep(s,R()*300000); break; case 24: A_insure(s); break; case 25: A_forward(s); break; case 26: A_hol(s,o); break; case 27: A_special(s,o,pick(DISHES).id); break; case 28: goalsFor(s); break;
          case 21: { const sc=SCENE_BY_M[m]; if(sc&&sc.ch.length&&R()<0.5){ sc.ch.forEach(q=>{ const op=pick(q.opts); const out=op.chk?(R()<0.5?op.chk(s).ok:op.chk(s).bad):op; applyFx(s,out.fx); }); } break; }
        }
      }
      const evs=pickEvents(s); evs.forEach(id=>{ const e=EVENT_BY_ID[id]; if(!e.opts.length) return; const op=pick(e.opts); if(op.game) return; const out=op.chk?(R()<0.5?op.chk(s).ok:op.chk(s).bad):op; applyFx(s,out.fx); });
      stepNews(s);
      const R1=simMonth(s,{preview:true}); const Rr=simMonth(s,{}); last=Rr; applyMonth(s,Rr); checkAch(s,Rr);
      monthInsights(s,Rr); quizFor(s,Math.min(4,1+Math.floor((m-1)/4)),Rr); forkScore(s); verdict(s); resultLine(s);
      const bad=[]; finite(s,'s',bad); finite(Rr,'R',bad); if(bad.length){ problems++; console.log('seed',seed,'month',m,'NaN/∞:',bad.slice(0,4).join(', ')); break; }
      s.outlets.forEach(o=>{ if(o.rep<0||o.rep>100||o.awr<0||o.awr>1||o.mor<0||o.mor>100||o.loy<0||o.loy>1){ problems++; console.log('seed',seed,'month',m,'вне границ',o.id,o.rep,o.awr,o.mor,o.loy); } });
      if(s.cash<-1e-6){ problems++; console.log('seed',seed,'отрицательная касса',s.cash); }
    }
    const ex=JSON.parse(JSON.stringify(s)); ensureState(ex);
  }catch(e){ problems++; console.log('seed',seed,'ИСКЛЮЧЕНИЕ',e.stack.split('\n').slice(0,3).join(' | ')); }
}
console.log(problems?('Проблем: '+problems):'Фаззинг: '+N+' партий без проблем'); process.exit(problems?1:0);
