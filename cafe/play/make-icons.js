/* Рисует значки приложения из одного SVG. node play/make-icons.js */
const fs=require('fs'), path=require('path');
const PW=process.env.PW_PATH||'/opt/node-tools/node_modules/playwright'; const {chromium}=require(PW);
const OUT=path.join(__dirname,'icons');
const BRAND='#D1361A', CREAM='#FFF3DE';
/* значок: чашка на блюдце и пар, как в логотипе игры */
function glyph(){ return `<g fill="${CREAM}" stroke="none"><ellipse cx="24" cy="30" rx="14" ry="4.2"/><rect x="22.6" y="30" width="2.8" height="9" rx="1.2"/><ellipse cx="24" cy="40" rx="6.5" ry="1.8"/><path d="M17.5 20.5h9.4v4.2a4.7 4.7 0 0 1-4.7 4.7 4.7 4.7 0 0 1-4.7-4.7z"/></g><path d="M26.9 21.7h1.7a1.9 1.9 0 0 1 0 3.8h-1.7" fill="none" stroke="${CREAM}" stroke-width="1.8" stroke-linecap="round"/><path d="M20.5 17c0-1.6 1.6-1.6 1.6-3.2M23.8 17c0-1.6 1.6-1.6 1.6-3.2" fill="none" stroke="${CREAM}" stroke-width="1.6" stroke-linecap="round"/>`; }
/* any: скруглённый квадрат; maskable: на всю площадь, значок внутри безопасной зоны; apple: на всю площадь */
function svg(kind,size){
  const sc= kind==='maskable'?0.70:0.86, tx=(48-48*sc)/2, ty=(48-48*sc)/2+ (kind==='maskable'?0.5:0.6);
  const bg= kind==='any'?`<rect width="48" height="48" rx="11" fill="${BRAND}"/><rect x="1" y="1" width="46" height="46" rx="10.2" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="1"/>`:`<rect width="48" height="48" fill="${BRAND}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48">${bg}<g transform="translate(${tx} ${ty}) scale(${sc})">${glyph()}</g></svg>`;
}
const jobs=[['icon-512.png','any',512],['icon-192.png','any',192],['maskable-512.png','maskable',512],['maskable-192.png','maskable',192],['apple-touch-icon.png','apple',180],['favicon-32.png','any',32],['favicon-64.png','any',64]];
(async()=>{
  fs.mkdirSync(OUT,{recursive:true}); fs.writeFileSync(path.join(OUT,'icon.svg'),svg('any',512));
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  for(const [name,kind,size] of jobs){ const p=await b.newPage({viewport:{width:size,height:size},deviceScaleFactor:1}); await p.setContent(`<html><body style="margin:0;background:transparent">${svg(kind,size)}</body></html>`); await p.screenshot({path:path.join(OUT,name),omitBackground:true}); await p.close(); }
  await b.close(); console.log('значки готовы:',jobs.map(j=>j[0]).join(', '));
})();
