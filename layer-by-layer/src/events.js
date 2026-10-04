/* ===== Сюжет: 16 месяцев, 4 акта. Каждый месяц — сцена с диалогом и выбором ===== */
function chip(t, k){ return {t:t, k:k||'info'}; }
function cashChip(s, n, label){ s.cash += n; return chip((n>=0?'+':'')+rub(n)+(label?' '+label:''), n>=0?'gain':'loss'); }
function repChip(s, n){ s.rep = clamp(s.rep+n, 0, 100); return chip('репутация '+(n>=0?'+':'−')+Math.abs(n), n>=0?'gain':'loss'); }
function modChip(t, good){ return chip(t, good?'gain':'loss'); }
function addModB2C(s, m, left, label){ PROD_IDS.forEach(function(id){ if(!PRODUCTS[id].b2b) addMod(s,'dem',m,left,label,id); }); }
function say(who, mood, t){ return {who:who, mood:mood, t:t}; }
function fn(v, s){ return typeof v==='function' ? v(s) : v; }
function noSpace(s){ return s.printers.length >= SPACES[s.space].limit ? 'Нет места: в этом помещении максимум '+SPACES[s.space].limit+' '+plural(SPACES[s.space].limit,'принтер','принтера','принтеров') : ''; }

function printerChoice(type, label, reply){
  var d=PRINTERS[type];
  return {label:label,
    sub:function(s){ return rub(d.price)+' · +'+d.hours+' ч печати · брак '+Math.round(d.fail*100)+'% · '+paybackInfo(s,type).text; },
    cost:d.price, req:noSpace,
    apply:function(s){ buyPrinter(s,type); return [chip(rub(-d.price),'loss'),chip('+'+d.hours+' часов печати в месяц','gain'),chip('амортизация ≈ '+rub(d.price/DEPR_MONTHS)+'/мес','info')]; },
    reply:reply};
}
/* варианты, которые видит игрок: «талантливые» показываются только своему таланту */
function choicesOf(s, stage){ return stage.choices.filter(function(c){ return !c.talent || c.talent===s.talent; }); }
var EVENTS = [
/* ================= АКТ I ================= */
/* 1 */ {title:'Первый слой', icon:'flask', stages:function(s){ return [{
  tag:'Издержки', term:'cost',
  lines:[
    say('phil','happy','Сопло прочищено, стол готов. Осталась мелочь: пластик. На складе 3 кг, этого хватит на пару недель.'),
    say('sem','neutral','Закупайся с умом. Деньги в этой мастерской не мои и не бесконечные.')],
  choices:[
    {label:'Недорогой пластик, 5 кг', sub:'6 000 ₽ · 1 200 ₽/кг · брака больше на 3 п.п. три месяца, репутация −1', cost:6000,
     apply:function(s){ s.fil.kg+=5; s.fil.val+=6000; addMod(s,'fail',0.03,3,'Дешёвый пластик'); return [cashChip(s,-6000),modChip('брак +3 п.п. на 3 мес.',false),repChip(s,-1)]; },
     reply:say('sem','neutral','Дёшево не всегда выгодно. Следи за браком.')},
    {label:'Фирменный PLA+, 5 кг', sub:'8 500 ₽ · 1 700 ₽/кг · брака меньше на 2 п.п. полгода, репутация +4', cost:8500,
     apply:function(s){ s.fil.kg+=5; s.fil.val+=8500; addMod(s,'fail',-0.02,6,'Хороший пластик'); return [cashChip(s,-8500),modChip('брак −2 п.п. на 6 мес.',true),repChip(s,4)]; },
     reply:say('phil','excited','Ммм, пахнет качеством. Ну и немного пластиком.')},
    {label:'Школьные остатки, 4 кг', sub:'0 ₽ · цвета вперемешку: спрос −12% на три месяца', cost:0,
     apply:function(s){ s.fil.kg+=4; addMod(s,'dem',0.88,3,'Пёстрые остатки'); return [chip('+4 кг пластика бесплатно','gain'),modChip('спрос ×0,88 на 3 мес.',false)]; },
     reply:say('phil','smug','Бесплатно тоже стоит денег. Просто их платят продажами.')}],
  lesson:'Себестоимость включает не только цену килограмма. Брак и репутация тоже входят в цену результата. Сравнивай полную цену, а не цену пластика.'
 }]; }},

/* 2 */ {title:'Лиза и модели', icon:'users', stages:function(s){ return [{
  tag:'Лицензии', term:'ip',
  lines:[
    say('liza','excited','Слушай, у меня в Blender лежат двадцать фигурок для настолок. Ни одной не напечатано. Давай печатать вместе?'),
    say('liza','worried','Только без скачанных бесплатных моделей, ладно? Свои я рисовала ночами.'),
    say('phil','happy','Фигурки печатаются дольше брелоков, зато стоят в разы дороже. Есть варианты.')],
  choices:[
    {label:'Партнёрство с Лизой', sub:'Лиза получает 12% выручки с фигурок · её модели лучше: спрос ×1,15 · репутация +4',
     apply:function(s){ s.unlocked.mini=true; s.flags.liza='partner'; s.pdm.mini*=1.15; return [modChip('открыты фигурки',true),modChip('Лиза: 12% выручки с фигурок',false),modChip('спрос на фигурки ×1,15',true),repChip(s,4)]; },
     reply:say('liza','excited','Ура! Ты не пожалеешь. К Новому году нарисую целую серию!')},
    {label:'Купить пакет лицензий', sub:'12 000 ₽ один раз · все права твои · без процентов Лизе', cost:12000,
     apply:function(s){ s.unlocked.mini=true; s.flags.liza='license'; return [cashChip(s,-12000),modChip('открыты фигурки',true),modChip('модели куплены законно',true),repChip(s,1)]; },
     reply:say('liza','neutral','Лицензия так лицензия. Но мои модели всё равно лучше.')},
    {label:'Скачать бесплатные модели', sub:'0 ₽ · модели попроще и с огрехами: спрос ×0,92 · но чьи они?',
     apply:function(s){ s.unlocked.mini=true; s.flags.liza='pirate'; s.pdm.mini*=0.92; return [modChip('открыты фигурки',true),modChip('модели попроще: спрос ×0,92',false),modChip('модели скачаны без разрешения авторов',false)]; },
     reply:say('liza','sad','Серьёзно? Ладно, твоё дело. Но это чужой труд.')},
    {talent:'des', tid:'des2', label:'Нарисовать свои модели', sub:'4 000 ₽ на пробные печати · свои модели без роялти · спрос на фигурки ×1,04 · репутация +2', cost:4000,
     apply:function(s){ s.unlocked.mini=true; s.flags.liza='own'; s.pdm.mini*=1.04; return [cashChip(s,-4000),modChip('открыты фигурки',true),modChip('свои модели: роялти не нужны',true),modChip('спрос на фигурки ×1,04',true),repChip(s,2)]; },
     reply:say('liza','surprised','Своими руками? Смело. Зови, если застрянете: я рядом.')}],
  lesson:'Модель принадлежит автору. Лицензия или роялти позволяют использовать чужую работу честно. Бесплатно скачанное не всегда можно продавать, а скандал стоит дороже экономии.'
 }]; }},

/* 3 */ {title:'Макс и чёрная пятница', icon:'tag', stages:function(s){ return [{
  tag:'Конкуренция', term:'compete',
  lines:[
    say('max','smug','Слышал, у вас тут брелоки? Мой отец закупил партию на фабрике по 60 ₽. Продаю по 99. Удачи.'),
    say('phil','worried','Тревога! Конкурент. Мой датчик юмора говорит: не паникуй. А датчик прибыли молчит.'),
    say('nar','neutral','Заодно начинается чёрная пятница. Покупатели ждут скидок.')],
  choices:[
    {label:'Чёрная пятница: −20% на всё', sub:'цены продажи ×0,8 в этом месяце · спрос ×1,45 · репутация +1',
     apply:function(s){ addMod(s,'disc',0.8,1,'Чёрная пятница'); addMod(s,'dem',1.45,1,'Чёрная пятница'); return [modChip('цена продажи −20% на месяц',false),modChip('спрос ×1,45 на месяц',true),repChip(s,1)]; },
     reply:say('max','smug','Скидки? Смело. Мои 99 ₽ всё равно дешевле.')},
    {label:'Именные брелоки с гравировкой', sub:'4 000 ₽ на настройку · печать на 0,1 ч дольше · привычная цена брелоков ×1,3 навсегда', cost:4000,
     apply:function(s){ s.tAdd.key=(s.tAdd.key||0)+0.1; addMod(s,'ref',1.3,99,'Именные брелоки','key'); addMod(s,'dem',0.92,3,'Дешёвые брелоки Макса','key'); return [cashChip(s,-4000),modChip('брелок дороже в глазах покупателей ×1,3',true),modChip('печать брелока +0,1 ч',false),modChip('спрос на брелоки ×0,92 на 3 мес.',false)]; },
     reply:say('liza','excited','Имя на каждом! Ребята сойдут с ума. Я нарисую шрифт.')},
    {label:'Не реагировать', sub:'спрос на брелоки ×0,7 на четыре месяца',
     apply:function(s){ addMod(s,'dem',0.7,4,'Дешёвые брелоки Макса','key'); return [modChip('спрос на брелоки ×0,7 на 4 мес.',false)]; },
     reply:say('sem','neutral','Конкуренция не исчезает, если на неё не смотреть.')},
    {talent:'sel', tid:'sel3', label:'Стойка в торговом центре', sub:'3 000 ₽ · спрос ×1,15 на 3 месяца · репутация +1', cost:3000,
     apply:function(s){ addModB2C(s,1.15,3,'Стойка в ТЦ'); return [cashChip(s,-3000),modChip('спрос ×1,15 на 3 мес.',true),repChip(s,1)]; },
     reply:say('max','surprised','Стойка в «Галерее»? Как ты туда пробрался?')}],
  lesson:'Против конкурента можно бороться ценой или уникальностью. Скидка поднимает выручку, но уменьшает прибыль с каждой штуки. Уникальный товар позволяет держать цену высокой.'
 }]; }},

/* 4 */ {title:'Новогодний заказ', icon:'box', stages:function(s){ 
  var kc=Math.round(unitCostEst(s,'key','std')); return [{
  tag:'Контракт', term:'opp',
  lines:[
    say('sem','happy','Школа хочет заказать новогодние брелоки для первоклассников. Срок до конца месяца, цена фиксированная.'),
    say('phil','neutral','Гарантированный заказ звучит приятно. Но декабрь жаркий месяц, а часов печати у нас всего '+printerHours(s)+'.'),
    say('phil','smug','Для сравнения: себестоимость брелока около '+kc+' ₽, а на рынке в декабре его берут по '+refPrice(s,'key')+' ₽ и выше.')],
  choices:[
    {label:'Взять большой заказ', sub:'150 брелоков по 120 ₽ · штраф 30% за срыв · репутация +3 при успехе',
     apply:function(s){ s.contracts.push({prod:'key', qty:150, price:120, penalty:0.30, repLoss:6, repGain:3, label:'Школа №17: 150 брелоков'}); return [modChip('обязательный заказ: 150 брелоков по 120 ₽',true)]; },
     reply:say('sem','happy','Спасибо. Первоклашки будут в восторге.')},
    {label:'Взять небольшой заказ', sub:'70 брелоков по 135 ₽ · штраф 30% за срыв · репутация +3 при успехе',
     apply:function(s){ s.contracts.push({prod:'key', qty:70, price:135, penalty:0.30, repLoss:6, repGain:3, label:'Школа №17: 70 брелоков'}); return [modChip('обязательный заказ: 70 брелоков по 135 ₽',true)]; },
     reply:say('sem','neutral','Разумный размер. Лучше сделать меньше, но хорошо.')},
    {label:'Отказаться', sub:'все часы остаются для свободной продажи',
     apply:function(s){ return [modChip('часы печати свободны',true)]; },
     reply:say('sem','neutral','Это тоже решение. Только считай, что выгоднее.')}],
  lesson:'Заказ по фиксированной цене занимает часы печати. Сравни прибыль за час: заказ против свободной продажи. Выбирая одно, ты отказываешься от другого, это и есть альтернативная стоимость.'
 }]; }},

/* ================= АКТ II ================= */
/* 5 */ {title:'Переезд', icon:'store', stages:function(s){ return [{
  tag:'Постоянные расходы', term:'fixed',
  lines:[
    say('sem','sad','С первого января кабинет закрыт: ремонт и сокращение. Мне нужно, чтобы вы освободили помещение до конца недели.'),
    say('phil','worried','Я не хочу в коробку. Давай найдём новое место!'),
    say('phil','happy','Кстати, нам уже пишут про запчасти. У соседей сломалась стиральная машина.')],
  choices:[
    {label:'Мастерская в гаражном кооперативе', sub:'12 000 ₽/мес · до 8 принтеров · с улицы заходят покупатели (спрос ×1,1)',
     apply:function(s){ s.space='garage'; s.unlocked.part=true; s.flags.garageBonus=true; addMod(s,'dem',1.1,99,'Заходят с улицы'); return [modChip('аренда 12 000 ₽/мес',false),modChip('до 8 принтеров',true),modChip('спрос ×1,1',true),modChip('открыты запчасти',true)]; },
     reply:say('phil','excited','Гараж! Тут эхо. Я скажу «слой» и услышу «слой, слой, слой».')},
    {label:'Стол в коворкинге', sub:'6 000 ₽/мес · до 4 принтеров',
     apply:function(s){ s.space='cowork'; s.unlocked.part=true; return [modChip('аренда 6 000 ₽/мес',false),modChip('до 4 принтеров',false),modChip('открыты запчасти',true)]; },
     reply:say('sem','neutral','Недорого и аккуратно. Но места мало.')},
    {label:'Работать дома', sub:'0 ₽ · до 2 принтеров · тесно и шумно: часы печати ×0,9',
     apply:function(s){ s.space='home'; s.unlocked.part=true; return [modChip('без аренды',true),modChip('до 2 принтеров',false),modChip('часы печати ×0,9',false),modChip('открыты запчасти',true)]; },
     reply:say('phil','worried','Дома тихо. Только мама просила печатать не по ночам.')}],
  lesson:'Постоянные расходы платятся каждый месяц, даже если продаж нет. Чем выше аренда, тем больше нужно продавать. Но слишком тесное место ограничивает рост. Переехать позже можно в разделе «Мастерская», но это тоже стоит денег.'
 }]; }},

/* 6 */ {title:'Налоги и витрина', icon:'percent', stages:function(s){ 
  var m=Math.max(0,s.lastMargin);
  return [{
  tag:'Налоги', term:'tax',
  lines:[
    say('nina','neutral','Я Нина Павловна, бухгалтер. Ваши продажи уже не карманные деньги, бизнес пора оформлять.'),
    say('nina','happy','Режимов два. «Доходы»: 6% с каждой выручки. «Доходы минус расходы»: 15% с прибыли, но не меньше 1% выручки.'),
    say('nina','neutral','Прибыльность в прошлом месяце: '+pctText(m)+' от выручки. Подумайте.')],
  choices:[
    {label:'«Доходы»: 6% с выручки', sub:'просто и предсказуемо',
     apply:function(s){ s.tax='rev'; return [modChip('налог 6% с выручки',false)]; },
     reply:say('nina','happy','Проще считать. Я люблю простые цифры.')},
    {label:'«Доходы минус расходы»: 15% с прибыли', sub:'выгодно, когда прибыль меньше 40% выручки',
     apply:function(s){ s.tax='profit'; return [modChip('налог 15% с прибыли',false)]; },
     reply:say('nina','neutral','Посчитаем честно. Расходы придётся подтверждать.')},
    {label:'Пока не оформляться', sub:'штраф 20 000 ₽ и принудительный режим 6%',
     apply:function(s){ s.tax='rev'; return [cashChip(s,-20000,'штраф'),modChip('налог 6% с выручки',false)]; },
     reply:say('nina','angry','Работать без оформления нельзя. Штраф вы заслужили.')}],
  lesson:function(s){ var m=Math.max(0,s.lastMargin); return 'Режим 15% с прибыли выгоднее, если прибыль меньше 40% выручки (тогда 15% от прибыли меньше, чем 6% от выручки). У тебя сейчас прибыльность около '+pctText(m)+', поэтому '+(m<0.4?'дешевле режим с прибылью.':'дешевле режим «Доходы» с 6% выручки.')+' Работать без оформления нельзя: это нарушение и штраф. Налоги идут на школы, дороги и больницы.'; }
 },{
  tag:'Каналы продаж', term:'channel',
  lines:[
    say('phil','happy','Теперь витрина. Где продавать? Только знакомым и в чате школы много не продашь.'),
    say('liza','excited','Мой знакомый блогер Тёма может снять обзор. Или можно выставиться на маркетплейс.')],
  choices:[
    {label:'Маркетплейс', sub:'комиссия 12% с продаж · спрос на товары для покупателей ×1,4 навсегда',
     apply:function(s){ s.channel.market=true; return [modChip('комиссия 12% с продаж',false),modChip('спрос ×1,4 на товары для покупателей',true)]; },
     reply:say('phil','excited','Витрина на весь город! Только комиссия кусается.')},
    {label:'Видео от блогера Тёмы', sub:'10 000 ₽ · 50% шанс успеха: спрос ×1,6 два месяца, иначе ×1,05', cost:10000,
     apply:function(s,rng){ s.flags.risk=true; var win=rng()<0.50; if(win){ s.flags.bloggerWin=true; addModB2C(s,1.6,2,'Блогер'); return [cashChip(s,-10000),modChip('видео взлетело! спрос ×1,6 на 2 мес.',true),repChip(s,6)]; } addModB2C(s,1.05,2,'Блогер'); return [cashChip(s,-10000),modChip('видео не завирусилось: спрос ×1,05',false),repChip(s,1)]; },
     reply:say('liza','neutral','Тёма снял всё, что мог. Дальше решает алгоритм.')},
    {label:'Свой сайт', sub:'15 000 ₽ + 2 500 ₽/мес · спрос ×1,22 навсегда · без комиссии', cost:15000,
     apply:function(s){ s.channel.site=true; return [cashChip(s,-15000),modChip('сайт: 2 500 ₽/мес',false),modChip('спрос ×1,22',true)]; },
     reply:say('phil','happy','Свой сайт! Теперь у меня есть адрес. Почти как у людей.')}],
  lesson:'Маркетплейс приводит покупателей, но берёт комиссию. Свой сайт дороже в запуске, зато без комиссии. Блогер это риск: награда большая, но не гарантирована. Высокая награда обычно идёт вместе с высоким риском.'
 }]; }},

/* 7 */ {title:'Больше рук и больше принтеров', icon:'printer', stages:function(s){ 
  return [{
  tag:'Оборудование', term:'payback',
  lines:[
    say('phil','worried','Я один. Один поток, одно сопло, одна пара глаз. Мне нужен напарник.'),
    say('nina','neutral','Принтер можно считать вложением. Делим его цену на прибыль в месяц и получаем срок окупаемости.'),
    say('nina','neutral','А ещё принтер изнашивается. Каждый месяц 1/36 его цены записывается в расходы. Это амортизация.')],
  choices:[
    printerChoice('std','Новый «Стандарт»',say('phil','excited','Брат! Я так рад. Он пока не умеет шутить, но научу.')),
    printerChoice('used','Б/у принтер',say('sem','neutral','Дёшево, но будь готов к ремонтам.')),
    printerChoice('fast','Быстрый CoreXY',say('phil','smug','Быстрый. Я бы обиделся, но он очень красивый.')),
    (function(){ var c=printerChoice('diy','Собрать принтер своими руками',say('phil','excited','Брат из деталей! У него даже характер мой. Ну почти.')); c.talent='eng'; c.tid='eng7'; return c; })(),
    {label:'Подождать', sub:'ничего не покупать сейчас',
     apply:function(s){ return [chip('деньги остаются на счету','info')]; },
     reply:say('nina','neutral','Осторожность тоже стратегия. Только часы не растут от ожидания.')}],
  lesson:'Принтер окупается, только если у него есть работа. Новое оборудование даёт часы печати, но не покупателей. Амортизация показывает, что оборудование постепенно теряет стоимость, и это нужно учитывать в расходах.'
 },{
  tag:'Труд', term:'labor',
  lines:[
    say('phil','neutral','Теперь люди. Ночью принтеры работают без присмотра, а утром нужно срочно менять пластик.'),
    say('sem','happy','Есть парень из девятого класса, Данила. Ответственный. Могу посоветовать.')],
  choices:[
    {label:'Помощник на постоянной основе', sub:rub(STAFF.asst.salary)+'/мес · +25% часов печати',
     apply:function(s){ hireStaff(s,'asst'); return [modChip('зарплата '+rub(STAFF.asst.salary)+'/мес',false),modChip('часы печати +25%',true)]; },
     reply:say('phil','happy','Данила! Люблю, когда меня обслуживают вовремя.')},
    {label:'Подросток на подработку', sub:rub(STAFF.teen.salary)+'/мес · +10% часов печати',
     apply:function(s){ hireStaff(s,'teen'); return [modChip('зарплата '+rub(STAFF.teen.salary)+'/мес',false),modChip('часы печати +10%',true)]; },
     reply:say('sem','neutral','Для начала хватит. Только учи его технике безопасности.')},
    {label:'Справляться самим', sub:'без новых расходов',
     apply:function(s){ return [chip('без новых расходов','info')]; },
     reply:say('phil','worried','Ну... я всегда за тебя.')}],
  lesson:'Работник увеличивает количество часов печати, но его зарплата становится постоянным расходом. Нанимать выгодно, когда дополнительная прибыль больше зарплаты.'
 }]; }},

/* 8 */ {title:'Запах гари', icon:'flame', stages:function(s){ return [{
  tag:'Риск', term:'risk',
  lines:[
    say('sem','worried','Фил, твой блок питания греется и пахнет. Я такое видел. В соседнем гараже недавно горело.'),
    say('phil','worried','Это не я, это блок. Я сегодня холодный, как PLA.'),
    say('sem','neutral','Решай сейчас, пока не поздно. Можно предотвратить, можно застраховаться, можно надеяться на удачу.')],
  choices:[
    {label:'Заменить блок питания', sub:'6 000 ₽ один раз · риск пожара исчезает', cost:6000,
     apply:function(s){ s.flags.psu=true; return [cashChip(s,-6000),chip('блок питания заменён','gain')]; },
     reply:say('sem','happy','Правильно. Профилактика скучна, пока не пригодится.')},
    {label:'Застраховать мастерскую', sub:'2 000 ₽/мес · при ущербе страховая платит 90%',
     apply:function(s){ s.insurance=true; return [modChip('страховка 2 000 ₽/мес',false),chip('ущерб покрывается на 90%','gain')]; },
     reply:say('nina','neutral','Страховку можно отменить в любой момент в разделе «Финансы».')},
    {label:'Оставить как есть', sub:'0 ₽ · а вдруг пронесёт',
     apply:function(s){ s.flags.gamble=true; return [chip('деньги сэкономлены','info')]; },
     reply:say('phil','worried','Я пахну так... нормально. Нормально же?')},
    {talent:'eng', tid:'eng8', label:'Починить блок своими руками', sub:'1 500 ₽ деталей · риск пожара исчезает · вечер у паяльника: часы печати ×0,95 в этом месяце', cost:1500,
     apply:function(s){ s.flags.psu=true; addMod(s,'hours',0.95,1,'Вечер у паяльника'); return [cashChip(s,-1500),chip('блок питания починен','gain'),modChip('часы печати ×0,95 на месяц',false)]; },
     reply:say('sem','happy','Вот это да. Умеешь! Только про технику безопасности не забывай.')}],
  lesson:'Риск можно предотвратить (заменить блок), передать страховой компании или принять на себя. Предотвратить обычно дешевле, чем платить за последствия. Страховка защищает от того, что нельзя предусмотреть.'
 }]; }},

/* ================= АКТ III ================= */
/* 9 */ {title:'Деньги на рост', icon:'bank', stages:function(s){ 
  function loan(a){ var n=12, step=a/n, over=Math.round(a*LOAN_RATE*(n+1)/2); return 'платёж ≈ '+rub(step+a*LOAN_RATE)+' в первый месяц · переплата ≈ '+rub(over); }
  return [{
  tag:'Кредит или доля', term:'credit',
  lines:[
    say('oleg','happy','Мастерская растёт, у вас хорошая история. Предлагаю кредит на 12 месяцев под 1,5% в месяц.'),
    say('artem','smug','А я вложу 200 тысяч за 15% вашей мастерской. Возвращать не нужно. Но 15% будут моими навсегда.'),
    say('liza','excited','У ПромТеха заказ на прототипы корпусов. Для них нужен большой принтер, он стоит около '+rub(PRINTERS.big.price)+'!')],
  choices:[
    {label:'Кредит 200 000 ₽', sub:function(){ return loan(200000); },
     apply:function(s){ s.cash+=200000; s.loanLeft+=200000; s.loanStep=Math.round(s.loanLeft/12); s.unlock.loan=true; s.unlocked.proto=true; return [chip('+200 000 ₽ на счёт','gain'),modChip('долг 200 000 ₽ под 1,5% в месяц',false),chip('открыты прототипы','gain')]; },
     reply:say('oleg','happy','Условия простые: платить вовремя. Остальное мелочи.')},
    {label:'Инвестор: 200 000 ₽ за 15%', sub:'возвращать не нужно · 15% капитала навсегда будут Артёма',
     apply:function(s){ s.cash+=200000; s.equity*=0.85; s.flags.investor=true; s.unlocked.proto=true; return [chip('+200 000 ₽ на счёт','gain'),modChip('твоя доля 85%',false),chip('открыты прототипы','gain')]; },
     reply:say('artem','smug','Отличная сделка. Для обеих сторон. Особенно для моей.')},
    {label:'Небольшой кредит 80 000 ₽', sub:function(){ return loan(80000); },
     apply:function(s){ s.cash+=80000; s.loanLeft+=80000; s.loanStep=Math.round(s.loanLeft/12); s.unlock.loan=true; s.unlocked.proto=true; return [chip('+80 000 ₽ на счёт','gain'),modChip('долг 80 000 ₽ под 1,5% в месяц',false),chip('открыты прототипы','gain')]; },
     reply:say('oleg','neutral','Осторожно, но разумно.')},
    {label:'Обойтись своими деньгами', sub:'без кредитов и инвесторов',
     apply:function(s){ s.unlocked.proto=true; return [chip('рост на свои деньги','info'),chip('открыты прототипы','gain')]; },
     reply:say('nina','happy','Спокойно и без процентов. Только расти придётся медленнее.')}],
  lesson:'Кредит нужно вернуть с процентами, зато бизнес остаётся твоим целиком. Инвестор денег не требует назад, но забирает часть бизнеса навсегда. Выгоден тот способ, где ты заработаешь на чужие деньги больше, чем они стоят.'
 }]; }},

/* 10 */ {title:'Цены растут', icon:'up', stages:function(s){ 
  var kg=25, price=Math.round(kg*filMarket(s));
  return [{
  tag:'Инфляция', term:'inflation',
  lines:[
    say('nina','worried','Инфляция за год 9%. Всё дорожает: пластик, коробки, зарплаты. Рыночные цены на ваши товары тоже поднимутся.'),
    say('nina','neutral','А деньги на счету с каждым месяцем покупают чуть меньше. Что с этим делать?'),
    say('phil','happy','Могу предложить три плана: запастись пластиком, положить деньги в банк или рискнуть на фондовом рынке.')],
  choices:[
    {label:'Закупить 25 кг пластика впрок', sub:function(){ return rub(price)+' · цена пластика зафиксирована на сегодня'; }, cost:price,
     apply:function(s){ var pr=Math.round(kg*filMarket(s)); s.fil.kg+=kg; s.fil.val+=pr; s.cash-=pr; s.infl*=1.06; s.filIdx*=1.10; s.unlock.deposit=true; s.unlock.fund=true; return [chip('−'+rub(pr).replace('−','')+' на пластик','loss'),chip('+25 кг пластика по старой цене','gain'),modChip('цены на пластик +10%',false),chip('открыты вклад и фонд','info')]; },
     reply:say('phil','smug','Склад теперь пахнет богатством.')},
    {label:'Вклад: 40 000 ₽', sub:'1% в месяц · деньги можно забрать в любой момент', cost:0,
     apply:function(s){ var a=Math.min(40000,Math.max(0,s.cash)); s.cash-=a; s.savings+=a; s.infl*=1.06; s.filIdx*=1.10; s.unlock.deposit=true; s.unlock.fund=true; return [chip('на вкладе '+rub(a),'gain'),modChip('цены на пластик +10%',false),chip('открыты вклад и фонд','info')]; },
     reply:say('nina','happy','Надёжно. Проценты каждый месяц капают сами.')},
    {label:'Индексный фонд: 40 000 ₽', sub:'≈ +0,8% в месяц в среднем, колебания до ±4% · может быть и минус', cost:0,
     apply:function(s){ var a=Math.min(40000,Math.max(0,s.cash)); s.cash-=a; s.fund+=a; s.infl*=1.06; s.filIdx*=1.10; s.unlock.deposit=true; s.unlock.fund=true; return [chip('в фонде '+rub(a),'gain'),modChip('цены на пластик +10%',false),chip('открыты вклад и фонд','info')]; },
     reply:say('artem','smug','Фонд? Любопытно. Помни: растёт не по прямой.')},
    {label:'Ничего не менять', sub:'пластик дорожает, деньги лежат на счету',
     apply:function(s){ s.infl*=1.06; s.filIdx*=1.10; s.unlock.deposit=true; s.unlock.fund=true; return [modChip('цены на пластик +10%',false),chip('открыты вклад и фонд','info')]; },
     reply:say('nina','neutral','Тоже вариант. Только цены не ждут.')}],
  lesson:'Инфляция это рост цен: на те же деньги можно купить меньше. Защититься можно запасом товара, вкладом или фондом. Но запас замораживает деньги, а твой бизнес может зарабатывать на них больше, чем экономия на ценах. Вклад надёжен, фонд может дать больше, но иногда падает.'
 }]; }},

/* 11 */ {title:'Макс копирует', icon:'copy', stages:function(s){ 
  if(s.flags.liza==='pirate'){ return [{
    tag:'Авторские права', term:'ip',
    lines:[
      say('liza','angry','Помнишь модели, которые вы скачали из интернета? Автор нашёл ваши фигурки на маркетплейсе и написал жалобу.'),
      say('sem','worried','Вам предлагают закрыть вопрос мирно. Или дойти до суда.'),
      say('max','neutral','Меня не приплетайте. Я свои модели покупаю.')],
    choices:[
      {label:'Заплатить автору и снять модели', sub:'18 000 ₽ компенсации · фигурки временно пропадают (спрос ×0,6 на 2 мес.) · репутация −4', cost:18000,
       apply:function(s){ s.flags.liza='fixed'; addMod(s,'dem',0.6,2,'Модели сняты','mini'); return [cashChip(s,-18000),modChip('спрос на фигурки ×0,6 на 2 мес.',false),repChip(s,-4)]; },
       reply:say('sem','neutral','Ошибку лучше исправлять сразу.')},
      {label:'Купить лицензию задним числом', sub:'14 000 ₽ · модели становятся законными · репутация −3', cost:14000,
       apply:function(s){ s.flags.liza='fixed'; return [cashChip(s,-14000),chip('лицензия куплена','info'),repChip(s,-3)]; },
       reply:say('liza','neutral','Так бы сразу. Хорошо, что вы всё исправили.')},
      {label:'Игнорировать жалобу', sub:'0 ₽ сейчас · шанс 60%, что придёт штраф 45 000 ₽ и репутация −12',
       apply:function(s,rng){ s.flags.risk=true; if(rng()<0.6){ s.flags.liza='fined'; return [cashChip(s,-45000,'штраф'),repChip(s,-12)]; } return [chip('пока обошлось','info')]; },
       reply:say('sem','sad','Игнорировать закон не получится.')}],
    lesson:'Использование чужих моделей без разрешения нарушает авторские права. Исправить ошибку добровольно дешевле, чем платить штраф и терять репутацию.'
  }]; }
  return [{
  tag:'Копирование', term:'ownprod',
  lines:[
    say('liza','angry',s.flags.liza==='partner'?'Смотри! Макс продаёт мои фигурки. Один в один, только дешевле и хуже.':'Смотри! Макс продаёт точно такие же фигурки, как у нас. Один в один, только дешевле и хуже.'),
    say('max','smug','Эти модели общедоступны. Я просто печатаю быстрее.'),
    say('phil','worried','Это нечестно, но у Макса большая ферма. Что делать?')],
  choices:[
    {label:'Подать жалобу на Макса', sub:'6 000 ₽ юристу · 60% шанс: копии убирают, спрос на фигурки ×1,15 три месяца', cost:6000,
     apply:function(s,rng){ s.flags.risk=true; var win=rng()<0.6; if(win){ addMod(s,'dem',1.15,3,'Копии удалены','mini'); s.flags.maxEnemy=true; return [cashChip(s,-6000),modChip('жалоба удовлетворена, спрос на фигурки ×1,15',true),repChip(s,2)]; } s.flags.maxEnemy=true; return [cashChip(s,-6000),modChip('жалобу отклонили',false)]; },
     reply:say('sem','neutral','Право на твоей стороне. Но суд любит документы.')},
    {label:'Выпустить коллекционную серию', sub:'5 000 ₽ · привычная цена фигурок ×1,15 на 4 месяца · печатай «Тонко»', cost:5000,
     apply:function(s){ addMod(s,'ref',1.15,4,'Коллекционная серия','mini'); return [cashChip(s,-5000),modChip('цена фигурок ×1,15 на 4 мес.',true),repChip(s,2)]; },
     reply:say('liza','excited','Нумерованные фигурки! Каждая с подписью автора. Копию так не сделаешь.')},
    {label:'Предложить Максу союз', sub:'+40 часов печати в месяц на его ферме за 4 000 ₽/мес · Макс перестаёт копировать',
     apply:function(s){ s.flags.ally=true; return [modChip('+40 часов печати в месяц',true),modChip('партнёрская ферма 4 000 ₽/мес',false)]; },
     reply:say('max','surprised','Союз? Хм. Мне нравится, как это звучит. Мой отец тоже будет доволен.')},
    {talent:'des', tid:'des11', label:'Нарисовать ответную модель', sub:'3 000 ₽ · спрос на фигурки ×1,4 на 3 месяца · копировать новинку труднее', cost:3000,
     apply:function(s){ addMod(s,'dem',1.4,3,'Новая серия','mini'); return [cashChip(s,-3000),modChip('спрос на фигурки ×1,4 на 3 мес.',true),repChip(s,2)]; },
     reply:say('liza','excited','Новая серия за одну ночь! Пусть теперь Макс попробует это скопировать.')}],
  lesson:'Копирование конкурентов вредит. Бороться можно правом, качеством или кооперацией. Союз с бывшим соперником позволяет передать часть работы партнёру (аутсорсинг) и сэкономить на собственных мощностях.'
 }]; }},

/* 12 */ {title:'Курс доллара', icon:'globe', stages:function(s){ return [{
  tag:'Валютный курс', term:'fx',
  lines:[
    say('nina','worried','Рубль подешевел на 12% за месяц. Сопла, электроника и часть пластика у нас импортные.'),
    say('phil','neutral','Ага. Всё, что лежит на складе, дорожает. А всё, что надо купить, дорожает ещё сильнее.'),
    say('nar','neutral','В городе появился местный завод по переработке пластика: «ЭкоСлой».')],
  choices:[
    {label:'Перейти на «ЭкоСлой»', sub:'8 000 ₽ на переход · цена пластика +4% вместо +12% · спрос ×0,97 · репутация +4', cost:8000,
     apply:function(s){ s.flags.eco=true; s.filIdx*=1.04; s.pdm.key*=0.97; s.pdm.stand*=0.97; s.pdm.mini*=0.97; s.pdm.part*=0.97; s.pdm.proto*=0.97; return [cashChip(s,-8000),modChip('пластик +4%',false),modChip('спрос ×0,97',false),repChip(s,4)]; },
     reply:say('phil','happy','Переработанный пластик! Его раньше называли мусором. А теперь это брелок.')},
    {label:'Остаться с импортом', sub:'цена пластика +12%',
     apply:function(s){ s.filIdx*=1.12; return [modChip('пластик +12%',false)]; },
     reply:say('nina','neutral','Рубль ослаб, поставщики из-за рубежа поднимают цены. Бывает.')},
    {label:'Закупить запас на два месяца', sub:function(s){ return rub(Math.round(30*filMarket(s)))+' · старая цена пластика'; }, cost:function(s){ return Math.round(30*filMarket(s)); },
     apply:function(s){ var pr=Math.round(30*filMarket(s)); s.fil.kg+=30; s.fil.val+=pr; s.cash-=pr; s.filIdx*=1.12; return [chip('−'+rub(pr).replace('−','')+' на пластик','loss'),chip('+30 кг по старой цене','gain'),modChip('новый пластик +12%',false)]; },
     reply:say('phil','smug','Запас карман не тянет, зато пластик не боится курса.')}],
  lesson:'Курс валюты влияет на цены внутри страны. Если рубль слабеет, импортное дорожает. Бизнес защищается запасами или сменой поставщика. Переработанный пластик это ещё и вклад в экологию.'
 }]; }},

/* ================= АКТ IV ================= */
/* 13 */ {title:'Ночь в мастерской', icon:'bolt', stages:function(s){ 
  if(!s.flags.psu){ return [{
    tag:'Пожар', term:'risk',
    lines:[
      say('nar','worried','3:14 ночи. Запах гари. Блок питания Фила дымится.'),
      say('sem','worried','Я успел отключить питание. Все целы. Но блок сгорел и прихватил плату.'),
      say('phil','sad','Мне больно. Или это просто искры. Кто знает.')],
    choices:[
      {label:'Срочный ремонт в сервисе', sub:function(s){ return 'без простоя · '+(s.insurance?'платишь 10% от 35 000 ₽ и 8 000 ₽ за срочность':'35 000 ₽ ущерб и 8 000 ₽ за срочность'); }, cost:function(s){ return Math.round((s.insurance?35000*0.10:35000)+8000); },
       apply:function(s){ var c=Math.round((s.insurance?35000*0.10:35000)+8000); s.cash-=c; s.flags.fireHappened=true; return [chip('−'+rub(c).replace('−','')+' ремонт','loss'),chip(s.insurance?'страховка покрыла 90% ущерба':'страховки нет','info')]; },
       reply:say('sem','neutral','Быстро и без простоя. Хорошо.')},
      {label:'Чинить своими силами', sub:function(s){ return (s.insurance?'платишь 10% от 35 000 ₽':'35 000 ₽')+' · простой: часы печати ×0,6 в этом месяце'; }, cost:function(s){ return Math.round(s.insurance?35000*0.10:35000); },
       apply:function(s){ var c=Math.round(s.insurance?35000*0.10:35000); s.cash-=c; s.flags.fireHappened=true; addMod(s,'hours',0.6,1,'Простой после пожара'); return [chip('−'+rub(c).replace('−','')+' ремонт','loss'),modChip('часы печати ×0,6 на месяц',false),chip(s.insurance?'страховка покрыла 90% ущерба':'страховки нет','info')]; },
       reply:say('phil','sad','Лежу и жду. Если что, я не жалуюсь.')},
      {label:'Попросить Макса о помощи', sub:'доступно, если вы в союзе · печать на его ферме, без простоя и доплат', req:function(s){ return s.flags.ally?'':'Нужен союз с Максом'; }, cost:function(s){ return Math.round(s.insurance?35000*0.10:35000); },
       apply:function(s){ var c=Math.round(s.insurance?35000*0.10:35000); s.cash-=c; s.flags.fireHappened=true; return [chip('−'+rub(c).replace('−','')+' ремонт','loss'),chip('Макс печатает заказы за тебя','gain'),repChip(s,2)]; },
       reply:say('max','happy','Для того и союзники. Мой станок ночью свободен.')},
      {talent:'eng', tid:'eng13', label:'Починить своими руками за ночь', sub:function(s){ return (s.insurance?'платишь 10% от 12 000 ₽':'12 000 ₽ деталей')+' · без простоя, но часы печати ×0,9 (бессонная ночь)'; }, cost:function(s){ return Math.round(s.insurance?12000*0.10:12000); },
       apply:function(s){ var c=Math.round(s.insurance?12000*0.10:12000); s.cash-=c; s.flags.fireHappened=true; addMod(s,'hours',0.9,1,'Бессонная ночь'); return [chip('−'+rub(c).replace('−','')+' ремонт','loss'),modChip('часы печати ×0,9 на месяц',false),repChip(s,1)]; },
       reply:say('phil','happy','Меня вскрыли, починили и закрыли обратно. Это было странно приятно.')}],
    lesson:'Пожар случился там, где риск не предотвратили. Страховка вернула 90% ущерба, но не вернула время. Профилактика дешевле, а страховка защищает от остатка риска.'
  }]; }
  return [{
    tag:'Профилактика', term:'risk',
    lines:[
      say('nar','neutral','3:14 ночи. Сработал датчик перегрева. Блок питания Фила нагрелся, но принтер выключился сам.'),
      say('sem','happy','Это был новый блок, который вы поставили весной. Старый за такую ночь сгорел бы вместе с платой.'),
      say('phil','happy','Я цел! И не пахну палёным. Профилактика это скучно, пока не пригодится.')],
    choices:[
      {label:'Выступить на конкурсе «Школьный стартап»', sub:'призовой фонд 25 000 ₽ · неделя подготовки: часы печати ×0,92 в этом месяце · репутация +5',
       apply:function(s){ addMod(s,'hours',0.92,1,'Подготовка к конкурсу'); return [cashChip(s,25000,'приз'),modChip('часы печати ×0,92 на месяц',false),repChip(s,5)]; },
       reply:say('sem','happy','Ты там неплохо смотришься. Хотя бы на сцене.')},
      {label:'Не ехать, печатать дальше', sub:'без изменений',
       apply:function(s){ return [chip('время идёт на печать','info')]; },
       reply:say('phil','neutral','Печатаем. Я это умею.')}],
    lesson:'Профилактика дешевле лечения. Иногда её результат незаметен: ничего не случилось, и это хорошо. Время тоже ресурс: подготовка к конкурсу забирает часы печати.'
  }]; }},

/* 14 */ {title:'Гигант на рынке', icon:'target', stages:function(s){ 
  var ally=!!s.flags.ally;
  return [{
  tag:'Эффект масштаба', term:'scale',
  lines:[
    say('max', ally?'neutral':'worried', ally?'«МегаПринт» купил торговый центр отца. Теперь они печатают сувениры миллионами и продают дешевле нас обоих.':'«МегаПринт» купил торговый центр отца. Они печатают сувениры миллионами и продают дешевле нас обоих. Я пришёл не ругаться.'),
    say('phil','worried','Эффект масштаба. Когда делаешь миллион штук, одна дешевле. Нам так не выиграть.'),
    say('phil','happy','Но у нас есть кое-что, чего у гиганта нет. Ты. И Лиза. И я.')],
  choices:[
    {label:ally?'Углубить союз: общий бренд':'Союз с Максом: общий бренд', sub:'+80 часов печати на ферме Макса, 8% выручки с брелоков и подставок · спрос ×1,1',
     apply:function(s){ s.flags.ally=true; s.flags.alliance2=true; s.pdm.key*=1.1; s.pdm.stand*=1.1; s.pdm.mini*=1.1; s.pdm.part*=1.1; return [modChip('+80 часов печати в месяц',true),modChip('спрос ×1,1',true),modChip('Максу 8% выручки с брелоков и подставок',false),repChip(s,3)]; },
     reply:say('max','happy','Общий бренд «Слой&Макс». Сначала звучит странно, потом нормально.')},
    {label:'Уйти в нишу: детали, фигурки и прототипы', sub:'брелоки и подставки: спрос ×0,75 навсегда · остальное: спрос ×1,2 · репутация +5',
     apply:function(s){ s.flags.niche=true; s.pdm.key*=0.75; s.pdm.stand*=0.75; s.pdm.mini*=1.2; s.pdm.part*=1.2; s.pdm.proto*=1.2; return [modChip('брелоки и подставки ×0,75',false),modChip('фигурки, запчасти, прототипы ×1,2',true),repChip(s,5)]; },
     reply:say('liza','excited','Нишевые вещи! Там, где гигант не успевает за мелкими деталями.')},
    {label:'Ценовая война', sub:'рыночные цены на всё ×0,9 на 3 месяца · спрос ×0,9',
     apply:function(s){ addMod(s,'ref',0.9,3,'Ценовая война'); addMod(s,'dem',0.9,3,'Ценовая война'); return [modChip('рыночные цены ×0,9 на 3 мес.',false),modChip('спрос ×0,9 на 3 мес.',false)]; },
     reply:say('nina','worried','Войну с гигантом не выигрывают ценой.')},
    {talent:'sel', tid:'sel14', label:'История бренда: «Сделано в школе №17»', sub:'2 000 ₽ на ролик и плакаты · спрос ×1,15 на 3 месяца · репутация +3', cost:2000,
     apply:function(s){ addModB2C(s,1.15,3,'История бренда'); return [cashChip(s,-2000),modChip('спрос ×1,15 на 3 мес.',true),repChip(s,3)]; },
     reply:say('phil','excited','Школьная мастерская против корпорации! Такие истории люди любят.')}],
  lesson:'У крупных компаний есть эффект масштаба: чем больше выпуск, тем дешевле единица. Малому бизнесу выгоднее выигрывать уникальностью, качеством, скоростью и союзами, а не ценой.'
 }]; }},

/* 15 */ {title:'Кризис и добрые дела', icon:'storm', stages:function(s){ return [{
  tag:'Экономический цикл', term:'cycle',
  lines:[
    say('nina','worried','В экономике спад. Люди откладывают покупки, а компании режут расходы. Спрос упадёт примерно на 30%. Индексный фонд тоже просел.'),
    say('phil','neutral','Нужен запас прочности. Кто сэкономил, тот сейчас спокоен.')],
  choices:[
    {label:'Сократить расходы', sub:'постоянные расходы −30% на 3 месяца · репутация −2',
     apply:function(s){ addMod(s,'dem',0.7,3,'Кризис'); addMod(s,'fixed',0.7,3,'Экономия'); return [modChip('спрос ×0,7 на 3 мес.',false),modChip('постоянные расходы −30%',true),repChip(s,-2)]; },
     reply:say('nina','neutral','Меньше трат, больше выдержки.')},
    {label:'Антикризисная акция', sub:'10 000 ₽ · спрос ×0,85 вместо ×0,7', cost:10000,
     apply:function(s){ addMod(s,'dem',0.85,3,'Кризис и акция'); return [cashChip(s,-10000),modChip('спрос ×0,85 на 3 мес.',false)]; },
     reply:say('phil','excited','Акция! Люди любят, когда им что-то дарят. Даже в кризис.')},
    {label:'Ничего не менять', sub:'спрос ×0,7 на 3 месяца',
     apply:function(s){ addMod(s,'dem',0.7,3,'Кризис'); return [modChip('спрос ×0,7 на 3 мес.',false)]; },
     reply:say('nina','neutral','Если запас есть, переждать можно.')}],
  lesson:'Экономика движется по циклу: рост, спад, снова рост. В спад люди покупают меньше. Выживают компании с финансовой подушкой и разными источниками дохода.'
 },{
  tag:'Социальная ответственность', term:'social',
  lines:[
    say('irina','worried','Здравствуйте. Я врач. У меня десять детей ждут протезы кисти. Они очень дорогие, а очередь длинная.'),
    say('irina','neutral','Говорят, такое можно напечатать на 3D-принтере. Вы бы смогли помочь?'),
    say('phil','sad','Каждый протез это 8 часов печати и около 1 400 ₽ пластика. В кризис это ощутимо.')],
  choices:[
    {label:'Напечатать 10 протезов бесплатно', sub:'14 000 ₽ материалов · −80 часов печати в этом месяце · репутация +5', cost:14000,
     apply:function(s){ s.flags.social=true; addMod(s,'hoursAdd',-80,1,'Протезы'); return [cashChip(s,-14000),modChip('−80 часов печати на месяц',false),repChip(s,5),chip('десять детей получат протезы','gain')]; },
     reply:say('irina','happy','Спасибо вам огромное. Вы даже не представляете, что это значит.')},
    {label:'Напечатать 4 протеза', sub:'6 000 ₽ материалов · −32 часа печати в этом месяце · репутация +2', cost:6000,
     apply:function(s){ s.flags.social=true; addMod(s,'hoursAdd',-32,1,'Протезы'); return [cashChip(s,-6000),modChip('−32 часа печати на месяц',false),repChip(s,2),chip('четверо детей получат протезы','gain')]; },
     reply:say('irina','happy','Любая помощь важна. Мы найдём остальных помощников.')},
    {label:'Извиниться: в кризис не до этого', sub:'без трат',
     apply:function(s){ return [chip('ресурсы остаются в мастерской','info')]; },
     reply:say('irina','sad','Я понимаю. Всего доброго.')}],
  lesson:'Бизнес влияет на людей вокруг. Помощь другим укрепляет репутацию и доверие, но тоже требует часов и денег. Выбор между прибылью и добрым делом решаешь ты.'
 }]; }},

/* 16 */ {title:'Фонд «Технопарк»', icon:'star', stages:function(s){ return [{
  tag:'Капитал', term:'capital',
  lines:[
    say('sem','happy','Через месяц заседание комиссии фонда «Технопарк». Они смотрят на капитал вашей мастерской.'),
    say('nina','neutral','Напомню: капитал это всё, что у вас есть, минус всё, что вы должны. Сейчас он равен '+rub(ownerCapital(s))+(s.equity<1?' (без доли инвестора)':'')+'.'),
    say('phil','excited','Последний рывок! Новогодний спрос самый высокий в году.')],
  choices:[
    {label:'Новогодняя кампания', sub:'30 000 ₽ · спрос ×1,35 в этом месяце', cost:30000,
     apply:function(s){ addMod(s,'dem',1.35,1,'Новогодняя кампания'); return [cashChip(s,-30000),modChip('спрос ×1,35 на месяц',true)]; },
     reply:say('phil','excited','Реклама, реклама, реклама! Я горжусь.')},
    {label:'Подарочные наборы', sub:'печать на 15% дольше · привычные цены ×1,2 в этом месяце',
     apply:function(s){ PROD_IDS.forEach(function(id){ addMod(s,'ref',1.2,1,'Подарочные наборы',id); }); addMod(s,'hours',0.87,1,'Упаковка наборов'); return [modChip('рыночные цены ×1,2 на месяц',true),modChip('часы печати ×0,87 на месяц',false)]; },
     reply:say('liza','excited','Красивые коробки! Я нарисую открытки.')},
    {label:'Погасить долги досрочно', sub:'если есть чем, закрываем кредит и экономим на процентах',
     apply:function(s){ var pay=Math.min(s.loanLeft, Math.max(0,s.cash)); s.cash-=pay; s.loanLeft-=pay; if(s.loanLeft<1){ s.loanLeft=0; s.loanStep=0; } else s.loanStep=Math.min(s.loanStep, s.loanLeft); return [pay>0?chip('погашено '+rub(pay),'gain'):chip('долгов нет','gain')]; },
     reply:say('nina','happy','Без долгов спится лучше.')}],
  lesson:'Капитал показывает, насколько мастерская богата на самом деле. В него входят деньги, товар, вклады и оборудование, а долги вычитаются. Последний месяц важен, но не отменяет решений, принятых раньше.'
 }]; }}
];
