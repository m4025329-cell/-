/* ===== Карта Тулы: генерация города, часть 1 (маска занятости, дороги, вода, решётки улиц) ===== */

/* ---- маска занятости: 4 единицы на клетку ---- */
var MS=4, MOX=140, MOY=140, MW=Math.ceil((2400+300)/MS), MH=Math.ceil((1700+300)/MS);
var MASK=new Uint8Array(MW*MH);
var F_WATER=1, F_ROAD=2, F_RAIL=4, F_SOLID=8, F_PARK=16, F_STREET=32;
function mi(x,y){ var i=Math.floor((x+MOX)/MS), j=Math.floor((y+MOY)/MS); return (i<0||j<0||i>=MW||j>=MH)?-1:j*MW+i; }
function mget(x,y){ var k=mi(x,y); return k<0?255:MASK[k]; }
function mfree(x,y,f){ return !(mget(x,y)&f); }
function mdisk(x,y,r,f){
  var i0=Math.floor((x-r+MOX)/MS), i1=Math.floor((x+r+MOX)/MS), j0=Math.floor((y-r+MOY)/MS), j1=Math.floor((y+r+MOY)/MS), r2=r*r;
  for(var j=Math.max(0,j0);j<=Math.min(MH-1,j1);j++) for(var i=Math.max(0,i0);i<=Math.min(MW-1,i1);i++){
    var cx=i*MS+MS/2-MOX-x, cy=j*MS+MS/2-MOY-y; if(cx*cx+cy*cy<=r2) MASK[j*MW+i]|=f;
  }
}
function mline(p,w,f){ for(var i=1;i<p.length;i++){ var a=p[i-1], b=p[i], l=dist(a,b), n=Math.max(1,Math.ceil(l/(MS*.6))); for(var k=0;k<=n;k++) mdisk(a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n,w/2,f); } }
function mpoly(p,f){
  var bb=bbox(p); for(var j=Math.floor((bb[1]+MOY)/MS);j<=Math.floor((bb[3]+MOY)/MS);j++) for(var i=Math.floor((bb[0]+MOX)/MS);i<=Math.floor((bb[2]+MOX)/MS);i++){
    if(i<0||j<0||i>=MW||j>=MH) continue; if(inPoly(i*MS+MS/2-MOX,j*MS+MS/2-MOY,p)) MASK[j*MW+i]|=f;
  }
}
/* свободна ли площадка (центр и четыре угла) от заданных флагов */
function areaFree(pts,f){ var c=centroid(pts); if(!mfree(c[0],c[1],f)) return false; for(var i=0;i<pts.length;i++) if(!mfree(pts[i][0],pts[i][1],f)) return false; return true; }

/* ---- результат генерации ---- */
var GEN={lamps:[], roads:[], streets:[], bridges:[], land:[], paths:[], items:[], lamps:[], labels:[], marks:[], fences:[], rails:[], smoke:[], wins:[], stops:[], spawn:{}, yards:[]};
function addLand(pts,kind,o){ var l={pts:pts,kind:kind}; if(o) for(var k in o) l[k]=o[k]; GEN.land.push(l); return l; }

/* ---- рисуем фабрики объектов ---- */
var PAL={
  wall:['#EFE2C4','#E9BFAE','#F0D58A','#BFD8BF','#B9D1E6','#F3EFE6','#E6C9A0','#D7B8A6','#F2C9A5','#CDE0D0'],
  roofR:['#C0563B','#A9452F','#B8603F','#8E4A36','#9C5A3A'],
  roofG:['#5F8D6B','#6B8F77','#4E7C64'],
  roofS:['#6C7782','#7C858E','#5E6770'],
  roofO:['#D4A04A','#C79540'],
  roofF:['#C9C5BA','#BDB9AE','#D6D2C6','#B5B2A8'],
  glass:['#6E9CB5','#7BA7BE','#5C8BA6','#86AEC2','#688CA3'],
  panel:['#CFCBC0','#D8D2C3','#C4C1B7','#D2CCB8','#BFC2BD'],
  brick:['#B5654A','#A55A44','#BE7355'],
  ind:['#B9B4A4','#A9AFA6','#C3B79B','#9FA7AB'],
  car:['#C94B3A','#3E6FA8','#E8E2D2','#2F3A44','#E2B53C','#5E8C61','#8A8F96','#B36B3A']
};
function addBox(cx,cy,w,d,a,z,o){
  o=o||{}; var pts=rectPts(cx,cy,w,d,a), it={t:'b',pts:pts,z:z,wc:o.wc||'#EFE2C4',rc:o.rc||'#C0563B',rt:o.rt||0,win:o.win==null?1:o.win,seed:Math.floor((cx*7.3+cy*3.1)*10)&0xffff,cx:cx,cy:cy,w:w,d:d,a:a,k:o.k||'',lit:o.lit==null?.55:o.lit,rh:o.rh||0,sn:o.sn||0};
  it.y=Math.max(pts[0][1],pts[1][1],pts[2][1],pts[3][1]); GEN.items.push(it); return it;
}
function addTree(x,y,r,k,s){ var it={t:'tr',x:x,y:y,r:r,k:k||0,s:s==null?Math.floor(x*13+y*7)&255:s,y2:y}; it.y=y; GEN.items.push(it); return it; }
function addCyl(x,y,r,z,o){ o=o||{}; var it={t:'y',x:x,y:y+r,cx:x,cy:y,r:r,z:z,col:o.col||'#C9C4B8',top:o.top||'flat',tc:o.tc||'#8E4A36',hh:o.hh||0,gl:o.gl||0}; it.y=y+r; GEN.items.push(it); return it; }
function addCar(x,y,a,col,rng){ var it={t:'car',x:x,y:y,a:a,col:col||'#C94B3A'}; it.y=y+2; GEN.items.push(it); return it; }
function addStall(x,y,w,d,a,col){ var it={t:'stall',x:x,y:y,w:w,d:d,a:a,col:col}; it.y=y+d/2; GEN.items.push(it); return it; }
function addProp(k,x,y,o){ var it={t:'m',k:k,x:x,y:y,a:0,r:3}; if(o) for(var q in o) it[q]=o[q]; it.y=y+(it.r||0); GEN.items.push(it); return it; }

/* ---- вода и рельсы ---- */
function genWaterRail(){
  mline(UPA,0,0);
  for(var i=0;i<UPA.length;i++) mdisk(UPA[i][0],UPA[i][1],upaWidth(i,UPA.length)/2+7,F_WATER);
  for(i=0;i<TULITSA.length;i++) mdisk(TULITSA[i][0],TULITSA[i][1],tulWidth(i,TULITSA.length)/2+6,F_WATER);
  mline(RAILS,18,F_RAIL);
  /* станционные пути шире */
  mline(RAILS.filter(function(p){ return p[0]>1380&&p[0]<1860; }),46,F_RAIL);
}

/* ---- магистрали ---- */
function genRoads(rng){
  ROADS.forEach(function(r){
    var pts=r.pts;
    if(r.bank){
      var line=sliceByX(r.bank.line==='upa'?UPA:TULITSA,r.bank.x0,r.bank.x1);
      pts=resample(offsetPoly(line,r.bank.d),9);
    } else { pts=resample(chaikin(pts,2,false),8); }
    var road={id:r.id,name:r.name,cls:r.cls,w:r.w,pts:pts};
    GEN.roads.push(road);
    mline(pts,r.w+7,F_ROAD);
  });
  BRIDGES.forEach(function(b){ var pts=resample(b.pts,10); GEN.bridges.push({pts:pts,w:b.w}); });
  /* путепровод над рельсами */
  GEN.bridges.push({pts:resample(OVERPASS.pts,10),w:OVERPASS.w,over:true});
}

/* ---- решётка улиц района ----
   ang: поворот сетки, sx/sy: размер ячейки, off: смещение, warp: амплитуда искривления */
function warpPt(x,y,k){
  k=k||1; return [x+(fbm(x*.0042,y*.0042,2)-.5)*34*k, y+(fbm(x*.0042+37,y*.0042+11,2)-.5)*34*k];
}
function latPt(L,i,j){ var r=rot(i*L.sx,j*L.sy,L.ang); return warpPt(L.ox+r[0],L.oy+r[1],L.warp); }
function makeLattice(id,ang,sx,sy,warp,ox,oy){
  var polys=DPOLY[id], bb=[1e9,1e9,-1e9,-1e9]; polys.forEach(function(p){ var b=bbox(p); bb=[Math.min(bb[0],b[0]),Math.min(bb[1],b[1]),Math.max(bb[2],b[2]),Math.max(bb[3],b[3])]; });
  var cx=(bb[0]+bb[2])/2+(ox||0), cy=(bb[1]+bb[3])/2+(oy||0), R=Math.max(bb[2]-bb[0],bb[3]-bb[1])*.75;
  var L={id:id,ang:ang,sx:sx,sy:sy,warp:warp==null?1:warp,ox:cx,oy:cy,n:Math.ceil(R/Math.min(sx,sy))+2,polys:polys};
  return L;
}
function inDistrict(id,x,y,m){
  var ps=DPOLY[id]; for(var i=0;i<ps.length;i++){ if(inPoly(x,y,ps[i])){ if(!m||distPoly(x,y,ps[i].concat([ps[i][0]]))>m) return true; } } return false;
}
/* улицы решётки: сегменты длиной ~14, включаются целиком по центру внутри района и без пересечений с водой/рельсами/уже занятым */
function genLatticeStreets(L,w,cls,rng,skipProb){
  var N=L.n, step=14, out=[];
  function seg(a,b){ /* a,b — индексы решётки: идём по ребру от a к b мелкими шагами */
    var pts=[], n=Math.max(1,Math.round(Math.max(Math.abs(b[0]-a[0])*L.sx,Math.abs(b[1]-a[1])*L.sy)/step));
    for(var k=0;k<=n;k++){ pts.push(latPt(L,a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n)); }
    return pts;
  }
  var run;
  function flush(){ if(run&&run.length>1){ out.push(run); } run=null; }
  function consider(pts,key){
    /* режем на отрезки по пригодности каждого мелкого шага */
    for(var i=1;i<pts.length;i++){
      var a=pts[i-1], b=pts[i], mx=(a[0]+b[0])/2, my=(a[1]+b[1])/2;
      var ok=inDistrict(L.id,mx,my,3) && mfree(mx,my,F_WATER|F_RAIL|F_SOLID|F_ROAD|F_PARK|F_STREET);
      if(ok){ if(!run) run=[a]; run.push(b); } else flush();
    }
    flush();
  }
  for(var i=-N;i<=N;i++){
    var w1=((i%4===0)?1:0);
    for(var j=-N;j<N;j++){
      if(rng()<(skipProb||0)) continue;
      consider(seg([i,j],[i,j+1]));
    }
  }
  for(var j2=-N;j2<=N;j2++){
    for(var i2=-N;i2<N;i2++){
      if(rng()<(skipProb||0)) continue;
      consider(seg([i2,j2],[i2+1,j2]));
    }
  }
  out.forEach(function(p){
    var s={pts:p,w:w,cls:cls,d:L.id}; GEN.streets.push(s); mline(p,w+3,F_STREET);
  });
}

/* ячейки решётки как четырёхугольники блоков (с отступом от улиц) */
function latticeBlocks(L,inset,filter){
  var N=L.n, blocks=[], FB=F_WATER|F_RAIL|F_SOLID|F_ROAD|F_PARK;
  for(var j=-N;j<N;j++) for(var i=-N;i<N;i++){
    var ctr=latPt(L,i+.5,j+.5);
    if(!inDistrict(L.id,ctr[0],ctr[1],0)) continue;
    if(!mfree(ctr[0],ctr[1],FB)) continue;
    var ix=inset/L.sx, iy=inset/L.sy;
    var Q=[latPt(L,i+ix,j+iy),latPt(L,i+1-ix,j+iy),latPt(L,i+1-ix,j+1-iy),latPt(L,i+ix,j+1-iy)];
    var ins=0, bad=0; for(var k=0;k<4;k++){ if(inDistrict(L.id,Q[k][0],Q[k][1])) ins++; if(!mfree(Q[k][0],Q[k][1],FB)) bad++; }
    if(ins<2||bad>1) continue;
    var b={Q:Q,i:i,j:j,ctr:ctr,ang:L.ang}; GEN.dbg=GEN.dbg||{}; GEN.dbg[L.id]=(GEN.dbg[L.id]||0)+1;
    if(filter&&!filter(b)) continue;
    blocks.push(b);
  }
  return blocks;
}
/* точка внутри четырёхугольника блока по долям (s по ширине, t по высоте) */
function blp(Q,s,t){ return [ (1-s)*(1-t)*Q[0][0]+s*(1-t)*Q[1][0]+s*t*Q[2][0]+(1-s)*t*Q[3][0], (1-s)*(1-t)*Q[0][1]+s*(1-t)*Q[1][1]+s*t*Q[2][1]+(1-s)*t*Q[3][1] ]; }
function blSize(Q){ return [(dist(Q[0],Q[1])+dist(Q[3],Q[2]))/2,(dist(Q[0],Q[3])+dist(Q[1],Q[2]))/2]; }
function blAng(Q){ return Math.atan2(Q[1][1]-Q[0][1]+Q[2][1]-Q[3][1],Q[1][0]-Q[0][0]+Q[2][0]-Q[3][0]); }

/* дворовые мелочи */
function treesIn(Q,n,rng,rmin,rmax,k,avoid){
  for(var i=0;i<n;i++){ var p=blp(Q,.08+rng()*.84,.08+rng()*.84); if(!mfree(p[0],p[1],F_WATER|F_ROAD|F_RAIL)) continue; if(avoid&&avoid(p)) continue; addTree(p[0],p[1],rr(rng,rmin,rmax),k==null?(rng()<.2?1:0):k); }
}
function parkedCars(x0,y0,x1,y1,n,rng){
  var l=dist([x0,y0],[x1,y1]), a=Math.atan2(y1-y0,x1-x0);
  for(var i=0;i<n;i++){ var t=(i+.5)/n; if(rng()<.35) continue; var x=x0+(x1-x0)*t, y=y0+(y1-y0)*t; if(!mfree(x,y,F_WATER)) continue; addCar(x,y,a,pick(rng,PAL.car),rng); }
}

/* ---- застройка блока по участкам (рекурсивное деление) ---- */
function fillBlock(Q,rng,o){
  var sz=blSize(Q), a=blAng(Q), out=[];
  function rec(s0,t0,s1,t1,depth){
    var w=(s1-s0)*sz[0], h=(t1-t0)*sz[1], big=Math.max(w,h);
    if(big>o.lotMax*(1+rng()*.35)&&depth<7){
      if(w>=h){ var m=s0+(s1-s0)*(.38+rng()*.24); rec(s0,t0,m,t1,depth+1); rec(m,t0,s1,t1,depth+1); }
      else { var m2=t0+(t1-t0)*(.38+rng()*.24); rec(s0,t0,s1,m2,depth+1); rec(s0,m2,s1,t1,depth+1); }
      return;
    }
    var c=blp(Q,(s0+s1)/2,(t0+t1)/2);
    if(rng()<(o.skip||0)){ if(o.skipTree&&rng()<.7) addTree(c[0],c[1],rr(rng,3.2,5),rng()<.2?1:0); return; }
    var gap=o.gap==null?2:o.gap, bw=Math.max(5,w-gap*2)*rr(rng,o.fill[0],o.fill[1]), bd=Math.max(5,h-gap*2)*rr(rng,o.fill[0],o.fill[1]);
    var z=o.zf(rng,depth,c), rt=(o.gable&&rng()<o.gable&&z<=(o.gableZ||12))?1:0;
    var it=placeBox(c[0],c[1],bw,bd,a,z,{wc:o.wc(rng),rc:o.rc(rng,rt),rt:rt,win:o.win==null?1:(typeof o.win==='function'?o.win(rng):o.win),lit:o.lit});
    if(it) out.push(it);
  }
  rec(0,0,1,1,0);
  return out;
}
/* деревья вдоль улиц и машины у обочины */
function dressStreets(rng,ids,o){
  o=o||{};
  GEN.streets.forEach(function(s){
    if(ids&&ids.indexOf(s.d)<0) return;
    var pts=resample(s.pts,o.step||13), sd=0;
    for(var i=1;i<pts.length-1;i++){
      var a=pts[i-1], b=pts[i+1], dx=b[0]-a[0], dy=b[1]-a[1], l=Math.sqrt(dx*dx+dy*dy)||1, nx=-dy/l, ny=dx/l;
      for(var side=-1;side<=1;side+=2){
        if(rng()<(o.tree==null?.5:o.tree)){
          var off=(s.w/2+(o.toff||3.6))*side, x=pts[i][0]+nx*off, y=pts[i][1]+ny*off;
          if(mfree(x,y,F_SOLID|F_WATER|F_ROAD|F_RAIL)) { var tr=addTree(x,y,rr(rng,o.rmin||3,o.rmax||4.4),o.k==null?(rng()<.25?3:0):o.k); }
        }
        if(rng()<(o.car==null?.16:o.car)){
          var off2=(s.w/2-1.8)*side, x2=pts[i][0]+nx*off2+dx/l*rr(rng,-3,3), y2=pts[i][1]+ny*off2+dy/l*rr(rng,-3,3);
          if(mfree(x2,y2,F_SOLID|F_WATER)) addCar(x2,y2,Math.atan2(dy,dx)+(side>0?0:Math.PI),pick(rng,PAL.car),rng);
        }
      }
    }
  });
}
/* церковь с луковичным куполом */
function genChurch(x,y,a,rng){
  var it=placeBox(x,y,12,17,a,12,{wc:'#F6F1E4',rc:'#CFC8B4',rt:0,win:0,k:'church'}); if(!it) return false;
  var p=rot(0,-2,a); addCyl(x+p[0],y+p[1],4.2,15,{col:'#F6F1E4',top:'onion',tc:rng()<.5?'#E0B83C':'#4E9BC4',hh:10.5});
  var q=rot(0,10,a); addCyl(x+q[0],y+q[1],3,20,{col:'#F6F1E4',top:'cone',tc:'#6C8E78',hh:9});
  return true;
}

/* угол ближайшей дороги или улицы (для выравнивания застройки) */
function roadAngleAt(x,y){
  var best=1e9, ang=0, lists=[GEN.roads,GEN.streets];
  for(var l=0;l<2;l++){
    var R=lists[l];
    for(var i=0;i<R.length;i++){
      var p=R[i].pts, bb=R[i].bb||(R[i].bb=bbox(p));
      if(x<bb[0]-60||x>bb[2]+60||y<bb[1]-60||y>bb[3]+60) continue;
      for(var j=1;j<p.length;j++){ var d=segDist(x,y,p[j-1][0],p[j-1][1],p[j][0],p[j][1]); if(d<best){ best=d; ang=Math.atan2(p[j][1]-p[j-1][1],p[j][0]-p[j-1][0]); } }
    }
  }
  return {a:ang,d:best};
}
/* «подсадка» зданий в пустоты района: сетка точек с шагом step */
function infill(id,rng,o){
  var polys=DPOLY[id], step=o.step||24, bb=[1e9,1e9,-1e9,-1e9];
  polys.forEach(function(p){ var b=bbox(p); bb=[Math.min(bb[0],b[0]),Math.min(bb[1],b[1]),Math.max(bb[2],b[2]),Math.max(bb[3],b[3])]; });
  var FB=F_WATER|F_RAIL|F_SOLID|F_ROAD|F_PARK|F_STREET;
  for(var y=bb[1]+step/2;y<bb[3];y+=step) for(var x=bb[0]+step/2;x<bb[2];x+=step){
    var px=x+rr(rng,-step*.35,step*.35), py=y+rr(rng,-step*.35,step*.35);
    if(!inDistrict(id,px,py,2)||!mfree(px,py,FB)) continue;
    if(rng()>(o.p==null?.8:o.p)) continue;
    var ra=roadAngleAt(px,py); if(ra.d>(o.maxRoad||70)) continue;
    var w=rr(rng,o.w[0],o.w[1]), d=rr(rng,o.d[0],o.d[1]), z=o.zf(rng), rt=(o.gable&&rng()<o.gable&&z<=10)?1:0;
    var ang=ra.a+(rng()<.5?0:Math.PI/2)*(o.cross?1:0);
    if(!placeBox(px,py,w,d,ra.a,z,{wc:o.wc(rng),rc:o.rc(rng,rt),rt:rt,win:1})) { if(rng()<.5) addTree(px,py,rr(rng,3,4.6),rng()<.2?1:0); }
  }
}
