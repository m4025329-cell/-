/* ===== Команда специалистов и задания (квесты) =====
   Специалист стоит зарплаты каждый месяц и даёт свой бонус. Задания это цепочки из трёх шагов на несколько месяцев:
   каждый шаг даёт награду, а весь путь учит планировать надолго. Тексты без привязки к роду игрока. */

var SPECS = {
  sonya:  {name:'Соня',   role:'Дизайнер',        icon:'sparkle',   col:'magenta', from:3, salary:4500, hire:3000,
           perk:'Спрос на брелоки, подставки, фигурки, ночники и игрушки +10%',  about:'Рисует красивые модели и подбирает цвета. Покупатели чаще берут изделия, которые приятно держать в руках.'},
  ruslan: {name:'Руслан', role:'Наладчик',        icon:'wrench',    col:'orange',  from:4, salary:5000, hire:3500,
           perk:'Брак меньше на 3 п.п., часов печати больше на 6%',                about:'Знает про каждый принтер всё: когда подкрутить ремень, как почистить сопло и почему печать «поплыла».'},
  katya:  {name:'Катя',   role:'Маркетолог',      icon:'megaphone', col:'lime',    from:5, salary:5500, hire:3000,
           perk:'Реклама сильнее на 25%, репутация растёт на 0,4 в месяц',        about:'Ведёт соцсети мастерской, придумывает акции и общается с блогерами.'},
  igor:   {name:'Игорь',  role:'Логист',          icon:'truck',     col:'cyan',    from:4, salary:4000, hire:2000,
           perk:'Упаковка и доставка дешевле на 30%',                              about:'Договаривается с курьерами, подбирает коробки и не даёт заказам теряться.'},
  nina:   {name:'Нина Павловна', role:'Бухгалтер', icon:'doc',      col:'violet',  from:6, salary:4500, hire:2500,
           perk:'Постоянные расходы меньше на 6%',                                 about:'Считает налоги, находит лишние траты и следит, чтобы деньги не «утекали» незаметно.'},
  artyom: {name:'Артём',  role:'Менеджер по продажам', icon:'users', col:'cyan',    from:7, salary:5000, hire:3000,
           perk:'На доске заказов на одно предложение больше, клиенты охотнее уступают в торге', about:'Находит новых клиентов и умеет разговаривать с ними так, что те остаются довольны.'}
};
var SPEC_IDS = Object.keys(SPECS);
var TEAM_LIMIT = {school:2, home:2, cowork:3, garage:5};

function teamOf(s){ s.team=s.team||{}; return s.team; }
function hasSpec(s, id){ return !!(s.team && s.team[id]); }
function teamCount(s){ return s.team ? Object.keys(s.team).length : 0; }
function teamSalary(s){ var t=0; SPEC_IDS.forEach(function(id){ if(hasSpec(s,id)) t+=SPECS[id].salary; }); return t*s.infl; }
function canHire(s, id){
  var P=SPECS[id]; if(!P) return {ok:false, why:'Нет такого сотрудника'};
  if(hasSpec(s,id)) return {ok:false, why:'Уже в команде'};
  if(s.month<P.from) return {ok:false, why:'Придёт позже: с месяца '+P.from};
  if(teamCount(s)>=(TEAM_LIMIT[s.space]||2)) return {ok:false, why:'Команда не помещается: максимум '+(TEAM_LIMIT[s.space]||2)+' '+plural(TEAM_LIMIT[s.space]||2,'человек','человека','человек')+' в этом помещении'};
  if(s.cash<P.hire) return {ok:false, why:'Не хватает денег на оформление'};
  return {ok:true, why:''};
}
function hireSpec(s, id){ var c=canHire(s,id); if(!c.ok) return c; s.cash-=SPECS[id].hire; teamOf(s)[id]=s.month; return c; }
function fireSpec(s, id){ if(!hasSpec(s,id)) return false; delete s.team[id]; return true; }
function teamDem(s, id){ return (hasSpec(s,'sonya') && !PRODUCTS[id].b2b && id!=='part') ? 1.10 : 1; }
function teamFail(s){ return hasSpec(s,'ruslan') ? 0.03 : 0; }
function teamHours(s){ return hasSpec(s,'ruslan') ? 1.06 : 1; }
function teamAd(s){ return hasSpec(s,'katya') ? 1.25 : 1; }
function teamFixed(s){ return hasSpec(s,'nina') ? 0.94 : 1; }
function packOf(s, id){ return PACK[id]*s.infl*(hasSpec(s,'igor')?0.7:1); }

/* ---------- задания ---------- */
function unitsOf(r, id){ var x=r.rows[id]; return x ? x.sold+x.contractUnits : 0; }
function orderOk(o){ return o.miss<=0 && !o.fineFail; }
function ratingOf(s){ return s.rate && s.rate.u>0 ? s.rate.s/s.rate.u : 0; }
var QUESTS = [
 {id:'olymp', name:'Школьная олимпиада', icon:'cap', client:'school', from:2,
  intro:'Школа готовит городскую олимпиаду и ищет мастерскую, которая сделает для неё призы и подарки.',
  stages:[
   {text:'Продай за один месяц не меньше 90 брелоков', months:4, reward:1000, test:function(s,r){ return unitsOf(r,'key')>=90; }},
   {text:'Выполни заказ Школы №17', months:5, reward:1500, test:function(s,r){ return (r.orders||[]).some(function(o){ return o.client==='school' && orderOk(o); }); }},
   {text:'Закрой месяц с прибылью не меньше 12 000 ₽', months:5, reward:3000, test:function(s,r){ return r.profit>=12000; }}],
  final:'Олимпиада прошла отлично, мастерскую вписали в афиши.', trust:'school'},
 {id:'hundred', name:'Первые деньги', icon:'coin', client:null, from:1,
  intro:'Первое время главное не потерять деньги, а накопить подушку для роста.',
  stages:[
   {text:'Накопи на счёте 60 000 ₽', months:5, reward:1000, test:function(s,r){ return s.cash>=60000; }},
   {text:'Продай за месяц не меньше 220 изделий', months:5, reward:1500, test:function(s,r){ return r.soldTot>=220; }},
   {text:'Подними капитал до 180 000 ₽', months:6, reward:3000, test:function(s,r){ return ownerCapital(s)>=180000; }}],
  final:'Первый рубеж пройден: мастерская стоит на ногах.'},
 {id:'quality', name:'Качество превыше всего', icon:'sparkle', client:'cafe', from:3,
  intro:'Кофейня хочет сделать изделия для витрины и просит безупречной печати.',
  stages:[
   {text:'Закрой месяц с браком не выше 8%', months:5, reward:1000, test:function(s,r){ return r.fail<=0.08 && r.hours>0; }},
   {text:'Выполни премиум-заказ (режим «Тонко»)', months:6, reward:2000, test:function(s,r){ return (r.orders||[]).some(function(o){ return o.kind==='premium' && orderOk(o); }); }},
   {text:'Добейся рейтинга мастерской 4,4 и выше', months:6, reward:3000, test:function(s,r){ return ratingOf(s)>=4.4; }}],
  final:'Кофейня выставила ваши изделия на видном месте.', trust:'cafe'},
 {id:'allround', name:'Мастер на все руки', icon:'grid', client:null, from:4,
  intro:'Хороший мастер умеет много. Покажи, что мастерская справляется с разными задачами.',
  stages:[
   {text:'Продай за месяц не меньше четырёх видов товара', months:5, reward:1500, test:function(s,r){ return r.soldKinds>=4; }},
   {text:'Заверши два исследования в лаборатории', months:7, reward:2000, test:function(s,r){ return Object.keys((s.lab&&s.lab.done)||{}).length>=2; }},
   {text:'Держи в мастерской три принтера', months:7, reward:3000, test:function(s,r){ return s.printers.length>=3; }}],
  final:'Теперь мастерскую называют «универсальной».'},
 {id:'eco', name:'Зелёная мастерская', icon:'leaf', client:'museum', from:5,
  intro:'Музей собирает экспонаты из переработанных материалов и ищет мастерскую с экологичным подходом.',
  stages:[
   {text:'Заверши исследование «Переработка брака»', months:6, reward:1500, test:function(s,r){ return !!(s.lab&&s.lab.done.recycle); }},
   {text:'Закупи не менее 10 кг эко-пластика', months:6, reward:1500, test:function(s,r){ return (s.ecoBought||0)>=10; }},
   {text:'Закрой месяц с браком не выше 7%', months:6, reward:3000, test:function(s,r){ return r.fail<=0.07 && r.hours>0; }}],
  final:'Музей запомнил мастерскую как «ту самую, зелёную».', trust:'museum'},
 {id:'city', name:'Город знает', icon:'megaphone', client:'blog', from:6,
  intro:'Блогер собирает ролик о местных мастерских. Нужно, чтобы вас было за что упомянуть.',
  stages:[
   {text:'Подними репутацию до 50', months:6, reward:1500, test:function(s,r){ return s.rep>=50; }},
   {text:'Подключи маркетплейс или собственный сайт', months:6, reward:1500, test:function(s,r){ return !!(s.channel.market||s.channel.site); }},
   {text:'Подними репутацию до 65', months:7, reward:3000, test:function(s,r){ return s.rep>=65; }}],
  final:'Ролик вышел, и про мастерскую узнали в соседних районах.', trust:'blog'},
 {id:'teamq', name:'Команда мечты', icon:'users', client:null, from:7,
  intro:'Когда заказов много, один человек не справляется. Пора собирать команду.',
  stages:[
   {text:'Найми первого специалиста', months:5, reward:1500, test:function(s,r){ return teamCount(s)>=1; }},
   {text:'Собери команду из двух специалистов', months:6, reward:2000, test:function(s,r){ return teamCount(s)>=2; }},
   {text:'Три месяца подряд держи загрузку принтеров не ниже 85%', months:8, reward:3500, test:function(s,r){ return (s.utilStreak||0)>=3; }}],
  final:'Команда сработалась, и это видно по результатам.'},
 {id:'safety', name:'Подушка безопасности', icon:'safe', client:null, from:6,
  intro:'Нина Павловна советует иметь запас, пока не грянул кризис.',
  stages:[
   {text:'Держи на вкладах и в фонде не меньше 20 000 ₽', months:6, reward:1500, test:function(s,r){ return s.savings+s.fund>=20000; }},
   {text:'Держи на вкладах и в фонде не меньше 50 000 ₽', months:8, reward:2500, test:function(s,r){ return s.savings+s.fund>=50000; }},
   {text:'Подними капитал до 500 000 ₽', months:8, reward:3500, test:function(s,r){ return ownerCapital(s)>=500000; }}],
  final:'Запас появился. Теперь кризис не так страшен.'},
 {id:'toys1', name:'Новогодняя серия', icon:'star', client:'gift', from:3,
  intro:'Магазин «Подарочек» хочет к Новому году ёлочные игрушки ручной работы. Сезон короткий: ноябрь и декабрь.',
  stages:[
   {text:'Продай за сезон не меньше 60 ёлочных игрушек (за месяц)', months:2, reward:1500, test:function(s,r){ return unitsOf(r,'toy')>=60; }},
   {text:'Продай в декабре ещё не меньше 80 игрушек', months:2, reward:3000, test:function(s,r){ return r.month===4 && unitsOf(r,'toy')>=80; }}],
  final:'Ёлки в городе стали нарядными благодаря вам.', trust:'gift'},
 {id:'toys2', name:'Второй новогодний сезон', icon:'star', client:'gift', from:15,
  intro:'Новый год снова близко. В прошлом году игрушки раскупили, и магазин ждёт повторения.',
  stages:[
   {text:'Продай не меньше 90 ёлочных игрушек за месяц', months:2, reward:2500, test:function(s,r){ return unitsOf(r,'toy')>=90; }}],
  final:'Вторая ёлочная серия стала традицией.', trust:'gift'}
];
var QUEST_BY_ID = {}; QUESTS.forEach(function(q){ QUEST_BY_ID[q.id]=q; });
var QUEST_MAX = 3;       /* заданий одновременно */

function questsOf(s){ s.quests=s.quests||{}; return s.quests; }
function questState(s, id){ var st=questsOf(s)[id]; return st ? st.state : 'new'; }
function questAvailable(s, id){ var q=QUEST_BY_ID[id], st=questState(s,id); return st==='new' && s.month>=q.from; }
function questsActive(s){ return QUESTS.filter(function(q){ return questState(s,q.id)==='active'; }); }
function questsAvailable(s){ return QUESTS.filter(function(q){ return questAvailable(s,q.id); }); }
function takeQuest(s, id){
  var q=QUEST_BY_ID[id]; if(!q || !questAvailable(s,id)) return {ok:false, why:'Задание пока недоступно'};
  if(questsActive(s).length>=QUEST_MAX) return {ok:false, why:'Одновременно можно вести '+QUEST_MAX+' задания'};
  questsOf(s)[id]={state:'active', stage:0, left:q.stages[0].months, start:s.month};
  return {ok:true};
}
/* конец месяца: проверка шагов, награды; r — итог месяца */
function questTick(s, r){
  r.quests=[]; var Q=questsOf(s);
  QUESTS.forEach(function(q){
    var st=Q[q.id]; if(!st || st.state!=='active') return;
    var guard=0;
    while(st.state==='active' && guard++<5){
      var stage=q.stages[st.stage];
      if(stage.test(s,r)){
        var rw=stage.reward; s.cash+=rw; r.quests.push({q:q.id, kind:'stage', text:stage.text, reward:rw, name:q.name});
        st.stage++;
        if(st.stage>=q.stages.length){
          st.state='done'; st.done=r.month;
          var bonus=Math.round(q.stages.length*1000);
          s.cash+=bonus; s.rep=clamp(s.rep+3,0,100); if(q.trust){ var c=clientOf(s,q.trust); c.trust=Math.min(5,c.trust+1); }
          r.quests.push({q:q.id, kind:'done', text:q.final, reward:bonus, name:q.name}); s.questsDone=(s.questsDone||0)+1;
        } else { st.left=q.stages[st.stage].months; }
      } else {
        st.left--;
        if(st.left<=0){ st.state='failed'; r.quests.push({q:q.id, kind:'fail', text:'Срок вышел: «'+stage.text+'»', reward:0, name:q.name}); }
        break;
      }
    }
  });
  var total=0; r.quests.forEach(function(x){ total+=x.reward; });
  if(total>0){ var h=s.history[s.history.length-1]; r.cap=ownerCapital(s); r.cashAfter=s.cash; if(h){ h.cap=r.cap; h.cash=s.cash; } }
  r.questCash=total;
}
if(typeof module!=='undefined') module.exports = {};
