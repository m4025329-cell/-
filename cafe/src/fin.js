/* ===== Учёт и анализ: отчёты по журналу денег, показатели, лаборатории «что если» ===== */

/* ---------- сложение месяцев журнала ---------- */
var LED_FLOW=['rev','roy','cogs','wages','rent','ut','mkt','comm','hq','int','tax','div','pre','profit','dint','guests','emerg','gap'];
var LED_CF=['capex','dev','other','loan','repay','equity','depo','emerg','sale'];
function ledRange(s,from,to){
  var L=(s.led||[]).filter(function(e){ return e.m>=from && e.m<=to; });
  if(!L.length) return null;
  var A={m:L[L.length-1].m, from:L[0].m, months:L.length, cf:{}};
  LED_FLOW.forEach(function(k){ A[k]=0; }); LED_CF.forEach(function(k){ A.cf[k]=0; });
  L.forEach(function(e){ LED_FLOW.forEach(function(k){ A[k]+=e[k]||0; }); LED_CF.forEach(function(k){ A.cf[k]+=(e.cf&&e.cf[k])||0; }); });
  var f=L[0], l=L[L.length-1];
  A.c0=f.c0; A.c1=l.c1; A.dep=l.dep; A.debt=l.debt; A.em=l.em; A.eqv=l.eqv; A.cap=l.cap; A.cpi=l.cpi; A.key=l.key; A.infl=l.infl; A.n=l.n;
  A.cap0=ledStartCap(s,f.m); var pe=ledEntry(s,f.m-1); A.eqv0=pe?pe.eqv:0;
  return A;
}
function ledStartCap(s,m){ var p=(s.led||[]).filter(function(e){ return e.m===m-1; })[0]; return p?p.cap:DIFFS[s.diff].start; }
function ledEntry(s,m){ return (s.led||[]).filter(function(e){ return e.m===m; })[0]||null; }

/* ---------- отчёт о прибылях и убытках ---------- */
function plStatement(E){
  var gross=E.rev+E.roy-E.cogs, opx=E.wages+E.rent+E.ut+E.mkt+E.comm+E.hq, op=gross-opx, pre=op-E.int, net=pre-E.tax-E.div;
  var base=Math.max(1,E.rev+E.roy);
  function row(id,name,v,k,hint){ return {id:id,name:name,v:v,k:k,hint:hint||'',pc:v/base}; }
  return {
    base:base, gross:gross, op:op, pre:pre, net:net,
    rows:[
      row('rev','Выручка',E.rev,'plus','гости, доставка, банкеты'),
      row('roy','Роялти франшиз',E.roy,'plus','за вычетом поддержки'),
      row('cogs','Себестоимость: продукты',E.cogs,'minus','то, из чего сделаны блюда'),
      row('gross','Валовая прибыль',gross,'sub','выручка минус продукты'),
      row('wages','Зарплаты с взносами',E.wages,'minus','расходы работодателя'),
      row('rent','Аренда',E.rent,'minus',''),
      row('ut','Коммунальные и прочее',E.ut,'minus',''),
      row('mkt','Реклама',E.mkt,'minus',''),
      row('comm','Комиссия доставки',E.comm,'minus',''),
      row('hq','Штаб сети',E.hq,'minus','управление и особые люди'),
      row('op','Операционная прибыль',op,'sub','до процентов и налога'),
      row('int','Проценты по кредитам',E.int,'minus',''),
      row('pre','Прибыль до налога',pre,'sub',''),
      row('tax','Налог',E.tax,'minus','УСН'),
      row('div','Доля партнёров',E.div,'minus','инвестор и партнёр'),
      row('net','Чистая прибыль',net,'total','то, что осталось владельцу')
    ]
  };
}

/* ---------- отчёт о движении денег ---------- */
function cfStatement(E){
  var c=E.cf||{}, ops=E.profit+(c.other||0)+(c.dev||0)+(E.gap||0), inv=(c.capex||0)+(c.depo||0)+(c.sale||0), fin=(c.loan||0)+(c.repay||0)+(c.equity||0)+(c.emerg||0)+(E.emerg||0);
  function row(id,name,v,k,hint){ return {id:id,name:name,v:v,k:k,hint:hint||''}; }
  var rows=[
    row('h1','Основная деятельность',0,'head'),
    row('profit','Чистая прибыль',E.profit,'flow','из отчёта о прибылях'),
    row('other','Случаи, призы и награды',c.other||0,'flow','события, задания, викторина'),
    row('dev','Найм, обучение, рецепты, штаб',c.dev||0,'flow','разовые расходы развития')
  ];
  if(Math.abs(E.gap||0)>2) rows.push(row('gap','Прочее',E.gap,'flow','поправка на старое сохранение'));
  rows.push(row('ops','Денежный поток от основной деятельности',ops,'sub'));
  rows.push(row('h2','Инвестиции',0,'head'));
  rows.push(row('capex','Оборудование, ремонт, открытие точек',c.capex||0,'flow','покупка того, что работает годами'));
  rows.push(row('depo','Вклад: положили или сняли',c.depo||0,'flow','деньги не потеряны, они на вкладе'));
  if(c.sale) rows.push(row('sale','Продажа оборудования при закрытии',c.sale,'flow',''));
  rows.push(row('inv','Денежный поток от инвестиций',inv,'sub'));
  rows.push(row('h3','Финансы',0,'head'));
  rows.push(row('loan','Кредит получен',c.loan||0,'flow',''));
  rows.push(row('repay','Кредит погашен',c.repay||0,'flow',''));
  if(c.equity) rows.push(row('equity','Вложения инвестора',c.equity,'flow','взамен доли в прибыли'));
  if((c.emerg||0)+(E.emerg||0)) rows.push(row('emerg','Экстренный долг',(c.emerg||0)+(E.emerg||0),'flow','когда касса опустела'));
  rows.push(row('fin','Денежный поток от финансов',fin,'sub'));
  return {rows:rows, ops:ops, inv:inv, fin:fin, delta:ops+inv+fin, c0:E.c0, c1:E.c1};
}

/* ---------- баланс на сейчас ---------- */
function balanceNow(s){
  var cash=s.cash, dep=s.dep||0, eq=ownerOutletValue(s), assets=cash+dep+eq, debt=s.debt, em=s.emerg, liab=debt+em, equity=assets-liab;
  var start=DIFFS[s.diff].start, put=start+(s.invest?INVESTOR.sum:0);
  return {cash:cash, dep:dep, eq:eq, assets:assets, debt:debt, em:em, liab:liab, equity:equity, start:start, put:put, earned:equity-put};
}
function capBridge(s,from,to){
  var A=ledRange(s,from,to); if(!A) return null;
  var c=A.cf, parts=[
    {id:'p',name:'Чистая прибыль',v:A.profit},
    {id:'d',name:'Проценты по вкладу',v:A.dint},
    {id:'o',name:'Случаи, призы и награды',v:c.other||0},
    {id:'x',name:'Найм, обучение, рецепты, штаб',v:c.dev||0},
    {id:'e',name:'Вложения инвестора',v:c.equity||0},
    {id:'q',name:'Вложения в оборудование и точки',v:(A.eqv-A.eqv0)+(c.capex||0)+(c.sale||0),hint:'на балансе остаётся 55% цены оборудования, остальное — залог, найм и потеря стоимости'}
  ];
  var sum=sumArr(parts.map(function(p){ return p.v; })), rest=A.cap-A.cap0-sum;
  if(Math.abs(rest)>A.months*3) parts.push({id:'r',name:'Прочее',v:rest});
  return {start:A.cap0, end:A.cap, parts:parts};
}

/* ---------- показатели ---------- */
function kpiOf(E){
  var rev=Math.max(1,E.rev+E.roy), fixed=E.wages+E.rent+E.ut+E.mkt+E.hq+E.int;
  return {
    food:E.cogs/rev, labor:E.wages/rev, prime:(E.cogs+E.wages)/rev, rent:E.rent/rev, mkt:E.mkt/rev,
    gross:(E.rev+E.roy-E.cogs)/rev, op:(E.rev+E.roy-E.cogs-E.wages-E.rent-E.ut-E.mkt-E.comm-E.hq)/rev, net:E.profit/rev,
    check:E.guests>0?E.rev/E.guests:0, fixed:fixed
  };
}
/* ориентиры для кафе: от и до, зелёная зона */
var BENCH={
  food:{n:'Фуд-кост',lo:0.28,hi:0.33,d:'доля продуктов в выручке'},
  labor:{n:'Зарплаты',lo:0.24,hi:0.34,d:'доля зарплат с взносами'},
  prime:{n:'Прайм-кост',lo:0.52,hi:0.65,d:'продукты плюс зарплаты'},
  rent:{n:'Аренда',lo:0.06,hi:0.14,d:'доля аренды'},
  net:{n:'Чистая рентабельность',lo:0.08,hi:0.20,d:'прибыль на рубль выручки'}
};
function benchState(k,v){ var b=BENCH[k]; if(k==='net') return v>=b.lo?'ok':(v>=0?'mid':'bad'); return v<=b.hi?'ok':(v<=b.hi*1.12?'mid':'bad'); }

/* ---------- безубыточность ---------- */
function bepInfo(s,R){
  var t=R.total, g=Math.max(1,t.guests), rev=t.rev, fixed=t.wages+t.rent+t.util+t.mkt+t.hq+R.interest, varc=t.cogs+t.delComm+t.other;
  var tr=(s.tax==='6'&&!s.flags.emmaAuto)?0.06:0.01, price=rev/g, v=varc/g, cm=price*(1-tr)-v;
  var bep=cm>0?fixed/(cm*30):Infinity, actual=t.guests/30;
  return {fixed:fixed, price:price, v:v, tr:tr, cm:cm, cmr:price>0?cm/price:0, perDay:bep, actual:actual, safety:isFinite(bep)&&actual>0?(actual-bep)/actual:-1, rev:rev, varc:varc};
}

/* ---------- лаборатория цены ---------- */
function round5(x){ return Math.round(x/5)*5; }
function qtyOf(R,ids){ var q=0, rev=0, mar=0; R.outlets.forEach(function(r){ (r.mix||[]).forEach(function(m){ if(!ids||ids.indexOf(m.id)>=0){ q+=m.qty; rev+=m.rev; mar+=m.qty*m.mar; } }); }); return {q:q, rev:rev, mar:mar}; }
function priceLab(s,ids,shifts){
  shifts=shifts||[-0.3,-0.2,-0.1,0,0.1,0.2,0.3]; var out=[];
  shifts.forEach(function(sh){
    var c=cloneState(s);
    c.menu.forEach(function(id){ if(ids&&ids.indexOf(id)<0) return; var d=DISH[id]; if(!d) return; var lo=Math.round(d.cost*c.cidx)+1; c.price[id]=Math.max(lo,round5(priceOf(s,d)*(1+sh))); });
    if(!ids) c.outlets.forEach(function(o){ if(o.lp) o.lp=Math.max(20,round5(o.lp*(1+sh))); });
    var R; try{ R=simMonth(c,{preview:true}); }catch(e){ return; }
    var Q=qtyOf(R,ids);
    out.push({sh:sh, guests:R.total.guests, rev:R.revTotal, profit:R.profit, q:Q.q, drev:Q.rev, dmar:Q.mar});
  });
  return out;
}
function elasticity(rows){
  var lo=rows.filter(function(r){ return Math.abs(r.sh+0.1)<1e-6; })[0], hi=rows.filter(function(r){ return Math.abs(r.sh-0.1)<1e-6; })[0], mid=rows.filter(function(r){ return Math.abs(r.sh)<1e-6; })[0];
  if(!lo||!hi||!mid||mid.q<=0) return null;
  return ((hi.q-lo.q)/mid.q)/0.2;
}

/* ---------- «ещё один человек»: предельный анализ ---------- */
function hireLab(s,oid){
  var base; try{ base=simMonth(cloneState(s),{preview:true}); }catch(e){ return []; } var out=[];
  ['cook','wait','bar','cln'].forEach(function(role){
    var c=cloneState(s), o=outletById(c,oid); if(!o||o.staff[role]>=8) return; o.staff[role]++;
    var R; try{ R=simMonth(c,{preview:true}); }catch(e){ return; }
    var w0=wageOf(s,outletById(s,oid),role), cost=ROLES[role].hire;
    out.push({role:role, dRev:R.revTotal-base.revTotal, dProfit:R.profit-base.profit, dCost:(R.revTotal-R.profit)-(base.revTotal-base.profit), wage:w0, hire:cost, pay:(R.profit-base.profit)>0?cost/(R.profit-base.profit):Infinity});
  });
  return out;
}

/* ---------- бизнес-план новой точки ---------- */
function openPlan(s,cityId,fmt){
  var cost=openCost(s,cityId,fmt), fl=flagship(s), c=cloneState(s), city=CITIES[cityId], F=FORMATS[fmt];
  var o=makeOutlet('plan',cityId,fmt,'план');
  o.padj=Math.round((city.inc/CITIES[fl.city].inc-1)*100/5)*5; o.mgr=1;
  o.awr=clamp(0.10+s.hq.brand/100*0.5+(s.hq.upg.brand?0.04:0),0,1); o.rep=Math.max(o.rep,40+s.hq.brand*0.1+(s.hq.upg.std?4:0)); o.inv=cost.capex;
  c.outlets.push(o); c.flags.expand=1;
  function oneRun(rep,awr,loy){ var cc=cloneState(c), oo=outletById(cc,'plan'); oo.rep=rep; oo.awr=awr; oo.loy=loy; oo.mk.smm=1; var R; try{ R=simMonth(cc,{preview:true}); }catch(e){ return null; }
    var r=R.outlets.filter(function(x){ return x.id==='plan'; })[0]; if(!r) return null;
    var hqx=18000*c.cidx+0.012*r.rev, tax=0.06*r.rev, net=r.profitOp-hqx-tax; return {rev:r.rev, guests:r.guests, op:r.profitOp, net:net, rating:r.rating}; }
  var first=oneRun(o.rep,o.awr,0), steady=oneRun(clamp(fl.rep-4,40,80),clamp(Math.max(o.awr,fl.awr*0.7),0,1),clamp(fl.loy*0.5,0,1));
  var dep=depRate(s)*12, res={cost:cost, first:first, steady:steady, dep:dep, build:-(city.rent*F.rent+F.util*0.3)};
  if(first&&steady){
    /* стройка: месяц без выручки, затем разгон: первый месяц, средний, дальше как «на обороте» */
    var flow=[res.build, first.net, (first.net+steady.net)/2], acc=-cost.total, k=0, pay=Infinity;
    flow.forEach(function(v){ k++; acc+=v; if(acc>=0&&pay===Infinity) pay=k; });
    if(pay===Infinity&&steady.net>0){ pay=3+(-acc)/steady.net; }
    res.pay=pay; res.roi=steady.net*12/cost.total; res.better=res.roi>dep; res.ramp=flow;
  }
  return res;
}

/* ---------- калькуляция блюда ---------- */
function dishCalc(s,o,d,mixItem){
  var cf=cogsFactor(s,o), price=d.loc?(o.lp||Math.round(d.ref*s.pidx*CITIES[o.city].inc/5)*5):priceOf(s,d), waste=mixItem&&mixItem.unit?mixItem.unit/(d.cost*cf)-1:0.06, cost=d.cost*cf*(1+Math.max(0,waste));
  var profit=price-cost;
  return {price:price, base:d.cost*cf, waste:cost-d.cost*cf, cost:cost, profit:profit, markup:cost>0?profit/cost:0, margin:price>0?profit/price:0};
}

/* ---------- оценка и рабочий лист на цифрах ученика ---------- */
function autoScore(s){
  var g=goalNow(s), d=DIFFS[s.diff], qs=s.quizScore||[], qok=sumArr(qs), terms=(s.terms||[]).length, tall=Object.keys(TERMS).length;
  var game=[
    {n:'Капитал к цели', v:clamp(g.cap/d.cap,0,1)*4, max:4},
    {n:'Города', v:clamp(g.cities/d.cities,0,1)*3, max:3},
    {n:'Рейтинг сети', v:clamp((g.rating-3)/(d.rating-3),0,1)*2, max:2},
    {n:'Без банкротства', v:s.bankrupt?0:1, max:1}
  ];
  var know=[
    {n:'Верные ответы в проверках', v:qs.length?qok/qs.length*6:0, max:6},
    {n:'Изучено терминов', v:clamp(terms/(tall*0.7),0,1)*4, max:4}
  ];
  var a=sumArr(game.map(function(x){ return x.v; })), b=sumArr(know.map(function(x){ return x.v; }));
  return {game:game, know:know, a:a, b:b, total:a+b, qok:qok, qn:qs.length, terms:terms, tall:tall};
}
function gradeFor(total40){ return total40>=34?5:(total40>=26?4:(total40>=18?3:2)); }

function workTasks(s){
  var L=s.led||[], out=[]; if(L.length<2) return out;
  var last=L[L.length-1], fl=flagship(s);
  function R1000(x){ return Math.round(x/1000)*1000; }
  /* 1. фуд-кост и прайм-кост */
  var best=L.reduce(function(a,e){ return e.profit>a.profit?e:a; },L[0]), rev=R1000(best.rev+best.roy), cg=R1000(best.cogs), wg=R1000(best.wages);
  if(rev>0){ var fc=cg/rev*100, pr=(cg+wg)/rev*100;
    out.push({id:'fc', kind:'calc', title:'Фуд-кост и прайм-кост', text:'В лучшем месяце ('+MONTHS[best.m-1].toLowerCase()+') выручка была '+rub(rev)+', продукты стоили '+rub(cg)+', зарплаты с взносами '+rub(wg)+'. Найдите фуд-кост и прайм-кост. Сравните с ориентирами (фуд-кост 28–33%, прайм-кост до 65%) и сделайте вывод.', formula:'Фуд-кост = продукты ÷ выручка. Прайм-кост = (продукты + зарплаты) ÷ выручка.', ans:'Фуд-кост '+f1d(fc)+'%, прайм-кост '+f1d(pr)+'%. '+(fc<=33?'Фуд-кост в норме.':'Фуд-кост выше нормы.')+' '+(pr<=65?'Прайм-кост в норме.':'Прайм-кост выше 65%: на остальное остаётся мало.')}); }
  /* 2. безубыточность */
  var gsm=last.guests; if(gsm>0){
    var F=R1000(last.wages+last.rent+last.ut+last.mkt+last.hq+last.int), P=Math.round((last.rev/gsm)/5)*5, V=Math.round(((last.cogs+last.comm)/gsm)/5)*5, tr=(s.tax==='6'&&!s.flags.emmaAuto)?0.06:0.01, cm=P*(1-tr)-V, per=cm>0?F/(cm*30):0, act=gsm/30;
    if(cm>0&&per>0) out.push({id:'bep', kind:'calc', title:'Точка безубыточности', text:'В последнем месяце ('+MONTHS[last.m-1].toLowerCase()+') постоянные расходы сети были '+rub(F)+', приходило около '+Math.round(act)+' гостей в день, средний чек '+rub(P)+', продукты и комиссии на одного гостя '+rub(V)+', '+(tr>0.05?'налог 6% с выручки':'минимальный налог 1% с выручки (режим «доходы минус расходы»)')+'. Найдите: а) сколько остаётся с одного гостя; б) сколько гостей в день нужно для безубыточности; в) запас прочности.', formula:'Вклад гостя = чек × (1 − налог) − затраты на гостя. Безубыточность = постоянные расходы ÷ (вклад × 30). Запас = (гостей сейчас − порог) ÷ гостей сейчас.', ans:'а) '+f1d(cm)+' ₽; б) '+Math.round(per)+' гостей в день; в) '+(act>per?Math.round((act-per)/act*100)+'%':'запаса нет: гостей меньше порога')+'.'});
  }
  /* 3. наценка и маржа */
  var dish=null; s.menu.forEach(function(id){ var d=DISH[id]; if(d && (!dish || priceOf(s,d)>priceOf(s,dish))) dish=d; });
  if(dish){ var p=Math.round(priceOf(s,dish)), c=Math.round(dish.cost*cogsFactor(s,fl)); if(p>c&&c>0) out.push({id:'markup', kind:'calc', title:'Наценка и маржа блюда', text:'Блюдо «'+dish.n+'» продаётся за '+rub(p)+', продукты на порцию стоят '+rub(c)+'. Найдите прибыль с порции, наценку и маржу. Объясните, почему наценка больше маржи.', formula:'Наценка = прибыль ÷ себестоимость. Маржа = прибыль ÷ цена.', ans:'Прибыль '+rub(p-c)+'; наценка '+Math.round((p-c)/c*100)+'%; маржа '+Math.round((p-c)/p*100)+'%. Наценка больше, потому что делится на меньшую величину (себестоимость, а не цену).'}); }
  /* 4. реальный капитал */
  var cap=R1000(capital(s)), cp=Math.round((s.cidx-1)*1000)/10;
  if(cap>0&&cp>0) out.push({id:'real', kind:'calc', title:'Реальный капитал', text:'Капитал вашей сети '+rub(cap)+'. С начала игры продукты подорожали на '+f1d(cp)+'%. Сколько стоил бы такой капитал в ценах начала игры? Что это говорит о росте?', formula:'Реальный капитал = номинальный ÷ (1 + рост цен).', ans:rub(R1000(cap/(1+cp/100)))+'. Рост на бумаге больше, чем реальный: часть роста съела инфляция.'});
  /* 5. окупаемость */
  var cx=R1000(-sumArr(L.map(function(e){ return (e.cf&&e.cf.capex)||0; }))), k3=L.slice(-3), av=R1000(sumArr(k3.map(function(e){ return e.profit; }))/k3.length), dy=Math.round(depRate(s)*12000)/10;
  if(cx>0&&av>0) out.push({id:'payback', kind:'calc', title:'Окупаемость вложений', text:'За игру в оборудование и новые заведения вложено '+rub(cx)+'. Средняя чистая прибыль за последние три месяца '+rub(av)+' в месяц. За сколько месяцев вложения окупятся? Сравните доходность за год с вкладом под '+f1d(dy)+'% годовых.', formula:'Срок окупаемости = вложения ÷ прибыль в месяц. Доходность в год = прибыль в месяц × 12 ÷ вложения.', ans:'Около '+f1d(cx/av)+' мес. Доходность за год '+Math.round(av*12/cx*100)+'%, вклад даёт '+f1d(dy)+'%. '+(av*12/cx*100>dy?'Вложения выгоднее вклада.':'Вклад был бы выгоднее.')});
  /* 6. зарплата и налоги */
  var W=R1000(last.wages); if(W>0){ var pay=payroll(W); out.push({id:'payroll', kind:'calc', title:'Зарплата и налоги на труд', text:'За последний месяц стоимость труда для вашей сети (зарплаты с взносами) была '+rub(W)+'. Взносы работодателя составляют 30% сверх зарплаты до налога, НДФЛ 13% удерживается из неё. Найдите: а) зарплату до налога; б) сколько получили сотрудники на руки; в) сколько всего получило государство.', formula:'До налога = стоимость ÷ 1,30. НДФЛ = 13% от зарплаты до налога. Взносы = стоимость − зарплата до налога.', ans:'а) '+rub(R1000(pay.gross))+'; б) '+rub(R1000(pay.net))+'; в) НДФЛ '+rub(R1000(pay.ndfl))+' + взносы '+rub(R1000(pay.contrib))+' = '+rub(R1000(pay.ndfl+pay.contrib))+'.'}); }
  /* 7. прибыль и деньги */
  var dm=null; L.forEach(function(e){ var d=Math.abs(e.profit-(e.c1-e.c0)); if(!dm||d>dm.d) dm={d:d,e:e}; });
  if(dm && dm.d>20000){ var e=dm.e, cf=e.cf||{}, items=[['capex','покупка оборудования и открытие точек'],['loan','получен кредит'],['repay','погашен кредит'],['depo','движение по вкладу'],['equity','вложения инвестора'],['dev','найм, обучение, рецепты'],['other','случаи, призы, награды']].filter(function(x){ return Math.abs(cf[x[0]]||0)>5000; }).sort(function(a,b){ return Math.abs(cf[b[0]])-Math.abs(cf[a[0]]); });
    out.push({id:'cash', kind:'text', title:'Прибыль и деньги', text:'В месяце «'+MONTHS[e.m-1].toLowerCase()+'» чистая прибыль была '+sgn(e.profit)+', а деньги в кассе изменились на '+sgn(e.c1-e.c0)+'. Найдите причину в отчёте о движении денег и объясните её своими словами.', ans:'Расхождение '+rub(dm.d)+' создали: '+(items.length?items.slice(0,3).map(function(x){ return x[1]+' ('+sgn(cf[x[0]])+')'; }).join('; '):'мелкие операции')+'. Прибыль и деньги — разные величины: вложения, кредиты и вклады меняют кассу, но не прибыль.'}); }
  /* 8. ставка и инфляция */
  var ks=L.map(function(e){ return e.key; }), kmin=Math.min.apply(null,ks), kmax=Math.max.apply(null,ks);
  out.push({id:'macro', kind:'text', title:'Ключевая ставка и инфляция', text:'За игру ключевая ставка менялась от '+f1d(kmin)+'% до '+f1d(kmax)+'%, продукты подорожали на '+f1d((s.cidx-1)*100)+'%, а зарплаты на '+f1d((s.widx-1)*100)+'%. Как это повлияло на ваши цены, кредиты и прибыль? Что вы делали в ответ?', ans:'Ждём: рост цен на продукты уменьшает маржу, если не обновлять цены; при высокой ставке кредит дороже, а вклад выгоднее; Центробанк повышает ставку, когда инфляция ускоряется. Оцениваются примеры из собственной партии.'});
  /* 9. решения */
  out.push({id:'strat', kind:'text', title:'Решения и выводы', text:'Назовите решение, которое принесло больше всего пользы, и решение, которое вы сочли ошибкой. Что вы сделали бы иначе, начав игру заново? Опирайтесь на цифры отчётов.', ans:'Оценивается опора на цифры (прибыль, маржа, безубыточность) и честный разбор ошибок.'});
  return out;
}
