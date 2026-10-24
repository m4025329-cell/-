/* ===== Интерфейс, часть 8: «Живой месяц» — анимированное кафе на canvas ===== */

var LV_W=360, LV_H=212, LV_DAY=270, LV_FLOOR=162, LV_DOOR=118;
var LV_SEG={stu:'#2B78B5',off:'#6B7280',fam:'#2E7D4F',tur:'#E8A628',gou:'#B83A6B'};
var LV_TABLES=[{x:158,y:158},{x:214,y:158},{x:158,y:196},{x:214,y:196},{x:262,y:198}];
var LV_STAND=[{x:272,y:186},{x:283,y:191},{x:294,y:186},{x:305,y:191},{x:316,y:186},{x:327,y:191},{x:338,y:186},{x:349,y:191}];
var LV_SKIN=['#F2C9A0','#E8B88A','#D9A074','#BC8458','#8D5A3C'];
var LV_HAIR=['#2B1810','#5A3825','#8A5A2C','#C79A4B','#3B3B3B'];
var LV_WXN={sun:'Солнечно',cloud:'Облачно',rain:'Дождь',hot:'Жара'};
var LV_DOWN=['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
var LV={on:false,raf:0};

function lvRng(seed){ return mulberry32(hashStr(seed)); }
function lvData(R){
  var outs=R.outlets.filter(function(r){ return r.days&&r.days.length&&!r.building; }), main=outs[0]||null;
  var D={rev:[],gst:[],lost:[],wx:main?main.wx:[],dow0:main?main.startDow:0,main:main,outs:outs,seg:{stu:1,off:1,fam:1,tur:1,gou:1}};
  for(var i=0;i<30;i++){ var a=0,b=0,c=0; outs.forEach(function(r){ a+=r.days[i]||0; b+=r.dayGuests[i]||0; c+=r.dayLost?r.dayLost[i]||0:0; }); D.rev.push(a); D.gst.push(b); D.lost.push(c); }
  if(main&&main.segServed) D.seg=main.segServed;
  return D;
}
function lvLines(D,R){
  /* реплики для ленты: по одной на заметный день */
  var out={}, mxR=0, mxI=0, tot=sumArr(D.rev)||1, avg=tot/30; D.rev.forEach(function(v,i){ if(v>mxR){ mxR=v; mxI=i; } });
  var m=D.main, cityN=m?CITIES[m.city].n:'';
  out[0]='Открываемся: «'+(m?m.name||S.cafe:S.cafe)+'»';
  D.rev.forEach(function(v,i){
    if(out[i]) return; var wx=D.wx[i], dow=(D.dow0+i)%7, lostShare=D.lost[i]/Math.max(1,D.lost[i]+D.gst[i]);
    if(i===mxI && v>avg*1.25) out[i]='Рекордный день: '+rub(Math.round(v/100)*100);
    else if(lostShare>0.22) out[i]='Очередь у двери: часть гостей уходит';
    else if(wx==='rain' && i>2 && !out[i-1] && v<avg*0.9) out[i]='Дождь: на улице пусто';
    else if(dow===5 && v>avg) out[i]='Суббота: зал гудит';
    else if(wx==='hot' && v<avg*0.95) out[i]='Жара: гости ищут прохладу';
  });
  if(m && m.stockLoss>0.06 && !out[12]) out[12]='Стоп-лист: любимое блюдо закончилось';
  if(m && m.waste>0.1 && !out[19]) out[19]='На кухне выбрасывают испортившееся';
  if(m && m.dims && m.dims.svc<50 && !out[8]) out[8]='Гости ждут официанта слишком долго';
  if(m && m.dims && m.dims.food>=78 && !out[22]) out[22]='«Вкусно!» — шепчутся за столиками';
  if(m && m.utilK>1.05 && !out[15]) out[15]='Мест не хватает: стоят у стойки';
  out[29]='Закрываем смену. Считаем кассу…';
  return out;
}

/* ---------- рисование ---------- */
function lvRound(c,x,y,w,h,r){ c.beginPath(); c.moveTo(x+r,y); c.lineTo(x+w-r,y); c.quadraticCurveTo(x+w,y,x+w,y+r); c.lineTo(x+w,y+h-r); c.quadraticCurveTo(x+w,y+h,x+w-r,y+h); c.lineTo(x+r,y+h); c.quadraticCurveTo(x,y+h,x,y+h-r); c.lineTo(x,y+r); c.quadraticCurveTo(x,y,x+r,y); c.closePath(); }
function lvSky(wx,dark){ var m={sun:['#9FD3F0','#DDF0FA'],cloud:['#B7C9D6','#E4ECF1'],rain:['#7F95A4','#B4C3CC'],hot:['#F6C873','#FCE9BE']}[wx]||['#B7C9D6','#E4ECF1']; return dark?['#1E2B3A','#34465A']:m; }
function lvBg(c,L,t){
  var wx=L.wx, dark=isDark(), sk=lvSky(wx,dark), g=c.createLinearGradient(0,0,0,150); g.addColorStop(0,sk[0]); g.addColorStop(1,sk[1]); c.fillStyle=g; c.fillRect(0,0,100,LV_H);
  /* дома вдали */
  c.fillStyle=dark?'#2A3A4D':'#C9D6DE'; [[4,70,22],[30,52,18],[52,76,26],[80,60,18]].forEach(function(b){ c.fillRect(b[0],b[1],b[2],150-b[1]); });
  if(wx==='sun'||wx==='hot'){ c.fillStyle=wx==='hot'?'#FFB22E':'#FFE08A'; c.beginPath(); c.arc(70,26,wx==='hot'?13:10,0,6.283); c.fill(); if(wx==='hot'){ c.strokeStyle='rgba(255,178,46,.6)'; c.lineWidth=2; for(var k=0;k<8;k++){ var a=k*0.785+t*0.4; c.beginPath(); c.moveTo(70+Math.cos(a)*17,26+Math.sin(a)*17); c.lineTo(70+Math.cos(a)*23,26+Math.sin(a)*23); c.stroke(); } } }
  if(wx==='cloud'||wx==='rain'){ c.fillStyle=dark?'#44566A':'#F3F6F8'; [[20,22,18],[40,18,14],[64,26,16]].forEach(function(b){ c.beginPath(); c.arc(b[0]+Math.sin(t*0.3+b[0])*2,b[1],b[2],0,6.283); c.fill(); }); }
  /* тротуар */
  c.fillStyle=dark?'#4A4038':'#E5DACB'; c.fillRect(0,150,100,LV_H-150); c.fillStyle=dark?'#3A322C':'#CDBBA2'; c.fillRect(0,150,100,3);
  /* фонарь */
  c.fillStyle=dark?'#74808C':'#5B6670'; c.fillRect(22,70,3,82); c.fillRect(18,68,12,3); c.fillStyle=dark?'#FFD98A':'#FFF1BE'; c.beginPath(); c.arc(24,66,4.5,0,6.283); c.fill();
  /* фасад и зал */
  c.fillStyle=dark?'#3A2A22':'#FFF3DE'; c.fillRect(100,0,LV_W-100,LV_FLOOR-6);
  c.fillStyle=dark?'#2E211B':'#F2DFBF'; c.fillRect(100,96,LV_W-100,LV_FLOOR-102);
  c.fillStyle=dark?'#4A3629':'#E5CFA8'; c.fillRect(100,94,LV_W-100,3);
  for(var yy=LV_FLOOR-6; yy<LV_H; yy+=18){ for(var xx=100; xx<LV_W; xx+=18){ c.fillStyle=(((xx-100)/18+(yy-LV_FLOOR+6)/18)%2<1)?(dark?'#4A382C':'#F4E3C6'):(dark?'#3E2F25':'#EBD3AE'); c.fillRect(xx,yy,18,18); } }
  /* дверь */
  c.fillStyle='#8A5A2C'; c.fillRect(102,56,34,LV_FLOOR-56+6); c.fillStyle=dark?'#34465A':'#CFE6F2'; c.fillRect(106,62,26,50); c.fillStyle='rgba(255,255,255,.35)'; c.fillRect(108,64,8,46);
  c.fillStyle='#F2B233'; c.fillRect(129,110,3,6);
  /* маркиза */
  var awn=S&&S.awn||'#D1361A'; for(var s2=0;s2<8;s2++){ c.fillStyle=s2%2?'#FFF6E7':awn; c.fillRect(96+s2*10,38,10,14); c.beginPath(); c.arc(101+s2*10,52,5,0,3.1416); c.fill(); }
  c.fillStyle='rgba(0,0,0,.08)'; c.fillRect(96,38,80,3);
  /* меловое меню */
  c.fillStyle='#8A5A2C'; c.fillRect(150,26,56,46); c.fillStyle='#2F3D35'; c.fillRect(153,29,50,40); c.fillStyle='#F6F2E6'; c.font='700 11px Caveat, cursive'; c.textAlign='center'; c.fillText('МЕНЮ',178,43); c.fillRect(158,48,30,1.5); c.fillRect(158,55,38,1.5); c.fillRect(158,62,24,1.5); c.textAlign='left';
  /* окно кухни */
  c.fillStyle='#8A5A2C'; c.fillRect(226,22,92,52); c.fillStyle='#3A2A1F'; c.fillRect(230,26,84,44);
  /* гирлянда, растение */
  if(L.deco){ for(var b=0;b<10;b++){ c.fillStyle=['#F2B233','#D1361A','#2E7D4F','#B83A6B'][b%4]; c.globalAlpha=0.55+0.45*Math.abs(Math.sin(t*2+b)); c.beginPath(); c.arc(106+b*24,90+Math.sin(b*1.3)*3,2.6,0,6.283); c.fill(); } c.globalAlpha=1; }
  c.fillStyle='#2E7D4F'; c.beginPath(); c.arc(346,118,9,0,6.283); c.arc(338,126,7,0,6.283); c.arc(352,128,7,0,6.283); c.fill(); c.fillStyle='#B0693A'; c.fillRect(340,132,13,12);
  if(dark){ c.fillStyle='rgba(15,8,4,.22)'; c.fillRect(0,0,LV_W,LV_H); }
}
function lvCounter(c,t,busy){
  c.fillStyle='#8A5A2C'; c.fillRect(256,126,100,8); c.fillStyle='#B07A3E'; c.fillRect(258,134,96,38); c.fillStyle='rgba(0,0,0,.12)'; for(var i=0;i<6;i++) c.fillRect(264+i*16,138,2,30);
  /* касса */
  c.fillStyle='#2B1810'; c.fillRect(296,112,22,14); c.fillStyle='#8EE8B4'; c.fillRect(299,115,16,6); c.fillStyle='#F2B233'; c.fillRect(301,122,12,3);
  /* кофемашина */
  c.fillStyle='#4A4F57'; c.fillRect(268,104,22,22); c.fillStyle='#C0C6CE'; c.fillRect(271,108,16,5); c.fillStyle=busy?'#D1361A':'#6FD09A'; c.beginPath(); c.arc(279,119,2.2,0,6.283); c.fill();
  /* бариста */
  var by=Math.sin(t*5)*(busy?1.6:0.6); c.fillStyle='#FFF6E7'; lvRound(c,324,104+by,14,22,5); c.fill(); c.fillStyle='#D1361A'; c.fillRect(327,112+by,8,14); c.fillStyle=LV_SKIN[1]; c.beginPath(); c.arc(331,98+by,6,0,6.283); c.fill(); c.fillStyle='#2B1810'; c.beginPath(); c.arc(331,95+by,6,3.14,6.283); c.fill();
}
function lvKitchen(c,t,busy){
  var cx=272, bob=Math.sin(t*(busy?9:3))*(busy?2:0.8);
  c.fillStyle='#FFFFFF'; lvRound(c,cx-9,40+bob,18,26,6); c.fill(); c.fillStyle=LV_SKIN[2]; c.beginPath(); c.arc(cx,36+bob,6,0,6.283); c.fill(); c.fillStyle='#FFFFFF'; lvRound(c,cx-7,22+bob,14,10,4); c.fill(); c.fillRect(cx-8,29+bob,16,4);
  c.strokeStyle='#C0C6CE'; c.lineWidth=2.5; c.beginPath(); c.moveTo(cx+6,50+bob); c.lineTo(cx+20+Math.sin(t*10)*4,56+bob); c.stroke();
  c.fillStyle='#C0C6CE'; c.fillRect(250,62,44,6);
  if(busy){ c.strokeStyle='rgba(255,255,255,.75)'; c.lineWidth=1.8; for(var k=0;k<3;k++){ var x0=292+k*8, ph=(t*1.2+k*0.6)%1; c.beginPath(); c.moveTo(x0,60-ph*18); c.bezierCurveTo(x0-3,56-ph*18,x0+3,52-ph*18,x0,48-ph*18); c.globalAlpha=1-ph; c.stroke(); } c.globalAlpha=1; }
}
function lvTable(c,tb,t,occ){
  c.fillStyle='rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(tb.x,tb.y+10,17,5,0,0,6.283); c.fill();
  c.fillStyle='#8A5A2C'; c.fillRect(tb.x-1.5,tb.y-2,3,12);
  c.fillStyle='#FFFBF3'; c.beginPath(); c.ellipse(tb.x,tb.y-2,16,6.5,0,0,6.283); c.fill(); c.strokeStyle='#D9C3A5'; c.lineWidth=1.5; c.stroke();
  c.strokeStyle='rgba(209,54,26,.35)'; c.lineWidth=1; c.beginPath(); c.ellipse(tb.x,tb.y-2,11,4,0,0,6.283); c.stroke();
}
function lvPerson(c,g,t,bubble){
  var sz=g.kid?0.72:1, x=g.x, y=g.y, walk=g.walk, bob=walk?Math.abs(Math.sin(g.ph*9))*1.4:0, col=LV_SEG[g.seg]||'#888';
  c.save(); c.translate(x,y-bob); c.scale(sz*(g.dir<0?-1:1),sz);
  c.fillStyle='rgba(0,0,0,.14)'; c.beginPath(); c.ellipse(0,bob+1,7,2.4,0,0,6.283); c.fill();
  if(!g.sit){ var sw=walk?Math.sin(g.ph*9)*3.2:0; c.strokeStyle='#3B2A1F'; c.lineWidth=2.4; c.lineCap='round'; c.beginPath(); c.moveTo(-2,-8); c.lineTo(-2+sw,0); c.moveTo(2,-8); c.lineTo(2-sw,0); c.stroke(); }
  c.fillStyle=col; lvRound(c,-5.5,-22,11,15,4); c.fill();
  if(g.seg==='stu'){ c.fillStyle='#1C4A85'; c.fillRect(-8,-19,4,9); }
  if(g.seg==='off'){ c.fillStyle='#fff'; c.fillRect(-1.2,-21,2.4,6); c.fillStyle='#D1361A'; c.fillRect(-1,-20,2,6); }
  if(g.seg==='fam'){ c.fillStyle='#A6D9B8'; c.fillRect(-5,-14,10,2.4); }
  c.fillStyle=g.skin; c.beginPath(); c.arc(0,-27,5,0,6.283); c.fill();
  c.fillStyle=g.hair; c.beginPath(); c.arc(0,-28.4,5,3.14,6.283); c.fill();
  if(g.seg==='tur'){ c.fillStyle='#F2B233'; c.fillRect(-7,-31.5,14,2.2); c.beginPath(); c.arc(0,-32,4.6,3.14,6.283); c.fill(); c.fillStyle='#2B1810'; c.fillRect(4,-17,6,4); }
  if(g.seg==='gou'){ c.fillStyle='#F6F2E6'; lvRound(c,-4,-37,8,7,2); c.fill(); c.fillRect(-5,-31.4,10,2); }
  if(g.mood==='bad'){ c.strokeStyle='#8F1D0E'; c.lineWidth=1.3; c.beginPath(); c.moveTo(-2.5,-25.5); c.lineTo(-0.5,-26); c.moveTo(0.5,-26); c.lineTo(2.5,-25.5); c.moveTo(-2,-23.6); c.quadraticCurveTo(0,-25,2,-23.6); c.stroke(); }
  else { c.fillStyle='#2B1810'; c.fillRect(-2.4,-27,1.3,1.5); c.fillRect(1.1,-27,1.3,1.5); if(g.mood==='good'){ c.strokeStyle='#8F2410'; c.lineWidth=1; c.beginPath(); c.arc(0,-25,2,0.2,2.9); c.stroke(); } }
  c.restore();
  if(bubble){ c.font='800 9px Nunito, sans-serif'; var w=c.measureText(bubble.t).width+10, bx=x-w/2, by=y-48*sz; bx=Math.max(2,Math.min(LV_W-w-2,bx)); c.fillStyle='#fff'; lvRound(c,bx,by,w,14,6); c.fill(); c.strokeStyle=bubble.bad?'#D1361A':'#2E7D4F'; c.lineWidth=1.3; c.stroke(); c.fillStyle=bubble.bad?'#8F1D0E':'#14532D'; c.textAlign='center'; c.fillText(bubble.t,bx+w/2,by+10); c.textAlign='left'; }
}
function lvDish(c,x,y,kind,t){
  c.fillStyle='#fff'; c.beginPath(); c.ellipse(x,y-4,6,2.4,0,0,6.283); c.fill(); c.strokeStyle='#CDB89A'; c.lineWidth=1; c.stroke();
  if(kind===0){ c.fillStyle='#6B3E26'; c.beginPath(); c.arc(x,y-7,3.4,3.14,6.283); c.fill(); c.fillRect(x-3.4,y-7,6.8,3); }
  else if(kind===1){ c.fillStyle='#E8A628'; c.beginPath(); c.arc(x,y-6,4,0,6.283); c.fill(); c.fillStyle='#8EBF5A'; c.fillRect(x-2,y-8,4,2); }
  else { c.fillStyle='#C97B4A'; c.beginPath(); c.ellipse(x,y-6,4,2.6,0,0,6.283); c.fill(); }
  c.strokeStyle='rgba(120,100,80,.55)'; c.lineWidth=1; for(var k=0;k<2;k++){ var ph=(t*0.9+k*0.5)%1; c.globalAlpha=0.8-ph*0.8; c.beginPath(); c.moveTo(x-2+k*4,y-10-ph*9); c.quadraticCurveTo(x-4+k*4,y-13-ph*9,x-2+k*4,y-16-ph*9); c.stroke(); } c.globalAlpha=1;
}
function lvCat(c,t,L){
  var x=74, y=164, tail=Math.sin(t*2.2)*5;
  c.fillStyle='#E8863A'; c.beginPath(); c.ellipse(x,y-6,11,7,0,0,6.283); c.fill(); c.beginPath(); c.arc(x+8,y-12,6,0,6.283); c.fill();
  c.beginPath(); c.moveTo(x+4,y-16); c.lineTo(x+5,y-22); c.lineTo(x+9,y-17); c.fill(); c.beginPath(); c.moveTo(x+9,y-17); c.lineTo(x+12,y-22); c.lineTo(x+13,y-15); c.fill();
  c.strokeStyle='#E8863A'; c.lineWidth=3; c.lineCap='round'; c.beginPath(); c.moveTo(x-10,y-5); c.quadraticCurveTo(x-18,y-8+tail,x-16,y-16+tail); c.stroke();
  c.fillStyle='#F6F2E6'; c.beginPath(); c.ellipse(x+6,y-4,4,2.4,0,0,6.283); c.fill();
  c.strokeStyle='#2B1810'; c.lineWidth=1.2; c.beginPath(); c.moveTo(x+6,y-12.5); c.lineTo(x+9,y-12.5); c.moveTo(x+11,y-12.5); c.lineTo(x+13,y-12.5); c.stroke();
}
function lvRain(c,t,wx){
  if(wx!=='rain') return; c.strokeStyle='rgba(60,90,120,.55)'; c.lineWidth=1.2;
  for(var i=0;i<26;i++){ var x=(i*17.3+t*80)%110, y=((i*29.7)+t*220)%LV_H; c.beginPath(); c.moveTo(x,y); c.lineTo(x-2,y+7); c.stroke(); }
}

/* ---------- логика сцены ---------- */
function lvMk(L,seg,lost){
  var r=L.rng; return {seg:seg,x:-12,y:LV_FLOOR+8+r()*8,dir:1,state:lost?'peek':'in',t:0,ph:r()*6,skin:LV_SKIN[Math.floor(r()*5)],hair:LV_HAIR[Math.floor(r()*5)],kid:seg==='fam'&&r()<0.35,spot:-1,eat:0.45+r()*0.5,mood:'ok',walk:true,sit:false,lost:lost,dish:Math.floor(r()*3),sp:50+r()*16,bub:null,bt:0,pay:0};
}
function lvPickSeg(L){ var r=L.rng()*L.segSum, a=0, ks=['stu','off','fam','tur','gou']; for(var i=0;i<5;i++){ a+=L.seg[ks[i]]; if(r<=a) return ks[i]; } return 'stu'; }
function lvStartDay(L,d){
  var gu=L.D.gst[d], lo=L.D.lost[d], ns=gu>0?clamp(Math.round(gu/L.unit),1,2):0, nl=lo>0.6?clamp(Math.round(lo/L.unit*1.5),1,2):0;
  L.day=d; L.wx=L.D.wx[d]||'cloud'; L.revDay=L.D.rev[d]; L.perSprite=ns?L.D.rev[d]/ns:0; L.gPer=ns?gu/ns:0; L.lPer=nl?lo/nl:0;
  for(var i=0;i<ns;i++) L.spawn.push({at:L.el+L.rng()*LV_DAY*0.9,lost:false});
  for(var j=0;j<nl;j++) L.spawn.push({at:L.el+L.rng()*LV_DAY*0.9,lost:true});
  var dow=(L.D.dow0+d)%7; L.dowN=LV_DOWN[dow]; L.weekend=dow>=5;
  var el=document.getElementById('lv-day'); if(el) el.textContent='День '+(d+1)+' · '+L.dowN; var w=document.getElementById('lv-wx'); if(w) w.textContent=LV_WXN[L.wx]||'';
  var line=L.lines[d]; if(line) lvSay(line);
}
function lvSay(t){ var el=document.getElementById('lv-tick'); if(!el) return; el.innerHTML='<span class="lv-line">'+esc(t)+'</span>'; }
function lvFreeSpot(L){
  for(var i=0;i<LV_TABLES.length*2;i++){ if(!L.occ[i]) return i; }
  for(var k=0;k<LV_STAND.length;k++){ if(!L.occ[10+k]) return 10+k; }
  return -1;
}
function lvSpotPos(i){ if(i<10){ var tb=LV_TABLES[i>>1]; return {x:tb.x+((i&1)?13:-13),y:tb.y+2,sit:true,tb:tb}; } var s=LV_STAND[i-10]; return {x:s.x,y:s.y,sit:false}; }
function lvCoin(L,x,y,v){ L.coins.push({x:x,y:y-26,t:0,v:v,sx:x,sy:y-26}); }
function lvStep(L,dt){
  /* появление гостей */
  for(var i=L.spawn.length-1;i>=0;i--){ if(L.el>=L.spawn[i].at){ var sp=L.spawn.splice(i,1)[0]; L.gs.push(lvMk(L,lvPickSeg(L),sp.lost)); } }
  var gs=L.gs;
  for(var k=gs.length-1;k>=0;k--){
    var g=gs[k]; g.t+=dt; g.ph+=dt; var s=g.state;
    if(g.bt>0){ g.bt-=dt; if(g.bt<=0) g.bub=null; }
    var spd=g.sp*(g.x<LV_DOOR-6?2.3:1);
    if(s==='in'){ g.x+=spd*dt; g.dir=1; g.walk=true; if(g.x>=LV_DOOR){ g.state='go'; g.spot=lvFreeSpot(L); if(g.spot>=0) L.occ[g.spot]=true; else { g.spot=-1; g.state='out'; g.mood='bad'; g.bub={t:'Нет мест',bad:true}; g.bt=1.1; } } }
    else if(s==='peek'){ g.x+=spd*dt; g.dir=1; g.walk=true; if(g.x>=LV_DOOR-14){ g.state='peeked'; g.t=0; g.walk=false; g.mood='bad'; g.bub={t:L.lostMsg,bad:true}; g.bt=1.0; L.lost+=L.lPer; } }
    else if(s==='peeked'){ if(g.t>0.55){ g.state='leave'; } }
    else if(s==='leave'){ g.x-=spd*1.3*dt; g.dir=-1; g.walk=true; if(g.x<-20) gs.splice(k,1); }
    else if(s==='go'){ var p=g.spot>=0?lvSpotPos(g.spot):{x:LV_DOOR,y:LV_FLOOR+8,sit:false}, dx=p.x-g.x, dy=p.y-g.y, d=Math.sqrt(dx*dx+dy*dy)||1, st=g.sp*dt; g.dir=dx>=0?1:-1; g.walk=true; if(d<=st+0.5){ g.x=p.x; g.y=p.y; g.state='eat'; g.t=0; g.walk=false; g.sit=p.sit; g.dir=p.sit?((g.spot&1)?-1:1):1; } else { g.x+=dx/d*st; g.y+=dy/d*st; } }
    else if(s==='eat'){ if(g.t>g.eat){ g.state='pay'; g.t=0; lvCoin(L,g.x,g.y,L.perSprite); L.guests+=L.gPer; g.mood=L.happy?'good':'ok'; if(L.rng()<0.28){ var m=L.praise[Math.floor(L.rng()*L.praise.length)]; g.bub=m; g.bt=1.0; } } }
    else if(s==='pay'){ if(g.t>0.25){ if(g.spot>=0){ L.occ[g.spot]=false; g.spot=-1; } g.state='out'; g.sit=false; g.walk=true; } }
    else if(s==='out'){ var tx2=g.x>LV_DOOR+2?LV_DOOR:-20, ty2=LV_FLOOR+8, ddx=tx2-g.x, ddy=ty2-g.y, dd=Math.sqrt(ddx*ddx+ddy*ddy)||1, s2=spd*dt; g.dir=ddx>=0?1:-1; g.walk=true; if(dd<=s2+0.5){ g.x=tx2; g.y=ty2; if(tx2<0) gs.splice(k,1); } else { g.x+=ddx/dd*s2; g.y+=ddy/dd*s2; } if(g.x<=LV_DOOR+2&&tx2===LV_DOOR) { g.x=LV_DOOR-1; } }
  }
  /* монеты летят в кассу */
  for(var c2=L.coins.length-1;c2>=0;c2--){ var cn=L.coins[c2]; cn.t+=dt*1.5; var u=Math.min(1,cn.t); cn.x=cn.sx+(307-cn.sx)*u; cn.y=cn.sy+(116-cn.sy)*u-Math.sin(u*3.14)*22; if(u>=1){ L.rev+=cn.v; L.coins.splice(c2,1); if(L.coinSnd++%6===0) sfx('coin'); L.pulse=1; } }
  if(L.pulse>0) L.pulse=Math.max(0,L.pulse-dt*4);
}
function lvDraw(L){
  var c=L.ctx, t=L.time; c.setTransform(L.k,0,0,L.k,0,0); c.clearRect(0,0,LV_W,LV_H);
  lvBg(c,L,t); lvRain(c,t,L.wx);
  var occN=0; L.occ.forEach(function(v){ if(v) occN++; }); var busy=occN>2;
  lvKitchen(c,t,busy); lvCounter(c,t,busy); lvCat(c,t,L);
  var list=[]; LV_TABLES.forEach(function(tb,i){ list.push({y:tb.y,f:function(){ lvTable(c,tb,t); }}); });
  L.gs.forEach(function(g){ list.push({y:g.y+(g.sit?5:0),f:function(){ lvPerson(c,g,t,g.bub); }}); });
  /* официант */
  var wy=LV_FLOOR+14, wx=290-Math.abs(Math.sin(t*0.9))*120, carry=Math.sin(t*0.9)>0;
  list.push({y:wy,f:function(){ lvPerson(c,{seg:'off',x:wx,y:wy,dir:Math.cos(t*0.9)>0?-1:1,ph:t,skin:LV_SKIN[1],hair:LV_HAIR[0],walk:busy,sit:false,mood:'good',kid:false},t); c.fillStyle='#FFF6E7'; c.fillRect(wx-5,wy-20,10,9); c.fillStyle='#D1361A'; c.fillRect(wx-5,wy-12,10,2); if(busy&&carry){ c.fillStyle='#C0C6CE'; c.fillRect(wx+5,wy-22,10,2); lvDish(c,wx+10,wy-20,1,t); } }});
  list.sort(function(a,b){ return a.y-b.y; }).forEach(function(o){ o.f(); });
  L.gs.forEach(function(g){ if(g.state==='eat'&&g.sit){ var p=lvSpotPos(g.spot); lvDish(c,p.tb.x+(g.spot&1?7:-7),p.tb.y-1,g.dish,t); } });
  /* монеты */
  L.coins.forEach(function(cn){ c.fillStyle='#F2B233'; c.strokeStyle='#B9811A'; c.lineWidth=1.4; c.beginPath(); c.arc(cn.x,cn.y,4.4,0,6.283); c.fill(); c.stroke(); c.fillStyle='#B9811A'; c.font='900 6px Nunito, sans-serif'; c.textAlign='center'; c.fillText('₽',cn.x,cn.y+2.2); c.textAlign='left'; });
  if(L.pulse>0){ c.strokeStyle='rgba(242,178,51,'+L.pulse+')'; c.lineWidth=3; c.beginPath(); c.arc(307,118,10+(1-L.pulse)*10,0,6.283); c.stroke(); }
  if(L.weekend){ c.fillStyle='rgba(209,54,26,.9)'; lvRound(c,LV_W-76,6,70,16,8); c.fill(); c.fillStyle='#fff'; c.font='800 9.5px Nunito, sans-serif'; c.textAlign='center'; c.fillText('ВЫХОДНОЙ',LV_W-41,17.2); c.textAlign='left'; }
}
function lvCounters(L){
  var r=document.getElementById('lv-rev'), g=document.getElementById('lv-g'), l=document.getElementById('lv-l'), bar=document.getElementById('lv-bar');
  if(r) r.textContent=rub(Math.round(L.rev)); if(g) g.textContent=Math.round(L.guests).toLocaleString('ru-RU').replace(/,/g,' '); if(l) l.textContent=Math.round(L.lost).toLocaleString('ru-RU').replace(/,/g,' '); if(bar) bar.style.width=Math.min(100,((L.day+1)/30*100))+'%';
}
function lvFrame(ts){
  var L=LV.L; if(!L||!LV.on) return;
  var dt=Math.min(0.05,(ts-(L.last||ts))/1000); L.last=ts; if(L.fast) dt*=3;
  L.time+=dt; L.el+=dt*1000;
  while(L.day<29 && L.el>=(L.day+1)*LV_DAY) lvStartDay(L,L.day+1);
  lvStep(L,dt); lvDraw(L);
  if((L.cnt=(L.cnt||0)+1)%4===0) lvCounters(L);
  if(L.el>=30*LV_DAY && !L.gs.length && !L.coins.length && !L.done){ L.done=true; L.rev=L.D.rev.reduce(function(a,b){ return a+b; },0); L.guests=sumArr(L.D.gst); L.lost=sumArr(L.D.lost); lvCounters(L); lvFinish(); return; }
  LV.raf=requestAnimationFrame(lvFrame);
}
function lvFinish(){
  var b=document.getElementById('lv-btn'); if(b){ b.classList.remove('secondary'); b.classList.add('pulse'); b.innerHTML=ico('right')+' Итоги месяца'; }
  lvSay('Смена закончена!'); sfx('bell');
  later(function(){ if(U.screen==='run') A.runskip(); },reduced?400:3600);
}
function liveStop(){ LV.on=false; if(LV.raf) cancelAnimationFrame(LV.raf); LV.raf=0; }
function liveStart(){
  liveStop(); var cv=document.getElementById('lv-canvas'); if(!cv||!U.report) return;
  var R=U.report, D=lvData(R), k=Math.min(2.5,Math.max(1,window.devicePixelRatio||1)); cv.width=Math.round(LV_W*k); cv.height=Math.round(LV_H*k);
  var m=D.main, mxG=Math.max.apply(null,D.gst.concat([1])), segSum=0; ['stu','off','fam','tur','gou'].forEach(function(x){ segSum+=D.seg[x]||0; }); if(!segSum){ segSum=5; D.seg={stu:1,off:1,fam:1,tur:1,gou:1}; }
  var rng=lvRng((S.seed||'x')+'|live'+R.m), dims=m&&m.dims||{food:60,svc:60,val:70};
  var praise=[]; if(dims.food>=70) praise.push({t:'Вкусно!'}); if(dims.atmo>=60) praise.push({t:'Уютно'}); if(dims.svc>=65) praise.push({t:'Быстро'}); if(dims.val>=85) praise.push({t:'Недорого'}); if(dims.val<55) praise.push({t:'Дороговато',bad:true}); if(dims.food<55) praise.push({t:'Пресно',bad:true}); if(!praise.length) praise.push({t:'Нормально'});
  var lostMsg=m&&m.utilK>1.0?'Не успели':(m&&m.m&&m.m.menuprice>m.m.cap?'Не то меню':'Закрыто?');
  var L={ctx:cv.getContext('2d'),k:k,D:D,rng:rng,seg:D.seg,segSum:segSum,unit:Math.max(1,mxG/1.5),day:-1,el:0,time:0,spawn:[],gs:[],coins:[],occ:[],rev:0,guests:0,lost:0,lines:lvLines(D,R),wx:D.wx[0]||'cloud',deco:!!(m&&m.dims&&m.dims.atmo>=60),praise:praise,lostMsg:lostMsg,happy:(m&&m.rating>=3.8),pulse:0,coinSnd:0,fast:false,done:false,perSprite:0,gPer:0,lPer:0};
  LV.L=L; LV.on=true; lvStartDay(L,0);
  if(reduced){ L.rev=sumArr(D.rev); L.guests=sumArr(D.gst); L.lost=sumArr(D.lost); L.day=29; lvStartDay(L,29); lvCounters(L); lvDraw(L); L.done=true; lvFinish(); LV.on=false; return; }
  lvDraw(L); LV.raf=requestAnimationFrame(lvFrame);
}
function liveHTML(){
  var R=U.report, D=lvData(R), city=D.main?CITIES[D.main.city].n:'', n=D.outs.length;
  return '<article class="card live"><div class="lv-top"><div><b id="lv-day" class="lv-day">День 1</b><span class="lv-wx" id="lv-wx"></span></div><div class="lv-city">'+ico('pin','sm')+' '+esc(city)+(n>1?' + ещё '+(n-1):'')+'</div></div><div class="lv-stage"><canvas id="lv-canvas" role="img" aria-label="Кафе работает: гости приходят, заказывают, платят и уходят" width="360" height="212"></canvas></div><div class="lv-track" aria-hidden="true"><i id="lv-bar"></i></div><div class="lv-tick" id="lv-tick" aria-live="polite"></div>'+
   '<div class="lv-stats"><div><small>Касса</small><b class="num" id="lv-rev">0 ₽</b></div><div><small>Гостей</small><b class="num" id="lv-g">0</b></div><div class="bad"><small>Ушли</small><b class="num" id="lv-l">0</b></div></div>'+
   '<div class="row" style="justify-content:center;margin-top:10px"><button class="btn secondary" id="lv-btn" data-act="runskip">Показать итоги '+ico('right')+'</button><button class="btn ghost small" data-act="runfast" aria-label="Ускорить">'+ico('right','sm')+ico('right','sm')+'</button></div></article>';
}
A.runfast=function(){ if(LV.L) LV.L.fast=!LV.L.fast; };
