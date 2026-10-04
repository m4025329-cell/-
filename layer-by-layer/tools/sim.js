/* Симулятор баланса «Слоя за слоем»: эксперт, средний игрок, пассивный и неудачный */
require('./load.js');
(function(){ var e=process.env; 
  if(e.DS) PROD_IDS.forEach(function(id){ PRODUCTS[id].dmax*=parseFloat(e.DS); });
  if(e.KADD) PROD_IDS.forEach(function(id){ PRODUCTS[id].k+=parseFloat(e.KADD); });
  if(e.STORE) global.STORAGE_RATE=parseFloat(e.STORE);
  if(e.PMULT) Object.keys(PRINTERS).forEach(function(k){ PRINTERS[k].price=Math.round(PRINTERS[k].price*parseFloat(e.PMULT)); });
  if(e.HMULT) Object.keys(PRINTERS).forEach(function(k){ PRINTERS[k].hours=Math.round(PRINTERS[k].hours*parseFloat(e.HMULT)); });
  if(e.FILM) global.FIL_BASE=parseFloat(e.FILM);
  if(e.RUN) global.RUN_COST=parseFloat(e.RUN);
  /* TALP="des.dem=1.03,sel.ad=1.2" переопределяет числа талантов */
  if(e.TALP) e.TALP.split(',').forEach(function(kv){ var p=kv.split('='), a=p[0].split('.'); TALENTS[a[0]][a[1]]=parseFloat(p[1]); });
})();
function mulberry(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function clone(s){ return JSON.parse(JSON.stringify(s)); }

/* ---- эксперт: цены и количества по методу множителя Лагранжа ---- */
function expertPlan(s, mode, adIdx){
  var plan=s.plan; plan.mode=mode; plan.ad=adIdx;
  var H=printerHours(s), ids=PROD_IDS.filter(function(id){ return isAvailable(s,id); });
  var disc=modProd(s,'disc'), tabs={};
  ids.forEach(function(id){
    var c=unitCostEst(s,id,mode), h=hoursPerUnit(s,id,mode), b=priceBounds(s,id,mode), arr=[];
    for(var p=b.min;p<=b.max;p+=10){ var d=demandAt(s,id,p,plan,1); arr.push({p:p,q:Math.max(0,Math.round(d)-s.inv[id])}); }
    tabs[id]={c:c,h:h,arr:arr,lock:lockQty(s,id)};
  });
  function solve(lambda){
    var tot=0, res={};
    ids.forEach(function(id){
      var T=tabs[id], best=null;
      for(var i=0;i<T.arr.length;i++){ var e=T.arr[i], val=(e.p*disc-T.c-lambda*T.h)*e.q; if(!best||val>best.val) best={p:e.p,q:e.q,val:val}; }
      var q = best.val>0 ? best.q : 0; q=Math.max(q,T.lock);
      res[id]={p:best.p,q:q}; tot+=q*T.h;
    });
    return {tot:tot,res:res};
  }
  var lo=0, hi=3000, sol=solve(0);
  if(sol.tot>H){ for(var i=0;i<26;i++){ var mid=(lo+hi)/2; sol=solve(mid); if(sol.tot>H) lo=mid; else hi=mid; } sol=solve(hi); }
  PROD_IDS.forEach(function(id){ if(sol.res[id]){ plan.price[id]=sol.res[id].p; plan.qty[id]=sol.res[id].q; } else { plan.qty[id]=0; plan.price[id]=refPrice(s,id); } });
  var guard=0; while(guard++<200){ var pv=previewMonth(s,plan,1); if(pv.cashNow<=s.cash) break; var worst=null; ids.forEach(function(id){ if(plan.qty[id]>lockQty(s,id) && (!worst || plan.qty[worst]*PRODUCTS[worst].g < plan.qty[id]*PRODUCTS[id].g)) worst=id; }); if(!worst) break; plan.qty[worst]=Math.max(lockQty(s,worst), plan.qty[worst]-Math.max(1,Math.round(plan.qty[worst]*0.1))); }
  return plan;
}
function bestExpert(s, quick){
  var best=null, modes=quick?['std']:['std','fine','draft'], ads=quick?[0,2]:[0,1,2,3];
  modes.forEach(function(m){
    ads.forEach(function(a){
      if(ADS[a].cost>s.cash*0.5) return;
      var c=clone(s); expertPlan(c,m,a); var pv=previewMonth(c,c.plan,1); var val=pv.profit;
      if(!best||val>best.val) best={m:m,a:a,val:val};
    });
  });
  if(!best) best={m:'std',a:0,val:0};
  expertPlan(s,best.m,best.a); return best;
}

/* ---- покупки: сравниваем прибыль следующего месяца с покупкой и без ---- */
function profitNext(s){ var c=clone(s); bestExpert(c,true); return previewMonth(c,c.plan,1).profit; }
function tryInvest(s, opts){
  var remain=TOTAL-s.month+1; if(remain<=1) return;
  if(s.space!=='garage' && s.space!=='school' && s.printers.length>=SPACES[s.space].limit && s.cash>50000 && remain>5){ moveSpace(s,'garage'); }
  var base=profitNext(s), acts=[];
  ['std','fast','big','ind'].forEach(function(t){ acts.push({k:'p:'+t, cost:PRINTERS[t].price, ok:function(c){ return canBuyPrinter(c,t).ok; }, do:function(c){ buyPrinter(c,t); }}); });
  ['asst','teen'].forEach(function(k){ acts.push({k:'h:'+k, cost:0, ongoing:STAFF[k].salary*s.infl, ok:function(c){ return !c.staff[k]; }, do:function(c){ c.staff[k]=1; }}); });
  acts.push({k:'market', cost:0, ok:function(c){ return !c.channel.market && c.month>=6; }, do:function(c){ c.channel.market=true; }});
  acts.push({k:'site', cost:15000, ok:function(c){ return !c.channel.site && c.month>=6; }, do:function(c){ c.cash-=15000; c.channel.site=true; }});
  acts.push({k:'service', cost:0, ok:function(c){ return !c.service; }, do:function(c){ c.service=true; }});
  if(!process.env.NOTEAM) SPEC_IDS.forEach(function(id){ acts.push({k:'t:'+id, cost:SPECS[id].hire, ok:function(c){ return canHire(c,id).ok; }, do:function(c){ hireSpec(c,id); }}); });
  if(!process.env.NOLAB) RESEARCH.forEach(function(r){ acts.push({k:'r:'+r.id, cost:r.cost, delay:r.months, ok:function(c){ return canResearch(c,r.id).ok; }, do:function(c){ if(c.__eval){ c.cash-=r.cost; r.apply(c); } else startResearch(c,r.id); }}); });
  var again=true, guard=0;
  while(again && guard++<6){
    again=false; var bestAct=null;
    acts.forEach(function(a){
      if(!a.ok(s) || (a.cost>s.cash-(opts.reserve||15000))) return;
      var c=clone(s); c.__eval=true; a.do(c); var np=profitNext(c); var gain=(np-base)*Math.min(remain-1-(a.delay||0),10)*0.8-(a.cost*0.75);
      if(gain>(opts.minGain||5000) && (!bestAct||gain>bestAct.gain)) bestAct={a:a,gain:gain,np:np};
    });
    if(bestAct){ bestAct.a.do(s); base=bestAct.np; again=true; s._buys=(s._buys||[]); s._buys.push(s.month+':'+bestAct.a.k); }
  }
}

/* ---- выбор в сюжетных сценах ---- */
function pickChoice(s, stage, prefs, idx, rng){
  var cs=choicesOf(s,stage), want=prefs[idx], order=[want]; cs.forEach(function(_,i){ if(i!==want) order.push(i); });
  /* TALCH=pick: всегда брать «талантливый» вариант; TALCH=avoid: никогда его не брать */
  var tc=process.env.TALCH, only=process.env.TALONLY, tIdx=-1; cs.forEach(function(c,i){ if(c.talent) tIdx=i; });
  if(tIdx>=0 && only){ if(cs[tIdx].tid===only){ var c1=cs[tIdx], c1o=fn(c1.cost,s)||0; if(c1o<=s.cash && !(c1.req&&c1.req(s))) return tIdx; } else { order=order.filter(function(i){ return i!==tIdx; }); if(!order.length) order=[0]; } }
  else if(tIdx>=0 && tc==='pick'){ var c0=cs[tIdx], co=fn(c0.cost,s)||0; if(co<=s.cash && !(c0.req&&c0.req(s))) return tIdx; }
  else if(tIdx>=0 && tc==='avoid'){ order=order.filter(function(i){ return i!==tIdx; }); if(!order.length) order=[0]; }
  for(var k=0;k<order.length;k++){ var c=cs[order[k]]; if(!c) continue; var cost=fn(c.cost,s)||0; var rq=c.req?c.req(s):''; if(cost<=s.cash && !rq) return order[k]; }
  return cs.length-1;
}
function playEvents(s, prefs, rng, ctr, force){
  var stages=stagesOf(s);
  stages.forEach(function(st,si){
    var i = (force && st.mini && st.miniId===force.id) ? Math.min(force.option, choicesOf(s,st).length-1) : pickChoice(s,st,prefs,ctr.i,rng);
    if(!(st.mini)){ (s.__picked=s.__picked||[]).push(i); ctr.i++; } choicesOf(s,st)[i].apply(s,rngFor(s,'ev'+s.month+':'+si)); coverDeficit(s);
  });
}
/* ---- заказы: эксперт берёт то, что улучшает прогноз прибыли; средний игрок берёт почти всё; пассивный не берёт ---- */
function playOrders(s, kind, opts){
  var offers=s.board.offers.filter(function(o){ return o.state==='open'; });
  if(kind==='passive' || kind==='bad2') return;
  offers.forEach(function(o){
    if(o.kind==='trap' && kind!=='bad') return;
    if(!orderCheck(s,o).ok) return;
    if(kind==='expert' || kind==='human'){
      var base=clone(s); bestExpert(base,true); var p0=previewMonth(base,base.plan,1).profit;
      var c=clone(s); if(!acceptOffer(c,o.id).ok) return; bestExpert(c,true); var p1=previewMonth(c,c.plan,1).profit;
      if(p1>p0+(kind==='human'?800:200)) acceptOffer(s,o.id);
    } else acceptOffer(s,o.id);
  });
}
/* ---- политики ---- */
var CHOICES = {
  best:   [1,0,1,0, 0,0,0, 0,0, 0, 0,0, 0, 0, 0,0, 0, 0,0, 0,0],
  safe:   [0,1,1,2, 1,0,0, 3,2, 1, 3,1, 2, 1, 1,2, 1, 1,1, 2],
  random: null
};
/* порядок стадий: 1,2,3,4,5,6a,6b,7a,7b,8,9,10,11,12,13,14,15a,15b,16 -> 19 значений */
var POL = {
  best:   [1,0,1,0, 0, 0,2, 0,0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  best2:  [1,0,1,1, 0, 0,0, 2,0, 0, 1, 1, 2, 0, 0, 0, 0, 0, 0],
  cheap:  [0,2,2,2, 2, 2,2, 3,2, 2, 3, 3, 1, 1, 2, 2, 1, 1, 2],
  mid:    [1,1,0,1, 1, 1,0, 1,1, 1, 3, 1, 0, 1, 1, 1, 1, 1, 0]
};

function runGame(kind, pol, seed, verbose, opts){
  opts=opts||{};
  var rng=mulberry(seed), s=newState('bot',{seed:'sim'+seed}), ctr={i:0}, rows=[];
  applySetup(s,{shop:'Бот', talent:('talent' in opts)?opts.talent:(process.env.TALENT||null), diff:opts.diff||process.env.DIFF||'norm', code:''});
  for(var m=1;m<=TOTAL;m++){
    s.month=m; refreshUnlocks(s); var prefs = pol==='random' ? null : POL[pol];
    if(prefs===null){ prefs=[]; for(var q=0;q<19;q++) prefs.push(Math.floor(rng()*3)); }
    if(opts.force && m===opts.force.month){ s.mini=s.mini||{}; s.mini[m]=opts.force.id; s.miniSeen=s.miniSeen||[]; s.miniSeen.push(opts.force.id); }
    else if(opts.noMini){ s.mini=s.mini||{}; s.mini[m]=''; }
    playEvents(s, prefs, rng, ctr, opts.force && m===opts.force.month ? opts.force : null);
    if(!opts.noOrders){ makeBoard(s); goalsFor(s); playOrders(s, kind, opts); }
    if(kind==='expert'){ tryInvest(s,{}); bestExpert(s); }
    else if(kind==='human'){ tryInvest(s,{minGain:15000}); bestExpert(s,true); 
      PROD_IDS.forEach(function(id){ if(!isAvailable(s,id)) return; var pf=1+(rng()-0.5)*0.30, qf=1+(rng()-0.5)*0.40; s.plan.price[id]=Math.max(priceBounds(s,id,s.plan.mode).min, Math.round(s.plan.price[id]*pf/5)*5); s.plan.qty[id]=Math.max(lockQty(s,id), Math.round(s.plan.qty[id]*qf)); });
      var sp=sanitizePlan(s,s.plan); s.plan.qty=sp.qty; }
    else if(kind==='avg'){ 
      if(m%2===1 && s.cash>60000 && canBuyPrinter(s,'std').ok && m<12) buyPrinter(s,'std');
      if(m===8 && s.cash>40000 && !s.staff.asst) s.staff.asst=1;
      if(m===7 && s.unlocked.part && !s.channel.market) s.channel.market=true;
      suggestPlan(s); }
    else if(kind==='passive'){ suggestPlan(s); }
    else if(kind==='bad2'){ suggestPlan(s); PROD_IDS.forEach(function(id){ if(isAvailable(s,id)){ s.plan.price[id]=Math.max(priceBounds(s,id,s.plan.mode).min, Math.round(refPrice(s,id)*0.7/5)*5); } }); var each=printerHours(s)/Math.max(1,PROD_IDS.filter(function(id){return isAvailable(s,id);}).length); PROD_IDS.forEach(function(id){ if(isAvailable(s,id)) s.plan.qty[id]=Math.floor(each/hoursPerUnit(s,id,s.plan.mode)); }); }
    else if(kind==='bad'){ suggestPlan(s); PROD_IDS.forEach(function(id){ if(isAvailable(s,id)){ s.plan.price[id]=Math.round(refPrice(s,id)*1.5/5)*5; s.plan.qty[id]=maxQtyFor(s,s.plan,id); } }); }
    /* вклад лишних денег (эксперт) */
    if(kind==='expert' && s.unlock.deposit && s.cash>150000){ var a=Math.round((s.cash-120000)/1000)*1000; s.cash-=a; s.savings+=a; }
    var r=runMonth(s); if(!opts.noOrders) settleGoals(s,r);
    rows.push([m,Math.round(r.hours)+'/'+r.H,Math.round(r.revTot),Math.round(r.profit),ownerCapital(s)].join(' '));
  }
  if(verbose){ console.log(rows.join('\n')); console.log('buys',(s._buys||[]).join(', ')); console.log('flags',JSON.stringify(s.flags),'printers',s.printers.map(function(p){return p.t;}).join(','),'staff',JSON.stringify(s.staff)); }
  return {cap:ownerCapital(s), s:s};
}
module.exports={runGame:runGame, POL:POL, bestExpert:bestExpert, expertPlan:expertPlan, clone:clone, profitNext:profitNext};
if(require.main===module){
  var args=process.argv.slice(2);
  if(args[0]==='v'){ var r=runGame(args[1]||'expert', args[2]||'best', 3, true); console.log('FINAL',r.cap); }
  else {
    var combos=[['expert','best'],['expert','mid'],['expert','cheap'],['human','best'],['human','mid'],['avg','best'],['avg','mid'],['passive','mid'],['passive','cheap'],['bad','mid'],['bad2','mid']];
    combos.forEach(function(c){ var out=[]; for(var sd=1;sd<=5;sd++){ out.push(runGame(c[0],c[1],sd).cap); } console.log((c[0]+'/'+c[1]).padEnd(16), out.map(function(x){return Math.round(x/1000)+'k';}).join(' ')); });
  }
}
