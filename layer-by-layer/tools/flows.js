/* Особые ветки сюжета и крайние случаи через подстановку состояния */
const path=require('path'), fs=require('fs'), vm=require('vm');
const { chromium } = require(process.env.PW_PATH||'/opt/node-tools/node_modules/playwright');
const FILE='file://'+path.join(__dirname,'..','index.html');
const OUT=process.argv[2]||path.join(__dirname,'..','dist','shots'); fs.mkdirSync(OUT,{recursive:true});
require('./load.js');
const sim=require('./sim.js');
let fails=0; const ok=(c,m)=>{ if(!c){ fails++; console.log('FAIL',m); } else console.log('ok  ',m); };
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const p=await (await b.newContext({viewport:{width:1180,height:900}})).newPage(); const errs=[];
  p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
  await p.goto(FILE); await p.waitForTimeout(300);
  const setState=(S,U)=>p.evaluate(([S,U])=>window.__game.setState(S,U),[S,U]);
  const base=(month)=>{ const s=newState('Тест'); s.month=month; s.mini={}; s.mini[month]=''; return s; };
  /* 1. пожар без денег и без страховки: все варианты дороже счёта */
  let s=base(13); s.cash=1500; await setState(s,{screen:'scene',stage:0,res:[]}); await p.waitForTimeout(300);
  let dis=await p.$$eval('.choice',els=>els.map(e=>e.disabled));
  ok(dis[0]===false && dis[1]===false,'пожар без денег: варианты доступны «в долг» (нет тупика)');
  await (await p.$$('.choice'))[1].click(); await p.waitForTimeout(200);
  let st=await p.evaluate(()=>({cash:window.__game.S.cash, loan:window.__game.S.loanLeft}));
  ok(st.cash>=0 && st.loan>0,'долг вместо отрицательного счёта: cash='+Math.round(st.cash)+' loan='+Math.round(st.loan));
  await p.screenshot({path:path.join(OUT,'flow-fire-nocash.png'),fullPage:true});
  /* 2. пожар при союзе с Максом */
  s=base(13); s.cash=80000; s.flags.ally=true; s.insurance=true; await setState(s,{screen:'scene',stage:0,res:[]}); await p.waitForTimeout(300);
  dis=await p.$$eval('.choice',els=>els.map(e=>e.disabled)); ok(dis.length===3 && !dis[2],'пожар при союзе: доступна помощь Макса');
  /* 3. отказ от замены блока: ветка без пожара */
  s=base(13); s.cash=80000; s.flags.psu=true; await setState(s,{screen:'scene',stage:0,res:[]}); await p.waitForTimeout(300);
  ok((await p.textContent('h1'))==='Ночь в мастерской' && (await p.$$('.choice')).length===2,'блок заменён: другая ветка (конкурс), 2 варианта');
  /* 4. копии: честная и «скачанная» ветки */
  s=base(11); s.cash=80000; s.unlocked.mini=true; s.flags.liza='pirate'; await setState(s,{screen:'scene',stage:0,res:[]}); await p.waitForTimeout(300);
  ok((await p.textContent('.dialog')).includes('написал жалобу'),'ветка «скачанные модели»: претензия автора');
  s=base(11); s.cash=80000; s.unlocked.mini=true; s.flags.liza='license'; await setState(s,{screen:'scene',stage:0,res:[]}); await p.waitForTimeout(300);
  ok(!(await p.textContent('.dialog')).includes('мои фигурки'),'ветка «лицензия»: Лиза не говорит «мои фигурки»');
  /* 5. заказ на 150 брелоков: блокировка минимума в плане */
  s=base(4); s.cash=90000; s.contracts.push({prod:'key',qty:150,price:120,penalty:0.3,repLoss:6,repGain:3,label:'тест'}); await setState(s,{screen:'scene',stage:0,res:[{i:0,chips:[{t:'тест',k:'info'}],reply:null}]},);
  await p.evaluate(()=>{ window.__game.A.scenenext(); }); await p.waitForTimeout(300);
  if(await p.$('#modal .modal')) await p.click('#modal [data-act=closemodal]');
  await p.click('[data-t=biz]'); await p.waitForTimeout(100);
  const lockMin=await p.evaluate(()=>+document.getElementById('qr-key').min); const qty=await p.evaluate(()=>window.__game.S.plan.qty.key);
  ok(lockMin===150 && qty>=150,'заказ: минимум выпуска брелоков 150 (min='+lockMin+', qty='+qty+')');
  ok((await p.textContent('#pc-key')).includes('не меньше 150'),'заказ: в карточке есть пояснение про минимум');
  await p.screenshot({path:path.join(OUT,'flow-contract-plan.png'),fullPage:true});
  /* попытка уменьшить ниже минимума кнопкой − */
  await p.evaluate(()=>{ for(let i=0;i<5;i++) window.__game.A.step({getAttribute:(k)=>({'data-k':'qty','data-id':'key','data-d':'-1'})[k]}); });
  ok((await p.evaluate(()=>window.__game.S.plan.qty.key))>=150,'кнопка − не опускает ниже минимума');
  /* 6. инвестор: доля в шапке и на финансах */
  s=base(10); s.cash=300000; s.equity=0.85; s.flags.investor=true; await setState(s,{screen:'plan',tab:'fin',helpSeen:true}); await p.waitForTimeout(300);
  ok((await p.textContent('#hud')).includes('85%'),'шапка показывает долю владельца 85%');
  ok((await p.textContent('.bal')).includes('Твоя доля'),'в балансе видна доля инвестора');
  /* 7. покупка принтера при лимите места */
  s=base(8); s.cash=500000; s.space='home'; s.printers.push({t:'std',age:0}); await setState(s,{screen:'plan',tab:'shop',helpSeen:true}); await p.waitForTimeout(300);
  const buyDis=await p.$$eval('[data-act=buyp]',els=>els.map(e=>e.disabled)); ok(buyDis.length>0 && buyDis.every(x=>x),'дом, 2 принтера: покупка заблокирована, причина показана');
  ok((await p.textContent('.stage')).includes('Нет места'),'причина «Нет места» видна');
  /* 8. победный и слабый финалы */
  const best=sim.runGame('expert','best',2).s, weak=sim.runGame('bad2','mid',2).s;
  for (const [name,S] of [['win',best],['weak',weak]]){
    S.name='Победитель'; S.quizScore=[3,2,3,3]; S.quizTotal=12; S.terms=Object.keys(TERMS).slice(0,12); S.unlock.deposit=true;
    await setState(JSON.parse(JSON.stringify(S)),{screen:'final'}); await p.waitForTimeout(1200);
    const cap=await p.evaluate(()=>ownerCapital(window.__game.S)); const title=await p.textContent('.rank');
    ok(title.length>3,'финал '+name+': звание «'+title+'», капитал '+cap);
    await p.screenshot({path:path.join(OUT,'flow-final-'+name+'.png'),fullPage:true});
  }
  /* 10. таланты: особый вариант виден только своему таланту и работает */
  s=base(2); s.cash=80000; s.talent='des'; await setState(s,{screen:'scene',stage:0,res:[]}); await p.waitForTimeout(300);
  let labels=await p.$$eval('.choice b',els=>els.map(e=>e.textContent));
  ok(labels.includes('Нарисовать свои модели') && (await p.textContent('.choice.talent-c')).includes('Талант: Дизайнер'),'дизайнер: в сцене Лизы есть особый вариант с подписью таланта');
  await p.click('.choice.talent-c'); await p.waitForTimeout(250);
  st=await p.evaluate(()=>({liza:window.__game.S.flags.liza, mini:window.__game.S.unlocked.mini}));
  ok(st.liza==='own' && st.mini,'свои модели: фигурки открыты, роялти нет');
  s=base(2); s.cash=80000; s.talent='eng'; await setState(s,{screen:'scene',stage:0,res:[]}); await p.waitForTimeout(300);
  labels=await p.$$eval('.choice b',els=>els.map(e=>e.textContent)); ok(labels.length===3 && !labels.includes('Нарисовать свои модели'),'инженер не видит вариант дизайнера');
  s=base(7); s.cash=90000; s.talent='eng'; await setState(s,{screen:'scene',stage:0,res:[]}); await p.waitForTimeout(300);
  labels=await p.$$eval('.choice b',els=>els.map(e=>e.textContent)); ok(labels.includes('Собрать принтер своими руками'),'инженер: на месяце 7 можно собрать принтер самому');
  await p.click('.choice.talent-c'); await p.waitForTimeout(250);
  ok((await p.evaluate(()=>window.__game.S.printers.some(x=>x.t==='diy'))),'самосборный принтер добавлен в мастерскую');
  s=base(13); s.cash=80000; s.talent='eng'; await setState(s,{screen:'scene',stage:0,res:[]}); await p.waitForTimeout(300);
  labels=await p.$$eval('.choice b',els=>els.map(e=>e.textContent)); ok(labels.includes('Починить своими руками за ночь'),'инженер: при пожаре можно починить самому');
  /* 11. экран настройки: название, талант, код класса, сложность */
  await p.evaluate(()=>{ localStorage.clear(); window.__game.setState(null,{screen:'title'}); });
  await p.fill('#pname','Проверка'); await p.click('#startbtn'); await p.click('[data-act=introskip]'); await p.waitForSelector('#setupgo');
  await p.click('#setupgo'); await p.waitForTimeout(150);
  ok((await p.evaluate(()=>window.__game.U.screen))==='setup','без таланта дальше не пускает');
  await p.fill('#shopname','Тестовая  мастерская'); await p.click('[data-act=ptalent][data-k=sel]'); await p.click('[data-act=pdiff][data-k=hard]'); await p.fill('#classcode',' 8б-печать ');
  await p.click('#setupgo'); await p.waitForTimeout(250);
  st=await p.evaluate(()=>({shop:window.__game.S.shop, talent:window.__game.S.talent, diff:window.__game.S.diff, code:window.__game.S.code, cash:window.__game.S.cash, seed:window.__game.S.seed, scr:window.__game.U.screen}));
  ok(st.shop==='Тестовая мастерская' && st.talent==='sel' && st.diff==='hard' && st.code==='8Б-ПЕЧАТЬ' && st.cash===25000 && st.seed==='КЛАСС|8Б-ПЕЧАТЬ' && st.scr==='intro','настройка применена: '+JSON.stringify(st));
  /* 9. сообщение «в долг» не ломает отображение ценников */
  ok(errs.length===0,'ошибок консоли нет'+(errs.length?': '+errs.join(' | '):''));
  await b.close(); console.log(fails?('\nПРОВАЛОВ: '+fails):'\nОсобые ветки: всё в порядке'); process.exit(fails?1:0);
})().catch(e=>{ console.error('FAIL',e.message); process.exit(1); });
