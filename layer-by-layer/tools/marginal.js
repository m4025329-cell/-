/* Средний итог при выборе каждого варианта в каждой сцене (случайные остальные решения) */
var fs=require('fs'), vm=require('vm'), path=require('path');
var sim=require('./sim.js');
var N=parseInt(process.argv[2]||'240',10), kind=process.argv[3]||'human';
/* для сбора: переопределяем POL.random через случайные выборы и запоминаем */
var stats={}; // key 'stage:choice' -> {sum,n}
var stageNames=['M1 материалы','M2 Лиза','M3 Макс','M4 заказ','M5 помещение','M6a налоги','M6b канал','M7a принтер','M7b персонал','M8 риск','M9 финансы','M10 инфляция','M11 копии','M12 курс','M13 ночь','M14 гигант','M15a кризис','M15b протезы','M16 финал'];
var mulb=function(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
for(var sd=1;sd<=N;sd++){
  var r0=mulb(sd*7919); var prefs=[]; for(var q=0;q<19;q++) prefs.push(Math.floor(r0()*4));
  sim.POL.__tmp=prefs;
  var res=sim.runGame(kind,'__tmp',sd);
  var used=res.s.__picked||prefs; 
  for(var i=0;i<19;i++){ var k=i+':'+used[i]; (stats[k]=stats[k]||{sum:0,n:0}); stats[k].sum+=res.cap; stats[k].n++; }
}
stageNames.forEach(function(nm,i){
  var row=[]; for(var c=0;c<4;c++){ var st=stats[i+':'+c]; row.push(st?(Math.round(st.sum/st.n/1000)+'k'):'  - '); }
  console.log(nm.padEnd(16), row.join('  '));
});
