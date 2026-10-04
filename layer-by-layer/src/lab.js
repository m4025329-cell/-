/* ===== Лаборатория (исследования) и склад пластика =====
   Исследование стоит денег и занимает несколько месяцев, а выгода приходит потом: это решение «сейчас или потом».
   Склад: пластик можно закупать заранее, когда он дешёвый, но запас портится от влаги, а готовые изделия лежат и дешевеют. */

var LAB_ONE = 1;   /* сколько исследований можно вести одновременно (в гараже ещё одно) */
var RESEARCH = [
  {id:'slicer', name:'Профили слайсера',        icon:'bolt',    cost:9000,  months:1, from:1,
   text:'Подобраны быстрые настройки печати для каждого изделия.', effect:'+4% часов печати в месяц',
   apply:function(s){ addMod(s,'hours',1.04,99,'Профили слайсера'); }},
  {id:'nozzle', name:'Сопло с обдувом',         icon:'wrench',  cost:12000,  months:2, from:2,
   text:'Новое сопло и вентилятор обдува: мосты и углы выходят чище.', effect:'брак меньше на 2 п.п.',
   apply:function(s){ addMod(s,'fail',-0.02,99,'Сопло с обдувом'); }},
  {id:'photo',  name:'Фото и витрина',          icon:'sparkle', cost:11000,  months:1, from:2,
   text:'Красивые фотографии и аккуратная витрина помогают продавать.', effect:'спрос на брелоки, подставки и фигурки +4%',
   apply:function(s){ addModB2C(s,1.04,99,'Фото и витрина'); }},
  {id:'cad',    name:'Курс 3D-моделирования',   icon:'cap',     cost:9000,  months:2, from:3,
   text:'Учишься делать свои модели: фигурки становятся оригинальнее.', effect:'спрос на фигурки +8%',
   apply:function(s){ addMod(s,'dem',1.08,99,'Свои модели','mini'); }},
  {id:'post',   name:'Шлифовка и покраска',     icon:'leaf',    cost:15000, months:2, from:3,
   text:'Изделия выглядят как магазинные, и за них платят больше. Зато печать и доработка занимают дольше.', effect:'подставки и фигурки дороже на 7%, но +0,2 ч на штуку',
   apply:function(s){ addMod(s,'ref',1.07,99,'Шлифовка и покраска','stand'); addMod(s,'ref',1.07,99,'Шлифовка и покраска','mini'); s.tAdd.stand=(s.tAdd.stand||0)+0.2; s.tAdd.mini=(s.tAdd.mini||0)+0.2; }},
  {id:'feeder', name:'Подача пластика',         icon:'box',     cost:24000, months:2, from:4,
   text:'Катушки меняются сами, принтеры меньше простаивают по ночам.', effect:'+4% часов печати',
   apply:function(s){ addMod(s,'hours',1.04,99,'Подача пластика'); }},
  {id:'recycle',name:'Переработка брака',       icon:'leaf',    cost:18000, months:2, from:4,
   text:'Бракованные детали измельчаются и превращаются в нить. Пластика уходит меньше.', effect:'пластик дешевле на 6%',
   apply:function(s){ addMod(s,'fil',0.94,99,'Переработка брака'); }},
  {id:'scan',   name:'3D-сканер',               icon:'target',  cost:32000, months:3, from:5,
   text:'Можно копировать детали по образцу: запчасти выходят точнее, а заказчики охотнее обращаются.', effect:'спрос на запчасти +15%',
   apply:function(s){ addMod(s,'dem',1.15,99,'3D-сканер','part'); }},
  {id:'brand',  name:'Фирменный стиль',         icon:'star',    cost:14000, months:2, from:5,
   text:'Логотип, упаковка и страница в соцсетях: мастерскую запоминают.', effect:'репутация +6 и спрос +2%',
   apply:function(s){ s.rep=clamp(s.rep+6,0,100); addModB2C(s,1.02,99,'Фирменный стиль'); }},
  {id:'farm',   name:'Умная ферма',             icon:'safe',    cost:42000, months:3, from:8,
   text:'Камеры и датчики следят за печатью: остановка при ошибке, меньше брака и простоя.', effect:'+5% часов печати, брак меньше на 2 п.п.',
   apply:function(s){ addMod(s,'hours',1.05,99,'Умная ферма'); addMod(s,'fail',-0.02,99,'Умная ферма'); }}
];
var RESEARCH_BY_ID = {}; RESEARCH.forEach(function(r){ RESEARCH_BY_ID[r.id]=r; });

function labOf(s){ s.lab=s.lab||{done:{}, active:[]}; if(!s.lab.active) s.lab.active=[]; return s.lab; }
function labSlots(s){ return LAB_ONE + (s.space==='garage' ? 1 : 0); }
function canResearch(s, id){
  var r=RESEARCH_BY_ID[id], L=labOf(s);
  if(!r) return {ok:false, why:'Нет такого исследования'};
  if(L.done[id]) return {ok:false, why:'Уже изучено'};
  if(L.active.some(function(a){ return a.id===id; })) return {ok:false, why:'Уже идёт'};
  if(s.month<r.from) return {ok:false, why:'Откроется с месяца '+r.from};
  if(L.active.length>=labSlots(s)) return {ok:false, why:'Лаборатория занята: дождись конца текущего исследования'};
  if(s.month+r.months>TOTAL) return {ok:false, why:'Не успеет закончиться до конца игры'};
  if(s.cash<r.cost) return {ok:false, why:'Не хватает денег'};
  return {ok:true, why:''};
}
function startResearch(s, id){
  var c=canResearch(s,id); if(!c.ok) return c;
  var r=RESEARCH_BY_ID[id]; s.cash-=r.cost; labOf(s).active.push({id:id, left:r.months, total:r.months});
  return c;
}
/* вызывается в конце месяца: двигает исследования, применяет завершённые */
function labTick(s, r){
  var L=labOf(s), fin=[];
  L.active.forEach(function(a){ a.left--; });
  L.active=L.active.filter(function(a){ if(a.left<=0){ RESEARCH_BY_ID[a.id].apply(s); L.done[a.id]=s.month; fin.push(RESEARCH_BY_ID[a.id]); return false; } return true; });
  if(r) r.labDone=fin;
}

/* ---------- склад пластика ---------- */
var FIL_MAX = 40;           /* кг: больше места нет */
var FIL_WET = 20;           /* кг: запас больше этого отсыревает */
var SUPPLIERS = {
  opt: {id:'opt', name:'ПластикОпт',   pm:0.88, icon:'truck',   about:'Дешевле на 12%, но качество нестабильное: брак +2 п.п. два месяца.'},
  std: {id:'std', name:'Фирменный',    pm:1.00, icon:'box',     about:'Рыночная цена, качество без сюрпризов.'},
  eco: {id:'eco', name:'Эко-пластик',  pm:1.15, icon:'leaf',    about:'Дороже на 15%, зато репутация +1 и спрос +2% два месяца.'}
};
function filPrice(s, sup){ return filMarket(s)*SUPPLIERS[sup].pm; }
function canBuyFil(s, kg, sup){
  if(!SUPPLIERS[sup]) return {ok:false, why:'Нет такого поставщика'};
  if(kg<=0) return {ok:false, why:'Выбери количество'};
  if(s.fil.kg+kg>FIL_MAX+1e-9) return {ok:false, why:'На складе помещается не больше '+FIL_MAX+' кг'};
  var cost=kg*filPrice(s,sup); if(cost>s.cash+0.5) return {ok:false, why:'Не хватает денег'};
  return {ok:true, why:'', cost:cost};
}
function buyFil(s, kg, sup){
  var c=canBuyFil(s,kg,sup); if(!c.ok) return c;
  s.cash-=c.cost; s.fil.kg+=kg; s.fil.val+=c.cost; s.filBought=(s.filBought||0)+kg;
  if(sup==='opt') addMod(s,'fail',0.02,2,'Дешёвый поставщик');
  if(sup==='eco'){ s.rep=clamp(s.rep+1,0,100); addMod(s,'dem',1.02,2,'Эко-пластик'); }
  return c;
}
/* цена пластика относительно «обычной» с учётом месяца: ниже 1 — выгодно закупать впрок */
function filTrend(s){ var h=s.filHist||[1], last=h[h.length-1], avg=h.reduce(function(a,b){ return a+b; },0)/h.length; return {now:last, avg:avg, rel:last/avg}; }
/* распродажа остатков готовых изделий оптовику: быстро, но дёшево */
var LIQ_RATE = 0.65;
function liquidateValue(s, id){ return Math.round(s.invVal[id]*LIQ_RATE); }
function liquidate(s, id){
  var n=s.inv[id]; if(n<1) return {ok:false, why:'Нечего продавать'};
  var get=liquidateValue(s,id); s.cash+=get; var lost=s.invVal[id]-get; s.inv[id]=0; s.invVal[id]=0;
  s.liquidated=(s.liquidated||0)+1; return {ok:true, got:get, lost:lost, n:n};
}
/* в конце месяца: сырой пластик отсыревает, если его слишком много; запоминаем историю цены */
function stockTick(s, r){
  s.filHist=s.filHist||[1];
  if(s.fil.kg>FIL_WET){ addMod(s,'fail',0.02,1,'Отсыревший пластик'); if(r) r.wet=true; }
  s.filHist.push(Math.round(s.filIdx*1000)/1000);
  if(s.filHist.length>17) s.filHist.shift();
}

/* ---------- мини-игра «Слайсер»: настройки печати для аккуратного заказа ---------- */
var SLICER_TRIES = 3;
var SLICER_RANGE = {t:{min:180,max:250,step:5,unit:'°C',name:'Температура сопла'}, v:{min:30,max:100,step:5,unit:'мм/с',name:'Скорость печати'}, f:{min:10,max:70,step:5,unit:'%',name:'Заполнение'}};
var SLICER_TOL = {t:10, v:10, f:10};
function slicerTarget(s){ var r=rngFor(s,'slicer'+s.month); return {t:195+5*Math.floor(r()*9), v:40+5*Math.floor(r()*11), f:15+5*Math.floor(r()*9)}; }
function slicerCheck(tg, set){ return ['t','v','f'].map(function(k){ var d=set[k]-tg[k]; return {k:k, d:d, ok:Math.abs(d)<=SLICER_TOL[k], dir:d>0?1:(d<0?-1:0), power:Math.min(1,Math.abs(d)/(SLICER_TOL[k]*3))}; }); }
function slicerGrade(res){ var n=res.filter(function(x){ return x.ok; }).length; return n===3?'gold':(n===2?'silver':'bronze'); }
var SLICER_WORDS = {
  t:{p:'Слишком горячо: пластик течёт, между деталями тянутся тонкие нити («паутинка»).', m:'Слишком холодно: слои плохо спекаются, видны щели.', o:'Температура в норме.'},
  v:{p:'Слишком быстро: стенки волнистые, слои смещаются.', m:'Слишком медленно: пластик скапливается каплями, печать идёт дольше.', o:'Скорость в норме.'},
  f:{p:'Заполнение слишком плотное: уходит лишний пластик и время.', m:'Заполнение слишком редкое: верх проваливается, деталь хрупкая.', o:'Заполнение в норме.'}
};
function slicerWord(x){ return SLICER_WORDS[x.k][x.ok?'o':(x.dir>0?'p':'m')]; }
function slicerNeeded(s){ return s.contracts.some(function(c){ return c.fine || c.kind==='rush'; }); }
function slicerApply(s, grade){
  if(grade==='gold'){ s.rep=clamp(s.rep+1,0,100); addMod(s,'fail',-0.02,1,'Идеальные настройки'); }
  else if(grade==='bronze'){ addMod(s,'fail',0.02,1,'Неточные настройки'); }
  s.slicerGold=(s.slicerGold||0)+(grade==='gold'?1:0);
}
if(typeof module!=='undefined') module.exports = {};
