/* Проверка лаборатории, склада пластика и мини-игры «Слайсер» */
require('./load.js');
var bad=0; function ok(c,m){ console.log((c?'ok   ':'FAIL ')+m); if(!c) bad++; }
function mk(month){ var s=newState('Т',{seed:'лаб'}); applySetup(s,{shop:'Т',talent:'eng'}); s.month=month||4; s.cash=100000; return s; }
/* исследования */
var s=mk(4), h0=printerHours(s), c0=s.cash;
var r=startResearch(s,'slicer'); ok(r.ok && s.cash===c0-RESEARCH_BY_ID.slicer.cost && labOf(s).active.length===1,'исследование начинается и стоит денег');
ok(!canResearch(s,'nozzle').ok,'вторую можно начать только при свободном слоте');
var rr=runMonth(s); ok(printerHours(s)>h0 && labOf(s).done.slicer && rr.labDone.length===1,'после срока эффект применён: часов '+h0+' → '+printerHours(s));
ok(!canResearch(s,'slicer').ok,'уже изученное повторно не начать');
s=mk(15); ok(!canResearch(s,'farm').ok,'не успевающее закончиться исследование недоступно');
var g=mk(8); g.space='garage'; startResearch(g,'slicer'); ok(canResearch(g,'nozzle').ok,'в гараже два слота');
/* склад пластика */
s=mk(3); var kg0=s.fil.kg, cash=s.cash, pr=filPrice(s,'std'); var b=buyFil(s,10,'std'); ok(b.ok && Math.abs(s.fil.kg-kg0-10)<1e-9 && Math.abs(s.cash-(cash-10*pr))<1e-6,'закупка списывает деньги и добавляет пластик');
ok(filPrice(s,'opt')<filPrice(s,'std') && filPrice(s,'eco')>filPrice(s,'std'),'поставщики: дешёвый, обычный, дорогой');
ok(!canBuyFil(s,1000,'std').ok,'лимит склада '+FIL_MAX+' кг соблюдается');
s=mk(3); s.fil.kg=25; s.fil.val=25*1400; var rw=runMonth(s); ok(rw.wet===true && s.mods.some(function(m){ return m.label==='Отсыревший пластик'; }),'запас больше '+FIL_WET+' кг отсыревает');
s=mk(3); for(var i=0;i<6;i++){ s.month=3+i; runMonth(s); } ok(s.filHist.length>=7 && s.filHist.every(isFinite),'история цен пластика ведётся');
/* склад изделий */
s=mk(4); s.inv.key=50; s.invVal.key=50*100; var cc=s.cash, lq=liquidate(s,'key'); ok(lq.ok && s.inv.key===0 && Math.abs(s.cash-cc-5000*LIQ_RATE)<1e-6,'распродажа остатков отдаёт '+Math.round(LIQ_RATE*100)+'% стоимости');
ok(!liquidate(s,'key').ok,'пустой склад распродать нельзя');
/* слайсер */
s=mk(5); var tg=slicerTarget(s), tg2=slicerTarget(s); ok(JSON.stringify(tg)===JSON.stringify(tg2),'цель настройки детерминирована');
ok(slicerGrade(slicerCheck(tg,tg))==='gold','точные настройки дают золото');
var off={t:tg.t+40,v:tg.v+40,f:tg.f+30}; ok(slicerGrade(slicerCheck(tg,off))==='bronze','всё мимо — бронза');
var one={t:tg.t,v:tg.v,f:tg.f+30}; ok(slicerGrade(slicerCheck(tg,one))==='silver','два из трёх — серебро');
ok(slicerCheck(tg,off).every(function(x){ return slicerWord(x).length>10; }),'у каждого отклонения есть пояснение');
var sc=mk(5); sc.contracts.push({oid:'q',kind:'premium',fine:true,prod:'key',qty:10,price:200,penalty:.3,repLoss:3,repGain:1,label:'q'}); ok(slicerNeeded(sc) && !slicerNeeded(mk(5)),'слайсер нужен только для премиум и срочных заказов');
var rep0=sc.rep; slicerApply(sc,'gold'); ok(sc.rep===rep0+1 && sc.mods.some(function(m){ return m.k==='fail' && m.m<0; }),'золото: брак ниже, репутация +1');
var sb=mk(5); slicerApply(sb,'bronze'); ok(sb.mods.some(function(m){ return m.k==='fail' && m.m>0; }),'бронза: брак выше');
var cov={}; for(var sd=1;sd<=200;sd++){ var t=slicerTarget(newState('x',{seed:'s'+sd})); ['t','v','f'].forEach(function(k){ var R=SLICER_RANGE[k]; if(t[k]<R.min||t[k]>R.max) bad++; }); cov[t.t]=1; }
ok(Object.keys(cov).length>=6,'цели слайсера разнообразны и внутри диапазона');
console.log(bad?('ПРОВАЛОВ: '+bad):'Лаборатория и склад: всё в порядке'); process.exit(bad?1:0);
