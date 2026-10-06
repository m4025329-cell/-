/* ===== Интерфейс, часть 2: титул, пролог, настройка, сцены, случаи, мини-игра, викторина ===== */
var A={};

/* ---------- рекорды ---------- */
function bestRecords(){ try{ return JSON.parse(lsGet(REC_KEY)||'{}')||{}; }catch(e){ return {}; } }
function saveRecord(){
  var b=bestRecords(), k=S.diff, c=Math.round(capital(S)), g=goalNow(S);
  if(!b[k]||c>b[k].cap) b[k]={cap:c, cities:g.cities, goal:goalMet(S), who:S.name};
  lsSet(REC_KEY,JSON.stringify(b));
}
function recordsHTML(){
  var b=bestRecords(), ks=Object.keys(b); if(!ks.length) return '';
  return '<p class="small muted" style="margin-top:10px">Лучшие партии на этом устройстве: '+ks.map(function(k){ return DIFFS[k].name+' — '+rubk(b[k].cap)+', городов: '+b[k].cities+(b[k].goal?' ✔':''); }).join('; ')+'</p>';
}

/* ---------- титульный экран ---------- */
function titleHTML(){
  var sv=readSave(), demo=makeOutlet('t','tula','cafe','Первый столик'); demo.eq={deco1:1,deco2:1,terr:1,music:1,kids:1}; demo.rep=82;
  return '<div class="hero"><div class="hero-card">'+cafeSVG(demo,{cal:5,guests:6,queue:2})+'<div class="hero-body"><h1>Первый столик</h1><p class="lead">Экономическая игра о кафе, которое растёт в сеть ресторанов в разных городах. Вы получаете в наследство закрытое кафе, тетрадь рецептов и карту бабушки Тамары. Нужно открыть дверь, собрать команду, считать деньги и дойти до цели за 16 месяцев (два урока).</p></div></div>'+
   '<div class="hero-body card" style="margin:0"><div class="btns">'+
   (sv?'<button class="btn" data-act="continue">'+ico('play')+' Продолжить: месяц '+Math.min(sv.S.month,TOTAL)+' из '+TOTAL+'</button><button class="btn secondary" data-act="newgame">'+ico('plus')+' Новая игра</button>':'<button class="btn" data-act="newgame">'+ico('play')+' Начать игру</button>')+
   '<div class="btnrow"><button class="btn ghost small" data-act="loadcode">'+ico('key')+' Загрузить код</button><button class="btn ghost small" data-act="teacher">'+ico('chart')+' Табло класса</button></div>'+
   '<div class="btnrow three"><button class="btn ghost small" data-act="help">'+ico('help')+' Как играть</button><button class="btn ghost small" data-act="glossary">'+ico('book')+' Словарик</button><button class="btn ghost small" data-act="awards">'+ico('award')+' Награды</button></div>'+
   '</div>'+recordsHTML()+'</div></div>';
}

/* ---------- пролог ---------- */
var INTRO=[
 {art:'letter', h:'Письмо из Тулы', t:'Приходит письмо от нотариуса. Бабушка Тамара оставила вам кафе «Первый столик». Оно закрыто с зимы: на двери замок, внутри пыль, а на подоконнике сидит кот Борщ и ждёт, когда его накормят.'},
 {art:'box', h:'Жестяная коробка', t:'В кафе вы находите коробку из-под печенья. В ней деньги, которые Тамара копила на открытие, и записка: «Деньги считай, чаевые не считай». Этого хватит на первые месяцы, но недолго.'},
 {art:'book', h:'Тетрадь и карта', t:'Рядом лежит клеёнчатая тетрадь. В ней рецепты, по одному на странице, и карта с красными булавками. Тамара много лет работала в вагоне-ресторане и в каждом городе записывала одно блюдо.'},
 {art:'train', h:'Цель', t:'Тамара мечтала, чтобы «Первый столик» стоял в каждом городе её маршрута. У вас 16 месяцев: два урока по восемь. Нужно открыть заведения в нескольких городах, держать рейтинг и накопить капитал. Цель зависит от выбранной сложности.'}
];
function introHTML(){
  var i=U.intro||0, s=INTRO[i], last=i===INTRO.length-1;
  return '<div class="slide">'+introArt(s.art)+'<h2>'+s.h+'</h2><p>'+s.t+'</p><div class="dots" aria-hidden="true">'+INTRO.map(function(_,k){ return '<i class="'+(k===i?'on':'')+'"></i>'; }).join('')+'</div>'+
   '<div class="row between"><button class="btn ghost small" data-act="introskip">Пропустить пролог</button><button class="btn" data-act="intronext">'+(last?'К настройке':'Дальше')+' '+ico('right')+'</button></div></div>';
}

/* ---------- настройка партии ---------- */
function setupHTML(){
  var st=U.setup||(U.setup={name:'',cafe:'Первый столик',code:'',talent:'cook',diff:'norm'});
  var tal=Object.keys(TALENTS).map(function(k){ var t=TALENTS[k]; return '<button type="button" aria-pressed="'+(st.talent===k)+'" data-act="settalent" data-v="'+k+'"><span class="ico">'+ico(t.icon)+'</span><span><b>'+t.name+'</b><small>'+t.desc+'</small></span></button>'; }).join('');
  var df=Object.keys(DIFFS).map(function(k){ var d=DIFFS[k]; return '<button type="button" aria-pressed="'+(st.diff===k)+'" data-act="setdiff" data-v="'+k+'"><span class="ico">'+ico(k==='easy'?'leaf':(k==='norm'?'target':'bolt'))+'</span><span><b>'+d.name+'</b><small>'+d.desc+'</small></span></button>'; }).join('');
  return '<h2>Создайте своё кафе</h2><p class="muted">Всё можно изменить: название, талант и сложность определяют стиль игры.</p>'+
   '<div class="field"><label for="f-name">Как вас зовут?</label><input id="f-name" type="text" maxlength="24" value="'+esc(st.name)+'" autocomplete="off" placeholder="Имя"><span class="hint">Имя увидит учитель на табло класса.</span></div>'+
   '<div class="field"><label for="f-cafe">Название кафе</label><input id="f-cafe" type="text" maxlength="28" value="'+esc(st.cafe)+'" autocomplete="off"><span class="hint">Если не менять, кафе называется как у Тамары.</span></div>'+
   '<div class="field"><label for="f-code">Код класса (необязательно)</label><input id="f-code" type="text" maxlength="12" value="'+esc(st.code)+'" autocomplete="off" placeholder="например, 8Б"><span class="hint">С одним кодом у всего класса будут одинаковые случайности: погода, новости и события.</span></div>'+
   '<div class="field"><label>Талант</label><div class="pick">'+tal+'</div></div>'+
   '<div class="field"><label>Сложность</label><div class="pick">'+df+'</div></div>'+
   '<div class="row between" style="margin:16px 0"><button class="btn ghost" data-act="tointro">'+ico('left')+' Назад</button><button class="btn" data-act="startgame">Открыть кафе '+ico('right')+'</button></div>';
}

/* ---------- карточка акта ---------- */
function actHTML(){
  var a=actOf(S.month), c=ACT_CARDS[a];
  return '<div class="actcard"><span class="kicker">'+c.sub+'</span><h1>'+c.title+'</h1><p class="muted" style="max-width:520px;margin:0 auto 10px">'+c.text+'</p><p><b>В этом акте вы узнаете:</b></p><ul>'+c.learn.map(function(x){ return '<li>'+ico('check')+x+'</li>'; }).join('')+'</ul>'+(S.month===9?'<p class="chip warn" style="margin:6px 0">Начинается урок 2</p>':'')+'<button class="btn" data-act="actgo" style="margin-top:8px">Начать '+ico('right')+'</button></div>';
}
function lastHTML(){
  var g=goalNow(S);
  return '<div class="actcard"><span class="kicker">Финал · Июнь</span><h1>Последний месяц</h1><p class="muted" style="max-width:520px;margin:0 auto 10px">В конце месяца гид «Золотая вилка» объявит решение. Оно зависит от вкуса, сервиса, чистоты, уюта и честной цены в выбранном заведении.</p>'+
   '<div class="chalk" style="text-align:left"><h3>Итоговая проверка</h3><ul><li class="'+(g.okCities?'done':'')+'">'+ico(g.okCities?'check':'target')+' Города: '+g.cities+' из '+g.needCities+'</li><li class="'+(g.okCap?'done':'')+'">'+ico(g.okCap?'check':'target')+' Капитал: '+rubk(g.cap)+' из '+rubk(g.needCap)+'</li><li class="'+(g.okRating?'done':'')+'">'+ico(g.okRating?'check':'target')+' Рейтинг: '+f1d(g.rating)+' из '+f1d(g.needRating)+'</li></ul></div>'+
   '<p><b>Какое заведение оценит гид?</b></p><div class="outsel" style="justify-content:center;flex-wrap:wrap">'+liveOutlets(S).map(function(o){ return '<button aria-pressed="'+((S.flags.forkOutlet||flagship(S).id)===o.id)+'" data-act="forkpick" data-o="'+o.id+'">'+ico('building','sm')+' '+esc(CITIES[o.city].n)+' · '+f1d(stars(o.rep))+'</button>'; }).join('')+'</div><button class="btn" data-act="actgo" style="margin-top:8px">В последний месяц '+ico('right')+'</button></div>';
}

/* ---------- сцена месяца ---------- */
function sceneState(){ return U.sc||(U.sc={step:0, done:[]}); }
function runChoice(opt, key){
  var out={fx:opt.fx, res:opt.res, ok:true};
  if(opt.chk){ var c=opt.chk(S), r=rngFor(S,'sc'+S.month+key)(); out.ok=r<c.p; var b=out.ok?c.ok:c.bad; out.fx=b.fx; out.res=b.res; out.p=c.p; }
  return out;
}
function sceneHTML(){
  var sc=sceneFor(S), st=sceneState(); if(!sc) return '';
  (sc.terms||[]).forEach(addTerm);
  var lines=sc.lines(S).map(function(l,i){ return bubble(l,i); }).join('');
  var steps='', i;
  for(i=0;i<st.done.length;i++){ var d=st.done[i], q=sc.ch[i]; steps+='<div class="card soft" style="margin:12px 0"><h4>'+esc(q.q)+'</h4><p class="muted small" style="margin:0 0 4px">Вы выбрали: <b>'+esc(d.t)+'</b></p></div>'+d.res.map(function(l,j){ return bubble(typeof l==='string'?{who:'nar',t:l}:l,j); }).join('')+chipsFx(d.fx); }
  var cur='';
  if(st.step<sc.ch.length){ var q2=sc.ch[st.step]; cur='<h3 style="margin-top:18px">'+esc(q2.q)+'</h3><div class="choices">'+q2.opts.map(function(o,k){ if(o.show&&!o.show(S)) return ''; return '<button class="choice" style="--i:'+k+'" data-act="pick" data-k="'+k+'"><b>'+esc(o.t)+'</b><span>'+esc(o.d)+'</span></button>'; }).join('')+'</div>'; }
  else cur=((sc.terms&&sc.terms.length)?'<div class="card soft"><b>Новые слова</b><div class="chips">'+sc.terms.map(termChip).join('')+'</div></div>':'')+'<div class="row" style="justify-content:flex-end;margin:16px 0"><button class="btn" data-act="scenenext">'+(S.month===16?'К итогам':'Дальше')+' '+ico('right')+'</button></div>';
  var act=ACTS[actOf(S.month)-1];
  return '<article class="scene"><div class="scene-head"><span class="chip brand">'+ico('flag','sm')+' '+act.name+'</span><span class="place">'+ico('pin','sm')+' '+esc(sc.place)+'</span></div><h2>'+esc(sc.title)+'</h2>'+lines+steps+cur+'</article>';
}
A.pick=function(el){
  var sc=sceneFor(S), st=sceneState(), q=sc.ch[st.step], k=+el.getAttribute('data-k'), opt=q.opts[k]; if(!opt) return;
  var r=runChoice(opt,'s'+st.step), chips=applyFx(S,r.fx);
  st.done.push({t:opt.t, res:r.res||[], fx:chips, ok:r.ok}); st.step++;
  sfx(r.ok?'good':'bad'); persist(); render(true); window.scrollTo({top:Math.max(0,$('.scene').offsetTop),behavior:reduced?'auto':'smooth'});
};
A.scenenext=function(){ U.sc=null; afterScene(); };
function afterScene(){
  var list=pickEvents(S);
  if(list.length){ U.ev={list:list, i:0}; U.evRes=null; U.screen='event'; render(); }
  else toPlan();
}

/* ---------- случаи ---------- */
function evCur(){ var e=U.ev; return e?EVENT_BY_ID[e.list[e.i]]:null; }
function eventHTML(){
  var ev=evCur(); if(!ev) return '';
  var head='<div class="scene-head"><span class="chip warn">'+ico('bolt','sm')+' Случай '+(U.ev.i+1)+' из '+U.ev.list.length+'</span></div><h2>'+esc(ev.title)+'</h2>'+bubble({who:ev.who,t:ev.text,mood:''},0);
  if(U.evRes){ var r=U.evRes; return '<article class="scene">'+head+'<div class="card soft"><b>Вы выбрали:</b> '+esc(r.t)+'</div>'+r.res.map(function(t,j){ return bubble({who:ev.who,t:t},j); }).join('')+chipsFx(r.fx)+'<div class="row" style="justify-content:flex-end;margin:16px 0"><button class="btn" data-act="evnext">Дальше '+ico('right')+'</button></div></article>'; }
  return '<article class="scene">'+head+'<div class="choices">'+ev.opts.map(function(o,k){ return '<button class="choice" style="--i:'+k+'" data-act="evpick" data-k="'+k+'"><b>'+esc(o.t)+'</b><span>'+esc(o.d)+'</span></button>'; }).join('')+'</div></article>';
}
A.evpick=function(el){
  var ev=evCur(), k=+el.getAttribute('data-k'), opt=ev.opts[k]; if(!opt) return;
  S.seen['ev_'+ev.id]=1;
  if(opt.game){ U.evGame={id:ev.id,t:opt.t}; startRush(); return; }
  var r=runChoice(opt,'e'+ev.id), chips=applyFx(S,r.fx);
  U.evRes={t:opt.t, res:r.res||[], fx:chips}; sfx(r.ok?'good':'bad'); persist(); render();
};
A.evnext=function(){ var e=U.ev; U.evRes=null; if(e.i+1<e.list.length){ e.i++; render(); } else { U.ev=null; toPlan(); } };

/* ---------- мини-игра «Час пик» ---------- */
var RUSH_ST=[{id:'coffee',n:'Кофе',g:'cup',cat:'coffee'},{id:'soup',n:'Суп',g:'bowl',cat:'soup'},{id:'main',n:'Горячее',g:'plate',cat:'main'},{id:'dess',n:'Десерт',g:'cake',cat:'dess'}];
function startRush(){
  U.rush={t0:Date.now(), dur:24000, q:[], served:0, miss:0, wrong:0, nid:0, next:0, done:false}; U.screen='rush'; render();
  if(reduced){ U.rush.dur=16000; }
  U.rushT=setInterval(rushTick,100);
}
function rushHTML(){
  var R=U.rush; if(!R) return '';
  return '<article class="rush"><div class="scene-head"><span class="chip warn">'+ico('bolt','sm')+' Час пик</span></div><h2>Заказы летят!</h2><p class="muted">Первый заказ в очереди сверху. Нажимайте на станцию, которая его готовит. Не дайте заказам остыть.</p><div class="timer" role="timer" aria-label="Осталось времени"><i id="rk-t"></i></div>'+
   '<div class="tickets" id="rk-q" aria-live="off"></div><div class="station" id="rk-s">'+RUSH_ST.map(function(s){ return '<button data-act="rushpick" data-st="'+s.id+'" aria-label="'+s.n+'">'+dishSVG(s.g,s.cat,34)+s.n+'</button>'; }).join('')+'</div>'+
   '<div class="row between"><span class="chip gain" id="rk-ok">Подано: 0</span><span class="chip loss" id="rk-bad">Ошибки: 0</span><button class="btn ghost small" data-act="rushskip">Бросить смену</button></div></article>';
}
function rushDraw(){
  var R=U.rush, q=$('#rk-q'); if(!R||!q) return;
  q.innerHTML=R.q.map(function(t,i){ var st=RUSH_ST.filter(function(s){ return s.id===t.st; })[0], left=clamp(1-(Date.now()-t.at)/t.life,0,1); return '<div class="tk'+(i===0?' first':'')+'">'+dishSVG(st.g,st.cat,38)+'<div class="small"><b>'+st.n+'</b></div><div class="tm"><i style="width:'+(left*100).toFixed(0)+'%"></i></div></div>'; }).join('')||'<span class="muted small">Ждём заказов…</span>';
  var tt=$('#rk-t'); if(tt) tt.style.width=(clamp(1-(Date.now()-R.t0)/R.dur,0,1)*100)+'%';
  setText('rk-ok','Подано: '+R.served); setText('rk-bad','Ошибки: '+(R.miss+R.wrong));
}
function rushTick(){
  var R=U.rush; if(!R||R.done||U.screen!=='rush'){ clearInterval(U.rushT); U.rushT=0; return; }
  var now=Date.now(), el=now-R.t0;
  if(el>=R.dur){ finishRush(); return; }
  if(now>=R.next && R.q.length<5){ R.q.push({id:R.nid++, st:RUSH_ST[Math.floor(Math.random()*4)].id, at:now, life:6200}); R.next=now+1250+Math.random()*700; }
  R.q=R.q.filter(function(t){ if(now-t.at>t.life){ R.miss++; return false; } return true; });
  rushDraw();
}
A.rushpick=function(el){
  var R=U.rush; if(!R||R.done) return; var st=el.getAttribute('data-st'), first=R.q[0]; if(!first){ R.wrong++; sfx('bad'); return rushDraw(); }
  if(first.st===st){ R.q.shift(); R.served++; sfx('coin'); } else { R.wrong++; sfx('bad'); }
  rushDraw();
};
A.rushskip=function(){ finishRush(); };
function finishRush(){
  var R=U.rush; R.done=true; clearInterval(U.rushT); U.rushT=0;
  var err=R.miss+R.wrong, gr=(R.served>=12&&err<=2)?'gold':((R.served>=8&&err<=5)?'silver':'bronze');
  var fx=gr==='gold'?{c:9000,repOne:3,awr:0.04,mor:3}:(gr==='silver'?{c:3000,repOne:1}:{repOne:-2,mor:-2});
  var chips=applyFx(S,fx), txt={gold:'Золотая смена! Гости аплодируют, шеф кивает.',silver:'Справились. Не идеально, но очередь рассосалась.',bronze:'Было тяжело. Часть заказов остыла.'}[gr];
  U.evRes={t:U.evGame?U.evGame.t:'Смена',res:[txt+' Подано '+R.served+', ошибок '+err+'.'],fx:chips}; U.rush=null; U.screen='event'; sfx(gr==='bronze'?'bad':'win'); if(gr==='gold') burst(70); persist(); render();
}

/* ---------- викторина «Проверка Арсена» ---------- */
function quizInit(act){ U.qz={act:act, qs:quizFor(S,act,S.lastR), i:0, picked:null, ok:0}; }
function quizHTML(){
  var Q=U.qz; if(!Q) return ''; var q=Q.qs[Q.i], done=Q.i>=Q.qs.length;
  if(done) return '<div class="slide"><div class="row">'+avatarSVG('arsen','happy',64)+'<div><h2>Проверка пройдена</h2><p>Верных ответов: <b>'+Q.ok+' из '+Q.qs.length+'</b>. За каждый верный ответ в кассу приходят 4 000 ₽ премии от Арсена.</p></div></div><div class="row" style="justify-content:flex-end"><button class="btn" data-act="quizend">Дальше '+ico('right')+'</button></div></div>';
  return '<div class="slide"><div class="row between"><span class="chip brand">'+ico('cap','sm')+' Проверка Арсена · '+(Q.i+1)+' из '+Q.qs.length+'</span>'+(q.dyn?'<span class="chip info">на ваших цифрах</span>':'')+'</div>'+
   '<h3 style="margin:10px 0">'+esc(q.q)+'</h3><div class="opts">'+q.a.map(function(a,k){ var cls=''; if(Q.picked!=null){ if(k===q.c) cls=' right'; else if(k===Q.picked) cls=' wrong'; } return '<button class="opt'+cls+'" data-act="qpick" data-k="'+k+'"'+(Q.picked!=null?' disabled':'')+'><span class="k">'+'АБВГ'.charAt(k)+'</span>'+esc(a)+'</button>'; }).join('')+'</div>'+
   (Q.picked!=null?'<div class="coach" role="status">'+avatarSVG('arsen',Q.picked===q.c?'happy':'neutral',46)+'<div><b>'+(Q.picked===q.c?'Верно!':'Не совсем.')+'</b><p>'+esc(q.why)+'</p></div></div><div class="row" style="justify-content:flex-end"><button class="btn" data-act="qnext">'+(Q.i+1>=Q.qs.length?'Закончить':'Дальше')+' '+ico('right')+'</button></div>':'')+'</div>';
}
A.qpick=function(el){ var Q=U.qz; if(Q.picked!=null) return; var k=+el.getAttribute('data-k'), q=Q.qs[Q.i]; Q.picked=k; if(k===q.c){ Q.ok++; S.cash+=4000; S.quizScore.push(1); sfx('good'); burst(24); } else { S.quizScore.push(0); sfx('bad'); } persist(); render(true); };
A.qnext=function(){ var Q=U.qz; Q.i++; Q.picked=null; render(); };
A.quizend=function(){ var act=U.qz.act; U.qz=null; if(S.month===9){ U.screen='lessonEnd'; render(); } else enterMonth(); };

/* ---------- конец урока 1 ---------- */
function lessonEndHTML(){
  var g=goalNow(S), code=exportCode();
  return '<div class="actcard"><span class="kicker">Урок 1 завершён</span><h1>Восемь месяцев позади</h1><p class="muted" style="max-width:520px;margin:0 auto">Кафе открыто, у него есть характер и первые постоянные гости. Во втором уроке начнётся самое интересное: карта Тамары, кредиты, инвестор, города и сеть.</p>'+
   '<div class="kpi" style="max-width:520px;margin:12px auto"><div><small>Касса</small><b class="num">'+rubk(S.cash)+'</b></div><div><small>Капитал</small><b class="num">'+rubk(g.cap)+'</b></div><div><small>Рейтинг</small><b class="num">'+f1d(g.rating)+'</b></div><div><small>Рецептов</small><b class="num">'+S.recs.length+' из 7</b></div></div>'+
   '<div class="card soft" style="text-align:left"><b>Как продолжить на втором уроке</b><p class="small">Игра сохраняется сама. На том же устройстве достаточно открыть её и нажать «Продолжить». На другом устройстве скопируйте код ниже и вставьте его на титульном экране в «Загрузить код».</p><textarea class="code" readonly aria-label="Код сохранения" id="savecode">'+esc(code)+'</textarea><div class="row"><button class="btn small secondary" data-act="copycode">'+ico('copy')+' Скопировать код</button></div></div>'+
   '<button class="btn" data-act="lesson2" style="margin-top:12px">К уроку 2 '+ico('right')+'</button></div>';
}
A.lesson2=function(){ enterMonth(); };
A.copycode=function(){ var t=$('#savecode'); if(!t) return; t.select(); try{ document.execCommand('copy'); toast('Код скопирован'); }catch(e){ toast('Выделите код и скопируйте вручную'); } };

/* ---------- табло учителя ---------- */
function teacherHTML(){
  var rows=parseResults(U.teacherText||''), t='';
  if(rows.length) t='<div class="card tblwrap" style="overflow:auto"><table class="tbl" style="width:100%;border-collapse:collapse;font-size:14px"><thead><tr><th style="text-align:left;padding:6px">#</th><th style="text-align:left">Имя</th><th style="text-align:left">Кафе</th><th>Мес.</th><th>Капитал</th><th>Города</th><th>Рейтинг</th><th>Цель</th><th>Награды</th></tr></thead><tbody>'+rows.map(function(r,i){ return '<tr style="border-top:2px solid var(--edge)"><td style="padding:6px">'+(i+1)+'</td><td><b>'+esc(r.name)+'</b></td><td>'+esc(r.cafe)+'</td><td style="text-align:center">'+r.month+'</td><td class="num" style="text-align:right">'+rubk(r.cap)+'</td><td style="text-align:center">'+r.cities+'</td><td style="text-align:center">'+r.rating+'</td><td style="text-align:center">'+(r.goal?'✔':'—')+'</td><td style="text-align:center">'+r.ach+'</td></tr>'; }).join('')+'</tbody></table></div>';
  return '<h2>Табло класса</h2><p class="muted">Ученики на итоговом экране нажимают «Скопировать результат» и присылают строку. Вставьте строки сюда, по одной на строку.</p><textarea class="code" id="tc-in" aria-label="Результаты учеников" placeholder="Вставьте результаты учеников...">'+esc(U.teacherText||'')+'</textarea><div class="row" style="margin:10px 0"><button class="btn" data-act="tcbuild">Показать таблицу</button><button class="btn ghost" data-act="totitle">'+ico('left')+' Назад</button></div>'+t;
}
