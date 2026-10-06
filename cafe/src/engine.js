/* ===== «Первый столик»: экономический движок (без интерфейса) ===== */
function clamp(x, a, b){ return Math.max(a, Math.min(b, x)); }
function hashStr(str){ var h=2166136261; str=String(str); for(var i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function rngFor(s, tag){ return mulberry32(hashStr((s.seed||'free')+'|'+tag)); }
function rand01(s, tag){ return rngFor(s, tag)(); }
function randomSeed(){ return Math.random().toString(36).slice(2,8); }
function rub(n){ n=Math.round(n); var sgn=n<0?'−':''; return sgn+Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,' ')+' ₽'; }
function rubk(n){ var a=Math.abs(n); if(a>=1000000) return (n<0?'−':'')+f1(a/1000000)+' млн ₽'; if(a>=10000) return (n<0?'−':'')+Math.round(a/1000)+' тыс. ₽'; return rub(n); }
function f1(x){ return (Math.round(x*100)/100).toString().replace('.',','); }
function f1d(x){ return (Math.round(x*10)/10).toString().replace('.',','); }
function pct(x){ return Math.round(x*100)+'%'; }
function plural(n, a, b, c){ n=Math.abs(Math.round(n))%100; var n1=n%10; if(n>10 && n<20) return c; if(n1>1 && n1<5) return b; if(n1===1) return a; return c; }
function sumArr(a){ return a.reduce(function(x,y){ return x+y; },0); }
function stars(rep){ return clamp(2.2+rep/100*2.8, 1, 5); }

/* ---------- состояние ---------- */
function makeOutlet(id, city, fmt, nm, opts){
  var F=FORMATS[fmt], o={id:id, city:city, fmt:fmt, nm:nm||'', seats:F.seats, hrs:1,
    staff:{cook:F.base.cook, wait:F.base.wait, bar:F.base.bar, cln:F.base.cln}, lvl:{cook:1,wait:1,bar:1,cln:1}, trained:{},
    pay:1, stock:3, sup:'whole', mk:{}, padj:0, mgr:0, specs:[], eq:{}, rep:46, awr:0.12, loy:0, mor:68,
    built:0, openM:1, loc:true, lp:0, inv:0, std:false, hist:[], last:null};
  if(fmt==='rest'){ o.mgr=0; o.eq.oven=1; o.eq.grill=1; o.eq.fridge=1; o.eq.dish=1; o.eq.pos=1; o.std=true; o.rep=50; }
  else if(fmt==='cafe' && opts && opts.std){ o.eq.oven=1; o.eq.grill=1; o.std=true; }
  if(opts) for(var k in opts) if(k!=='std') o[k]=opts[k];
  return o;
}
function newState(o){
  o=o||{}; var diff=DIFFS[o.diff||'norm'];
  var s={v:1, name:o.name||'Хозяин', cafe:o.cafe||'Первый столик', talent:o.talent||null, diff:o.diff||'norm', code:o.code||'', seed:String(o.seed||randomSeed()),
    month:1, cash:diff.start, debt:0, emerg:0, invest:0, tax:'6', pidx:1, cidx:1, widx:1,
    menu:['espresso','latte','pie','oatmeal','chicksoup','cutlet','compote'], price:{}, lab:{}, recs:[1],
    outlets:[makeOutlet('o1','tula','cafe',(o.cafe||'Первый столик'))], hq:{brand:8, upg:{}, std:0, mkt:0, spec:{}},
    specs:{}, here:'o1', mods:[], flags:{leraMet:1}, rel:{arsen:0,lera:0,maria:0,kira:0,viktor:0,nazarov:0}, hist:[], terms:[], ach:{},
    quizScore:[], orders:null, accepted:[], mini:[], seen:{}, tut:{}, rewinds:0, log:[], news:[], goalDone:{}, awards:0, repl:{}, dep:0, insured:0, goals:null, reg:{}, stats:{goalsDone:0, holidays:0, miniGold:0, reg5:0, events:0}, awn:'#D1361A'};
  s.outlets[0].openM=1;
  ensureState(s);
  return s;
}
function ensureState(s){
  if(!s.menu) s.menu=[]; if(!s.price) s.price={}; if(!s.lab) s.lab={}; if(!s.recs) s.recs=[1]; if(!s.hq) s.hq={brand:8,upg:{},std:0,mkt:0,spec:{}};
  if(!s.hq.upg) s.hq.upg={}; if(!s.specs) s.specs={}; if(!s.mods) s.mods=[]; if(!s.flags) s.flags={}; if(!s.rel) s.rel={}; if(!s.hist) s.hist=[];
  if(!s.terms) s.terms=[]; if(!s.ach) s.ach={}; if(!s.quizScore) s.quizScore=[]; if(!s.accepted) s.accepted=[]; if(!s.seen) s.seen={}; if(!s.tut) s.tut={};
  if(s.dep==null) s.dep=0; if(!s.reg) s.reg={}; if(!s.stats) s.stats={goalsDone:0,holidays:0,miniGold:0,reg5:0,events:0}; if(!s.awn) s.awn='#D1361A'; if(!s.log) s.log=[]; if(!s.news) s.news=[]; if(!s.goalDone) s.goalDone={}; if(!s.repl) s.repl={};
  if(s.pidx==null) s.pidx=1; if(s.cidx==null) s.cidx=1; if(s.widx==null) s.widx=1; if(s.emerg==null) s.emerg=0;
  s.outlets.forEach(function(o){ if(!o.staff) o.staff={cook:1,wait:1,bar:1,cln:0}; if(!o.lvl) o.lvl={cook:1,wait:1,bar:1,cln:1}; if(!o.trained) o.trained={}; if(!o.mk) o.mk={}; if(!o.eq) o.eq={}; if(!o.specs) o.specs=[]; if(!o.hist) o.hist=[]; if(o.loc==null) o.loc=true; });
  if(!s.here || !outletById(s,s.here)) s.here=s.outlets[0].id;
  return s;
}
function outletById(s,id){ for(var i=0;i<s.outlets.length;i++) if(s.outlets[i].id===id) return s.outlets[i]; return null; }
function liveOutlets(s){ return s.outlets.filter(function(o){ return !o.built && o.fmt!=='fran'; }); }
function ownOutlets(s){ return s.outlets.filter(function(o){ return o.fmt!=='fran'; }); }
function franOutlets(s){ return s.outlets.filter(function(o){ return o.fmt==='fran'; }); }
function flagship(s){ return s.outlets[0]; }
function cityCount(s){ var m={}; s.outlets.forEach(function(o){ if(!o.built || o.fmt==='fran') m[o.city]=1; }); s.outlets.forEach(function(o){ if(o.built) m[o.city]=1; }); return Object.keys(m).length; }
function cityCountOpen(s){ var m={}; s.outlets.forEach(function(o){ if(!o.built) m[o.city]=1; }); return Object.keys(m).length; }
function hasEq(o, id){ return !!(o.eq && o.eq[id]); }
function specAt(s, id, o){ return s.specs[id] && (SPECS[id].where==='hq' || (o && s.specs[id]===o.id)); }
function hasSpec(s,id){ return !!s.specs[id]; }
function modM(s, k, city){ var m=1; (s.mods||[]).forEach(function(x){ if(x.k===k && (!x.city || x.city===city)) m*=x.m; }); return m; }
function isSummer(cal){ return cal>=5 && cal<=7; }
function menuSlots(s){ var n=8; if(s.outlets.some(function(o){ return o.eq && o.eq.kitch2; })) n+=2; if(s.hq.upg.std) n+=2; if(s.outlets.some(function(o){ return o.fmt==='rest'; })) n+=4; return Math.min(n,16); }
function dishUnlocked(s,d){ if(d.u==='start') return true; if(d.u==='rec') return s.recs.indexOf(d.rec)>=0; if(d.u==='lab') return !!s.lab[d.id]; if(d.u==='rest') return s.outlets.some(function(o){ return o.fmt==='rest'; }); return false; }
function defPrice(s,d){ var f=s.outlets&&s.outlets[0]?CITIES[s.outlets[0].city].inc:1; return Math.round(d.ref*s.pidx*f/5)*5; }
function priceOf(s,d){ return s.price[d.id] || defPrice(s,d); }
function localDish(o){ var l=CITIES[o.city].loc, d={}; for(var k in l) d[k]=l[k]; d.id='loc_'+o.city; d.loc=1; d.u='start'; d.sig=1; return d; }
function outletDishes(s,o){
  var ds=[]; s.menu.forEach(function(id){ var d=DISH[id]; if(!d) return; if(d.u==='rest' && o.fmt!=='rest') return; if(d.need && !hasEq(o,d.need) && !o.std) return; ds.push(d); });
  if(o.loc!==false) ds.push(localDish(o));
  return ds;
}
function dishPrice(s,o,d){ var p=d.loc ? (o.lp||Math.round(d.ref*s.pidx*CITIES[o.city].inc/5)*5) : priceOf(s,d); return Math.max(10, Math.round(p*(1+(o.padj||0)/100))); }
function refPrice(s,o,d){ return d.ref*s.pidx*CITIES[o.city].inc; }
var PRICE_GAMMA=0.6, DEMAND_SCALE=0.93, INTEREST_MAX=2.1;
function pf(seg,r){ var c=PRICEK[seg]; return 1/(1+Math.pow(r/c.r,c.k)); }
function supOf(s,o){ var p=SUPPLIERS[o.sup]; if(p && p.need && ownOutlets(s).length<p.need) return SUPPLIERS.whole; return p||SUPPLIERS.whole; }
function cogsFactor(s,o){
  var f=supOf(s,o).cost*s.cidx*modM(s,'cogs',o.city);
  var d=1; if(s.talent==='biz') d*=0.97; if(specAt(s,'arsen',o)) d*=0.96; if(hasSpec(s,'gleb')) d*=0.95; if(hasSpec(s,'oleg')) d*=0.98; if(s.hq.upg.buy) d*=0.96; if(s.hq.upg.central) d*=0.93;
  return f*Math.max(0.78,d);
}
function cookEff(s,o){ var l=o.lvl.cook; if(specAt(s,'arsen',o)) l+=2; if(specAt(s,'damir',o)) l+=1; if(s.talent==='cook') l+=0.3; if(s.hq.upg.academy) l+=0.5; return l; }
function dishAppeal(s,o,d,i,cal){
  var tier=d.tier+(s.talent==='cook'?0.25:0)+(specAt(s,'arsen',o)?0.4:0); if(specAt(s,'sonya',o) && (d.cat==='bake'||d.cat==='dess')) tier+=0.5; if(specAt(s,'ruslan',o) && (d.cat==='bake'||d.cat==='dess')) tier+=0.3; if(specAt(s,'lera',o) && d.cat==='coffee') tier+=0.3;
  var a=0.7+0.1*tier; d.tg.forEach(function(t){ a*=TAGS[t].v[i]; });
  if(d.h) a*=SEASONF.hot[cal]; if(d.c) a*=SEASONF.cold[cal];
  if(specAt(s,'sonya',o) && (d.cat==='bake'||d.cat==='dess')) a*=1.25;
  if(specAt(s,'ruslan',o) && (d.cat==='bake'||d.cat==='dess')) a*=1.2;
  if(o.hol){ var H=HOLIDAYS[cal]; if(H && H.cat[d.cat]) a*=1+H.cat[d.cat]; }
  if(d.loc && specAt(s,'damir',o)) a*=1.4;
  if(o.special && o.special===d.id) a*=1.35;
  return a;
}
function dishTier(s,o,d){ var t=d.tier+(s.talent==='cook'?0.25:0)+(specAt(s,'arsen',o)?0.4:0); if(specAt(s,'sonya',o) && (d.cat==='bake'||d.cat==='dess')) t+=0.5; if(specAt(s,'ruslan',o) && (d.cat==='bake'||d.cat==='dess')) t+=0.3; return t; }

/* модель заведения: что и в каком количестве заказывает один гость каждого сегмента */
function outletModel(s,o,cal){
  var ds=outletDishes(s,o), M={dishes:ds, seg:{}}, cf=cogsFactor(s,o), barF=o.staff.bar>0?1:0.6;
  SEGS.forEach(function(sg,i){
    var pull={}, rpg=0, cpg=0, upg=0, ord=0, rW=0, tierS=0, fitN=0, fitD=0, per={};
    CATS.forEach(function(c){
      var list=ds.filter(function(d){ return d.cat===c; }), q=BASKET[sg][c]*(c==='coffee'?barF:1);
      fitD+=BASKET[sg][c];
      if(!list.length){ pull[c]=0; return; }
      var W=0, SEL=0, items=[];
      list.forEach(function(d){ var w=dishAppeal(s,o,d,i,cal), p=dishPrice(s,o,d), r=p/refPrice(s,o,d), ratio=Math.pow(pf(sg,r)/pf(sg,1),PRICE_GAMMA); W+=w; SEL+=w*ratio; items.push({d:d,w:w,p:p,r:r,sel:w*ratio}); });
      var cov=Math.min(1,0.62+0.19*list.length), catSel=SEL/W, qual=clamp(Math.sqrt(W/list.length),0.7,1.25), pl=cov*Math.min(1.35,catSel)*qual;
      pull[c]=pl; fitN+=BASKET[sg][c]*Math.min(cov*qual,1.35)*(c==='coffee'?barF:1);
      items.forEach(function(it){ var oq=q*pl*it.sel/SEL; rpg+=oq*it.p; cpg+=oq*it.d.cost*cf; upg+=oq*it.d.prep; ord+=oq; rW+=oq*it.r; tierS+=oq*dishTier(s,o,it.d); per[it.d.id]=(per[it.d.id]||0)+oq; });
    });
    M.seg[sg]={rpg:rpg, cpg:cpg, upg:upg, items:ord, rW:ord?rW/ord:1, tier:ord?tierS/ord:3, fit:clamp(fitN/fitD,0.2,1.4), per:per, pull:pull};
  });
  return M;
}

/* ---------- мощности и персонал ---------- */
function seatsNow(o, cal, wx){ var n=o.seats+8*(o.eq.seats||0); if(o.eq.terr && cal>=4 && cal<=8) n+=12*(wx==null?0.8:wx); return n; }
function kitchenCap(s,o){ return o.staff.cook*ROLES.cook.cap*(0.88+0.06*cookEff(s,o))*(o.eq.oven?1.1:1)*(o.eq.kitch2?1.4:1)*HOURS[o.hrs].hf; }
function serviceCap(s,o){ var wl=0.88+0.06*o.lvl.wait, bl=0.88+0.06*o.lvl.bar; return (o.staff.wait*ROLES.wait.cap*wl + o.staff.bar*ROLES.bar.cap*bl*(o.eq.espro?1.25:1)*0.65)*HOURS[o.hrs].hf*(o.eq.pos?1.05:1); }
function wageOf(s,o,role){ var base=ROLES[role].base*(1+0.14*(o.lvl[role]-1))*PAYS[o.pay].m*HOURS[o.hrs].wf*s.widx*modM(s,'wage',o.city); return base; }
function outletWages(s,o){
  var t=0; ['cook','wait','bar','cln'].forEach(function(r){ t+=o.staff[r]*wageOf(s,o,r); });
  if(o.mgr) t+=MGR.wage*s.widx;
  Object.keys(s.specs).forEach(function(id){ if(s.specs[id]===o.id) t+=SPECS[id].wage; });
  return t;
}
function monthDays(m){ return 30; }

/* ---------- один месяц одного заведения ---------- */
function simOutlet(s, o, env, rng){
  var city=CITIES[o.city], fmt=FORMATS[o.fmt], cal=env.cal, diff=DIFFS[s.diff], here=(s.here===o.id);
  var res={id:o.id, city:o.city, name:o.nm, fmt:o.fmt};
  var cf=cogsFactor(s,o), M=outletModel(s,o,cal);
  var hf=HOURS[o.hrs], demHrs=[0.88,1,1.07][o.hrs];
  /* средние показатели смеси блюд */
  var polina=(hasSpec(s,'polina')?1.3:1)*(s.hq.upg.mkthq?1.15:1), lera=(specAt(s,'lera',o)?1.5:1)*(hasSpec(s,'vera')?1.4:1), HOL=o.hol?HOLIDAYS[cal]:null;
  var mkF={}, mkCost=0;
  SEGS.forEach(function(sg){ mkF[sg]=1; });
  MKT.forEach(function(ch){ if(!o.mk[ch.id]) return; var e=polina*((ch.id==='smm'||ch.id==='blog')?lera:1); SEGS.forEach(function(sg){ mkF[sg]+=ch.reach[sg]*e; }); mkCost+=ch.cost; });
  if(HOL) mkCost+=HOL.cost;
  if(o.mk.blog && !(env.blogOK)) { /* первый месяц блогера — если известность выше критической, обзор хороший */ }
  var absent=(!here && ownOutlets(s).length>1 && !o.mgr && o.fmt!=='fran'), steady=(s.hq.upg.secret?0.5:1)*(s.hq.upg.std?0.7:1);
  var mgrQ=o.mgr?(s.hq.upg.std?0:-2):0; if(o.mgr && specAt(s,'anton',o)) mgrQ=+3;
  var regB=(o===flagship(s))?regularBonus(s):0, repF=0.5+o.rep/100, awrF=0.42+0.95*o.awr, loyF=1+0.3*o.loy+regB, compF=1-city.comp*0.32*(1.15-o.rep/100)*modM(s,'comp',o.city);
  var facF={stu:1,off:1,fam:1,tur:1,gou:1};
  if(o.eq.kids) facF.fam*=1.15; if(o.eq.wifi){ facF.stu*=1.12; facF.off*=1.05; }
  var deco=(o.eq.deco3?3:(o.eq.deco2?2:(o.eq.deco1?1:0)));
  facF.tur*=1+0.05*deco; facF.gou*=1+0.06*deco; if(o.eq.music){ facF.gou*=1.03; facF.fam*=1.02; }
  if(HOL) SEGS.forEach(function(sg){ facF[sg]*=1+(HOL.seg[sg]||0); });
  var rwAll=sumArr(SEGS.map(function(g){ return M.seg[g].rW; }))/SEGS.length, rv=rivalsFor(s,o.city), rvQ=sumArr(rv.map(function(x){ return x.q; }))/Math.max(1,rv.length), rvP=sumArr(rv.map(function(x){ return x.p; }))/Math.max(1,rv.length), rivalP=clamp(1+(rvQ-o.rep)/250+(rwAll-rvP)/4,0.92,1.12); compF/=rivalP; res.rivalP=rivalP;
  var base={}, pool0=0, interest=0, wantSeg={}, idx=0;
  SEGS.forEach(function(sg,i){
    var b=city.seg[i]*fmt.pot*DEMAND_SCALE*(sg==='tur'?city.tur[cal]:SEGSEAS[sg][cal])*diff.dem*modM(s,'dem',o.city)*modM(s,sg,o.city)*demHrs;
    base[sg]=b; pool0+=b;
    var pr=repF*awrF*mkF[sg]*loyF, I=INTEREST_MAX*Math.tanh(pr/INTEREST_MAX)*compF*facF[sg];
    wantSeg[sg]=b*I*Math.pow(M.seg[sg].fit,1.1)*clamp(Math.pow(1/M.seg[sg].rW,VALNU[sg]),0.6,1.25);
    interest+=b*I;
  });
  var wantRaw=sumArr(SEGS.map(function(g){ return wantSeg[g]; }));
  /* смесь для расчёта единиц нагрузки на кухню */
  var share=SEGS.map(function(g){ return wantSeg[g]/Math.max(0.0001,wantRaw); });
  var upg=0, rpgA=0, cpgA=0, rWavg=0, tierA=0, itemsA=0;
  SEGS.forEach(function(g,i){ var m=M.seg[g]; upg+=share[i]*m.upg; rpgA+=share[i]*m.rpg; cpgA+=share[i]*m.cpg; rWavg+=share[i]*m.rW; tierA+=share[i]*m.tier; itemsA+=share[i]*m.items; });
  if(!isFinite(upg) || upg<=0){ upg=1; }
  /* мощности */
  var kit=kitchenCap(s,o), svc=serviceCap(s,o), kitchenGuests=kit/upg;
  var banU=0; s.accepted.forEach(function(a){ if(a.o===o.id) banU+=a.guests*2.2; });
  var banDays=Math.max(1,Math.round(banU/Math.max(1,kit)*0.5)); var banLoad=banU/(kit*30);
  kitchenGuests=Math.max(0, kit*(1-banLoad)/upg);
  /* дни месяца */
  var days=[], wk=[[1.15,1,.8,.9,.9],[1.15,1,.8,.9,.9],[1.15,1,.8,.9,.9],[1.15,1,.8,.9,.9],[1,1.1,1,1.1,1.15],[.45,.9,1.5,1.3,1.25],[.35,.8,1.45,1.2,1.1]];
  var wkm=SEGS.map(function(g,i){ var t=0; for(var d=0; d<7; d++) t+=wk[d][i]; return t/7; });
  var tot={want:0, served:0, lostCap:0, del:0, delLost:0}, dayRev=[], dayGuests=[], servedSeg={stu:0,off:0,fam:0,tur:0,gou:0}, utilSum=0;
  var start=(s.month*2+hashStr(s.seed)%7)%7, delShare=0.07*modM(s,'del',o.city)*(o.mk.deliv?1:0)*(s.hq.upg.site?1.2:1);
  for(var d=0; d<30; d++){
    var dow=(start+d)%7, wr=rng(), wx, wxF, seasonRain=0.26, snow=(cal===11||cal===0||cal===1)?1:0;
    if(wr<seasonRain) wx='rain'; else if(wr>0.93 && isSummer(cal)) wx='hot'; else if(wr>0.82) wx='sun'; else wx='cloud';
    wxF={rain:0.88, hot:0.95, sun:1.05, cloud:1}[wx]; if(snow && wx==='rain') wxF=0.9;
    var noise=0.93+rng()*0.14, w=0, wSeg={};
    SEGS.forEach(function(g,i){ wSeg[g]=wantSeg[g]*(wk[dow][i]/wkm[i])*wxF*noise; w+=wSeg[g]; });
    var terrOK=(wx==='sun'||wx==='cloud')?1:0, seatCap=seatsNow(o,cal,terrOK?0.9:0)*fmt.turns*hf.hf*(1+0.0);
    var cap=Math.min(seatCap, svc, kitchenGuests*(1+0)); if(cap<1) cap=1;
    var served=Math.min(w,cap), k=served/Math.max(0.0001,w);
    SEGS.forEach(function(g){ servedSeg[g]+=wSeg[g]*k; });
    var kitLeft=Math.max(0, kitchenGuests-served), dp=w*delShare*(wx==='rain'?1.7:1), dserv=Math.min(dp, kitLeft*0.85);
    tot.want+=w; tot.served+=served; tot.lostCap+=w-served; tot.del+=dserv; tot.delLost+=dp-dserv; utilSum+=w/cap;
    dayGuests.push(served); dayRev.push(served*rpgA+dserv*rpgA);
  }
  var util=utilSum/30;
  /* заказы, потери по причинам */
  var stockLoss=clamp((0.16-0.04*o.stock)*(1+Math.max(0,util-0.8))*(o.sup==='market'?1.25:1)-(o.eq.pos?0.01:0),0,0.2);
  var wasteBase=0.045+[ -0.010,0,0.012,0.030,0.055,0.090][clamp(o.stock,1,6)-1]*(o.eq.fridge?0.55:1)-(o.eq.fridge?0.02:0)-(o.eq.pos?0.015:0)-(s.hq.upg.logist?0.02:0)-(hasSpec(s,'oleg')?0.025:0)+supOf(s,o).waste+Math.max(0,M.dishes.length-9)*0.004;
  var waste=clamp(wasteBase*modM(s,'waste',o.city),0.02,0.22);
  var guests=tot.served, delOrders=tot.del;
  var dineRev=guests*rpgA*(1-stockLoss); var avgCheck=rpgA;
  var disc=(o.mk.loyal?0.03*0.4:0)+(o.mk.happy?0.15*0.22:0)+(o.mk.lunch?0.03:0); dineRev*=(1-disc); var merch=o.mk.merch?dineRev*0.015:0; dineRev+=merch;
  var delRev=delOrders*rpgA*1.0*(1-stockLoss)*(1-disc);
  var commission=o.mk.deliv?(o.eq.deliv?0.12:0.25)-(s.hq.upg.site?0.03:0)-(s.hq.upg.app?0.02:0):0;
  var delComm=delRev*commission, pack=delOrders*28;
  var orders=guests+delOrders, cogs=(guests*cpgA+delOrders*cpgA)*(1-stockLoss)*(1+waste)+merch*0.45;
  /* банкеты */
  var banRev=0, banCogs=0, banFail=0, banNote=[];
  s.accepted.forEach(function(a){ if(a.o!==o.id) return; var okCap=(banLoad+util*0.0)<0.75; var q=a.q||1; var good=okCap && util<1.15; banRev+=a.guests*a.price*(good?1:0.7); banCogs+=a.guests*a.price*0.34*cf/Math.max(0.9,s.cidx); if(!good) banFail++; banNote.push({id:a.id, ok:good, rev:a.guests*a.price*(good?1:0.7), name:a.name, bonus:a.bonus}); });
  /* качество и репутация */
  var cE=cookEff(s,o), wE=o.lvl.wait+(specAt(s,'lera',o)?0.3:0), bE=o.lvl.bar+(specAt(s,'lera',o)?1:0);
  var food=clamp(22+11*tierA+4*(cE-1)+supOf(s,o).q+(o.eq.espro?2:0)+(o.mor-60)*0.08+(absent?-5*steady:0)+mgrQ*0.6,0,100);
  var wpen=clamp((util-0.9)*55,0,40);
  var svcQ=clamp(46+5*(wE-1)+3*(bE-1)+(o.mor-60)*0.20+(o.eq.pos?3:0)-wpen+(s.talent==='host'?6:0)+(specAt(s,'mila',o)?7:0)+(o.staff.bar<1?-8:0)+(absent?-6*steady:0)+mgrQ+(o.mgr&&specAt(s,'anton',o)?3:0),0,100);
  var need=Math.max(0.5,Math.ceil(seatsNow(o,cal,0.5)/30)-(o.eq.dish?0.5:0)), clnR=Math.min(1,o.staff.cln/need), cln=clamp(40+45*clnR+4*(o.lvl.cln-1)+(o.eq.dish?3:0)+(absent?-3*steady:0),0,100);
  var atmo=clamp(38+deco*11+(o.eq.music?6:0)+(o.eq.terr&&cal>=4&&cal<=8?5:0)+(o.eq.kids?2:0)+(o.eq.wifi?1:0)+fmt.atmo+(o.fmt==='rest'?4:0)+modM(s,'atmo',o.city)*0-0,0,100);
  var val=clamp(80-(rWavg-1)*90,25,100);
  var score=0.34*food+0.24*svcQ+0.14*cln+0.14*atmo+0.14*val;
  var noiseR=(rng()-0.5)*3*(s.hq.upg.secret?0.5:1); var repNew=clamp(o.rep+(score-o.rep)*0.38+noiseR+(stockLoss>0.06?-1.2:0),0,100);
  /* известность и постоянные гости */
  var awrNew=o.awr*0.90+0.004;
  MKT.forEach(function(ch){ if(o.mk[ch.id]) awrNew+=ch.awr*polina*(ch.id==='smm'?lera:1)*(s.talent==='host'?1.25:1)*(ch.id==='blog'?(o.rep>=62?1:0.4):1)*0.55; });
  awrNew+=Math.min(0.03,guests/Math.max(1,seatsNow(o,cal,0.5)*fmt.turns*30)*0.04)*(s.talent==='host'?1.2:1)+(o.rep>70?0.008:0)+(o.eq.terr&&cal>=4&&cal<=8?0.006:0);
  if(s.hq.upg.brand) awrNew+=0.004; if(s.hq.upg.charity) awrNew+=0.006; awrNew+=(s.hq.brand/100)*0.008;
  awrNew=clamp(awrNew,0,1);
  var loyNew=clamp(o.loy*0.96+(o.rep>58?(o.mk.loyal?0.075:0.035):0)+(s.hq.upg.site?0.01:0)+(s.hq.upg.app?0.02:0)+(s.hq.upg.charity?0.012:0),0,1);
  /* затраты */
  var wages=outletWages(s,o), rent=city.rent*fmt.rent*modM(s,'rent',o.city)*(s.flags.rentUp?1.12:1)*(s.flags.rentDeal?0.92:1)*((s.flags.ownBuilding&&o===flagship(s))?0:1);
  var util2=fmt.util*s.cidx*(1+(cal<=1||cal===11?0.12:0))*(1+0.04*(o.eq.kitch2?1:0)+0.03*(o.eq.terr?1:0)), run=(o.eq.pos?EQD.pos.run:0)+(o.eq.music?EQD.music.run:0);
  var mk=mkCost+(o.mk.blog?0:0)+(s.flags.charityOn?0:0);
  var dineAll=dineRev+delRev+banRev, other=0.02*dineAll+run+pack;
  var reviews=makeReviews(s,o,{food:food,svc:svcQ,cln:cln,atmo:atmo,val:val,util:util,stockLoss:stockLoss,rep:repNew,rW:rWavg},rng);
  /* разбор блюд для «звёзд»: сколько продано, выручка, маржа */
  var mix=[], totOrd=0, totMar=0;
  M.dishes.forEach(function(d){ var q=0, rev=0, cost=0; SEGS.forEach(function(g){ var per=M.seg[g].per[d.id]||0; q+=per*servedSeg[g]; }); q*=(1-stockLoss)*(1-disc*0); var p=dishPrice(s,o,d); rev=q*p; cost=q*d.cost*cf*(1+waste); mix.push({id:d.id, name:d.n, cat:d.cat, qty:q, rev:rev, price:p, unit:d.cost*cf*(1+waste), mar:p-d.cost*cf*(1+waste), loc:d.loc?1:0}); totOrd+=q; });
  var avgMar=totOrd?sumArr(mix.map(function(m){ return m.mar*m.qty; }))/totOrd:0, avgQty=totOrd/Math.max(1,mix.length);
  mix.forEach(function(m){ var pop=m.qty>=avgQty*0.7, mar=m.mar>=avgMar; m.cls=pop&&mar?'star':(pop?'horse':(mar?'puzzle':'dog')); });
  /* потери по причинам: люди в месяц */
  var intAll=interest*30*1, wantAll=tot.want;
  var lostAware=Math.max(0,pool0*30-interest*30), lostMenuPrice=Math.max(0,interest*30-tot.want), lostCap=tot.lostCap, lostStock=guests*stockLoss/(1-stockLoss+0.0001);
  res.m={pool:pool0*30, aware:lostAware, menuprice:lostMenuPrice, want:tot.want, served:guests, cap:lostCap, stock:lostStock, delOrders:delOrders, delLost:tot.delLost};
  res.guests=guests; res.avgCheck=avgCheck; res.dineRev=dineRev; res.delRev=delRev; res.banRev=banRev; res.rev=dineRev+delRev+banRev;
  res.cogs=cogs+banCogs; res.wages=wages; res.rent=rent; res.util=util2; res.mkt=mk; res.other=other; res.delComm=delComm; res.waste=waste; res.stockLoss=stockLoss;
  res.dims={food:food,svc:svcQ,cln:cln,atmo:atmo,val:val}; res.score=score; res.repOld=o.rep; res.repNew=repNew; res.rating=stars(repNew); res.ratingOld=stars(o.rep);
  res.util=res.util; res.utilK=util; res.days=dayRev; res.dayGuests=dayGuests; res.mix=mix; res.reviews=reviews; res.banNote=banNote; res.banFail=banFail;
  res.caps={seat:seatsNow(o,cal,0.5)*fmt.turns*hf.hf, svc:svc, kit:kitchenGuests}; res.upg=upg; res.tierA=tierA; res.absent=absent;
  res.awrNew=awrNew; res.loyNew=loyNew; res.rW=rWavg; res.rpg=rpgA; res.segServed=servedSeg; res.segFit=SEGS.reduce(function(a,g){ a[g]=M.seg[g].fit; return a; },{}); res.segRpg=SEGS.reduce(function(a,g){ a[g]=M.seg[g].rpg; return a; },{}); res.wantDay=tot.want/30; res.cogsRate=cpgA/Math.max(1,rpgA);
  res.deductCogs=(o.sup==='market')?0:res.cogs;
  res.profitOp=res.rev-res.cogs-res.wages-res.rent-res.util-res.mkt-res.other-res.delComm;
  return res;
}
function makeReviews(s,o,q,rng){
  var out=[], n=3; var pool=[];
  function add(w,txt,st){ pool.push({w:w,t:txt,st:st}); }
  if(q.food>=72) add(3,'Очень вкусно, хочется приходить снова.',5); else if(q.food<54) add(3,'Блюда простоватые, вкус не запомнился.',2); else add(1.5,'Нормальная еда, без восторга.',3);
  if(q.svc>=70) add(2,'Приветливый персонал, быстро принесли заказ.',5); else if(q.svc<52) add(3,'Ждали заказ очень долго, официанты не успевали.',2);
  if(q.util>1.05) add(3,'Не хватило мест, пришлось стоять в очереди.',2);
  if(q.cln<55) add(2,'В зале было не очень чисто.',2); else if(q.cln>=80) add(1,'Чисто и аккуратно.',4);
  if(q.atmo>=65) add(2,'Уютно, красивый зал, приятная музыка.',5); else if(q.atmo<45) add(1.5,'Интерьер неуютный, хочется ремонта.',3);
  if(q.val<55) add(3,'Дороговато за такие порции.',2); else if(q.val>=88) add(1.5,'Цены приятные, возьму ещё.',5);
  if(q.stockLoss>0.06) add(2.5,'Любимого блюда в меню не оказалось, его уже не было.',3);
  if(o.staff.bar<1) add(1.5,'Кофе делают как будто между делом.',3);
  var tot=sumArr(pool.map(function(p){ return p.w; }));
  for(var i=0;i<n && pool.length;i++){ var r=rng()*tot, acc=0, pick=0; for(var j=0;j<pool.length;j++){ acc+=pool[j].w; if(r<=acc){ pick=j; break; } } var p=pool.splice(pick,1)[0]; tot-=p.w; out.push({t:p.t, st:p.st}); }
  return out;
}

/* ---------- франшиза: упрощённый расчёт ---------- */
function simFranchise(s,o,env,rng){
  var city=CITIES[o.city], cal=env.cal, base=sumArr(city.seg)*0.55, q=0.5+s.hq.std*0.0+(s.hq.upg.std?0.35:0)+(s.hq.upg.school?0.1:0);
  var guests=Math.min(30*3.0*0.9, base*(0.5+s.hq.brand/160)*(0.7+q*0.5)*(city.tur?1:1)*DIFFS[s.diff].dem)*30*(0.9+rng()*0.2);
  var rev=guests*340*city.inc*s.pidx; var fee=rev*0.08;
  o.rep=clamp(o.rep+((48+q*28+s.hq.brand*0.12)-o.rep)*0.3+(rng()-0.5)*3,0,100);
  return {id:o.id, city:o.city, name:o.nm, fmt:'fran', guests:guests, rev:rev, royalty:fee, rating:stars(o.rep), repNew:o.rep, support:15000};
}

/* ---------- месяц целиком ---------- */
function cloneState(s){ return JSON.parse(JSON.stringify(s)); }
function simMonth(s, opts){
  opts=opts||{}; var m=s.month, cal=CAL[m-1], R={m:m, cal:cal, act:actOf(m), outlets:[], fran:[], total:{}};
  var env={cal:cal};
  var diff=DIFFS[s.diff];
  var tag=opts.preview?'pv':'run';
  var own=ownOutlets(s), live=liveOutlets(s);
  var tot={rev:0,dineRev:0,delRev:0,banRev:0,cogs:0,wages:0,rent:0,util:0,mkt:0,other:0,delComm:0,guests:0,royalty:0,hq:0,hqWages:0};
  live.forEach(function(o){
    var rng=rngFor(s,tag+m+'|'+o.id), r=simOutlet(s,o,env,rng); R.outlets.push(r);
    ['rev','dineRev','delRev','banRev','cogs','wages','rent','util','mkt','other','delComm','guests'].forEach(function(k){ tot[k]+=r[k]; });
  });
  /* заведения на ремонте: только аренда и коммуналка */
  s.outlets.forEach(function(o){ if(o.built && o.fmt!=='fran'){ var city=CITIES[o.city], F=FORMATS[o.fmt]; var rr=city.rent*F.rent, uu=F.util*0.3; tot.rent+=rr; tot.util+=uu; R.outlets.push({id:o.id, city:o.city, name:o.nm, fmt:o.fmt, building:o.built, rent:rr, util:uu, rev:0, cogs:0, wages:0, mkt:0, other:0, delComm:0, guests:0, profitOp:-rr-uu, days:[], mix:[], reviews:[], dims:{}, rating:stars(o.rep), repNew:o.rep}); } });
  franOutlets(s).forEach(function(o){ if(o.built){ return; } var r=simFranchise(s,o,env,rngFor(s,tag+m+'|'+o.id)); R.fran.push(r); tot.royalty+=r.royalty-r.support; });
  /* штаб-квартира */
  var n=own.length;
  tot.hq=(n>=2?18000*(n-1)*s.cidx+0.012*tot.rev:0)+(s.hq.upg.charity?18000:0)+(s.hq.upg.site?6000:0)+(s.hq.upg.central?60000:0)+(s.insured?7000*n:0);
  Object.keys(s.specs).forEach(function(id){ if(SPECS[id].where==='hq') tot.hqWages+=SPECS[id].wage; });
  tot.hq+=tot.hqWages;
  var costsDeduct=tot.cogs-R.outlets.reduce(function(a,r){ return a+(r.deductCogs===0?r.cogs:0); },0)+tot.wages+tot.rent+tot.util+tot.mkt+tot.other+tot.delComm+tot.hq;
  var interest=s.debt*(BANK.rate-(s.talent==='biz'?0.003:0)-(s.hq.upg.fin?0.002:0))+s.emerg*0.035;
  var revTax=tot.rev+tot.royalty;
  var tax6=0.06*revTax, tax15=Math.max(0.01*revTax, 0.15*Math.max(0,revTax-costsDeduct-interest)), tax=(s.tax==='15'?tax15:tax6);
  if(s.flags.emmaAuto) tax=Math.min(tax6,tax15);
  if(s.hq.upg.fin) tax*=0.96;
  if(hasSpec(s,'emma')) tax*=0.92;
  var pre=tot.rev+tot.royalty-tot.cogs-tot.wages-tot.rent-tot.util-tot.mkt-tot.other-tot.delComm-tot.hq-interest;
  var div=(s.invest&&pre-tax>0)?(pre-tax)*INVESTOR.share:0; if(s.flags.nazMerge && pre-tax>0) div+=(pre-tax)*0.15;
  var profit=pre-tax-div;
  R.depInterest=s.dep*0.009; R.total=tot; R.interest=interest; R.tax=tax; R.tax6=tax6; R.tax15=tax15; R.div=div; R.profit=profit; R.pre=pre; R.revTotal=revTax; R.costsDeduct=costsDeduct;
  R.cashBefore=s.cash; R.guests=tot.guests;
  var wsum=0, rsum=0; R.outlets.forEach(function(r){ if(r.guests>0){ wsum+=r.guests; rsum+=r.rating*r.guests; } });
  R.rating=wsum?rsum/wsum:(flagship(s).rep?stars(flagship(s).rep):3);
  return R;
}
/* применяет итоги месяца к состоянию (после просмотра пользователем «Печать»), без случайностей: всё уже посчитано в R */
function applyMonth(s, R){
  var m=s.month, live=liveOutlets(s);
  s.cash+=R.profit; s.dep+=(R.depInterest||0);
  s.outlets.forEach(function(o){
    if(o.built){ o.built--; if(o.built===0){ o.openM=m+1; logEv(s,'city','Открылось заведение: '+CITIES[o.city].n); } return; }
    var r=null; R.outlets.forEach(function(x){ if(x.id===o.id) r=x; });
    if(!r || r.building) return;
    o.rep=r.repNew; o.awr=r.awrNew; o.loy=r.loyNew; o.trained={};
    (r.banNote||[]).forEach(function(b){ if(b.ok){ o.rep=clamp(o.rep+1.2+(b.bonus&&b.bonus.rep||0),0,100); o.awr=clamp(o.awr+(b.bonus&&b.bonus.awr||0),0,1); o.loy=clamp(o.loy+(b.bonus&&b.bonus.loy||0),0,1); if(b.bonus&&b.bonus.brand) s.hq.brand=clamp(s.hq.brand+b.bonus.brand,0,100); } else { o.rep=clamp(o.rep-3,0,100); } });
    var u=r.utilK; var target=64+PAYS[o.pay].mor*1.6+(u>1.05?-14:(u<0.45?-4:4))+(s.talent==='host'?6:0)+(hasSpec(s,'arsen')?3:0)+(r.absent?-8:0)+(s.hq.upg.charity?2:0)+(o.mgr?3:0)+(s.hq.upg.school?3:0)+(specAt(s,'mila',o)?4:0);
    o.mor=clamp(o.mor+(target-o.mor)*0.4,0,100);
    o.hist.push({m:m, rev:r.rev, profit:r.profitOp, guests:r.guests, rating:r.rating}); if(o.hist.length>20) o.hist.shift();
    o.last={rev:r.rev, guests:r.guests, rating:r.rating, profit:r.profitOp};
    o.mk.blog=0; if(o.hol){ s.stats.holidays++; o.hol=0; }
  });
  franOutlets(s).forEach(function(o){ if(o.built){ o.built--; if(o.built===0){ o.openM=m+1; } } });
  /* инфляция */
  var infl=DIFFS[s.diff].infl*modM(s,'infl'); s.cidx*=1+infl; s.widx*=1+infl*0.7; s.pidx*=1+infl*0.62;
  /* брендa */
  var avgRep=live.length?sumArr(live.map(function(o){ return o.rep; }))/live.length:40;
  s.hq.brand=clamp(s.hq.brand*0.985+0.5*live.length+avgRep*0.015+(s.hq.upg.brand?0.6:0)+(R.outlets.length>1?0.4:0),0,100);
  /* срок действия модификаторов */
  s.mods.forEach(function(x){ x.left--; }); s.mods=s.mods.filter(function(x){ return x.left>0; });
  /* заём и экстренный долг */
  s.emergStep=0;
  if(s.cash<0){ var need=-s.cash; s.emerg+=need; s.cash=0; s.emergStep=need; live.forEach(function(o){ o.rep=clamp(o.rep-2,0,100); }); }
  /* уходы персонала при низком настроении */
  R.quits=[];
  live.forEach(function(o){ if(o.mor<42){ var rr=rngFor(s,'quit'+m+'|'+o.id)(); if(rr<0.3){ var roles=['cook','wait','bar','cln'].filter(function(k){ return o.staff[k]>(k==='cln'?0:1); }); if(roles.length){ var role=roles[Math.floor(rngFor(s,'quitr'+m+o.id)()*roles.length)]; o.staff[role]--; R.quits.push({o:o.id, role:role}); } } } });
  R.goals=settleGoals(s,R); R.regs=updateRegulars(s,R);
  s.hist.push({m:m, rev:R.revTotal, profit:R.profit, cash:s.cash, cap:capital(s), rating:R.rating, guests:R.guests, outlets:ownOutlets(s).length});
  if(R.profit>0 && R.profit>(s.best||0)) s.best=R.profit;
  s.lastR=slimR(R);
  s.accepted=[];
  s.month++;
  return s;
}

function slimR(R){ return {m:R.m, rating:R.rating, profit:R.profit, total:R.total, tax6:R.tax6, tax15:R.tax15, interest:R.interest, outlets:R.outlets.map(function(r){ return {id:r.id, city:r.city, name:r.name, fmt:r.fmt, rev:r.rev, guests:r.guests, utilK:r.utilK, dims:r.dims, rating:r.rating, building:r.building, caps:r.caps}; })}; }
function ownerOutletValue(s){ return sumArr(s.outlets.map(function(o){ return o.fmt==='fran'?0:0.55*(o.inv||0); })); }
function capital(s){ return s.cash+(s.dep||0)-s.debt-s.emerg+ownerOutletValue(s); }
function netWorth(s){ return capital(s); }
function goalNow(s){
  var d=DIFFS[s.diff], cities=cityCountOpenWithFran(s);
  var avgR=networkRating(s);
  return {cities:cities, needCities:d.cities, cap:capital(s), needCap:d.cap, rating:avgR, needRating:d.rating,
    okCities:cities>=d.cities, okCap:capital(s)>=d.cap, okRating:avgR>=d.rating-0.001};
}
function cityCountOpenWithFran(s){ var m={}; s.outlets.forEach(function(o){ if(!o.built) m[o.city]=1; }); return Object.keys(m).length; }
function networkRating(s){ var live=liveOutlets(s).concat(franOutlets(s).filter(function(o){ return !o.built; })); if(!live.length) return 0; return sumArr(live.map(function(o){ return stars(o.rep); }))/live.length; }
function goalMet(s){ var g=goalNow(s); return g.okCities && g.okCap && g.okRating; }

/* ---------- действия игрока ---------- */
function res(ok,msg){ return {ok:ok, msg:msg||''}; }
function logEv(s,k,t){ s.log.push({m:s.month,k:k,t:t}); if(s.log.length>80) s.log.shift(); }
function pay(s, sum, why){ if(s.cash<sum) return res(false,'Не хватает денег: нужно '+rub(sum)+', в кассе '+rub(s.cash)+'.'); s.cash-=sum; return res(true); }
function A_menu(s,id,on){
  var d=DISH[id]; if(!d) return res(false); var i=s.menu.indexOf(id);
  if(on===undefined) on=(i<0);
  if(on){ if(i>=0) return res(true); if(!dishUnlocked(s,d)) return res(false,'Блюдо ещё не открыто.'); if(s.menu.length>=menuSlots(s)) return res(false,'В меню нет свободных мест ('+menuSlots(s)+'). Уберите блюдо или расширьте кухню.'); s.menu.push(id); if(!s.price[id]) s.price[id]=defPrice(s,d); return res(true,'«'+d.n+'» добавлено в меню.'); }
  if(i>=0){ s.menu.splice(i,1); return res(true,'«'+d.n+'» убрано из меню.'); } return res(true);
}
function A_price(s,id,p){ var d=DISH[id]; if(!d) return res(false); p=Math.round(p); s.price[id]=clamp(p, Math.round(d.cost*s.cidx*1.0)+1, Math.round(d.ref*s.pidx*3)); return res(true); }
function labCost(s,d){ return Math.round(d.lab*(s.talent==='cook'?0.67:1)*(s.hq.upg.rd?0.5:1)/500)*500; }
function A_lab(s,id){ var d=DISH[id]; if(!d || d.u!=='lab') return res(false); if(s.lab[id]) return res(true); if(s.month<d.min) return res(false,'Это блюдо можно разработать с '+d.min+'-го месяца.'); var c=labCost(s,d), r=pay(s,c); if(!r.ok) return r; s.lab[id]=1; return res(true,'Рецепт «'+d.n+'» разработан.'); }
function A_hire(s,oid,role){ var o=outletById(s,oid), c=ROLES[role].hire; if(!o) return res(false); if(o.staff[role]>=8) return res(false,'Слишком много людей для одного заведения.'); var r=pay(s,c); if(!r.ok) return r; o.staff[role]++; return res(true,'Нанят: '+ROLES[role].n.toLowerCase()+'.'); }
function A_fire(s,oid,role){ var o=outletById(s,oid); if(!o||o.staff[role]<=0) return res(false); if(o.staff[role]<=1 && (role==='cook'||role==='wait')) return res(false,'Нужен хотя бы один человек на этой должности.'); o.staff[role]--; return res(true); }
function trainCost(s,o,role){ return Math.round(14000*o.lvl[role]*(s.hq.upg.school?0.5:1)); }
function A_train(s,oid,role){ var o=outletById(s,oid); if(!o) return res(false); if(o.lvl[role]>=5) return res(false,'Уже максимальный уровень.'); if(o.trained[role]) return res(false,'В этом месяце уже учили эту команду.'); if(o.staff[role]<1) return res(false,'Некого учить.'); var r=pay(s,trainCost(s,o,role)); if(!r.ok) return r; o.lvl[role]++; o.trained[role]=1; o.mor=clamp(o.mor+3,0,100); return res(true,'Команда стала сильнее: уровень '+o.lvl[role]+'.'); }
function A_set(s,oid,key,val){ var o=outletById(s,oid); if(!o) return res(false); o[key]=val; return res(true); }
function A_special(s,oid,id){ var o=outletById(s,oid); if(!o) return res(false); if(o.special===id){ o.special=null; return res(true,'Блюдо дня снято.'); } if(s.menu.indexOf(id)<0 && id.indexOf('loc_')!==0) return res(false,'Сначала добавьте блюдо в меню.'); o.special=id; return res(true,'Блюдо дня выбрано: гости чаще берут его, об этом говорит доска у входа.'); }
function A_mk(s,oid,id){ var o=outletById(s,oid); if(!o) return res(false); o.mk[id]=o.mk[id]?0:1; return res(true); }
function eqCost(s,o,e){ return Math.round(e.cost*CITIES[o.city].cap/1000)*1000; }
function A_eq(s,oid,id){ var o=outletById(s,oid), e=EQD[id]; if(!o||!e) return res(false); var have=o.eq[id]||0; if(e.max? have>=e.max : have) return res(false,'Это уже куплено.'); if(e.req && !o.eq[e.req]) return res(false,'Сначала нужно «'+EQD[e.req].n+'».'); var c=eqCost(s,o,e), r=pay(s,c); if(!r.ok) return r; o.eq[id]=have+1; o.inv=(o.inv||0)+c; return res(true,'Куплено: '+e.n.toLowerCase()+'.'); }
function A_mgr(s,oid){ var o=outletById(s,oid); if(!o) return res(false); if(o.mgr){ o.mgr=0; return res(true,'Управляющий уволен.'); } var r=pay(s,MGR.hire); if(!r.ok) return r; o.mgr=1; return res(true,'Управляющий нанят.'); }
function specAvail(s,id){ var sp=SPECS[id]; if(s.month<sp.min) return false; if(id==='arsen' && !s.flags.arsenMet) return false; if(id==='lera' && !s.flags.leraMet) return false; if(id==='sonya' && !s.flags.sonyaMet) return false; if(id==='damir' && !s.flags.damirMet) return false; if(id==='anton' && s.month<9) return false; return true; }
function A_spec(s,id,oid){ var sp=SPECS[id]; if(!sp) return res(false); if(s.specs[id]){ delete s.specs[id]; var o0=outletById(s,s.specs[id]); return res(true,'Сотрудник ушёл из команды.'); } if(!specAvail(s,id)) return res(false,'Пока недоступен.'); var o=outletById(s,oid); if(sp.where==='outlet' && !o) return res(false); if(sp.where==='outlet'){ var busy=Object.keys(s.specs).filter(function(k){ return s.specs[k]===oid && SPECS[k].where==='outlet'; }).length; if(busy>=2) return res(false,'В одном заведении не больше двух особых людей.'); } var r=pay(s,sp.hire); if(!r.ok) return r; s.specs[id]=(sp.where==='hq'?'hq':oid); logEv(s,'team',sp.name+' в команде'); return res(true,sp.name+' теперь в команде.'); }
function A_hq(s,id){ var u=HQUPD[id]; if(!u||s.hq.upg[id]) return res(false); if(s.month<u.min) return res(false,'Это откроется с '+u.min+'-го месяца.'); if(u.req && !s.hq.upg[u.req]) return res(false,'Сначала: «'+HQUPD[u.req].n+'».'); if(id==='central' && ownOutlets(s).length<3) return res(false,'Центральная кухня нужна от трёх заведений.'); if(id==='buy' && ownOutlets(s).length<2) return res(false,'Совместные закупки имеют смысл от двух заведений.'); var r=pay(s,u.cost); if(!r.ok) return r; s.hq.upg[id]=1; logEv(s,'hq','Штаб: «'+u.n+'»'); return res(true,'Готово: «'+u.n+'».'); }
function loanLimit(s){ return BANK.limit+(s.hq.brand>40?500000:0)+(ownOutlets(s).length>=3?500000:0); }
function A_borrow(s,sum){ sum=Math.round(sum); if(sum<=0) return res(false); if(s.debt+sum>loanLimit(s)) return res(false,'Банк даёт не больше '+rub(loanLimit(s))+' всего.'); s.debt+=sum; s.flags.hadLoan=1; s.cash+=sum; return res(true,'Кредит получен: '+rub(sum)+'.'); }
function A_repay(s,sum){ sum=Math.round(sum); var e=Math.min(sum,s.emerg); var rest=sum-e; var d=Math.min(rest,s.debt); var tot=e+d; if(tot<=0) return res(false); if(s.cash<tot) return res(false,'Не хватает денег.'); s.cash-=tot; s.emerg-=e; s.debt-=d; return res(true,'Погашено '+rub(tot)+'.'); }
function A_invest(s){ if(s.invest) return res(false,'Инвестор уже вошёл в дело.'); s.invest=1; s.cash+=INVESTOR.sum; logEv(s,'money','В дело вошёл инвестор'); return res(true,'Артём Викторович вложил '+rub(INVESTOR.sum)+' и получает 20% прибыли.'); }
function A_tax(s,t){ s.tax=t; return res(true); }
function A_here(s,oid){ if(!outletById(s,oid)) return res(false); s.here=oid; return res(true); }
function A_sync(s){ var lst=outletDishes(s,s.outlets[0]); s.menu.forEach(function(id){ var d=DISH[id]; if(d) s.price[id]=defPrice(s,d); }); return res(true,'Цены подогнаны под рынок.'); }
function openCost(s,cityId,fmt){ var c=CITIES[cityId], F=FORMATS[fmt]; var capex=Math.round(F.capex*c.cap/10000)*10000, dep=Math.round(c.rent*F.rent*2/1000)*1000, hire=0; Object.keys(F.base).forEach(function(k){ hire+=ROLES[k].hire*F.base[k]; }); return {capex:capex, dep:dep, hire:hire, total:capex+dep+hire}; }
function cityOpenable(s,cityId){
  var c=CITIES[cityId]; if(s.outlets.some(function(o){ return o.city===cityId; })) return {ok:false,why:'Здесь уже есть заведение.'};
  if(s.month<c.min) return {ok:false,why:'Откроется с '+c.min+'-го месяца.'};
  if(!s.flags.expand) return {ok:false,why:'Сначала по сюжету нужно решиться на второй город.'};
  return {ok:true};
}
function A_open(s,cityId,fmt,nm){
  var chk=cityOpenable(s,cityId); if(!chk.ok) return res(false,chk.why);
  if(fmt==='rest' && !(flagship(s).rep>=58 || s.flags.restOK)) return res(false,'Рестораны открывают те, чья слава уже прошла город: нужен рейтинг флагмана от 3,8.');
  var c=openCost(s,cityId,fmt), r=pay(s,c.total); if(!r.ok) return r;
  var id='o'+(s.outlets.length+1); while(outletById(s,id)) id+='x';
  var o=makeOutlet(id,cityId,fmt,nm||(s.cafe+' · '+CITIES[cityId].n)); o.inv=c.capex; o.built=1; o.padj=Math.round((CITIES[cityId].inc/CITIES[flagship(s).city].inc-1)*100/5)*5; o.awr=clamp(0.10+s.hq.brand/100*0.5+(s.hq.upg.brand?0.04:0),0,1); o.rep=Math.max(o.rep, 40+s.hq.brand*0.1+(s.hq.upg.std?4:0));
  s.outlets.push(o); logEv(s,'city','Начато строительство: '+FORMATS[fmt].name.toLowerCase()+' в городе '+CITIES[cityId].n); s.flags.openedAny=1; if(fmt==='rest') s.flags.restOpen=1; if(!s.flags.firstOpenM) s.flags.firstOpenM=s.month;
  return res(true,'Вы строите «'+FORMATS[fmt].name+'» в городе '+CITIES[cityId].n+'. Откроется в следующем месяце.');
}
function A_franchise(s,cityId){
  if(!s.hq.upg.fran) return res(false,'Нужен «Пакет франшизы» в разделе «Сеть».');
  var chk=cityOpenable(s,cityId); if(!chk.ok) return res(false,chk.why); if(franOutlets(s).length>=2) return res(false,'Пока не больше двух франшиз.');
  var id='o'+(s.outlets.length+1); while(outletById(s,id)) id+='x';
  var o=makeOutlet(id,cityId,'fran',s.cafe+' · '+CITIES[cityId].n+' (франшиза)'); o.built=1; o.rep=45+s.hq.brand*0.12+(s.hq.upg.std?10:0); s.outlets.push(o);
  var fee=Math.round(280000*CITIES[cityId].inc/10000)*10000; s.cash+=fee; s.flags.franchised=1; logEv(s,'city','Первая франшиза в городе '+CITIES[cityId].n);
  return res(true,'Партнёр в городе '+CITIES[cityId].n+' заплатил '+rub(fee)+' за право работать под вашим именем.');
}
function A_close(s,oid){ var o=outletById(s,oid); if(!o||o===s.outlets[0]) return res(false,'Флагман закрывать нельзя.'); var back=Math.round(0.4*(o.inv||0)); s.cash+=back; s.outlets=s.outlets.filter(function(x){ return x!==o; }); Object.keys(s.specs).forEach(function(k){ if(s.specs[k]===oid) delete s.specs[k]; }); if(s.here===oid) s.here=s.outlets[0].id; return res(true,'Заведение закрыто, вернули '+rub(back)+' за оборудование.'); }

/* ---------- примененение последствий события/выбора ---------- */
function applyFx(s, fx, oid){
  if(!fx) return [];
  var out=[], o=oid?outletById(s,oid):outletById(s,s.here)||s.outlets[0], live=liveOutlets(s);
  function each(f){ live.forEach(f); }
  if(fx.c && fx.c<0 && s.insured){ var back=Math.round(-fx.c*0.4); fx=Object.assign({},fx,{c:fx.c+back}); out.push({k:'info', t:'страховка вернула '+rub(back)}); }
  if(fx.c){ s.cash+=fx.c; out.push({k:fx.c>0?'gain':'loss', t:(fx.c>0?'+':'−')+rub(Math.abs(fx.c)).replace('−','')}); if(s.cash<0){ s.emerg=(s.emerg||0)-s.cash; out.push({k:'warn', t:'не хватило '+rub(-s.cash)+': экстренный долг'}); s.cash=0; } }
  if(fx.rep){ each(function(x){ x.rep=clamp(x.rep+fx.rep,0,100); }); out.push({k:fx.rep>0?'gain':'loss', t:'репутация '+(fx.rep>0?'+':'−')+Math.abs(fx.rep)}); }
  if(fx.repOne){ o.rep=clamp(o.rep+fx.repOne,0,100); out.push({k:fx.repOne>0?'gain':'loss', t:'репутация '+(fx.repOne>0?'+':'−')+Math.abs(fx.repOne)}); }
  if(fx.mor){ each(function(x){ x.mor=clamp(x.mor+fx.mor,0,100); }); out.push({k:fx.mor>0?'gain':'loss', t:'настроение команды '+(fx.mor>0?'+':'−')+Math.abs(fx.mor)}); }
  if(fx.awr){ each(function(x){ x.awr=clamp(x.awr+fx.awr,0,1); }); out.push({k:fx.awr>0?'gain':'loss', t:'известность '+(fx.awr>0?'+':'−')+Math.round(Math.abs(fx.awr)*100)}); }
  if(fx.loy){ each(function(x){ x.loy=clamp(x.loy+fx.loy,0,1); }); out.push({k:'gain', t:'постоянные гости '+(fx.loy>0?'+':'−')+Math.round(Math.abs(fx.loy)*100)}); }
  if(fx.brand){ s.hq.brand=clamp(s.hq.brand+fx.brand,0,100); out.push({k:fx.brand>0?'gain':'loss', t:'бренд '+(fx.brand>0?'+':'−')+Math.abs(fx.brand)}); }
  if(fx.mod){ fx.mod.forEach(function(m){ s.mods.push({k:m.k, m:m.m, left:m.n||1, why:m.w||'', city:m.city}); out.push({k:m.m>=1?(m.k==='cogs'||m.k==='rent'||m.k==='wage'?'loss':'gain'):(m.k==='cogs'||m.k==='rent'||m.k==='wage'?'gain':'loss'), t:(m.w||m.k)+' ×'+f1(m.m)+' на '+(m.n||1)+' '+plural(m.n||1,'месяц','месяца','месяцев')}); }); }
  if(fx.flag){ (Array.isArray(fx.flag)?fx.flag:[fx.flag]).forEach(function(f){ s.flags[f]=1; }); }
  if(fx.unflag){ (Array.isArray(fx.unflag)?fx.unflag:[fx.unflag]).forEach(function(f){ delete s.flags[f]; }); }
  if(fx.rel){ Object.keys(fx.rel).forEach(function(k){ s.rel[k]=(s.rel[k]||0)+fx.rel[k]; }); }
  if(fx.recipe){ if(s.recs.indexOf(fx.recipe)<0){ s.recs.push(fx.recipe); var rc=RECIPES[fx.recipe-1]; out.push({k:'gain', t:'новый рецепт: '+rc.name}); } }
  if(fx.lab){ var d=DISH[fx.lab]; if(d && !s.lab[d.id]){ s.lab[d.id]=1; out.push({k:'gain', t:'открыто блюдо: '+d.n}); } }
  if(fx.tax){ s.tax=fx.tax; out.push({k:'info', t:'налоговый режим: '+(fx.tax==='15'?'доходы минус расходы 15%':'доходы 6%')}); }
  if(fx.rentUp){ s.flags.rentUp=1; out.push({k:'loss', t:'аренда +12%'}); }
  if(fx.rentDeal){ s.flags.rentDeal=1; out.push({k:'gain', t:'аренда −8%'}); }
  if(fx.invest){ if(!s.invest){ s.invest=1; s.cash+=INVESTOR.sum; out.push({k:'info', t:'инвестор вложил '+rub(INVESTOR.sum)+', получает 20% прибыли'}); } }
  if(fx.debt){ s.debt+=fx.debt; s.cash+=fx.debt; out.push({k:'info', t:'кредит '+rub(fx.debt)}); }
  if(fx.drop){ each(function(x){ x.stock=Math.max(1,x.stock-1); }); }
  if(fx.quit){ var role=fx.quit; if(o.staff[role]>1){ o.staff[role]--; out.push({k:'loss', t:'ушёл сотрудник'}); } }
  if(fx.eq){ var e=EQD[fx.eq]; if(e && !o.eq[fx.eq]){ o.eq[fx.eq]=1; out.push({k:'gain', t:'получено: '+e.n.toLowerCase()}); } }
  if(fx.spec){ s.flags[fx.spec+'Met']=1; }
  if(fx.buy==='building'){ s.cash-=900000; s.flags.ownBuilding=1; flagship(s).inv=(flagship(s).inv||0)+900000; out.push({k:'info', t:'здание куплено: аренды больше нет'}); if(s.cash<0){ s.emerg+=-s.cash; s.cash=0; } }
  if(fx.reg){ Object.keys(fx.reg).forEach(function(k){ var r=s.reg[k]||(s.reg[k]={h:0,m:0}); r.h=clamp(r.h+fx.reg[k],0,5); out.push({k:fx.reg[k]>0?'gain':'loss', t:REG_BY_ID[k].n+': '+(fx.reg[k]>0?'ближе':'дальше')}); }); }
  if(fx.staff){ if(o.staff[fx.staff]<8){ o.staff[fx.staff]++; out.push({k:'gain', t:'в команде новый человек: '+ROLES[fx.staff].n.toLowerCase()}); } }
  if(fx.hereMor){ o.mor=clamp(o.mor+fx.hereMor,0,100); }
  if(fx.hire){ var sp=SPECS[fx.hire]; if(sp){ s.flags[fx.hire+'Met']=1; s.specs[fx.hire]=(sp.where==='hq'?'hq':(o?o.id:s.outlets[0].id)); out.push({k:'gain', t:sp.name+' в команде'}); } }
  if(fx.emmaAuto){ s.flags.emmaAuto=1; }
  if(fx.upLvl){ var ff=flagship(s); if(ff.lvl[fx.upLvl]<5){ ff.lvl[fx.upLvl]++; out.push({k:'gain', t:'повара сильнее: уровень '+ff.lvl[fx.upLvl]}); } }
  if(fx.sup){ live.forEach(function(x){ if(x.sup!=='chain') x.sup=fx.sup; }); out.push({k:'info', t:'поставщик: '+SUPPLIERS[fx.sup].name}); }
  if(fx.priceSync){ s.menu.forEach(function(id){ var d=DISH[id]; if(d) s.price[id]=Math.round(priceOf(s,d)*1.06/5)*5; }); out.push({k:'info', t:'цены в меню +6%'}); }
  if(fx.hqUp){ if(!s.hq.upg[fx.hqUp]){ s.hq.upg[fx.hqUp]=1; out.push({k:'gain', t:'«'+HQUPD[fx.hqUp].n+'» запущено'}); } }
  return out;
}
function fxChips(fx){ var s={cash:0,flags:{},recs:[],mods:[],hq:{brand:0,upg:{}},outlets:[makeOutlet('o9','tula','cafe')],lab:{},rel:{},here:'o9',debt:0,invest:0,specs:{},menu:['espresso'],price:{},pidx:1,cidx:1,widx:1,talent:null,reg:{},insured:0}; s.outlets[0].rep=50; s.outlets[0].awr=.3; s.outlets[0].loy=.3; s.outlets[0].mor=50; s.outlets[0].eq={}; s.outlets[0].staff={cook:3,wait:3,bar:2,cln:1}; s.outlets[0].stock=3; return applyFx(s,fx,'o9'); }


/* ---------- задания месяца ---------- */
function goalsFor(s){
  if(s.goals && s.goals.m===s.month) return s.goals;
  var rng=rngFor(s,'goals'+s.month), prev=(s.goals&&s.goals.list)||[], pool=QUESTS.filter(function(q){ return q.min<=s.month && prev.indexOf(q.id)<0; }), list=[];
  for(var i=0;i<3&&pool.length;i++){ var k=Math.floor(rng()*pool.length); list.push(pool[k].id); pool.splice(k,1); }
  s.goals={m:s.month, list:list}; return s.goals;
}
function settleGoals(s,R){
  var g=s.goals; if(!g||g.m!==s.month) return [];
  var r=R.outlets.filter(function(x){ return !x.building&&x.guests>0; })[0], out=[];
  g.list.forEach(function(id){ var q=QUEST_BY_ID[id], ok=false; try{ ok=!!q.t(s,R,r); }catch(e){} if(ok){ s.cash+=q.rew; s.stats.goalsDone++; s.log.push({m:s.month,k:'goal',t:'Задание «'+q.n+'» выполнено'}); } out.push({id:id, ok:ok, rew:q.rew}); });
  return out;
}
function goalStatus(s,R){ var g=goalsFor(s), r=R&&R.outlets.filter(function(x){ return !x.building&&x.guests>0; })[0]; return g.list.map(function(id){ var q=QUEST_BY_ID[id], ok=false; try{ ok=!!(R&&q.t(s,R,r)); }catch(e){} return {id:id, ok:ok}; }); }

/* ---------- постоянные гости ---------- */
function activeRegulars(s){ return REGULARS.filter(function(r){ return r.from<=s.month; }); }
function regularBonus(s){ var h=0; activeRegulars(s).forEach(function(r){ var x=s.reg[r.id]; if(x) h+=x.h; }); return Math.min(0.25,h*0.01); }
function regFavId(s,r){ return r.fav==='loc'?('loc_'+flagship(s).city):r.fav; }
function updateRegulars(s,R){
  var f=flagship(s), have={}, out=[]; outletDishes(s,f).forEach(function(d){ have[d.id]=1; });
  activeRegulars(s).forEach(function(r){
    var x=s.reg[r.id]||(s.reg[r.id]={h:0,m:0}), fav=regFavId(s,r), d0=x.h;
    if(have[fav] && f.rep>=45) x.h=Math.min(5,x.h+1); else if(have[r.alt] && f.rep>=45) x.h=x.h; else x.h=Math.max(0,x.h-1);
    var gift=false; if(x.h>=5 && !x.gift){ x.gift=1; gift=true; s.cash+=10000; s.stats.reg5++; s.log.push({m:s.month,k:'reg',t:r.n+' стал настоящим другом кафе'}); }
    out.push({id:r.id, dh:x.h-d0, h:x.h, gift:gift});
  });
  return out;
}

/* ---------- конкуренты в городе ---------- */
function rivalsFor(s,cityId){
  var city=CITIES[cityId], rng=rngFor(s,'riv|'+cityId), n=city.comp>0.5?4:3, used={}, out=[], drift=Math.min(8,(s.month-1)*0.5);
  for(var i=0;i<n;i++){
    var k; do{ k=Math.floor(rng()*RIVAL_NAMES.length); }while(used[k]); used[k]=1;
    var style=RIVAL_STYLES[Math.floor(rng()*RIVAL_STYLES.length)], q0=48+rng()*28, p0=0.86+rng()*0.28;
    var q=clamp(q0+drift+(style==='ресторан'?4:0)-(style==='столовая'?3:0),40,92), p=p0*(s.flags.nazWar?0.92:1)*(style==='столовая'?0.9:(style==='ресторан'?1.12:1));
    out.push({n:RIVAL_NAMES[k], style:style, q:q, p:p, stars:stars(q)});
  }
  return out;
}

/* ---------- финансы: вклад, страховка, закупка впрок, праздники ---------- */
function A_dep(s,sum){ sum=Math.round(sum); if(sum<=0) return res(false); if(s.cash<sum) return res(false,'В кассе не хватает денег.'); s.cash-=sum; s.dep+=sum; return res(true,'На вклад положено '+rub(sum)+'. Он растёт на 0,9% в месяц.'); }
function A_undep(s,sum){ sum=Math.round(Math.min(sum,s.dep)); if(sum<=0) return res(false); s.dep-=sum; s.cash+=sum; return res(true,'Со вклада снято '+rub(sum)+'.'); }
function A_insure(s){ s.insured=s.insured?0:1; return res(true,s.insured?'Страховка включена: часть убытков от случайных событий вернётся.':'Страховка отключена.'); }
function forwardFee(s){ var c=s.lastR&&s.lastR.total?s.lastR.total.cogs:150000; return Math.max(15000,Math.round(0.06*c*3*0.6/1000)*1000); }
function A_forward(s){ if((s.flags.fwdUntil||0)>=s.month) return res(false,'Договор с поставщиками уже действует.'); var fee=forwardFee(s), r=pay(s,fee); if(!r.ok) return r; s.mods.push({k:'cogs',m:0.94,left:3,why:'закупка впрок'}); s.flags.fwdUntil=s.month+2; return res(true,'Цена продуктов зафиксирована на три месяца: −6%.'); }
function A_hol(s,oid){ var o=outletById(s,oid); if(!o) return res(false); o.hol=o.hol?0:1; return res(true,o.hol?'Праздничная кампания запланирована.':'Кампания отменена.'); }
