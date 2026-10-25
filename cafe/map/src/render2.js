/* ===== Карта Тулы: рисование статичного слоя, часть 2 (здания, деревья, мелкие предметы) ===== */

var LGT=(function(){ var v=[-.5,.35,.8], l=Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]); return [v[0]/l,v[1]/l,v[2]/l]; })();
function shadeK(n){ var d=n[0]*LGT[0]+n[1]*LGT[1]+n[2]*LGT[2]; return .54+.46*Math.max(0,d); }
var SHX=.55, SHY=-.43;                     /* тень от высоты z уходит на северо-восток */

/* грань: точки в 3D, нормаль наружу относительно центра тела */
function mkFace(p3,c3,kind){
  var nx=0,ny=0,nz=0,i;
  for(i=0;i<p3.length;i++){ var a=p3[i], b=p3[(i+1)%p3.length]; nx+=(a[1]-b[1])*(a[2]+b[2]); ny+=(a[2]-b[2])*(a[0]+b[0]); nz+=(a[0]-b[0])*(a[1]+b[1]); }
  var l=Math.sqrt(nx*nx+ny*ny+nz*nz)||1; nx/=l; ny/=l; nz/=l;
  var mx=0,my=0,mz=0; for(i=0;i<p3.length;i++){ mx+=p3[i][0]; my+=p3[i][1]; mz+=p3[i][2]; } mx/=p3.length; my/=p3.length; mz/=p3.length;
  if(nx*(mx-c3[0])+ny*(my-c3[1])+nz*(mz-c3[2])<0){ nx=-nx; ny=-ny; nz=-nz; }
  if(nx*KX+ny*KY+nz<=.001) return null;                    /* не видна */
  var pts=[]; for(i=0;i<p3.length;i++){ var q=pj(p3[i][0],p3[i][1],p3[i][2]); pts.push(q[0],q[1]); }
  return {p:pts,k:shadeK([nx,ny,nz]),kind:kind,nz:nz};
}
function boxFaces(it){
  if(it.faces) return it.faces;
  var P4=it.pts, z=it.z, c3=[it.cx,it.cy,z/2], F=[], i;
  var pg=[]; /* для crown-а: базовый контур */
  if(it.rt===1||it.rt===2){
    var rh=it.rh||Math.max(2.5,Math.min(it.w,it.d)*.45), u=it.w>=it.d, p=P4;
    var m03=[(p[0][0]+p[3][0])/2,(p[0][1]+p[3][1])/2], m12=[(p[1][0]+p[2][0])/2,(p[1][1]+p[2][1])/2], m01=[(p[0][0]+p[1][0])/2,(p[0][1]+p[1][1])/2], m23=[(p[2][0]+p[3][0])/2,(p[2][1]+p[3][1])/2];
    var r0=u?m03:m01, r1=u?m12:m23, zt=z+rh, cc=[it.cx,it.cy,z+rh/3];
    for(i=0;i<4;i++){ var a=P4[i], b=P4[(i+1)%4]; var f=mkFace([[a[0],a[1],0],[b[0],b[1],0],[b[0],b[1],z],[a[0],a[1],z]],c3,'wall'); if(f){ f.a=a; f.b=b; f.z=z; F.push(f); } }
    var A=[p[0],p[1],p[2],p[3]];
    var rg0=[r0[0],r0[1],zt], rg1=[r1[0],r1[1],zt], e=function(q){ return [q[0],q[1],z]; };
    if(u){
      F.push(mkFace([e(p[0]),e(p[1]),rg1,rg0],cc,'roof'), mkFace([e(p[3]),e(p[2]),rg1,rg0],cc,'roof'), mkFace([e(p[0]),e(p[3]),rg0],cc,'gable'), mkFace([e(p[1]),e(p[2]),rg1],cc,'gable'));
    } else {
      F.push(mkFace([e(p[0]),e(p[3]),rg1,rg0],cc,'roof'), mkFace([e(p[1]),e(p[2]),rg1,rg0],cc,'roof'), mkFace([e(p[0]),e(p[1]),rg0],cc,'gable'), mkFace([e(p[3]),e(p[2]),rg1],cc,'gable'));
    }
  } else {
    for(i=0;i<4;i++){ var a2=P4[i], b2=P4[(i+1)%4]; var f2=mkFace([[a2[0],a2[1],0],[b2[0],b2[1],0],[b2[0],b2[1],z],[a2[0],a2[1],z]],c3,'wall'); if(f2){ f2.a=a2; f2.b=b2; f2.z=z; F.push(f2); } }
    F.push(mkFace(P4.map(function(q){ return [q[0],q[1],z]; }),c3,'roof'));
  }
  it.faces=F.filter(Boolean);
  return it.faces;
}
function shadowPoly(it){
  if(it.sh) return it.sh;
  var z=it.z+(it.rh||0)*.6, dx=SHX*z, dy=SHY*z, pts=[], i;
  if(it.t==='b'){ for(i=0;i<4;i++){ pts.push(it.pts[i],[it.pts[i][0]+dx,it.pts[i][1]+dy]); } }
  return (it.sh=hull(pts));
}

function drawShadows(ctx,V,P,items,lod){
  ctx.fillStyle='rgba(38,32,58,'+(.2-.06*P.snow)+')'; ctx.beginPath(); var n=0;
  for(var i=0;i<items.length;i++){
    var it=items[i];
    if(it.t==='b'){ if(it.z<=3) continue; var s=shadowPoly(it); ctx.moveTo(s[0][0],s[0][1]); for(var k=1;k<s.length;k++) ctx.lineTo(s[k][0],s[k][1]); ctx.closePath(); n++; }
    else if(it.t==='y'){ var q=it.z*.55; ctx.moveTo(it.cx+it.r*1.1+q,it.cy-it.z*.43); ctx.arc(it.cx+q,it.cy-it.z*.43,it.r*1.1,0,6.2832); ctx.moveTo(it.cx,it.cy); ctx.lineTo(it.cx+q,it.cy-it.z*.43); ctx.lineTo(it.cx+q+it.r,it.cy-it.z*.43); ctx.lineTo(it.cx+it.r,it.cy); ctx.closePath(); n++; }
    if(n>=300){ ctx.fill(); ctx.beginPath(); n=0; }
  }
  ctx.fill();
  if(lod>=2||(lod===1&&V.s>.4)){
    /* тени деревьев: кружки одного цвета, пачками */
    ctx.beginPath(); n=0; var cut=lod>=2?0:4.6;
    for(i=0;i<items.length;i++){ it=items[i]; if(it.t!=='tr'||it.r<cut) continue; var r=it.r*.92, h=it.r*1.45; ctx.moveTo(it.x+h*.38+r,it.y-h*.3); ctx.arc(it.x+h*.38,it.y-h*.3,r,0,6.2832); if(++n>=500){ ctx.fill(); ctx.beginPath(); n=0; } }
    ctx.fill();
  }
}

var _fc={};
function fcol(base,k,snow){ var key=base+'|'+Math.round(k*30)+'|'+Math.round(snow*20); return _fc[key]||(_fc[key]=shade(snow>0?mix(base,'#F4F7FA',snow):base,k)); }
function polyF(ctx,p){ ctx.beginPath(); ctx.moveTo(p[0],p[1]); for(var i=2;i<p.length;i+=2) ctx.lineTo(p[i],p[i+1]); ctx.closePath(); }

function drawBox(ctx,it,P,lod,V){
  var F=boxFaces(it), sn=P.snow, i, f;
  for(i=0;i<F.length;i++){
    f=F[i]; var base=f.kind==='wall'?it.wc:(f.kind==='gable'?it.wc:it.rc);
    var snow=f.kind==='roof'?(it.rt===1||it.rt===2?sn*.82:sn*.88)*(it.sn!==undefined?1:1):(f.kind==='gable'?sn*.05:sn*.12);
    if(it.rt===3&&f.kind==='roof') snow=sn*.75;
    ctx.fillStyle=fcol(base,f.k,snow); polyF(ctx,f.p); ctx.fill();
    if(lod>=2&&f.kind==='roof'&&(it.rt===0||it.rt===3)){ ctx.lineWidth=.55; ctx.strokeStyle=fcol(base,Math.min(1.1,f.k+.12),snow); ctx.stroke(); }
    if(lod>=2&&f.kind==='wall'){ ctx.lineWidth=.4; ctx.strokeStyle='rgba(30,20,10,.18)'; ctx.stroke(); }
  }
  if(lod>=2){
    for(i=0;i<F.length;i++){ f=F[i]; if(f.kind==='wall'&&it.win&&it.z>4.5) drawWindows(ctx,it,f,P,lod); }
    if(it.rt===3&&lod>=2) drawSaw(ctx,it,P);
    if(lod>=3&&it.rt===0&&it.z>8&&it.w>14&&!it.crenel) drawRoofUnits(ctx,it);
  }
  if(it.crenel&&lod>=1){ var rp=it.pts.map(function(q){ return pj(q[0],q[1],it.z); }); strokeLine(ctx,rp.concat([rp[0]]),1.6,'#D9A58C','butt',[1.8,1.5]); }
}
function drawWindows(ctx,it,f,P,lod){
  var ax=f.a[0], ay=f.a[1], dx=f.b[0]-ax, dy=f.b[1]-ay, L=Math.sqrt(dx*dx+dy*dy); if(L<6) return;
  var ex=dx/L, ey=dy/L, z=f.z, nf, fh;
  var glass=it.win===2, ind=it.win===3;
  fh=glass?3.4:(ind?6:3.1); nf=Math.max(1,Math.floor((z-1.4)/fh)); if(ind) nf=1;
  var col=glass?'rgba(30,60,86,.55)':(ind?'rgba(40,52,64,.55)':'rgba(46,62,84,.62)');
  /* склон светлой стороны даёт блик */
  ctx.save(); ctx.transform(ex,ey,-KX,-KY,ax,ay);
  ctx.strokeStyle=col; ctx.lineCap='butt';
  var wh=glass?2.2:(ind?2.6:1.5), dash=glass?[3.6,.35]:(ind?[7,2.6]:[1.9,1.55]);
  ctx.setLineDash(dash); ctx.lineWidth=wh;
  for(var k=0;k<nf;k++){ var h=1.2+k*fh+fh*.5; ctx.beginPath(); ctx.moveTo(1.2,h); ctx.lineTo(L-1.2,h); ctx.stroke(); }
  ctx.setLineDash([]); ctx.restore();
}
function drawSaw(ctx,it,P){
  /* пилообразная крыша цеха: полосы вдоль длинной стороны */
  var p=it.pts.map(function(q){ return pj(q[0],q[1],it.z); }), n=Math.max(2,Math.round(Math.max(it.w,it.d)/9));
  ctx.strokeStyle='rgba(60,60,70,.35)'; ctx.lineWidth=.55;
  for(var i=1;i<n;i++){ var t=i/n; var long=it.w>=it.d; var a=long?[p[0][0]+(p[1][0]-p[0][0])*t,p[0][1]+(p[1][1]-p[0][1])*t]:[p[0][0]+(p[3][0]-p[0][0])*t,p[0][1]+(p[3][1]-p[0][1])*t], b=long?[p[3][0]+(p[2][0]-p[3][0])*t,p[3][1]+(p[2][1]-p[3][1])*t]:[p[1][0]+(p[2][0]-p[1][0])*t,p[1][1]+(p[2][1]-p[1][1])*t]; ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]); ctx.stroke(); }
}
function drawRoofUnits(ctx,it){
  var r=mulberry32(it.seed), n=Math.floor(it.w*it.d/160)+1;
  for(var i=0;i<Math.min(5,n);i++){
    var s=.2+r()*.6, t=.2+r()*.6, p=it.pts, x=p[0][0]*(1-s)*(1-t)+p[1][0]*s*(1-t)+p[2][0]*s*t+p[3][0]*(1-s)*t, y=p[0][1]*(1-s)*(1-t)+p[1][1]*s*(1-t)+p[2][1]*s*t+p[3][1]*(1-s)*t, q=pj(x,y,it.z);
    ctx.fillStyle='rgba(60,60,66,.55)'; ctx.fillRect(q[0]-1.4,q[1]-1,2.8,1.8); ctx.fillStyle='rgba(235,235,230,.7)'; ctx.fillRect(q[0]-1.4,q[1]-1.5,2.8,.7);
  }
}

/* цилиндры: башни, трубы, баки, купола */
function drawCyl(ctx,it,P,lod){
  var r=it.r, z=it.z, x=it.cx, y=it.cy, tx=x-KX*z, ty=y-KY*z, col=it.col;
  var nxv=-(ty-y), nyv=(tx-x), nl=Math.sqrt(nxv*nxv+nyv*nyv)||1; nxv/=nl; nyv/=nl;
  var g=ctx.createLinearGradient(x-r,y,x+r,y);
  g.addColorStop(0,shade(col,1.04)); g.addColorStop(.55,shade(col,.88)); g.addColorStop(1,shade(col,.66));
  ctx.fillStyle=g;
  ctx.beginPath(); ctx.moveTo(x-r,y); ctx.lineTo(tx-r,ty); ctx.arc(tx,ty,r,Math.PI,0,false); ctx.lineTo(x+r,y); ctx.arc(x,y,r,0,Math.PI,false); ctx.closePath(); ctx.fill();
  ctx.fillStyle=shade(col,1.04); ctx.beginPath(); ctx.arc(tx,ty,r,0,6.2832); ctx.fill();
  if(it.top==='cone'){
    var h=it.hh||r*2.2, ax=tx-KX*h, ay=ty-KY*h;
    var gg=ctx.createLinearGradient(tx-r,ty,tx+r,ty); gg.addColorStop(0,shade(it.tc,1.05)); gg.addColorStop(1,shade(it.tc,.68));
    ctx.fillStyle=gg; ctx.beginPath(); ctx.moveTo(tx-r*1.08,ty); ctx.lineTo(ax,ay); ctx.lineTo(tx+r*1.08,ty); ctx.closePath(); ctx.fill();
  } else if(it.top==='onion'||it.top==='dome'){
    var hh=it.hh||r*1.5, cx2=tx-KX*hh*.45, cy2=ty-KY*hh*.45;
    var gd=ctx.createRadialGradient(cx2-r*.25,cy2-r*.2,r*.1,cx2,cy2,r*1.2); gd.addColorStop(0,shade(it.tc,1.25)); gd.addColorStop(.6,it.tc); gd.addColorStop(1,shade(it.tc,.65));
    ctx.fillStyle=gd; ctx.beginPath();
    if(it.top==='onion'){ ctx.moveTo(tx-r*1.05,ty); ctx.bezierCurveTo(tx-r*1.3,ty-hh*.5,tx-r*.3,ty-hh*.8,tx-KX*hh,ty-KY*hh-r*.2); ctx.bezierCurveTo(tx+r*.3,ty-hh*.8,tx+r*1.3,ty-hh*.5,tx+r*1.05,ty); ctx.closePath(); }
    else { ctx.ellipse(tx,ty-r*.1,r*1.02,hh*.75,0,Math.PI,0); ctx.closePath(); }
    ctx.fill();
    if(lod>=2){ ctx.strokeStyle='#E6D07A'; ctx.lineWidth=.55; var tipx=tx-KX*hh, tipy=ty-KY*hh-r*.2; ctx.beginPath(); ctx.moveTo(tipx,tipy); ctx.lineTo(tipx,tipy-r*.9); ctx.moveTo(tipx-r*.28,tipy-r*.5); ctx.lineTo(tipx+r*.28,tipy-r*.5); ctx.stroke(); }
  }
  if(lod>=2&&it.gl){ ctx.strokeStyle='rgba(40,50,60,.5)'; ctx.lineWidth=.6; ctx.beginPath(); ctx.arc(tx,ty,r*.62,0,6.2832); ctx.stroke(); }
}

function drawTree(ctx,it,P,lod){
  var r=it.r, z=r*1.1+1.5, cx=it.x-KX*z, cy=it.y-KY*z;
  if(lod===0){ ctx.fillStyle=it.k===1?P.spruce:P.crown[it.s&3]; ctx.beginPath(); ctx.arc(cx,cy,r*.9,0,6.2832); ctx.fill(); return; }
  var leaf=P.leaf, bare=leaf<.22&&it.k!==1;
  if(it.k===1){ /* ель */
    var h=r*3.0, w=r*.85;
    ctx.fillStyle=P.trunk; if(lod>=2) ctx.fillRect(it.x-.5,it.y-2,1,2.5);
    for(var i=0;i<3;i++){ var by=it.y-2-i*r*.62, tw=w*(1-i*.24), ty2=by-r*1.15; ctx.fillStyle=shade(P.spruce,.86+i*.08); ctx.beginPath(); ctx.moveTo(it.x-tw,by); ctx.lineTo(it.x-KX*r*.5-KX*r*i*.3,ty2-KY*r*.4); ctx.lineTo(it.x+tw,by); ctx.closePath(); ctx.fill(); if(P.snow>.2){ ctx.fillStyle='rgba(245,248,250,'+(P.snow*.6)+')'; ctx.beginPath(); ctx.moveTo(it.x-tw*.45,by-r*.5); ctx.lineTo(it.x-KX*r*.5-KX*r*i*.3,ty2-KY*r*.4); ctx.lineTo(it.x+tw*.45,by-r*.5); ctx.closePath(); ctx.fill(); } }
    return;
  }
  if(it.k===2){ /* тополь */
    ctx.fillStyle=P.crown[it.s&3]; ctx.beginPath(); ctx.ellipse(it.x-KX*r*1.2,it.y-r*1.9,r*.52,r*1.5,0,0,6.2832); ctx.fill(); if(lod>=2){ ctx.fillStyle=P.crownH[it.s&3]; ctx.globalAlpha=.55; ctx.beginPath(); ctx.ellipse(it.x-KX*r*1.2-r*.15,it.y-r*2.1,r*.25,r*1.0,0,0,6.2832); ctx.fill(); ctx.globalAlpha=1; } return;
  }
  var c0=P.crown[it.s&3], c1=P.crownH[it.s&3];
  if(it.k===3){ c0=cmix(c0,'#B7C86A',.35); c1=cmix(c1,'#E8F0A0',.2); }
  if(lod>=2){ ctx.strokeStyle=P.trunk; ctx.lineWidth=Math.max(.7,r*.2); ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(it.x,it.y); ctx.lineTo(cx,cy+r*.3); ctx.stroke(); }
  if(bare){
    ctx.strokeStyle=P.trunk; ctx.lineWidth=.7; ctx.beginPath(); var rn=mulberry32(it.s*977+3);
    for(var b=0;b<7;b++){ var a=rn()*6.28, l=r*(.7+rn()*.5); ctx.moveTo(cx,cy+r*.2); ctx.lineTo(cx+Math.cos(a)*l,cy+Math.sin(a)*l*.9-r*.2); }
    ctx.stroke(); if(P.snow>.3){ ctx.fillStyle='rgba(245,248,250,'+P.snow*.5+')'; ctx.beginPath(); ctx.arc(cx,cy-r*.1,r*.6,0,6.28); ctx.fill(); }
    return;
  }
  var rad=r*(.55+.45*Math.max(leaf,.35));
  ctx.fillStyle=shade(c0,.82); ctx.beginPath(); ctx.arc(cx+r*.1,cy+r*.12,rad,0,6.2832); ctx.fill();
  ctx.fillStyle=c0; ctx.beginPath(); ctx.arc(cx-r*.06,cy-r*.05,rad*.92,0,6.2832); ctx.fill();
  if(lod>=2){ ctx.fillStyle=c1; ctx.globalAlpha=.8; ctx.beginPath(); ctx.arc(cx-rad*.3,cy-rad*.32,rad*.5,0,6.2832); ctx.fill(); ctx.globalAlpha=1; }
  if(P.bloom>.2&&(it.s&1)){ ctx.fillStyle='rgba(255,236,240,'+(.6*P.bloom)+')'; for(var d=0;d<4;d++){ ctx.beginPath(); ctx.arc(cx+Math.cos(d*1.6+it.s)*rad*.45,cy+Math.sin(d*1.6+it.s)*rad*.4,rad*.28,0,6.28); ctx.fill(); } }
  if(P.snow>.3){ ctx.fillStyle='rgba(245,248,250,'+P.snow*.45+')'; ctx.beginPath(); ctx.arc(cx-rad*.15,cy-rad*.25,rad*.55,0,6.28); ctx.fill(); }
}

function drawCar(ctx,it,P){
  ctx.save(); ctx.translate(it.x,it.y); ctx.rotate(it.a);
  ctx.fillStyle='rgba(30,30,40,.28)'; ctx.fillRect(-2.6,-1.4+.9,5.4,2.9);
  ctx.fillStyle=it.col; ctx.fillRect(-2.7,-1.45,5.4,2.9);
  ctx.fillStyle=shade(it.col,.7); ctx.fillRect(-1.2,-1.1,2.3,2.2);
  ctx.fillStyle='rgba(30,50,70,.75)'; ctx.fillRect(-1.1,-1,.8,2); ctx.fillRect(.5,-1,.6,2);
  ctx.restore();
}
function drawStall(ctx,it,P){
  ctx.save(); ctx.translate(it.x,it.y); ctx.rotate(it.a);
  var w=it.w, d=it.d, z=3.2;
  ctx.fillStyle='rgba(30,30,40,.25)'; ctx.fillRect(-w/2+1.5,-d/2-.8,w,d);
  /* столбы и прилавок */
  ctx.fillStyle='#7A5C3E'; ctx.fillRect(-w/2,-d/2+d*.35,w,d*.5);
  /* полосатый тент, приподнятый */
  var n=Math.max(2,Math.round(w/1.8)), cw=w/n, oy=-KY*z, ox=-KX*z;
  for(var i=0;i<n;i++){ ctx.fillStyle=(i&1)?it.col:'#F4EEDD'; ctx.fillRect(-w/2+i*cw+ox,-d/2+oy,cw+.05,d); }
  ctx.fillStyle='rgba(0,0,0,.12)'; ctx.fillRect(-w/2+ox,d/2+oy-.7,w,.7);
  ctx.restore();
}

function drawProp(ctx,it,P,lod){
  switch(it.k){
    case 'fountain': {
      ctx.fillStyle='#BDB5A4'; ctx.beginPath(); ctx.arc(it.x,it.y,it.r,0,6.28); ctx.fill();
      ctx.fillStyle=P.waterL; ctx.beginPath(); ctx.arc(it.x,it.y,it.r*.82,0,6.28); ctx.fill();
      ctx.fillStyle='#E7F1F6'; ctx.beginPath(); ctx.arc(it.x-1,it.y-3,it.r*.28,0,6.28); ctx.fill();
      if(lod>=2){ ctx.strokeStyle='rgba(255,255,255,.8)'; ctx.lineWidth=.6; ctx.beginPath(); ctx.arc(it.x,it.y,it.r*.5,0,6.28); ctx.stroke(); }
      break; }
    case 'bench': ctx.fillStyle='#7A5C3E'; ctx.save(); ctx.translate(it.x,it.y); ctx.rotate(it.a||0); ctx.fillRect(-1.6,-.5,3.2,1); ctx.restore(); break;
    case 'statue': ctx.fillStyle='#8E8A80'; ctx.fillRect(it.x-1.2,it.y-1,2.4,2); ctx.fillStyle='#4B4A47'; ctx.fillRect(it.x-.6,it.y-5,1.2,4.2); break;
    case 'bush': ctx.fillStyle=cmix('#5E7A44','#6C8E4F',P.leaf); ctx.beginPath(); ctx.arc(it.x,it.y,it.r||1.8,0,6.28); ctx.fill(); break;
    case 'flower': ctx.fillStyle=it.col||'#E86A8A'; ctx.beginPath(); ctx.arc(it.x,it.y,.9,0,6.28); ctx.fill(); break;
    case 'bus': ctx.fillStyle='#D1361A'; ctx.fillRect(it.x-3,it.y-1,6,2); ctx.fillStyle='#F2E8D2'; ctx.fillRect(it.x-3,it.y-1,6,.7); break;
    case 'play': { /* детская площадка */
      ctx.fillStyle=it.col||'#D8B27A'; ctx.beginPath(); ctx.rect(it.x-it.r,it.y-it.r*.7,it.r*2,it.r*1.4); ctx.fill();
      ctx.fillStyle='#D1361A'; ctx.fillRect(it.x-it.r*.5,it.y-1.5,2,1.5); ctx.fillStyle='#2F7FD3'; ctx.fillRect(it.x+it.r*.2,it.y-1,1.6,2.2); ctx.fillStyle='#E2B53C'; ctx.beginPath(); ctx.arc(it.x-it.r*.1,it.y+1.5,1.2,0,6.28); ctx.fill();
      break; }
    case 'tent': ctx.fillStyle=it.col||'#F2E8D2'; ctx.beginPath(); ctx.moveTo(it.x-3,it.y); ctx.lineTo(it.x,it.y-4); ctx.lineTo(it.x+3,it.y); ctx.closePath(); ctx.fill(); break;
    case 'gate': ctx.fillStyle='#8E4A36'; ctx.fillRect(it.x-4,it.y-1,8,2); break;
    case 'stack': { ctx.fillStyle=it.col||'#C9A66B'; ctx.fillRect(it.x-it.r,it.y-it.r*.5,it.r*2,it.r); ctx.strokeStyle='rgba(0,0,0,.25)'; ctx.lineWidth=.4; ctx.strokeRect(it.x-it.r,it.y-it.r*.5,it.r*2,it.r); break; }
  }
}

/* общий проход по предметам, отсортированным по y */
function itemRange(items,y0,y1){
  var lo=0, hi=items.length;
  while(lo<hi){ var m=(lo+hi)>>1; if(items[m].y<y0) lo=m+1; else hi=m; }
  var s=lo; hi=items.length;
  while(lo<hi){ var m2=(lo+hi)>>1; if(items[m2].y<y1) lo=m2+1; else hi=m2; }
  return items.slice(s,lo);
}
function drawItems(ctx,V,P,lod,items){
  for(var i=0;i<items.length;i++){
    var it=items[i], x=it.x!=null?it.x:it.cx;
    if(x<V.x0-70||x>V.x1+70) continue;
    switch(it.t){
      case 'b': drawBox(ctx,it,P,lod,V); break;
      case 'tr': if(lod===0&&(i&1)&&it.r<6) break; drawTree(ctx,it,P,lod); break;
      case 'y': drawCyl(ctx,it,P,lod); break;
      case 'car': if(lod>=2||(lod===1&&(i&1))) drawCar(ctx,it,P); break;
      case 'stall': if(lod>=1) drawStall(ctx,it,P); break;
      case 'm': if(lod>=1||it.k==='fountain') drawProp(ctx,it,P,lod); break;
    }
  }
}
