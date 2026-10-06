/* ===== Интерфейс, часть 4: запуск месяца, итоги, финал, действия, запуск ===== */

/* ---------- предупреждения перед запуском ---------- */
function goWarnings(){
  var w=[], R=getPV(), o=flagship(S);
  if(!S.menu.length) w.push({block:true,t:'В меню нет ни одного блюда.'});
  var miss=missingCats(); if(miss.length>=3) w.push({t:'В меню почти нет категорий ('+miss.map(function(c){ return CATN[c].toLowerCase(); }).join(', ')+'). Гости будут уходить.'});
  liveOutlets(S).forEach(function(x){ if(!x.mk||!Object.keys(x.mk).some(function(k){ return x.mk[k]; })) w.push({t:'В «'+CITIES[x.city].n+'» выключена вся реклама.'}); if(x.staff.cln<1&&x.fmt==='rest') w.push({t:'В ресторане «'+CITIES[x.city].n+'» нет уборки.'}); });
  if(R){ if(S.cash+R.profit<0) w.push({t:'По прогнозу денег в кассе не хватит. Недостающее станет экстренным долгом под 3,5% в месяц.'}); R.outlets.forEach(function(r){ if(r.utilK>1.35) w.push({t:'В «'+CITIES[r.city].n+'» спрос сильно выше возможностей: часть гостей уйдёт.'}); }); }
  return w;
}
A.go=function(){
  var w=goWarnings(), blocked=w.filter(function(x){ return x.block; });
  if(blocked.length){ toast(blocked[0].t,true); return; }
  if(w.length && !U.goOK){ openModal('Перед запуском месяца','<ul style="padding-left:18px;margin:0 0 12px">'+w.map(function(x){ return '<li style="margin:6px 0">'+esc(x.t)+'</li>'; }).join('')+'</ul><div class="row"><button class="btn" data-act="goforce">Запустить всё равно</button><button class="btn secondary" data-act="closemodal">Вернуться к плану</button></div>'); return; }
  U.goOK=false; doGo();
};
A.goforce=function(){ closeModal(); U.goOK=true; A.go(); };
function doGo(){
  U.snap=JSON.stringify(S); U.snapU={tab:U.tab,outlet:U.outlet};
  var R=simMonth(S,{}); R.cashBefore=S.cash; U.report=R; U.repOutlet=null;
  applyMonth(S,R); U.newAch=checkAch(S,R); U.newAch.forEach(function(a){ logEv(S,'ach','Награда «'+a.n+'»'); }); U.pv=null;
  if(S.emerg>600000 || (S.emerg>0 && S.debt+S.emerg>2600000)){ S.bankrupt=R.m; }
  U.screen='run'; U.runT0=Date.now(); render(); sfx('bell');
  if(!reduced) later(function(){ if(U.screen==='run') A.runskip(); },4600); else later(function(){ if(U.screen==='run') A.runskip(); },600);
}
function runHTML(){
  var R=U.report, r=R.outlets.filter(function(x){ return x.days&&x.days.length; })[0], days=(r&&r.days)||[], mx=Math.max.apply(null,days.concat([1])), out='';
  var cells=days.map(function(v,i){ var h=Math.round(v/mx*100); return '<i class="'+(h>66?'hi ':'')+'" style="--i:'+i+';--h:'+h+'">'+(i+1)+'</i>'; }).join('');
  return '<article class="card" style="text-align:center"><h2>Идёт месяц: '+MONTHS[R.m-1]+'</h2><p class="muted">Каждая клетка — день. Чем краснее, тем больше выручка.</p><div class="cal" style="max-width:420px;margin:10px auto" aria-hidden="true">'+cells+'</div><div class="fact">'+ico('sparkle')+'<span><b>Знаете ли вы?</b> '+esc(FACTS[(R.m*5+hashStr(S.seed))%FACTS.length])+'</span></div><p class="muted">'+(r?esc(CITIES[r.city].n)+': ':'')+'гостей <b class="num" id="run-g">0</b>, выручка <b class="num" id="run-r">0 ₽</b></p><button class="btn secondary" data-act="runskip">Показать итоги '+ico('right')+'</button></article>';
}
function runAnim(){
  var R=U.report, g=$('#run-g'), rr=$('#run-r'); if(!g) return;
  var tg=R.guests, tr=R.revTotal; animateNumber(g,0,tg,3200,function(v){ return String(Math.round(v)); }); animateNumber(rr,0,tr,3200,rub);
}
A.runskip=function(){ clearTimers(); U.screen='report'; render(); if(U.newAch&&U.newAch.length){ sfx('win'); burst(60); } else sfx('good'); };

/* ---------- итоги месяца ---------- */
function reportOutlet(){ var R=U.report, id=U.repOutlet||(R.outlets[0]&&R.outlets[0].id); return R.outlets.filter(function(x){ return x.id===id; })[0]||R.outlets[0]; }
function funnelHTML(r){
  if(!r||!r.m) return ''; var m=r.m, pool=Math.max(1,m.pool), a=pool-m.aware, w=m.want, s=m.served;
  function row(t,v,cls,sub){ return '<div class="fun '+(cls||'')+'"><span class="t">'+t+'</span><b class="num">'+Math.round(v).toLocaleString('ru-RU').replace(/,/g,' ')+'</b><div class="bar"><i style="width:'+clamp(v/pool*100,0,100).toFixed(1)+'%"></i></div>'+(sub?'<small>'+sub+'</small>':'')+'</div>'; }
  return '<div class="funnel">'+row('Были поблизости',pool,'')+row('Узнали и заинтересовались',a,'','Не узнали о вас: '+Math.round(m.aware))+row('Меню и цена подошли',w,'','Ушли из-за меню и цены: '+Math.round(m.menuprice))+row('Обслужили',s,'','Не хватило мест, людей или кухни: '+Math.round(m.cap))+'</div>';
}
function dlt(cur,prev,fmtf){ if(prev==null||!isFinite(prev)||Math.abs(prev)<1) return ''; var d=(cur-prev)/Math.abs(prev); if(Math.abs(d)<0.005) return ''; return '<span class="delta '+(d>0?'up':'dn')+'">'+(d>0?'▲ +':'▼ −')+Math.abs(Math.round(d*100))+'%</span>'; }
function reportHTML(){
  var R=U.report; if(!R) return ''; var prevH=S.hist.length>=2?S.hist[S.hist.length-2]:null; var r=reportOutlet(), h='', t=R.total, mx=Math.max(1,R.revTotal);
  var multi=R.outlets.length>1;
  h+='<div class="ticket"><div class="tag">Итоги месяца</div><h2>'+MONTHS[R.m-1]+' · месяц '+R.m+' из '+TOTAL+'</h2>'+
   '<div class="row" style="justify-content:center;margin:8px 0">'+starsSVG(R.rating,20)+'<b class="num">'+f1d(R.rating)+'</b></div>'+
   '<div class="pl-row total" style="border-top:0;margin:0"><span>Прибыль</span><b class="num '+(R.profit>=0?'gain-t':'loss-t')+'" id="rp-prof">'+sgn(R.profit)+'</b></div>'+
   '<div class="kpi" style="margin-top:12px">'+metric('Выручка',rubk(R.revTotal),'к прошлому месяцу '+(prevH?dlt(R.revTotal,prevH.rev)||'без изменений':'—'))+metric('Гостей',Math.round(R.guests).toLocaleString('ru-RU').replace(/,/g,' '),'за месяц '+(prevH?dlt(R.guests,prevH.guests):''))+metric('Фуд-кост',pct(t.cogs/Math.max(1,t.rev)),'продукты',t.cogs/Math.max(1,t.rev)>0.36?'bad':'ok')+metric('Прайм-кост',pct((t.cogs+t.wages)/Math.max(1,t.rev)),'продукты + зарплаты',(t.cogs+t.wages)/Math.max(1,t.rev)>0.67?'bad':'ok')+'</div>'+plHTML(R)+(R.depInterest>0?'<p class="small muted" style="text-align:center;margin:6px 0 0">Проценты по вкладу: +'+rub(R.depInterest)+' (идут в капитал)</p>':'')+'<p class="small muted" style="text-align:center;margin:8px 0 0">В кассе: '+rub(S.cash)+'</p></div>';
  if(multi) h+='<div class="outsel" role="group" aria-label="Заведение в отчёте">'+R.outlets.map(function(x){ return '<button aria-pressed="'+(r&&r.id===x.id)+'" data-act="repout" data-o="'+x.id+'">'+ico('building','sm')+' '+esc(CITIES[x.city].n)+(x.building?' (стройка)':'')+'</button>'; }).join('')+'</div>';
  if(r && !r.building){
    h+=card('«'+esc(CITIES[r.city].n)+'»: как прошёл месяц','<div class="kpi">'+metric('Выручка',rubk(r.rev))+metric('Гостей в день',Math.round(r.guests/30),'')+metric('Средний чек',rub(r.avgCheck),'')+metric('Загрузка',pct(r.utilK),r.utilK>1?'спрос выше возможностей':'есть запас',r.utilK>1?'bad':'ok')+'</div><div class="row">'+starsSVG(r.rating,18)+'<span class="small muted">'+(r.rating>r.ratingOld+0.02?'рейтинг вырос':(r.rating<r.ratingOld-0.02?'рейтинг упал':'рейтинг стабилен'))+'</span></div>',{ic:'building'});
    var days=r.days, dmx=Math.max.apply(null,days.concat([1]));
    h+=card('Выручка по дням','<div class="cal" aria-hidden="true">'+days.map(function(v,i){ var hh=Math.round(v/dmx*100); return '<i style="--i:'+i+';--h:'+hh+'" class="'+(hh>66?'hi':'')+'">'+(i+1)+'</i>'; }).join('')+'</div><p class="small muted" style="margin:6px 0 0">Каждая клетка — день месяца. Выходные и погода меняют поток гостей.</p>',{ic:'calendar'});
    h+=card('Куда делись гости','<p class="sub">Путь гостя за месяц.</p>'+funnelHTML(r),{ic:'people'});
    var top=r.mix.slice().sort(function(a,b){ return b.rev-a.rev; }).slice(0,6);
    h+=card('Что покупали','<div class="pl">'+top.map(function(m,i){ var d=DISH[m.id]||localDish({city:r.city}); return '<div class="pl-row"><span>'+esc(m.name)+' <span class="cls '+m.cls+'">'+{star:'Звезда',horse:'Конь',puzzle:'Загадка',dog:'Балласт'}[m.cls]+'</span></span><b class="num">'+Math.round(m.qty)+' шт.</b><div class="bar"><i style="width:'+clamp(m.rev/Math.max(1,top[0].rev)*100,0,100)+'%"></i></div></div>'; }).join('')+'</div>'+termChip('menueng'),{ic:'book'});
    if(r.reviews&&r.reviews.length) h+=card('Отзывы',r.reviews.map(function(rv){ return '<div class="review">'+starsSVG(rv.st,14)+'<div><div class="who">Гость</div><p>'+esc(rv.t)+'</p></div></div>'; }).join(''),{ic:'chat'});
    if(r.banNote&&r.banNote.length) h+=card('Банкеты и заказы',r.banNote.map(function(b){ return '<div class="pl-row '+(b.ok?'plus':'minus')+'"><span>'+esc(b.name)+' <span class="hint">'+(b.ok?'справились':'не справились: вернули часть денег')+'</span></span><b class="num">'+rub(b.rev)+'</b></div>'; }).join(''),{ic:'gift'});
  }
  if(R.goals&&R.goals.length){ var gs=R.goals, got=gs.filter(function(x){ return x.ok; }); h+=card('Задания месяца: '+got.length+' из '+gs.length,'<div class="questres">'+gs.map(function(x){ var q=QUEST_BY_ID[x.id]; return '<div class="qr '+(x.ok?'ok':'')+'">'+ico(x.ok?'check':'x')+'<span><b>'+esc(q.n)+'</b><div class="small muted">'+esc(q.d)+'</div></span><b class="num '+(x.ok?'gain-t':'')+'">'+(x.ok?'+'+rub(q.rew):'—')+'</b></div>'; }).join('')+'</div>',{ic:'target'}); }
  if(R.regs&&R.regs.length){ h+=card('Постоянные гости','<div class="regs">'+R.regs.map(function(x){ var d=REG_BY_ID[x.id]; return '<div class="reg">'+avatarSVG(d.who,x.h>=3?'happy':'',42)+'<div class="grow"><b>'+esc(d.n)+'</b> '+heartsHTML(x.h)+'<div class="small muted">'+(x.gift?'Стал другом кафе! '+esc(d.gift)+' +10 000 ₽':(x.dh>0?'Стал ближе: ему понравилось меню':(x.dh<0?'Скучает по любимому блюду':'Всё по-прежнему')))+'</div></div></div>'; }).join('')+'</div>',{ic:'heart'}); }
  if(S.hq.upg.secret && R.outlets.some(function(x){ return !x.building&&x.dims; })){ h+=card('Отчёт тайного гостя','<div class="insights-list">'+R.outlets.filter(function(x){ return !x.building&&x.dims; }).map(function(x){ var names={food:'вкус',svc:'сервис',cln:'чистоту',atmo:'уют',val:'цену и качество'}, w=Object.keys(x.dims).sort(function(a,b){ return x.dims[a]-x.dims[b]; })[0]; return '<div class="insight info"><span class="ico">'+ico('eye')+'</span><div><b>«'+esc(CITIES[x.city].n)+'»: слабее всего '+names[w]+'</b><p>Оценка '+Math.round(x.dims[w])+' из 100. Вкус '+Math.round(x.dims.food)+', сервис '+Math.round(x.dims.svc)+', чистота '+Math.round(x.dims.cln)+', уют '+Math.round(x.dims.atmo)+'.</p></div></div>'; }).join('')+'</div>',{ic:'eye'}); }
  var ins=monthInsights(S,R); ins.forEach(function(x){ if(x.term) addTerm(x.term); });
  if(ins.length) h+=card('Подсказки Борща и Арсена','<div>'+ins.map(function(x){ return '<div class="insight '+x.k+'"><span class="ico">'+ico(x.k==='good'?'check':(x.k==='warn'?'warn':'info'))+'</span><div><b>'+esc(x.h)+'</b><p>'+esc(x.t)+'</p>'+(x.term?termChip(x.term):'')+'</div></div>'; }).join('')+'</div>',{ic:'sparkle'});
  var ev=[]; if(U.newAch&&U.newAch.length) U.newAch.forEach(function(a){ ev.push('<div class="award on"><span class="fico">'+ico(a.icon)+'</span><div><b>Награда: '+esc(a.n)+'</b><small>'+esc(a.d)+'</small></div></div>'); });
  (R.quits||[]).forEach(function(q){ ev.push('<div class="insight warn"><span class="ico">'+ico('warn')+'</span><div><b>Ушёл сотрудник</b><p>Из-за низкого настроения команды ушёл человек: '+ROLES[q.role].n.toLowerCase()+' в «'+esc(CITIES[outletById(S,q.o)?outletById(S,q.o).city:'tula'].n)+'». Подумайте о зарплате и нагрузке.</p></div></div>'); });
  if(S.emergStep) ev.push('<div class="insight warn"><span class="ico">'+ico('bank')+'</span><div><b>Касса опустела</b><p>Не хватило '+rub(S.emergStep)+', это стало экстренным долгом под 3,5% в месяц. Погасите его, как только появятся деньги.</p></div></div>');
  if(ev.length) h+=card('Что ещё случилось','<div class="awards">'+ev.join('')+'</div>',{ic:'bolt'});
  var g=goalNow(S);
  h+='<div class="chalk"><h3>'+ico('flag')+'До цели</h3><ul><li class="'+(g.okCities?'done':'')+'">'+ico(g.okCities?'check':'target')+'<span>Города: '+g.cities+' из '+g.needCities+'</span></li><li class="'+(g.okCap?'done':'')+'">'+ico(g.okCap?'check':'target')+'<span>Капитал: '+rubk(g.cap)+' из '+rubk(g.needCap)+'</span></li><li class="'+(g.okRating?'done':'')+'">'+ico(g.okRating?'check':'target')+'<span>Рейтинг: '+f1d(g.rating)+' из '+f1d(g.needRating)+'</span></li></ul></div>';
  var last=R.m>=TOTAL;
  h+='<div class="row" style="justify-content:space-between;margin:16px 0 8px"><button class="btn ghost" data-act="rewind">'+ico('undo')+' Переиграть месяц</button><button class="btn" data-act="repnext">'+(S.bankrupt?'К итогам':(last?'К финалу':'Дальше'))+' '+ico('right')+'</button></div>';
  return h;
}
A.repout=function(el){ U.repOutlet=el.getAttribute('data-o'); render(true); };
A.rewind=function(){
  if(!U.snap){ toast('Нечего переигрывать',true); return; }
  try{ var rw=(S.rewinds||0)+1; S=JSON.parse(U.snap); S.rewinds=rw; ensureState(S); }catch(e){ return; }
  U.report=null; U.screen='plan'; U.tab=(U.snapU&&U.snapU.tab)||'home'; U.goOK=false; hudPrev={}; toast('Месяц можно сыграть заново: все настройки на месте'); render();
};
A.repnext=function(){
  var R=U.report; U.report=null; U.snap=null;
  if(S.bankrupt){ finishGame(); return; }
  if(R.m===TOTAL){ U.screen='finale'; U.finale=null; render(); return; }
  if(R.m===4||R.m===8||R.m===12){ quizInit(actOf(R.m)); U.screen='quiz'; render(); return; }
  enterMonth();
};

/* ---------- финал ---------- */
function finaleHTML(){
  var sc=SCENE_BY_M[16], f=forkScore(S), lines=sc.lines(S).map(function(l,i){ return bubble(l,i); }).join(''), tierN=FORK_NAMES[f.tier];
  var verdictLine={gold:'Решение гида: «'+tierN+'» присуждается заведению «'+f.name+'». Это высшая оценка, и вы заслужили её.',silver:'Решение гида: «'+tierN+'». Чуть-чуть не хватило до золота: вкус и сервис на уровне, но есть что подтянуть.',bronze:'Решение гида: «Рекомендация». Заведение хорошее, но до награды нужны ещё сильные шаги.',none:'Гид не вручает награду в этом году, но записывает: «Следите за этим заведением».'}[f.tier];
  var d=f.dims, dimH=d?'<div class="pgrid">'+[['food','Вкус'],['svc','Сервис'],['cln','Чистота'],['atmo','Уют'],['val','Цена и качество']].map(function(x){ return '<div class="prow"><span>'+x[1]+'</span><div class="t"><i style="width:'+Math.round(d[x[0]])+'%"></i></div><b class="num">'+Math.round(d[x[0]])+'</b></div>'; }).join('')+'</div>':'';
  return '<article class="scene"><div class="scene-head"><span class="chip brand">'+ico('flag','sm')+' Финал</span><span class="place">'+ico('pin','sm')+' '+esc(sc.place)+'</span></div><h2>'+sc.title+'</h2>'+lines+'<div class="actcard" style="margin-top:20px"><span class="kicker">Гид «Золотая вилка»</span><h1>'+esc(tierN)+'</h1><p>'+esc(verdictLine)+'</p>'+dimH+'</div><div class="row" style="justify-content:flex-end;margin:16px 0"><button class="btn" data-act="tofinal">Итоги партии '+ico('right')+'</button></div></article>';
}
A.tofinal=function(){ finishGame(); };
function finishGame(){
  var f=forkScore(S); if(f.tier==='gold') S.flags.goldFork=1;
  if((f.tier!=='none'||goalMet(S)) && S.recs.indexOf(7)<0) S.recs.push(7);
  S.final=true; var fa=checkAch(S,S.lastR?{outlets:[],profit:0}:null); fa.forEach(function(a){ logEv(S,'ach','Награда: '+a.n); }); saveRecord(); U.screen='final'; sfx(goalMet(S)?'win':'good'); if(goalMet(S)||f.tier==='gold') burst(120); render();
}
function gameInsights(){
  var out=[], h=S.hist, g=goalNow(S);
  if(h.length){ var b=h.reduce(function(a,x){ return x.profit>a.profit?x:a; },h[0]), w=h.reduce(function(a,x){ return x.profit<a.profit?x:a; },h[0]); out.push({k:'good',h:'Лучший месяц: '+MONTHS[b.m-1],t:'Прибыль '+rub(b.profit)+'. Посмотрите, что тогда было иначе: меню, реклама, сезон.'}); if(w.profit<0) out.push({k:'warn',h:'Самый тяжёлый месяц: '+MONTHS[w.m-1],t:'Убыток '+rub(-w.profit)+'. Такие месяцы нужно переживать запасом в кассе.'}); }
  var pm=h.filter(function(x){ return x.profit>0; }).length; out.push({k:'info',h:'Месяцев в плюс: '+pm+' из '+h.length,t:'Чем больше таких месяцев подряд, тем спокойнее можно расширяться.'});
  if(S.invest) out.push({k:'info',h:'Вы взяли инвестора',t:'Он получал 20% прибыли каждый месяц. Это дороже кредита в долгосрочной перспективе, но не нужно возвращать.'});
  if(S.flags.hadLoan) out.push({k:'info',h:'Вы пользовались кредитом',t:'Кредит ускоряет рост, но проценты съедают прибыль. Погашайте, когда есть свободные деньги.'});
  if(S.emerg>0) out.push({k:'warn',h:'Экстренный долг',t:'Касса опустела, и пришлось брать долг под 3,5% в месяц. Держите запас на два месяца расходов.'});
  if(!g.okCities) out.push({k:'warn',h:'Для цели не хватило городов',t:'Начните расширяться раньше: заведению нужно время, чтобы набрать гостей. Помогают кредит, инвестор и франшиза.'});
  else if(!g.okRating) out.push({k:'warn',h:'Рейтинг сети ниже цели',t:'Новые заведения начинают с низкого рейтинга. Управляющие, книга стандартов и обучение помогают держать качество.'});
  if(S.flags.nazWar) out.push({k:'good',h:'Вы выстояли против сети Назарова',t:'Отказ стоил продаж в трудные месяцы, но сохранил бренд и независимость.'});
  if(S.flags.nazMerge) out.push({k:'info',h:'Вы объединились с Назаровым',t:'Деньги пришли сразу, но 15% прибыли сети уходили партнёру.'});
  return out.slice(0,6);
}
function finalHTML(){
  var v=verdict(S), g=goalNow(S), f=forkScore(S), got=ACH.filter(function(a){ return S.ach[a.id]; }), line=resultLine(S);
  var h='<div class="actcard"><span class="kicker">'+(S.bankrupt?'Конец партии':'Итоги партии')+'</span><h1>'+esc(v.name)+'</h1><p class="muted" style="max-width:560px;margin:0 auto">'+esc(v.text)+'</p>'+
   '<div class="kpi" style="max-width:560px;margin:14px auto">'+metric('Капитал',rubk(g.cap),'цель '+rubk(g.needCap),g.okCap?'ok':'bad')+metric('Города',g.cities+' из '+g.needCities,'',g.okCities?'ok':'bad')+metric('Рейтинг сети',f1d(g.rating),'нужно '+f1d(g.needRating),g.okRating?'ok':'bad')+metric('Гид',FORK_NAMES[f.tier],'')+'</div>'+
   (goalMet(S)?'<p class="chip gain">'+ico('check','sm')+' Цель достигнута</p>':'<p class="chip warn">Цель пока не достигнута</p>')+'</div>';
  var sp=S.hist.map(function(x){ return x.cap; }); if(sp.length>1) h+=card('Капитал по месяцам',sparkSVG(sp.slice(-10),S.hist.slice(-10).map(function(x){ return MONTHS_SHORT[x.m-1]; })),{ic:'chart'});
  h+=card('Диплом','<p class="sub">Его можно сфотографировать или сделать скриншот.</p>'+diplomaSVG(S.name,S.cafe,v.name,['Капитал сети: '+rubk(g.cap)+' · городов: '+g.cities,'Рейтинг сети: '+f1d(g.rating)+' · гид: '+FORK_NAMES[f.tier],'Рецептов в тетради: '+S.recs.length+' из 7'],S.awn),{ic:'award'});
  h+=card('Города на карте Тамары',mapSVG(S,null),{ic:'map'});
  var chron=(S.log||[]).slice(-14); if(chron.length) h+=card('Хроника партии','<ul class="chron">'+chron.map(function(x){ return '<li><b>'+esc(x.t)+'</b><small>'+MONTHS[Math.min(15,x.m-1)]+', месяц '+x.m+'</small></li>'; }).join('')+'</ul>',{ic:'calendar'});
  h+=card('Разбор партии','<div>'+gameInsights().map(function(x){ return '<div class="insight '+x.k+'"><span class="ico">'+ico(x.k==='good'?'check':(x.k==='warn'?'warn':'info'))+'</span><div><b>'+esc(x.h)+'</b><p>'+esc(x.t)+'</p></div></div>'; }).join('')+'</div>',{ic:'sparkle'});
  h+=card('Награды ('+got.length+' из '+ACH.length+')','<div class="awards">'+got.map(function(a){ return '<div class="award on"><span class="fico">'+ico(a.icon)+'</span><div><b>'+esc(a.n)+'</b><small>'+esc(a.d)+'</small></div></div>'; }).join('')+'</div>',{ic:'award'});
  h+=card('Для учителя','<p class="small muted">Скопируйте строку и отправьте учителю: он соберёт общую таблицу класса.</p><textarea class="code" readonly id="resline" aria-label="Результат">'+esc(line)+'</textarea><div class="row"><button class="btn small secondary" data-act="copyres">'+ico('copy')+' Скопировать результат</button></div>',{ic:'chart'});
  h+='<div class="row" style="justify-content:space-between;margin:16px 0"><button class="btn secondary" data-act="totitle">В главное меню</button><button class="btn" data-act="newgame">'+ico('play')+' Сыграть снова</button></div>';
  return h;
}
A.copyres=function(){ var t=$('#resline'); if(!t) return; t.select(); try{ document.execCommand('copy'); toast('Строка скопирована'); }catch(e){ toast('Выделите строку и скопируйте вручную'); } };

/* ---------- месяц: вход ---------- */
function enterMonth(){
  clearTimers(); U.report=null; U.sc=null; U.ev=null; U.evRes=null; U.pv=null; U.goOK=false;
  if(S.newsM!==S.month){ S.newsM=S.month; var N=stepNews(S); U.newsNow=N||null; }
  S.orders=null; S.accepted=[]; U.actSeen=U.actSeen||{}; var a=actOf(S.month);
  persist();
  if([1,5,9,13].indexOf(S.month)>=0 && !U.actSeen[a]){ U.actSeen[a]=1; U.screen='act'; render(); return; }
  if(S.month===TOTAL && !U.actSeen.last){ U.actSeen.last=1; U.screen='last'; render(); return; }
  if(S.month===TOTAL){ toPlan(); return; }
  U.screen='scene'; U.sc={step:0,done:[]}; render();
}
function toPlan(){ U.screen='plan'; U.tab=U.tab&&U.tab!=='net'?U.tab:'home'; if(S.month===1&&!S.tut.homeSeen) U.tab='home'; U.outlet=null; U.goOK=false; U.snapMonth=S.month; makeBoard(S); persist(); render(); }
A.actgo=function(){ var a=actOf(S.month); if(S.month===TOTAL){ U.screen='plan'; toPlan(); return; } U.screen='scene'; U.sc={step:0,done:[]}; render(); };
A.forkpick=function(el){ S.flags.forkOutlet=el.getAttribute('data-o'); render(true); };

/* ---------- действия игрока ---------- */
function ok(r){ if(r&&r.msg) toast(r.msg,!r.ok); if(r&&r.ok) sfx('click'); persist(); render(true); return r; }
function oid(){ return curO().id; }
A.tab=function(el){ U.tab=el.getAttribute('data-tab'); if(U.tab==='menu') stepOnTab('menu'); if(U.tab==='place') stepOnTab('place'); if(U.tab==='guests') stepOnTab('guests'); if(U.tab==='money') stepOnTab('money'); if(U.tab==='home') stepOnTab('home'); persist(); render(); window.scrollTo(0,0); };
A.selout=function(el){ U.outlet=el.getAttribute('data-o'); var go=el.getAttribute('data-go'); if(go) U.tab=go; render(go?false:true); };
A.sethere=function(el){ ok(A_here(S,el.getAttribute('data-o'))); };
A.menutoggle=function(el){ ok(A_menu(S,el.getAttribute('data-d'))); };
function changePrice(id,delta){ var d=DISH[id]; if(!d) return; var p=priceOf(S,d)+delta; ok(A_price(S,id,p)); }
A.pdec=function(el){ changePrice(el.getAttribute('data-d'),-5); }; A.pinc=function(el){ changePrice(el.getAttribute('data-d'),5); };
A.prange=function(el){ var id=el.getAttribute('data-d'), v=+el.value; A_price(S,id,v); var lab=$('#pv-'+id); if(lab) lab.textContent=S.price[id]+' ₽'; el.style.setProperty('--p',((v-el.min)/(el.max-el.min)*100)+'%'); };
A.pricesync=function(){ ok(A_sync(S)); };
A.loctoggle=function(){ var o=curO(); o.loc=(o.loc===false); persist(); render(true); };
function lpChange(d){ var o=curO(), L0=localDish(o), cur=o.lp||Math.round(L0.ref*S.pidx*CITIES[o.city].inc/5)*5; o.lp=clamp(cur+d,Math.round(L0.cost*cogsFactor(S,o)*1.1),Math.round(L0.ref*S.pidx*CITIES[o.city].inc*2)); persist(); render(true); }
A.lpdec=function(){ lpChange(-5); }; A.lpinc=function(){ lpChange(5); };
A.lab=function(el){ ok(A_lab(S,el.getAttribute('data-d'))); };
A.hire=function(el){ ok(A_hire(S,oid(),el.getAttribute('data-r'))); };
A.fire=function(el){ ok(A_fire(S,oid(),el.getAttribute('data-r'))); };
A.train=function(el){ ok(A_train(S,oid(),el.getAttribute('data-r'))); };
A.hours=function(el){ ok(A_set(S,oid(),'hrs',+el.getAttribute('data-v'))); };
A.paylvl=function(el){ ok(A_set(S,oid(),'pay',+el.getAttribute('data-v'))); };
A.mgr=function(){ ok(A_mgr(S,oid())); };
A.spec=function(el){ ok(A_spec(S,el.getAttribute('data-id'),oid())); };
A.supplier=function(el){ ok(A_set(S,oid(),'sup',el.getAttribute('data-v'))); };
A.stockdec=function(){ var o=curO(); ok(A_set(S,o.id,'stock',Math.max(1,o.stock-1))); }; A.stockinc=function(){ var o=curO(); ok(A_set(S,o.id,'stock',Math.min(6,o.stock+1))); };
A.buyeq=function(el){ var r=A_eq(S,oid(),el.getAttribute('data-e')); if(r.ok) sfx('coin'); ok(r); };
A.hol=function(){ ok(A_hol(S,oid())); };
A.dep=function(el){ ok(A_dep(S,+el.getAttribute('data-v'))); }; A.undep=function(el){ ok(A_undep(S,+el.getAttribute('data-v'))); };
A.insure=function(){ ok(A_insure(S)); }; A.forward=function(){ var r=A_forward(S); if(r.ok) sfx('coin'); ok(r); };
A.special=function(el){ ok(A_special(S,oid(),el.getAttribute('data-d'))); };
A.mk=function(el){ ok(A_mk(S,oid(),el.getAttribute('data-m'))); };
A.accept=function(el){ ok(A_accept(S,el.getAttribute('data-id'))); }; A.haggle=function(el){ ok(A_haggle(S,el.getAttribute('data-id'))); }; A.decline=function(el){ ok(A_decline(S,el.getAttribute('data-id'))); }; A.unaccept=function(el){ ok(A_unaccept(S,el.getAttribute('data-id'))); };
A.tax=function(el){ ok(A_tax(S,el.getAttribute('data-v'))); };
A.borrow=function(el){ ok(A_borrow(S,+el.getAttribute('data-v'))); };
A.repay=function(el){ var v=el.getAttribute('data-v'); var sum=v==='all'?Math.min(S.cash,S.debt+S.emerg):+v; ok(A_repay(S,sum)); };
A.invest=function(){ var r=A_invest(S); if(r.ok) sfx('coin'); ok(r); };
A.mapcity=function(el){ U.city=el.getAttribute('data-city'); render(true); };
A.opencity=function(el){ var k=el.getAttribute('data-city'), f=el.getAttribute('data-f'); var r=A_open(S,k,f); if(r.ok){ sfx('win'); burst(50); U.city=k; } ok(r); };
A.franchise=function(el){ var r=A_franchise(S,el.getAttribute('data-city')); if(r.ok){ sfx('win'); burst(40); } ok(r); };
A.close=function(el){ openModal('Закрыть заведение?','<p>Оборудование продадут за 40% его стоимости. Это нельзя отменить.</p><div class="row"><button class="btn" data-act="closeyes" data-o="'+el.getAttribute('data-o')+'">Закрыть</button><button class="btn secondary" data-act="closemodal">Отмена</button></div>'); };
A.closeyes=function(el){ var r=A_close(S,el.getAttribute('data-o')); closeModal(); ok(r); };
A.hqup=function(el){ var r=A_hq(S,el.getAttribute('data-u')); if(r.ok) sfx('coin'); ok(r); };
A.recipes=function(){ openModal('Тетрадь Тамары',recipesHTML()); };
A.term=function(el){ var k=el.getAttribute('data-k'); addTerm(k); openModal(TERMS[k][0],'<p>'+TERMS[k][1]+'</p>'); };

/* ---------- меню, справка, настройки ---------- */
function helpHTML(){
  return '<div class="terms"><div class="termc"><b>Цель</b><span>Построить сеть заведений в разных городах, держать рейтинг и накопить капитал. Точные числа зависят от сложности и показаны на «Главной».</span></div>'+
   '<div class="termc"><b>Как идёт месяц</b><span>Сюжетная сцена, иногда случай, потом вы настраиваете меню, команду, рекламу и деньги. Нажимаете «Запустить месяц» и получаете чек с итогами и подсказками.</span></div>'+
   '<div class="termc"><b>Откуда берутся деньги</b><span>Гости × средний чек. Из выручки платятся продукты (около трети), зарплаты, аренда, налог и реклама. Остаток — прибыль.</span></div>'+
   '<div class="termc"><b>Узкое место</b><span>Гостей ограничивают места в зале, официанты и кухня. Смотрите вкладку «Зал и кухня»: красная полоса показывает, что мешает.</span></div>'+
   '<div class="termc"><b>Рейтинг</b><span>Складывается из вкуса, сервиса, чистоты, уюта и честной цены. Он медленно меняется и влияет на число гостей.</span></div>'+
   '<div class="termc"><b>Если не получилось</b><span>В итогах месяца есть кнопка «Переиграть месяц»: все настройки останутся, можно поменять план.</span></div>'+
   '<div class="termc"><b>Сохранение</b><span>Игра сохраняется сама. Код для переноса на другое устройство даётся в конце первого урока и в меню.</span></div></div>';
}
A.help=function(){ openModal('Как играть',helpHTML()); };
A.glossary=function(){ openModal('Словарик',glossaryHTML()); };
A.awards=function(){ openModal('Награды',awardsHTML()); };
A.menu=function(){
  var inGame=S&&U.screen!=='title';
  openModal('Меню','<div class="pick"><button data-act="help"><span class="ico">'+ico('help')+'</span><span><b>Как играть</b></span></button><button data-act="glossary"><span class="ico">'+ico('book')+'</span><span><b>Словарик</b></span></button>'+(S?'<button data-act="awards"><span class="ico">'+ico('award')+'</span><span><b>Награды</b></span></button><button data-act="recipes"><span class="ico">'+ico('book')+'</span><span><b>Тетрадь Тамары</b></span></button><button data-act="showcode"><span class="ico">'+ico('save')+'</span><span><b>Код сохранения</b><small>Чтобы продолжить на другом устройстве</small></span></button>':'')+
   '<button data-act="teacher"><span class="ico">'+ico('chart')+'</span><span><b>Табло класса</b></span></button>'+(inGame?'<button data-act="totitle"><span class="ico">'+ico('home')+'</span><span><b>В главное меню</b><small>Прогресс сохранится</small></span></button>':'')+'</div>');
};
A.showcode=function(){ openModal('Код сохранения','<p class="small muted">Скопируйте код и вставьте его на другом устройстве в «Загрузить код».</p><textarea class="code" readonly id="savecode">'+esc(exportCode())+'</textarea><div class="row"><button class="btn small secondary" data-act="copycode">'+ico('copy')+' Скопировать</button></div>'); };
A.loadcode=function(){ openModal('Загрузить код','<p class="small muted">Вставьте код, который вы получили в конце первого урока.</p><textarea class="code" id="loadcode" aria-label="Код" placeholder="Вставьте код"></textarea><div class="row"><button class="btn small" data-act="loadgo">Загрузить</button></div>'); };
A.loadgo=function(){ var v=($('#loadcode')||{}).value||''; if(importCode(v)){ closeModal(); hudPrev={}; U.screen=U.screen==='title'?'plan':U.screen; persist(); render(); toast('Игра загружена'); } else toast('Не получилось прочитать код',true); };
A.teacher=function(){ closeModal(); U.screen='teacher'; render(); };
A.tcbuild=function(){ U.teacherText=($('#tc-in')||{}).value||''; render(true); };
A.totitle=function(){ closeModal(); clearTimers(); if(S) persist(); S=null; hudPrev={}; U={screen:'title'}; render(); };
A.continue=function(){ var d=readSave(); if(!d){ toast('Сохранения нет',true); return; } applySave(d); hudPrev={}; render(); };
A.newgame=function(){ var sv=readSave(); if(sv&&U.screen==='title'&&!U.confirmNew){ openModal('Начать заново?','<p>Сохранённая партия (месяц '+Math.min(sv.S.month,TOTAL)+') будет заменена новой.</p><div class="row"><button class="btn" data-act="newgameyes">Начать новую</button><button class="btn secondary" data-act="closemodal">Отмена</button></div>'); return; } A.newgameyes(); };
A.newgameyes=function(){ closeModal(); lsDel(KEY); S=null; hudPrev={}; U={screen:'intro',intro:0,setup:{name:'',cafe:'Первый столик',code:'',talent:'cook',diff:'norm'}}; render(); };
A.tointro=function(){ U.screen='intro'; render(); };
A.introskip=function(){ U.screen='setup'; render(); }; A.intronext=function(){ if(U.intro>=INTRO.length-1) U.screen='setup'; else U.intro++; render(); };
A.settalent=function(el){ readSetup(); U.setup.talent=el.getAttribute('data-v'); render(true); }; A.setdiff=function(el){ readSetup(); U.setup.diff=el.getAttribute('data-v'); render(true); };
function readSetup(){ var st=U.setup||(U.setup={}); var a=$('#f-name'), b=$('#f-cafe'), c=$('#f-code'); if(a) st.name=a.value; if(b) st.cafe=b.value; if(c) st.code=c.value; }
A.startgame=function(){
  readSetup(); var st=U.setup, name=(st.name||'').trim()||'Хозяин', cafe=(st.cafe||'').trim()||'Первый столик', code=(st.code||'').trim();
  var seed=code?('cls:'+code.toLowerCase()):randomSeed();
  S=newState({name:name,cafe:cafe,talent:st.talent,diff:st.diff,code:code,seed:seed}); S.awn=st.awn||'#D1361A'; hudPrev={};
  U={seen:{},actSeen:{},tab:'home'}; enterMonth();
};
A.togglesound=function(){ soundOn=!soundOn; lsSet(SND_KEY,soundOn?'1':'0'); if(soundOn) sfx('good'); renderTools(); };
A.toggletheme=function(){ var d=isDark(); document.documentElement.setAttribute('data-theme',d?'light':'dark'); lsSet(THEME_KEY,d?'light':'dark'); renderTools(); };
A.closemodal=function(){ closeModal(); }; A.modalbg=function(el,ev){ if(ev.target===el) closeModal(); };
A.skipnav=function(ev){ var s=$('#stage'); if(s){ s.focus(); } };

/* ---------- прорисовка ---------- */
function renderTools(){
  var t=$('#tools'); if(!t) return;
  t.innerHTML='<button class="iconbtn '+(soundOn?'on':'')+'" data-act="togglesound" aria-pressed="'+soundOn+'" aria-label="Звук: '+(soundOn?'включён':'выключен')+'">'+ico(soundOn?'sound':'mute')+'</button><button class="iconbtn" data-act="toggletheme" aria-label="Сменить тему оформления">'+ico(isDark()?'sun':'moon')+'</button><button class="iconbtn" data-act="menu" aria-label="Меню игры">'+ico('menu')+'</button>';
}
function stageHTML(){
  switch(U.screen){
    case 'title': return titleHTML(); case 'intro': return introHTML(); case 'setup': return setupHTML(); case 'act': return actHTML(); case 'last': return lastHTML();
    case 'scene': return sceneHTML(); case 'event': return eventHTML(); case 'rush': return rushHTML(); case 'fifo': return fifoHTML(); case 'change': return changeHTML();
    case 'plan': return planHTML(); case 'run': return runHTML(); case 'report': return reportHTML(); case 'quiz': return quizHTML();
    case 'lessonEnd': return lessonEndHTML(); case 'finale': return finaleHTML(); case 'final': return finalHTML(); case 'teacher': return teacherHTML();
  }
  return '';
}
function renderBar(){
  var b=$('#actionbar'), tb=$('#tabbar'); if(!b||!tb) return;
  var plan=S&&U.screen==='plan';
  if(!plan){ b.hidden=true; b.innerHTML=''; tb.hidden=true; tb.innerHTML=''; document.documentElement.style.setProperty('--bar-h','0px'); return; }
  tb.hidden=false; tb.innerHTML=navHTML();
  var R=getPV(), p=R?R.profit:0;
  b.hidden=false; b.innerHTML='<div class="in"><div class="fc"><small>Прогноз прибыли</small><b class="num '+(p>=0?'gain-t':'loss-t')+'">'+sgn(Math.round(p/1000)*1000).replace(/ ₽$/,'')+' ₽</b></div><button class="btn" data-act="go">'+ico('play')+' Запустить месяц</button></div>';
  var h=(b.offsetHeight||70)+(window.innerWidth<900?(tb.offsetHeight||64):0); document.documentElement.style.setProperty('--bar-h',h+'px');
}
function render(keep){
  if(!keep) clearTimers();
  var st=$('#stage'); if(!st) return;
  var y=window.scrollY; st.className='stage'+(keep?' noanim':'');
  st.innerHTML=stageHTML();
  renderHud(); renderTools(); renderBar();
  if(U.screen==='run') runAnim();
  if(U.screen==='rush'){ rushDraw(); }
  if(U.screen==='teacher'){ var ta=$('#tc-in'); if(ta&&U.teacherText) ta.value=U.teacherText; }
  if(S) persist();
  if(keep) window.scrollTo(0,y); else { window.scrollTo(0,0); if(U.screen!=='title') { try{ st.focus({preventScroll:true}); }catch(e){} } }
}

/* ---------- запуск ---------- */
function boot(){
  var th=lsGet(THEME_KEY); if(th) document.documentElement.setAttribute('data-theme',th);
  soundOn=lsGet(SND_KEY)==='1'; U={screen:'title'}; S=null; render();
  window.__game={get S(){ return S; }, get U(){ return U; }, A:A, render:render, enterMonth:enterMonth, toPlan:toPlan, setState:function(s,u){ S=s; U=u; render(); }};
  document.addEventListener('click',function(ev){
    var el=ev.target.closest?ev.target.closest('[data-act]'):null; if(!el) return;
    var act=el.getAttribute('data-act'); if(!A[act]) return; if(el.tagName==='INPUT') return;
    if(act!=='modalbg'||ev.target===el){ A[act](el,ev); }
  });
  document.addEventListener('input',function(ev){ var el=ev.target; if(el&&el.getAttribute&&el.getAttribute('data-act')==='prange') A.prange(el); });
  document.addEventListener('change',function(ev){ var el=ev.target; if(el&&el.getAttribute&&el.getAttribute('data-act')==='prange'){ persist(); render(true); } });
  document.addEventListener('keydown',function(ev){
    if((ev.key==='Enter'||ev.key===' ')&&ev.target&&ev.target.classList&&ev.target.classList.contains('pin')){ ev.preventDefault(); A.mapcity(ev.target); }
    if(ev.key==='Escape'&&$('#modal .modal')) closeModal();
  });
  (function(){ var lastY=0, ticking=false; window.addEventListener('scroll',function(){ if(ticking) return; ticking=true; window.requestAnimationFrame(function(){ ticking=false; if(window.innerWidth>900){ document.body.classList.remove('hud-away'); lastY=window.scrollY; return; } var y=window.scrollY; if(y>lastY+10&&y>220) document.body.classList.add('hud-away'); else if(y<lastY-10||y<120) document.body.classList.remove('hud-away'); lastY=y; }); },{passive:true}); })();
  window.addEventListener('resize',function(){ setHudVar(); renderBar(); });
  window.__appBack=function(){ if($('#modal .modal')){ closeModal(); return true; } if(!S||U.screen==='title') return false; if(U.screen==='teacher'){ U={screen:'title'}; S=null; render(); return true; } persist(); U={screen:'title'}; S=null; hudPrev={}; render(); toast('Прогресс сохранён: нажмите «Продолжить»'); return true; };
}
boot();
