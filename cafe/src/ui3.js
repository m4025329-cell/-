/* ===== Интерфейс, часть 3: планирование месяца (вкладки) ===== */
var TAMARA_CITY={
 tula:'«Тула. Тут я родилась, тут и первый столик. Пряник с мёдом печётся к приходу гостей, не раньше».',
 nnov:'«Нижний. На вокзале ночью пекли кулебяку. Я выпросила рецепт у проводницы за два пирожка».',
 kazan:'«Казань. Эчпочмак нужно есть горячим и руками. Всё остальное не по-настоящему».',
 spb:'«Петербург. Пышки с пудрой на Большой Конюшенной. Дождь, пудра, радость».',
 ekb:'«Екатеринбург. Пельмени на двадцать пятом градусе мороза. Я их до сих пор вижу».',
 sochi:'«Сочи. Хачапури у моря. Жара, соль и ни одного нормального полотенца».',
 kgd:'«Калининград. Марципан в лавке с колокольчиком. Дверь звякнет, и ты уже счастлива».',
 msk:'«Москва. Звезда на карте. Там всё очень быстро и очень дорого. Вернись, когда соберёшь силы».'
};
function getPV(){ if(!U.pv){ var c=cloneState(S); c.accepted=S.accepted.slice(); try{ U.pv=simMonth(c,{preview:true}); }catch(e){ U.pv=null; } } return U.pv; }
function pvOut(o){ var R=getPV(); return R&&R.outlets.filter(function(x){ return x.id===o.id; })[0]||null; }
function outletSelector(kind){
  var live=liveOutlets(S); if(live.length<2) return '';
  return '<div class="outsel" role="group" aria-label="Выбор заведения">'+live.map(function(o){ return '<button aria-pressed="'+(curO().id===o.id)+'" data-act="selout" data-o="'+o.id+'">'+ico('building','sm')+' '+esc(CITIES[o.city].n)+(S.here===o.id?' <span class="here" title="Вы здесь" aria-label="вы здесь">'+ico('flag','sm')+'</span>':'')+'</button>'; }).join('')+'</div>';
}
function metric(label,val,sub,cls){ return '<div class="'+(cls||'')+'"><small>'+label+'</small><b class="num">'+val+'</b>'+(sub?'<i>'+sub+'</i>':'')+'</div>'; }

/* ================= ГЛАВНАЯ ================= */
function goalChalk(){
  var g=goalNow(S), pr=goalProgress();
  return '<div class="chalk"><h3>'+ico('flag')+'Цель: сеть «'+esc(S.cafe)+'»</h3><ul><li class="'+(g.okCities?'done':'')+'">'+ico(g.okCities?'check':'target')+'<span>Города: <b>'+g.cities+'</b> из '+g.needCities+'</span></li><li class="'+(g.okCap?'done':'')+'">'+ico(g.okCap?'check':'target')+'<span>Капитал: <b>'+rubk(g.cap)+'</b> из '+rubk(g.needCap)+'</span></li><li class="'+(g.okRating?'done':'')+'">'+ico(g.okRating?'check':'target')+'<span>Рейтинг сети: <b>'+f1d(g.rating)+'</b> (нужно '+f1d(g.needRating)+' и выше)</span></li></ul><div class="bar" aria-hidden="true"><i style="width:'+Math.round(pr*100)+'%"></i></div><p class="dim">Осталось месяцев: '+Math.max(0,TOTAL-S.month+1)+'</p></div>';
}
function newsCardHTML(){
  var list=(S.news||[]).filter(function(x){ return x.start+x.dur>S.month; }); var body='';
  if(!list.length) body='<p class="muted">Новостей, которые влияют на рынок, пока нет.</p>';
  else body=list.map(function(x){ var N=NEWS_BY_ID[x.id]; return '<div class="insight '+(N.good?'good':'warn')+'"><span class="ico">'+ico(N.good?'trend':'warn')+'</span><div><b>'+esc(N.n)+'</b><p>'+esc(N.t)+' Ещё '+(x.start+x.dur-S.month)+' '+plural(x.start+x.dur-S.month,'месяц','месяца','месяцев')+'.</p></div></div>'; }).join('');
  var mods=S.mods.filter(function(m){ return m.why; });
  return card('Новости города',body,{ic:'chat'});
}
function homeHTML(){
  var o=curO(), R=getPV(), r=pvOut(o)||{}, last=S.lastR&&S.lastR.outlets.filter(function(x){ return x.id===o.id; })[0];
  var guestsViz=last?clamp(Math.round((last.guests/30)/Math.max(1,(last.caps?last.caps.seat:60))*7*1.4),1,7):2, queue=(last&&last.utilK>1.05)?2:0;
  var h=outletSelector('home');
  h+='<div class="cafe-hero">'+cafeSVG(o,{cal:CAL[S.month-1],guests:guestsViz,queue:queue})+'<div class="caption"><div><b>'+esc(o.nm||S.cafe)+'</b><div class="small muted">'+ico('pin','sm')+' '+esc(CITIES[o.city].n)+' · '+esc(FORMATS[o.fmt].name)+(o.built?' · строится':'')+'</div></div><div class="row" style="gap:8px">'+starsSVG(stars(o.rep),18)+'<b class="num">'+f1d(stars(o.rep))+'</b></div></div></div>';
  var ns=nextStep();
  h+=coachCard('Что дальше?',esc(ns.t),ns.tab?'<button class="btn small" data-act="tab" data-tab="'+ns.tab+'">'+esc(ns.b)+'</button>':'');
  h+=goalChalk();
  if(R){ h+=card('Прогноз на этот месяц','<div class="kpi">'+metric('Выручка',rubk(R.revTotal))+metric('Прибыль',sgn(Math.round(R.profit/1000)*1000).replace(/ ₽$/,'')+' ₽',R.profit>0?'в плюс':'в минус',R.profit>0?'ok':'bad')+metric('Гостей в день',Math.round((r.guests||0)/30),'в «'+esc(CITIES[o.city].n)+'»')+metric('Рейтинг',f1d(r.rating||stars(o.rep)),'после месяца')+'</div><p class="small muted" style="margin:0">Прогноз считается по текущим настройкам. Случайности (погода, новости) могут сдвинуть его на 5–10%.</p>',{ic:'trend'}); }
  h+=newsCardHTML();
  h+=card('Тетрадь Тамары','<p class="muted">Открыто рецептов: <b>'+S.recs.length+' из 7</b>. Они появляются по ходу истории и дают блюда с особым вкусом.</p><button class="btn secondary small" data-act="recipes">'+ico('book')+' Читать тетрадь</button>',{ic:'book'});
  var lastRev=S.hist.slice(-6);
  if(lastRev.length>1) h+=card('Динамика','<p class="sub">Прибыль по месяцам</p>'+sparkSVG(lastRev.map(function(x){ return x.profit; }),lastRev.map(function(x){ return MONTHS_SHORT[x.m-1]; })),{ic:'chart'});
  return h;
}
function sparkSVG(vals,labels){
  var W=300,H=84,pad=14, mn=Math.min.apply(null,vals.concat([0])), mx=Math.max.apply(null,vals.concat([1])), n=vals.length;
  function X(i){ return pad+(n>1?i*(W-2*pad)/(n-1):0); } function Y(v){ return H-20-(v-mn)/(mx-mn||1)*(H-34); }
  var pts=vals.map(function(v,i){ return X(i).toFixed(1)+','+Y(v).toFixed(1); }).join(' '), z=Y(0).toFixed(1);
  var area=X(0).toFixed(1)+','+z+' '+pts+' '+X(n-1).toFixed(1)+','+z;
  return '<svg class="spark" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="График: '+vals.map(function(v){ return rubk(v); }).join(', ')+'"><line class="g" x1="'+pad+'" x2="'+(W-pad)+'" y1="'+z+'" y2="'+z+'"/><polygon class="f" points="'+area+'"/><polyline class="a" points="'+pts+'"/>'+vals.map(function(v,i){ return '<circle cx="'+X(i)+'" cy="'+Y(v)+'" r="3.6" fill="var(--surface)" stroke="var(--brand)" stroke-width="2.2"/>'; }).join('')+labels.map(function(l,i){ return '<text x="'+X(i)+'" y="'+(H-4)+'" text-anchor="middle">'+l+'</text>'; }).join('')+'</svg>';
}

/* ================= МЕНЮ ================= */
function dishChips(d,o,price,ref,cost){
  var rt=price/ref, a='';
  a+=chip('', 'себестоимость '+Math.round(cost)+' ₽ · '+Math.round(cost/price*100)+'%');
  a+=chip(rt>1.12?'warn':(rt<0.9?'info':'gain'), rt>1.12?'выше рынка':(rt<0.9?'ниже рынка':'около рынка'));
  var cal=CAL[S.month-1]; if(d.h){ var fh=SEASONF.hot[cal]; a+=chip(fh>=1.15?'gain':(fh<0.8?'loss':'info'), fh>=1.15?'сейчас сезон':(fh<0.8?'не сезон':'летнее')); } if(d.c){ var fc=SEASONF.cold[cal]; a+=chip(fc>=1.15?'gain':(fc<0.8?'loss':'info'), fc>=1.15?'сейчас сезон':(fc<0.8?'не сезон':'зимнее')); } if(o.special===d.id) a+=chip('warn','блюдо дня'); if(d.sig) a+=chip('brand','из тетради'); if(d.need&&!o.std&&!hasEq(o,d.need)) a+=chip('loss','нужна '+(d.need==='oven'?'печь':'гриль'));
  return a;
}
function menuMix(o){ var rep=U.report&&U.report.outlets&&U.report.outlets.filter(function(x){ return x.id===o.id; })[0]; var m={}; if(rep&&rep.mix) rep.mix.forEach(function(x){ m[x.id]=x; }); return m; }
function dishCard(d,o,mix){
  var on=S.menu.indexOf(d.id)>=0, price=on||S.price[d.id]?priceOf(S,d):defPrice(S,d), cf=cogsFactor(S,o), cost=d.cost*cf, ref=refPrice(S,o,d), full=S.menu.length>=menuSlots(S);
  var lo=Math.max(Math.round(cost*1.15/5)*5,Math.round(ref*0.55/5)*5), hi=Math.round(ref*1.7/5)*5, m=mix[d.id], cls=m&&on?'<span class="cls '+m.cls+'">'+{star:'Звезда',horse:'Конь',puzzle:'Загадка',dog:'Балласт'}[m.cls]+'</span>':'';
  var h='<div class="dish '+(on?'on':'off')+'" data-d="'+d.id+'"><div class="glyph">'+dishSVG(d.g,d.cat,44)+'</div><div><div class="row between nowrap"><div class="name">'+esc(d.n)+'</div><div class="toggle-wrap"><button class="toggle" role="switch" aria-checked="'+on+'" aria-label="'+(on?'Убрать из меню: ':'Добавить в меню: ')+esc(d.n)+'" data-act="menutoggle" data-d="'+d.id+'"'+(!on&&full?' disabled':'')+'></button></div></div><div class="meta">'+dishChips(d,o,price,ref,cost)+' '+cls+'</div>'+(m&&on?'<div class="small muted" style="margin-top:4px">В прошлом месяце: '+Math.round(m.qty)+' порций, прибыль на блюде '+rub(m.qty*m.mar)+'</div>':'')+'</div>';
  if(on) h+='<div class="ctl"><div class="stepper" style="justify-content:space-between"><button data-act="pdec" data-d="'+d.id+'" aria-label="Цена меньше на 5 рублей">'+ico('minus')+'</button><div class="val num" id="pv-'+d.id+'">'+price+' ₽</div><button data-act="pinc" data-d="'+d.id+'" aria-label="Цена больше на 5 рублей">'+ico('plus')+'</button></div><input class="range" type="range" min="'+lo+'" max="'+hi+'" step="5" value="'+clamp(price,lo,hi)+'" style="--p:'+clamp((price-lo)/(hi-lo)*100,0,100)+'%" data-act="prange" data-d="'+d.id+'" aria-label="Цена: '+esc(d.n)+'"><div class="price-hint"><span>'+lo+' ₽</span><span>рынок ≈ '+Math.round(ref/5)*5+' ₽</span><span>'+hi+' ₽</span></div><button class="btn small '+(o.special===d.id?'mustard':'ghost')+'" data-act="special" data-d="'+d.id+'" aria-pressed="'+(o.special===d.id)+'">'+ico('star','sm')+' '+(o.special===d.id?'Блюдо дня (снять)':'Сделать блюдом дня')+'</button></div>';
  return h+'</div>';
}
function menuHTML(){
  var o=curO(), slots=menuSlots(S), mix=menuMix(o), h=outletSelector('menu'), miss=missingCats();
  var bar=''; for(var i=0;i<slots;i++) bar+='<i class="'+(i<S.menu.length?(S.menu.length>=slots?'full':'on'):'')+'"></i>';
  h+=card('Меню · '+S.menu.length+' из '+slots+' мест','<div class="slotbar" aria-hidden="true">'+bar+'</div><p class="sub">Меню общее для всей сети. Чем шире меню, тем больше гостей находят своё, но тем больше порча и нагрузка на кухню. Расширить: «Вторая линия кухни», «Книга стандартов», ресторан.</p>'+(miss.length?'<div class="chips">'+miss.map(function(c){ return chip('warn','нет: '+CATN[c].toLowerCase()); }).join('')+'</div>':'<div class="chips">'+chip('gain','все категории есть')+'</div>')+'<div class="row" style="margin-top:10px"><button class="btn small secondary" data-act="pricesync">'+ico('target')+' Подогнать цены под рынок</button></div>',{ic:'book'});
  /* местное блюдо */
  var L0=localDish(o), lp=o.lp||Math.round(L0.ref*S.pidx*CITIES[o.city].inc/5)*5;
  h+='<section class="card"><h3>'+ico('pin')+'Местное блюдо: '+esc(CITIES[o.city].n)+'</h3><div class="dish '+(o.loc!==false?'on':'off')+'" style="margin:0"><div class="glyph">'+dishSVG(L0.g,L0.cat,44)+'</div><div><div class="row between nowrap"><div class="name">'+esc(L0.n)+'</div><div class="toggle-wrap"><button class="toggle" role="switch" aria-checked="'+(o.loc!==false)+'" aria-label="Местное блюдо в меню" data-act="loctoggle"></button></div></div><div class="meta">'+chip('brand','любят туристы и гурманы')+chip('','себестоимость '+Math.round(L0.cost*cogsFactor(S,o))+' ₽')+'</div></div>'+(o.loc!==false?'<div class="ctl"><div class="stepper" style="justify-content:space-between"><button data-act="lpdec" aria-label="Цена меньше">'+ico('minus')+'</button><div class="val num" id="lp-v">'+lp+' ₽</div><button data-act="lpinc" aria-label="Цена больше">'+ico('plus')+'</button></div></div>':'')+'</div><p class="small muted" style="margin:8px 0 0">Это блюдо не занимает места в меню.</p></section>';
  /* по категориям */
  CATS.forEach(function(c){
    var list=DISHES.filter(function(d){ return d.cat===c && dishUnlocked(S,d) && !(d.u==='rest'&&!S.outlets.some(function(x){ return x.fmt==='rest'; })); });
    var onList=list.filter(function(d){ return S.menu.indexOf(d.id)>=0; }), offList=list.filter(function(d){ return S.menu.indexOf(d.id)<0; });
    var locked=DISHES.filter(function(d){ return d.cat===c && d.u==='lab' && !S.lab[d.id]; });
    h+='<div class="catrow"><span class="cdot '+CATC[c]+'"></span><h3 style="font-family:var(--font-b)">'+CATN[c]+'</h3><span class="chip">'+onList.length+' в меню</span></div>';
    onList.concat(offList).forEach(function(d){ h+=dishCard(d,o,mix); });
    locked.forEach(function(d){ var ok=S.month>=d.min, c0=labCost(S,d); h+='<div class="dish off"><div class="glyph" style="opacity:.55">'+dishSVG(d.g,d.cat,44)+'</div><div><div class="name">'+esc(d.n)+'</div><div class="meta">'+chip('', 'разработка '+rub(c0))+(ok?'':chip('warn','с '+d.min+'-го месяца'))+'</div></div><div class="ctl"><button class="btn secondary small" data-act="lab" data-d="'+d.id+'"'+(ok?'':' disabled')+'>'+ico('whisk')+' Разработать рецепт</button></div></div>'; });
  });
  if(!S.outlets.some(function(x){ return x.fmt==='rest'; })) h+=card('Блюда ресторана','<p class="muted">Форель, стейк, ризотто, тартар и фондан появятся, когда откроется ресторан.</p>',{ic:'lock'});
  /* меню-инжиниринг */
  if(Object.keys(mix).length){
    var q={star:[],horse:[],puzzle:[],dog:[]}; Object.keys(mix).forEach(function(k){ var m=mix[k]; if(!m.loc) q[m.cls].push(m); });
    function lst(a){ return a.length?'<ul>'+a.slice(0,4).map(function(m){ return '<li>'+esc(m.name)+'</li>'; }).join('')+'</ul>':'<small>нет</small>'; }
    h+=card('Какие блюда зарабатывают','<p class="sub">Итоги прошлого месяца: популярность и прибыль на блюдо.</p><div class="matrix"><div class="mq"><h4><span class="cls star">Звёзды</span></h4><small>Часто берут и хорошо зарабатывают. Берегите.</small>'+lst(q.star)+'</div><div class="mq"><h4><span class="cls horse">Кони</span></h4><small>Часто берут, но прибыли мало. Подумайте о цене.</small>'+lst(q.horse)+'</div><div class="mq"><h4><span class="cls puzzle">Загадки</span></h4><small>Выгодные, но редко берут. Расскажите о них.</small>'+lst(q.puzzle)+'</div><div class="mq"><h4><span class="cls dog">Балласт</span></h4><small>Редко берут и мало зарабатывают. Кандидаты на вылет.</small>'+lst(q.dog)+'</div></div>',{ic:'chart'});
  }
  return h;
}

/* ================= ЗАЛ И КУХНЯ ================= */
function gaugeRow(label,cap,want,isBN){ var p=cap/Math.max(1,want); return '<div class="gauge '+(isBN?'bottleneck':'')+'"><span>'+label+'</span><div class="track" role="img" aria-label="'+label+': '+Math.round(cap)+' гостей в день"><i style="width:'+clamp(p*100,4,100)+'%"></i></div><b class="num">'+Math.round(cap)+'</b></div>'; }
function placeHTML(){
  var o=curO(), r=pvOut(o), h=outletSelector('place'), fmt=FORMATS[o.fmt];
  if(o.built) return h+card('Заведение строится','<p class="muted">Откроется в начале следующего месяца. Пока можно нанять людей и настроить закупки.</p>',{ic:'building'});
  var want=r?r.wantDay:0, bn=r?bottleneck(r):null;
  h+=card('Сколько гостей можно обслужить','<p class="sub">Гостей приходит около <b>'+Math.round(want)+'</b> в день. Обслужить можно столько, сколько позволяет самое узкое место.</p>'+(r?gaugeRow('Места',r.caps.seat,want,bn==='seat')+gaugeRow('Официанты',r.caps.svc,want,bn==='svc')+gaugeRow('Кухня',r.caps.kit,want,bn==='kit'):'')+(r&&r.utilK>1.0?'<p class="chip warn" style="margin-top:6px">Спрос выше возможностей: часть гостей уходит.</p>':'<p class="chip gain" style="margin-top:6px">Запас по мощности есть.</p>'),{ic:'chart'});
  /* команда */
  var roleH='';
  ['cook','wait','bar','cln'].forEach(function(k){
    var R0=ROLES[k], n=o.staff[k], lv=o.lvl[k], w=Math.round(wageOf(S,o,k)), tc=trainCost(S,o,k), lvl='';
    for(var i=1;i<=5;i++) lvl+='<i class="'+(i<=lv?'on':'')+'"></i>';
    roleH+='<div class="role"><h4>'+ico({cook:'toque',wait:'people',bar:'cup',cln:'sparkle'}[k])+R0.n+'</h4><div class="stepper"><button data-act="fire" data-r="'+k+'" aria-label="Уволить: '+R0.n.toLowerCase()+'"'+(n<=((k==='cook'||k==='wait')?1:0)?' disabled':'')+'>'+ico('minus')+'</button><div class="val num" aria-live="polite">'+n+'</div><button data-act="hire" data-r="'+k+'" aria-label="Нанять: '+R0.n.toLowerCase()+'">'+ico('plus')+'</button></div><p class="about">'+R0.desc+' Зарплата с налогами: '+rub(w)+' на человека.</p><div class="row between" style="grid-column:1/-1"><div class="lvl" aria-label="Уровень '+lv+' из 5" title="Уровень"><span class="small muted" style="margin-right:6px">Уровень</span>'+lvl+'</div><button class="btn secondary small" data-act="train" data-r="'+k+'"'+(lv>=5||o.trained[k]||n<1?' disabled':'')+'>'+ico('cap')+' Обучить · '+rubk(tc)+'</button></div></div>';
  });
  h+=card('Команда',roleH+'<p class="sub" style="margin-top:8px">Наём стоит денег один раз, зарплата платится каждый месяц. Обучение поднимает скорость и качество у всей группы.</p>',{ic:'people'});
  /* условия работы */
  h+=card('Условия работы','<p class="sub">Часы работы</p><div class="seg3">'+HOURS.map(function(x,i){ return '<button class="segopt" aria-pressed="'+(o.hrs===i)+'" data-act="hours" data-v="'+i+'">'+x.n+'<small>'+(i===0?'меньше гостей и смен':(i===1?'как обычно':'гостей больше, смены дороже'))+'</small></button>'; }).join('')+'</div><p class="sub" style="margin-top:12px">Зарплата</p><div class="seg3">'+PAYS.map(function(x,i){ return '<button class="segopt" aria-pressed="'+(o.pay===i)+'" data-act="paylvl" data-v="'+i+'">'+x.n+'<small>'+(i===0?'настроение ниже':(i===1?'ровное':'команда держится'))+'</small></button>'; }).join('')+'</div><div class="chips"><span class="chip '+(o.mor>=65?'gain':(o.mor>=45?'warn':'loss'))+'">Настроение команды: '+Math.round(o.mor)+' из 100</span></div>'+(o.fmt!=='fran'?'<div class="row between" style="margin-top:12px"><div><b>Управляющий</b><div class="small muted">'+rub(MGR.wage*S.widx)+' в месяц, найм '+rub(MGR.hire)+'. Держит качество, когда вас нет рядом.</div></div><div class="toggle-wrap"><button class="toggle" role="switch" aria-checked="'+(!!o.mgr)+'" aria-label="Управляющий" data-act="mgr"></button></div></div>':''),{ic:'clock'});
  /* особые люди */
  var specH='';
  SPEC_IDS.forEach(function(id){ var sp=SPECS[id], inT=!!S.specs[id], av=specAvail(S,id); if(!av&&!inT) return; var here=S.specs[id]===o.id||(sp.where==='hq'&&inT), other=inT&&!here;
    specH+='<div class="spec '+(inT?'in':'')+'">'+avatarSVG(id,inT?'happy':'',56)+'<div><b>'+sp.name+'</b> <span class="role-t">'+sp.role+(sp.where==='hq'?' · на всю сеть':'')+'</span><div class="fx">'+sp.fx+'</div><div class="small muted" style="margin-bottom:6px">'+sp.desc+'</div><div class="chips" style="margin:0 0 8px">'+chip('',rub(sp.wage)+' в месяц')+(sp.hire?chip('','найм '+rub(sp.hire)):'')+(other?chip('info','работает в другом заведении'):'')+'</div>'+(inT?'<button class="btn secondary small" data-act="spec" data-id="'+id+'">Расстаться</button>':'<button class="btn small" data-act="spec" data-id="'+id+'">Позвать в команду</button>')+'</div></div>'; });
  if(specH) h+=card('Особые люди',specH,{ic:'sparkle',sub:'Они появляются по сюжету. Каждый даёт особый бонус.'});
  /* закупки */
  var sup=supOf(S,o), supBtn=Object.keys(SUPPLIERS).map(function(k){ var p=SUPPLIERS[k], dis=p.need&&ownOutlets(S).length<p.need; return '<button class="segopt" aria-pressed="'+(o.sup===k)+'" data-act="supplier" data-v="'+k+'"'+(dis?' disabled style="opacity:.5"':'')+'>'+p.name+'<small>'+(p.cost<1?'дешевле':(p.cost>1?'дороже':'как обычно'))+'</small></button>'; }).join('');
  h+=card('Закупки','<p class="sub">Поставщик</p><div class="seg3 seg4" style="grid-template-columns:repeat(2,1fr)">'+supBtn+'</div><p class="small muted" style="margin:8px 0">'+sup.desc+'</p><p class="sub" style="margin-top:12px">Запас продуктов, дней</p><div class="stepper" style="justify-content:space-between"><button data-act="stockdec" aria-label="Запас меньше"'+(o.stock<=1?' disabled':'')+'>'+ico('minus')+'</button><div class="val num">'+o.stock+' '+plural(o.stock,'день','дня','дней')+'</div><button data-act="stockinc" aria-label="Запас больше"'+(o.stock>=6?' disabled':'')+'>'+ico('plus')+'</button></div><div class="chips">'+(r?chip(r.waste>0.10?'loss':(r.waste>0.065?'warn':'gain'),'порча '+pct(r.waste))+chip(r.stockLoss>0.06?'loss':(r.stockLoss>0.02?'warn':'gain'),'стоп-лист '+pct(r.stockLoss)):'')+'</div><p class="small muted" style="margin:6px 0 0">Мало запаса: блюда заканчиваются. Много: продукты портятся. Холодильная камера делает большой запас безопаснее.</p>',{ic:'basket'});
  /* оборудование */
  var eqH='';
  EQ.forEach(function(e){ var have=o.eq[e.id]||0, c=eqCost(S,o,e), max=e.max||1, owned=have>=max, lock=e.req&&!o.eq[e.req]; var icon={oven:'cup',grill:'fire',espro:'cup',fridge:'snow',dish:'sparkle',pos:'chart',kitch2:'toque',seats:'table',terr:'sun',kids:'heart',wifi:'phone',music:'sound',deco1:'palette',deco2:'palette',deco3:'palette',deliv:'truck'}[e.id]||'wrench'; if(icon==='fire') icon='bolt';
    eqH+='<div class="item '+(have?'own':'')+'"><span class="ico">'+ico(icon)+'</span><div><b>'+esc(e.n)+(have&&max>1?' ×'+have:'')+'</b><small>'+esc(e.d)+(e.run?' Содержание '+rub(e.run)+' в месяц.':'')+'</small></div>'+(owned?'<span class="chip gain">'+ico('check','sm')+' есть</span>':'<button class="btn small secondary" data-act="buyeq" data-e="'+e.id+'"'+(lock?' disabled':'')+'>'+rubk(c)+'</button>')+'</div>'; });
  h+=card('Оборудование и ремонт','<p class="sub">Цены в этом городе: ×'+f1(CITIES[o.city].cap)+' от базовых.</p>'+eqH,{ic:'wrench'});
  return h;
}

/* ================= ГОСТИ ================= */
function guestsHTML(){
  var o=curO(), r=pvOut(o), h=outletSelector('guests'), last=U.report&&U.report.outlets&&U.report.outlets.filter(function(x){ return x.id===o.id; })[0];
  h+=card('Кто приходит','<div class="chips"><span class="chip info">Известность: '+Math.round(o.awr*100)+'%</span><span class="chip info">Постоянные: '+Math.round(o.loy*100)+'%</span><span class="chip '+(o.rep>=64?'gain':'warn')+'">Рейтинг '+f1d(stars(o.rep))+'</span></div><div class="pgrid" style="margin-top:12px">'+SEGS.map(function(sg,i){ var v=r&&r.segServed?r.segServed[sg]/30:0, tot=r?r.guests/30:1, p=tot?v/tot:0; return '<div class="prow"><span><b>'+SEGN[sg]+'</b></span><div class="t"><i style="width:'+Math.round(p*100)+'%"></i></div><b class="num">'+Math.round(v)+'</b></div>'; }).join('')+'</div><p class="small muted" style="margin:6px 0 0">Прогноз гостей в день по группам. '+SEGD.stu+' Меняйте меню и рекламу под тех, кого хотите видеть чаще.</p>',{ic:'people'});
  /* реклама */
  var mk=MKT.map(function(ch){ var on=!!o.mk[ch.id], cost=ch.cost*(hasSpec(S,'polina')?1:1); var tg=SEGS.filter(function(g){ return ch.reach[g]>=0.06; }).map(function(g){ return chip('info',SEGN[g]); }).join('');
    return '<div class="mk '+(on?'on':'')+'"><div><b>'+esc(ch.n)+'</b><div class="small muted">'+(ch.cost?rub(ch.cost)+' в месяц':'бесплатно')+(ch.id==='deliv'?', комиссия '+(o.eq.deliv?'12':'25')+'%':'')+'</div></div><div class="toggle-wrap"><button class="toggle" role="switch" aria-checked="'+on+'" aria-label="'+esc(ch.n)+'" data-act="mk" data-m="'+ch.id+'"></button></div><p>'+ch.d+'</p>'+(tg?'<div class="reach">'+tg+'</div>':'')+'</div>'; }).join('');
  h+=card('Реклама и каналы','<p class="sub">Каждый канал включается на месяц и стоит денег. Смотрите, на кого он работает.</p>'+mk,{ic:'mega'});
  /* заказы */
  var b=makeBoard(S), offs=b.offers, oh='';
  if(S.month<3) oh='<p class="muted">Заказы на банкеты появятся с третьего месяца, когда о кафе узнают.</p>';
  else if(!offs.length) oh='<p class="muted">В этом месяце заказов нет. Корпоративные обеды в рекламе и рейтинг выше помогают получать больше предложений.</p>';
  else oh=offs.map(function(x){ var oo=outletById(S,x.o), c=offerCheck(S,x), rev=x.guests*x.price; var st=x.state;
    return '<div class="offer '+st+'"><h4>'+ico('gift')+esc(x.name)+' <span class="chip">'+esc(CITIES[oo.city].n)+'</span></h4><div class="small muted">'+esc(x.who)+'. '+esc(x.text)+'</div><div class="chips"><span class="chip gain">'+x.guests+' гостей × '+rub(x.price)+' = '+rubk(rev)+'</span>'+x.need.map(function(k){ return chip(c.miss.indexOf(k)>=0?'loss':'', CATN[k].toLowerCase()); }).join('')+'</div>'+(c.miss.length?'<div class="small loss-t">В меню этого заведения нет: '+c.miss.map(function(k){ return CATN[k].toLowerCase(); }).join(', ')+'.</div>':'')+
      (st==='open'?'<div class="row"><button class="btn small" data-act="accept" data-id="'+x.id+'"'+(c.ok?'':' disabled')+'>Принять</button><button class="btn small secondary" data-act="haggle" data-id="'+x.id+'"'+(c.miss.length?' disabled':'')+'>Поторговаться +12%</button><button class="btn small ghost" data-act="decline" data-id="'+x.id+'">Отказать</button></div>':(st==='acc'?'<div class="row"><span class="chip gain">'+ico('check','sm')+' принято, выручка в этом месяце</span><button class="btn small ghost" data-act="unaccept" data-id="'+x.id+'">Отменить</button></div>':'<span class="chip">'+(st==='lost'?'клиент ушёл':'отказано')+'</span>'))+'</div>'; }).join('');
  h+=card('Заказы и банкеты',oh+'<p class="small muted" style="margin:6px 0 0">Банкет нагружает кухню. Если не справиться, придётся вернуть часть денег и репутация пострадает.</p>',{ic:'gift'});
  /* отзывы */
  if(last&&last.reviews&&last.reviews.length) h+=card('Отзывы прошлого месяца',last.reviews.map(function(rv){ return '<div class="review">'+starsSVG(rv.st,14)+'<div><div class="who">Гость</div><p>'+esc(rv.t)+'</p></div></div>'; }).join(''),{ic:'chat'});
  return h;
}

/* ================= ДЕНЬГИ ================= */
function plRow(name,val,kind,hint,mx){ if(Math.abs(val)<0.5) return ''; return '<div class="pl-row '+kind+'"><span>'+name+(hint?' <span class="hint">'+hint+'</span>':'')+'</span><b class="num">'+(kind==='minus'?'−':(kind==='plus'?'+':''))+rub(Math.abs(val)).replace('−','')+'</b><div class="bar"><i style="width:'+clamp(Math.abs(val)/Math.max(1,mx)*100,0,100).toFixed(1)+'%"></i></div></div>'; }
function plHTML(R){
  var t=R.total, mx=Math.max(1,R.revTotal);
  return '<div class="pl">'+plRow('Выручка',R.total.rev,'plus','гости, доставка, банкеты',mx)+plRow('Роялти франшиз',t.royalty,'plus','',mx)+plRow('Продукты',t.cogs,'minus','себестоимость',mx)+plRow('Зарплаты',t.wages,'minus','с налогами работодателя',mx)+plRow('Аренда',t.rent,'minus','',mx)+plRow('Коммунальные и прочее',t.util+t.other,'minus','',mx)+plRow('Реклама',t.mkt,'minus','',mx)+plRow('Комиссия доставки',t.delComm,'minus','',mx)+plRow('Штаб-квартира сети',t.hq,'minus','управление и особые люди',mx)+plRow('Проценты по кредитам',R.interest,'minus','',mx)+plRow('Налог',R.tax,'minus',S.flags.emmaAuto?'Эмма выбирает режим':(S.tax==='15'?'15% с разницы':'6% с выручки'),mx)+plRow('Доля партнёров',R.div,'minus','инвестор и партнёр',mx)+'<div class="pl-row total"><span>Прибыль</span><b class="num '+(R.profit>=0?'gain-t':'loss-t')+'">'+sgn(R.profit)+'</b></div></div>';
}
function breakEven(R){
  var live=R.outlets.filter(function(r){ return r.guests>0&&!r.building; }); if(!live.length) return null;
  var fixed=R.total.wages+R.total.rent+R.total.util+R.total.mkt+R.total.hq+R.interest, rev=R.total.rev, cogs=R.total.cogs, guests=R.total.guests;
  var cm=(rev-cogs-R.total.delComm-R.total.other)/Math.max(1,guests)*(S.tax==='6'?0.94:1)*0.97;
  return {fixed:fixed, perDay:fixed/(Math.max(1,cm)*30), actual:guests/30};
}
function moneyHTML(){
  var R=getPV(), h=''; if(!R) return '<p class="muted">Прогноз временно недоступен.</p>';
  var be=breakEven(R);
  h+=card('Прогноз месяца',plHTML(R),{ic:'coins',sub:'Так выглядит месяц при текущих настройках. Он считается по тем же правилам, что и итоги.'});
  if(be) h+=card('Точка безубыточности','<div class="kpi">'+metric('Нужно гостей в день',Math.round(be.perDay),'чтобы выйти в ноль')+metric('Ожидается',Math.round(be.actual),'в день',be.actual>=be.perDay?'ok':'bad')+metric('Постоянные расходы',rubk(be.fixed),'за месяц')+metric('Запас',be.actual>=be.perDay?'+'+Math.round(be.actual-be.perDay):'−'+Math.round(be.perDay-be.actual),'гостей в день',be.actual>=be.perDay?'ok':'bad')+'</div>'+termChip('breakeven')+' '+termChip('fixed'),{ic:'target'});
  /* налоги */
  var at=S.flags.emmaAuto;
  h+=card('Налоговый режим','<p class="sub">Сравнение на вашем прогнозе месяца.</p><div class="seg3 seg2" style="grid-template-columns:repeat(2,1fr)"><button class="segopt" aria-pressed="'+(S.tax==='6'&&!at)+'" data-act="tax" data-v="6"'+(at?' disabled':'')+'>Доходы 6%<small>налог '+rubk(R.tax6)+'</small></button><button class="segopt" aria-pressed="'+(S.tax==='15'&&!at)+'" data-act="tax" data-v="15"'+(at?' disabled':'')+'>Доходы − расходы 15%<small>налог '+rubk(R.tax15)+'</small></button></div>'+(at?'<p class="chip gain" style="margin-top:8px">Эмма Григорьевна сама выбирает выгодный режим</p>':'')+'<p class="small muted" style="margin:8px 0 0">На режиме 15% продукты с рынка без чеков не считаются расходами. Менять режим можно только до запуска месяца.</p>'+termChip('simple')+' '+termChip('tax'),{ic:'percent'});
  /* кредит */
  var lim=loanLimit(S), room=lim-S.debt;
  h+=card('Кредит','<div class="kpi">'+metric('Кредит банка',rubk(S.debt),'под 1,6% в месяц')+metric('Проценты в месяц',rubk(S.debt*BANK.rate+S.emerg*0.035),'')+metric('Можно взять ещё',rubk(Math.max(0,room)),'лимит '+rubk(lim))+metric('Экстренный долг',rubk(S.emerg),S.emerg?'3,5% в месяц':'нет',S.emerg?'bad':'')+'</div><div class="row"><button class="btn small" data-act="borrow" data-v="250000"'+(room<250000?' disabled':'')+'>Взять 250 000 ₽</button><button class="btn small secondary" data-act="repay" data-v="250000"'+(S.debt+S.emerg<=0?' disabled':'')+'>Погасить 250 000 ₽</button>'+(S.debt+S.emerg>0?'<button class="btn small ghost" data-act="repay" data-v="all">Погасить всё возможное</button>':'')+'</div><p class="small muted" style="margin:8px 0 0">Кредит даёт деньги сейчас, но проценты платятся каждый месяц, пока долг не вернули.</p>'+termChip('loan'),{ic:'bank'});
  if(S.month>=9||S.flags.expand){ h+=card('Инвестор','<p>'+(S.invest?'Артём Викторович в деле: он получает 20% чистой прибыли каждый месяц.':'Артём Викторович готов вложить '+rub(INVESTOR.sum)+' за 20% чистой прибыли навсегда.')+'</p>'+(S.invest?'':'<button class="btn small" data-act="invest">Взять инвестора</button>')+'<div style="margin-top:8px">'+termChip('equity')+'</div>',{ic:'handshake'}); }
  var hist=S.hist.slice(-8);
  if(hist.length>1) h+=card('Деньги по месяцам','<p class="sub">Прибыль</p>'+sparkSVG(hist.map(function(x){ return x.profit; }),hist.map(function(x){ return MONTHS_SHORT[x.m-1]; }))+'<p class="sub" style="margin-top:10px">Капитал</p>'+sparkSVG(hist.map(function(x){ return x.cap; }),hist.map(function(x){ return MONTHS_SHORT[x.m-1]; })),{ic:'chart'});
  h+=card('Из чего состоит капитал','<div class="pl"><div class="pl-row"><span>Деньги в кассе</span><b class="num">'+rub(S.cash)+'</b></div><div class="pl-row"><span>Оборудование и ремонт <span class="hint">55% от стоимости</span></span><b class="num">'+rub(ownerOutletValue(S))+'</b></div><div class="pl-row minus"><span>Долги</span><b class="num">−'+rub(S.debt+S.emerg).replace('−','')+'</b></div><div class="pl-row total"><span>Капитал</span><b class="num">'+rub(capital(S))+'</b></div></div>',{ic:'coins'});
  return h;
}

/* ================= СЕТЬ ================= */
function cityBars(c){
  var mx=Math.max.apply(null,c.seg);
  return '<div class="pgrid">'+SEGS.map(function(sg,i){ return '<div class="prow"><span>'+SEGN[sg]+'</span><div class="t"><i style="width:'+Math.round(c.seg[i]/mx*100)+'%"></i></div><b class="num">'+c.seg[i]+'</b></div>'; }).join('')+'</div>';
}
function seasonBars(c){
  var cur=CAL[S.month-1], mx=Math.max.apply(null,c.tur), mths=['Я','Ф','М','А','М','И','И','А','С','О','Н','Д'], out='<svg viewBox="0 0 240 56" class="spark" style="height:56px" role="img" aria-label="Поток туристов по месяцам">';
  c.tur.forEach(function(v,i){ var h=v/mx*34; out+='<rect x="'+(6+i*19.5)+'" y="'+(40-h)+'" width="13" height="'+h+'" rx="3" fill="'+(i===cur?'var(--brand)':'var(--edge-strong)')+'"/><text x="'+(12.5+i*19.5)+'" y="52" text-anchor="middle">'+mths[i]+'</text>'; });
  return out+'</svg>';
}
function cityHTML(k){
  var c=CITIES[k], own=S.outlets.filter(function(o){ return o.city===k; })[0], chk=cityOpenable(S,k), cc=openCost(S,k,'cafe'), rc=openCost(S,k,'rest');
  var h='<section class="card city-card"><h3>'+ico('pin')+esc(c.n)+' <span class="chip">'+c.pop+'</span></h3><p class="sub">'+esc(c.note)+'</p><div class="chat" style="margin:6px 0"><div class="line" style="margin:0">'+avatarSVG('tamara','happy',44)+'<div class="grow"><div class="bubble" style="font-family:var(--font-chalk);font-size:19px;background:#FFF3C9;color:#3A2A10;border-color:#E3C16A">'+esc(TAMARA_CITY[k])+'</div></div></div></div>'+
   '<div class="kpi">'+metric('Аренда кафе',rubk(c.rent),'в месяц')+metric('Достаток','×'+f1(c.inc),'к среднему')+metric('Конкуренция',pct(c.comp),c.comp>0.5?'высокая':(c.comp>0.4?'заметная':'умеренная'),c.comp>0.5?'bad':'')+metric('Климат',c.climate,'')+'</div>'+
   '<p class="sub">Гостей в день рядом (для кафе)</p>'+cityBars(c)+'<p class="sub">Сезонность туристов</p>'+seasonBars(c)+
   '<div class="row" style="margin:6px 0"><div class="glyph" style="width:48px;height:48px;border-radius:14px;background:var(--surface-3);display:grid;place-items:center">'+dishSVG(c.loc.g,c.loc.cat,38)+'</div><div><b>'+esc(c.loc.n)+'</b><div class="small muted">Местное блюдо: его любят туристы и гурманы</div></div></div>';
  if(own){ var r=own.last;
    h+='<div class="card soft"><b>'+(own.fmt==='fran'?'Франшиза':FORMATS[own.fmt].name)+' '+(own.built?'строится':'работает')+'</b><div class="chips">'+chip('info','рейтинг '+f1d(stars(own.rep)))+(r?chip('',' выручка '+rubk(r.rev)):'')+(r?chip('','гостей в день '+Math.round(r.guests/30)):'')+'</div></div>';
    if(own.fmt!=='fran'&&!own.built) h+='<div class="row"><button class="btn small" data-act="selout" data-o="'+own.id+'" data-go="place">Управлять заведением</button><button class="btn small secondary" data-act="sethere" data-o="'+own.id+'"'+(S.here===own.id?' disabled':'')+'>'+(S.here===own.id?'Вы здесь в этом месяце':'Быть здесь в этом месяце')+'</button></div>';
  } else if(!chk.ok){ h+='<p class="chip warn">'+ico('lock','sm')+' '+esc(chk.why)+'</p>'; }
  else {
    var canR=flagship(S).rep>=58||S.flags.restOK;
    h+='<div class="grid2" style="margin-top:8px"><div class="card soft" style="margin:0"><b>'+ico('cup','sm')+' Кафе</b><div class="small muted">24 места. '+FORMATS.cafe.desc+'</div><p class="num" style="margin:6px 0">'+rub(cc.total)+'</p><button class="btn small wide" data-act="opencity" data-city="'+k+'" data-f="cafe"'+(S.cash<cc.total?' disabled':'')+'>Открыть кафе</button></div>'+
     '<div class="card soft" style="margin:0"><b>'+ico('chef','sm')+' Ресторан</b><div class="small muted">56 мест. '+FORMATS.rest.desc+'</div><p class="num" style="margin:6px 0">'+rub(rc.total)+'</p><button class="btn small wide" data-act="opencity" data-city="'+k+'" data-f="rest"'+(S.cash<rc.total||!canR?' disabled':'')+'>Открыть ресторан</button>'+(!canR?'<div class="small muted" style="margin-top:4px">Нужен рейтинг флагмана 3,8+</div>':'')+'</div></div>'+
     '<div class="card soft" style="margin:8px 0 0"><b>'+ico('handshake','sm')+' Франшиза</b><div class="small muted">Партнёр платит взнос ≈ '+rubk(Math.round(280000*c.inc/10000)*10000)+' и 8% с выручки. Качеством нужно управлять издалека.</div><button class="btn small secondary" style="margin-top:6px" data-act="franchise" data-city="'+k+'"'+(S.hq.upg.fran&&franOutlets(S).length<2?'':' disabled')+'>Продать франшизу</button>'+(!S.hq.upg.fran?'<div class="small muted" style="margin-top:4px">Нужен «Пакет франшизы» ниже.</div>':'')+'</div>'+
     '<p class="small muted" style="margin:8px 0 0">Стоимость включает ремонт, оборудование и залог за два месяца аренды. Заведение строится месяц и всё это время платит аренду.</p>';
  }
  return h+'</section>';
}
function netHTML(){
  stepOnTab('net');
  var sel=U.city||(S.outlets.length>1?S.outlets[S.outlets.length-1].city:'nnov'), h='';
  h+='<section class="card map-card"><h3>'+ico('map')+'Карта Тамары</h3><p class="sub" style="padding:0 6px">Нажимайте на города. Цель: '+DIFFS[S.diff].cities+' города и капитал '+rubk(DIFFS[S.diff].cap)+'.</p>'+mapSVG(S,sel)+'<div class="chips" style="padding:6px"><span class="chip brand">красный: работает</span><span class="chip warn">жёлтый: строится</span><span class="chip">пустой: свободен</span></div></section>';
  h+=cityHTML(sel);
  /* заведения */
  var rows=S.outlets.map(function(o){ var r=o.last; return '<div class="item '+(o.fmt==='fran'?'':'own')+'"><span class="ico">'+ico(o.fmt==='fran'?'handshake':(o.fmt==='rest'?'chef':'cup'))+'</span><div><b>'+esc(CITIES[o.city].n)+' · '+FORMATS[o.fmt].name+'</b><small>'+(o.built?'строится':(r?'выручка '+rubk(r.rev)+', рейтинг '+f1d(stars(o.rep)):'новое'))+(o.mgr?' · управляющий':'')+(S.here===o.id?' · вы здесь':'')+'</small></div>'+(o.fmt!=='fran'&&o!==S.outlets[0]?'<button class="btn small ghost" data-act="close" data-o="'+o.id+'" aria-label="Закрыть заведение">'+ico('trash')+'</button>':'<span></span>')+'</div>'; }).join('');
  h+=card('Ваши заведения ('+S.outlets.length+')',rows+'<p class="small muted" style="margin:8px 0 0">В каждом городе можно открыть одно заведение. Заведение без вас и управляющего теряет качество: выберите, где вы в этом месяце.</p>',{ic:'building'});
  /* бренд */
  h+=card('Бренд сети','<div class="row between"><b>Узнаваемость: '+Math.round(S.hq.brand)+'%</b></div><div class="gauge-bar"><i style="width:'+S.hq.brand+'%"></i></div><p class="small muted" style="margin:6px 0 0">Растёт от числа заведений, их рейтинга и ребрендинга. Новые заведения открываются с большей известностью.</p>',{ic:'palette'});
  /* штаб */
  var hq=HQUP.map(function(u){ var have=!!S.hq.upg[u.id], lock=S.month<u.min||(u.req&&!S.hq.upg[u.req])||(u.id==='central'&&ownOutlets(S).length<3)||(u.id==='buy'&&ownOutlets(S).length<2), why=S.month<u.min?'с '+u.min+'-го месяца':(u.req&&!S.hq.upg[u.req]?'нужно: '+HQUPD[u.req].n:(u.id==='central'&&ownOutlets(S).length<3?'от трёх заведений':(u.id==='buy'&&ownOutlets(S).length<2?'от двух заведений':'')));
    return '<div class="item '+(have?'own':'')+'"><span class="ico">'+ico(u.ico)+'</span><div><b>'+esc(u.n)+'</b><small>'+esc(u.d)+(why&&!have?' <b>('+why+')</b>':'')+'</small></div>'+(have?'<span class="chip gain">'+ico('check','sm')+' есть</span>':'<button class="btn small secondary" data-act="hqup" data-u="'+u.id+'"'+(lock?' disabled':'')+'>'+rubk(u.cost)+'</button>')+'</div>'; }).join('');
  h+=card('Штаб-квартира: развитие сети',hq,{ic:'factory'});
  return h;
}

function planHTML(){
  U.pv=null;
  var t=U.tab||'home', body='';
  if(t==='home') body=homeHTML(); else if(t==='menu') body=menuHTML(); else if(t==='place') body=placeHTML(); else if(t==='guests') body=guestsHTML(); else if(t==='money') body=moneyHTML(); else if(t==='net') body=netHTML();
  return '<div id="plan-body">'+body+'</div>';
}
