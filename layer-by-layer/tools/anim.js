/* Кадры анимации принтера на заставке и экране печати (для проверки движения) */
const path=require('path'), fs=require('fs');
const { chromium } = require(process.env.PW_PATH||'/opt/node-tools/node_modules/playwright');
const OUT=process.argv[2]||path.join(__dirname,'..','dist','shots');
fs.mkdirSync(OUT,{recursive:true});
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const p=await (await b.newContext({viewport:{width:1280,height:900}})).newPage();
  await p.goto('file://'+path.join(__dirname,'..','index.html')); await p.waitForTimeout(300);
  const art=await p.$('.hero-art');
  for(const ms of [200,700,700,900,1200]){ await p.waitForTimeout(ms); await art.screenshot({path:path.join(OUT,'anim-hero-'+Date.now()%100000+'.png')}); }
  await b.close();
})();
