/* Галерея графики для проверки глазами: блюда, герои, силуэты городов, фасады, карта. node tools/gallery.js [light|dark] */
const path=require('path'), fs=require('fs');
const PW=process.env.PW_PATH||'/opt/node-tools/node_modules/playwright'; const pw=require(PW), {chromium}=pw;
const FILE='file://'+path.join(__dirname,'..','index.html'); const OUT=path.join(__dirname,'..','dist','gallery'); fs.mkdirSync(OUT,{recursive:true});
(async()=>{
  const th=process.argv[2]||'light'; const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); const ctx=await b.newContext({viewport:{width:900,height:900},colorScheme:th}); const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message)); await p.goto(FILE); await p.waitForTimeout(300);
  await p.evaluate(()=>{
    const st=document.getElementById('stage'); let h='<h2>Блюда</h2><div style="display:flex;flex-wrap:wrap;gap:10px">';
    const seen={}; DISHES.forEach(d=>{ if(seen[d.g]) return; seen[d.g]=1; h+='<div style="text-align:center;width:84px;background:var(--surface-3);border-radius:12px;padding:6px">'+dishSVG(d.g,d.cat,64)+'<div style="font-size:11px">'+d.g+'</div></div>'; }); h+='</div><h2>Герои</h2><div style="display:flex;flex-wrap:wrap;gap:10px">';
    Object.keys(CHARS).forEach(k=>{ if(k==='nar') return; h+='<div style="text-align:center;width:90px">'+avatarSVG(k,['','happy','worried','angry','smug'][Math.floor(Math.random()*5)],72)+'<div style="font-size:11px">'+k+'</div></div>'; }); h+='</div><h2>Фасады</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">';
    const cities=['tula','kazan','spb','sochi','ekb','kgd','nnov','msk'];
    cities.forEach((c,i)=>{ const o=makeOutlet('x',c,i%3===2?'rest':'cafe','Первый столик · '+CITIES[c].n); if(i%2) o.eq={deco2:1,deco1:1,terr:1,music:1,kids:1}; if(i===5) o.built=1; if(i===6) o.fmt='fran'; o.rep=40+i*8; h+='<div>'+cafeSVG(o,{cal:[2,5,7,10,0,4,8,6][i],guests:i,queue:i%3})+'<div style="font-size:11px">'+c+'</div></div>'; });
    h+='</div><h2>Карта</h2><div style="max-width:520px">'+mapSVG(newState({seed:'g'}),'kazan')+'</div><h2>Звёзды, значки</h2>'+starsSVG(3.4,26)+' '+logoSVG(48)+'<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">'+Object.keys(ICONS).map(k=>'<span title="'+k+'" style="display:inline-grid;place-items:center;width:40px;height:40px;background:var(--surface-3);border-radius:10px">'+ico(k)+'</span>').join('')+'</div>';
    st.className='stage'; st.innerHTML=h; document.getElementById('hud').hidden=true;
  });
  await p.waitForTimeout(500); await p.screenshot({path:path.join(OUT,'gallery-'+th+'.png'),fullPage:true}); console.log(errs.length?errs.join('\n'):'ошибок нет'); await b.close();
})();
