#!/usr/bin/env python3
"""Собирает игру «Первый столик» в один файл index.html (шрифты встроены) и фрагмент для публикации."""
import base64, json, pathlib
root = pathlib.Path(__file__).parent
src = root / 'src'
APP_VERSION = '2.0.0'

def fonts_css():
    meta = json.loads((root / 'fonts' / 'fonts.json').read_text(encoding='utf-8'))
    out = []
    for m in meta:
        data = base64.b64encode((root / 'fonts' / m['file']).read_bytes()).decode('ascii')
        out.append("@font-face{font-family:'%s';font-style:normal;font-weight:%s;font-display:swap;src:url(data:font/woff2;base64,%s) format('woff2');unicode-range:%s}" % (m['family'], m['weight'], data, m['range']))
    return '\n'.join(out)

def js(name):
    return (src / name).read_text(encoding='utf-8')

logic = '\n'.join(js(n) for n in ['data.js', 'engine.js', 'fin.js', 'orders.js', 'events.js', 'events2.js', 'story.js', 'quiz.js', 'econ.js', 'ending.js', 'art.js'])
ui = '(function(){\n\'use strict\';\n' + '\n'.join(js(n) for n in ['ui1.js', 'ui2.js', 'ui3.js', 'ui5.js', 'ui6.js', 'ui7.js', 'ui8.js', 'ui9.js', 'ui4.js']).replace('APP_VERSION=\'1.0.0\'', "APP_VERSION='%s'" % APP_VERSION) + '\n})();'
scripts = logic + '\n' + ui
css = (src / 'style.css').read_text(encoding='utf-8').replace('/*FONTS*/', fonts_css())
frag = (src / 'body.html').read_text(encoding='utf-8').replace('/*STYLE*/', css).replace('/*SCRIPTS*/', scripts)
(root / 'dist').mkdir(exist_ok=True)
(root / 'dist' / 'fragment.html').write_text(frag, encoding='utf-8')
head_title = '<title>Первый столик</title>\n'
doc = ('<!doctype html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n'
       '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
       '<meta name="color-scheme" content="light dark">\n'
       '<meta name="description" content="Экономическая игра о кафе, которое растёт в сеть ресторанов в разных городах">\n' + head_title +
       '<style>:root{padding-top:env(safe-area-inset-top,0px)}body{margin:0}[hidden]{display:none!important}</style>\n'
       '</head>\n<body>\n' + frag.replace(head_title, '', 1) + '\n</body>\n</html>\n')
# --- версия для установки как приложение (PWA) ---
import shutil
pwa_head = ('<meta name="theme-color" content="#D1361A" media="(prefers-color-scheme: light)">\n<meta name="theme-color" content="#1B120E" media="(prefers-color-scheme: dark)">\n'
            '<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png">\n<link rel="icon" type="image/svg+xml" href="icons/icon.svg">\n'
            '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">\n'
            '<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-title" content="Первый столик">\n<meta name="apple-mobile-web-app-status-bar-style" content="default">\n<meta name="application-name" content="Первый столик">\n<meta name="format-detection" content="telephone=no">\n')
sw_reg = ("<script>if('serviceWorker' in navigator && (location.protocol==='https:' || location.hostname==='localhost' || location.hostname==='127.0.0.1') && location.hostname!=='appassets.androidplatform.net'){"
          "window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){});});"
          "navigator.serviceWorker.addEventListener('message',function(e){if(e.data&&e.data.type==='upd'&&window.__onSwUpdate)window.__onSwUpdate();});}</script>\n")
pdoc = doc.replace('</head>', pwa_head + '</head>', 1).replace('</body>', sw_reg + '</body>', 1)
(root / 'index.html').write_text(pdoc, encoding='utf-8')
print('index.html', len(pdoc) // 1024, 'KB')
icons_src = root / 'play' / 'icons'
icons_dst = root / 'icons'
if icons_src.exists():
    icons_dst.mkdir(exist_ok=True)
    for f in icons_src.iterdir():
        if f.is_file():
            shutil.copy(f, icons_dst / f.name)
screens = []
for f in ['screen-1.png', 'screen-2.png', 'screen-3.png']:
    if (root / 'screens' / f).exists():
        screens.append({'src': 'screens/' + f, 'sizes': '780x1688', 'type': 'image/png', 'form_factor': 'narrow', 'label': {'screen-1.png': 'Меню, цены и команда', 'screen-2.png': 'Отчёты и анализ', 'screen-3.png': 'Карта городов'}[f]})
if (root / 'screens' / 'wide-1.png').exists():
    screens.append({'src': 'screens/wide-1.png', 'sizes': '1280x720', 'type': 'image/png', 'form_factor': 'wide', 'label': 'Игра на компьютере'})
manifest = {
    'id': 'pervyi-stolik', 'name': 'Первый столик: экономика кафе', 'short_name': 'Первый столик',
    'description': 'Экономическая игра: кафе растёт в сеть ресторанов в разных городах. Цены, меню, команда, кредиты и финансовые отчёты.',
    'lang': 'ru', 'dir': 'ltr', 'start_url': './index.html?source=pwa', 'scope': './', 'display': 'standalone', 'display_override': ['standalone', 'minimal-ui'],
    'orientation': 'any', 'background_color': '#FFF6E7', 'theme_color': '#D1361A', 'categories': ['games', 'education'],
    'icons': [
        {'src': 'icons/icon-192.png', 'sizes': '192x192', 'type': 'image/png', 'purpose': 'any'},
        {'src': 'icons/icon-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'any'},
        {'src': 'icons/maskable-192.png', 'sizes': '192x192', 'type': 'image/png', 'purpose': 'maskable'},
        {'src': 'icons/maskable-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'}]}
if screens:
    manifest['screenshots'] = screens
(root / 'manifest.webmanifest').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
sw = """/* Офлайн-кэш игры «Первый столик» (версия %s): сначала берём из кэша, в фоне проверяем обновление */
var CACHE = 'ps-v%s';
var FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-192.png', './icons/maskable-512.png', './icons/apple-touch-icon.png', './icons/favicon-32.png', './icons/icon.svg'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k.indexOf('ps-v') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
function notify(){ self.clients.matchAll().then(function (cl) { cl.forEach(function (c) { c.postMessage({ type: 'upd' }); }); }); }
self.addEventListener('fetch', function (e) {
  var req = e.request; if (req.method !== 'GET') return;
  var url = new URL(req.url); if (url.origin !== location.origin) return;
  var nav = req.mode === 'navigate', key = nav ? './index.html' : req;
  e.respondWith(caches.match(key, { ignoreSearch: true }).then(function (hit) {
    var net = fetch(req).then(function (r) {
      if (r && r.ok) { var c = r.clone(); caches.open(CACHE).then(function (ch) { ch.put(key, c); }); if (hit) { var a = hit.headers.get('etag') || hit.headers.get('content-length'), b = r.headers.get('etag') || r.headers.get('content-length'); if (a && b && a !== b && nav) notify(); } }
      return r;
    }).catch(function () { return hit || caches.match('./index.html'); });
    return hit || net;
  }));
});
""" % (APP_VERSION, APP_VERSION)
(root / 'sw.js').write_text(sw, encoding='utf-8')
print('PWA: manifest, sw.js, значки обновлены, версия', APP_VERSION)
# копия игры для Android-проекта (Android Studio берёт её из assets, интернет не нужен)
assets = root / 'play' / 'android' / 'app' / 'src' / 'main' / 'assets' / 'www'
if (root / 'play' / 'android').exists():
    if assets.exists():
        shutil.rmtree(assets)
    (assets / 'icons').mkdir(parents=True)
    (assets / 'index.html').write_text(pdoc, encoding='utf-8')
    shutil.copy(root / 'manifest.webmanifest', assets / 'manifest.webmanifest')
    for f in ['icon-192.png', 'icon-512.png', 'icon.svg']:
        shutil.copy(root / 'icons' / f, assets / 'icons' / f)
    print('Android-ассеты обновлены')
