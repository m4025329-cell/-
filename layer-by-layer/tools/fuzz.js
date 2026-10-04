/* Фаззинг движка: случайные действия, проверка инвариантов (NaN, отрицательные значения, баланс капитала) */
require('./load.js');
function mulberry(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function bad(x){ return typeof x!=='number' || !isFinite(x); }
var N=parseInt(process.argv[2]||'400',10), errors=0, maxDiff=0, worst=null;
function fail(msg, sd, m){ errors++; if(errors<15) console.log('FAIL seed',sd,'month',m,msg); }
for(var sd=1; sd<=N; sd++){
  var rng=mulberry(sd*104729), s=newState('f',{seed:'fz'+sd});
  applySetup(s,{shop:'Ф', talent:[null,'eng','des','sel'][sd%4], diff:['easy','norm','hard'][sd%3], code:''});
  for(var m=1;m<=TOTAL;m++){
    s.month=m; refreshUnlocks(s);
    /* события: случайный вариант среди доступных */
    stagesOf(s).forEach(function(st,si){
      var cs=choicesOf(s,st), ok=[]; cs.forEach(function(c,i){ var cost=fn(c.cost,s)||0; if(cost<=s.cash && !(c.req&&c.req(s))) ok.push(i); });
      if(!ok.length) ok.push(cs.length-1);
      var c=cs[ok[Math.floor(rng()*ok.length)]];
      var chips=c.apply(s,rngFor(s,'ev'+m+':'+si)); coverDeficit(s);
      if(!Array.isArray(chips)) fail('apply returned non-array',sd,m);
      chips.forEach(function(ch){ if(!ch||typeof ch.t!=='string'||/NaN|undefined|Infinity/.test(ch.t)) fail('bad chip '+JSON.stringify(ch),sd,m); });
      ['label','sub'].forEach(function(k){ var v=fn(c[k],s); if(typeof v!=='string'||/NaN|undefined|Infinity/.test(v)) fail('bad '+k+': '+v,sd,m); });
    });
    /* случайные покупки */
    if(rng()<0.5){ var types=['std','used','fast','big','ind','diy']; buyPrinter(s,types[Math.floor(rng()*types.length)]); }
    if(rng()<0.2) hireStaff(s,'asst'); if(rng()<0.1) fireStaff(s,'asst'); if(rng()<0.15) s.channel.market=!s.channel.market;
    if(rng()<0.1) s.service=!s.service;
    if(rng()<0.1 && s.unlock.deposit){ var a=Math.min(Math.max(0,s.cash), 20000*rng()); s.cash-=a; s.savings+=a; }
    /* заказы: случайно принимаем, торгуемся, отказываемся, передумываем */
    var bd=makeBoard(s); goalsFor(s);
    bd.offers.forEach(function(o){
      var x=rng();
      if(x<0.15){ declineOffer(s,o.id); }
      else if(x<0.3){ var h=haggleOffer(s,o.id,HAGGLE[Math.floor(rng()*3)].pct); if(h && bad(h.price||0)) fail('haggle NaN',sd,m); if(o.state==='open' && rng()<0.7) acceptOffer(s,o.id); }
      else if(x<0.75){ var ar=acceptOffer(s,o.id); if(ar.ok && rng()<0.2) dropOffer(s,o.id); }
      var e=orderEcon(s,o); ['hours','profit','perHour','total'].forEach(function(k){ if(bad(e[k])) fail('orderEcon NaN '+k,sd,m); });
    });
    if(rng()<0.25){ hireSpec(s,SPEC_IDS[Math.floor(rng()*SPEC_IDS.length)]); } if(rng()<0.1){ fireSpec(s,SPEC_IDS[Math.floor(rng()*SPEC_IDS.length)]); }
    if(rng()<0.35){ var qa=questsAvailable(s); if(qa.length) takeQuest(s,qa[Math.floor(rng()*qa.length)].id); }
    /* лаборатория и склад */
    if(rng()<0.3){ var rid=RESEARCH[Math.floor(rng()*RESEARCH.length)].id; startResearch(s,rid); }
    if(rng()<0.3){ var sup=['opt','std','eco'][Math.floor(rng()*3)]; buyFil(s,[5,10,20][Math.floor(rng()*3)],sup); }
    if(rng()<0.1){ liquidate(s,PROD_IDS[Math.floor(rng()*PROD_IDS.length)]); }
    /* случайный план */
    var plan=s.plan; plan.mode=['draft','std','fine'][Math.floor(rng()*3)]; plan.ad=Math.floor(rng()*4); if(!modeFits(s,plan.mode)) plan.mode='std'; if(s.contracts.some(function(c){ return c.fine; })) plan.mode='fine';
    PROD_IDS.forEach(function(id){ var b=priceBounds(s,id,plan.mode); plan.price[id]=b.min+Math.floor(rng()*(b.max-b.min)/5)*5; plan.qty[id]=Math.floor(rng()*rng()*(isAvailable(s,id)?maxQtyFor(s,plan,id)*1.3:50)); });
    if(rng()<0.3) suggestPlan(s);
    var before=companyCapital(s), cashBefore=s.cash;
    /* оплата заранее не проверяется интерфейсом? проверим: интерфейс блокирует, если не хватает денег */
    var pv=previewMonth(s,plan,1);
    if(pv.cashNow>s.cash+1){ /* как в интерфейсе: уменьшаем выпуск */
      var g=0; while(previewMonth(s,plan,1).cashNow>s.cash && g++<400){ var any=false; PROD_IDS.forEach(function(id){ if(plan.qty[id]>lockQty(s,id)){ plan.qty[id]=Math.max(lockQty(s,id),plan.qty[id]-Math.max(1,Math.floor(plan.qty[id]*0.1))); any=true; } }); if(!any){ plan.ad=0; if(previewMonth(s,plan,1).cashNow>s.cash) break; } }
    }
    var r=runMonth(s);
    if(r.cashNow>cashBefore+1 && r.overdraft===0 && s.cash>0){ }
    /* инварианты */
    var bag={cash:s.cash,savings:s.savings,fund:s.fund,loan:s.loanLeft,rep:s.rep,cap:ownerCapital(s),filKg:s.fil.kg,filVal:s.fil.val};
    for(var k in bag){ if(bad(bag[k])) fail('NaN in '+k,sd,m); }
    if(s.cash<-0.01) fail('negative cash '+s.cash,sd,m);
    if(s.savings<-0.01||s.fund<-0.01||s.loanLeft<-0.01) fail('negative asset/loan',sd,m);
    if(s.rep<0||s.rep>100) fail('rep range '+s.rep,sd,m);
    PROD_IDS.forEach(function(id){ if(bad(s.inv[id])||s.inv[id]<-1e-9||bad(s.invVal[id])||s.invVal[id]<-1e-6) fail('inventory '+id+' '+s.inv[id]+' '+s.invVal[id],sd,m); });
    (r.orders||[]).forEach(function(o){ ['rev','pen','done','miss'].forEach(function(k){ if(bad(o[k])) fail('order NaN '+k,sd,m); }); });
    if(r.hours>r.H+0.5) fail('hours over capacity '+r.hours+' > '+r.H,sd,m);
    ['revTot','cogs','profit','tax','fixed','depr','kg','buyCost'].forEach(function(k){ if(bad(r[k])) fail('NaN in report '+k,sd,m); });
    /* закон сохранения капитала: Δкапитала = прибыль + доход вклада + доход фонда + изменение (вклады овердрафта нейтральны) */
    var after=companyCapital(s);
    var expected = r.profit + r.depositGain + r.fundGain;
    var diff = (after-before) - expected;
    if(Math.abs(diff)>5){ fail('capital not conserved: diff '+Math.round(diff)+' (profit '+Math.round(r.profit)+', dep '+r.depositGain+', fund '+r.fundGain+')',sd,m); }
    var qr=questTick(s,r); if(bad(r.questCash)) fail('quest NaN',sd,m);
    var gr=settleGoals(s,r); if(bad(gr.reward)||bad(gr.bonus)) fail('goals NaN',sd,m);
    if(Math.abs(diff)>maxDiff){ maxDiff=Math.abs(diff); worst={sd:sd,m:m}; }
  }
}
console.log('games',N,'errors',errors,'max capital diff',Math.round(maxDiff*100)/100,worst?JSON.stringify(worst):'');
