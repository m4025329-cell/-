/* Боты для проверки баланса: пассивный, разумный и «жадный к расширению». */
require('./load.js');
function utilOf(R,id){ var r=R&&R.outlets.filter(function(x){ return x.id===id; })[0]; return r&&r.utilK||0; }
function good(opts){
  opts=opts||{};
  var order=['deco1','wifi','oven','seats','espro','fridge','terr','pos','kids','deco2','music','kitch2','dish','seats','deco3'];
  return function(s,m,lastR){
    var o=s.outlets[0];
    if(m===1){ o.mk.smm=1; o.mk.flyer=1; A_menu(s,'veg',true); A_hire(s,o.id,'cln'); }
    if(m===3) A_hire(s,o.id,'bar');
    if(m>=2){ A_lab(s,'raf'); }
    if(m>=5){ A_lab(s,'cheesec'); A_lab(s,'caesar'); }
    if(m===5 && s.cash>200000){ A_menu(s,'napoleon',true); }
    s.outlets.forEach(function(x){
      if(x.built||x.fmt==='fran') return;
      var rr=lastR&&lastR.outlets.filter(function(z){ return z.id===x.id; })[0];
      if(rr && rr.caps && rr.utilK>0.95){ var c=rr.caps, mn=Math.min(c.seat,c.svc,c.kit);
        if(mn===c.svc && s.cash>60000){ if(x.staff.wait<=x.staff.bar+1) A_hire(s,x.id,'wait'); else A_hire(s,x.id,'bar'); }
        else if(mn===c.kit && s.cash>80000) A_hire(s,x.id,'cook');
        else if(mn===c.seat){ if(!x.eq.terr && s.cash>eqCost(s,x,EQD.terr)+100000) A_eq(s,x.id,'terr'); else if((x.eq.seats||0)<2 && s.cash>eqCost(s,x,EQD.seats)+100000) A_eq(s,x.id,'seats'); else if(x.hrs<2 && m>=5) x.hrs=2; } }
      if(s.cash>150000 && m>=3){ ['cook','wait','bar'].forEach(function(r){ if(x.lvl[r]<3 && s.cash>150000+trainCost(s,x,r)) A_train(s,x.id,r); }); }
      for(var i=0;i<order.length;i++){ var e=EQD[order[i]]; var have=x.eq[e.id]||0; if((e.max?have>=e.max:have)) continue; if(e.req && !x.eq[e.req]) continue; if(s.cash>eqCost(s,x,e)+170000 && m>=2){ A_eq(s,x.id,e.id); } break; }
      if(m>=2 && s.cash>180000){ if(!x.mk.corp && m>=6) x.mk.corp=1; }
      if(x.rep>58 && s.cash>200000) x.mk.loyal=1;
      if(m>=9 && !x.mgr && x!==s.outlets[0] && s.cash>200000) A_mgr(s,x.id);
    });
    if(opts.pro){
      s.outlets.forEach(function(x){ if(x.built||x.fmt==='fran') return; x.stock=4; if(x.mor<62 && s.cash>150000) x.pay=2; if(x.staff.cln<1 && s.cash>25000) A_hire(s,x.id,'cln'); if(!x.mk.corp && m>=4) x.mk.corp=1; if(!x.mk.happy && m>=3) x.mk.happy=1; if(!x.mk.smm) x.mk.smm=1; if(x.rep>=64 && s.cash>150000 && m%3===0) x.mk.blog=1; if(x.fmt==='cafe'&&x.sup==='whole'&&s.cash>200000&&m>=6) x.sup='farm'; });
      if(m>=2 && !s.specs.lera && s.cash>120000) A_spec(s,'lera',o.id);
      if(m>=6 && s.flags.sonyaMet && !s.specs.sonya && s.cash>250000) A_spec(s,'sonya',o.id);
      if(m>=6 && !s.specs.polina && s.cash>350000) A_spec(s,'polina','hq');
      if(m>=7 && !s.specs.gleb && ownOutlets(s).length>=2 && s.cash>350000) A_spec(s,'gleb','hq');
      if(m>=3){ s.flags.sonyaMet=s.month>=5; }
    }
    if(m===3) A_tax(s,'15');
    if(m>=9) s.flags.expand=1; if(m>=3) s.flags.arsenMet=1;
    if(m>=2 && !s.specs.arsen && s.cash>260000) A_spec(s,'arsen',o.id);
    if(m>=3 && s.cash>300000 && !s.specs.emma) A_spec(s,'emma','hq');
    if(opts.lev && m>=(opts.at||9)){ if(!s.invest && opts.inv!==false) A_invest(s); var need=2000000; if(s.debt<loanLimit(s) && s.cash<need) A_borrow(s,Math.min(loanLimit(s)-s.debt, need-s.cash)); }
    s.outlets.forEach(function(x){ if(!x.built && x!==s.outlets[0] && x.fmt==='cafe'){ if(!x.mk.smm) x.mk.smm=1; if(!x.eq.pos && s.cash>60000+eqCost(s,x,EQD.pos)) A_eq(s,x.id,'pos'); if(x.staff.cln<1 && s.cash>20000) A_hire(s,x.id,'cln'); } });
    if(opts.expand && m>=(opts.at||9)){
      var ids=opts.cities||['nnov','kazan','ekb','sochi','spb','kgd'], want=DIFFS[s.diff].cities;
      for(var k=0;k<ids.length;k++){ if(cityCountOpenWithFran(s)+s.outlets.filter(function(x){return x.built;}).length>=want+(opts.extra||0)) break; var c=openCost(s,ids[k],'cafe'); if(cityOpenable(s,ids[k]).ok && s.cash>c.total+(opts.reserve||150000)){ A_open(s,ids[k],'cafe'); } }
      if(m>=10) HQUP.forEach(function(u){ if((u.id==='std'||u.id==='buy'||u.id==='school') && !s.hq.upg[u.id] && s.cash>u.cost+300000) A_hq(s,u.id); });
    }
    if(s.cash<30000 && s.debt<loanLimit(s)) A_borrow(s,Math.min(200000,loanLimit(s)-s.debt));
  };
}
function run(policy, seed, diff, talent){
  var s=newState({name:'Бот',seed:seed,diff:diff||'norm',talent:talent||'cook'}), last=null;
  for(var m=1;m<=TOTAL;m++){ policy(s,m,last); var R=simMonth(s); last=R; applyMonth(s,R); if(s.emerg>600000){ s.bankrupt=m; break; } }
  return s;
}
function runTo(policy, seed, upTo, diff){
  var s=newState({name:'Бот',seed:seed,diff:diff||'norm',talent:'cook'}), last=null, R=null;
  for(var m=1;m<=upTo;m++){ policy(s,m,last); R=simMonth(s); last=R; if(m<upTo) applyMonth(s,R); }
  return {s:s,R:R};
}
module.exports={run:run,runTo:runTo,good:good};
if(require.main===module){
  var diff=process.argv[2]||'norm';
  var variants={passive:function(){}, good:good({}), expand:good({expand:true}), lev:good({expand:true,lev:true,reserve:60000}), lev8:good({expand:true,lev:true,at:8,reserve:60000}), pro:good({expand:true,lev:true,at:8,reserve:60000,pro:true}), pro7:good({expand:true,lev:true,at:7,reserve:60000,pro:true})};
  Object.keys(variants).forEach(function(k){
    var res=[]; for(var sd=1;sd<=6;sd++){ var s=run(variants[k],'b'+sd,diff); var g=goalNow(s); res.push({cap:Math.round(capital(s)/1000), cities:g.cities, rt:g.rating.toFixed(2), ok:goalMet(s), bk:s.bankrupt||0, cash:Math.round(s.cash/1000), debt:Math.round((s.debt+s.emerg)/1000)}); }
    console.log(k, res.map(function(r){ return r.cap+'k/'+r.cities+'c/'+r.rt+(r.ok?'✓':'')+(r.bk?'BK'+r.bk:'')+'/d'+r.debt; }).join('  '));
  });
}
