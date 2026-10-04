/* Проверка веб-версии: манифест, значки, сервис-воркер, работа без сети, кнопка «Назад». Запуск: node play/tools/check-pwa.js */
const http=require('http'), fs=require('fs'), path=require('path');
const PW=process.env.PW_PATH||'/opt/node-tools/node_modules/playwright';
const { chromium }=require(PW);
const WEB=path.join(__dirname,'..','..','web');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png'};
const srv=http.createServer((q,r)=>{ let f=path.join(WEB,q.url.split('?')[0]==='/'?'index.html':q.url.split('?')[0]); if(!fs.existsSync(f)){ r.writeHead(404); return r.end(); } r.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'}); r.end(fs.readFileSync(f)); });
let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c) bad++; };
srv.listen(0,async()=>{
  const port=srv.address().port, base='http://localhost:'+port+'/';
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); const ctx=await b.newContext(); const p=await ctx.newPage(); const errs=[];
  p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
  await p.goto(base); await p.waitForTimeout(800);
  const man=await p.evaluate(async()=>{ const l=document.querySelector('link[rel=manifest]'); if(!l) return null; const r=await fetch(l.href); return r.ok?await r.json():null; });
  ok(man && man.name && man.icons.length>=3 && man.display==='standalone','манифест загружается ('+(man&&man.short_name)+')');
  for(const i of (man?man.icons:[])){ const st=await p.evaluate(async s=>(await fetch(s)).status,i.src); ok(st===200,'значок '+i.src+' доступен'); }
  await p.waitForFunction(()=>navigator.serviceWorker && navigator.serviceWorker.controller || true); await p.reload(); await p.waitForTimeout(1200);
  const reg=await p.evaluate(async()=>{ const r=await navigator.serviceWorker.getRegistration(); return !!(r&&(r.active||r.waiting||r.installing)); });
  ok(reg,'сервис-воркер зарегистрирован');
  await ctx.setOffline(true); await p.reload(); await p.waitForTimeout(800);
  const title=await p.title(); const hasGame=await p.evaluate(()=>!!window.__game); ok(hasGame,'игра открывается без сети ('+title+')');
  await p.fill('#pname','Проверка'); await p.click('#startbtn'); await p.waitForTimeout(300);
  ok(await p.evaluate(()=>window.__game.U.screen)==='intro','игра работает офлайн');
  /* кнопка «Назад» */
  ok(await p.evaluate(()=>window.__appBack())===true,'«Назад» из пролога возвращает на заставку');
  ok(await p.evaluate(()=>window.__appBack())===false,'«Назад» на заставке разрешает выход');
  await p.evaluate(()=>window.__game.A.about&&window.__game.A.about()); ok(!!(await p.$('#modal .modal')),'окно «О игре» открывается');
  ok(await p.evaluate(()=>window.__appBack())===true && !(await p.$('#modal .modal')),'«Назад» закрывает окно');
  /* политика */
  ok(errs.filter(e=>!/net::ERR_INTERNET_DISCONNECTED/.test(e)).length===0,'ошибок в консоли нет'+(errs.length?': '+errs[0]:''));
  await b.close(); srv.close(); console.log(bad?('ПРОВАЛОВ: '+bad):'Веб-версия: всё в порядке'); process.exit(bad?1:0);
});
