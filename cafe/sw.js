/* Офлайн-кэш игры «Первый столик» (версия 1.2.0): сначала берём из кэша, в фоне проверяем обновление */
var CACHE = 'ps-v1.2.0';
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
