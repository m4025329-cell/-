const path=require('path'); const pw=require(process.env.PW_PATH||'/opt/node-tools/node_modules/playwright');
(async()=>{ const b=await pw.chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); const p=await b.newPage({viewport:{width:1300,height:850}}); p.on('pageerror',e=>console.log('PE',e.message));
await p.goto('file://'+path.join(__dirname,'..','city-map.html')); await p.waitForTimeout(800);
const cases=[['обзор',1200,820,.45,12],['обзор вечер',1200,820,.45,21],['средний',1250,760,.9,13],['крупно',1190,745,2.6,13],['очень крупно',1620,590,4,9]];
for(const c of cases){ const r=await p.evaluate(([x,y,s,h])=>{ const M=window.__map; M.ST.play=false; M.ST.hour=h; M.fly(x,y,s); M.bench(6); const t=M.bench(40); return {ms:t, peds:M.LF.peds.length, cars:M.LF.cars.length, q:M.ST.quality}; },c.slice(1)); console.log(c[0].padEnd(14),'кадр',r.ms.toFixed(1),'мс; людей',r.peds,'машин',r.cars,'качество',r.q.toFixed(2)); }
await b.close(); })();
