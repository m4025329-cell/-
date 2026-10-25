const path=require('path'); const pw=require(process.env.PW_PATH||'/opt/node-tools/node_modules/playwright');
(async()=>{ const b=await pw.chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); const p=await b.newPage({viewport:{width:1300,height:850}}); p.on('pageerror',e=>console.log('PE',e.message));
await p.goto('file://'+path.join(__dirname,'..','city-map.html')); await p.waitForTimeout(600);
for(const s of [.3,.52,1,2]){ console.log(s,JSON.stringify(await p.evaluate(s=>window.__map.prof(s),s))); }
await b.close(); })();
