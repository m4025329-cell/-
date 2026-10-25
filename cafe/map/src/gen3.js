/* ===== Карта Тулы: генерация города, часть 3 (парк, рынок, жилые районы, частный сектор, завод, окрестности) ===== */

/* ---- Парк, пруды и колесо обозрения ---- */
function genPark(rng){
  var cx=1210, cy=1120;
  /* газон всего парка и пруды */
  var ponds=[]; 
  function blob(x,y,rx,ry,n,j,seed){ var r=mulberry32(seed), pts=[]; for(var i=0;i<n;i++){ var t=i/n*6.2832, k=1+(r()-.5)*j; pts.push([x+Math.cos(t)*rx*k,y+Math.sin(t)*ry*k]); } return chaikin(pts,2,true); }
  var p1=blob(1092,1160,64,32,14,.35,5), p2=blob(1300,1060,34,20,12,.3,9), p3=blob(1260,1190,40,24,12,.3,3);
  [p1,p2,p3].forEach(function(p){ addLand(p,'custom',{col:'#6BA7C6',edge:'#B9AF98',edgeW:2.4,water:true}); mpoly(p,F_WATER|F_PARK); ponds.push(p); });
  addLand(blob(1092,1160,24,12,10,.3,22).map(function(q,i){ return [q[0]+10,q[1]-4]; }),'lawn',{edge:'#B9AF98',edgeW:1.2}); /* остров */
  /* дорожки */
  function spline(p){ return resample(chaikin(p,3,false),5); }
  var paths=[ [[1170,1010],[1170,1060],[1160,1110],[1178,1160],[1176,1230],[1150,1290]],
              [[1000,1050],[1060,1075],[1120,1090],[1170,1085],[1240,1100],[1330,1110],[1400,1100]],
              [[1010,1250],[1060,1235],[1110,1228],[1176,1230],[1240,1250],[1330,1252],[1405,1245]],
              [[1000,1130],[1040,1100],[1050,1070]],
              [[1380,1020],[1340,1070],[1310,1110],[1320,1170],[1360,1230]] ];
  paths.forEach(function(p){ var q=spline(p); GEN.paths.push({pts:q,w:3.6,col:'#E1D6B6'}); mline(q,8,F_PARK); });
  /* центральная площадь с колесом */
  var plz=rectPts(1130,1110,56,50,0); addLand(plz,'plaza',{col:'#DCD3BC'}); mpoly(plz,F_PARK|F_SOLID);
  addProp('fountain',1130,1122,{r:7});
  GEN.marks.push({k:'wheel',x:1130,y:1088});
  /* павильоны, кафе и детская площадка */
  placeBox(1060,1050,24,14,0,8,{wc:'#F2E8D2',rc:'#C0563B',rt:1,win:1,k:'pav'},F_WATER|F_SOLID);
  placeBox(1226,1096,20,12,0,7,{wc:'#EFE2C4',rc:'#5F8D6B',rt:1,win:1},F_WATER|F_SOLID);
  placeBox(1352,1232,26,14,.1,8,{wc:'#F3EFE6',rc:'#C0563B',rt:1,win:1},F_WATER|F_SOLID);
  var an=blob(1400,1160,22,22,12,.1,12); addLand(an,'custom',{col:'#C9C3AE',edge:'#9A9482',edgeW:1});
  addProp('play',1060,1215,{r:10}); addProp('play',1360,1150,{r:8});
  /* футбольное поле */
  var fld=rectPts(1010,1160,40,60,.05); addLand(fld,'pitch',{edge:'rgba(255,255,255,.8)',edgeW:.8}); mpoly(fld,F_PARK|F_SOLID);
  /* деревья: плотные, плюс отдельные группы */
  var poly=DPOLY.park[0], bb=bbox(poly);
  for(var y=bb[1]+6;y<bb[3];y+=10) for(var x=bb[0]+6;x<bb[2];x+=10){
    var px=x+rr(rng,-4,4), py=y+rr(rng,-4,4);
    if(!inPoly(px,py,poly)) continue;
    var m=mget(px,py); if(m&(F_WATER|F_ROAD|F_SOLID)) continue; if(!!(m&F_PARK)) { /* дорожка или площадка: свободно */ if(rng()<.97) continue; }
    var nz=fbm(px*.011,py*.011,2); if(nz<.34&&rng()<.7) continue;
    if(distPoly(px,py,UPA)<34) continue;
    var k=rng()<.22?1:(rng()<.2?3:0);
    addTree(px,py,rr(rng,4,7.4),k);
  }
  /* скамейки вдоль дорожек */
  paths.forEach(function(p){ var q=spline(p), n=Math.floor(polyLen(q)/36); for(var i=1;i<n;i++){ var s=pointAt(q,i*36), side=(i&1)?1:-1; addProp('bench',s[0]+Math.cos(s[2]+Math.PI/2)*5*side,s[1]+Math.sin(s[2]+Math.PI/2)*5*side,{a:s[2]}); } });
  /* набережная: клумбы */
  for(var i=0;i<40;i++){ var fx=1010+rng()*380, fy=1000+rng()*16; if(mfree(fx,fy,F_ROAD|F_WATER)) addProp('flower',fx,fy,{col:pick(rng,['#E86A8A','#E2B53C','#F4EEDD','#B45FD1'])}); }
  GEN.marks.push({k:'ponds',x:1092,y:1160});
}

/* ---- Центральный рынок ---- */
function genMkt(rng){
  var cx=1632, cy=1096;
  /* крытый павильон с пилообразной крышей и вторая пристройка */
  var h1=addBox(cx,cy-24,168,38,.0,14,{wc:'#D6C8A8',rc:'#8B949C',rt:3,win:3,k:'hall'}); mpoly(h1.pts,F_SOLID);
  var h2=addBox(cx-40,cy+8,84,26,.0,10,{wc:'#E1D5BA',rc:'#7C858E',rt:3,win:3}); mpoly(h2.pts,F_SOLID);
  /* открытые ряды: прилавки под тентами */
  var cols=['#D1361A','#2F7FD3','#E2B53C','#4E9A3E','#E8832A','#8A5CC6','#F4EEDD'];
  var rowsY=[cy+34,cy+52,cy+70,cy+88], rowsX0=cx-76;
  rowsY.forEach(function(y,ri){ for(var i=0;i<15;i++){ var x=rowsX0+i*10.2; if(rng()<.1) continue; var s=addStall(x,y,8.6,6.4,0,pick(rng,cols)); } });
  GEN.paths.push({pts:[[cx-86,cy+60],[cx+80,cy+60]],w:5,col:'#D3C8AA'});
  var area=rectPts(cx+2,cy+66,176,66,0); addLand(area,'gravel',{edge:'rgba(120,110,90,.35)',edgeW:.6}); mpoly(area,F_SOLID);
  /* грузовики у ворот, покупатели с сумками (на живом слое), стоянка */
  for(var i=0;i<4;i++){ var tr=addBox(cx+60+i*20,cy-60,15,6,0,7,{wc:pick(rng,['#C9C5BA','#B5654A','#8E9AA4','#E2E0D4']),rc:'#8E8A80',rt:0,win:0}); if(tr) mpoly(tr.pts,F_SOLID); }
  parkingLot(cx-60,cy+130,110,36,0,rng,.75); parkingLot(cx+70,cy+130,90,36,0,rng,.65);
  addBox(cx+104,cy+10,18,10,0,5,{wc:'#F2E8D2',rc:'#D1361A',rt:1,win:0,k:'gate'});
  GEN.marks.push({k:'market',x:cx,y:cy});
  var L=makeLattice('mkt',.04,70,58,.8);
  genLatticeStreets(L,6,'st',rng,.06);
  latticeBlocks(L,7).forEach(function(b){
    var Q=b.Q, sz=blSize(Q), a=blAng(Q), r=rng(), c=blp(Q,.5,.5);
    if(r<.55) fillBlock(Q,rng,{lotMax:28,skip:.14,skipTree:true,fill:[.8,.94],gap:2,gable:.1,gableZ:10,zf:function(rg){ return pick(rg,[5,6,9,9,12]); },wc:function(rg){ return pick(rg,PAL.wall.concat(PAL.panel)); },rc:function(rg,gb){ return gb?pick(rg,PAL.roofR):pick(rg,PAL.roofF); },win:1});
    else if(r<.8){ placeBox(c[0],c[1]-4,Math.min(54,sz[0]-12),22,a,rr(rng,8,12),{wc:pick(rng,PAL.ind),rc:pick(rng,PAL.roofS),rt:3,win:3}); parkingLot(c[0],c[1]+sz[1]*.28,Math.min(54,sz[0]-12),18,a,rng,.6); }
    else { addLand(Q,'lawn',{}); treesIn(Q,Math.round(sz[0]*sz[1]/380),rng,3.6,5.4,null); }
  });
  dressStreets(rng,['mkt'],{tree:.3,car:.28});
  infill('mkt',rng,{step:22,p:.8,w:[12,20],d:[10,16],zf:function(rg){ return pick(rg,[5,6,9,12]); },gable:.15,wc:function(rg){ return pick(rg,PAL.wall); },rc:function(rg,gb){ return gb?pick(rg,PAL.roofR):pick(rg,PAL.roofF); }});
}

/* ---- жилые районы: панельные ряды и башни ---- */
function slabBlock(Q,rng,o){
  var sz=blSize(Q), a=blAng(Q), ok=0, rows=Math.max(1,Math.floor((sz[1]-4)/o.pitch));
  for(var r=0;r<rows;r++){
    var t=rows===1?.5:.14+.72*r/(rows-1), cur=5, W=sz[0]-5;
    while(W-cur>=o.len[0]){
      var len=Math.min(rr(rng,o.len[0],o.len[1]),W-cur), s=(cur+len/2)/sz[0];
      if(rng()>(o.skip||0)){ var p=blp(Q,s,t), z=rr(rng,o.z[0],o.z[1]);
        var it=placeBox(p[0],p[1],len,o.dep||13,a,z,{wc:pick(rng,PAL.panel),rc:pick(rng,PAL.roofS),rt:0,win:1,lit:.6}); if(it) ok++; }
      cur+=len+rr(rng,o.gap?o.gap[0]:8,o.gap?o.gap[1]:16);
    }
  }
  if(o.tower&&rng()<o.tower){ var q=blp(Q,.5+rr(rng,-.3,.3),.5+rr(rng,-.3,.3)); placeBox(q[0],q[1],20,20,a,rr(rng,44,58),{wc:pick(rng,PAL.panel.concat(PAL.glass)),rc:'#8B949C',rt:0,win:1,lit:.7}); }
  var pp=blp(Q,.14,.5); if(rng()<.6&&mfree(pp[0],pp[1],F_SOLID)) addProp('play',pp[0],pp[1],{r:5});
  treesIn(Q,Math.round(sz[0]*sz[1]/170),rng,3.4,6.2,null,function(p){ return !mfree(p[0],p[1],F_SOLID); });
  if(rng()<.5){ var l0=blp(Q,.12,.96), l1=blp(Q,.7,.96); parkedCars(l0[0],l0[1],l1[0],l1[1],8,rng); }
  return ok;
}
function genHome(rng){
  var L=makeLattice('home',.08,126,104,.9,40,0);
  genLatticeStreets(L,6.6,'st',rng,.05);
  latticeBlocks(L,9).forEach(function(b){
    var Q=b.Q, sz=blSize(Q), a=blAng(Q), r=rng(), c=blp(Q,.5,.5);
    if(r<.72) slabBlock(Q,rng,{len:[40,70],z:[22,36],pitch:34,dep:13,tower:.5,skip:.08});
    else if(r<.8){ /* школа: П-образное низкое здание и стадион */
      placeBox(c[0],c[1]-10,56,14,a,10,{wc:'#F0E1BF',rc:'#B9544A',rt:0,win:1}); placeBox(c[0]-24,c[1]+6,14,28,a,10,{wc:'#F0E1BF',rc:'#B9544A',rt:0,win:1}); placeBox(c[0]+24,c[1]+6,14,28,a,10,{wc:'#F0E1BF',rc:'#B9544A',rt:0,win:1});
      var f=rectPts(c[0],c[1]+16,30,24,a); if(areaFree(f,BLOCK_F)){ addLand(f,'pitch',{edge:'rgba(255,255,255,.7)',edgeW:.6}); mpoly(f,F_SOLID); }
      treesIn(Q,8,rng,3.4,5,null,function(p){ return !mfree(p[0],p[1],F_SOLID); }); GEN.marks.push({k:'school',x:c[0],y:c[1]});
    } else if(r<.9){ placeBox(c[0],c[1],Math.min(80,sz[0]-12),38,a,12,{wc:'#EFE9DA',rc:'#B8B5AA',rt:0,win:0,k:'mall'}); parkingLot(c[0],c[1]+sz[1]*.32,Math.min(80,sz[0]-12),24,a,rng,.7); }
    else { addLand(Q,'lawn',{}); treesIn(Q,Math.round(sz[0]*sz[1]/220),rng,4,6.4,null); addProp('play',c[0],c[1],{r:7}); }
  });
  infill('home',rng,{step:30,p:.5,w:[30,46],d:[12,14],zf:function(rg){ return rr(rg,22,34); },wc:function(rg){ return pick(rg,PAL.panel); },rc:function(rg){ return pick(rg,PAL.roofS); },maxRoad:50});
  dressStreets(rng,['home'],{tree:.5,car:.22,rmin:3.4,rmax:5});
  /* северо-восточная полоса вдоль реки: малоэтажная застройка */
}
function genZar(rng){
  var L=makeLattice('zar',-.2,84,70,1.1,0,30);
  genLatticeStreets(L,5.6,'st',rng,.05);
  latticeBlocks(L,8).forEach(function(b){
    var Q=b.Q, sz=blSize(Q), a=blAng(Q), r=rng(), c=blp(Q,.5,.5);
    if(r<.52){ slabBlock(Q,rng,{len:[30,40],z:[14,17],pitch:28,dep:12,tower:0,skip:.06,gap:[8,14]}); }
    else if(r<.72){ fillBlock(Q,rng,{lotMax:20,skip:.1,skipTree:true,fill:[.75,.9],gap:2.6,gable:.7,gableZ:11,zf:function(rg){ return pick(rg,[4,5,6,9]); },wc:function(rg){ return pick(rg,PAL.wall); },rc:function(rg,gb){ return gb?pick(rg,PAL.roofR.concat(PAL.roofG)):pick(rg,PAL.roofF); },win:1}); }
    else if(r<.82){ if(!genChurch(c[0],c[1],a,rng)) fillBlock(Q,rng,{lotMax:22,skip:.1,fill:[.8,.9],gap:2,gable:.4,gableZ:10,zf:function(rg){ return pick(rg,[6,9]); },wc:function(rg){ return pick(rg,PAL.wall); },rc:function(rg,gb){ return pick(rg,PAL.roofR); },win:1}); else { addLand(Q,'lawn',{}); treesIn(Q,10,rng,3.4,5.4,null,function(p){ return !mfree(p[0],p[1],F_SOLID); }); } }
    else { addLand(Q,'lawn',{}); treesIn(Q,Math.round(sz[0]*sz[1]/260),rng,3.8,6,null); for(var q=0;q<2;q++){ var bp=blp(Q,.3+q*.4,.5); addProp('bench',bp[0],bp[1],{a:rng()}); } }
  });
  infill('zar',rng,{step:22,p:.7,w:[10,22],d:[9,13],zf:function(rg){ return pick(rg,[4,5,6,9,15]); },gable:.6,wc:function(rg){ return pick(rg,PAL.wall); },rc:function(rg,gb){ return gb?pick(rg,PAL.roofR.concat(PAL.roofG)):pick(rg,PAL.roofF); },maxRoad:44});
  dressStreets(rng,['zar'],{tree:.4,car:.16});
}

/* ---- частный сектор: участки с домами, огородами и садами ---- */
function genPriv(rng){
  var L=makeLattice('priv',.12,64,52,1.3);
  genLatticeStreets(L,3.8,'ln',rng,.05);
  latticeBlocks(L,5.5).forEach(function(b){
    var Q=b.Q, sz=blSize(Q), a=blAng(Q), r=rng();
    if(r<.12){ addLand(Q,'garden',{stripes:true,sa:a}); treesIn(Q,4,rng,3,4.2,0); return; }
    /* два ряда участков вдоль длинной стороны */
    var nx=Math.max(2,Math.round(sz[0]/24));
    for(var row=0;row<2;row++) for(var i=0;i<nx;i++){
      var s=(i+.5)/nx, t=row===0?.26:.74, p=blp(Q,s,t), pw=sz[0]/nx-3, pd=sz[1]/2-3;
      var plot=rectPts(p[0],p[1],pw,pd,a); if(!areaFree(plot,BLOCK_F)) continue;
      addLand(plot,rng()<.6?'garden':'lawn',{edge:'rgba(110,90,60,.45)',edgeW:.6,stripes:rng()<.5,sa:a}); mpoly(plot,F_SOLID);
      var hz=rr(rng,3,5), hw=rr(rng,9,13), hd=rr(rng,7,9), hx=p[0]+rot(0,(row===0?-1:1)*(pd/2-hd/2-1),a)[0]*0, hp=rot(rr(rng,-pw*.18,pw*.18),(row===0?1:-1)*(pd/2-hd/2-1.2)*(-1),a);
      var hs=addBox(p[0]+hp[0],p[1]+hp[1],hw,hd,a+(rng()<.12?Math.PI/2:0),hz,{wc:pick(rng,PAL.wall.concat(['#E7C79E','#C7D9C1'])),rc:pick(rng,PAL.roofR.concat(PAL.roofG,PAL.roofS)),rt:1,win:1,lit:.5});
      if(rng()<.5){ var sh=rot(rr(rng,-pw*.3,pw*.3),rr(rng,-pd*.2,pd*.2),a); addBox(p[0]+sh[0],p[1]+sh[1],4,3.4,a,2.6,{wc:'#B49A74',rc:'#7A5645',rt:1,win:0}); }
      if(rng()<.5) addTree(p[0]+rr(rng,-pw*.35,pw*.35),p[1]+rr(rng,-pd*.35,pd*.35),rr(rng,2.8,4.2),rng()<.3?1:0);
      if(rng()<.2) addProp('bush',p[0]+rr(rng,-pw*.4,pw*.4),p[1]+rr(rng,-pd*.4,pd*.4),{r:2});
    }
  });
  dressStreets(rng,['priv'],{tree:.12,car:.03,rmin:2.8,rmax:3.8,toff:3});
}

/* ---- Оружейный завод и промзона ---- */
function genInd(rng){
  /* главный заводской двор у железной дороги */
  var cx=330, cy=380;
  var yard=rectPts(cx,cy,280,170,.07); addLand(yard,'yard',{edge:'#6B6F76',edgeW:1.2}); mpoly(yard,F_SOLID|F_PARK);
  function hall(dx,dy,w,d,z,col){ var p=rot(dx,dy,.07); var it=addBox(cx+p[0],cy+p[1],w,d,.07,z,{wc:col||pick(rng,PAL.ind),rc:pick(rng,PAL.roofS),rt:3,win:3,lit:.4}); mpoly(it.pts,F_SOLID); return it; }
  hall(-80,-50,110,40,16); hall(40,-52,80,34,14); hall(-70,18,70,38,15); hall(24,10,100,46,18,'#B5654A'); hall(104,-4,40,70,12);
  var cb=rot(80,60,.07); addBox(cx+cb[0],cy+cb[1],60,20,.07,8,{wc:'#D9D2BE',rc:'#8B6B4A',rt:0,win:1,k:'office'});
  /* трубы, баки, градирня */
  [[-110,-4,3.6,60],[-96,-4,3,48],[120,-48,3.4,54]].forEach(function(t){ var p=rot(t[0],t[1],.07); addCyl(cx+p[0],cy+p[1],t[2],t[3],{col:'#B5654A',top:'flat'}); GEN.smoke.push({x:cx+p[0]-KX*t[3],y:cy+p[1]-KY*t[3]}); });
  [[-40,60],[-26,64],[-12,62]].forEach(function(t){ var p=rot(t[0],t[1],.07); addCyl(cx+p[0],cy+p[1],7,13,{col:'#C9C5BA',top:'flat'}); });
  var gt=rot(-120,56,.07); addCyl(cx+gt[0],cy+gt[1],10,22,{col:'#D7D2C4',top:'flat',gl:1}); addCyl(cx+gt[0],cy+gt[1],16,20,{col:'#D7D2C4',top:'flat'}); 
  for(var i=0;i<18;i++){ var p=rot(rr(rng,-130,60),rr(rng,70,82),.07); addBox(cx+p[0],cy+p[1],8,3.6,.07,3.6,{wc:pick(rng,['#C94B3A','#3E6FA8','#E2B53C','#5E8C61','#8A8F96']),rc:'#4A4C50',rt:0,win:0}); }
  /* подъездные пути со стороны железной дороги */
  var sp=[[RAILS[Math.floor(RAILS.length*.05)][0],0]]; 
  var spur=resample(chaikin([[290,352],[300,380],[310,420],[330,470]],2,false),6); GEN.rails.push({pts:spur,w:5.2});
  var spur2=resample(chaikin([[430,376],[400,392],[360,398]],2,false),6); GEN.rails.push({pts:spur2,w:5.2});
  GEN.marks.push({k:'factory',x:cx,y:cy});
  var L=makeLattice('ind',.07,150,118,.6);
  genLatticeStreets(L,6.6,'st',rng,.06);
  latticeBlocks(L,10).forEach(function(b){
    var Q=b.Q, sz=blSize(Q), a=blAng(Q), r=rng(), c=blp(Q,.5,.5);
    if(r<.6){ var n=rng()<.5?1:2; for(var k=0;k<n;k++){ var pp=blp(Q,.5,n===1?.5:.28+k*.44); placeBox(pp[0],pp[1],Math.min(rr(rng,60,100),sz[0]-16),rr(rng,24,36),a,rr(rng,10,17),{wc:pick(rng,PAL.ind),rc:pick(rng,PAL.roofS),rt:3,win:3}); } treesIn(Q,3,rng,3,4.4,null,function(p){ return !mfree(p[0],p[1],F_SOLID); }); }
    else if(r<.8){ var yd=blp(Q,.5,.5); var pl=Q; addLand(Q,'yard',{edge:'rgba(90,90,100,.5)',edgeW:.6}); for(var q=0;q<10;q++){ var cp=blp(Q,.1+rng()*.8,.1+rng()*.8); addBox(cp[0],cp[1],8,3.6,a,3.6,{wc:pick(rng,['#C94B3A','#3E6FA8','#E2B53C','#5E8C61','#8A8F96']),rc:'#4A4C50',rt:0,win:0}); } }
    else { parkingLot(c[0],c[1],Math.min(80,sz[0]-12),Math.min(40,sz[1]-12),a,rng,.55); }
  });
  dressStreets(rng,['ind'],{tree:.2,car:.1});
}

/* ---- окрестности: поля, лес, посёлки ---- */
function genCountry(rng){
  var cell=120, fieldN=0;
  for(var y=-100;y<1800;y+=cell) for(var x=-100;x<2500;x+=cell){
    var cxp=x+cell/2, cyp=y+cell/2, n=fbm(cxp*.0035,cyp*.0035,3);
    if(districtAt(cxp,cyp)) continue;
    if(!mfree(cxp,cyp,F_WATER|F_ROAD|F_RAIL|F_SOLID)) continue;
    if(distPoly(cxp,cyp,UPA)<70||distPoly(cxp,cyp,TULITSA)<50) continue;
    if(n>.55){ /* поле */
      var w=cell*rr(rng,.8,.98), h=cell*rr(rng,.75,.95), a=(rng()-.5)*.2, pts=rectPts(cxp,cyp,w,h,a);
      if(!areaFree(pts,F_WATER|F_ROAD|F_RAIL|F_SOLID)) continue;
      addLand(pts,'field',{f:Math.floor(rng()*4),stripes:true,sa:a+(rng()<.5?0:1.57)}); mpoly(pts,F_SOLID); fieldN++;
    }
  }
  /* лес */
  for(y=-100;y<1800;y+=11) for(x=-100;x<2500;x+=11){
    var px=x+rr(rng,-5,5), py=y+rr(rng,-5,5); if(px<-90||px>2490||py<-90||py>1790) continue;
    var nz=fbm(px*.0042+9,py*.0042+3,3);
    if(nz<.52) continue;
    if(districtAt(px,py)) continue; if(!mfree(px,py,F_WATER|F_ROAD|F_RAIL|F_SOLID|F_STREET)) continue;
    if(distPoly(px,py,UPA)<30||distPoly(px,py,TULITSA)<24) continue;
    if(rng()<.35) continue;
    addTree(px,py,rr(rng,4.2,7.6),rng()<.4?1:(rng()<.2?3:0));
  }
  /* прибрежные ивы */
  [UPA,TULITSA].forEach(function(line){ for(var i=6;i<line.length-6;i+=5){ for(var s=-1;s<=1;s+=2){ var q=line[i], w=line===UPA?upaWidth(i,line.length):tulWidth(i,line.length), a=line[Math.min(line.length-1,i+1)], b=line[Math.max(0,i-1)], dx=a[0]-b[0], dy=a[1]-b[1], l=Math.sqrt(dx*dx+dy*dy)||1, off=(w/2+10+rng()*6)*s, x2=q[0]-dy/l*off, y2=q[1]+dx/l*off; if(districtAt(x2,y2)&&rng()<.7) continue; if(mfree(x2,y2,F_SOLID|F_ROAD|F_WATER|F_RAIL)&&rng()<.6) addTree(x2,y2,rr(rng,4,6),0); } } });
  /* посёлки: кластеры домов около дорог */
  var villages=[[1500,200],[760,160],[2000,260],[420,1590],[1900,1560],[160,1000],[2230,1180]];
  villages.forEach(function(v,vi){
    var n=11+Math.floor(rng()*6);
    for(var i=0;i<n;i++){ var vx=v[0]+rr(rng,-70,70), vy=v[1]+rr(rng,-45,45); if(!mfree(vx,vy,F_WATER|F_ROAD|F_RAIL|F_SOLID)) continue; var pl=rectPts(vx,vy,26,24,0.1*vi); addLand(pl,'garden',{edge:'rgba(110,90,60,.4)',edgeW:.5,stripes:rng()<.5,sa:.1}); mpoly(pl,F_SOLID); addBox(vx+rr(rng,-4,4),vy+rr(rng,-4,4),rr(rng,9,12),rr(rng,7,9),.1*vi,rr(rng,3,5),{wc:pick(rng,PAL.wall),rc:pick(rng,PAL.roofR.concat(PAL.roofG,PAL.roofS)),rt:1,win:1}); addTree(vx+rr(rng,-7,7),vy+rr(rng,-6,6),rr(rng,2.8,4),0); }
    var pts=[[v[0]-90,v[1]+rr(rng,-8,8)],[v[0],v[1]+rr(rng,-8,8)],[v[0]+90,v[1]+rr(rng,-8,8)]]; GEN.streets.push({pts:resample(chaikin(pts,2,false),8),w:3.6,cls:'ln',d:'vil'});
  });
}

/* ---- фонари вдоль дорог ---- */
function genLamps(rng){
  GEN.roads.forEach(function(r){
    var step=r.cls==='hwy'?46:(r.cls==='ave'?34:38), pts=resample(r.pts,step);
    for(var i=1;i<pts.length-1;i++){
      var a=pts[i-1], b=pts[i+1], dx=b[0]-a[0], dy=b[1]-a[1], l=Math.sqrt(dx*dx+dy*dy)||1, nx=-dy/l, ny=dx/l, side=(i&1)?1:-1, off=r.w/2+3.2;
      var x=pts[i][0]+nx*off*side, y=pts[i][1]+ny*off*side; if(!mfree(x,y,F_WATER)) continue;
      GEN.lamps.push([x,y]);
    }
  });
  GEN.streets.forEach(function(s){
    if(s.cls==='ln'||s.d==='vil') return;
    var pts=resample(s.pts,50);
    for(var i=1;i<pts.length-1;i++){ if(rng()<.35) continue; var a=pts[i-1], b=pts[i+1], dx=b[0]-a[0], dy=b[1]-a[1], l=Math.sqrt(dx*dx+dy*dy)||1, off=s.w/2+2.6; var x=pts[i][0]-dy/l*off, y=pts[i][1]+dx/l*off; if(mfree(x,y,F_WATER|F_SOLID)) GEN.lamps.push([x,y]); }
  });
}
