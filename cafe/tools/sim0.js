require('./load.js');
function run(policy, seed, diff){
  var s=newState({name:'Бот',seed:seed,diff:diff||'norm',talent:'cook'});
  var rows=[];
  for(var m=1;m<=TOTAL;m++){
    policy(s,m);
    var R=simMonth(s); var f=R.outlets[0];
    rows.push([m, Math.round(R.revTotal/1000), Math.round(R.profit/1000), Math.round(s.cash/1000), f&&f.guests?Math.round(f.guests/30):0, f&&f.rating?f.rating.toFixed(2):'-', f&&f.utilK?f.utilK.toFixed(2):'-']);
    applyMonth(s,R);
  }
  return {s:s,rows:rows};
}
var pol={
  passive:function(s,m){},
  basic:function(s,m){ var o=s.outlets[0]; if(m===1){ o.mk.smm=1; } }
};
Object.keys(pol).forEach(function(k){ var r=run(pol[k],'t1'); console.log('--',k); console.log('m rev prof cash gpd rating util'); r.rows.forEach(function(x){ console.log(x.join('\t')); }); console.log('capital',Math.round(capital(r.s)/1000)); });
