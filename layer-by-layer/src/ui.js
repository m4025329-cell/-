/* ===== Интерфейс «Слоя за слоем»: экраны, действия, сохранение ===== */
(function(){
'use strict';
var KEY='lbl-save-v1', THEME_KEY='lbl-theme', SND_KEY='lbl-sound';
var S=null, U={screen:'title'}, soundOn=false, actx=null, reduced=false, lastFocus=null;
try{ reduced = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }catch(e){}
function $(s,r){ return (r||document).querySelector(s); }
function $$(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); }
function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
function setText(id, t){ var e=document.getElementById(id); if(e && e.textContent!==t) e.textContent=t; }
function sum(a){ return a.reduce(function(x,y){ return x+y; },0); }
function shuffle(a){ for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)), t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
function qTotal(){ return S.quizScore.reduce(function(a,b){ return a+b; },0); }

/* ---------- сохранение ---------- */
function snapshot(strip){
  var u={screen:U.screen, slide:U.slide, stage:U.stage, res:U.res, tab:U.tab, quiz:U.quiz, chapterInfo:U.chapterInfo, calib:U.calib, helpSeen:U.helpSeen, view:U.view, setup:U.setup, seen:U.seen, slicer:U.slicer, slicerDone:U.slicerDone, myq:U.myq};
  if(!strip){ u.report=U.report; u.run=U.run; }
  return {v:1, S:S, U:u};
}
function persist(){ if(S) lsSet(KEY, JSON.stringify(snapshot(false))); }
function readSave(){ try{ var t=lsGet(KEY); if(!t) return null; var d=JSON.parse(t); return (d&&d.S&&typeof d.S.month==='number')?d:null; }catch(e){ return null; } }
function applySave(d){
  S=d.S; U=d.U||{}; U.screen=U.screen||'scene';
  S.clients=S.clients||{}; S.orderStats=S.orderStats||{}; S.flagsMonth=S.flagsMonth||{};
  if(U.screen==='title') U.screen='scene';
  if((U.screen==='report'||U.screen==='run') && !U.report){ U.screen='scene'; U.stage=0; U.res=[]; }
  if(U.screen==='scene' && !U.res) U.res=[];
  if(U.screen==='qc'){ U.screen='scene'; U.stage=0; U.res=[]; U.view=null; }
  if(U.screen==='slicer' && !U.slicer) U.screen='plan';
}
function exportCode(){ try{ return btoa(unescape(encodeURIComponent(JSON.stringify(snapshot(true))))); }catch(e){ return ''; } }
function importCode(code){ try{ var d=JSON.parse(decodeURIComponent(escape(atob(String(code).replace(/\s+/g,''))))); if(d&&d.S&&typeof d.S.month==='number'&&d.S.printers){ applySave(d); return true; } }catch(e){} return false; }
function resultLine(){
  var cap=ownerCapital(S), done=Math.min(S.month-1,TOTAL);
  return S.name+' | мастерская «'+(S.shop||'—')+'» | талант '+(S.talent?TALENTS[S.talent].name:'—')+' | сложность '+DIFFS[S.diff||'norm'].name+(S.code?' | код '+S.code:'')+' | месяц '+done+' из '+TOTAL+' | капитал '+rub(cap)+' | звание «'+titleOf(cap)+'» | вопросы '+qTotal()+'/'+S.quizTotal+' | заказов '+((S.orderStats&&S.orderStats.done)||0)+'/'+((S.orderStats&&S.orderStats.taken)||0);
}

/* ---------- звук (по умолчанию выключен, в классе тише) ---------- */
function tone(freq, dur, delay, type, vol){
  if(!soundOn) return;
  try{
    actx = actx || new (window.AudioContext||window.webkitAudioContext)();
    if(actx.state==='suspended') actx.resume();
    var t=actx.currentTime+(delay||0), o=actx.createOscillator(), g=actx.createGain();
    o.type=type||'triangle'; o.frequency.value=freq; g.gain.setValueAtTime(vol||0.05,t); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t+dur+0.03);
  }catch(e){}
}
function sfx(k){
  if(k==='click') tone(560,0.05,0,'triangle',0.03);
  else if(k==='coin'){ tone(988,0.07,0,'square',0.04); tone(1319,0.16,0.07,'square',0.04); }
  else if(k==='good'){ tone(523,0.1,0,'triangle',0.07); tone(659,0.1,0.1,'triangle',0.07); tone(784,0.2,0.2,'triangle',0.07); }
  else if(k==='bad'){ tone(220,0.18,0,'sawtooth',0.04); tone(165,0.26,0.14,'sawtooth',0.04); }
  else if(k==='win'){ [523,659,784,1047].forEach(function(f,i){ tone(f,0.22,i*0.12,'triangle',0.08); }); }
  else if(k==='print'){ for(var i=0;i<10;i++) tone(110+(i%3)*14,0.07,i*0.28,'square',0.014); }
}

/* ---------- конфетти ---------- */
var parts=[], raf=0, fxc=null;
function burst(n, cx, cy){
  if(reduced) return; fxc = fxc || $('#fx'); if(!fxc) return;
  var w=fxc.width=innerWidth, h=fxc.height=innerHeight, cols=['#FF7A2F','#17B3D6','#E8428C','#62C13A','#7B61F5','#FFFFFF'];
  for(var i=0;i<n;i++){ var a=Math.random()*Math.PI*2, v=4+Math.random()*9;
    parts.push({x:cx==null?w/2:cx, y:cy==null?h*0.38:cy, vx:Math.cos(a)*v, vy:Math.sin(a)*v-6, r:3+Math.random()*4, c:cols[i%cols.length], life:70+Math.random()*50, rot:Math.random()*6}); }
  if(!raf) raf=requestAnimationFrame(tick);
}
function tick(){
  var ctx=fxc.getContext('2d'); ctx.clearRect(0,0,fxc.width,fxc.height);
  parts=parts.filter(function(p){ return p.life>0; });
  parts.forEach(function(p){ p.x+=p.vx; p.y+=p.vy; p.vy+=0.3; p.vx*=0.985; p.life--; p.rot+=0.22;
    ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle=p.c; ctx.globalAlpha=Math.min(1,p.life/30); ctx.fillRect(-p.r,-p.r/2.4,p.r*2,p.r*0.8); ctx.restore(); });
  if(parts.length) raf=requestAnimationFrame(tick); else { raf=0; ctx.clearRect(0,0,fxc.width,fxc.height); }
}

/* ---------- мелочи интерфейса ---------- */
var toastT=0;
function toast(msg){ var t=$('#toast'); t.innerHTML='<div class="toast">'+esc(msg)+'</div>'; clearTimeout(toastT); toastT=setTimeout(function(){ t.innerHTML=''; },2800); }
function animateNumber(el, from, to, dur, fmt){
  if(!el) return; fmt = fmt || rub;
  if(reduced || from===to || !isFinite(from)){ el.textContent=fmt(to); return; }
  var t0=performance.now();
  function step(now){ var k=Math.min(1,(now-t0)/dur), e=1-Math.pow(1-k,3); el.textContent=fmt(from+(to-from)*e); if(k<1 && el.isConnected) requestAnimationFrame(step); else el.textContent=fmt(to); }
  requestAnimationFrame(step);
}
function openModal(title, html, id){
  lastFocus=document.activeElement;
  $('#modal').innerHTML='<div class="modal" data-act="modalbg"><div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="mtitle"><div class="modal-head"><h2 id="mtitle">'+title+'</h2><button class="iconbtn" data-act="closemodal" aria-label="Закрыть">'+ico('x')+'</button></div>'+html+'</div></div>';
  var f=$('#modal .modal-box button, #modal .modal-box textarea'); if(f) f.focus();
}
function closeModal(){ $('#modal').innerHTML=''; if(lastFocus && lastFocus.focus){ try{ lastFocus.focus({preventScroll:true}); }catch(e){} } }
function addTerm(k){ if(k && S.terms.indexOf(k)<0) S.terms.push(k); }
function glossaryHTML(){
  var keys=Object.keys(TERMS), got=S?S.terms:[], open=keys.filter(function(k){ return got.indexOf(k)>=0; }), shut=keys.length-open.length, locks='', i;
  for(i=0;i<shut;i++) locks+='<i aria-hidden="true">'+ico('lock')+'</i>';
  return '<p class="muted">Открыто терминов: '+open.length+' из '+keys.length+'. Новые появляются, когда ты встречаешь их в сюжете.</p>'+
    (open.length ? '<div class="terms">'+open.map(function(k){ return '<div class="termc"><b>'+TERMS[k][0]+'</b><span>'+TERMS[k][1]+'</span></div>'; }).join('')+'</div>'
                 : '<div class="termc empty">'+ico('book')+'<span>Пока пусто. Первые термины откроются уже в этом месяце.</span></div>')+
    (shut ? '<div class="locks">'+locks+'<p class="locks-t">Ещё закрыто: '+shut+'</p></div>' : '');
}
function isDark(){ var d=document.documentElement.getAttribute('data-theme'); if(d) return d==='dark'; return !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches); }

/* ---------- общие кусочки разметки ---------- */
function bubble(line, i, cls){
  var c=CHARS[line.who]||CHARS.nar;
  if(line.who==='nar') return '<div class="line nar" style="--i:'+i+'"><div class="bubble">'+line.t+'</div></div>';
  return '<div class="line '+(cls||'')+'" style="--i:'+i+'">'+avatarSVG(line.who, line.mood, 52)+'<div><div class="who"><span>'+c.name+'</span><i>'+c.role+'</i></div><div class="bubble">'+line.t+'</div></div></div>';
}
function chipsHTML(chips, pop){ return '<div class="chips'+(pop?' pop-in':'')+'">'+chips.map(function(c,i){ return '<span class="chip '+(c.k||'info')+'" style="--i:'+i+'">'+esc(c.t)+'</span>'; }).join('')+'</div>'; }
function stepBack(label){ return '<button class="btn ghost small" data-act="'+label+'">'+ico('left')+' Назад</button>'; }

/* ---------- шапка с показателями ---------- */
var hudPrev={};
function hudHTML(){
  if(!S) return '';
  var after=['report','quiz','chapter','lessonend','final','run'].indexOf(U.screen)>=0;
  var m=clamp(after?S.month-1:S.month,1,TOTAL), ch=CHAPTERS[chapterOf(m)];
  var cap=ownerCapital(S), p=clamp(cap/GOAL,0,1), pips='';
  for(var i=1;i<=TOTAL;i++){ var done=(after?i<=m:i<m), cls=done?'done':(i===m&&!after?'now':''); if(i===9) cls+=' gap'; pips+='<i class="pip '+cls+'" style="height:'+(10+Math.min(8,Math.floor(i/2)))+'px"></i>'; }
  var third = S.loanLeft>0 ? {k:'loan',l:'Долг',v:S.loanLeft,neg:true} : {k:'fin',l:'Вклады и фонд',v:S.savings+S.fund,neg:false};
  var head = U.screen==='final' ? 'Итоги игры' : (MONTH_NAMES[m-1]+' · месяц '+m+' из '+TOTAL);
  var share = S.equity<1 ? '<div class="fil-row"><span>Твоя доля в мастерской: '+Math.round(S.equity*100)+'%</span><span></span></div>' : '';
  return '<div class="hud-card"><div class="hud-top"><div><div class="hud-month">'+head+'</div><div class="hud-sub">Урок '+ch.lesson+' · акт «'+ch.name+'» · '+(S.shop?'«'+esc(S.shop)+'», ':'')+esc(S.name)+'</div></div><div class="pips" role="img" aria-label="Прогресс: пройдено '+(after?m:m-1)+' из '+TOTAL+' месяцев">'+pips+'</div></div>'+
    '<div class="stats"><div class="stat"><b>На счету</b><span class="num" data-k="cash" data-v="'+Math.round(S.cash)+'">'+rub(S.cash)+'</span></div>'+
    '<div class="stat"><b>Часы печати</b><span class="num">'+printerHours(S)+' ч<span class="pcount"> · '+S.printers.length+' '+plural(S.printers.length,'принтер','принтера','принтеров')+'</span></span></div>'+
    '<div class="stat'+(third.neg?' neg':'')+'"><b>'+third.l+'</b><span class="num" data-k="'+third.k+'" data-v="'+Math.round(third.v)+'">'+rub(third.v)+'</span></div>'+
    '<div class="stat"><b>Капитал</b><span class="num" data-k="cap" data-v="'+Math.round(cap)+'">'+rub(cap)+'</span></div></div>'+
    '<div><div class="fil" role="progressbar" aria-label="Путь к цели" aria-valuemin="0" aria-valuemax="'+GOAL+'" aria-valuenow="'+Math.max(0,cap)+'"><i style="width:'+(p*100).toFixed(1)+'%"></i><svg viewBox="0 0 20 24" style="left:'+Math.max(2,p*100).toFixed(1)+'%"><path d="M3 2h14v11l-4 4v5h-6v-5l-4-4z" fill="var(--p-body)"/><path d="M7 17h6v2H7z" fill="var(--p-nozzle)"/><path d="M5 5h10" stroke="var(--brand)" stroke-width="2" stroke-linecap="round"/></svg></div>'+
    '<div class="fil-row"><span>Цель: капитал '+rub(GOAL)+' для технопарка</span><span class="num">'+Math.round(p*100)+'%</span></div>'+share+'</div></div>';
}
function renderHud(){
  var hud=$('#hud'); if(!hud) return;
  hud.innerHTML = (S && U.screen!=='title' && U.screen!=='intro' && U.screen!=='calib' && U.screen!=='setup') ? hudHTML() : '';
  $$('[data-k]',hud).forEach(function(el){ var k=el.getAttribute('data-k'), to=+el.getAttribute('data-v'), from=hudPrev[k]; if(from!=null && from!==to) animateNumber(el, from, to, 700); hudPrev[k]=to; });
}

/* ---------- заставка ---------- */
function titleHTML(){
  var sv=readSave(), cont=!!sv;
  var nm = (S && S.name && S.name!=='Мастер') ? S.name : '';
  return '<section class="hero"><div class="stack-lg"><div><div class="eyebrow">Экономическая игра про 3D-печать</div><h1 id="pagetitle" tabindex="-1">Слой<span>за слоем</span></h1><p class="lead">Школьный кружок закрывают, а в кладовке лежит старый 3D-принтер. Запусти на нём бизнес, пройди 16 месяцев и накопи 1 000 000 ₽ на школьный технопарк. Цена, налоги, кредиты, конкуренты и пожар в мастерской.</p></div>'+
    '<div class="field"><label for="pname">Как тебя зовут?</label><input class="input" id="pname" type="text" maxlength="24" autocomplete="off" placeholder="Например, Алексей" value="'+esc(nm)+'"></div>'+
    '<div class="row"><button class="btn primary" data-act="start" id="startbtn">'+(U.confirmNew?'Стереть и начать заново':'Начать игру')+ico('right')+'</button>'+
    (cont?'<button class="btn" data-act="continue">Продолжить: месяц '+Math.min(sv.S.month,TOTAL)+'</button>':'')+
    '<button class="btn ghost small" data-act="loadcode">'+ico('download')+' Загрузить код</button><button class="btn ghost small" data-act="teacher">'+ico('cap')+' Для учителя</button></div>'+
    (U.confirmNew?'<p class="loss-t">Прошлый прогресс будет удалён. Нажми ещё раз, чтобы подтвердить.</p>':(cont?'<p class="muted">На этом устройстве есть сохранённая игра.</p>':''))+
    '</div><div class="hero-art" aria-hidden="true">'+printerSVG({obj:'stand',working:true,label:'Принтер печатает подставку'})+'</div></section>'+
    '<section class="steps" aria-label="Как играть"><div class="card"><div class="step-n">1</div><h3>Реши</h3><p class="muted">В начале месяца случается сюжетная сцена. Выбери вариант и узнай, чему он учит.</p></div>'+
    '<div class="card"><div class="step-n">2</div><h3>Запланируй</h3><p class="muted">Раздели часы печати между товарами, назначь цены и купи оборудование.</p></div>'+
    '<div class="card"><div class="step-n">3</div><h3>Проверь</h3><p class="muted">Смотри итоги месяца, отвечай на вопросы и строй свою башню слоёв.</p></div></section>'+
    '<section class="acts"><div class="card flat"><div class="eyebrow">Урок 1 · месяцы 1–8</div><ul><li>Акт I «Нулевой слой»: цена, спрос, конкуренция</li><li>Акт II «Каркас»: аренда, налоги, оборудование, риск</li></ul></div>'+
    '<div class="card flat"><div class="eyebrow">Урок 2 · месяцы 9–16</div><ul><li>Акт III «Прочность»: кредит, инфляция, копии, валюта</li><li>Акт IV «Финальные слои»: пожар, гигант, кризис, добрые дела</li></ul></div></section>'+
    '<p class="muted">Игра сохраняется сама после каждого шага. На втором уроке открой её на том же компьютере и нажми «Продолжить».</p>';
}

/* ---------- мини-игра «Контроль качества» ---------- */
var QC_KINDS={crack:'Трещина: слой не спёкся',string:'Паутинка: нити пластика между частями',gap:'Пропущенный слой: недоэкструзия',warp:'Перекос: верх отлип от стола'};
var qcT=0;
function qcStart(){
  var cols=['cyan','orange','magenta','lime'], ks=Object.keys(QC_KINDS), items=[], i;
  for(i=0;i<10;i++){ var bad=Math.random()<0.45; items.push({bad:bad, kind:bad?ks[Math.floor(Math.random()*ks.length)]:'ok', col:cols[Math.floor(Math.random()*cols.length)]}); }
  U.qc={i:-1, items:items, hit:0, miss:0, wrong:0, phase:'intro'}; U.screen='qc'; render();
}
function qcNext(){
  clearTimeout(qcT); var Q=U.qc; Q.i++;
  if(Q.i>=Q.items.length){ Q.phase='done'; render(true); return; }
  Q.phase='play'; Q.fb=''; render(true);
  qcT=setTimeout(function(){ if(U.screen==='qc'&&U.qc.phase==='play') qcAnswer(false,true); },2300);
}
function qcAnswer(sayBad, timeout){
  var Q=U.qc; if(Q.phase!=='play') return; clearTimeout(qcT); var it=Q.items[Q.i];
  if(it.bad && sayBad){ Q.hit++; Q.fb='ok'; sfx('coin'); } else if(!it.bad && !sayBad){ Q.fb='ok'; sfx('click'); } else if(it.bad){ Q.miss++; Q.fb='bad'; sfx('bad'); } else { Q.wrong++; Q.fb='bad'; sfx('bad'); }
  Q.phase='fb'; render(true); qcT=setTimeout(qcNext,timeout?500:750);
}
function qcGrade(){ var Q=U.qc, bads=Q.items.filter(function(x){ return x.bad; }).length, pts=Q.hit-Q.wrong-Q.miss*0.5; return pts>=bads-1?'gold':(pts>=bads*0.5?'silver':'bronze'); }
function qcHTML(){
  var Q=U.qc, h='<section class="card lined stack-lg"><div class="row between"><div><div class="eyebrow">Бонусная мини-игра</div><h1 id="pagetitle" tabindex="-1" style="font-size:clamp(26px,4vw,38px)">Контроль качества</h1></div>'+(Q.phase==='play'||Q.phase==='fb'?'<span class="chip info">Деталь '+(Q.i+1)+' из '+Q.items.length+'</span>':'')+'</div>';
  if(Q.phase==='intro'){
    h+='<div class="dialog">'+bubble(say('phil','excited','Перед отправкой партии проверим каждую деталь. Годную пропускай, бракованную отбрасывай. На каждую у тебя пара секунд!'),0)+'</div>'+
      '<ul class="muted" style="margin:0;padding-left:1.2em">'+Object.keys(QC_KINDS).map(function(k){ return '<li>'+QC_KINDS[k]+'</li>'; }).join('')+'</ul>'+
      '<p class="muted">Клавиши: стрелка влево или Г — годно, стрелка вправо или Б — брак. Успех даёт репутацию и снижает брак в следующем месяце. Если пропустить, ничего не теряется.</p>'+
      '<div class="row"><button class="btn primary" data-act="qcgo">Начать проверку'+ico('play')+'</button><button class="btn ghost" data-act="qcskip">Пропустить</button></div>';
  } else if(Q.phase==='done'){
    var g=qcGrade(), T={gold:['Безупречный контроль','репутация +2, брак −1 п.п. на 2 месяца'],silver:['Хороший контроль','репутация +1'],bronze:['Глаз замылился','репутация без изменений']}[g];
    h+='<div class="callout '+(g==='bronze'?'warn':'ok')+'">'+ico(g==='bronze'?'info':'star')+'<div><b>'+T[0]+'.</b> Найдено брака: '+Q.hit+', пропущено: '+Q.miss+', годных забраковано: '+Q.wrong+'. Награда: '+T[1]+'.</div></div><div><button class="btn primary" data-act="qcend">Дальше'+ico('right')+'</button></div>';
  } else {
    var it=Q.items[Q.i];
    h+='<div class="qcbox '+(Q.fb||'')+'" aria-live="polite">'+qcItemSVG(it.kind,it.col)+(Q.phase==='fb'?'<p class="qcfb">'+(it.bad?QC_KINDS[it.kind]:'Деталь без дефектов')+'</p>':'<div class="qctimer"><i></i></div>')+'</div>'+
      '<div class="row qcbtns"><button class="btn big" data-act="qcgood"'+(Q.phase==='fb'?' disabled':'')+'>'+ico('check')+' Годно</button><button class="btn big danger" data-act="qcbad"'+(Q.phase==='fb'?' disabled':'')+'>'+ico('x')+' Брак</button></div>';
  }
  return h+'</section>';
}

/* ---------- табло класса (для учителя) ---------- */
function parseResults(text){
  return String(text||'').split(/\n+/).map(function(l){
    var parts=l.split('|').map(function(x){ return x.trim(); }); if(parts.length<4) return null;
    var cap=/капитал\s+([\d\s\u00a0\u202f]+)/.exec(l), q=/вопросы\s+(\d+)\/(\d+)/.exec(l); if(!cap) return null;
    function f(k){ var m=new RegExp(k+'\\s+([^|]+)').exec(l); return m?m[1].trim():''; }
    var shop=/мастерская\s+\u00ab([^\u00bb]*)\u00bb/.exec(l), title=/звание\s+\u00ab([^\u00bb]*)\u00bb/.exec(l), mo=/месяц\s+(\d+)/.exec(l);
    return {name:parts[0], shop:shop?shop[1]:'', talent:f('талант'), diff:f('сложность'), month:mo?+mo[1]:0, cap:+cap[1].replace(/[^\d]/g,''), title:title?title[1]:'', q:q?+q[1]:0, qn:q?+q[2]:0};
  }).filter(Boolean).sort(function(a,b){ return b.cap-a.cap; });
}
function teacherHTML(){
  var rows=parseResults(U.board||lsGet('lbl-board')||''), top=rows.slice(0,3), mx=rows.length?Math.max(1,rows[0].cap):1;
  var avg=rows.length?rows.reduce(function(a,r){ return a+r.cap; },0)/rows.length:0, win=rows.filter(function(r){ return r.cap>=GOAL; }).length;
  var tal={}; rows.forEach(function(r){ if(r.talent&&r.talent!=='—') tal[r.talent]=(tal[r.talent]||0)+1; });
  return '<section class="card lined stack-lg"><div class="eyebrow">Для учителя</div><h1 id="pagetitle" tabindex="-1" style="font-size:clamp(28px,4.4vw,42px)">Табло класса</h1>'+
    '<p class="muted">Вставь строки «Результат для учителя», которые прислали ученики, по одной в строке. Табло сохраняется на этом компьютере.</p>'+
    '<div class="field"><label for="boardtxt">Результаты учеников</label><textarea class="input" id="boardtxt" rows="6" placeholder="Алексей | мастерская «Слой&Слой» | талант Инженер | … | капитал 1 013 000 ₽ | …">'+esc(U.board||lsGet('lbl-board')||'')+'</textarea></div>'+
    '<div class="row"><button class="btn primary" data-act="boardgo">Показать табло'+ico('right')+'</button><button class="btn ghost" data-act="boardclear">Очистить</button><button class="btn ghost" data-act="restart">'+ico('left')+' На заставку</button></div></section>'+
    (rows.length?'<section class="card stack"><div class="chips"><span class="chip info">Учеников: '+rows.length+'</span><span class="chip brand">Средний капитал: '+rub(avg)+'</span><span class="chip gain">Дошли до цели: '+win+'</span>'+Object.keys(tal).map(function(k){ return '<span class="chip">'+esc(k)+': '+tal[k]+'</span>'; }).join('')+'</div>'+
      '<div class="podium">'+top.map(function(r,i){ return '<div class="pod p'+(i+1)+'"><b>'+(['1','2','3'][i])+'</b><span>'+esc(r.name)+'</span><small>'+rub(r.cap)+'</small></div>'; }).join('')+'</div>'+
      '<div class="board">'+rows.map(function(r,i){ return '<div class="brow"><span class="bn">'+(i+1)+'</span><span class="bw"><b>'+esc(r.name)+'</b><small>'+esc(r.shop)+(r.talent&&r.talent!=='—'?' · '+esc(r.talent):'')+(r.diff?' · '+esc(r.diff):'')+(r.title?' · '+esc(r.title):'')+'</small><i style="width:'+(r.cap/mx*100).toFixed(1)+'%"></i></span><span class="bv num">'+rub(r.cap)+'</span></div>'; }).join('')+'</div></section>':'');
}

/* ---------- вступление ---------- */
function introSlides(){
  var cash=S?S.cash:START_CASH, fund=Math.max(0,cash-12000);
  return [
  {art:'classroom', title:'Школа №17', lines:[
    say('nar','neutral','Школа №17. Кабинет технологии пахнет пылью и старыми проектами. Кружок закрывают: денег на мастерскую нет уже второй год.'),
    say('sem','sad','Всё списываем. Вот этот принтер ещё из прошлого десятилетия. Не печатает, только ворчит.')]},
  {art:'terminal', title:'Он заговорил', lines:[
    say('phil','excited','Привет! Я Фил, принтер-ассистент. Печатаю слоями, считаю так себе, шучу про пластик. Деньги считать не умею. Научишь?'),
    say('sem','surprised','Он ещё и разговаривает?! Это, наверное, прошивка кружка робототехники. Не удивляйся.')]},
  {art:'path', title:'Условие', lines:[
    say('sem','neutral','Фонд «Технопарк» строит мастерские только в тех школах, которые сами себя кормят. Покажи за 16 месяцев капитал в миллион рублей, и школа получит технопарк.'),
    say('phil','worried','Миллион? Это сколько слоёв? Я посчитал: очень много.')]},
  {art:'coins', title:'Старт', lines:[
    say('nar','neutral','У тебя есть '+rub(cash)+': 12 000 ₽ из копилки'+(fund>0?' и '+rub(fund)+' из школьного фонда':'')+'. Плюс Фил, пластик и шестнадцать месяцев.'),
    say('phil','happy','Для начала нужно откалибровать стол: первый слой всегда решает всё. Это займёт пятнадцать секунд.')]}
  ];
}
function introArt(a){
  if(a==='classroom') return sceneClassroom();
  if(a==='path') return scenePath();
  if(a==='coins') return sceneCoins();
  var t='<div class="stack-lg" style="width:100%;justify-items:center"><div style="display:grid;place-items:center;width:120px">'+avatarSVG('phil','happy',120)+'</div><div class="term" style="width:100%" aria-label="Экран принтера при включении">'+
    '<div style="--i:0">&gt; ЗАГРУЗКА ПРОШИВКИ v0.9</div><div style="--i:1">&gt; проверка сопла ............ <span class="err">ОШИБКА</span></div><div style="--i:2">&gt; проверка стола ........... <span class="err">ОШИБКА</span></div><div style="--i:3">&gt; проверка чувства юмора .... <span class="ok">ОК</span></div><div style="--i:4">&gt; привет, человек!<span class="cursor"></span></div></div></div>';
  return t;
}
function introHTML(){
  var SL=introSlides(), n=U.slide||0, sl=SL[n], last=n===SL.length-1;
  return '<section class="slide"><div class="stack-lg"><div class="row between"><div class="eyebrow">Пролог · '+(n+1)+' из '+SL.length+'</div><div class="dots" aria-hidden="true">'+SL.map(function(_,i){ return '<i class="'+(i===n?'on':'')+'"></i>'; }).join('')+'</div></div>'+
    '<h1 id="pagetitle" tabindex="-1" style="font-size:clamp(28px,4.4vw,42px)">'+sl.title+'</h1><div class="dialog">'+sl.lines.map(function(l,i){ return bubble(l,i); }).join('')+'</div>'+
    '<div class="row">'+(n>0?'<button class="btn" data-act="introprev">'+ico('left')+' Назад</button>':'')+
    (last ? '<button class="btn primary" data-act="tocalib">Откалибровать стол'+ico('right')+'</button><button class="btn ghost" data-act="skipcalib">Сразу к делу</button>' : '<button class="btn primary" data-act="intronext">Дальше'+ico('right')+'</button><button class="btn ghost small" data-act="introskip">Пропустить пролог</button>')+
    '</div></div><div class="slide-art'+(sl.art==='terminal'?' is-term':'')+'" aria-hidden="'+(sl.art==='terminal'?'false':'true')+'">'+introArt(sl.art)+'</div></section>';
}

/* ---------- настройка мастерской ---------- */
function toSetup(){
  U.setup=U.setup||{shop:SHOP_NAMES[Math.floor(Math.random()*SHOP_NAMES.length)], talent:null, diff:'norm', code:''};
  U.screen='setup'; render();
}
function setupHTML(){
  var o=U.setup, d=DIFFS[o.diff], tal=o.talent?TALENTS[o.talent]:null;
  var talents=Object.keys(TALENTS).map(function(k){ var x=TALENTS[k], on=o.talent===k;
    return '<button class="talent" role="radio" aria-checked="'+on+'" data-act="ptalent" data-k="'+k+'"><span class="talent-ico">'+ico(x.icon)+'</span><span><b>'+x.name+'</b><small>'+talentPerk(k)+'</small></span></button>'; }).join('');
  var diffs=Object.keys(DIFFS).map(function(k){ var x=DIFFS[k], on=o.diff===k;
    return '<button role="radio" aria-checked="'+on+'" data-act="pdiff" data-k="'+k+'"><b>'+x.name+'</b><span>'+x.about+'</span></button>'; }).join('');
  return '<section class="setup"><div class="stack-lg"><div><div class="eyebrow">Оформляем кружок как бизнес</div><h1 id="pagetitle" tabindex="-1" style="font-size:clamp(28px,4.4vw,42px)">Создай мастерскую</h1></div>'+
    '<div class="dialog">'+bubble(say('phil','excited','Прежде чем печатать, придумай название, выбери талант и реши, насколько трудной будет игра. Вывеска уже ждёт!'),0)+'</div>'+
    '<div class="field"><label for="shopname">Название мастерской</label><div class="row nowrap"><input class="input" id="shopname" type="text" maxlength="28" autocomplete="off" value="'+esc(o.shop)+'"><button class="btn small" data-act="rname" aria-label="Случайное название">'+ico('dice')+'<span class="hide-s">Случайное</span></button></div></div>'+
    '<div class="field" role="radiogroup" aria-labelledby="tal-h"><div class="lab" id="tal-h">Твой талант</div><div class="talents">'+talents+'</div><p class="muted" style="font-size:14px">Талант открывает особые варианты ответа в нескольких сценах. Попробуй другой в следующий раз.</p></div>'+
    '<div class="field" role="radiogroup" aria-labelledby="dif-h"><div class="lab" id="dif-h">Сложность</div><div class="seg">'+diffs+'</div></div>'+
    '<div class="field"><label for="classcode">Код класса <span class="muted" style="font-weight:500">(необязательно)</span></label><input class="input" id="classcode" type="text" maxlength="16" autocomplete="off" placeholder="Например, 8Б-ПЕЧАТЬ" value="'+esc(o.code)+'"><p class="muted" style="font-size:14px">Если учитель назвал код, введи его. Тогда у всех в классе будут одинаковые события и спрос, и результаты можно честно сравнивать.</p></div>'+
    '<div class="row"><button class="btn" data-act="setupback">'+ico('left')+' Назад</button><button class="btn primary" data-act="setupdone" id="setupgo">Дальше'+ico('right')+'</button></div></div>'+
    '<aside class="setup-prev card lined stack" aria-label="Предпросмотр"><div id="signart">'+signSVG(cleanShopName(o.shop)||'Слой за слоем')+'</div>'+
    '<div class="pstats"><div class="pstat"><b>Стартовый капитал</b><span class="num">'+rub(d.cash)+'</span></div><div class="pstat"><b>Сложность</b><span>'+d.name+'</span></div></div>'+
    (tal?'<div class="callout ok">'+ico(tal.icon)+'<div><b>'+tal.name+'.</b> '+tal.desc+'</div></div>':'<div class="callout">'+ico('info')+'<div>Выбери талант, и здесь появится его описание.</div></div>')+'</aside></section>';
}

/* ---------- калибровка стола ---------- */
function calibMeta(){
  var C=U.calib, q=Math.max(0,1-Math.abs(C.v-C.t)/28);
  return {q:q, cls:q>=0.9?'good':(q>=0.6?'mid':''), txt:q>=0.9?'Идеально ровный первый слой':(C.v>C.t?(q>=0.6?'Слегка высоко: линия тонковата':'Слишком высоко: пластик не прилипает'):(q>=0.6?'Слегка низко: линия раздавлена':'Слишком низко: сопло скребёт по столу'))};
}
function calibHTML(){
  var C=U.calib, m=calibMeta();
  if(C.done){
    var g=C.grade, ttl=g==='perfect'?'Идеальный первый слой!':(g==='good'?'Хороший первый слой':'Кривой первый слой');
    var chips = g==='perfect' ? [chip('репутация +3','gain'),chip('брак −2 п.п. на 2 мес.','gain')] : (g==='good' ? [chip('репутация +1','gain')] : [chip('брак +2 п.п. на 2 мес.','loss')]);
    return '<section class="card lined stack-lg" style="max-width:760px;margin-inline:auto"><div class="eyebrow">Калибровка</div><h1 id="pagetitle" tabindex="-1" style="font-size:clamp(28px,4.4vw,40px)">'+ttl+'</h1><div class="dialog">'+bubble(say('phil', g==='bad'?'sad':'excited', g==='perfect'?'Вот это линия! Ровная, как линейка. Я почти растроган.':(g==='good'?'Неплохо! Для первого раза очень даже. Дальше только практика.':'Ну... бывает. Первый слой всегда кривой. Зато теперь понятно, как это работает.')),0)+'</div>'+chipsHTML(chips,true)+
      '<div><button class="btn primary" data-act="calibdone">К первому месяцу'+ico('right')+'</button></div></section>';
  }
  return '<section class="calib"><div class="stack-lg"><div><div class="eyebrow">Мини-игра · 15 секунд</div><h1 id="pagetitle" tabindex="-1" style="font-size:clamp(28px,4.4vw,42px)">Первый слой</h1></div>'+
    '<div class="dialog">'+bubble(say('phil','neutral','Подвигай ползунок так, чтобы линия пластика легла ровно. Сопло слишком высоко: линия не липнет. Слишком низко: сопло скребёт стол.'),0)+'</div>'+
    '<div class="field"><div class="ctl-head"><label for="calibrange">Высота сопла над столом</label><span class="ctl-val num" id="calibval">'+C.v+'</span></div><div class="ctl-row" style="grid-template-columns:44px minmax(0,1fr) 44px"><button class="step-btn" data-act="calibstep" data-d="-1" aria-label="Ниже">'+ico('minus')+'</button><input type="range" id="calibrange" min="0" max="100" step="1" value="'+C.v+'" aria-describedby="calibtxt"><button class="step-btn" data-act="calibstep" data-d="1" aria-label="Выше">'+ico('plus')+'</button></div></div>'+
    '<div class="field"><div class="ctl-head"><span class="ink2" style="font-weight:600">Качество первого слоя</span><span class="ctl-val num" id="calibq">'+Math.round(m.q*100)+'%</span></div><div class="meter '+m.cls+'" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+Math.round(m.q*100)+'"><i id="calibbar" style="width:'+Math.round(m.q*100)+'%"></i></div><p id="calibtxt" class="muted" aria-live="polite">'+m.txt+'</p></div>'+
    '<div class="row"><button class="btn primary" data-act="calibfix">Зафиксировать'+ico('check')+'</button><button class="btn ghost" data-act="skipcalib">Пропустить</button></div></div>'+
    '<div id="calibart" aria-hidden="true">'+calibSVG(C.v,C.t)+'</div></section>';
}
function calibLive(){
  var C=U.calib, m=calibMeta(); setText('calibval', String(C.v)); setText('calibq', Math.round(m.q*100)+'%'); setText('calibtxt', m.txt);
  var bar=$('#calibbar'); if(bar){ bar.style.width=Math.round(m.q*100)+'%'; bar.parentNode.className='meter '+m.cls; bar.parentNode.setAttribute('aria-valuenow',Math.round(m.q*100)); }
  var art=$('#calibart'); if(art) art.innerHTML=calibSVG(C.v,C.t);
}

/* ---------- сюжетная сцена ---------- */
function sceneView(){
  var st=U.stage||0, key=S.month+':'+st;
  if(U.view && U.view.key===key) return U.view;
  var ev=EVENTS[S.month-1], stages=stagesOf(S), g=stages[st];
  var view={key:key, title:g.mini?g.miniTitle:ev.title, icon:g.mini?g.miniIcon:ev.icon, mini:!!g.mini, n:stages.length, tag:g.tag, term:g.term, lines:g.lines, lesson:fn(g.lesson,S),
    choices:choicesOf(S,g).map(function(c){ var cost=fn(c.cost,S)||0, req=c.req?c.req(S):''; return {label:fn(c.label,S), sub:fn(c.sub,S), cost:cost, why:req, poor:cost>S.cash, talent:c.talent||''}; })};
  /* страховка от тупика: если все варианты недоступны из-за денег, разрешаем взять недостающее в долг */
  var any=view.choices.some(function(c){ return !c.why && !c.poor; });
  if(!any) view.choices.forEach(function(c){ if(!c.why && c.poor){ c.poor=false; c.debt=true; } });
  U.view=view; return view;
}
function sceneHTML(){
  var v=sceneView(), st=U.stage||0, res=(U.res||[])[st], ch=CHAPTERS[chapterOf(S.month)];
  var ev=EVENTS[S.month-1];
  var h='<section class="scene-head"><div class="scene-title"><span class="scene-ico'+(v.mini?' mini':'')+'" aria-hidden="true">'+ico(v.icon||ev.icon||'star')+'</span><div><div class="eyebrow">'+MONTH_NAMES[S.month-1]+' · месяц '+S.month+' · '+(v.mini?'случай в мастерской':'акт «'+ch.name+'»')+'</div><h1 id="pagetitle" tabindex="-1">'+v.title+'</h1></div></div>';
  if(st===0 && !v.mini) h+='<div class="news">'+ico('news')+'<span><b>Новости.</b> '+esc(NEWS[S.month-1])+'</span></div>';
  if(v.n>1) h+='<div class="stagedots"><span class="dots" aria-hidden="true">'+Array.apply(null,Array(v.n)).map(function(_,i){ return '<i class="'+(i===st?'on':'')+'"></i>'; }).join('')+'</span>Сцена '+(st+1)+' из '+v.n+'</div>';
  h+='</section>';
  if(st===0 && S.month===ch.months[0]) h+='<section class="card flat lined"><div class="eyebrow">Акт '+(chapterOf(S.month)+1)+' · '+ch.about+'</div><p style="margin-top:6px;font-size:17px">'+ch.intro+'</p></section>';
  h+='<section class="dialog" aria-label="Диалог">'+v.lines.map(function(l,i){ return bubble(l,i); }).join('')+'</section>';
  h+='<section><div class="eyebrow" style="margin-bottom:10px">'+(res?'Твой выбор':'Что ты решишь?')+'</div><div class="choices" role="group" aria-label="Варианты решения">';
  v.choices.forEach(function(c,i){
    var cls=res?(res.i===i?'picked':'dim'):'', dis=!!(res||c.why||c.poor);
    h+='<button class="choice '+cls+(c.talent?' talent-c':'')+'" data-act="choose" data-i="'+i+'" style="--i:'+i+'"'+(dis?' disabled':'')+'>'+(c.talent?'<span class="tal-tag">'+ico(TALENTS[c.talent].icon)+' Талант: '+TALENTS[c.talent].name+'</span>':'')+'<b>'+c.label+'</b><span>'+c.sub+'</span>'+
       (c.cost>0?'<span class="chip '+(c.poor?'loss':'warn')+' cost">'+(c.debt?'в долг ':'')+'−'+rub(c.cost).replace('−','')+'</span>':'')+
       ((c.why||c.poor)&&!res?'<span class="why">'+(c.why||'Не хватает денег')+'</span>':'')+'</button>';
  });
  h+='</div></section>';
  if(res){
    h+='<section class="card lined stack" aria-live="polite"><div class="eyebrow">Что произошло</div>'+chipsHTML(res.chips,true)+(v.term&&TERMS[v.term]?'<div class="chips"><span class="chip info">'+ico('book')+' Новый термин в словарике: '+TERMS[v.term][0]+'</span></div>':'')+'</section>';
    if(res.reply) h+='<section class="dialog">'+bubble(res.reply,0,'reply')+'</section>';
    h+='<section class="lesson">'+avatarSVG('phil','happy',44)+'<div><b>Урок экономики.</b> '+v.lesson+'</div></section>';
    h+='<div><button class="btn primary" data-act="scenenext">'+(st<v.n-1?'Продолжить':'К планированию месяца')+ico('right')+'</button></div>';
  }
  return h;
}

/* ---------- планирование ---------- */
function prepareMonth(){
  var plan=S.plan; makeBoard(S); goalsFor(S);
  PROD_IDS.forEach(function(id){
    var b=priceBounds(S,id,plan.mode), p=S.month===1||!plan.price[id]?refPrice(S,id):plan.price[id];
    plan.price[id]=clamp(Math.round(p/5)*5,b.min,b.max);
  });
  PROD_IDS.forEach(function(id){ plan.qty[id]=lockQty(S,id); });
  fitCash();
}
function goWarnings(){
  var w=[], b=makeBoard(S), fine=S.contracts.filter(function(c){ return c.fine; });
  if(fine.length && S.plan.mode!=='fine') w.push('<b>Режим печати не «Тонко».</b> Заказ «'+esc(fine[0].label)+'» требует аккуратной печати. Без неё его не примут, а ты заплатишь штраф и потеряешь репутацию.');
  if(S.month<=3 && !S.contracts.length && b.offers.some(function(o){ return o.state==='open'; })) w.push('<b>Пока не принят ни один заказ.</b> Так тоже можно, но загляни во вкладку «Заказы»: там клиенты платят заранее оговорённую цену.');
  return w;
}
function fitCash(){
  var plan=S.plan, g=0;
  while(g++<400){
    var pv=previewMonth(S,plan,1); if(pv.cashNow<=S.cash+0.5) break;
    var worst=null; PROD_IDS.forEach(function(id){ if(plan.qty[id]>lockQty(S,id) && (!worst || plan.qty[id]*PRODUCTS[id].g>plan.qty[worst]*PRODUCTS[worst].g)) worst=id; });
    if(!worst){ if(plan.ad>0){ plan.ad=0; continue; } break; }
    plan.qty[worst]=Math.max(lockQty(S,worst), plan.qty[worst]-Math.max(1,Math.round(plan.qty[worst]*0.1)));
  }
}
var MODNAMES={dem:'спрос',cost:'себестоимость',ref:'привычная цена',fixed:'постоянные расходы',hours:'часы печати',hoursAdd:'часы печати',fail:'брак',disc:'цена продажи',run:'расход на печать',fil:'цена пластика'};
function modsHTML(){
  var seen={}, out=[];
  S.mods.forEach(function(m){
    if(m.k==='hoursAdd'||m.k==='fail'){ } else if(Math.abs(m.m-1)<0.001) return;
    var key=m.k+'|'+m.label+'|'+m.m+'|'+m.left; if(seen[key]) return; seen[key]=1;
    var txt, good;
    if(m.k==='fail'){ txt=(m.m>0?'+':'\u2212')+Math.abs(Math.round(m.m*100))+' п.п.'; good=m.m<0; }
    else if(m.k==='hoursAdd'){ txt=(m.m>0?'+':'\u2212')+Math.abs(m.m)+' ч'; good=m.m>0; }
    else { txt='×'+f1(m.m); good=(m.k==='dem'||m.k==='ref'||m.k==='hours')?m.m>=1:(m.k==='disc'?m.m>=1:m.m<=1); }
    out.push('<span class="chip '+(good?'gain':'loss')+'">'+esc(m.label)+': '+MODNAMES[m.k]+' '+txt+(m.left>50?'':' ('+m.left+' мес.)')+'</span>');
  });
  return out.length?'<div class="chips">'+out.join('')+'</div>':'';
}
function planHTML(){
  var ch=CHAPTERS[chapterOf(S.month)], t=U.tab||'orders', open=openOffers().length;
  var tabs=[['orders','Заказы','doc',open],['biz','Печать','printer',0],['stock','Склад','box',0],['market','Рынок','chart',0],['shop','Развитие','wrench',0],['fin','Финансы','safe',0]];
  var mods=modsHTML();
  var h='<section class="card flat lined stack"><div class="row between"><div><div class="eyebrow">'+MONTH_NAMES[S.month-1]+' · акт «'+ch.name+'»</div><h1 id="pagetitle" tabindex="-1" style="font-size:clamp(26px,4vw,36px)">Планирование месяца</h1></div><button class="btn small" data-act="help">'+ico('info')+' Как это работает</button></div>'+(mods?mods:'')+
    stepsHTML()+'<div class="goals" id="goals-box">'+goalsInner()+'</div></section>';
  h+='<div class="tabs" role="tablist" aria-label="Разделы планирования">'+tabs.map(function(x){ return '<button class="tab" role="tab" data-act="tab" data-t="'+x[0]+'" aria-selected="'+(t===x[0])+'">'+ico(x[2])+'<span>'+x[1]+'</span>'+(x[3]?'<i class="tbadge" aria-hidden="true">'+x[3]+'</i><span class="sr-only"> (новых заказов: '+x[3]+')</span>':'')+'</button>'; }).join('')+'</div>';
  h+=coachHTML(t);
  h+= t==='orders'?ordersHTML():(t==='biz'?bizHTML():(t==='market'?marketHTML():(t==='stock'?stockHTML():(t==='shop'?shopHTML():finHTML()))));
  return h;
}
/* ---------- заказы, рынок, цели месяца ---------- */
function heartsHTML(n){
  var h='';
  for(var i=1;i<=5;i++) h+='<svg class="hrt '+(i<=n?'on':'off')+'" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20s-7.500-4.600-7.500-10A4.300 4.300 0 0 1 12 7.200 4.300 4.300 0 0 1 19.500 10c0 5.400-7.500 10-7.500 10Z"/></svg>';
  return '<span class="hearts" role="img" aria-label="Доверие: '+n+' из 5">'+h+'</span>';
}
function cbadge(id){ var c=CLIENTS[id]; return '<span class="cbadge" style="--cc:var(--c-'+c.col+')">'+ico(c.icon)+'</span>'; }
function bestPerHour(pv){
  var best=0; PROD_IDS.forEach(function(id){ var r=pv.rows[id]; if(r && isAvailable(S,id) && r.perHour>best) best=r.perHour; });
  return best;
}
function openOffers(){ var b=makeBoard(S); return b.offers.filter(function(o){ return o.state==='open'; }); }
function hagglePanel(o){
  var K=KINDS[o.kind];
  return '<div class="hag" role="group" aria-label="Торг"><p><b>Торг.</b> Попроси цену повыше. Чем больше просишь, тем выше риск, что клиент уйдёт совсем. Попытка одна.</p>'+
    '<p class="muted" style="font-size:14px">'+esc(haggleHint(S,o))+'</p><div class="row">'+
    HAGGLE.map(function(h,i){ return '<button class="btn small" data-act="hagp" data-id="'+o.id+'" data-i="'+i+'"><b>'+h.label+'</b> · '+rub(nicePrice(o.base*(1+h.pct)))+'</button>'; }).join('')+
    '<button class="btn ghost small" data-act="hagno">Не торговаться</button></div></div>';
}
function offerCard(o, mph){
  var cl=CLIENTS[o.client], K=KINDS[o.kind], P=PRODUCTS[o.prod], e=orderEcon(S,o), chk=o.state==='open'?orderCheck(S,o):{ok:true,why:''};
  var anon = o.kind==='trap';
  var h='<article class="card offer '+o.state+' k-'+o.kind+'" id="of-'+o.id+'" aria-label="Заказ: '+esc(cl.name)+', '+K.name+'">';
  h+='<header class="of-head">'+cbadge(o.client)+'<div class="of-who"><h3>'+esc(cl.name)+'</h3><div class="of-sub"><span>'+esc(cl.who)+'</span>'+(anon?'':heartsHTML(trustOf(S,o.client)))+'</div></div><span class="chip '+K.chip+'">'+ico(K.icon)+' '+K.name+'</span></header>';
  if(o.state==='gone' || o.state==='declined'){
    h+='<p class="of-text muted">'+(o.state==='gone'?'Клиент ушёл к другой мастерской: торг не удался.':'Заказ отклонён.')+'</p>';
    if(o.msg) h+='<div class="of-msg res-'+o.msg.res+'">'+esc(o.msg.who)+': «'+esc(o.msg.t)+'»</div>';
    if(o.state==='declined' && o.kind==='trap') h+='<div class="callout ok">'+ico('shield')+'<div>'+TRAP_NO+'</div></div>';
    return h+'</article>';
  }
  h+='<p class="of-text">«'+esc(o.text)+'»</p>';
  h+='<div class="of-nums"><div><b>Штук</b><span class="num">'+o.qty+'</span></div><div><b>Цена за штуку</b><span class="num">'+rub(o.price)+'</span>'+(o.price>o.base?'<small class="gain-t">выторговано +'+rub(o.price-o.base)+'</small>':'')+'</div>'+
    '<div><b>Сумма заказа</b><span class="num">'+rub(e.total)+'</span></div><div><b>Печатать</b><span class="num">≈ '+Math.round(e.hours)+' ч</span></div></div>';
  var rel = mph>0 ? e.perHour/mph : 1, ph=Math.round(e.perHour);
  h+='<div class="of-econ"><span>Чистая прибыль ≈ <b class="num '+(e.profit>=0?'gain-t':'loss-t')+'">'+rub(e.profit)+'</b></span><span>за час печати ≈ <b class="num">'+rub(ph)+'</b></span>'+
    '<span class="chip '+(rel>=1.05?'gain':(rel>=0.8?'info':'warn'))+'">'+(rel>=1.05?'выгоднее обычной печати':(rel>=0.8?'почти как обычная печать':'ниже обычной печати: '+Math.round(rel*100)+'%'))+'</span></div>';
  h+='<div class="chips">'+(o.fine?'<span class="chip brand">'+ico('sparkle')+' нужен режим «Тонко»</span>':'')+'<span class="chip">'+ico('warn')+' срыв: штраф '+Math.round(o.pen*100)+'%, репутация −'+o.repLoss+'</span>'+(o.repGain?'<span class="chip gain">репутация +'+o.repGain+'</span>':'')+
    (e.inStock>0?'<span class="chip info">на складе уже '+e.inStock+' шт.</span>':'')+'</div>';
  if(o.state==='taken'){
    h+='<div class="callout ok of-taken">'+ico('check')+'<div><b>Заказ принят.</b> До конца месяца нужно напечатать не меньше '+pcs(o.qty)+' ('+P.short.toLowerCase()+'). Они уже вписаны во вкладку «Печать».</div></div>'+
      '<div class="of-actions"><button class="btn ghost small" data-act="odrop" data-id="'+o.id+'">Передумать</button></div>';
    return h+'</article>';
  }
  if(o.msg) h+='<div class="of-msg res-'+o.msg.res+'">'+esc(o.msg.who)+': «'+esc(o.msg.t)+'»</div>';
  if(U.hag===o.id){ h+=hagglePanel(o); return h+'</article>'; }
  h+='<div class="of-actions"><button class="btn primary small" data-act="oacc" data-id="'+o.id+'"'+(chk.ok?'':' disabled aria-describedby="why-'+o.id+'"')+'>Принять заказ</button>'+
    (!o.tried && o.kind!=='charity' ? '<button class="btn small" data-act="ohag" data-id="'+o.id+'">'+ico('percent')+' Торговаться</button>' : '')+
    '<button class="btn ghost small" data-act="ono" data-id="'+o.id+'">Отказаться</button></div>';
  if(!chk.ok) h+='<p class="of-why" id="why-'+o.id+'">'+ico('lock')+' '+esc(chk.why)+'</p>';
  return h+'</article>';
}
function coachHTML(t){
  var m=S.month, txt={
    orders:'<b>Здесь клиенты приходят с готовой сделкой:</b> сколько штук и по какой цене. Деньги получишь наверняка, но напечатать нужно всё, иначе штраф и потеря репутации. Сравни «прибыль за час» заказа с обычной печатью и бери то, что выгоднее. Потом переходи во вкладку «Печать».',
    biz:'<b>Здесь решаешь, что печатать.</b> Для каждого товара выбери цену и количество. Часы печати ограничены, смотри на полоску справа. Принятые заказы уже вписаны, их меньше напечатать нельзя. Когда всё готово, жми «Запустить печать».',
    market:'<b>Здесь видно, как меняется спрос в течение года.</b> Перед праздниками покупают больше, летом меньше. Планируй печать заранее, а не когда спрос уже упал.',
    stock:'<b>Здесь склад.</b> Пластик можно закупать заранее, когда он дешёвый, но большой запас отсыреет. Готовые изделия, которые не продались, лежат здесь и дешевеют: их можно распродать оптом.',
    shop:'<b>Здесь развитие мастерской:</b> лаборатория с исследованиями, принтеры, помощники и помещение. Каждая покупка должна окупиться: смотри на подсказки «окупится за».',
    fin:'<b>Здесь деньги работают на тебя:</b> налоги, вклады и кредиты. Пока можно ничего не трогать, но к середине игры эти настройки сильно влияют на итог.'}[t];
  if(!txt || m>(t==='orders'||t==='biz'?3:2)) return '';
  return '<div class="callout coach">'+avatarSVG('phil','happy',40)+'<div>'+txt+'</div></div>';
}
function ordersHTML(){
  var b=makeBoard(S), pv=previewMonth(S,S.plan,1), mph=bestPerHour(pv), L=lockLoad(S), H=printerHours(S), ev=S.contracts.filter(function(c){ return !c.oid; });
  var taken=b.offers.filter(function(o){ return o.state==='taken'; }), rev=0; S.contracts.forEach(function(c){ rev+=c.qty*c.price; });
  var h='<section class="card lined stack"><div class="row between"><div><div class="eyebrow">Доска заказов · '+MONTH_NAMES[S.month-1]+'</div><h2 style="font-size:22px">Предложения клиентов</h2></div>'+
    '<span class="chip '+(S.contracts.length?'brand':'')+'">'+ico('doc')+' принято: '+S.contracts.length+'</span></div>'+
    '<div class="ctl-head"><span class="muted">Часы печати, занятые заказами</span><span class="num"><b>'+Math.round(L.hours)+'</b> из '+H+' ч</span></div>'+
    '<div class="hbar" role="img" aria-label="Заказы занимают '+Math.round(L.hours)+' часов из '+H+'"><i style="width:'+Math.min(100,L.hours/Math.max(1,H)*100).toFixed(1)+'%;background:var(--brand)"></i></div>'+
    '<p class="muted" style="font-size:14.5px">'+(S.contracts.length?'Выручка по принятым заказам ≈ <b class="num">'+rub(rev)+'</b>. Оставшиеся часы пойдут на обычные товары.':'Пока ни одного заказа. Обычные товары продаются сами, но заказы дают уверенность в продаже.')+'</p>'+
    '<details class="how"><summary>'+ico('info')+' Как выбрать выгодный заказ</summary><ul><li><b>Прибыль за час.</b> Часов печати мало. Заказ выгоден, если за час приносит не меньше, чем обычная печать (сейчас лучший обычный товар даёт ≈ '+rub(Math.round(mph))+' в час).</li>'+
    '<li><b>Штраф.</b> Не уверен, что хватит часов или денег? Лучше откажись: срыв стоит денег и репутации.</li><li><b>Торг.</b> Можно попросить больше, но жадность рискованна: клиент может уйти совсем.</li><li><b>Доверие.</b> Каждый выполненный заказ добавляет клиенту сердце: он платит больше и торгуется охотнее. Срыв отнимает два сердца.</li></ul></details></section>';
  if(ev.length) h+='<section class="callout warn">'+ico('doc')+'<div><b>Обязательные заказы по договору.</b> '+ev.map(function(c){ return esc(c.label)+' по '+rub(c.price)+', штраф '+Math.round(c.penalty*100)+'%'; }).join('; ')+'.</div></section>';
  if(S.contracts.some(function(c){ return c.fine; }) && S.plan.mode!=='fine') h+='<section class="callout bad">'+ico('warn')+'<div><b>Режим печати не «Тонко».</b> Принят заказ, где нужна аккуратная печать. Без этого режима он будет сорван.<div style="margin-top:8px"><button class="btn small" data-act="mode" data-m="fine">Включить «Тонко»</button></div></div></section>';
  if(b.offers.length){
    h+='<div class="offers">'+b.offers.map(function(o){ return offerCard(o,mph); }).join('')+'</div>';
  } else h+='<section class="card flat"><p class="muted">В этом месяце никто не позвонил. Заказы появятся, когда о мастерской узнают больше людей.</p></section>';
  /* клиенты */
  var ids=Object.keys(S.clients||{}).filter(function(k){ return CLIENTS[k] && (S.clients[k].done||S.clients[k].failed||S.clients[k].trust); });
  h+='<section class="card stack"><h3>Мои клиенты</h3>'+(ids.length?'<ul class="cl-list">'+ids.map(function(k){ var c=S.clients[k], cl=CLIENTS[k]; return '<li>'+cbadge(k)+'<div><b>'+esc(cl.name)+'</b><span class="muted">выполнено '+c.done+', сорвано '+c.failed+' · '+clientNote(k)+'</span></div>'+heartsHTML(c.trust)+'</li>'; }).join('')+'</ul>':'<p class="muted">Здесь появятся клиенты, с которыми уже выполнены заказы. Сердца показывают доверие: чем их больше, тем выгоднее цены.</p>')+'</section>';
  h+='<div class="row"><button class="btn primary" data-act="tab" data-t="biz">Дальше: спланировать печать'+ico('right')+'</button></div>';
  return h;
}
function marketHTML(){
  var m=S.month, plan=S.plan, rows='', top=null, up=null, down=null;
  PROD_IDS.forEach(function(id){
    var sea=SEASON[id], now=sea[m-1], nxt=sea[Math.min(TOTAL-1,m)], P=PRODUCTS[id], av=S.unlocked[id];
    var mn=0.6, mx=1.7, pts=sea.map(function(v,i){ return (6+i*(168/15)).toFixed(1)+','+(34-(v-mn)/(mx-mn)*28).toFixed(1); }).join(' ');
    var cx=6+(m-1)*(168/15), cy=34-(now-mn)/(mx-mn)*28;
    var dem=av?Math.round(demandAt(S,id,refPrice(S,id),plan,1)):0, d=nxt-now;
    if(av){ if(!top||now>top.v) top={id:id,v:now}; if(!up||d>up.v) up={id:id,v:d}; if(!down||d<down.v) down={id:id,v:d}; }
    rows+='<div class="mrow'+(av?'':' off')+'"><div class="mprod">'+productSVG(id,34)+'<div><b>'+P.short+'</b><span class="k">'+(av?'спрос по рыночной цене ≈ '+dem+' шт.':'пока недоступно')+'</span></div></div>'+
      '<svg class="spark" viewBox="0 0 180 40" role="img" aria-label="Сезонный спрос по месяцам, сейчас ×'+f1(now)+'"><polyline points="'+pts+'" fill="none" stroke="var(--c-'+PCOL[id]+')" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="'+cx.toFixed(1)+'" cy="'+cy.toFixed(1)+'" r="4.5" fill="var(--brand)" stroke="var(--surface)" stroke-width="2"/></svg>'+
      '<div class="mnow"><span class="chip '+(now>=1.1?'gain':(now<=0.9?'loss':'info'))+'">сейчас ×'+f1(now)+'</span><span class="k">дальше ×'+f1(nxt)+' '+(d>0.04?'↑':(d<-0.04?'↓':'→'))+'</span></div></div>';
  });
  var adv=[]; if(top) adv.push('Сильнее всего сейчас спрос на «'+PRODUCTS[top.id].short.toLowerCase()+'» (×'+f1(top.v)+').');
  if(up && up.v>0.04) adv.push('В следующем месяце вырастет спрос на «'+PRODUCTS[up.id].short.toLowerCase()+'»: можно успеть напечатать запас.');
  if(down && down.v<-0.04) adv.push('Спрос на «'+PRODUCTS[down.id].short.toLowerCase()+'» просядет: не печатай больше, чем продашь сейчас.');
  var repM=1+S.rep*0.010, adM=adMult(S,plan.ad), qM=Math.pow(MODES[plan.mode].q,PRODUCTS.key.qs), chM=channelMult(S), evM=modProd(S,'dem','key')*S.pdm.key;
  function fac(name,v,why){ return '<div class="fac"><b>'+name+'</b><span class="num '+(v>1.005?'gain-t':(v<0.995?'loss-t':''))+'">×'+f1(v)+'</span><small class="muted">'+why+'</small></div>'; }
  var h='<section class="card stack"><div><div class="eyebrow">Сезонность</div><h2 style="font-size:22px">Спрос по месяцам</h2></div><p class="muted">Линия показывает, как спрос меняется за 16 месяцев. Оранжевая точка это текущий месяц, множитель — на сколько спрос выше или ниже обычного.</p><div class="mrows">'+rows+'</div>'+
    (adv.length?'<div class="callout tip">'+avatarSVG('phil','happy',40)+'<div><b>Совет Фила.</b> '+adv.join(' ')+'</div></div>':'')+'</section>';
  h+='<section class="card stack"><div><div class="eyebrow">Что влияет на спрос</div><h2 style="font-size:22px">Из чего складывается спрос</h2></div><div class="facs">'+
    fac('Репутация',repM,'сейчас '+Math.round(S.rep)+' из 100')+fac('Реклама',adM,ADS[plan.ad].name.toLowerCase())+fac('Качество печати',qM,MODES[plan.mode].name.toLowerCase())+fac('Каналы продаж',chM,(S.channel.market||S.channel.site)?'подключены':'пока свои')+fac('События и модели',evM,'сюжет и качество моделей')+'</div>'+
    '<p class="muted" style="font-size:14.5px">Пластик сейчас стоит ≈ '+rub(filMarket(S))+' за кг, а запас у тебя обошёлся в ≈ '+rub(S.fil.kg>0?S.fil.val/S.fil.kg:0)+' за кг. '+(S.rate&&S.rate.u?'Рейтинг мастерской: '+f1d(S.rate.s/S.rate.u)+' из 5.':'')+'</p></section>';
  h+='<div class="row"><button class="btn primary" data-act="tab" data-t="biz">К печати'+ico('right')+'</button></div>';
  return h;
}
function goalsList(){
  var gs=goalsFor(S), pv=previewMonth(S,S.plan,1);
  return gs.list.map(function(g){ var G=GOAL_BY_ID[g.id], ok=false; try{ ok=!!G.test(S,pv,g); }catch(e){} return {text:G.text(g), ok:ok, hint:G.hint}; });
}
function goalsInner(){
  var l=goalsList(), n=l.filter(function(x){ return x.ok; }).length;
  return '<div class="row between"><b class="goals-h">'+ico('target')+' Цели месяца</b><span class="chip brand">+'+rub(GOAL_REWARD)+' за каждую, +'+rub(GOAL_BONUS)+' за все</span></div>'+
    '<ul class="goals-l">'+l.map(function(x){ return '<li class="'+(x.ok?'ok':'')+'"><span class="gbox" aria-hidden="true">'+(x.ok?ico('check'):'')+'</span><span>'+esc(x.text)+(x.ok?' <span class="sr-only">(по прогнозу выполнена)</span>':'')+'</span></li>'; }).join('')+'</ul>'+
    '<p class="muted" style="font-size:13px">Отмечено то, что выполняется при текущем плане. Итог будет после печати.</p>';
}
function stepsInner(){
  var tu=tutorialState();
  if(tu.active){
    var cur=-1; tu.steps.forEach(function(x,i){ if(cur<0&&!x.done) cur=i; });
    return '<div class="tut"><div class="eyebrow">Обучение · первый месяц</div><ol>'+tu.steps.map(function(x,i){ return '<li class="'+(x.done?'done':(i===cur?'now':''))+'"><span class="tn">'+(x.done?ico('check'):(i+1))+'</span><span>'+x.t+'</span></li>'; }).join('')+'</ol></div>';
  }
  if(S.month>4) return '';
  var b=makeBoard(S), resolved=b.offers.every(function(o){ return o.state!=='open'; }), seen=U.seen||{};
  var st=[['orders','Заказы',resolved||!!seen.deal],['biz','Печать',!!seen.biz],['go','Запуск',false]], cur2=-1;
  st.forEach(function(x,i){ if(cur2<0 && !x[2]) cur2=i; });
  return '<ol class="track" aria-label="Порядок действий в месяце">'+st.map(function(x,i){ return '<li class="'+(x[2]?'done':(i===cur2?'now':''))+'"><span class="tn">'+(x[2]?ico('check'):(i+1))+'</span>'+x[1]+'</li>'; }).join('')+'</ol>';
}
function stepsHTML(){ return '<div id="steps-box">'+stepsInner()+'</div>'; }
/* ---------- склад и лаборатория ---------- */
function filChartSVG(){
  var h=S.filHist||[1], n=h.length, mn=Math.min.apply(null,h.concat([0.9])), mx=Math.max.apply(null,h.concat([1.2])), W=300, H=90, pad=8;
  function X(i){ return pad+(n>1?i*(W-2*pad)/(n-1):0); } function Y(v){ return H-pad-(v-mn)/(mx-mn)*(H-2*pad); }
  var pts=h.map(function(v,i){ return X(i).toFixed(1)+','+Y(v).toFixed(1); }).join(' '), avg=h.reduce(function(a,b){ return a+b; },0)/n;
  return '<svg class="fchart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Цена пластика по месяцам: сейчас '+rub(filMarket(S))+' за кг"><line x1="'+pad+'" x2="'+(W-pad)+'" y1="'+Y(avg).toFixed(1)+'" y2="'+Y(avg).toFixed(1)+'" stroke="var(--edge-strong)" stroke-dasharray="4 4"/><polyline points="'+pts+'" fill="none" stroke="var(--c-cyan)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><circle cx="'+X(n-1).toFixed(1)+'" cy="'+Y(h[n-1]).toFixed(1)+'" r="5.5" fill="var(--brand)" stroke="var(--surface)" stroke-width="2"/></svg>';
}
function stockHTML(){
  var pv=previewMonth(S,S.plan,1), tr=filTrend(S), avgp=S.fil.kg>0?S.fil.val/S.fil.kg:0, mk=filMarket(S);
  var msg = tr.rel<0.97 ? 'Пластик сейчас дешевле обычного: хороший момент купить впрок.' : (tr.rel>1.04 ? 'Пластик дороже обычного: закупай только то, что нужно в этом месяце.' : 'Цена близка к обычной: можно брать по потребности.');
  var h='<section class="card lined stack"><div class="row between"><div><div class="eyebrow">Сырьё</div><h2 style="font-size:22px">Склад пластика</h2></div><span class="chip '+(S.fil.kg>FIL_WET?'warn':'info')+'">'+ico('box')+' '+f1d(S.fil.kg)+' из '+FIL_MAX+' кг</span></div>'+
    '<div class="two" style="gap:14px"><div class="stack"><div class="pstats"><div class="pstat"><b>Цена сейчас</b><span class="num">'+rub(mk)+' за кг</span></div><div class="pstat"><b>Твой запас обошёлся</b><span class="num">'+(S.fil.kg>0?rub(avgp)+' за кг':'—')+'</span></div><div class="pstat"><b>Нужно в этом месяце</b><span class="num">'+f1d(pv.kg)+' кг</span></div><div class="pstat"><b>Докупится само</b><span class="num">'+(pv.buyKg>0.05?f1d(pv.buyKg)+' кг по '+rub(mk):'не нужно')+'</span></div></div></div>'+
    '<div class="stack"><div class="ctl-head"><span class="muted">Цена пластика по месяцам</span></div>'+filChartSVG()+'<p class="muted" style="font-size:14px">'+msg+'</p></div></div>'+
    (S.fil.kg>FIL_WET?'<div class="callout warn">'+ico('warn')+'<div><b>Запас больше '+FIL_WET+' кг.</b> Пластик впитывает влагу из воздуха, и печать получается хуже. В конце месяца брак вырастет на 2 п.п.</div></div>':'')+'</section>';
  h+='<section class="stack"><div class="row between"><h2 style="font-size:22px">Закупка пластика</h2><span class="muted" style="font-size:14px">Деньги спишутся сразу, а килограммы пойдут в печать</span></div><div class="grid-auto">';
  Object.keys(SUPPLIERS).forEach(function(k){
    var sp=SUPPLIERS[k], pr=filPrice(S,k);
    h+='<article class="card upg"><header><span class="cbadge" style="--cc:var(--c-'+(k==='opt'?'orange':(k==='eco'?'lime':'cyan'))+')">'+ico(sp.icon)+'</span><div><h3>'+sp.name+'</h3><p class="muted">'+sp.about+'</p></div></header><div class="chips"><span class="chip">'+rub(pr)+' за кг</span></div><div class="row">'+
      [5,10,20].map(function(kg){ var c=canBuyFil(S,kg,k); return '<button class="btn small" data-act="fbuy" data-sup="'+k+'" data-kg="'+kg+'"'+(c.ok?'':' disabled title="'+esc(c.why)+'"')+'>+'+kg+' кг · '+rub(kg*pr)+'</button>'; }).join('')+'</div></article>';
  });
  h+='</div></section>';
  var rows=PROD_IDS.filter(function(id){ return S.unlocked[id]; }).map(function(id){
    var n=Math.round(S.inv[id]), v=S.invVal[id], keep=v*(STORAGE_RATE+OBSOLETE_RATE);
    return '<div class="srow"><div class="mprod">'+productSVG(id,34)+'<div><b>'+PRODUCTS[id].short+'</b><span class="k">'+(n?n+' шт. · на '+rub(v):'склад пуст')+'</span></div></div><div class="k">'+(n?'хранение и устаревание ≈ '+rub(keep)+' в месяц':'')+'</div><div>'+(n?'<button class="btn small" data-act="liq" data-id="'+id+'">Распродать оптом за '+rub(liquidateValue(S,id))+'</button>':'')+'</div></div>';
  }).join('');
  h+='<section class="card stack"><div><div class="eyebrow">Готовая продукция</div><h2 style="font-size:22px">Склад изделий</h2></div><p class="muted">Всё, что напечатано, но не продано, лежит здесь и каждый месяц теряет в цене. Оптовик заберёт остатки сразу, но заплатит '+Math.round(LIQ_RATE*100)+'% от их стоимости.</p><div class="srows">'+rows+'</div></section>';
  h+='<div class="row"><button class="btn primary" data-act="tab" data-t="biz">К печати'+ico('right')+'</button></div>';
  return h;
}
function labHTML(){
  var L=labOf(S), slots=labSlots(S), h='<section class="stack"><div class="row between"><div><div class="eyebrow">Долгая игра</div><h2 style="font-size:22px">Лаборатория</h2></div><span class="chip '+(L.active.length>=slots?'warn':'info')+'">'+ico('wrench')+' идёт '+L.active.length+' из '+slots+'</span></div>'+
    '<div class="callout">'+ico('info')+'<div>Исследование стоит денег сейчас, а выгоду даёт через несколько месяцев и потом остаётся навсегда. Это вложение в будущее: чем раньше, тем дольше окупается. В лаборатории идёт одно исследование, в гараже можно два.</div></div>';
  if(L.active.length) h+='<div class="grid-auto">'+L.active.map(function(a){ var r=RESEARCH_BY_ID[a.id]; return '<article class="card upg owned"><div><h3>'+ico(r.icon)+' '+r.name+'</h3><p class="muted">Идёт исследование</p></div><div class="hbar" role="img" aria-label="Готово на '+Math.round((a.total-a.left)/a.total*100)+'%"><i style="width:'+((a.total-a.left)/a.total*100)+'%;background:var(--brand)"></i></div><span class="chip brand">осталось '+a.left+' '+plural(a.left,'месяц','месяца','месяцев')+'</span></article>'; }).join('')+'</div>';
  h+='<div class="grid-auto">'+RESEARCH.map(function(r){
    var done=L.done[r.id], act=L.active.some(function(a){ return a.id===r.id; }), c=canResearch(S,r.id);
    if(done||act) return '';
    return '<article class="card upg"><header><span class="cbadge" style="--cc:var(--c-violet)">'+ico(r.icon)+'</span><div><h3>'+r.name+'</h3><p class="muted">'+r.text+'</p></div></header><div class="chips"><span class="chip gain">'+r.effect+'</span><span class="chip">'+rub(r.cost)+'</span><span class="chip info">'+ico('clock')+' '+r.months+' '+plural(r.months,'месяц','месяца','месяцев')+'</span></div>'+
      '<button class="btn small" data-act="research" data-id="'+r.id+'"'+(c.ok?'':' disabled')+'>Начать исследование</button>'+(c.ok?'':'<span class="loss-t" style="font-size:13.5px;font-weight:600">'+c.why+'</span>')+'</article>';
  }).join('')+'</div>';
  var d=RESEARCH.filter(function(r){ return L.done[r.id]; });
  if(d.length) h+='<div class="chips">'+d.map(function(r){ return '<span class="chip gain">'+ico('check')+' '+r.name+': '+r.effect+'</span>'; }).join('')+'</div>';
  return h+'</section>';
}
/* ---------- мини-игра «Слайсер» ---------- */
function slicerSVG(set, tg, tiny){
  var res=slicerCheck(tg,set), T=res[0], V=res[1], F=res[2], W=200, H=170, out='', i, y;
  function tower(x0, wob){
    var s='';
    for(i=0;i<16;i++){ y=148-i*6.4; var o=wob?Math.sin(i*1.7+x0)*wob:0; s+='<rect x="'+(x0+o).toFixed(1)+'" y="'+y.toFixed(1)+'" width="38" height="6.6" rx="1.5" fill="var(--c-cyan)" stroke="var(--surface)" stroke-width="0.8" opacity="'+(0.78+0.22*(i%2)).toFixed(2)+'"/>'; }
    return s;
  }
  out+='<rect x="10" y="148" width="180" height="8" rx="3" fill="var(--p-plate)"/>';
  var wob = V.dir>0 && !V.ok ? 1+V.power*4 : 0;
  out+=tower(34,wob)+tower(128,wob);
  /* горячо: нити между башнями */
  if(T.dir>0 && !T.ok){ var n=Math.round(2+T.power*5); for(i=0;i<n;i++){ var yy=60+i*(80/n); out+='<path d="M72 '+yy.toFixed(1)+' Q100 '+(yy+8+(i%3)*4).toFixed(1)+' 128 '+(yy+(i%2)*3).toFixed(1)+'" stroke="var(--ink-2)" stroke-width="1.2" fill="none" opacity=".7"/>'; } }
  /* холодно: тёмные щели в слоях */
  if(T.dir<0 && !T.ok){ var g=Math.round(2+T.power*5); for(i=0;i<g;i++){ var gy=62+((i*37)%80); out+='<rect x="'+(i%2?34:128)+'" y="'+gy+'" width="38" height="2.2" fill="var(--surface)"/><rect x="'+(i%2?128:34)+'" y="'+(gy+14)+'" width="38" height="2.2" fill="var(--surface)"/>'; } }
  /* медленно: капли */
  if(V.dir<0 && !V.ok){ var b=Math.round(3+V.power*6); for(i=0;i<b;i++){ out+='<circle cx="'+((i%2?34:128)+((i*17)%38)).toFixed(1)+'" cy="'+(60+((i*29)%80))+'" r="'+(2+(i%3)).toFixed(1)+'" fill="var(--brand)" opacity=".85"/>'; } }
  /* редкое заполнение: провалы сверху; плотное: ничего, только подпись */
  if(F.dir<0 && !F.ok){ var d=3+F.power*8; out+='<path d="M34 52 Q53 '+(52+d).toFixed(1)+' 72 52" stroke="var(--surface)" stroke-width="3" fill="none"/><path d="M128 52 Q147 '+(52+d).toFixed(1)+' 166 52" stroke="var(--surface)" stroke-width="3" fill="none"/>'; }
  var perfect=res.every(function(x){ return x.ok; });
  if(perfect) out+='<path d="M92 24l5 9 10 1-7.500 7 2 10-9.500-5-9.500 5 2-10-7.500-7 10-1 5-9Z" fill="var(--brand)" transform="translate(-3 -6)"/>';
  return '<svg class="slsvg'+(tiny?' tiny':'')+'" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Результат пробной печати: '+res.map(slicerWord).join(' ')+'">'+out+'</svg>';
}
function slicerHTML(){
  var Z=U.slicer, tg=Z.target, order=S.contracts.filter(function(c){ return c.fine||c.kind==='rush'; })[0];
  var h='<section class="card lined stack-lg"><div class="row" style="align-items:flex-start;gap:14px">'+avatarSVG('phil','excited',56)+'<div class="stack" style="flex:1;min-width:0"><div class="eyebrow">Настройка слайсера</div><h1 id="pagetitle" tabindex="-1" style="font-size:clamp(26px,4vw,38px)">Подбери настройки печати</h1>'+
    '<p class="muted">Для заказа «'+esc(order?order.label:'')+'» нужна аккуратная печать. У каждой детали свои идеальные настройки. Сделай пробную печать и посмотри, что получилось. Пробных печатей: '+SLICER_TRIES+'.</p></div></div>';
  h+='<div class="two" style="align-items:start"><div class="stack"><div class="slbox">'+(Z.tries.length?slicerSVG(Z.tries[Z.tries.length-1].set,tg):'<div class="slempty">'+ico('printer')+'<span>Пока ничего не напечатано. Выбери настройки и нажми «Пробная печать».</span></div>')+'</div>'+
    (Z.tries.length?'<ul class="slres">'+slicerCheck(tg,Z.tries[Z.tries.length-1].set).map(function(x){ return '<li class="'+(x.ok?'ok':'bad')+'">'+ico(x.ok?'check':'warn')+'<span>'+slicerWord(x)+'</span></li>'; }).join('')+'</ul>':'')+'</div>';
  h+='<div class="stack">';
  ['t','v','f'].forEach(function(k){
    var R=SLICER_RANGE[k];
    h+='<div class="ctl"><div class="ctl-head"><label for="sl-'+k+'">'+R.name+'</label><span class="ctl-val num" id="slv-'+k+'">'+Z[k]+' '+R.unit+'</span></div><div class="ctl-row"><button class="step-btn" data-act="slstep" data-k="'+k+'" data-d="-'+R.step+'" aria-label="'+R.name+': меньше">'+ico('minus')+'</button>'+
      '<input type="range" id="sl-'+k+'" data-sl="'+k+'" min="'+R.min+'" max="'+R.max+'" step="'+R.step+'" value="'+Z[k]+'" aria-valuetext="'+Z[k]+' '+R.unit+'"><button class="step-btn" data-act="slstep" data-k="'+k+'" data-d="'+R.step+'" aria-label="'+R.name+': больше">'+ico('plus')+'</button></div><div class="scale num"><span>'+R.min+'</span><span>'+R.max+' '+R.unit+'</span></div></div>';
  });
  h+='<div class="callout">'+ico('info')+'<div>Температура влияет на текучесть пластика, скорость на ровность стенок, заполнение на прочность и расход. Ошибка в одном параметре портит всю деталь.</div></div>'+
    '<div class="row"><button class="btn" data-act="sltry"'+(Z.left>0?'':' disabled')+'>'+ico('printer')+' Пробная печать (осталось '+Z.left+')</button><button class="btn primary" data-act="slfinal">Печатать заказ с этими настройками'+ico('right')+'</button></div>'+
    '<button class="btn ghost small" data-act="slskip" style="justify-self:start">Пропустить: настройки по умолчанию</button></div></div>';
  if(Z.tries.length>1) h+='<div class="stack"><h3 style="font-size:16px">Прошлые попытки</h3><div class="sltries">'+Z.tries.slice(0,-1).map(function(x,i){ return '<figure>'+slicerSVG(x.set,tg,true)+'<figcaption class="num">'+x.set.t+' °C · '+x.set.v+' мм/с · '+x.set.f+'%</figcaption></figure>'; }).join('')+'</div></div>';
  return h+'</section>';
}
/* ---------- вопрос на цифрах месяца ---------- */
function myqBuild(r){
  var soldTot=Math.max(1,r.soldTot), q=0, left=0, lost=0, defects=0;
  PROD_IDS.forEach(function(id){ var x=r.rows[id]; if(!x) return; q+=x.q; left+=Math.max(0,x.left-x.invBefore); lost+=x.lost; defects+=x.defects; });
  var exp=r.revTot-r.profit, list=[];
  if(r.hours>5 && r.revTot>0) list.push({q:'Сколько рублей выручки пришлось в среднем на один час печати?', ans:Math.round(r.revTot/r.hours/10)*10, unit:'₽', why:'Выручка '+rub(r.revTot)+' делим на '+Math.round(r.hours)+' ч печати. Часов печати мало, поэтому важно, сколько приносит каждый.'});
  if(r.revTot>0) list.push({q:'Какая доля выручки ушла на расходы (всё, кроме прибыли)?', ans:Math.round(exp/r.revTot*100/5)*5, unit:'%', why:'Расходы '+rub(exp)+' делим на выручку '+rub(r.revTot)+' и получаем долю.'});
  if(r.soldTot>0 && r.revTot>0) list.push({q:'Сколько рублей выручки пришлось в среднем на одну проданную штуку?', ans:Math.round(r.revTot/soldTot/5)*5, unit:'₽', why:'Выручка '+rub(r.revTot)+' делим на '+Math.round(r.soldTot)+' проданных штук.'});
  if(defects>=3) list.push({q:'Сколько изделий за месяц ушло в брак?', ans:Math.round(defects), unit:'шт.', why:'Для '+q+' хороших изделий пришлось напечатать больше попыток. Разница это брак.'});
  if(!list.length) return null;
  var pick=list[(r.month*7+Math.round(r.revTot))%list.length], ans=pick.ans;
  var step=Math.max(pick.unit==='%'?5:(pick.unit==='шт.'?2:10), Math.round(ans*0.2/5)*5||5), set=[ans], k=1;
  while(set.length<3 && k<12){ var c=(k%2? ans+step*Math.ceil(k/2) : Math.max(0,ans-step*Math.ceil(k/2))); if(set.indexOf(c)<0) set.push(c); k++; }
  var seed=(r.month*13+Math.round(r.profit))%6, ord=[[0,1,2],[1,2,0],[2,0,1],[0,2,1],[1,0,2],[2,1,0]][seed];
  return {q:pick.q, unit:pick.unit, why:pick.why, opts:ord.map(function(i){ return set[i]; }), ans:ans, picked:null};
}
function myqHTML(){
  var Q=U.myq; if(!Q) return '';
  var fmt=function(v){ return Q.unit==='₽'?rub(v):(v+' '+Q.unit); };
  return '<section class="card flat stack"><div class="eyebrow">Проверь себя на цифрах месяца · награда '+rub(MYQ_REWARD)+'</div><p style="font-weight:600;font-size:17px">'+Q.q+'</p><div class="myq">'+Q.opts.map(function(v,i){
    var cls=''; if(Q.picked!=null) cls=v===Q.ans?'right':(Q.picked===i?'wrong':'dim');
    return '<button class="qopt '+cls+'" data-act="myq" data-i="'+i+'"'+(Q.picked!=null?' disabled':'')+'><span>'+fmt(v)+'</span></button>'; }).join('')+'</div>'+
    (Q.picked!=null?'<div class="callout '+(Q.opts[Q.picked]===Q.ans?'ok':'bad')+'" role="status">'+ico(Q.opts[Q.picked]===Q.ans?'check':'info')+'<div><b>'+(Q.opts[Q.picked]===Q.ans?'Верно, +'+rub(MYQ_REWARD)+'. ':'Правильный ответ: '+fmt(Q.ans)+'. ')+'</b>'+Q.why+'</div></div>':'')+'</section>';
}
var MYQ_REWARD = 300;
function sliderCtl(opt){
  return '<div class="ctl"><div class="ctl-head"><label for="'+opt.id+'">'+opt.label+'</label><span class="ctl-val num" id="'+opt.vid+'">'+opt.val+'</span></div>'+
    '<div class="ctl-row"><button class="step-btn" data-act="step" data-k="'+opt.k+'" data-id="'+opt.pid+'" data-d="-'+opt.step+'" aria-label="'+opt.label+': меньше"'+(opt.minusOff?' disabled':'')+'>'+ico('minus')+'</button>'+
    '<input type="range" id="'+opt.id+'" data-k="'+opt.k+'" data-id="'+opt.pid+'" min="'+opt.min+'" max="'+opt.max+'" step="'+opt.step+'" value="'+opt.v+'" aria-valuetext="'+esc(opt.val)+'">'+
    '<button class="step-btn" data-act="step" data-k="'+opt.k+'" data-id="'+opt.pid+'" data-d="'+opt.step+'" aria-label="'+opt.label+': больше">'+ico('plus')+'</button></div>'+
    '<div class="scale num"><span>'+opt.lo+'</span><span>'+opt.mid+'</span><span>'+opt.hi+'</span></div></div>';
}
function bestHourId(pv){
  var best=null, bv=-1e9; PROD_IDS.forEach(function(id){ var r=pv.rows[id]; if(r && r.perHour>bv && S.plan.qty[id]>0){ bv=r.perHour; best=id; } }); return best;
}
function pstatsHTML(id, pv, lo, hi, bestId){
  var r=pv.rows[id]; if(!r) return '';
  var rl=lo.rows[id], rh=hi.rows[id], avail=r.avail;
  var dtxt = Math.round(rl.demand)===Math.round(rh.demand) ? String(Math.round(r.demand)) : Math.round(rl.demand)+'–'+Math.round(rh.demand);
  var short = rl.demand-avail, over = avail-rh.demand;
  var third = short>2 ? '<div class="pstat"><b>Не хватит товара</b><span class="loss-t num">≈ '+Math.round(short)+' шт.</span></div>' : (over>2 ? '<div class="pstat"><b>Останется на складе</b><span class="loss-t num">≈ '+Math.round(over)+' шт.</span></div>' : '<div class="pstat"><b>Товара</b><span class="gain-t">хватает</span></div>');
  var perH = r.perHour;
  return '<div class="pstat"><b>Покупателей</b><span class="num">'+dtxt+' шт.</span></div>'+
    '<div class="pstat"><b>Себестоимость</b><span class="num">'+rub(r.unit+PACK[id]*S.infl)+'</span></div>'+
    '<div class="pstat"><b>Прибыль за час</b><span class="num '+(perH>0?'gain-t':'loss-t')+'">'+rub(perH)+'</span>'+(bestId===id?'<span class="chip brand" style="margin-top:4px">'+ico('star')+' лучший за час</span>':'')+'</div>'+third;
}
function productCard(id, pv, lo, hi, bestId){
  var P=PRODUCTS[id], plan=S.plan;
  if(!isAvailable(S,id)){
    return '<article class="card pcard locked" aria-label="'+P.name+' — недоступно"><div class="pcard-top"><div class="pcard-art">'+productSVG(id,40)+'</div><div><h3>'+P.name+'</h3><div class="lockrow">'+ico('lock')+' '+whyLocked(S,id)+'</div></div></div></article>';
  }
  var b=priceBounds(S,id,plan.mode), maxQ=maxQtyFor(S,plan,id), lock=lockQty(S,id), ref=refPrice(S,id), hpu=hoursPerUnit(S,id,plan.mode);
  return '<article class="card pcard" id="pc-'+id+'" aria-label="'+P.name+'"><div class="pcard-top"><div class="pcard-art">'+productSVG(id,40)+'</div><div><h3>'+P.name+'</h3><div class="pcard-sub">'+f1d(hpu)+' ч печати на штуку · пластика '+Math.round(gramsPerUnit(S,id,plan.mode))+' г</div></div><div class="curve-box" id="cv-'+id+'" role="img" aria-label="Кривая спроса: чем выше цена, тем меньше покупателей">'+curveSVG(S,id,plan)+'</div></div>'+
    '<div class="ctls">'+sliderCtl({id:'pr-'+id,vid:'pv-'+id,pid:id,k:'price',label:'Цена',val:rub(plan.price[id]),v:plan.price[id],min:b.min,max:b.max,step:5,lo:rub(b.min),mid:'рынок ≈ '+rub(ref),hi:rub(b.max)})+
    sliderCtl({id:'qr-'+id,vid:'qv-'+id,pid:id,k:'qty',label:'Сколько напечатать',val:pcs(plan.qty[id]),v:plan.qty[id],min:lock,max:Math.max(lock,maxQ),step:1,lo:pcs(lock),mid:'на складе '+pcs(S.inv[id]),hi:pcs(maxQ)+' по часам'})+'</div>'+
    '<div class="qf" role="group" aria-label="Быстрый выбор количества: '+P.short+'"><button class="btn small ghost" data-act="qfdem" data-id="'+id+'">Под спрос</button><button class="btn small ghost" data-act="qffill" data-id="'+id+'">Все свободные часы</button><button class="btn small ghost" data-act="qfzero" data-id="'+id+'">Не печатать</button></div>'+
    (lock?'<div class="lockrow">'+ico('lock')+' По заказу нужно напечатать не меньше '+pcs(lock)+'</div>':'')+
    '<div class="pstats" id="ps-'+id+'">'+pstatsHTML(id,pv,lo,hi,bestId)+'</div></article>';
}
function jobAssign(pv){
  var list=[], rows=pv.rows, remaining={}, ids=PROD_IDS.filter(function(id){ return rows[id] && rows[id].hours>0; });
  ids.forEach(function(id){ remaining[id]=rows[id].hours; });
  var mult=(1+(S.staff.asst?STAFF.asst.hours:0)+(S.staff.teen?STAFF.teen.hours:0))*SPACES[S.space].hm*modProd(S,'hours');
  S.printers.forEach(function(p){
    var cap=PRINTERS[p.t].hours*mult, used=0, byId={};
    ids.forEach(function(id){ if(remaining[id]>0.01 && used<cap-0.01){ var take=Math.min(remaining[id],cap-used); byId[id]=(byId[id]||0)+take; remaining[id]-=take; used+=take; } });
    var top=null, tv=0; for(var k in byId){ if(byId[k]>tv){ tv=byId[k]; top=k; } }
    list.push({name:PRINTERS[p.t].name, obj:top, util:cap>0?used/cap:0, label:p.t==='old'?'Фил':PRINTERS[p.t].name});
  });
  if(S.flags.ally){ var extra=S.flags.alliance2?ALLY2_HOURS:ALLY_HOURS, used2=0, byId2={}; ids.forEach(function(id){ if(remaining[id]>0.01 && used2<extra){ var take=Math.min(remaining[id],extra-used2); byId2[id]=take; remaining[id]-=take; used2+=take; } }); var tp=null,tv2=0; for(var k2 in byId2){ if(byId2[k2]>tv2){ tv2=byId2[k2]; tp=k2; } } list.push({name:'Ферма Макса', obj:tp, util:extra>0?used2/extra:0, label:'Ферма Макса'}); }
  return list;
}
function farmHTML(pv, working){
  var jobs=jobAssign(pv);
  return '<div class="farm" aria-label="Принтеры мастерской">'+jobs.map(function(j){
    var n=OBJ[j.obj||'stand'].w.length, layers=j.obj?Math.max(1,Math.round(j.util*n)):0;
    return '<figure>'+printerSVG({obj:j.obj||'stand',layers:layers,working:working&&j.util>0,state:j.util>0?'on':'idle',label:j.label})+'<figcaption>'+esc(j.label)+'<br><span class="num">'+Math.round(j.util*100)+'%</span></figcaption></figure>';
  }).join('')+'</div>';
}
function hoursHTML(pv){
  var H=pv.H, used=pv.hours, free=Math.max(0,H-used), segs='', leg='';
  PROD_IDS.forEach(function(id){ var r=pv.rows[id]; if(!r||r.hours<=0.01) return; segs+='<i style="width:'+(r.hours/H*100).toFixed(2)+'%;background:var(--c-'+PCOL[id]+')"></i>'; leg+='<span><em style="background:var(--c-'+PCOL[id]+')"></em>'+PRODUCTS[id].short+' <b class="num">'+Math.round(r.hours)+' ч</b></span>'; });
  var fail=pv.fail;
  var kgNeed=pv.kg, stock=S.fil.kg;
  var freeHint = free>Math.max(8,H*0.12) ? '<p class="callout warn" style="padding:10px 14px">'+ico('info')+'<span>Свободно '+Math.round(free)+' ч печати. Их можно отдать товару с лучшей прибылью за час или поддержать рекламой.</span></p>' : '';
  return '<div class="ctl-head"><h3>Часы печати</h3><span class="num"><b>'+Math.round(used)+'</b> из '+H+' ч</span></div>'+
    '<div class="hbar" role="img" aria-label="Занято '+Math.round(used)+' часов из '+H+'">'+segs+'</div><div class="legend">'+leg+'<span><em style="background:var(--surface-3);border:1.5px solid var(--edge-strong)"></em>свободно <b class="num">'+Math.round(free)+' ч</b></span></div>'+
    freeHint+'<div class="hours-farm">'+farmHTML(pv,false)+'</div>'+
    '<div class="pstats"><div class="pstat"><b>Брак</b><span class="num '+(fail>0.12?'loss-t':'')+'">'+Math.round(fail*100)+'%</span></div>'+
    '<div class="pstat"><b>Пластик</b><span class="num">'+f1d(kgNeed)+' кг</span><span class="muted" style="font-size:12.5px;font-weight:500">на складе '+f1d(stock)+' кг'+(pv.buyKg>0.05?', докупим '+f1d(pv.buyKg)+' кг':'')+'</span></div></div>';
}
function forecastHTML(pv, lo, hi){
  var exp = pv.revTot - pv.profit;
  var endCash = S.cash - pv.cashNow + pv.cashEnd;
  return '<div class="forecast"><div class="fbox"><b>Выручка</b><span class="num">≈ '+rub(pv.revTot)+'</span></div><div class="fbox"><b>Расходы</b><span class="num">≈ '+rub(exp)+'</span></div><div class="fbox"><b>Прибыль</b><span class="num '+(pv.profit>=0?'gain-t':'loss-t')+'">≈ '+rub(pv.profit)+'</span></div></div>'+
    '<p class="muted" style="font-size:14px;margin-top:10px">'+(Math.abs(hi.profit-lo.profit)<Math.max(600,Math.abs(pv.profit)*0.012)?'Весь напечатанный товар разойдётся, поэтому прибыль почти не зависит от случайного спроса.':'С учётом случайности спроса: от '+rub(lo.profit)+' до '+rub(hi.profit)+'.')+' Деньги на счету в конце месяца ≈ <b class="num">'+rub(endCash)+'</b>.</p>';
}
/* ---------- схема «откуда → куда» ---------- */
var FLOW_INFO={
  plastic:['Пластик (сырьё)','Пластик это катушки, из которых печатаются изделия. Он лежит на складе. Если запаса не хватает, недостающее докупается по рыночной цене, и деньги уходят сразу при запуске печати.'],
  printers:['Принтеры','Принтеры превращают пластик в изделия. У них ограничено время: часы печати. Часть попыток получается бракованной: брак тоже съедает и часы, и пластик.'],
  stock:['Готовые изделия','Всё, что напечатано и не продано, лежит на складе. Склад стоит денег (хранение, устаревание), поэтому много печатать «на всякий случай» невыгодно.'],
  buyers:['Покупатели и заказы','Часть изделий уйдёт по заказам клиентов (цена оговорена заранее), остальное купят на рынке. Сколько купят, зависит от цены, сезона и репутации.'],
  money:['Деньги','Выручка от продаж минус все расходы (пластик, печать, аренда, налоги, износ) даёт прибыль. Прибыль увеличивает капитал, а капитал это твой путь к цели.']
};
function flowHTML(r, actual){
  var q=0, left=0, before=0, sold=0, contract=0, lost=0;
  PROD_IDS.forEach(function(id){ var x=r.rows[id]; if(!x) return; q+=x.q; left+=x.left; before+=x.invBefore; sold+=x.sold; contract+=x.contractUnits; lost+=x.lost; });
  var exp=r.revTot-r.profit, util=r.H>0?Math.round(r.hours/r.H*100):0;
  var nodes=[
   ['plastic','box','Пластик',['на складе было '+f1d(actual?(S.fil.kg+r.kg-r.buyKg):S.fil.kg)+' кг','пошло в печать '+f1d(r.kg)+' кг',r.buyKg>0.05?'докупили '+f1d(r.buyKg)+' кг за '+rub(r.buyCost):'запаса хватило']],
   ['printers','printer','Принтеры',[Math.round(r.hours)+' из '+r.H+' ч (занято '+util+'%)','брак ≈ '+Math.round(r.fail*100)+'%','напечатано '+q+' шт.']],
   ['stock','layers','Склад',['было '+before+' шт.','осталось '+Math.round(left)+' шт.',left>q*0.35&&left>10?'много лежит: товар дешевеет':'запас в порядке']],
   ['buyers','users','Покупатели',['заказы: '+Math.round(contract)+' шт.','рынок: '+Math.round(sold)+' шт.',lost>2?'не хватило товара: '+Math.round(lost)+' шт.':'спрос закрыт']],
   ['money','coin','Деньги',['выручка '+rub(r.revTot),'расходы '+rub(exp),'прибыль '+rub(r.profit)]]
  ];
  return '<div class="flow" role="group" aria-label="Схема месяца: откуда что берётся и куда уходит">'+nodes.map(function(n,i){
    return '<button class="fnode" data-act="fnote" data-k="'+n[0]+'"'+(i===4?' data-end="1"':'')+'><span class="fico">'+ico(n[1])+'</span><b>'+n[2]+'</b>'+n[3].map(function(x){ return '<span class="num">'+x+'</span>'; }).join('')+'</button>';
  }).join('')+'</div>';
}
function tutorialState(){
  if(S.month!==1) return {active:false, ok:true, steps:[]};
  var b=makeBoard(S), seen=U.seen||{};
  var s1=b.offers.some(function(o){ return o.state==='taken'; }), s2=!!seen.qty, s3=s1&&s2&&!!seen.biz;
  return {active:true, ok:s1&&s2, steps:[
    {t:'Прими заказ на вкладке «Заказы»: клиент заранее заплатит, и продажа гарантирована.', done:s1},
    {t:'На вкладке «Печать» реши, сколько штук делать: двигай ползунок «Сколько напечатать» у любого товара.', done:s2},
    {t:'Посмотри схему «откуда → куда» и прогноз справа, потом нажми «Запустить печать».', done:s3}]};
}
function bizHTML(){
  var plan=S.plan, pv=previewMonth(S,plan,1), lo=previewMonth(S,plan,0.92), hi=previewMonth(S,plan,1.08), best=bestHourId(pv);
  var modes=['draft','std','fine'], mdesc={draft:'печать на 30% быстрее · качество ниже · брак +3 п.п.',std:'золотая середина',fine:'печать на 55% дольше · качество выше · спрос растёт'};
  var h='<section class="card stack"><div class="row between"><h3>Как идёт месяц: откуда → куда</h3><span class="muted" style="font-size:13.5px">Нажми на блок, чтобы узнать подробнее</span></div><div id="flow-box">'+flowHTML(pv,false)+'</div></section>';
  h+='<div class="plan"><div class="plan-main">';
  h+='<section class="card"><div class="ctl-head"><h3 id="modetitle">Режим печати</h3><span class="chip info">слой <span id="layerval">'+MODES[plan.mode].layer+'</span></span></div><div class="seg" role="radiogroup" aria-labelledby="modetitle" style="margin-top:12px">'+
    modes.map(function(m){ return '<button role="radio" aria-checked="'+(plan.mode===m)+'" data-act="mode" data-m="'+m+'"><b>'+MODES[m].name+' · '+MODES[m].layer+'</b><span>'+mdesc[m]+'</span></button>'; }).join('')+'</div></section>';
  PROD_IDS.forEach(function(id){ h+=productCard(id,pv,lo,hi,best); });
  h+='<section class="card ads-card"><h3>Реклама</h3><div class="choices" style="margin-top:12px;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))">'+ADS.map(function(a,i){ return '<button class="qopt" role="radio" aria-checked="'+(plan.ad===i)+'" data-act="ad" data-i="'+i+'" style="'+(plan.ad===i?'background:var(--brand);border-color:var(--brand-edge);color:var(--on-brand);box-shadow:0 4px 0 var(--brand-edge)':'')+'"><span style="display:grid;gap:2px"><b>'+a.name+'</b><span style="font-size:13.5px;font-weight:500">'+(a.cost?rub(a.cost)+' · спрос ×'+f1(a.mult):'бесплатно')+'</span></span></button>'; }).join('')+'</div></section>';
  h+='</div><aside class="plan-side" aria-label="Мастерская и прогноз"><section class="card lined stack" id="hours-box">'+hoursHTML(pv)+'</section><section class="card stack" id="fc-box"><h3>Прогноз месяца</h3>'+forecastHTML(pv,lo,hi)+'</section>'+
    '<div class="callout tip">'+avatarSVG('phil','happy',40)+'<div><b>Совет Фила.</b> '+HINTS[S.month-1]+'<div style="margin-top:8px"><button class="btn small" data-act="suggest">'+ico('sparkle')+' Предложи план</button></div></div></div></aside></div>';
  return h;
}
function markQty(){ U.seen=U.seen||{}; U.seen.qty=true; fitCash(); liveUpdate(); }
function liveUpdate(){
  if(U.screen!=='plan' || (U.tab||'orders')!=='biz') { renderActionBar(); return; }
  var plan=S.plan, pv=previewMonth(S,plan,1), lo=previewMonth(S,plan,0.92), hi=previewMonth(S,plan,1.08), best=bestHourId(pv), act=document.activeElement;
  PROD_IDS.forEach(function(id){
    if(!isAvailable(S,id) || !$('#pc-'+id)) return;
    setText('pv-'+id, rub(plan.price[id])); setText('qv-'+id, pcs(plan.qty[id]));
    var cv=$('#cv-'+id); if(cv) cv.innerHTML=curveSVG(S,id,plan);
    var ps=$('#ps-'+id); if(ps) ps.innerHTML=pstatsHTML(id,pv,lo,hi,best);
    var qr=$('#qr-'+id), pr=$('#pr-'+id), mq=Math.max(lockQty(S,id),maxQtyFor(S,plan,id));
    if(qr){ qr.max=mq; qr.min=lockQty(S,id); if(qr!==act) qr.value=plan.qty[id]; qr.setAttribute('aria-valuetext',pcs(plan.qty[id])); }
    if(pr){ if(pr!==act) pr.value=plan.price[id]; pr.setAttribute('aria-valuetext',rub(plan.price[id])); }
  });
  var gb=$('#goals-box'); if(gb) gb.innerHTML=goalsInner();
  var fb2=$('#flow-box'); if(fb2) fb2.innerHTML=flowHTML(pv,false);
  var st2=$('#steps-box'); if(st2) st2.innerHTML=stepsInner();
  var hb=$('#hours-box'); if(hb) hb.innerHTML=hoursHTML(pv);
  var fb=$('#fc-box'); if(fb) fb.innerHTML='<h3>Прогноз месяца</h3>'+forecastHTML(pv,lo,hi);
  renderActionBar(pv);
}
function renderActionBar(pv){
  var bar=$('#actionbar'); if(!bar) return;
  if(U.screen!=='plan'){ bar.hidden=true; bar.innerHTML=''; return; }
  pv = pv || previewMonth(S,S.plan,1);
  var left=S.cash-pv.cashNow, ok=left>=-0.5, tu=tutorialState(), gate=tu.active&&!tu.ok;
  bar.hidden=false;
  bar.innerHTML='<div class="actionbar-in"><div class="sum">'+(gate?'<span><b>Обучение:</b> сначала выполни шаги вверху страницы.</span>':'')+'<span'+(gate?' hidden':'')+'>Потратишь сейчас: <b class="num">'+rub(pv.cashNow)+'</b><span class="hide-s muted"> (пластик '+rub(pv.buyCost)+', печать '+rub(pv.runCost)+(pv.adCost?', реклама '+rub(pv.adCost):'')+')</span></span><span>Прибыль месяца ≈ <b class="num '+(pv.profit>=0?'gain-t':'loss-t')+'" style="font-size:15px">'+rub(pv.profit)+'</b><span class="hide-s"> · платежи в конце месяца '+rub(pv.fixed+loanPayment(S))+'</span></span>'+(ok?'':'<span class="loss-t">Не хватает '+rub(-left)+': уменьши выпуск</span>')+'</div>'+
    '<button class="btn primary" data-act="go" id="gobtn"'+((ok&&!gate)?'':' disabled')+(gate?' title="Сначала выполни шаги обучения"':'')+'>Запустить печать'+ico('play')+'</button></div>';
}

/* ---------- мастерская (покупки) ---------- */
function printerCard(type, owned){
  var d=PRINTERS[type], chk=canBuyPrinter(S,type), pb=paybackInfo(S,type);
  var locked = type==='ind' && S.month<9;
  var chips='<span class="chip info">'+ico('clock')+' +'+d.hours+' ч в месяц</span><span class="chip '+(d.fail>0.1?'loss':'gain')+'">брак '+Math.round(d.fail*100)+'%</span>'+(d.big?'<span class="chip warn">большой формат</span>':'')+
    '<span class="chip">амортизация ≈ '+rub(d.price/DEPR_MONTHS)+'/мес</span>'+(locked?'':'<span class="chip '+(pb.ok?'brand':'warn')+'">'+pb.text+'</span>');
  return '<article class="card upg'+(locked?' off':'')+'"><header>'+printerSVG({obj:'stand',layers:5,state:'idle',label:d.name,cls:'art'})+'<div><h3>'+d.name+'</h3><p class="muted">'+d.note+'</p></div></header><div class="chips">'+chips+'</div>'+
    (locked?'<span class="chip">'+ico('lock')+' откроется в мае</span>':'<button class="btn small" data-act="buyp" data-t="'+type+'"'+(chk.ok?'':' disabled')+'>Купить за '+rub(d.price)+'</button>'+(chk.ok?'':'<span class="loss-t" style="font-size:13.5px;font-weight:600">'+chk.why+'</span>'))+'</article>';
}
function shopHTML(){
  var sp=SPACES[S.space], h='';
  h+=wsCard('Твоя мастерская', esc(sp.name));
  h+=labHTML();
  h+='<div class="callout">'+ico('info')+'<div>Оборудование и люди дают <b>часы печати</b>, но не покупателей. Покупай, когда часов не хватает, а товар раскупают. Все покупки видны в «Капитале» по остаточной стоимости.</div></div>';
  h+='<section class="stack"><div class="row between"><h2 style="font-size:22px">Принтеры</h2><span class="chip info">'+S.printers.length+' из '+sp.limit+' мест · «'+sp.name+'»</span></div><div class="grid-auto">';
  S.printers.forEach(function(p,i){ var d=PRINTERS[p.t]; h+='<article class="card upg owned"><header>'+printerSVG({obj:'stand',layers:6,state:'on',label:d.name,cls:'art'})+'<div><h3>'+(p.t==='old'?'Фил':d.name)+'</h3><p class="muted">'+d.hours+' ч · брак '+Math.round(d.fail*100)+'%</p></div></header><div class="chips"><span class="chip gain">'+ico('check')+' в работе</span>'+(p.t==='old'?'':'<span class="chip">остаточная стоимость '+rub(d.price*Math.max(0,1-p.age/DEPR_MONTHS))+'</span>')+'</div></article>'; });
  ['std','used','fast','big','ind'].forEach(function(t){ h+=printerCard(t); });
  h+='</div></section>';
  h+='<section class="stack"><h2 style="font-size:22px">Команда</h2><div class="grid-auto">';
  ['asst','teen'].forEach(function(k){
    var d=STAFF[k], has=!!S.staff[k], sal=Math.round(d.salary*S.infl);
    h+='<article class="card upg'+(has?' owned':'')+'"><header>'+avatarSVG(k==='asst'?'oleg':'max',k==='asst'?'happy':'neutral',64,'art')+'<div><h3>'+d.name+'</h3><p class="muted">'+d.desc+'</p></div></header><div class="chips"><span class="chip info">+'+Math.round(d.hours*100)+'% часов печати</span><span class="chip warn">'+rub(sal)+'/мес</span></div>'+
      '<button class="btn small" data-act="'+(has?'fire':'hire')+'" data-k="'+k+'">'+(has?'Уволить':'Нанять')+'</button></article>';
  });
  h+='</div></section>';
  h+='<section class="stack"><h2 style="font-size:22px">Помещение</h2><div class="grid-auto">';
  ['garage','cowork','home'].forEach(function(k){
    var d=SPACES[k], cur=S.space===k, chk=canMove(S,k);
    h+='<article class="card upg'+(cur?' owned':'')+'"><div><h3>'+d.name+'</h3><p class="muted">До '+d.limit+' принтеров · '+(d.rent?'аренда '+rub(d.rent)+'/мес':'без аренды')+(d.hm<1?' · часы печати ×'+f1(d.hm):'')+'</p></div>'+
      (cur?'<span class="chip gain">'+ico('check')+' ты здесь</span>':'<button class="btn small" data-act="moveto" data-k="'+k+'"'+(chk.ok?'':' disabled')+'>Переехать'+(MOVE_COST[k]?' за '+rub(MOVE_COST[k]):'')+'</button>'+(chk.ok?'':'<span class="loss-t" style="font-size:13.5px;font-weight:600">'+chk.why+'</span>'))+'</article>';
  });
  h+='</div></section>';
  h+='<section class="stack"><h2 style="font-size:22px">Продажи и сервис</h2><div class="grid-auto">';
  var chOpen=S.month>=6;
  h+='<article class="card upg'+(S.channel.market?' owned':'')+(chOpen?'':' off')+'"><div><h3>Маркетплейс</h3><p class="muted">Покупатели со всего города. Берёт комиссию с продаж.</p><div class="chips" style="margin-top:8px"><span class="chip gain">спрос ×'+f1(CHANNELS.market.mult)+'</span><span class="chip warn">комиссия '+Math.round(CHANNELS.market.commission*100)+'%</span></div></div>'+
    (chOpen?'<button class="btn small" data-act="chan" data-k="market">'+(S.channel.market?'Отключить':'Подключить')+'</button>':'<span class="chip">'+ico('lock')+' откроется после налогов</span>')+'</article>';
  h+='<article class="card upg'+(S.channel.site?' owned':'')+(chOpen?'':' off')+'"><div><h3>Свой сайт</h3><p class="muted">Без комиссии, но нужен запуск и ежемесячная оплата.</p><div class="chips" style="margin-top:8px"><span class="chip gain">спрос ×'+f1(CHANNELS.site.mult)+'</span><span class="chip warn">'+rub(CHANNELS.site.fee)+'/мес</span></div></div>'+
    (chOpen?(S.channel.site?'<span class="chip gain">'+ico('check')+' работает</span>':'<button class="btn small" data-act="chan" data-k="site"'+(S.cash>=15000?'':' disabled')+'>Запустить за '+rub(15000)+'</button>'):'<span class="chip">'+ico('lock')+' откроется после налогов</span>')+'</article>';
  h+='<article class="card upg'+(S.service?' owned':'')+'"><div><h3>Профилактика</h3><p class="muted">Регулярная чистка и смазка. Принтеры ломаются реже.</p><div class="chips" style="margin-top:8px"><span class="chip gain">брак −2 п.п.</span><span class="chip warn">'+rub(SERVICE_COST)+'/мес</span></div></div><button class="btn small" data-act="service">'+(S.service?'Отменить':'Подключить')+'</button></article>';
  h+='</div></section>';
  return h;
}

/* ---------- финансы ---------- */
function moneyCard(key, title, about, rate, have, on){
  if(!on) return '<article class="card upg off"><div><h3>'+title+'</h3><p class="muted">'+about+'</p></div><span class="chip">'+ico('lock')+' откроется по ходу истории</span></article>';
  return '<article class="card stack"><div><h3>'+title+'</h3><p class="muted">'+about+'</p></div><div class="chips"><span class="chip info">'+rate+'</span></div><div class="bigv num">'+rub(have)+'</div>'+
    '<div class="mv"><button class="btn small" data-act="mv" data-k="'+key+'" data-d="10000">+10 000</button><button class="btn small" data-act="mv" data-k="'+key+'" data-d="50000">+50 000</button><button class="btn small" data-act="mv" data-k="'+key+'" data-d="all">Всё сюда</button><button class="btn small ghost" data-act="mv" data-k="'+key+'" data-d="-10000">−10 000</button><button class="btn small ghost" data-act="mv" data-k="'+key+'" data-d="-all">Забрать всё</button></div></article>';
}
function finHTML(){
  var assetsRows=[['Деньги на счету',S.cash],['Вклад',S.savings],['Индексный фонд',S.fund],['Принтеры по остаточной стоимости',bookValue(S)],['Товар на складе',invValueTotal(S)],['Пластик на складе',filValue(S)]];
  var comp=companyCapital(S), h='';
  h+='<div class="plan"><section class="card lined"><h3>Баланс: из чего состоит капитал</h3><table class="bal" style="margin-top:10px"><tbody>'+assetsRows.map(function(r){ return '<tr><td>'+r[0]+'</td><td>'+rub(r[1])+'</td></tr>'; }).join('')+
    '<tr><td>Долги</td><td class="loss-t">'+rub(-S.loanLeft)+'</td></tr><tr><td>Капитал компании</td><td>'+rub(comp)+'</td></tr>'+(S.equity<1?'<tr><td>Твоя доля ('+Math.round(S.equity*100)+'%)</td><td>'+rub(ownerCapital(S))+'</td></tr>':'')+
    '<tr class="total"><td>Твой капитал</td><td>'+rub(ownerCapital(S))+'</td></tr></tbody></table><p class="muted" style="margin-top:10px">Капитал это всё, что есть, минус всё, что должен.</p></section>';
  h+='<div class="plan-main">';
  if(S.loanLeft>0) h+='<section class="card stack"><h3>Кредит</h3><p class="muted">Ставка 1,5% в месяц. В конце месяца платишь часть долга и проценты.</p><div class="bigv num loss-t">'+rub(S.loanLeft)+'</div><p>Ближайший платёж: <b class="num">'+rub(loanPayment(S))+'</b></p><div class="mv"><button class="btn small" data-act="repay" data-d="50000"'+(S.cash<1?' disabled':'')+'>Погасить 50 000</button><button class="btn small" data-act="repay" data-d="all"'+(S.cash<1?' disabled':'')+'>Погасить всё, что можно</button></div></section>';
  else h+='<section class="card stack"><h3>Кредит</h3><p class="muted">'+(S.unlock.loan?'Долгов нет. Банку переплачивать не нужно.':'Банк предложит кредит по ходу истории.')+'</p></section>';
  h+='<section class="card stack"><h3>Страховка мастерской</h3><p class="muted">'+rub(INSURANCE_COST)+' в месяц. При аварии или пожаре страховая платит '+Math.round(INSURANCE_PAYOUT*100)+'% ущерба.</p><div class="chips"><span class="chip '+(S.insurance?'gain':'')+'">'+(S.insurance?'оформлена':'не оформлена')+'</span></div><div><button class="btn small" data-act="insure">'+(S.insurance?'Отменить страховку':'Оформить страховку')+'</button></div></section>';
  h+='<section class="card stack"><h3>Налоги и доли</h3><p class="muted">Налоговый режим: <b>'+(S.tax==='rev'?'6% с выручки':(S.tax==='profit'?'15% с прибыли (но не меньше 1% выручки)':'пока не оформлен'))+'</b>.'+(S.equity<1?' Инвестору принадлежит '+Math.round((1-S.equity)*100)+'% мастерской.':' Мастерская целиком твоя.')+'</p></section>';
  h+='</div></div>';
  h+='<div class="grid-auto">'+moneyCard('savings','Вклад','Надёжно. Деньги можно забрать в любой момент.','+1% в месяц',S.savings,S.unlock.deposit)+moneyCard('fund','Индексный фонд','Сотни компаний сразу. Колеблется, но в среднем выше вклада.','≈ +0,8% в месяц, колебания до ±4%',S.fund,S.unlock.fund)+'</div>';
  return h;
}

/* ---------- живая мастерская ---------- */
function wsCard(title, note){
  var pv=previewMonth(S,S.plan,1);
  return '<section class="card ws-card stack"><div class="row between"><h2 style="font-size:20px">'+title+'</h2>'+(note?'<span class="chip info">'+note+'</span>':'')+'</div><div class="ws-wrap">'+workshopSVG(S,{jobs:jobAssign(pv),working:false})+'</div></section>';
}

/* ---------- печать месяца (анимация) ---------- */
var runTimers=[];
function clearRunTimers(){ runTimers.forEach(clearTimeout); runTimers=[]; }
function runHTML(){
  var r=U.report, pv={rows:r.rows,H:r.H,hours:r.hours};
  var made=0, defects=0; PROD_IDS.forEach(function(id){ var x=r.rows[id]; if(x){ made+=x.q; defects+=x.defects; } });
  return '<section class="run"><div><div class="eyebrow">'+MONTH_NAMES[r.month-1]+' · печать</div><h1 id="pagetitle" tabindex="-1" style="font-size:clamp(28px,4.6vw,44px)">Принтеры работают</h1></div>'+
    (r.fact?'<p class="muted runfact"><b>Знаешь ли ты?</b> '+esc(r.fact)+'</p>':'')+'<div class="run-weeks" aria-hidden="true"><span id="wk0" class="on">Неделя 1</span><span id="wk1">Неделя 2</span><span id="wk2">Неделя 3</span><span id="wk3">Неделя 4</span></div>'+
    '<div class="run-bar"><div class="fil" aria-hidden="true"><i id="runfill" style="width:0%;transition:width 3000ms linear"></i></div></div>'+
    '<div class="ws-wrap">'+workshopSVG(S,{jobs:jobAssign({rows:r.rows}),working:true,month:r.month})+'</div>'+
    '<div class="run-nums"><div class="fbox"><b>Напечатано</b><span class="num" data-run="'+made+'" data-fmt="pcs">0 шт.</span></div><div class="fbox"><b>Продано</b><span class="num" data-run="'+r.soldTot+'" data-fmt="pcs">0 шт.</span></div><div class="fbox"><b>Выручка</b><span class="num" data-run="'+Math.round(r.revTot)+'" data-fmt="rub">0 ₽</span></div></div>'+
    '<div class="row"><button class="btn primary" data-act="runskip">Показать итоги'+ico('right')+'</button></div></section>';
}
function farmRunHTML(r){
  var pv={rows:r.rows,H:r.H}, jobs=jobAssign({rows:r.rows}), fakeS=jobs;
  return '<div class="farm" aria-hidden="true">'+jobs.map(function(j){ var n=OBJ[j.obj||'stand'].w.length; return '<figure>'+printerSVG({obj:j.obj||'stand',layers:n,working:j.util>0,state:j.util>0?'on':'idle',label:j.label})+'<figcaption>'+esc(j.label)+'</figcaption></figure>'; }).join('')+'</div>';
}
function startRun(){
  clearRunTimers();
  $$('[data-run]').forEach(function(el){ var to=+el.getAttribute('data-run'), f=el.getAttribute('data-fmt')==='rub'?rub:pcs; animateNumber(el,0,to,3000,f); });
  var fill=$('#runfill'); if(fill) requestAnimationFrame(function(){ fill.style.width='100%'; });
  [800,1600,2400].forEach(function(ms,i){ runTimers.push(setTimeout(function(){ var w=$('#wk'+(i+1)); if(w) w.classList.add('on'); },ms)); });
  sfx('print');
  runTimers.push(setTimeout(function(){ if(U.screen==='run') A.runskip(); },3500));
}

/* ---------- итоги месяца ---------- */
function insights(r){
  var out=[], lostTotal=0;
  PROD_IDS.forEach(function(id){
    var x=r.rows[id]; if(!x) return; var P=PRODUCTS[id]; lostTotal+=x.lost;
    if(x.lost>=Math.max(3,x.demand*0.12)) out.push({k:'warn',p:5,t:'<b>'+P.short+':</b> '+x.lost+' '+plural(x.lost,'покупатель','покупателя','покупателей')+' ушли ни с чем, потому что товара не хватило. В следующий раз печатай больше или подними цену.'});
    if(x.left>=Math.max(6,x.sold*0.25) && x.demand>0) out.push({k:'warn',p:4,t:'<b>'+P.short+':</b> на складе осталось '+x.left+' шт. Нераспроданное дешевеет на 6% в месяц и занимает место.'});
    if(x.contractQty>0){ if(x.contractUnits>=x.contractQty) out.push({k:'ok',p:6,t:'<b>Заказ выполнен:</b> '+x.contractQty+' шт. отправлены клиенту вовремя. Репутация выросла.'}); else out.push({k:'bad',p:7,t:'<b>Заказ сорван:</b> не хватило '+(x.contractQty-x.contractUnits)+' шт. Штраф '+rub(x.penalty)+' и потеря репутации.'}); }
  });
  var util=r.H>0?r.hours/r.H:0;
  if(util<0.8) out.push({k:'info',p:3,t:'Часы печати использованы на '+Math.round(util*100)+'%. Свободные часы можно отдать другому товару или поддержать рекламой.'});
  else if(util>0.97 && lostTotal>5) out.push({k:'info',p:5,t:'Все часы заняты, а покупатели остались. Подними цены на самые ходовые товары или докупи принтер во вкладке «Мастерская».'});
  if(r.fail>0.12) out.push({k:'warn',p:3,t:'Брак '+Math.round(r.fail*100)+'%. Каждая бракованная деталь тратит пластик и часы. Профилактика и хороший пластик снижают брак.'});
  if(r.profit<0) out.push({k:'bad',p:8,t:'Месяц в минус. Посмотри на постоянные расходы, амортизацию и цены.'});
  if(r.overdraft) out.push({k:'bad',p:9,t:'Денег не хватило на расходы месяца. Банк закрыл дефицит '+rub(r.overdraft)+' и добавил его к долгу.'});
  if(r.fromSavings) out.push({k:'info',p:6,t:'На счету не хватало денег, поэтому '+rub(r.fromSavings)+' пришлось снять со вклада.'});
  var delta=r.cashAfter-r.cashBefore;
  if(Math.abs(delta-r.profit)>0.15*Math.max(1,Math.abs(r.profit))+1500) out.push({k:'info',p:2,t:'Прибыль и деньги на счету не совпадают: прибыль '+rub(r.profit)+', а деньги изменились на '+rub(delta)+'. Часть денег ушла в пластик и товар на складе, на погашение долга или осела во вкладах.'});
  var best=null, bv=-1e9; PROD_IDS.forEach(function(id){ var x=r.rows[id]; if(x && x.q>0 && x.perHour>bv){ bv=x.perHour; best=id; } });
  if(best) out.push({k:'info',p:1,t:'Самый выгодный товар по прибыли за час печати: <b>'+PRODUCTS[best].short+'</b> (≈ '+rub(bv)+' за час).'});
  out.sort(function(a,b){ return b.p-a.p; });
  return out.slice(0,4);
}
function ratingNow(){ var q=S.rate; return q && q.u>0 ? q.s/q.u : 0; }
function reviewsHTML(r){
  var rv=r.reviews; if(!rv || !rv.list.length) return '';
  var items=rv.list.map(function(x,i){ var P=x.id?PRODUCTS[x.id]:null;
    return '<div class="rv" style="--i:'+i+'"><div class="rv-av c-'+x.color+'" aria-hidden="true">'+esc(x.name.charAt(0))+'</div><div class="rv-body"><div class="rv-head"><b>'+esc(x.name)+'</b>'+starsHTML(x.stars)+(P?'<span class="chip">'+esc(P.short)+'</span>':'')+'</div><p>'+esc(x.text)+'</p></div></div>'; }).join('');
  return '<section class="card stack"><div class="row between"><h2 style="font-size:20px">Что пишут покупатели</h2>'+(rv.units>0?'<span class="chip brand">'+starsHTML(Math.round(rv.avg))+' <span>'+ratingText(rv.avg)+' за месяц</span></span>':'')+'</div><div class="rv-list">'+items+'</div></section>';
}
function ordersReportHTML(r){
  var os=r.orders||[]; if(!os.length) return '';
  var rows=os.map(function(o){
    var ok=o.miss<=0 && !o.fineFail, cl=o.client?CLIENTS[o.client]:null;
    var st = ok ? (o.claim>0?'выполнен, но с последствиями':'выполнен полностью') : (o.fineFail?'не тот режим печати: нужен «Тонко»':'сдано '+o.done+' из '+o.qty+' шт.');
    return '<div class="orow '+(ok&&!(o.claim>0)?'ok':'bad')+'">'+(cl?cbadge(o.client):'<span class="cbadge">'+ico('doc')+'</span>')+
      '<div class="ostat"><b>'+esc(o.label)+'</b><span class="k">'+st+'</span>'+(o.reply?'<q>'+esc(o.reply)+'</q>':'')+'</div>'+
      '<div class="omoney"><b class="num gain-t">+'+rub(o.rev)+'</b>'+(o.pen>0.5?'<span class="num loss-t">−'+rub(o.pen)+' '+(o.claim>0?'компенсация':'штраф')+'</span>':'')+
      (o.trustDelta?'<span class="'+(o.trustDelta>0?'gain-t':'loss-t')+'">'+(o.trustDelta>0?'+':'−')+'доверие '+heartsHTML(o.trust)+'</span>':'')+'</div></div>';
  }).join('');
  var msgs=(r.trustMsgs||[]).map(function(m){ return '<div class="callout ok">'+ico('heart')+'<div>'+esc(m)+'</div></div>'; }).join('');
  return '<section class="card stack"><h2 style="font-size:20px">Заказы месяца</h2><div class="orows">'+rows+'</div>'+msgs+'</section>';
}
function goalsReportHTML(r){
  var g=r.goals; if(!g||!g.list.length) return '';
  var tot=g.reward+g.bonus;
  return '<section class="card lined stack"><div class="row between"><h2 style="font-size:20px">Цели месяца</h2><span class="chip '+(tot>0?'brand':'')+'">'+(tot>0?'награда +'+rub(tot):'без награды')+'</span></div>'+
    '<ul class="goals-l big">'+g.list.map(function(x){ return '<li class="'+(x.ok?'ok':'miss')+'"><span class="gbox" aria-hidden="true">'+(x.ok?ico('check'):ico('x'))+'</span><span>'+esc(x.text)+(x.ok?' <b class="gain-t">+'+rub(GOAL_REWARD)+'</b>':'')+(x.ok?'':'<small class="muted"> '+esc(x.hint)+'</small>')+'</span></li>'; }).join('')+'</ul>'+
    (g.bonus>0?'<div class="callout ok">'+ico('star')+'<div><b>Все цели выполнены!</b> Бонус '+rub(g.bonus)+' и репутация +1.</div></div>':'')+'</section>';
}
function reportHTML(){
  var r=U.report, mx=Math.max(1,r.revTot), rows='', n=0;
  function row(name,val,kind,hint){ if(Math.abs(val)<0.5) return ''; n++; return '<div class="wf-row '+kind+'" style="--i:'+n+'"><span>'+name+(hint?' <span class="muted" style="font-size:13px">'+hint+'</span>':'')+'</span><b class="num">'+(kind==='minus'?'−':(kind==='plus'?'+':''))+rub(Math.abs(val)).replace('−','')+'</b><div class="bar"><i style="width:'+clamp(Math.abs(val)/mx*100,0,100).toFixed(1)+'%"></i></div></div>'; }
  rows+=row('Выручка от продаж',r.revenue,'plus')+row('Выручка по заказам',r.contractRev,'plus')+row('Пластик и печать проданных изделий',r.cogs,'minus')+row('Упаковка и доставка',r.packTot,'minus')+row('Реклама',r.adCost,'minus')+row('Аренда, зарплаты, сервис',r.fixed,'minus')+
    row('Амортизация принтеров',r.depr,'minus','износ, не деньги')+row('Комиссия маркетплейса',r.commission,'minus')+row('Лиза и Макс (доля выручки)',r.royalty,'minus')+row('Хранение и уценка склада',r.storage+r.writeTot,'minus')+row('Проценты по кредиту',r.interest,'minus')+row('Штрафы',r.penalty,'minus')+row('Налоги',r.tax,'minus');
  var bestM = S.history.length>1 && S.history.every(function(x){ return r.profit>=x.profit; });
  var ins=insights(r);
  var prods=PROD_IDS.filter(function(id){ return r.rows[id] && (r.rows[id].q>0 || r.rows[id].sold>0 || r.rows[id].demand>0); }).map(function(id){
    var x=r.rows[id], P=PRODUCTS[id];
    return '<div class="prow"><div class="ph">'+productSVG(id,36)+'<div><b>'+P.short+'</b><span class="k">цена '+rub(x.price)+'</span></div></div><div><span class="k">напечатано</span><b>'+x.q+' шт.</b>'+(x.defects>0.5?' <span class="loss-t" style="font-size:12.5px">брак '+Math.round(x.defects)+'</span>':'')+'</div><div><span class="k">спрос → продано</span><b>'+x.demand+' → '+(x.sold+x.contractUnits)+'</b></div><div><span class="k">выручка</span><b>'+rub(x.revenue+x.contractRev)+'</b></div><div><span class="k">на складе</span><b>'+x.left+' шт.</b></div></div>';
  }).join('');
  var m=r.month, quizNext=(m%4===0);
  var h='<section class="card lined"><div class="row between" style="align-items:flex-end"><div><div class="eyebrow">'+MONTH_NAMES[m-1]+': итоги месяца</div><h1 id="pagetitle" tabindex="-1" class="profit num '+(r.profit>=0?'gain-t':'loss-t')+'" style="margin-top:6px"><span id="profitnum" data-v="'+Math.round(r.profit)+'">'+(r.profit>=0?'+':'')+rub(r.profit)+'</span></h1><p class="muted">чистая прибыль за месяц</p></div>'+
    '<div class="chips">'+(bestM?'<span class="chip brand">'+ico('star')+' лучший месяц</span>':'')+'<span class="chip info">'+ico('clock')+' часы: '+Math.round(r.hours)+' из '+r.H+'</span><span class="chip">Капитал: '+rub(r.cap)+'</span>'+(ratingNow()>0?'<span class="chip">Рейтинг мастерской: '+ratingText(ratingNow())+'</span>':'')+'</div></div></section>';
  h+='<section class="card stack"><h2 style="font-size:20px">Путь месяца: откуда → куда</h2>'+flowHTML(r,true)+'</section>';
  h+='<div class="two"><section class="card stack"><h2 style="font-size:20px">Как получилась прибыль</h2><div class="wf">'+rows+'<div class="wf-row sum"><span>Прибыль</span><b class="num '+(r.profit>=0?'gain-t':'loss-t')+'">'+rub(r.profit)+'</b></div></div></section>'+
    '<section class="card stack"><h2 style="font-size:20px">Твоя башня слоёв</h2><div class="tower-wrap">'+towerSVG(S.history,{animateLast:true})+'</div><p class="muted" style="font-size:14px">Каждый месяц это слой. Ширина слоя зависит от выручки, зелёный цвет значит прибыль, штриховка значит убыток.</p></section></div>';
  h+='<section class="card stack"><h2 style="font-size:20px">Что и как продавалось</h2><div class="prows">'+prods+'</div></section>';
  h+=ordersReportHTML(r); h+=goalsReportHTML(r);
  (r.labDone||[]).forEach(function(x){ h+='<div class="callout ok">'+ico('check')+'<div><b>Исследование завершено: '+x.name+'.</b> Эффект: '+x.effect+'.</div></div>'; });
  if(r.wet) h+='<div class="callout warn">'+ico('warn')+'<div><b>Пластик отсыревает.</b> Запас больше '+FIL_WET+' кг впитывает влагу, и в следующем месяце брак выше на 2 п.п.</div></div>';
  var pg=r.progress||{ach:[],mile:[]};
  if(pg.mile.length||pg.ach.length){
    h+='<section class="card lined stack"><div class="eyebrow">Новое</div>'+pg.mile.map(function(m){ return '<div class="callout ok">'+ico('star')+'<div><b>Веха: капитал '+rub(m)+'!</b> Технопарк достроен на '+Math.round(m/GOAL*100)+'%. '+({250000:'Фил: «Четверть пути. Я посчитал слои: их уже больше, чем я помню».',500000:'Фил: «Половина! Мой датчик гордости зашкаливает».',750000:'Фил: «Осталось совсем чуть-чуть. Не сглазить бы».'}[m])+'</div></div>'; }).join('')+
      '<div class="chips pop-in">'+pg.ach.map(function(a,i){ return '<span class="chip brand" style="--i:'+i+'">'+ico(a.icon)+' Награда: '+a.name+'</span>'; }).join('')+'</div></section>';
  }
  h+=reviewsHTML(r);
  h+=myqHTML();
  h+='<section class="card flat stack"><div class="row" style="align-items:flex-start;gap:14px">'+avatarSVG('phil',r.profit>=0?'happy':'worried',48)+'<div class="stack" style="flex:1;min-width:0"><div class="eyebrow">Разбор от Фила</div>'+ins.map(function(i){ return '<div class="callout '+(i.k==='info'?'':i.k)+'" style="padding:10px 14px">'+ico(i.k==='ok'?'check':(i.k==='info'?'info':'warn'))+'<div>'+i.t+'</div></div>'; }).join('')+'</div></div></section>';
  if(r.fact) h+='<div class="callout">'+ico('sparkle')+'<div><b>Знаешь ли ты?</b> '+esc(r.fact)+'</div></div>';
  h+='<div><button class="btn primary" data-act="afterreport">'+(quizNext?'Проверить прошивку Фила (вопросы)':'Следующий месяц')+ico('right')+'</button></div>';
  return h;
}

/* ---------- викторина ---------- */
function startQuiz(ch){
  var pool=shuffle(QUIZ[ch].slice()).slice(0,QUIZ_PICK);
  U.quiz={ch:ch, i:0, picked:null, correct:0, qs:pool.map(function(q){ return {q:q.q, e:q.e, opts:shuffle(q.a.map(function(t,i){ return {t:t,ok:i===q.c}; }))}; })};
  U.screen='quiz';
}
function quizHTML(){
  var Q=U.quiz, q=Q.qs[Q.i], ch=CHAPTERS[Q.ch], L='АБВГ';
  var h='<section class="card lined stack-lg"><div class="row between"><div class="row" style="gap:14px">'+avatarSVG('phil',Q.picked==null?'neutral':(q.opts[Q.picked].ok?'excited':'sad'),56)+'<div><div class="eyebrow">Проверка прошивки · акт «'+ch.name+'»</div><h1 id="pagetitle" tabindex="-1" style="font-size:clamp(22px,3.6vw,30px);margin-top:4px">Вопрос '+(Q.i+1)+' из '+Q.qs.length+'</h1></div></div><span class="chip brand">'+ico('coin')+' +'+rub(QUIZ_BONUS)+' за верный ответ</span></div>'+
    '<div class="qprog" aria-hidden="true">'+Q.qs.map(function(x,i){ return '<i class="'+((i<Q.i||(i===Q.i&&Q.picked!=null))?'on':'')+'"></i>'; }).join('')+'</div>'+
    '<p style="font-size:19px;font-weight:600;max-width:60ch">'+q.q+'</p><div class="qopts" role="group" aria-label="Варианты ответа">';
  q.opts.forEach(function(o,i){ var cls=''; if(Q.picked!=null) cls=o.ok?'right':(Q.picked===i?'wrong':'dim'); h+='<button class="qopt '+cls+'" data-act="qpick" data-i="'+i+'"'+(Q.picked!=null?' disabled':'')+'><span class="k">'+L[i]+'</span><span>'+o.t+'</span></button>'; });
  h+='</div></section>';
  if(Q.picked!=null){ var ok=q.opts[Q.picked].ok; h+='<div class="callout '+(ok?'ok':'bad')+'" role="status">'+ico(ok?'check':'info')+'<div><b>'+(ok?'Верно! ':'Не совсем. ')+'</b>'+q.e+'</div></div><div><button class="btn primary" data-act="qnext">'+(Q.i===Q.qs.length-1?'Узнать результат':'Дальше')+ico('right')+'</button></div>'; }
  return h;
}

/* ---------- конец акта, конец урока, финал ---------- */
function chapterHTML(){
  var I=U.chapterInfo, ch=CHAPTERS[I.ch], next=CHAPTERS[I.ch+1];
  var h='<section class="card lined stack-lg"><div class="eyebrow">Акт '+(I.ch+1)+' завершён</div><h1 id="pagetitle" tabindex="-1" style="font-size:clamp(28px,4.4vw,42px)">«'+ch.name+'»</h1>'+
    '<div class="dialog">'+bubble(say('nar','neutral',ch.outro||'Последний слой лёг на место.'),0)+'</div>'+
    '<div class="chips"><span class="chip '+(I.correct>=2?'gain':'loss')+'">'+ico('cap')+' Верных ответов: '+I.correct+' из '+QUIZ_PICK+'</span><span class="chip brand">'+ico('coin')+' Грант: +'+rub(I.bonus)+'</span><span class="chip '+(I.profit>=0?'gain':'loss')+'">Прибыль за акт: '+rub(I.profit)+'</span><span class="chip">Капитал: '+rub(ownerCapital(S))+'</span></div></section>';
  h+=wsCard('Мастерская к концу акта «'+ch.name+'»', S.printers.length+' '+plural(S.printers.length,'принтер','принтера','принтеров'));
  h+='<div class="two"><section class="card stack"><h2 style="font-size:20px">Башня слоёв</h2><div class="tower-wrap">'+towerSVG(S.history,{})+'</div></section><section class="card stack"><h2 style="font-size:20px">Капитал по месяцам</h2>'+capChartSVG(S.history,{})+'</section></div>';
  h+='<div><button class="btn primary" data-act="chapternext">'+(I.ch===3?'Узнать решение комиссии':(I.ch===1?'Завершить урок 1':'Акт '+(I.ch+2)+' «'+next.name+'»'))+ico('right')+'</button></div>';
  return h;
}
function lessonEndHTML(){
  var code=exportCode();
  return '<section class="card lined stack-lg"><div class="eyebrow">Урок 1 завершён</div><h1 id="pagetitle" tabindex="-1" style="font-size:clamp(28px,4.4vw,42px)">Половина пути пройдена</h1>'+
    '<div class="dialog">'+bubble(say('phil','happy','Мы дошли до апреля! Капитал: '+rub(ownerCapital(S))+'. Игра сохранена на этом устройстве. Продолжим на втором уроке.'),0)+bubble(say('sem','neutral','В следующий раз будет сложнее: кредиты, инфляция, конкуренты и испытания на прочность. Отдохните.'),1)+'</div>'+
    '<p>На втором уроке открой игру на этом же компьютере и нажми «Продолжить». Если компьютер другой, скопируй код ниже и загрузи его на заставке.</p>'+
    '<div class="chips"><span class="chip gain">'+ico('check')+' Акты I и II пройдены</span><span class="chip info">Верно: '+qTotal()+' из '+S.quizTotal+'</span></div>'+
    '<div class="field"><label for="savecode">Код сохранения</label><textarea class="input" id="savecode" readonly rows="4">'+code+'</textarea></div><div class="row"><button class="btn small" data-act="copysave">'+ico('copy')+' Скопировать код</button></div>'+
    '<div class="callout">'+ico('book')+'<div><b>Для учителя.</b> Результат ученика: <span class="mono" style="font-size:13px">'+esc(resultLine())+'</span></div></div>'+
    '<div><button class="btn primary" data-act="lessonnext">Продолжить: урок 2'+ico('right')+'</button></div></section>';
}
function finalHTML(){
  var cap=ownerCapital(S), ti=tierOf(cap), T=TIERS[ti], badges=BADGES.map(function(b){ return {b:b,on:b.test(S)}; }), got=badges.filter(function(x){ return x.on; }).length;
  var bestM=S.history.reduce(function(a,b){ return b.profit>a.profit?b:a; },S.history[0]);
  var epi=epilogue(S);
  var h='<section class="card lined"><div class="final-hero"><div class="stack-lg"><div><div class="eyebrow">'+(cap>=GOAL?'Цель достигнута':'Игра окончена')+' · решение комиссии</div><h1 id="pagetitle" tabindex="-1" class="rank" style="margin-top:6px">'+T.title+'</h1></div>'+
    '<div><div class="big-goal num">'+rub(cap)+'</div><p class="muted">итоговый капитал, цель: '+rub(GOAL)+'</p></div>'+
    '<div class="callout '+(ti<=1?'ok':(ti<=3?'':'warn'))+'">'+ico(ti<=1?'star':'info')+'<div><b>'+T.verdict+'.</b> '+T.text+'</div></div>'+
    '<div class="chips"><span class="chip info">Вопросы: '+qTotal()+' из '+S.quizTotal+'</span><span class="chip info">'+ico('doc')+' Заказы: '+((S.orderStats&&S.orderStats.done)||0)+' из '+((S.orderStats&&S.orderStats.taken)||0)+'</span><span class="chip info">'+ico('target')+' Цели месяцев: '+(S.goalStars||0)+' из '+(S.goalTotal||0)+'</span><span class="chip">Выручка за игру: '+rub(S.totalRevenue)+'</span>'+(bestM?'<span class="chip brand">Лучший месяц: '+MONTH_NAMES[bestM.m-1]+', '+rub(bestM.profit)+'</span>':'')+'<span class="chip gain">Наград: '+got+' из '+BADGES.length+'</span></div></div>'+
    '<div class="tower-wrap">'+towerSVG(S.history,{h:300,w:380})+'</div></div></section>';
  h+=wsCard('Мастерская на финише', S.printers.length+' '+plural(S.printers.length,'принтер','принтера','принтеров'));
  h+='<section class="card stack-lg"><h2 style="font-size:22px">Что было дальше</h2><div class="dialog">'+bubble(say('sem','happy',T.sem),0)+bubble(say('phil',ti<=2?'excited':'happy',T.phil),1)+epi.map(function(e,i){ return bubble(say(e.who,'happy',e.t),i+2); }).join('')+'</div></section>';
  h+='<div class="two"><section class="card stack"><h2 style="font-size:20px">Капитал по месяцам</h2>'+capChartSVG(S.history,{})+'</section><section class="card stack"><h2 style="font-size:20px">Награды</h2><div class="badges">'+badges.map(function(x){ return '<div class="bdg '+(x.on?'on':'off')+'">'+ico(x.b.icon)+'<div><b>'+x.b.name+'</b><small>'+x.b.desc+'</small></div></div>'; }).join('')+'</div></section></div>';
  h+='<section class="card stack"><h2 style="font-size:20px">Результат для учителя</h2><div class="field"><label for="resline" class="sr-only">Результат</label><textarea class="input" id="resline" readonly rows="2">'+esc(resultLine())+'</textarea></div><div class="row"><button class="btn small" data-act="copyres">'+ico('copy')+' Скопировать</button></div></section>';
  h+='<section class="lesson">'+avatarSVG('phil','happy',44)+'<div><b>Главный вывод.</b> Бизнес это постоянный выбор между риском и выгодой, расходами и доходами, сегодня и завтра. За 16 месяцев мастерская училась делить часы печати между товарами, считать прибыль за час, платить налоги, выбирать между кредитом и инвестором, страховаться, спорить с конкурентом и переживать кризис. Это те же решения, которые принимают настоящие предприниматели.</div></section>';
  h+='<div class="row"><button class="btn primary" data-act="restart">'+ico('refresh')+' Сыграть ещё раз</button><button class="btn" data-act="glossary">'+ico('book')+' Открыть словарик</button></div>';
  return h;
}
function monthMapHTML(){
  var nodes=[['news','Сцена','случается событие, ты выбираешь вариант'],['doc','Заказы','клиенты предлагают сделки с готовой ценой'],['printer','Планирование','что печатать, цены, склад, развитие'],['play','Печать','месяц проходит, считаются продажи'],['coin','Итоги','прибыль, отзывы, цели и вопросы']];
  return '<div class="flow v" aria-label="Схема одного месяца">'+nodes.map(function(n,i){ return '<div class="fnode"'+(i===4?' data-end="1"':'')+'><span class="fico">'+ico(n[0])+'</span><b>'+(i+1)+'. '+n[1]+'</b><span>'+n[2]+'</span></div>'; }).join('')+'</div>';
}
function helpHTML(){
  return '<div class="stack"><div class="eyebrow">Как проходит каждый месяц</div>'+monthMapHTML()+'<div class="lesson">'+avatarSVG('phil','happy',44)+'<div><b>Как это работает.</b> У тебя ограниченное число <b>часов печати</b>. Каждый товар занимает разное время и приносит разную прибыль.</div></div>'+
    '<ol class="stack" style="padding-left:1.3em;margin:0"><li><b>Цена.</b> Чем выше, тем меньше покупателей. Кривая рядом с товаром показывает спрос. Оранжевая точка это твоя цена.</li><li><b>Сколько напечатать.</b> Не больше, чем купят: остатки дешевеют. Не меньше, чем нужно: иначе покупатели уйдут.</li><li><b>Прибыль за час.</b> Показывает, какой товар выгоднее печатать, когда часов мало. Лучший отмечен звездой.</li><li><b>Вкладки.</b> «Заказы»: клиенты с готовой сделкой. «Печать»: цены и количество. «Рынок»: сезонный спрос. «Покупки»: принтеры и помощники. «Финансы»: налоги и вклады. Начинай с заказов.</li><li><b>Режим печати.</b> «Быстро» экономит часы, «Тонко» делает изделия лучше и дороже в глазах покупателей.</li><li><b>Мастерская и финансы.</b> Там можно купить принтеры, нанять людей, оформить вклад и страховку.</li></ol>'+
    '<p class="muted">Прогноз приблизительный: спрос колеблется на несколько процентов, как в жизни.</p><div><button class="btn primary" data-act="closemodal">Понятно</button></div></div>';
}

/* ---------- отрисовка ---------- */
function stageHTML(){
  switch(U.screen){
    case 'title': return titleHTML();
    case 'intro': return introHTML();
    case 'setup': return setupHTML();
    case 'teacher': return teacherHTML();
    case 'qc': return qcHTML();
    case 'slicer': return slicerHTML();
    case 'calib': return calibHTML();
    case 'scene': return sceneHTML();
    case 'plan': return planHTML();
    case 'run': return runHTML();
    case 'report': return reportHTML();
    case 'quiz': return quizHTML();
    case 'chapter': return chapterHTML();
    case 'lessonend': return lessonEndHTML();
    case 'final': return finalHTML();
  }
  return '';
}
function renderTools(){
  var d=isDark();
  $('#tools').innerHTML='<button class="iconbtn" data-act="glossary" aria-label="Словарик терминов" title="Словарик">'+ico('book')+'</button>'+
    '<button class="iconbtn" data-act="sound" aria-label="Звук" aria-pressed="'+soundOn+'" title="'+(soundOn?'Звук включён':'Звук выключен')+'">'+ico(soundOn?'vol':'mute')+'</button>'+
    '<button class="iconbtn" data-act="theme" aria-label="Сменить тему" title="Сменить тему">'+ico(d?'sun':'moon')+'</button>';
}
function render(keep){
  if(U.screen!=='run') clearRunTimers();
  var st=$('#stage');
  st.classList.toggle('enter',!keep);
  st.innerHTML=stageHTML();
  renderHud(); renderActionBar(); renderTools();
  if(!keep){
    window.scrollTo(0,0);
    var h=$('#pagetitle'); if(h){ try{ h.focus({preventScroll:true}); }catch(e){} }
  }
  if(U.screen==='run') startRun();
  startPrinterLoop();
  var at=$('.tab[aria-selected="true"]'), tb=$('.tabs'); if(at && tb && tb.scrollWidth>tb.clientWidth) tb.scrollLeft=at.offsetLeft-(tb.clientWidth-at.offsetWidth)/2;
  if(U.screen==='report'){ var pn=$('#profitnum'); if(pn && !keep){ var v=+pn.getAttribute('data-v'); animateNumber(pn,0,v,900,function(x){ return (x>=0?'+':'')+rub(x); }); } }
  if(S && U.screen!=='title') persist();
}
function enterMonth(){ U.screen='scene'; U.stage=0; U.res=[]; U.view=null; render(); }
function toPlan(){
  prepareMonth(); U.screen='plan'; U.tab='orders'; U.seen={}; U.hag=null; U.view=null; U.res=[]; render();
  if(!U.helpSeen){ U.helpSeen=true; openModal('Как это работает', helpHTML()); }
}
function copyText(text, sel){
  var done=function(){ toast('Скопировано'); };
  var fallback=function(){ var e=$(sel); if(e){ e.focus(); e.select(); } toast('Выдели текст и нажми Ctrl+C'); };
  try{ navigator.clipboard.writeText(text).then(done, fallback); }catch(e){ fallback(); }
}

/* цикл печати: каждые несколько секунд принтеры начинают следующую копию (слои и портал синхронны) */
var loopT=0;
function startPrinterLoop(){
  clearInterval(loopT); loopT=0;
  if(reduced || !$('.printer.working')) return;
  loopT=setInterval(function(){
    if(document.hidden) return;
    $$('.printer.working').forEach(function(el){ el.classList.remove('working'); void el.getBoundingClientRect(); el.classList.add('working'); });
  }, 3900);
}

/* ---------- действия ---------- */
var A={
 start:function(){
   var sv=readSave(); if(sv && !U.confirmNew){ U.confirmNew=true; render(true); return; }
   var nm=($('#pname').value||'').trim()||'Мастер'; U.confirmNew=false;
   S=newState(nm); U={screen:'intro', slide:0}; hudPrev={}; sfx('coin'); render();
 },
 continue:function(){ var sv=readSave(); if(sv){ applySave(sv); hudPrev={}; render(); } },
 loadcode:function(){ openModal('Загрузить игру','<p class="muted">Вставь код сохранения, который был показан в конце прошлого урока.</p><div class="field"><label for="loadcode">Код сохранения</label><textarea class="input" id="loadcode" rows="5" placeholder="Вставь код сюда"></textarea></div><p class="loss-t" id="loaderr" role="alert"></p><div><button class="btn primary" data-act="doload">Загрузить</button></div>'); },
 doload:function(){ var v=$('#loadcode').value; if(importCode(v)){ closeModal(); hudPrev={}; render(); toast('Игра загружена'); } else $('#loaderr').textContent='Код не подошёл. Проверь, что скопировал его целиком.'; },
 introprev:function(){ U.slide=Math.max(0,(U.slide||0)-1); render(); },
 intronext:function(){
   if((U.slide||0)===2 && !S.setupDone){ toSetup(); return; }
   U.slide=Math.min(introSlides().length-1,(U.slide||0)+1); render();
 },
 introskip:function(){ if(!S.setupDone){ toSetup(); return; } U.slide=introSlides().length-1; render(); },
 setupback:function(){ U.screen='intro'; U.slide=2; render(); },
 rname:function(){ var cur=U.setup.shop, pool=SHOP_NAMES.filter(function(x){ return x!==cur; }); U.setup.shop=pool[Math.floor(Math.random()*pool.length)]; render(true); var e=$('#shopname'); if(e) e.focus(); },
 ptalent:function(el){ U.setup.talent=el.getAttribute('data-k'); render(true); var e=$('[data-act=ptalent][data-k='+U.setup.talent+']'); if(e) e.focus(); },
 pdiff:function(el){ U.setup.diff=el.getAttribute('data-k'); render(true); var e=$('[data-act=pdiff][data-k='+U.setup.diff+']'); if(e) e.focus(); },
 setupdone:function(){
   var o=U.setup; if(!o.talent){ toast('Выбери талант: он даёт бонусы и особые варианты в сценах'); return; }
   applySetup(S,o); U.screen='intro'; U.slide=3; sfx('coin'); render();
 },
 tocalib:function(){ U.screen='calib'; U.calib={t:38+Math.floor(Math.random()*24), v:Math.random()<0.5?8+Math.floor(Math.random()*10):86+Math.floor(Math.random()*10), done:false}; render(); },
 skipcalib:function(){ enterMonth(); },
 calibstep:function(el){ var C=U.calib; C.v=clamp(C.v+(+el.getAttribute('data-d')),0,100); var r=$('#calibrange'); if(r) r.value=C.v; calibLive(); },
 calibfix:function(){
   var m=calibMeta(), g=m.q>=0.9?'perfect':(m.q>=0.6?'good':'bad');
   if(g==='perfect'){ S.rep=clamp(S.rep+3,0,100); addMod(S,'fail',-0.02,2,'Идеальный первый слой'); sfx('good'); burst(40); }
   else if(g==='good'){ S.rep=clamp(S.rep+1,0,100); sfx('coin'); }
   else { addMod(S,'fail',0.02,2,'Кривой первый слой'); sfx('bad'); }
   S.flags.calib=g; U.calib.done=true; U.calib.grade=g; render();
 },
 calibdone:function(){ enterMonth(); },
 choose:function(el){
   var i=+el.getAttribute('data-i'), st=U.stage||0, v=sceneView(), vc=v.choices[i];
   if(!vc || vc.why || (U.res&&U.res[st])) return;
   var stg=stagesOf(S)[st], c=choicesOf(S,stg)[i];
   var chips=c.apply(S, rngFor(S,'ev'+S.month+':'+st)), gap=coverDeficit(S);
   if(gap) chips.push(chip('Денег не хватило: банк покрыл '+rub(gap)+' в долг','loss'));
   addTerm(stg.term);
   U.res=U.res||[]; U.res[st]={i:i, chips:chips, reply:c.reply||null};
   sfx('click'); render(true);
   var n=$('.lesson'); if(n && n.scrollIntoView && !reduced) n.scrollIntoView({behavior:'smooth',block:'center'});
 },
 scenenext:function(){ var v=sceneView(); if((U.stage||0)<v.n-1){ U.stage=(U.stage||0)+1; U.view=null; render(); } else toPlan(); },
 help:function(){ openModal('Как это работает', helpHTML()); },
 tab:function(el){ U.tab=el.getAttribute('data-t'); U.seen=U.seen||{}; U.seen[U.tab]=true; U.hag=null; render(true); window.scrollTo(0,0); },
 oacc:function(el){
   var id=el.getAttribute('data-id'), r=acceptOffer(S,id); U.seen=U.seen||{};
   if(!r.ok){ toast(r.why); return; }
   U.seen.deal=true; addTerm('order'); U.hag=null; fitCash(); sfx('coin');
   toast(r.switched?'Заказ принят. Режим печати: «Тонко»':'Заказ принят'); render(true);
 },
 odrop:function(el){ dropOffer(S,el.getAttribute('data-id')); fitCash(); render(true); },
 ono:function(el){
   var res=declineOffer(S,el.getAttribute('data-id')); U.seen=U.seen||{}; U.seen.deal=true; U.hag=null;
   if(res && res.lesson){ addTerm('ip'); sfx('good'); toast('Верное решение: репутация +1'); }
   render(true);
 },
 ohag:function(el){ U.hag=el.getAttribute('data-id'); render(true); var b=$('.hag button'); if(b) b.focus(); },
 hagno:function(){ U.hag=null; render(true); },
 hagp:function(el){
   var id=el.getAttribute('data-id'), r=haggleOffer(S,id,HAGGLE[+el.getAttribute('data-i')].pct), o=offerById(S,id); U.seen=U.seen||{}; U.seen.deal=true; U.hag=null;
   if(r && o){ o.msg={res:r.res, who:r.who, t:r.t}; addTerm('bargain'); sfx(r.res==='win'?'good':(r.res==='gone'?'bad':'click')); if(r.res==='win') toast('Выторговано: '+rub(r.price)+' за штуку'); }
   fitCash(); render(true);
 },
 mode:function(el){
   var nm=el.getAttribute('data-m');
   if(!modeFits(S,nm)){ toast('В этом режиме часов не хватит на принятые заказы. Откажись от части заказов или выбери режим быстрее.'); return; }
   S.plan.mode=nm;
   PROD_IDS.forEach(function(id){ var b=priceBounds(S,id,S.plan.mode); S.plan.price[id]=clamp(S.plan.price[id],b.min,b.max); });
   S.plan.qty=sanitizePlan(S,S.plan).qty; fitCash(); sfx('click');
   if(S.plan.mode!=='fine' && S.contracts.some(function(c){ return c.fine; })) toast('Заказу «Премиум» нужен режим «Тонко»: иначе он будет сорван');
   render(true);
 },
 ad:function(el){ S.plan.ad=+el.getAttribute('data-i'); fitCash(); render(true); },
 step:function(el){
   var k=el.getAttribute('data-k'), id=el.getAttribute('data-id'), d=+el.getAttribute('data-d');
   if(k==='price'){ var b=priceBounds(S,id,S.plan.mode); S.plan.price[id]=clamp(S.plan.price[id]+d,b.min,b.max); }
   else { S.plan.qty[id]=clamp(S.plan.qty[id]+d,lockQty(S,id),Math.max(lockQty(S,id),maxQtyFor(S,S.plan,id))); U.seen=U.seen||{}; U.seen.qty=true; }
   liveUpdate();
 },
 qfdem:function(el){ var id=el.getAttribute('data-id'), pv=previewMonth(S,S.plan,1), r=pv.rows[id]; if(!r) return; S.plan.qty[id]=clamp(Math.round(r.demand)-S.inv[id]+contractQty(S,id),lockQty(S,id),Math.max(lockQty(S,id),maxQtyFor(S,S.plan,id))); markQty(); },
 qffill:function(el){ var id=el.getAttribute('data-id'); S.plan.qty[id]=Math.max(lockQty(S,id),maxQtyFor(S,S.plan,id)); markQty(); },
 qfzero:function(el){ var id=el.getAttribute('data-id'); S.plan.qty[id]=lockQty(S,id); markQty(); },
 fnote:function(el){ var k=el.getAttribute('data-k'), f=FLOW_INFO[k]; openModal(f[0],'<div class="stack"><p>'+f[1]+'</p><div><button class="btn primary" data-act="closemodal">Понятно</button></div></div>'); },
 fbuy:function(el){ var kg=+el.getAttribute('data-kg'), k=el.getAttribute('data-sup'), r=buyFil(S,kg,k); if(r.ok){ sfx('coin'); toast('Куплено '+kg+' кг: '+SUPPLIERS[k].name); fitCash(); } else toast(r.why); render(true); },
 liq:function(el){ var id=el.getAttribute('data-id'), r=liquidate(S,id); if(r.ok){ sfx('coin'); addTerm('sunk'); toast('Продано оптом '+r.n+' шт. за '+rub(r.got)+'. Недополучено '+rub(r.lost)); fitCash(); } render(true); },
 research:function(el){ var id=el.getAttribute('data-id'), r=startResearch(S,id); if(r.ok){ sfx('coin'); addTerm('rd'); toast('Исследование начато: '+RESEARCH_BY_ID[id].name); fitCash(); } else toast(r.why); render(true); },
 suggest:function(){ U.seen=U.seen||{}; U.seen.qty=true; suggestPlan(S,false); fitCash(); toast('Фил предложил план'); render(true); },
 buyp:function(el){ var t=el.getAttribute('data-t'), r=buyPrinter(S,t); if(r.ok){ sfx('coin'); toast('Куплено: '+PRINTERS[t].name); fitCash(); } else toast(r.why); render(true); },
 hire:function(el){ var k=el.getAttribute('data-k'); if(hireStaff(S,k)){ sfx('coin'); toast('Нанят: '+STAFF[k].name); } render(true); },
 fire:function(el){ var k=el.getAttribute('data-k'); fireStaff(S,k); toast('Сотрудник уволен'); S.plan.qty=sanitizePlan(S,S.plan).qty; render(true); },
 moveto:function(el){ var k=el.getAttribute('data-k'), r=moveSpace(S,k); if(r.ok){ sfx('coin'); toast('Переезд в «'+SPACES[k].name+'»'); } else toast(r.why); render(true); },
 chan:function(el){
   var k=el.getAttribute('data-k');
   if(k==='market') S.channel.market=!S.channel.market;
   else if(!S.channel.site && S.cash>=15000){ S.cash-=15000; S.channel.site=true; sfx('coin'); }
   render(true);
 },
 service:function(){ S.service=!S.service; render(true); },
 insure:function(){ S.insurance=!S.insurance; toast(S.insurance?'Страховка оформлена':'Страховка отменена'); render(true); },
 mv:function(el){
   var k=el.getAttribute('data-k'), d=el.getAttribute('data-d'), amt;
   if(d==='all') amt=Math.max(0,Math.floor(S.cash)); else if(d==='-all') amt=-S[k]; else amt=+d;
   if(amt>0) amt=Math.min(amt,Math.floor(S.cash)); else amt=-Math.min(-amt,Math.floor(S[k]));
   if(!amt){ toast(+d>0||d==='all'?'На счету нет свободных денег':'Здесь нечего забирать'); return; }
   S.cash-=amt; S[k]+=amt; sfx('click'); fitCash(); render(true);
 },
 repay:function(el){
   var d=el.getAttribute('data-d'), amt=d==='all'?S.loanLeft:+d; amt=Math.min(amt,S.loanLeft,Math.floor(S.cash)); if(amt<=0) return;
   S.cash-=amt; S.loanLeft-=amt; if(S.loanLeft<1){ S.loanLeft=0; S.loanStep=0; } else S.loanStep=Math.min(S.loanStep,S.loanLeft);
   sfx('coin'); toast('Погашено: '+rub(amt)); render(true);
 },
 go:function(){
   var pv=previewMonth(S,S.plan,1); if(pv.cashNow>S.cash+0.5){ toast('Не хватает денег на закупку. Уменьши выпуск.'); return; }
   var w=U.goOk?[]:goWarnings(); var viaOk=U.goOk; U.goOk=false;
   if(w.length){ openModal('Перед печатью','<div class="stack">'+w.map(function(x){ return '<div class="callout warn">'+ico('warn')+'<div>'+x+'</div></div>'; }).join('')+'<div class="row"><button class="btn primary" data-act="gosure">Всё равно печатать</button><button class="btn" data-act="closemodal">Вернуться к плану</button></div></div>'); return; }
   if(slicerNeeded(S) && !U.slicerDone){ U.slicer={t:215,v:60,f:30,tries:[],left:SLICER_TRIES,target:slicerTarget(S)}; U.screen='slicer'; render(); return; }
   U.slicerDone=false;
   var before=S.cash, r=runMonth(S); r.cashBefore=before; r.cashAfter=S.cash;
   settleGoals(S,r); if(r.goals&&r.goals.list.length) addTerm('kpi'); if((r.orders||[]).some(function(o){ return o.trust>=1; })) addTerm('trust');
   r.progress=checkProgress(S,r); r.fact=factFor(S,'m'+r.month); r.reviews=makeReviews(S,r); S.rate=S.rate||{u:0,s:0}; S.rate.u+=r.reviews.units; S.rate.s+=r.reviews.avg*r.reviews.units;
   r.slicerGrade=U.slicerGrade||null; U.slicerGrade=null; U.myq=myqBuild(r);
   U.report=r; U.screen=reduced?'report':'run'; U.tab='biz';
   if(reduced){ render(); sfx(r.profit>=0?'good':'bad'); } else render();
 },
 slstep:function(el){ var k=el.getAttribute('data-k'), R=SLICER_RANGE[k], Z=U.slicer; Z[k]=clamp(Z[k]+(+el.getAttribute('data-d')),R.min,R.max); render(true); },
 sltry:function(){ var Z=U.slicer; if(Z.left<=0) return; Z.left--; Z.tries.push({set:{t:Z.t,v:Z.v,f:Z.f}}); var ok=slicerGrade(slicerCheck(Z.target,Z)); sfx(ok==='gold'?'good':'click'); if(ok==='gold') burst(24); render(true); },
 slfinal:function(){ var Z=U.slicer, g=slicerGrade(slicerCheck(Z.target,Z)); slicerApply(S,g); U.slicerGrade=g; U.slicerDone=true; U.slicer=null; sfx(g==='gold'?'win':(g==='bronze'?'bad':'good')); toast(g==='gold'?'Идеальные настройки: брак ниже, репутация +1':(g==='silver'?'Настройки неплохие':'Неточные настройки: брак выше')); U.screen='plan'; U.goOk=true; A.go(); },
 slskip:function(){ U.slicerDone=true; U.slicer=null; U.screen='plan'; U.goOk=true; A.go(); },
 myq:function(el){ var Q=U.myq; if(!Q||Q.picked!=null) return; var i=+el.getAttribute('data-i'); Q.picked=i; if(Q.opts[i]===Q.ans){ S.cash+=MYQ_REWARD; sfx('good'); if(U.report) U.report.cashAfter=S.cash; } else sfx('bad'); render(true); },
 gosure:function(){ closeModal(); U.goOk=true; A.go(); },
 runskip:function(){
   clearRunTimers(); var r=U.report; U.screen='report'; render();
   if(r.profit>0){ sfx('good'); burst(36); } else sfx('bad');
   if(r.progress&&r.progress.mile.length){ sfx('win'); burst(90); }
 },
 afterreport:function(){
   var m=U.report.month;
   if(m%4===0){ startQuiz(chapterOf(m)); render(); } else if(m%4===3){ qcStart(); } else enterMonth();
 },
 qpick:function(el){
   var Q=U.quiz; if(Q.picked!=null) return; var i=+el.getAttribute('data-i'); Q.picked=i;
   if(Q.qs[Q.i].opts[i].ok){ Q.correct++; sfx('good'); } else sfx('bad'); render(true);
 },
 qnext:function(){
   var Q=U.quiz;
   if(Q.i<Q.qs.length-1){ Q.i++; Q.picked=null; render(); return; }
   var ch=Q.ch, bonus=Q.correct*QUIZ_BONUS, m0=CHAPTERS[ch].months[0], m1=CHAPTERS[ch].months[1];
   S.cash+=bonus; S.quizScore.push(Q.correct); S.quizTotal+=Q.qs.length;
   var prof=sum(S.history.filter(function(x){ return x.m>=m0&&x.m<=m1; }).map(function(x){ return x.profit; }));
   U.chapterInfo={ch:ch, correct:Q.correct, bonus:bonus, profit:prof}; U.screen='chapter';
   if(Q.correct>=2){ sfx('win'); burst(46); } render();
 },
 chapternext:function(){
   var ch=U.chapterInfo.ch;
   if(ch===3){ U.screen='final'; var good=ownerCapital(S)>=GOAL*0.5; render(); if(good){ sfx('win'); burst(ownerCapital(S)>=GOAL?190:90); } }
   else if(ch===1){ U.screen='lessonend'; render(); }
   else enterMonth();
 },
 lessonnext:function(){ enterMonth(); },
 copysave:function(){ var e=$('#savecode'); copyText(e?e.value:'','#savecode'); },
 copyres:function(){ var e=$('#resline'); copyText(e?e.value:'','#resline'); },
 qcgo:function(){ qcNext(); },
 qcgood:function(){ qcAnswer(false); },
 qcbad:function(){ qcAnswer(true); },
 qcskip:function(){ clearTimeout(qcT); enterMonth(); },
 qcend:function(){ var g=qcGrade(); clearTimeout(qcT); if(g==='gold'){ S.rep=clamp(S.rep+2,0,100); addMod(S,'fail',-0.01,2,'Строгий контроль'); burst(40); sfx('good'); } else if(g==='silver'){ S.rep=clamp(S.rep+1,0,100); sfx('coin'); } enterMonth(); },
 teacher:function(){ U={screen:'teacher'}; render(); },
 boardgo:function(){ var v=$('#boardtxt').value; U.board=v; lsSet('lbl-board',v); render(true); },
 boardclear:function(){ U.board=''; lsSet('lbl-board',''); render(true); },
 restart:function(){ S=null; U={screen:'title'}; hudPrev={}; render(); },
 glossary:function(){ openModal('Словарик экономиста', glossaryHTML()); },
 closemodal:function(){ closeModal(); },
 modalbg:function(el, e){ if(e.target===el) closeModal(); },
 theme:function(){ var d=!isDark(); document.documentElement.setAttribute('data-theme',d?'dark':'light'); lsSet(THEME_KEY,d?'dark':'light'); renderTools(); },
 sound:function(){ soundOn=!soundOn; lsSet(SND_KEY,soundOn?'1':'0'); renderTools(); sfx('click'); toast(soundOn?'Звук включён':'Звук выключен'); },
 skipnav:function(el,e){ e.preventDefault(); var st=$('#stage'); if(st) st.focus({preventScroll:false}); }
};

document.addEventListener('click',function(e){
  var el=e.target.closest('[data-act]'); if(!el) return;
  var a=el.getAttribute('data-act');
  if(el.disabled || el.getAttribute('aria-disabled')==='true') return;
  if(A[a]){ if(['go','choose','qpick','start','mode'].indexOf(a)<0) sfx('click'); A[a](el,e); }
});
document.addEventListener('input',function(e){
  var t=e.target; if(!S) return;
  if(t.id==='calibrange' && U.calib){ U.calib.v=+t.value; calibLive(); return; }
  if(t.id==='shopname' && U.setup){ U.setup.shop=t.value; var sg=$('#signart'); if(sg) sg.innerHTML=signSVG(cleanShopName(t.value)||'Слой за слоем'); return; }
  if(t.getAttribute && t.getAttribute('data-sl') && U.slicer){ var kk=t.getAttribute('data-sl'); U.slicer[kk]=+t.value; var vl=document.getElementById('slv-'+kk); if(vl) vl.textContent=t.value+' '+SLICER_RANGE[kk].unit; return; }
  if(t.id==='classcode' && U.setup){ U.setup.code=t.value; return; }
  if(U.screen==='plan' && t.type==='range' && t.getAttribute('data-k')){
    var id=t.getAttribute('data-id'), k=t.getAttribute('data-k'), val=+t.value;
    if(k==='price') S.plan.price[id]=val; else { S.plan.qty[id]=clamp(val,lockQty(S,id),Math.max(lockQty(S,id),maxQtyFor(S,S.plan,id))); U.seen=U.seen||{}; U.seen.qty=true; }
    liveUpdate();
  }
});
document.addEventListener('change',function(e){ if(S && e.target && e.target.type==='range') persist(); });
document.addEventListener('keydown',function(e){
  if(e.key==='Escape' && $('#modal .modal')){ closeModal(); return; }
  if(U.screen==='qc' && U.qc && U.qc.phase==='play' && !$('#modal .modal')){ var k=e.key.toLowerCase(); if(k==='arrowleft'||k==='г'||k==='g'){ e.preventDefault(); qcAnswer(false); return; } if(k==='arrowright'||k==='б'||k==='b'){ e.preventDefault(); qcAnswer(true); return; } }
  if(e.key==='Enter' && e.target && e.target.id==='pname'){ e.preventDefault(); A.start(); return; }
  if(e.key==='Tab' && $('#modal .modal')){
    var f=$$('#modal button, #modal textarea, #modal input, #modal a[href]').filter(function(x){ return !x.disabled; }); if(!f.length) return;
    var first=f[0], last=f[f.length-1];
    if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
  }
});

/* ---------- запуск ---------- */
function boot(){
  var th=lsGet(THEME_KEY); if(th) document.documentElement.setAttribute('data-theme',th);
  soundOn = lsGet(SND_KEY)==='1';
  U={screen:'title'}; S=null; render();
  window.__game={get S(){ return S; }, get U(){ return U; }, A:A, render:render, setState:function(s,u){ S=s; U=u; render(); }};
}
boot();
})();
