/* Проверка заказов: доска детерминирована, принятие/торг/отказ, режим «Тонко», ловушка, доверие, цели месяца */
require('./load.js');
var bad=0; function ok(c,m){ console.log((c?'ok   ':'FAIL ')+m); if(!c) bad++; }
function mk(seed, month){ var s=newState('Т',{seed:seed}); applySetup(s,{shop:'Т',talent:'sel'}); s.month=month||2; s.unlocked.mini=true; s.unlocked.part=true; s.cash=100000; s.printers=[{t:'old',age:99},{t:'std',age:3}]; return s; }

/* 1. детерминизм доски */
var a=mk('кл1',5), b=mk('кл1',5), c=mk('кл2',5);
ok(JSON.stringify(makeBoard(a).offers)===JSON.stringify(makeBoard(b).offers),'один код класса даёт одну доску');
ok(JSON.stringify(makeBoard(a).offers)!==JSON.stringify(makeBoard(c).offers),'разные коды дают разные доски');
/* 2. структура всех досок по 400 кодам и 16 месяцам */
var cnt=0, kinds={}, clients={}, traps=0, nonfinite=0;
for(var sd=1; sd<=200; sd++){ var s=mk('т'+sd,1); for(var m=1;m<=TOTAL;m++){ s.month=m; s.unlocked.part=m>=5; var bd=makeBoard(s);
  bd.offers.forEach(function(o){ cnt++; kinds[o.kind]=(kinds[o.kind]||0)+1; clients[o.client]=1; if(o.kind==='trap') traps++;
    if(!isFinite(o.price)||!isFinite(o.qty)||o.price<=0||o.qty<=0||!o.text||/\{n\}|NaN|undefined/.test(o.text)) nonfinite++; }); }
}
ok(nonfinite===0,'все предложения корректны ('+cnt+' шт.)');
ok(Object.keys(kinds).length===6,'встречаются все виды заказов: '+JSON.stringify(kinds));
ok(Object.keys(clients).length===CLIENT_IDS.length,'встречаются все клиенты ('+Object.keys(clients).length+')');
/* 3. принятие, передумать, лимит часов */
var s=mk('а1',2), bd=makeBoard(s), o=bd.offers[0];
var r=acceptOffer(s,o.id); ok(r.ok && s.contracts.length===1 && o.state==='taken','заказ принимается и становится договором');
ok(lockQty(s,o.prod)>=0 && s.plan.qty[o.prod]>=lockQty(s,o.prod),'в плане минимум выпуска учтён');
ok(dropOffer(s,o.id) && s.contracts.length===0 && o.state==='open','можно передумать');
var big=JSON.parse(JSON.stringify(o)); big.id='big'; big.qty=100000; ok(!orderCheck(s,big).ok,'заказ, не влезающий в часы, нельзя принять');
/* 4. торг: исходы и один раз */
var wins=0, holds=0, gone=0;
for(sd=1; sd<=300; sd++){ var t=mk('торг'+sd,3); var of=makeBoard(t).offers.filter(function(x){ return x.kind!=='charity'; })[0]; if(!of) continue; var h=haggleOffer(t,of.id,0.2);
  if(h.res==='win') wins++; else if(h.res==='hold') holds++; else gone++; if(haggleOffer(t,of.id,0.05)) { bad++; console.log('FAIL повторный торг'); } }
ok(wins>0&&holds>0&&gone>0,'торг даёт все исходы: победа '+wins+', держит цену '+holds+', ушёл '+gone);
var w5=0, g5=0; for(sd=1; sd<=300; sd++){ var t2=mk('торг'+sd,3); var of2=makeBoard(t2).offers.filter(function(x){ return x.kind!=='charity'; })[0]; if(!of2) continue; var h2=haggleOffer(t2,of2.id,0.05); if(h2.res==='win') w5++; if(h2.res==='gone') g5++; }
ok(w5>wins && g5<gone,'+5% безопаснее, чем +20% (успехов '+w5+' против '+wins+', уходов '+g5+' против '+gone+')');
/* 5. «Тонко»: заказ премиум без режима срывается, с режимом выполняется */
function pr(mode){ var t=mk('пр',4); t.unlocked.mini=true; t.contracts=[{oid:'x',client:'club',kind:'premium',prod:'mini',qty:5,price:900,penalty:0.35,repLoss:5,repGain:3,fine:true,claim:0,claimRep:0,label:'тест'}];
  t.plan.mode=mode; PROD_IDS.forEach(function(id){ t.plan.qty[id]=0; }); t.plan.qty.mini=5; t.cash=80000; return runMonth(t); }
var rf=pr('fine'), rs=pr('std');
ok(rf.orders[0].miss===0 && !rf.orders[0].fineFail,'премиум в режиме «Тонко» выполнен');
ok(rs.orders[0].fineFail && rs.orders[0].pen>0 && rs.orders[0].rev===0,'премиум без «Тонко» сорван, штраф '+Math.round(rs.orders[0].pen));
/* 6. ловушка */
var t=mk('л',5); t.contracts=[{oid:'t',client:'fan',kind:'trap',prod:'mini',qty:5,price:900,penalty:0.3,repLoss:6,repGain:0,fine:false,claim:0.8,claimRep:9,label:'ловушка'}];
PROD_IDS.forEach(function(id){ t.plan.qty[id]=0; }); t.plan.qty.mini=5; var rep0=t.rep, rt=runMonth(t);
ok(rt.orders[0].claim>0 && t.rep<rep0 && /правообладател/.test(rt.orders[0].reply),'ловушка: компенсация правообладателю и потеря репутации');
var td=mk('л2',5), tob={id:'zz',client:'fan',kind:'trap',prod:'mini',qty:5,price:900,base:900,pen:.3,repLoss:6,repGain:0,fine:false,claim:.8,claimRep:9,text:'x',state:'open',tried:false};
td.board={month:5,offers:[tob]}; var rp0=td.rep, dr=declineOffer(td,'zz'); ok(dr.lesson && td.rep===rp0+1,'отказ от ловушки: репутация +1 и урок');
/* 7. доверие */
var t7=mk('д',3); var oo=makeBoard(t7).offers.filter(function(x){ return x.kind==='regular'||x.kind==='bulk'; })[0]; if(oo){ acceptOffer(t7,oo.id); suggestPlan(t7); var r7=runMonth(t7); var cl=t7.clients[oo.client]; ok(cl && cl.trust===1 && cl.done===1,'выполненный заказ даёт сердце'); }
/* 8. цели месяца */
var t8=mk('ц',3); var gs=goalsFor(t8); ok(gs.list.length===3,'на месяц три цели'); suggestPlan(t8); var r8=runMonth(t8); var gr=settleGoals(t8,r8); ok(gr.list.length===3 && isFinite(gr.reward),'цели оцениваются, награда '+gr.reward+'+'+gr.bonus);
var m1=mk('ц1',1); makeBoard(m1); var g1=goalsFor(m1); ok(g1.list.length===2,'в первом месяце две цели');
/* 9. тексты клиентов */
var txt=0; CLIENT_IDS.forEach(function(id){ var cl=CLIENTS[id]; Object.keys(cl.say).forEach(function(k){ cl.say[k].forEach(function(x){ if(!KINDS[k] || x.indexOf('{n}')<0) txt++; }); }); if(!cl.ok.length||!cl.bad.length) txt++; cl.kinds.forEach(function(k){ if(!cl.say[k]) txt++; }); });
ok(txt===0,'у каждого клиента есть тексты на все его виды заказов');
console.log(bad?('ПРОВАЛОВ: '+bad):'Заказы: всё в порядке'); process.exit(bad?1:0);
