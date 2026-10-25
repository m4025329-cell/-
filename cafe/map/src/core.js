/* ===== Карта Тулы: конвейер слоёв (статичный кэш, ночные огни, оверлеи, подписи) ===== */

function makeView(cx,cy,s,W,H){ var hw=W/2/s, hh=H/2/s; return {cx:cx,cy:cy,s:s,W:W,H:H,x0:cx-hw,y0:cy-hh,x1:cx+hw,y1:cy+hh}; }
function lodOf(s){ return s<.25?0:(s<.55?1:(s<1.2?2:3)); }

function drawLampPosts(ctx,V,lod){
  if(lod<2) return;
  ctx.fillStyle='#3E4148';
  for(var i=0;i<GEN.lamps.length;i++){ var l=GEN.lamps[i]; if(l[0]<V.x0-4||l[0]>V.x1+4||l[1]<V.y0-10||l[1]>V.y1+4) continue; ctx.fillRect(l[0]-.35,l[1]-5,.7,5); ctx.fillStyle='#F2E7B8'; ctx.fillRect(l[0]-1,l[1]-5.8,2,1); ctx.fillStyle='#3E4148'; }
}

function renderStatic(ctx,V,P){
  var lod=lodOf(V.s);
  drawGround(ctx,V,P);
  drawPaths(ctx,V,P,lod);
  drawWater(ctx,V,P,lod);
  drawRoads(ctx,V,P,lod);
  drawRails(ctx,V,P,lod);
  drawBridges(ctx,V,P,lod);
  var items=itemRange(GEN.items,V.y0-40,V.y1+70);
  drawShadows(ctx,V,P,items,lod);
  drawItems(ctx,V,P,lod,items);
  drawLampPosts(ctx,V,lod);
}

/* ---- ночной слой: огни окон и фонарей на прозрачном фоне ---- */
var _glow=null;
function glowSprite(){ if(_glow) return _glow; var c=document.createElement('canvas'); c.width=c.height=64; var g=c.getContext('2d'), r=g.createRadialGradient(32,32,0,32,32,32); r.addColorStop(0,'rgba(255,224,150,.95)'); r.addColorStop(.25,'rgba(255,205,120,.55)'); r.addColorStop(1,'rgba(255,190,100,0)'); g.fillStyle=r; g.fillRect(0,0,64,64); return (_glow=c); }
function renderLights(ctx,V){
  var lod=lodOf(V.s), items=itemRange(GEN.items,V.y0-40,V.y1+70), i;
  /* окна */
  if(lod>=2){
    ctx.lineCap='butt';
    for(i=0;i<items.length;i++){
      var it=items[i]; if(it.t!=='b'||!it.win||it.z<4.5) continue; var x=it.cx; if(x<V.x0-40||x>V.x1+40) continue;
      var rng=mulberry32(it.seed), F=boxFaces(it);
      for(var k=0;k<F.length;k++){ var f=F[k]; if(f.kind!=='wall') continue;
        var ax=f.a[0], ay=f.a[1], dx=f.b[0]-ax, dy=f.b[1]-ay, L=Math.sqrt(dx*dx+dy*dy); if(L<6) continue;
        var fh=it.win===2?3.4:(it.win===3?6:3.1), nf=it.win===3?1:Math.max(1,Math.floor((f.z-1.4)/fh));
        ctx.save(); ctx.transform(dx/L,dy/L,-KX,-KY,ax,ay);
        for(var q=0;q<nf;q++){ if(rng()>it.lit) continue; var h=1.2+q*fh+fh*.5; ctx.strokeStyle=rng()<.25?'rgba(160,200,255,.95)':'rgba(255,214,120,.95)'; ctx.lineWidth=it.win===2?2.2:1.5; var off=rng()*3, dl=it.win===3?[7,2.6]:(it.win===2?[3.6,.35]:[1.9,1.55]); ctx.setLineDash(dl); ctx.lineDashOffset=off; ctx.beginPath(); ctx.moveTo(1.2,h); ctx.lineTo(L-1.2,h); ctx.stroke(); }
        ctx.setLineDash([]); ctx.restore(); }
    }
  } else if(lod===1){
    ctx.fillStyle='rgba(255,214,120,.9)';
    for(i=0;i<items.length;i++){ var b=items[i]; if(b.t!=='b'||!b.win||b.z<6) continue; if(b.cx<V.x0||b.cx>V.x1) continue; if(((b.seed*7)&3)!==0) continue; var q=pj(b.cx,b.cy+b.d/2,b.z*.5); ctx.fillRect(q[0]-1,q[1]-.6,2,1.2); }
  }
  /* фонари */
  var gs=Math.max(10,16/Math.max(.45,V.s)*.9);
  if(V.s>.3) for(i=0;i<GEN.lamps.length;i++){ var l=GEN.lamps[i]; if(l[0]<V.x0-gs||l[0]>V.x1+gs||l[1]<V.y0-gs||l[1]>V.y1+gs) continue; ctx.drawImage(glowSprite(),l[0]-gs,l[1]-5-gs,gs*2,gs*2); }
  else { /* издалека магистрали светятся линией */
    ctx.lineCap='round'; ctx.strokeStyle='rgba(255,205,120,.55)'; GEN.roads.forEach(function(r){ if(r.cls==='st') return; var bb=r.bb||(r.bb=bbox(r.pts)); if(!inView(V,bb[0],bb[1],bb[2],bb[3])) return; strokeLine(ctx,r.pts,Math.max(2,2.4/V.s),'rgba(255,205,120,.5)','round'); });
  }
  /* станции и сцены */
  var st=[[1620,600],[1290,676],[1130,1108],[330,380],[1395,726],[1632,1090]];
  st.forEach(function(p){ if(p[0]<V.x0-80||p[0]>V.x1+80||p[1]<V.y0-80||p[1]>V.y1+80) return; var g2=60; ctx.globalAlpha=.55; ctx.drawImage(glowSprite(),p[0]-g2,p[1]-g2,g2*2,g2*2); ctx.globalAlpha=1; });
}

/* ---- время суток: цвет умножения и уровень огней ---- */
var TINT=[[0,[84,100,166]],[5,[90,106,170]],[6,[168,150,178]],[7,[255,216,190]],[8.6,[255,244,232]],[10,[255,255,255]],[16,[255,255,255]],[17.6,[255,246,226]],[19,[255,200,156]],[20.2,[190,146,160]],[21.4,[112,118,176]],[22.5,[88,104,168]],[24,[84,100,166]]];
function tintAt(h){
  for(var i=1;i<TINT.length;i++){ if(h<=TINT[i][0]){ var a=TINT[i-1], b=TINT[i], t=(h-a[0])/(b[0]-a[0]); return [lerp(a[1][0],b[1][0],t),lerp(a[1][1],b[1][1],t),lerp(a[1][2],b[1][2],t)]; } }
  return TINT[TINT.length-1][1];
}
function nightLevel(h){
  if(h>=21) return 1; if(h>=18.4) return smooth((h-18.4)/2.6); if(h<=5.2) return 1; if(h<7.2) return 1-smooth((h-5.2)/2); return 0;
}
function mulColor(c,w){ return [c[0]*w[0]/255,c[1]*w[1]/255,c[2]*w[2]/255]; }

/* ---- камера и кэши ---- */
var APP={cv:null,ctx:null,W:0,H:0,dpr:1,view:{cx:1180,cy:800,s:.5},cache:null,lcache:null,gesture:false,lastMove:0,anim:null,minS:.2,maxS:5,pad:{l:0,r:0,t:0,b:0},fps:60,ft:0,slow:0,lastTs:0,pkey:'',t0:0,needLights:false};
var BGCOL='#A9C47A';

function fitMin(){ return Math.max(APP.W/2480,APP.H/1800)*1.02; }
function mkCache(){ return {cv:document.createElement('canvas'),valid:false,cx:0,cy:0,s:1,W:0,H:0,key:'',t:0}; }
function cacheNeeds(C,key,view){
  if(!C.valid||C.key!==key) return true;
  var q=view.s/C.s; if(q>1.5||q<.62) return true;
  var hw=APP.W/2/view.s, hh=APP.H/2/view.s, cw=C.W/2/C.s, ch=C.H/2/C.s;
  return (view.cx-hw<C.cx-cw-1)||(view.cx+hw>C.cx+cw+1)||(view.cy-hh<C.cy-ch-1)||(view.cy+hh>C.cy+ch+1);
}
function renderCache(C,fn,key){
  var t0=performance.now(), view=APP.view, mw=1.5, cdpr=Math.min(APP.dpr,1.5)*(APP.slow>0?.8:1);
  while(APP.W*mw*cdpr*APP.H*mw*cdpr>5.2e6&&cdpr>.5) cdpr*=.9;
  C.W=APP.W*mw; C.H=APP.H*mw; C.cx=view.cx; C.cy=view.cy; C.s=view.s; C.key=key; C.dpr=cdpr;
  var pw=Math.ceil(C.W*cdpr), ph=Math.ceil(C.H*cdpr); if(C.cv.width!==pw||C.cv.height!==ph){ C.cv.width=pw; C.cv.height=ph; }
  var g=C.cv.getContext('2d'); g.setTransform(1,0,0,1,0,0); g.clearRect(0,0,pw,ph);
  g.setTransform(cdpr*C.s,0,0,cdpr*C.s,cdpr*(C.W/2-C.cx*C.s),cdpr*(C.H/2-C.cy*C.s));
  var V=makeView(C.cx,C.cy,C.s,C.W,C.H); fn(g,V);
  C.valid=true; C.t=performance.now(); C.ms=C.t-t0;
  return C.ms;
}
function blitCache(C,ctx,alpha){
  var view=APP.view, q=view.s/C.s, sx=(C.cx-C.W/(2*C.s)-view.cx)*view.s+APP.W/2, sy=(C.cy-C.H/(2*C.s)-view.cy)*view.s+APP.H/2;
  if(alpha!=null) ctx.globalAlpha=alpha; ctx.drawImage(C.cv,sx,sy,C.W*q,C.H*q); if(alpha!=null) ctx.globalAlpha=1;
}

var BUILT=false;
function buildWorld(){
  if(BUILT) return; BUILT=true;
  var rng=mulberry32(20240317);
  genWaterRail(); genRoads(rng);
  genDistricts(rng);
  genLamps(rng); genStops(rng);
  GEN.items.sort(function(a,b){ return a.y-b.y; });
}
function genDistricts(rng){
  genOld(rng); genBiz(rng); genStat(rng); genUni(rng);
  genPark(rng); genMkt(rng); genHome(rng); genZar(rng); genPriv(rng); genInd(rng);
  genCountry(rng);
}
