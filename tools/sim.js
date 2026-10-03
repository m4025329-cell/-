var fs=require('fs');
var vm=require('vm');
vm.runInThisContext(fs.readFileSync(__dirname+'/../src/engine.js','utf8').replace("if(typeof module","if(false && typeof module"));
vm.runInThisContext(fs.readFileSync(__dirname+'/../src/data.js','utf8'));
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
// policy: p = {choice:[idx per event], smart:true}
function play(policy, seed){
  var rng=mulberry(seed||1), s=newState('bot'), rows=[];
  for(var m=1;m<=16;m++){
    var ev=EVENTS[m-1], ci=policy.choice[m-1]; ev.choices[ci].apply(s,rng);
    // upgrades
    if(policy.buy) policy.buy(s,m);
    if(m===11&&policy.deposit) { var a=Math.min(policy.deposit,Math.max(0,s.cash-60000)); if(a>0){s.cash-=a;s.savings+=a;} }
    var c=unitCost(s), cap=capacity(s), ref=refPrice(s);
    var price = policy.fixedPrice || Math.round(c*ELASTICITY/(ELASTICITY-1)/10)*10; price=Math.max(price, 0);
    var ad = policy.ad(s,m);
    var d = demandAt(s,price*(s.discount),ad,1); // naive
    var disc=s.discount; 
    var want = Math.round(d*policy.over) - s.inv;
    var produce = clamp(want,0,cap);
    var spend = function(p){return p*c+AD[ad].cost};
    while(produce>0 && spend(produce)>s.cash) produce--;
    if(policy.produceFixed!==undefined) produce=Math.min(policy.produceFixed,cap);
    var r=runMonth(s,{price:price,produce:produce,adIdx:ad},rng);
    rows.push([m,price,produce,r.demand,r.sold,r.revenue,r.profit,r.nw, cap].join(' '));
  }
  return {nw:netWorth(s),rows:rows,s:s};
}
module.exports={play:play};
if(require.main===module){
 var smart={choice:[1,1,1,1,0,0,0,1,0,2,0,2,0,0,1,0], over:1.0, ad:function(s,m){return s.cash>80000?2:(s.cash>20000?1:0)},
   buy:function(s,m){ function B(id,cost){ if(!s.up[id] && s.cash>cost+25000){ var u=UPGRADES.filter(function(x){return x.id===id})[0]; if(m>=u.from){s.cash-=cost;s.up[id]=true;} } }
     B('press',25000);B('online',18000);B('brandkit',35000);B('designer',0);B('workshop',150000);B('line',300000);} , deposit:20000};
 var res=play(smart,1);console.log('SMART nw',res.nw);console.log(res.rows.join('\n'));
}
