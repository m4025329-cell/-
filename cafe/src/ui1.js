/* ===== Интерфейс «Первого столика», часть 1: ядро, сохранение, звук, шапка, вкладки ===== */
var KEY='ps-save-v1', THEME_KEY='ps-theme', SND_KEY='ps-sound', REC_KEY='ps-best', APP_VERSION='1.0.0';
var S=null, U={screen:'title'}, soundOn=false, actx=null, reduced=false, lastFocus=null, timers=[];
try{ reduced = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }catch(e){}
function $(s,r){ return (r||document).querySelector(s); }
function $$(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); }
function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
function lsDel(k){ try{ localStorage.removeItem(k); }catch(e){} }
function setText(id,t){ var e=document.getElementById(id); if(e && e.textContent!==t) e.textContent=t; }
function later(fn,ms){ var t=setTimeout(fn,ms); timers.push(t); return t; }
function clearTimers(){ timers.forEach(clearTimeout); timers=[]; if(U.rushT){ clearInterval(U.rushT); U.rushT=0; } }
function nm(){ return (S&&S.name)||'Хозяин'; }
function curO(){ var o=S&&outletById(S,U.outlet); if(!o||o.fmt==='fran'||o.built){ o=liveOutlets(S)[0]||S.outlets[0]; U.outlet=o.id; } return o; }
function money(n){ return rub(n); }
function sgn(n){ return (n>0?'+':(n<0?'−':''))+rub(Math.abs(n)).replace('−',''); }
function chip(k,t,i){ return '<span class="chip '+(k||'')+'"'+(i!=null?' style="--i:'+i+'"':'')+'>'+esc(t)+'</span>'; }
function chipsFx(list){ return list&&list.length?'<div class="chips pop-in">'+list.map(function(c,i){ return chip(c.k,c.t,i); }).join('')+'</div>':''; }

/* ---------- сохранение ---------- */
function snapshot(strip){
  var u={screen:U.screen, tab:U.tab, outlet:U.outlet, intro:U.intro, setup:U.setup, sc:U.sc, ev:U.ev, evRes:U.evRes, qz:U.qz, seen:U.seen, repOutlet:U.repOutlet, finale:U.finale, actSeen:U.actSeen, coachSeen:U.coachSeen};
  if(!strip){ u.report=U.report; u.snap=U.snap; }
  return {v:1, S:S, U:u};
}
function persist(){ if(S) lsSet(KEY, JSON.stringify(snapshot(false))); }
function readSave(){ try{ var t=lsGet(KEY); if(!t) return null; var d=JSON.parse(t); return (d&&d.S&&typeof d.S.month==='number'&&d.S.outlets)?d:null; }catch(e){ return null; } }
function applySave(d){
  S=d.S; U=d.U||{}; U.screen=U.screen||'plan'; ensureState(S);
  if(U.screen==='title') U.screen='plan';
  if((U.screen==='run'||U.screen==='report'||U.screen==='quiz') && !U.report) U.screen='plan';
  if(U.screen==='rush') U.screen='plan';
  if(U.screen==='plan' && !U.tab) U.tab='home';
}
function exportCode(){ try{ var d=snapshot(true); d.S=JSON.parse(JSON.stringify(S)); delete d.S.lastR; return btoa(unescape(encodeURIComponent(JSON.stringify(d)))); }catch(e){ return ''; } }
function importCode(code){ try{ var d=JSON.parse(decodeURIComponent(escape(atob(String(code).replace(/\s+/g,''))))); if(d&&d.S&&typeof d.S.month==='number'&&d.S.outlets){ applySave(d); return true; } }catch(e){} return false; }

/* ---------- звук (по умолчанию выключен) ---------- */
function tone(freq,dur,delay,type,vol){
  if(!soundOn) return;
  try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); if(actx.state==='suspended') actx.resume();
    var t=actx.currentTime+(delay||0), o=actx.createOscillator(), g=actx.createGain(); o.type=type||'triangle'; o.frequency.value=freq; g.gain.setValueAtTime(vol||0.05,t); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t+dur+0.03); }catch(e){}
}
function sfx(k){
  if(k==='click') tone(560,0.05,0,'triangle',0.03);
  else if(k==='coin'){ tone(988,0.07,0,'square',0.035); tone(1319,0.16,0.07,'square',0.035); }
  else if(k==='good'){ tone(523,0.1,0,'triangle',0.07); tone(659,0.1,0.1,'triangle',0.07); tone(784,0.2,0.2,'triangle',0.07); }
  else if(k==='bad'){ tone(220,0.18,0,'sawtooth',0.04); tone(165,0.26,0.14,'sawtooth',0.04); }
  else if(k==='win'){ [523,659,784,1047].forEach(function(f,i){ tone(f,0.22,i*0.12,'triangle',0.08); }); }
  else if(k==='bell'){ tone(1568,0.3,0,'sine',0.05); tone(2093,0.4,0.05,'sine',0.03); }
}

/* ---------- конфетти ---------- */
var parts=[], raf=0, fxc=null;
function burst(n,cx,cy){
  if(reduced) return; fxc=fxc||$('#fx'); if(!fxc) return;
  var w=fxc.width=innerWidth, h=fxc.height=innerHeight, cols=['#D1361A','#F2B233','#2E7D4F','#B83A6B','#2B78B5','#FFF6E6'];
  for(var i=0;i<n;i++){ var a=Math.random()*Math.PI*2, v=4+Math.random()*9; parts.push({x:cx==null?w/2:cx,y:cy==null?h*0.38:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v-6,r:3+Math.random()*4,c:cols[i%cols.length],life:70+Math.random()*50,rot:Math.random()*6}); }
  if(!raf) raf=requestAnimationFrame(tick);
}
function tick(){
  var ctx=fxc.getContext('2d'); ctx.clearRect(0,0,fxc.width,fxc.height); parts=parts.filter(function(p){ return p.life>0; });
  parts.forEach(function(p){ p.x+=p.vx; p.y+=p.vy; p.vy+=0.3; p.vx*=0.985; p.life--; p.rot+=0.22; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle=p.c; ctx.globalAlpha=Math.min(1,p.life/30); ctx.fillRect(-p.r,-p.r/2.4,p.r*2,p.r*0.8); ctx.restore(); });
  if(parts.length) raf=requestAnimationFrame(tick); else { raf=0; ctx.clearRect(0,0,fxc.width,fxc.height); }
}

/* ---------- мелочи интерфейса ---------- */
var toastT=0;
function toast(msg,bad){ var t=$('#toast'); t.innerHTML='<div class="toast" role="status">'+esc(msg)+'</div>'; if(bad) sfx('bad'); clearTimeout(toastT); toastT=setTimeout(function(){ t.innerHTML=''; },3200); }
function animateNumber(el,from,to,dur,fmt){
  if(!el) return; fmt=fmt||rub;
  if(reduced||from===to||!isFinite(from)){ el.textContent=fmt(to); return; }
  var t0=performance.now();
  (function step(now){ var k=Math.min(1,(now-t0)/dur), e=1-Math.pow(1-k,3); el.textContent=fmt(from+(to-from)*e); if(k<1&&el.isConnected) requestAnimationFrame(step); else el.textContent=fmt(to); })(t0);
}
function openModal(title,html){
  lastFocus=document.activeElement;
  $('#modal').innerHTML='<div class="modal" data-act="modalbg"><div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="mtitle"><div class="modal-head"><h2 id="mtitle">'+title+'</h2><button class="iconbtn" data-act="closemodal" aria-label="Закрыть">'+ico('x')+'</button></div><div>'+html+'</div></div></div>';
  var f=$('#modal .modal-box button, #modal .modal-box textarea'); if(f) f.focus();
}
function closeModal(){ $('#modal').innerHTML=''; if(lastFocus&&lastFocus.focus){ try{ lastFocus.focus({preventScroll:true}); }catch(e){} } }
function isDark(){ var d=document.documentElement.getAttribute('data-theme'); if(d) return d==='dark'; return !!(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches); }
function addTerm(k){ if(k&&S&&S.terms.indexOf(k)<0&&TERMS[k]) S.terms.push(k); }
function termChip(k){ return TERMS[k]?'<button class="chip info" data-act="term" data-k="'+k+'" style="border:0;cursor:pointer;min-height:32px">'+ico('book','sm')+' '+esc(TERMS[k][0])+'</button>':''; }
function glossaryHTML(){
  var keys=Object.keys(TERMS), got=S?S.terms:[], open=keys.filter(function(k){ return got.indexOf(k)>=0; });
  return '<p class="muted">Открыто терминов: <b>'+open.length+'</b> из '+keys.length+'. Новые появляются, когда вы встречаете их в игре.</p>'+(open.length?'<div class="terms">'+open.map(function(k){ return '<div class="termc"><b>'+TERMS[k][0]+'</b><span>'+TERMS[k][1]+'</span></div>'; }).join('')+'</div>':'<div class="termc"><b>Пока пусто</b><span>Первые термины откроются уже в этом месяце.</span></div>');
}
function awardsHTML(){
  var got=(S&&S.ach)||{}, n=ACH.filter(function(a){ return got[a.id]; }).length;
  return '<p class="muted">Получено наград: <b>'+n+'</b> из '+ACH.length+'. Они открываются сами во время игры.</p><div class="awards">'+ACH.map(function(a){ var on=!!got[a.id]; return '<div class="award '+(on?'on':'off')+'"><span class="fico">'+ico(on?a.icon:'lock')+'</span><div><b>'+esc(a.n)+'</b><small>'+esc(a.d)+(on?' · месяц '+got[a.id]:'')+'</small></div></div>'; }).join('')+'</div>';
}
function recipesHTML(){
  var got=S?S.recs:[1];
  return '<p class="muted">В тетради Тамары семь страниц. Открыто: <b>'+got.length+'</b>. Рецепты открываются по сюжету.</p>'+RECIPES.map(function(r){ var on=got.indexOf(r.n)>=0; return '<div class="termc"'+(on?'':' style="opacity:.6"')+'><b>'+(on?'Стр. '+r.n+'. '+esc(r.name):'Страница '+r.n+' (закрыта)')+'</b><span>'+(on?esc(r.note):'Откроется по ходу истории.')+'</span></div>'; }).join('');
}

/* ---------- общие кусочки разметки ---------- */
function bubble(line,i){
  var c=CHARS[line.who]||CHARS.nar, t=sceneText(S||{},line.t);
  if(line.who==='nar') return '<div class="line nar" style="--i:'+i+'"><div class="bubble">'+esc(t)+'</div></div>';
  return '<div class="line '+(line.who==='tamara'?'tamara':'')+'" style="--i:'+i+'">'+avatarSVG(line.who,line.mood,52)+'<div class="grow"><div class="who"><span>'+esc(c.name)+'</span><i>'+esc(c.role)+'</i></div><div class="bubble">'+esc(t)+'</div></div></div>';
}
function card(h,body,opts){ opts=opts||{}; return '<section class="card '+(opts.cls||'')+'"'+(opts.id?' id="'+opts.id+'"':'')+'>'+(h?'<h3>'+(opts.ic?ico(opts.ic):'')+h+'</h3>':'')+(opts.sub?'<p class="sub">'+opts.sub+'</p>':'')+body+'</section>'; }
function coachCard(title,text,btn){ return '<div class="coach" role="note">'+avatarSVG('borsch','happy',46)+'<div><b>'+esc(title)+'</b><p>'+text+'</p>'+(btn||'')+'</div></div>'; }
function pbar(p,cls){ return '<div class="gauge-bar '+(cls||'')+'"><i style="width:'+clamp(p*100,0,100).toFixed(1)+'%"></i></div>'; }

/* ---------- шапка ---------- */
function goalProgress(){ var g=goalNow(S); return clamp(0.5*Math.min(1,Math.max(0,g.cap)/g.needCap)+0.35*Math.min(1,g.cities/g.needCities)+0.15*Math.min(1,g.rating/g.needRating),0,1); }
var hudPrev={};
function hudHTML(){
  var m=Math.min(S.month,TOTAL), act=ACTS[actOf(m)-1], g=goalNow(S), pr=goalProgress(), C=2*Math.PI*19, off=C*(1-pr);
  var rating=networkRating(S)||stars(flagship(S).rep), dots='';
  for(var i=1;i<=TOTAL;i++) dots+='<li class="'+(i<S.month?'done':(i===S.month?'now':''))+(i===8?' lessonend':'')+'"></li>';
  return '<div class="hud-month"><b>'+MONTHS[m-1]+'</b><span>Месяц '+m+' из '+TOTAL+' · '+act.name+'</span></div>'+
   '<div class="hud-stats"><div class="stat cash"><small>Касса</small><b class="num" id="h-cash">'+money(S.cash)+'</b></div><div class="stat cap"><small>Капитал</small><b class="num" id="h-cap">'+rubk(capital(S))+'</b></div><div class="stat"><small>Рейтинг</small><b class="num" id="h-rate">'+f1d(rating)+'</b></div></div>'+
   '<div class="hud-goal"><span class="gt small muted">Путь к цели</span><div class="ring" role="img" aria-label="Прогресс к цели: '+Math.round(pr*100)+'%"><svg viewBox="0 0 46 46"><circle class="bg" cx="23" cy="23" r="19"/><circle class="fg" cx="23" cy="23" r="19" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'"/></svg><b>'+Math.round(pr*100)+'%</b></div></div>'+
   '<ol class="mdots" aria-hidden="true">'+dots+'</ol>';
}
function setHudVar(){ var h=$('#hud'); if(h) document.documentElement.style.setProperty('--hud-h',(h.offsetHeight||0)+'px'); }
function renderHud(){
  var h=$('#hud'); if(!h) return;
  if(!S||U.screen==='title'||U.screen==='intro'||U.screen==='setup'||U.screen==='teacher'||U.screen==='final'){ h.innerHTML=''; h.hidden=true; document.documentElement.style.setProperty('--hud-h','0px'); return; }
  h.hidden=false; var pc=hudPrev.cash; h.innerHTML=hudHTML();
  if(pc!=null && pc!==S.cash) animateNumber($('#h-cash'),pc,S.cash,700);
  hudPrev.cash=S.cash; setHudVar();
}

/* ---------- вкладки ---------- */
var TABS=[
 {id:'home',  n:'Главная',     s:'Главная', ic:'home'},
 {id:'menu',  n:'Меню',        s:'Меню',    ic:'book'},
 {id:'place', n:'Зал и кухня', s:'Кухня',   ic:'toque'},
 {id:'guests',n:'Гости',       s:'Гости',   ic:'people'},
 {id:'money', n:'Деньги',      s:'Деньги',  ic:'coins'},
 {id:'net',   n:'Сеть',        s:'Сеть',    ic:'map', show:function(){ return S.flags.expand||S.outlets.length>1||S.month>=8; }}
];
function allTabs(){ return TABS.filter(function(t){ return !t.show||t.show(); }); }
function bottleneck(r){ if(!r||!r.caps) return null; var c=r.caps, mn=Math.min(c.seat,c.svc,c.kit); return mn===c.seat?'seat':(mn===c.svc?'svc':'kit'); }
function missingCats(){ var o=curO(), have={}; outletDishes(S,o).forEach(function(d){ have[d.cat]=1; }); return CATS.filter(function(c){ return !have[c]; }); }
function tabDot(id){
  if(!S) return false; var o=curO(), r=S.lastR&&S.lastR.outlets.filter(function(x){ return x.id===o.id; })[0];
  if(id==='menu'){ if(S.menu.length<menuSlots(S)&&missingCats().length) return true; return DISHES.some(function(d){ return d.u==='lab'&&!S.lab[d.id]&&S.month>=d.min&&S.cash>labCost(S,d)+60000&&S.month>d.min; })&&false; }
  if(id==='place') return !!(r&&r.utilK>1.0);
  if(id==='guests'){ var b=makeBoard(S); return b.offers.some(function(x){ return x.state==='open'; }); }
  if(id==='money') return S.cash<40000||S.emerg>0;
  if(id==='net') return !!S.flags.expand && !S.seen.netVisited;
  return false;
}
function navHTML(){
  return allTabs().map(function(t){ var on=U.tab===t.id; return '<button class="tab" role="tab" aria-selected="'+on+'" data-act="tab" data-tab="'+t.id+'">'+ico(t.ic)+'<span class="tl"><span class="tl-l">'+t.n+'</span><span class="tl-s">'+t.s+'</span></span>'+(tabDot(t.id)&&!on?'<i class="dot" aria-label="есть что сделать"></i>':'')+'</button>'; }).join('');
}

/* ---------- «Что дальше»: пошаговая подсказка ---------- */
function nextStep(){
  var o=curO(), r=S.lastR&&S.lastR.outlets.filter(function(x){ return x.id===o.id; })[0], pv=U.pv;
  if(S.month===1 && !S.tut.menuSeen) return {tab:'menu', t:'Откройте «Меню». Сейчас в нём 7 блюд из 8 мест. Добавьте салат или десерт, чтобы гостям было из чего выбирать.', b:'Открыть меню'};
  if(S.month===1 && !S.tut.placeSeen) return {tab:'place', t:'Загляните в «Зал и кухню»: проверьте, хватает ли людей и в чём узкое место. Нанять уборщика — самый дешёвый способ поднять рейтинг.', b:'Открыть зал и кухню'};
  if(S.month===1 && !S.tut.guestsSeen) return {tab:'guests', t:'Включите рекламу в «Гостях»: пока про кафе никто не знает, гостей будет мало.', b:'Открыть «Гости»'};
  if(S.month===1 && !S.tut.moneySeen) return {tab:'money', t:'В «Деньгах» видно прогноз месяца и точку безубыточности. Посмотрите, сколько гостей в день нужно кафе.', b:'Открыть «Деньги»'};
  if(S.month<=2 && S.menu.length<menuSlots(S) && missingCats().length) return {tab:'menu', t:'В меню нет категорий: '+missingCats().map(function(c){ return CATN[c].toLowerCase(); }).join(', ')+'. Гости из-за этого уходят.', b:'К меню'};
  if(r && r.utilK>1.05){ var b=bottleneck(r); return {tab:'place', t:'Заведению не хватает '+(b==='seat'?'мест в зале':(b==='svc'?'официантов и баристы':'мощности кухни'))+': гости упираются в очередь. Усильте узкое место.', b:'Усилить'}; }
  if(!Object.keys(o.mk).some(function(k){ return o.mk[k]; })) return {tab:'guests', t:'Реклама выключена. Даже самый вкусный борщ не продастся, если о нём не знают.', b:'Включить рекламу'};
  var b2=makeBoard(S); if(b2.offers.some(function(x){ return x.state==='open'; })) return {tab:'guests', t:'Пришли заказы на банкеты: они дают много выручки сразу, но нагружают кухню.', b:'Посмотреть заказы'};
  if(S.flags.expand && !S.seen.netVisited) return {tab:'net', t:'Карта Тамары открыта! Выберите город для второго заведения во вкладке «Сеть».', b:'Открыть карту'};
  if(S.cash<30000) return {tab:'money', t:'Денег в кассе почти нет. Проверьте прогноз во вкладке «Деньги»: возможно, нужен кредит.', b:'К деньгам'};
  return {tab:null, t:'Всё готово. Если уверены в плане, нажимайте «Запустить месяц». Прогноз ниже подсказывает прибыль.', b:''};
}
function stepOnTab(t){ if(!S) return; S.tut[t+'Seen']=1; if(t==='net') S.seen.netVisited=1; }
