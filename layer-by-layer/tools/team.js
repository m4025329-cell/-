/* Проверка команды специалистов и заданий */
require('./load.js');
var bad=0; function ok(c,m){ console.log((c?'ok   ':'FAIL ')+m); if(!c) bad++; }
function mk(month){ var s=newState('Т',{seed:'ком'}); applySetup(s,{shop:'Т',talent:'sel'}); s.month=month||6; s.cash=100000; s.unlocked.mini=true; return s; }
var s=mk(6), c0=s.cash, f0=fixedParts(s).total;
ok(hireSpec(s,'ruslan').ok && s.cash===c0-SPECS.ruslan.hire,'найм списывает оформление');
ok(fixedParts(s).team===SPECS.ruslan.salary && fixedParts(s).total===f0+SPECS.ruslan.salary,'зарплата входит в постоянные расходы');
var h1=printerHours(mk(6)), h2=printerHours(s); ok(h2>h1,'Руслан даёт часы печати: '+h1+' → '+h2);
ok(failRate(s,'std')<failRate(mk(6),'std'),'Руслан снижает брак');
var d0=demandAt(mk(6),'key',120,mk(6).plan,1); hireSpec(s,'sonya'); ok(demandAt(s,'key',120,s.plan,1)>d0,'Соня повышает спрос');
ok(!canHire(s,'katya').ok,'школьный кабинет вмещает двоих: третьего не нанять ('+canHire(s,'katya').why+')');
fireSpec(s,'sonya'); ok(canHire(s,'katya').ok,'после увольнения место освобождается');
var g=mk(6); hireSpec(g,'igor'); ok(packOf(g,'key')<packOf(mk(6),'key'),'Игорь удешевляет упаковку');
ok(!canHire(mk(3),'nina').ok,'специалисты приходят по расписанию');
/* задания */
var q=mk(2); ok(questAvailable(q,'olymp') && !questAvailable(q,'allround'),'доступны только задания своего времени');
ok(takeQuest(q,'olymp').ok && questsActive(q).length===1,'задание берётся');
['hundred','quality','eco'].forEach(function(id){ q.month=7; takeQuest(q,id); });
ok(questsActive(q).length===QUEST_MAX,'одновременно не больше '+QUEST_MAX);
q=mk(3); takeQuest(q,'hundred'); q.cash=70000; var r=runMonth(q); questTick(q,r); ok(q.quests.hundred.stage===1 && r.quests.some(function(x){ return x.kind==='stage'; }),'шаг выполняется и платит награду');
var f=mk(3); takeQuest(f,'hundred'); f.quests.hundred.left=1; f.cash=10; var rf=runMonth(f); questTick(f,rf); ok(f.quests.hundred.state==='failed','без выполнения срок выходит');
var all=mk(6); QUESTS.forEach(function(Q){ if(Q.stages.length<1 || !Q.name) bad++; Q.stages.forEach(function(st){ if(!st.text||!(st.reward>0)||!st.months||typeof st.test!=='function') bad++; }); });
ok(true,'у всех заданий описаны шаги, награды и сроки ('+QUESTS.length+')');
console.log(bad?('ПРОВАЛОВ: '+bad):'Команда и задания: всё в порядке'); process.exit(bad?1:0);
