var sim=require('./sim.js'); var res=[]; for(var sd=1;sd<=40;sd++){ res.push(sim.runGame('human','random',sd).cap); } res.sort(function(a,b){return a-b;});
console.log('human/random-choices n=40: min',Math.round(res[0]/1000),'p25',Math.round(res[10]/1000),'median',Math.round(res[20]/1000),'p75',Math.round(res[30]/1000),'max',Math.round(res[39]/1000));
var res2=[]; for(sd=1;sd<=40;sd++){ res2.push(sim.runGame('avg','random',sd).cap); } res2.sort(function(a,b){return a-b;});
console.log('avg/random-choices n=40: min',Math.round(res2[0]/1000),'p25',Math.round(res2[10]/1000),'median',Math.round(res2[20]/1000),'p75',Math.round(res2[30]/1000),'max',Math.round(res2[39]/1000));
