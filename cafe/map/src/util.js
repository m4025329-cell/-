/* ===== Карта Тулы: общие помощники (случайные числа, геометрия, цвет) ===== */

function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function hashStr(s){ var h=2166136261; for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
function lerp(a,b,t){ return a+(b-a)*t; }
function smooth(t){ t=clamp(t,0,1); return t*t*(3-2*t); }
function pick(r,a){ return a[Math.floor(r()*a.length)%a.length]; }
function rr(r,a,b){ return a+(b-a)*r(); }

/* значение-шум: гладкий, детерминированный, на любой точке плоскости */
var NOISE_P=(function(){ var r=mulberry32(77), p=[]; for(var i=0;i<256;i++) p[i]=i; for(i=255;i>0;i--){ var j=Math.floor(r()*(i+1)), t=p[i]; p[i]=p[j]; p[j]=t; } var q=[]; for(i=0;i<512;i++) q[i]=p[i&255]; return q; })();
function noise2(x,y){
  var xi=Math.floor(x), yi=Math.floor(y), xf=x-xi, yf=y-yi, u=xf*xf*(3-2*xf), v=yf*yf*(3-2*yf);
  function h(i,j){ return NOISE_P[(NOISE_P[(i&255)]+ (j&255))&511]/255; }
  return lerp(lerp(h(xi,yi),h(xi+1,yi),u),lerp(h(xi,yi+1),h(xi+1,yi+1),u),v);
}
function fbm(x,y,o){ var s=0,a=.5,f=1; for(var i=0;i<(o||3);i++){ s+=a*noise2(x*f,y*f); a*=.5; f*=2; } return s/(1-Math.pow(.5,o||3)); }

/* ---- полилинии и многоугольники ---- */
function dist(a,b){ var dx=a[0]-b[0], dy=a[1]-b[1]; return Math.sqrt(dx*dx+dy*dy); }
function polyLen(p){ var l=0; for(var i=1;i<p.length;i++) l+=dist(p[i-1],p[i]); return l; }
function chaikin(p,n,closed){
  for(var k=0;k<n;k++){
    var o=[], m=p.length, last=closed?m:m-1;
    if(!closed) o.push(p[0]);
    for(var i=0;i<last;i++){ var a=p[i], b=p[(i+1)%m]; o.push([a[0]*.75+b[0]*.25,a[1]*.75+b[1]*.25],[a[0]*.25+b[0]*.75,a[1]*.25+b[1]*.75]); }
    if(!closed) o.push(p[m-1]);
    p=o;
  }
  return p;
}
function resample(p,step){
  var o=[p[0]], acc=0, i, need=step;
  for(i=1;i<p.length;i++){
    var a=p[i-1], b=p[i], d=dist(a,b), pos=0;
    while(d-pos>=need-acc){ pos+=need-acc; acc=0; need=step; var t=pos/d; o.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]); }
    acc+=d-pos;
  }
  var L=p[p.length-1]; if(dist(o[o.length-1],L)>step*.3) o.push(L);
  return o;
}
function pointAt(p,d){
  for(var i=1;i<p.length;i++){ var l=dist(p[i-1],p[i]); if(d<=l||i===p.length-1){ var t=l?clamp(d/l,0,1):0; return [p[i-1][0]+(p[i][0]-p[i-1][0])*t,p[i-1][1]+(p[i][1]-p[i-1][1])*t,Math.atan2(p[i][1]-p[i-1][1],p[i][0]-p[i-1][0])]; } d-=l; }
  return [p[0][0],p[0][1],0];
}
function offsetPoly(p,d){
  var o=[];
  for(var i=0;i<p.length;i++){
    var a=p[Math.max(0,i-1)], b=p[Math.min(p.length-1,i+1)], dx=b[0]-a[0], dy=b[1]-a[1], l=Math.sqrt(dx*dx+dy*dy)||1;
    o.push([p[i][0]-dy/l*d,p[i][1]+dx/l*d]);
  }
  return o;
}
function inPoly(x,y,p){
  var c=false;
  for(var i=0,j=p.length-1;i<p.length;j=i++){
    var xi=p[i][0], yi=p[i][1], xj=p[j][0], yj=p[j][1];
    if(((yi>y)!==(yj>y)) && (x<(xj-xi)*(y-yi)/(yj-yi)+xi)) c=!c;
  }
  return c;
}
function segDist(px,py,ax,ay,bx,by){
  var dx=bx-ax, dy=by-ay, l=dx*dx+dy*dy, t=l?clamp(((px-ax)*dx+(py-ay)*dy)/l,0,1):0, qx=ax+dx*t-px, qy=ay+dy*t-py;
  return Math.sqrt(qx*qx+qy*qy);
}
function distPoly(x,y,p){ var m=1e9; for(var i=1;i<p.length;i++){ var d=segDist(x,y,p[i-1][0],p[i-1][1],p[i][0],p[i][1]); if(d<m) m=d; } return m; }
function nearestOn(x,y,p){
  var best=1e9, bi=0, bt=0;
  for(var i=1;i<p.length;i++){
    var ax=p[i-1][0], ay=p[i-1][1], dx=p[i][0]-ax, dy=p[i][1]-ay, l=dx*dx+dy*dy, t=l?clamp(((x-ax)*dx+(y-ay)*dy)/l,0,1):0, qx=ax+dx*t-x, qy=ay+dy*t-y, d=qx*qx+qy*qy;
    if(d<best){ best=d; bi=i; bt=t; }
  }
  return {d:Math.sqrt(best), i:bi, t:bt, x:p[bi-1][0]+(p[bi][0]-p[bi-1][0])*bt, y:p[bi-1][1]+(p[bi][1]-p[bi-1][1])*bt};
}
function polyArea(p){ var a=0; for(var i=0,j=p.length-1;i<p.length;j=i++) a+=(p[j][0]+p[i][0])*(p[j][1]-p[i][1]); return Math.abs(a/2); }
function centroid(p){ var x=0,y=0; for(var i=0;i<p.length;i++){ x+=p[i][0]; y+=p[i][1]; } return [x/p.length,y/p.length]; }
function bbox(p){ var x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; for(var i=0;i<p.length;i++){ x0=Math.min(x0,p[i][0]); y0=Math.min(y0,p[i][1]); x1=Math.max(x1,p[i][0]); y1=Math.max(y1,p[i][1]); } return [x0,y0,x1,y1]; }
function rot(x,y,a){ var c=Math.cos(a), s=Math.sin(a); return [x*c-y*s,x*s+y*c]; }
function rectPts(cx,cy,w,h,a){ var o=[], k=[[-1,-1],[1,-1],[1,1],[-1,1]]; for(var i=0;i<4;i++){ var r=rot(k[i][0]*w/2,k[i][1]*h/2,a); o.push([cx+r[0],cy+r[1]]); } return o; }
function hull(pts){
  pts=pts.slice().sort(function(a,b){ return a[0]-b[0]||a[1]-b[1]; });
  function cr(o,a,b){ return (a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]); }
  var lo=[], up=[], i;
  for(i=0;i<pts.length;i++){ while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],pts[i])<=0) lo.pop(); lo.push(pts[i]); }
  for(i=pts.length-1;i>=0;i--){ while(up.length>=2&&cr(up[up.length-2],up[up.length-1],pts[i])<=0) up.pop(); up.push(pts[i]); }
  up.pop(); lo.pop(); return lo.concat(up);
}

/* ---- цвет ---- */
function hex2rgb(h){ h=h.replace('#',''); if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2]; var n=parseInt(h,16); return [n>>16&255,n>>8&255,n&255]; }
function rgb2hex(c){ function f(v){ v=Math.round(clamp(v,0,255)); return (v<16?'0':'')+v.toString(16); } return '#'+f(c[0])+f(c[1])+f(c[2]); }
function mix(a,b,t){ var x=hex2rgb(a), y=hex2rgb(b); return rgb2hex([lerp(x[0],y[0],t),lerp(x[1],y[1],t),lerp(x[2],y[2],t)]); }
function shade(h,k){ var c=hex2rgb(h); return rgb2hex([c[0]*k,c[1]*k,c[2]*k]); }
function rgba(h,a){ var c=hex2rgb(h); return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')'; }
var _cmemo={};
function cmix(a,b,t){ var k=a+b+Math.round(t*40); return _cmemo[k]||(_cmemo[k]=mix(a,b,Math.round(t*40)/40)); }
