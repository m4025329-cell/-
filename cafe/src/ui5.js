/* ===== Интерфейс, часть 5: «Деньги» по разделам: учёт, анализ, банк, страна ===== */

var MSUBS=[
 {id:'month', n:'Месяц', ic:'coins'},
 {id:'acc',   n:'Учёт',  ic:'book'},
 {id:'ana',   n:'Анализ',ic:'chart'},
 {id:'bank',  n:'Банк',  ic:'bank'},
 {id:'cty',   n:'Страна',ic:'flag'}
];
function msubHTML(){
  var cur=U.msub||'month';
  return '<div class="msub" role="tablist" aria-label="Разделы вкладки «Деньги»">'+MSUBS.map(function(t){ return '<button role="tab" aria-selected="'+(cur===t.id)+'" data-act="msub" data-v="'+t.id+'">'+ico(t.ic,'sm')+'<span>'+t.n+'</span></button>'; }).join('')+'</div>';
}
A.msub=function(el){ U.msub=el.getAttribute('data-v'); if(S) S.seen['sub_'+U.msub]=1; U.pv=null; persist(); render(); window.scrollTo(0,0); };

/* ---------- мелкие помощники ---------- */
function shortRub(v){ var a=Math.abs(v), s=v<0?'−':''; if(a>=1000000) return s+f1d(a/1000000)+' млн'; if(a>=1000) return s+Math.round(a/1000)+' тыс'; return s+Math.round(a); }
function fneg(x){ return f1(x).replace('-','−'); }
function pc1(x){ return f1d(x*100)+'%'; }
function stRow(r,withPc){
  var cls=r.k==='head'?'head':(r.k==='sub'?'sub':(r.k==='total'?'total':(r.k==='minus'?'minus':(r.k==='plus'?'plus':''))));
  if(r.k==='head') return '<div class="st-row head"><span>'+esc(r.name)+'</span></div>';
  var sign=r.k==='minus'?'−':'', val=Math.abs(r.v)<0.5?'0 ₽':(sign+rub(Math.abs(r.v)).replace('−','')); if(r.k!=='minus'&&r.v<0&&r.k!=='plus') val=rub(r.v);
  var pcs=withPc&&r.pc!=null?'<i>'+Math.round(Math.abs(r.pc)*100)+'%</i>':'';
  return '<div class="st-row '+cls+'"><span>'+esc(r.name)+(r.hint?' <span class="hint">'+esc(r.hint)+'</span>':'')+'</span><b class="num '+((r.k==='total'||r.k==='sub')?(r.v>=0?'gain-t':'loss-t'):'')+'">'+val+'</b>'+pcs+'</div>';
}
function periodPick(){
  var L=S.led||[], cur=U.fper||'last', h='<div class="outsel" role="group" aria-label="Период отчёта">';
  h+='<button aria-pressed="'+(cur==='last')+'" data-act="fper" data-v="last">'+ico('calendar','sm')+' Последний месяц</button>';
  h+='<button aria-pressed="'+(cur==='all')+'" data-act="fper" data-v="all">'+ico('chart','sm')+' За всё время</button>';
  L.slice(-6).reverse().forEach(function(e){ if(e.m===L[L.length-1].m) return; h+='<button aria-pressed="'+(cur==='m'+e.m)+'" data-act="fper" data-v="m'+e.m+'">'+MONTHS_SHORT[e.m-1]+'</button>'; });
  return h+'</div>';
}
A.fper=function(el){ U.fper=el.getAttribute('data-v'); persist(); render(true); };
function periodData(){
  var L=S.led||[]; if(!L.length) return null; var cur=U.fper||'last', last=L[L.length-1].m;
  if(cur==='all') return {E:ledRange(S,1,last), name:'за всё время ('+L.length+' '+plural(L.length,'месяц','месяца','месяцев')+')', from:1, to:last};
  var m=cur==='last'?last:+cur.slice(1); if(!ledEntry(S,m)) m=last;
  return {E:ledRange(S,m,m), name:MONTHS[m-1].toLowerCase(), from:m, to:m};
}

/* ---------- графики ---------- */
function chartFrame(w,h,body,aria){ return '<svg class="chart" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+esc(aria)+'">'+body+'</svg>'; }
function niceStep(range,n){ var raw=range/n, p=Math.pow(10,Math.floor(Math.log(raw)/Math.LN10)), f=raw/p; return (f<=1?1:(f<=2?2:(f<=5?5:10)))*p; }
function lineChart(o){
  var W=320,H=o.h||170,L=46,R=14,T=14,B=o.xl?26:12, n=o.xs.length, all=[]; o.series.forEach(function(s){ all=all.concat(s.ys); });
  var mn=Math.min.apply(null,all.concat(o.zero===false?[]:[0])), mx=Math.max.apply(null,all), st=niceStep((mx-mn)||1,4); mn=Math.floor(mn/st)*st; mx=Math.ceil(mx/st)*st; if(mx===mn) mx=mn+st;
  function X(i){ return L+(n>1?i*(W-L-R)/(n-1):0); } function Y(v){ return H-B-(v-mn)/(mx-mn)*(H-B-T); }
  var b='';
  for(var v=mn; v<=mx+st/2; v+=st){ b+='<line class="ch-g" x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(v).toFixed(1)+'" y2="'+Y(v).toFixed(1)+'"/><text class="ch-t" x="'+(L-5)+'" y="'+(Y(v)+3.5).toFixed(1)+'" text-anchor="end">'+(o.yfmt?o.yfmt(v):shortRub(v))+'</text>'; }
  if(mn<0&&mx>0) b+='<line class="ch-z" x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(0).toFixed(1)+'" y2="'+Y(0).toFixed(1)+'"/>';
  if(o.xl) o.xl.forEach(function(t,i){ b+='<text class="ch-t" x="'+X(i).toFixed(1)+'" y="'+(H-8)+'" text-anchor="middle">'+t+'</text>'; });
  (o.mark||[]).forEach(function(m){ b+='<line class="ch-m" x1="'+X(m.i).toFixed(1)+'" x2="'+X(m.i).toFixed(1)+'" y1="'+T+'" y2="'+(H-B)+'"/>'; });
  o.series.forEach(function(s,k){
    var pts=s.ys.map(function(v,i){ return X(i).toFixed(1)+','+Y(v).toFixed(1); }).join(' ');
    b+='<polyline class="ch-l c'+(s.c||k)+'" points="'+pts+'"/>';
    s.ys.forEach(function(v,i){ b+='<circle class="ch-p c'+(s.c||k)+'" cx="'+X(i).toFixed(1)+'" cy="'+Y(v).toFixed(1)+'" r="'+(o.best&&o.best[k]===i?6:3.2)+'"/>'; });
  });
  return chartFrame(W,H,b,o.aria||'График');
}
function legendHTML(items){ return '<div class="legend">'+items.map(function(it){ return '<span><i class="lg c'+it.c+'"></i>'+esc(it.t)+'</span>'; }).join('')+'</div>'; }

function bepChart(b){
  var W=320,H=190,L=46,R=14,T=14,B=26, xmax=Math.max(b.actual,isFinite(b.perDay)?b.perDay:0)*1.6+5;
  function rev(g){ return b.price*(1-b.tr)*g*30; } function cost(g){ return b.fixed+b.v*g*30; }
  var ymax=Math.max(rev(xmax),cost(xmax)), st=niceStep(ymax,4); ymax=Math.ceil(ymax/st)*st;
  function X(g){ return L+g/xmax*(W-L-R); } function Y(v){ return H-B-v/ymax*(H-B-T); }
  var s='';
  for(var v=0; v<=ymax+st/2; v+=st){ s+='<line class="ch-g" x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(v).toFixed(1)+'" y2="'+Y(v).toFixed(1)+'"/><text class="ch-t" x="'+(L-5)+'" y="'+(Y(v)+3.5).toFixed(1)+'" text-anchor="end">'+shortRub(v)+'</text>'; }
  if(isFinite(b.perDay)&&b.perDay<xmax){
    s+='<polygon class="ch-loss" points="'+X(0).toFixed(1)+','+Y(cost(0)).toFixed(1)+' '+X(b.perDay).toFixed(1)+','+Y(rev(b.perDay)).toFixed(1)+' '+X(0).toFixed(1)+','+Y(0).toFixed(1)+'"/>';
    s+='<polygon class="ch-gain" points="'+X(b.perDay).toFixed(1)+','+Y(rev(b.perDay)).toFixed(1)+' '+X(xmax).toFixed(1)+','+Y(rev(xmax)).toFixed(1)+' '+X(xmax).toFixed(1)+','+Y(cost(xmax)).toFixed(1)+'"/>';
  }
  s+='<line class="ch-l c1" x1="'+X(0)+'" y1="'+Y(cost(0)).toFixed(1)+'" x2="'+X(xmax).toFixed(1)+'" y2="'+Y(cost(xmax)).toFixed(1)+'"/>';
  s+='<line class="ch-l c0" x1="'+X(0)+'" y1="'+Y(0)+'" x2="'+X(xmax).toFixed(1)+'" y2="'+Y(rev(xmax)).toFixed(1)+'"/>';
  s+='<line class="ch-m" x1="'+X(b.actual).toFixed(1)+'" x2="'+X(b.actual).toFixed(1)+'" y1="'+T+'" y2="'+(H-B)+'"/><text class="ch-t b" x="'+X(b.actual).toFixed(1)+'" y="'+(T-3)+'" text-anchor="'+(b.actual>xmax*0.7?'end':'start')+'">сейчас: '+Math.round(b.actual)+'</text>';
  if(isFinite(b.perDay)&&b.perDay<xmax) s+='<circle class="ch-bep" cx="'+X(b.perDay).toFixed(1)+'" cy="'+Y(rev(b.perDay)).toFixed(1)+'" r="6"/><text class="ch-t b" x="'+X(b.perDay).toFixed(1)+'" y="'+(Y(rev(b.perDay))+20).toFixed(1)+'" text-anchor="middle">'+Math.round(b.perDay)+'</text>';
  [0,0.25,0.5,0.75,1].forEach(function(k){ s+='<text class="ch-t" x="'+X(xmax*k).toFixed(1)+'" y="'+(H-8)+'" text-anchor="middle">'+Math.round(xmax*k)+'</text>'; });
  s+='<text class="ch-t" x="'+(L+(W-L-R)/2)+'" y="'+(H+4)+'" text-anchor="middle">гостей в день →</text><text class="ch-t" x="'+L+'" y="'+(T-3+0)+'" text-anchor="start" style="display:none"></text>';
  return chartFrame(W,H+10,s,'График безубыточности. Выручка пересекает расходы при '+(isFinite(b.perDay)?Math.round(b.perDay):'—')+' гостях в день, сейчас '+Math.round(b.actual));
}

/* ориентир: полоса «норма» и маркер текущего значения */
function benchRow(k,v){
  var b=BENCH[k], st=benchState(k,v), mx=k==='net'?0.4:(k==='rent'?0.35:(k==='prime'?1:(k==='labor'?0.7:0.7)));
  var lo=b.lo/mx*100, hi=b.hi/mx*100, pos=clamp(v/mx*100,0,100);
  return '<div class="bench '+st+'"><div class="row between nowrap"><b>'+b.n+'<span class="bst">'+({ok:'в норме',mid:'на границе',bad:(k==='net'?'ниже нормы':'выше нормы')})[st]+'</span></b><span class="num">'+pc1(v)+'</span></div><div class="btrack" role="img" aria-label="'+b.n+' '+pc1(v)+', ориентир от '+Math.round(b.lo*100)+' до '+Math.round(b.hi*100)+'%"><i class="zone" style="left:'+lo.toFixed(1)+'%;width:'+Math.max(2,hi-lo).toFixed(1)+'%"></i><i class="mark" style="left:'+pos.toFixed(1)+'%"></i></div><small>'+b.d+'. Ориентир: '+Math.round(b.lo*100)+'–'+Math.round(b.hi*100)+'%</small></div>';
}

/* ================= УЧЁТ ================= */
function accHTML(){
  var h=msubHTML(), P=periodData();
  if(!P){
    h+=card('Учёт начнётся с первого месяца','<p class="muted">Здесь будут три главных отчёта любой компании: о прибылях и убытках, о движении денег и баланс. Они появятся после первого запущенного месяца.</p>'+balanceCard(),{ic:'book'});
    return h;
  }
  var E=P.E, pl=plStatement(E), cfs=cfStatement(E), k=kpiOf(E);
  h+=periodPick();
  h+=card('Отчёт о прибылях и убытках','<p class="sub">Период: '+esc(P.name)+'. Справа — доля от выручки.</p><div class="stmt">'+pl.rows.filter(function(r){ return Math.abs(r.v)>=0.5||r.k==='sub'||r.k==='total'; }).map(function(r){ return stRow(r,true); }).join('')+'</div><div class="chips"><span class="chip info">Валовая маржа '+pc1(pl.gross/pl.base)+'</span><span class="chip info">Операционная маржа '+pc1(pl.op/pl.base)+'</span><span class="chip '+(pl.net>=0?'gain':'loss')+'">Чистая маржа '+pc1(pl.net/pl.base)+'</span></div><p class="small muted" style="margin:8px 0 0">Читайте сверху вниз: из выручки вычитаются продукты, потом остальные расходы, проценты и налог. Внизу остаётся чистая прибыль.</p><div class="chips">'+termChip('pnl')+termChip('grossprofit')+termChip('netprofit')+'</div>',{ic:'coins'});
  var ok=Math.abs(E.c0+cfs.delta-E.c1)<=Math.max(3,P.to-P.from+3);
  h+=card('Движение денег','<p class="sub">Период: '+esc(P.name)+'. Откуда пришли деньги и куда ушли.</p><div class="stmt">'+cfs.rows.map(function(r){ return stRow({name:r.name,v:r.v,k:r.k==='flow'?'':r.k,hint:r.hint},false); }).join('')+'<div class="st-row sub"><span>Деньги на начало периода</span><b class="num">'+rub(E.c0)+'</b></div><div class="st-row total"><span>Деньги на конец периода</span><b class="num">'+rub(E.c1)+'</b></div></div><div class="chips"><span class="chip '+(ok?'gain':'warn')+'">'+ico(ok?'check':'warn','sm')+' '+(ok?'Сходится с кассой':'Есть расхождение')+'</span><span class="chip info">Прибыль '+sgn(E.profit)+', деньги '+sgn(E.c1-E.c0)+'</span></div><p class="small muted" style="margin:8px 0 0">Прибыль и деньги — разные вещи. Купили оборудование: денег меньше, прибыль та же. Взяли кредит: денег больше, а прибыли нет.</p><div class="chips">'+termChip('cashflow')+termChip('capex')+'</div>',{ic:'trend'});
  h+=balanceCard();
  var br=capBridge(S,P.from,P.to);
  if(br) h+=card('Что изменило капитал','<p class="sub">Период: '+esc(P.name)+'.</p><div class="stmt"><div class="st-row sub"><span>Капитал в начале</span><b class="num">'+rub(br.start)+'</b></div>'+br.parts.filter(function(p){ return Math.abs(p.v)>=0.5; }).map(function(p){ return '<div class="st-row"><span>'+esc(p.name)+(p.hint?' <span class="hint">'+esc(p.hint)+'</span>':'')+'</span><b class="num '+(p.v>=0?'gain-t':'loss-t')+'">'+sgn(p.v)+'</b></div>'; }).join('')+'<div class="st-row total"><span>Капитал в конце</span><b class="num">'+rub(br.end)+'</b></div></div>',{ic:'chart'});
  h+=card('Показатели и ориентиры','<p class="sub">Период: '+esc(P.name)+'. Зелёная полоса — привычный диапазон для кафе.</p>'+['food','labor','prime','rent','net'].map(function(key){ return benchRow(key,k[key]); }).join('')+'<div class="chips">'+termChip('foodcost')+termChip('prime')+termChip('margin')+'</div><p class="small muted" style="margin:8px 0 0">Ориентиры упрощены для игры: в жизни они зависят от формата и города.</p>',{ic:'target'});
  return h;
}
function balanceCard(){
  var b=balanceNow(S), eq=b.equity;
  var asset='<div class="bal-col"><h4>Актив <small>что есть</small></h4><div class="st-row"><span>Деньги в кассе</span><b class="num">'+rub(b.cash)+'</b></div><div class="st-row"><span>Вклад</span><b class="num">'+rub(b.dep)+'</b></div><div class="st-row"><span>Оборудование и ремонт <span class="hint">55% цены</span></span><b class="num">'+rub(b.eq)+'</b></div><div class="st-row total"><span>Итого</span><b class="num">'+rub(b.assets)+'</b></div></div>';
  var pass='<div class="bal-col"><h4>Пассив <small>чьи это деньги</small></h4><div class="st-row"><span>Кредит банка</span><b class="num">'+rub(b.debt)+'</b></div><div class="st-row"><span>Экстренный долг</span><b class="num">'+rub(b.em)+'</b></div><div class="st-row"><span>Капитал владельца</span><b class="num '+(eq>=0?'gain-t':'loss-t')+'">'+rub(eq)+'</b></div><div class="st-row total"><span>Итого</span><b class="num">'+rub(b.liab+eq)+'</b></div></div>';
  var runway=S.led.length?(function(){ var e=S.led[S.led.length-1], fx=e.wages+e.rent+e.ut+e.mkt+e.hq+e.int; return fx>0?b.cash/fx:0; })():0;
  return card('Баланс на сегодня','<p class="sub">Слева то, чем вы владеете. Справа — откуда это взялось: взято в долг или принадлежит вам.</p><div class="bal">'+asset+pass+'</div><div class="chips"><span class="chip gain">'+ico('check','sm')+' Актив = долги + капитал</span>'+(S.led.length?'<span class="chip info">Денег хватит на '+f1d(runway)+' '+plural(Math.round(runway),'месяц','месяца','месяцев')+' постоянных расходов</span>':'')+'<span class="chip '+(b.liab<=eq?'gain':'warn')+'">Долги / капитал: '+(eq>0?f1(b.liab/eq):'—')+'</span></div><p class="small muted" style="margin:8px 0 0">Вложено владельцем: '+rubk(b.put)+'. Заработано и накоплено: '+sgn(Math.round(b.earned/1000)*1000).replace(/ ₽$/,'')+' ₽.</p><div class="chips">'+termChip('balance')+termChip('assets')+termChip('liquidity')+'</div>',{ic:'shield'});
}

/* ================= АНАЛИЗ ================= */
function anaHTML(){
  var h=msubHTML(), R=getPV(); if(!R) return h+'<p class="muted">Прогноз временно недоступен.</p>';
  h+=bepCard(R);
  h+=priceLabCard();
  h+=menuMatrixCard(R);
  h+=hireLabCard();
  return h;
}
function bepCard(R){
  var b=bepInfo(S,R); if(!b||!isFinite(b.perDay)) return card('Точка безубыточности','<p class="muted">Пока расходы выше дохода с гостя: безубыточность недостижима. Поднимите цены или снизьте расходы.</p>',{ic:'target'});
  var up=b.price*1.1*(1-b.tr)-b.v, bepUp=up>0?b.fixed/(up*30):Infinity, bepFix=b.fixed*1.1/(b.cm*30), ok=b.actual>=b.perDay;
  return card('Точка безубыточности','<p class="sub">Сколько гостей в день нужно, чтобы выручка сравнялась с расходами.</p>'+bepChart(b)+legendHTML([{c:0,t:'Выручка за вычетом налога'},{c:1,t:'Все расходы'}])+
    '<div class="kpi">'+metric('Постоянные расходы',rubk(b.fixed),'в месяц')+metric('Средний чек',rub(b.price),'с одного гостя')+metric('Переменные затраты',rub(b.v),'на гостя: продукты и др.')+metric('Вклад гостя',rub(b.cm),'чек − налог − затраты')+'</div>'+
    '<div class="calc"><b class="em">Формула</b><p>Безубыточность = постоянные расходы ÷ (вклад одного гостя × 30 дней)</p><p class="num">'+rubk(b.fixed)+' ÷ ('+rub(b.cm)+' × 30) = <b>'+Math.round(b.perDay)+' гостей в день</b></p></div>'+
    '<div class="chips"><span class="chip '+(ok?'gain':'loss')+'">Сейчас '+Math.round(b.actual)+' в день</span><span class="chip '+(b.safety>0.15?'gain':(b.safety>0?'warn':'loss')+'')+'">Запас прочности '+(b.safety>0?Math.round(b.safety*100)+'%':'нет')+'</span></div>'+
    '<div class="insight info"><span class="ico">'+ico('info')+'</span><div><b>Что если?</b><p>Средний чек +10%: порог упадёт до '+(isFinite(bepUp)?Math.round(bepUp):'—')+' гостей. Постоянные расходы +10% (например, аренда): порог вырастет до '+Math.round(bepFix)+'.</p></div></div>'+
    '<div class="chips">'+termChip('breakeven')+termChip('safety')+termChip('contrib')+'</div>',{ic:'target'});
}

function priceLabCard(){
  var ids=U.plab&&U.plab!=='all'?[U.plab]:null, menu=S.menu.filter(function(id){ return DISH[id]; });
  if(U.plab&&U.plab!=='all'&&menu.indexOf(U.plab)<0){ U.plab='all'; ids=null; }
  var rows=priceLab(S,ids); if(rows.length<7) return '';
  var E=elasticity(rows), cur=rows[3], best=0, bestRev=0; rows.forEach(function(r,i){ if(r.profit>rows[best].profit) best=i; if(r.rev>rows[bestRev].rev) bestRev=i; });
  var d=ids?DISH[ids[0]]:null, p0=d?priceOf(S,d):null, xl=rows.map(function(r){ return (r.sh>0?'+':(r.sh<0?'−':''))+Math.round(Math.abs(r.sh)*100)+'%'; });
  var pick='<div class="outsel" role="group" aria-label="Что менять">'+'<button aria-pressed="'+(!ids)+'" data-act="plab" data-v="all">Всё меню</button>'+menu.map(function(id){ return '<button aria-pressed="'+(ids&&ids[0]===id)+'" data-act="plab" data-v="'+id+'">'+esc(DISH[id].n)+'</button>'; }).join('')+'</div>';
  var verdict=E==null?'':(Math.abs(E)>1.05?'Спрос <span class="em">эластичный</span> (E = '+fneg(E)+'): цена вверх на 1% уводит больше 1% покупателей, выручка падает.':(Math.abs(E)<0.95?'Спрос <span class="em">неэластичный</span> (E = '+fneg(E)+'): цена вверх на 1% уводит меньше 1% покупателей, выручка растёт.':'Спрос около единичной эластичности (E = '+fneg(E)+'): выручка почти не меняется.'));
  var sh=rows[best].sh, tip=best===3?'Текущая цена уже близка к лучшей по прибыли.':('Лучшая прибыль в эксперименте при цене '+(sh>0?'+':'−')+Math.round(Math.abs(sh)*100)+'%: '+rubk(rows[best].profit)+' вместо '+rubk(cur.profit)+'.');
  var tbl='<div class="tblwrap" tabindex="0"><table class="mtable"><thead><tr><th>Цена</th><th>'+(ids?'Порций':'Порций')+'</th><th>Выручка</th><th>Прибыль</th></tr></thead><tbody>'+rows.map(function(r,i){ return '<tr'+(i===3?' class="now"':'')+'><td>'+xl[i]+(d?' · '+Math.max(1,round5(p0*(1+r.sh)))+' ₽':'')+'</td><td class="num">'+Math.round(r.q)+'</td><td class="num">'+shortRub(r.rev)+'</td><td class="num '+(r.profit>=0?'gain-t':'loss-t')+'">'+shortRub(r.profit)+'</td></tr>'; }).join('')+'</tbody></table></div>';
  return card('Лаборатория цены','<p class="sub">Эксперимент без риска: как изменится месяц, если поменять цены. Считается по правилам игры, но ваши настройки остаются как есть.</p>'+pick+
    '<h4 class="ch-h">Сколько порций купят</h4>'+lineChart({xs:rows,xl:xl,series:[{ys:rows.map(function(r){ return r.q; }),c:2}],mark:[{i:3}],zero:false,yfmt:function(v){ return Math.round(v); },aria:'Спрос: порции в зависимости от изменения цены',h:150})+
    '<h4 class="ch-h">Выручка и прибыль</h4>'+lineChart({xs:rows,xl:xl,series:[{ys:rows.map(function(r){ return r.rev; }),c:0},{ys:rows.map(function(r){ return r.profit; }),c:1}],mark:[{i:3}],best:{0:bestRev,1:best},aria:'Выручка и прибыль в зависимости от изменения цены',h:170})+legendHTML([{c:0,t:'Выручка'},{c:1,t:'Прибыль'}])+
    '<div class="insight info"><span class="ico">'+ico('chart')+'</span><div><b>'+tip+'</b><p>'+verdict+'</p>'+(bestRev!==best?'<p>Выручка и прибыль достигают максимума при разных ценах: выручка лучше при '+(rows[bestRev].sh>0?'+':'')+Math.round(rows[bestRev].sh*100)+'%, прибыль при '+(rows[best].sh>0?'+':'')+Math.round(rows[best].sh*100)+'%. Расходы на продукты растут вместе с продажами, поэтому максимум выручки — не максимум прибыли.</p>':'')+'</div></div>'+
    tbl+'<p class="small muted" style="margin:8px 0 0">Лаборатория считает один месяц и не учитывает, как цена влияет на рейтинг в будущем. Слишком высокие цены портят оценку «цена и качество».</p><div class="chips">'+termChip('elasticity')+termChip('pricing')+termChip('revenue')+'</div>',{ic:'percent'});
}
A.plab=function(el){ U.plab=el.getAttribute('data-v'); render(true); };

function menuMatrixCard(R){
  var o=curO(), r=R.outlets.filter(function(x){ return x.id===o.id; })[0]; if(!r||!r.mix||!r.mix.length) return '';
  var mix=r.mix.filter(function(m){ return m.qty>0.5; }); if(mix.length<2) return '';
  var avgMar=sumArr(mix.map(function(m){ return m.mar*m.qty; }))/sumArr(mix.map(function(m){ return m.qty; })), avgQty=sumArr(mix.map(function(m){ return m.qty; }))/mix.length*0.7;
  var W=320,H=230,L=40,Rr=12,T=14,B=30, qs=mix.map(function(m){ return m.qty; }), ms=mix.map(function(m){ return m.mar; });
  var qx=Math.max.apply(null,qs.concat([avgQty*2]))*1.1, mxy=Math.max.apply(null,ms.concat([avgMar*2]))*1.1, myn=Math.min.apply(null,ms.concat([0]));
  function X(v){ return L+v/qx*(W-L-Rr); } function Y(v){ return H-B-(v-myn)/(mxy-myn)*(H-B-T); }
  var s='<rect class="q-star" x="'+X(avgQty).toFixed(1)+'" y="'+T+'" width="'+(W-Rr-X(avgQty)).toFixed(1)+'" height="'+(Y(avgMar)-T).toFixed(1)+'"/><rect class="q-dog" x="'+L+'" y="'+Y(avgMar).toFixed(1)+'" width="'+(X(avgQty)-L).toFixed(1)+'" height="'+(H-B-Y(avgMar)).toFixed(1)+'"/>';
  s+='<line class="ch-m" x1="'+X(avgQty).toFixed(1)+'" x2="'+X(avgQty).toFixed(1)+'" y1="'+T+'" y2="'+(H-B)+'"/><line class="ch-m" x1="'+L+'" x2="'+(W-Rr)+'" y1="'+Y(avgMar).toFixed(1)+'" y2="'+Y(avgMar).toFixed(1)+'"/>';
  s+='<text class="ch-q" x="'+(W-Rr-4)+'" y="'+(T+13)+'" text-anchor="end">Звёзды</text><text class="ch-q" x="'+(L+4)+'" y="'+(T+13)+'">Загадки</text><text class="ch-q" x="'+(W-Rr-4)+'" y="'+(H-B-6)+'" text-anchor="end">Кони</text><text class="ch-q" x="'+(L+4)+'" y="'+(H-B-6)+'">Балласт</text>';
  s+='<text class="ch-t" x="'+((L+W-Rr)/2)+'" y="'+(H-6)+'" text-anchor="middle">популярность: порций за месяц →</text><text class="ch-t" transform="rotate(-90 11 '+((T+H-B)/2)+')" x="11" y="'+((T+H-B)/2)+'" text-anchor="middle">прибыль с порции, ₽ →</text>';
  var sorted=mix.slice().sort(function(a,b){ return b.qty-a.qty; });
  sorted.forEach(function(m,i){ m.n=i+1; s+='<g class="dotg"><circle class="dot '+m.cls+'" cx="'+X(m.qty).toFixed(1)+'" cy="'+Y(m.mar).toFixed(1)+'" r="10"/><text class="dot-n '+m.cls+'" x="'+X(m.qty).toFixed(1)+'" y="'+(Y(m.mar)+4).toFixed(1)+'" text-anchor="middle">'+m.n+'</text></g>'; });
  var NM={star:'Звезда',horse:'Конь',puzzle:'Загадка',dog:'Балласт'}, ADV={star:'Берегите: не прячьте, не дешевите.',horse:'Популярное, но заработок мал: попробуйте поднять цену на 5–10% или сделать дешевле в продуктах.',puzzle:'Выгодное, но редкое: сделайте блюдом дня, расскажите гостям.',dog:'Редко берут и мало зарабатывают: кандидат на замену.'};
  var list=sorted.map(function(m){ return '<div class="mrow"><span class="dot-n2 '+m.cls+'">'+m.n+'</span><div><b>'+esc(m.name)+'</b> <span class="cls '+m.cls+'">'+NM[m.cls]+'</span><div class="small muted">'+Math.round(m.qty)+' порций · цена '+m.price+' ₽ · прибыль с порции '+Math.round(m.mar)+' ₽ ('+Math.round(m.mar/m.price*100)+'%)</div></div></div>'; }).join('');
  return card('Меню-матрица','<p class="sub">«'+esc(CITIES[o.city].n)+'»: каждое блюдо — точка. Чем правее, тем популярнее. Чем выше, тем больше зарабатываете с порции.</p>'+chartFrame(W,H,s,'Меню-матрица: популярность и прибыль блюд')+'<div class="matrix-legend"><span class="cls star">Звёзды</span><span class="cls horse">Кони</span><span class="cls puzzle">Загадки</span><span class="cls dog">Балласт</span></div>'+list+'<div class="insight info"><span class="ico">'+ico('info')+'</span><div><b>Что делать с каждым классом</b><p>'+['star','horse','puzzle','dog'].map(function(k){ return '<span class="em">'+NM[k]+'</span>: '+ADV[k]; }).join(' ')+'</p></div></div><div class="chips">'+termChip('menueng')+termChip('margin')+'</div>',{ic:'chart'});
}

function hireLabCard(){
  var o=curO(); if(o.built) return '';
  var rows=hireLab(S,o.id); if(!rows.length) return '';
  var NM={cook:'повар',wait:'официант',bar:'бариста',cln:'уборщик'};
  var body=rows.map(function(x){
    var good=x.dProfit>2000, cls=good?'gain':(x.dProfit<-2000?'loss':'info');
    return '<div class="hire-row"><div><b>Ещё один '+NM[x.role]+'</b><div class="small muted">найм '+rub(x.hire)+', зарплата '+rub(x.wage)+' в месяц</div></div><div class="hire-n"><span class="chip gain">выручка '+sgn(Math.round(x.dRev/100)*100)+'</span><span class="chip loss">расходы '+sgn(Math.round(x.dCost/100)*100)+'</span><span class="chip '+cls+'">прибыль '+sgn(Math.round(x.dProfit/100)*100)+'</span></div></div>';
  }).join('');
  var bestR=rows.slice().sort(function(a,b){ return b.dProfit-a.dProfit; })[0], bn=bestR&&bestR.dProfit>2000?NM[bestR.role]:null;
  return card('Предельный анализ: ещё один человек','<p class="sub">Что изменится за месяц в «'+esc(CITIES[o.city].n)+'», если добавить одного сотрудника. Новый человек окупается, только если он убирает «узкое место».</p>'+body+'<div class="insight '+(bn?'good':'info')+'"><span class="ico">'+ico(bn?'check':'info')+'</span><div><b>'+(bn?'Выгоднее всего нанять: '+bn:'Сейчас новый человек не окупится')+'</b><p>'+(bn?'Он добавит '+rub(bestR.dProfit)+' прибыли в месяц и окупит найм за '+(isFinite(bestR.pay)?f1d(Math.max(0.1,bestR.pay)):'—')+' мес.':'Мощностей хватает, лишний человек просто увеличит расходы.')+'</p></div></div><p class="small muted" style="margin:6px 0 0">Это <b>предельный</b> подход: сравниваем не «всё до» и «всё после», а только добавку одного шага: предельную выручку и предельные расходы.</p><div class="chips">'+termChip('marginal')+termChip('bottleneck')+'</div>',{ic:'people'});
}

/* ================= БАНК ================= */
function bankHTML(){
  var h=msubHTML(), R=getPV(); if(!R) return h;
  var lim=loanLimit(S), room=lim-S.debt, lr=loanRate(S), dr=depRate(S);
  h+=card('Кредит','<div class="kpi">'+metric('Кредит банка',rubk(S.debt),'под '+f1d(lr*100)+'% в месяц')+metric('Проценты в месяц',rubk(S.debt*lr+S.emerg*MACRO.emerg),'')+metric('Можно взять ещё',rubk(Math.max(0,room)),'лимит '+rubk(lim))+metric('Экстренный долг',rubk(S.emerg),S.emerg?'3,5% в месяц':'нет',S.emerg?'bad':'')+'</div><div class="row"><button class="btn small" data-act="borrow" data-v="250000"'+(room<250000?' disabled':'')+'>Взять 250 000 ₽</button><button class="btn small secondary" data-act="repay" data-v="250000"'+(S.debt+S.emerg<=0?' disabled':'')+'>Погасить 250 000 ₽</button>'+(S.debt+S.emerg>0?'<button class="btn small ghost" data-act="repay" data-v="all">Погасить всё возможное</button>':'')+'</div><p class="small muted" style="margin:8px 0 0">Ставка зависит от ключевой ставки Центробанка: сейчас '+f1d(keyRate(S))+'%. Кредит даёт деньги сейчас, но проценты платятся каждый месяц.</p>'+termChip('loan')+' '+termChip('keyrate'),{ic:'bank'});
  if(S.month>=9||S.flags.expand){ h+=card('Инвестор','<p>'+(S.invest?'Артём Викторович в деле: он получает 20% чистой прибыли каждый месяц.':'Артём Викторович готов вложить '+rub(INVESTOR.sum)+' за 20% чистой прибыли навсегда.')+'</p>'+(S.invest?'':'<button class="btn small" data-act="invest">Взять инвестора</button>')+'<div style="margin-top:8px">'+termChip('equity')+'</div>',{ic:'handshake'}); }
  h+=card('Вклад','<div class="kpi">'+metric('На вкладе',rubk(S.dep||0),'растёт на '+f1d(dr*100)+'% в месяц')+metric('Проценты в месяц',rub((S.dep||0)*dr),'')+'</div><div class="row"><button class="btn small" data-act="dep" data-v="250000"'+(S.cash<250000?' disabled':'')+'>Положить 250 000 ₽</button><button class="btn small secondary" data-act="undep" data-v="250000"'+((S.dep||0)<=0?' disabled':'')+'>Снять 250 000 ₽</button></div><p class="small muted" style="margin:8px 0 0">Свободные деньги на вкладе приносят проценты и входят в капитал. Но на заведения их надо будет снять.</p>'+termChip('deposit'),{ic:'bank'});
  h+=costOfMoneyCard();
  h+=card('Страховка и закупка впрок','<div class="row between"><div><b>Страховка кафе</b><div class="small muted">'+rub(7000*ownOutlets(S).length)+' в месяц. Возвращает 40% неожиданных убытков от случаев.</div></div><div class="toggle-wrap"><button class="toggle" role="switch" aria-checked="'+(!!S.insured)+'" aria-label="Страховка" data-act="insure"></button></div></div><hr style="border:0;border-top:2px dotted var(--edge);margin:12px 0"><div class="row between"><div><b>Закупка впрок</b><div class="small muted">'+((S.flags.fwdUntil||0)>=S.month?'Действует до '+MONTHS[Math.min(15,S.flags.fwdUntil)]+': продукты дешевле на 6%.':'Фиксируете цену на 3 месяца: −6%. Взнос '+rub(forwardFee(S))+'. Если цены упадут, вы переплатите.')+'</div></div><button class="btn small secondary" data-act="forward"'+((S.flags.fwdUntil||0)>=S.month?' disabled':'')+'>Подписать</button></div>'+termChip('insurance')+' '+termChip('forward'),{ic:'shield'});
  return h;
}
function costOfMoneyCard(){
  var L=S.led||[], k=Math.min(3,L.length), avg=k?sumArr(L.slice(-k).map(function(e){ return e.profit; }))/k:0;
  var loanY=loanRate(S)*12, depY=depRate(S)*12, em=MACRO.emerg*12;
  var invY=S.invest?(INVESTOR.share*Math.max(0,avg)*12)/INVESTOR.sum:((INVESTOR.share*Math.max(0,avg)*12)/INVESTOR.sum);
  function row(n,v,d,cls){ return '<div class="cm-row"><div><b>'+n+'</b><div class="small muted">'+d+'</div></div><span class="chip '+cls+' num">'+Math.round(v*100)+'% в год</span></div>'; }
  return card('Сколько стоят деньги','<p class="sub">Любые деньги чего-то стоят. Сравните цену каждого источника в пересчёте на год.</p>'+row('Кредит банка',loanY,'Платите проценты, долю бизнеса не отдаёте.','info')+row('Инвестор',invY,'20% чистой прибыли ≈ '+rubk(INVESTOR.share*Math.max(0,avg)*12)+' в год при вашей прибыли ('+rubk(avg)+' в месяц) на '+rubk(INVESTOR.sum)+'. Чем успешнее бизнес, тем дороже такие деньги.',invY>loanY?'loss':'gain')+row('Экстренный долг',em,'Штрафные проценты, когда касса пуста. Это самый дорогой источник.','loss')+row('Вклад (доход)',depY,'Столько приносят свободные деньги в банке.','gain')+'<p class="small muted" style="margin:6px 0 0">Если бизнес зарабатывает на вложенный рубль больше, чем стоит кредит, кредит выгоден. Если меньше, он съедает прибыль. Это называется <b>финансовым рычагом</b>.</p><div class="chips">'+termChip('leverage')+termChip('opcost')+'</div>',{ic:'percent'});
}

/* ================= СТРАНА ================= */
function ctyHTML(){
  var h=msubHTML(), L=S.led||[], key=keyRate(S), infl=inflAnnual(S), lr=loanRate(S)*12*100, dr=depRate(S)*12*100, real=dr-infl;
  var dem=(macroDem(S)-1)*100;
  var next=S.month%2===0?'после этого месяца':'после следующего месяца';
  h+=card('Экономика страны','<p class="sub">Большие числа, которые не зависят от вас, но влияют на каждое решение.</p><div class="kpi">'+metric('Ключевая ставка',f1d(key)+'%','Центробанка, в год')+metric('Инфляция',f1d(infl)+'%','рост цен за год')+metric('Кредит в банке',f1d(lr)+'%','в год')+metric('Вклад в банке',f1d(dr)+'%','в год')+'</div><div class="insight '+(real>=0?'good':'warn')+'"><span class="ico">'+ico(real>=0?'check':'warn')+'</span><div><b>Реальная доходность вклада: '+(real>0?'+':'')+f1d(real)+'% в год</b><p>'+(real>=0?'Вклад обгоняет инфляцию: деньги на нём не обесцениваются.':'Вклад отстаёт от инфляции: деньги растут на бумаге, но покупают всё меньше.')+'</p></div></div>'+
    '<p class="small muted" style="margin:6px 0">'+(S.mac.step?'На последнем заседании Центробанк '+(S.mac.step>0?'повысил':'снизил')+' ставку на '+f1d(Math.abs(S.mac.step))+' п. п.':'Центробанк пересматривает ключевую ставку раз в два месяца.')+' Следующее решение '+next+'. '+(dem>0.05?'Низкая ставка немного бодрит спрос (+'+f1d(dem)+'%).':(dem<-0.05?'Высокая ставка охлаждает спрос ('+f1d(dem)+'%): люди откладывают траты.':'Спрос на нейтральном уровне.'))+'</p><div class="chips">'+termChip('keyrate')+termChip('inflation')+termChip('realnominal')+'</div>',{ic:'flag'});
  if(L.length>1){
    var xl=L.map(function(e){ return MONTHS_SHORT[e.m-1]; });
    h+=card('Ставка и инфляция по месяцам','<p class="sub">Центробанк поднимает ставку, когда цены растут слишком быстро, и снижает, когда рост цен успокаивается.</p>'+lineChart({xs:L,xl:xl.map(function(t,i){ return i%2===0?t:''; }),series:[{ys:L.map(function(e){ return e.key; }),c:0},{ys:L.map(function(e){ return e.infl; }),c:1}],zero:false,yfmt:function(v){ return Math.round(v)+'%'; },aria:'Ключевая ставка и инфляция по месяцам',h:170})+legendHTML([{c:0,t:'Ключевая ставка, %'},{c:1,t:'Инфляция за год, %'}]),{ic:'trend'});
  }
  /* номинальное и реальное */
  var cap=capital(S), rc=realCapital(S), base=DIFFS[S.diff].start;
  h+=card('Номинальное и реальное','<p class="sub">Рубли в разное время стоят по-разному. Чтобы честно сравнить, пересчитываем в цены начала игры.</p><div class="kpi">'+metric('Капитал в рублях',rubk(cap),'номинальный')+metric('В ценах начала',rubk(rc),'реальный',rc>=base?'ok':'bad')+metric('Цены на продукты','+'+f1d((S.cidx-1)*100)+'%','с начала игры')+metric('Зарплаты','+'+f1d((S.widx-1)*100)+'%','с начала игры')+'</div><p class="small muted" style="margin:0">Цены в меню выросли на '+f1d((S.pidx-1)*100)+'%, а продукты подорожали на '+f1d((S.cidx-1)*100)+'%. Если не обновлять цены, маржа тает: используйте «Подогнать цены под рынок» в меню.</p><div class="chips">'+termChip('realnominal')+termChip('inflation')+termChip('margin')+'</div>',{ic:'chart'});
  /* зарплата и налоги */
  var R=getPV(), w=R?R.total.wages:0, p=payroll(w);
  h+=card('Зарплата и налоги на труд','<p class="sub">Каждый рубль зарплаты стоит работодателю дороже. Разберём ваш фонд оплаты труда за месяц.</p>'+(w>0?'<div class="split" role="img" aria-label="Из '+rub(w)+': сотрудникам '+rub(p.net)+', НДФЛ '+rub(p.ndfl)+', взносы '+rub(p.contrib)+'"><i class="s-net" style="width:'+(p.net/w*100).toFixed(1)+'%"></i><i class="s-ndfl" style="width:'+(p.ndfl/w*100).toFixed(1)+'%"></i><i class="s-con" style="width:'+(p.contrib/w*100).toFixed(1)+'%"></i></div><div class="stmt"><div class="st-row"><span><i class="lg s-net"></i>Сотрудникам на руки</span><b class="num">'+rub(p.net)+'</b></div><div class="st-row"><span><i class="lg s-ndfl"></i>НДФЛ 13% <span class="hint">удерживается из зарплаты</span></span><b class="num">'+rub(p.ndfl)+'</b></div><div class="st-row"><span><i class="lg s-con"></i>Страховые взносы 30% <span class="hint">платит работодатель сверх зарплаты</span></span><b class="num">'+rub(p.contrib)+'</b></div><div class="st-row total"><span>Стоимость труда для кафе</span><b class="num">'+rub(w)+'</b></div></div><p class="small muted" style="margin:8px 0 0">Зарплата «до вычета налога» — '+rub(p.gross)+'. Государству уходит '+Math.round((p.ndfl+p.contrib)/w*100)+'% стоимости труда: на пенсии, больницы и школы.</p>':'<p class="muted">Нет данных по зарплатам.</p>')+'<div class="chips">'+termChip('ndfl')+termChip('payrolltax')+'</div>',{ic:'people'});
  /* налоги за всё время */
  if(L.length){
    var tx=sumArr(L.map(function(e){ return e.tax; })), pw=payroll(sumArr(L.map(function(e){ return e.wages; }))), rv=sumArr(L.map(function(e){ return e.rev+e.roy; }));
    h+=card('Сколько вы заплатили государству','<div class="kpi">'+metric('Налог на бизнес',rubk(tx),'УСН за игру')+metric('Налоги на труд',rubk(pw.ndfl+pw.contrib),'НДФЛ и взносы')+metric('Всего налогов',rubk(tx+pw.ndfl+pw.contrib),'')+metric('Доля выручки',pct((tx+pw.ndfl+pw.contrib)/Math.max(1,rv)),'ушло государству')+'</div><p class="small muted" style="margin:0">Налоги платят за дороги, школы и защиту. Для малого бизнеса государство делает режимы попроще и подешевле (УСН).</p><div class="chips">'+termChip('tax')+termChip('simple')+'</div>',{ic:'building'});
  }
  h+=newsCardHTML();
  return h;
}

/* ================= КАЛЬКУЛЯЦИЯ БЛЮДА ================= */
A.calc=function(el){
  var id=el.getAttribute('data-d'), d=DISH[id]; if(!d) return; if(S) S.seen.calc=1;
  var o=curO(), r=pvOut(o), mi=null; if(r&&r.mix) r.mix.forEach(function(m){ if(m.id===id) mi=m; });
  var c=dishCalc(S,o,d,mi), rows=priceLab(S,[id],[-0.1,0,0.1]), up=rows[2], dn=rows[0], mid=rows[1];
  var fixed=0; var R=getPV(); if(R){ var t=R.total; fixed=t.wages+t.rent+t.util+t.mkt+t.hq+R.interest; }
  var perDay=c.profit>0?fixed/30/c.profit:Infinity, fc=c.price>0?c.cost/c.price:0;
  var wh='';
  if(mi&&up&&mid&&mid.q>0){ var dq=(up.q-mid.q)/mid.q, dm=up.dmar-mid.dmar; wh='<div class="insight info"><span class="ico">'+ico('chart')+'</span><div><b>Что если цена +10%?</b><p>Порций станет '+(dq<0?'меньше':'больше')+' примерно на '+Math.abs(Math.round(dq*100))+'%, а прибыль на этом блюде за месяц '+(dm>=0?'вырастет':'упадёт')+' на '+rub(Math.abs(dm)).replace('−','')+'. '+(dm>=0?'Цена пока ниже оптимальной.':'Выше этой цены гости уходят слишком быстро.')+'</p></div></div>'; }
  openModal('Калькуляция: '+esc(d.n),'<p class="sub">Из чего складывается цена одной порции.</p><div class="stmt"><div class="st-row"><span>Цена в меню</span><b class="num">'+rub(c.price)+'</b></div><div class="st-row"><span>Продукты <span class="hint">у вашего поставщика</span></span><b class="num">−'+rub(c.base).replace('−','')+'</b></div><div class="st-row"><span>Порча и потери <span class="hint">часть продуктов не доходит до гостя</span></span><b class="num">−'+rub(c.waste).replace('−','')+'</b></div><div class="st-row sub"><span>Себестоимость порции</span><b class="num">'+rub(c.cost)+'</b></div><div class="st-row total"><span>Прибыль с порции</span><b class="num '+(c.profit>=0?'gain-t':'loss-t')+'">'+sgn(c.profit)+'</b></div></div>'+
   '<div class="kpi"><div><small>Наценка</small><b class="num">'+Math.round(c.markup*100)+'%</b><i>прибыль ÷ себестоимость</i></div><div><small>Маржа</small><b class="num">'+Math.round(c.margin*100)+'%</b><i>прибыль ÷ цена</i></div><div class="'+(fc<=0.33?'ok':'bad')+'"><small>Фуд-кост блюда</small><b class="num">'+Math.round(fc*100)+'%</b><i>себестоимость ÷ цена</i></div><div><small>Порций в день</small><b class="num">'+(isFinite(perDay)?Math.round(perDay):'—')+'</b><i>покрыть все постоянные расходы только им</i></div></div>'+wh+
   '<p class="small muted">Наценка и маржа — не одно и то же. Наценка считается от себестоимости, а маржа от цены, поэтому наценка всегда выше маржи.</p><div class="chips">'+termChip('margin')+termChip('cost')+termChip('foodcost')+'</div>');
};

/* ================= БИЗНЕС-ПЛАН ТОЧКИ ================= */
function planCard(k){
  var a=openPlan(S,k,'cafe'), b=openPlan(S,k,'rest'); if(!a||!a.steady) return '';
  function col(P,name){
    if(!P||!P.steady) return '';
    var okp=P.pay<=12;
    return '<div class="plan-col"><h4>'+name+'</h4><div class="st-row"><span>Вложить</span><b class="num">'+rubk(P.cost.total)+'</b></div><div class="st-row"><span>Первый месяц</span><b class="num '+(P.first.net>=0?'gain-t':'loss-t')+'">'+sgn(Math.round(P.first.net/1000)*1000).replace(/ ₽$/,'')+' ₽</b></div><div class="st-row"><span>Когда наберёт обороты</span><b class="num gain-t">'+sgn(Math.round(P.steady.net/1000)*1000).replace(/ ₽$/,'')+' ₽</b></div><div class="st-row"><span>Окупится за</span><b class="num '+(okp?'gain-t':'loss-t')+'">'+(isFinite(P.pay)?Math.ceil(P.pay)+' мес.':'не окупится')+'</b></div><div class="st-row"><span>Доходность в год</span><b class="num">'+Math.round(P.roi*100)+'%</b></div></div>';
  }
  var best=(a.roi>=b.roi?'кафе':'ресторан');
  return card('Бизнес-план: '+esc(CITIES[k].n),'<p class="sub">Прикидка по правилам игры: сколько вложить, сколько заработает и когда деньги вернутся. Считается для заведения с управляющим.</p><div class="plan">'+col(a,'Кафе')+col(b,'Ресторан')+'</div><div class="insight '+(a.better?'good':'warn')+'"><span class="ico">'+ico(a.better?'check':'warn')+'</span><div><b>'+(a.better?'Выгоднее вклада в банке':'Не выгоднее вклада')+'</b><p>Вклад даёт '+Math.round(a.dep*100)+'% в год, кафе при хорошем ходе около '+Math.round(a.roi*100)+'%. Выгоднее по доходности: '+best+'. Но вклад не требует сил и не рискует, а заведение нужно ещё и раскрутить.</p></div></div><p class="small muted" style="margin:6px 0 0">Рассчитано на «обороты» с рейтингом как у флагмана. Первые месяцы будут слабее. Стройка длится месяц, и в это время платится аренда.</p><div class="chips">'+termChip('payback')+termChip('roi')+termChip('opcost')+'</div>',{ic:'trend'});
}
