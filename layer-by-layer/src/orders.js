/* ===== Заказы: клиенты, доска заказов, торг, доверие, цели месяца =====
   Доска заказов собирается из кода класса, номера месяца и доверия клиентов, поэтому у одноклассников
   с одним кодом на доске одни и те же предложения. Принятый заказ становится контрактом (s.contracts):
   его нужно напечатать целиком, иначе штраф и потеря репутации. Тексты написаны без привязки к роду игрока. */

var NOUN = {key:'брелоки', stand:'подставки', mini:'фигурки', part:'запчасти', proto:'прототипы', lamp:'ночники', toy:'ёлочные игрушки'};
var NOUN1 = {key:'брелок', stand:'подставку', mini:'фигурку', part:'запчасть', proto:'прототип', lamp:'ночник', toy:'ёлочную игрушку'};

var KINDS = {
  regular: {name:'Обычный',      chip:'info',  icon:'doc',       pm:[0.94,1.03], hs:[0.14,0.30], pen:0.25, repLoss:3, repGain:1,
            hint:'Обычный договор: цена близка к рыночной, зато покупатель уже найден.'},
  bulk:    {name:'Оптом',        chip:'warn',  icon:'box',       pm:[0.70,0.80], hs:[0.28,0.45], pen:0.20, repLoss:4, repGain:2,
            hint:'Много штук со скидкой. Выгодно, когда часы простаивают, и невыгодно, когда их можно занять товаром подороже.'},
  rush:    {name:'Срочно',       chip:'loss',  icon:'bolt',      pm:[1.08,1.18], hs:[0.10,0.22], pen:0.50, repLoss:8, repGain:3,
            hint:'Платят больше, но штраф за срыв вдвое выше. Берись, когда уверен, что успеешь.'},
  premium: {name:'Премиум',      chip:'brand', icon:'sparkle',   pm:[1.12,1.26], hs:[0.10,0.22], pen:0.35, repLoss:5, repGain:3, fine:true,
            hint:'Клиент хочет аккуратную печать: нужен режим «Тонко». Он медленнее, но заказ оплачивается заметно выше.'},
  charity: {name:'Доброе дело',  chip:'gain',  icon:'heart',     pm:[0.55,0.68], hs:[0.10,0.20], pen:0.05, repLoss:1, repGain:5,
            hint:'Платят меньше рынка, зато растёт репутация, а о мастерской узнают в городе.'},
  trap:    {name:'Сомнительный', chip:'loss',  icon:'warn',      pm:[1.50,1.70], hs:[0.10,0.18], pen:0.30, repLoss:6, repGain:0, claim:0.80, claimRep:9,
            hint:'Очень высокая цена за вещь, у которой есть правообладатель. Подумай, чьи это модели.'}
};

/* stub — насколько клиент готов уступать в торге; from — месяц, с которого он появляется */
var CLIENTS = {
  school: {name:'Школа №17',             who:'Завуч Ирина Павловна', icon:'cap',      col:'cyan',    from:1, stub:0.04, likes:['trust','price'], dislikes:['speed'], prods:['key','stand','toy'],
    kinds:['regular','bulk','charity'],
    say:{regular:['Нужны {n} для кабинетов и для призов на олимпиаде. Бюджет у школы скромный, но платим вовремя.','Заказываем {n}: на день открытых дверей. Качество нужно аккуратное, чтобы не стыдно было родителям.'],
         bulk:['Покупаем {n} для всей параллели сразу. Берём много, поэтому просим скидку.','Нужно много: {n} на каждого ученика. Скидка за количество нас бы очень выручила.'],
         charity:['Организуем благотворительную ярмарку. Нужны {n}, но денег у школы почти нет. Поможете?']},
    ok:['Всё привезли в срок, дети в восторге. Будем заказывать ещё.','Аккуратно упаковано и посчитано до штуки. Спасибо!'], bad:['Мы рассчитывали на это к празднику. Теперь придётся что-то придумывать.','Ожидали больше. Расстроены.']},
  cafe:   {name:'Кофейня «Зерно»',       who:'Бариста Лена',         icon:'store',    col:'orange',  from:1, stub:0.08, likes:['quality','speed'], dislikes:['price'], prods:['key','stand','lamp'],
    kinds:['regular','premium','rush'],
    say:{regular:['У нас открывается вторая точка. Нужны {n} с нашим логотипом: гостям понравится.','Хотим {n} к осеннему меню. Цвет подберите под кофе: коричневый и сливочный.'],
         premium:['Ищем идеальные {n} для витрины. Нужна чистая печать без следов слоёв, готовы платить.','Для фирменной линейки нужны {n} высшего качества. Следы слоёв на витрине нам ни к чему.'],
         rush:['У нас завтра презентация меню, а {n} закончились! Нужно срочно, цену обсудим по-хорошему.']},
    ok:['Гости уже спрашивают, где такие взять. Вы нас выручили!','Красиво вышло. Поставили на самое видное место.'], bad:['Презентация прошла без ваших изделий. Жаль.','Не успели? Ну что ж, будем искать других.']},
  gift:   {name:'Магазин «Подарочек»',   who:'Продавец Галина',      icon:'box',      col:'magenta', from:2, stub:0.14, likes:['price','speed'], dislikes:['quality'], prods:['key','stand','mini','toy','lamp'],
    kinds:['regular','bulk','rush'],
    say:{regular:['К нам заходят за сувенирами. Возьмём {n} на витрину, цену обсудим.','Добавим {n} на полку «сделано в городе». Туристам такое нравится.'],
         bulk:['Берём {n} оптом для нескольких магазинов сети. Если цена будет доброй, повторим заказ.','Нужна большая партия: {n} к праздничной распродаже. Скидку за объём рассчитываем получить.'],
         rush:['Поставщик подвёл, а витрина пустая! Срочно нужны {n}. Заплатим выше рынка.']},
    ok:['Разошлось за два дня. Теперь только к вам!','Покупатели хвалят, а продавцы просят добавки.'], bad:['Витрина осталась пустой, а полка простаивала. Обидно.','Мы на вас рассчитывали. В следующий раз назовите честный срок.']},
  club:   {name:'Клуб «Драконья нора»',  who:'Мастер игры Костя',    icon:'users',    col:'violet',  from:2, stub:0.12, likes:['quality','trust'], dislikes:['speed'], prods:['mini'],
    kinds:['regular','premium','bulk'],
    say:{regular:['Идёт турнир по настолкам, нужны {n} для участников. Ищем свою мастерскую, а не магазинную пластмассу.','К нашей кампании нужен набор: {n}. Кто-то ещё и красить будет.'],
         premium:['Для чемпионского кубка нужны {n} с мелкими деталями: чешуя, рога, узоры. Мелочи важны, платим за них.'],
         bulk:['Школа игры на 40 человек. Берём {n} для всех, скидку за объём ждём.']},
    ok:['Фигурки сели в руку идеально. Игроки в восторге!','Детали прорисованы так, что даже мастер игры растрогался.'], bad:['Турнир начался без фигурок. Мы ждали до последнего.','Игроки расстроены, а я больше всех. Жаль.']},
  blog:   {name:'Блогер Артём',          who:'Видеоблогер',          icon:'megaphone',col:'lime',    from:3, stub:0.10, likes:['speed','quality'], dislikes:['trust'], prods:['key','mini'],
    kinds:['regular','rush','charity'],
    say:{regular:['Снимаю ролик про локальные мастерские. Нужны {n} для розыгрыша подписчикам. Хорошая реклама для вас.','Подписчики просят мерч. Закажу {n} со своим ником. Платить буду честно.'],
         rush:['Стрим послезавтра, а розыгрыш без призов! Срочно нужны {n}. Платить готов быстро и хорошо.'],
         charity:['Собираем деньги на корм для приюта. Нужны {n} для лотереи. Бюджета почти нет, но рассказ о вас пойдёт в ролике.']},
    ok:['В ролике показал ваш логотип крупным планом. Ждите новых заказов!','Подписчики заказали ещё. Передаю вам пламенный привет.'], bad:['Стрим прошёл без призов. Подписчики не поняли.','Такой срыв в прямом эфире не красит ни меня, ни вас.']},
  clinic: {name:'Детская больница',      who:'Врач Ирина Сергеевна', icon:'heart',    col:'cyan',    from:3, stub:0.02, likes:['trust','quality'], dislikes:['price'], prods:['key','mini','lamp'],
    kinds:['charity','regular'],
    say:{charity:['Хотим подарить детям в отделении {n} на память о лечении. Денег немного, мы бюджетная организация.','Нужны {n} для праздника в отделении. Дети будут рады любому подарку.'],
         regular:['Закупаем {n} для игровой комнаты. Вещи должны быть безопасными и без острых краёв.']},
    ok:['Дети не выпускают их из рук. Спасибо огромное.','Спасибо вам. В отделении стало светлее.'], bad:['Праздник прошёл без подарков. Дети не поняли, а нам неловко.','Мы очень надеялись. Жаль.']},
  robo:   {name:'Кружок робототехники',  who:'Руководитель Антон',   icon:'wrench',   col:'cyan',    from:4, stub:0.06, likes:['quality','price'], dislikes:['speed'], prods:['part','stand'],
    kinds:['regular','rush','bulk'],
    say:{regular:['На соревнования нужны {n}: детали кронштейнов под наши моторчики. Точные размеры в чертеже.','Закажем {n} для сборки новых роботов. Допуск 0,2 мм, надеемся на вас.'],
         rush:['Через три дня соревнования, а {n} сломались на тренировке! Заплатим за скорость.'],
         bulk:['Берём {n} для всех команд города. Если сделаете по хорошей цене, будем возвращаться.']},
    ok:['Робот поехал с первой попытки. Спасибо за точность!','Всё подошло идеально, команда на пьедестале.'], bad:['Робота пришлось собирать из того, что было. Не очень получилось.','Команда сошла с дистанции. Обидно.']},
  auto:   {name:'Автосервис «Гайка»',    who:'Мастер Валерий',       icon:'truck',    col:'orange',  from:5, stub:0.09, likes:['speed','trust'], dislikes:['price'], prods:['part'],
    kinds:['regular','premium','rush'],
    say:{regular:['Нужны {n} для старых машин, оригиналов уже не найти. Образцы пришлём.','Заказываем {n} для ремонта салона. Пластик должен выдерживать солнце.'],
         premium:['Нужны {n} под капот, там жарко и вибрация. Печать аккуратная, без пустот: платим за надёжность.'],
         rush:['Машина стоит на подъёмнике, клиент ждёт! Срочно нужны {n}. Цена вопроса значения не имеет, но время имеет.']},
    ok:['Деталь села как влитая. Клиент даже не заметил, что она не заводская.','Хорошая работа. Теперь отдадим вам все редкие запчасти.'], bad:['Клиент уехал недовольным: ремонт сорвался.','Простой машины стоит нам денег. Мы рассчитывали на вас.']},
  museum: {name:'Краеведческий музей',   who:'Хранительница Нина',   icon:'book',     col:'violet',  from:5, stub:0.03, likes:['quality','trust'], dislikes:['speed'], prods:['mini','stand'],
    kinds:['charity','premium','regular'],
    say:{charity:['Делаем выставку к юбилею города. Нужны {n}: макеты и подставки под экспонаты. Бюджет музея невелик.'],
         premium:['Для выставки нужны {n} самого высокого качества. Посетители будут рассматривать вблизи.'],
         regular:['Закажем {n} для новой экспозиции. Размеры в приложении.']},
    ok:['Выставка получила много добрых отзывов, вас упомянули в афише.','Ваши макеты стоят рядом с настоящими находками. Это честь.'], bad:['Открытие выставки пришлось отложить. Мы расстроены.','Рассчитывали на вас, а теперь придётся объяснять директору.']},
  studio: {name:'Студия «Ракурс»',       who:'Арт-директор Мария',   icon:'target',   col:'magenta', from:6, stub:0.12, likes:['quality','speed'], dislikes:['price'], prods:['proto','mini'],
    kinds:['regular','premium','rush'],
    say:{regular:['Нужны {n} крупного размера для макета витрины. Размеры строгие, цвет белый.','Закажем {n} для презентации клиенту. Печать аккуратная, швы незаметные.'],
         premium:['Нужны {n} для выставочного стенда. Всё должно быть гладким, без следов слоёв.'],
         rush:['Презентация уже в четверг! Срочно нужны {n}. Заплатим как за срочный заказ.']},
    ok:['Клиент принял макет сразу. Берём вас в постоянные подрядчики.','Выглядело как заводское. Спасибо!'], bad:['Презентация прошла без макета. Это провал для студии.','Макет не приехал. Придётся извиняться перед клиентом.']},
  start:  {name:'Стартап «Дронго»',      who:'Основатель Тимур',     icon:'bolt',     col:'cyan',    from:8, stub:0.18, likes:['speed','price'], dislikes:['trust'], prods:['proto','part'],
    kinds:['regular','rush','premium'],
    say:{regular:['Делаем дрон для доставки. Нужны {n} для испытаний. Деньги пока есть, потому что нашли инвестора.','Нам нужны {n} под новую модель корпуса. Если понравится, закажем серию.'],
         rush:['Инвестор приедет через три дня, а {n} ещё нет! Срочно, платим вперёд.'],
         premium:['Нужны {n} для демонстрации инвестору: гладкие, без следов слоёв. Платим как за лучшее.']},
    ok:['Инвестор остался доволен. У нас будет серия!','Корпус выдержал испытания. Спасибо!'], bad:['Испытания пришлось перенести. Инвестор был недоволен.','Без прототипа презентация не состоялась. Жаль.']},
  fan:    {name:'Незнакомый заказчик',   who:'Аноним в мессенджере', icon:'user',     col:'violet',  from:4, stub:0.15, likes:['price'], dislikes:['trust'], prods:['mini'],
    kinds:['trap'],
    say:{trap:['Привет! Нужны {n} известных героев из популярной франшизы, фанатам понравится. Модели скину, платить буду хорошо. Только про лицензии не говори.',
               'Напечатай {n} героев из нашумевшего мультсериала, у меня есть готовые файлы. Заплачу больше обычного.']},
    ok:['Спасибо, всё получил.'], bad:['Не получил заказ. Ладно.']}
};
var CLIENT_IDS = Object.keys(CLIENTS);

/* реплики клиентов о сомнительном заказе после отказа и после выполнения */
var TRAP_NO = 'Правильный выбор: чужие герои защищены авторским правом. Печатать и продавать их без лицензии нельзя, даже если платят хорошо.';
var TRAP_CLAIM = 'Через неделю пришло письмо от правообладателя: продавать фигурки известных героев без лицензии нельзя. Пришлось заплатить компенсацию и извиниться.';


/* ---------- переговоры: три раунда, где важно знать, что ценит клиент ---------- */
var THEME_NAME = {quality:'качество', speed:'скорость', price:'цена', trust:'доверие'};
var NEG_TEXT = {
  quality:['Показать портфолио и пробные образцы','Предложить режим «Тонко» и проверку каждой детали','Пообещать заменить любое изделие с дефектом'],
  speed:  ['Пообещать сдать заказ раньше срока','Показать, что часы печати под заказ уже зарезервированы','Предложить поставку по частям: первые изделия сразу'],
  price:  ['Сразу назвать выгодную цену','Предложить скидку за большую партию','Показать, что цена ниже, чем у конкурентов'],
  trust:  ['Рассказать о других клиентах и показать отзывы','Предложить договор и гарантию возврата','Рассказать, как мастерская работает с долгими клиентами']
};
var NEG_ROUND = ['С чего начать разговор?','Какой довод привести?','Чем закрыть сделку?'];
var NEG_MINTOTAL = 5000;
function negAvailable(o){ return o.state==='open' && !o.tried && o.kind!=='charity' && o.kind!=='trap' && o.qty*o.price>=NEG_MINTOTAL; }
function negThemes(s, o, round){
  var all=['quality','speed','price','trust'], rng=rngFor(s,'neg'+o.id+':'+round), skip=Math.floor(rng()*4);
  return all.filter(function(x,i){ return i!==skip; });
}
function negStart(s, id){ var o=offerById(s,id); if(!o || !negAvailable(o)) return null; o.tried=true; o.neg={round:0, score:0, log:[]}; return o.neg; }
function negPick(s, id, theme){
  var o=offerById(s,id); if(!o || !o.neg || o.neg.round>=3) return null;
  var c=CLIENTS[o.client], like=c.likes.indexOf(theme)>=0, dis=c.dislikes.indexOf(theme)>=0, d=like?2:(dis?-2:0);
  var line = like ? 'Именно это для нас важно. Продолжайте.' : (dis ? 'Хм, для нас это не главное. Я ожидал другого.' : 'Хорошо, учту.');
  o.neg.score+=d; o.neg.log.push({round:o.neg.round, theme:theme, d:d, t:line}); o.neg.round++;
  var res={d:d, t:line, who:c.who, done:o.neg.round>=3};
  if(res.done){
    var sc=o.neg.score, pct=clamp(sc*0.03,-0.12,0.15); s.orderStats=s.orderStats||{};
    if(sc<=-4){ o.state='gone'; res.res='gone'; res.final='Мы подумаем и вернёмся к вам... позже. Всего доброго.'; s.orderStats.haggleLost=(s.orderStats.haggleLost||0)+1; }
    else {
      o.price=Math.max(5,nicePrice(o.base*(1+pct))); res.res=sc>=2?'win':'hold'; res.price=o.price;
      if(sc>=4){ var cl=clientOf(s,o.client); cl.trust=Math.min(5,cl.trust+1); res.trust=true; }
      if(sc>=2){ s.orderStats.haggleWins=(s.orderStats.haggleWins||0)+1; s.flagsMonth=s.flagsMonth||{}; s.flagsMonth.haggle=s.month; }
      res.final=sc>=2?'Договорились: '+rub(o.price)+' за штуку.':'Принимаем ваши условия: '+rub(o.price)+' за штуку.';
    }
    o.msg={res:res.res, who:c.who, t:res.final};
  }
  return res;
}
function clientLikes(id){
  var c=CLIENTS[id], n={quality:'качество', speed:'скорость', price:'низкую цену', trust:'надёжность'};
  return 'ценит '+c.likes.map(function(x){ return n[x]; }).join(' и ')+', не любит, когда давят на '+({quality:'качество',speed:'скорость',price:'цену',trust:'доверие'}[c.dislikes[0]]);
}
function nicePrice(p){ return Math.max(5, Math.round(p/5)*5); }
function niceQty(prod, q){
  var step = (prod==='key'||prod==='toy') ? 10 : (prod==='stand' ? 5 : (prod==='mini' ? 5 : 1));
  var n = Math.round(q/step)*step;
  return Math.max(prod==='key'?20:(prod==='proto'?2:(prod==='part'?4:(prod==='toy'?20:5))), n);
}
function clientOf(s, id){ s.clients=s.clients||{}; return s.clients[id]||(s.clients[id]={trust:0, done:0, failed:0}); }
function trustOf(s, id){ return (s.clients && s.clients[id]) ? s.clients[id].trust : 0; }
function trustBonus(s, id){ return 1 + 0.02*trustOf(s,id); }
function clientNote(id){
  var st=CLIENTS[id].stub;
  return st>=0.12 ? 'любит торговаться, часто уступает' : (st>=0.07 ? 'умеет считать деньги, уступает понемногу' : 'держит цену, почти не уступает');
}
function stdHoursPerUnit(s, prod){ return hoursPerUnit(s, prod, 'std'); }

/* ---------- доска заказов ---------- */
function makeBoard(s){
  if(s.board && s.board.month===s.month) return s.board;
  s.clients=s.clients||{};
  var rng=rngFor(s,'board'+s.month), m=s.month, offers=[], used={};
  var count = m===1 ? 2 : (m<=3 ? 3 : (m<=8 ? 4 : 5));
  if(s.rep>=60 && count<5) count++;
  if(hasSpec(s,'artyom')) count++;
  var trapIn=false, lockedIn=false;
  function pickClient(){
    var pool=[], tot=0;
    CLIENT_IDS.forEach(function(id){
      var c=CLIENTS[id]; if(c.from>m || used[id]) return;
      var avail=c.prods.filter(function(p){ return p==='proto' ? (s.unlocked.proto && (hasBig(s) || (!lockedIn && m>=6))) : isAvailable(s,p); });
      if(!avail.length) return;
      if(c.kinds.length===1 && c.kinds[0]==='trap' && (trapIn || m<4 || m>14 || (s.lastTrap && m-s.lastTrap<5))) return;
      var w = 1 + trustOf(s,id)*0.7 + (c.from===m ? 2.2 : 0) + (c.from===m-1 ? 0.8 : 0);
      if(c.kinds[0]==='trap') w=0.7;
      pool.push({id:id, w:w, prods:avail}); tot+=w;
    });
    if(!pool.length) return null;
    var roll=rng()*tot, acc=0;
    for(var i=0;i<pool.length;i++){ acc+=pool[i].w; if(roll<=acc) return pool[i]; }
    return pool[pool.length-1];
  }
  function pickKind(c){
    var ks=c.kinds.filter(function(k){ return k!=='premium' || m>=3; }).filter(function(k){ return k!=='rush' || m>=2; });
    if(!ks.length) ks=['regular'];
    return ks[Math.floor(rng()*ks.length)];
  }
  for(var n=0;n<count;n++){
    var pc;
    if(m===1){ pc = {id: n===0?'school':'cafe', prods:CLIENTS[n===0?'school':'cafe'].prods.filter(function(p){ return s.unlocked[p]; })}; }
    else pc=pickClient();
    if(!pc) break;
    var c=CLIENTS[pc.id], kind = m===1 ? 'regular' : pickKind(c);
    var prod=pc.prods[Math.floor(rng()*pc.prods.length)];
    if(m===1) prod = n===0?'key':'stand';
    var K=KINDS[kind]; used[pc.id]=true; if(kind==='trap'){ trapIn=true; s.lastTrap=m; }
    var locked = prod==='proto' && !hasBig(s); if(locked) lockedIn=true;
    var pm=K.pm[0]+(K.pm[1]-K.pm[0])*rng(), hs=K.hs[0]+(K.hs[1]-K.hs[0])*rng();
    var H0=printerHours(s), H=Math.max(60, H0<=150?H0:150+(H0-150)*0.15), mode = K.fine ? 'fine' : 'std';
    var qty=niceQty(prod, hs*H/hoursPerUnit(s,prod,mode));
    if(m===1){ qty = n===0 ? 40 : 10; }
    var ref=refPrice(s,prod), price=nicePrice(ref*pm*trustBonus(s,pc.id)*(s.orderBonus||1));
    var txts=c.say[kind]||c.say.regular||[], text=(txts[Math.floor(rng()*txts.length)]||'').replace('{n}',NOUN[prod]);
    offers.push({id:'m'+m+'-'+pc.id, client:pc.id, kind:kind, prod:prod, qty:qty, price:price, base:price, pen:K.pen, repLoss:K.repLoss, repGain:K.repGain,
      fine:!!K.fine, claim:K.claim||0, claimRep:K.claimRep||0, text:text, state:'open', tried:false, locked:locked});
  }
  s.board={month:m, offers:offers};
  return s.board;
}
function offerById(s, id){ var b=s.board; if(!b) return null; for(var i=0;i<b.offers.length;i++) if(b.offers[i].id===id) return b.offers[i]; return null; }
function orderLabel(o){ return '«'+CLIENTS[o.client].name+'»: '+o.qty+' '+PRODUCTS[o.prod].short.toLowerCase(); }

/* часы и деньги, нужные на все принятые заказы (если добавить ещё один — он передаётся вторым аргументом) */
function lockLoad(s, extra, modeOverride){
  var list=s.contracts.slice(); if(extra) list.push(extra);
  var needFine = list.some(function(c){ return c.fine; }), mode = modeOverride || (needFine || s.plan.mode==='fine' ? 'fine' : 'std');
  var qty={}; list.forEach(function(c){ qty[c.prod]=(qty[c.prod]||0)+c.qty; });
  var hours=0, cost=0;
  PROD_IDS.forEach(function(id){
    var need=Math.max(0,(qty[id]||0)-s.inv[id]); if(!need) return;
    var h=hoursPerUnit(s,id,mode); hours+=need*h;
    cost+=need*(gramsPerUnit(s,id,mode)/1000*filMarket(s)+h*runCostPerHour(s));
  });
  return {hours:hours, cost:cost, mode:mode};
}
/* хватит ли часов на принятые заказы, если печатать в этом режиме */
function modeFits(s, mode){ return lockLoad(s,null,mode).hours<=printerHours(s)+0.01; }
function orderCheck(s, o){
  if(o.prod==='proto' && !hasBig(s)) return {ok:false, why:'Нужен принтер большого формата'};
  var cur=lockLoad(s), after=lockLoad(s,o), H=printerHours(s);
  if(after.hours>H+0.01){
    var free=Math.max(0,H-cur.hours);
    return {ok:false, why:'Не хватит часов печати: заказу нужно ≈ '+Math.round(after.hours-cur.hours)+' ч, свободно '+Math.round(free)+' ч'};
  }
  if(after.cost>s.cash+0.5) return {ok:false, why:'Не хватит денег на пластик: нужно ≈ '+rub(after.cost)+' на все принятые заказы'};
  return {ok:true, why:''};
}
/* выгода заказа: прибыль и прибыль за час при тех же затратах, что и в плане */
function orderEcon(s, o){
  var mode = o.fine ? 'fine' : s.plan.mode, h=hoursPerUnit(s,o.prod,mode);
  var unit=unitCostEst(s,o.prod,mode,0)+packOf(s,o.prod);
  var inStock=Math.min(s.inv[o.prod], o.qty);
  return {hours:o.qty*h, hpu:h, unit:unit, profit:o.qty*(o.price-unit), perHour:(o.price-unit)/h, total:o.qty*o.price, inStock:inStock};
}
function refitPlan(s){
  PROD_IDS.forEach(function(id){ var b=priceBounds(s,id,s.plan.mode); s.plan.price[id]=clamp(s.plan.price[id],b.min,b.max); });
  s.plan.qty=sanitizePlan(s,s.plan).qty;
}
function contractOf(o){
  return {oid:o.id, client:o.client, kind:o.kind, prod:o.prod, qty:o.qty, price:o.price, penalty:o.pen, repLoss:o.repLoss, repGain:o.repGain,
          fine:o.fine, claim:o.claim, claimRep:o.claimRep, label:orderLabel(o)};
}
function acceptOffer(s, id){
  var o=offerById(s,id); if(!o || o.state!=='open') return {ok:false, why:'Заказ уже обработан'};
  var c=orderCheck(s,o); if(!c.ok) return c;
  s.contracts.push(contractOf(o)); o.state='taken';
  var switched=false; if(o.fine && s.plan.mode!=='fine'){ s.plan.mode='fine'; switched=true; }
  refitPlan(s);
  return {ok:true, switched:switched};
}
function dropOffer(s, id){
  var o=offerById(s,id); if(!o || o.state!=='taken') return false;
  s.contracts=s.contracts.filter(function(c){ return c.oid!==id; }); o.state='open'; refitPlan(s); return true;
}
function declineOffer(s, id){
  var o=offerById(s,id); if(!o || o.state!=='open') return null;
  o.state='declined'; var res={kind:o.kind};
  if(o.kind==='trap'){ s.rep=clamp(s.rep+1,0,100); s.orderStats=s.orderStats||{}; s.orderStats.trapNo=(s.orderStats.trapNo||0)+1; res.lesson=TRAP_NO; }
  return res;
}
/* торг: можно попробовать один раз, пока заказ не принят. Повысить цену на pct. */
var HAGGLE = [{pct:0.05,label:'+5%'},{pct:0.10,label:'+10%'},{pct:0.20,label:'+20%'}];
function haggleCap(s, o){
  var c=CLIENTS[o.client], r=rand01(s,'hag'+o.id);
  var k = o.kind==='charity' ? 0 : (o.kind==='trap' ? 1 : (o.kind==='rush' ? 1.2 : 1));
  return c.stub*(1+0.25*trustOf(s,o.client))*(0.6+0.8*r)*k*(hasSpec(s,'artyom')?1.3:1);
}
function haggleOffer(s, id, pct){
  var o=offerById(s,id); if(!o || o.state!=='open' || o.tried) return null;
  o.tried=true; var cap=haggleCap(s,o), c=CLIENTS[o.client]; s.orderStats=s.orderStats||{};
  if(pct<=cap+1e-9){
    o.price=nicePrice(o.base*(1+pct)); if(o.price<=o.base) o.price=o.base+5;
    s.orderStats.haggleWins=(s.orderStats.haggleWins||0)+1; s.flagsMonth=s.flagsMonth||{}; s.flagsMonth.haggle=s.month;
    return {res:'win', price:o.price, who:c.who, t:'Ладно, договорились. Пусть будет '+rub(o.price)+' за штуку.'};
  }
  if(pct<=cap+0.10) return {res:'hold', price:o.price, who:c.who, t:'Нет, выше не могу. Предложение прежнее: '+rub(o.price)+' за штуку. Берёте?'};
  o.state='gone'; s.orderStats.haggleLost=(s.orderStats.haggleLost||0)+1;
  return {res:'gone', who:c.who, t:'Это слишком дорого. Поищу другую мастерскую. Всего доброго.'};
}
function haggleHint(s, o){
  var c=CLIENTS[o.client];
  if(o.kind==='charity') return 'Благотворительный заказ не обсуждается';
  return 'Клиент: '+clientNote(o.client);
}

/* ---------- результаты месяца: доверие клиентов и статистика ---------- */
function applyOrderResults(s, r){
  s.orderStats=s.orderStats||{}; s.clients=s.clients||{}; r.trustMsgs=[];
  var st=s.orderStats;
  (r.orders||[]).forEach(function(o){
    if(!o.oid) return;
    var ok = o.miss<=0 && !o.fineFail, cl=o.client ? CLIENTS[o.client] : null;
    st.taken=(st.taken||0)+1;
    if(ok){ st.done=(st.done||0)+1; st.streak=(st.streak||0)+1; st.bestStreak=Math.max(st.bestStreak||0, st.streak); st.revenue=(st.revenue||0)+o.rev; }
    else { st.failed=(st.failed||0)+1; st.streak=0; }
    if(o.kind==='trap'){ o.reply = ok ? TRAP_CLAIM : 'Заказчик не получил своё. Что ж.'; return; }
    if(!cl){ return; }
    var c=clientOf(s,o.client), was=c.trust;
    if(ok){ c.trust=Math.min(5,c.trust+1); c.done++; } else { c.trust=Math.max(0,c.trust-2); c.failed++; }
    o.trust=c.trust; o.trustDelta=c.trust-was;
    var pool = ok ? cl.ok : cl.bad;
    o.reply = pool[Math.floor(rand01(s,'rep'+(o.oid||o.label))*pool.length)];
    if(ok && was<3 && c.trust>=3) r.trustMsgs.push('«'+cl.name+'» стал постоянным клиентом: цены выше на '+Math.round((trustBonus(s,o.client)-1)*100)+'%, торгуется охотнее.');
    if(!ok && c.trust<was) r.trustMsgs.push('Доверие «'+cl.name+'» упало.');
  });
}

/* ---------- цели месяца ---------- */
var GOAL_REWARD = 300, GOAL_BONUS = 700;
var GOALS = [
  {id:'util',  w:3, text:function(g){ return 'Загрузи принтеры не меньше чем на '+g.t+'%'; }, mk:function(s){ return {t:s.month<3?75:85}; },
   test:function(s,r,g){ return r.H>0 && r.hours/r.H>=g.t/100; }, hint:'Простаивающий принтер приносит только расходы.'},
  {id:'kinds', w:2, text:function(g){ return 'Продай не меньше '+g.t+' разных товаров'; }, mk:function(s){ var n=PROD_IDS.filter(function(id){ return s.unlocked[id]; }).length; return {t:Math.min(3,Math.max(2,n))}; },
   test:function(s,r,g){ return r.soldKinds>=g.t; }, ok:function(s){ return PROD_IDS.filter(function(id){ return s.unlocked[id]; }).length>=2; }, hint:'Разные товары не зависят от одного настроения покупателей.'},
  {id:'profit',w:3, text:function(g){ return 'Заработай чистую прибыль не меньше '+rub(g.t); }, mk:function(s){
      var last=s.history.length?s.history[s.history.length-1].profit:0; var base=Math.max(2000, last>0?last*1.05:2000);
      return {t:Math.round(base/500)*500}; },
   test:function(s,r,g){ return r.profit>=g.t; }, hint:'Прибыль это выручка минус все расходы, а не только выручка.'},
  {id:'order1',w:4, text:function(){ return 'Выполни хотя бы один заказ без срыва'; }, mk:function(){ return {}; },
   test:function(s,r){ return (r.orders||[]).some(function(o){ return o.miss<=0 && !o.fineFail; }); }, ok:function(s){ return s.board && s.board.offers.length>0; }, hint:'Заказ это договор: клиент платит, а мастерская обязана напечатать.'},
  {id:'order2',w:2, text:function(){ return 'Выполни два заказа за месяц'; }, mk:function(){ return {}; },
   test:function(s,r){ return (r.orders||[]).filter(function(o){ return o.miss<=0 && !o.fineFail; }).length>=2; }, ok:function(s){ return s.month>=3; }, hint:'Постоянные клиенты платят больше.'},
  {id:'nopen', w:2, text:function(){ return 'Не плати ни рубля штрафов'; }, mk:function(){ return {}; },
   test:function(s,r){ return r.penalty<=0.5; }, ok:function(s){ return s.month>=3; }, hint:'Штраф срабатывает, когда обещанное не выполнено.'},
  {id:'fail',  w:2, text:function(g){ return 'Держи брак ниже '+g.t+'%'; }, mk:function(s){ return {t:Math.max(6,Math.ceil(failRate(s,'std')*100)+1)}; },
   test:function(s,r,g){ return r.fail*100<g.t && r.hours>0; }, hint:'Брак съедает часы и пластик.'},
  {id:'left',  w:2, text:function(){ return 'Не оставляй на складе больше 10% от напечатанного'; }, mk:function(){ return {}; },
   test:function(s,r){ var q=0,l=0; PROD_IDS.forEach(function(id){ var x=r.rows[id]; if(x){ q+=x.q; l+=Math.max(0,x.left-x.invBefore); } }); return q<=0 || l<=0.1*q; }, ok:function(s){ return s.month>=2; }, hint:'Непроданный товар лежит мёртвым грузом и дешевеет.'},
  {id:'fine',  w:1, text:function(){ return 'Напечатай что-нибудь в режиме «Тонко»'; }, mk:function(){ return {}; },
   test:function(s,r){ return r.mode==='fine' && r.hours>0; }, ok:function(s){ return s.month>=3; }, hint:'Качество повышает спрос, но печатать дольше.'},
  {id:'ad',    w:1, text:function(){ return 'Запусти рекламу и окупи её'; }, mk:function(){ return {}; },
   test:function(s,r){ return r.adCost>0 && r.profit>0; }, ok:function(s){ return s.month>=2; }, hint:'Реклама окупается, если есть что продавать.'},
  {id:'haggle',w:2, text:function(){ return 'Выторгуй у клиента цену повыше'; }, mk:function(){ return {}; },
   test:function(s,r){ return s.flagsMonth && s.flagsMonth.haggle===r.month; }, ok:function(s){ return s.board && s.board.offers.some(function(o){ return o.state==='open' && o.kind!=='charity'; }); }, hint:'Торг это умение запросить чуть больше, не потеряв клиента.'},
  {id:'trust', w:1, text:function(){ return 'Подними доверие любого клиента до двух сердец'; }, mk:function(){ return {}; },
   test:function(s,r){ return Object.keys(s.clients||{}).some(function(k){ return s.clients[k].trust>=2; }); }, ok:function(s){ return s.month>=3; }, hint:'Постоянные клиенты это самый дешёвый источник продаж.'}
];
var GOAL_BY_ID = {}; GOALS.forEach(function(g){ GOAL_BY_ID[g.id]=g; });
function goalsFor(s){
  if(s.goals && s.goals.month===s.month) return s.goals;
  var rng=rngFor(s,'goals'+s.month), chosen=[], n = s.month===1 ? 2 : 3;
  var pool=GOALS.filter(function(g){ return !g.ok || g.ok(s); });
  if(s.month===1) pool=pool.filter(function(g){ return g.id==='order1'||g.id==='util'; });
  while(chosen.length<n && pool.length){
    var tot=pool.reduce(function(a,g){ return a+g.w; },0), roll=rng()*tot, acc=0, idx=pool.length-1;
    for(var i=0;i<pool.length;i++){ acc+=pool[i].w; if(roll<=acc){ idx=i; break; } }
    var g=pool.splice(idx,1)[0]; var d=g.mk(s); d.id=g.id; chosen.push(d);
  }
  s.goals={month:s.month, list:chosen};
  return s.goals;
}
function goalText(g){ var G=GOAL_BY_ID[g.id]; return G.text(g); }
/* проверяет цели, начисляет награду; вызывается после runMonth */
function settleGoals(s, r){
  var gs = (s.goals && s.goals.month===r.month) ? s.goals : null; r.goals={list:[], reward:0, bonus:0};
  if(!gs) return r.goals;
  var okN=0;
  gs.list.forEach(function(g){ var G=GOAL_BY_ID[g.id], ok=!!G.test(s,r,g); if(ok) okN++; r.goals.list.push({id:g.id, text:G.text(g), ok:ok, hint:G.hint}); });
  r.goals.reward = okN*GOAL_REWARD; r.goals.bonus = (okN===gs.list.length && okN>0) ? GOAL_BONUS : 0;
  var tot=r.goals.reward+r.goals.bonus;
  if(tot>0){ s.cash+=tot; var h=s.history[s.history.length-1]; r.cap=ownerCapital(s); r.cashAfter=s.cash; if(h){ h.cap=r.cap; h.cash=s.cash; } }
  if(r.goals.bonus>0) s.rep=clamp(s.rep+1,0,100);
  s.goalStars=(s.goalStars||0)+okN; s.goalTotal=(s.goalTotal||0)+gs.list.length;
  return r.goals;
}
if(typeof module!=='undefined') module.exports = {};
