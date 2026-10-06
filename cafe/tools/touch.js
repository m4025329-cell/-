/* Проверка касаниями: ключевые кнопки нажимаются настоящими «тапами» на телефонах и планшете.
   Если кнопку что-то перекрывает или она вне экрана, Playwright сообщит. node tools/touch.js [профиль,...] */
const path=require('path'); const PW=process.env.PW_PATH||'/opt/node-tools/node_modules/playwright'; const pw=require(PW), {chromium}=pw;
const FILE='file://'+path.join(__dirname,'..','index.html');
const PROFILES={iphonese:pw.devices['iPhone SE'],iphone:pw.devices['iPhone 13'],pixel:pw.devices['Pixel 7'],ipad:pw.devices['iPad (gen 7)'],galaxy:{viewport:{width:360,height:740},deviceScaleFactor:3,isMobile:true,hasTouch:true}};
const names=(process.argv[2]||Object.keys(PROFILES).join(',')).split(','); let bad=0;
(async()=>{
  for(const name of names){
    const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); const opts=Object.assign({},PROFILES[name]); delete opts.defaultBrowserType;
    const ctx=await b.newContext(opts); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
    const log=[]; const tap=async(sel,label)=>{ try{ await p.locator(sel).first().tap({timeout:4000}); await p.waitForTimeout(140); return true; }catch(e){ bad++; log.push('НЕ НАЖИМАЕТСЯ '+(label||sel)+': '+String(e.message).split('\n').slice(0,6).join(' | ')); return false; } };
    await p.goto(FILE); await p.waitForTimeout(400);
    await tap('[data-act=newgame]','Начать игру'); await tap('[data-act=intronext]','пролог: дальше'); await tap('[data-act=introskip]','пропустить пролог');
    await p.locator('#f-name').fill('Тап'); await tap('[data-act=settalent][data-v=host]','талант'); await tap('[data-act=setdiff][data-v=easy]','сложность'); await tap('[data-act=startgame]','открыть кафе');
    await tap('[data-act=actgo]','акт: начать');
    await tap('[data-act=pick] >> nth=1','выбор в сцене'); await p.evaluate(()=>window.scrollTo(0,99999)); await tap('[data-act=scenenext]','дальше в сцене');
    for(let i=0;i<3;i++){ if(await p.evaluate(()=>window.__game.U.screen)!=='event') break; await tap('[data-act=evpick]','вариант в случае'); await p.evaluate(()=>window.scrollTo(0,99999)); await tap('[data-act=evnext]','дальше после случая'); }
    for(const t of ['menu','place','guests','money','home']) await tap('[data-tab='+t+']','вкладка '+t);
    await tap('[data-tab=menu]','вкладка меню'); await tap('[data-act=menutoggle] >> nth=0','переключатель блюда'); await tap('[data-act=pinc] >> nth=0','цена +'); await tap('[data-act=pricesync]','цены под рынок');
    await tap('[data-tab=place]','вкладка зал'); await tap('[data-act=hire] >> nth=0','нанять'); await tap('[data-act=hours][data-v="2"]','часы'); await tap('[data-act=stockinc]','запас +');
    await tap('[data-tab=guests]','вкладка гости'); await tap('[data-act=mk] >> nth=1','реклама'); 
    await tap('[data-tab=money]','вкладка деньги'); await tap('[data-act=tax][data-v="15"]','налог');
    await tap('[data-tab=home]','главная'); await tap('[data-act=go]','запустить месяц'); if(await p.$('[data-act=goforce]')) await tap('[data-act=goforce]','всё равно запустить');
    await tap('[data-act=runskip]','показать итоги'); await p.evaluate(()=>window.scrollTo(0,99999)); await tap('[data-act=repnext]','дальше');
    await tap('[data-act=pick] >> nth=0','сцена 2: вариант');
    await tap('#tools [data-act=menu]','меню игры'); await tap('#modal [data-act=help]','справка'); await tap('#modal [data-act=closemodal]','закрыть окно');
    console.log(name.padEnd(9), log.length?('ПРОБЛЕМЫ:\n   '+log.join('\n   ')):'все ключевые кнопки нажимаются', errs.length?('\n   ОШИБКИ: '+errs[0]):'');
    await b.close();
  }
  console.log(bad?('ПРОБЛЕМ: '+bad):'Касания: проблем нет'); process.exit(bad?1:0);
})();
