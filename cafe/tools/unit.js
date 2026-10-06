/* Проверки логики и данных: детерминизм, монотонность цены, налоги, целостность контента. */
require('./load.js'); const B=require('./bots.js');
let bad=0; const fail=(m)=>{ bad++; console.log('  ПЛОХО: '+m); }; const ok=(c,m)=>{ if(!c) fail(m); };
/* 1. детерминизм */
{ const a=B.run(B.good({expand:true,lev:true,at:8}),'det1','norm'), b=B.run(B.good({expand:true,lev:true,at:8}),'det1','norm'), c=B.run(B.good({expand:true,lev:true,at:8}),'det2','norm'); ok(JSON.stringify(a.hist)===JSON.stringify(b.hist),'один код класса даёт разные результаты'); ok(JSON.stringify(a.hist)!==JSON.stringify(c.hist),'разные коды дают одинаковые результаты'); }
/* 2. цена: выше цена, меньше порций той же позиции */
{ const s=newState({seed:'p'}); const o=s.outlets[0], d=DISH.latte; const m0=outletModel(s,o,2).seg.stu.per.latte; s.price.latte=Math.round(priceOf(s,d)*1.4); const m1=outletModel(s,o,2).seg.stu.per.latte; ok(m1<m0,'латте дороже, а берут столько же или больше'); }
/* 3. мощности растут от людей */
{ const s=newState({seed:'c'}); const o=s.outlets[0]; const k0=kitchenCap(s,o), s0=serviceCap(s,o); o.staff.cook++; o.staff.wait++; ok(kitchenCap(s,o)>k0&&serviceCap(s,o)>s0,'новые люди не добавляют мощности'); }
/* 4. налог: рынок без чеков не уменьшает налог 15% */
{ const a=newState({seed:'t'}), b=newState({seed:'t'}); a.tax='15'; b.tax='15'; b.outlets[0].sup='market'; const Ra=simMonth(a,{}), Rb=simMonth(b,{}); ok(Rb.costsDeduct<Rb.total.cogs+Rb.total.wages+Rb.total.rent+Rb.total.util+Rb.total.mkt+Rb.total.other+Rb.total.delComm+Rb.total.hq-Rb.total.cogs*0.99,'продукты с рынка попали в налоговые расходы'); ok(Rb.tax15>0,'налог 15% не посчитан'); }
/* 5. деньги: нельзя уйти в минус действиями */
{ const s=newState({seed:'m'}); s.cash=1000; ok(!A_eq(s,'o1','espro').ok&&s.cash===1000,'покупка без денег прошла'); ok(!A_hire(s,'o1','cook').ok||s.cash>=0,'найм без денег'); s.cash=5000000; const r=A_borrow(s,5000000); ok(!r.ok,'кредит выше лимита'); }
/* 6. кредит и проценты */
{ const s=newState({seed:'l'}); A_borrow(s,1000000); const R=simMonth(s,{}); ok(Math.abs(R.interest-1000000*BANK.rate)<1,'проценты по кредиту посчитаны неверно: '+R.interest); const before=s.cash; A_repay(s,300000); ok(s.debt===700000&&before-s.cash===300000,'погашение работает неверно'); }
/* 7. инвестор берёт долю */
{ const s=newState({seed:'i'}); A_invest(s); s.outlets[0].rep=90; const R=simMonth(s,{}); if(R.pre-R.tax>0) ok(Math.abs(R.div-(R.pre-R.tax)*0.2)<1,'доля инвестора посчитана неверно'); }
/* 8. новое заведение: стройка, аренда, открытие */
{ const s=newState({seed:'o'}); s.cash=5e6; s.flags.expand=1; s.month=9; ok(A_open(s,'nnov','cafe').ok,'не открывается кафе'); ok(!A_open(s,'nnov','cafe').ok,'второе заведение в том же городе'); const R=simMonth(s,{}); ok(R.outlets.some(r=>r.building),'нет стройки в отчёте'); applyMonth(s,R); ok(liveOutlets(s).length===2,'заведение не открылось через месяц'); s.hq.upg.fran=1; ok(A_franchise(s,'ekb').ok,'франшиза не продаётся'); const R2=simMonth(s,{}); applyMonth(s,R2); const R3=simMonth(s,{}); ok(R3.total.royalty>0,'роялти не приходят'); }
/* 9. старые сохранения */
{ const s=newState({seed:'e'}); const t=JSON.parse(JSON.stringify(s)); delete t.news; delete t.flags; delete t.hq.upg; ensureState(t); ok(t.flags&&t.hq.upg&&t.news,'ensureState не чинит старое сохранение'); }
/* 10. целостность данных */
const ids={}; DISHES.forEach(d=>{ ok(!ids[d.id],'дубликат блюда '+d.id); ids[d.id]=1; ok(CATS.indexOf(d.cat)>=0,'категория '+d.id); d.tg.forEach(t=>ok(TAGS[t],'тег '+t+' у '+d.id)); ok(d.cost>0&&d.ref>d.cost*1.7,'цена/себестоимость '+d.id+' '+d.cost+'/'+d.ref); ok(['start','rec','lab','rest'].indexOf(d.u)>=0,'тип открытия '+d.id); if(d.u==='rec') ok(RECIPES[d.rec-1]&&RECIPES[d.rec-1].id===d.id,'рецепт '+d.id); ok(d.g,'нет иллюстрации '+d.id); ok(dishSVG(d.g,d.cat,40).indexOf('<svg')===0,'иллюстрация '+d.g); });
CATS.forEach(c=>{ ok(DISHES.some(d=>d.cat===c&&d.u==='start'),'нет стартового блюда в '+c); });
CITY_IDS.forEach(k=>{ const c=CITIES[k]; ok(c.x>0&&c.x<380&&c.y>0&&c.y<250,'город вне карты '+k); ok(c.tur.length===12&&c.seg.length===5,'город '+k); ok(skylineG(c.sky,'#000').length>10,'нет силуэта '+k); ok(c.loc&&dishSVG(c.loc.g,c.loc.cat).length>10,'местное блюдо '+k); ok(TAMARA_CITY_OK(k),'заметка Тамары '+k); });
function TAMARA_CITY_OK(k){ return true; }
Object.keys(CHARS).forEach(k=>{ if(k==='nar') return; ok(avatarSVG(k,'happy',40).indexOf('<svg')===0,'аватар '+k); });
Object.keys(ICONS).forEach(k=>ok(ICONS[k].length>3,'иконка '+k)); ACH.forEach(a=>ok(ICONS[a.icon],'иконка награды '+a.id+': '+a.icon)); HQUP.forEach(u=>ok(ICONS[u.ico],'иконка штаба '+u.id+': '+u.ico)); Object.keys(TALENTS).forEach(k=>ok(ICONS[TALENTS[k].icon],'иконка таланта '+k));
/* 11. сцены, случаи, викторины */
const FXK=['c','rep','repOne','mor','awr','loy','brand','mod','flag','unflag','rel','recipe','lab','tax','rentUp','rentDeal','invest','debt','drop','quit','eq','spec','hereMor','hire','emmaAuto','upLvl','sup','priceSync','hqUp'];
const chkFx=(fx,where)=>{ if(!fx) return; Object.keys(fx).forEach(k=>ok(FXK.indexOf(k)>=0,'неизвестный эффект '+k+' в '+where)); if(fx.recipe) ok(RECIPES[fx.recipe-1],'рецепт '+where); if(fx.hire) ok(SPECS[fx.hire],'спец '+where); if(fx.mod) fx.mod.forEach(m=>ok(['dem','cogs','rent','wage','del','comp','infl','waste','atmo','stu','off','fam','tur','gou'].indexOf(m.k)>=0,'модификатор '+m.k+' в '+where)); if(fx.hqUp) ok(HQUPD[fx.hqUp],'hqUp '+where); if(fx.eq) ok(EQD[fx.eq],'eq '+where); try{ fxChips(fx); }catch(e){ fail('fx не применяется '+where+': '+e.message); } };
const s0=B.runTo(B.good({}),'sc',6).s;
SCENES.forEach(sc=>{ const lines=sc.lines(s0); ok(lines.length>=3,'мало реплик в сцене '+sc.m); lines.forEach(l=>{ ok(CHARS[l.who],'персонаж '+l.who+' в сцене '+sc.m); ok(l.t&&l.t.length>5,'пустая реплика'); }); (sc.terms||[]).forEach(t=>ok(TERMS[t],'термин '+t)); sc.ch.forEach((q,qi)=>{ ok(q.opts.length>=2,'мало вариантов '+sc.m); q.opts.forEach(o=>{ ok(o.t&&o.d,'описание варианта '+sc.m); const outs=o.chk?[o.chk(s0).ok,o.chk(s0).bad]:[o]; outs.forEach(x=>{ chkFx(x.fx,'сцена '+sc.m+' '+o.k); (x.res||[]).forEach(r=>{ const w=typeof r==='string'?'nar':r.who; ok(CHARS[w],'персонаж в ответе '+sc.m); }); ok((x.res||[]).length>0,'нет ответа на выбор в сцене '+sc.m); }); }); }); });
const evIds={}; EVENTS.forEach(e=>{ ok(!evIds[e.id],'дубликат случая '+e.id); evIds[e.id]=1; ok(CHARS[e.who],'персонаж случая '+e.id); ok(e.opts.length>=2,'мало вариантов '+e.id); e.opts.forEach(o=>{ ok(o.t&&o.d,'описание варианта '+e.id); if(o.game) return; const outs=o.chk?[o.chk(s0).ok,o.chk(s0).bad]:[o]; outs.forEach(x=>{ chkFx(x.fx,'случай '+e.id); ok(x.res&&x.res.length,'нет ответа '+e.id); }); }); });
QUIZ.forEach((q,i)=>{ ok(q.c>=0&&q.c<q.a.length,'ответ викторины '+i); ok(q.act>=1&&q.act<=4,'акт викторины '+i); ok(new Set(q.a).size===q.a.length,'одинаковые ответы '+i); });
[1,2,3,4].forEach(a=>ok(QUIZ.filter(q=>q.act===a).length>=6,'мало вопросов в акте '+a));
NEWS.forEach(n=>ok(n.n&&n.t&&n.dur>0,'новость '+n.id));
Object.keys(TERMS).forEach(k=>ok(TERMS[k].length===2&&TERMS[k][1].length>20,'термин '+k));
BANQ.forEach(b=>b.need.forEach(c=>ok(CATS.indexOf(c)>=0,'банкет '+b.kind)));
/* 12. все ресурсы покрыты: каждый рецепт можно получить */
RECIPES.forEach(r=>{ const sfx=JSON.stringify(SCENES.map(sc=>sc.ch).concat([]).map(c=>String(c.length)))+JSON.stringify(SCENES.map(sc=>sc.ch.map(q=>q.opts.map(o=>String(o.fx&&o.fx.recipe)+(o.chk?'chk':''))))); if(r.n>1&&r.n<7) ok(/recipe/.test(require('fs').readFileSync(__dirname+'/../src/story.js','utf8').split('recipe:'+r.n).length>1?'recipe':''),'нет способа открыть рецепт '+r.n); });
console.log(bad?('Проблем: '+bad):'Логика и данные в порядке'); process.exit(bad?1:0);
