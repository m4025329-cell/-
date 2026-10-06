/* ===== «Первый столик»: заказы и банкеты ===== */
var BANQ = [
 {kind:'corp',   n:'Корпоративный обед',      who:'Компания «ТехноСервис»',   g:[18,34], p:[620,780], need:['soup','main'],      bonus:{awr:0.04},         min:3, text:'Фирма хочет накормить сотрудников горячим обедом без очередей.'},
 {kind:'bday',   n:'День рождения',           who:'Семья Орловых',            g:[10,18], p:[850,1100],need:['dess'],             bonus:{loy:0.03},         min:2, text:'Тёплый вечер, торт и чай для близких.'},
 {kind:'grad',   n:'Студенческий вечер',      who:'Студенческий совет',        g:[25,45], p:[470,600], need:['coffee','bake'],    bonus:{awr:0.05},         min:3, text:'Студенты празднуют конец сессии. Шумно, но дружно.', seg:'stu'},
 {kind:'tour',   n:'Экскурсионная группа',    who:'Турагентство «Маршрут»',    g:[35,55], p:[420,520], need:['main'],             bonus:{awr:0.03},         min:3, text:'Автобус, гид и сорок голодных человек с картой города.', tur:true},
 {kind:'wedding',n:'Небольшая свадьба',       who:'Молодожёны',                g:[22,36], p:[1300,1800],need:['main','dess'],     bonus:{rep:2},            min:6, text:'Скромная свадьба: двадцать пять гостей, много цветов.', rep:62},
 {kind:'press',  n:'Пресс-завтрак',           who:'Городской журнал',          g:[12,20], p:[700,900], need:['brek','coffee'],    bonus:{awr:0.07},         min:4, text:'Журналисты соберутся за завтраком и расскажут о городских новинках.'},
 {kind:'kids',   n:'Детский праздник',        who:'Родительский комитет',      g:[12,20], p:[600,800], need:['dess','cold'],      bonus:{loy:0.04},         min:3, text:'Праздник для первоклашек: фокусник, торт, лимонад.'},
 {kind:'charity',n:'Благотворительный обед',  who:'Фонд «Тёплый дом»',         g:[30,40], p:[250,300], need:['soup','main'],      bonus:{rep:2,awr:0.06},   min:4, text:'Обед для пожилых людей. Платят символически, но город запомнит.'},
 {kind:'conf',   n:'Конференция',             who:'Областной форум',           g:[40,70], p:[520,700], need:['coffee','main','salad'], bonus:{awr:0.06},     min:9, text:'Кофе-брейки и обед для участников форума.', big:true},
 {kind:'gala',   n:'Гала-ужин',               who:'Благотворительный бал',     g:[40,60], p:[1500,2100],need:['main','dess','salad'], bonus:{rep:3,brand:2},min:9, text:'Ужин на шестьдесят гостей. Нужен ресторан и высокий класс.', rest:true}
];
var BANQ_BY={}; BANQ.forEach(function(b){ BANQ_BY[b.kind]=b; });
function makeBoard(s){
  if(s.orders && s.orders.m===s.month) return s.orders;
  var rng=rngFor(s,'board'+s.month), live=liveOutlets(s), offers=[];
  var n=s.month<3?0:(s.month<9?2:3);
  if(s.flags.nazWar) n=Math.max(0,n-1);
  var kitchen=live.map(function(o){ return o.id; });
  for(var i=0;i<n && live.length;i++){
    var o=live[Math.floor(rng()*live.length)], city=CITIES[o.city], cal=CAL[s.month-1];
    var pool=BANQ.filter(function(b){ if(b.min>s.month) return false; if(b.tur && city.tur[cal]<0.85) return false; if(b.rest && o.fmt!=='rest') return false; if(b.rep && o.rep<b.rep) return false; return !offers.some(function(x){ return x.kind===b.kind; }); });
    if(!pool.length) continue;
    var B=pool[Math.floor(rng()*pool.length)];
    var g=Math.round(B.g[0]+rng()*(B.g[1]-B.g[0])), p=Math.round((B.p[0]+rng()*(B.p[1]-B.p[0]))*city.inc*s.pidx/10)*10;
    offers.push({id:'b'+s.month+'_'+i, o:o.id, kind:B.kind, name:B.n, who:B.who, guests:g, price:p, need:B.need.slice(), bonus:B.bonus, text:B.text, state:'open'});
  }
  s.orders={m:s.month, offers:offers};
  return s.orders;
}
function offerCheck(s,off){
  var o=outletById(s,off.o); if(!o) return {ok:false, miss:[]};
  var have={}; outletDishes(s,o).forEach(function(d){ have[d.cat]=1; });
  var miss=off.need.filter(function(c){ return !have[c]; });
  var kit=kitchenCap(s,o), load=sumArr(s.accepted.filter(function(a){ return a.o===o.id; }).map(function(a){ return a.guests*2.2; }))+off.guests*2.2;
  var cap=load/(kit*30);
  return {ok:!miss.length && cap<0.75, miss:miss, load:cap, kit:kit};
}
function A_accept(s,id){
  var b=makeBoard(s), off=b.offers.filter(function(x){ return x.id===id; })[0]; if(!off || off.state!=='open') return res(false);
  var c=offerCheck(s,off); if(c.miss.length) return res(false,'В меню нет: '+c.miss.map(function(k){ return CATN[k].toLowerCase(); }).join(', ')+'.');
  if(!c.ok) return res(false,'Кухня не потянет столько заказов: возьмите на кухню ещё людей или откажитесь от других.');
  s.accepted.push({id:off.id, o:off.o, guests:off.guests, price:off.price, name:off.name, kind:off.kind, bonus:off.bonus}); off.state='acc';
  return res(true,'Заказ принят: «'+off.name+'», '+off.guests+' '+plural(off.guests,'гость','гостя','гостей')+'.');
}
function A_haggle(s,id){
  var b=makeBoard(s), off=b.offers.filter(function(x){ return x.id===id; })[0]; if(!off || off.state!=='open') return res(false);
  var o=outletById(s,off.o); if(!o){ off.state='lost'; return res(false,'Заведения уже нет.'); } var p=clamp(0.3+(o.rep-45)/120+(s.talent==='host'?0.08:0),0.2,0.8), r=rngFor(s,'hag'+off.id)();
  if(r<p){ off.price=Math.round(off.price*1.12/10)*10; off.hag=1; var rr=A_accept(s,id); return res(true,'Клиент согласился на цену выше: '+rub(off.price)+' с человека. '+rr.msg); }
  off.state='lost'; return res(false,'Клиент ушёл: «Дороговато, мы поищем в другом месте».');
}
function A_decline(s,id){ var b=makeBoard(s), off=b.offers.filter(function(x){ return x.id===id; })[0]; if(off && off.state==='open') off.state='dec'; return res(true); }
function A_unaccept(s,id){ s.accepted=s.accepted.filter(function(a){ return a.id!==id; }); var b=makeBoard(s); b.offers.forEach(function(x){ if(x.id===id && x.state==='acc') x.state='open'; }); return res(true); }
