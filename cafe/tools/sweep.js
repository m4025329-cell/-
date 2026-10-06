const B=require('./bots.js');
function avg(pol,diff){ let c=0,k=0,ok=0,rt=0,cities=0; for(let sd=1;sd<=5;sd++){ const s=B.run(pol,'b'+sd,diff); c+=capital(s); const g=goalNow(s); if(goalMet(s)) ok++; rt+=g.rating; cities+=g.cities; k++; } return Math.round(c/k/1000)+'k/'+(cities/k).toFixed(1)+'c/'+(rt/k).toFixed(2)+'/ok'+ok; }
const combos=[[0.97,2.1]];
for(const [d,m] of combos){ global.__d=d;  console.log('D',d,'M',m,'| passive',avg(()=>{}, 'norm'),'| good',avg(B.good({}),'norm'),'| lev8',avg(B.good({expand:true,lev:true,at:8,reserve:60000}),'norm')); }
for(const d of ['easy','hard']){ console.log(d,'| passive',avg(()=>{}, d),'| good',avg(B.good({}),d),'| lev8',avg(B.good({expand:true,lev:true,at:8,reserve:60000}),d),'| lev7',avg(B.good({expand:true,lev:true,at:7,reserve:60000}),d)); }
