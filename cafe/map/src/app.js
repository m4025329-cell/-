/* ===== Карта Тулы: камера, цикл кадров, оверлеи и подписи ===== */

var DW={};   /* сглаженные многоугольники районов для оверлеев */
function distWarped(id){ if(DW[id]) return DW[id]; DW[id]=DPOLY[id].map(function(p,i){ return warpedPoly(id,i,p); }); return DW[id]; }
var DLAB={ old:[1130,596], biz:[1458,800], stat:[1770,600], uni:[820,830], park:[1200,1200], mkt:[1610,1240], home:[1900,1250], zar:[520,1320], priv:[330,860], ind:[330,300] };
var DANCH={ old:[1250,720], biz:[1458,730], stat:[1700,620], uni:[820,760], park:[1200,1110], mkt:[1610,1120], home:[1900,1200], zar:[520,1280], priv:[330,860], ind:[330,380] };

/* ---- координаты ---- */
function w2s(x,y){ var v=APP.view; return [(x-v.cx)*v.s+APP.W/2,(y-v.cy)*v.s+APP.H/2]; }
function s2w(x,y){ var v=APP.view; return [(x-APP.W/2)/v.s+v.cx,(y-APP.H/2)/v.s+v.cy]; }
function clampView(v){
  var minS=fitMin(); v.s=clamp(v.s,minS,APP.maxS);
  var hw=APP.W/2/v.s, hh=APP.H/2/v.s, px=(APP.pad.l-APP.pad.r)/2/v.s, py=(APP.pad.t-APP.pad.b)/2/v.s;
  var minx=-90+hw-px, maxx=2490-hw-px, miny=-90+hh-py, maxy=1790-hh-py;
  v.cx=minx>maxx?1200:clamp(v.cx,minx,maxx); v.cy=miny>maxy?850:clamp(v.cy,miny,maxy);
}
function flyTo(cx,cy,s,ms){
  var v=APP.view, a={cx:v.cx,cy:v.cy,s:v.s}, b={cx:cx,cy:cy,s:s}; clampView(b);
  if(ST.reduce||!ms){ v.cx=b.cx; v.cy=b.cy; v.s=b.s; return; }
  APP.anim={t0:performance.now(),ms:ms,a:a,b:b};
}
/* вписать прямоугольник в свободную часть экрана (между панелями) */
function fitRect(x0,y0,x1,y1,ms){
  var fw=APP.W-APP.pad.l-APP.pad.r, fh=APP.H-APP.pad.t-APP.pad.b, s=Math.min(fw/(x1-x0),fh/(y1-y0))*.88;
  s=clamp(s,.4,2.2); var cx=(x0+x1)/2, cy=(y0+y1)/2;
  /* смещаем центр так, чтобы объект попал в середину свободной области */
  var ox=((APP.pad.l-APP.pad.r)/2)/s, oy=((APP.pad.t-APP.pad.b)/2)/s;
  flyTo(cx-ox,cy-oy,s,ms==null?900:ms);
}

/* ---- Основной кадр ---- */
function pkey(){ return ST.cal+'|'+(APP.slow>0?1:0); }
function frame(ts){
  var dt=Math.min(.1,APP.lastTs?(ts-APP.lastTs)/1000:.016); APP.lastTs=ts;
  /* авто-качество: если кадры тяжёлые, уменьшаем число людей */
  APP.ft=APP.ft*.94+dt*1000*.06; if(APP.ft>26&&ST.quality>.45) ST.quality-=.002; else if(APP.ft<19&&ST.quality<1) ST.quality+=.0008;
  /* время */
  if(ST.play&&!ST.reduce&&!APP.dragTime){ ST.hour+=dt*.28*ST.speed; if(ST.hour>=24) ST.hour-=24; if(APP.onTime&&((ts-APP.lastTimeUI)>200||!APP.lastTimeUI)){ APP.lastTimeUI=ts; APP.onTime(); } }
  /* анимация камеры */
  if(APP.anim){ var a=APP.anim, t=clamp((ts-a.t0)/a.ms,0,1), k=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2, v=APP.view; v.cx=lerp(a.a.cx,a.b.cx,k); v.cy=lerp(a.a.cy,a.b.cy,k); v.s=a.a.s*Math.pow(a.b.s/a.a.s,k); if(t>=1) APP.anim=null; APP.moved=ts; }
  if(APP.vel&&(Math.abs(APP.vel[0])>.5||Math.abs(APP.vel[1])>.5)&&!APP.gesture){ var vv=APP.view; vv.cx-=APP.vel[0]*dt/vv.s; vv.cy-=APP.vel[1]*dt/vv.s; APP.vel[0]*=.92; APP.vel[1]*=.92; clampView(vv); APP.moved=ts; }
  lifeStep(dt*ST.speed);
  draw(ts);
  requestAnimationFrame(frame);
}

function draw(ts){
  var ctx=APP.ctx, W=APP.W, H=APP.H, view=APP.view, dpr=APP.dpr;
  var key=pkey(), P=palette(seasonAt(ST.cal),'light');
  /* статичный кэш */
  var C=APP.cache, moving=APP.gesture||APP.anim||(APP.vel&&(Math.abs(APP.vel[0])>1||Math.abs(APP.vel[1])>1));
  if(cacheNeeds(C,key,view)){
    var must=!C.valid||C.key!==key||!covers(C,view);
    if(must||!moving||(ts-C.t>260)){ renderCache(C,function(g,V){ g.fillStyle=P.grass; g.fillRect(V.x0,V.y0,V.x1-V.x0,V.y1-V.y0); renderStatic(g,V,P); },key); if(C.ms>45) APP.slow=Math.min(3,APP.slow+1); APP.lastStatic=ts; }
  }
  var night=nightLevel(ST.hour);
  if(night>.03){ var LC=APP.lcache; if(cacheNeeds(LC,'L',view)){ var must2=!LC.valid||!covers(LC,view); if(must2||!moving||(ts-LC.t>400)) renderCache(LC,function(g,V){ renderLights(g,V); },'L'); } }
  /* фон и карта */
  ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle=P.grass; ctx.fillRect(0,0,APP.cv.width,APP.cv.height);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  if(C.valid) blitCache(C,ctx);
  /* мир: объекты жизни */
  var V=makeView(view.cx,view.cy,view.s,W,H);
  ctx.setTransform(dpr*view.s,0,0,dpr*view.s,dpr*(W/2-view.cx*view.s),dpr*(H/2-view.cy*view.s));
  var wx=ST._wx||'clear';
  drawGlints(ctx,V,P);
  drawBoatsDucks(ctx,V,P);
  drawWheel(ctx,V,night);
  drawSeasonDecor(ctx,V,night);
  drawCloudShadowsMaybe(ctx,V,P,wx);
  drawDistrictLayer(ctx,V,ts);
  drawTrains(ctx,V,night); drawCars(ctx,V,night); drawBuses(ctx,V,night); drawPeds(ctx,V); drawSmoke(ctx,V); drawBirds(ctx,V);
  drawAdsLayer(ctx,V,ts);
  /* свет суток */
  ctx.setTransform(dpr,0,0,dpr,0,0);
  var tint=mulColor(tintAt(ST.hour),wxTint(wx));
  if(tint[0]<253||tint[1]<253||tint[2]<253){ ctx.globalCompositeOperation='multiply'; ctx.fillStyle='rgb('+Math.round(tint[0])+','+Math.round(tint[1])+','+Math.round(tint[2])+')'; ctx.fillRect(0,0,W,H); ctx.globalCompositeOperation='source-over'; }
  if(night>.03&&APP.lcache.valid){ ctx.globalCompositeOperation='lighter'; blitCache(APP.lcache,ctx,Math.min(1,night*(wx==='fog'?.7:1))); ctx.globalCompositeOperation='source-over'; }
  /* облака и погода */
  ctx.setTransform(dpr*view.s,0,0,dpr*view.s,dpr*(W/2-view.cx*view.s),dpr*(H/2-view.cy*view.s));
  var cl=wx==='clear'?.34:(wx==='cloudy'?.9:(wx==='fog'?.35:1)); if(view.s<1.6) drawCloudTops(ctx,V,P,cl);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  drawWeather(ctx,W,H,wx,night);
  drawFocusDim(ctx,ts);
  /* подписи и значки в экранных координатах */
  drawLabels(ctx,ts);
  drawPins(ctx,ts);
}
function covers(C,view){
  var hw=APP.W/2/view.s, hh=APP.H/2/view.s, cw=C.W/2/C.s, ch=C.H/2/C.s;
  return !((view.cx-hw<C.cx-cw)||(view.cx+hw>C.cx+cw)||(view.cy-hh<C.cy-ch)||(view.cy+hh>C.cy+ch));
}
function wxTint(wx){ return wx==='rain'?[196,204,216]:(wx==='cloudy'?[226,230,236]:(wx==='fog'?[236,240,244]:(wx==='snow'?[232,238,248]:[255,255,255]))); }
function drawCloudShadowsMaybe(ctx,V,P,wx){ if(wx==='clear'||wx==='cloudy'){ if(V.s<2.5) drawClouds(ctx,V,P,false); } }

/* ---- слой районов: контуры, цвета и «фокус» ---- */
function rentColor(m){ var t=clamp((m-.4)/.95,0,1); return t<.5?mix('#4E9A3E','#E2B53C',t*2):mix('#E2B53C','#D1361A',(t-.5)*2); }
function domSeg(id,h){ var o=distFlowSeg(id,h), best='off',bv=-1; SEGS.forEach(function(sg){ if(o[sg]>bv){ bv=o[sg]; best=sg; } }); return best; }
function flowMax(){ var m=0; DORDER.forEach(function(id){ m=Math.max(m,distFlow(id,ST.hour)); }); return Math.max(m,1); }
function polyPath(ctx,polys){ ctx.beginPath(); polys.forEach(function(p){ ctx.moveTo(p[0][0],p[0][1]); for(var i=1;i<p.length;i++) ctx.lineTo(p[i][0],p[i][1]); ctx.closePath(); }); }
function drawDistrictLayer(ctx,V,ts){
  var L=ST.layers, fm=L.guests?flowMax():1, sel=ST.sel, hov=ST.hover, s=V.s;
  DORDER.forEach(function(id){
    var polys=distWarped(id), a=0, col=DIST[id].col;
    if(L.guests){ var sg=domSeg(id,ST.hour); col=SEGC[sg]; a=.14+.5*Math.pow(distFlow(id,ST.hour)/fm,.8); }
    else if(L.rent){ col=rentColor(DIST[id].rent); a=.5; }
    else if(L.districts){ a=.07; }
    if(id===hov&&id!==sel) a=Math.max(a,.2)+.06;
    if(id===sel) a=Math.max(a,.0);
    if(a>0){ ctx.fillStyle=rgba(col,a); polyPath(ctx,polys); ctx.fill(); }
    if(L.districts||L.guests||L.rent||id===sel||id===hov){
      ctx.lineJoin='round'; ctx.lineWidth=(id===sel?3:(id===hov?2:1.2))/s; ctx.strokeStyle=rgba(id===sel?'#2B1810':DIST[id].col,id===sel?.95:(id===hov?.9:.5));
      if(id!==sel){ ctx.setLineDash([7/s,5/s]); }
      polyPath(ctx,polys); ctx.stroke(); ctx.setLineDash([]);
    }
  });
  if(sel){ /* бегущий пунктир по выбранному */
    ctx.lineWidth=2.4/s; ctx.strokeStyle='#FFFFFF'; ctx.setLineDash([7/s,9/s]); ctx.lineDashOffset=-(ts/45)/s; polyPath(ctx,distWarped(sel)); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset=0;
  }
}
/* затемнение вне выбранного района */
function drawFocusDim(ctx,ts){
  if(!ST.sel){ APP.dim=Math.max(0,(APP.dim||0)-.06); if(APP.dim<=0) return; } else APP.dim=Math.min(1,(APP.dim||0)+.07);
  var id=ST.sel||APP.lastSel; if(!id) return; if(ST.sel) APP.lastSel=ST.sel;
  var v=APP.view, dpr=APP.dpr;
  ctx.save(); ctx.setTransform(dpr*v.s,0,0,dpr*v.s,dpr*(APP.W/2-v.cx*v.s),dpr*(APP.H/2-v.cy*v.s));
  ctx.fillStyle='rgba(32,22,14,'+(.34*APP.dim)+')'; ctx.beginPath(); ctx.rect(v.cx-APP.W/v.s,v.cy-APP.H/v.s,APP.W*2/v.s,APP.H*2/v.s);
  distWarped(id).forEach(function(p){ ctx.moveTo(p[0][0],p[0][1]); for(var i=1;i<p.length;i++) ctx.lineTo(p[i][0],p[i][1]); ctx.closePath(); });
  ctx.fill('evenodd'); ctx.restore();
}

/* ---- реклама: круги охвата ---- */
function adAnchor(ch){ var at=ST.adLoc[ch]; return at&&DANCH[at]?DANCH[at]:null; }
function drawAdsLayer(ctx,V,ts){
  if(!ST.layers.ads) return; var s=V.s;
  ADORDER.forEach(function(ch,i){
    if(!ST.ads[ch]) return; var ad=ADS[ch]; if(!ad.local) return; var an=adAnchor(ch); if(!an) return;
    var r=ad.rad, pulse=1+.025*Math.sin(ts/500+i);
    var g=ctx.createRadialGradient(an[0],an[1],r*.1,an[0],an[1],r*pulse); g.addColorStop(0,'rgba(209,54,26,.02)'); g.addColorStop(.8,'rgba(209,54,26,.09)'); g.addColorStop(1,'rgba(209,54,26,.18)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(an[0],an[1],r*pulse,0,6.2832); ctx.fill();
    ctx.setLineDash([6/s,5/s]); ctx.lineWidth=1.6/s; ctx.strokeStyle='rgba(168,38,16,.85)'; ctx.beginPath(); ctx.arc(an[0],an[1],r*pulse,0,6.2832); ctx.stroke(); ctx.setLineDash([]);
  });
}

/* ---- подписи и значки ---- */
var GL=['#2B1810','#FFF6E7'];
function haloText(ctx,t,x,y,fill,halo,hw){ ctx.lineJoin='round'; ctx.lineWidth=hw||4; ctx.strokeStyle=halo||'rgba(255,246,231,.92)'; ctx.strokeText(t,x,y); ctx.fillStyle=fill||'#2B1810'; ctx.fillText(t,x,y); }
function setSpacing(ctx,px){ if('letterSpacing' in ctx) ctx.letterSpacing=px+'px'; }
var PLACED=[];
function place(x,y,w,h){ var r=[x-w/2,y-h/2,x+w/2,y+h/2]; for(var i=0;i<PLACED.length;i++){ var q=PLACED[i]; if(r[0]<q[2]&&r[2]>q[0]&&r[1]<q[3]&&r[3]>q[1]) return false; } PLACED.push(r); return true; }
function drawLabels(ctx,ts){
  var s=APP.view.s, L=ST.layers, W=APP.W, H=APP.H; PLACED=[]; var cpp=w2s(CAFE_POS[0],CAFE_POS[1]); PLACED.push([cpp[0]-40,cpp[1]-60,cpp[0]+40,cpp[1]+4]);
  ctx.textAlign='center'; ctx.textBaseline='middle';
  /* названия районов */
  if(L.names&&s<2.1){
    var fade=s<1.6?1:clamp((2.1-s)/.5,0,1), base=clamp(12.5*Math.pow(s/.5,.32),11.5,19);
    DORDER.forEach(function(id){
      var d=DIST[id], p=w2s(DLAB[id][0],DLAB[id][1]); if(p[0]<-90||p[0]>W+90||p[1]<-40||p[1]>H+40) return;
      var act=(id===ST.sel||id===ST.hover), fs=base*(act?1.14:1), a=fade*(ST.sel&&!act?.55:1);
      ctx.globalAlpha=a; ctx.font='800 '+fs+'px "Playfair Display",Georgia,serif'; setSpacing(ctx,.6);
      var tw=ctx.measureText(d.n).width; PLACED.push([p[0]-tw/2-4,p[1]-fs*.7,p[0]+tw/2+4,p[1]+fs*1.5]);
      haloText(ctx,d.n,p[0],p[1],'#2B1810','rgba(255,246,231,.94)',4.5);
      if(s>.38){ ctx.font='800 '+Math.max(9.5,fs*.68)+'px Nunito,system-ui,sans-serif'; setSpacing(ctx,.2); haloText(ctx,d.tag,p[0],p[1]+fs*.95,shade(d.col,.7),'rgba(255,246,231,.94)',3.5); }
      setSpacing(ctx,0); ctx.globalAlpha=1;
    });
  }
  /* донаты состава гостей */
  if(L.guests&&s<1.5){
    DORDER.forEach(function(id){ var p=w2s(DANCH[id][0],DANCH[id][1]); if(p[0]<-40||p[0]>W+40||p[1]<-40||p[1]>H+40) return; drawDonut(ctx,p[0],p[1],clamp(15+s*12,16,26),id); });
  }
  if(L.rent&&s<2){
    ctx.font='800 12px Nunito,system-ui,sans-serif';
    DORDER.forEach(function(id){ var p=w2s(DANCH[id][0],DANCH[id][1]), r=Math.round(CITY_RENT*DIST[id].rent/500)*500; if(p[0]<-40||p[0]>W+40||p[1]<-40||p[1]>H+40) return; var t=r.toLocaleString('ru-RU').replace(/,/g,' ')+' ₽'; var w=ctx.measureText(t).width+14; ctx.fillStyle='rgba(255,246,231,.94)'; rrect(ctx,p[0]-w/2,p[1]-11,w,22,11); ctx.fill(); ctx.lineWidth=1.6; ctx.strokeStyle=rentColor(DIST[id].rent); ctx.stroke(); ctx.fillStyle='#2B1810'; ctx.fillText(t,p[0],p[1]+.5); });
  }
  /* достопримечательности */
  if(s>.55){
    var ORDER_LM=['kremlin','station','tulgu','park','market','zavod','mall','lenin','embank'];
    var ls=LANDMARKS.filter(function(m){ return m.x>-5&&m.y<1690; }).sort(function(a,b){ var ia=ORDER_LM.indexOf(a.id), ib=ORDER_LM.indexOf(b.id); return (ia<0?99:ia)-(ib<0?99:ib); });
    ls.forEach(function(m){
      var p=w2s(m.x,m.y-34); if(p[0]<-80||p[0]>W+80||p[1]<-30||p[1]>H+30) return;
      var imp=['kremlin','station','tulgu','park','market','zavod','mall'].indexOf(m.id)>=0; if(!imp&&s<1.1) return;
      var a=clamp((s-.55)/.2,0,1); ctx.globalAlpha=a;
      ctx.font='800 11.5px Nunito,system-ui,sans-serif'; var w=ctx.measureText(m.n).width+26; if(!place(p[0],p[1],w+4,26)) return;
      ctx.fillStyle='rgba(255,252,244,.95)'; rrect(ctx,p[0]-w/2,p[1]-11,w,22,11); ctx.fill(); ctx.lineWidth=1.4; ctx.strokeStyle='rgba(43,24,16,.55)'; ctx.stroke();
      drawGlyph(ctx,m.id,p[0]-w/2+11,p[1],'#B5472F'); ctx.fillStyle='#2B1810'; ctx.textAlign='left'; ctx.fillText(m.n,p[0]-w/2+21,p[1]+.5); ctx.textAlign='center'; ctx.globalAlpha=1;
    });
  }
  /* названия улиц */
  if(s>1.5){
    ctx.font='800 italic 10.5px Nunito,system-ui,sans-serif'; ctx.fillStyle='rgba(60,44,30,.86)';
    GEN.roads.forEach(function(r){
      if(!r.name||r.cls==='hwy') return; var Lr=polyLen(r.pts); if(Lr<200) return;
      var n=Math.max(1,Math.floor(Lr/520));
      for(var i=0;i<n;i++){ var q=pointAt(r.pts,Lr*(i+.5)/n), p=w2s(q[0],q[1]); if(p[0]<-40||p[0]>W+40||p[1]<-30||p[1]>H+30) continue;
        var ang=q[2]; if(ang>Math.PI/2||ang<-Math.PI/2) ang+=Math.PI; ctx.save(); ctx.translate(p[0],p[1]); ctx.rotate(ang); ctx.globalAlpha=clamp((s-1.5)/.4,0,1); haloText(ctx,r.name,0,0,'#4A3526','rgba(255,252,244,.85)',3); ctx.restore(); }
    });
    ctx.globalAlpha=1;
  }
  /* записки Тамары */
  if(s>.78&&s<2.6){
    NOTES.forEach(function(n){ var p=w2s(n.x,n.y); if(p[0]<-120||p[0]>W+120||p[1]<-40||p[1]>H+40) return; var nw=Math.max.apply(null,n.t.split('\n').map(function(l){ return l.length*6.5; })), nh=n.t.split('\n').length*17; if(!place(p[0],p[1],nw,nh)) return; var a=clamp((s-.78)/.2,0,1)*clamp((2.6-s)/.5,0,1);
      ctx.save(); ctx.translate(p[0],p[1]); ctx.rotate(n.a); ctx.globalAlpha=a; ctx.font='700 '+clamp(15*Math.pow(s/.9,.3),14,21)+'px Caveat,"Comic Sans MS",cursive'; var lines=n.t.split('\n');
      lines.forEach(function(ln,i){ haloText(ctx,ln,0,(i-(lines.length-1)/2)*17,'#9C3A22','rgba(255,246,231,.95)',4); }); ctx.restore(); });
  }
  ctx.globalAlpha=1;
}
function rrect(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function drawDonut(ctx,x,y,r,id){
  var mix=DIST[id].mix, a0=-Math.PI/2;
  ctx.fillStyle='rgba(255,246,231,.94)'; ctx.beginPath(); ctx.arc(x,y,r+3,0,6.2832); ctx.fill();
  SEGS.forEach(function(sg){ var a1=a0+mix[sg]/100*6.2832; ctx.fillStyle=SEGC[sg]; ctx.beginPath(); ctx.moveTo(x,y); ctx.arc(x,y,r,a0,a1); ctx.closePath(); ctx.fill(); a0=a1; });
  ctx.fillStyle='rgba(255,246,231,1)'; ctx.beginPath(); ctx.arc(x,y,r*.5,0,6.2832); ctx.fill();
}
function drawGlyph(ctx,id,x,y,col){
  ctx.save(); ctx.translate(x,y); ctx.fillStyle=col; ctx.strokeStyle=col; ctx.lineWidth=1.4; ctx.lineJoin='round'; ctx.lineCap='round';
  switch(id){
    case 'kremlin': ctx.beginPath(); ctx.moveTo(-6,5); ctx.lineTo(-6,-2); ctx.lineTo(-4,-2); ctx.lineTo(-4,-4); ctx.lineTo(-2,-4); ctx.lineTo(-2,-2); ctx.lineTo(2,-2); ctx.lineTo(2,-4); ctx.lineTo(4,-4); ctx.lineTo(4,-2); ctx.lineTo(6,-2); ctx.lineTo(6,5); ctx.closePath(); ctx.fill(); break;
    case 'station': ctx.fillRect(-6,-3,12,7); ctx.fillStyle='#FFF6E7'; ctx.fillRect(-4,-1,3,2.4); ctx.fillRect(1,-1,3,2.4); break;
    case 'tulgu': ctx.beginPath(); ctx.moveTo(0,-5); ctx.lineTo(7,-1); ctx.lineTo(0,3); ctx.lineTo(-7,-1); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(-3.5,1); ctx.lineTo(-3.5,4.5); ctx.lineTo(3.5,4.5); ctx.lineTo(3.5,1); ctx.stroke(); break;
    case 'park': ctx.beginPath(); ctx.arc(0,-1,5,0,6.28); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-2.5,6); ctx.lineTo(0,-1); ctx.lineTo(2.5,6); ctx.stroke(); break;
    case 'market': ctx.beginPath(); ctx.moveTo(-6,-1); ctx.lineTo(6,-1); ctx.lineTo(4.5,5); ctx.lineTo(-4.5,5); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.arc(0,-2,3.5,Math.PI,0); ctx.stroke(); break;
    case 'zavod': ctx.fillRect(-6,0,12,5); ctx.fillRect(-5,-5,2.4,5); ctx.fillRect(0,-3,2.4,3); break;
    case 'mall': ctx.fillRect(-5,-2,10,7); ctx.beginPath(); ctx.arc(0,-2,3,Math.PI,0); ctx.stroke(); break;
    case 'lenin': ctx.beginPath(); ctx.arc(0,0,5,0,6.28); ctx.stroke(); ctx.beginPath(); ctx.arc(0,0,1.6,0,6.28); ctx.fill(); break;
    case 'embank': ctx.beginPath(); ctx.moveTo(-6,1); ctx.quadraticCurveTo(-3,-3,0,1); ctx.quadraticCurveTo(3,5,6,1); ctx.stroke(); break;
    default: ctx.beginPath(); ctx.arc(0,0,3.6,0,6.28); ctx.fill();
  }
  ctx.restore();
}
function drawPins(ctx,ts){
  var s=APP.view.s, W=APP.W, H=APP.H;
  /* соперники */
  if(ST.layers.rivals){
    RIVALS.forEach(function(r){
      var p=w2s(r.x,r.y-4); if(p[0]<-30||p[0]>W+30||p[1]<-30||p[1]>H+30) return;
      var big=s>1.05||ST.hoverRival===r, col=r.r>=4.3?'#2E7D4F':(r.r>=3.8?'#C58A1D':'#B83A3A');
      ctx.fillStyle='rgba(30,30,40,.25)'; ctx.beginPath(); ctx.ellipse(p[0]+1,p[1]+12,7,2.6,0,0,6.28); ctx.fill();
      ctx.fillStyle='#FFFDF6'; ctx.beginPath(); ctx.arc(p[0],p[1],10,0,6.28); ctx.fill(); ctx.lineWidth=2.4; ctx.strokeStyle=col; ctx.stroke();
      ctx.font='800 10px Nunito,system-ui,sans-serif'; ctx.fillStyle='#2B1810'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(String(r.r).replace('.',','),p[0],p[1]+.5);
      if(big){ ctx.font='800 11px Nunito,system-ui,sans-serif'; var t=r.n+' · '+r.st, w=ctx.measureText(t).width+14; ctx.fillStyle='rgba(255,252,244,.96)'; rrect(ctx,p[0]-w/2,p[1]-34,w,20,10); ctx.fill(); ctx.lineWidth=1.2; ctx.strokeStyle='rgba(43,24,16,.5)'; ctx.stroke(); ctx.fillStyle='#2B1810'; ctx.fillText(t,p[0],p[1]-23.5); }
    });
  }
  /* «Первый столик» */
  var cp=w2s(CAFE_POS[0],CAFE_POS[1]);
  if(cp[0]>-60&&cp[0]<W+60&&cp[1]>-80&&cp[1]<H+60){
    var bob=Math.sin(ts/380)*2.2, pr=(ts%1800)/1800, rad=10+pr*34;
    ctx.strokeStyle='rgba(209,54,26,'+(.55*(1-pr))+')'; ctx.lineWidth=2; ctx.beginPath(); ctx.ellipse(cp[0],cp[1],rad,rad*.55,0,0,6.28); ctx.stroke();
    ctx.fillStyle='rgba(30,30,40,.28)'; ctx.beginPath(); ctx.ellipse(cp[0],cp[1]+1,8,3,0,0,6.28); ctx.fill();
    var px=cp[0], py=cp[1]-30+bob;
    ctx.fillStyle='#D1361A'; ctx.beginPath(); ctx.arc(px,py,15,Math.PI*.82,Math.PI*2.18); ctx.lineTo(px,cp[1]-2+bob*.3); ctx.closePath(); ctx.fill();
    ctx.lineWidth=2.4; ctx.strokeStyle='#FFF6E7'; ctx.stroke();
    ctx.fillStyle='#FFF6E7'; ctx.beginPath(); ctx.arc(px,py,9.6,0,6.28); ctx.fill();
    /* чашка */
    ctx.fillStyle='#D1361A'; ctx.beginPath(); ctx.moveTo(px-5,py-2); ctx.lineTo(px+4,py-2); ctx.lineTo(px+3,py+4); ctx.lineTo(px-4,py+4); ctx.closePath(); ctx.fill(); ctx.lineWidth=1.3; ctx.strokeStyle='#D1361A'; ctx.beginPath(); ctx.arc(px+4.4,py+.6,2.2,-1.2,1.3); ctx.stroke();
    ctx.strokeStyle='rgba(209,54,26,.8)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(px-2,py-4); ctx.quadraticCurveTo(px-3.4,py-6,px-1.4,py-8); ctx.moveTo(px+1,py-4); ctx.quadraticCurveTo(px-.4,py-6,px+1.6,py-8); ctx.stroke();
    if(s>.5||ST.hoverCafe){ ctx.font='800 12px Nunito,system-ui,sans-serif'; ctx.textAlign='center'; var t='Первый столик', w=ctx.measureText(t).width+20; ctx.fillStyle='#D1361A'; rrect(ctx,px-w/2,py-49,w,21,10.5); ctx.fill(); ctx.fillStyle='#FFF6E7'; ctx.fillText(t,px,py-38.2); }
    if(ST.cafeTick>0){ ctx.globalAlpha=Math.min(1,ST.cafeTick*1.4); ctx.font='900 14px Nunito,system-ui,sans-serif'; haloText(ctx,'+1',px+18,py-14-(1-ST.cafeTick)*16,'#2E7D4F','rgba(255,246,231,.95)',4); ctx.globalAlpha=1; }
  }
  /* направления за краем карты */
  var yp=w2s(-60,1640); 
  if(s>.3){ ctx.font='700 italic 12px Nunito,system-ui,sans-serif'; ctx.fillStyle='rgba(43,24,16,.8)'; var items=[['М-2 → Москва',2120,40,0],['М-2 → Орёл',2160,1660,0],['Ясная Поляна · 14 км',90,1610,-.7]]; items.forEach(function(it){ var q=w2s(it[1],it[2]); if(q[0]<-80||q[0]>W+80||q[1]<-20||q[1]>H+20) return; ctx.save(); ctx.translate(q[0],q[1]); ctx.rotate(it[3]); haloText(ctx,it[0],0,0,'#2B1810','rgba(255,246,231,.9)',3.4); ctx.restore(); }); }
}

/* замер: n кадров подряд без ожидания */
function bench(n){ var t0=performance.now(); for(var i=0;i<n;i++){ lifeStep(.016); draw(performance.now()); } return (performance.now()-t0)/n; }
