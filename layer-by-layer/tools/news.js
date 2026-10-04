/* Проверка новостей рынка, разбора партии и новых клиентов/исследований */
require('./load.js');
var bad=0; function ok(c,m){ console.log((c?'ok   ':'FAIL ')+m); if(!c) bad++; }
function game(seed, run){ var s=newState('Т',{seed:seed}); applySetup(s,{shop:'Т',talent:'eng'}); for(var m=1;m<=TOTAL;m++){ s.month=m; refreshUnlocks(s); if(run){ suggestPlan(s); runMonth(s); } } return s; }
/* новости */
var a=game('нов1',false), b=game('нов1',false), c=game('нов2',false);
ok(JSON.stringify(a.news)===JSON.stringify(b.news),'одинаковый код класса даёт одинаковые новости');
ok(JSON.stringify(a.news)!==JSON.stringify(c.news),'разные коды дают разные новости');
var cnt=0, early=0, lead=true; for(var sd=1;sd<=100;sd++){ var g=game('н'+sd,false); cnt+=g.news.length; g.news.forEach(function(n){ if(n.start-n.announced<1||n.start-n.announced>2) lead=false; if(n.announced<2) early++; }); }
ok(cnt/100>=2.5 && cnt/100<=8,'за игру в среднем '+(cnt/100).toFixed(1)+' новостей'); ok(lead,'новость объявляют за 1–2 месяца'); ok(early===0,'в первом месяце новостей нет');
var s=newState('Т',{seed:'мод'}); applySetup(s,{shop:'Т',talent:'eng'}); s.month=5; s.news=[{id:'tourney',start:5,announced:3,on:false}]; var d0=demandAt(s,'mini',560,s.plan,1); refreshUnlocks(s); s.unlocked.mini=true; var d1=demandAt(s,'mini',560,s.plan,1);
ok(d1>d0*1.2,'новость «Турнир настольных игр» повышает спрос на фигурки ('+Math.round(d0)+' → '+Math.round(d1)+')');
ok(newsActive(s).length===1 && newsUpcoming(s).length===0,'активная новость определяется верно');
var t=newState('Т',{seed:'мод2'}); t.month=6; t.news=[{id:'tax',start:6,announced:4,on:false}]; var f0=filMarket(t); refreshUnlocks(t); ok(filMarket(t)>f0*1.05,'пошлина удорожает пластик');
/* разбор партии */
var full=game('разб',true), ins=gameInsights(full); ok(ins.length>=5 && ins.every(function(x){ return x.title && x.text && x.text.length>20 && !/NaN|undefined/.test(x.text); }),'разбор партии содержит '+ins.length+' пунктов без пустых мест');
/* новые клиенты и исследования */
['library','bakery','sport','wedding','kinder','tour'].forEach(function(id){ ok(!!CLIENTS[id] && CLIENTS[id].likes.length>0,'клиент «'+CLIENTS[id].name+'» описан'); });
['spare','dry','batch','web','multi','param'].forEach(function(id){ var r=RESEARCH_BY_ID[id]; ok(!!r && r.cost>0,'исследование «'+(r&&r.name)+'»'); });
var dry=newState('Т',{seed:'суш'}); applySetup(dry,{shop:'Т',talent:'eng'}); dry.month=6; dry.fil.kg=30; dry.fil.val=30*1400; RESEARCH_BY_ID.dry.apply(dry); var rd=runMonth(dry); ok(!rd.wet && !dry.mods.some(function(m){ return m.label==='Отсыревший пластик'; }),'сушилка снимает отсыревание');
var tp=newState('Т',{seed:'пар'}); tp.month=8; var h0=hoursPerUnit(tp,'part','std'); RESEARCH_BY_ID.param.apply(tp); ok(hoursPerUnit(tp,'part','std')<h0*0.95,'параметрическое моделирование ускоряет запчасти');
console.log(bad?('ПРОВАЛОВ: '+bad):'Новости, разбор, контент: всё в порядке'); process.exit(bad?1:0);
