/* ===== «Слой за слоем»: экономический движок (без интерфейса) ===== */
var GOAL = 1000000, TOTAL = 16, START_CASH = 35000, QUIZ_BONUS = 3000;
var FIL_BASE = 1400, RUN_COST = 12, DEPR_MONTHS = 36, STORAGE_RATE = 0.02, OBSOLETE_RATE = 0.06;
var LOAN_RATE = 0.015, DEPOSIT_RATE = 0.01, TAX_MIN = 0.01;
var PACK = {key:10, stand:22, mini:18, part:45, proto:120}; /* упаковка и доставка, ₽ за штуку */
var MONTH_NAMES = ['Сентябрь','Октябрь','Ноябрь','Декабрь','Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
var MONTH_SHORT = ['Сен','Окт','Ноя','Дек','Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];

var MODES = {
  draft: {id:'draft', name:'Быстро',   layer:'0,3 мм', time:0.70, grams:0.92, q:0.82, fail:0.03},
  std:   {id:'std',   name:'Стандарт', layer:'0,2 мм', time:1.00, grams:1.00, q:1.00, fail:0},
  fine:  {id:'fine',  name:'Тонко',    layer:'0,1 мм', time:1.55, grams:1.06, q:1.22, fail:0}
};
var PROD_IDS = ['key','stand','mini','part','proto'];
/* t — часов печати на штуку (стандарт), g — граммов пластика, ref — привычная цена,
   спрос = dmax / (1 + (цена/p50)^k): чем выше цена, тем меньше покупателей */
var PRODUCTS = {
  key:   {id:'key',   name:'Брелоки с именами',        short:'Брелоки',    t:0.25, g:6,   ref:120,  p50:140,  k:4.2, dmax:209,  qs:0.4, b2b:false, need:null},
  stand: {id:'stand', name:'Подставки и органайзеры',  short:'Подставки',  t:1.2,  g:55,  ref:360,  p50:410,  k:3.4, dmax:82,   qs:0.6, b2b:false, need:null},
  mini:  {id:'mini',  name:'Фигурки для настолок',     short:'Фигурки',    t:2.5,  g:35,  ref:560,  p50:640,  k:3.0, dmax:60,   qs:1.4, b2b:false, need:null},
  part:  {id:'part',  name:'Запчасти на заказ',        short:'Запчасти',   t:3.0,  g:90,  ref:1100, p50:1450, k:2.8, dmax:20,   qs:1.0, b2b:false, need:null},
  proto: {id:'proto', name:'Прототипы для компаний',   short:'Прототипы',  t:9,    g:350, ref:3600, p50:4800, k:2.5, dmax:6.5, qs:1.2, b2b:true,  need:'big'}
};
var SEASON = {
  key:   [1.20,0.95,1.15,1.60,0.70,1.15,1.35,0.95,1.00,1.15,0.80,0.95,1.20,0.95,1.15,1.60],
  stand: [1.35,1.00,1.05,1.20,0.80,0.95,1.00,1.00,0.95,0.85,0.75,1.20,1.35,1.00,1.05,1.20],
  mini:  [0.90,1.10,1.20,1.40,1.10,0.95,0.90,0.90,0.85,0.80,0.80,0.90,0.95,1.15,1.25,1.45],
  part:  [1.00,1.00,1.00,1.00,1.10,1.00,1.00,1.00,1.00,1.00,1.00,1.00,1.00,1.00,1.00,1.00],
  proto: [1.00,1.00,1.00,1.25,0.80,1.00,1.00,1.00,1.00,1.00,0.90,1.00,1.00,1.00,1.00,1.25]
};
var PRINTERS = {
  old:  {id:'old',  name:'Фил',                  hours:100, fail:0.12, price:0,      big:false, note:'Старый, но с характером'},
  std:  {id:'std',  name:'Принтер «Стандарт»',    hours:110, fail:0.06, price:57000,  big:false, note:'Новый, надёжный'},
  used: {id:'used', name:'Б/у принтер',           hours:95,  fail:0.15, price:30000,  big:false, note:'Дёшево, но капризный'},
  fast: {id:'fast', name:'Быстрый CoreXY',        hours:165, fail:0.05, price:117000,  big:false, note:'В полтора раза быстрее'},
  big:  {id:'big',  name:'Большой формат',        hours:115, fail:0.07, price:142000,  big:true,  note:'Для крупных деталей и прототипов'},
  ind:  {id:'ind',  name:'Промышленный принтер',  hours:320, fail:0.03, price:375000, big:true,  note:'Работает почти без остановок'},
  diy:  {id:'diy',  name:'Самосборный принтер',   hours:105, fail:0.08, price:26000,  big:false, note:'Собран своими руками из деталей'}
};
var SPACES = {
  school: {id:'school', name:'Школьный кабинет',       rent:0,     limit:2, hm:1},
  home:   {id:'home',   name:'Дома',                    rent:0,     limit:2, hm:0.9},
  cowork: {id:'cowork', name:'Коворкинг',               rent:6000,  limit:4, hm:1},
  garage: {id:'garage', name:'Мастерская в гараже',     rent:12000, limit:8, hm:1}
};
var ADS = [
  {name:'Без рекламы',         cost:0,     mult:1.00, rep:0},
  {name:'Сторис и чат школы',   cost:2000,  mult:1.08, rep:0.5},
  {name:'Блогеры и таргет',     cost:8000,  mult:1.18, rep:1.5},
  {name:'Городская кампания',   cost:20000, mult:1.30, rep:3}
];
var STAFF = {
  asst: {name:'Помощник',  salary:6000, hours:0.25, desc:'Следит за печатью по ночам и быстро меняет пластик.'},
  teen: {name:'Подросток на подработке', salary:3000, hours:0.10, desc:'Помогает после школы.'}
};
var CHANNELS = {
  market: {name:'Маркетплейс', mult:1.40, commission:0.12},
  site:   {name:'Свой сайт',   mult:1.22, fee:2500}
};
/* таланты: у каждого свои бонусы и особые варианты в нескольких сценах.
   Числа лежат здесь, а текст описания собирается из них (talentPerk), чтобы они не расходились. */
var TALENTS = {
  eng: {id:'eng', name:'Инженер',  icon:'wrench',    time:0.95, fail:0.02,
        desc:'Знаешь принтер изнутри: настройки слайсера подобраны, сопло прочищено, ремни натянуты.'},
  des: {id:'des', name:'Дизайнер', icon:'sparkle',   dem:1.03,
        desc:'Твои модели нравятся покупателям: изделия выглядят так, что хочется взять их в руки.'},
  sel: {id:'sel', name:'Продавец', icon:'megaphone', ad:1.07, comm:0.015, rep:0,
        desc:'Умеешь продавать: находишь слова, шутки и скидки, после которых покупатели достают кошельки.'}
};
function pct0(x){ return Math.round(x*100); }
function talentPerk(k){
  var T=TALENTS[k];
  if(k==='eng') return 'Печать на '+pct0(1-T.time)+'% быстрее, брака меньше на '+(Math.round(T.fail*1000)/10).toString().replace('.',',')+' п.п.';
  if(k==='des') return 'Спрос на брелоки, подставки и фигурки выше на '+pct0(T.dem-1)+'%';
  return 'Реклама на '+pct0(T.ad-1)+'% сильнее, комиссия маркетплейса на '+(Math.round(T.comm*1000)/10).toString().replace('.',',')+' п.п. ниже'+(T.rep?', репутация +'+T.rep:'');
}
/* сложность: стартовые деньги и размах случайных колебаний спроса */
var DIFFS = {
  easy: {id:'easy', name:'Спокойная', cash:45000, noise:0.5, price:1.02, about:'45 000 ₽ на старте, покупатели платят чуть больше, спрос почти не прыгает'},
  norm: {id:'norm', name:'Обычная',   cash:35000, noise:1,   price:1,    about:'35 000 ₽ на старте'},
  hard: {id:'hard', name:'Сложная',   cash:25000, noise:1.7, price:0.95, about:'25 000 ₽ на старте, покупатели платят на 5% меньше, спрос колеблется сильнее'}
};
var SERVICE_COST = 2500, INSURANCE_COST = 2000, INSURANCE_PAYOUT = 0.90, ALLY_FEE = 4000, ALLY_HOURS = 40, ALLY2_HOURS = 80;

function clamp(x, a, b){ return Math.max(a, Math.min(b, x)); }
function round1(x){ return Math.round(x*10)/10; }

/* ---------- случайности ----------
   Результат зависит только от «кода класса» (s.seed), номера месяца и названия броска.
   Ученики с одним кодом получают одинаковые события и спрос, поэтому результаты можно честно сравнивать. */
function hashStr(str){ var h=2166136261; str=String(str); for(var i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function rngFor(s, tag){ return mulberry32(hashStr((s.seed||'free')+'|'+tag)); }
function rand01(s, tag){ return rngFor(s, tag)(); }
function randomSeed(){ return Math.random().toString(36).slice(2,8); }

function newState(name, opts){
  opts = opts || {};
  var s = { v:1, name:name||'Мастер', shop:'', talent:null, diff:'norm', code:'', seed:String(opts.seed||randomSeed()), month:1, cash:START_CASH, savings:0, fund:0, loanLeft:0, loanStep:0, equity:1,
    printers:[{t:'old', age:99}], space:'school', staff:{asst:0, teen:0},
    unlocked:{key:true, stand:true, mini:false, part:false, proto:false},
    inv:{}, invVal:{}, fil:{kg:3, val:3*1250}, filIdx:1, infl:1, rep:5,
    tax:null, channel:{market:false, site:false}, insurance:false, service:false,
    contracts:[], mods:[], flags:{}, pdm:{key:1, stand:1, mini:1, part:1, proto:1},
    unlock:{deposit:false, fund:false, loan:false},
    plan:{mode:'std', ad:0, price:{}, qty:{}}, tAdd:{key:0, stand:0, mini:0, part:0, proto:0},
    history:[], quizScore:[], quizTotal:0, terms:[], overdrafts:0, totalRevenue:0, lastProfitPerHour:0, bestUtil:0, utilMonths:0, soldKinds:0, lastMargin:0.3 };
  PROD_IDS.forEach(function(id){ s.inv[id]=0; s.invVal[id]=0; s.plan.price[id]=PRODUCTS[id].ref; s.plan.qty[id]=0; });
  return s;
}

/* ---------- модификаторы ---------- */
/* настройка мастерской: делается один раз после пролога */
function cleanShopName(n){ return String(n||'').replace(/\s+/g,' ').trim().slice(0,28); }
function cleanCode(c){ return String(c||'').replace(/\s+/g,'').toUpperCase().slice(0,16); }
function applySetup(s, o){
  if(s.setupDone) return s;
  s.shop = cleanShopName(o.shop) || 'Слой за слоем';
  s.talent = TALENTS[o.talent] ? o.talent : null;
  s.diff = DIFFS[o.diff] ? o.diff : 'norm';
  s.code = cleanCode(o.code);
  if(s.code) s.seed = 'КЛАСС|'+s.code;
  s.cash = DIFFS[s.diff].cash;
  if(s.talent==='des'){ ['key','stand','mini'].forEach(function(id){ s.pdm[id]*=TALENTS.des.dem; }); }
  if(s.talent==='sel'){ s.rep = clamp(s.rep+TALENTS.sel.rep,0,100); }
  s.setupDone = true;
  return s;
}
function addMod(s, k, m, left, label, prod){ s.mods.push({k:k, m:m, left:left, label:label, prod:prod||null}); }
function modProd(s, k, id){ var p=1; s.mods.forEach(function(x){ if(x.k===k && (!x.prod || x.prod===id)) p*=x.m; }); return p; }
function modSum(s, k){ var t=0; s.mods.forEach(function(x){ if(x.k===k) t+=x.m; }); return t; }

/* ---------- производственные мощности ---------- */
function printerCount(s){ return s.printers.length; }
function hasBig(s){ return s.printers.some(function(p){ return PRINTERS[p.t].big; }); }
function printerHours(s){
  var h=0; s.printers.forEach(function(p){ h+=PRINTERS[p.t].hours; });
  var mult = 1 + (s.staff.asst?STAFF.asst.hours:0) + (s.staff.teen?STAFF.teen.hours:0);
  mult *= SPACES[s.space].hm * modProd(s,'hours');
  h = h*mult + (s.flags.alliance2?ALLY2_HOURS:(s.flags.ally?ALLY_HOURS:0)) + modSum(s,'hoursAdd');
  return Math.max(0, Math.round(h));
}
function baseFail(s){
  var t=0, h=0; s.printers.forEach(function(p){ var d=PRINTERS[p.t]; t+=d.fail*d.hours; h+=d.hours; });
  return h>0 ? t/h : 0.1;
}
function failRate(s, mode){
  var f = baseFail(s) + MODES[mode].fail + modSum(s,'fail') - (s.service?0.02:0) - (s.talent==='eng'?TALENTS.eng.fail:0);
  return clamp(f, 0.01, 0.35);
}
function isAvailable(s, id){
  if(!s.unlocked[id]) return false;
  var need = PRODUCTS[id].need;
  if(need==='big' && !hasBig(s)) return false;
  return true;
}
function whyLocked(s, id){
  if(!s.unlocked[id]) return 'Откроется по ходу истории';
  if(PRODUCTS[id].need==='big' && !hasBig(s)) return 'Нужен принтер большого формата';
  return '';
}

/* ---------- цены и спрос ---------- */
function filMarket(s){ return FIL_BASE * s.filIdx * modProd(s,'fil'); }
function runCostPerHour(s){ return RUN_COST * s.infl * modProd(s,'run'); }
function levelMult(s){ return (DIFFS[s.diff||'norm']||DIFFS.norm).price; }
function refPrice(s, id){ return Math.round(PRODUCTS[id].ref * s.infl * modProd(s,'ref',id) * levelMult(s) / 5) * 5; }
function p50Of(s, id){ return PRODUCTS[id].p50 * s.infl * modProd(s,'ref',id) * levelMult(s); }
function adMult(s, i){ var a=ADS[i]; return 1 + (a.mult-1)*(s.talent==='sel'?TALENTS.sel.ad:1); }
function commissionRate(s){ return CHANNELS.market.commission - (s.talent==='sel'?TALENTS.sel.comm:0); }
function channelMult(s){ return (s.channel.market?CHANNELS.market.mult:1) * (s.channel.site?CHANNELS.site.mult:1); }
function demandAt(s, id, price, plan, noise){
  var P=PRODUCTS[id], x=price/p50Of(s,id);
  var base = P.dmax / (1 + Math.pow(x, P.k));
  var repMult = 1 + s.rep*(P.b2b?0.02:0.010);
  var q = Math.pow(MODES[plan.mode].q, P.qs);
  var ch = P.b2b ? 1 : channelMult(s);
  return Math.max(0, base * SEASON[id][s.month-1] * repMult * adMult(s,plan.ad) * q * ch * modProd(s,'dem',id) * s.pdm[id] * (noise||1));
}
function priceBounds(s, id, mode){
  var ref=refPrice(s,id); var c = unitCostEst(s, id, mode||s.plan.mode, 0);
  return {min: Math.max(Math.ceil(c*1.1/5)*5, Math.round(ref*0.5/5)*5), max: Math.round(ref*2.2/5)*5};
}

/* ---------- затраты ---------- */
function fixedParts(s){
  var sp=SPACES[s.space], inf=s.infl, p={};
  p.rent = sp.rent;
  p.salary = Math.round((s.staff.asst?STAFF.asst.salary:0)*inf + (s.staff.teen?STAFF.teen.salary:0)*inf);
  p.site = s.channel.site ? CHANNELS.site.fee : 0;
  p.insurance = s.insurance ? INSURANCE_COST : 0;
  p.service = s.service ? SERVICE_COST : 0;
  p.ally = (s.flags.ally && !s.flags.alliance2) ? ALLY_FEE : 0;
  var tot=0, k; for(k in p) tot+=p[k];
  var m = modProd(s,'fixed'); 
  p.total = Math.round(tot*m);
  return p;
}
function fixedCosts(s){ return fixedParts(s).total; }
function deprMonthly(s){ var d=0; s.printers.forEach(function(p){ if(p.age<DEPR_MONTHS) d += PRINTERS[p.t].price/DEPR_MONTHS; }); return Math.round(d); }
function bookValue(s){ var v=0; s.printers.forEach(function(p){ var pr=PRINTERS[p.t].price; if(p.age<DEPR_MONTHS) v += pr*(1-p.age/DEPR_MONTHS); }); return Math.round(v); }
function loanPayment(s){ if(s.loanLeft<=0) return 0; return Math.round(Math.min(s.loanLeft, s.loanStep) + s.loanLeft*LOAN_RATE); }
function filValue(s){ return Math.round(s.fil.val); }
function invValueTotal(s){ var t=0; PROD_IDS.forEach(function(id){ t+=s.invVal[id]; }); return Math.round(t); }
function companyCapital(s){ return Math.round(s.cash + s.savings + s.fund + invValueTotal(s) + filValue(s) + bookValue(s) - s.loanLeft); }
function ownerCapital(s){ return Math.round(companyCapital(s) * s.equity); }

/* ---------- контракты и план ---------- */
function contractQty(s, id){ var q=0; s.contracts.forEach(function(c){ if(c.prod===id) q+=c.qty; }); return q; }
function lockQty(s, id){ return Math.max(0, contractQty(s,id) - s.inv[id]); }
function hoursPerUnit(s, id, mode){ var f=failRate(s,mode); return (PRODUCTS[id].t+(s.tAdd[id]||0))*MODES[mode].time*(s.talent==='eng'?TALENTS.eng.time:1)/(1-f); }
function gramsPerUnit(s, id, mode){ var f=failRate(s,mode); return PRODUCTS[id].g*MODES[mode].grams/(1-f); }
function matBlend(s, kg){
  var stockKg=s.fil.kg, avg = stockKg>0 ? s.fil.val/stockKg : 0, mk=filMarket(s);
  if(kg<=0) return stockKg>0 ? avg : mk;
  var fromStock=Math.min(kg, stockKg);
  return (fromStock*avg + (kg-fromStock)*mk)/kg;
}
function planHours(s, plan){
  var h=0; PROD_IDS.forEach(function(id){ if(isAvailable(s,id)) h += (plan.qty[id]||0)*hoursPerUnit(s,id,plan.mode); });
  return h;
}
function planKg(s, plan){
  var g=0; PROD_IDS.forEach(function(id){ if(isAvailable(s,id)) g += (plan.qty[id]||0)*gramsPerUnit(s,id,plan.mode); });
  return g/1000;
}
function unitCostEst(s, id, mode, kgOverride){
  var kg=(kgOverride==null)?planKg(s, s.plan):kgOverride, price=matBlend(s, kg);
  return gramsPerUnit(s,id,mode)/1000*price + hoursPerUnit(s,id,mode)*runCostPerHour(s);
}
function maxQtyFor(s, plan, id){
  var H=printerHours(s), used=planHours(s,plan) - (plan.qty[id]||0)*hoursPerUnit(s,id,plan.mode);
  return Math.max(lockQty(s,id), Math.floor(Math.max(0,H-used)/hoursPerUnit(s,id,plan.mode)));
}
function sanitizePlan(s, plan){
  var out = {mode:plan.mode, ad:plan.ad, price:{}, qty:{}}, H=printerHours(s);
  PROD_IDS.forEach(function(id){
    out.price[id] = plan.price[id]; 
    out.qty[id] = isAvailable(s,id) ? Math.max(lockQty(s,id), Math.max(0, Math.floor(plan.qty[id]||0))) : 0;
  });
  var used=planHours(s,out), lockH=0;
  PROD_IDS.forEach(function(id){ lockH += lockQty(s,id)*hoursPerUnit(s,id,out.mode); });
  if(used>H+0.001){
    var free=Math.max(0,H-lockH), extra=used-lockH, k = extra>0 ? free/extra : 0;
    PROD_IDS.forEach(function(id){ var lk=lockQty(s,id); out.qty[id] = lk + Math.floor((out.qty[id]-lk)*k); });
  }
  return out;
}

/* ---------- расчёт месяца (без изменения состояния) ---------- */
function computeMonth(s, rawPlan, noiseFn){
  var plan=sanitizePlan(s, rawPlan), mode=plan.mode, M=MODES[mode], f=failRate(s,mode), H=printerHours(s);
  var gN = noiseFn ? noiseFn('g') : 1;
  var hours=planHours(s,plan), kg=planKg(s,plan), mk=filMarket(s);
  var stockKg=s.fil.kg, stockAvg=stockKg>0?s.fil.val/stockKg:0;
  var fromStock=Math.min(kg,stockKg), buyKg=kg-fromStock, buyCost=buyKg*mk, matCost=fromStock*stockAvg+buyCost;
  var runCost=hours*runCostPerHour(s), matPrice=kg>0?matCost/kg:mk;
  var ad=ADS[plan.ad];
  var r={month:s.month, mode:mode, fail:f, H:H, hours:hours, kg:kg, buyKg:buyKg, buyCost:buyCost, matCost:matCost, matPrice:matPrice, runCost:runCost, adCost:ad.cost, rows:{}, plan:plan};
  var revenue=0, contractRev=0, cogs=0, commission=0, royalty=0, penalty=0, repLoss=0, repGain=0, soldKinds=0, invValEnd=0, soldTot=0, packTot=0, writeTot=0;
  var disc = modProd(s,'disc');
  PROD_IDS.forEach(function(id){
    if(!isAvailable(s,id)){ return; }
    var P=PRODUCTS[id], q=plan.qty[id], att=q/(1-f), defects=att-q;
    var unit = gramsPerUnit(s,id,mode)/1000*matPrice + hoursPerUnit(s,id,mode)*runCostPerHour(s);
    var invN=s.inv[id], valN=s.invVal[id];
    var avgCost = (invN+q)>0 ? (valN + q*unit)/(invN+q) : unit;
    var avail = invN+q;
    var cq = contractQty(s,id), cDeliver = Math.min(cq, avail);
    var cRev=0, cPen=0;
    s.contracts.forEach(function(c){ if(c.prod===id){ } });
    if(cq>0){
      var left=cDeliver;
      s.contracts.forEach(function(c){ if(c.prod!==id) return; var d=Math.min(c.qty,left); left-=d; cRev+=d*c.price; var miss=c.qty-d; if(miss>0){ cPen+=miss*c.price*c.penalty; repLoss+=c.repLoss; } else { repGain+=(c.repGain||0); } });
    }
    var price=plan.price[id], eff=price*disc;
    var nz = noiseFn ? noiseFn(id) : 1;
    var D = Math.round(demandAt(s,id,price,plan,gN*nz));
    var availMarket = avail - cDeliver;
    var sold = Math.min(D, availMarket), lost=Math.max(0,D-sold), left2=availMarket-sold;
    var rev = sold*eff;
    var cg = (sold+cDeliver)*avgCost;
    var comm = (!P.b2b && s.channel.market) ? rev*commissionRate(s) : 0;
    var roy = (id==='mini' && s.flags.liza==='partner') ? rev*0.12 : 0;
    if(s.flags.alliance2 && (id==='key' || id==='stand')) roy += rev*0.08;
    var packCost = (sold+cDeliver)*PACK[id]*s.infl;
    var endVal = left2*avgCost*(1-OBSOLETE_RATE);
    var writeOff = left2*avgCost*OBSOLETE_RATE;
    r.rows[id] = {id:id, q:q, attempts:att, defects:defects, hours:q*hoursPerUnit(s,id,mode), unit:unit, avgCost:avgCost, price:price, eff:eff, demand:D, contractUnits:cDeliver, contractQty:cq,
                  avail:availMarket, sold:sold, lost:lost, left:left2, revenue:rev, contractRev:cRev, cogs:cg, comm:comm, roy:roy, endVal:endVal, invBefore:invN, valBefore:valN,
                  pack:packCost, writeOff:writeOff, perHour: (hoursPerUnit(s,id,mode)>0) ? (eff-unit-PACK[id]*s.infl)/hoursPerUnit(s,id,mode) : 0, penalty:cPen};
    packTot+=packCost; writeTot+=writeOff; revenue+=rev; contractRev+=cRev; cogs+=cg; commission+=comm; royalty+=roy; penalty+=cPen; invValEnd+=endVal; soldTot+=sold+cDeliver;
    if(sold+cDeliver>0) soldKinds++;
  });
  var fp=fixedParts(s), fixed=fp.total, depr=deprMonthly(s);
  var storage=invValEnd*STORAGE_RATE;
  var interest=Math.round(s.loanLeft*LOAN_RATE), principal=Math.round(Math.min(s.loanLeft,s.loanStep));
  var revTot=revenue+contractRev;
  var pbt = revTot - cogs - packTot - ad.cost - fixed - depr - storage - writeTot - commission - royalty - interest - penalty;
  var tax = 0;
  if(s.tax==='rev') tax=Math.round(revTot*0.06); else if(s.tax==='profit') tax=Math.round(Math.max(pbt*0.15, revTot*TAX_MIN));
  r.revenue=revenue; r.contractRev=contractRev; r.revTot=revTot; r.cogs=cogs; r.fixed=fixed; r.fixedParts=fp; r.depr=depr; r.storage=storage; r.commission=commission; r.royalty=royalty;
  r.interest=interest; r.principal=principal; r.penalty=penalty; r.repLoss=repLoss; r.repGain=repGain; r.tax=tax; r.pbt=pbt; r.profit=pbt-tax; r.soldKinds=soldKinds; r.soldTot=soldTot; r.invValEnd=invValEnd;
  r.cashNow = buyCost + runCost + ad.cost;
  r.packTot = packTot; r.writeTot = writeTot;
  r.cashEnd = revTot - packTot - fixed - storage - commission - royalty - interest - principal - penalty - tax;
  return r;
}
function previewMonth(s, plan, noiseMul){
  return computeMonth(s, plan, function(){ return noiseMul||1; });
}

/* ---------- применение результата к состоянию ---------- */
function gauss(rng){ return (rng()+rng()+rng()+rng()-2)*1.7; }
function commitMonth(s, r, rng){
  var plan=r.plan, f=r.fail;
  s.cash -= r.cashNow;
  /* пластик */
  var fromStock = Math.min(r.kg, s.fil.kg), avg = s.fil.kg>0 ? s.fil.val/s.fil.kg : 0;
  s.fil.kg -= fromStock; s.fil.val -= fromStock*avg; if(s.fil.kg<1e-6){ s.fil.kg=0; s.fil.val=0; }
  /* склад готовой продукции */
  PROD_IDS.forEach(function(id){
    var row=r.rows[id]; if(!row){ return; }
    s.inv[id] = row.left; s.invVal[id] = row.endVal;
  });
  s.cash += r.cashEnd;
  s.loanLeft -= r.principal; if(s.loanLeft<1){ s.loanLeft=0; s.loanStep=0; }
  s.totalRevenue += r.revTot;
  /* вклад и фонд */
  r.depositGain = Math.round(s.savings*DEPOSIT_RATE); s.savings += r.depositGain;
  var rf = rng || rngFor(s,'fund'+s.month);
  var fundR = 0.008 + 0.04*gauss(rf)/1.7;
  if(s.month===15) fundR -= 0.10;
  fundR = clamp(fundR, -0.25, 0.15); r.fundR=fundR;
  var fb=s.fund; s.fund = Math.round(s.fund*(1+fundR)); r.fundGain = s.fund-fb;
  /* овердрафт */
  r.overdraft=0; r.fromSavings=0;
  if(s.cash<0 && s.savings>0){ var take=Math.min(s.savings,-s.cash); s.savings-=take; s.cash+=take; r.fromSavings=take; }
  if(s.cash<0){ r.overdraft=Math.round(-s.cash); s.loanLeft+=r.overdraft; s.loanStep=Math.max(s.loanStep, Math.round(s.loanLeft/12)); s.cash=0; s.overdrafts++; s.unlock.loan=true; }
  /* репутация */
  var ad=ADS[plan.ad];
  s.rep = clamp(s.rep*0.985 + ad.rep + (r.soldTot>0?0.4:0) - (f>0.15?1.5:0) - r.repLoss + r.repGain, 0, 100);
  s.lastMargin = r.revTot>0 ? r.profit/r.revTot : 0;
  s.lastProfitPerHour = r.hours>0 ? (r.revTot - r.cogs - 0)/Math.max(1,r.hours) : s.lastProfitPerHour;
  /* цены на пластик, возраст принтеров, модификаторы */
  s.filIdx = clamp(s.filIdx*(1 + 0.004 + ((rng ? rng() : rand01(s,'fil'+s.month))-0.5)*0.024), 0.8, 2);
  s.printers.forEach(function(p){ p.age++; });
  s.mods.forEach(function(m){ m.left--; });
  s.mods = s.mods.filter(function(m){ return m.left>0; });
  s.contracts = [];
  var util = r.H>0 ? r.hours/r.H : 0; if(util>=0.9) s.utilMonths++;
  s.maxKinds = Math.max(s.maxKinds||0, r.soldKinds);
  s.history.push({m:s.month, revenue:r.revTot, profit:r.profit, cap:ownerCapital(s), cash:s.cash, sold:r.soldTot, util:util, hours:r.hours, H:r.H});
  r.cap = ownerCapital(s); r.cashAfter = s.cash;
  s.month++;
  return r;
}
function runMonth(s, rng){
  /* без rng шум берётся из кода класса: для каждого товара свой, не зависящий от остальных решений игрока */
  var n = {}, m = s.month;
  var amp = (DIFFS[s.diff||'norm']||DIFFS.norm).noise;
  var noise = function(key){ if(!(key in n)) n[key] = 1 + ((rng ? rng() : rand01(s,'n'+m+':'+key))-0.5)*(key==='g'?0.08:0.10)*amp; return n[key]; };
  var cashBefore = s.cash;
  var r = computeMonth(s, s.plan, noise);
  commitMonth(s, r, rng);
  r.cashBefore = cashBefore;
  return r;
}

/* ---------- действия игрока ---------- */
function canBuyPrinter(s, type){
  var d=PRINTERS[type];
  if(s.cash < d.price) return {ok:false, why:'Не хватает денег'};
  if(s.printers.length >= SPACES[s.space].limit) return {ok:false, why:'Нет места: максимум '+SPACES[s.space].limit+' в этом помещении'};
  if(type==='ind' && s.month<9) return {ok:false, why:'Откроется позже'};
  return {ok:true, why:''};
}
function buyPrinter(s, type){ var c=canBuyPrinter(s,type); if(!c.ok) return c; s.cash-=PRINTERS[type].price; s.printers.push({t:type, age:0}); return c; }
var MOVE_COST = {garage:8000, cowork:3000, home:0};
function canMove(s, space){
  if(s.space===space) return {ok:false, why:'Уже здесь'};
  if(space==='school') return {ok:false, why:'Недоступно'};
  if(s.printers.length > SPACES[space].limit) return {ok:false, why:'Принтеров слишком много: в новом помещении максимум '+SPACES[space].limit};
  if(s.cash < MOVE_COST[space]) return {ok:false, why:'Не хватает денег'};
  return {ok:true, why:''};
}
function moveSpace(s, space){ var c=canMove(s,space); if(!c.ok) return c; s.cash-=MOVE_COST[space]; s.space=space; if(space==='garage'){ if(!s.flags.garageBonus){ s.flags.garageBonus=true; addMod(s,'dem',1.1,99,'Заходят с улицы'); } } return c; }
function hireStaff(s, kind){ if(s.staff[kind]) return false; s.staff[kind]=1; return true; }
function fireStaff(s, kind){ if(!s.staff[kind]) return false; s.staff[kind]=0; return true; }
function coverDeficit(s){
  if(s.cash>=0) return 0;
  var d=Math.round(-s.cash); s.loanLeft+=d; s.loanStep=Math.max(s.loanStep, Math.round(s.loanLeft/12)); s.cash=0; s.overdrafts++; s.unlock.loan=true; return d;
}

/* Окупаемость: сравниваем месяц по рыночным ценам с новым принтером и без него.
   Если текущих часов хватает на весь спрос, новый принтер будет простаивать. */
function cloneState(s){ return JSON.parse(JSON.stringify(s)); }
function paybackMonths(s, type){
  var a=cloneState(s), b=cloneState(s), d=PRINTERS[type];
  b.printers.push({t:type, age:0}); suggestPlan(a); suggestPlan(b);
  var gain = 0.6*(previewMonth(b,b.plan,1).profit - previewMonth(a,a.plan,1).profit + d.price/DEPR_MONTHS);  /* прибавка к денежному потоку, 0,6 — запас на неточность */
  return gain>1500 ? d.price/gain : 99;
}
function paybackInfo(s, type){
  var m=paybackMonths(s,type), left=TOTAL-s.month+1;
  if(m>=99) return {ok:false, text:'сейчас не окупится: текущих часов хватает на весь спрос'};
  var n=Math.max(1,Math.round(m));
  return {ok:n<=left, text:'окупится за ≈ '+n+' мес.'+(n>left?' (осталось '+left+')':'')};
}

/* рекомендация Фила: цены по рынку, часы делим по прибыли за час */
function suggestPlan(s, keepPrices){
  var plan=s.plan, mode=plan.mode;
  PROD_IDS.forEach(function(id){ plan.qty[id]=0; if(!keepPrices || !plan.price[id]) plan.price[id]=refPrice(s,id); });
  var items=[];
  PROD_IDS.forEach(function(id){
    if(!isAvailable(s,id)) return;
    var c=unitCostEst(s,id,mode), h=hoursPerUnit(s,id,mode);
    var d=demandAt(s,id,plan.price[id],plan,1);
    items.push({id:id, perHour:(plan.price[id]-c-PACK[id]*s.infl)/h, want:Math.max(0,Math.round(d)-s.inv[id]), h:h});
  });
  PROD_IDS.forEach(function(id){ plan.qty[id]=lockQty(s,id); });
  var left = printerHours(s) - planHours(s,plan);
  items.sort(function(a,b){ return b.perHour-a.perHour; });
  items.forEach(function(it){
    if(it.perHour<=0) return;
    var q = Math.max(0, Math.min(it.want - plan.qty[it.id], Math.floor(left/it.h)));
    plan.qty[it.id]+=q; left-=q*it.h;
  });
  return plan;
}
if(typeof module!=='undefined') module.exports = {};
