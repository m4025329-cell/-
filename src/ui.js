/* ===== Интерфейс «Мерч-Империи» ===== */
(function(){
'use strict';
var KEY='merch-empire-v1', THEME_KEY='merch-empire-theme';
var S=null, U={screen:'title'}, soundOn=false, actx=null;

var IC={
 shirt:'<path d="M9 3 3.5 6 5 10l3-1v12h8V9l3 1 1.5-4L15 3c-.5 1.3-1.7 2-3 2s-2.5-.7-3-2Z"/>',
 swords:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
 tag:'<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.2"/>',
 truck:'<path d="M2 6h12v10H2zM14 9h4l4 3.5V16h-8"/><circle cx="6.5" cy="18" r="1.8"/><circle cx="17.5" cy="18" r="1.8"/>',
 store:'<path d="M4 9l1-5h14l1 5M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0A2.7 2.7 0 0 0 20 9M5 11.5V20h14v-8.5M10 20v-5h4v5"/>',
 percent:'<path d="M19 5 5 19"/><circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
 megaphone:'<path d="M3 10v4h3l8 4V6L6 10H3ZM17 9a4 4 0 0 1 0 6M7 14l1.5 6h3L10 15.5"/>',
 bank:'<path d="M3 10 12 4l9 6H3ZM5.5 10v8M10 10v8M14 10v8M18.5 10v8M3 20.5h18"/>',
 trend:'<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
 safe:'<rect x="3.5" y="4" width="17" height="15" rx="2"/><circle cx="12" cy="11.5" r="3.5"/><path d="M12 8.5v1.5M7 19v2M17 19v2"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3.5 3.2 3.5 14.8 0 18M12 3c-3.5 3.2-3.5 14.8 0 18"/>',
 chart:'<path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6"/>',
 castle:'<path d="M5 21V7h3v3h2V7h4v3h2V7h3v14M10 21v-5h4v5"/>',
 storm:'<path d="M7 15.5a4 4 0 0 1 .4-8A5.2 5.2 0 0 1 17.500 9a3.300 3.300 0 0 1-.5 6.500ZM12.500 13l-2.500 4h3l-1.500 4"/>',
 doc:'<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7"/>',
 coin:'<circle cx="12" cy="12" r="9"/><path d="M10 17V7h3.500a2.800 2.800 0 0 1 0 5.600H8.500M8.500 15h5"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.900 4.900l1.400 1.400M17.700 17.700l1.400 1.400M4.900 19.100l1.400-1.400M17.700 6.300l1.400-1.400"/>',
 moon:'<path d="M20 14.500A8 8 0 0 1 9.500 4 8 8 0 1 0 20 14.500Z"/>',
 vol:'<path d="M4 9v6h4l5 4V5L8 9H4ZM16.500 8.500a5 5 0 0 1 0 7M19 6a8.500 8.500 0 0 1 0 12"/>',
 mute:'<path d="M4 9v6h4l5 4V5L8 9H4ZM17 9.500l5 5M22 9.500l-5 5"/>',
 book:'<path d="M4 5.500A2.500 2.500 0 0 1 6.500 3H20v16H6.500A2.500 2.500 0 0 0 4 21.500ZM4 5.500v16M8 7h8"/>',
 save:'<path d="M5 3h11l3 3v15H5zM8 3v5h7V3M8 21v-7h8v7"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.500v.01"/>',
 warn:'<path d="M12 3 2 20h20L12 3ZM12 10v5M12 17.500v.01"/>',
 check:'<path d="M4 12.500 9.500 18 20 6.500"/>',
 lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
 star:'<path d="m12 3 2.700 5.600 6.100.8-4.500 4.300 1.100 6.100L12 16.800 6.600 19.800l1.100-6.100L3.200 9.400l6.100-.8L12 3Z"/>',
 shield:'<path d="M12 3 4 6v6c0 4.500 3.200 7.800 8 9 4.800-1.200 8-4.500 8-9V6l-8-3Z"/><path d="m8.500 12 2.500 2.500 4.500-5"/>',
 dice:'<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="15" r="1"/><circle cx="15" cy="9" r="1"/><circle cx="9" cy="15" r="1"/>',
 grad:'<path d="m2 9 10-5 10 5-10 5L2 9Z"/><path d="M6 11.500V16c0 1.500 2.700 3 6 3s6-1.500 6-3v-4.500M22 9v6"/>',
 link:'<path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1"/>'
};
function ico(n,c){ return '<svg class="ico '+(c||'')+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(IC[n]||'')+'</svg>'; }
function esc(t){ return String(t).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
function $(s,r){ return (r||document).querySelector(s); }
function num(n){ return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,' '); }
function f1(x){ return (Math.round(x*100)/100).toString().replace('.',','); }

/* ---------- сохранение ---------- */
function snapshot(){ return {S:S, U:{screen:U.screen,phase:U.phase,res:U.res,report:U.report,quiz:U.quiz,tab:U.tab,chapterInfo:U.chapterInfo,final:U.final}}; }
function persist(){ try{ localStorage.setItem(KEY, JSON.stringify(snapshot())); }catch(e){} }
function readSave(){ try{ var t=localStorage.getItem(KEY); return t?JSON.parse(t):null; }catch(e){ return null; } }
function applySave(d){ S=d.S; U=d.U||{}; if(!U.screen||U.screen==='title') U.screen='event'; }
function exportCode(){ try{ return btoa(unescape(encodeURIComponent(JSON.stringify(snapshot())))); }catch(e){ return ''; } }
function importCode(code){ try{ var d=JSON.parse(decodeURIComponent(escape(atob(code.trim())))); if(d&&d.S&&typeof d.S.month==='number'){ applySave(d); return true; } }catch(e){} return false; }

/* ---------- звук и эффекты ---------- */
function tone(freq,dur,delay,type,vol){
  if(!soundOn) return;
  try{
    actx=actx||new (window.AudioContext||window.webkitAudioContext)();
    var t=actx.currentTime+(delay||0), o=actx.createOscillator(), g=actx.createGain();
    o.type=type||'square'; o.frequency.value=freq; g.gain.setValueAtTime(vol||0.05,t); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t+dur+0.02);
  }catch(e){}
}
function sfx(k){
  if(k==='click') tone(520,0.06,0,'square',0.03);
  else if(k==='coin'){ tone(988,0.08,0,'square',0.05); tone(1319,0.18,0.08,'square',0.05); }
  else if(k==='good'){ tone(523,0.1,0,'triangle',0.08); tone(659,0.1,0.1,'triangle',0.08); tone(784,0.2,0.2,'triangle',0.08); }
  else if(k==='bad'){ tone(220,0.18,0,'sawtooth',0.05); tone(165,0.28,0.15,'sawtooth',0.05); }
  else if(k==='win'){ [523,659,784,1047].forEach(function(f,i){ tone(f,0.2,i*0.12,'triangle',0.09); }); }
}
var fxc=null, parts=[], raf=0;
function burst(n,cx,cy){
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  fxc=fxc||$('#fx'); if(!fxc) return;
  var w=fxc.width=innerWidth, h=fxc.height=innerHeight, cols=['#FFC83D','#19B37A','#3B5BFF','#FF5C7A','#FFFFFF'];
  for(var i=0;i<n;i++){ var a=Math.random()*Math.PI*2, v=4+Math.random()*9;
    parts.push({x:cx==null?w/2:cx,y:cy==null?h*0.35:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v-5,r:3+Math.random()*4,c:cols[i%cols.length],life:70+Math.random()*40,rot:Math.random()*6}); }
  if(!raf) raf=requestAnimationFrame(tick);
}
function tick(){
  var ctx=fxc.getContext('2d'); ctx.clearRect(0,0,fxc.width,fxc.height);
  parts=parts.filter(function(p){ return p.life>0; });
  parts.forEach(function(p){ p.x+=p.vx; p.y+=p.vy; p.vy+=0.28; p.vx*=0.985; p.life--; p.rot+=0.2;
    ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle=p.c; ctx.globalAlpha=Math.min(1,p.life/30); ctx.fillRect(-p.r,-p.r/2,p.r*2,p.r); ctx.restore(); });
  if(parts.length) raf=requestAnimationFrame(tick); else { raf=0; ctx.clearRect(0,0,fxc.width,fxc.height); }
}
var toastT=0;
function toast(msg){ var t=$('#toast'); t.innerHTML='<div class="toast" role="status">'+esc(msg)+'</div>'; clearTimeout(toastT); toastT=setTimeout(function(){ t.innerHTML=''; },2600); }

/* ---------- словарик ---------- */
function addTerm(k){ if(k && S.terms.indexOf(k)<0) S.terms.push(k); }

/* ---------- шапка ---------- */
function hudHTML(){
  if(!S) return '';
  var after=['report','quiz','chapter','lessonend','final'].indexOf(U.screen)>=0;
  var m=clamp(after?S.month-1:S.month,1,TOTAL), ch=CHAPTERS[chapterOf(m)], nw=netWorth(S), pctG=clamp(nw/GOAL,0,1);
  var pips=''; for(var i=1;i<=TOTAL;i++){ var cls=(after?i<=m:i<m)?'done':(i===m&&!after?'now':''); if(i===9) cls+=' gap'; pips+='<i class="pip '+cls+'" title="Месяц '+i+'"></i>'; }
  var debt = S.loanLeft>0 ? '<div class="stat neg"><b>Долг</b><span class="num">'+rub(S.loanLeft)+'</span></div>' : '<div class="stat"><b>Вклады и акции</b><span class="num">'+rub(S.savings+S.fund+S.stock)+'</span></div>';
  var ph = U.screen==='final'?'Итоги':(MONTH_NAMES[m-1]+' · месяц '+m+' из '+TOTAL);
  return '<div class="hud-card">'+
   '<div class="hud-top"><div><div class="hud-month">'+ph+'</div><div class="hud-sub">Урок '+ch.lesson+' · глава «'+ch.name+'» · '+esc(S.name)+'</div></div><div class="pips" aria-label="Прогресс по месяцам">'+pips+'</div></div>'+
   '<div class="stats"><div class="stat"><b>На счету</b><span class="num">'+rub(S.cash)+'</span></div>'+
   '<div class="stat"><b>Склад</b><span class="num">'+S.inv+' шт.</span></div>'+debt+
   '<div class="stat"><b>Капитал</b><span class="num">'+rub(nw)+'</span></div></div>'+
   '<div><div class="goalbar" role="progressbar" aria-valuemin="0" aria-valuemax="'+GOAL+'" aria-valuenow="'+Math.max(0,nw)+'"><i style="width:'+(pctG*100)+'%"></i></div>'+
   '<div class="goalrow"><span>Цель: капитал '+rub(GOAL)+'</span><span class="num">'+Math.round(pctG*100)+'%</span></div></div></div>';
}

/* ---------- заставка ---------- */
function titleHTML(){
  var sv=readSave(), cont=sv&&sv.S&&sv.U&&sv.U.screen!=='title';
  var art='<svg viewBox="0 0 360 330" role="img" aria-label="Футболка с монетой">'+
   '<g class="bob d2"><circle cx="58" cy="70" r="26" fill="var(--coin)" stroke="var(--line)" stroke-width="4"/><text x="58" y="80" text-anchor="middle" font-family="Unbounded,sans-serif" font-weight="800" font-size="26" fill="#10202E">₽</text></g>'+
   '<g class="bob d3"><circle cx="312" cy="250" r="22" fill="var(--coin)" stroke="var(--line)" stroke-width="4"/><text x="312" y="259" text-anchor="middle" font-family="Unbounded,sans-serif" font-weight="800" font-size="22" fill="#10202E">₽</text></g>'+
   '<g class="bob"><path d="M128 40 56 78l22 62 34-12v176h136V128l34 12 22-62-72-38c-8 22-26 34-52 34s-44-12-52-34Z" transform="translate(7,8)" fill="var(--shadow)"/>'+
   '<path d="M128 40 56 78l22 62 34-12v176h136V128l34 12 22-62-72-38c-8 22-26 34-52 34s-44-12-52-34Z" fill="var(--coin)" stroke="var(--line)" stroke-width="5" stroke-linejoin="round"/>'+
   '<circle cx="180" cy="190" r="48" fill="var(--surface)" stroke="var(--line)" stroke-width="5"/><text x="180" y="208" text-anchor="middle" font-family="Unbounded,sans-serif" font-weight="800" font-size="52" fill="#10202E">₽</text></g></svg>';
  return '<div class="hero"><div><div class="eyebrow">Экономическая игра для класса</div>'+
   '<h1>Мерч-<em>Империя</em></h1>'+
   '<p class="lead">Ты запускаешь школьный бизнес по печати футболок. За 16 игровых месяцев нужно вырастить его от гаража до капитала в 1 000 000 ₽. Цена, спрос, налоги, кредиты, инфляция и риск. Каждое решение считается.</p>'+
   '<div class="field"><label for="pname">Как тебя зовут?</label><input id="pname" type="text" maxlength="24" autocomplete="off" placeholder="Например, Алексей" value="'+(S&&S.name&&S.name!=='Предприниматель'?esc(S.name):'')+'"></div>'+
   '<div class="row" style="margin-top:16px"><button class="btn primary" data-act="start" id="startbtn">'+(U.confirmNew?'Стереть и начать заново':'Начать игру')+'</button>'+
   (cont?'<button class="btn" data-act="continue">Продолжить: месяц '+Math.min(sv.S.month,TOTAL)+'</button>':'')+
   '<button class="btn small" data-act="loadcode">Загрузить код сохранения</button></div>'+
   (cont&&!U.confirmNew?'<p class="ctl-note">На этом устройстве есть сохранённая игра.</p>':'')+
   (U.confirmNew?'<p class="ctl-note loss-t">Прошлый прогресс будет удалён. Нажми ещё раз, чтобы подтвердить.</p>':'')+
   '</div><div class="hero-art">'+art+'</div></div>'+
   '<div class="howto"><div class="card"><div class="step-n">1</div><h3>Реши</h3><p class="ctl-note">В начале месяца случается событие. Выбери один из вариантов и узнай, чему он учит.</p></div>'+
   '<div class="card"><div class="step-n">2</div><h3>Спланируй</h3><p class="ctl-note">Назначь цену, реши, сколько напечатать, и вложись в развитие.</p></div>'+
   '<div class="card"><div class="step-n">3</div><h3>Проверь</h3><p class="ctl-note">Смотри итоги месяца, отвечай на вопросы после каждой главы и зарабатывай гранты.</p></div></div>'+
   '<div class="lessons"><div class="card flat"><div class="eyebrow">Урок 1 · месяцы 1–8</div><ul><li>Глава 1 «Гараж»: цена, спрос, прибыль</li><li>Глава 2 «Первый магазин»: расходы, налоги, найм, риск</li></ul></div>'+
   '<div class="card flat"><div class="eyebrow">Урок 2 · месяцы 9–16</div><ul><li>Глава 3 «Рост»: кредит, инфляция, вклад, валюта</li><li>Глава 4 «Империя»: инвестиции, конкуренция, кризис</li></ul></div></div>'+
   '<p class="ctl-note">Игра сама сохраняется после каждого шага. Для второго урока достаточно открыть её снова и нажать «Продолжить».</p>';
}

/* ---------- событие ---------- */
function eventHTML(){
  var ev=EVENTS[S.month-1], ch=CHAPTERS[chapterOf(S.month)], res=U.res, h='';
  h+='<div class="card"><div class="event"><div class="badge-ico">'+ico(ev.icon)+'</div><div><div class="chips"><span class="chip coin">'+ev.tag+'</span><span class="chip">'+MONTH_NAMES[S.month-1]+', месяц '+S.month+'</span></div>'+
     '<h2>'+ev.title+'</h2><p class="text">'+ev.text(S)+'</p></div></div></div>';
  h+='<div class="choices" role="group" aria-label="Варианты решения">';
  ev.choices.forEach(function(c,i){
    var cls=res?(res.i===i?'picked':'dim'):'', poor=!res&&c.cost&&c.cost>S.cash;
    h+='<button class="choice '+(poor?'dim':cls)+'" data-act="choose" data-i="'+i+'"'+(res||poor?' disabled':'')+'><b>'+c.label+'</b><span>'+c.sub+(poor?' · не хватает денег':'')+'</span></button>';
  });
  h+='</div>';
  if(res){
    h+='<div class="card"><div class="eyebrow">Что произошло</div><div class="chips" style="margin-top:10px">'+res.chips.map(function(c){ return '<span class="chip '+c.k+'">'+esc(c.t)+'</span>'; }).join('')+'</div></div>';
    h+='<div class="lesson"><b>Урок экономики.</b> '+ev.lesson+'</div>';
    h+='<div><button class="btn primary" data-act="toplan">К планированию месяца</button></div>';
  }
  return h;
}

/* ---------- планирование ---------- */
function bounds(){ var c=unitCost(S); return {min:Math.ceil(c*1.05/10)*10, max:Math.round(refPrice(S)*2.2/10)*10}; }
function prepareMonth(){
  var b=bounds(); S.price=clamp(Math.round((S.price||refPrice(S))/10)*10,b.min,b.max);
  S.adIdx=clamp(S.adIdx||0,0,AD.length-1);
  var d=demandAt(S,S.price,S.adIdx,1); S.produce=clamp(Math.round(d)-S.inv,0,capacity(S));
  fitProduce();
}
function fitProduce(){
  var c=unitCost(S), room=Math.floor((S.cash-AD[S.adIdx].cost)/c);
  S.produce=clamp(Math.min(S.produce,room),0,capacity(S));
}
function modsHTML(){
  var out=[];
  S.mods.forEach(function(m){
    if(m.k==='dem'&&m.label==='Подарок'&&false) return;
    var nm={dem:'спрос',cost:'себестоимость',ref:'рыночная цена',fixed:'постоянные расходы'}[m.k];
    var good = (m.k==='dem'||m.k==='ref') ? m.m>=1 : m.m<=1;
    out.push('<span class="chip '+(good?'gain':'loss')+'">'+esc(m.label)+': '+nm+' ×'+f1(m.m)+(m.left>50?'':' ('+m.left+' мес.)')+'</span>');
  });
  if(S.discount!==1) out.push('<span class="chip loss">Скидка: цена продажи ×'+f1(S.discount)+'</span>');
  return out.length?'<div class="chips">'+out.join('')+'</div>':'';
}
function planHTML(){
  var tabs=[['biz','Дело'],['dev','Развитие'],['fin','Финансы']], t=U.tab||'biz', ch=CHAPTERS[chapterOf(S.month)];
  var h='<div class="card flat"><div class="eyebrow">'+MONTH_NAMES[S.month-1]+' · глава «'+ch.name+'»</div><h2 style="margin-top:4px">Спланируй месяц</h2>'+(modsHTML()?'<div style="margin-top:10px">'+modsHTML()+'</div>':'')+'</div>';
  h+='<div class="tabs" role="tablist">'+tabs.map(function(x){ return '<button class="tab" role="tab" data-act="tab" data-t="'+x[0]+'" aria-selected="'+(t===x[0])+'">'+x[1]+'</button>'; }).join('')+'</div>';
  if(t==='biz') h+=bizHTML(); else if(t==='dev') h+=devHTML(); else h+=finHTML();
  h+='<div class="actionbar"><div class="sum" id="sum"></div><button class="btn primary" data-act="go" id="gobtn">Запустить месяц</button></div>';
  return h;
}
function bizHTML(){
  var b=bounds(), cap=capacity(S), c=unitCost(S), ref=refPrice(S);
  var h='<div class="plan"><div class="col">';
  h+='<div class="card"><div class="ctl-head"><h3>Цена одной футболки</h3><div class="ctl-val num" id="v-price">'+rub(S.price)+'</div></div>'+
     '<input type="range" id="price" min="'+b.min+'" max="'+b.max+'" step="10" value="'+S.price+'" aria-label="Цена"><div class="scale num"><span>'+rub(b.min)+'</span><span>'+rub(b.max)+'</span></div>'+
     '<p class="ctl-note">Себестоимость: <b class="num">'+rub(c)+'</b>. Сейчас в городе похожие футболки стоят около <b class="num">'+rub(ref)+'</b>.</p></div>';
  h+='<div class="card"><div class="ctl-head"><h3>Сколько напечатать</h3><div class="ctl-val num" id="v-prod">'+S.produce+' шт.</div></div>'+
     '<input type="range" id="produce" min="0" max="'+cap+'" step="1" value="'+S.produce+'" aria-label="Выпуск"><div class="scale num"><span>0</span><span>мощность: '+cap+'</span></div>'+
     '<p class="ctl-note">На складе уже: <b class="num">'+S.inv+' шт.</b> Печать стоит <b class="num" id="v-prodcost"></b>. Нераспроданное лежит на складе и стоит 15 ₽ в месяц за штуку.</p></div>';
  h+='<div class="card"><h3>Реклама</h3><div class="adgrid">'+AD.map(function(a,i){ return '<button class="ad" data-act="ad" data-i="'+i+'" aria-pressed="'+(S.adIdx===i)+'"><b>'+a.name+'</b><span>'+(a.cost?rub(a.cost):'бесплатно')+(a.cost?' · спрос ×'+f1(a.mult):'')+'</span></button>'; }).join('')+'</div></div>';
  h+='</div><div class="col">';
  h+='<div class="card"><div class="ctl-head"><h3>Спрос на футболки</h3><span class="chip info">кривая спроса</span></div><svg class="curve" id="curve" viewBox="0 0 400 230" role="img" aria-label="График: чем выше цена, тем меньше покупателей"></svg>'+
     '<div class="fc"><div><b>Покупателей</b><span id="fc-d" class="num"></span></div><div><b>Выручка</b><span id="fc-r" class="num"></span></div><div><b>Прибыль</b><span id="fc-p" class="num"></span></div></div>'+
     '<div id="advice" style="margin-top:12px"></div></div>';
  h+='<div class="callout">'+ico('info')+'<div><b>Совет консультанта.</b> '+HINTS[S.month-1]+'</div></div>';
  h+='</div></div>';
  return h;
}
function devHTML(){
  var h='<div class="callout">'+ico('info')+'<div>Развитие стоит денег сейчас и окупается позже. Покупай то, что увеличивает прибыль больше, чем стоит. Мощность выпуска сейчас: <b>'+capacity(S)+' шт.</b></div></div><div class="ups">';
  UPGRADES.forEach(function(u){
    var owned=!!S.up[u.id], locked=S.month<u.from, afford=S.cash>=u.cost;
    h+='<div class="card up '+(owned?'owned':'')+(locked&&!owned?' locked':'')+'"><div><h3>'+u.name+'</h3><p class="ctl-note">'+u.desc+'</p><div class="chips" style="margin-top:10px">'+u.fx.map(function(f){ return '<span class="chip info">'+f+'</span>'; }).join('')+'</div></div>'+
     (owned?'<span class="chip gain">'+ico('check')+' куплено</span>':(locked?'<span class="chip">'+ico('lock')+' откроется в месяце '+u.from+'</span>':'<button class="btn small" data-act="buy" data-id="'+u.id+'"'+(afford?'':' disabled')+'>'+(u.cost?'Купить за '+rub(u.cost):'Нанять')+'</button>'))+'</div>';
  });
  h+='</div>';
  return h;
}
function assetCard(key,title,about,rate,have,on){
  if(!on) return '<div class="card up locked"><div><h3>'+title+'</h3><p class="ctl-note">'+about+'</p></div><span class="chip">'+ico('lock')+' откроется позже</span></div>';
  return '<div class="card"><h3>'+title+'</h3><p class="ctl-note">'+about+'</p><div class="chips" style="margin-top:8px"><span class="chip info">'+rate+'</span></div>'+
   '<div class="big num" style="margin-top:10px">'+rub(have)+'</div>'+
   '<div class="mv"><button class="btn small" data-act="mv" data-k="'+key+'" data-d="10000">+10 000</button><button class="btn small" data-act="mv" data-k="'+key+'" data-d="50000">+50 000</button><button class="btn small" data-act="mv" data-k="'+key+'" data-d="all">Всё сюда</button>'+
   '<button class="btn small" data-act="mv" data-k="'+key+'" data-d="-10000">−10 000</button><button class="btn small" data-act="mv" data-k="'+key+'" data-d="-all">Забрать всё</button></div></div>';
}
function finHTML(){
  var assets=S.cash+S.savings+S.fund+S.stock+S.invValue;
  var h='<div class="plan"><div class="card"><h3>Баланс: из чего состоит капитал</h3><table class="bal num"><tbody>'+
    '<tr><td>Деньги на счету</td><td>'+rub(S.cash)+'</td></tr><tr><td>Вклад</td><td>'+rub(S.savings)+'</td></tr><tr><td>Индексный фонд</td><td>'+rub(S.fund)+'</td></tr><tr><td>Акции</td><td>'+rub(S.stock)+'</td></tr><tr><td>Товар на складе (по себестоимости)</td><td>'+rub(S.invValue)+'</td></tr>'+
    '<tr><td>Долги</td><td class="loss-t">'+rub(-S.loanLeft)+'</td></tr><tr class="total"><td>Капитал</td><td>'+rub(assets-S.loanLeft)+'</td></tr></tbody></table>'+
    '<p class="ctl-note">Капитал = всё, что у тебя есть, минус все долги.</p></div>';
  h+='<div class="col">'+(S.loanLeft>0 ?
    '<div class="card"><h3>Кредит</h3><p class="ctl-note">Ставка 1,5% в месяц. Платёж в конце месяца: часть долга плюс проценты.</p><div class="big num loss-t" style="margin-top:10px">'+rub(S.loanLeft)+'</div><p class="ctl-note">Ближайший платёж: <b class="num">'+rub(loanPayment(S))+'</b></p><div class="mv"><button class="btn small" data-act="repay" data-d="50000"'+(S.cash<1?' disabled':'')+'>Погасить 50 000</button><button class="btn small" data-act="repay" data-d="all"'+(S.cash<1?' disabled':'')+'>Погасить всё, что можно</button></div></div>' :
    '<div class="card"><h3>Кредит</h3><p class="ctl-note">'+(S.unlock.loan?'Долгов нет. Это хорошо: переплачивать банку не нужно.':'Банк предложит кредит в одной из глав.')+'</p></div>')+'</div></div>';
  h+='<div class="fin-grid">'+
    assetCard('savings','Вклад','Надёжно. Деньги можно забрать в любой момент.','+1% в месяц',S.savings,S.unlock.deposit)+
    assetCard('fund','Индексный фонд','Сотни компаний сразу. Колеблется умеренно.','≈ +0,8% в месяц, колебания ±4%',S.fund,S.unlock.invest)+
    assetCard('stock','Акции одной компании','Может вырасти и упасть сильно.','≈ +1,2% в месяц, колебания ±13%',S.stock,S.unlock.invest)+'</div>';
  return h;
}

/* ---------- прогноз ---------- */
function curveSVG(){
  var b=bounds(), cap=capacity(S), ref=refPrice(S), W=400,H=230,L=42,R=10,T=12,B=34, pw=W-L-R, ph=H-T-B;
  var ymax=Math.max(cap*1.35, demandAt(S,Math.round(ref*1.05),S.adIdx,1)*1.5, 20); ymax=Math.ceil(ymax/10)*10;
  function X(p){ return L+(p-b.min)/(b.max-b.min)*pw; } function Y(d){ return T+ph-Math.min(d,ymax)/ymax*ph; }
  var pts=[],i,p; for(i=0;i<=50;i++){ p=b.min+(b.max-b.min)*i/50; pts.push(X(p).toFixed(1)+','+Y(demandAt(S,p,S.adIdx,1)).toFixed(1)); }
  var d=demandAt(S,S.price,S.adIdx,1), avail=S.inv+S.produce, g='';
  [0,0.5,1].forEach(function(t){ var yy=T+ph-t*ph; g+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+yy+'" y2="'+yy+'" stroke="var(--grid)" stroke-width="1"/><text x="'+(L-6)+'" y="'+(yy+3.5)+'" text-anchor="end">'+Math.round(ymax*t)+'</text>'; });
  [b.min,Math.round((b.min+b.max)/20)*10,b.max].forEach(function(pp,k){ g+='<text x="'+X(pp)+'" y="'+(H-14)+'" text-anchor="'+(k===0?'start':(k===2?'end':'middle'))+'">'+num(pp)+' ₽</text>'; });
  g+='<text x="'+(L)+'" y="'+(H-2)+'" style="font-size:10px">цена →</text><text x="'+(W-R)+'" y="'+(T+8)+'" text-anchor="end" style="font-size:10px">↑ покупателей в месяц</text>';
  var cl=Math.min(avail,ymax);
  return g+'<line x1="'+X(ref)+'" x2="'+X(ref)+'" y1="'+T+'" y2="'+(T+ph)+'" stroke="var(--line)" stroke-width="1" stroke-dasharray="2 4" opacity=".5"/>'+
   '<polyline points="'+L+','+(T+ph)+' '+pts.join(' ')+' '+(W-R)+','+(T+ph)+'" fill="var(--info-bg)" stroke="none" opacity=".8"/>'+
   '<polyline points="'+pts.join(' ')+'" fill="none" stroke="var(--info-fg)" stroke-width="3" stroke-linejoin="round"/>'+
   '<line x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(cl)+'" y2="'+Y(cl)+'" stroke="var(--coin-deep)" stroke-width="2.5" stroke-dasharray="7 5"/>'+
   '<text x="'+(L+4)+'" y="'+(Y(cl)-5)+'" style="fill:var(--ink);font-weight:700">у тебя будет: '+avail+' шт.</text>'+
   '<line x1="'+X(S.price)+'" x2="'+X(S.price)+'" y1="'+Y(d)+'" y2="'+(T+ph)+'" stroke="var(--ink)" stroke-width="1.5"/>'+
   '<circle cx="'+X(S.price)+'" cy="'+Y(d)+'" r="7" fill="var(--coin)" stroke="var(--line)" stroke-width="2.5"/>';
}
function drawForecast(){
  if(!$('#curve')) { updateSum(); return; }
  var plan={price:S.price,produce:S.produce,adIdx:S.adIdx}, c=unitCost(S);
  var dLo=demandAt(S,S.price,S.adIdx,0.92), dMid=demandAt(S,S.price,S.adIdx,1), dHi=demandAt(S,S.price,S.adIdx,1.08);
  var pLo=netProfitPreview(S,plan,dLo), pMid=netProfitPreview(S,plan,dMid), pHi=netProfitPreview(S,plan,dHi);
  $('#curve').innerHTML=curveSVG();
  $('#v-price').textContent=rub(S.price); $('#v-prod').textContent=S.produce+' шт.'; $('#v-prodcost').textContent=rub(S.produce*c);
  $('#fc-d').textContent=Math.round(dLo)+'–'+Math.round(dHi);
  $('#fc-r').textContent='≈ '+rub(pMid.revenue);
  var pe=$('#fc-p'); pe.textContent='≈ '+rub(pMid.profit); pe.className='num '+(pMid.profit>=0?'gain-t':'loss-t');
  var avail=S.inv+S.produce, adv='', cap=capacity(S);
  if(avail<dLo-2) adv='<div class="callout warn">'+ico('warn')+'<div>Покупателей больше, чем футболок. Около '+Math.round(dLo-avail)+' человек уйдут ни с чем. Можно напечатать больше'+(S.produce>=cap?' (мощность выпуска исчерпана, подними цену или купи оборудование)':'')+'.</div></div>';
  else if(avail>dHi+2) adv='<div class="callout warn">'+ico('warn')+'<div>Футболок больше, чем покупателей. Около '+Math.round(avail-dHi)+' останутся на складе и будут стоить денег.</div></div>';
  else adv='<div class="callout ok">'+ico('check')+'<div>Выпуск близок к спросу. Хороший баланс.</div></div>';
  $('#advice').innerHTML=adv;
  updateSum();
}
function planSpend(){ return S.produce*unitCost(S)+AD[S.adIdx].cost; }
function updateSum(){
  var sp=planSpend(), left=S.cash-sp, s=$('#sum'), b=$('#gobtn'); if(!s) return;
  s.innerHTML='<span>Сейчас потратишь: <b class="num">'+rub(sp)+'</b></span><span>В конце месяца ещё: <b class="num">'+rub(fixedCosts(S)+loanPayment(S))+'</b> постоянных расходов и платежей</span>'+(left<0?'<span class="loss-t">Не хватает '+rub(-left)+'. Напечатай меньше или убери рекламу.</span>':'');
  b.disabled=left<0;
}

/* ---------- итоги месяца ---------- */
function lineChart(hist,w,h){
  if(!hist.length) return '';
  var W=w||520,H=h||200,L=52,R=12,T=14,B=26,pw=W-L-R,ph=H-T-B;
  var mx=Math.max(GOAL,Math.max.apply(null,hist.map(function(x){return x.nw;})))*1.05, mn=Math.min(0,Math.min.apply(null,hist.map(function(x){return x.nw;})));
  function X(i){ return L+i/(TOTAL-1)*pw; } function Y(v){ return T+ph-(v-mn)/(mx-mn)*ph; }
  var pts=hist.map(function(x,i){ return X(i).toFixed(1)+','+Y(x.nw).toFixed(1); }), last=hist[hist.length-1];
  var g='<text x="'+(L-6)+'" y="'+(Y(0)+4)+'" text-anchor="end">0</text><line x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(0)+'" y2="'+Y(0)+'" stroke="var(--grid)"/>';
  g+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(GOAL)+'" y2="'+Y(GOAL)+'" stroke="var(--coin-deep)" stroke-width="2" stroke-dasharray="7 5"/><text x="'+(L-6)+'" y="'+(Y(GOAL)+4)+'" text-anchor="end">1 млн</text><text x="'+(W-R)+'" y="'+(Y(GOAL)-6)+'" text-anchor="end" style="fill:var(--ink);font-weight:700">цель</text>';
  [1,4,8,12,16].forEach(function(m){ g+='<text x="'+X(m-1)+'" y="'+(H-8)+'" text-anchor="middle">'+m+'</text>'; });
  return '<svg class="curve" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Капитал по месяцам">'+g+
   '<polyline points="'+L+','+Y(0)+' '+pts.join(' ')+' '+X(hist.length-1)+','+Y(0)+'" fill="var(--gain-bg)" opacity=".85"/>'+
   '<polyline points="'+pts.join(' ')+'" fill="none" stroke="var(--ink)" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>'+
   '<circle cx="'+X(hist.length-1)+'" cy="'+Y(last.nw)+'" r="6.5" fill="var(--coin)" stroke="var(--line)" stroke-width="2.5"/></svg>';
}
function reportHTML(){
  var r=U.report, mx=Math.max(r.revenue,1), rows='';
  function row(name,val,kind,w){ return '<div class="wf-row '+kind+'"><span>'+name+'</span><b>'+(kind==='minus'?'−':(kind==='plus'?'+':''))+rub(Math.abs(val)).replace('−','')+'</b><div class="bar"><i style="width:'+clamp(Math.abs(val)/mx*100,0,100)+'%"></i></div></div>'; }
  rows+=row('Выручка',r.revenue,'plus');
  rows+=row('Себестоимость проданного',r.cogs,'minus');
  if(r.ad) rows+=row('Реклама',r.ad,'minus');
  if(r.fixed) rows+=row('Постоянные расходы',r.fixed,'minus');
  if(r.carry) rows+=row('Хранение склада',r.carry,'minus');
  if(r.interest) rows+=row('Проценты по кредиту',r.interest,'minus');
  if(r.tax) rows+=row('Налоги',r.tax,'minus');
  var best=S.history.every(function(x){ return r.profit>=x.profit; })&&S.history.length>1;
  var notes=[];
  if(r.lost>=3) notes.push('Спрос был выше запасов: '+r.lost+' покупателей ушли ни с чем. В следующий раз печатай больше или подними цену.');
  else if(r.left>=8) notes.push('На складе осталось '+r.left+' футболок. Они ждут покупателей и стоят денег.');
  else notes.push('Выпуск почти совпал со спросом. Так и нужно.');
  if(r.profit<0) notes.push('Месяц в минус. Посмотри на постоянные расходы и на цену.');
  var spentPrint=r.produce*r.unit, delta=r.cashAfter-r.cashBefore;
  if(Math.abs(delta-r.profit)>0.12*Math.max(1,Math.abs(r.profit))+1000) notes.push('Прибыль и деньги на счёте не совпадают: на печать партии ушло '+rub(spentPrint)+(r.principal?', на возврат долга '+rub(r.principal):'')+'. Деньги, вложенные в товар, превратятся в выручку позже.');
  if(r.overdraft) notes.push('Денег не хватило на расходы месяца. Банк закрыл дефицит '+rub(r.overdraft)+', он добавлен к долгу.');
  if(r.fromSavings) notes.push('Не хватало денег на счету, поэтому '+rub(r.fromSavings)+' пришлось снять со вклада.');
  if(r.depositGain>0||Math.abs(r.investGain)>0) notes.push('Проценты по вкладу: '+rub(r.depositGain)+'. Изменение акций и фонда: '+(r.investGain>=0?'+':'')+rub(r.investGain)+'.');
  var h='<div class="card"><div class="report-head"><div><div class="eyebrow">'+MONTH_NAMES[r.month-1]+': итоги</div><div class="profit num '+(r.profit>=0?'gain-t':'loss-t')+'">'+(r.profit>=0?'+':'')+rub(r.profit)+'</div><div class="ctl-note">чистая прибыль за месяц</div></div>'+
   '<div class="chips">'+(best?'<span class="chip coin">'+ico('star')+' лучший месяц</span>':'')+'<span class="chip info">Продано '+r.sold+' из '+r.demand+'</span><span class="chip">Капитал '+rub(r.nw)+'</span></div></div></div>';
  h+='<div class="two"><div class="card"><h3>Как получилась прибыль</h3><div class="wf">'+rows+'<div class="wf-row sum"><span>Прибыль</span><b class="'+(r.profit>=0?'gain-t':'loss-t')+'">'+rub(r.profit)+'</b></div></div></div>'+
   '<div class="card"><h3>Капитал по месяцам</h3>'+lineChart(S.history,520,230)+'</div></div>';
  h+='<div class="card flat"><div class="eyebrow">Разбор месяца</div>'+notes.map(function(n){ return '<p style="margin-top:8px">'+n+'</p>'; }).join('')+'</div>';
  var m=r.month, quiz=(m%4===0);
  h+='<div><button class="btn primary" data-act="afterreport">'+(quiz?'Проверить знания':'Следующий месяц')+'</button></div>';
  return h;
}

/* ---------- викторина ---------- */
function shuffle(a){ for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)), t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
function startQuiz(ch){
  var qs=QUIZ[ch].map(function(q){ var opts=q.a.map(function(t,i){ return {t:t,ok:i===q.c}; }); return {q:q.q,opts:shuffle(opts),e:q.e}; });
  U.quiz={ch:ch,qs:qs,i:0,picked:null,correct:0}; U.screen='quiz';
}
function quizHTML(){
  var Q=U.quiz, q=Q.qs[Q.i], ch=CHAPTERS[Q.ch], L='АБВГ';
  var h='<div class="card"><div class="ctl-head"><div><div class="eyebrow">Проверка знаний · глава «'+ch.name+'»</div><h2 style="margin-top:4px">Вопрос '+(Q.i+1)+' из '+Q.qs.length+'</h2></div><span class="chip coin">'+ico('coin')+' +'+rub(QUIZ_BONUS)+' за верный ответ</span></div>'+
   '<div class="qprog" style="margin-top:14px">'+Q.qs.map(function(x,i){ return '<i class="'+(i<Q.i||(i===Q.i&&Q.picked!==null)?'on':'')+'"></i>'; }).join('')+'</div>'+
   '<p style="margin-top:16px;font-size:1.12rem;font-weight:600">'+q.q+'</p><div class="qopts">';
  q.opts.forEach(function(o,i){
    var cls=''; if(Q.picked!==null){ cls=o.ok?'right':(Q.picked===i?'wrong':'dim'); }
    h+='<button class="qopt '+cls+'" data-act="qpick" data-i="'+i+'"'+(Q.picked!==null?' disabled':'')+'><span class="k">'+L[i]+'</span><span>'+o.t+'</span></button>';
  });
  h+='</div></div>';
  if(Q.picked!==null){
    var ok=q.opts[Q.picked].ok;
    h+='<div class="callout '+(ok?'ok':'warn')+'">'+ico(ok?'check':'info')+'<div><b>'+(ok?'Верно! ':'Не совсем. ')+'</b>'+q.e+'</div></div>';
    h+='<div><button class="btn primary" data-act="qnext">'+(Q.i===Q.qs.length-1?'Узнать результат':'Дальше')+'</button></div>';
  }
  return h;
}
function chapterHTML(){
  var I=U.chapterInfo, ch=CHAPTERS[I.ch];
  var h='<div class="card"><div class="eyebrow">Глава пройдена</div><h2 style="margin-top:4px">«'+ch.name+'»</h2>'+
   '<div class="two" style="margin-top:16px"><div><div class="chips"><span class="chip '+(I.correct>=2?'gain':'loss')+'">Верных ответов: '+I.correct+' из 3</span><span class="chip coin">Грант: +'+rub(I.bonus)+'</span></div>'+
   '<p class="ctl-note" style="margin-top:12px">Прибыль за главу: <b class="num '+(I.profit>=0?'gain-t':'loss-t')+'">'+rub(I.profit)+'</b>. Капитал сейчас: <b class="num">'+rub(netWorth(S))+'</b>.</p></div>'+lineChart(S.history,520,200)+'</div></div>';
  h+='<div><button class="btn primary" data-act="chapternext">'+(I.ch===3?'Посмотреть итоги игры':(I.ch===1?'Завершить урок 1':'Следующая глава'))+'</button></div>';
  return h;
}
function lessonEndHTML(){
  var code=exportCode();
  return '<div class="card"><div class="eyebrow">Урок 1 завершён</div><h2 style="margin-top:4px">Половина пути пройдена</h2>'+
   '<p style="margin-top:12px;max-width:60ch">Капитал: <b class="num">'+rub(netWorth(S))+'</b>. Игра сохранена на этом устройстве. На втором уроке открой её на этом же компьютере и нажми «Продолжить». Если компьютер другой, скопируй код ниже и загрузи его на заставке.</p>'+
   '<div class="chips" style="margin-top:14px"><span class="chip gain">'+ico('check')+' Главы 1–2 пройдены</span><span class="chip info">Ответов верно: '+S.quizScore.reduce(function(a,b){return a+b;},0)+' из '+S.quizTotal+'</span></div>'+
   '<h3 style="margin-top:18px">Код сохранения</h3><textarea class="code" id="savecode" readonly>'+code+'</textarea>'+
   '<div class="row" style="margin-top:10px"><button class="btn small" data-act="copysave">Скопировать код</button></div></div>'+
   '<div class="callout">'+ico('book')+'<div><b>Для учителя.</b> Результат ученика: '+esc(resultLine())+'</div></div>'+
   '<div><button class="btn primary" data-act="lessonnext">Продолжить: урок 2</button></div>';
}

/* ---------- финал ---------- */
function badgeList(){
  var nw=netWorth(S), q=S.quizScore.reduce(function(a,b){return a+b;},0);
  var first=S.history[0]&&S.history[0].profit>0;
  return [
   {id:'first',n:'Первая прибыль',d:'Первый месяц закончился в плюсе',ic:'coin',on:!!first},
   {id:'cushion',n:'Подушка безопасности',d:'Вклад и вложения на 50 000 ₽ и больше',ic:'shield',on:S.savings+S.fund+S.stock>=50000},
   {id:'div',n:'Диверсификатор',d:'Деньги и на вкладе, и в ценных бумагах',ic:'chart',on:S.savings>0&&(S.fund>0||S.stock>0)},
   {id:'risk',n:'Рискнул и выиграл',d:'Ролик блогера выстрелил',ic:'dice',on:!!S.riskWon},
   {id:'scholar',n:'Отличник',d:'Все 12 вопросов верно',ic:'grad',on:q===12},
   {id:'free',n:'Без долгов',d:'К концу игры кредитов нет',ic:'check',on:S.loanLeft===0},
   {id:'ctrl',n:'Деньги под контролем',d:'Ни разу не ушёл в овердрафт',ic:'lock',on:S.overdrafts===0},
   {id:'tycoon',n:'Миллион!',d:'Капитал '+rub(GOAL)+' и больше',ic:'star',on:nw>=GOAL}
  ];
}
function resultLine(){
  var q=S.quizScore.reduce(function(a,b){return a+b;},0);
  return S.name+' | месяц '+Math.min(S.month-1,TOTAL)+' из '+TOTAL+' | капитал '+rub(netWorth(S))+' | звание «'+titleOf(netWorth(S))+'» | вопросы '+q+'/'+S.quizTotal;
}
function finalHTML(){
  var nw=netWorth(S), q=S.quizScore.reduce(function(a,b){return a+b;},0), win=nw>=GOAL;
  var bestM=S.history.reduce(function(a,b){ return b.profit>a.profit?b:a; },S.history[0]);
  var h='<div class="card"><div class="final-top"><div><div class="eyebrow">'+(win?'Цель достигнута':'Игра окончена')+'</div><div class="rank" style="margin-top:6px">'+titleOf(nw)+'</div>'+
   '<div class="big num" style="margin-top:6px">'+rub(nw)+'</div><p class="ctl-note">итоговый капитал, цель: '+rub(GOAL)+'</p>'+
   '<div class="chips" style="margin-top:14px"><span class="chip info">Вопросы: '+q+' из '+S.quizTotal+'</span><span class="chip">Выручка за игру: '+rub(S.totalRevenue)+'</span>'+(bestM?'<span class="chip coin">Лучший месяц: '+MONTH_NAMES[bestM.m-1]+', '+rub(bestM.profit)+'</span>':'')+'</div></div>'+
   '<div>'+lineChart(S.history,520,230)+'</div></div></div>';
  h+='<div class="card"><h3>Награды</h3><div class="badges" style="margin-top:12px">'+badgeList().map(function(b){ return '<div class="bdg '+(b.on?'on':'off')+'">'+ico(b.ic)+'<div><b>'+b.n+'</b><small>'+b.d+'</small></div></div>'; }).join('')+'</div></div>';
  h+='<div class="card"><h3>Результат для учителя</h3><textarea class="code" id="resline" readonly>'+esc(resultLine())+'</textarea><div class="row" style="margin-top:10px"><button class="btn small" data-act="copyres">Скопировать</button></div></div>';
  h+='<div class="lesson"><b>Главный вывод.</b> Бизнес — это постоянный выбор между риском и выгодой, расходами и доходами, сегодня и завтра. Игра учила управлять ценой и спросом, платить налоги, брать кредит, защищаться от инфляции и переживать кризис. Это те же решения, что принимают настоящие предприниматели.</div>';
  h+='<div class="row"><button class="btn primary" data-act="restart">Сыграть ещё раз</button><button class="btn" data-act="glossary">Открыть словарик</button></div>';
  return h;
}

/* ---------- модальные окна ---------- */
function openModal(html){ $('#modal').innerHTML='<div class="modal" data-act="closemodal"><div class="modal-box" role="dialog" aria-modal="true">'+html+'</div></div>'; var b=$('#modal .iconbtn,#modal .btn'); if(b) b.focus(); }
function closeModal(){ $('#modal').innerHTML=''; }
function glossaryHTML(){
  var keys=Object.keys(TERMS), got=S?S.terms:[];
  return '<div class="modal-head"><h2>Словарик экономиста</h2><button class="btn small" data-act="closemodal">Закрыть</button></div>'+
   '<p class="ctl-note">Открыто терминов: '+got.length+' из '+keys.length+'. Новые появляются, когда ты встречаешь их в событиях.</p><div class="terms">'+
   keys.map(function(k){ return got.indexOf(k)>=0 ? '<div class="term"><b>'+TERMS[k][0]+'</b><span>'+TERMS[k][1]+'</span></div>' : '<div class="term lock"><b>'+ico('lock')+' Закрытый термин</b><span>Откроется по ходу игры.</span></div>'; }).join('')+'</div>';
}
function loadHTML(){
  return '<div class="modal-head"><h2>Загрузить игру</h2><button class="btn small" data-act="closemodal">Закрыть</button></div>'+
   '<p class="ctl-note">Вставь код сохранения, который был показан в конце прошлого урока.</p><textarea class="code" id="loadcode" placeholder="Вставь код сюда"></textarea><div class="row"><button class="btn primary" data-act="doload">Загрузить</button></div><p class="ctl-note loss-t" id="loaderr"></p>';
}

/* ---------- отрисовка ---------- */
function stageHTML(){
  switch(U.screen){
    case 'title': return titleHTML();
    case 'event': return eventHTML();
    case 'plan': return planHTML();
    case 'report': return reportHTML();
    case 'quiz': return quizHTML();
    case 'chapter': return chapterHTML();
    case 'lessonend': return lessonEndHTML();
    case 'final': return finalHTML();
  }
  return '';
}
function render(keepScroll){
  $('#hud').innerHTML = (S && U.screen!=='title') ? hudHTML() : '';
  var st=$('#stage'); st.classList.toggle('enter',!keepScroll); st.innerHTML = stageHTML();
  if(!keepScroll) window.scrollTo(0,0);
  if(U.screen==='plan') drawForecast();
  var th=$('#themebtn'); if(th) th.innerHTML = ico(isDark()?'sun':'moon');
  var sb=$('#soundbtn'); if(sb) sb.innerHTML = ico(soundOn?'vol':'mute');
  if(S && U.screen!=='title') persist();
}
function isDark(){ var d=document.documentElement.getAttribute('data-theme'); if(d) return d==='dark'; return window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches; }

/* ---------- действия ---------- */
var A={
 start:function(){
   var sv=readSave(); if(sv&&sv.S&&!U.confirmNew){ U.confirmNew=true; render(true); return; }
   var nm=($('#pname').value||'').trim()||'Предприниматель'; U.confirmNew=false;
   S=newState(nm); U={screen:'event',phase:'choose',res:null}; sfx('coin'); render();
 },
 continue:function(){ var sv=readSave(); if(sv){ applySave(sv); sfx('click'); render(); } },
 loadcode:function(){ openModal(loadHTML()); },
 doload:function(){ var v=$('#loadcode').value; if(importCode(v)){ closeModal(); render(); toast('Игра загружена'); } else $('#loaderr').textContent='Код не подошёл. Проверь, что скопировал его целиком.'; },
 choose:function(el){
   var i=+el.getAttribute('data-i'), ev=EVENTS[S.month-1];
   var before=S.cash, chips=ev.choices[i].apply(S, Math.random);
   var gap=coverDeficit(S); if(gap) chips.push({t:'Денег не хватило: банк покрыл '+rub(gap)+' в долг',k:'loss'});
   addTerm(ev.term); U.res={i:i,chips:chips}; sfx(S.cash>=before?'good':'bad'); render(true);
   var n=$('.lesson'); if(n) n.scrollIntoView({behavior:'smooth',block:'center'});
 },
 toplan:function(){ prepareMonth(); U.screen='plan'; U.tab='biz'; U.res=null; render(); },
 tab:function(el){ U.tab=el.getAttribute('data-t'); render(true); },
 ad:function(el){ S.adIdx=+el.getAttribute('data-i'); sfx('click'); render(true); },
 buy:function(el){
   var u=UPGRADES.filter(function(x){return x.id===el.getAttribute('data-id');})[0];
   if(S.cash<u.cost||S.up[u.id]) return; S.cash-=u.cost; S.up[u.id]=true;
   var b=bounds(); S.price=clamp(S.price,b.min,b.max); fitProduce();
   if(u.id==='brandkit') S.brand=clamp(S.brand+10,0,100);
   sfx('coin'); toast('Куплено: '+u.name); render(true);
 },
 mv:function(el){
   var k=el.getAttribute('data-k'), d=el.getAttribute('data-d'), amt;
   if(d==='all') amt=Math.max(0,Math.floor(S.cash)); else if(d==='-all') amt=-S[k]; else amt=+d;
   if(amt>0) amt=Math.min(amt,Math.floor(S.cash)); else amt=-Math.min(-amt,S[k]);
   if(!amt) { toast(amt===0&&d.charAt(0)!=='-'?'На счету нет свободных денег':'Здесь нечего забирать'); return; }
   S.cash-=amt; S[k]+=amt; sfx('click'); render(true);
 },
 repay:function(el){
   var d=el.getAttribute('data-d'), amt=d==='all'?S.loanLeft:+d; amt=Math.min(amt,S.loanLeft,Math.floor(S.cash)); if(amt<=0) return;
   S.cash-=amt; S.loanLeft-=amt; if(S.loanLeft<1){S.loanLeft=0;S.loanStep=0;} else S.loanStep=Math.min(S.loanStep,S.loanLeft);
   sfx('coin'); toast('Погашено: '+rub(amt)); render(true);
 },
 go:function(){
   if(planSpend()>S.cash) return;
   var before=S.cash, r=runMonth(S,{price:S.price,produce:S.produce,adIdx:S.adIdx},Math.random);
   r.cashBefore=before; r.cashAfter=S.cash; U.report=r; U.screen='report';
   if(r.profit>0){ sfx('good'); burst(34); } else sfx('bad'); render();
 },
 afterreport:function(){
   var m=U.report.month;
   if(m%4===0){ startQuiz(chapterOf(m)); render(); } else { U.screen='event'; U.res=null; render(); }
 },
 qpick:function(el){
   var Q=U.quiz; if(Q.picked!==null) return; var i=+el.getAttribute('data-i'); Q.picked=i;
   if(Q.qs[Q.i].opts[i].ok){ Q.correct++; sfx('good'); } else sfx('bad'); render(true);
 },
 qnext:function(){
   var Q=U.quiz;
   if(Q.i<Q.qs.length-1){ Q.i++; Q.picked=null; render(); return; }
   var ch=Q.ch, bonus=Q.correct*QUIZ_BONUS, m0=CHAPTERS[ch].months[0], m1=CHAPTERS[ch].months[1];
   S.cash+=bonus; S.quizScore.push(Q.correct); S.quizTotal+=Q.qs.length;
   var prof=S.history.filter(function(x){return x.m>=m0&&x.m<=m1;}).reduce(function(a,x){return a+x.profit;},0);
   U.chapterInfo={ch:ch,correct:Q.correct,bonus:bonus,profit:prof}; U.screen='chapter'; if(Q.correct>=2){ sfx('win'); burst(30); }
   render();
 },
 chapternext:function(){
   var ch=U.chapterInfo.ch;
   if(ch===3){ U.screen='final'; var good=netWorth(S)>=GOAL*0.5; if(good) sfx('win'); render(); if(good) burst(netWorth(S)>=GOAL?160:70); }
   else if(ch===1){ U.screen='lessonend'; render(); }
   else { U.screen='event'; U.res=null; render(); }
 },
 lessonnext:function(){ U.screen='event'; U.res=null; render(); },
 copysave:function(){ copyText($('#savecode').value,'#savecode'); },
 copyres:function(){ copyText($('#resline').value,'#resline'); },
 restart:function(){ U={screen:'title',confirmNew:false}; S=null; render(); },
 glossary:function(){ openModal(glossaryHTML()); },
 closemodal:function(){ closeModal(); },
 theme:function(){ var d=!isDark(); document.documentElement.setAttribute('data-theme',d?'dark':'light'); try{ localStorage.setItem(THEME_KEY,d?'dark':'light'); }catch(e){} render(true); },
 sound:function(){ soundOn=!soundOn; try{ localStorage.setItem('merch-empire-sound',soundOn?'1':'0'); }catch(e){} render(true); sfx('click'); }
};
function copyText(t,sel){
  var done=function(){ toast('Скопировано'); };
  try{ navigator.clipboard.writeText(t).then(done,function(){ var e=$(sel); e.focus(); e.select(); toast('Выдели текст и нажми Ctrl+C'); }); }
  catch(e){ var x=$(sel); x.focus(); x.select(); toast('Выдели текст и нажми Ctrl+C'); }
}

document.addEventListener('click',function(e){
  var el=e.target.closest('[data-act]'); if(!el) return;
  if(el.classList.contains('modal') && e.target!==el) return;
  var a=el.getAttribute('data-act'); if(A[a]){ if(a!=='go'&&a!=='choose'&&a!=='qpick'&&a!=='start') sfx('click'); A[a](el); }
});
document.addEventListener('input',function(e){
  if(!S||U.screen!=='plan') return;
  if(e.target.id==='price'){ S.price=+e.target.value; drawForecast(); }
  else if(e.target.id==='produce'){ S.produce=+e.target.value; drawForecast(); }
});
document.addEventListener('keydown',function(e){ if(e.key==='Escape') closeModal(); if(e.key==='Enter' && e.target.id==='pname') A.start(); });

/* ---------- запуск ---------- */
function boot(){
  try{ var th=localStorage.getItem(THEME_KEY); if(th) document.documentElement.setAttribute('data-theme',th); soundOn=localStorage.getItem('merch-empire-sound')==='1'; }catch(e){}
  $('#app-tools').innerHTML=
   '<button class="iconbtn" data-act="glossary" title="Словарик" aria-label="Словарик">'+ico('book')+'</button>'+
   '<button class="iconbtn" id="soundbtn" data-act="sound" title="Звук" aria-label="Звук"></button>'+
   '<button class="iconbtn" id="themebtn" data-act="theme" title="Тема" aria-label="Сменить тему"></button>';
  var sv=readSave(); if(sv&&sv.S){ S=newState('x'); S=null; }
  U={screen:'title'}; render();
  window.__game={get S(){return S;},get U(){return U;},A:A,render:render};
}
boot();
})();
