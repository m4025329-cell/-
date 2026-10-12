/* Проверка «внутри приложения»: берём игру из собранного APK и открываем её по адресу, который использует приложение.
   Проверяем запуск, отсутствие карточки установки, мост печати и отправки. node tools/check-native.js */
const path=require('path'), fs=require('fs'), cp=require('child_process');
const PW=process.env.PW_PATH||'/opt/node-tools/node_modules/playwright'; const pw=require(PW), {chromium}=pw;
const APK=path.join(__dirname,'..','play','Pervyi-stolik.apk'); let bad=0; const ok=(c,m)=>{ if(!c){ bad++; console.log('  ПЛОХО: '+m); } else console.log('  ок: '+m); };
if(!fs.existsSync(APK)){ console.log('нет '+APK+': сначала play/android/build-apk.sh'); process.exit(1); }
const html=cp.execFileSync('unzip',['-p',APK,'assets/www/index.html'],{maxBuffer:1<<28}); const manifest=cp.execFileSync('unzip',['-p',APK,'assets/www/manifest.webmanifest']);
const cur=fs.readFileSync(path.join(__dirname,'..','index.html')); ok(Buffer.compare(html,cur)===0,'игра в APK совпадает с текущей сборкой index.html');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 14; Pixel 7 Build/UP1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0 Mobile Safari/537.36'});
  await ctx.route('https://appassets.androidplatform.net/**',route=>{ const u=new URL(route.request().url()); if(u.pathname==='/assets/www/index.html') return route.fulfill({status:200,contentType:'text/html',body:html}); if(u.pathname==='/assets/www/manifest.webmanifest') return route.fulfill({status:200,contentType:'application/json',body:manifest}); return route.fulfill({status:404,body:'no'}); });
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error'&&!/404/.test(m.text())) errs.push(m.text()); });
  await p.addInitScript(()=>{ window.__bridge=[]; window.AndroidBridge={share:(t,x)=>window.__bridge.push(['share',t,x.length]),print:()=>window.__bridge.push(['print'])}; });
  await p.goto('https://appassets.androidplatform.net/assets/www/index.html'); await p.waitForTimeout(500);
  ok(!!(await p.$('.hero')),'игра запустилась по адресу приложения');
  ok(!(await p.$('.instcard')),'в приложении карточка установки скрыта');
  ok((await p.evaluate(()=>navigator.serviceWorker?navigator.serviceWorker.controller===null:true)),'сервис-воркер в приложении не включается');
  await p.evaluate(()=>{ window.__game.A.newgameyes(); window.__game.A.introskip(); window.__game.A.startgame(); }); await p.waitForTimeout(300);
  ok(await p.evaluate(()=>{ try{ localStorage.setItem('t','1'); return localStorage.getItem('t')==='1'; }catch(e){ return false; } }),'localStorage работает (сохранение игры)');
  await p.evaluate(()=>window.__game.A.savefile()); await p.waitForTimeout(100); const br=await p.evaluate(()=>window.__bridge);
  ok(br.some(x=>x[0]==='share'&&x[2]>500),'«Скачать файлом» отправляет код через системное окно «Поделиться»');
  /* печать: нужны два отыгранных месяца */
  const B=require('./bots.js'); require('./load.js'); const s=B.run(B.good({}),'nat','norm'); s.name='Ученик';
  await p.evaluate(({S})=>{ window.__game.setState(S,{screen:'final',seen:{},actSeen:{}}); window.__game.A.sheet(); },{S:s}); await p.waitForTimeout(300);
  await p.evaluate(()=>window.__game.A.sheetprint()); const br2=await p.evaluate(()=>window.__bridge); ok(br2.some(x=>x[0]==='print'),'«Печать» вызывает печать приложения');
  const back=await p.evaluate(()=>window.__appBack()); ok(back===true,'кнопка «Назад» закрыла отчёт');
  console.log(errs.length?('ОШИБКИ: '+errs.slice(0,3).join(' | ')):'ошибок страницы нет'); console.log(bad?('ПРОВАЛОВ: '+bad):'Внутри приложения: всё хорошо'); await b.close(); process.exit(bad?1:0);
})();
