/* ===== Карта Тулы: интерфейс (слои, пульт времени, панель района, ввод) ===== */

function $(s){ return document.getElementById(s); }
var ICO={
  play:'<path d="M7 4.5v15l12-7.5z" fill="currentColor"/>', pause:'<path d="M7 4h3.6v16H7zM13.4 4H17v16h-3.6z" fill="currentColor"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
  cloud:'<path d="M7 18h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7 9.5 4.3 4.3 0 0 0 7 18z"/>', rain:'<path d="M7 14h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7 5.5 4.3 4.3 0 0 0 7 14z"/><path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3"/>',
  snow:'<path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7"/><path d="M9.5 3.5L12 6l2.5-2.5M9.5 20.5L12 18l2.5 2.5"/>', auto:'<path d="M12 3a9 9 0 1 0 9 9"/><path d="M12 3v4M21 12h-4"/><circle cx="12" cy="12" r="2.2"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', minus:'<path d="M5 12h14"/>', loc:'<circle cx="12" cy="12" r="3.2"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>',
  help:'<circle cx="12" cy="12" r="9.5"/><path d="M9.2 9.4a2.9 2.9 0 1 1 4.6 2.3c-1 .7-1.8 1.2-1.8 2.6M12 17.4v.2"/>', close:'<path d="M6 6l12 12M18 6L6 18"/>',
  moon:'<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/>', cup:'<path d="M5 8h12v5a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5z"/><path d="M17 9.5h1.6a2.2 2.2 0 0 1 0 4.4H17M8 3.5c-.8 1 .8 1.6 0 2.8M12 3.5c-.8 1 .8 1.6 0 2.8"/>',
  people:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c.4-3.6 2.8-5.6 6-5.6s5.6 2 6 5.6"/><circle cx="17.5" cy="9" r="2.5"/><path d="M16.5 14.6c2.6-.2 4.4 1.4 4.8 4.4"/>',
  ruble:'<path d="M8 20V4h5.5a4 4 0 0 1 0 8H8M6 15.5h8.5"/>', store:'<path d="M3 9l1.5-5h15L21 9M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M5 12v8h14v-8M10 20v-5h4v5"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>', mega:'<path d="M3 10v4l4 .5L16 19V5L7 9.5z"/><path d="M19 9a4 4 0 0 1 0 6"/>',
  layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>', pin:'<path d="M12 21s7-6 7-11.5A7 7 0 0 0 5 9.5C5 15 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.4"/>',
  bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.7.6 1 1.3 1 2.1h5c0-.8.3-1.5 1-2.1A6 6 0 0 0 12 3z"/>', hand:'<path d="M8 12V5.5a1.5 1.5 0 0 1 3 0V11M11 10V4.5a1.5 1.5 0 0 1 3 0V11M14 10V6a1.5 1.5 0 0 1 3 0v8c0 4-2.5 7-6 7s-5-2-6.5-5l-1.2-2.4a1.4 1.4 0 0 1 2.3-1.5L8 14"/>',
  chart:'<path d="M4 20V4M4 20h16M8 16l4-5 3 3 5-7"/>', star:'<path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1L3.2 9.4l6.1-.8z"/>', swap:'<path d="M7 7h12l-3-3M17 17H5l3 3"/>', moonf:'<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z" fill="currentColor"/>'
};
function ic(n,sz){ return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"'+(sz?' style="width:'+sz+'px;height:'+sz+'px"':'')+'>'+ICO[n]+'</svg>'; }
function esc(s){ return String(s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function rub(n){ return Math.round(n).toLocaleString('ru-RU').replace(/,/g,' ').replace(/ /g,' ')+' ₽'; }
function plur(n,a,b,c){ n=Math.abs(n)%100; var m=n%10; return (n>10&&n<20)?c:(m===1?a:(m>1&&m<5?b:c)); }
function hhmm(h){ h=((h%24)+24)%24; var hh=Math.floor(h), mm=Math.floor((h-hh)*60/5)*5; return (hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm; }
function partName(h){ return h<5?'ночь':(h<7?'рассвет':(h<11?'утро':(h<14?'день':(h<18?'после обеда':(h<20.5?'вечер':'ночь'))))); }
function f1(x){ return (Math.round(x*10)/10).toString().replace('.',','); }

/* ---- элементы ---- */
var cvs=$('map'), panel=$('panel'), dock=$('dock'), tip=$('tip'), toastEl=$('toast');
APP.cv=cvs; APP.ctx=cvs.getContext('2d'); APP.cache=mkCache(); APP.lcache=mkCache(); APP.ft=16; APP.vel=[0,0];
APP.dpr=Math.min(2,window.devicePixelRatio||1);
ST.reduce=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
if(ST.reduce) ST.play=false;

function toast(msg){ toastEl.textContent=msg; toastEl.hidden=false; clearTimeout(toast.t); toast.t=setTimeout(function(){ toastEl.hidden=true; },2600); }

/* ---- раскладка: сколько места занимают панели ---- */
function isWide(){ return window.innerWidth>=900; }
function resize(){
  var W=window.innerWidth, H=window.innerHeight; APP.W=W; APP.H=H; APP.dpr=Math.min(2,window.devicePixelRatio||1);
  cvs.width=Math.floor(W*APP.dpr); cvs.height=Math.floor(H*APP.dpr); cvs.style.width=W+'px'; cvs.style.height=H+'px';
  var db=dock.getBoundingClientRect(), dockH=Math.round(H-db.top); document.documentElement.style.setProperty('--db',dockH+'px');
  var topEnd=document.querySelector('.layers').getBoundingClientRect().bottom;
  if(isWide()){ APP.pad={l:panel.getBoundingClientRect().width,r:0,t:topEnd,b:dockH}; }
  else {
    var vis=panel.dataset.state==='open'?panel.getBoundingClientRect().height:(panel.dataset.state==='peek'?92:0);
    APP.pad={l:0,r:0,t:topEnd,b:dockH+vis};
  }
  document.documentElement.style.setProperty('--zb',(isWide()?dockH+16:APP.pad.b+12)+'px');
  APP.cache.valid=false; APP.lcache.valid=false; clampView(APP.view);
}
window.addEventListener('resize',function(){ resize(); });
if(window.visualViewport) window.visualViewport.addEventListener('resize',function(){ resize(); });

/* ---- ввод: перетаскивание, щипок, колесо ---- */
var PT={}, drag=null, pinch=null, downAt=null;
cvs.addEventListener('pointerdown',function(e){
  cvs.setPointerCapture(e.pointerId); PT[e.pointerId]={x:e.clientX,y:e.clientY};
  APP.anim=null; APP.vel=[0,0]; hideTip();
  var ids=Object.keys(PT);
  if(ids.length===1){ drag={x:e.clientX,y:e.clientY,t:performance.now(),moved:0,lx:e.clientX,ly:e.clientY,lt:performance.now()}; downAt={x:e.clientX,y:e.clientY,t:performance.now()}; }
  else if(ids.length===2){ var a=PT[ids[0]], b=PT[ids[1]]; pinch={d:Math.hypot(a.x-b.x,a.y-b.y),s:APP.view.s,mx:(a.x+b.x)/2,my:(a.y+b.y)/2}; drag=null; }
  APP.gesture=true; cvs.classList.add('drag');
});
cvs.addEventListener('pointermove',function(e){
  if(!PT[e.pointerId]){ hoverAt(e.clientX,e.clientY); return; }
  PT[e.pointerId]={x:e.clientX,y:e.clientY}; var ids=Object.keys(PT), v=APP.view;
  if(ids.length>=2&&pinch){
    var a=PT[ids[0]], b=PT[ids[1]], d=Math.hypot(a.x-b.x,a.y-b.y), mx=(a.x+b.x)/2, my=(a.y+b.y)/2, w0=s2w(mx,my);
    v.s=pinch.s*d/pinch.d; clampView(v);
    /* точка под пальцами остаётся на месте */
    v.cx=w0[0]-(mx-APP.W/2)/v.s; v.cy=w0[1]-(my-APP.H/2)/v.s; clampView(v);
  } else if(drag){
    var dx=e.clientX-drag.lx, dy=e.clientY-drag.ly; drag.moved+=Math.abs(dx)+Math.abs(dy);
    v.cx-=dx/v.s; v.cy-=dy/v.s; clampView(v);
    var now=performance.now(), dtm=Math.max(8,now-drag.lt); APP.vel=[dx/dtm*1000*.8+APP.vel[0]*.2,dy/dtm*1000*.8+APP.vel[1]*.2]; drag.lx=e.clientX; drag.ly=e.clientY; drag.lt=now;
  }
});
function endPtr(e){
  var was=PT[e.pointerId]; delete PT[e.pointerId]; var ids=Object.keys(PT);
  if(ids.length<2) pinch=null;
  if(ids.length===0){
    APP.gesture=false; cvs.classList.remove('drag');
    if(drag&&drag.moved<7&&performance.now()-drag.t<600&&e.type==='pointerup'){ APP.vel=[0,0]; tapAt(e.clientX,e.clientY,e.pointerType); }
    else if(drag&&performance.now()-drag.lt>90) APP.vel=[0,0];
    drag=null;
  } else if(ids.length===1){ var p=PT[ids[0]]; drag={x:p.x,y:p.y,t:performance.now(),moved:99,lx:p.x,ly:p.y,lt:performance.now()}; }
}
cvs.addEventListener('pointerup',endPtr); cvs.addEventListener('pointercancel',endPtr);
cvs.addEventListener('wheel',function(e){
  e.preventDefault(); var v=APP.view, w0=s2w(e.clientX,e.clientY), k=Math.exp(-e.deltaY*(e.ctrlKey?.01:.0015)); v.s*=k; clampView(v);
  v.cx=w0[0]-(e.clientX-APP.W/2)/v.s; v.cy=w0[1]-(e.clientY-APP.H/2)/v.s; clampView(v); APP.anim=null; hideTip();
  APP.gesture=true; clearTimeout(APP.wt); APP.wt=setTimeout(function(){ APP.gesture=false; },140);
},{passive:false});
cvs.addEventListener('dblclick',function(e){ var w0=s2w(e.clientX,e.clientY); flyTo(w0[0],w0[1],APP.view.s*1.9,420); });
cvs.addEventListener('keydown',function(e){
  var v=APP.view, st=60/v.s, k=e.key;
  if(k==='ArrowLeft') v.cx-=st; else if(k==='ArrowRight') v.cx+=st; else if(k==='ArrowUp') v.cy-=st; else if(k==='ArrowDown') v.cy+=st;
  else if(k==='+'||k==='=') flyTo(v.cx,v.cy,v.s*1.4,200); else if(k==='-'||k==='_') flyTo(v.cx,v.cy,v.s/1.4,200); else if(k==='Escape') selectDistrict(null); else return;
  clampView(v); e.preventDefault();
});

/* ---- попадание по объектам ---- */
function hitObject(x,y){
  var s=APP.view.s, cp=w2s(CAFE_POS[0],CAFE_POS[1]);
  if(Math.hypot(x-cp[0],y-(cp[1]-30))<24||Math.hypot(x-cp[0],y-cp[1])<14) return {t:'cafe'};
  if(ST.layers.rivals){ for(var i=0;i<RIVALS.length;i++){ var r=RIVALS[i], p=w2s(r.x,r.y-4); if(Math.hypot(x-p[0],y-p[1])<16) return {t:'rival',o:r}; } }
  if(s>1.1){ var best=null,bd=14; for(var k=0;k<LF.peds.length;k++){ var pd=LF.peds[k]; if(pd.gone) continue; var pq=pedPos(pd), sp=w2s(pq[0],pq[1]-2); var dd=Math.hypot(x-sp[0],y-sp[1]); if(dd<bd){ bd=dd; best=pd; } } if(best) return {t:'ped',o:best}; }
  if(s>.55){ for(var j=0;j<LANDMARKS.length;j++){ var m=LANDMARKS[j]; if(m.y>1690) continue; var imp=['kremlin','station','tulgu','park','market','zavod','mall'].indexOf(m.id)>=0; if(!imp&&s<1.1) continue; var q=w2s(m.x,m.y-34); if(Math.abs(x-q[0])<62&&Math.abs(y-q[1])<14) return {t:'lm',o:m}; } }
  return null;
}
function hoverAt(x,y){
  if(APP.gesture) return; var o=hitObject(x,y), w=s2w(x,y), id=districtAt(w[0],w[1]);
  ST.hoverCafe=!!(o&&o.t==='cafe'); ST.hoverRival=(o&&o.t==='rival')?o.o:null;
  ST.hover=o?null:id; cvs.classList.toggle('ptr',!!o||!!id);
}
function tapAt(x,y,type){
  var o=hitObject(x,y);
  if(o){ showTipFor(o,x,y); return; }
  var w=s2w(x,y), id=districtAt(w[0],w[1]);
  selectDistrict(id===ST.sel?null:id);
}
function showTipFor(o,x,y){
  var h='', pos;
  if(o.t==='cafe'){ pos=w2s(CAFE_POS[0],CAFE_POS[1]); pos=[pos[0],pos[1]-44]; h='<b>Первый столик</b><p>Ваше кафе: переулок за площадью Ленина, в Старом центре. Золотым обведены гости, которые идут именно к вам. Счётчик «Зашли» считает их за эту сессию.</p>'; }
  else if(o.t==='ped'){ var pp=pedPos(o.o); pos=w2s(pp[0],pp[1]-6); h='<b>'+SEGN[o.o.seg]+'</b><p>'+esc(pedThought(o.o))+'</p>'; }
  else if(o.t==='rival'){ var r=o.o; pos=w2s(r.x,r.y-14); h='<b>'+esc(r.n)+'</b><p>'+esc(r.st)+' · '+esc(DIST[r.d].n)+'<br><span class="stars">★ '+f1(r.r)+'</span> · '+['','недорого','средний чек','дорого'][r.p]+'</p><p>'+esc(r.note)+'</p>'; }
  else { var m=o.o; pos=w2s(m.x,m.y-46); h='<b>'+esc(m.n)+'</b><p>'+esc(m.fact)+'</p>'+(m.d?'<button class="btn ghost" data-act="seld" data-d="'+m.d+'" style="min-height:38px;padding:0 14px">Открыть район</button>':''); }
  tip.innerHTML='<button class="xbtn" data-act="tipx" aria-label="Закрыть">'+ic('close',16)+'</button>'+h; tip.hidden=false;
  var px=clamp(pos[0],150,APP.W-150), py=Math.max(pos[1],tip.offsetHeight+86); tip.style.left=px+'px'; tip.style.top=py+'px';
}
function pedThought(p){
  var h=ST.hour, d=DIST[p.d]?DIST[p.d].n:'городе', T={
    stu:h<11?['Спешит на первую пару и хочет взять кофе по дороге.','Идёт в университет, в кармане мало денег: ищет недорогое.']:(h<16?['Обед после пар: выбирает, где быстро и недорого.','Договорился с друзьями встретиться в кафе.']:['После занятий ищет место посидеть с ноутбуком.','Идёт с одногруппниками, компания любит десерты.']),
    off:h<10?['Берёт кофе в дорогу перед работой.','Заглядывает в пекарню за выпечкой.']:(h<15?['Обед: у него есть всего сорок минут, нужен быстрый заказ.','Ищет бизнес-ланч рядом с офисом.']:['После работы идёт домой, но может зайти за ужином.','Договорился о встрече с коллегой.']),
    fam:h<14?['Гуляет с коляской и ищет уютное кафе с детским стулом.','Идут с детьми в парк, возьмут по мороженому.']:['Семейный ужин: нужна просторная посадка и детское меню.','Возвращается с прогулки, дети просят десерт.'],
    tur:['Фотографирует достопримечательности и ищет местное блюдо.','Хочет попробовать тульский пряник и сфотографировать его.','Пришёл на экскурсию, заранее выбирает, где пообедать.'],
    gou:['Читал про новое место и решил проверить его сам.','Выбирает ужин: ему важнее вкус и свежие продукты, чем цена.']
  }[p.seg];
  var i=Math.floor((p.ph*100)%T.length); return (p.cafe?'Идёт в «Первый столик»! ':'')+T[i]+(p.cafe?'':' Район: '+d+'.');
}
function hideTip(){ if(!tip.hidden) tip.hidden=true; }

/* ---- выбор района ---- */
function distBBox(id){ var bb=[1e9,1e9,-1e9,-1e9]; DPOLY[id].forEach(function(p){ var b=bbox(p); bb=[Math.min(bb[0],b[0]),Math.min(bb[1],b[1]),Math.max(bb[2],b[2]),Math.max(bb[3],b[3])]; }); return bb; }
function selectDistrict(id){
  ST.sel=id; hideTip();
  panel.dataset.state=id?'open':(isWide()?'open':'peek');
  renderPanel(); resize();
  if(id){ var bb=distBBox(id); fitRect(bb[0]-20,bb[1]-20,bb[2]+20,bb[3]+20,900); }
}

/* ---- слои ---- */
var LAYER_DEFS=[['mode:districts','Районы','layers'],['mode:guests','Гости','people'],['mode:rent','Аренда','ruble'],['ads','Реклама','mega'],['rivals','Конкуренты','store'],['names','Подписи','pin']];
function renderLayers(){
  var h='';
  LAYER_DEFS.forEach(function(d,i){
    var on=d[0].indexOf('mode:')===0?ST.mode===d[0].slice(5):!!ST.layers[d[0]];
    h+='<button class="chip'+(i===3?' sep':'')+'" data-act="layer" data-k="'+d[0]+'" aria-pressed="'+on+'">'+ic(d[2])+d[1]+'</button>';
  });
  $('layers').innerHTML=h;
}
function setMode(m){ ST.mode=m; ST.layers.districts=(m==='districts'); ST.layers.guests=(m==='guests'); ST.layers.rent=(m==='rent'); }

/* ---- панель: обзор города ---- */
function flowRel(id){ var m=0; DORDER.forEach(function(k){ m=Math.max(m,distFlow(k,ST.hour)); }); return distFlow(id,ST.hour)/Math.max(1,m); }
function overviewHTML(){
  var h='<div class="phead"><div class="grow"><h2>Тула, город кафе</h2><span class="tag">10 районов · '+RIVALS.length+' заведений-конкурентов</span></div></div><div class="pbody">';
  h+='<div class="sec"><p class="blurb">Это схема, по которой видно, где в городе гости, сколько стоит аренда и что работает в рекламе. Нажмите на район или выберите его из списка ниже. Время суток и месяц внизу меняют потоки людей.</p></div>';
  /* легенда режима */
  if(ST.mode==='guests'){ h+='<div class="legendbox"><b>Цвет района показывает, кто там сейчас преобладает</b><div class="legend">'+SEGS.map(function(sg){ return '<span><i style="background:'+SEGC[sg]+'"></i>'+SEGN[sg]+'</span>'; }).join('')+'</div><p class="note">Чем гуще цвет, тем больше людей в этот час. Кольца показывают состав гостей района.</p></div>'; }
  if(ST.mode==='rent'){ h+='<div class="legendbox"><b>Аренда помещения, ₽ в месяц</b><div class="ramp"></div><div><span>'+rub(Math.round(CITY_RENT*.45/500)*500)+'</span><span>'+rub(Math.round(CITY_RENT*1.35/500)*500)+'</span></div><p class="note">Цифры взяты из игры: в Туле базовая аренда '+rub(CITY_RENT)+', а район её повышает или понижает.</p></div>'; }
  if(ST.layers.ads){
    var act=ADORDER.filter(function(ch){ return ST.ads[ch]; });
    h+='<div class="legendbox"><b>Включённая реклама</b>'+(act.length?act.map(function(ch){ var ad=ADS[ch], at=ad.local?ST.adLoc[ch]:null, r=at?adReach(at,ch):(SEGS.reduce(function(a,sg){ return a+ad.reach[sg]*(CITY_MIX[sg]/100); },0)); return '<div class="adl"><span>'+ad.n+'</span><span>'+(at?DIST[at].n:'весь город')+' · '+f1(r*100)+'%</span></div>'; }).join(''):'<p class="note">Пока ничего не включено. Откройте район и нажмите «Включить» в блоке «Что работает в рекламе».</p>')+'<p class="note">Круг на карте показывает, кого достаёт канал. Охват — доля гостей района, узнавших о кафе за месяц (таблица игры).</p></div>';
  }
  if(ST.layers.rivals){ h+='<div class="legendbox"><b>Конкуренты</b><div class="legend"><span><i style="background:#2E7D4F"></i>рейтинг 4,3 и выше</span><span><i style="background:#C58A1D"></i>3,8–4,2</span><span><i style="background:#B83A3A"></i>ниже 3,8</span></div><p class="note">Нажмите на значок: покажем стиль, цену и чем он силён. Рядом с вашим кафе их '+RIVALS.filter(function(r){ return dist([r.x,r.y],CAFE_POS)<220; }).length+' в радиусе около 650 м.</p></div>'; }
  h+='<div class="sec"><h3>'+ic('layers')+'Районы города</h3><div class="dlist">';
  var ids=DORDER.slice().sort(function(a,b){ return distFlow(b,ST.hour)-distFlow(a,ST.hour); });
  ids.forEach(function(id){ var d=DIST[id], f=flowRel(id); h+='<button class="dcard" data-act="seld" data-d="'+id+'"><i style="background:'+d.col+'"></i><span><b>'+esc(d.n)+'</b><small>'+esc(d.tag)+' · аренда '+rub(Math.round(CITY_RENT*d.rent/500)*500)+'</small></span><span class="mini" title="поток людей сейчас"><b style="width:'+Math.round(f*100)+'%;background:'+d.col+'"></b></span></button>'; });
  h+='</div><p class="foot">Полоски справа показывают поток людей в районе в выбранный час.</p></div>';
  h+='<div class="sec"><h3>'+ic('bulb')+'Как пользоваться</h3><ul class="how"><li>'+ic('hand')+'<span>Перетаскивайте карту, масштаб меняйте щипком или колесом. Двойное нажатие приближает.</span></li><li>'+ic('clock')+'<span>Ползунок времени показывает утро, обед и вечер: люди ходят по-разному.</span></li><li>'+ic('sun')+'<span>Месяц меняет сезон. Летом приезжает больше туристов, в июле и августе студентов почти нет.</span></li><li>'+ic('mega')+'<span>Слой «Реклама» показывает, кого вы достаёте листовками и корпоративными обедами.</span></li></ul></div>';
  h+='<p class="foot">Схема сделана по мотивам города и не в масштабе. Названия заведений вымышленные. Числа согласованы с моделью игры «Первый столик».</p></div>';
  return h;
}

/* ---- панель: район ---- */
function chartHTML(id){
  var W=340,H=132,pl=30,pr=8,pt=8,pb=22, x0=pl,x1=W-pr,y0=H-pb,y1=pt, hrs=HOURS[ST.hoursOpt];
  var step=.5, hs=[], i; for(var h0=6;h0<=24.001;h0+=step) hs.push(h0);
  var tot=hs.map(function(h){ return distFlowSeg(id,Math.min(h,23.99)); }), mx=0; tot.forEach(function(o){ var s=0; SEGS.forEach(function(sg){ s+=o[sg]; }); mx=Math.max(mx,s); }); mx=Math.max(mx*1.08,10);
  function X(h){ return x0+(h-6)/18*(x1-x0); } function Y(v){ return y0-v/mx*(y0-y1); }
  var base=hs.map(function(){ return 0; }), svg='<svg class="chart" id="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Поток людей по часам">';
  /* окно работы */
  svg+='<rect x="'+X(hrs.a)+'" y="'+y1+'" width="'+(X(Math.min(24,hrs.b))-X(hrs.a))+'" height="'+(y0-y1)+'" fill="rgba(209,54,26,.10)"/>';
  for(var gv=0;gv<=3;gv++){ var gy=y0-(y0-y1)*gv/3; svg+='<line x1="'+x0+'" x2="'+x1+'" y1="'+gy+'" y2="'+gy+'" stroke="var(--edge)" stroke-width="1"/>'; }
  SEGS.forEach(function(sg){
    var top=hs.map(function(h,k){ return base[k]+tot[k][sg]; }), d='M'+X(hs[0])+' '+Y(base[0]);
    for(i=0;i<hs.length;i++) d+=' L'+X(hs[i]).toFixed(1)+' '+Y(top[i]).toFixed(1);
    for(i=hs.length-1;i>=0;i--) d+=' L'+X(hs[i]).toFixed(1)+' '+Y(base[i]).toFixed(1);
    svg+='<path d="'+d+'Z" fill="'+SEGC[sg]+'" fill-opacity=".86"/>'; base=top;
  });
  [6,9,12,15,18,21,24].forEach(function(h){ svg+='<text x="'+X(h)+'" y="'+(H-6)+'" text-anchor="middle">'+h+'</text>'; });
  svg+='<line class="now" id="chart-now" x1="'+X(clamp(ST.hour,6,24))+'" x2="'+X(clamp(ST.hour,6,24))+'" y1="'+y1+'" y2="'+y0+'"/><circle id="chart-dot" cx="'+X(clamp(ST.hour,6,24))+'" cy="'+y0+'" r="4.5" fill="var(--brand)" stroke="var(--surface)" stroke-width="2"/>';
  svg+='<text x="'+(x0-4)+'" y="'+(y1+8)+'" text-anchor="end">пик</text><text x="'+(x0-4)+'" y="'+y0+'" text-anchor="end">0</text></svg>';
  return svg;
}
var COMP_BASE='old';
var CITY_MIX={stu:24,off:34,fam:22,tur:6,gou:4};
function compEff(id){ var n=RIVALS.filter(function(r){ return r.d===id; }).length; return 1/(1+.12*Math.max(0,n-1)); }
function estGuests(id){ var hr=HOURS[ST.hoursOpt]; return 82*(distFlowTotal(id,hr.a,hr.b)/Math.max(1,distFlowTotal(COMP_BASE,hr.a,hr.b)))*compEff(id)/compEff(COMP_BASE); }
function rentOf(id){ return Math.round(CITY_RENT*DIST[id].rent/500)*500; }
function districtHTML(id){
  var d=DIST[id], h='', hr=HOURS[ST.hoursOpt], rv=RIVALS.filter(function(r){ return r.d===id; }), best=rv.slice().sort(function(a,b){ return b.r-a.r; })[0];
  h+='<div class="phead"><span class="dot" style="background:'+d.col+'"></span><div class="grow"><h2>'+esc(d.n)+'</h2><span class="tag">'+esc(d.tag)+'</span></div><button class="xbtn" data-act="seld" data-d="" aria-label="Закрыть район">'+ic('close',18)+'</button></div><div class="pbody">';
  h+='<div class="sec"><p class="blurb">'+esc(d.blurb)+'</p></div>';
  /* состав гостей */
  h+='<div class="sec"><h3>'+ic('people')+'Кто здесь ходит</h3>';
  SEGS.slice().sort(function(a,b){ return d.mix[b]-d.mix[a]; }).forEach(function(sg){ h+='<div class="seg-row"><i style="background:'+SEGC[sg]+'"></i><span>'+SEGN[sg]+'</span><div class="bar"><b style="width:'+d.mix[sg]+'%;background:'+SEGC[sg]+'"></b></div><output>'+d.mix[sg]+'%</output></div>'; });
  h+='</div>';
  /* поток по часам */
  var cur=distFlow(id,ST.hour), mxd=0; for(var hh=6;hh<24;hh+=.5) mxd=Math.max(mxd,distFlow(id,hh+.25));
  h+='<div class="sec"><h3>'+ic('clock')+'Поток людей по часам</h3>'+chartHTML(id)+'<div class="legend">'+SEGS.map(function(sg){ return '<span><i style="background:'+SEGC[sg]+'"></i>'+SEGN[sg]+'</span>'; }).join('')+'</div><p class="note" id="flow-note"></p><p class="foot">Красная полоса — часы работы кафе при выбранном режиме. Нажмите на график, чтобы выбрать время.</p></div>';
  /* цифры */
  var seas=distSeason(id,ST.cal), seasOld=distSeason(id,2);
  h+='<div class="facts"><div class="fact"><small>Аренда в месяц</small><b>'+rub(rentOf(id))+'</b><i>'+(d.rent>1?'дороже':'дешевле')+' среднего на '+Math.round(Math.abs(d.rent-1)*100)+'%</i></div>'
    +'<div class="fact"><small>Проходимость</small><b>'+d.traffic+'</b><i>100 — средняя по городу</i></div>'
    +'<div class="fact"><small>Конкуренты</small><b>'+rv.length+'</b><i>'+(best?('сильнейший: '+esc(best.n)+' '+f1(best.r)):'свободная ниша')+'</i></div>'
    +'<div class="fact"><small>Сезон: '+MONTHS[ST.month-1].toLowerCase()+'</small><b>×'+f1(seas)+'</b><i>влияние месяца на поток</i></div></div>';
  h+='<div class="sec"><p class="note">Гости <b>'+priceWord(priceTol(id))+'</b> к цене: порог, после которого они уходят, около '+Math.round((priceTol(id)-1)*100)+'% над рыночной ценой.</p></div>';
  /* часы работы */
  h+='<div class="sec"><h3>'+ic('clock')+'Часы работы кафе</h3><div class="opts">';
  HOURS.forEach(function(o,i){ var sh=hoursShare(id,o); h+='<button class="opt" data-act="hrs" data-i="'+i+'" aria-pressed="'+(ST.hoursOpt===i)+'"><b>'+o.n+'</b><small>'+Math.round(sh*100)+'% потока</small></button>'; });
  var sh1=hoursShare(id,HOURS[1]), sh2=hoursShare(id,HOURS[2]), gain=(sh2-sh1)*100, extra=Math.round((HOURS[2].wf-1)*100);
  h+='</div><p class="note">Длинный день 8–23 добавляет в этом районе <b>'+(gain>=0?'+':'−')+f1(Math.abs(gain))+' п. п.</b> потока, а смены стоят <b>+'+extra+'%</b>. '+(gain>9?'Здесь вечер живой, поэтому длинный день может окупиться.':(gain<4?'Вечером здесь пусто, лучше не удлинять день.':'Выигрыш небольшой, нужно считать на цифрах кафе.'))+'</p></div>';
  /* реклама */
  var chs=ADORDER.slice().sort(function(a,b){ return adReach(id,b)-adReach(id,a); }).slice(0,4);
  h+='<div class="sec"><h3>'+ic('mega')+'Что работает в рекламе</h3>';
  chs.forEach(function(ch){ var ad=ADS[ch], r=adReach(id,ch), on=!!ST.ads[ch]&&(!ad.local||ST.adLoc[ch]===id), per=ad.cost?Math.round(ad.cost/Math.max(.1,r*100)):0;
    h+='<div class="adrow"><b>'+ad.n+'</b><button class="tg" data-act="ad" data-ch="'+ch+'" data-d="'+id+'" aria-pressed="'+on+'">'+(on?'Включено':'Включить')+'</button><small>охват около '+f1(r*100)+'% района в месяц · '+(ad.cost?rub(ad.cost):'бесплатно')+(per?' · '+rub(per)+' за 1% охвата':'')+(ad.local?' · на карте: круг '+Math.round(ad.rad)+' ед.':' · на весь город')+'</small><div class="meter"><b style="width:'+Math.min(100,r*100/ .16*1)+'%"></b></div></div>'; });
  h+='<p class="foot">Охват взят из таблицы игры: доля группы гостей, которая узнаёт о кафе за месяц. Круги появляются на слое «Реклама».</p></div>';
  /* советы */
  h+='<div class="sec"><h3>'+ic('bulb')+'Что учесть</h3><ul class="tips">'+d.tips.map(function(t){ return '<li>'+ic('star')+'<span>'+esc(t)+'</span></li>'; }).join('')+'</ul></div>';
  /* сравнение */
  if(id!==COMP_BASE){
    var e1=estGuests(id), e0=estGuests(COMP_BASE), r1=rentOf(id), r0=rentOf(COMP_BASE), c1=rv.length, c0=RIVALS.filter(function(r){ return r.d===COMP_BASE; }).length, pg1=r1/(e1*30), pg0=r0/(e0*30);
    function cell(a,b,low){ var dl=(a-b)/b*100; var good=low?dl<0:dl>0; return '<td class="'+(Math.abs(dl)<2?'':(good?'up':'dn'))+'">'+(dl>0?'+':'−')+Math.round(Math.abs(dl))+'%</td>'; }
    h+='<div class="sec"><h3>'+ic('swap')+'Если открыть кафе здесь</h3><table class="cmp"><thead><tr><th></th><th>здесь</th><th>у вас</th><th>разница</th></tr></thead><tbody>'
      +'<tr><th>Гостей в день</th><td>'+Math.round(e1)+'</td><td>'+Math.round(e0)+'</td>'+cell(e1,e0,false)+'</tr>'
      +'<tr><th>Аренда</th><td>'+rub(r1)+'</td><td>'+rub(r0)+'</td>'+cell(r1,r0,true)+'</tr>'
      +'<tr><th>Конкуренты</th><td>'+c1+'</td><td>'+c0+'</td>'+cell(c1||.5,c0||.5,true)+'</tr>'
      +'<tr><th>Аренда на гостя</th><td>'+rub(pg1)+'</td><td>'+rub(pg0)+'</td>'+cell(pg1,pg0,true)+'</tr></tbody></table>';
    var verdict=(e1<e0*.6)?'Потока слишком мало: даже дешёвая аренда не спасёт, зал будет пустым.':((pg1<pg0*.85&&e1>e0*.8)?'Выгоднее вашего места: гостей почти столько же, а аренда на гостя ниже.':((pg1>pg0*1.15)?'Дороже вашего места: на каждого гостя приходится больше аренды.':'Примерно так же, как у вас. Решают цена, меню и рейтинг, а не адрес.'));
    h+='<div class="verdict">'+verdict+'</div><p class="foot">Оценка по схеме для режима «'+hr.n+'», не прогноз игры. Потоки и аренда взяты из таблиц района; конкуренция снижает потенциал.</p></div>';
  } else {
    h+='<div class="sec"><div class="verdict">Здесь стоит «Первый столик». Откройте другой район, чтобы сравнить его с вашим местом.</div></div>';
  }
  /* достопримечательности */
  var lms=LANDMARKS.filter(function(m){ return m.d===id; });
  if(lms.length){ h+='<div class="sec"><h3>'+ic('pin')+'Что здесь есть</h3>'+lms.map(function(m){ return '<div class="lm"><b>'+esc(m.n)+'</b><span>'+esc(m.fact)+'</span></div>'; }).join('')+'</div>'; }
  h+='<p class="foot">Цифры районов — учебная схема, согласованная с моделью игры «Первый столик». Это не данные города.</p></div>';
  return h;
}
function renderPanel(){
  var scroll=panel.querySelector('.pbody'), top=scroll?scroll.scrollTop:0;
  panel.innerHTML=(isWide()?'':'<button class="grab" data-act="grab" aria-label="Развернуть или свернуть панель"></button>')+(ST.sel?districtHTML(ST.sel):overviewHTML());
  var sc=panel.querySelector('.pbody'); if(sc&&ST.sel===APP.lastRenderedSel) sc.scrollTop=top; APP.lastRenderedSel=ST.sel;
  updateLive();
}
/* лёгкое обновление чисел без перерисовки всей панели */
function updateLive(){
  var n=$('flow-note'); if(n&&ST.sel){
    var id=ST.sel, f=distFlow(id,ST.hour), mxd=0; for(var hh=6;hh<24;hh+=.5) mxd=Math.max(mxd,distFlow(id,hh+.25)); var rel=f/Math.max(1,mxd), seg=domSeg(id,ST.hour);
    n.innerHTML='<b>'+hhmm(ST.hour)+'</b>: людей '+(rel>.75?'очень много':(rel>.5?'много':(rel>.28?'немного':'почти нет')))+', чаще всего <b style="color:'+SEGC[seg]+'">'+SEGN[seg].toLowerCase()+'</b>.';
    var x=30+(clamp(ST.hour,6,24)-6)/18*(340-30-8), ln=$('chart-now'), dot=$('chart-dot'); if(ln){ ln.setAttribute('x1',x); ln.setAttribute('x2',x); } if(dot) dot.setAttribute('cx',x);
  }
}

/* ---- пульт ---- */
function renderWx(){
  var items=[['auto','auto','Погода по сезону'],['clear','sun','Ясно'],['cloudy','cloud','Облачно'],['rain','rain','Дождь'],['snow','snow','Снег']];
  $('wx').innerHTML=items.map(function(it){ return '<button data-act="wx" data-w="'+it[0]+'" aria-pressed="'+(ST.weather===it[0])+'" aria-label="'+it[2]+'" title="'+it[2]+'">'+ic(it[1])+'</button>'; }).join('');
}
function renderDock(){
  var m=ST.month, cal=ST.cal;
  $('o-month').textContent=MONTHS[m-1]+' · месяц '+m+' из 16';
  $('o-season').textContent=['зима','зима','оттепель','весна','весна','лето','лето','лето','осень','осень','осень','зима'][cal]+(SEASONS[cal].snow>.5?', снег':'');
  var t=TUR_SEAS[cal]; $('o-tur').textContent='туристы ×'+f1(t);
  $('r-month').value=m;
  $('b-play').innerHTML=ic(ST.play?'pause':'play',22); $('b-play').setAttribute('aria-label',ST.play?'Остановить время':'Запустить время');
}
function tickTime(){
  if(!APP.dragTime) $('r-time').value=ST.hour;
  $('o-time').textContent=hhmm(ST.hour); $('o-part').textContent=partName(ST.hour);
  var g=$('o-guests'); g.innerHTML=ic('cup',15)+'Зашли: '+ST.guestCount;
  updateLive(); if(!ST.sel&&APP._ovTick!==Math.floor(ST.hour*2)){ APP._ovTick=Math.floor(ST.hour*2); var pb=panel.querySelector('.dlist'); if(pb) refreshOverviewBars(); }
}
function refreshOverviewBars(){ var cards=panel.querySelectorAll('.dcard'); cards.forEach(function(c){ var id=c.getAttribute('data-d'), b=c.querySelector('.mini b'); if(b) b.style.width=Math.round(flowRel(id)*100)+'%'; }); }
APP.onTime=tickTime;
$('r-time').addEventListener('input',function(e){ ST.hour=+e.target.value; APP.dragTime=true; tickTime(); });
$('r-time').addEventListener('change',function(){ APP.dragTime=false; });
$('r-time').addEventListener('pointerup',function(){ APP.dragTime=false; });
$('r-month').addEventListener('input',function(e){ ST.month=+e.target.value; ST.cal=CAL[ST.month-1]; renderDock(); if(ST.sel) renderPanel(); else refreshOverviewBars(); });

/* ---- клики по кнопкам ---- */
document.addEventListener('click',function(e){
  var el=e.target.closest?e.target.closest('[data-act]'):null; if(!el) return; var a=el.getAttribute('data-act');
  if(a==='layer'){ var k=el.getAttribute('data-k'); if(k.indexOf('mode:')===0) setMode(k.slice(5)); else ST.layers[k]=!ST.layers[k]; renderLayers(); if(!ST.sel) renderPanel(); }
  else if(a==='seld'){ selectDistrict(el.getAttribute('data-d')||null); }
  else if(a==='wx'){ var w=el.getAttribute('data-w'); if(window.innerWidth<=560){ var od=['auto','clear','cloudy','rain','snow']; w=od[(od.indexOf(ST.weather)+1)%od.length]; toast('Погода: '+({auto:'по сезону',clear:'ясно',cloudy:'облачно',rain:'дождь',snow:'снег'})[w]); } ST.weather=w; renderWx(); }
  else if(a==='hrs'){ ST.hoursOpt=+el.getAttribute('data-i'); renderPanel(); }
  else if(a==='ad'){ var ch=el.getAttribute('data-ch'), dd=el.getAttribute('data-d'), ad=ADS[ch], on=!!ST.ads[ch]&&(!ad.local||ST.adLoc[ch]===dd); if(on){ ST.ads[ch]=false; } else { ST.ads[ch]=true; if(ad.local) ST.adLoc[ch]=dd; ST.layers.ads=true; renderLayers(); toast(ad.local?'«'+ad.n+'» включена в районе «'+DIST[dd].n+'»':'«'+ad.n+'» включена на весь город'); } renderPanel(); }
  else if(a==='grab'){ panel.dataset.state=panel.dataset.state==='open'?'peek':'open'; resize(); if(ST.sel&&panel.dataset.state==='open'){ var bb=distBBox(ST.sel); fitRect(bb[0]-20,bb[1]-20,bb[2]+20,bb[3]+20,500); } }
  else if(a==='tipx'){ hideTip(); }
});
$('b-play').addEventListener('click',function(){ ST.play=!ST.play; renderDock(); });
$('z-in').addEventListener('click',function(){ var v=APP.view; flyTo(v.cx,v.cy,v.s*1.5,260); });
$('z-out').addEventListener('click',function(){ var v=APP.view; flyTo(v.cx,v.cy,v.s/1.5,260); });
$('z-cafe').addEventListener('click',function(){ flyTo(CAFE_POS[0]-APP.pad.l/2/1.4*0,CAFE_POS[1],1.7,900); });
$('b-help').addEventListener('click',function(){ selectDistrict(null); panel.dataset.state='open'; resize(); var s=panel.querySelector('.pbody'); if(s) s.scrollTop=0; });
$('b-theme').addEventListener('click',function(){ var cur=document.documentElement.getAttribute('data-theme'); var dark=cur?cur==='dark':(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches); document.documentElement.setAttribute('data-theme',dark?'light':'dark'); renderTheme(); });
function renderTheme(){ var cur=document.documentElement.getAttribute('data-theme'); var dark=cur?cur==='dark':(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches); $('b-theme').innerHTML=ic(dark?'sun':'moon',22); }
/* график: выбор времени нажатием */
panel.addEventListener('pointerdown',function(e){ var c=e.target.closest&&e.target.closest('#chart'); if(!c) return; ST.play=false; renderDock(); chartSet(c,e); c.setPointerCapture(e.pointerId); c._d=true; });
panel.addEventListener('pointermove',function(e){ var c=e.target.closest&&e.target.closest('#chart'); if(c&&c._d) chartSet(c,e); });
panel.addEventListener('pointerup',function(e){ var c=e.target.closest&&e.target.closest('#chart'); if(c) c._d=false; });
function chartSet(c,e){ var r=c.getBoundingClientRect(), x=(e.clientX-r.left)/r.width*340; ST.hour=clamp(6+(x-30)/(340-30-8)*18,6,23.9); tickTime(); }

/* ---- запуск ---- */
function boot(){
  $('logo').innerHTML=ic('cup',22);
  $('b-help').innerHTML=ic('help',22); $('z-in').innerHTML=ic('plus',22); $('z-out').innerHTML=ic('minus',22); $('z-cafe').innerHTML=ic('loc',22);
  buildWorld(); lifeInit();
  ST.month=4; ST.cal=CAL[ST.month-1]; setMode('districts'); ST.ads.flyer=true; ST.ads.corp=true; ST.ads.lunch=true; ST.ads.smm=true;
  renderLayers(); renderWx(); renderDock(); renderTheme(); tickTime();
  panel.dataset.state=isWide()?'open':'peek'; renderPanel(); resize();
  var v=APP.view; if(isWide()){ v.cx=1200; v.cy=820; v.s=.72; } else { v.cx=1180; v.cy=800; v.s=.62; } clampView(v);
  var fn=function(){ if(document.fonts&&document.fonts.load){ document.fonts.load('800 16px "Playfair Display"'); document.fonts.load('800 12px Nunito'); document.fonts.load('700 16px Caveat'); } };
  fn(); requestAnimationFrame(frame);
}
/* для проверки */
function prof(s){
  var W=1300,H=850, cv=document.createElement('canvas'); cv.width=W*1.5; cv.height=H*1.5; var g=cv.getContext('2d'), P=palette(seasonAt(5),'light'), view=APP.view, V=makeView(1200,850,s,W*1.5/1.0,H*1.5/1.0);
  g.setTransform(1.5*s,0,0,1.5*s,1.5*(W/2-1200*s),1.5*(H/2-850*s)); V=makeView(1200,850,s,W,H); var lod=lodOf(s), out={}, t=performance.now();
  function T(n){ g.getImageData(0,0,1,1); var x=performance.now(); out[n]=Math.round(x-t); t=x; }
  drawGround(g,V,P); T('ground'); drawPaths(g,V,P,lod); T('paths'); drawWater(g,V,P,lod); T('water'); drawRoads(g,V,P,lod); T('roads'); drawRails(g,V,P,lod); T('rails'); drawBridges(g,V,P,lod); T('bridges');
  var items=itemRange(GEN.items,V.y0-40,V.y1+70); out.items=items.length; t=performance.now(); drawShadows(g,V,P,items,lod); T('shadows');
  ['b','tr','y','car','stall','m'].forEach(function(k){ var sub=items.filter(function(it){ return it.t===k; }); t=performance.now(); drawItems(g,V,P,lod,sub); T('item_'+k); }); t=performance.now(); drawLampPosts(g,V,lod); T('lamps');
  return out;
}
window.__map={bench:bench,LF:LF,prof:prof,ST:ST,APP:APP,GEN:GEN,select:selectDistrict,fly:function(x,y,s){ APP.anim=null; APP.view.cx=x; APP.view.cy=y; APP.view.s=s; clampView(APP.view); return APP.view; },ms:function(){ return APP.cache.ms; },setMode:function(m){ setMode(m); renderLayers(); renderPanel(); },renderPanel:renderPanel,renderDock:renderDock,tick:tickTime,flyTo:flyTo};
boot();
