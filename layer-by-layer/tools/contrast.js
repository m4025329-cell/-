/* Проверка контраста токенов (WCAG): текст 4.5:1, границы и значки 3:1 */
const fs=require('fs'), path=require('path');
const css=fs.readFileSync(path.join(__dirname,'..','src','style.css'),'utf8');
function block(sel){ const i=css.indexOf(sel+'{'); if(i<0) throw new Error('no '+sel); const j=css.indexOf('}',i); return css.slice(i+sel.length+1,j); }
function parse(b){ const o={}; b.replace(/--([a-z0-9-]+):\s*([^;]+);/g,(m,k,v)=>{o[k]=v.trim();}); return o; }
const light=parse(block(':root')); const dark=Object.assign({},light,parse(block(':root[data-theme="dark"]')));
function rgb(h){ h=h.replace('#',''); if(h.length===3) h=h.split('').map(c=>c+c).join(''); return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)); }
function lum(c){ const f=v=>{v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4);}; return 0.2126*f(c[0])+0.7152*f(c[1])+0.0722*f(c[2]); }
function ratio(a,b){ const la=lum(rgb(a)), lb=lum(rgb(b)); const hi=Math.max(la,lb), lo=Math.min(la,lb); return (hi+0.05)/(lo+0.05); }
function mix(fg,bg,a){ const f=rgb(fg), b=rgb(bg); return '#'+f.map((v,i)=>Math.round(v*a+b[i]*(1-a)).toString(16).padStart(2,'0')).join(''); }
const T=[ // [fg, bg, min, описание]
 ['ink','ground',4.5],['ink','surface',4.5],['ink','surface-2',4.5],['ink','surface-3',4.5],
 ['ink-2','surface',4.5],['ink-2','surface-2',4.5],['ink-2','ground',4.5],['ink-2','surface-3',4.5],
 ['muted','surface',4.5],['muted','surface-2',4.5],['muted','ground',4.5],
 ['brand-text','surface',4.5],['brand-text','ground',4.5],['brand-text','surface-2',4.5],
 ['on-brand','brand',4.5],['on-brand','brand-hi',4.5],
 ['ground','ink',4.5],
 ['gain-fg','gain-bg',4.5],['loss-fg','loss-bg',4.5],['info-fg','info-bg',4.5],['warn-fg','warn-bg',4.5],
 ['gain-fg','surface',4.5],['loss-fg','surface',4.5],['loss-fg','surface-2',4.5],['gain-fg','surface-2',4.5],
 ['info-fg','surface',4.5],['warn-fg','surface',4.5],
 ['c-cyan-text','surface',4.5],['c-orange-text','surface',4.5],['c-magenta-text','surface',4.5],['c-lime-text','surface',4.5],['c-violet-text','surface',4.5],['c-teal-text','surface',4.5],['c-rose-text','surface',4.5],
 /* границы и значки (3:1) */
 ['edge-strong','surface',3],['edge-strong','surface-2',3],['edge-strong','ground',3],['brand-edge','surface',3],/* brand везде с контуром brand-edge */
 ['c-cyan','surface',3],['c-orange','surface',3],['c-magenta','surface',3],['c-lime','surface',3],['c-violet','surface',3],['c-teal','surface',3],['c-rose','surface',3],
 ['info-fg','surface',3]
];
let bad=0;
[['светлая',light],['тёмная',dark]].forEach(([name,tk])=>{
  console.log('\n=== '+name+' тема');
  T.forEach(([f,b,min])=>{ const fc=tk[f], bc=tk[b]; if(!fc||!bc||fc[0]!=='#'||bc[0]!=='#'){ console.log('  ? нет токена',f,b); return; } const r=ratio(fc,bc); if(r<min){ bad++; console.log('  ПЛОХО  '+f+' на '+b+': '+r.toFixed(2)+' (нужно '+min+')  '+fc+' / '+bc); } });
  /* цвета товаров в кривых: линия на полупрозрачной заливке */
  ['cyan','orange','magenta','lime','violet'].forEach(c=>{ const fill=mix(tk['c-'+c],tk['surface'],0.18); const r=ratio(tk['c-'+c+'-text'],fill); if(r<4.5){ bad++; console.log('  ПЛОХО  кривая '+c+': '+r.toFixed(2)); } });
});
console.log(bad?('\nНайдено проблем: '+bad):'\nКонтраст в норме');
