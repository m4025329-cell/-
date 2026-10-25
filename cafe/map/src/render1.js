/* ===== Карта Тулы: рисование статичного слоя, часть 1 (земля, вода, дороги, рельсы) ===== */

var KX=.30, KY=.80;                        /* наклон «вида сверху»: подъём на z сдвигает точку на (−KX·z, −KY·z) */
function pj(x,y,z){ return [x-KX*z,y-KY*z]; }

function pathPoly(ctx,p,close){ ctx.moveTo(p[0][0],p[0][1]); for(var i=1;i<p.length;i++) ctx.lineTo(p[i][0],p[i][1]); if(close) ctx.closePath(); }
function pathLine(ctx,p){ ctx.beginPath(); ctx.moveTo(p[0][0],p[0][1]); for(var i=1;i<p.length;i++) ctx.lineTo(p[i][0],p[i][1]); }
function strokeLine(ctx,p,w,col,cap,dash){ if(p.length<2) return; ctx.lineWidth=w; ctx.strokeStyle=col; ctx.lineCap=cap||'round'; ctx.lineJoin='round'; if(dash) ctx.setLineDash(dash); pathLine(ctx,p); ctx.stroke(); if(dash) ctx.setLineDash([]); }
function inView(V,x0,y0,x1,y1){ return x1>=V.x0&&x0<=V.x1&&y1>=V.y0&&y0<=V.y1; }
function plBB(p){ return bbox(p); }

var GROUND_KEY={old:'cobble',biz:'pave',stat:'pave',uni:'lawn',park:'lawn',mkt:'gravel',home:'earth',zar:'earth',priv:'grass',ind:'gravel'};

var _wp={};
function warpedPoly(id,pi,poly){
  var k=id+pi; if(_wp[k]) return _wp[k];
  var out=[], n=poly.length;
  for(var i=0;i<n;i++){ var a=poly[i], b=poly[(i+1)%n], l=dist(a,b), m=Math.max(1,Math.ceil(l/14)); for(var j=0;j<m;j++){ var x=a[0]+(b[0]-a[0])*j/m, y=a[1]+(b[1]-a[1])*j/m; out.push(warpPt(x,y,.7)); } }
  return (_wp[k]=out);
}
function drawGround(ctx,V,P){
  ctx.fillStyle=P.grass; ctx.fillRect(V.x0,V.y0,V.x1-V.x0,V.y1-V.y0);
  /* районы: «городская земля» разного тона */
  DORDER.forEach(function(id){
    DPOLY[id].forEach(function(poly0,pi){
      var bb=bbox(poly0); if(!inView(V,bb[0],bb[1],bb[2],bb[3])) return; var poly=warpedPoly(id,pi,poly0);
      var k=GROUND_KEY[id], col=P[k]; if(id==='uni') col=cmix(P.earth,P.lawn,.55); if(id==='home') col=cmix(P.earth,P.grass,.4); if(id==='zar') col=cmix(P.earth,P.grass,.3); if(id==='priv') col=cmix(P.grass,P.earth,.3);
      ctx.fillStyle=col; ctx.beginPath(); pathPoly(ctx,poly,true); ctx.fill();
    });
  });
  /* дополнительные участки земли */
  GEN.land.forEach(function(l){
    var bb=l.bb||(l.bb=bbox(l.pts)); if(!inView(V,bb[0],bb[1],bb[2],bb[3])) return;
    var col=landColor(l,P); if(!col) return;
    ctx.fillStyle=col; ctx.beginPath(); pathPoly(ctx,l.pts,true); ctx.fill();
    if(l.edge){ ctx.lineWidth=l.edgeW||1; ctx.strokeStyle=l.edge; ctx.stroke(); }
    if(l.stripes) drawStripes(ctx,l,P,V);
  });
}
function landColor(l,P){
  switch(l.kind){
    case 'lawn': return P.lawn; case 'grass': return P.grass; case 'forest': return P.forest; case 'earth': return P.earth; case 'cobble': return P.cobble; case 'pave': return P.pave; case 'gravel': return P.gravel;
    case 'asph': return P.asph; case 'plaza': return l.col?cmix(l.col,'#F1F4F6',P.snow*.7):P.pave; case 'field': return P.field[l.f%4]; case 'garden': return cmix(cmix('#8A7B55','#7C9A4E',P.leaf),'#F0F3F5',P.snow*.9);
    case 'pitch': return cmix(cmix('#6F8E4C','#5FA04A',P.leaf),'#E8EEF1',P.snow*.85); case 'sand': return cmix('#E2CD97','#E2CD97',0); case 'yard': return cmix(P.gravel,P.earth,.4);
    case 'park': return cmix(P.lawn,'#85B25D',.35*P.leaf); case 'custom': return l.col;
  }
  return null;
}
function drawStripes(ctx,l,P,V){
  var bb=l.bb, n=Math.floor((bb[3]-bb[1])/5), col=shade(landColor(l,P),.93);
  ctx.save(); ctx.beginPath(); pathPoly(ctx,l.pts,true); ctx.clip();
  ctx.strokeStyle=col; ctx.lineWidth=1.1;
  var a=l.sa||0, c=Math.cos(a), s=Math.sin(a);
  for(var i=-40;i<n+40;i++){ var off=i*5; ctx.beginPath(); ctx.moveTo(bb[0]-60+off*-s, bb[1]+off*c); ctx.lineTo(bb[2]+60+off*-s, bb[1]+off*c+0); ctx.stroke(); }
  ctx.restore();
}

function drawWater(ctx,V,P,lod){
  [[UPA_POLY,UPA,upaWidth],[TUL_POLY,TULITSA,tulWidth]].forEach(function(w){
    var poly=w[0], line=w[1], wf=w[2];
    /* набережный парапет и берег */
    ctx.beginPath(); pathPoly(ctx,poly,true);
    ctx.lineWidth=6.5; ctx.strokeStyle=P.bank; ctx.lineJoin='round'; ctx.stroke();
    ctx.lineWidth=1.2; ctx.strokeStyle=shade(P.bank,.8); ctx.stroke();
    ctx.fillStyle=P.water; ctx.fill();
    /* глубокая середина и мелководье у берегов */
    for(var k=0;k<3;k++){
      var f=[.8,.55,.28][k], col=[P.waterL,P.water,P.waterD][k];
      ctx.beginPath(); var L=[],R=[],n=line.length,i;
      var up=[]; for(i=0;i<n;i++){ var a=line[Math.max(0,i-1)], b=line[Math.min(n-1,i+1)], dx=b[0]-a[0], dy=b[1]-a[1], l=Math.sqrt(dx*dx+dy*dy)||1, hw=wf(i,n)/2*f; L.push([line[i][0]-dy/l*hw,line[i][1]+dx/l*hw]); R.push([line[i][0]+dy/l*hw,line[i][1]-dx/l*hw]); }
      pathPoly(ctx,L.concat(R.reverse()),true); ctx.fillStyle=col; ctx.globalAlpha=k===0?0:(k===1?.55:.45); if(k===0){ ctx.globalAlpha=0; } ctx.fill(); ctx.globalAlpha=1;
    }
  });
}

var RCLS={hwy:{c:4.5,m:1},ave:{c:3.5,m:1},main:{c:2.6,m:1},st:{c:1.8,m:0},ln:{c:1.4,m:0}};
function drawRoads(ctx,V,P,lod,list){
  var roads=list||GEN.roads.concat(GEN.streets.map(function(s){ return {pts:s.pts,w:s.w,cls:s.cls}; }));
  var vis=roads.filter(function(r){ var bb=r.bb||(r.bb=bbox(r.pts)); return inView(V,bb[0]-10,bb[1]-10,bb[2]+10,bb[3]+10); });
  /* кромка (тротуар) */
  vis.forEach(function(r){ if(r.cls==='ln'&&lod<1) return; var c=RCLS[r.cls]; strokeLine(ctx,r.pts,r.w+c.c*2,P.walk,'butt'); });
  /* полотно */
  vis.forEach(function(r){ strokeLine(ctx,r.pts,r.w,(r.cls==='hwy'||r.cls==='ave')?P.asphD:P.asph,'butt'); });
  if(lod>=1){
    vis.forEach(function(r){
      var c=RCLS[r.cls];
      if(r.cls==='hwy'){ strokeLine(ctx,offsetPoly(r.pts,r.w/2-1.4),.6,'rgba(255,255,255,.75)','butt'); strokeLine(ctx,offsetPoly(r.pts,-(r.w/2-1.4)),.6,'rgba(255,255,255,.75)','butt'); strokeLine(ctx,r.pts,.7,'rgba(255,255,255,.8)','butt',[6,6]); }
      else if(r.cls==='ave'){ strokeLine(ctx,r.pts,.8,'rgba(255,240,170,.85)','butt'); strokeLine(ctx,offsetPoly(r.pts,r.w/4),.5,'rgba(255,255,255,.35)','butt',[5,6]); strokeLine(ctx,offsetPoly(r.pts,-r.w/4),.5,'rgba(255,255,255,.35)','butt',[5,6]); }
      else if(r.cls==='main'){ strokeLine(ctx,r.pts,.6,'rgba(255,255,255,.7)','butt',[5,6]); }
    });
  }
}

function drawBridges(ctx,V,P,lod){
  GEN.bridges.forEach(function(b){
    var bb=bbox(b.pts); if(!inView(V,bb[0]-20,bb[1]-20,bb[2]+20,bb[3]+20)) return;
    strokeLine(ctx,b.pts.map(function(p){ return [p[0]+3,p[1]+5]; }),b.w+3,'rgba(20,40,60,.28)','butt');
    strokeLine(ctx,b.pts,b.w+5,'#BDB6A7','butt');
    strokeLine(ctx,b.pts,b.w,P.asphD,'butt');
    strokeLine(ctx,b.pts,.7,'rgba(255,255,255,.8)','butt',[5,6]);
    strokeLine(ctx,offsetPoly(b.pts,b.w/2+1.4),1.1,'#8F8A80','butt');
    strokeLine(ctx,offsetPoly(b.pts,-(b.w/2+1.4)),1.1,'#8F8A80','butt');
  });
}

function drawRails(ctx,V,P,lod){
  var lines=[{pts:RAILS,w:12}].concat(GEN.rails);
  lines.forEach(function(r){
    var bb=r.bb||(r.bb=bbox(r.pts)); if(!inView(V,bb[0]-10,bb[1]-10,bb[2]+10,bb[3]+10)) return;
    var bal=r.w||12;
    strokeLine(ctx,r.pts,bal,cmix('#A59E8F','#E1E5E8',P.snow*.6),'butt');
    if(lod>=.7){
      strokeLine(ctx,r.pts,bal-3,'#76695A','butt',[1.1,2.1]);
      var a=offsetPoly(r.pts,1.7), b=offsetPoly(r.pts,-1.7);
      strokeLine(ctx,a,.8,'#4C5057','butt'); strokeLine(ctx,b,.8,'#4C5057','butt');
      strokeLine(ctx,a,.3,'#B9BEC4','butt'); strokeLine(ctx,b,.3,'#B9BEC4','butt');
    } else strokeLine(ctx,r.pts,2,'#4C5057','butt');
  });
}

function drawPaths(ctx,V,P,lod){
  GEN.paths.forEach(function(r){
    var bb=r.bb||(r.bb=bbox(r.pts)); if(!inView(V,bb[0]-6,bb[1]-6,bb[2]+6,bb[3]+6)) return;
    strokeLine(ctx,r.pts,r.w,cmix(r.col||'#DCD2B6','#F1F4F6',P.snow*.7),'round');
  });
}
