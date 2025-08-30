const CACHE = 'pw-cache-v1';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll([
    '/', '/index.html', '/assets/styles.css', '/app.js', '/router.js',
    '/ui/components.js', '/ui/scanner.js', '/firebase.js', '/auth.js'
  ])));
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
