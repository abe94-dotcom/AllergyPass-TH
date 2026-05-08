const CACHE = 'allergypass-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/app.html',
  '/app.js',
  '/style.css',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-180.png',
  '/about.html',
  '/guides/',
  '/guides/index.html',
  '/guides/food-allergy-survival-guide.html',
  '/guides/hidden-allergens-thai-food.html',
  '/thailand-essentials/',
  '/thailand-essentials/index.html',
  '/thailand-essentials/emergency-healthcare.html',
  '/blog/',
  '/blog/index.html',
  '/recommendations/',
  '/recommendations/index.html',
  '/recommendations/best-esims-thailand.html',
  '/allergy-card/',
  '/allergy-card/index.html',
  '/tools/',
  '/tools/index.html',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Lora:ital,wght@0,600;1,400;1,600&display=swap'
];

// Install: cache all critical assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      // Cache what we can, don't fail install if some assets are missing
      return Promise.allSettled(
        ASSETS.map(url => cache.add(url).catch(() => {}))
      );
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for assets, network-first for navigation
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Skip non-GET and cross-origin (except fonts)
  if (e.request.method !== 'GET') return;
  if (url.origin !== location.origin && !url.hostname.includes('fonts.')) return;

  // For navigation requests: network-first with cache fallback
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
          return response;
        })
        .catch(() => caches.match(e.request).then(cached => cached || caches.match('/index.html')))
    );
    return;
  }

  // For static assets: cache-first
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => null);
    })
  );
});
