/* Фаззинг движка: случайные действия, проверка инвариантов (NaN, отрицательные значения, баланс капитала) */
var fs=require('fs'), vm=require('vm'), path=require('path');
var SRC=path.join(__dirname,'..','src');
['engine','content','events','ending'].forEach(function(f){ vm.runInThisContext(fs.readFileSync(path.join(SRC,f+'.js'),'utf8').replace("if(typeof module!=='undefined') module.exports = {};",'')); });
function mulberry(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function bad(x){ return typeof x!=='number' || !isFinite(x); }
var N=parseInt(process.argv[2]||'400',10), errors=0, maxDiff=0, worst=null;
function fail(msg, sd, m){ errors++; if(errors<15) console.log('FAIL seed',sd,'month',m,msg); }
for(var sd=1; sd<=N; sd++){
  var rng=mulberry(sd*104729), s=newState('f');
  for(var m=1;m<=TOTAL;m++){
    s.month=m;
    /* события: случайный вариант среди доступных */
    EVENTS[m-1].stages(s).forEach(function(st){
      var ok=[]; st.choices.forEach(function(c,i){ var cost=fn(c.cost,s)||0; if(cost<=s.cash && !(c.req&&c.req(s))) ok.push(i); });
      if(!ok.length) ok.push(st.choices.length-1);
      var c=st.choices[ok[Math.floor(rng()*ok.length)]];
      var chips=c.apply(s,rng); coverDeficit(s);
      if(!Array.isArray(chips)) fail('apply returned non-array',sd,m);
      chips.forEach(function(ch){ if(!ch||typeof ch.t!=='string'||/NaN|undefined|Infinity/.test(ch.t)) fail('bad chip '+JSON.stringify(ch),sd,m); });
      ['label','sub'].forEach(function(k){ var v=fn(c[k],s); if(typeof v!=='string'||/NaN|undefined|Infinity/.test(v)) fail('bad '+k+': '+v,sd,m); });
    });
    /* случайные покупки */
    if(rng()<0.5){ var types=['std','used','fast','big','ind']; buyPrinter(s,types[Math.floor(rng()*types.length)]); }
    if(rng()<0.2) hireStaff(s,'asst'); if(rng()<0.1) fireStaff(s,'asst'); if(rng()<0.15) s.channel.market=!s.channel.market;
    if(rng()<0.1) s.service=!s.service;
    if(rng()<0.1 && s.unlock.deposit){ var a=Math.min(Math.max(0,s.cash), 20000*rng()); s.cash-=a; s.savings+=a; }
    /* случайный план */
    var plan=s.plan; plan.mode=['draft','std','fine'][Math.floor(rng()*3)]; plan.ad=Math.floor(rng()*4);
    PROD_IDS.forEach(function(id){ var b=priceBounds(s,id,plan.mode); plan.price[id]=b.min+Math.floor(rng()*(b.max-b.min)/5)*5; plan.qty[id]=Math.floor(rng()*rng()*(isAvailable(s,id)?maxQtyFor(s,plan,id)*1.3:50)); });
    if(rng()<0.3) suggestPlan(s);
    var before=companyCapital(s), cashBefore=s.cash;
    /* оплата заранее не проверяется интерфейсом? проверим: интерфейс блокирует, если не хватает денег */
    var pv=previewMonth(s,plan,1);
    if(pv.cashNow>s.cash+1){ /* как в интерфейсе: уменьшаем выпуск */
      var g=0; while(previewMonth(s,plan,1).cashNow>s.cash && g++<400){ var any=false; PROD_IDS.forEach(function(id){ if(plan.qty[id]>lockQty(s,id)){ plan.qty[id]=Math.max(lockQty(s,id),plan.qty[id]-Math.max(1,Math.floor(plan.qty[id]*0.1))); any=true; } }); if(!any){ plan.ad=0; if(previewMonth(s,plan,1).cashNow>s.cash) break; } }
    }
    var r=runMonth(s,rng);
    if(r.cashNow>cashBefore+1 && r.overdraft===0 && s.cash>0){ }
    /* инварианты */
    var bag={cash:s.cash,savings:s.savings,fund:s.fund,loan:s.loanLeft,rep:s.rep,cap:ownerCapital(s),filKg:s.fil.kg,filVal:s.fil.val};
    for(var k in bag){ if(bad(bag[k])) fail('NaN in '+k,sd,m); }
    if(s.cash<-0.01) fail('negative cash '+s.cash,sd,m);
    if(s.savings<-0.01||s.fund<-0.01||s.loanLeft<-0.01) fail('negative asset/loan',sd,m);
    if(s.rep<0||s.rep>100) fail('rep range '+s.rep,sd,m);
    PROD_IDS.forEach(function(id){ if(bad(s.inv[id])||s.inv[id]<-1e-9||bad(s.invVal[id])||s.invVal[id]<-1e-6) fail('inventory '+id+' '+s.inv[id]+' '+s.invVal[id],sd,m); });
    if(r.hours>r.H+0.5) fail('hours over capacity '+r.hours+' > '+r.H,sd,m);
    ['revTot','cogs','profit','tax','fixed','depr','kg','buyCost'].forEach(function(k){ if(bad(r[k])) fail('NaN in report '+k,sd,m); });
    /* закон сохранения капитала: Δкапитала = прибыль + доход вклада + доход фонда + изменение (вклады овердрафта нейтральны) */
    var after=companyCapital(s);
    var expected = r.profit + r.depositGain + r.fundGain;
    var diff = (after-before) - expected;
    if(Math.abs(diff)>3){ fail('capital not conserved: diff '+Math.round(diff)+' (profit '+Math.round(r.profit)+', dep '+r.depositGain+', fund '+r.fundGain+')',sd,m); }
    if(Math.abs(diff)>maxDiff){ maxDiff=Math.abs(diff); worst={sd:sd,m:m}; }
  }
}
console.log('games',N,'errors',errors,'max capital diff',Math.round(maxDiff*100)/100,worst?JSON.stringify(worst):'');
