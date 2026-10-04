/* ===== Режимы игры и конкуренты =====
   Режим выбирается при создании мастерской: сюжет, испытание с особыми условиями или песочница без сюжетных сцен.
   Конкуренты (Макс и «МегаПринт») меняют цены понемногу каждый месяц, и спрос зависит от того, дешевле ты или дороже них. */

var SCENARIOS = {
  story:   {id:'story', name:'Сюжет', icon:'book', goal:1000000,
            about:'Полная история на 16 месяцев: сцены, герои, выбор. Цель: капитал 1 000 000 ₽.',
            apply:function(s){}},
  crisis:  {id:'crisis', name:'Кризис', icon:'storm', goal:600000,
            about:'Мастерская в долгах: на счёте 12 000 ₽, кредит 40 000 ₽, репутация почти нулевая. Нужно выжить и выйти в плюс. Цель: 600 000 ₽.',
            apply:function(s){ s.cash=12000; s.loanLeft=40000; s.loanStep=3400; s.rep=12; s.unlock.loan=true; s.overdrafts=1; }},
  rich:    {id:'rich', name:'Быстрый старт', icon:'bolt', goal:1600000,
            about:'Три принтера, 90 000 ₽ и коворкинг, но цель выше: 1 600 000 ₽. Нужно быстро наращивать обороты.',
            apply:function(s){ s.cash=90000; s.printers=[{t:'old',age:99},{t:'std',age:0},{t:'std',age:0}]; s.space='cowork'; s.rep=20; }},
  giant:   {id:'giant', name:'Гигант рядом', icon:'users', goal:700000,
            about:'Макс и «МегаПринт» сбивают цены с самого начала, спрос слабее. Выживает тот, кто занимает свою нишу. Цель: 700 000 ₽.',
            apply:function(s){ s.comp={max:0.84,mega:0.88}; s.compVol=1.6; PROD_IDS.forEach(function(id){ s.pdm[id]*=0.94; }); }},
  craft:   {id:'craft', name:'Ремесленник', icon:'wrench', goal:850000,
            about:'Только штучная работа: режим «Быстро» запрещён, зато заказы оплачиваются на 12% выше. Цель: 850 000 ₽.',
            apply:function(s){ s.noDraft=true; s.orderBonus=1.12; }},
  sandbox: {id:'sandbox', name:'Песочница', icon:'grid', goal:1000000,
            about:'Без сюжетных сцен: только экономика, заказы, задания и случаи в мастерской. Месяцы идут быстрее. Цель: 1 000 000 ₽.',
            apply:function(s){ s.sandbox=true; }}
};
var SCENARIO_IDS = Object.keys(SCENARIOS);
function scenarioOf(s){ return SCENARIOS[s.scenario||'story'] || SCENARIOS.story; }
function setGoal(s){ GOAL = (s && s.goal) || 1000000; return GOAL; }
function applyScenario(s, id){
  var sc=SCENARIOS[id]||SCENARIOS.story; s.scenario=sc.id; s.goal=sc.goal; sc.apply(s); setGoal(s); return s;
}
/* пересчёт капитала к «шкале в миллион» для званий и вех */
function capNorm(cap){ return cap*1000000/(GOAL||1000000); }

/* ---------- конкуренты ---------- */
function compSide(id){ return (id==='part'||id==='proto') ? 'mega' : 'max'; }
function compOf(s, id){ var c=s.comp; return c ? (c[compSide(id)]||1) : 1; }
/* цена конкурента на этот товар */
function compPrice(s, id){ return Math.max(5, Math.round(refPrice(s,id)*compOf(s,id)/5)*5); }
/* множитель спроса: дешевле конкурента — больше покупателей, дороже — меньше (мягко, чтобы не ломать кривую спроса) */
function compFactor(s, id, price){
  if(!s.comp) return 1;
  var f=Math.pow(Math.max(5,refPrice(s,id))*compOf(s,id)/Math.max(5,price), 0.3);
  return clamp(f, 0.82, 1.18);
}
function compTick(s, r){
  s.comp=s.comp||{max:1, mega:1}; s.compHist=s.compHist||[]; var m=s.month, vol=s.compVol||1, rng=rngFor(s,'comp'+m);
  var a=(rng()-0.5)*0.12*vol, b=(rng()-0.5)*0.12*vol;
  s.comp.max = clamp(s.comp.max*(1+a) + 0.18*(1-s.comp.max), 0.78, 1.22);
  s.comp.mega = m>=6 ? clamp(s.comp.mega*(1+b) + 0.18*(1-s.comp.mega), 0.78, 1.22) : s.comp.mega;
  s.compHist.push({m:m, max:Math.round(s.comp.max*1000)/1000, mega:Math.round(s.comp.mega*1000)/1000});
  if(s.compHist.length>17) s.compHist.shift();
  if(r) r.compMove={max:a, mega:b};
}

/* ---------- песочница: месяц без сюжетной сцены ---------- */
function sandboxStage(s){
  return {
    tag:'Рабочий месяц', term:'kpi',
    lines:[
      say('phil','happy',HINTS[s.month-1]),
      say('nina','neutral','Сюжетных событий в этом режиме нет: всё решает твоя экономика. Давай решим, чем занять этот месяц.')],
    choices:[
      {label:'Профилактика принтеров', sub:'1 000 ₽ · брак меньше на 1 п.п. на месяц', cost:1000,
       apply:function(s){ addMod(s,'fail',-0.01,1,'Профилактика'); return [cashChip(s,-1000),modChip('брак −1 п.п. на месяц',true)]; },
       reply:say('phil','happy','Смазал, почистил, погладил по корпусу. Он довольно ворчит.')},
      {label:'Учиться моделированию', sub:'−6 ч печати · спрос ×1,03 на 2 месяца',
       apply:function(s){ addMod(s,'hoursAdd',-6,1,'Учёба'); addModB2C(s,1.03,2,'Новые модели'); return [modChip('−6 часов печати',false),modChip('спрос ×1,03 на 2 мес.',true)]; },
       reply:say('liza','happy','Видела твои новые модели. Это уже не брелок, это искусство.')},
      {label:'Работать как обычно', sub:'без изменений',
       apply:function(s){ return [chip('всё идёт своим чередом','info')]; },
       reply:say('phil','neutral','Рутина тоже работа. Печатаем.')}],
    lesson:'Когда нет громких событий, выигрывает тот, кто ровно и внимательно ведёт дела: следит за затратами, спросом и загрузкой.'
  };
}
if(typeof module!=='undefined') module.exports = {};
