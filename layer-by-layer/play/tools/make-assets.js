/* Генерирует PNG-иконки (веб и Android), обложку и скриншоты для Google Play.
   Запуск из папки layer-by-layer:  node play/tools/make-assets.js            */
const fs=require('fs'), path=require('path');
const PW=process.env.PW_PATH||'/opt/node-tools/node_modules/playwright';
const { chromium }=require(PW);
const ROOT=path.join(__dirname,'..','..'), ICONS=path.join(ROOT,'play','icons');
const svg=fs.readFileSync(path.join(ICONS,'icon.svg'),'utf8');
const markOnly=svg.replace(/<rect width="512" height="512" fill="url\(#bg\)"\/>/,'');
function page(inner,w,h,bg){ return `<html><body style="margin:0;width:${w}px;height:${h}px;overflow:hidden;background:${bg||'transparent'}">${inner}</body></html>`; }
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const shot=async(html,w,h,out,opts)=>{ const c=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:1}); const p=await c.newPage(); await p.setContent(html); await p.waitForTimeout(150); fs.mkdirSync(path.dirname(out),{recursive:true}); await p.screenshot(Object.assign({path:out,omitBackground:!!(opts&&opts.transparent)},opts&&opts.clip?{clip:opts.clip}:{})); await c.close(); };
  const sq=(size,extra)=>page(`<div style="width:${size}px;height:${size}px;${extra||''}">${svg.replace('<svg ','<svg width="'+size+'" height="'+size+'" ')}</div>`,size,size);
  /* веб-иконки */
  for(const s of [192,512]) await shot(sq(s),s,s,path.join(ICONS,'icon-'+s+'.png'));
  await shot(sq(180),180,180,path.join(ICONS,'apple-touch-icon.png'));
  await shot(sq(32),32,32,path.join(ICONS,'favicon-32.png'));
  /* maskable: знак уменьшен до безопасной зоны (~62%) */
  const mask=`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1B2552"/><stop offset="1" stop-color="#0C1024"/></linearGradient><linearGradient id="o1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFA46A"/><stop offset="1" stop-color="#FF7A2F"/></linearGradient></defs><rect width="512" height="512" fill="url(#bg)"/><g transform="translate(256 256) scale(.66) translate(-256 -256)">${svg.match(/<g id="mark">([\s\S]*?)<\/g>/)[1]}</g></svg>`;
  await shot(page(mask,512,512),512,512,path.join(ICONS,'maskable-512.png'));
  await shot(sq(512),512,512,path.join(ROOT,'play','store','icon-512.png'));
  /* Android: старые значки по плотностям */
  const RES=path.join(ROOT,'play','android','app','src','main','res');
  const dens={mdpi:48,hdpi:72,xhdpi:96,xxhdpi:144,xxxhdpi:192};
  for(const [d,s] of Object.entries(dens)){
    await shot(sq(s),s,s,path.join(RES,'mipmap-'+d,'ic_launcher.png'));
    await shot(page(`<div style="width:${s}px;height:${s}px;border-radius:50%;overflow:hidden">${svg.replace('<svg ','<svg width="'+s+'" height="'+s+'" ')}</div>`,s,s),s,s,path.join(RES,'mipmap-'+d,'ic_launcher_round.png'),{transparent:true});
  }
  /* обложка 1024x500 */
  const feat=`<div style="width:1024px;height:500px;background:linear-gradient(135deg,#1B2552,#0C1024);display:flex;align-items:center;gap:48px;padding:0 70px;box-sizing:border-box;font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#EEF1FF">
    <div style="flex:none;width:300px;height:300px">${svg.replace('<svg ','<svg width="300" height="300" style="border-radius:60px" ')}</div>
    <div><div style="font-size:78px;font-weight:900;line-height:1;color:#FF8F4D;letter-spacing:-1px">Слой<br>за слоем</div>
    <div style="margin-top:22px;font-size:30px;line-height:1.3;color:#C2CAEC">Экономическая игра<br>про бизнес на 3D-принтерах</div></div></div>`;
  await shot(page(feat,1024,500),1024,500,path.join(ROOT,'play','store','feature-graphic-1024x500.png'));
  await b.close(); console.log('иконки и обложка готовы');
})();
