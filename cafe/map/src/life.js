/* ===== Карта Тулы: жизнь города (прохожие, машины, автобусы, поезда, лодки, птицы, погода) ===== */

/* общее состояние интерфейса и времени */
var ST={
  hour:11.5, cal:2, month:1, weather:'auto', play:true, speed:1,
  mode:'districts', layers:{districts:true,guests:false,rivals:false,ads:false,rent:false,names:true},
  adLoc:{flyer:'old',corp:'biz',lunch:'biz'},
  sel:null, hover:null, hoursOpt:1, ads:{flyer:true,smm:true,corp:false,lunch:false,fest:false,class:false,blog:false,loyal:false},
  reduce:false, quality:1, guestCount:0, cafeTick:0
};

var LF={peds:[],cars:[],buses:[],trains:[],boats:[],ducks:[],birds:[],clouds:[],puffs:[],rain:[],snow:[],ripples:[],glints:[],graph:null,t:0,inited:false,dEdges:{},dLen:{}};
var LR=mulberry32(4242);

/* ---- граф пешеходных дорожек ---- */
function buildGraph(){
  var nodes={}, edges=[];
  function key(p){ return Math.round(p[0]*2)+','+Math.round(p[1]*2); }
  function node(p){ var k=key(p); return nodes[k]||(nodes[k]={x:p[0],y:p[1],e:[],k:k}); }
  function addPoly(pts,w,d){
    for(var i=1;i<pts.length;i++){
      var a=pts[i-1], b=pts[i], l=dist(a,b); if(l<1.2) continue;
      var na=node(a), nb=node(b), mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];
      var e={ax:a[0],ay:a[1],bx:b[0],by:b[1],len:l,w:w,d:d||districtAt(mid[0],mid[1]),a:na,b:nb,ang:Math.atan2(b[1]-a[1],b[0]-a[0])};
      edges.push(e); na.e.push(e); nb.e.push(e);
    }
  }
  GEN.streets.forEach(function(s){ addPoly(s.pts,s.w,s.d==='vil'?null:s.d); });
  GEN.roads.forEach(function(r){ if(r.cls==='hwy') return; addPoly(r.pts,r.w,null); });
  GEN.paths.forEach(function(p){ if(p.w>=3) addPoly(p.pts,p.w,null); });
  LF.graph={nodes:nodes,edges:edges};
  DORDER.forEach(function(id){ LF.dEdges[id]=[]; LF.dLen[id]=0; });
  edges.forEach(function(e){ if(e.d&&LF.dEdges[e.d]){ LF.dEdges[e.d].push(e); LF.dLen[e.d]+=e.len; } });
}
function otherEnd(e,n){ return e.a===n?e.b:e.a; }

function pedPos(p){
  var e=p.e, t=p.t/e.len, x=e.ax+(e.bx-e.ax)*t, y=e.ay+(e.by-e.ay)*t, nx=-(e.by-e.ay)/e.len, ny=(e.bx-e.ax)/e.len, off=p.off*(e.w/2+1.5);
  return [x+nx*off,y+ny*off];
}
function pickSeg(d,rng){ var mix=DIST[d].mix, r=rng()*100, acc=0; for(var i=0;i<SEGS.length;i++){ acc+=mix[SEGS[i]]; if(r<acc) return SEGS[i]; } return 'off'; }
function spawnPed(d){
  var list=LF.dEdges[d]; if(!list||!list.length) return null;
  var tot=LF.dLen[d], r=LR()*tot, e=list[0];
  for(var i=0;i<list.length;i++){ r-=list[i].len; if(r<=0){ e=list[i]; break; } }
  var p={e:e,t:LR()*e.len,dir:LR()<.5?1:-1,spd:rr(LR,5.5,9.5),seg:pickSeg(d,LR),off:LR()<.5?1:-1,d:d,dist:0,max:rr(LR,160,520),al:0,ph:LR()*6.28,cafe:false};
  LF.peds.push(p); return p;
}
function stepPed(p,dt){
  var e=p.e, mv=p.spd*dt*p.dir; p.t+=mv; p.dist+=Math.abs(mv);
  if(p.t<0||p.t>e.len){
    var n=p.t<0?e.a:e.b, over=p.t<0?-p.t:p.t-e.len, cand=n.e.filter(function(x){ return x!==e; }), ne;
    if(!cand.length){ ne=e; p.dir=-p.dir; p.t=p.t<0?over:e.len-over; return; }
    if(p.cafe){ /* жадно к двери кафе */
      var best=1e9; cand.forEach(function(c){ var o=otherEnd(c,n), dd=dist([o.x,o.y],CAFE_POS); if(dd<best){ best=dd; ne=c; } });
    } else if(LR()<.62){ /* идём прямо */
      var cur=(n===e.b)?e.ang:e.ang+Math.PI, bd=9; cand.forEach(function(c){ var ca=(n===c.a)?c.ang:c.ang+Math.PI, df=Math.abs(Math.atan2(Math.sin(ca-cur),Math.cos(ca-cur))); if(df<bd){ bd=df; ne=c; } });
    } else ne=cand[Math.floor(LR()*cand.length)];
    p.e=ne; if(n===ne.a){ p.dir=1; p.t=Math.min(over,ne.len); } else { p.dir=-1; p.t=Math.max(ne.len-over,0); }
  }
}

/* ---- интенсивность по времени ---- */
function distFlowNow(id){ return distFlow(id,ST.hour); }
function seasonK(cal,seg){ /* зима и дождь уменьшают поток прохожих */
  var k=1; var s=SEASONS[cal]; k*=1-s.snow*.28; if(ST._wx==='rain') k*=.55; if(ST._wx==='snow') k*=.7; if(ST._wx==='fog') k*=.9; return k;
}
function targetPeds(id){
  var len=LF.dLen[id]||0; if(!len) return 0;
  var f=distFlowNow(id)/100, n=len*.016*f*seasonK(ST.cal);
  if(id==='park'&&(ST._wx==='clear')&&SEASONS[ST.cal].snow<.1) n*=1.4;
  return Math.min(Math.round(n*ST.quality),150);
}

/* ---- погода ---- */
function weatherFor(m){
  if(ST.weather!=='auto') return ST.weather;
  var s=SEASONS[ST.cal], r=mulberry32(m*977+13)();
  if(s.snow>.55) return r<.55?'snow':(r<.7?'cloudy':'clear');
  if(s.snow>.15) return r<.35?'snow':(r<.55?'rain':(r<.7?'cloudy':'clear'));
  if(ST.cal===3||ST.cal===8||ST.cal===9||ST.cal===10) return r<.38?'rain':(r<.55?'cloudy':(r<.62?'fog':'clear'));
  return r<.2?'rain':(r<.4?'cloudy':'clear');
}

/* ---- инициализация живых объектов ---- */
function lifeInit(){
  if(LF.inited) return; LF.inited=true;
  buildGraph();
  /* облака */
  for(var i=0;i<9;i++) LF.clouds.push({x:rr(LR,-200,2600),y:rr(LR,-100,1800),r:rr(LR,90,190),sp:rr(LR,5,10),a:rr(LR,.5,1),sd:LR()});
  /* блики на воде */
  for(i=0;i<160;i++) LF.glints.push({u:LR(),v:LR()*2-1,t:LR()*6.28,sp:rr(LR,3,7),w:LR()<.82?0:1});
  /* утки */
  for(i=0;i<9;i++) LF.ducks.push({x:1092+rr(LR,-34,34),y:1160+rr(LR,-12,12),a:LR()*6.28,s:rr(LR,.6,1.3),p:0});
  for(i=0;i<5;i++) LF.ducks.push({x:1300+rr(LR,-18,18),y:1060+rr(LR,-8,8),a:LR()*6.28,s:rr(LR,.6,1.3),p:1});
  /* лодка по Упе */
  LF.boats.push({d:rr(LR,1200,1500),sp:5.2,dir:1,w:0});
  /* птицы */
  for(i=0;i<2;i++) LF.birds.push({x:rr(LR,200,2000),y:rr(LR,200,1400),a:rr(LR,-.4,.4),sp:rr(LR,28,40),n:6+Math.floor(LR()*4),ph:LR()*6.28});
  /* автобусы по проспекту Ленина и набережной */
  var lenin=GEN.roads.filter(function(r){ return r.id==='lenin'; })[0], ring=GEN.roads.filter(function(r){ return r.id==='ring'; })[0], mk=GEN.roads.filter(function(r){ return r.id==='mkt'; })[0];
  [[lenin,0],[lenin,1],[lenin,2],[ring,0],[ring,1],[mk,0]].forEach(function(b,bi){ if(!b[0]) return; var L=polyLen(b[0].pts); LF.buses.push({road:b[0],d:L*(b[1]+.3)/3.2,dir:(bi%2)?-1:1,sp:17,wait:0,L:L,col:bi%2?'#D1361A':'#2F7FD3'}); });
  /* стартовые пешеходы */
  DORDER.forEach(function(id){ var n=Math.round(targetPeds(id)*.9); for(var k=0;k<n;k++){ var p=spawnPed(id); if(p) p.al=1; } });
  /* машины на дорогах */
  var rds=GEN.roads.filter(function(r){ return r.cls!=='st'; });
  for(i=0;i<70;i++){ var r=pick(LR,rds), L2=polyLen(r.pts); LF.cars.push({road:r,d:LR()*L2,dir:LR()<.5?1:-1,sp:rr(LR,19,30),col:pick(LR,PAL.car),L:L2,len:rr(LR,5,6.4),kind:LR()<.08?1:0}); }
  /* поезд */
  LF.trains.push({d:-200,dir:1,sp:34,n:9,kind:0,stop:0,stopped:false,done:false,delay:6});
  LF.trains.push({d:polyLen(RAILS)+200,dir:-1,sp:30,n:14,kind:1,stop:0,stopped:false,delay:30});
}

/* ---- шаг моделирования ---- */
function lifeStep(dt){
  if(!LF.inited) return; var ds=dt*(ST.reduce?0:1);
  LF.t+=dt;
  ST._wx=weatherFor(ST.month);
  /* пешеходы: доводим численность до целевой */
  var total=0;
  DORDER.forEach(function(id){
    var tg=targetPeds(id), have=LF.pcount?LF.pcount[id]||0:0;
    if(have<tg&&LR()<Math.min(1,(tg-have)*.15*ds+.02)) { var p=spawnPed(id); if(p) have++; }
  });
  var cnt={}; DORDER.forEach(function(id){ cnt[id]=0; });
  for(var i=LF.peds.length-1;i>=0;i--){
    var p=LF.peds[i]; stepPed(p,ds);
    if(p.al<1&&!p.gone) p.al=Math.min(1,p.al+ds*1.5);
    var tg2=targetPeds(p.d);
    if(!p.cafe&&(p.dist>p.max||((cnt[p.d]||0)>tg2*1.15&&LR()<.02))) p.gone=true;
    if(p.gone){ p.al-=ds*1.6; if(p.al<=0){ LF.peds.splice(i,1); continue; } }
    if(p.cafe){ var q=pedPos(p); if(dist(q,CAFE_POS)<6){ p.gone=true; if(!p.entered){ p.entered=true; ST.guestCount++; ST.cafeTick=1; } } }
    if(!p.gone&&p.d) cnt[p.d]++;
  }
  LF.pcount=cnt;
  /* гости, идущие в «Первый столик» */
  var fl=distFlowNow('old')/100, rate=.35*fl*(.6+.4*(SEASONS[ST.cal].snow<.5?1:.6)); /* в секунду */
  if(LR()<rate*ds){
    var cand=LF.graph.edges.filter(function(e){ return Math.abs(e.ax-CAFE_POS[0])<140&&Math.abs(e.ay-CAFE_POS[1])<110; });
    if(cand.length){ var e=pick(LR,cand), seg=pickSeg('old',LR); LF.peds.push({e:e,t:LR()*e.len,dir:LR()<.5?1:-1,spd:rr(LR,7,10),seg:seg,off:LR()<.5?1:-1,d:'old',dist:0,max:9999,al:1,ph:0,cafe:true}); }
  }
  /* автомобили */
  var rush=1+.9*Math.exp(-Math.pow((ST.hour-8.4)/1.2,2))+.9*Math.exp(-Math.pow((ST.hour-17.8)/1.4,2)); if(ST.hour<5.5||ST.hour>23) rush*=.25;
  var wxk=ST._wx==='snow'?.7:1;
  var carTarget=Math.round(95*rush*wxk*ST.quality);
  if(LF.cars.length<carTarget&&LR()<.35*Math.max(ds,.001)*30*(ds>0?1:0)){
    var rd=pick(LR,GEN.roads.filter(function(r){ return r.cls!=='st'; })), Lr=polyLen(rd.pts), dr=LR()<.5?1:-1;
    LF.cars.push({road:rd,d:dr>0?0:Lr,dir:dr,sp:rr(LR,19,30),col:pick(LR,PAL.car),L:Lr,len:rr(LR,5,6.4),kind:LR()<.08?1:0});
  }
  LF.cars.forEach(function(c){ c.d+=c.dir*c.sp*ds*wxk; });
  LF.cars=LF.cars.filter(function(c){ return c.d>=-8&&c.d<=c.L+8; });
  /* автобусы */
  LF.buses.forEach(function(b){
    if(b.wait>0){ b.wait-=ds; return; }
    b.d+=b.dir*b.sp*ds; if(b.d<0||b.d>b.L){ b.dir=-b.dir; b.d=clamp(b.d,0,b.L); b.wait=5; }
    if(Math.floor((b.d+1000)/340)!==b.lastStop&&!b.wait){ b.lastStop=Math.floor((b.d+1000)/340); b.wait=2.8; }
  });
  /* поезда */
  var RL=polyLen(RAILS), stX=1620;
  LF.trains.forEach(function(t){
    if(t.delay>0){ t.delay-=ds; return; }
    var pos=pointAt(RAILS,t.d);
    if(t.kind===0&&!t.stopped&&!t.done&&Math.abs(pos[0]-stX)<6&&t.dir>0){ t.stopped=true; t.stop=7; if(!ST.reduce) boardPassengers(t); }
    if(t.stopped){ t.stop-=ds; if(t.stop<=0){ t.stopped=false; t.done=true; } return; }
    var spd=t.sp; if(t.kind===0&&!t.done){ var dd=Math.abs(pos[0]-stX); if(dd<90) spd=Math.max(7,t.sp*dd/90); }
    t.d+=t.dir*spd*ds;
    if((t.dir>0&&t.d>RL+(t.n*17+90))||(t.dir<0&&t.d<-(t.n*17+90))){ t.d=t.dir>0?-(t.n*17+90):RL+(t.n*17+90); t.delay=rr(LR,28,70); t.done=false; }
  });
  /* лодки */
  LF.boats.forEach(function(b){ b.d+=b.dir*b.sp*ds; if(b.d>1600) b.dir=-1; if(b.d<1180) b.dir=1; });
  LF.ducks.forEach(function(d){ d.a+=rr(LR,-.6,.6)*ds; var nx=d.x+Math.cos(d.a)*d.s*ds*3, ny=d.y+Math.sin(d.a)*d.s*ds*2; var pd=d.p?[1300,1060,34,20]:[1092,1160,62,30]; if(Math.pow((nx-pd[0])/pd[2],2)+Math.pow((ny-pd[1])/pd[3],2)<.7){ d.x=nx; d.y=ny; } else d.a+=3.14; });
  LF.birds.forEach(function(b){ b.x+=Math.cos(b.a)*b.sp*ds; b.y+=Math.sin(b.a)*b.sp*ds; b.a+=Math.sin(LF.t*.3+b.ph)*.004; if(b.x>2700||b.x<-300||b.y<-300||b.y>2000){ b.x=-200; b.y=rr(LR,100,1500); b.a=rr(LR,-.3,.3); } });
  LF.clouds.forEach(function(c){ c.x+=c.sp*ds; if(c.x>2700+c.r) c.x=-300-c.r; });
  /* дым труб */
  if(LF.puffs.length<140&&LR()<.5*ds*20&&GEN.smoke.length){ var sm=pick(LR,GEN.smoke); LF.puffs.push({x:sm.x,y:sm.y,r:2.4,a:.55,vx:rr(LR,3,6),vy:rr(LR,-9,-6)}); }
  for(i=LF.puffs.length-1;i>=0;i--){ var f=LF.puffs[i]; f.x+=f.vx*ds; f.y+=f.vy*ds; f.r+=ds*1.8; f.a-=ds*.1; if(f.a<=0) LF.puffs.splice(i,1); }
  /* дождь, снег */
  var wx=ST._wx;
  if(wx==='rain'&&LF.rain.length<520){ for(i=0;i<20;i++) LF.rain.push({x:LR(),y:LR(),l:rr(LR,.012,.03),v:rr(LR,1.4,2.2)}); }
  if(wx!=='rain'&&LF.rain.length) LF.rain.length=Math.max(0,LF.rain.length-30);
  if(wx==='snow'&&LF.snow.length<420){ for(i=0;i<10;i++) LF.snow.push({x:LR(),y:LR(),r:rr(LR,.8,2),v:rr(LR,.05,.14),ph:LR()*6.28}); }
  if(wx!=='snow'&&LF.snow.length) LF.snow.length=Math.max(0,LF.snow.length-12);
  LF.rain.forEach(function(r){ r.y+=r.v*ds*.5; r.x-=r.v*ds*.12; if(r.y>1){ r.y=-.05; r.x=LR()*1.2; } });
  LF.snow.forEach(function(s){ s.y+=s.v*ds*.35; s.x+=Math.sin(LF.t+s.ph)*.0007; if(s.y>1){ s.y=-.03; s.x=LR(); } });
  if(wx==='rain'&&LR()<.4&&LF.ripples.length<30) LF.ripples.push({x:LR(),y:LR(),t:0});
  for(i=LF.ripples.length-1;i>=0;i--){ LF.ripples[i].t+=ds; if(LF.ripples[i].t>1) LF.ripples.splice(i,1); }
  if(ST.cafeTick>0) ST.cafeTick=Math.max(0,ST.cafeTick-ds*1.5);
}
function boardPassengers(t){
  /* пассажиры сходят с поезда и идут к вокзалу по ближайшим дорожкам */
  var edges=LF.graph.edges.filter(function(e){ return Math.abs(e.ax-1620)<130&&e.ay>570&&e.ay<700&&e.d==='stat'; });
  if(!edges.length) return;
  for(var i=0;i<12;i++){ var e=pick(LR,edges); LF.peds.push({e:e,t:LR()*e.len,dir:LR()<.5?1:-1,spd:rr(LR,7,10),seg:LR()<.55?'tur':'off',off:LR()<.5?1:-1,d:'stat',dist:0,max:rr(LR,120,260),al:0,ph:0,cafe:false}); }
}

/* ---- рисование живых объектов ---- */
function drawPeds(ctx,V){
  var s=V.s, big=s>=1.5, mid=s>=.7, rpx=Math.max(.8,1.5/s);
  for(var i=0;i<LF.peds.length;i++){
    var p=LF.peds[i]; var q=pedPos(p);
    if(q[0]<V.x0-10||q[0]>V.x1+10||q[1]<V.y0-10||q[1]>V.y1+10) continue;
    ctx.globalAlpha=Math.max(0,Math.min(1,p.al));
    var col=SEGC[p.seg];
    if(big){
      var bob=Math.sin(LF.t*9+p.ph)*.25;
      ctx.fillStyle='rgba(30,30,40,.25)'; ctx.beginPath(); ctx.ellipse(q[0]+.7,q[1]+.2,1.2,.6,0,0,6.28); ctx.fill();
      ctx.fillStyle=col; ctx.fillRect(q[0]-.8,q[1]-3.1+bob*.4,1.6,2.5);
      ctx.fillStyle='#E9C9A6'; ctx.beginPath(); ctx.arc(q[0],q[1]-3.8+bob*.4,.85,0,6.28); ctx.fill();
      ctx.fillStyle='#3A3A44'; ctx.fillRect(q[0]-.6,q[1]-.6,.5,.8+bob); ctx.fillRect(q[0]+.1,q[1]-.6,.5,.8-bob);
      if(p.cafe){ ctx.strokeStyle='#FFD43B'; ctx.lineWidth=.35; ctx.beginPath(); ctx.arc(q[0],q[1]-2,2.6,0,6.28); ctx.stroke(); }
    } else {
      ctx.fillStyle=col; ctx.beginPath(); ctx.arc(q[0],q[1]-(mid?1.2:0),rpx,0,6.28); ctx.fill();
      if(p.cafe){ ctx.strokeStyle='#FFD43B'; ctx.lineWidth=rpx*.5; ctx.beginPath(); ctx.arc(q[0],q[1],rpx*1.7,0,6.28); ctx.stroke(); }
    }
  }
  ctx.globalAlpha=1;
}
function roadPoint(r,d,lane){
  var p=pointAt(r.pts,clamp(d,0,polyLen(r.pts))), a=p[2], off=lane*r.w*.22;
  return [p[0]-Math.sin(a)*off,p[1]+Math.cos(a)*off,a];
}
function drawCars(ctx,V,night){
  var s=V.s;
  for(var i=0;i<LF.cars.length;i++){
    var c=LF.cars[i], lane=c.dir>0?1:-1, q=roadPoint(c.road,c.d,lane), ang=q[2]+(c.dir>0?0:Math.PI);
    if(q[0]<V.x0-10||q[0]>V.x1+10||q[1]<V.y0-10||q[1]>V.y1+10) continue;
    if(s<.45){ ctx.fillStyle=c.col; ctx.beginPath(); ctx.arc(q[0],q[1],Math.max(.9,1.1/s),0,6.28); ctx.fill(); continue; }
    ctx.save(); ctx.translate(q[0],q[1]); ctx.rotate(ang);
    var L=c.kind?9:c.len, W=c.kind?3.6:3;
    ctx.fillStyle='rgba(30,30,40,.28)'; ctx.fillRect(-L/2+.8,-W/2+.9,L,W);
    ctx.fillStyle=c.kind?'#EDE8D8':c.col; ctx.fillRect(-L/2,-W/2,L,W);
    if(!c.kind){ ctx.fillStyle=shade(c.col,.72); ctx.fillRect(-L*.2,-W/2+.35,L*.45,W-.7); ctx.fillStyle='rgba(30,50,70,.8)'; ctx.fillRect(-L*.2+.2,-W/2+.45,.9,W-.9); ctx.fillRect(L*.1,-W/2+.45,.7,W-.9); }
    else { ctx.fillStyle='#2F7FD3'; ctx.fillRect(-L/2,-W/2,L,.9); }
    if(night>.2){ ctx.fillStyle='rgba(255,236,170,.95)'; ctx.fillRect(L/2-.5,-W/2+.2,.7,.7); ctx.fillRect(L/2-.5,W/2-.9,.7,.7); ctx.fillStyle='rgba(220,40,40,.9)'; ctx.fillRect(-L/2-.2,-W/2+.2,.5,.6); ctx.fillRect(-L/2-.2,W/2-.8,.5,.6); }
    ctx.restore();
  }
}
function drawBuses(ctx,V,night){
  LF.buses.forEach(function(b){
    var lane=b.dir>0?1:-1, q=roadPoint(b.road,b.d,lane), ang=q[2]+(b.dir>0?0:Math.PI);
    if(q[0]<V.x0-20||q[0]>V.x1+20||q[1]<V.y0-20||q[1]>V.y1+20) return;
    ctx.save(); ctx.translate(q[0],q[1]); ctx.rotate(ang);
    ctx.fillStyle='rgba(30,30,40,.3)'; ctx.fillRect(-6+1,-1.9+1.2,12,3.8);
    ctx.fillStyle=b.col; ctx.fillRect(-6,-1.9,12,3.8); ctx.fillStyle='#F4EEDD'; ctx.fillRect(-6,-.4,12,.8);
    ctx.fillStyle='rgba(30,50,70,.85)'; for(var k=0;k<5;k++) ctx.fillRect(-5+k*2.2,-1.6,1.6,.9);
    ctx.fillStyle=shade(b.col,.8); ctx.fillRect(-6,-1.9,12,.5);
    if(night>.2){ ctx.fillStyle='rgba(255,236,170,.95)'; ctx.fillRect(5.6,-1.5,.6,.9); ctx.fillRect(5.6,.6,.6,.9); }
    ctx.restore();
  });
}
function drawTrains(ctx,V,night){
  var cols=['#8A5A3C','#566B7A','#7B7F55','#9B3E2F','#6A6F74','#4E6E58'];
  LF.trains.forEach(function(t){
    if(t.delay>0) return;
    var n=t.n, step=17;
    for(var i=0;i<=n;i++){
      var d=t.d-t.dir*(i*step), p=pointAt(RAILS,clamp(d,0,polyLen(RAILS)));
      if(d<-20||d>polyLen(RAILS)+20) continue;
      if(p[0]<V.x0-30||p[0]>V.x1+30||p[1]<V.y0-30||p[1]>V.y1+30) continue;
      var ang=p[2]+(t.dir>0?0:Math.PI), isLoc=i===0, len=isLoc?15:14, wd=4.2;
      ctx.save(); ctx.translate(p[0],p[1]); ctx.rotate(p[2]);
      ctx.fillStyle='rgba(30,30,40,.3)'; ctx.fillRect(-len/2+1.2,-wd/2+1.8,len,wd);
      var col=isLoc?(t.kind?'#B5472F':'#2F7FD3'):(t.kind?cols[(i*5+3)%cols.length]:'#E9E5D8');
      ctx.fillStyle=col; ctx.fillRect(-len/2,-wd/2,len,wd);
      /* крыша вагона */
      ctx.fillStyle=shade(col,1.14); ctx.fillRect(-len/2+.3,-wd/2+.3,len-.6,wd*.5);
      if(!isLoc&&!t.kind){ ctx.fillStyle='rgba(40,60,86,.8)'; for(var k=0;k<6;k++) ctx.fillRect(-len/2+1.2+k*2.1,wd/2-1.3,1.3,.9); ctx.fillStyle='#D1361A'; ctx.fillRect(-len/2,wd/2-.6,len,.4); }
      if(isLoc){ ctx.fillStyle='#F2E8D2'; ctx.fillRect(len/2-3,-wd/2+.4,2,wd-.8); if(night>.2){ ctx.fillStyle='rgba(255,246,190,.95)'; ctx.fillRect(len/2-.4,-1.2,.8,.8); ctx.fillRect(len/2-.4,.4,.8,.8); } }
      ctx.restore();
    }
  });
}
function drawBoatsDucks(ctx,V,P){
  LF.boats.forEach(function(b){
    var p=pointAt(UPA,b.d), a=p[2]+(b.dir>0?0:Math.PI);
    if(p[0]<V.x0-30||p[0]>V.x1+30||p[1]<V.y0-30||p[1]>V.y1+30) return;
    ctx.save(); ctx.translate(p[0],p[1]); ctx.rotate(a);
    ctx.fillStyle='rgba(255,255,255,.4)'; ctx.beginPath(); ctx.moveTo(-5,0); ctx.lineTo(-24,-5); ctx.lineTo(-24,5); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(30,40,60,.25)'; ctx.beginPath(); ctx.ellipse(1,1.6,8,2.6,0,0,6.28); ctx.fill();
    ctx.fillStyle='#F4EEDD'; ctx.beginPath(); ctx.moveTo(-8,-2.4); ctx.lineTo(7,-2.4); ctx.lineTo(10,0); ctx.lineTo(7,2.4); ctx.lineTo(-8,2.4); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#D1361A'; ctx.fillRect(-8,-.4,16,.8); ctx.fillStyle='#8EC1D8'; ctx.fillRect(-3,-1.8,7,3.6); ctx.fillStyle='#F4EEDD'; ctx.fillRect(-1.5,-1.3,4,2.6);
    ctx.restore();
  });
  if(V.s>.5) LF.ducks.forEach(function(d){
    ctx.fillStyle='#F4EEDD'; ctx.beginPath(); ctx.ellipse(d.x,d.y,1.5,.9,d.a,0,6.28); ctx.fill(); ctx.fillStyle='#2F6E4E'; ctx.beginPath(); ctx.arc(d.x+Math.cos(d.a)*1.2,d.y+Math.sin(d.a)*1.2,.6,0,6.28); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.lineWidth=.3; ctx.beginPath(); ctx.arc(d.x,d.y,2.6+Math.sin(LF.t*2+d.x)*.3,0,6.28); ctx.stroke();
  });
}
function drawGlints(ctx,V,P){
  if(V.s<.3) return; var n=UPA.length;
  ctx.lineCap='round'; ctx.strokeStyle='rgba(255,255,255,.55)';
  for(var i=0;i<LF.glints.length;i++){
    var g=LF.glints[i], u=((g.u+LF.t*g.sp/(n*7))%1+1)%1, k=u*(n-1), j=Math.floor(k), f=k-j, a=UPA[j], b=UPA[Math.min(n-1,j+1)];
    var x=a[0]+(b[0]-a[0])*f, y=a[1]+(b[1]-a[1])*f; if(x<V.x0||x>V.x1||y<V.y0||y>V.y1) continue;
    var w=upaWidth(j,n)*.4, dx=b[0]-a[0], dy=b[1]-a[1], l=Math.sqrt(dx*dx+dy*dy)||1;
    x+=-dy/l*g.v*w; y+=dx/l*g.v*w;
    var al=.5+.5*Math.sin(LF.t*1.8+g.t); ctx.globalAlpha=al*.55; ctx.lineWidth=.55; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+dx/l*(g.w?5:2.6),y+dy/l*(g.w?5:2.6)); ctx.stroke();
  }
  ctx.globalAlpha=1;
}
function drawWheel(ctx,V,night){
  var cx=1130, cy=1092, R=27, z0=32; if(cx<V.x0-60||cx>V.x1+60||cy<V.y0-80||cy>V.y1+60) return;
  function P(th,r){ var x=cx+Math.cos(th)*r, z=z0+Math.sin(th)*r; return [x-KX*z,cy-KY*z]; }
  var hub=P(0,0); ctx.lineCap='round';
  /* опоры: А-образные */
  ctx.strokeStyle='#8E4A36'; ctx.lineWidth=2.2; ctx.beginPath(); ctx.moveTo(cx-16,cy+4); ctx.lineTo(hub[0],hub[1]); ctx.lineTo(cx+16,cy+4); ctx.moveTo(cx-14,cy-4); ctx.lineTo(hub[0],hub[1]); ctx.lineTo(cx+18,cy-4); ctx.stroke();
  ctx.fillStyle='rgba(30,30,40,.22)'; ctx.beginPath(); ctx.ellipse(cx+14,cy-4,30,7,0,0,6.28); ctx.fill();
  var rot=LF.t*.12*(ST.reduce?0:1), n=14;
  ctx.strokeStyle='#E7E1D2'; ctx.lineWidth=1.1; ctx.beginPath(); for(var i=0;i<=60;i++){ var q=P(i/60*6.2832,R); if(i===0) ctx.moveTo(q[0],q[1]); else ctx.lineTo(q[0],q[1]); } ctx.stroke();
  ctx.lineWidth=.5; ctx.beginPath(); for(i=0;i<n;i++){ var th=rot+i/n*6.2832, q2=P(th,R); ctx.moveTo(hub[0],hub[1]); ctx.lineTo(q2[0],q2[1]); } ctx.stroke();
  var gc=['#D1361A','#E2B53C','#2F7FD3','#4E9A3E','#8A5CC6'];
  for(i=0;i<n;i++){ var th2=rot+i/n*6.2832, q3=P(th2,R); ctx.fillStyle=gc[i%5]; ctx.fillRect(q3[0]-1.5,q3[1]-.4,3,2.6); if(night>.25){ ctx.fillStyle='rgba(255,230,150,.9)'; ctx.fillRect(q3[0]-.6,q3[1]+.2,1.2,1); } }
  ctx.fillStyle='#8E4A36'; ctx.beginPath(); ctx.arc(hub[0],hub[1],1.8,0,6.28); ctx.fill();
}
function drawSmoke(ctx,V){
  for(var i=0;i<LF.puffs.length;i++){ var f=LF.puffs[i]; if(f.x<V.x0-20||f.x>V.x1+20||f.y<V.y0-40||f.y>V.y1+20) continue; ctx.fillStyle='rgba(232,230,226,'+(f.a*.7)+')'; ctx.beginPath(); ctx.arc(f.x,f.y,f.r,0,6.28); ctx.fill(); }
}
function drawBirds(ctx,V){
  if(SEASONS[ST.cal].snow>.7) return;
  LF.birds.forEach(function(b){
    for(var i=0;i<b.n;i++){
      var ox=-i*8*Math.cos(b.a)+Math.sin(i*2.3)*6, oy=-i*8*Math.sin(b.a)+Math.cos(i*1.7)*5+(i%2?4:-4), x=b.x+ox, y=b.y+oy;
      if(x<V.x0-20||x>V.x1+20||y<V.y0-20||y>V.y1+20) continue;
      var fl=Math.sin(LF.t*9+i+b.ph)*2.2;
      ctx.fillStyle='rgba(30,30,40,.14)'; ctx.beginPath(); ctx.ellipse(x+14,y+22,2.6,1,0,0,6.28); ctx.fill();
      ctx.strokeStyle='#2B2B33'; ctx.lineWidth=.9; ctx.beginPath(); ctx.moveTo(x-3.2,y-fl); ctx.lineTo(x,y+.5); ctx.lineTo(x+3.2,y-fl); ctx.stroke();
    }
  });
}
function drawClouds(ctx,V,P,grey){
  /* тени облаков на земле */
  ctx.save();
  LF.clouds.forEach(function(c,i){
    var x=c.x, y=c.y; if(x<V.x0-c.r*1.5||x>V.x1+c.r*1.5||y<V.y0-c.r*1.5||y>V.y1+c.r*1.5) return;
    var g=ctx.createRadialGradient(x+30,y+80,0,x+30,y+80,c.r); g.addColorStop(0,'rgba(30,40,70,'+(.13*c.a)+')'); g.addColorStop(1,'rgba(30,40,70,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(x+30,y+80,c.r*1.2,c.r*.7,0,0,6.28); ctx.fill();
  });
  ctx.restore();
}
function drawCloudTops(ctx,V,P,amount){
  LF.clouds.forEach(function(c,i){
    var x=c.x-KX*80, y=c.y-KY*160; if(x<V.x0-c.r*1.7||x>V.x1+c.r*1.7||y<V.y0-c.r*1.7||y>V.y1+c.r*1.7) return;
    if(i/LF.clouds.length>amount) return;
    var a=c.a*.6, col=amount>.8?'205,212,222':'255,255,255';
    for(var k=0;k<5;k++){ var cx=x+Math.cos(k*1.7+c.sd*9)*c.r*.5, cy=y+Math.sin(k*2.3+c.sd*7)*c.r*.22, rr2=c.r*(.5+.12*k%.3);
      var g=ctx.createRadialGradient(cx,cy,0,cx,cy,rr2); g.addColorStop(0,'rgba('+col+','+(a*.72)+')'); g.addColorStop(1,'rgba('+col+',0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(cx,cy,rr2,rr2*.62,0,0,6.28); ctx.fill(); }
  });
}
function drawWeather(ctx,W,H,wx,night){
  if(wx==='rain'){
    ctx.strokeStyle='rgba(190,210,235,.55)'; ctx.lineWidth=1; ctx.beginPath();
    for(var i=0;i<LF.rain.length;i++){ var r=LF.rain[i], x=r.x*W, y=r.y*H; ctx.moveTo(x,y); ctx.lineTo(x-r.l*W*.35,y+r.l*H*1.8); } ctx.stroke();
    ctx.fillStyle='rgba(40,55,80,.1)'; ctx.fillRect(0,0,W,H);
  }
  if(wx==='snow'){
    ctx.fillStyle='rgba(255,255,255,.92)';
    for(i=0;i<LF.snow.length;i++){ var s=LF.snow[i]; ctx.beginPath(); ctx.arc(s.x*W,s.y*H,s.r*(W>700?1.2:1),0,6.28); ctx.fill(); }
    ctx.fillStyle='rgba(220,230,240,.1)'; ctx.fillRect(0,0,W,H);
  }
  if(wx==='fog'){ var g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'rgba(226,232,236,.62)'); g.addColorStop(.5,'rgba(226,232,236,.46)'); g.addColorStop(1,'rgba(226,232,236,.58)'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H); }
}
