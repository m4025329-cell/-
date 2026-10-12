/* ===== Интерфейс, часть 6: отчёт проекта, рабочий лист, проверка работы ученика ===== */

/* ---------- сохранение работы файлом и чтение чужого кода ---------- */
function decodeCode(code){
  try{ var d=JSON.parse(decodeURIComponent(escape(atob(String(code).replace(/\s+/g,''))))); if(d&&d.S&&typeof d.S.month==='number'&&d.S.outlets){ ensureState(d.S); return d.S; } }catch(e){}
  return null;
}
function fileSafe(t){ return String(t||'igra').replace(/[^A-Za-zА-Яа-яЁё0-9_-]+/g,'-').slice(0,24)||'igra'; }
function downloadText(name,text){
  try{
    var blob=new Blob([text],{type:'text/plain;charset=utf-8'}), url=URL.createObjectURL(blob), a=document.createElement('a');
    a.href=url; a.download=name; a.style.display='none'; document.body.appendChild(a); a.click();
    setTimeout(function(){ document.body.removeChild(a); URL.revokeObjectURL(url); },1500); return true;
  }catch(e){ return false; }
}
A.savefile=function(){
  var code=exportCode(); if(!code){ toast('Не получилось подготовить файл',true); return; }
  if(window.AndroidBridge&&AndroidBridge.share){ try{ AndroidBridge.share('Первый столик: работа '+((S&&S.name)||''),code); return; }catch(e){} }
  if(downloadText('pervyi-stolik-'+fileSafe(S&&S.name)+'-m'+Math.min(S.month,TOTAL)+'.txt',code)) toast('Файл работы сохранён');
  else toast('Скачивание недоступно: скопируйте код',true);
};
A.pickfile=function(){ var f=$('#tc-file'); if(f) f.click(); };
function readFileInto(input,done){
  var f=input.files&&input.files[0]; if(!f) return; var r=new FileReader();
  r.onload=function(){ done(String(r.result||'')); }; r.onerror=function(){ toast('Не удалось прочитать файл',true); }; r.readAsText(f);
}

/* ---------- печатный лист ---------- */
function sheetMonthsTable(s){
  var L=s.led, H={}; (s.hist||[]).forEach(function(h){ H[h.m]=h; });
  return '<div class="sh-ov"><table class="sh-tbl"><thead><tr><th>Месяц</th><th>Выручка</th><th>Прибыль</th><th class="hs">В кассе</th><th>Капитал</th><th>Рейтинг</th><th class="hs">Точек</th></tr></thead><tbody>'+L.map(function(e){ var h=H[e.m]||{}; return '<tr><td>'+MONTHS_SHORT[e.m-1]+'</td><td>'+rubk(e.rev+e.roy)+'</td><td>'+sgn(Math.round(e.profit/1000)*1000).replace(/ ₽$/,'')+'</td><td class="hs">'+rubk(e.c1)+'</td><td>'+rubk(e.cap)+'</td><td>'+(h.rating?f1d(h.rating):'—')+'</td><td class="hs">'+(h.outlets||e.n)+'</td></tr>'; }).join('')+'</tbody></table></div>';
}
function sheetStmt(rows,withPc){
  return '<table class="sh-st"><tbody>'+rows.filter(function(r){ return r.k==='head'||r.k==='sub'||r.k==='total'||Math.abs(r.v)>=0.5; }).map(function(r){
    if(r.k==='head') return '<tr class="h"><td colspan="3">'+esc(r.name)+'</td></tr>';
    var sign=r.k==='minus'?'−':'', val=sign+rub(Math.abs(r.v)).replace('−',''); if(r.k!=='minus'&&r.v<0) val=rub(r.v);
    return '<tr class="'+(r.k==='sub'?'s':(r.k==='total'?'t':''))+'"><td>'+esc(r.name)+'</td><td class="n">'+val+'</td><td class="p">'+(withPc&&r.pc!=null?Math.round(Math.abs(r.pc)*100)+'%':'')+'</td></tr>';
  }).join('')+'</tbody></table>';
}
function sheetHTML(s,key){
  var L=s.led||[], g=goalNow(s), v=verdict(s), f=forkScore(s), A=L.length?ledRange(s,1,L[L.length-1].m):null, sc=autoScore(s), tasks=workTasks(s), now=new Date();
  var date=now.getDate()+' '+['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'][now.getMonth()]+' '+now.getFullYear();
  var h='<article class="pg">';
  h+='<header class="sh-head"><div><div class="sh-kick">Школьный проект · экономика</div><h1>«'+esc(s.cafe)+'»: от кафе до сети</h1><div class="sh-sub">Отчёт по экономической игре «Первый столик»</div></div><div class="sh-who"><div>Ученик: <b>'+esc(s.name)+'</b></div><div>Класс: <span class="sh-blank"></span></div><div>Дата: '+date+'</div></div></header>';
  if(!L.length){ return h+'<p>Сыграйте хотя бы один месяц, чтобы в отчёте появились цифры.</p></article>'; }
  h+='<section><h2>1. Результат партии</h2><div class="sh-kpi"><div><small>Итог</small><b>'+esc(v.name)+'</b></div><div><small>Цель</small><b>'+(goalMet(s)?'достигнута':'не достигнута')+'</b></div><div><small>Капитал</small><b>'+rubk(g.cap)+'</b><i>цель '+rubk(g.needCap)+'</i></div><div><small>Реальный капитал</small><b>'+rubk(realCapital(s))+'</b><i>в ценах начала игры</i></div><div><small>Города</small><b>'+g.cities+' из '+g.needCities+'</b></div><div><small>Рейтинг сети</small><b>'+f1d(g.rating)+'</b><i>нужно '+f1d(g.needRating)+'</i></div><div><small>Гид</small><b>'+esc(FORK_NAMES[f.tier])+'</b></div><div><small>Месяцев сыграно</small><b>'+L.length+' из '+TOTAL+'</b></div></div>';
  h+='<p class="sh-note">Сложность «'+esc(DIFFS[s.diff].name)+'»'+(s.code?', код класса '+esc(s.code):'')+'. Вопросов проверки решено верно: '+sc.qok+' из '+sc.qn+'. Терминов изучено: '+sc.terms+' из '+sc.tall+'.</p>';
  h+='<h3>Деньги по месяцам</h3>'+sheetMonthsTable(s);
  var cp=L.map(function(e){ return e.cap; }); if(cp.length>1) h+='<div class="sh-chart"><div class="sh-cap">Капитал по месяцам</div>'+sparkSVG(cp,L.map(function(e,i){ return i%2===0?MONTHS_SHORT[e.m-1]:''; }))+'</div>';
  h+='</section></article><article class="pg"><section><h2>2. Финансовая отчётность за игру</h2>';
  var pl=plStatement(A), cfs=cfStatement(A);
  h+='<h3>Отчёт о прибылях и убытках <small>за '+L.length+' '+plural(L.length,'месяц','месяца','месяцев')+', справа доля выручки</small></h3>'+sheetStmt(pl.rows,true);
  h+='<h3>Движение денег</h3>'+sheetStmt(cfs.rows.map(function(r){ return {name:r.name,v:r.v,k:r.k==='flow'?'':r.k}; }).concat([{name:'Деньги на начало игры',v:A.c0,k:'sub'},{name:'Деньги на конец',v:A.c1,k:'total'}]),false);
  var b=balanceNow(s);
  h+='<h3>Баланс на конец игры</h3><table class="sh-st"><tbody><tr class="h"><td colspan="3">Актив</td></tr><tr><td>Деньги в кассе</td><td class="n">'+rub(b.cash)+'</td><td></td></tr><tr><td>Вклад</td><td class="n">'+rub(b.dep)+'</td><td></td></tr><tr><td>Оборудование и ремонт (55% цены)</td><td class="n">'+rub(b.eq)+'</td><td></td></tr><tr class="s"><td>Итого актив</td><td class="n">'+rub(b.assets)+'</td><td></td></tr><tr class="h"><td colspan="3">Пассив</td></tr><tr><td>Кредит и экстренный долг</td><td class="n">'+rub(b.liab)+'</td><td></td></tr><tr><td>Капитал владельца</td><td class="n">'+rub(b.equity)+'</td><td></td></tr><tr class="t"><td>Итого пассив</td><td class="n">'+rub(b.liab+b.equity)+'</td><td></td></tr></tbody></table>';
  h+='</section></article><article class="pg"><section><h2>3. Показатели, решения и термины</h2>';
  var k=kpiOf(A);
  h+='<h3>Показатели за игру и ориентиры для кафе</h3><div class="sh-ov"><table class="sh-tbl"><thead><tr><th>Показатель</th><th>У вас</th><th>Ориентир</th><th>Вывод</th></tr></thead><tbody>'+['food','labor','prime','rent','net'].map(function(key){ var st=benchState(key,k[key]), bn=BENCH[key]; return '<tr><td>'+bn.n+'</td><td>'+pc1(k[key])+'</td><td>'+Math.round(bn.lo*100)+'–'+Math.round(bn.hi*100)+'%</td><td>'+({ok:'в норме',mid:'на границе',bad:(key==='net'?'ниже нормы':'выше нормы')})[st]+'</td></tr>'; }).join('')+'</tbody></table></div>';
  var taxes=A.tax+payroll(A.wages).ndfl+payroll(A.wages).contrib;
  h+='<p class="sh-note">Налоги и взносы за игру: налог на бизнес '+rubk(A.tax)+', налоги на труд '+rubk(payroll(A.wages).ndfl+payroll(A.wages).contrib)+', всего '+rubk(taxes)+' ('+pct(taxes/Math.max(1,A.rev+A.roy))+' выручки). Ключевая ставка за игру: от '+f1d(Math.min.apply(null,L.map(function(e){ return e.key; })))+'% до '+f1d(Math.max.apply(null,L.map(function(e){ return e.key; })))+'%.</p>';
  var chron=(s.log||[]).filter(function(x){ return x.k!=='news'; }).slice(-14);
  if(chron.length) h+='<h3>Ключевые события и решения</h3><ul class="sh-list">'+chron.map(function(x){ return '<li><b>'+MONTHS_SHORT[Math.min(15,x.m-1)]+'.</b> '+esc(x.t)+'</li>'; }).join('')+'</ul>';
  var tt=(s.terms||[]).filter(function(x){ return TERMS[x]; }).map(function(x){ return TERMS[x][0]; });
  h+='<h3>Изученные понятия ('+tt.length+')</h3><p class="sh-terms">'+(tt.length?tt.map(esc).join(' · '):'—')+'</p>';
  h+='</section></article>';
  /* рабочий лист */
  h+='<article class="pg"><section><h2>4. Рабочий лист</h2><p class="sh-note">Все числа взяты из вашей партии. Решайте на листе, записывайте формулу и ответ. Для расчёта используйте отчёты из разделов выше.</p>';
  tasks.forEach(function(t,i){ h+='<div class="sh-task"><div class="sh-tt"><span class="sh-num">'+(i+1)+'</span><b>'+esc(t.title)+'</b>'+(t.kind==='calc'?'<span class="sh-pts">2 балла</span>':'<span class="sh-pts">2 балла</span>')+'</div><p>'+esc(t.text)+'</p>'+(t.formula?'<p class="sh-f">Подсказка: '+esc(t.formula)+'</p>':'')+'<div class="sh-lines '+(t.kind==='text'?'l5':'l3')+'"></div></div>'; });
  h+='</section></article>';
  /* оценка */
  h+='<article class="pg"><section><h2>5. Оценивание</h2><p class="sh-note">Автоматическая часть считается игрой по итогам партии. Остальное оценивает учитель. Итоговую оценку выставляет учитель: расчёт ниже только рекомендация.</p>';
  h+='<table class="sh-tbl"><thead><tr><th>Критерий</th><th>Баллы</th><th>Максимум</th></tr></thead><tbody>'+sc.game.concat(sc.know).map(function(x){ return '<tr><td>'+x.n+'</td><td>'+f1d(x.v)+'</td><td>'+x.max+'</td></tr>'; }).join('')+'<tr class="sh-sum"><td>Автоматическая часть</td><td>'+f1d(sc.total)+'</td><td>20</td></tr><tr><td>Рабочий лист: расчётные задания 1–'+tasks.filter(function(t){ return t.kind==='calc'; }).length+'</td><td><span class="sh-blank s"></span></td><td>12</td></tr><tr><td>Рабочий лист: письменные ответы</td><td><span class="sh-blank s"></span></td><td>6</td></tr><tr><td>Оформление и самостоятельность</td><td><span class="sh-blank s"></span></td><td>2</td></tr><tr class="sh-sum"><td>Итого</td><td><span class="sh-blank s"></span></td><td>40</td></tr></tbody></table>';
  h+='<p class="sh-note">Рекомендуемая шкала: 34–40 баллов — «5», 26–33 — «4», 18–25 — «3», меньше 18 — «2».</p><div class="sh-sign">Оценка: <span class="sh-blank s"></span> &nbsp; Подпись учителя: <span class="sh-blank"></span></div></section></article>';
  if(key){
    h+='<article class="pg key"><section><h2>Ключ для учителя</h2><p class="sh-note">Ответы посчитаны по цифрам этой партии. Значения округлены так же, как в условиях заданий. Письменные задания оцениваются по критериям.</p>';
    tasks.forEach(function(t,i){ h+='<div class="sh-task"><div class="sh-tt"><span class="sh-num">'+(i+1)+'</span><b>'+esc(t.title)+'</b></div><p class="sh-ans"><b>Ответ:</b> '+esc(t.ans)+'</p></div>'; });
    h+='<div class="sh-rub"><b>Критерии оценивания заданий</b><ul><li>2 балла: верные формула и ответ, есть вывод.</li><li>1 балл: идея верна, ошибка в вычислении или нет вывода.</li><li>0 баллов: задание не выполнено или формула неверна.</li><li>Письменные задания: 2 балла за опору на цифры из отчётов и разбор причин, 1 балл за общие слова, 0 за отсутствие ответа.</li></ul></div></section></article>';
  }
  return h;
}
function openSheet(s,key){
  var el=$('#sheet'); if(!el) return;
  U.sheetOpen=true; lastFocus=document.activeElement;
  el.innerHTML='<div class="sh-bar"><button class="btn small" data-act="sheetprint">'+ico('save','sm')+' Печать или PDF</button><button class="btn small secondary" data-act="sheetclose">'+ico('x','sm')+' Закрыть</button></div><div class="sh-hint">Нажмите «Печать или PDF» и выберите «Сохранить как PDF», чтобы получить файл для учителя.</div><div class="sh-pages">'+sheetHTML(s,key)+'</div>';
  el.hidden=false; document.body.classList.add('sheeting'); window.scrollTo(0,0);
}
A.sheet=function(){ closeModal(); if(!S||!S.led||S.led.length<2){ toast('Сыграйте хотя бы два месяца: тогда в отчёте будут цифры',true); return; } openSheet(S,false); };
A.sheetclose=function(){ var el=$('#sheet'); if(el){ el.hidden=true; el.innerHTML=''; } document.body.classList.remove('sheeting'); U.sheetOpen=false; };
A.sheetprint=function(){ if(window.AndroidBridge&&AndroidBridge.print){ try{ AndroidBridge.print(); return; }catch(e){} } try{ window.print(); }catch(e){ toast('Печать недоступна: сделайте скриншоты страниц',true); } };

/* ---------- проверка работы ученика (для учителя) ---------- */
function reviewCard(){
  return '<section class="card"><h3>'+ico('eye')+'Проверить работу ученика</h3><p class="sub">Вставьте код сохранения или выберите файл, который прислал ученик. Откроется его отчёт с ключом ответов.</p><textarea class="code" id="tc-code" aria-label="Код сохранения ученика" placeholder="Код сохранения ученика"></textarea><input type="file" id="tc-file" accept=".txt,text/plain" hidden><div class="row" style="margin-top:8px"><button class="btn small" data-act="tcopen">'+ico('eye','sm')+' Открыть работу</button><button class="btn small secondary" data-act="pickfile">'+ico('save','sm')+' Выбрать файл</button></div></section>';
}
A.tcopen=function(){
  var v=($('#tc-code')||{}).value||''; var s=decodeCode(v);
  if(!s){ toast('Не получилось прочитать код. Проверьте, что он скопирован целиком.',true); return; }
  if(!s.led||s.led.length<2){ toast('В этой партии меньше двух месяцев: проверять пока нечего',true); return; }
  U.teacherText=($('#tc-in')||{}).value||U.teacherText||''; openSheet(s,true);
};

/* ---------- экономика партии на итоговом экране ---------- */
function finalEconCards(){
  var L=S.led||[]; if(L.length<2) return '';
  var A=ledRange(S,1,L[L.length-1].m), pl=plStatement(A), k=kpiOf(A), g=goalNow(S), real=realCapital(S), tx=A.tax+payroll(A.wages).ndfl+payroll(A.wages).contrib, sc=autoScore(S);
  var h=card('Экономика партии в цифрах','<div class="kpi">'+metric('Выручка за игру',rubk(A.rev+A.roy),'за '+L.length+' '+plural(L.length,'месяц','месяца','месяцев'))+metric('Чистая прибыль',sgn(Math.round(A.profit/1000)*1000).replace(/ ₽$/,'')+' ₽',pc1(pl.net/pl.base)+' от выручки',A.profit>=0?'ok':'bad')+metric('Капитал в рублях',rubk(g.cap),'номинальный')+metric('В ценах начала',rubk(real),'реальный',real>=DIFFS[S.diff].start?'ok':'bad')+'</div><div class="stmt">'+pl.rows.filter(function(r){ return ['rev','cogs','gross','wages','rent','op','tax','net'].indexOf(r.id)>=0&&Math.abs(r.v)>=0.5; }).map(function(r){ return stRow(r,true); }).join('')+'</div><div class="chips"><span class="chip info">Фуд-кост '+pc1(k.food)+'</span><span class="chip info">Прайм-кост '+pc1(k.prime)+'</span><span class="chip info">Налоги и взносы '+rubk(tx)+'</span></div><div class="row" style="margin-top:8px"><button class="btn small secondary" data-act="sheet">'+ico('book','sm')+' Все отчёты</button></div>',{ic:'coins'});
  h+=card('Предварительная оценка работы','<p class="sub">Автоматическая часть считается по итогам партии. Остальное оценит учитель по рабочему листу.</p><div class="kpi">'+metric('Игра',f1d(sc.a)+' из 10','капитал, города, рейтинг')+metric('Знания',f1d(sc.b)+' из 10','проверки и термины')+'</div><p class="small muted" style="margin:0">Верных ответов в проверках: '+sc.qok+' из '+sc.qn+'. Изучено терминов: '+sc.terms+' из '+sc.tall+'.</p>',{ic:'award'});
  return h;
}
