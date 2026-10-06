/* ===== «Первый столик»: таблицы данных (блюда, города, оборудование, команда, каналы) ===== */
var TOTAL = 16;
var MONTHS = ['Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь','Январь','Февраль','Март','Апрель','Май','Июнь'];
var MONTHS_SHORT = ['Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек','Янв','Фев','Мар','Апр','Май','Июн'];
var CAL = [2,3,4,5,6,7,8,9,10,11,0,1,2,3,4,5];            /* номер календарного месяца (0 = январь) по игровому месяцу */
var ACTS = [
  {id:1, name:'Открываем дверь',   m:[1,4],   sub:'Март – июнь'},
  {id:2, name:'Своя кухня',        m:[5,8],   sub:'Июль – октябрь'},
  {id:3, name:'Второй город',      m:[9,12],  sub:'Ноябрь – февраль'},
  {id:4, name:'Сеть',              m:[13,16], sub:'Март – июнь'}
];
function actOf(m){ return m<=4?1:(m<=8?2:(m<=12?3:4)); }

var SEGS = ['stu','off','fam','tur','gou'];
var SEGN = {stu:'Студенты', off:'Офисные', fam:'Семьи', tur:'Туристы', gou:'Гурманы'};
var SEGD = {stu:'Любят недорого, кофе и выпечку, приходят после пар.', off:'Спешат на обед, ценят скорость и суп с горячим.', fam:'Берут сытное, десерты и напитки, любят детский уголок.', tur:'Ищут местное и красивое, платят охотнее.', gou:'Ценят вкус, свежие продукты и новинки, считают цену меньше.'};
var CATS = ['coffee','bake','brek','soup','main','salad','dess','cold'];
var CATN = {coffee:'Кофе и чай', bake:'Выпечка', brek:'Завтраки', soup:'Супы', main:'Горячее', salad:'Салаты и закуски', dess:'Десерты', cold:'Холодные напитки'};
var CATC = {coffee:'cocoa', bake:'amber', brek:'sun', soup:'tomato', main:'berry', salad:'basil', dess:'plum', cold:'sky'};
/* сколько позиций из категории берёт один гость (средняя корзина по сегментам) */
var BASKET = {
  stu:{coffee:.55, bake:.40, brek:.08, soup:.10, main:.18, salad:.05, dess:.12, cold:.20},
  off:{coffee:.50, bake:.15, brek:.06, soup:.38, main:.42, salad:.20, dess:.10, cold:.18},
  fam:{coffee:.25, bake:.20, brek:.20, soup:.25, main:.42, salad:.15, dess:.30, cold:.35},
  tur:{coffee:.40, bake:.25, brek:.15, soup:.25, main:.45, salad:.15, dess:.30, cold:.30},
  gou:{coffee:.40, bake:.20, brek:.12, soup:.20, main:.50, salad:.30, dess:.40, cold:.15}
};
/* характер блюда: множитель интереса по сегментам [студенты, офис, семьи, туристы, гурманы] */
var TAGS = {
  cheap:   {n:'недорого',   v:[1.30,1.15,1.00,0.85,0.70]},
  fast:    {n:'быстро',     v:[1.10,1.40,0.90,0.90,0.70]},
  hearty:  {n:'сытно',      v:[1.00,1.30,1.35,1.00,0.80]},
  trendy:  {n:'модно',      v:[1.40,1.00,0.70,1.10,1.30]},
  kids:    {n:'детям',      v:[0.80,0.50,1.70,0.90,0.50]},
  classic: {n:'классика',   v:[0.90,1.10,1.20,1.10,0.90]},
  premium: {n:'премиум',    v:[0.60,0.90,1.00,1.25,1.50]},
  local:   {n:'местное',    v:[1.00,1.00,1.10,1.50,1.30]},
  sweet:   {n:'сладкое',    v:[1.10,0.80,1.30,1.00,1.00]},
  healthy: {n:'полезно',    v:[1.10,1.20,1.00,0.90,1.20]}
};
/* u: start — есть с начала; rec — рецепт из тетради Тамары (по сюжету); lab — разработка за деньги; rest — только для ресторанов.
   h/c — сезонность: h = летнее блюдо, c = зимнее. need — оборудование, которого может не быть в стартовом кафе. */
var DISHES = [
 {id:'espresso', n:'Эспрессо',            cat:'coffee', cost:24,  ref:130, tier:3, prep:.6, tg:['fast','trendy'],             g:'cup',   u:'start'},
 {id:'latte',    n:'Капучино',            cat:'coffee', cost:42,  ref:220, tier:3, prep:.8, tg:['trendy','sweet'],            g:'cup',   u:'start'},
 {id:'tea',      n:'Чай с травами',       cat:'coffee', cost:15,  ref:150, tier:3, prep:.5, tg:['cheap','classic','healthy'], g:'tea',   u:'start'},
 {id:'cocoa',    n:'Какао с маршмеллоу',  cat:'coffee', cost:36,  ref:210, tier:3, prep:.8, tg:['kids','sweet'],              g:'cup',   u:'lab', lab:9000,  min:2},
 {id:'raf',      n:'Раф с лавандой',      cat:'coffee', cost:54,  ref:290, tier:4, prep:1,  tg:['trendy','premium'],          g:'cup',   u:'lab', lab:14000, min:3},
 {id:'sbiten',   n:'Сбитень с мёдом',     cat:'coffee', cost:30,  ref:200, tier:4, prep:.7, tg:['classic','local'],  c:1,    g:'tea',   u:'rec', rec:6, sig:1},
 {id:'pie',      n:'Пирожки «как у Тамары»', cat:'bake', cost:20, ref:110, tier:4, prep:.7, tg:['cheap','classic','fast'],    g:'pie',   u:'start', sig:1},
 {id:'bun',      n:'Булочка с корицей',   cat:'bake',   cost:26,  ref:140, tier:3, prep:.6, tg:['sweet','cheap'],   need:'oven', g:'bread', u:'start'},
 {id:'croissant',n:'Круассан',            cat:'bake',   cost:38,  ref:180, tier:3, prep:.7, tg:['trendy','fast'],   need:'oven', g:'bread', u:'lab', lab:6000, min:2},
 {id:'tpie',     n:'Тамарин яблочный пирог', cat:'bake', cost:46, ref:260, tier:5, prep:1,  tg:['classic','sweet','local'],   g:'cake',  u:'rec', rec:7, sig:1},
 {id:'oatmeal',  n:'Каша с ягодами',      cat:'brek',   cost:28,  ref:180, tier:3, prep:.7, tg:['healthy','cheap'],           g:'bowl',  u:'start'},
 {id:'omelet',   n:'Омлет с зеленью',     cat:'brek',   cost:38,  ref:240, tier:3, prep:.8, tg:['fast','healthy'],            g:'egg',   u:'start'},
 {id:'pancakes', n:'Блинчики со сгущёнкой', cat:'brek', cost:30,  ref:210, tier:3, prep:.8, tg:['kids','sweet','cheap'],      g:'pancake', u:'start'},
 {id:'syrniki',  n:'Сырники со сметаной', cat:'brek',   cost:44,  ref:280, tier:4, prep:.9, tg:['sweet','classic'],           g:'pancake', u:'rec', rec:4, sig:1},
 {id:'avotoast', n:'Тост с авокадо',      cat:'brek',   cost:78,  ref:360, tier:4, prep:.8, tg:['trendy','healthy','premium'], g:'sandwich', u:'lab', lab:12000, min:4},
 {id:'chicksoup',n:'Куриный суп с лапшой', cat:'soup',  cost:38,  ref:240, tier:3, prep:.9, tg:['hearty','classic','fast'],   g:'bowl',  u:'start'},
 {id:'borsch',   n:'Борщ по-тамарински',  cat:'soup',   cost:56,  ref:300, tier:4, prep:1,  tg:['hearty','classic'], c:1,     g:'bowl',  u:'rec', rec:2, sig:1},
 {id:'pumpkin',  n:'Тыквенный крем-суп',  cat:'soup',   cost:44,  ref:280, tier:4, prep:.9, tg:['healthy','trendy'], c:1,     g:'bowl',  u:'lab', lab:8000, min:3},
 {id:'okroshka', n:'Окрошка',             cat:'soup',   cost:38,  ref:250, tier:3, prep:.7, tg:['fast','healthy','cheap'], h:1, g:'bowl', u:'lab', lab:5000, min:2},
 {id:'solyanka', n:'Солянка',             cat:'soup',   cost:62,  ref:330, tier:4, prep:1.1,tg:['hearty','classic'], c:1,     g:'bowl',  u:'lab', lab:7000, min:3},
 {id:'cutlet',   n:'Котлета с пюре',      cat:'main',   cost:82,  ref:380, tier:3, prep:1.4,tg:['hearty','classic'],          g:'plate', u:'start'},
 {id:'pasta',    n:'Паста с томатами',    cat:'main',   cost:58,  ref:330, tier:3, prep:1.1,tg:['kids','fast'],               g:'pasta', u:'start'},
 {id:'dumpl',    n:'Вареники с картошкой', cat:'main',  cost:56,  ref:320, tier:3, prep:1.1,tg:['hearty','cheap','classic'],  g:'plate', u:'start'},
 {id:'burger',   n:'Бургер',              cat:'main',   cost:105, ref:440, tier:3, prep:1.3,tg:['trendy','fast','hearty'], need:'grill', g:'burger', u:'lab', lab:10000, min:3},
 {id:'chicken',  n:'Курица с овощами гриль', cat:'main', cost:98, ref:420, tier:3, prep:1.4,tg:['healthy','hearty'], need:'grill', g:'plate', u:'lab', lab:8000, min:2},
 {id:'fish',     n:'Форель с лимоном',    cat:'main',   cost:195, ref:720, tier:4, prep:1.8,tg:['premium','healthy'],         g:'fish',  u:'rest'},
 {id:'risotto',  n:'Ризотто с грибами',   cat:'main',   cost:118, ref:560, tier:4, prep:1.7,tg:['premium','trendy'],          g:'pasta', u:'rest'},
 {id:'steak',    n:'Стейк из индейки',    cat:'main',   cost:210, ref:840, tier:5, prep:2,  tg:['premium','hearty'],          g:'plate', u:'rest'},
 {id:'veg',      n:'Салат из свежих овощей', cat:'salad', cost:34, ref:220, tier:3, prep:.5, tg:['healthy','cheap','fast'],    g:'salad', u:'start'},
 {id:'vinegret', n:'Бабушкин винегрет',   cat:'salad',  cost:26,  ref:170, tier:4, prep:.4, tg:['cheap','classic','local'],   g:'salad', u:'rec', rec:5, sig:1},
 {id:'caesar',   n:'Цезарь с курицей',    cat:'salad',  cost:88,  ref:390, tier:3, prep:.8, tg:['trendy','hearty'],           g:'salad', u:'lab', lab:6000, min:2},
 {id:'brusch',   n:'Брускетты',           cat:'salad',  cost:44,  ref:270, tier:3, prep:.6, tg:['trendy','fast'],             g:'sandwich', u:'lab', lab:5000, min:2},
 {id:'tartare',  n:'Тартар из лосося',    cat:'salad',  cost:150, ref:620, tier:4, prep:1,  tg:['premium','trendy'],          g:'fish',  u:'rest'},
 {id:'cookies',  n:'Овсяное печенье',     cat:'dess',   cost:14,  ref:90,  tier:3, prep:.3, tg:['cheap','kids','sweet'],      g:'bread', u:'start'},
 {id:'eclair',   n:'Эклер',               cat:'dess',   cost:36,  ref:180, tier:3, prep:.4, tg:['sweet','fast'],              g:'cake',  u:'start'},
 {id:'napoleon', n:'Наполеон по-тамарински', cat:'dess', cost:52, ref:270, tier:5, prep:.6, tg:['classic','sweet','local'],   g:'cake',  u:'rec', rec:3, sig:1},
 {id:'cheesec',  n:'Чизкейк',             cat:'dess',   cost:62,  ref:310, tier:4, prep:.5, tg:['sweet','trendy'],  need:'oven', g:'cake', u:'lab', lab:9000, min:3},
 {id:'icecream', n:'Мороженое с ягодами', cat:'dess',   cost:32,  ref:200, tier:3, prep:.4, tg:['kids','sweet'],     h:1,    g:'icecream', u:'start'},
 {id:'fondant',  n:'Шоколадный фондан',   cat:'dess',   cost:70,  ref:360, tier:4, prep:.9, tg:['premium','sweet'],           g:'cake',  u:'rest'},
 {id:'compote',  n:'Морс и компот',       cat:'cold',   cost:15,  ref:130, tier:3, prep:.2, tg:['cheap','kids','classic'],    g:'glass', u:'start'},
 {id:'lemonade', n:'Домашний лимонад',    cat:'cold',   cost:24,  ref:190, tier:3, prep:.3, tg:['kids','trendy'],    h:1,    g:'glass', u:'start'},
 {id:'smoothie', n:'Смузи',               cat:'cold',   cost:48,  ref:270, tier:3, prep:.5, tg:['trendy','healthy'], h:1,    g:'glass', u:'lab', lab:6000, min:3},
 {id:'icedlatte',n:'Айс-латте',           cat:'cold',   cost:40,  ref:240, tier:3, prep:.5, tg:['trendy','fast'],    h:1,    g:'glass', u:'lab', lab:5000, min:3},
 {id:'kvass',    n:'Домашний квас',       cat:'cold',   cost:12,  ref:110, tier:3, prep:.1, tg:['cheap','classic'],  h:1,    g:'glass', u:'start'},
 {id:'flatwhite',n:'Флэт уайт',          cat:'coffee', cost:46,  ref:260, tier:4, prep:.9, tg:['trendy','premium'],          g:'cup',   u:'lab', lab:11000, min:4},
 {id:'mocha',    n:'Мокко',               cat:'coffee', cost:48,  ref:270, tier:3, prep:.9, tg:['sweet','trendy'],            g:'cup',   u:'lab', lab:9000,  min:5},
 {id:'chai',     n:'Масала-чай',          cat:'coffee', cost:32,  ref:220, tier:4, prep:.7, tg:['healthy','trendy'],          g:'tea',   u:'lab', lab:8000,  min:4},
 {id:'vatrushka',n:'Ватрушка с творогом', cat:'bake',   cost:28,  ref:150, tier:3, prep:.6, tg:['cheap','classic','kids'],    g:'pie',   u:'lab', lab:5000,  min:3},
 {id:'pizza',    n:'Пицца маргарита',     cat:'bake',   cost:70,  ref:400, tier:3, prep:1.2,tg:['trendy','hearty','kids'],    need:'oven', g:'pie', u:'lab', lab:12000, min:5},
 {id:'samsa',    n:'Самса с мясом',       cat:'bake',   cost:44,  ref:240, tier:3, prep:.8, tg:['hearty','fast','cheap'],     need:'oven', g:'pie', u:'lab', lab:7000,  min:6},
 {id:'granola',  n:'Гранола с йогуртом',  cat:'brek',   cost:36,  ref:230, tier:3, prep:.4, tg:['healthy','trendy','fast'],   g:'bowl',  u:'lab', lab:6000,  min:3},
 {id:'shakshuka',n:'Шакшука',             cat:'brek',   cost:52,  ref:310, tier:4, prep:1,  tg:['trendy','hearty'],           g:'egg',   u:'lab', lab:9000,  min:5},
 {id:'ukha',     n:'Уха по-тамарински',   cat:'soup',   cost:66,  ref:340, tier:4, prep:1.1,tg:['hearty','classic'], c:1,     g:'bowl',  u:'lab', lab:8000,  min:6},
 {id:'plov',     n:'Плов',                cat:'main',   cost:72,  ref:360, tier:3, prep:1.3,tg:['hearty','classic'],          g:'plate', u:'lab', lab:9000,  min:5},
 {id:'shawarma', n:'Шаурма',              cat:'main',   cost:60,  ref:300, tier:3, prep:.8, tg:['cheap','fast','hearty'],     g:'sandwich', u:'lab', lab:8000, min:4},
 {id:'bowl',     n:'Боул с курицей',      cat:'main',   cost:84,  ref:390, tier:3, prep:1,  tg:['healthy','trendy'],          g:'salad', u:'lab', lab:9500,  min:6},
 {id:'duck',     n:'Утка с яблоками',     cat:'main',   cost:230, ref:880, tier:5, prep:2.2,tg:['premium','hearty'],          g:'plate', u:'rest'},
 {id:'olivier',  n:'Оливье',              cat:'salad',  cost:38,  ref:240, tier:3, prep:.4, tg:['classic','cheap','hearty'],  g:'salad', u:'lab', lab:5000,  min:3},
 {id:'hering',   n:'Сельдь под шубой',    cat:'salad',  cost:40,  ref:250, tier:3, prep:.4, tg:['classic','local','cheap'],   g:'salad', u:'lab', lab:5000,  min:4},
 {id:'tiramisu', n:'Тирамису',            cat:'dess',   cost:66,  ref:330, tier:4, prep:.5, tg:['sweet','trendy','premium'],  g:'cake',  u:'lab', lab:10000, min:6},
 {id:'medovik',  n:'Медовик',             cat:'dess',   cost:48,  ref:260, tier:4, prep:.5, tg:['classic','sweet'],           g:'cake',  u:'lab', lab:7000,  min:4},
 {id:'macaron',  n:'Макаронс',            cat:'dess',   cost:54,  ref:300, tier:3, prep:.4, tg:['trendy','premium','sweet'],  need:'oven', g:'cake', u:'lab', lab:9000, min:7},
 {id:'milkshake',n:'Молочный коктейль',   cat:'cold',   cost:42,  ref:250, tier:3, prep:.5, tg:['kids','sweet'],     h:1,    g:'glass', u:'lab', lab:5500,  min:4},
 {id:'kombucha', n:'Комбуча',             cat:'cold',   cost:30,  ref:220, tier:3, prep:.2, tg:['healthy','trendy'],          g:'glass', u:'lab', lab:6000,  min:5}
];
/* себестоимость блюда около трети цены: заданные выше числа умножаются на коэффициент */
var COST_K = 1.75, PRICE_K = 1.15;
DISHES.forEach(function(d){ d.cost=Math.round(d.cost*COST_K); d.ref=Math.round(d.ref*PRICE_K/5)*5; });
var DISH = {}; DISHES.forEach(function(d){ DISH[d.id]=d; });
var RECIPES = [
  {n:1, id:'pie',      name:'Пирожки «как у Тамары»',   note:'Тесто на кефире и щепотка сахара в капусту. «Если пирожок остыл, его не продали вовремя».'},
  {n:2, id:'borsch',   name:'Борщ по-тамарински',        note:'Свёклу печь, а не варить. И обязательно ложка сметаны с горкой: так гость чувствует заботу.'},
  {n:3, id:'napoleon', name:'Наполеон',                  note:'Тридцать коржей раскатывать тонко, как письмо. Крем заваривать на молоке, а не выручать сгущёнкой.'},
  {n:4, id:'syrniki',  name:'Сырники',                   note:'Творог протирай через сито. Пухлые сырники рождаются из терпения, а не из муки.'},
  {n:5, id:'vinegret', name:'Бабушкин винегрет',         note:'Овощи режь вместе, но заправляй каждый отдельно маслом. Тогда цвета не смешаются.'},
  {n:6, id:'sbiten',   name:'Сбитень с мёдом',           note:'Зимой гость хочет не кофе, а чтобы его обняли. Сбитень обнимает.'},
  {n:7, id:'tpie',     name:'Яблочный пирог «Первый столик»', note:'Последняя страница. Здесь только одна строчка: «Рецепт ты уже знаешь. Просто пеки так, чтобы за каждым столиком ждали».'}
];
var SEASONF = {hot:[0.55,0.6,0.85,1.2,1.5,1.5,1.2,0.9,0.7,0.55,0.5,0.5], cold:[1.5,1.4,1.2,0.9,0.65,0.55,0.7,1.0,1.3,1.45,1.5,1.5]};   /* по календарным месяцам: янв…дек */

/* форматы заведений */
var FORMATS = {
  cafe: {id:'cafe', name:'Кафе',      seats:24, capex:600000,  rent:1,   pot:1.00, turns:3.3, util:34000, base:{cook:1,wait:1,bar:1,cln:0}, atmo:0,  mgr:false, desc:'Небольшое, быстрое, недорогое. Кормит соседей и студентов.'},
  rest: {id:'rest', name:'Ресторан',  seats:56, capex:1600000, rent:1.9, pot:1.35, turns:2.1, util:52000, base:{cook:2,wait:2,bar:1,cln:1}, atmo:10, mgr:true,  desc:'Большой зал, меню с рыбой и стейками. Дороже в запуске, зато гостей и чек больше.'},
  fran: {id:'fran', name:'Франшиза',  seats:30, capex:0,       rent:0,   pot:0.80, turns:3.0, util:0,     base:{cook:1,wait:1,bar:1,cln:0}, atmo:0,  mgr:false, desc:'Партнёр открывает кафе под вашим именем и платит вам процент.'}
};
var SUPPLIERS = {
  market: {id:'market', name:'Рынок',       cost:0.93, q:-6, waste:0.0,  doc:false, desc:'Дешевле всего, качество неровное, чеков нет (налоговые расходы не примут).'},
  whole:  {id:'whole',  name:'Оптовая база', cost:1.00, q:0,  waste:0.0,  doc:true,  desc:'Стабильно и по документам. Золотая середина.'},
  farm:   {id:'farm',   name:'Фермеры',      cost:1.12, q:8,  waste:0.015,doc:true,  desc:'Дороже, но свежо. Гурманы и туристы это чувствуют; свежее быстрее портится.'},
  chain:  {id:'chain',  name:'Сетевой поставщик', cost:0.90, q:2, waste:-0.01, doc:true, need:3, desc:'Нужна сеть от трёх заведений. Большие партии дешевле, поставки ровные.'}
};
var PAYS = [{n:'Ниже рынка',m:0.88,mor:-6},{n:'Как на рынке',m:1.00,mor:0},{n:'Выше рынка',m:1.18,mor:7}];
var HOURS = [
  {n:'9–18',  hf:0.80, wf:0.85, desc:'Короткий день: меньше гостей, меньше смен'},
  {n:'8–21',  hf:1.00, wf:1.00, desc:'Обычный день'},
  {n:'8–23',  hf:1.12, wf:1.22, desc:'Длинный день: больше гостей, дороже смены'}
];
var ROLES = {
  cook:{n:'Повара',     base:55000, hire:9000, cap:100, desc:'Готовят. Один повар тянет около 100 «единиц готовки» в день.'},
  wait:{n:'Официанты',  base:38000, hire:5000, cap:42,  desc:'Обслуживают гостей в зале: около 42 гостей в день на человека.'},
  bar: {n:'Баристы',    base:40000, hire:6000, cap:30,  desc:'Кофе, чай и напитки. Без баристы кофе готовит официант хуже и дольше.'},
  cln: {n:'Уборка и мойка', base:28000, hire:3000, cap:0, desc:'Чистота зала и посуда. Один человек на 30 мест.'}
};
var MGR = {wage:75000, hire:15000};

/* оборудование и ремонт; доступно в каждом заведении отдельно */
var EQ = [
  {id:'oven',   n:'Конвекционная печь',     cost:95000,  d:'Открывает булочки, круассаны и чизкейк, готовит на 10% быстрее.'},
  {id:'grill',  n:'Гриль',                 cost:65000,  d:'Открывает бургеры и курицу-гриль.'},
  {id:'espro',  n:'Профессиональная кофемашина', cost:140000, d:'Кофе вкуснее, баристы работают на 25% быстрее.'},
  {id:'fridge', n:'Холодильная камера',    cost:85000,  d:'Продукты портятся заметно реже, можно держать больший запас.'},
  {id:'dish',   n:'Посудомоечная машина',  cost:60000,  d:'Уборке и мойке нужно на человека меньше, чище посуда.'},
  {id:'pos',    n:'Касса и учёт (POS)',    cost:40000,  d:'Меньше ошибок и порчи, быстрее расчёт. Показывает, какие блюда приносят деньги.', run:3000},
  {id:'kitch2', n:'Вторая линия кухни',    cost:130000, d:'Кухня справляется на 40% больше, в меню ещё +2 места.'},
  {id:'seats',  n:'Расширение зала (+8 мест)', cost:110000, d:'Ещё 8 посадочных мест. Можно купить дважды.', max:2},
  {id:'terr',   n:'Летняя терраса',        cost:120000, d:'+12 мест с мая по сентябрь, гости любят сидеть на улице в хорошую погоду.'},
  {id:'kids',   n:'Детский уголок',        cost:45000,  d:'Семьи приходят чаще и остаются дольше.'},
  {id:'wifi',   n:'Wi-Fi и розетки',       cost:12000,  d:'Студенты и фрилансеры сидят дольше и заказывают больше кофе.'},
  {id:'music',  n:'Музыка и тёплый свет',  cost:25000,  d:'Уютнее. Платите за лицензию на музыку каждый месяц.', run:2000},
  {id:'deco1',  n:'Ремонт и декор I',      cost:70000,  d:'Свежая покраска, мебель и вывеска.'},
  {id:'deco2',  n:'Ремонт и декор II',     cost:140000, d:'Авторский интерьер. Нужен декор I.', req:'deco1'},
  {id:'deco3',  n:'Ремонт и декор III',    cost:260000, d:'Дизайнерский зал, о нём пишут. Нужен декор II.', req:'deco2'},
  {id:'deliv',  n:'Своя упаковка и курьеры', cost:50000, d:'Комиссия сервисов доставки заметно меньше.'}
];
var EQD = {}; EQ.forEach(function(e){ EQD[e.id]=e; });

/* особые люди, которых можно позвать в команду (открываются по сюжету) */
var SPECS = {
  arsen: {id:'arsen', name:'Арсен Михайлович', role:'Шеф', wage:70000, hire:0, min:2, where:'outlet', fx:'Повара готовят как на 2 уровня выше, блюда вкуснее, продукты тратятся на 4% экономнее.', desc:'Бывший шеф-повар большого ресторана. Строгий, но справедливый. Давно мечтал работать на Тамариной кухне.'},
  lera:  {id:'lera',  name:'Лера',             role:'Бариста и SMM', wage:42000, hire:0, min:1, where:'outlet', fx:'Кофе вкуснее, соцсети дают в 1,5 раза больше известности.', desc:'Студентка, мастер латте-арта. Умеет снимать ролики, которые смотрят.'},
  sonya: {id:'sonya', name:'Соня',             role:'Кондитер',     wage:50000, hire:0, min:5, where:'outlet', fx:'Выпечка и десерты продаются на 25% лучше, вкуснее на 0,5 балла.', desc:'Выпускница кондитерского колледжа. Пекла у бабушки в деревне, тоже по тетради.'},
  damir: {id:'damir', name:'Дамир',            role:'Су-шеф',       wage:60000, hire:0, min:8, where:'outlet', fx:'Местное блюдо города продаётся на 40% лучше, повара работают как +1 уровень.', desc:'Родом из Казани. Знает, как сделать эчпочмак таким, чтобы туристы возвращались.'},
  anton: {id:'anton', name:'Антон',            role:'Управляющий',  wage:100000, hire:25000, min:9, where:'outlet', fx:'Заведение не теряет качество без вас и работает на 6% лучше стандартного управляющего.', desc:'Десять лет проработал в сети кофеен. Любит порядок и таблицы.'},
  gleb:  {id:'gleb',  name:'Глеб',             role:'Закупщик',     wage:70000, hire:10000, min:7, where:'hq', fx:'Продукты дешевле на 5% во всех заведениях.', desc:'Знает всех поставщиков по именам. Торгуется так, что те сами делают скидку.'},
  polina:{id:'polina',name:'Полина',           role:'Маркетолог',   wage:65000, hire:10000, min:6, where:'hq', fx:'Реклама эффективнее на 30% во всех заведениях.', desc:'Раньше делала рекламу для сети магазинов. Умеет объяснять, почему акция сработала.'},
  emma:  {id:'emma',  name:'Эмма Григорьевна', role:'Бухгалтер',    wage:45000, hire:5000, min:3, where:'hq', fx:'Налоги на 8% меньше и без штрафов, показывает налоговый прогноз.', desc:'Двадцать лет с цифрами. Говорит мало, но всегда по делу.'},
  mila:  {id:'mila',  name:'Мила',             role:'Администратор зала', wage:52000, hire:6000, min:6, where:'outlet', fx:'Сервис лучше на 7 баллов, команда спокойнее: настроение выше.', desc:'Работала администратором в гостинице. Улыбается даже тогда, когда на кухне горит масло.'},
  ruslan:{id:'ruslan',name:'Руслан',           role:'Пекарь',       wage:56000, hire:6000, min:7, where:'outlet', fx:'Выпечка вкуснее на 0,3 балла и продаётся на 20% лучше. Работает вместе с кондитером.', desc:'Встаёт в четыре утра, чтобы булочки были тёплыми к открытию.'},
  vera:  {id:'vera',  name:'Вера',             role:'SMM-менеджер', wage:60000, hire:8000, min:8, where:'hq', fx:'Соцсети и блогеры работают в 1,4 раза сильнее во всех заведениях.', desc:'Знает, какие ролики смотрят до конца, и умеет объяснять, почему.'},
  oleg:  {id:'oleg',  name:'Олег',             role:'Технолог',     wage:68000, hire:9000, min:9, where:'hq', fx:'Порча продуктов меньше на 2,5 пункта, продукты дешевле на 2%.', desc:'Считает граммы на порцию и знает, сколько нужно соли на тонну супа.'}
};
var SPEC_IDS = ['arsen','lera','sonya','damir','anton','gleb','polina','emma','mila','ruslan','vera','oleg'];

/* маркетинг заведения: ежемесячные включатели */
var MKT = [
  {id:'flyer', n:'Вывеска и листовки',        cost:3000,  d:'Дёшево, помогает соседям узнать о вас.',                          reach:{stu:.04,off:.02,fam:.07,tur:.02,gou:0},    awr:.030},
  {id:'smm',   n:'Соцсети и сторис',          cost:9000,  d:'Молодёжь и туристы видят вашу еду в ленте.',                      reach:{stu:.10,off:.03,fam:.05,tur:.07,gou:.04}, awr:.050},
  {id:'blog',  n:'Обзор блогера',             cost:25000, d:'Сильный толчок известности. Но если качество хромает, обзор будет злым.', reach:{stu:.06,off:.02,fam:.04,tur:.10,gou:.12}, awr:.100},
  {id:'corp',  n:'Корпоративные обеды',       cost:6000,  d:'Офисы приходят обедать, чаще появляются большие заказы.',          reach:{stu:0,off:.16,fam:0,tur:0,gou:.02},        awr:.020},
  {id:'fest',  n:'Стенд на городской ярмарке',cost:20000, d:'Туристы и гурманы пробуют ваши блюда на месте.',                  reach:{stu:.03,off:.02,fam:.05,tur:.12,gou:.06}, awr:.060},
  {id:'happy', n:'Счастливые часы',           cost:0,     d:'Скидка 15% в тихие часы: гостей больше, чек немного ниже.',        reach:{stu:.08,off:0,fam:.06,tur:.02,gou:0},      awr:.010},
  {id:'loyal', n:'Карта лояльности',          cost:6000,  d:'Постоянные гости приходят чаще. Скидка по карте 3% от чека.',      reach:{stu:.02,off:.02,fam:.03,tur:0,gou:0},       awr:.010},
  {id:'lunch', n:'Бизнес-ланч',               cost:4000,  d:'Суп, горячее и напиток по набору со скидкой. Офисные гости приходят в обед.',  reach:{stu:.03,off:.18,fam:0,tur:0,gou:0},     awr:.020},
  {id:'class', n:'Мастер-классы',             cost:7000,  d:'Гости сами лепят пирожки и пекут сырники. Узнаваемость и тёплые отзывы.',     reach:{stu:.04,off:0,fam:.08,tur:.05,gou:.06},   awr:.035},
  {id:'merch', n:'Мерч и подарочные наборы',  cost:5000,  d:'Кружки с котом Борщом и коробки пирожков. Немного денег и много улыбок.',     reach:{stu:.03,off:.01,fam:.04,tur:.08,gou:.02}, awr:.020},
  {id:'cater', n:'Выездной кейтеринг',        cost:10000, d:'Вы привозите еду на праздники. Больше предложений на банкеты.',                reach:{stu:0,off:.04,fam:.03,tur:0,gou:.04},      awr:.020},
  {id:'deliv', n:'Доставка через сервис',     cost:0,     d:'Новые заказы без мест в зале, но сервис берёт комиссию 25% и нужна упаковка.', reach:{stu:0,off:0,fam:0,tur:0,gou:0},       awr:.010}
];
var MKTD = {}; MKT.forEach(function(m){ MKTD[m.id]=m; });

/* города: seg — сколько гостей в день «рядом» (для кафе при обычных условиях), inc — платёжеспособность, rent — аренда кафе в месяц,
   tur — сезонность туристов по календарным месяцам, comp — конкуренция (0…1), cap — коэффициент ремонта, x/y — положение на схеме, loc — местное блюдо */
var CITIES = {
  tula:   {id:'tula',   n:'Тула',            pop:'пятьсот тысяч', seg:[24,34,22,6,4],   inc:0.92, rent:68000,  comp:.30, cap:1.00, x:150, y:132, kmHQ:0,    min:1,
           tur:[.7,.7,.8,.9,1,1.1,1.2,1.1,1,.9,.8,.9],            sky:'tula',   climate:'умеренный',
           loc:{n:'Тульский пряник с мёдом', cat:'dess', cost:20, ref:150, tier:4, prep:.3, tg:['local','sweet'], g:'cake'},
           note:'Ваш родной город. Спокойный спрос, невысокая аренда, много людей на заводах и в офисах.'},
  nnov:   {id:'nnov',   n:'Нижний Новгород', pop:'1,2 миллиона', seg:[38,36,22,16,8],  inc:1.00, rent:80000,  comp:.38, cap:1.12, x:207, y:100, kmHQ:420,  min:9,
           tur:[.8,.8,.9,1,1.1,1.3,1.4,1.3,1.1,.9,.8,1],          sky:'nnov',   climate:'умеренный',
           loc:{n:'Нижегородская кулебяка', cat:'bake', cost:48, ref:260, tier:4, prep:.9, tg:['local','hearty'], g:'pie'},
           note:'Много студентов и айтишников, летом на набережных полно туристов.'},
  kazan:  {id:'kazan',  n:'Казань',          pop:'1,3 миллиона', seg:[40,34,24,30,12], inc:1.02, rent:90000,  comp:.42, cap:1.14, x:258, y:112, kmHQ:820,  min:9,
           tur:[.9,.9,1,1,1.2,1.3,1.3,1.3,1.1,1,.9,1.1],          sky:'kazan',  climate:'умеренный',
           loc:{n:'Эчпочмак', cat:'bake', cost:52, ref:280, tier:4, prep:.9, tg:['local','hearty'], g:'pie'},
           note:'Туристы приезжают круглый год. Любят местную кухню, студентов много.'},
  spb:    {id:'spb',    n:'Санкт-Петербург', pop:'5,6 миллиона', seg:[42,44,26,52,22], inc:1.28, rent:150000, comp:.60, cap:1.45, x:122, y:46,  kmHQ:960,  min:11,
           tur:[1,.9,.9,1,1.2,1.6,1.7,1.5,1.1,.9,.8,1.3],         sky:'spb',    climate:'сырой и прохладный',
           loc:{n:'Петербургские пышки', cat:'dess', cost:18, ref:130, tier:4, prep:.3, tg:['local','cheap','sweet'], g:'cake'},
           note:'Туристов больше всех, платёжеспособность высокая, но аренда и конкуренция тоже.'},
  ekb:    {id:'ekb',    n:'Екатеринбург',    pop:'1,5 миллиона', seg:[34,50,24,12,10], inc:1.05, rent:95000,  comp:.45, cap:1.10, x:332, y:92,  kmHQ:1800, min:10,
           tur:[.8,.8,.9,1,1,1.1,1.1,1.1,1,.9,.8,.9],             sky:'ekb',    climate:'холодный',
           loc:{n:'Уральские пельмени', cat:'main', cost:62, ref:360, tier:4, prep:1.1, tg:['local','hearty'], g:'plate'},
           note:'Деловой город: офисных людей много, обедают быстро и точно по часам.'},
  sochi:  {id:'sochi',  n:'Сочи',            pop:'600 тысяч',    seg:[14,22,30,80,14], inc:1.15, rent:130000, comp:.50, cap:1.30, x:152, y:218, kmHQ:1500, min:9,
           tur:[.25,.25,.35,.7,1.3,2.0,2.4,2.4,1.7,.8,.35,.4],     sky:'sochi',  climate:'тёплый, морской',
           loc:{n:'Хачапури по-аджарски', cat:'main', cost:85, ref:400, tier:4, prep:1.2, tg:['local','hearty'], g:'pie'},
           note:'Летом город переполнен туристами, зимой почти пустой. Сезонность решает всё.'},
  kgd:    {id:'kgd',    n:'Калининград',     pop:'500 тысяч',    seg:[20,26,22,40,12], inc:1.00, rent:85000,  comp:.35, cap:1.15, x:30,  y:108, kmHQ:1500, min:11,
           tur:[.6,.6,.7,.9,1.2,1.6,1.8,1.7,1.2,.8,.6,.8],        sky:'kgd',    climate:'морской, влажный',
           loc:{n:'Калининградский марципан', cat:'dess', cost:30, ref:220, tier:4, prep:.3, tg:['local','sweet','premium'], g:'cake'},
           note:'Летом туристы едут к морю, зимой город притихает. Далеко от остальных, поставки дороже.'},
  nsk:    {id:'nsk',    n:'Новосибирск',     pop:'1,6 миллиона', seg:[48,38,26,10,10], inc:0.98, rent:85000,  comp:.40, cap:1.12, x:392, y:96,  kmHQ:3300, min:12,
           tur:[.7,.7,.8,.9,1,1.1,1.2,1.2,1,.9,.8,.9],            sky:'nsk',    climate:'резко континентальный',
           loc:{n:'Сибирский пирог с кедровым орехом', cat:'bake', cost:40, ref:230, tier:4, prep:.8, tg:['local','sweet'], g:'pie'},
           note:'Город студентов и учёных: много молодёжи, зимой очень холодно, а люди всё равно идут в тёплые места.'},
  vvo:    {id:'vvo',    n:'Владивосток',     pop:'600 тысяч',    seg:[26,28,24,26,10], inc:1.08, rent:90000,  comp:.35, cap:1.35, x:448, y:172, kmHQ:9000, min:13,
           tur:[.6,.6,.7,.9,1.1,1.4,1.6,1.6,1.2,.8,.6,.7],        sky:'vvo',    climate:'морской, ветреный',
           loc:{n:'Дальневосточный крабовый салат', cat:'salad', cost:70, ref:380, tier:4, prep:.6, tg:['local','premium'], g:'salad'},
           note:'Конец маршрута Тамары: океан, мост и краб. Далеко от всех, продукты везут долго, зато туристы щедрые.'},
  msk:    {id:'msk',    n:'Москва',          pop:'13 миллионов', seg:[60,90,40,70,40], inc:1.50, rent:260000, comp:.80, cap:1.80, x:156, y:98,  kmHQ:190,  min:12,
           tur:[1,1,1,1,1.1,1.2,1.2,1.2,1.1,1,1,1.2],             sky:'msk',    climate:'умеренный',
           loc:{n:'Московский калач', cat:'bake', cost:28, ref:170, tier:4, prep:.5, tg:['local','classic'], g:'bread'},
           note:'Самый большой рынок и самая дорогая аренда. Здесь легко разориться и легко прославиться.'}
};
var CITY_IDS = ['tula','nnov','kazan','spb','ekb','sochi','kgd','msk','nsk','vvo'];
CITY_IDS.forEach(function(k){ var l=CITIES[k].loc; l.cost=Math.round(l.cost*COST_K); l.ref=Math.round(l.ref*PRICE_K/5)*5; });
/* общая сезонность сегментов по календарным месяцам (янв…дек) */
var SEGSEAS = {
  stu:[.90,1.00,1.00,1.00,.95,.60,.40,.40,1.00,1.05,1.05,.90],
  off:[.75,1.00,1.00,1.00,.95,.95,.90,.80,1.00,1.05,1.05,1.10],
  fam:[.90,.90,1.00,1.00,1.00,1.15,1.20,1.20,1.00,.95,.95,1.10],
  tur:null,
  gou:[.90,.95,1.00,1.00,1.05,1.05,1.05,1.05,1.05,1.05,1.00,1.10]
};
/* кривая чувствительности к цене у сегментов: спрос = 1/(1+(r/r50)^k), r — цена к рыночной */
var PRICEK = {stu:{k:6,r:1.08}, off:{k:5,r:1.15}, fam:{k:5.5,r:1.10}, tur:{k:3.5,r:1.35}, gou:{k:3,r:1.50}};
var VALNU = {stu:1.4, off:.8, fam:1.0, tur:.5, gou:.4};

/* таланты и сложности */
var TALENTS = {
  cook: {id:'cook', name:'Кулинар',        icon:'whisk',  desc:'Вы чувствуете вкус. Блюда выходят лучше, новые рецепты разрабатываются на треть дешевле.'},
  biz:  {id:'biz',  name:'Делец',          icon:'coins',  desc:'Вы считаете копейки. Продукты на 3% дешевле, банки предлагают процент поменьше.'},
  host: {id:'host', name:'Душа компании',  icon:'heart',  desc:'Гости чувствуют заботу. Сервис лучше, команда держится, о кафе узнают быстрее.'}
};
var DIFFS = {
  easy: {id:'easy', name:'Спокойно', dem:1.07, infl:0.006, cities:3, cap:1400000, rating:3.7, desc:'Больше гостей, цены растут медленнее. Цель: 3 города, 1 400 000 ₽ капитала и рейтинг сети 3,7.', start:520000},
  norm: {id:'norm', name:'Обычно',   dem:1.00, infl:0.008, cities:4, cap:2200000, rating:3.9, desc:'Как в жизни. Цель: 4 города, 2 200 000 ₽ капитала и рейтинг сети 3,9.', start:450000},
  hard: {id:'hard', name:'Трудно',   dem:0.94, infl:0.010, cities:5, cap:3000000, rating:4.0, desc:'Гостей меньше, цены растут быстрее, конкуренты злее. Цель: 5 городов, 3 000 000 ₽ капитала и рейтинг сети 4,0.', start:400000}
};
var BANK = {rate:0.016, limit:1500000};
var INVESTOR = {share:0.20, sum:1200000};

/* развитие сети: штаб-квартира */
var HQUP = [
  {id:'std',    n:'Книга стандартов',        cost:90000,  min:2, d:'Одинаковый вкус и сервис во всех заведениях. Управляющие работают без потери качества.', ico:'book'},
  {id:'school', n:'Учебный центр',           cost:200000, min:3, d:'Обучение персонала вдвое дешевле, меньше текучки.', ico:'cap', req:'std'},
  {id:'site',   n:'Сайт и приложение сети',  cost:250000, min:2, d:'Доставка выгоднее, постоянные гости копят баллы во всех городах.', ico:'phone'},
  {id:'buy',    n:'Совместные закупки',      cost:150000, min:3, d:'Продукты дешевле на 4% во всех заведениях.', ico:'cart'},
  {id:'secret', n:'Программа «Тайный гость»',cost:120000, min:2, d:'Проверяет заведения, качество держится ровнее, видно слабые места.', ico:'eye', req:'std'},
  {id:'brand',  n:'Фирменный стиль и ребрендинг', cost:180000, min:1, d:'Узнаваемость сети растёт, новые заведения открываются с большей известностью.', ico:'palette'},
  {id:'central',n:'Центральная кухня',       cost:1200000,min:3, d:'Заготовки для всех заведений в одном месте: продукты дешевле на 7%, вкус ровнее.', ico:'factory', req:'buy'},
  {id:'fran',   n:'Пакет франшизы',          cost:300000, min:3, d:'Можно продавать франшизу в небольших городах: партнёр платит вам взнос и проценты.', ico:'handshake', req:'std'},
  {id:'academy',n:'Академия поваров',        cost:380000, min:6, d:'Своя школа для поваров: во всех заведениях кухня работает как на пол-уровня выше.', ico:'cap', req:'school'},
  {id:'logist', n:'Логистика и склад',       cost:260000, min:5, d:'Продукты привозят по графику: порча ниже на 2 пункта во всех заведениях.', ico:'truck', req:'buy'},
  {id:'rd',     n:'Центр разработки меню',   cost:300000, min:5, d:'Новые рецепты разрабатываются вдвое дешевле.', ico:'whisk'},
  {id:'mkthq',  n:'Отдел маркетинга',        cost:220000, min:4, d:'Вся реклама работает на 15% сильнее.', ico:'mega'},
  {id:'fin',    n:'Финансовый отдел',        cost:180000, min:4, d:'Налог на 4% ниже, банк даёт кредит на 0,2 пункта дешевле.', ico:'coins'},
  {id:'app',    n:'Приложение с баллами',    cost:340000, min:5, d:'Гости копят баллы во всех городах: постоянных больше, доставка выгоднее.', ico:'phone', req:'site'},
  {id:'charity',n:'Тамарин ужин для соседей',cost:60000,  min:1, d:'Раз в месяц бесплатный ужин для пенсионеров. Дорого, но город вас любит.', ico:'heart'}
];
var HQUPD = {}; HQUP.forEach(function(u){ HQUPD[u.id]=u; });

var CHARS = {
  nar:   {name:'', role:''},
  borsch:{name:'Борщ', role:'кот кафе', skin:'#E8A23A', hair:'#E8A23A'},
  tamara:{name:'Тамара', role:'ваша бабушка', skin:'#F0C9A4', hair:'#B9B2A8', cloth:'#C8452B', acc:'scarf'},
  arsen: {name:'Арсен Михайлович', role:'шеф-повар', skin:'#E7B994', hair:'#8A8F94', cloth:'#F4EFE8', acc:'toque'},
  lera:  {name:'Лера', role:'бариста', skin:'#F5CFAE', hair:'#5A3320', cloth:'#2F7F5A', acc:'bun'},
  kira:  {name:'Кира', role:'блогер «Кира ест»', skin:'#EDBF9C', hair:'#C23A63', cloth:'#3F6FB5', acc:'phone'},
  viktor:{name:'Виктор Петрович', role:'хозяин здания', skin:'#E4B28C', hair:'#3E3A38', cloth:'#53483D', acc:'glasses'},
  nazarov:{name:'Игорь Назаров', role:'сеть «Гурман-Холдинг»', skin:'#EBC09A', hair:'#202226', cloth:'#26324F', acc:'tie'},
  olesya:{name:'Олеся', role:'менеджер банка', skin:'#F2CBAA', hair:'#8A4B2A', cloth:'#5B4B9A', acc:'none'},
  emma:  {name:'Эмма Григорьевна', role:'бухгалтер', skin:'#F0C6A4', hair:'#6C6F78', cloth:'#7B3F61', acc:'glasses'},
  maria: {name:'Мария Сергеевна', role:'постоянная гостья', skin:'#EBC5A4', hair:'#C9C6C2', cloth:'#8E5A7A', acc:'scarf'},
  inspector:{name:'Павел Игоревич', role:'санитарный инспектор', skin:'#E0B190', hair:'#4A4A4A', cloth:'#4A6D8C', acc:'cap'},
  anna:  {name:'Анна Ли', role:'эксперт гида «Золотая вилка»', skin:'#F3D2B4', hair:'#1D1B22', cloth:'#1F6B63', acc:'none'},
  damir: {name:'Дамир', role:'су-шеф', skin:'#E3B58E', hair:'#2B2420', cloth:'#F4EFE8', acc:'toque'},
  sonya: {name:'Соня', role:'кондитер', skin:'#F6D3B6', hair:'#D79A4C', cloth:'#C9638A', acc:'bun'},
  anton: {name:'Антон', role:'управляющий', skin:'#E5B791', hair:'#46362A', cloth:'#3C5A7C', acc:'tie'},
  polina:{name:'Полина', role:'маркетолог', skin:'#F2C8A6', hair:'#7A2E2E', cloth:'#C9792B', acc:'phone'},
  gleb:  {name:'Глеб', role:'закупщик', skin:'#E6BC98', hair:'#3C3C3C', cloth:'#556B3A', acc:'cap'},
  artem: {name:'Артём Викторович', role:'инвестор', skin:'#E8BE9A', hair:'#7A7B7D', cloth:'#2D4A57', acc:'glasses'},
  mila:  {name:'Мила', role:'администратор зала', skin:'#F2C9A8', hair:'#9A5B2E', cloth:'#B04B6A', acc:'bun'},
  ruslan:{name:'Руслан', role:'пекарь', skin:'#E2B48E', hair:'#3A2A22', cloth:'#F4EFE8', acc:'toque'},
  vera:  {name:'Вера', role:'SMM-менеджер', skin:'#F3D0B2', hair:'#2E4A7A', cloth:'#3A8F8A', acc:'phone'},
  oleg:  {name:'Олег', role:'технолог', skin:'#E6BC98', hair:'#6A5A4A', cloth:'#4A5B6C', acc:'glasses'},
  tema:  {name:'Тёма', role:'студент, постоянный гость', skin:'#EBC09E', hair:'#5A3A2A', cloth:'#C0562B', acc:'cap'},
  olga:  {name:'Ольга', role:'офис, постоянная гостья', skin:'#F0C6A4', hair:'#3C2A5A', cloth:'#4A4A8A', acc:'glasses'},
  orlov: {name:'Семья Орловых', role:'постоянные гости', skin:'#E8BE9A', hair:'#8A6A3A', cloth:'#5A8A4A', acc:'none'},
  efim:  {name:'Ефим Львович', role:'ресторанный критик', skin:'#E8C4A6', hair:'#C8C4BE', cloth:'#3A3A44', acc:'glasses'},
  juan:  {name:'Хуан', role:'турист', skin:'#D9A87E', hair:'#2A1E18', cloth:'#D8892B', acc:'cap'},
  nika:  {name:'Ника', role:'школьница, мастер-класс', skin:'#F4D2B6', hair:'#B05A3A', cloth:'#C9638A', acc:'bun'}
};

/* праздники: по календарным месяцам (0 = январь). seg — прирост спроса по группам, cat — интерес к категории блюд */
var HOLIDAYS = [
 {n:'Рождественские каникулы',   d:'Семьи гуляют, туристы приезжают на праздники.',          seg:{fam:.14,tur:.12,stu:0,off:0,gou:.04},  cat:{dess:.20,main:.08},        cost:9000},
 {n:'Масленица и 23 февраля',    d:'Блины, чай и корпоративные обеды для коллег.',           seg:{fam:.08,off:.12,stu:.04,tur:0,gou:0},  cat:{brek:.25,dess:.10},        cost:7000},
 {n:'8 Марта',                   d:'Десерты, цветы и столики на двоих.',                     seg:{fam:.10,gou:.12,stu:.06,off:.04,tur:0},cat:{dess:.28,coffee:.08},      cost:8000},
 {n:'Пасха и весна',             d:'Куличи, пироги и семейные обеды.',                       seg:{fam:.14,tur:.06,stu:0,off:0,gou:.04},  cat:{bake:.25,dess:.12},        cost:7000},
 {n:'Майские праздники',         d:'Длинные выходные, туристы и прогулки.',                  seg:{tur:.16,fam:.12,stu:.05,off:-.1,gou:.04},cat:{cold:.15,main:.06},      cost:9000},
 {n:'Выпускные и День защиты детей',d:'Семьи с детьми и выпускники.',                        seg:{fam:.16,stu:.10,tur:.04,off:0,gou:0},  cat:{dess:.22,cold:.14},        cost:8000},
 {n:'Жаркое лето',               d:'Холодные напитки, мороженое и террасы.',                 seg:{tur:.14,fam:.08,stu:.04,off:-.04,gou:0},cat:{cold:.30,dess:.12},       cost:7000},
 {n:'Последние тёплые дни',      d:'Люди спешат насладиться концом лета.',                   seg:{fam:.12,tur:.10,stu:.05,off:0,gou:.03},cat:{cold:.18,main:.06},        cost:7000},
 {n:'1 сентября',                d:'Студенты и школьники возвращаются, родители пьют кофе.', seg:{stu:.16,fam:.12,off:.04,tur:0,gou:0},   cat:{coffee:.14,bake:.14},      cost:8000},
 {n:'Золотая осень',             d:'Тёплые супы, пироги и осенние прогулки.',                seg:{tur:.10,fam:.08,gou:.08,stu:0,off:0},  cat:{soup:.22,bake:.16},        cost:8000},
 {n:'Чёрная пятница и ноябрь',   d:'Люди тратят больше, любят акции и подарки.',            seg:{stu:.10,fam:.10,off:.06,tur:0,gou:.04},cat:{dess:.14,main:.06},        cost:9000},
 {n:'Новогодний месяц',          d:'Корпоративы, ёлки и подарки. Самый дорогой месяц года.', seg:{off:.16,fam:.16,tur:.10,stu:.06,gou:.08},cat:{dess:.24,soup:.10},      cost:12000}
];

/* задания месяца: проверяются по итогам. t(s,R,r) — выполнено ли; r — флагманский отчёт */
var QUESTS = [
 {id:'q_guests',n:'Полный зал',        d:'Принять 70 и больше гостей в день в флагмане.',   min:4, rew:12000, t:function(s,R,r){ return r&&r.guests/30>=70; }},
 {id:'q_rating',n:'Рейтинг растёт',    d:'Поднять рейтинг флагмана за месяц.',               min:2, rew:9000,  t:function(s,R,r){ return r&&r.repNew>r.repOld+0.4; }},
 {id:'q_food',  n:'Скупой повар',      d:'Фуд-кост сети не выше 31%.',                       min:3, rew:10000, t:function(s,R){ return R.total.rev>0&&R.total.cogs/R.total.rev<=0.31; }},
 {id:'q_prime', n:'Здоровый прайм-кост',d:'Продукты и зарплаты вместе не больше 62% выручки.',min:4,rew:12000, t:function(s,R){ return R.total.rev>0&&(R.total.cogs+R.total.wages)/R.total.rev<=0.62; }},
 {id:'q_stop',  n:'Ничего не кончилось',d:'Потери из-за стоп-листа не больше 2% в каждом заведении.',min:3,rew:8000,t:function(s,R){ return R.outlets.every(function(r){ return r.building||r.stockLoss==null||r.stockLoss<=0.02; }); }},
 {id:'q_waste', n:'Ничего не пропало', d:'Порча продуктов не больше 6% в каждом заведении.',min:4, rew:9000,  t:function(s,R){ return R.outlets.every(function(r){ return r.building||r.waste==null||r.waste<=0.06; }); }},
 {id:'q_profit1',n:'В плюс',           d:'Закончить месяц с прибылью.',                       min:1, rew:7000,  t:function(s,R){ return R.profit>0; }},
 {id:'q_profit2',n:'Сто тысяч',        d:'Заработать за месяц 100 000 ₽ прибыли.',            min:5, rew:15000, t:function(s,R){ return R.profit>=100000; }},
 {id:'q_profit3',n:'Четверть миллиона',d:'Заработать за месяц 250 000 ₽ прибыли.',            min:9, rew:25000, t:function(s,R){ return R.profit>=250000; }},
 {id:'q_banq',  n:'Успешный банкет',   d:'Принять и успешно провести банкет.',               min:3, rew:12000, t:function(s,R){ return R.outlets.some(function(r){ return r.banNote&&r.banNote.some(function(b){ return b.ok; }); }); }},
 {id:'q_stars', n:'Три звезды меню',   d:'Иметь в меню минимум три «звезды».',               min:4, rew:10000, t:function(s,R,r){ return r&&r.mix&&r.mix.filter(function(x){ return x.cls==='star'; }).length>=3; }},
 {id:'q_util',  n:'Без очередей',      d:'Спрос не выше возможностей ни в одном заведении.', min:3, rew:10000, t:function(s,R){ return R.outlets.every(function(r){ return r.building||r.utilK==null||r.utilK<=1.0; }); }},
 {id:'q_check', n:'Средний чек 420',   d:'Средний чек флагмана не ниже 420 ₽.',              min:4, rew:9000,  t:function(s,R,r){ return r&&r.avgCheck>=420; }},
 {id:'q_clean', n:'Блестящая чистота', d:'Чистота флагмана не ниже 75 из 100.',               min:3, rew:8000,  t:function(s,R,r){ return r&&r.dims&&r.dims.cln>=75; }},
 {id:'q_svc',   n:'Улыбки и скорость', d:'Сервис флагмана не ниже 70 из 100.',                min:4, rew:9000,  t:function(s,R,r){ return r&&r.dims&&r.dims.svc>=70; }},
 {id:'q_atmo',  n:'Уютный зал',        d:'Уют флагмана не ниже 55 из 100.',                   min:3, rew:8000,  t:function(s,R,r){ return r&&r.dims&&r.dims.atmo>=55; }},
 {id:'q_nolost',n:'Каждому место',     d:'Не потерять больше 5% гостей из-за нехватки мощности.',min:5,rew:12000,t:function(s,R){ return R.outlets.every(function(r){ return r.building||!r.m||r.m.want<=0||r.m.cap/r.m.want<=0.05; }); }},
 {id:'q_menu',  n:'Большое меню',      d:'Держать в меню все места: больше выбора для гостей.',min:5, rew:7000,  t:function(s,R){ return s.menu.length>=menuSlots(s)-1; }},
 {id:'q_loyal', n:'Свои люди',         d:'Довести постоянных гостей флагмана до 30%.',        min:4, rew:10000, t:function(s,R){ return flagship(s).loy>=0.3; }},
 {id:'q_net',   n:'Две точки в плюсе', d:'Чтобы два заведения были в плюсе одновременно.',    min:10,rew:20000, t:function(s,R){ return R.outlets.filter(function(r){ return !r.building&&r.profitOp>0; }).length>=2; }}
];
var QUEST_BY_ID={}; QUESTS.forEach(function(q){ QUEST_BY_ID[q.id]=q; });

/* постоянные гости: у каждого свой любимый «хит». hint — подсказка, пока не угадали */
var REGULARS = [
 {id:'maria', who:'maria', n:'Мария Сергеевна', seg:'fam', fav:'tpie',  alt:'pie',  hint:'любит пироги и выпечку по рецептам Тамары', from:2,  gift:'Банка варенья и открытка: «Тамара бы гордилась».'},
 {id:'tema',  who:'tema',  n:'Тёма',            seg:'stu', fav:'latte', alt:'cookies', hint:'студент: любит кофе и что-нибудь недорогое к нему', from:3, gift:'Он выкладывает фото вашего кофе в студенческий чат.'},
 {id:'olga',  who:'olga',  n:'Ольга',           seg:'off', fav:'chicksoup', alt:'borsch', hint:'обедает по расписанию: суп и горячее без очереди', from:4, gift:'Она приводит весь отдел на корпоративный обед.'},
 {id:'orlov', who:'orlov', n:'Семья Орловых',   seg:'fam', fav:'syrniki', alt:'pancakes', hint:'по выходным завтракают с детьми', from:5, gift:'Дети нарисовали кафе. Рисунок висит у кассы.'},
 {id:'juan',  who:'juan',  n:'Хуан',            seg:'tur', fav:'loc',  alt:'icecream', hint:'турист: пробует местное и любит мороженое', from:7, gift:'Он оставляет в соцсетях восторженный отзыв на трёх языках.'},
 {id:'efim',  who:'efim',  n:'Ефим Львович',    seg:'gou', fav:'napoleon', alt:'cheesec', hint:'ресторанный критик: ценит классику и настоящие десерты', from:8, gift:'Короткая заметка в газете: «Наполеон — как в детстве».'}
];
var REG_BY_ID={}; REGULARS.forEach(function(r){ REG_BY_ID[r.id]=r; });

/* соперники в городах: названия и характеры. Конкретные соперники строятся от кода класса и месяца */
var RIVAL_NAMES = ['Кофе-Пойнт','Булка и Ко','Дом борща','Гастро-Лавка','Вилка и Ложка','Лимон и Мята','Тёплый хлеб','Кухня на углу','Зерно','Чайхана у моста','Сладкая ложка','Пирог на плите','Мята','Городская столовая','Уголок','Хлеб да соль'];
var RIVAL_STYLES = ['кофейня','столовая','бистро','ресторан','пекарня'];

/* факты для экрана «Идёт месяц» */
var FACTS = [
 'В среднем кафе ингредиенты стоят от 28 до 35% цены блюда. Выше — почти нет прибыли.',
 'Гость запоминает последнюю ложку: поэтому десерт и чай в конце обеда часто решают, вернётся ли он.',
 'Кофе в зёрнах теряет аромат через несколько недель после обжарки. Поэтому его берут часто и понемногу.',
 'Цена на ценнике, заканчивающаяся на 90 или 95, кажется людям ниже. Это называют психологической ценой.',
 'Самые доходные блюда в меню — суп, салат и напитки. Они дёшево готовятся и хорошо берутся.',
 'У каждого повара есть любимый нож. Хорошие ножи в кафе точат каждый день.',
 'Лучшая реклама кафе — гость, который привёл друга. Про это говорят «сарафанное радио».',
 'Если стол пустует час, заведение теряет деньги. Поэтому в тихие часы придумывают скидки.',
 'Меню в 7–9 блюд на категорию — потолок: больше людям трудно выбрать, повару трудно держать качество.',
 'Яблочный пирог придумали задолго до того, как в Россию привезли первые яблоки с юга.',
 'Хлеб остаётся свежим около суток. Поэтому вчерашние булочки превращают в сухарики или тосты.',
 'Рестораны со звёздами гида проверяют инкогнито: проверяющие никогда не называют себя.',
 'Холодильная камера окупается за год, если в кафе портится больше десятой части продуктов.',
 'Постоянный гость тратит в год в несколько раз больше, чем случайный. Поэтому карты лояльности работают.',
 'Хорошая сдача — это не только деньги, а уважение к гостю. Касса без ошибок ценится.',
 'У приправ есть срок годности. Старая специя не портит блюдо, но и не придаёт ему вкуса.',
 'Меню читают сверху вниз по часовой стрелке. Выгодные блюда ставят в начало каждой категории.',
 'Когда за окном дождь, растут заказы на доставку: люди не хотят выходить.',
 'В жарком июле заказы напитков выше, чем в январе, в три-четыре раза.',
 'Рейтинг в 4,5 звезды в картах — почти потолок: пятёрки ставят редко, и их подозревают в накрутке.',
 'У шефа в большой кухне есть правило: «Минус один человек — минус одно блюдо в меню».',
 'Продукты на кухне хранят по правилу «первым пришёл — первым ушёл». Его сокращённо называют FIFO.',
 'Кофемашину после каждой смены нужно промывать: накипь портит вкус и сокращает срок её службы.',
 'Налоговая смотрит не только на выручку: ей важны чеки на продукты и зарплатные ведомости.',
 'Если расширяться слишком быстро, качество «уплывает»: гости замечают это раньше, чем владельцы.',
 'В хорошей кухне на каждое блюдо есть технологическая карта: сколько чего положить, сколько варить.',
 'Фермерские продукты свежее, но их цена зависит от погоды и урожая.',
 'Кофейни открываются у университетов и станций, потому что люди там торопятся и берут напитки с собой.'
];

/* заметки Тамары о городах: показываются на карте */
var TAMARA_CITY={
 tula:'«Тула. Тут я родилась, тут и первый столик. Пряник с мёдом печётся к приходу гостей, не раньше».',
 nnov:'«Нижний. На вокзале ночью пекли кулебяку. Я выпросила рецепт у проводницы за два пирожка».',
 kazan:'«Казань. Эчпочмак нужно есть горячим и руками. Всё остальное не по-настоящему».',
 spb:'«Петербург. Пышки с пудрой на Большой Конюшенной. Дождь, пудра, радость».',
 ekb:'«Екатеринбург. Пельмени на двадцать пятом градусе мороза. Я их до сих пор вижу».',
 sochi:'«Сочи. Хачапури у моря. Жара, соль и ни одного нормального полотенца».',
 kgd:'«Калининград. Марципан в лавке с колокольчиком. Дверь звякнет, и ты уже счастлива».',
 nsk:'«Новосибирск. Пять часов на перроне и пельмени с кедровым орехом. Сибиряки смеются: «Тут холодно, зато сердце тёплое»».',
 vvo:'«Владивосток. Конец дороги: океан, мост и краб. Дальше только назад, но я возвращалась с полной тетрадью».',
 msk:'«Москва. Звезда на карте. Там всё очень быстро и очень дорого. Вернись, когда соберёшь силы».'
};
