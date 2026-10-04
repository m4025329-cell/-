/* Проверка режимов игры, конкурентов и переговоров */
require('./load.js');
var bad=0; function ok(c,m){ console.log((c?'ok   ':'FAIL ')+m); if(!c) bad++; }
function mk(scn,seed){ var s=newState('Т',{seed:seed||'реж'}); applySetup(s,{shop:'Т',talent:'eng',scn:scn}); return s; }
/* режимы */
SCENARIO_IDS.forEach(function(id){ var s=mk(id); ok(s.scenario===id && s.goal===SCENARIOS[id].goal && GOAL===s.goal,'режим «'+SCENARIOS[id].name+'»: цель '+GOAL); });
var cr=mk('crisis'); ok(cr.loanLeft===40000 && cr.cash===12000,'«Кризис»: долг и мало денег');
var rc=mk('rich'); ok(rc.printers.length===3 && rc.space==='cowork','«Быстрый старт»: три принтера в коворкинге');
var cf=mk('craft'); cf.plan.mode='draft'; ok(sanitizePlan(cf,cf.plan).mode==='std','«Ремесленник»: режим «Быстро» запрещён');
var cf2=mk('craft'); cf2.month=3; cf2.unlocked.mini=true; var b1=makeBoard(cf2), st=mk('story'); st.month=3; st.unlocked.mini=true; var b2=makeBoard(st);
ok(b1.offers[0] && b2.offers[0] && b1.offers.length>0,'«Ремесленник»: доска заказов строится');
var sb=mk('sandbox'); sb.month=4; var stg=stagesOf(sb); ok(stg.length>=1 && stg[0].tag==='Рабочий месяц','«Песочница»: вместо сюжетной сцены рабочий месяц');
var cnt=0; for(var m=2;m<=15;m++){ var t=mk('sandbox','пес'+m); t.month=m; if(stagesOf(t).length>1) cnt++; } ok(cnt>=8,'«Песочница»: случаи выпадают почти каждый месяц ('+cnt+' из 14)');
/* звания и вехи считаются относительно цели */
setGoal({goal:600000}); ok(tierOf(600000)===0 && tierOf(450000)===1,'звание «Магнат» при достижении цели режима'); setGoal({goal:1000000}); ok(tierOf(1000000)===0 && tierOf(500000)===2,'для сюжета шкала прежняя');
mk('story');
/* все режимы проходятся без ошибок */
SCENARIO_IDS.forEach(function(id){ var s=mk(id,'прох'+id), err=0; for(var m=1;m<=TOTAL;m++){ s.month=m; refreshUnlocks(s); try{ stagesOf(s).forEach(function(g,i){ choicesOf(s,g)[0].apply(s,rngFor(s,'ev'+m+':'+i)); coverDeficit(s); }); makeBoard(s); suggestPlan(s); runMonth(s); }catch(e){ err++; console.log(e.message); } } ok(err===0 && isFinite(ownerCapital(s)),'режим «'+SCENARIOS[id].name+'» проходится до конца: капитал '+ownerCapital(s)); });
mk('story');
/* конкуренты */
var s=mk('story'); s.month=6; s.unlocked.mini=true; var cp=compPrice(s,'key'); ok(cp>0 && Math.abs(cp-refPrice(s,'key'))<=refPrice(s,'key')*0.05,'цена конкурента близка к рыночной в начале');
var d1=demandAt(s,'key',refPrice(s,'key'),s.plan,1); s.comp.max=0.8; var d2=demandAt(s,'key',refPrice(s,'key'),s.plan,1); s.comp.max=1.2; var d3=demandAt(s,'key',refPrice(s,'key'),s.plan,1);
ok(d2<d1 && d3>d1,'если конкурент дешевле, спрос ниже, если дороже — выше');
ok(compFactor(s,'key',5)<=1.18+1e-9 && compFactor(s,'key',100000)>=0.82-1e-9,'влияние конкурента ограничено');
var h=mk('story'); for(var i=1;i<=16;i++){ h.month=i; runMonth(h); } ok(h.compHist.length===16 && h.comp.max>=0.78 && h.comp.max<=1.22,'цены конкурентов гуляют в разумных пределах');
/* переговоры */
var n=mk('story','нег'); n.month=7; n.unlocked.mini=true; n.unlocked.part=true; n.printers=[{t:'old',age:1},{t:'std',age:1},{t:'std',age:1}];
var o=makeBoard(n).offers.filter(negAvailable)[0]; ok(!!o,'на доске есть заказ для переговоров');
if(o){ ok(negStart(n,o.id)!==null && !negAvailable(o),'переговоры начинаются один раз'); var last; for(var r=0;r<3;r++){ var th=negThemes(n,o,r); ok(th.length===3,'раунд '+(r+1)+': три довода'); last=negPick(n,o.id,th[0]); } ok(last.done && (o.state==='gone' || o.price>0),'после трёх раундов есть итог ('+(last.res)+')'); }
var liked=mk('story','нег2'); liked.month=7; liked.unlocked.mini=true; liked.unlocked.part=true; liked.printers=[{t:'old',age:1},{t:'std',age:1},{t:'std',age:1}];
var lo=makeBoard(liked).offers.filter(negAvailable)[0]; if(lo){ var base=lo.price; negStart(liked,lo.id); var cl=CLIENTS[lo.client]; for(var q=0;q<3;q++){ negPick(liked,lo.id,cl.likes[0]); } ok(lo.price>=base,'любимые доводы клиента поднимают или сохраняют цену ('+base+' → '+lo.price+')'); }
var dis=mk('story','нег3'); dis.month=7; dis.unlocked.mini=true; dis.unlocked.part=true; dis.printers=[{t:'old',age:1},{t:'std',age:1},{t:'std',age:1}];
var dof=makeBoard(dis).offers.filter(negAvailable)[0]; if(dof){ negStart(dis,dof.id); var dd=CLIENTS[dof.client].dislikes[0]; for(var z=0;z<3;z++) negPick(dis,dof.id,dd); ok(dof.state==='gone','нелюбимые доводы три раза подряд: клиент уходит'); }
console.log(bad?('ПРОВАЛОВ: '+bad):'Режимы, конкуренты, переговоры: всё в порядке'); process.exit(bad?1:0);
