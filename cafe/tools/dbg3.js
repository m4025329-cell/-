const B=require('./bots.js'); const pol=B.good({expand:true,lev:true,at:8,reserve:60000}); const s=newState({name:'Б',seed:'b1',diff:'norm',talent:'cook'}); let last=null;
for(let m=1;m<=16;m++){ pol(s,m,last); const R=simMonth(s); last=R; const row=R.outlets.map(r=>r.building?('B'+r.building):(CITIES[r.city].n.slice(0,3)+' '+Math.round(r.guests/30)+'g '+Math.round(r.rev/1000)+'k '+Math.round(r.profitOp/1000)+'p r'+r.rating.toFixed(1))).join(' | ');
  console.log(m, 'cash',Math.round(s.cash/1000),'prof',Math.round(R.profit/1000),'hq',Math.round(R.total.hq/1000),'int',Math.round(R.interest/1000),'div',Math.round(R.div/1000),'::',row); applyMonth(s,R); }
console.log('cap',Math.round(capital(s)/1000));
