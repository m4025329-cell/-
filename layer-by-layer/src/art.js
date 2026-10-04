/* ===== Графика: иконки, аватары, принтеры, башня слоёв (весь SVG рисуется кодом) ===== */
var IC = {
 layers:'<path d="M12 3 3 8l9 5 9-5-9-5Z"/><path d="m3 12.500 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
 coin:'<circle cx="12" cy="12" r="9"/><path d="M10 17V7h3.500a2.800 2.800 0 0 1 0 5.600H8.500M8.500 15h5"/>',
 printer:'<path d="M5 21V4h14v17"/><path d="M5 8.500h14"/><rect x="9" y="8.500" width="6" height="3" rx="1"/><path d="M12 11.500v2.500"/><path d="M3 21h18"/><path d="M8.500 18h7"/>',
 users:'<circle cx="9" cy="8" r="3.500"/><path d="M2.500 20c0-3.500 3-6 6.500-6s6.500 2.500 6.500 6"/><circle cx="17.500" cy="9" r="2.500"/><path d="M18 14c2.300.4 4 2.200 4 5"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 shield:'<path d="M12 3 4.500 6v5.500c0 4.500 3 8 7.500 9.500 4.500-1.500 7.500-5 7.500-9.500V6L12 3Z"/><path d="m9 12 2 2 4-4"/>',
 heart:'<path d="M12 20s-7.500-4.600-7.500-10A4.300 4.300 0 0 1 12 7.200 4.300 4.300 0 0 1 19.500 10c0 5.400-7.500 10-7.500 10Z"/>',
 leaf:'<path d="M5 19c0-8 5-14 15-15 0 9-5 15-13 15"/><path d="M5 19c2-4 5-7 9-9"/>',
 grid:'<rect x="4" y="4" width="7" height="7" rx="1.500"/><rect x="13" y="4" width="7" height="7" rx="1.500"/><rect x="4" y="13" width="7" height="7" rx="1.500"/><rect x="13" y="13" width="7" height="7" rx="1.500"/>',
 unlock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.500-2"/>',
 lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
 cap:'<path d="m2 9 10-5 10 5-10 5L2 9Z"/><path d="M6 11.500V16c0 1.500 2.700 3 6 3s6-1.500 6-3v-4.500"/><path d="M22 9v6"/>',
 star:'<path d="m12 3 2.700 5.600 6.100.8-4.500 4.300 1.100 6.100L12 17l-5.400 2.800 1.100-6.100L3.200 9.400l6.100-.8L12 3Z"/>',
 check:'<path d="m5 12.500 4.500 4.500L19 7.500"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/>',
 warn:'<path d="M12 3 2 20h20L12 3Z"/><path d="M12 9.500v4M12 17v.01"/>',
 book:'<path d="M4 5.500A2.500 2.500 0 0 1 6.500 3H20v16H6.500A2.500 2.500 0 0 0 4 21.500Z"/><path d="M4 5.500v16M8 7.500h8"/>',
 vol:'<path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M16.500 8.500a5 5 0 0 1 0 7M19 6a8.500 8.500 0 0 1 0 12"/>',
 mute:'<path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="m17 9.500 5 5M22 9.500l-5 5"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.900 4.900l1.400 1.400M17.700 17.700l1.400 1.400M4.900 19.100l1.400-1.400M17.700 6.300l1.400-1.400"/>',
 moon:'<path d="M20 14.500A8 8 0 0 1 9.500 4 8 8 0 1 0 20 14.500Z"/>',
 download:'<path d="M12 3v12m0 0-4-4m4 4 4-4"/><path d="M4 17v3h16v-3"/>',
 right:'<path d="M5 12h14m-5-5 5 5-5 5"/>',
 left:'<path d="M19 12H5m5-5-5 5 5 5"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 minus:'<path d="M5 12h14"/>',
 x:'<path d="M6 6l12 12M18 6 6 18"/>',
 play:'<path d="M7 5v14l12-7L7 5Z"/>',
 skip:'<path d="M5 5l9 7-9 7V5Z"/><path d="M18 5v14"/>',
 up:'<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
 down:'<path d="M3 7l6 6 4-4 8 8"/><path d="M15 17h6v-6"/>',
 wrench:'<path d="M14.700 6.300a4 4 0 0 0-5 5L3 18l3 3 6.700-6.700a4 4 0 0 0 5-5l-2.600 2.600-2.800-.6-.6-2.800 2.600-2.600Z"/>',
 bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
 box:'<path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
 store:'<path d="M4 9l1-5h14l1 5M4 9a2.700 2.700 0 0 0 5.300 0 2.700 2.700 0 0 0 5.400 0A2.700 2.700 0 0 0 20 9M5 11.500V20h14v-8.500M10 20v-5h4v5"/>',
 percent:'<path d="M19 5 5 19"/><circle cx="7.500" cy="7.500" r="2.500"/><circle cx="16.500" cy="16.500" r="2.500"/>',
 bank:'<path d="M3 10 12 4l9 6H3Z"/><path d="M5.500 10v8M10 10v8M14 10v8M18.500 10v8M3 20.500h18"/>',
 safe:'<rect x="3.500" y="4" width="17" height="15" rx="2"/><circle cx="12" cy="11.500" r="3.500"/><path d="M12 8.500v1.500M7 19v2M17 19v2"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3.500 3.200 3.500 14.800 0 18M12 3c-3.500 3.200-3.500 14.800 0 18"/>',
 chart:'<path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.200"/>',
 tag:'<path d="M20.600 13.400 13.400 20.600a2 2 0 0 1-2.800 0L3 13V3h10l7.600 7.600a2 2 0 0 1 0 2.800Z"/><circle cx="7.500" cy="7.500" r="1.200"/>',
 doc:'<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.400 3.600-7 8-7s8 2.600 8 7"/>',
 megaphone:'<path d="M3 10v4h3l8 4V6L6 10H3Z"/><path d="M17 9a4 4 0 0 1 0 6M7 14l1.500 6h3L10 15.500"/>',
 storm:'<path d="M7 15.500a4 4 0 0 1 .4-8A5.200 5.200 0 0 1 17.500 9a3.300 3.300 0 0 1-.5 6.500Z"/><path d="m12.500 13-2.500 4h3l-1.500 4"/>',
 truck:'<path d="M2 6h12v10H2zM14 9h4l4 3.500V16h-8"/><circle cx="6.500" cy="18" r="1.800"/><circle cx="17.500" cy="18" r="1.800"/>',
 news:'<path d="M4 5h13v14H6a2 2 0 0 1-2-2V5Z"/><path d="M17 9h3v8a2 2 0 0 1-2 2"/><path d="M7 9h7M7 13h7M7 16h4"/>',
 sparkle:'<path d="m12 3 1.800 5.200L19 10l-5.200 1.800L12 17l-1.800-5.200L5 10l5.200-1.800L12 3Z"/><path d="M19 17v4M17 19h4"/>',
 flame:'<path d="M12 3c1 3.500 5 5.500 5 10a5 5 0 0 1-10 0c0-2 1-3.500 2-4.500.3 1.500 1 2.500 2 3 .5-2.500 0-5 1-8.500Z"/>',
 copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
 refresh:'<path d="M20 11a8 8 0 0 0-14.500-3.500M4 4v4h4M4 13a8 8 0 0 0 14.500 3.500M20 20v-4h-4"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M12 3v2.500M12 18.500V21M3 12h2.500M18.500 12H21M5.600 5.600l1.800 1.800M16.600 16.600l1.800 1.800M5.600 18.400l1.800-1.800M16.600 7.400l1.800-1.800"/>',
 flask:'<path d="M9 3h6M10 3v6L4.500 18.500A2 2 0 0 0 6.300 21.500h11.400a2 2 0 0 0 1.800-3L14 9V3"/><path d="M7.500 15h9"/>',
 pin:'<path d="M12 21s-7-6.200-7-11a7 7 0 0 1 14 0c0 4.800-7 11-7 11Z"/><circle cx="12" cy="10" r="2.500"/>',
 dice:'<rect x="4" y="4" width="16" height="16" rx="3.500"/><circle cx="8.800" cy="8.800" r="1" fill="currentColor"/><circle cx="15.200" cy="8.800" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="8.800" cy="15.200" r="1" fill="currentColor"/><circle cx="15.200" cy="15.200" r="1" fill="currentColor"/>'
};
function ico(n, cls){ return '<svg class="ico '+(cls||'')+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+(IC[n]||'')+'</svg>'; }
function esc(t){ return String(t).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

/* ---------- слои: силуэты изделий ---------- */
var OBJ = {
  key:   {w:[1,1,1,0.96], h:4.6},
  stand: {w:[1,1,0.92,0.84,0.76,0.68,0.62,0.58], h:4.4},
  mini:  {w:[0.9,0.9,0.55,0.3,0.3,0.45,0.72,0.72,0.5], h:4.2},
  part:  {w:[0.78,0.96,0.78,0.96,0.78,0.96,0.78,0.96], h:4.4},
  proto: {w:[1,1,1,1,1,1,0.86,0.62,0.36], h:4.2}
};
var PCOL = {key:'cyan', stand:'orange', mini:'magenta', part:'lime', proto:'violet'};
/* стопка слоёв как маленькая иллюстрация изделия */
function productSVG(id, size, count){
  var o=OBJ[id], n=count==null?o.w.length:Math.max(0,Math.min(o.w.length,Math.round(count))), W=40, H=o.h*o.w.length+4, out='';
  for(var i=0;i<n;i++){
    var w=W*o.w[i], x=(48-w)/2, y=H-2-(i+1)*o.h;
    out+='<rect class="lay" x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+(o.h-0.5).toFixed(1)+'" rx="1.6" fill="var(--c-'+PCOL[id]+')"/>';
    out+='<rect x="'+(x+1.5).toFixed(1)+'" y="'+(y+0.5).toFixed(1)+'" width="'+Math.max(0,w-3).toFixed(1)+'" height="1.1" rx="0.5" fill="#fff" opacity=".35"/>';
  }
  if(id==='key' && n>0) out+='<circle cx="24" cy="'+(H-2-n*o.h-3).toFixed(1)+'" r="3.4" fill="none" stroke="var(--c-cyan)" stroke-width="1.8"/>';
  var vbH=Math.max(H+6,34);
  return '<svg class="prod-art" viewBox="0 -6 48 '+vbH+'" width="'+(size||48)+'" height="'+(size||48)+'" aria-hidden="true" focusable="false">'+out+'</svg>';
}

/* ---------- принтер ---------- */
/* opts: color (id продукта), layers (0..9), working (bool), state: 'on'|'idle'|'off', scale */
function printerSVG(opts){
  opts=opts||{}; var id=opts.obj||'stand', o=OBJ[id], n=Math.max(0,Math.min(o.w.length,Math.round(opts.layers==null?o.w.length:opts.layers)));
  var working=!!opts.working, step=0.3, dur=(o.w.length*step+1.4).toFixed(2);
  var plateY=118, lay='', i, W=56;
  for(i=0;i<(working?o.w.length:n);i++){
    var w=W*o.w[i], x=80-w/2, y=plateY-(i+1)*o.h;
    lay+='<rect class="p-layer" style="--i:'+i+'" x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+(o.h-0.4).toFixed(1)+'" rx="1.4" fill="var(--c-'+PCOL[id]+')"/>';
  }
  var topY=plateY-Math.max(1,(working?o.w.length:n))*o.h;
  var rise=(o.w.length*o.h);
  var gantryY=working ? (plateY-12) : (topY-14);
  var led = opts.state==='off' ? 'var(--led-off)' : (working ? 'var(--led-on)' : 'var(--led-idle)');
  var style='--n:'+o.w.length+';--dur:'+dur+'s;--step:'+step+'s;--rise:'+rise.toFixed(1)+'px;';
  return '<svg class="printer'+(working?' working':'')+(opts.state==='off'?' is-off':'')+(opts.cls?' '+opts.cls:'')+'" viewBox="0 0 160 150" style="'+style+'" role="img" aria-label="'+esc(opts.label||'Принтер')+'" focusable="false">'+
   '<ellipse cx="80" cy="144" rx="62" ry="4" fill="var(--shadow-soft)"/>'+
   '<rect x="18" y="126" width="124" height="16" rx="5" fill="var(--p-body)"/><rect x="18" y="126" width="124" height="4" rx="2" fill="#fff" opacity=".12"/>'+
   '<rect x="58" y="131" width="44" height="7" rx="3" fill="var(--p-screen)"/><circle cx="66" cy="134.500" r="2" fill="'+led+'"/><rect x="72" y="133" width="24" height="3" rx="1.500" fill="var(--p-line)"/>'+
   '<rect x="32" y="26" width="8" height="100" rx="3" fill="var(--p-rail)"/><rect x="120" y="26" width="8" height="100" rx="3" fill="var(--p-rail)"/>'+
   '<rect x="26" y="18" width="108" height="12" rx="5" fill="var(--p-body)"/><rect x="26" y="18" width="108" height="3.500" rx="2" fill="#fff" opacity=".12"/>'+
   '<g class="p-spool"><circle cx="132" cy="14" r="12" fill="var(--c-'+PCOL[id]+')"/><circle cx="132" cy="14" r="4.500" fill="var(--p-screen)"/><path d="M132 2v6M132 20v6M120 14h6M138 14h6" stroke="#fff" stroke-opacity=".35" stroke-width="1.600"/></g>'+
   '<rect x="46" y="116" width="68" height="6" rx="2.500" fill="var(--p-plate)"/><path d="M54 119h52" stroke="var(--p-line)" stroke-width="1" stroke-dasharray="3 3"/>'+
   lay+
   '<g class="p-gantry" style="transform:translateY('+(gantryY-plateY+12).toFixed(1)+'px)"><g class="p-lift">'+
     '<rect x="38" y="'+(plateY-12)+'" width="84" height="7" rx="3" fill="var(--p-rail)"/><rect x="38" y="'+(plateY-12)+'" width="84" height="2.200" rx="1" fill="#fff" opacity=".18"/>'+
     '<g class="p-head"><rect x="72" y="'+(plateY-19)+'" width="18" height="15" rx="3.500" fill="var(--p-body)"/><rect x="75" y="'+(plateY-16)+'" width="12" height="3" rx="1.500" fill="var(--c-'+PCOL[id]+')"/><path d="M78 '+(plateY-4)+'h6l-3 6z" fill="var(--p-nozzle)"/></g>'+
   '</g></g>'+
   '</svg>';
}

/* ---------- аватары ---------- */
var SKIN = {sem:'#E8B891', liza:'#F4C7A5', max:'#E2AE86', nina:'#EBC3A1', oleg:'#D9A67C', artem:'#E8B891', irina:'#EBC3A1'};
function mouth(m){
  switch(m){
    case 'happy':    return '<path d="M26 41q6 5 12 0" fill="none" stroke="#2B1B17" stroke-width="1.800" stroke-linecap="round"/>';
    case 'excited':  return '<path d="M25.500 40q6.500 9 13 0z" fill="#7A2430" stroke="#2B1B17" stroke-width="1.400" stroke-linejoin="round"/>';
    case 'worried':  return '<path d="M27 43q5-3 10 0" fill="none" stroke="#2B1B17" stroke-width="1.800" stroke-linecap="round"/>';
    case 'angry':    return '<path d="M27 43.500q5-3.500 10 0" fill="none" stroke="#2B1B17" stroke-width="1.800" stroke-linecap="round"/>';
    case 'smug':     return '<path d="M27 42q5 3 11-2" fill="none" stroke="#2B1B17" stroke-width="1.800" stroke-linecap="round"/>';
    case 'sad':      return '<path d="M27 44q5-4 10 0" fill="none" stroke="#2B1B17" stroke-width="1.800" stroke-linecap="round"/>';
    case 'surprised':return '<ellipse cx="32" cy="42.500" rx="2.400" ry="3" fill="#7A2430"/>';
    default:         return '<path d="M27.500 42.500h9" fill="none" stroke="#2B1B17" stroke-width="1.800" stroke-linecap="round"/>';
  }
}
function brows(m){
  var p;
  switch(m){
    case 'angry':    p='M21 28.500l8 3M43 28.500l-8 3'; break;
    case 'worried': case 'sad': p='M21 31l8-3M43 31l-8-3'; break;
    case 'happy': case 'excited': p='M21 29.500q4-3 8 0M35 29.500q4-3 8 0'; break;
    case 'surprised': p='M21 27q4-3 8 0M35 27q4-3 8 0'; break;
    case 'smug': p='M21 29.500h8M35 28l8-1.500'; break;
    default: p='M21 29.500h8M35 29.500h8';
  }
  return '<path d="'+p+'" fill="none" stroke="#3A2A24" stroke-width="1.700" stroke-linecap="round"/>';
}
function eyes(m){
  var r = m==='surprised'||m==='excited' ? 2.300 : 1.900;
  if(m==='happy') return '<path d="M23.500 34q2.500-3 5 0M35.500 34q2.500-3 5 0" fill="none" stroke="#1A1226" stroke-width="1.800" stroke-linecap="round"/>';
  return '<circle cx="26" cy="34" r="'+r+'" fill="#1A1226"/><circle cx="38" cy="34" r="'+r+'" fill="#1A1226"/><circle cx="26.700" cy="33.200" r=".6" fill="#fff"/><circle cx="38.700" cy="33.200" r=".6" fill="#fff"/>';
}
function avatarSVG(who, mood, size, cls){
  var c=CHARS[who]||CHARS.nar, m=mood||'neutral', sz=size||56, col=c.color, body='';
  if(who==='phil'){
    var e;
    if(m==='happy'||m==='excited') e='<path d="M23 33q3-4 6 0M35 33q3-4 6 0" fill="none" stroke="#7CF3FF" stroke-width="2.200" stroke-linecap="round"/>';
    else if(m==='sad'||m==='worried') e='<rect x="23" y="31" width="6" height="6" rx="1.500" fill="#7CF3FF"/><rect x="35" y="31" width="6" height="6" rx="1.500" fill="#7CF3FF"/><path d="M22 28l7 2M42 28l-7 2" stroke="#7CF3FF" stroke-width="1.600" stroke-linecap="round"/>';
    else if(m==='angry') e='<rect x="23" y="31" width="6" height="5" rx="1.500" fill="#FF7A7A"/><rect x="35" y="31" width="6" height="5" rx="1.500" fill="#FF7A7A"/><path d="M21 28l8 3M43 28l-8 3" stroke="#FF7A7A" stroke-width="1.800" stroke-linecap="round"/>';
    else if(m==='smug') e='<rect x="23" y="32" width="6" height="3" rx="1.500" fill="#7CF3FF"/><rect x="35" y="30" width="6" height="6" rx="1.500" fill="#7CF3FF"/>';
    else e='<rect x="23" y="30" width="6" height="7" rx="1.500" fill="#7CF3FF"/><rect x="35" y="30" width="6" height="7" rx="1.500" fill="#7CF3FF"/>';
    var mo = (m==='happy'||m==='excited') ? '<path d="M26 42q6 5 12 0" fill="none" stroke="#7CF3FF" stroke-width="2" stroke-linecap="round"/>' : (m==='sad'||m==='worried'||m==='angry') ? '<path d="M27 44q5-3.500 10 0" fill="none" stroke="#7CF3FF" stroke-width="2" stroke-linecap="round"/>' : '<path d="M27 43h10" stroke="#7CF3FF" stroke-width="2" stroke-linecap="round"/>';
    body='<rect x="9" y="12" width="46" height="42" rx="10" fill="#242C57"/><rect x="9" y="12" width="46" height="6" rx="3" fill="#fff" opacity=".12"/><rect x="14" y="19" width="36" height="28" rx="6" fill="#0E1530"/>'+e+mo+'<circle cx="49" cy="12" r="7" fill="'+col+'"/><circle cx="49" cy="12" r="2.600" fill="#242C57"/><rect x="18" y="52" width="28" height="6" rx="3" fill="#242C57"/>';
  } else if(who==='mega'){
    body='<path d="M32 8l20 11.500v23L32 54 12 42.500v-23L32 8Z" fill="#475569"/><path d="M32 17l12 7v14l-12 7-12-7V24l12-7Z" fill="none" stroke="#E2E8F0" stroke-width="3"/><circle cx="32" cy="31" r="4" fill="#E2E8F0"/>';
  } else if(who==='news'){
    body='<rect x="12" y="14" width="40" height="36" rx="6" fill="#E2E8F0"/><path d="M18 22h28M18 29h28M18 36h18" stroke="#475569" stroke-width="3" stroke-linecap="round"/>';
  } else {
    var sk=SKIN[who]||'#EBC3A1', hair='', top='', acc='';
    if(who==='sem'){ top='<path d="M8 64c0-11 9-16 24-16s24 5 24 16z" fill="#4F8CFF"/><path d="M26 48l6 7 6-7" fill="#fff"/>'; hair='<path d="M17 31c-1-12 7-18 15-18s16 6 15 18c-2-6-6-9-15-9s-13 3-15 9z" fill="#9AA4B5"/>'; acc='<circle cx="26" cy="34" r="5.500" fill="none" stroke="#2C3556" stroke-width="1.500"/><circle cx="38" cy="34" r="5.500" fill="none" stroke="#2C3556" stroke-width="1.500"/><path d="M31.500 34h1" stroke="#2C3556" stroke-width="1.500"/><path d="M26 39.500q6-3 12 0" fill="#9AA4B5" stroke="#9AA4B5" stroke-width="2.600" stroke-linecap="round"/>'; }
    else if(who==='liza'){ top='<path d="M8 64c0-11 9-16 24-16s24 5 24 16z" fill="#E8428C"/>'; hair='<path d="M16 34c-3-14 6-21 16-21s19 7 16 21c-1-8-6-13-16-13s-15 5-16 13z" fill="#7A2BD0"/><circle cx="14" cy="38" r="6" fill="#7A2BD0"/><circle cx="50" cy="38" r="6" fill="#7A2BD0"/>'; acc='<path d="M16 32c0-11 7-17 16-17s16 6 16 17" fill="none" stroke="#1F2547" stroke-width="3.200" stroke-linecap="round"/><rect x="11" y="31" width="6" height="10" rx="3" fill="#1F2547"/><rect x="47" y="31" width="6" height="10" rx="3" fill="#1F2547"/>'; }
    else if(who==='max'){ top='<path d="M8 64c0-11 9-16 24-16s24 5 24 16z" fill="#14B8D4"/>'; hair='<path d="M17 30c0-10 6-15 15-15s15 5 15 15z" fill="#0E7490"/><path d="M45 28h12q-3 3-12 3z" fill="#0E7490"/>'; }
    else if(who==='nina'){ top='<path d="M8 64c0-11 9-16 24-16s24 5 24 16z" fill="#3BB273"/>'; hair='<path d="M17 33c-2-13 6-19 15-19s17 6 15 19c-2-7-6-10-15-10s-13 3-15 10z" fill="#5B4636"/><circle cx="32" cy="12" r="6" fill="#5B4636"/>'; acc='<circle cx="26" cy="34" r="5" fill="none" stroke="#2C3556" stroke-width="1.400"/><circle cx="38" cy="34" r="5" fill="none" stroke="#2C3556" stroke-width="1.400"/><path d="M31 34h2" stroke="#2C3556" stroke-width="1.400"/>'; }
    else if(who==='oleg'){ top='<path d="M8 64c0-11 9-16 24-16s24 5 24 16z" fill="#E2E8F0"/><path d="M32 49l-3 4 3 11 3-11z" fill="#6C5CE7"/>'; hair='<path d="M17 30c0-11 6-16 15-16s15 5 15 16c-3-5-8-7-15-7s-12 2-15 7z" fill="#2B2219"/>'; }
    else if(who==='artem'){ top='<path d="M8 64c0-11 9-16 24-16s24 5 24 16z" fill="#1F2547"/><path d="M26 49l6 8 6-8" fill="#fff"/><path d="M32 52l-2 3 2 9 2-9z" fill="#A855F7"/>'; hair='<path d="M17 29c1-10 7-15 15-15s14 5 15 15c-4-4-9-5-15-5s-11 1-15 5z" fill="#3B2A1E"/>'; }
    else if(who==='irina'){ top='<path d="M8 64c0-11 9-16 24-16s24 5 24 16z" fill="#F8FAFC"/><path d="M26 49l6 8 6-8" fill="#14B8A6"/>'; hair='<path d="M17 33c-2-13 6-19 15-19s17 6 15 19c-2-7-6-10-15-10s-13 3-15 10z" fill="#8A4B2A"/><path d="M45 26q8 4 6 14" fill="none" stroke="#8A4B2A" stroke-width="4" stroke-linecap="round"/>'; }
    body=top+'<rect x="28" y="44" width="8" height="6" fill="'+sk+'"/><ellipse cx="32" cy="34" rx="14" ry="16" fill="'+sk+'"/>'+hair+brows(m)+eyes(m)+mouth(m)+acc;
  }
  return '<svg class="avatar'+(cls?' '+cls:'')+'" viewBox="0 0 64 64" width="'+sz+'" height="'+sz+'" role="img" aria-label="'+esc(c.name||'Рассказчик')+'" focusable="false"><circle cx="32" cy="32" r="32" fill="'+col+'" opacity=".22"/><clipPath id="av'+who+'"><circle cx="32" cy="32" r="31"/></clipPath><g clip-path="url(#av'+who+')">'+body+'</g><circle cx="32" cy="32" r="31" fill="none" stroke="'+col+'" stroke-width="2"/></svg>';
}

/* ---------- башня слоёв: каждый месяц это слой ---------- */
function towerSVG(hist, opts){
  opts=opts||{}; var W=opts.w||360, H=opts.h||236, base=H-22, lh=Math.min(11.500,(H-44)/TOTAL), n=hist.length, i;
  var maxRev=1; hist.forEach(function(x){ maxRev=Math.max(maxRev,x.revenue); });
  var out='<defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="var(--loss-bg)"/><rect width="2.500" height="6" fill="var(--loss-fg)"/></pattern></defs>';
  out+='<rect x="'+(W/2-92)+'" y="'+base+'" width="184" height="9" rx="4" fill="var(--p-plate)"/><path d="M'+(W/2-84)+' '+(base+4.500)+'h168" stroke="var(--p-line)" stroke-dasharray="4 4"/>';
  for(i=0;i<n;i++){
    var x=hist[i], w=60+120*Math.sqrt(Math.max(0,x.revenue)/maxRev), y=base-(i+1)*lh, last=(i===n-1&&opts.animateLast);
    var fill = x.profit>=0 ? 'var(--layer-gain)' : 'url(#hatch)';
    out+='<g class="t-layer'+(last?' t-new':'')+'" data-m="'+x.m+'"><rect x="'+(W/2-w/2).toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+(lh-1.600).toFixed(1)+'" rx="3" fill="'+fill+'" stroke="'+(x.profit>=0?'var(--layer-gain-edge)':'var(--loss-fg)')+'" stroke-width="1"/>';
    if(x.profit>=0) out+='<rect x="'+(W/2-w/2+3).toFixed(1)+'" y="'+(y+1.200).toFixed(1)+'" width="'+(w-6).toFixed(1)+'" height="1.600" rx=".8" fill="#fff" opacity=".4"/>';
    out+='</g>';
    if((x.m%4===1||x.m===TOTAL||i===n-1) ) out+='<text x="'+(W/2-w/2-8).toFixed(1)+'" y="'+(y+lh-3).toFixed(1)+'" text-anchor="end" class="t-lab">'+MONTH_SHORT[x.m-1]+'</text>';
  }
  if(n<TOTAL){ var ty=base-(n+1)*lh; out+='<rect x="'+(W/2-34)+'" y="'+ty.toFixed(1)+'" width="68" height="'+(lh-1.600).toFixed(1)+'" rx="3" fill="none" stroke="var(--edge-strong)" stroke-dasharray="4 3"/>'; }
  var alt=hist.map(function(x){ return MONTH_SHORT[x.m-1]+': '+(x.profit>=0?'прибыль ':'убыток ')+rub(Math.abs(x.profit)); }).join('; ');
  return '<svg class="tower" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Башня слоёв: каждый слой это месяц. '+esc(alt)+'" focusable="false">'+out+'</svg>';
}

/* ---------- график капитала: линия, цель, подписи ---------- */
function capChartSVG(hist, opts){
  opts=opts||{}; if(!hist.length) return '';
  var W=opts.w||520, H=opts.h||220, L=54, R=14, T=16, B=28, pw=W-L-R, ph=H-T-B;
  var mx=GOAL*1.05, mn=0; hist.forEach(function(x){ mx=Math.max(mx,x.cap*1.05); mn=Math.min(mn,x.cap); });
  function X(i){ return L+i/(TOTAL-1)*pw; } function Y(v){ return T+ph-(v-mn)/(mx-mn)*ph; }
  var pts=hist.map(function(x,i){ return X(i).toFixed(1)+','+Y(x.cap).toFixed(1); }), last=hist[hist.length-1], g='';
  [0,0.5,1].forEach(function(f){ var v=GOAL*f; g+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(v)+'" y2="'+Y(v)+'" stroke="var(--grid-line)"/><text x="'+(L-8)+'" y="'+(Y(v)+4)+'" text-anchor="end" class="c-lab">'+(v===0?'0':(v>=1e6?'1 млн':num(v/1000)+' тыс'))+'</text>'; });
  g+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(GOAL)+'" y2="'+Y(GOAL)+'" stroke="var(--brand)" stroke-width="2.200" stroke-dasharray="7 5"/><text x="'+(L+6)+'" y="'+(Y(GOAL)-7)+'" text-anchor="start" class="c-lab c-goal">цель: технопарк</text>';
  [1,4,8,12,16].forEach(function(m){ g+='<text x="'+X(m-1)+'" y="'+(H-8)+'" text-anchor="middle" class="c-lab">'+m+'</text>'; });
  return '<svg class="capchart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Капитал по месяцам. Сейчас '+esc(rub(last.cap))+'" focusable="false">'+g+
    '<polyline points="'+L+','+Y(0).toFixed(1)+' '+pts.join(' ')+' '+X(hist.length-1).toFixed(1)+','+Y(0).toFixed(1)+'" fill="var(--c-cyan)" opacity=".16"/>'+
    '<polyline points="'+pts.join(' ')+'" fill="none" stroke="var(--c-cyan-text)" stroke-width="3.200" stroke-linejoin="round" stroke-linecap="round"/>'+
    '<circle cx="'+X(hist.length-1).toFixed(1)+'" cy="'+Y(last.cap).toFixed(1)+'" r="6" fill="var(--brand)" stroke="var(--surface)" stroke-width="2.500"/></svg>';
}

/* ---------- кривая спроса товара (мини-график в карточке) ---------- */
function curveSVG(s, id, plan, w, h){
  w=w||170; h=h||64; var b=priceBounds(s,id,plan.mode), n=36, pts=[], i, max=1, vals=[];
  for(i=0;i<=n;i++){ var p=b.min+(b.max-b.min)*i/n, d=demandAt(s,id,p,plan,1); vals.push([p,d]); if(d>max) max=d; }
  function X(p){ return 4+(p-b.min)/(b.max-b.min)*(w-8); } function Y(d){ return h-5-(d/max)*(h-12); }
  vals.forEach(function(v){ pts.push(X(v[0]).toFixed(1)+','+Y(v[1]).toFixed(1)); });
  var cur=Math.max(b.min,Math.min(b.max,plan.price[id])), dc=demandAt(s,id,cur,plan,1), ref=refPrice(s,id);
  return '<svg class="curve" viewBox="0 0 '+w+' '+h+'" width="100%" aria-hidden="true" focusable="false"><polyline points="4,'+(h-5)+' '+pts.join(' ')+' '+(w-4)+','+(h-5)+'" fill="var(--c-'+PCOL[id]+')" opacity=".18"/><polyline points="'+pts.join(' ')+'" fill="none" stroke="var(--c-'+PCOL[id]+'-text)" stroke-width="2.600" stroke-linejoin="round" stroke-linecap="round"/>'+
    '<line x1="'+X(ref).toFixed(1)+'" x2="'+X(ref).toFixed(1)+'" y1="4" y2="'+(h-5)+'" stroke="var(--edge-strong)" stroke-dasharray="2 3"/>'+
    '<line x1="'+X(cur).toFixed(1)+'" x2="'+X(cur).toFixed(1)+'" y1="'+Y(dc).toFixed(1)+'" y2="'+(h-5)+'" stroke="var(--ink)" stroke-width="1.400"/><circle cx="'+X(cur).toFixed(1)+'" cy="'+Y(dc).toFixed(1)+'" r="5" fill="var(--brand)" stroke="var(--surface)" stroke-width="2"/></svg>';
}

/* ---------- логотип ---------- */
function logoSVG(sz){ return '<svg class="logo-mark" viewBox="0 0 32 32" width="'+(sz||32)+'" height="'+(sz||32)+'" aria-hidden="true" focusable="false"><rect x="4" y="21" width="24" height="6" rx="3" fill="#FF7A2F"/><rect x="7" y="14" width="18" height="6" rx="3" fill="#FF9A5C"/><rect x="10" y="7" width="12" height="6" rx="3" fill="#FFBE8F"/><rect x="4" y="21" width="24" height="2" rx="1" fill="#fff" opacity=".35"/></svg>'; }

/* ---------- вывеска мастерской ---------- */
function signSVG(name, w, h){
  var n=Math.max(1,String(name||'').length), fs=Math.max(18,Math.min(40,300/(n*0.62)));
  return '<svg class="sign" viewBox="0 0 360 170" width="'+(w||360)+'" height="'+(h||170)+'" role="img" aria-label="Вывеска: '+esc(name||'')+'" focusable="false">'+
    '<defs><clipPath id="signclip"><rect x="14" y="40" width="332" height="112" rx="20"/></clipPath></defs>'+
    '<path d="M70 4v40M290 4v40" stroke="var(--edge-strong)" stroke-width="5" stroke-linecap="round"/><circle cx="70" cy="6" r="6" fill="var(--edge-strong)"/><circle cx="290" cy="6" r="6" fill="var(--edge-strong)"/>'+
    '<rect x="14" y="40" width="332" height="112" rx="20" fill="var(--surface)"/>'+
    '<g clip-path="url(#signclip)"><rect x="14" y="108" width="332" height="14" fill="var(--c-magenta)"/><rect x="14" y="122" width="332" height="14" fill="var(--c-orange)"/><rect x="14" y="136" width="332" height="16" fill="var(--c-cyan)"/></g>'+
    '<rect x="14" y="40" width="332" height="112" rx="20" fill="none" stroke="var(--edge-strong)" stroke-width="5"/>'+
    '<text x="180" y="'+Math.round(72+fs*0.34)+'" text-anchor="middle" font-family="Tektur,sans-serif" font-weight="800" font-size="'+fs.toFixed(1)+'" fill="var(--ink)">'+esc(name||'')+'</text></svg>';
}

/* ---------- сцены вступления ---------- */
function sceneClassroom(){
  return '<svg viewBox="0 0 640 380" role="img" aria-label="Кабинет технологии: принтер накрыт простынёй, на двери табличка «Кружок закрыт»" focusable="false">'+
   '<rect width="640" height="380" fill="var(--surface-3)"/><rect y="300" width="640" height="80" fill="var(--edge)"/>'+
   '<rect x="40" y="40" width="190" height="150" rx="10" fill="var(--info-bg)" stroke="var(--edge-strong)" stroke-width="6"/><path d="M135 40v150M40 115h190" stroke="var(--edge-strong)" stroke-width="5"/>'+
   '<circle cx="190" cy="82" r="14" fill="var(--c-orange)" opacity=".7"/><path d="M60 170q30-30 60-6t90-10" stroke="var(--c-cyan)" stroke-width="3" fill="none" opacity=".5"/>'+
   '<circle cx="320" cy="62" r="30" fill="var(--surface)" stroke="var(--edge-strong)" stroke-width="5"/><path d="M320 62V42M320 62l14 8" stroke="var(--ink)" stroke-width="4" stroke-linecap="round"/>'+
   '<rect x="400" y="250" width="200" height="14" rx="6" fill="var(--p-rail)"/><rect x="415" y="264" width="12" height="40" fill="var(--p-rail)"/><rect x="573" y="264" width="12" height="40" fill="var(--p-rail)"/>'+
   '<path d="M440 250c-10-6-18-30-14-62 3-20 20-36 52-36s50 16 54 36c5 32-4 56-14 62z" fill="var(--surface)" stroke="var(--edge-strong)" stroke-width="4"/><path d="M456 180q14 14 6 56M504 176q-10 16-2 60M480 160q0 30-4 76" stroke="var(--edge)" stroke-width="3" fill="none"/>'+
   '<circle cx="534" cy="162" r="12" fill="var(--c-orange)"/><circle cx="534" cy="162" r="4.500" fill="var(--surface)"/>'+
   '<g transform="rotate(-4 120 268)"><rect x="40" y="244" width="130" height="58" rx="6" fill="#C79A63"/><path d="M40 266h130" stroke="#A97B45" stroke-width="3"/><rect x="85" y="244" width="40" height="22" fill="#E3C68F" opacity=".7"/></g>'+
   '<g transform="rotate(3 190 286)"><rect x="150" y="262" width="96" height="42" rx="5" fill="#B88A55"/><path d="M150 281h96" stroke="#9A6D3A" stroke-width="3"/></g>'+
   '<g transform="rotate(-3 330 130)"><rect x="262" y="104" width="136" height="56" rx="8" fill="var(--warn-bg)" stroke="var(--warn-fg)" stroke-width="3"/><text x="330" y="130" text-anchor="middle" font-family="Tektur,sans-serif" font-weight="800" font-size="17" fill="var(--warn-fg)">КРУЖОК</text><text x="330" y="150" text-anchor="middle" font-family="Tektur,sans-serif" font-weight="800" font-size="17" fill="var(--warn-fg)">ЗАКРЫТ</text><rect x="320" y="98" width="20" height="10" rx="2" fill="var(--loss-fg)" opacity=".55"/></g>'+
   '</svg>';
}
/* Общий CSS `.slide-art svg{width:100%}` ломает вложенные <svg>, поэтому принтер встраивается через <g> + scale */
function scenePath(){
  var xs=[200,292,384], labs=['250 тыс','500 тыс','750 тыс'], flags='', i;
  for(i=0;i<3;i++){
    flags+='<g class="flag" style="--i:'+i+'"><path d="M'+xs[i]+' 332V290" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/>'+
      '<path d="M'+xs[i]+' 290h22l-7 7 7 7h-22z" fill="var(--brand)" stroke="var(--brand-edge)" stroke-width="2" stroke-linejoin="round"/>'+
      '<text x="'+xs[i]+'" y="278" text-anchor="middle" class="path-lab">'+labs[i]+'</text></g>';
  }
  var printer=printerSVG({obj:'stand',layers:3,state:'idle'}).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');
  return '<svg viewBox="0 0 640 380" role="img" aria-label="Путь от старого принтера к зданию «Технопарк»: цель один миллион рублей" focusable="false">'+
   '<rect width="640" height="380" fill="var(--surface-2)"/><rect y="304" width="640" height="76" fill="var(--edge)"/>'+
   '<path pathLength="1" class="draw" d="M156 332H511" fill="none" stroke="var(--brand)" stroke-width="12" stroke-linecap="round"/>'+
   flags+
   '<g transform="translate(14 187) scale(.8125)">'+printer+'</g>'+
   '<text x="80" y="366" text-anchor="middle" class="path-lab">старт</text>'+
   '<g transform="translate(436 138)"><rect x="0" y="40" width="150" height="126" rx="8" fill="var(--surface)" stroke="var(--edge-strong)" stroke-width="4"/><rect x="14" y="0" width="122" height="46" rx="8" fill="var(--ink)"/><text x="75" y="31" text-anchor="middle" font-family="Tektur,sans-serif" font-weight="800" font-size="19" fill="var(--ground)">ТЕХНОПАРК</text>'+
   '<g fill="var(--brand)"><rect x="18" y="62" width="26" height="22" rx="4"/><rect x="62" y="62" width="26" height="22" rx="4"/><rect x="106" y="62" width="26" height="22" rx="4"/><rect x="18" y="98" width="26" height="22" rx="4"/><rect x="106" y="98" width="26" height="22" rx="4"/></g><rect x="62" y="104" width="26" height="62" rx="4" fill="var(--c-cyan)"/><path d="M75 0V-26" stroke="var(--ink)" stroke-width="4"/><path d="M75 -26h28l-8 8 8 8H75z" fill="var(--brand)"/></g>'+
   '<text x="511" y="368" text-anchor="middle" class="path-goal">1 000 000 ₽</text>'+
   '</svg>';
}
function sceneCoins(){
  function stack(x,n){ var o=''; for(var i=0;i<n;i++){ o+='<ellipse cx="'+x+'" cy="'+(300-i*14)+'" rx="48" ry="15" fill="var(--c-orange)" stroke="var(--brand-edge)" stroke-width="3"/><rect x="'+(x-48)+'" y="'+(292-i*14)+'" width="96" height="8" fill="var(--c-orange)"/>'; } return o; }
  return '<svg viewBox="0 0 640 380" role="img" aria-label="Стопки монет: стартовый капитал 35 000 рублей" focusable="false"><rect width="640" height="380" fill="var(--surface-2)"/><rect y="310" width="640" height="70" fill="var(--edge)"/>'+
   stack(150,3)+stack(260,5)+stack(370,2)+
   '<g transform="translate(470 110)"><circle cx="70" cy="70" r="66" fill="var(--c-orange)" stroke="var(--brand-edge)" stroke-width="6"/><circle cx="70" cy="70" r="50" fill="none" stroke="var(--brand-edge)" stroke-width="3" stroke-dasharray="6 6"/><path d="M52 98V44h26a15 15 0 0 1 0 30H44M44 86h40" stroke="var(--brand-edge)" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></svg>';
}
/* калибровка стола: чем ближе к цели, тем ровнее линия */
function calibSVG(v, target){
  var d=v-target, q=Math.max(0,1-Math.abs(d)/28), noz=34+v*1.25, bed=190, i, line='';
  var h = d>0 ? Math.max(3,10-d*0.22) : 10+(-d)*0.28;      /* высота линии: слишком высоко = тонкая, слишком низко = раздавленная */
  var y = bed-h;
  if(d>6){ for(i=0;i<9;i++){ line+='<ellipse cx="'+(60+i*38)+'" cy="'+(bed-4)+'" rx="'+(8+(i%2)*3)+'" ry="4" fill="var(--c-orange)"/>'; } }
  else if(d<-6){ line='<path d="M44 '+(bed-2)+'h300" stroke="var(--c-orange)" stroke-width="'+(h*1.3).toFixed(1)+'" stroke-linecap="round" opacity=".95"/>'; for(i=0;i<8;i++) line+='<path d="M'+(70+i*36)+' '+(bed-h-3)+'l6 -9" stroke="var(--loss-fg)" stroke-width="3" stroke-linecap="round"/>'; }
  else { line='<rect x="44" y="'+y.toFixed(1)+'" width="300" height="'+h.toFixed(1)+'" rx="'+(h/2).toFixed(1)+'" fill="var(--c-orange)"/><rect x="48" y="'+(y+1.500).toFixed(1)+'" width="292" height="2.600" rx="1.300" fill="#fff" opacity=".45"/>'; }
  return '<svg viewBox="0 0 388 240" role="img" aria-label="Сопло над столом принтера и пробная линия пластика" focusable="false"><rect width="388" height="240" fill="var(--surface-2)"/>'+
   '<rect x="20" y="'+bed+'" width="348" height="16" rx="6" fill="var(--p-plate)"/><path d="M30 '+(bed+8)+'h328" stroke="var(--p-line)" stroke-dasharray="5 5"/>'+line+
   '<g style="transform:translateY('+(noz-60).toFixed(1)+'px);transition:transform 120ms linear"><rect x="164" y="38" width="60" height="44" rx="10" fill="var(--p-body)"/><rect x="172" y="48" width="44" height="8" rx="4" fill="var(--c-orange)"/><path d="M178 82h32l-9 24h-14z" fill="var(--p-nozzle)"/><rect x="190" y="14" width="8" height="24" fill="var(--p-rail)"/></g></svg>';
}
