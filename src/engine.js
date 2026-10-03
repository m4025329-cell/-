/* ===== Экономический движок «Мерч-Империи» (без интерфейса) ===== */
'use strict';
var GOAL = 1000000, TOTAL = 16, START_CASH = 30000, ELASTICITY = 1.7, BASE_COST = 350, BASE_PRICE = 900, D0 = 55;
var MONTH_NAMES = ['Сентябрь','Октябрь','Ноябрь','Декабрь','Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
var SEASON = [1.0,1.0,1.2,1.4,0.75,1.05,1.2,1.0,1.0,1.1,0.85,1.15,1.0,1.0,1.2,1.4];
var AD = [
  {name:'Без рекламы', cost:0, mult:1, brand:0},
  {name:'Соцсети', cost:3000, mult:1.10, brand:1.5},
  {name:'Блогеры', cost:8000, mult:1.22, brand:3},
  {name:'Большая кампания', cost:20000, mult:1.32, brand:5}
];
var UPGRADES = [
  {id:'press', name:'Термопресс PRO', cost:25000, from:1, desc:'Печатает быстрее и дешевле.', fx:['+30 футболок в месяц','себестоимость −40 ₽']},
  {id:'online', name:'Интернет-магазин', cost:18000, from:1, desc:'Заказы приходят со всего города.', fx:['спрос ×1,25','комиссия сайта 2 000 ₽/мес']},
  {id:'brandkit', name:'Фирменный стиль', cost:35000, from:5, desc:'Логотип, упаковка, единый вид.', fx:['узнаваемость +10','спрос ×1,08']},
  {id:'designer', name:'Штатный дизайнер', cost:0, from:5, desc:'Новые принты каждую неделю.', fx:['спрос ×1,12','зарплата 20 000 ₽/мес']},
  {id:'workshop', name:'Швейный цех', cost:150000, from:9, desc:'Своё производство вместо гаража.', fx:['+150 футболок в месяц','себестоимость −60 ₽']},
  {id:'line', name:'Автоматическая линия', cost:300000, from:13, desc:'Печать почти без участия людей.', fx:['+300 футболок в месяц','себестоимость −50 ₽']}
];
var TAX_MIN = 0.01;

function clamp(x, a, b){ return Math.max(a, Math.min(b, x)); }
function newState(name){
  return { name:name||'Предприниматель', month:1, cash:START_CASH, savings:0, fund:0, stock:0,
    inv:0, invValue:0, loanLeft:0, loanStep:0, brand:0, infl:1, costBase:1,
    qualityMult:1, nicheMult:1, store:'none', staffPro:0, staffTeen:0, taxMode:null,
    up:{}, mods:[], price:BASE_PRICE, produce:30, adIdx:0, discount:1,
    unlock:{deposit:false, invest:false, loan:false},
    history:[], quizScore:[], quizTotal:0, badges:{}, terms:[], tookRisk:false, riskWon:false,
    overdrafts:0, lastMargin:0.3, totalRevenue:0, log:[] };
}
function modProd(s, k){ var p=1; s.mods.forEach(function(m){ if(m.k===k) p*=m.m; }); return p; }
function unitCost(s){
  var c = BASE_COST;
  if(s.up.press) c -= 40; if(s.up.workshop) c -= 60; if(s.up.line) c -= 50;
  c += (s.costAdd||0);
  return Math.round(Math.max(120, c) * s.costBase * modProd(s,'cost'));
}
function capacity(s){
  var c = 55;
  if(s.store==='shop') c+=60; if(s.store==='cowork') c+=20;
  if(s.up.press) c+=40; if(s.up.workshop) c+=250; if(s.up.line) c+=450;
  if(s.staffPro) c+=80; if(s.staffTeen) c+=25;
  return c;
}
function refPrice(s){ return Math.round(BASE_PRICE * s.infl * modProd(s,'ref') / 10) * 10; }
function permanentDemand(s){
  var m = s.qualityMult * s.nicheMult;
  if(s.store==='shop') m*=1.3; else if(s.store==='cowork') m*=1.12;
  if(s.up.online) m*=1.25; if(s.up.brandkit) m*=1.08; if(s.up.designer) m*=1.12;
  if(s.staffPro) m*=1.08;
  return m;
}
function demandAt(s, price, adIdx, noise){
  var d = D0 * SEASON[s.month-1] * Math.pow(refPrice(s)/price, ELASTICITY) * AD[adIdx].mult *
          (1 + s.brand*0.012) * permanentDemand(s) * modProd(s,'dem') * (noise||1);
  return Math.max(0, d);
}
function fixedCosts(s){
  var f = 0;
  if(s.store==='shop') f+=15000; if(s.store==='cowork') f+=6000;
  f += s.staffPro*25000*s.infl + s.staffTeen*10000*s.infl;
  if(s.up.designer) f+=20000*s.infl;
  if(s.up.online) f+=2000;
  f = f * modProd(s,'fixed');
  return Math.round(f);
}
function loanPayment(s){
  if(s.loanLeft<=0) return 0;
  return Math.round(Math.min(s.loanLeft, s.loanStep) + s.loanLeft*0.015);
}
function netWorth(s){
  return Math.round(s.cash + s.savings + s.fund + s.stock + s.invValue - s.loanLeft);
}
function planCost(s, plan){
  return plan.produce*unitCost(s) + AD[plan.adIdx].cost;
}
function netProfitPreview(s, plan, demand){
  var c = unitCost(s), avail = s.inv + plan.produce, sold = Math.min(Math.round(demand), avail);
  var priceNow = plan.price * s.discount;
  var rev = sold*priceNow;
  var avg = avail>0 ? (s.invValue + plan.produce*c)/avail : c;
  var cogs = sold*avg;
  var fixed = fixedCosts(s) + (avail-sold)*15 + Math.round(s.loanLeft*0.015);
  var pbt = rev - cogs - AD[plan.adIdx].cost - fixed;
  var tax = calcTax(s, rev, pbt);
  return {sold:sold, revenue:rev, profit:pbt-tax, demand:demand};
}
function calcTax(s, revenue, pbt){
  if(s.taxMode==='rev') return Math.round(revenue*0.06);
  if(s.taxMode==='profit') return Math.round(Math.max(pbt*0.15, revenue*TAX_MIN));
  return 0;
}
function gauss(rng){ return (rng()+rng()+rng()+rng()-2)*1.7; }

function runMonth(s, plan, rng){
  rng = rng || Math.random;
  var c = unitCost(s), cap = capacity(s);
  var produce = clamp(Math.round(plan.produce), 0, cap);
  var price = plan.price, ad = AD[plan.adIdx];
  var r = {month:s.month, produce:produce, price:price, unit:c, ad:ad.cost, discount:s.discount};
  /* закупка и реклама оплачиваются сразу */
  var upfront = produce*c + ad.cost;
  s.cash -= upfront;
  s.inv += produce; s.invValue += produce*c;
  /* спрос */
  var noise = 0.92 + rng()*0.16;
  var D = Math.round(demandAt(s, price, plan.adIdx, noise));
  var sold = Math.min(D, s.inv);
  var avg = s.inv>0 ? s.invValue/s.inv : c;
  var cogs = Math.round(sold*avg);
  var revenue = Math.round(sold*price*s.discount);
  s.inv -= sold; s.invValue = s.inv>0 ? Math.max(0, s.invValue - cogs) : 0;
  r.demand = D; r.sold = sold; r.lost = Math.max(0, D-sold); r.left = s.inv;
  r.revenue = revenue; r.cogs = cogs;
  /* постоянные расходы */
  var fixed = fixedCosts(s), carry = s.inv*15;
  var interest = Math.round(s.loanLeft*0.015), principal = Math.round(Math.min(s.loanLeft, s.loanStep));
  r.fixed = fixed; r.carry = carry; r.interest = interest; r.principal = principal;
  var pbt = revenue - cogs - ad.cost - fixed - carry - interest;
  var tax = calcTax(s, revenue, pbt);
  r.tax = tax; r.profit = pbt - tax;
  s.cash += revenue - fixed - carry - interest - principal - tax;
  s.loanLeft -= principal; if(s.loanLeft<1){ s.loanLeft=0; s.loanStep=0; }
  /* вклады и инвестиции */
  r.depositGain = Math.round(s.savings*0.01); s.savings += r.depositGain;
  var fundR = 0.008 + 0.04*gauss(rng)/1.7*1.0, stockR = 0.012 + 0.13*gauss(rng)/1.7;
  var shock = s.month===15 ? 1 : 0;
  if(shock){ fundR -= 0.10; stockR -= 0.22; }
  fundR = clamp(fundR, -0.25, 0.15); stockR = clamp(stockR, -0.45, 0.30);
  r.fundR = fundR; r.stockR = stockR;
  var fb = s.fund, sb = s.stock;
  s.fund = Math.round(s.fund*(1+fundR)); s.stock = Math.round(s.stock*(1+stockR));
  r.investGain = (s.fund-fb)+(s.stock-sb);
  /* овердрафт */
  r.overdraft = 0;
  if(s.cash<0 && s.savings>0){ var take=Math.min(s.savings, -s.cash); s.savings-=take; s.cash+=take; r.fromSavings=take; }
  if(s.cash<0){ r.overdraft = Math.round(-s.cash); s.loanLeft += r.overdraft; s.loanStep = Math.max(s.loanStep, Math.round(s.loanLeft/12)); s.cash = 0; s.overdrafts++; }
  /* узнаваемость и итоги */
  s.brand = clamp(s.brand*0.97 + ad.brand + (D>0 ? Math.min(3, sold/40) : 0), 0, 100);
  s.lastMargin = revenue>0 ? r.profit/revenue : 0;
  s.totalRevenue += revenue;
  s.mods.forEach(function(m){ m.left--; });
  s.mods = s.mods.filter(function(m){ return m.left>0; });
  s.discount = 1;
  s.history.push({m:s.month, revenue:revenue, profit:r.profit, nw:netWorth(s), sold:sold, cash:s.cash});
  r.nw = netWorth(s);
  s.month++;
  return r;
}
function coverDeficit(s){
  if(s.cash>=0) return 0;
  var d = Math.round(-s.cash);
  s.loanLeft += d; s.loanStep = Math.max(s.loanStep, Math.round(s.loanLeft/12)); s.cash = 0; s.overdrafts++; s.unlock.loan = true;
  return d;
}
if(typeof module!=='undefined') module.exports = {newState:newState, runMonth:runMonth};
