const path=require('path'); const pw=require(process.env.PW_PATH||'/opt/node-tools/node_modules/playwright');
(async()=>{ const b=await pw.chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); const p=await b.newPage(); p.on('pageerror',e=>console.log('PE',e.message,'\n',String(e.stack||'').split('\n').slice(0,4).join('\n'))); p.on('console',m=>{ if(m.type()==='error') console.log('CE',m.text()); });
await p.goto('file://'+path.join(__dirname,'..','city-map.html')); await p.waitForTimeout(800); await b.close(); })();
