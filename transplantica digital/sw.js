const CACHE = 'transplantica-v1';
const PRECACHE = [
  '/',
  '/index.html',
  '/images/ui/locket.png',
  '/images/ui/icon-192.png',
  '/images/ui/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first for Firebase (always needs live data), cache-first for static assets
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Skip Firebase, Google Fonts, external APIs
  if (url.hostname.includes('firebase') ||
      url.hostname.includes('googleapis') ||
      url.hostname.includes('gstatic') ||
      url.hostname.includes('qrserver') ||
      url.hostname.includes('jsdelivr') ||
      url.hostname.includes('fonts.goo')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fresh = fetch(e.request).then(res => {
        if (res.ok) {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      }).catch(() => cached);
      return cached || fresh;
    })
  );
});
