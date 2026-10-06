var B=require('./bots.js');
var pol=B.good({}), s=newState({name:'Бот',seed:'b1',diff:'norm',talent:'cook'}), last=null;
for(var m=1;m<=16;m++){ pol(s,m,last); var R=simMonth(s); last=R; var r=R.outlets[0];
 console.log(m,'rev',Math.round(R.revTotal/1000),'cogs',Math.round(R.total.cogs/1000),'wag',Math.round(R.total.wages/1000),'rent',Math.round(R.total.rent/1000),'oth',Math.round(R.total.other/1000+R.total.util/1000+R.total.mkt/1000),'tax',Math.round(R.tax/1000),'int',Math.round(R.interest/1000),'prof',Math.round(R.profit/1000),'cashB',Math.round(s.cash/1000),'g/d',Math.round(r.guests/30),'u',r.utilK.toFixed(2),'rt',r.rating.toFixed(2),'staff',JSON.stringify(s.outlets[0].staff));
 applyMonth(s,R); }
