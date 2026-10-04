/* ===== Новости рынка: событие объявляют за 1–2 месяца, и к нему можно подготовиться =====
   Хорошие новости поднимают спрос на часть товаров, плохие снижают или дорожают расходы.
   Выбор новости и срока определяется кодом класса, поэтому у учеников одного класса новости совпадают. */
var MARKET_NEWS = [
  {id:'olymp',   name:'Школьные олимпиады',       text:'В школах города пройдут олимпиады: организаторы закупают призы и подарки.',            prods:['key','stand'],          k:'dem', m:1.20, dur:1, lead:2, good:1},
  {id:'fair',    name:'Городская ярмарка',        text:'На главной площади открывается ярмарка: народу будет много, а прилавки дорогие.',       prods:'b2c',                    k:'dem', m:1.14, dur:1, lead:1, good:1},
  {id:'rain',    name:'Затяжные дожди',            text:'Неделями льют дожди: люди реже ходят по магазинам, продажи проседают.',                 prods:'b2c',                    k:'dem', m:0.91, dur:2, lead:1, good:0},
  {id:'techfest',name:'Фестиваль технологий',      text:'Город принимает фестиваль технологий: компании ищут изготовителей прототипов и деталей.', prods:['part','proto'],         k:'dem', m:1.25, dur:1, lead:2, good:1},
  {id:'tourney', name:'Турнир настольных игр',     text:'Клубы готовят городской турнир, и фигурки для игр сметают с полок.',                    prods:['mini'],                 k:'dem', m:1.28, dur:1, lead:2, good:1},
  {id:'moving',  name:'Сезон переездов',           text:'Многие семьи переезжают, и органайзеры и подставки нужны везде.',                         prods:['stand','lamp'],         k:'dem', m:1.18, dur:2, lead:1, good:1},
  {id:'strike',  name:'Забастовка курьеров',       text:'Курьерские службы на неделю остановили работу: заказы доходят хуже.',                   prods:'b2c',                    k:'dem', m:0.93, dur:1, lead:1, good:0},
  {id:'tax',     name:'Пошлина на пластик',        text:'Вводят новую пошлину на ввоз пластиковых нитей. Катушки подорожают на несколько месяцев.', prods:null,                     k:'fil', m:1.10, dur:3, lead:2, good:0},
  {id:'sale',    name:'Распродажа у конкурентов',  text:'Крупные конкуренты объявили распродажу: покупатели уходят за скидками.',                prods:['key','stand','mini'],   k:'dem', m:0.93, dur:1, lead:1, good:0},
  {id:'wave',    name:'Мода на 3D-печать',         text:'Блогеры рассказывают о 3D-печати, и люди хотят «что-нибудь напечатанное».',               prods:'b2c',                    k:'dem', m:1.10, dur:3, lead:1, good:1},
  {id:'power',   name:'Электричество дорожает',    text:'Энергетики повышают тариф: печать обойдётся дороже в течение нескольких месяцев.',        prods:null,                     k:'run', m:1.15, dur:3, lead:2, good:0},
  {id:'grants',  name:'Выплаты на кружки',         text:'Родителям компенсируют часть расходов на детские кружки: растёт спрос на сувениры.',     prods:['mini','stand','key'],   k:'dem', m:1.12, dur:2, lead:1, good:1}
];
var MARKET_NEWS_BY_ID = {}; MARKET_NEWS.forEach(function(n){ MARKET_NEWS_BY_ID[n.id]=n; });
function newsProds(n){ return n.prods==='b2c' ? PROD_IDS.filter(function(id){ return !PRODUCTS[id].b2b; }) : n.prods; }
function newsOf(s){ s.news=s.news||[]; return s.news; }
/* в начале месяца: включаем наступившие новости и, возможно, объявляем новую */
function stepNews(s){
  var L=newsOf(s); if(s.newsStep===s.month) return L; s.newsStep=s.month;
  L.forEach(function(x){
    if(x.start===s.month && !x.on){
      x.on=true; var N=MARKET_NEWS_BY_ID[x.id], pr=newsProds(N);
      if(pr) pr.forEach(function(p){ addMod(s,N.k,N.m,N.dur,N.name,p); }); else addMod(s,N.k,N.m,N.dur,N.name);
    }
  });
  var rng=rngFor(s,'news'+s.month);
  if(s.month<=13 && s.month>=2 && rng()<0.65){
    var used=L.map(function(x){ return x.id; }), pool=MARKET_NEWS.filter(function(n){ return used.indexOf(n.id)<0 && (!n.prods || n.prods==='b2c' || n.prods.every(function(p){ return true; })); });
    if(pool.length){
      var N=pool[Math.floor(rng()*pool.length)], start=s.month+N.lead;
      if(start<=TOTAL && !L.some(function(x){ return x.start>s.month && Math.abs(x.start-start)<1; })) L.push({id:N.id, start:start, announced:s.month, on:false});
    }
  }
  return L;
}
function newsUpcoming(s){ return newsOf(s).filter(function(x){ return x.start>s.month; }).sort(function(a,b){ return a.start-b.start; }); }
function newsActive(s){ return newsOf(s).filter(function(x){ var N=MARKET_NEWS_BY_ID[x.id]; return x.on && s.month>=x.start && s.month<x.start+N.dur; }); }
if(typeof module!=='undefined') module.exports = {};
