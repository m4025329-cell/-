#!/usr/bin/env python3
"""Собирает игру «Слой за слоем» в один файл index.html (шрифты встроены)."""
import base64, json, pathlib
root = pathlib.Path(__file__).parent
src = root / 'src'

def fonts_css():
    meta = json.loads((root / 'fonts' / 'fonts.json').read_text(encoding='utf-8'))
    out = []
    for m in meta:
        data = base64.b64encode((root / 'fonts' / m['file']).read_bytes()).decode('ascii')
        out.append("@font-face{font-family:'%s';font-style:normal;font-weight:%s;font-display:swap;src:url(data:font/woff2;base64,%s) format('woff2');unicode-range:%s}" % (m['family'], m['weight'], data, m['range']))
    return '\n'.join(out)

def js(name):
    t = (src / name).read_text(encoding='utf-8')
    return t.replace("if(typeof module!=='undefined') module.exports = {};", '')

scripts = '\n'.join(js(n) for n in ['engine.js', 'content.js', 'orders.js', 'lab.js', 'team.js', 'modes.js', 'news.js', 'events.js', 'minievents.js', 'minievents2.js', 'minievents3.js', 'minievents4.js', 'reviews.js', 'ending.js', 'art.js', 'workshop.js', 'ui.js'])
css = (src / 'style.css').read_text(encoding='utf-8').replace('/*FONTS*/', fonts_css())
frag = (src / 'body.html').read_text(encoding='utf-8').replace('/*STYLE*/', css).replace('/*SCRIPTS*/', scripts)
(root / 'dist').mkdir(exist_ok=True)
(root / 'dist' / 'fragment.html').write_text(frag, encoding='utf-8')
head_title = '<title>Слой за слоем</title>\n'
doc = ('<!doctype html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n'
       '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
       '<meta name="color-scheme" content="light dark">\n' + head_title +
       '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}[hidden]{display:none!important}</style>\n'
       '</head>\n<body>\n' + frag.replace(head_title, '', 1) + '\n</body>\n</html>\n')
# --- версия для установки как приложение (PWA) и для Google Play ---
APP_VERSION = '4.1.0'
pwa_head = ('<meta name="theme-color" content="#0C1024">\n<meta name="description" content="Экономическая игра про бизнес на 3D-принтерах">\n'
            '<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png">\n'
            '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">\n')
sw_reg = ("<script>if('serviceWorker' in navigator && (location.protocol==='https:' || location.hostname==='localhost') && location.hostname!=='appassets.androidplatform.net'){"
          "window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){});});}</script>\n")
doc = doc.replace('</head>', pwa_head + '</head>', 1).replace('</body>', sw_reg + '</body>', 1)
(root / 'index.html').write_text(doc, encoding='utf-8')
print('index.html', len(doc) // 1024, 'KB')

import shutil
web = root / 'web'
if web.exists():
    shutil.rmtree(web)
(web / 'icons').mkdir(parents=True)
(web / 'index.html').write_text(doc, encoding='utf-8')
for f in ['icon-192.png', 'icon-512.png', 'maskable-512.png', 'apple-touch-icon.png', 'favicon-32.png']:
    src_f = root / 'play' / 'icons' / f
    if src_f.exists():
        shutil.copy(src_f, web / 'icons' / f)
manifest = {
    'name': 'Слой за слоем: экономика 3D-печати', 'short_name': 'Слой за слоем',
    'description': 'Экономическая игра про бизнес на 3D-принтерах: цены, заказы, склад, исследования и команда.',
    'lang': 'ru', 'start_url': './index.html', 'scope': './', 'display': 'standalone', 'orientation': 'any',
    'background_color': '#0C1024', 'theme_color': '#0C1024', 'categories': ['games', 'education'],
    'icons': [
        {'src': 'icons/icon-192.png', 'sizes': '192x192', 'type': 'image/png'},
        {'src': 'icons/icon-512.png', 'sizes': '512x512', 'type': 'image/png'},
        {'src': 'icons/maskable-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'}]}
(web / 'manifest.webmanifest').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
(root / 'manifest.webmanifest').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
sw = """/* Офлайн-кэш игры «Слой за слоем» */
var CACHE = 'lbl-v%s';
var FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(function (hit) { return hit || fetch(e.request).then(function (r) { var c = r.clone(); caches.open(CACHE).then(function (ch) { ch.put(e.request, c); }); return r; }).catch(function () { return caches.match('./index.html'); }); }));
});
""" % APP_VERSION
(web / 'sw.js').write_text(sw, encoding='utf-8')
(root / 'sw.js').write_text(sw, encoding='utf-8')
if (root / 'icons').exists():
    shutil.rmtree(root / 'icons')
shutil.copytree(web / 'icons', root / 'icons')
priv = root / 'play' / 'store' / 'privacy-policy.html'
if priv.exists():
    shutil.copy(priv, web / 'privacy.html')
# копия для Android-приложения (игра лежит в assets и работает без интернета)
assets = root / 'play' / 'android' / 'app' / 'src' / 'main' / 'assets' / 'www'
if (root / 'play' / 'android').exists():
    if assets.exists():
        shutil.rmtree(assets)
    assets.mkdir(parents=True)
    (assets / 'index.html').write_text(doc, encoding='utf-8')
    shutil.copy(web / 'manifest.webmanifest', assets / 'manifest.webmanifest')
    shutil.copytree(web / 'icons', assets / 'icons')
print('web/ и Android-ассеты обновлены, версия', APP_VERSION)
