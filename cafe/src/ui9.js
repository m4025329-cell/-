/* ===== Интерфейс, часть 9: итоги месяца как история: герой, звёзды, главный совет, подробности по желанию ===== */

var REP_SAY={
  big:['Мяу! Касса звенит. Так держать!','Отличная смена: гости довольны, касса полна.','Вот это месяц! Борщ одобряет.'],
  plus:['В плюсе! А можно ещё лучше: смотри совет.','Месяц закрыт с прибылью. Идём дальше!','Неплохо: деньги растут.'],
  first:['Первый месяц всегда разгон. Минус бывает у всех, главное понять причину.','О нас ещё мало кто знает. Смотри совет ниже и поправим.'],
  minus:['Минус. Давай найдём, куда утекают деньги.','Месяц в убыток: проверим расходы и цены.','Так нельзя долго. Но есть что подкрутить!'],
  broke:['Касса опустела. Нужен план спасения: экономия, цены или кредит.']
};
function repPick(a,R){ return a[(hashStr((S.seed||'x')+'|rep'+R.m))%a.length]; }
function repMood(R){ return R.profit<0?'angry':(R.profit>R.revTotal*0.12?'happy':'neutral'); }
function repSay(R){
  var m=R.profit/Math.max(1,R.revTotal);
  if(S.emergStep>0) return repPick(REP_SAY.broke,R);
  if(R.profit<0) return repPick(R.m<=2?REP_SAY.first:REP_SAY.minus,R);
  if(m>0.14) return repPick(REP_SAY.big,R);
  return repPick(REP_SAY.plus,R);
}
function repStars(R){
  var live=R.outlets.filter(function(r){ return !r.building&&r.dims; }), dR=0, avgR=0; live.forEach(function(r){ dR+=(r.rating-(r.ratingOld||r.rating)); avgR+=r.rating; }); if(live.length){ dR/=live.length; avgR/=live.length; }
  var goals=R.goals||[], goalOk=goals.some(function(g){ return g.ok; }), maxU=0; live.forEach(function(r){ maxU=Math.max(maxU,r.utilK||0); });
  var list=[{ok:R.profit>0,t:'В плюсе'},{ok:dR>=0.02||avgR>=4.3,t:'Рейтинг растёт'},{ok:goals.length?goalOk:maxU<=1.0,t:goals.length?'Задание выполнено':'Без очередей'}];
  return {n:list.filter(function(x){ return x.ok; }).length,list:list};
}
function insightGo(x){
  var m={foodcost:{tab:'menu'},prime:{tab:'place'},rent:{tab:'guests'},capacity:{tab:'place'},waste:{tab:'place'},stock:{tab:'place'},loyalty:{tab:'guests'},pricing:{tab:'menu'},simple:{tab:'money',sub:'month'},menueng:{tab:'menu'},loan:{tab:'money',sub:'bank'},commission:{tab:'guests'},cashflow:{tab:'money',sub:'acc'},netprofit:{tab:'money',sub:'ana'},keyrate:{tab:'money',sub:'cty'},safety:{tab:'money',sub:'ana'},inflation:{tab:'menu'},rating:{tab:'place'}};
  return (x&&x.term&&m[x.term])||{tab:'place'};
}
var TABN={home:'Главная',menu:'Меню',place:'Кухня',guests:'Гости',money:'Деньги',net:'Сеть'};
function accHead(id,title,sub,open){
  return '<button class="acc-h" data-act="accord" data-id="'+id+'" aria-expanded="'+open+'"><span><b>'+title+'</b>'+(sub?'<small>'+sub+'</small>':'')+'</span>'+ico(open?'up':'down','sm')+'</button>';
}
function accBlock(id,title,sub,body){ var open=!!(U.acc&&U.acc[id]); return '<section class="acc'+(open?' open':'')+'">'+accHead(id,title,sub,open)+(open?'<div class="acc-b">'+body+'</div>':'')+'</section>'; }
A.accord=function(el){ var id=el.getAttribute('data-id'); U.acc=U.acc||{}; U.acc[id]=!U.acc[id]; render(true); };

function reportHTML(){
  var R=U.report; if(!R) return ''; var prevH=S.hist.length>=2?S.hist[S.hist.length-2]:null, r=reportOutlet(), t=R.total, st=repStars(R), ins=monthInsights(S,R), h='';
  ins.forEach(function(x){ if(x.term) addTerm(x.term); });
  var main=ins.filter(function(x){ return x.k==='warn'; })[0]||ins.filter(function(x){ return x.k==='info'; })[0]||ins[0], go=main?insightGo(main):null;
  if(main){ S.adv={m:R.m,t:main.h,d:main.t,tab:go.tab,sub:go.sub||null}; }
  var lost=0; R.outlets.forEach(function(x){ if(x.m) lost+=x.m.cap||0; });
  var topDish=null; R.outlets.forEach(function(x){ (x.mix||[]).forEach(function(m){ if(!topDish||m.qty>topDish.qty) topDish=m; }); });
  var multi=R.outlets.length>1, last=R.m>=TOTAL;
  /* герой */
  h+='<article class="rep-hero"><div class="rep-top"><span class="chip brand">'+ico('flag','sm')+' '+MONTHS[R.m-1]+' · месяц '+R.m+' из '+TOTAL+'</span><span class="rep-st" role="img" aria-label="Звёзд за месяц: '+st.n+' из 3">'+[1,2,3].map(function(i){ return '<svg class="rst'+(i<=st.n?' on':'')+'" viewBox="0 0 24 24"><path d="'+ICONS.star+'"/></svg>'; }).join('')+'</span></div>'+
   '<div class="rep-say">'+avatarSVG('borsch',repMood(R),58)+'<div class="bubble">'+esc(repSay(R))+'</div></div>'+
   '<div class="rep-big"><small>Прибыль за месяц</small><b class="num '+(R.profit>=0?'gain-t':'loss-t')+'" id="rp-prof">'+sgn(R.profit)+'</b>'+(prevH?'<span class="rep-d">'+(dlt(R.profit,prevH.profit)||'как в прошлом месяце')+'</span>':'')+'</div>'+
   '<div class="rep-tiles"><div><small>Выручка, ₽</small><b class="num">'+rubk(R.revTotal).replace(/ ₽$/,'')+'</b>'+(prevH?dlt(R.revTotal,prevH.rev):'')+'</div><div><small>Гостей в день</small><b class="num">'+Math.round(R.guests/30)+'</b>'+(prevH?dlt(R.guests,prevH.guests):'')+'</div><div class="'+(lost>R.guests*0.06?'bad':'')+'"><small>Не обслужили</small><b class="num">'+Math.round(lost)+'</b><i>за месяц</i></div></div>'+
   '<div class="rep-stl">'+st.list.map(function(x){ return '<span class="'+(x.ok?'ok':'')+'">'+ico(x.ok?'check':'x','sm')+x.t+'</span>'; }).join('')+'</div>'+
   '<p class="rep-cash">В кассе <b class="num">'+rub(S.cash)+'</b> · рейтинг '+f1d(R.rating)+(topDish&&topDish.qty>0?' · хит месяца: <b>'+esc(topDish.name)+'</b>':'')+'</p></article>';
  /* важное: награды, потери, долг */
  var ev=[]; if(U.newAch&&U.newAch.length){
    if(U.newAch.length===1){ var a1=U.newAch[0]; ev.push('<div class="award on"><span class="fico">'+ico(a1.icon)+'</span><div><b>Новая награда: '+esc(a1.n)+'</b><small>'+esc(a1.d)+'</small></div></div>'); }
    else ev.push('<div class="award on"><span class="fico">'+ico('award')+'</span><div><b>Новые награды: '+U.newAch.length+'</b><small>Все собраны в «Наградах» (меню)</small><div class="awards-line">'+U.newAch.map(function(a){ return '<span>'+ico(a.icon,'sm')+esc(a.n)+'</span>'; }).join('')+'</div></div></div>');
  }
  (R.quits||[]).forEach(function(q){ ev.push('<div class="insight warn"><span class="ico">'+ico('warn')+'</span><div><b>Ушёл сотрудник</b><p>Из-за низкого настроения команды ушёл человек: '+ROLES[q.role].n.toLowerCase()+' в «'+esc(CITIES[outletById(S,q.o)?outletById(S,q.o).city:'tula'].n)+'». Подумайте о зарплате и нагрузке.</p></div></div>'); });
  if(S.emergStep) ev.push('<div class="insight warn"><span class="ico">'+ico('bank')+'</span><div><b>Касса опустела</b><p>Не хватило '+rub(S.emergStep)+', это стало экстренным долгом под 3,5% в месяц. Погасите его, как только появятся деньги.</p></div></div>');
  if(R.goals&&R.goals.some(function(x){ return x.ok; })){ var gs=R.goals.filter(function(x){ return x.ok; }); ev.push('<div class="insight good"><span class="ico">'+ico('target')+'</span><div><b>Задание выполнено: +'+rub(sumArr(gs.map(function(x){ return QUEST_BY_ID[x.id].rew; })))+'</b><p>'+gs.map(function(x){ return esc(QUEST_BY_ID[x.id].n); }).join(', ')+'</p></div></div>'); }
  if(ev.length) h+='<div class="rep-ev">'+ev.join('')+'</div>';
  /* главный совет */
  if(main){ h+='<section class="advice"><div class="advice-h">'+avatarSVG('arsen','neutral',44)+'<div><small>Совет на следующий месяц</small><b>'+esc(main.h)+'</b></div></div><p>'+esc(main.t)+'</p><div class="chips">'+(main.term?termChip(main.term):'')+'<span class="chip brand">'+ico('pin','sm')+' разобрать во вкладке «'+TABN[go.tab]+'»</span></div></section>'; }
  var more=ins.filter(function(x){ return x!==main; });
  if(more.length) h+=accBlock('tips','Ещё советы ('+more.length+')','',more.map(function(x){ return '<div class="insight '+x.k+'"><span class="ico">'+ico(x.k==='good'?'check':(x.k==='warn'?'warn':'info'))+'</span><div><b>'+esc(x.h)+'</b><p>'+esc(x.t)+'</p>'+(x.term?termChip(x.term):'')+'</div></div>'; }).join(''));
  /* отзывы */
  var revs=[]; R.outlets.forEach(function(x){ (x.reviews||[]).forEach(function(rv){ revs.push(rv); }); }); revs=revs.slice(0,3);
  if(revs.length) h+='<section class="card"><h3>'+ico('chat')+'Что говорят гости</h3>'+revs.map(function(rv){ return '<div class="review">'+starsSVG(rv.st,14)+'<div><div class="who">Гость</div><p>'+esc(rv.t)+'</p></div></div>'; }).join('')+'</section>';
  /* подробности */
  if(multi) h+='<div class="outsel" role="group" aria-label="Заведение в отчёте">'+R.outlets.map(function(x){ return '<button aria-pressed="'+(r&&r.id===x.id)+'" data-act="repout" data-o="'+x.id+'">'+ico('building','sm')+' '+esc(CITIES[x.city].n)+(x.building?' (стройка)':'')+'</button>'; }).join('')+'</div>';
  h+=accBlock('chk','Чек месяца','выручка, расходы, налог','<div class="kpi">'+metric('Фуд-кост',pct(t.cogs/Math.max(1,t.rev)),'продукты',t.cogs/Math.max(1,t.rev)>0.36?'bad':'ok')+metric('Прайм-кост',pct((t.cogs+t.wages)/Math.max(1,t.rev)),'продукты + зарплаты',(t.cogs+t.wages)/Math.max(1,t.rev)>0.67?'bad':'ok')+'</div>'+plHTML(R)+(R.depInterest>0?'<p class="small muted" style="margin:6px 0 0">Проценты по вкладу: +'+rub(R.depInterest)+' (идут в капитал)</p>':'')+'<div class="chips">'+termChip('revenue')+termChip('pnl')+'</div>');
  if(r&&!r.building){
    h+=accBlock('out','«'+esc(CITIES[r.city].n)+'»: как прошёл месяц','гости, чек, загрузка','<div class="kpi">'+metric('Выручка',rubk(r.rev))+metric('Гостей в день',Math.round(r.guests/30),'')+metric('Средний чек',rub(r.avgCheck),'')+metric('Загрузка',pct(r.utilK),r.utilK>1?'спрос выше возможностей':'есть запас',r.utilK>1?'bad':'ok')+'</div><div class="row">'+starsSVG(r.rating,18)+'<span class="small muted">'+(r.rating>r.ratingOld+0.02?'рейтинг вырос':(r.rating<r.ratingOld-0.02?'рейтинг упал':'рейтинг стабилен'))+'</span></div>');
    var days=r.days, dmx=Math.max.apply(null,days.concat([1]));
    h+=accBlock('days','Выручка по дням','тепловая карта месяца','<div class="cal" aria-hidden="true">'+days.map(function(v,i){ var hh=Math.round(v/dmx*100); return '<i style="--i:'+i+';--h:'+hh+'" class="'+(hh>66?'hi':'')+'">'+(i+1)+'</i>'; }).join('')+'</div><p class="small muted" style="margin:6px 0 0">Каждая клетка — день месяца. Выходные и погода меняют поток гостей.</p>');
    h+=accBlock('fun','Куда делись гости','путь гостя за месяц',funnelHTML(r));
    var top=r.mix.slice().sort(function(a,b){ return b.rev-a.rev; }).slice(0,6), NM={star:'Звезда',horse:'Конь',puzzle:'Загадка',dog:'Балласт'};
    h+=accBlock('sold','Что покупали','самые прибыльные блюда','<div class="pl">'+top.map(function(m){ return '<div class="pl-row"><span>'+esc(m.name)+' <span class="cls '+m.cls+'">'+NM[m.cls]+'</span></span><b class="num">'+Math.round(m.qty)+' шт.</b><div class="bar"><i style="width:'+clamp(m.rev/Math.max(1,top[0].rev)*100,0,100)+'%"></i></div></div>'; }).join('')+'</div>'+termChip('menueng'));
    if(r.banNote&&r.banNote.length) h+=accBlock('ban','Банкеты и заказы','',r.banNote.map(function(b){ return '<div class="pl-row '+(b.ok?'plus':'minus')+'"><span>'+esc(b.name)+' <span class="hint">'+(b.ok?'справились':'не справились: вернули часть денег')+'</span></span><b class="num">'+rub(b.rev)+'</b></div>'; }).join(''));
  }
  if(R.goals&&R.goals.length){ var gs2=R.goals, got=gs2.filter(function(x){ return x.ok; }); h+=accBlock('quests','Задания месяца: '+got.length+' из '+gs2.length,'','<div class="questres">'+gs2.map(function(x){ var q=QUEST_BY_ID[x.id]; return '<div class="qr '+(x.ok?'ok':'')+'">'+ico(x.ok?'check':'x')+'<span><b>'+esc(q.n)+'</b><div class="small muted">'+esc(q.d)+'</div></span><b class="num '+(x.ok?'gain-t':'')+'">'+(x.ok?'+'+rub(q.rew):'—')+'</b></div>'; }).join('')+'</div>'); }
  if(R.regs&&R.regs.length){ h+=accBlock('regs','Постоянные гости','',R.regs.map(function(x){ var d=REG_BY_ID[x.id]; return '<div class="reg">'+avatarSVG(d.who,x.h>=3?'happy':'',42)+'<div class="grow"><b>'+esc(d.n)+'</b> '+heartsHTML(x.h)+'<div class="small muted">'+(x.gift?'Стал другом кафе! '+esc(d.gift)+' +10 000 ₽':(x.dh>0?'Стал ближе: ему понравилось меню':(x.dh<0?'Скучает по любимому блюду':'Всё по-прежнему')))+'</div></div></div>'; }).join('')); }
  if(S.hq.upg.secret && R.outlets.some(function(x){ return !x.building&&x.dims; })){ h+=accBlock('secret','Отчёт тайного гостя','',R.outlets.filter(function(x){ return !x.building&&x.dims; }).map(function(x){ var names={food:'вкус',svc:'сервис',cln:'чистоту',atmo:'уют',val:'цену и качество'}, w=Object.keys(x.dims).sort(function(a,b){ return x.dims[a]-x.dims[b]; })[0]; return '<div class="insight info"><span class="ico">'+ico('eye')+'</span><div><b>«'+esc(CITIES[x.city].n)+'»: слабее всего '+names[w]+'</b><p>Оценка '+Math.round(x.dims[w])+' из 100. Вкус '+Math.round(x.dims.food)+', сервис '+Math.round(x.dims.svc)+', чистота '+Math.round(x.dims.cln)+', уют '+Math.round(x.dims.atmo)+'.</p></div></div>'; }).join('')); }
  var g=goalNow(S);
  h+='<div class="chalk"><h3>'+ico('flag')+'До цели</h3><ul><li class="'+(g.okCities?'done':'')+'">'+ico(g.okCities?'check':'target')+'<span>Города: '+g.cities+' из '+g.needCities+'</span></li><li class="'+(g.okCap?'done':'')+'">'+ico(g.okCap?'check':'target')+'<span>Капитал: '+rubk(g.cap)+' из '+rubk(g.needCap)+'</span></li><li class="'+(g.okRating?'done':'')+'">'+ico(g.okRating?'check':'target')+'<span>Рейтинг: '+f1d(g.rating)+' из '+f1d(g.needRating)+'</span></li></ul></div>';
  h+='<div class="row" style="justify-content:space-between;margin:16px 0 8px"><button class="btn ghost" data-act="rewind">'+ico('undo')+' Переиграть месяц</button><button class="btn pulse" data-act="repnext">'+(S.bankrupt?'К итогам':(last?'К финалу':'Дальше'))+' '+ico('right')+'</button></div>';
  return h;
}

/* совет с прошлого месяца на «Главной» */
function advCardHTML(){
  var a=S.adv; if(!a||a.m!==S.month-1) return '';
  return '<section class="advice home"><div class="advice-h">'+avatarSVG('arsen','neutral',40)+'<div><small>Совет с прошлого месяца</small><b>'+esc(a.t)+'</b></div></div><p>'+esc(a.d)+'</p><div class="row"><button class="btn small" data-act="advgo">'+ico('right','sm')+' Открыть «'+TABN[a.tab]+'»</button><button class="btn ghost small" data-act="advoff">Понятно</button></div></section>';
}
A.advgo=function(){ var a=S.adv; if(!a) return; U.tab=a.tab; if(a.sub){ U.msub=a.sub; S.seen['sub_'+a.sub]=1; } U.pv=null; render(); window.scrollTo(0,0); };
A.advoff=function(){ if(S.adv) S.adv.m=-1; persist(); render(true); };

/* первая неделя: список дел вместо длинного текста */
function chkItems(){
  var o=S.outlets[0], mk=Object.keys(o.mk||{}).some(function(k){ return o.mk[k]; });
  var fill=S.menu.some(function(id){ var d=DISH[id]; return d&&(d.cat==='salad'||d.cat==='dess'); });
  return [
    {done:fill, t:'Добавьте в меню салат или десерт', d:'Без них часть гостей уходит: в меню есть не всё', tab:'menu'},
    {done:mk, t:'Включите недорогую рекламу', d:'Листовки стоят 3 000 ₽. О кафе пока никто не знает', tab:'guests'},
    {done:!!S.tut.placeSeen, t:'Загляните в «Кухню»', d:'Хватает ли рук? Уборщик поднимет рейтинг, но стоит денег', tab:'place'},
    {done:!!S.tut.moneySeen, t:'Проверьте прогноз в «Деньгах»', d:'Сколько гостей нужно, чтобы выйти в ноль', tab:'money'}
  ];
}
function chkHTML(){
  var it=chkItems(), n=it.filter(function(x){ return x.done; }).length, all=n===it.length;
  var h='<section class="chk"><div class="chk-h">'+avatarSVG('borsch',all?'happy':'neutral',44)+'<div><b>'+(all?'Всё готово. Запускайте месяц!':'Первая неделя: 4 дела')+'</b><small>'+(all?'Прогноз внизу покажет, что получится':'Сделано '+n+' из '+it.length)+'</small></div></div><div class="chk-bar"><i style="width:'+Math.round(n/it.length*100)+'%"></i></div>';
  h+='<ul>'+it.map(function(x){ return '<li class="'+(x.done?'done':'')+'"><button data-act="tab" data-tab="'+x.tab+'" aria-label="'+esc(x.t)+(x.done?' (сделано)':'')+'">'+ico(x.done?'check':'target')+'<span><b>'+esc(x.t)+'</b>'+(x.done?'':'<small>'+esc(x.d)+'</small>')+'</span>'+(x.done?'':ico('right','sm'))+'</button></li>'; }).join('')+'</ul></section>';
  return h;
}
/* подсказки Борща: включить/выключить, сами гаснут после 3-го месяца */
A.togglehints=function(){ S.hints=S.hints===false; persist(); closeModal(); toast(S.hints===false?'Подсказки выключены':'Подсказки включены'); render(true); };
function hintsAuto(){ if(S&&S.month>3&&!S.hintsAuto){ S.hintsAuto=1; S.hints=false; } }
/* прогноз прибыли «живой»: чип с изменением после каждого решения */
function deltaChip(p){
  var pr=Math.round(p/1000)*1000, out='';
  if(U.lastP!=null&&pr!==U.lastP){ U.dChip={v:pr-U.lastP,t:Date.now()}; }
  U.lastP=pr;
  var d=U.dChip, el=d?Date.now()-d.t:9e9;
  if(d&&el<2800) out='<span class="dchip '+(d.v>0?'up':'dn')+'" style="animation-delay:-'+Math.round(el)+'ms" aria-live="polite">'+(d.v>0?'▲ +':'▼ −')+Math.abs(d.v).toLocaleString('ru-RU').replace(/,/g,' ')+' ₽</span>';
  return out;
}
