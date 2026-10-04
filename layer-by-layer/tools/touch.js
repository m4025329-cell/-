/* Проверка касаниями: проходит ключевые экраны настоящими «тапами», как на телефоне и планшете.
   Если кнопку что-то перекрывает или она вне экрана, Playwright сообщит об этом.   Запуск: node tools/touch.js [профиль,...] */
const path=require('path');
const PW=process.env.PW_PATH||'/opt/node-tools/node_modules/playwright';
const pw=require(PW), { chromium }=pw;
const FILE='file://'+path.join(__dirname,'..','index.html');
const PROFILES={ iphonese:pw.devices['iPhone SE'], iphone:pw.devices['iPhone 13'], pixel:pw.devices['Pixel 7'], ipad:pw.devices['iPad (gen 7)'], galaxy:{viewport:{width:360,height:740},deviceScaleFactor:3,isMobile:true,hasTouch:true} };
const names=(process.argv[2]||Object.keys(PROFILES).join(',')).split(',');
let bad=0;
(async()=>{
  for(const name of names){
    const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); const opts=Object.assign({},PROFILES[name]); delete opts.defaultBrowserType;
    const ctx=await b.newContext(opts); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
    const log=[]; const tap=async(sel,label)=>{ try{ await p.locator(sel).first().tap({timeout:4000}); await p.waitForTimeout(120); }catch(e){ bad++; log.push('НЕ НАЖИМАЕТСЯ '+(label||sel)+': '+String(e.message).split('\n').filter(l=>/intercept|outside|not visible|Timeout/.test(l)).slice(0,2).join(' | ')); } };
    await p.goto(FILE); await p.waitForTimeout(400);
    await p.locator('#pname').fill('Тап'); await tap('#startbtn','старт'); await tap('[data-act=introskip]','пропуск пролога');
    await p.waitForSelector('#setupgo'); await tap('[data-act=pscn][data-k=story]','режим'); await tap('[data-act=ptalent][data-k=eng]','талант'); await tap('#setupgo','дальше'); await tap('[data-act=skipcalib]','к делу');
    for(let i=0;i<4;i++){ if(await p.evaluate(()=>window.__game.U.screen)==='plan') break; if(await p.$('[data-act=choose]')) await tap('[data-act=choose]','вариант в сцене'); if(await p.$('[data-act=scenenext]')) await tap('[data-act=scenenext]','дальше в сцене'); }
    if(await p.$('#modal .modal')) await tap('#modal [data-act=closemodal]','закрыть окно');
    await tap('[data-act=oacc]','принять заказ'); await tap('[data-act=ohag]','торг'); await tap('[data-act=hagp]','вариант торга'); await tap('[data-t=biz]','вкладка Печать');
    await tap('[data-act=qfdem]','«под спрос»'); await tap('[data-act=step][data-k=price]','кнопка цены'); await tap('[data-act=mode][data-m=std]','режим'); await tap('[data-act=fnote]','схема: блок');
    await tap('#modal [data-act=closemodal]','закрыть пояснение');
    for(const t of ['stock','market','shop','fin','orders']) await tap('[data-t='+t+']','вкладка '+t);
    await tap('[data-act=mapopen]','Где что?'); await tap('#modal [data-act=closemodal]','закрыть карту'); await tap('[data-act=goalstoggle]','цели');
    await tap('[data-t=biz]','вкладка Печать'); await tap('#gobtn','Запустить печать'); if(await p.$('[data-act=gosure]')) await tap('[data-act=gosure]','всё равно печатать'); if(await p.$('[data-act=slskip]')) await tap('[data-act=slskip]','слайсер: пропуск');
    await tap('[data-act=runskip]','пропустить печать'); await tap('[data-act=myq]','вопрос по цифрам'); await tap('[data-act=afterreport]','следующий месяц');
    await tap('[data-act=choose]','сцена 2: вариант');
    console.log(name.padEnd(9), log.length?('ПРОБЛЕМЫ:\n   '+log.join('\n   ')):'все ключевые кнопки нажимаются', errs.length?('\n   ОШИБКИ: '+errs[0]):'');
    await b.close();
  }
  console.log(bad?('ПРОВАЛОВ: '+bad):'Касания: всё в порядке'); process.exit(bad?1:0);
})();
