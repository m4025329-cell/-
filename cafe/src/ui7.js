/* ===== Интерфейс, часть 7: телефон и установка: вибрация, жесты, «Назад», установка как приложение ===== */
var deferredInstall=null, isStandalone=false, holdT=0, holdIv=0, holdFired=false, holdAt=0;
function vib(p){ if(!vibOn) return; try{ if(navigator.vibrate) navigator.vibrate(p); }catch(e){} }
function detectStandalone(){ try{ return !!((window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||window.navigator.standalone===true); }catch(e){ return false; } }
function isIOS(){ var ua=navigator.userAgent||''; return /iPad|iPhone|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1); }
function isNativeApp(){ return /; wv\)/i.test(navigator.userAgent||'')||location.hostname==='appassets.androidplatform.net'; }
function isFramed(){ try{ return window.top!==window.self; }catch(e){ return true; } }
function canShowInstall(){ return !isStandalone&&!isNativeApp()&&!isFramed()&&(!!deferredInstall||isIOS()); }
function instCardHTML(){
  if(!canShowInstall()) return '';
  return '<div class="instcard"><span class="ico">'+ico('phone')+'</span><div><b>Установите игру как приложение</b><small>Значок на экране, полный экран, работает без интернета</small></div><button class="btn small" data-act="install">'+ico('down','sm')+' Установить</button></div>';
}
function installHelpHTML(){
  var ios=isIOS(), https=(location.protocol==='https:'||location.hostname==='localhost');
  var h='<p class="small muted">Игра работает как обычное приложение: свой значок, полный экран без адресной строки, сохранение прогресса и работа без интернета.</p>';
  if(isStandalone) return h+'<div class="insight good"><span class="ico">'+ico('check')+'</span><div><b>Игра уже установлена</b><p>Вы запустили её как приложение.</p></div></div>';
  if(!https) h+='<div class="insight warn"><span class="ico">'+ico('warn')+'</span><div><b>Нужна ссылка https</b><p>Установка работает, когда игра открыта по защищённой ссылке (адрес начинается с https). Если вы открыли файл с компьютера, попросите учителя дать ссылку.</p></div></div>';
  h+='<div class="terms"><div class="termc"><b>Телефон на Android (Chrome)</b><span>Нажмите три точки справа вверху → «Установить приложение» или «Добавить на главный экран». Подтвердите. Значок появится среди приложений.</span></div>'+
     '<div class="termc"><b>iPhone и iPad (Safari)</b><span>Нажмите «Поделиться» (квадрат со стрелкой) → «На экран «Домой»» → «Добавить». Открывайте игру только в Safari: в других браузерах этого пункта нет.</span></div>'+
     '<div class="termc"><b>Компьютер (Chrome или Edge)</b><span>Справа в адресной строке появится значок установки. Нажмите «Установить». Игра откроется в своём окне.</span></div></div>';
  if(deferredInstall) h+='<div class="row" style="margin-top:12px"><button class="btn" data-act="installgo">'+ico('down')+' Установить сейчас</button></div>';
  return h;
}
A.install=function(){ if(deferredInstall){ A.installgo(); return; } closeModal(); openModal('Установка как приложение',installHelpHTML()); };
A.installhelp=function(){ closeModal(); openModal('Установка как приложение',installHelpHTML()); };
A.installgo=function(){
  var d=deferredInstall; if(!d){ return; } closeModal();
  try{ d.prompt(); d.userChoice.then(function(c){ deferredInstall=null; if(c&&c.outcome==='accepted') toast('Готово! Ищите значок игры на экране'); if(U.screen==='title') render(true); }); }catch(e){ deferredInstall=null; }
};
A.about=function(){
  openModal('Об игре','<p class="small muted">«Первый столик»: экономическая игра для 8–9 классов. Версия '+APP_VERSION+'. Рассчитана на два урока: 16 игровых месяцев, по 8 на урок.</p><div class="terms"><div class="termc"><b>Чему учит</b><span>Выручка, себестоимость и прибыль; наценка и маржа; фуд-кост и прайм-кост; постоянные и переменные расходы; точка безубыточности; эластичность спроса; предельный анализ; три финансовых отчёта; кредит, инвестор и цена денег; ключевая ставка и инфляция; налоги на бизнес и на труд; окупаемость вложений.</span></div><div class="termc"><b>Как это проверяется</b><span>Проверки Арсена после 4, 8, 12 и 16 месяцев, в том числе вопросы с числами из вашей партии. В меню есть «Отчёт и рабочий лист»: печатная страница с цифрами партии и заданиями для учителя.</span></div><div class="termc"><b>Данные</b><span>Игра ничего не отправляет и не собирает. Прогресс хранится только на вашем устройстве. Регистрации и рекламы нет, интернет не нужен.</span></div><div class="termc"><b>Условности</b><span>Игра — учебная модель. Числа и ставки подобраны для обучения и упрощены. Подробнее о том, что упрощено, в методичке для учителя.</span></div></div>');
};
A.togglevib=function(){ vibOn=!vibOn; lsSet(VIB_KEY,vibOn?'1':'0'); if(vibOn) vib(25); A.menu(); };

/* ---------- жесты и устройство ---------- */
function stopHold(){ clearTimeout(holdT); clearInterval(holdIv); holdT=0; holdIv=0; }
var HOLD_ACTS={pdec:1,pinc:1,lpdec:1,lpinc:1,stockdec:1,stockinc:1};
function swipeTab(dir){
  var tabs=allTabs().map(function(t){ return t.id; }), i=tabs.indexOf(U.tab||'home'), j=i+dir; if(i<0||j<0||j>=tabs.length) return;
  vib(8); A.tab({getAttribute:function(){ return tabs[j]; }});
}
function initDevice(){
  vibOn=lsGet(VIB_KEY)!=='0'; isStandalone=detectStandalone();
  /* установка */
  window.addEventListener('beforeinstallprompt',function(e){ e.preventDefault(); deferredInstall=e; if(U.screen==='title') render(true); });
  window.addEventListener('appinstalled',function(){ deferredInstall=null; isStandalone=true; toast('Игра установлена'); if(U.screen==='title') render(true); });
  try{ var mq=matchMedia('(display-mode: standalone)'); (mq.addEventListener?mq.addEventListener.bind(mq,'change'):mq.addListener.bind(mq))(function(){ isStandalone=detectStandalone(); }); }catch(e){}
  /* вибрация на каждое нажатие кнопки */
  document.addEventListener('click',function(ev){
    if(holdFired&&Date.now()-holdAt<500){ ev.stopPropagation(); ev.preventDefault(); holdFired=false; return; }
    var el=ev.target.closest&&ev.target.closest('button,[data-act],.pin'); if(el&&!el.disabled) vib(7);
  },true);
  /* удержание на «плюс» и «минус» ускоряет изменение */
  document.addEventListener('pointerdown',function(ev){
    if(ev.button>0) return; var el=ev.target.closest&&ev.target.closest('.stepper button'); if(!el||el.disabled) return;
    var act=el.getAttribute('data-act'); if(!HOLD_ACTS[act]) return; var d=el.getAttribute('data-d'); stopHold(); holdFired=false;
    var fake={getAttribute:function(k){ return k==='data-act'?act:(k==='data-d'?d:null); }};
    holdT=setTimeout(function(){ var n=0; holdFired=true; holdAt=Date.now(); holdIv=setInterval(function(){ n++; holdAt=Date.now(); try{ A[act](fake); }catch(e){ stopHold(); } if(n>10 && n%2===0){ try{ A[act](fake); }catch(e){} } },110); },420);
  });
  ['pointerup','pointercancel','pointerleave'].forEach(function(t){ document.addEventListener(t,function(){ if(holdT||holdIv){ stopHold(); holdAt=Date.now(); } }); });
  document.addEventListener('contextmenu',function(ev){ if(ev.target.closest&&ev.target.closest('.stepper,.toggle,.tab,.btn,.segopt,.msub,.outsel')) ev.preventDefault(); });
  /* свайп между вкладками */
  var sx=0, sy=0, st=0, sw=false;
  document.addEventListener('touchstart',function(e){
    sw=false; if(e.touches.length!==1||!S||U.screen!=='plan'||U.sheetOpen||$('#modal .modal')) return;
    var t=e.target; if(t.closest&&t.closest('.outsel,.tblwrap,.sh-ov,input,textarea,select,.msub,.range,.tabbar,.actionbar,.hud')) return;
    var x=e.touches[0].clientX; if(x<24||x>innerWidth-24) return;
    sx=x; sy=e.touches[0].clientY; st=Date.now(); sw=true;
  },{passive:true});
  document.addEventListener('touchend',function(e){
    if(!sw) return; sw=false; var t=e.changedTouches[0], dx=t.clientX-sx, dy=t.clientY-sy;
    if(Math.abs(dx)>80&&Math.abs(dx)>Math.abs(dy)*2.2&&Date.now()-st<600) swipeTab(dx<0?1:-1);
  },{passive:true});
  /* шторка закрывается свайпом вниз за ручку */
  (function(){ var box=null, y0=0, dy=0, on=false;
    document.addEventListener('touchstart',function(e){ var h=e.target.closest&&e.target.closest('.modal-head'); if(!h) return; box=h.closest('.modal-box'); if(!box) return; y0=e.touches[0].clientY; dy=0; on=true; box.classList.add('drag'); },{passive:true});
    document.addEventListener('touchmove',function(e){ if(!on||!box) return; dy=Math.max(0,e.touches[0].clientY-y0); box.style.transform='translateY('+dy+'px)'; if(dy>4&&e.cancelable) e.preventDefault(); },{passive:false});
    document.addEventListener('touchend',function(){ if(!on||!box) return; on=false; box.classList.remove('drag'); if(dy>90){ closeModal(); } else { box.classList.add('snap'); box.style.transform=''; var b=box; setTimeout(function(){ b.classList.remove('snap'); },240); } box=null; });
  })();
  /* поле ввода не прячется под клавиатурой */
  document.addEventListener('focusin',function(e){ var t=e.target; if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA')){ setTimeout(function(){ try{ t.scrollIntoView({block:'center',behavior:'smooth'}); }catch(x){} },320); } });
  /* кнопка «Назад» в установленном приложении */
  if(isStandalone&&!isNativeApp()&&window.history&&history.pushState){
    try{ history.replaceState({ps:'base'},''); history.pushState({ps:'guard'},''); }catch(e){}
    window.addEventListener('popstate',function(){ var handled=false; try{ handled=window.__appBack(); }catch(e){} if(handled){ try{ history.pushState({ps:'guard'},''); }catch(e){} } else { try{ history.back(); }catch(e){} } });
  }
  /* новая версия игры */
  window.__onSwUpdate=function(){ toast('Вышла новая версия игры. Закройте и откройте приложение, чтобы обновить.'); };
}
