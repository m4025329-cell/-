/* ===== Живая мастерская: SVG-сцена, которая меняется вместе с игрой =====
   Помещение, принтеры, люди, склад, вывеска и украшения берутся из состояния игры.
   Сцена 640×360. Принтеры рисуются теми же деталями, что и на карточках, и печатают по тем же правилам. */

function seasonOf(month){ var i=Math.max(0,Math.min(15,(month||1)-1))%12; return i<3?'autumn':(i<6?'winter':(i<9?'spring':'summer')); }

/* одежда и внешность людей в мастерской */
var WS_PEOPLE = {
  owner: {skin:'#F1C5A0', hair:'#5A3A24', top:'var(--brand)',  legs:'#3B4A82', cap:true},
  asst:  {skin:'#D9A67C', hair:'#2E2118', top:'var(--c-cyan)', legs:'#2A3566', apron:true},
  teen:  {skin:'#EBC3A1', hair:'#B5651D', top:'var(--c-violet)', legs:'#434F8A', phones:true}
};
function wsPerson(x, y, who, k){
  var p=WS_PEOPLE[who], sc=k||0.8;
  var hair = p.cap ? '<path d="M-15 -90a15 15 0 0 1 30 0v2h-30z" fill="'+p.top+'" stroke="var(--brand-edge)" stroke-width="1.5"/><path d="M-15 -88h34" stroke="var(--brand-edge)" stroke-width="3" stroke-linecap="round"/>'
                                : '<path d="M-15 -90a15 15 0 0 1 30 0c0 3-2 5-4 5-3-5-10-7-15-5-3 1-7 2-11 0z" fill="'+p.hair+'"/>';
  var extra = p.apron ? '<rect x="-14" y="-60" width="28" height="30" rx="6" fill="#fff" opacity=".85"/><path d="M-6 -60v-6M6 -60v-6" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".85"/>'
            : (p.phones ? '<path d="M-17 -90a17 17 0 0 1 34 0" fill="none" stroke="var(--p-screen)" stroke-width="3"/><rect x="-20" y="-92" width="6" height="10" rx="3" fill="var(--p-screen)"/><rect x="14" y="-92" width="6" height="10" rx="3" fill="var(--p-screen)"/>' : '');
  return '<g transform="translate('+x+' '+y+') scale('+sc+')">'+
    '<ellipse cx="0" cy="2" rx="24" ry="5" fill="var(--shadow-soft)"/>'+
    '<rect x="-14" y="-34" width="11" height="34" rx="5" fill="'+p.legs+'"/><rect x="3" y="-34" width="11" height="34" rx="5" fill="'+p.legs+'"/>'+
    '<rect x="-20" y="-76" width="40" height="46" rx="14" fill="'+p.top+'"/><rect x="-26" y="-70" width="10" height="30" rx="5" fill="'+p.top+'"/><rect x="16" y="-70" width="10" height="30" rx="5" fill="'+p.top+'"/>'+
    extra+
    '<circle cx="0" cy="-90" r="15" fill="'+p.skin+'"/>'+hair+
    '<circle cx="-5.500" cy="-89" r="1.700" fill="#1A1226"/><circle cx="5.500" cy="-89" r="1.700" fill="#1A1226"/><path d="M-4 -83q4 4 8 0" fill="none" stroke="#7A3B2E" stroke-width="1.800" stroke-linecap="round"/>'+
    '</g>';
}

/* коробка с товаром на полке */
function wsBox(x, y, col){
  return '<g transform="translate('+x+' '+y+')"><rect x="0" y="-22" width="28" height="22" rx="3" fill="var(--c-'+col+')"/><rect x="0" y="-22" width="28" height="6" rx="3" fill="#fff" opacity=".28"/><rect x="11" y="-22" width="6" height="22" fill="#fff" opacity=".35"/></g>';
}

/* фон помещения: стена, окно с сезоном, мебель */
function wsWindow(x, y, w, h, season, curtains){
  var sky={autumn:'var(--sky-autumn)', winter:'var(--sky-winter)', spring:'var(--sky-spring)', summer:'var(--sky-summer)'}[season], d='';
  if(season==='autumn') d='<path d="M10 '+(h-8)+'q12-26 24-8t30-8" fill="none" stroke="#C0612B" stroke-width="3"/><path d="M'+(w*0.25)+' 16l5 8-5 3-5-3z M'+(w*0.62)+' 34l5 8-5 3-5-3z M'+(w*0.8)+' 12l4 7-4 3-4-3z" fill="#E8742B"/><path d="M0 '+(h-12)+'h'+w+'v12H0z" fill="#8FB070" opacity=".55"/>';
  else if(season==='winter') d='<path d="M0 '+(h-16)+'q'+(w*0.25)+'-14 '+(w*0.5)+'-4t'+(w*0.5)+' -2v22H0z" fill="#fff" opacity=".9"/><g fill="#fff"><circle cx="'+(w*0.2)+'" cy="18" r="2.400"/><circle cx="'+(w*0.45)+'" cy="34" r="2"/><circle cx="'+(w*0.7)+'" cy="14" r="2.600"/><circle cx="'+(w*0.85)+'" cy="40" r="2"/><circle cx="'+(w*0.33)+'" cy="52" r="1.800"/></g>';
  else if(season==='spring') d='<path d="M0 '+(h-18)+'q'+(w*0.3)+'-18 '+(w*0.55)+'-6t'+(w*0.45)+'-2v26H0z" fill="#7FCB8F" opacity=".85"/><g fill="#fff"><circle cx="'+(w*0.28)+'" cy="'+(h-14)+'" r="3"/><circle cx="'+(w*0.62)+'" cy="'+(h-22)+'" r="3"/></g><g fill="#F7B8D4"><circle cx="'+(w*0.28)+'" cy="'+(h-14)+'" r="1.200"/><circle cx="'+(w*0.62)+'" cy="'+(h-22)+'" r="1.200"/></g>';
  else d='<circle cx="'+(w*0.72)+'" cy="24" r="12" fill="#FFD23F"/><path d="M0 '+(h-14)+'q'+(w*0.3)+'-10 '+(w*0.6)+'-2t'+(w*0.4)+'-2v18H0z" fill="#68B76B" opacity=".85"/><ellipse cx="'+(w*0.28)+'" cy="26" rx="16" ry="7" fill="#fff" opacity=".9"/>';
  return '<g transform="translate('+x+' '+y+')"><rect x="-6" y="-6" width="'+(w+12)+'" height="'+(h+12)+'" rx="10" fill="#C79A63"/><rect width="'+w+'" height="'+h+'" rx="6" fill="'+sky+'"/>'+d+
    '<path d="M'+(w/2)+' 0v'+h+'M0 '+(h/2)+'h'+w+'" stroke="#C79A63" stroke-width="4"/>'+
    (curtains?'<path d="M-6 -6h'+(w*0.28)+'q-6 '+(h*0.5)+' 0 '+(h+12)+'h-'+(w*0.28)+'z M'+(w+6)+' -6h-'+(w*0.28)+'q6 '+(h*0.5)+' 0 '+(h+12)+'h'+(w*0.28)+'z" fill="var(--c-magenta)" opacity=".7"/>':'')+'</g>';
}
function wsBackdrop(s, season){
  var sp=s.space, o='';
  if(sp==='school'){
    o+='<rect width="640" height="276" fill="var(--surface-3)"/>';
    o+='<rect x="24" y="52" width="196" height="102" rx="8" fill="#A97B45"/><rect x="31" y="59" width="182" height="88" rx="4" fill="#1F3A2E"/><text x="122" y="94" text-anchor="middle" font-family="Tektur,sans-serif" font-weight="800" font-size="22" fill="#F4F6FC" opacity=".92">КРУЖОК</text><path d="M60 114h124M60 126h80" stroke="#F4F6FC" stroke-width="3" stroke-linecap="round" opacity=".5"/>';
    o+='<rect x="240" y="60" width="130" height="62" rx="6" fill="#C79A63" stroke="#A97B45" stroke-width="4"/><g><rect x="252" y="72" width="26" height="22" fill="var(--c-cyan)"/><rect x="288" y="70" width="26" height="24" fill="var(--c-orange)" transform="rotate(-4 301 82)"/><rect x="326" y="74" width="26" height="22" fill="var(--c-magenta)"/><rect x="262" y="98" width="28" height="16" fill="#fff" opacity=".9"/><rect x="302" y="98" width="28" height="16" fill="var(--c-lime)"/></g>';
    o+='<circle cx="606" cy="46" r="22" fill="var(--surface)" stroke="var(--edge-strong)" stroke-width="4"/><path d="M606 46V32M606 46l9 5" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/>';
    o+=wsWindow(470,22,100,76,season,false);
  } else if(sp==='home'){
    o+='<rect width="640" height="276" fill="color-mix(in srgb,var(--c-orange) 10%,var(--surface-2))"/>';
    for(var i=0;i<20;i++) o+='<rect x="'+(i*32)+'" y="0" width="16" height="276" fill="var(--c-orange)" opacity=".05"/>';
    o+=wsWindow(470,24,100,76,season,true);
    o+='<rect x="262" y="52" width="56" height="64" rx="6" fill="var(--surface)" stroke="var(--edge-strong)" stroke-width="3"/><path d="M290 66l10 30h-20z" fill="var(--c-cyan)"/><circle cx="290" cy="86" r="5" fill="var(--c-orange)"/>';
    o+='<rect x="340" y="100" width="100" height="7" rx="3" fill="#A97B45"/><rect x="348" y="78" width="10" height="22" fill="var(--c-lime)"/><rect x="362" y="72" width="10" height="28" fill="var(--c-violet)"/><rect x="376" y="82" width="10" height="18" fill="var(--c-orange)"/><rect x="394" y="86" width="12" height="14" rx="3" fill="var(--c-magenta)"/>';
  } else if(sp==='cowork'){
    o+='<rect width="640" height="276" fill="var(--surface-2)"/>';
    o+='<rect x="0" y="0" width="640" height="22" fill="var(--surface-3)"/><g fill="var(--surface)"><rect x="70" y="6" width="80" height="8" rx="4"/><rect x="280" y="6" width="80" height="8" rx="4"/><rect x="490" y="6" width="80" height="8" rx="4"/></g>';
    for(var j=0;j<5;j++) o+='<path d="M'+(110+j*110)+' 22V276" stroke="var(--edge-strong)" stroke-width="3" opacity=".4"/>';
    o+=wsWindow(466,26,144,72,season,false);
    o+='<g opacity=".8" fill="var(--c-cyan)"><rect x="474" y="72" width="12" height="26"/><rect x="492" y="58" width="16" height="40"/><rect x="514" y="76" width="12" height="22"/><rect x="532" y="62" width="18" height="36"/><rect x="556" y="80" width="12" height="18"/></g>';
  } else {
    o+='<rect width="640" height="276" fill="color-mix(in srgb,var(--ink) 8%,var(--surface-3))"/>';
    for(var k=0;k<32;k++) o+='<rect x="'+(k*20)+'" y="0" width="3" height="276" fill="var(--ink)" opacity=".05"/>';
    o+='<rect x="462" y="24" width="150" height="80" rx="8" fill="var(--surface-2)" stroke="var(--edge-strong)" stroke-width="4"/>';
    o+='<g fill="var(--edge-strong)"><path d="M480 44h24l4 8h-32z" opacity=".8"/><rect x="520" y="40" width="6" height="34" rx="3"/><circle cx="552" cy="58" r="10" fill="none" stroke="var(--edge-strong)" stroke-width="4"/><rect x="574" y="38" width="26" height="6" rx="3"/><rect x="574" y="52" width="20" height="6" rx="3"/><rect x="480" y="70" width="40" height="8" rx="3"/></g>';
    o+='<g fill="var(--edge)" stroke="var(--edge-strong)" stroke-width="3"><circle cx="596" cy="330" r="16"/></g><circle cx="596" cy="330" r="6" fill="var(--edge-strong)"/>';
  }
  /* пол и плинтус */
  o+='<rect y="276" width="640" height="84" fill="var(--edge)"/><rect y="276" width="640" height="6" fill="var(--edge-strong)" opacity=".4"/>';
  if(sp==='cowork') o+='<rect x="130" y="304" width="380" height="40" rx="10" fill="var(--c-cyan)" opacity=".12"/>';
  if(sp==='home') o+='<ellipse cx="320" cy="326" rx="200" ry="20" fill="var(--c-magenta)" opacity=".1"/>';
  return o;
}

/* раскладка принтеров: до четырёх в один ряд, больше — в два */
function wsLayout(n){
  var rows=n<=4?1:2, per=rows===1?n:Math.ceil(n/2), spacing=400/Math.max(1,per), k=rows===1?Math.min(0.9,spacing*0.95/160):0.6, out=[], i;
  for(i=0;i<n;i++){
    var row=rows===1?0:(i<per?0:1), idx=rows===1?i:(row===0?i:i-per);
    var cx=24+spacing*(idx+0.5)+(row===1?spacing*0.0:0);
    out.push({cx:cx, k:k, row:row});
  }
  return {items:out, rows:rows, k:k};
}

/* s — состояние игры; o: {jobs, working, month, label} */
function workshopSVG(s, o){
  o=o||{}; var jobs=o.jobs&&o.jobs.length?o.jobs:s.printers.map(function(p){ return {obj:null, util:0, label:PRINTERS[p.t].name}; });
  var month=o.month||Math.max(1,Math.min(TOTAL,s.month)), season=seasonOf(month), n=jobs.length, L=wsLayout(n), out='';
  out+=wsBackdrop(s, season);
  /* вывеска-табличка */
  var nm=cleanShopName(s.shop)||'Слой за слоем', pw=Math.max(150,Math.min(300,nm.length*13+44));
  out+='<g><path d="M'+(40)+' 0v10M'+(24+pw-16)+' 0v10" stroke="var(--edge-strong)" stroke-width="3"/><rect x="24" y="8" width="'+pw+'" height="36" rx="12" fill="var(--surface)" stroke="var(--edge-strong)" stroke-width="3"/><rect x="24" y="34" width="'+pw+'" height="10" rx="0" fill="var(--c-orange)" clip-path="inset(0 0 0 0 round 0 0 10px 10px)" opacity=".9"/><text x="'+(24+pw/2)+'" y="30" text-anchor="middle" font-family="Tektur,sans-serif" font-weight="800" font-size="'+Math.min(19,Math.max(12,pw/(nm.length*0.62+1)))+'" fill="var(--ink)">'+esc(nm)+'</text></g>';
  /* стол и полка */
  out+='<rect x="24" y="236" width="592" height="14" rx="6" fill="#C79A63"/><rect x="24" y="236" width="592" height="4" rx="2" fill="#fff" opacity=".25"/><rect x="34" y="250" width="572" height="26" rx="4" fill="#B88A55"/><path d="M180 250v26M330 250v26M480 250v26" stroke="#A97B45" stroke-width="3"/><rect x="40" y="276" width="10" height="30" fill="#A97B45"/><rect x="590" y="276" width="10" height="30" fill="#A97B45"/>';
  if(L.rows===2) out+='<rect x="24" y="152" width="420" height="8" rx="3" fill="#C79A63"/><path d="M60 160v14M410 160v14" stroke="#A97B45" stroke-width="5" stroke-linecap="round"/>';
  /* принтеры: сначала дальний ряд */
  for(var row=1;row>=0;row--){
    for(var i=0;i<n;i++){
      var pl=L.items[i]; if(pl.row!==row) continue;
      var j=jobs[i], objId=j.obj||'stand', nl=OBJ[objId].w.length, layers=j.obj?Math.max(1,Math.round(j.util*nl)):Math.max(1,Math.round(nl*0.5));
      var parts=printerParts({obj:objId, layers:layers, working:!!o.working&&j.util>0, state:(j.util>0||!o.jobs)?'on':'idle', label:j.label});
      var baseY=row===0?236:152, ty=baseY-142*pl.k, tx=pl.cx-80*pl.k;
      out+='<g class="'+parts.cls+'" style="'+parts.style+'" transform="translate('+tx.toFixed(1)+' '+ty.toFixed(1)+') scale('+pl.k.toFixed(3)+')">'+parts.inner+'</g>';
    }
  }
  /* полки со складом справа */
  var stockCols=[['key','cyan',3],['stand','orange',3],['mini','magenta',2],['part','lime',2],['proto','violet',1]];
  out+='<rect x="456" y="150" width="164" height="8" rx="3" fill="#C79A63"/><rect x="456" y="198" width="164" height="8" rx="3" fill="#C79A63"/>';
  var bx=462, by=150, i2, c, nb;
  stockCols.forEach(function(sc,idx){
    var id=sc[0]; if(!s.unlocked[id]) return; var q=s.inv[id]||0; nb=Math.min(sc[2],Math.ceil(q/40));
    var shelfY = (idx<2)?150:198, startX = (idx===0||idx===2)?462:(idx===1?548:(idx===3?548:462));
    if(idx===2) startX=462; if(idx===3) startX=520; if(idx===4) startX=582;
    for(i2=0;i2<nb;i2++) out+=wsBox(startX+i2*(idx===4?0:29), shelfY, sc[1]);
  });
  /* предметы на столе */
  if(s.channel.market || s.channel.site) out+='<g transform="translate(540 236)"><rect x="-26" y="-34" width="52" height="34" rx="4" fill="var(--p-body)"/><rect x="-22" y="-30" width="44" height="26" rx="2" fill="var(--p-screen)"/><rect x="-8" y="-24" width="16" height="12" rx="2" fill="var(--c-orange)"/><path d="M-10 0h20" stroke="var(--p-body)" stroke-width="4"/></g>';
  if(s.service) out+='<g transform="translate(594 236)"><rect x="-16" y="-14" width="32" height="14" rx="3" fill="var(--c-orange)"/><path d="M-6 -14v-6h12v6" fill="none" stroke="var(--p-body)" stroke-width="3"/></g>';
  /* украшения по ходу сюжета */
  var dx=300;
  if(s.insurance) { out+='<g transform="translate('+dx+' 14)"><rect width="38" height="42" rx="5" fill="var(--surface)" stroke="var(--edge-strong)" stroke-width="3"/><path d="M19 8l12 4v10c0 7-5 11-12 14-7-3-12-7-12-14V12z" fill="var(--c-cyan)"/><path d="m13 22 5 5 8-9" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g>'; dx+=48; }
  if(s.flags.social) { out+='<g transform="translate('+dx+' 14)"><rect width="38" height="42" rx="5" fill="var(--surface)" stroke="var(--edge-strong)" stroke-width="3"/><path d="M19 32s-9-5-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 7-9 12-9 12z" fill="var(--c-magenta)"/></g>'; dx+=48; }
  if(ownerCapital(s)>=GOAL*0.5) { out+='<g transform="translate('+dx+' 14)"><rect width="38" height="42" rx="5" fill="var(--surface)" stroke="var(--edge-strong)" stroke-width="3"/><rect x="9" y="16" width="20" height="20" fill="var(--c-orange)"/><rect x="13" y="22" width="4" height="4" fill="#fff"/><rect x="21" y="22" width="4" height="4" fill="#fff"/><rect x="16" y="28" width="6" height="8" fill="#fff"/><path d="M19 6v10M19 6h8l-3 3 3 3h-8" stroke="var(--ink)" stroke-width="2" fill="var(--brand)"/></g>'; dx+=48; }
  if(s.flags.eco) out+='<g transform="translate(28 330)"><rect x="-4" y="-26" width="34" height="28" rx="4" fill="var(--c-lime)" opacity=".85"/><path d="M13 -6c0-8 4-12 10-13-1 7-4 11-10 13z" fill="#fff" opacity=".9"/><path d="M8 -6c0-4-3-6-6-6 0 4 2 6 6 6z" fill="#fff" opacity=".9"/></g>';
  else out+='<g transform="translate(24 330)"><rect x="0" y="-22" width="28" height="22" rx="5" fill="#A97B45"/><g fill="var(--c-lime)"><circle cx="14" cy="-30" r="8"/><circle cx="6" cy="-26" r="6"/><circle cx="22" cy="-26" r="6"/></g></g>';
  if(s.flags.psu) out+='<g transform="translate(610 322)"><rect x="-8" y="-34" width="16" height="34" rx="6" fill="#D8352A"/><rect x="-4" y="-40" width="8" height="8" rx="2" fill="var(--ink)"/></g>';
  else if(s.flags.fireHappened) out+='<g transform="translate(402 214)" opacity=".7"><ellipse cx="0" cy="0" rx="22" ry="12" fill="#1A1226"/><ellipse cx="6" cy="-10" rx="12" ry="8" fill="#1A1226"/></g>';
  if(s.flags.alliance2) out+='<g transform="translate(446 14)"><path d="M0 0v44" stroke="var(--ink)" stroke-width="3"/><path d="M0 2h34l-8 10 8 10H0z" fill="var(--c-cyan)"/><path d="M0 2h17v20H0z" fill="var(--brand)"/></g>';
  else if(s.flags.ally) out+='<g transform="translate(446 14)"><path d="M0 0v44" stroke="var(--ink)" stroke-width="3"/><path d="M0 2h28l-6 8 6 8H0z" fill="var(--c-cyan)"/></g>';
  /* люди: владелец, помощник, подросток */
  out+=wsPerson(150, 338, 'owner', 0.82);
  if(s.staff.asst) out+=wsPerson(232, 338, 'asst', 0.82);
  if(s.staff.teen) out+=wsPerson(310, 338, 'teen', 0.78);
  var ar = '<svg class="workshop" viewBox="0 0 640 360" role="img" aria-label="'+esc(o.label||('Мастерская «'+nm+'»: '+n+' '+plural(n,'принтер','принтера','принтеров')+', '+SPACES[s.space].name.toLowerCase()))+'" focusable="false">'+out+'</svg>';
  return ar;
}
