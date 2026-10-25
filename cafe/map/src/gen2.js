/* ===== Карта Тулы: генерация города, часть 2 (общие приёмы, кремль, центр, деловой квартал, вокзал, университет) ===== */

var BLOCK_F=F_WATER|F_RAIL|F_SOLID|F_ROAD|F_PARK;
function placeBox(cx,cy,w,d,a,z,o,flags){
  var pts=rectPts(cx,cy,w,d,a);
  if(!areaFree(pts,flags==null?BLOCK_F:flags)) return null;
  var it=addBox(cx,cy,w,d,a,z,o); mpoly(it.pts,F_SOLID); return it;
}
/* набор зданий по периметру блока (сплошная застройка) */
function frontage(Q,rng,o){
  var dmin=o.dmin||13, dmax=o.dmax||18, wmin=o.wmin||14, wmax=o.wmax||26, out=[];
  var E=[[Q[0],Q[1]],[Q[1],Q[2]],[Q[3],Q[2]],[Q[0],Q[3]]]; /* верх, право, низ, лево */
  var cen=centroid(Q);
  for(var e=0;e<4;e++){
    var A=E[e][0], B=E[e][1], len=dist(A,B), ang=Math.atan2(B[1]-A[1],B[0]-A[0]);
    var ux=(B[0]-A[0])/len, uy=(B[1]-A[1])/len, nx=-uy, ny=ux;
    if(nx*(cen[0]-A[0])+ny*(cen[1]-A[1])<0){ nx=-nx; ny=-ny; }
    var dep=rr(rng,dmin,dmax), pos=(e<2||true)?(e>=2?0:0):0, from=0, to=len;
    if(e===1||e===3){ from=dep*.9; to=len-dep*.9; }
    var p=from;
    while(p<to-6){
      var w=Math.min(rr(rng,wmin,wmax),to-p); if(to-p-w<6) w=to-p;
      if(w<6) break;
      var d=dep+rr(rng,-1.5,1.5), c=p+w/2, x=A[0]+ux*c+nx*d/2, y=A[1]+uy*c+ny*d/2;
      var z=o.zf?o.zf(rng,e,c/len):rr(rng,9,14);
      var rt=(o.gable&&rng()<o.gable&&z<10)?1:0;
      var it=placeBox(x,y,w-.6,d,ang,z,{wc:o.wc?o.wc(rng):pick(rng,PAL.wall),rc:o.rc?o.rc(rng,rt):pick(rng,rt?PAL.roofR:PAL.roofF),rt:rt,win:o.win==null?1:o.win,lit:o.lit});
      if(it) out.push(it);
      p+=w;
    }
  }
  return out;
}

/* ---- Тульский кремль ---- */
function genKremlin(rng){
  var cx=1150, cy=760, W=204, H=130, a=-.045;
  var outer=rectPts(cx,cy,W+22,H+24,a); mpoly(outer,F_SOLID|F_PARK);
  var inner=rectPts(cx,cy,W-10,H-10,a);
  addLand(inner,'lawn',{edge:null});
  /* дорожки внутри: крест и обход */
  var c=Math.cos(a), s=Math.sin(a);
  function L(x,y){ var r=rot(x,y,a); return [cx+r[0],cy+r[1]]; }
  GEN.paths.push({pts:[L(-W/2+10,0),L(W/2-10,0)],w:4,col:'#D9CDAE'});
  GEN.paths.push({pts:[L(0,-H/2+8),L(0,H/2-8)],w:4,col:'#D9CDAE'});
  GEN.paths.push({pts:[L(-W/2+18,-H/2+18),L(W/2-18,-H/2+18),L(W/2-18,H/2-18),L(-W/2+18,H/2-18),L(-W/2+18,-H/2+18)],w:3,col:'#E3D8BC'});
  /* стены: четыре отрезка с зубцами */
  var wallC='#B5624A', wt=6, wz=13;
  [[-W/2,-H/2,W/2,-H/2],[W/2,-H/2,W/2,H/2],[W/2,H/2,-W/2,H/2],[-W/2,H/2,-W/2,-H/2]].forEach(function(e,i){
    var p0=L(e[0],e[1]), p1=L(e[2],e[3]), len=dist(p0,p1), ang=Math.atan2(p1[1]-p0[1],p1[0]-p0[0]), mx=(p0[0]+p1[0])/2, my=(p0[1]+p1[1])/2;
    var it=addBox(mx,my,len,wt,ang,wz,{wc:wallC,rc:'#CFA48E',rt:0,win:0,k:'wall'}); it.crenel=true; it.y=Math.max(it.y,my+wt/2); mpoly(it.pts,F_SOLID);
  });
  /* башни: углы и середины сторон */
  var T=[[-W/2,-H/2],[W/2,-H/2],[W/2,H/2],[-W/2,H/2],[0,-H/2],[W/2,0],[0,H/2],[-W/2,0],[-W/4,H/2]];
  T.forEach(function(t,i){ var p=L(t[0],t[1]); var big=i<4||i===5; addCyl(p[0],p[1],big?7.5:6.3,big?27:23,{col:'#B5624A',top:'cone',tc:big?'#4F6B5A':'#6B5A4A',hh:big?15:13,gl:1}); });
  /* соборы и здания внутри */
  var u=L(-26,-6); var up=addBox(u[0],u[1],26,24,a,17,{wc:'#F3EEDF',rc:'#CFC8B4',rt:0,win:0,k:'cathedral'}); mpoly(up.pts,F_SOLID);
  var d0=L(-26,-6); addCyl(d0[0],d0[1]-0,5.2,17,{col:'#F3EEDF',top:'dome',tc:'#E0B83C',hh:12});
  [[-8,-8],[8,-8],[-8,8],[8,8]].forEach(function(o){ var q=L(-26+o[0],-6+o[1]); addCyl(q[0],q[1],2.8,17,{col:'#F3EEDF',top:'dome',tc:'#6FA8C9',hh:6.5}); });
  var e=L(30,8); var eb=addBox(e[0],e[1],20,22,a,15,{wc:'#F0E6D0',rc:'#B9544A',rt:0,win:0,k:'cathedral'}); mpoly(eb.pts,F_SOLID);
  addCyl(e[0],e[1],5.2,36,{col:'#F0E6D0',top:'onion',tc:'#4E9BC4',hh:13});
  var m=L(6,-34); var mb=addBox(m[0],m[1],56,12,a,8,{wc:'#E9C9A3',rc:'#B9544A',rt:1,win:1,k:'museum'}); mpoly(mb.pts,F_SOLID);
  var m2=L(-56,32); var mb2=addBox(m2[0],m2[1],38,11,a,7,{wc:'#EBD8B0',rc:'#7A8B6B',rt:1,win:1}); mpoly(mb2.pts,F_SOLID);
  for(var i=0;i<14;i++){ var q=L(rr(rng,-86,86),rr(rng,-45,45)); if(mfree(q[0],q[1],F_SOLID)||true){ var near=GEN.items.some(function(it){ return it.t==='b'&&dist([it.cx,it.cy],q)<22; }); if(!near) addTree(q[0],q[1],rr(rng,4,6),rng()<.2?1:0); } }
  GEN.marks.push({k:'kremlin',x:cx,y:cy});
}

/* ---- Площадь Ленина ---- */
function genLeninSquare(rng){
  var cx=1290, cy=676;
  var pl=rectPts(cx,cy,104,60,.0); addLand(pl,'plaza',{col:'#DAD2BD',edge:'rgba(120,110,90,.25)'}); mpoly(pl,F_SOLID|F_PARK);
  addProp('fountain',cx-6,cy+2,{r:9}); addProp('statue',cx+34,cy-6);
  for(var i=0;i<9;i++){ var x=cx-46+i*11.5; addTree(x,cy-27,4.2,3); addTree(x,cy+27,4.2,3); }
  for(i=0;i<5;i++) addProp('bench',cx-40+i*17,cy+14,{a:0});
  GEN.marks.push({k:'lenin',x:cx,y:cy});
}

/* ---- Старый центр ---- */
function genOld(rng){
  genKremlin(rng); genLeninSquare(rng);
  var L=makeLattice('old',-.16,64,54,1);
  genLatticeStreets(L,5.6,'st',rng,.04);
  var blocks=latticeBlocks(L,6.5);
  blocks.forEach(function(b,bi){
    var Q=b.Q, sz=blSize(Q), r=rng(), c=blp(Q,.5,.5);
    if(r<.05){ /* сквер */
      addLand(Q,'lawn',{}); treesIn(Q,Math.round(sz[0]*sz[1]/260),rng,3.6,5.6,null);
      for(var s=0;s<2;s++){ var p=blp(Q,.3+s*.4,.5); addProp('bench',p[0],p[1],{a:rng()*3}); }
      GEN.marks.push({k:'sq',x:c[0],y:c[1]}); return;
    }
    if(r<.09&&sz[0]>40){ if(genChurch(c[0],c[1],blAng(Q),rng)){ addLand(Q,'lawn',{}); treesIn(Q,9,rng,3.4,5,null,function(p){ return !mfree(p[0],p[1],F_SOLID); }); GEN.marks.push({k:'church',x:c[0],y:c[1]}); return; } }
    fillBlock(Q,rng,{lotMax:22,skip:.05,skipTree:true,fill:[.8,.95],gap:1.6,gable:.38,gableZ:10,
      zf:function(rg,d){ return pick(rg,[6,9,9,9,12,12,15,18]); },
      wc:function(rg){ return pick(rg,PAL.wall); },rc:function(rg,gb){ return gb?pick(rg,PAL.roofR.concat(PAL.roofG)):pick(rg,PAL.roofF); },win:1});
  });
  infill('old',rng,{step:20,p:.85,w:[10,20],d:[9,14],zf:function(rg){ return pick(rg,[6,9,9,12,15]); },gable:.5,wc:function(rg){ return pick(rg,PAL.wall); },rc:function(rg,gb){ return gb?pick(rg,PAL.roofR.concat(PAL.roofG)):pick(rg,PAL.roofF); },maxRoad:40});
  dressStreets(rng,['old'],{tree:.42,car:.2});
}

/* ---- общие приёмы для парковок и стёкол ---- */
function parkingLot(cx,cy,w,d,a,rng,dens,edge){
  var pts=rectPts(cx,cy,w,d,a); if(!areaFree(pts,BLOCK_F)) return false;
  addLand(pts,'asph',{edge:'rgba(255,255,255,.4)',edgeW:.5,lot:true}); mpoly(pts,F_SOLID);
  var cols=Math.floor((w-5)/3.3), rows=Math.max(1,Math.floor((d-3)/(edge?6:5.4)));
  for(var r=0;r<rows;r++) for(var c=0;c<cols;c++){
    if(rng()>dens) continue; var lx=-w/2+3.5+c*3.3, ly=-d/2+4+r*(edge?6:5.4)+(rng()-.5)*.3, p=rot(lx,ly,a);
    addCar(cx+p[0],cy+p[1],a+(rng()<.5?0:Math.PI)+Math.PI/2*0,pick(rng,PAL.car),rng);
  }
  return true;
}
function glassTower(cx,cy,w,d,a,z,rng){
  var it=placeBox(cx,cy,w,d,a,z,{wc:pick(rng,PAL.glass),rc:'#8B949C',rt:0,win:2,lit:.75}); return it;
}

/* ---- Деловой квартал ---- */
function genBiz(rng){
  /* торговый центр у проспекта */
  var mall=addBox(1395,726,100,56,.02,12,{wc:'#EFE9DA',rc:'#B8B5AA',rt:0,win:0,k:'mall'}); mpoly(mall.pts,F_SOLID);
  [[-30,-14],[0,-14],[30,-14]].forEach(function(o){ addProp('m',0,0); GEN.items.pop(); });
  parkingLot(1395,790,100,40,.02,rng,.8);
  addBox(1395,696,24,6,.02,16,{wc:'#D1361A',rc:'#A22812',rt:0,win:0,k:'sign'});
  GEN.marks.push({k:'mall',x:1395,y:726});
  var L=makeLattice('biz',.26,80,66,.8);
  genLatticeStreets(L,6.6,'st',rng,.03);
  var blocks=latticeBlocks(L,8);
  blocks.forEach(function(b){
    var Q=b.Q, sz=blSize(Q), a=blAng(Q), r=rng(), c=blp(Q,.5,.5);
    if(r<.32){
      var pw=Math.min(62,sz[0]-8), pd=Math.min(42,sz[1]-8), pod=placeBox(c[0],c[1]+3,pw,pd,a,7,{wc:'#E6E2D6',rc:'#C4C3BC',rt:0,win:1});
      if(pod){ var t=glassTower(c[0]-pw*.1,c[1]-1,22,22,a,rr(rng,34,58),rng); }
      treesIn(Q,5,rng,3.2,4.8,3,function(p){ return !mfree(p[0],p[1],F_SOLID); });
    } else if(r<.54){
      placeBox(c[0],c[1]-10,Math.min(70,sz[0]-8),18,a,rr(rng,22,34),{wc:pick(rng,PAL.glass.concat(PAL.panel)),rc:'#8B949C',rt:0,win:rng()<.6?2:1});
      parkingLot(c[0],c[1]+16,Math.min(64,sz[0]-10),22,a,rng,.7);
      treesIn(Q,4,rng,3,4.6,3,function(p){ return !mfree(p[0],p[1],F_SOLID); });
    } else if(r<.8){
      fillBlock(Q,rng,{lotMax:30,skip:.08,skipTree:true,fill:[.85,.95],gap:2,gable:0,zf:function(rg){ return pick(rg,[15,18,21,24,30]); },wc:function(rg){ return pick(rg,PAL.panel.concat(PAL.glass,['#E6E2D6'])); },rc:function(rg){ return pick(rg,PAL.roofF); },win:function(rg){ return rg()<.4?2:1; }});
    } else if(r<.9){
      addLand(Q,'lawn',{}); treesIn(Q,Math.round(sz[0]*sz[1]/320),rng,3.6,5.6,null); addProp('fountain',c[0],c[1],{r:6});
      for(var i=0;i<4;i++) addProp('bench',c[0]-16+i*11,c[1]+12,{a:0});
    } else {
      placeBox(c[0],c[1],Math.min(46,sz[0]-10),Math.min(32,sz[1]-10),a,rr(rng,26,40),{wc:pick(rng,PAL.glass),rc:'#7C858E',rt:0,win:2});
      treesIn(Q,8,rng,3,4.6,3,function(p){ return !mfree(p[0],p[1],F_SOLID); });
    }
  });
  infill('biz',rng,{step:26,p:.8,w:[18,34],d:[14,22],zf:function(rg){ return pick(rg,[12,15,18,24,30]); },wc:function(rg){ return pick(rg,PAL.panel.concat(PAL.glass)); },rc:function(rg){ return pick(rg,PAL.roofF); },maxRoad:50});
  dressStreets(rng,['biz'],{tree:.5,car:.22,k:3});
}

/* ---- Привокзальный район ---- */
function genStat(rng){
  var rx=RAILS.filter(function(p){ return p[0]>1390&&p[0]<1880; });
  [-20,-10,10,20].forEach(function(o){ GEN.rails.push({pts:offsetPoly(rx,o),w:5.2}); });
  [-15,15].forEach(function(o){ GEN.paths.push({pts:offsetPoly(rx.filter(function(p){ return p[0]>1470&&p[0]<1800; }),o),w:4.4,col:'#C9C3B3'}); });
  /* путевой парк на запад: две ветки со стоящими вагонами */
  var yr=RAILS.filter(function(p){ return p[0]>1150&&p[0]<1500; });
  [14,22].forEach(function(o){ var l=offsetPoly(yr,o); GEN.rails.push({pts:l,w:5.2}); var n=Math.floor(polyLen(l)/17); for(var i=0;i<n;i++){ if(rng()<.28) continue; var q=pointAt(l,i*17+8); addBox(q[0],q[1],14,3.6,q[2],3.6,{wc:pick(rng,['#8A5A3C','#566B7A','#7B7F55','#9B3E2F','#6A6F74']),rc:'#4A4C50',rt:0,win:0}); } });
  var dep=addBox(1255,540,76,24,.17,10,{wc:'#B9A890',rc:'#6C7782',rt:3,win:3,k:'depot'}); mpoly(dep.pts,F_SOLID);
  /* вокзал */
  var st=addBox(1620,603,112,22,.13,15,{wc:'#EBD8B0',rc:'#9A4A33',rt:0,win:1,k:'station'}); mpoly(st.pts,F_SOLID);
  addBox(1620,598,112,8,.13,3.5,{wc:'#C3BBA8',rc:'#8E9AA4',rt:0,win:0}); /* навес над платформой */
  addCyl(1620,606,6.8,30,{col:'#EBD8B0',top:'cone',tc:'#4E9BC4',hh:16,gl:1});
  var pl=rectPts(1624,652,136,68,.13); addLand(pl,'plaza',{col:'#D6CDB7',edge:'rgba(120,110,90,.25)'}); mpoly(pl,F_SOLID);
  addProp('fountain',1620,650,{r:9});
  var bcol=['#D1361A','#2F7FD3','#D1361A','#E2B53C','#2F7FD3','#D1361A'];
  for(var i=0;i<6;i++){ addBox(1694,624+i*8.4,12,4.2,Math.PI/2+.13,3.8,{wc:bcol[i],rc:'#EDE8D8',rt:0,win:1,lit:.2}); }
  [[1572,636],[1572,646],[1572,656],[1572,666]].forEach(function(p){ addCar(p[0],p[1],0,'#E2B53C',rng); });
  for(i=0;i<5;i++){ var k=addBox(1560+i*14,690,7,5,.13,4,{wc:'#F2E8D2',rc:pick(rng,['#D1361A','#2F7FD3','#E2B53C','#4E9A3E']),rt:0,win:0}); mpoly(k.pts,F_SOLID); }
  for(i=0;i<8;i++){ addTree(1560+i*18,684+Math.sin(i)*2,4.2,3); }
  var bs=addBox(1745,654,62,18,.13,8,{wc:'#DCD6C4',rc:'#6C7782',rt:0,win:1}); mpoly(bs.pts,F_SOLID);
  var hot=addBox(1500,648,34,22,.1,34,{wc:'#CDBEA7',rc:'#8B6B4A',rt:0,win:1,lit:.8}); mpoly(hot.pts,F_SOLID);
  GEN.marks.push({k:'station',x:1620,y:568});
  /* север от рельсов: склады и стоянки */
  for(i=0;i<6;i++){ var x=1560+i*56+rr(rng,-6,6), y=470+rr(rng,-8,8); placeBox(x,y,rr(rng,34,48),rr(rng,16,22),.13,rr(rng,8,12),{wc:pick(rng,PAL.ind),rc:pick(rng,PAL.roofS),rt:3,win:3}); }
  parkingLot(1700,493,90,24,.13,rng,.55);
  var L=makeLattice('stat',.1,76,62,.9);
  genLatticeStreets(L,6,'st',rng,.05);
  latticeBlocks(L,7.5).forEach(function(b){
    var Q=b.Q, sz=blSize(Q), a=blAng(Q), r=rng(), c=blp(Q,.5,.5);
    if(r<.55){ fillBlock(Q,rng,{lotMax:26,skip:.12,skipTree:true,fill:[.8,.94],gap:2,gable:.2,gableZ:10,zf:function(rg){ return pick(rg,[6,9,12,12,15,18]); },wc:function(rg){ return pick(rg,PAL.wall.concat(PAL.panel)); },rc:function(rg,gb){ return gb?pick(rg,PAL.roofR):pick(rg,PAL.roofF); },win:1}); }
    else if(r<.75){ placeBox(c[0],c[1]-6,Math.min(52,sz[0]-12),24,a,rr(rng,10,16),{wc:pick(rng,PAL.panel),rc:pick(rng,PAL.roofS),rt:0,win:1}); parkingLot(c[0],c[1]+sz[1]*.28,Math.min(58,sz[0]-14),20,a,rng,.6); }
    else if(r<.9){ placeBox(c[0],c[1],Math.min(56,sz[0]-14),15,a,rr(rng,18,26),{wc:pick(rng,PAL.panel),rc:'#9AA2A8',rt:0,win:1}); treesIn(Q,6,rng,3,5,null,function(p){ return !mfree(p[0],p[1],F_SOLID); }); }
    else { addLand(Q,'lawn',{}); treesIn(Q,Math.round(sz[0]*sz[1]/360),rng,3.6,5.4,null); }
  });
  infill('stat',rng,{step:22,p:.8,w:[12,24],d:[10,16],zf:function(rg){ return pick(rg,[5,6,9,12,15]); },gable:.3,wc:function(rg){ return pick(rg,PAL.wall.concat(PAL.panel)); },rc:function(rg,gb){ return gb?pick(rg,PAL.roofR):pick(rg,PAL.roofF); },maxRoad:44});
  dressStreets(rng,['stat'],{tree:.35,car:.24});
}

/* ---- Университетский городок ---- */
function genUni(rng){
  /* главный корпус П-образный, смотрит на проспект Ленина */
  var cx=800, cy=692, a=-.02;
  function B(dx,dy,w,d,z,o){ var p=rot(dx,dy,a); var it=addBox(cx+p[0],cy+p[1],w,d,a,z,o); mpoly(it.pts,F_SOLID); return it; }
  B(0,-8,84,20,17,{wc:'#F1E8D2',rc:'#6E8E78',rt:0,win:1,k:'uni'});
  B(-34,18,18,44,15,{wc:'#EFE5CD',rc:'#6E8E78',rt:0,win:1});
  B(34,18,18,44,15,{wc:'#EFE5CD',rc:'#6E8E78',rt:0,win:1});
  var tp=rot(0,-14,a); addCyl(cx+tp[0],cy+tp[1],5.4,30,{col:'#F1E8D2',top:'cone',tc:'#6E8E78',hh:15,gl:1});
  /* газон перед корпусом, дорожки и фонтан */
  var lawn=rectPts(cx,cy+30,70,52,a); addLand(lawn,'lawn',{}); mpoly(lawn,F_SOLID|F_PARK);
  GEN.paths.push({pts:[[cx-30,cy+55],[cx,cy+36],[cx+30,cy+55]],w:3,col:'#D9CDAE'});
  GEN.paths.push({pts:[[cx,cy+4],[cx,cy+58]],w:3.4,col:'#D9CDAE'}); addProp('fountain',cx,cy+34,{r:6});
  for(var i=0;i<8;i++){ addTree(cx-40+i*11.4,cy+60,4.4,0); }
  /* общежития: три панельных ряда */
  for(i=0;i<3;i++){ var bx=620+i*0, by=560+i*50; var dm=placeBox(660,560+i*58,44,13,.05,rr(rng,24,30),{wc:pick(rng,PAL.panel),rc:'#8B949C',rt:0,win:1}); }
  /* стадион: газон-эллипс, дорожка и трибуны */
  var sx=878, sy=846, e=[]; for(i=0;i<28;i++){ var t=i/28*6.2832; e.push([sx+Math.cos(t)*46,sy+Math.sin(t)*30]); }
  addLand(e,'custom',{col:'#B25B3A'}); var e2=e.map(function(p){ return [sx+(p[0]-sx)*.78,sy+(p[1]-sy)*.74]; }); addLand(e2,'pitch',{edge:'rgba(255,255,255,.7)',edgeW:.7});
  mpoly(e,F_SOLID|F_PARK);
  placeBox(sx,sy-38,92,7,0,6,{wc:'#C9C6BE',rc:'#8E4A36',rt:0,win:0}); placeBox(sx,sy+38,92,7,0,6,{wc:'#C9C6BE',rc:'#8E4A36',rt:0,win:0});
  GEN.marks.push({k:'stadium',x:sx,y:sy});
  var L=makeLattice('uni',-.1,92,76,.9);
  genLatticeStreets(L,6,'st',rng,.1);
  latticeBlocks(L,8).forEach(function(b){
    var Q=b.Q, sz=blSize(Q), a2=blAng(Q), r=rng(), c=blp(Q,.5,.5);
    if(r<.3){ fillBlock(Q,rng,{lotMax:34,skip:.1,skipTree:true,fill:[.78,.92],gap:3,gable:0,zf:function(rg){ return pick(rg,[9,12,12,15,18]); },wc:function(rg){ return pick(rg,PAL.wall.concat(PAL.brick)); },rc:function(rg){ return pick(rg,PAL.roofF); },win:1}); treesIn(Q,8,rng,3.4,5.4,null,function(p){ return !mfree(p[0],p[1],F_SOLID); }); }
    else if(r<.52){ for(var k=0;k<2;k++) placeBox(c[0],c[1]-14+k*28,Math.min(46,sz[0]-12),13,a2,rr(rng,24,30),{wc:pick(rng,PAL.panel),rc:'#8B949C',rt:0,win:1}); treesIn(Q,8,rng,3.4,5.4,null,function(p){ return !mfree(p[0],p[1],F_SOLID); }); addProp('play',c[0]+sz[0]*.28,c[1],{r:5}); }
    else if(r<.66){ fillBlock(Q,rng,{lotMax:24,skip:.1,skipTree:true,fill:[.8,.94],gap:2,gable:.15,gableZ:10,zf:function(rg){ return pick(rg,[6,9,12,15]); },wc:function(rg){ return pick(rg,PAL.wall); },rc:function(rg,gb){ return gb?pick(rg,PAL.roofR):pick(rg,PAL.roofF); },win:1}); }
    else { addLand(Q,'lawn',{}); treesIn(Q,Math.round(sz[0]*sz[1]/300),rng,3.8,6,null); for(var q=0;q<3;q++){ var bp=blp(Q,.25+q*.25,.5); addProp('bench',bp[0],bp[1],{a:rng()}); } }
  });
  infill('uni',rng,{step:28,p:.55,w:[16,32],d:[12,18],zf:function(rg){ return pick(rg,[9,12,15,18]); },wc:function(rg){ return pick(rg,PAL.wall.concat(PAL.brick,PAL.panel)); },rc:function(rg){ return pick(rg,PAL.roofF); },maxRoad:50});
  dressStreets(rng,['uni'],{tree:.5,car:.12});
}
