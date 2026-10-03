var sim=require('./sim.js'); var fs=require('fs'), vm=require('vm');
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function playOpt(cfg, seed){
  var rng=mulberry(seed), s=newState('b'), log=[];
  for(var m=1;m<=16;m++){
    EVENTS[m-1].choices[cfg.choice[m-1]].apply(s,rng);
    if(cfg.buy) cfg.buy(s,m);
    if(m===11&&cfg.dep){var a=Math.min(cfg.dep,Math.max(0,s.cash-50000)); if(a>0){s.cash-=a;s.savings+=a;}}
    var best=null, cap=capacity(s), c=unitCost(s);
    var adIdx = cfg.ad(s,m);
    for(var p=Math.max(c+50,300);p<=2200;p+=10){
      var d=demandAt(s,p,adIdx,1); var prod=clamp(Math.round(d*1.03)-s.inv,0,cap);
      while(prod>0&&prod*c+AD[adIdx].cost>s.cash)prod--;
      var pv=netProfitPreview(s,{price:p,produce:prod,adIdx:adIdx},d);
      if(!best||pv.profit>best.pv.profit) best={p:p,prod:prod,pv:pv};
    }
    if(cfg.fixedPrice){ best.p=cfg.fixedPrice; var d2=demandAt(s,best.p,adIdx,1); best.prod=clamp(Math.round(d2)-s.inv,0,cap); while(best.prod>0&&best.prod*c+AD[adIdx].cost>s.cash)best.prod--; }
    var r=runMonth(s,{price:best.p,produce:best.prod,adIdx:adIdx},rng);
    log.push([m,best.p,best.prod,r.demand,r.sold,r.profit,r.nw,cap].join(' '));
  }
  return {nw:netWorth(s),log:log};
}
function buyer(list,thr){return function(s,m){list.forEach(function(id){ var u=UPGRADES.filter(function(x){return x.id===id})[0]; if(!s.up[id]&&m>=u.from&&s.cash>u.cost+thr){s.cash-=u.cost;s.up[id]=true;}});};}
var all=['press','online','brandkit','designer','workshop','line'];
var cfgs={
 smart:{choice:[1,1,1,1,0,1,0,1,0,2,0,2,0,0,1,0],buy:buyer(all,25000),ad:function(s,m){return s.cash>80000?2:(s.cash>20000?1:0)},dep:20000},
 smartLoan200:{choice:[1,1,0,1,0,1,0,1,0,0,0,2,0,0,1,0],buy:buyer(all,25000),ad:function(s,m){return s.cash>80000?2:(s.cash>20000?1:0)},dep:20000},
 midNoShop:{choice:[1,1,1,1,2,0,2,1,2,1,1,0,2,2,2,1],buy:buyer(['press','online'],25000),ad:function(s,m){return 1},dep:0},
 passive:{choice:[2,2,2,0,2,0,2,2,2,2,2,1,2,2,2,2],buy:buyer([],0),ad:function(){return 0},dep:0},
 naive900:{choice:[1,1,1,1,0,0,0,1,0,2,0,2,0,0,1,0],buy:buyer(all,25000),ad:function(){return 1},fixedPrice:900,dep:0},
};
Object.keys(cfgs).forEach(function(k){ var out=[]; for(var sd=1;sd<=6;sd++) out.push(playOpt(cfgs[k],sd).nw); console.log(k,out.map(function(x){return Math.round(x/1000)+'k'}).join(' ')); });
if(process.argv[2]){ console.log(playOpt(cfgs[process.argv[2]],3).log.join('\n')); }
