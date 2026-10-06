/* ===== «Первый столик»: награды, подсказки по месяцу, «Золотая вилка», итоги партии ===== */
var ACH = [
 {id:'open',   n:'Дверь открыта',      d:'Пройден первый месяц работы кафе.',      icon:'door',    t:function(s,R){ return s.month>=2; }},
 {id:'profit', n:'Первая прибыль',     d:'Месяц закончился в плюсе.',               icon:'coins',   t:function(s,R){ return R && R.profit>0; }},
 {id:'star4',  n:'Четыре звезды',      d:'Рейтинг флагмана 4,0 и выше.',            icon:'star',    t:function(s,R){ return stars(flagship(s).rep)>=4; }},
 {id:'star45', n:'Почти пятёрка',      d:'Рейтинг флагмана 4,5 и выше.',            icon:'star',    t:function(s,R){ return stars(flagship(s).rep)>=4.5; }},
 {id:'g100',   n:'Сто гостей в день',  d:'Одно заведение приняло 100 гостей в день.', icon:'people', t:function(s,R){ return R && R.outlets.some(function(r){ return r.guests/30>=100; }); }},
 {id:'rec4',   n:'Хранитель тетради',  d:'Открыто четыре рецепта Тамары.',          icon:'book',    t:function(s,R){ return s.recs.length>=4; }},
 {id:'rec7',   n:'Все страницы',       d:'Открыты все семь рецептов.',              icon:'book',    t:function(s,R){ return s.recs.length>=7; }},
 {id:'chef',   n:'Шеф у плиты',        d:'Арсен Михайлович в команде.',             icon:'toque',   t:function(s,R){ return !!s.specs.arsen; }},
 {id:'terr',   n:'Летняя терраса',     d:'Открыта терраса.',                        icon:'sun',     t:function(s,R){ return s.outlets.some(function(o){ return o.eq.terr; }); }},
 {id:'loan',   n:'Первый кредит',      d:'Взят кредит в банке.',                    icon:'bank',    t:function(s,R){ return s.debt>0 || s.flags.hadLoan; }},
 {id:'invest', n:'Партнёр по делу',    d:'В дело вошёл инвестор.',                  icon:'handshake', t:function(s,R){ return !!s.invest; }},
 {id:'city2',  n:'Второй город',       d:'Второе заведение в другом городе.',        icon:'map',     t:function(s,R){ return cityCountOpenWithFran(s)>=2; }},
 {id:'city3',  n:'Сеть из трёх',       d:'Заведения в трёх городах.',                icon:'map',     t:function(s,R){ return cityCountOpenWithFran(s)>=3; }},
 {id:'city4',  n:'Сеть из четырёх',    d:'Заведения в четырёх городах.',             icon:'map',     t:function(s,R){ return cityCountOpenWithFran(s)>=4; }},
 {id:'city5',  n:'Карта Тамары',       d:'Заведения в пяти городах.',                icon:'map',     t:function(s,R){ return cityCountOpenWithFran(s)>=5; }},
 {id:'rest',   n:'Свой ресторан',      d:'Открыт ресторан.',                         icon:'chef',    t:function(s,R){ return s.outlets.some(function(o){ return o.fmt==='rest' && !o.built; }); }},
 {id:'fran',   n:'Под вашим именем',   d:'Открыта первая франшиза.',                 icon:'handshake', t:function(s,R){ return franOutlets(s).length>0; }},
 {id:'mgr',    n:'Доверие',            d:'В заведении есть управляющий.',            icon:'tie',     t:function(s,R){ return s.outlets.some(function(o){ return o.mgr; }); }},
 {id:'debtfree',n:'Без долгов',        d:'Нет кредитов при трёх городах.',           icon:'shield',  t:function(s,R){ return s.debt+s.emerg===0 && cityCountOpenWithFran(s)>=3; }},
 {id:'cash1',  n:'Миллион в кассе',    d:'Денег на счёте больше миллиона.',          icon:'coins',   t:function(s,R){ return s.cash>=1000000; }},
 {id:'cap2',   n:'Капитал 2 миллиона', d:'Капитал сети больше двух миллионов.',      icon:'coins',   t:function(s,R){ return capital(s)>=2000000; }},
 {id:'loyal',  n:'Свои люди',          d:'Постоянные гости составляют половину потока.', icon:'heart', t:function(s,R){ return flagship(s).loy>=0.5; }},
 {id:'clean',  n:'Образцовая чистота', d:'Санитарная проверка пройдена без замечаний.', icon:'shield', t:function(s,R){ return !!s.flags.inspectOK; }},
 {id:'stars3', n:'Меню звёзд',         d:'В меню три блюда-«звезды» одновременно.',  icon:'star',    t:function(s,R){ var r=R&&R.outlets[0]; return r && r.mix && r.mix.filter(function(x){ return x.cls==='star'; }).length>=3; }},
 {id:'nowar',  n:'Не продаёмся',       d:'Отказались от рецептов за деньги.',        icon:'shield',  t:function(s,R){ return !!(s.flags.nazWar || (s.month>=8 && !s.flags.nazPartner && !s.flags.nazMerge)); }},
 {id:'goals5',  n:'Исполнительный владелец', d:'Выполнено 5 заданий месяца.',          icon:'target', t:function(s,R){ return s.stats.goalsDone>=5; }},
 {id:'goals15', n:'Мастер заданий',     d:'Выполнено 15 заданий месяца.',            icon:'target', t:function(s,R){ return s.stats.goalsDone>=15; }},
 {id:'reg1',   n:'Друг кафе',          d:'Один из постоянных гостей стал другом.',  icon:'heart',  t:function(s,R){ return s.stats.reg5>=1; }},
 {id:'reg3',   n:'Своя компания',      d:'Три постоянных гостя стали друзьями.',    icon:'heart',  t:function(s,R){ return s.stats.reg5>=3; }},
 {id:'dep',    n:'Копилка',            d:'На вкладе лежит 300 000 ₽ и больше.',     icon:'bank',   t:function(s,R){ return (s.dep||0)>=300000; }},
 {id:'ins',    n:'Подушка безопасности',d:'Включена страховка.',                    icon:'shield', t:function(s,R){ return !!s.insured; }},
 {id:'build',  n:'Своя земля',         d:'Куплено здание кафе.',                    icon:'building',t:function(s,R){ return !!s.flags.ownBuilding; }},
 {id:'city6',  n:'Шесть городов',      d:'Заведения в шести городах.',              icon:'map',    t:function(s,R){ return cityCountOpenWithFran(s)>=6; }},
 {id:'menu12', n:'Богатое меню',       d:'В меню двенадцать блюд и больше.',        icon:'book',   t:function(s,R){ return s.menu.length>=12; }},
 {id:'hol3',   n:'Праздничный владелец',d:'Три праздничные кампании.',              icon:'gift',   t:function(s,R){ return s.stats.holidays>=3; }},
 {id:'hq6',    n:'Большой штаб',       d:'Шесть улучшений штаб-квартиры.',          icon:'factory',t:function(s,R){ return Object.keys(s.hq.upg).length>=6; }},
 {id:'rev2m',  n:'Два миллиона выручки',d:'Выручка сети за месяц выше 2 млн ₽.',    icon:'trend',  t:function(s,R){ return R && R.revTotal>=2000000; }},
 {id:'mini',   n:'Золотые руки',       d:'Золото в двух мини-играх.',               icon:'award',  t:function(s,R){ return s.stats.miniGold>=2; }},
 {id:'rival',  n:'Лучше соседей',      d:'Рейтинг флагмана выше всех конкурентов города.',icon:'star',t:function(s,R){ var f=flagship(s); return rivalsFor(s,f.city).every(function(r){ return f.rep>r.q; }) && s.month>=4; }},
 {id:'fork',   n:'Золотая вилка',      d:'Гид признал ваше заведение лучшим.',       icon:'fork',    t:function(s,R){ return !!s.flags.goldFork; }}
];
function checkAch(s,R){
  var got=[]; ACH.forEach(function(a){ if(s.ach[a.id]) return; var ok=false; try{ ok=a.t(s,R); }catch(e){} if(ok){ s.ach[a.id]=s.month; got.push(a); } });
  return got;
}

/* сильные и слабые места месяца: короткие карточки для итогового экрана */
function monthInsights(s,R){
  var out=[], t=R.total, live=R.outlets.filter(function(r){ return !r.building && r.rev>0; });
  if(!live.length || !(t.rev>0)) return out;
  var fc=t.cogs/t.rev, lab=t.wages/t.rev, prime=fc+lab, rentS=t.rent/t.rev;
  function add(k,h,tx,term){ out.push({k:k,h:h,t:tx,term:term}); }
  if(fc>0.37) add('warn','Продукты дороги','Продукты съели '+pct(fc)+' выручки. Ориентир 28–33%. Пересмотрите блюда с низкой маржой, цены и поставщика.','foodcost');
  else if(fc<0.27) add('good','Продукты в порядке','Фуд-кост '+pct(fc)+': отличный результат. Проверьте, что качество не страдает.','foodcost');
  if(prime>0.68) add('warn','Прайм-кост высокий','Продукты и зарплаты вместе '+pct(prime)+' выручки. Выше 65% остаётся мало на аренду и налоги.','prime');
  else if(prime<0.58) add('good','Прайм-кост хороший','Продукты и зарплаты вместе '+pct(prime)+'. Есть запас на развитие.','prime');
  if(rentS>0.16) add('warn','Аренда тяжёлая','Аренда занимает '+pct(rentS)+' выручки. Нужно больше гостей или выше чек.','rent');
  /* самая большая потеря гостей */
  var worst=null;
  live.forEach(function(r){ if(!r.m) return; var m=r.m, arr=[['cap',m.cap,'Не хватило мест, официантов или кухни'],['menuprice',m.menuprice,'Гости ушли из-за меню и цен'],['aware',m.aware,'Многие просто не знают о вас'],['stock',m.stock,'Блюда заканчивались (стоп-лист)']]; arr.forEach(function(x){ if(!worst || x[1]>worst.v) worst={v:x[1], k:x[0], t:x[2], r:r}; }); });
  if(worst && worst.v>60) add('info','Где теряются гости', worst.t+': около '+Math.round(worst.v)+' человек за месяц в «'+CITIES[worst.r.city].n+'».', worst.k==='cap'?'capacity':(worst.k==='aware'?'loyalty':(worst.k==='stock'?'stock':'pricing')));
  var capBound=live.filter(function(r){ return r.utilK>1.0; })[0];
  if(capBound){ var c=capBound.caps, mn=Math.min(c.seat,c.svc,c.kit); var what=mn===c.seat?'мест в зале':(mn===c.svc?'официантов и баристы':'мощности кухни'); add('warn','Узкое место','Заведению в «'+CITIES[capBound.city].n+'» не хватает '+what+'. Именно оно ограничивает выручку.','capacity'); }
  var w=live.filter(function(r){ return r.waste>0.10; })[0];
  if(w) add('warn','Много порчи','В «'+CITIES[w.city].n+'» портится '+pct(w.waste)+' продуктов. Уменьшите запас или купите холодильную камеру.','waste');
  var so=live.filter(function(r){ return r.stockLoss>0.06; })[0];
  if(so) add('warn','Блюда заканчиваются','Из-за стоп-листа потеряно '+pct(so.stockLoss)+' заказов в «'+CITIES[so.city].n+'». Увеличьте запас.','stock');
  var weakDim=null; live.forEach(function(r){ if(!r.dims) return; ['food','svc','cln','atmo','val'].forEach(function(k){ if(!weakDim || r.dims[k]<weakDim.v) weakDim={k:k, v:r.dims[k], r:r}; }); });
  if(weakDim && weakDim.v<55){ var names={food:'Вкус блюд',svc:'Сервис',cln:'Чистота',atmo:'Уют',val:'Цена и качество'}, tips={food:'Нужен более сильный повар, свежие продукты или лучше блюда.',svc:'Нужно больше официантов, обучение или меньше загрузки.',cln:'Нужен сотрудник на уборку и мойку.',atmo:'Поможет ремонт, музыка и террасы.',val:'Цены выше рынка: гости считают порции дорогими.'}; add('warn',names[weakDim.k]+' тянет рейтинг вниз',tips[weakDim.k]+' Сейчас '+Math.round(weakDim.v)+' из 100.','rating'); }
  if(s.tax==='6' && R.tax15<R.tax6*0.85) add('info','Режим 15% был бы выгоднее','Налог на «доходах минус расходах» был бы '+rub(R.tax15)+' вместо '+rub(R.tax6)+'. Решение принимается в сцене с Эммой Григорьевной.','simple');
  var dogs=[]; live.forEach(function(r){ r.mix.forEach(function(m){ if(m.cls==='dog' && m.qty>0 && !m.loc) dogs.push(m.name); }); });
  if(dogs.length) add('info','Кандидаты на вылет','Блюда, которые мало продаются и мало зарабатывают: '+dogs.slice(0,3).join(', ')+'. Освободите место в меню.','menueng');
  if(R.interest>0 && R.interest>t.rev*0.03) add('warn','Проценты по долгам','На проценты ушло '+rub(R.interest)+'. Если денег хватает, часть долга можно погасить.','loan');
  if(t.delComm>t.rev*0.04) add('info','Комиссия доставки','Сервис доставки забрал '+rub(t.delComm)+'. Свои курьеры и упаковка снижают комиссию.','commission');
  return out.slice(0,6);
}

/* «Золотая вилка»: оценка выбранного заведения по последнему месяцу */
function forkScore(s){
  var oid=s.flags.forkOutlet||flagship(s).id, last=s.lastR2||s.lastR, r=last&&last.outlets.filter(function(x){ return x.id===oid; })[0];
  var o=outletById(s,oid)||flagship(s);
  if(!r||!r.dims) return {score:stars(o.rep)*15, tier:'none', name:o.nm};
  var d=r.dims, v=0.40*d.food+0.25*d.svc+0.15*d.cln+0.10*d.atmo+0.10*d.val+s.recs.length*0.8+s.hq.brand*0.06;
  return {score:v, tier:v>=74?'gold':(v>=65?'silver':(v>=56?'bronze':'none')), name:o.nm, dims:d};
}
var FORK_NAMES = {gold:'Золотая вилка', silver:'Серебряная вилка', bronze:'Рекомендация гида', none:'Без награды'};

/* итоговое звание партии */
function verdict(s){
  var g=goalNow(s), fork=forkScore(s), met=goalMet(s);
  if(s.bankrupt) return {id:'bankrupt', name:'Закрытые двери', text:'Кафе пришлось закрыть: долги оказались больше возможностей. Это не конец: опыт стоит дорого, а ваши записи остаются.'};
  if(met && fork.tier==='gold') return {id:'legend', name:'Легенда «Первого столика»', text:'Карта Тамары собрана, гид признал вас, а в каждом городе стоит столик, за которым ждут. Тамара гордилась бы вами.'};
  if(met) return {id:'network', name:'Сеть мечты', text:'Вы построили сеть заведений в разных городах и удержали рейтинг. Цель достигнута.'};
  if(g.cities>=3 && g.cap>=DIFFS[s.diff].cap*0.6) return {id:'growing', name:'Растущая сеть', text:'Сеть уже работает в нескольких городах. До цели чуть-чуть не хватило, но дорога выбрана верно.'};
  if(g.cities>=3) return {id:'young', name:'Молодая сеть', text:'Заведения открыты в '+g.cities+' городах, но расходы на запуск ещё не окупились и капитала мало. Дайте сети время или погасите долги.'};
  if(g.cities>=2) return {id:'two', name:'Два города', text:'У вас два города и твёрдая основа. Для сети нужно больше времени и денег, но это сильное начало.'};
  if(g.cap>=800000) return {id:'cafe', name:'Любимое кафе города', text:'Одно кафе, но какое: гости идут издалека. Сеть можно строить и дальше.'};
  return {id:'first', name:'Первые шаги', text:'Вы дошли до конца пути. Теперь знаете, где терялись деньги и гости, и сможете сыграть лучше.'};
}
function mainLesson(s){
  var h=s.hist, arr=[];
  var best=h.reduce(function(a,b){ return (b.profit>a.profit)?b:a; }, h[0]||{profit:0,m:1}), worst=h.reduce(function(a,b){ return (b.profit<a.profit)?b:a; }, h[0]||{profit:0,m:1});
  return {best:best, worst:worst};
}

/* строка для табло класса */
function resultLine(s){
  var g=goalNow(s), f=forkScore(s), done=Math.min(s.month-1,TOTAL);
  return s.name+' | кафе «'+s.cafe+'» | талант '+(s.talent?TALENTS[s.talent].name:'—')+' | '+DIFFS[s.diff].name+(s.code?' | код '+s.code:'')+' | месяц '+done+' из '+TOTAL+' | капитал '+Math.round(g.cap)+' ₽ | города '+g.cities+' | рейтинг '+f1d(g.rating)+' | '+(goalMet(s)?'цель достигнута':'цель не достигнута')+' | '+FORK_NAMES[f.tier]+' | переигрываний '+(s.rewinds||0)+' | викторина '+sumArr(s.quizScore||[])+' | награды '+Object.keys(s.ach||{}).length;
}
function parseResults(text){
  var rows=[]; String(text||'').split(/\r?\n/).forEach(function(line){ line=line.trim(); if(!line) return; var p=line.split('|').map(function(x){ return x.trim(); }); if(p.length<8) return; var g=function(re){ var m=line.match(re); return m?m[1]:''; };
    rows.push({name:p[0], cafe:p[1].replace(/^кафе «|»$/g,''), diff:p[3], month:g(/месяц (\d+)/), cap:+g(/капитал (-?\d+)/), cities:+g(/города (\d+)/), rating:g(/рейтинг ([\d,]+)/), goal:/цель достигнута/.test(line), fork:p[p.length-5]||'', ach:g(/награды (\d+)/)}); });
  rows.sort(function(a,b){ return (b.goal-a.goal)||(b.cities-a.cities)||(b.cap-a.cap); });
  return rows;
}
