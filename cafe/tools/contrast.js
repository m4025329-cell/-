/* Проверка контраста токенов (WCAG): текст 4,5:1, границы и значки 3:1 */
const fs=require('fs'), path=require('path');
const css=fs.readFileSync(path.join(__dirname,'..','src','style.css'),'utf8');
function block(sel){ const i=css.indexOf(sel+'{'); if(i<0) throw new Error('no '+sel); const j=css.indexOf('}',i); return css.slice(i+sel.length+1,j); }
function parse(b){ const o={}; b.replace(/--([a-z0-9-]+):\s*([^;]+);/g,(m,k,v)=>{o[k]=v.trim();}); return o; }
const light=parse(block(':root')); const dark=Object.assign({},light,parse(block(':root[data-theme="dark"]')));
function rgb(h){ h=h.replace('#',''); if(h.length===3) h=h.split('').map(c=>c+c).join(''); return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)); }
function lum(c){ const f=v=>{v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4);}; return 0.2126*f(c[0])+0.7152*f(c[1])+0.0722*f(c[2]); }
function ratio(a,b){ const la=lum(rgb(a)), lb=lum(rgb(b)); const hi=Math.max(la,lb), lo=Math.min(la,lb); return (hi+0.05)/(lo+0.05); }
const T=[
 ['ink','ground',4.5],['ink','surface',4.5],['ink','surface-2',4.5],['ink','surface-3',4.5],
 ['ink-2','ground',4.5],['ink-2','surface',4.5],['ink-2','surface-2',4.5],['ink-2','surface-3',4.5],
 ['ink-3','ground',4.5],['ink-3','surface',4.5],['ink-3','surface-2',4.5],['ink-3','surface-3',4.5],
 ['brand-ink','brand',4.5],['brand-soft-ink','brand-soft',4.5],['brand-soft-ink','surface',4.5],['brand-soft-ink','ground',4.5],['brand-soft-ink','surface-2',4.5],
 ['mustard-ink','mustard',4.5],['ground','ink',4.5],
 ['gain-ink','gain-bg',4.5],['loss-ink','loss-bg',4.5],['info-ink','info-bg',4.5],['warn-ink','warn-bg',4.5],
 ['gain-ink','surface',4.5],['loss-ink','surface',4.5],['loss-ink','surface-2',4.5],['gain-ink','surface-2',4.5],['info-ink','surface',4.5],['warn-ink','surface',4.5],
 ['chalk-ink','chalk-bg',4.5],['chalk-dim','chalk-bg',4.5],['chalk-ink','chalk-bg-2',4.5],
 ['edge-strong','surface',3],['edge-strong','surface-2',3],['edge-strong','ground',3],
 ['brand','surface',3],['brand','ground',3],['basil','surface',3],['berry','surface',3],['sky','surface',3],['plum','surface',3],['cocoa','surface',3],
 ['brand','surface-2',3],
];
let bad=0;
[['светлая',light],['тёмная',dark]].forEach(([name,tk])=>{
  console.log('\n=== '+name+' тема');
  T.forEach(([f,b,min])=>{ const fc=tk[f], bc=tk[b]; if(!fc||!bc||fc[0]!=='#'||bc[0]!=='#'){ console.log('  ? нет токена',f,b); return; } const r=ratio(fc,bc); if(r<min){ bad++; console.log('  ПЛОХО  '+f+' на '+b+': '+r.toFixed(2)+' (нужно '+min+')  '+fc+' / '+bc); } });
});
/* чек, фиксированные цвета */
[['#2B1810','#FFFEF9',4.5],['#6B5545','#FFFEF9',4.5],['#7D6253','#FFFEF9',4.5],['#14632F','#FFFEF9',4.5],['#9A1F10','#FFFEF9',4.5],['#2B1810','#F6EBD9',4.5],['#6B5545','#F6EBD9',4.5],['#7D6253','#F6EBD9',4.5],['#14632F','#F6EBD9',4.5],['#9A1F10','#F6EBD9',4.5],['#FFE79A','#2F3D35',4.5],['#FFE79A','#1F2924',4.5],['#3A2A10','#FFF3C9',4.5],['#FFE9B0','#4A3A18',4.5],['#FFE6A8','#3B2A22',4.5],['#B0542E','#FFF6E6',3]].forEach(([f,b,min])=>{ const r=ratio(f,b); if(r<min){ bad++; console.log('  ПЛОХО  фикс. '+f+' на '+b+': '+r.toFixed(2)); } });
console.log(bad?('\nНайдено проблем: '+bad):'\nКонтраст в норме');
process.exit(bad?1:0);
