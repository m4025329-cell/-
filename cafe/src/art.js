/* ===== «Первый столик»: вся графика рисуется SVG (без эмодзи и внешних картинок) ===== */
function esc(t){ return String(t).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

/* ---------- иконки: 24×24, обводка 2, скруглённые концы ---------- */
var ICONS = {
 home:'M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6',
 book:'M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3zM4 17a3 3 0 0 1 3-3h12',
 people:'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16.5 11a2.5 2.5 0 1 0 0-5M17.5 14c2.5.4 4 2.4 4 5.5',
 basket:'M3 9h18l-2 11H5zM8 9l3-5M16 9l-3-5',
 cart:'M3 4h2l2.5 11h10L20 7H6.5M9 20h.01M17 20h.01',
 mega:'M3 11v2a2 2 0 0 0 2 2h2l7 4V5L7 9H5a2 2 0 0 0-2 2zM18 8c1.5 1 1.5 7 0 8',
 coins:'M12 4c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3zM4 7v5c0 1.7 3.6 3 8 3s8-1.3 8-3V7M4 12v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5',
 map:'M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14',
 star:'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z',
 cup:'M5 8h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 9h2a2.5 2.5 0 0 1 0 5h-2M8 3c0 1.5 1 1.5 1 3M12 3c0 1.5 1 1.5 1 3',
 lock:'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3',
 check:'M5 12.5l4.5 4.5L19 7.5',
 x:'M6 6l12 12M18 6L6 18',
 plus:'M12 5v14M5 12h14', minus:'M5 12h14',
 left:'M15 5l-7 7 7 7', right:'M9 5l7 7-7 7', up:'M5 15l7-7 7 7', down:'M5 9l7 7 7-7',
 info:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01',
 warn:'M12 3l10 18H2zM12 10v5M12 18h.01',
 sun:'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5',
 moon:'M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z',
 sound:'M4 9v6h4l5 4V5L8 9zM16 9c1.5 1.5 1.5 4.5 0 6M18.5 6.5c3 3 3 8 0 11',
 mute:'M4 9v6h4l5 4V5L8 9zM17 9l5 6M22 9l-5 6',
 help:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01',
 award:'M12 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.5 13l-1.5 8 5-3 5 3-1.5-8',
 fork:'M6 3v6a3 3 0 0 0 6 0V3M9 3v18M17 3c-2.2 1.6-3 5-3 8h3v10',
 toque:'M7 14v5h10v-5M6.5 14a3.5 3.5 0 0 1-.5-6.9 4 4 0 0 1 7.5-1.1 4 4 0 0 1 4.5 4.6 3.4 3.4 0 0 1-1 3.4M7 17h10',
 chef:'M7 14v5h10v-5M6.5 14a3.5 3.5 0 0 1-.5-6.9 4 4 0 0 1 7.5-1.1 4 4 0 0 1 4.5 4.6 3.4 3.4 0 0 1-1 3.4M7 17h10',
 whisk:'M12 3c-3.5 3.5-3.5 10 0 13 3.5-3 3.5-9.5 0-13zM12 3v13M9.7 7.5c.6 3 1 5 2.3 8.5M14.3 7.5c-.6 3-1 5-2.3 8.5M10 16l-1.5 5M14 16l1.5 5',
 heart:'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z',
 handshake:'M2 11l4-4 4 2 4-2 6 4M2 11l5 5c1 1 2.5 1 3.5 0M10 16l2 2c.8.8 2 .8 2.8 0l3.7-3.7',
 shield:'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2.2 2.2L15.5 10',
 bank:'M3 10l9-6 9 6zM5 10v8M9 10v8M15 10v8M19 10v8M3 20h18',
 phone:'M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 18h2',
 palette:'M12 3a9 9 0 0 0 0 18c1.5 0 2-1 2-2s-.7-1.5-.7-2.5S14 15 15 15h3a3 3 0 0 0 3-3c0-5-4-9-9-9zM7.5 11h.01M10 7h.01M14 7h.01',
 eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
 factory:'M3 20V10l6 4v-4l6 4V6h3v14zM8 20v-3h3v3',
 cap:'M2 9l10-5 10 5-10 5zM6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5',
 tie:'M9 3h6l-1 4 2 11-4 3-4-3 2-11z',
 door:'M6 21V4h12v17M4 21h16M14 12h.01',
 clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
 trend:'M3 17l6-6 4 4 8-8M15 7h6v6',
 chart:'M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-8',
 calendar:'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
 truck:'M2 7h11v9H2zM13 10h4l3 3v3h-7M6 18.5h.01M16 18.5h.01',
 snow:'M12 2v20M3.5 7l17 10M3.5 17l17-10',
 thermo:'M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0z',
 pin:'M12 21s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12zM12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
 building:'M4 21V8l8-5 8 5v13M9 21v-6h6v6M2 21h20',
 sparkle:'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8z',
 undo:'M4 12a8 8 0 1 0 3-6.2M4 4v5h5',
 save:'M5 3h11l3 3v15H5zM8 3v6h7V3M8 21v-7h8v7',
 copy:'M8 8h12v12H8zM4 16V4h12',
 trash:'M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14',
 bolt:'M13 2L5 14h6l-1 8 8-12h-6z',
 play:'M7 4l13 8-13 8z',
 pause:'M8 5v14M16 5v14',
 flag:'M5 21V4M5 4h12l-2 4 2 4H5',
 chat:'M4 5h16v11H9l-5 4z',
 people2:'M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4.4 3.6-8 8-8s8 3.6 8 8',
 gift:'M4 10h16v10H4zM3 7h18v3H3zM12 7v13M8 7a2.5 2.5 0 1 1 4-2M16 7a2.5 2.5 0 1 0-4-2',
 key:'M8 15a4 4 0 1 1 3.6-5.7L21 9v4h-3v3h-3v-2.6A4 4 0 0 1 8 15z',
 table:'M4 10h16M6 10l1 10M18 10l-1 10M12 10v10',
 leaf:'M5 19c0-9 5-14 15-14 0 10-5 15-14 15M5 19l8-8',
 wrench:'M14 6a4 4 0 0 0 5 5l-9 9a2.1 2.1 0 0 1-3-3l9-9a4 4 0 0 0-2-2z',
 close:'M6 6l12 12M18 6L6 18',
 menu:'M4 7h16M4 12h16M4 17h16',
 up2:'M12 19V5M6 11l6-6 6 6',
 target:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01',
 percent:'M6 18L18 6M8 9a1.5 1.5 0 1 0 0-.01M16 17a1.5 1.5 0 1 0 0-.01'
};
function ico(n, cls){ var p=ICONS[n]||ICONS.info; return '<svg class="ic'+(cls?' '+cls:'')+'" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="'+p+'"/></svg>'; }

/* ---------- звёзды рейтинга ---------- */
var _sid=0;
function starsSVG(r, size){
  r=clamp(r||0,0,5); size=size||18; var id='sg'+(++_sid), out='<svg class="stars" width="'+(size*5+8)+'" height="'+size+'" viewBox="0 0 '+(24*5+8)+' 24" role="img" aria-label="Рейтинг '+f1d(r)+' из 5">';
  out+='<defs>'; for(var i=0;i<5;i++){ var f=clamp(r-i,0,1); out+='<linearGradient id="'+id+i+'" x1="0" x2="1" y1="0" y2="0"><stop offset="'+f+'" stop-color="var(--star)"/><stop offset="'+f+'" stop-color="var(--star-off)"/></linearGradient>'; } out+='</defs>';
  for(var j=0;j<5;j++) out+='<path transform="translate('+(j*26)+' 0)" d="'+ICONS.star+'" fill="url(#'+id+j+')" stroke="var(--star-line)" stroke-width="1.4" stroke-linejoin="round"/>';
  return out+'</svg>';
}

/* ---------- знак «Первый столик»: круглый столик с чашкой ---------- */
function logoSVG(size){
  size=size||36; return '<svg class="logo-svg" width="'+size+'" height="'+size+'" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="23" fill="var(--brand)"/><circle cx="24" cy="24" r="23" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/>'+
   '<ellipse cx="24" cy="30" rx="14" ry="4.2" fill="#FFF3DE"/><rect x="22.6" y="30" width="2.8" height="9" rx="1.2" fill="#FFF3DE"/><ellipse cx="24" cy="40" rx="6.5" ry="1.8" fill="#FFF3DE"/>'+
   '<path d="M17.5 20.5h9.4v4.2a4.7 4.7 0 0 1-4.7 4.7 4.7 4.7 0 0 1-4.7-4.7z" fill="#FFF3DE"/><path d="M26.9 21.7h1.7a1.9 1.9 0 0 1 0 3.8h-1.7" fill="none" stroke="#FFF3DE" stroke-width="1.8" stroke-linecap="round"/>'+
   '<path class="steam" d="M20.5 17c0-1.6 1.6-1.6 1.6-3.2M23.8 17c0-1.6 1.6-1.6 1.6-3.2" fill="none" stroke="#FFF3DE" stroke-width="1.6" stroke-linecap="round"/></svg>';
}

/* ---------- блюда: плоские иллюстрации 48×48 ---------- */
var DISH_COL = {cocoa:['#7A4A2B','#C99565'], amber:['#D98A2B','#F2C16B'], sun:['#E4B02B','#F7DE8A'], tomato:['#CF3A1E','#F0795E'], berry:['#B83A6B','#E58AB0'], basil:['#3F8F4F','#8CCB86'], plum:['#7A55B0','#B79BE0'], sky:['#2B78B5','#8BC3EA']};
function dishSVG(g, cat, size){
  size=size||44; var c=DISH_COL[CATC[cat]||'amber']||DISH_COL.amber, a=c[0], b=c[1], p='';
  var plate='<ellipse cx="24" cy="36" rx="19" ry="6.5" fill="var(--plate)" stroke="var(--plate-line)" stroke-width="1.2"/>';
  function steam(x,y){ return '<path class="steam" d="M'+x+' '+y+'c0-2.5 2.5-2.5 2.5-5M'+(x+4)+' '+y+'c0-2.5 2.5-2.5 2.5-5" fill="none" stroke="var(--steam)" stroke-width="1.8" stroke-linecap="round"/>'; }
  switch(g){
   case 'cup': p=plate+'<path d="M12 18h20v8a9 9 0 0 1-9 9h-2a9 9 0 0 1-9-9z" fill="#FFF8EE" stroke="var(--plate-line)" stroke-width="1.4"/><path d="M32 20h2.5a3.5 3.5 0 0 1 0 7H31" fill="none" stroke="var(--plate-line)" stroke-width="2"/><ellipse cx="22" cy="19" rx="9" ry="2.2" fill="'+a+'"/><path d="M17 19.2c2 .8 3 .8 5 0s3-.8 5 0" stroke="'+b+'" stroke-width="1.4" fill="none" stroke-linecap="round"/>'+steam(17,13); break;
   case 'tea': p=plate+'<circle cx="22" cy="26" r="9" fill="'+b+'" stroke="'+a+'" stroke-width="1.6"/><path d="M31 22l7-4" stroke="'+a+'" stroke-width="2.6" stroke-linecap="round"/><rect x="17" y="14" width="10" height="3" rx="1.5" fill="'+a+'"/><circle cx="22" cy="12.5" r="1.8" fill="'+a+'"/><path d="M13 24c-3 0-4 4 0 5" fill="none" stroke="'+a+'" stroke-width="2"/>'+steam(30,12); break;
   case 'pie': p=plate+'<path d="M7 31a17 15 0 0 1 34 0z" fill="#E9B766" stroke="#B87D2E" stroke-width="1.6"/><path d="M11 29c1.5-1 2.5 1 4 0s2.5 1 4 0 2.5 1 4 0 2.5 1 4 0 2.5 1 4 0" fill="none" stroke="#B87D2E" stroke-width="1.4"/><path d="M15 23c2-3 6-5 9-5" stroke="#F8D99A" stroke-width="2" fill="none" stroke-linecap="round"/>'; break;
   case 'bread': p=plate+'<path d="M6 32c1-10 7-17 18-17s17 7 18 17c-3 0-4-3-7-3-1 0-1 4-5 4s-4-5-6-5-2 5-6 5-4-4-5-4c-3 0-4 3-7 3z" fill="#E6A24A" stroke="#A8691F" stroke-width="1.5" stroke-linejoin="round"/><path d="M15 25c2-2 4-3 6-3M24 22c2 0 3 .5 4.5 1.5M31 25c1 .5 2 1.2 2.8 2.2" stroke="#F8CE82" stroke-width="2" fill="none" stroke-linecap="round"/>'; break;
   case 'cake': p=plate+'<path d="M8 33V22l32-4v15z" fill="#FFF1DC" stroke="'+a+'" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 27l32-4" stroke="'+a+'" stroke-width="1.6"/><path d="M8 22l32-4 0 3-32 4z" fill="'+b+'"/><circle cx="34" cy="14.5" r="3" fill="#C42A2A"/><path d="M34 11.5c0-2 1-3 2-3.5" stroke="#3F8F4F" stroke-width="1.6" fill="none"/>'; break;
   case 'bowl': p='<path d="M5 23h38a19 17 0 0 1-38 0z" fill="#FFF8EE" stroke="var(--plate-line)" stroke-width="1.5"/><ellipse cx="24" cy="23" rx="19" ry="4.5" fill="'+a+'"/><ellipse cx="24" cy="22.5" rx="13" ry="2.4" fill="'+b+'"/><circle cx="19" cy="22" r="1.5" fill="#F3E6C0"/><circle cx="28" cy="23" r="1.5" fill="#6BA55A"/><path d="M14 40h20" stroke="var(--plate-line)" stroke-width="2" stroke-linecap="round"/>'+steam(18,16); break;
   case 'egg': p=plate+'<circle cx="24" cy="30" r="12" fill="#FFFFFF" stroke="var(--plate-line)" stroke-width="1.2"/><path d="M14 28c2-6 8-8 12-5 5-1 8 4 6 8s-6 5-10 4-8 0-8-7z" fill="#FFF" stroke="#E7D6BC" stroke-width="1.2"/><circle cx="23" cy="28" r="5" fill="#F7B72B"/><circle cx="21.5" cy="26.5" r="1.4" fill="#FFE49A"/>'; break;
   case 'pancake': p=plate+'<ellipse cx="24" cy="31" rx="15" ry="5" fill="#D8984A"/><path d="M9 31v-4a15 5 0 0 0 30 0v4a15 5 0 0 1-30 0z" fill="#C6812F"/><ellipse cx="24" cy="26" rx="15" ry="5" fill="#E9B261"/><path d="M9 26v-4a15 5 0 0 0 30 0v4a15 5 0 0 1-30 0z" fill="#D8984A"/><ellipse cx="24" cy="21" rx="15" ry="5" fill="#F2C37C"/><path d="M18 20c2 2 5 0 6 3s4 1 6-1" fill="none" stroke="'+a+'" stroke-width="2.4" stroke-linecap="round"/><circle cx="25" cy="18" r="2.5" fill="#C42A2A"/>'; break;
   case 'sandwich': p=plate+'<path d="M7 27c0-8 8-12 17-12s17 4 17 12z" fill="#E4A850" stroke="#A8691F" stroke-width="1.4"/><path d="M6 28h36c0 2-1 3-3 3H9c-2 0-3-1-3-3z" fill="#7FBF6E"/><path d="M8 31h32v3H8z" fill="#E86A4A"/><path d="M7 34h34c0 2.5-3 4-17 4S7 36.5 7 34z" fill="#E4A850" stroke="#A8691F" stroke-width="1.4"/>'; break;
   case 'plate': p='<ellipse cx="24" cy="30" rx="21" ry="10" fill="var(--plate)" stroke="var(--plate-line)" stroke-width="1.4"/><ellipse cx="24" cy="30" rx="14" ry="6" fill="none" stroke="var(--plate-line)" stroke-width="1"/><ellipse cx="18" cy="29" rx="8" ry="4.6" fill="#9C5B2E"/><ellipse cx="17" cy="28" rx="5" ry="2.3" fill="#B97440"/><path d="M26 27c2-3 6-3 8 0 3 0 4 3 1 5-3 1-9 1-10-1s0-3 1-4z" fill="#FFF3D6" stroke="#E2CFA8" stroke-width="1"/><circle cx="33" cy="33" r="1.7" fill="#5FA14B"/><circle cx="29" cy="34.5" r="1.7" fill="#5FA14B"/>'; break;
   case 'pasta': p='<path d="M5 24h38a19 14 0 0 1-38 0z" fill="#FFF8EE" stroke="var(--plate-line)" stroke-width="1.5"/><ellipse cx="24" cy="24" rx="19" ry="4.5" fill="#F1CE75"/><path d="M12 24c2-4 5-4 7 0s5 4 7 0 5-4 7 0" stroke="#D9A840" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="19" cy="22" r="3" fill="#D9442A"/><circle cx="29" cy="21" r="2.6" fill="#D9442A"/><path d="M24 20c1-2 3-2 4-1" stroke="#3F8F4F" stroke-width="2" fill="none" stroke-linecap="round"/>'; break;
   case 'burger': p=plate+'<path d="M8 25c0-8 7-12 16-12s16 4 16 12z" fill="#E4A850" stroke="#A8691F" stroke-width="1.4"/><circle cx="17" cy="19" r=".9" fill="#FFF3D6"/><circle cx="24" cy="16.5" r=".9" fill="#FFF3D6"/><circle cx="31" cy="19" r=".9" fill="#FFF3D6"/><path d="M6 26c2 2 4-2 6 0s4-2 6 0 4-2 6 0 4-2 6 0 4-2 6 0v2H6z" fill="#6BB35A"/><rect x="7" y="28" width="34" height="4" rx="2" fill="#7B3F22"/><path d="M8 32h32l-3 3H11z" fill="#F2C94C"/><path d="M8 35h32c0 3-3 4-16 4S8 38 8 35z" fill="#E4A850" stroke="#A8691F" stroke-width="1.4"/>'; break;
   case 'salad': p='<path d="M5 22h38a19 15 0 0 1-38 0z" fill="#FFF8EE" stroke="var(--plate-line)" stroke-width="1.5"/><circle cx="14" cy="21" r="6" fill="#6BB35A"/><circle cx="22" cy="17" r="6.5" fill="#8CCB86"/><circle cx="31" cy="19" r="6" fill="#5FA14B"/><circle cx="37" cy="22" r="4" fill="#8CCB86"/><circle cx="20" cy="22" r="2.4" fill="#D9442A"/><circle cx="29" cy="14.5" r="2.4" fill="#F2C94C"/><circle cx="12" cy="17" r="2" fill="#D9442A"/>'; break;
   case 'fish': p=plate+'<path d="M7 29c5-8 14-10 22-6l8-5v13l-8-3c-8 4-17 3-22 1z" fill="#E98066" stroke="#B94A33" stroke-width="1.5" stroke-linejoin="round"/><circle cx="15" cy="26" r="1.3" fill="#3A1B12"/><path d="M19 29c3 1 6 1 9-1M19 25c3 1 6 1 9-1" stroke="#F7B8A5" stroke-width="1.4" fill="none"/><circle cx="12" cy="36" r="5" fill="#F4D84C" stroke="#C9A41B" stroke-width="1.2"/><path d="M12 31v10M7 36h10" stroke="#C9A41B" stroke-width="1"/>'; break;
   case 'icecream': p='<path d="M16 24l8 20 8-20z" fill="#E9B261" stroke="#A8691F" stroke-width="1.4" stroke-linejoin="round"/><path d="M19 28l3.5 8M24 25l1 18M29 28l-3.5 8" stroke="#C6812F" stroke-width="1.2"/><circle cx="24" cy="18" r="9" fill="'+b+'" stroke="'+a+'" stroke-width="1.5"/><circle cx="24" cy="10.5" r="6.5" fill="#FFF1DC" stroke="#E2CFA8" stroke-width="1.5"/><circle cx="26" cy="5" r="2.2" fill="#C42A2A"/>'; break;
   case 'glass': p='<path d="M13 12h22l-3 29a3 3 0 0 1-3 2.5h-10a3 3 0 0 1-3-2.5z" fill="rgba(255,255,255,.55)" stroke="var(--plate-line)" stroke-width="1.6"/><path d="M15 20h18l-2 20a2 2 0 0 1-2 1.8H19a2 2 0 0 1-2-1.8z" fill="'+b+'" opacity=".9"/><path d="M28 4l-4 22" stroke="'+a+'" stroke-width="2.4" stroke-linecap="round"/><circle cx="36" cy="12" r="5" fill="#F4D84C" stroke="#C9A41B" stroke-width="1.4"/><path d="M36 7v10M31 12h10" stroke="#C9A41B" stroke-width="1"/><circle cx="21" cy="28" r="1.4" fill="#fff"/><circle cx="26" cy="33" r="1.1" fill="#fff"/>'; break;
   default: p=plate+'<circle cx="24" cy="30" r="9" fill="'+b+'"/>';
  }
  return '<svg class="dish-svg" width="'+size+'" height="'+size+'" viewBox="0 0 48 48" aria-hidden="true">'+p+'</svg>';
}

/* ---------- персонажи ---------- */
function avatarSVG(who, mood, size){
  size=size||56; var c=CHARS[who]||CHARS.nar, id='av'+(++_sid), p='';
  if(who==='borsch'){
    return '<svg class="avatar" width="'+size+'" height="'+size+'" viewBox="0 0 64 64" role="img" aria-label="Борщ, кот кафе"><circle cx="32" cy="32" r="31" fill="var(--av-bg)"/><path d="M12 14l8 10M52 14l-8 10" stroke="#C97A22" stroke-width="3" stroke-linecap="round"/><path d="M13 13l11 8-6 6zM51 13l-11 8 6 6z" fill="#E8A23A"/><circle cx="32" cy="36" r="20" fill="#E8A23A"/><path d="M26 18c1 4 0 6-2 8M32 17v8M38 18c-1 4 0 6 2 8" stroke="#C97A22" stroke-width="2.4" stroke-linecap="round" fill="none"/><ellipse cx="32" cy="43" rx="9" ry="7" fill="#FFF1DC"/>'+
     (mood==='angry'?'<path d="M20 31l7 2M44 31l-7 2" stroke="#3A2A18" stroke-width="2.4" stroke-linecap="round"/><circle cx="24" cy="35" r="2.6" fill="#3A2A18"/><circle cx="40" cy="35" r="2.6" fill="#3A2A18"/>':(mood==='happy'?'<path d="M20 35q4-5 8 0M36 35q4-5 8 0" stroke="#3A2A18" stroke-width="2.6" stroke-linecap="round" fill="none"/>':'<ellipse cx="24" cy="35" rx="2.8" ry="3.4" fill="#3A2A18"/><ellipse cx="40" cy="35" rx="2.8" ry="3.4" fill="#3A2A18"/><circle cx="25" cy="34" r="1" fill="#fff"/><circle cx="41" cy="34" r="1" fill="#fff"/>'))+
     '<path d="M29 41h6l-3 3z" fill="#D86A5C"/><path d="M32 44v2M32 46c-2 2-4 1-5 0M32 46c2 2 4 1 5 0" stroke="#3A2A18" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M10 40l10 2M10 46l10-1M54 40l-10 2M54 46l-10-1" stroke="#7A4A2B" stroke-width="1.2" stroke-linecap="round"/></svg>';
  }
  var skin=c.skin||'#F0C9A4', hair=c.hair||'#4A3426', cloth=c.cloth||'#2F7F5A', acc=c.acc||'none';
  p+='<circle cx="32" cy="32" r="31" fill="var(--av-bg)"/>';
  p+='<path d="M8 64c1-12 10-18 24-18s23 6 24 18z" fill="'+cloth+'"/>';
  if(acc==='tie') p+='<path d="M29 47h6l-1.5 12h-3z" fill="#B83A3A"/><path d="M28 46h8l-1.5 3h-5z" fill="#8A2A2A"/>';
  if(acc==='scarf') p+='<path d="M20 47c4 5 20 5 24 0l2 6c-6 5-22 5-28 0z" fill="#C8452B"/><path d="M40 50l3 10-5-2z" fill="#A5341F"/>';
  p+='<rect x="27" y="38" width="10" height="10" rx="3" fill="'+skin+'"/>';
  /* волосы сзади */
  if(who==='lera'||who==='kira'||who==='sonya'||who==='polina'||who==='anna'||who==='olesya'||who==='emma') p+='<path d="M17 30c0-14 8-19 15-19s15 5 15 19v14c-3-2-4-6-4-10H21c0 4-1 8-4 10z" fill="'+hair+'"/>';
  p+='<ellipse cx="32" cy="29" rx="12" ry="13.5" fill="'+skin+'"/>';
  p+='<ellipse cx="20.2" cy="30" rx="2" ry="3" fill="'+skin+'"/><ellipse cx="43.8" cy="30" rx="2" ry="3" fill="'+skin+'"/>';
  /* причёска спереди */
  var longHair=(who==='lera'||who==='kira'||who==='sonya'||who==='polina'||who==='anna'||who==='olesya'||who==='emma');
  if(acc==='toque'){ p+='<path d="M20 20c-4-2-5-8 0-10 2-5 9-6 12-3 3-3 10-2 12 3 5 2 4 8 0 10v4H20z" fill="#FFFFFF" stroke="#E2D6C4" stroke-width="1.4"/><path d="M20 24h24" stroke="#E2D6C4" stroke-width="1.6"/>'; if(who==='arsen') p+='<path d="M21 28c0-3 1-4 1-4M43 28c0-3-1-4-1-4" stroke="'+hair+'" stroke-width="3" stroke-linecap="round"/>'; }
  else if(acc==='cap'){ p+='<path d="M19 24c0-9 6-12 13-12s13 3 13 12z" fill="'+(who==='gleb'?'#556B3A':'#4A6D8C')+'"/><path d="M19 24h30c1 2-2 3-5 3H19z" fill="'+(who==='gleb'?'#3F5229':'#3A566F')+'"/>'; }
  else if(longHair){ p+='<path d="M19 28c-1-11 5-16 13-16s14 5 13 16c-3-6-7-9-13-9s-10 3-13 9z" fill="'+hair+'"/>'; if(acc==='bun') p+='<circle cx="32" cy="9" r="5.2" fill="'+hair+'"/>'; }
  else { p+='<path d="M19.5 27c-1-10 5-15 12.5-15s13.5 5 12.5 15c-1-4-3-7-4-8-3 2-12 2-17 0-1 1-3 4-4 8z" fill="'+hair+'"/>'; if(who==='viktor'||who==='arsen'||who==='artem') p+='<path d="M22 36c2 6 6 8 10 8s8-2 10-8c-1 3-4 5-10 5s-9-2-10-5z" fill="'+hair+'" opacity=".95"/>'; }
  /* лицо */
  var m=mood||'neutral'; var brow=(m==='angry')?'M23 24l6 2M41 24l-6 2':(m==='worried'?'M23 26l6-2M41 26l-6-2':'M23 25h6M35 25h6');
  p+='<path d="'+brow+'" stroke="'+hair+'" stroke-width="2.2" stroke-linecap="round" fill="none"/>';
  p+='<circle cx="26" cy="30" r="2" fill="#2A1A12"/><circle cx="38" cy="30" r="2" fill="#2A1A12"/><circle cx="26.7" cy="29.3" r=".7" fill="#fff"/><circle cx="38.7" cy="29.3" r=".7" fill="#fff"/>';
  p+='<circle cx="22.5" cy="35" r="2.6" fill="#E8826F" opacity=".35"/><circle cx="41.5" cy="35" r="2.6" fill="#E8826F" opacity=".35"/>';
  var mouth=(m==='happy')?'<path d="M26 37q6 6 12 0" fill="#FFF" stroke="#8A2F2F" stroke-width="1.8" stroke-linejoin="round"/>':(m==='angry'?'<path d="M27 40q5-3 10 0" stroke="#8A2F2F" stroke-width="2" fill="none" stroke-linecap="round"/>':(m==='worried'?'<path d="M27 40q5-2.5 10 0" stroke="#8A2F2F" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M45 21q1 3 0 4" stroke="#6BA5D6" stroke-width="2" fill="none" stroke-linecap="round"/>':(m==='smug'?'<path d="M27 38q4 3 9 0q1-1 2-3" stroke="#8A2F2F" stroke-width="2" fill="none" stroke-linecap="round"/>':'<path d="M27 38.5q5 3 10 0" stroke="#8A2F2F" stroke-width="2" fill="none" stroke-linecap="round"/>')));
  p+=mouth;
  if(acc==='glasses') p+='<circle cx="26" cy="30" r="5" fill="rgba(255,255,255,.2)" stroke="#2A1A12" stroke-width="1.8"/><circle cx="38" cy="30" r="5" fill="rgba(255,255,255,.2)" stroke="#2A1A12" stroke-width="1.8"/><path d="M31 30h2" stroke="#2A1A12" stroke-width="1.8"/>';
  if(acc==='phone') p+='<rect x="47" y="38" width="9" height="15" rx="2" fill="#2A2F3A" transform="rotate(14 51 45)"/><rect x="48.5" y="40" width="6" height="10" rx="1" fill="#6BA5D6" transform="rotate(14 51 45)"/>';
  return '<svg class="avatar" width="'+size+'" height="'+size+'" viewBox="0 0 64 64" role="img" aria-label="'+esc(c.name)+'">'+p+'</svg>';
}

/* ---------- силуэты городов за кафе ---------- */
function skylineG(id, fill){
  var f='fill="'+fill+'"';
  switch(id){
   case 'tula': return '<g '+f+'><rect x="10" y="132" width="340" height="40"/><rect x="36" y="100" width="22" height="40"/><path d="M36 100l11-14 11 14z"/><rect x="80" y="112" width="40" height="28"/><rect x="124" y="92" width="18" height="48"/><path d="M124 92l9-12 9 12z"/><circle cx="133" cy="76" r="4"/><rect x="200" y="106" width="48" height="34"/><path d="M200 106h48l-6-12h-36z"/><rect x="268" y="96" width="16" height="44"/><path d="M268 96l8-10 8 10z"/><rect x="300" y="118" width="40" height="22"/></g>';
   case 'nnov': return '<g '+f+'><rect x="0" y="136" width="360" height="34"/><rect x="30" y="94" width="20" height="46"/><path d="M26 94h28l-14-16z"/><rect x="72" y="108" width="52" height="32"/><rect x="82" y="86" width="18" height="24"/><path d="M80 86h22l-11-14z"/><rect x="150" y="100" width="22" height="40"/><path d="M148 100h26l-13-18z"/><rect x="220" y="110" width="60" height="30"/><rect x="236" y="88" width="16" height="24"/><path d="M234 88h20l-10-14z"/><rect x="300" y="116" width="40" height="24"/></g>';
   case 'kazan': return '<g '+f+'><rect x="0" y="136" width="360" height="34"/><rect x="48" y="96" width="9" height="44"/><path d="M45 96h15l-7.5-18z"/><rect x="72" y="96" width="9" height="44"/><path d="M69 96h15l-7.5-18z"/><path d="M40 140v-26c0-12 12-18 24-18s24 6 24 18v26z"/><circle cx="64" cy="84" r="7"/><rect x="160" y="108" width="50" height="32"/><rect x="226" y="98" width="28" height="42"/><path d="M226 98h28l-14-12z"/><rect x="274" y="112" width="56" height="28"/><rect x="294" y="92" width="8" height="22"/><path d="M291 92h14l-7-14z"/></g>';
   case 'spb': return '<g '+f+'><rect x="0" y="138" width="360" height="32"/><rect x="26" y="112" width="70" height="28"/><rect x="52" y="96" width="18" height="18"/><path d="M52 96h18l-9-12z"/><rect x="60" y="64" width="3" height="32"/><path d="M61.5 52l4 14h-8z"/><rect x="118" y="104" width="30" height="36"/><path d="M118 104l15-16 15 16z"/><rect x="170" y="116" width="70" height="24"/><path d="M180 116c0-12 8-18 25-18s25 6 25 18z"/><rect x="256" y="106" width="28" height="34"/><rect x="298" y="118" width="46" height="22"/></g>';
   case 'ekb': return '<g '+f+'><rect x="0" y="138" width="360" height="32"/><rect x="26" y="92" width="22" height="48"/><rect x="58" y="70" width="26" height="70"/><rect x="94" y="104" width="30" height="36"/><rect x="146" y="60" width="30" height="80"/><rect x="152" y="46" width="18" height="16"/><path d="M152 46h18l-9-12z"/><rect x="198" y="96" width="28" height="44"/><rect x="236" y="112" width="40" height="28"/><rect x="288" y="82" width="26" height="58"/><rect x="320" y="106" width="24" height="34"/></g>';
   case 'sochi': return '<g '+f+'><path d="M0 138V90l36-26 28 22 34-34 40 38 36-18 42 24 46-20 38 22v38z"/><rect x="0" y="140" width="360" height="30"/><path d="M24 140c0-18 3-30 6-40M30 100c-8 0-14 4-18 10M30 100c8-2 14 0 20 6M30 100c-3-7-9-10-14-10M30 100c4-7 10-10 16-8" stroke="'+fill+'" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M322 140c0-18-3-30-6-40M316 100c8 0 14 4 18 10M316 100c-8-2-14 0-20 6M316 100c3-7 9-10 14-10M316 100c-4-7-10-10-16-8" stroke="'+fill+'" stroke-width="3" fill="none" stroke-linecap="round"/></g>';
   case 'kgd': return '<g '+f+'><rect x="0" y="138" width="360" height="32"/><rect x="40" y="100" width="18" height="40"/><path d="M38 100h22l-11-24z"/><rect x="72" y="106" width="18" height="34"/><path d="M70 106h22l-11-22z"/><rect x="56" y="112" width="24" height="28"/><rect x="130" y="112" width="60" height="28"/><path d="M130 112l30-18 30 18z"/><rect x="214" y="90" width="26" height="50"/><path d="M214 90l13-18 13 18z"/><rect x="262" y="108" width="38" height="32"/><path d="M262 108h38l-6-10h-26z"/></g>';
   case 'msk': return '<g '+f+'><rect x="0" y="138" width="360" height="32"/><rect x="20" y="106" width="46" height="34"/><circle cx="43" cy="98" r="9"/><rect x="40" y="82" width="6" height="12"/><path d="M36 96c0-10 3-18 7-18s7 8 7 18z"/><rect x="76" y="112" width="30" height="28"/><path d="M80 112c0-14 4-22 11-22s11 8 11 22z"/><rect x="130" y="90" width="24" height="50"/><rect x="136" y="70" width="12" height="22"/><path d="M134 70h16l-8-20z"/><rect x="176" y="100" width="40" height="40"/><rect x="236" y="62" width="30" height="78"/><rect x="242" y="48" width="18" height="16"/><path d="M242 48h18l-9-14z"/><rect x="286" y="104" width="50" height="36"/></g>';
  }
  return '';
}
var SKY = {
  spring:['#BDE1F2','#FFF1D0'], summer:['#8EC9EE','#FFE9B8'], autumn:['#F3C98B','#FFE7C2'], winter:['#C6D6EA','#F1F5FA']
};
function seasonOfCal(cal){ return (cal>=2&&cal<=4)?'spring':((cal>=5&&cal<=7)?'summer':((cal>=8&&cal<=10)?'autumn':'winter')); }

/* ---------- «Живое кафе»: фасад меняется вместе с заведением ---------- */
function cafeSVG(o, ctx){
  ctx=ctx||{}; var city=CITIES[o.city], cal=ctx.cal==null?2:ctx.cal, season=seasonOfCal(cal), sk=SKY[season];
  var rest=o.fmt==='rest', fran=o.fmt==='fran', building=!!o.built, deco=(o.eq&&o.eq.deco3?3:(o.eq&&o.eq.deco2?2:(o.eq&&o.eq.deco1?1:0)));
  var guests=ctx.guests==null?3:ctx.guests, id='cs'+(++_sid), star=clamp(Math.round(stars(o.rep||40)),1,5);
  var wall=rest?'#D9A56C':(fran?'#C98A5A':'#E7B27A'), wallD=rest?'#B88049':'#C58F58', roof=rest?'#7B3F2B':'#9A4A2C';
  var out='<svg class="cafe-svg" viewBox="0 0 360 220" role="img" aria-label="Фасад: '+esc(o.nm||'кафе')+', город '+esc(city.n)+'" preserveAspectRatio="xMidYMid slice">';
  out+='<defs><linearGradient id="'+id+'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+sk[0]+'"/><stop offset="1" stop-color="'+sk[1]+'"/></linearGradient><linearGradient id="'+id+'w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE9A8"/><stop offset="1" stop-color="#F7C65E"/></linearGradient></defs>';
  out+='<rect width="360" height="220" fill="url(#'+id+'g)"/>';
  if(season==='summer') out+='<circle cx="318" cy="38" r="16" fill="#FFD25A"/><circle cx="318" cy="38" r="22" fill="#FFD25A" opacity=".25"/>';
  else if(season==='winter') out+='<g class="snow" fill="#fff" opacity=".9"><circle cx="40" cy="30" r="2"/><circle cx="110" cy="56" r="2.4"/><circle cx="200" cy="24" r="2"/><circle cx="270" cy="52" r="2.4"/><circle cx="330" cy="26" r="2"/><circle cx="160" cy="76" r="1.8"/></g>';
  else out+='<g fill="#fff" opacity=".8"><ellipse cx="70" cy="40" rx="26" ry="8"/><ellipse cx="86" cy="34" rx="16" ry="7"/><ellipse cx="250" cy="52" rx="28" ry="8"/></g>';
  out+='<g opacity=".38">'+skylineG(city.sky, season==='winter'?'#7D8DA6':'#6C7A8C')+'</g>';
  out+='<rect y="168" width="360" height="52" fill="'+(season==='winter'?'#E6EDF5':'#CFC3AF')+'"/><rect y="168" width="360" height="5" fill="'+(season==='winter'?'#C9D5E3':'#B9AB93')+'"/>';
  if(building){
    out+='<rect x="60" y="86" width="240" height="84" fill="#EADBC4" stroke="#B9A98F" stroke-width="2"/><path d="M60 86l120-34 120 34z" fill="#D2BFA0"/><rect x="120" y="120" width="120" height="50" fill="#F4EBDC" stroke="#B9A98F" stroke-width="2"/><g stroke="#8A7A63" stroke-width="3"><path d="M72 170L110 70M300 170L262 70M72 100h226"/></g><rect x="130" y="104" width="100" height="20" rx="6" fill="#B9A98F"/><text x="180" y="119" text-anchor="middle" font-size="12" font-weight="800" fill="#FFF" font-family="Nunito,sans-serif">Скоро открытие</text></svg>';
    return out;
  }
  var bx=rest?46:70, bw=rest?268:220, by=rest?72:96, bh=170-by;
  /* здание */
  out+='<rect x="'+bx+'" y="'+by+'" width="'+bw+'" height="'+bh+'" fill="'+wall+'" stroke="'+wallD+'" stroke-width="2"/>';
  out+='<path d="M'+(bx-8)+' '+by+'h'+(bw+16)+'l-10 -18h-'+(bw-4)+'z" fill="'+roof+'"/>';
  if(rest){ out+='<g fill="#F3DDB8" stroke="'+wallD+'" stroke-width="1.5"><rect x="'+(bx+8)+'" y="'+(by+8)+'" width="10" height="'+(bh-8)+'"/><rect x="'+(bx+bw-18)+'" y="'+(by+8)+'" width="10" height="'+(bh-8)+'"/></g>'; out+='<rect x="'+(bx+30)+'" y="'+(by+6)+'" width="'+(bw-60)+'" height="26" rx="6" fill="#3B2A22" stroke="#C9A25A" stroke-width="2"/>'; }
  /* окно с гостями */
  var wx=bx+(rest?36:24), ww=bw-(rest?72:48), wy=by+(rest?44:34), wh=rest?64:56;
  out+='<rect x="'+wx+'" y="'+wy+'" width="'+(ww-70)+'" height="'+wh+'" rx="6" fill="url(#'+id+'w)" stroke="'+wallD+'" stroke-width="3"/>';
  var gx=wx+10, nG=clamp(Math.round(guests),0,7);
  for(var i=0;i<nG;i++){ var px=gx+ i*((ww-90)/7), hc=['#5A3320','#2B2420','#C23A63','#7A4A2B','#D79A4C','#3C3C3C','#8A4B2A'][i]; out+='<g class="guest" style="--i:'+i+'"><circle cx="'+(px+8)+'" cy="'+(wy+wh-26)+'" r="6" fill="#EDBF9C"/><path d="M'+(px+1)+' '+(wy+wh-27)+'a7 7 0 0 1 14 0z" fill="'+hc+'"/><rect x="'+(px)+'" y="'+(wy+wh-20)+'" width="16" height="16" rx="5" fill="'+['#3F6FB5','#C8452B','#2F7F5A','#8E5A7A','#E4B02B','#4A6D8C','#B83A6B'][i]+'"/></g>'; }
  out+='<rect x="'+(wx+4)+'" y="'+(wy+wh-8)+'" width="'+(ww-78)+'" height="4" rx="2" fill="#7B4A2B"/>';
  if(o.eq&&o.eq.music) out+='<g stroke="#7B4A2B" stroke-width="1.6" fill="none"><path d="M'+(wx+ww-86)+' '+(wy+10)+'q4 -4 8 0M'+(wx+ww-94)+' '+(wy+18)+'q8 -8 16 0"/></g>';
  /* дверь */
  var dx=bx+bw-(rest?110:80), dw=44;
  out+='<rect x="'+dx+'" y="'+(by+(rest?44:34))+'" width="'+dw+'" height="'+(170-by-(rest?44:34))+'" rx="5" fill="#8A4B2A" stroke="#5E3119" stroke-width="2.4"/><rect x="'+(dx+6)+'" y="'+(by+(rest?50:40))+'" width="'+(dw-12)+'" height="22" rx="3" fill="url(#'+id+'w)" stroke="#5E3119" stroke-width="1.6"/><circle cx="'+(dx+dw-9)+'" cy="'+(by+(rest?96:86))+'" r="2.4" fill="#F2C94C"/>';
  /* навес */
  var ay=by+(rest?36:24)-18;
  var stripes=''; var n=Math.round((bw+10)/18), sw=(bw+10)/n; for(var k=0;k<n;k++) stripes+='<path d="M'+(bx-5+k*sw)+' '+ay+'h'+sw+'v16a'+(sw/2)+' '+(sw/2)+' 0 0 1 -'+sw+' 0z" fill="'+(k%2?'#FFF6E6':'var(--brand)')+'"/>';
  out+='<g class="awning">'+stripes+'<rect x="'+(bx-5)+'" y="'+(ay-4)+'" width="'+(bw+10)+'" height="6" rx="2" fill="#7A2A18"/></g>';
  /* вывеска */
  if(!rest) out+='<rect x="'+(bx+bw/2-62)+'" y="'+(by-12)+'" width="124" height="22" rx="7" fill="#3B2A22" stroke="#C9A25A" stroke-width="2"/>';
  var nm=(o.nm||'Первый столик'); if(nm.length>22) nm=nm.slice(0,21)+'…';
 var fsz=Math.max(7,Math.min(rest?13:11.5,(rest?190:112)/(nm.length*0.58)));
  out+='<text x="'+(bx+bw/2)+'" y="'+(rest?by+24:by+4)+'" text-anchor="middle" font-size="'+fsz.toFixed(1)+'" font-weight="800" fill="#FFE6A8" font-family="Playfair Display,Georgia,serif">'+esc(nm)+'</text>';
  /* звёзды над крышей */
  out+='<g transform="translate('+(bx+bw/2-40)+' '+(by-34)+')">'; for(var s=0;s<5;s++) out+='<path transform="translate('+(s*16)+' 0) scale(.66)" d="'+ICONS.star+'" fill="'+(s<star?'#F2B233':'rgba(255,255,255,.55)')+'" stroke="#B9791A" stroke-width="1.6" stroke-linejoin="round"/>'; out+='</g>';
  /* дымок */
  out+='<g class="chimney"><rect x="'+(bx+bw-40)+'" y="'+(by-34)+'" width="14" height="22" fill="#8A4B2A"/><path class="smoke" d="M'+(bx+bw-33)+' '+(by-38)+'c-6-8 6-10 0-18" fill="none" stroke="rgba(255,255,255,.8)" stroke-width="4" stroke-linecap="round"/></g>';
  /* гирлянда / украшения */
  if(deco>=2||(o.eq&&o.eq.music)){ var gl=''; for(var q=0;q<10;q++){ var gxp=bx+10+q*(bw-20)/9; gl+='<circle class="bulb" style="--i:'+q+'" cx="'+gxp+'" cy="'+(ay+22+((q%2)*3))+'" r="2.4" fill="'+['#FFD25A','#FF8A5C','#8CCB86','#6BB8E8'][q%4]+'"/>'; } out+='<path d="M'+(bx+8)+' '+(ay+20)+'q'+(bw/2)+' 12 '+(bw-16)+' 0" stroke="#5E3119" stroke-width="1" fill="none"/>'+gl; }
  /* цветы и кот */
  out+='<g><rect x="'+(bx+4)+'" y="154" width="18" height="14" rx="3" fill="#B0542E"/><circle cx="'+(bx+10)+'" cy="150" r="5" fill="#C42A3A"/><circle cx="'+(bx+17)+'" cy="148" r="5" fill="#F2B233"/><circle cx="'+(bx+13)+'" cy="143" r="5" fill="#E8826F"/></g>';
  out+='<g class="cat" transform="translate('+(wx+4)+' '+(wy+wh-34)+')"><path d="M0 18c0-8 6-12 12-12s12 4 12 12v2H0z" fill="#E8A23A"/><circle cx="12" cy="6" r="6" fill="#E8A23A"/><path d="M7 2l-2-4 5 2zM17 2l2-4-5 2z" fill="#E8A23A"/><circle cx="10" cy="5.5" r=".9" fill="#2A1A12"/><circle cx="14" cy="5.5" r=".9" fill="#2A1A12"/></g>';
  /* терраса */
  if(o.eq&&o.eq.terr&&cal>=4&&cal<=8){ out+='<g><ellipse cx="'+(bx+bw+26)+'" cy="164" rx="22" ry="5" fill="rgba(0,0,0,.14)"/><circle cx="'+(bx+bw+26)+'" cy="154" r="14" fill="#FFF6E6" stroke="#B0542E" stroke-width="2"/><path d="M'+(bx+bw+26)+' 154v12" stroke="#7B4A2B" stroke-width="3"/><path d="M'+(bx+bw+4)+' 140h44l-22-18z" fill="var(--brand)" opacity=".92"/></g>'; }
  /* детская зона */
  if(o.eq&&o.eq.kids) out+='<g><rect x="'+(bx+30)+'" y="152" width="14" height="16" rx="3" fill="#6BB8E8"/><circle cx="'+(bx+37)+'" cy="148" r="6" fill="#F2B233"/></g>';
  /* очередь у двери */
  if(ctx.queue){ for(var w=0;w<clamp(ctx.queue,1,4);w++) out+='<g><circle cx="'+(dx+20+w*14)+'" cy="'+(160)+'" r="5" fill="#EDBF9C"/><rect x="'+(dx+15+w*14)+'" y="164" width="10" height="14" rx="4" fill="'+['#3F6FB5','#C8452B','#2F7F5A','#8E5A7A'][w%4]+'"/></g>'; }
  /* франшиза: табличка */
  if(fran) out+='<rect x="'+(bx+bw/2-26)+'" y="'+(by+bh-18)+'" width="52" height="14" rx="3" fill="#FFF6E6" stroke="#B0542E"/><text x="'+(bx+bw/2)+'" y="'+(by+bh-8)+'" text-anchor="middle" font-size="8" font-weight="800" fill="#B0542E" font-family="Nunito,sans-serif">ФРАНШИЗА</text>';
  return out+'</svg>';
}

/* ---------- карта Тамары ---------- */
function mapSVG(s, sel){
  var out='<svg class="map-svg" viewBox="0 0 380 250" role="img" aria-label="Карта Тамары с городами"><defs><pattern id="mp" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="var(--map-dot)"/></pattern></defs>';
  out+='<rect width="380" height="250" rx="18" fill="var(--map-sea)"/>';
  out+='<path d="M18 92c6-20 22-34 44-40 14-24 38-36 66-34 20-6 44-4 62 4 34-8 74-4 100 14 36 6 62 28 70 62-8 26-6 50-24 72-26 8-40-2-62 8-26 14-48 22-86 10-20 8-48 6-66-2-18-10-30-26-52-30-20-8-48-16-52-64z" fill="var(--map-land)" stroke="var(--map-edge)" stroke-width="2.4" stroke-linejoin="round"/>';
  out+='<path d="M18 92c6-20 22-34 44-40 14-24 38-36 66-34 20-6 44-4 62 4 34-8 74-4 100 14 36 6 62 28 70 62-8 26-6 50-24 72-26 8-40-2-62 8-26 14-48 22-86 10-20 8-48 6-66-2-18-10-30-26-52-30-20-8-48-16-52-64z" fill="url(#mp)"/>';
  out+='<ellipse cx="150" cy="232" rx="60" ry="14" fill="var(--map-sea)"/><path d="M0 128c10-4 20-4 24 2" stroke="var(--map-edge)" stroke-width="1.5" fill="none" stroke-dasharray="3 4"/>';
  var route=['tula','nnov','kazan','ekb'], d='';
  route.forEach(function(k,i){ var c=CITIES[k]; d+=(i?'L':'M')+c.x+' '+c.y; });
  out+='<path d="'+d+'" stroke="var(--brand)" stroke-width="2.4" stroke-dasharray="2 6" stroke-linecap="round" fill="none" opacity=".75"/>';
  out+='<path d="M'+CITIES.tula.x+' '+CITIES.tula.y+'L'+CITIES.sochi.x+' '+CITIES.sochi.y+'M'+CITIES.tula.x+' '+CITIES.tula.y+'L'+CITIES.spb.x+' '+CITIES.spb.y+'M'+CITIES.spb.x+' '+CITIES.spb.y+'L'+CITIES.kgd.x+' '+CITIES.kgd.y+'" stroke="var(--brand)" stroke-width="2.4" stroke-dasharray="2 6" stroke-linecap="round" fill="none" opacity=".75"/>';
  CITY_IDS.forEach(function(k){
    var c=CITIES[k], o=s?s.outlets.filter(function(x){ return x.city===k; })[0]:null, st='free';
    if(o) st=o.fmt==='fran'?(o.built?'fb':'fran'):(o.built?'build':'own'); else if(s){ var ch=cityOpenable(s,k); if(!ch.ok) st=(s.month<c.min)?'lock':'free'; }
    var isSel=sel===k, r=isSel?11:9;
    out+='<g class="pin '+st+(isSel?' sel':'')+'" role="button" tabindex="0" data-act="mapcity" data-city="'+k+'" aria-label="'+esc(c.n)+(st==='own'?', открыто':(st==='lock'?', пока закрыто':''))+'"><circle class="hit" cx="'+c.x+'" cy="'+c.y+'" r="24" fill="transparent"/>';
    out+='<circle class="halo" cx="'+c.x+'" cy="'+c.y+'" r="'+(r+5)+'" fill="'+(st==='own'?'var(--brand)':'var(--ink)')+'" opacity=".14"/>';
    out+='<circle class="dot" cx="'+c.x+'" cy="'+c.y+'" r="'+r+'" fill="'+(st==='own'?'var(--brand)':(st==='build'||st==='fb'?'var(--mustard)':(st==='fran'?'var(--basil)':(st==='lock'?'var(--map-lock)':'var(--surface)'))))+'" stroke="'+(st==='lock'?'var(--map-lock-line)':'var(--ink)')+'" stroke-width="2.2"/>';
    if(st==='own') out+='<path d="M'+(c.x-4)+' '+c.y+'l3 3 5-6" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
    else if(st==='build'||st==='fb') out+='<path d="M'+(c.x-3)+' '+(c.y-4)+'h6l-3 4 3 4h-6l3-4z" fill="var(--ink)"/>';
    else if(st==='fran') out+='<path d="M'+c.x+' '+(c.y-5)+'l5 5-5 5-5-5z" fill="#fff"/>';
    else if(st==='lock') out+='<rect x="'+(c.x-3.4)+'" y="'+(c.y-1)+'" width="6.8" height="5" rx="1" fill="var(--map-lock-line)"/><path d="M'+(c.x-2.2)+' '+(c.y-1)+'v-2a2.2 2.2 0 0 1 4.4 0v2" stroke="var(--map-lock-line)" stroke-width="1.4" fill="none"/>';
    var LB={msk:[-13,-9,'end'],nnov:[2,-15,'middle'],sochi:[0,-16,'middle'],kgd:[-6,25,'start'],spb:[0,24,'middle'],tula:[0,24,'middle'],kazan:[0,24,'middle'],ekb:[0,24,'middle']}[k]||[0,23,'middle'], lx=c.x+LB[0], ly=c.y+LB[1], anchor=LB[2];
    out+='<text class="plabel" x="'+lx+'" y="'+ly+'" text-anchor="'+anchor+'" font-size="11" font-weight="800">'+esc(c.n.replace('Санкт-Петербург','Петербург').replace('Нижний Новгород','Н. Новгород'))+'</text></g>';
  });
  return out+'</svg>';
}

/* иллюстрации для пролога */
function introArt(k){
  var base='<svg class="intro-art" viewBox="0 0 320 180" aria-hidden="true">';
  if(k==='letter') return base+'<rect width="320" height="180" rx="16" fill="var(--surface-2)"/><rect x="70" y="40" width="180" height="110" rx="8" fill="#FFF8EA" stroke="var(--edge-strong)" stroke-width="2"/><path d="M70 46l90 62 90-62" fill="none" stroke="var(--edge-strong)" stroke-width="2"/><circle cx="160" cy="108" r="14" fill="var(--brand)"/><text x="160" y="113" text-anchor="middle" font-size="14" font-weight="800" fill="#fff" font-family="Playfair Display,serif">Т</text><path d="M232 30c10-10 28-4 24 10" stroke="var(--brand)" stroke-width="3" fill="none" stroke-linecap="round"/></svg>';
  if(k==='box') return base+'<rect width="320" height="180" rx="16" fill="var(--surface-2)"/><rect x="84" y="70" width="152" height="80" rx="10" fill="#D8A24A" stroke="#8A5A1C" stroke-width="3"/><rect x="84" y="56" width="152" height="24" rx="8" fill="#E8B761" stroke="#8A5A1C" stroke-width="3"/><circle cx="160" cy="108" r="22" fill="#FFF3D6" stroke="#8A5A1C" stroke-width="2"/><text x="160" y="115" text-anchor="middle" font-size="20" font-weight="800" fill="#8A5A1C" font-family="Playfair Display,serif">₽</text><path d="M110 100h20M190 100h20" stroke="#8A5A1C" stroke-width="2" stroke-linecap="round"/></svg>';
  if(k==='book') return base+'<rect width="320" height="180" rx="16" fill="var(--surface-2)"/><path d="M80 40h70a10 10 0 0 1 10 10v94a10 10 0 0 0-10-10H80z" fill="#FFF8EA" stroke="#8A5A1C" stroke-width="2.4"/><path d="M240 40h-70a10 10 0 0 0-10 10v94a10 10 0 0 1 10-10h70z" fill="#FFF8EA" stroke="#8A5A1C" stroke-width="2.4"/><path d="M96 62h50M96 78h42M96 94h48M96 110h30" stroke="#C9A97C" stroke-width="3" stroke-linecap="round"/><circle cx="200" cy="70" r="6" fill="var(--brand)"/><circle cx="228" cy="104" r="6" fill="var(--brand)"/><circle cx="188" cy="118" r="6" fill="var(--brand)"/><path d="M200 70L228 104L188 118" stroke="var(--brand)" stroke-width="2" stroke-dasharray="2 5" fill="none" stroke-linecap="round"/></svg>';
  if(k==='train') return base+'<rect width="320" height="180" rx="16" fill="var(--surface-2)"/><rect x="0" y="130" width="320" height="50" fill="#C9BCA3"/><path d="M0 140h320" stroke="#8A7A63" stroke-width="3"/><rect x="40" y="70" width="240" height="62" rx="10" fill="#B5362A"/><rect x="40" y="108" width="240" height="8" fill="#F2B233"/><g fill="#FFE9A8" stroke="#6B1E15" stroke-width="2"><rect x="58" y="82" width="34" height="22" rx="4"/><rect x="104" y="82" width="34" height="22" rx="4"/><rect x="150" y="82" width="34" height="22" rx="4"/><rect x="196" y="82" width="34" height="22" rx="4"/><rect x="242" y="82" width="26" height="22" rx="4"/></g><circle cx="80" cy="138" r="9" fill="#2B1810"/><circle cx="240" cy="138" r="9" fill="#2B1810"/><text x="160" y="58" text-anchor="middle" font-size="14" font-weight="800" fill="var(--ink)" font-family="Playfair Display,serif">Вагон-ресторан</text></svg>';
  return base+'</svg>';
}
