const CACHE = 'allergypass-v5';

const ASSETS = [
  '/',
  '/index.html',
  '/app.html',
  '/app.js',
  '/style.css',
  '/app-styles.css',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-180.png',
  '/about.html',
  '/allergy-card/',
  '/allergy-card/index.html',
  '/tools/',
  '/tools/index.html',
  '/guides/',
  '/guides/index.html',
  '/guides/food-allergy-survival-guide.html',
  '/guides/hidden-allergens-thai-food.html',
  '/thailand-essentials/',
  '/thailand-essentials/index.html',
  '/thailand-essentials/emergency-healthcare.html',
  '/recommendations/',
  '/recommendations/index.html',
  '/recommendations/best-esims-thailand.html',
  '/blog/',
  '/blog/index.html',
  '/blog/food/',
  '/blog/food/thailand-street-food-allergy.html',
  '/blog/Expat-life/',
  '/blog/Expat-life/index.html',
  '/blog/things-to-do/',
  '/blog/things-to-do/index.html',
  '/blog/food/index.html',
  '/disclaimer/',
  '/disclaimer/index.html',
  '/privacy/',
  '/privacy/index.html',
  '/terms/',
  '/terms/index.html',
  '/refunds/',
  '/refunds/index.html',
  '/404.html',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,600;1,400;1,600&display=swap'
];

// Install: pre-cache all critical assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.allSettled(ASSETS.map(url => cache.add(url).catch(() => {})))
    )
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - HTML pages: network-first (fresh content), fall back to cache
// - Assets (CSS, JS, fonts, images): cache-first (performance)
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Skip non-GET and cross-origin except Google Fonts
  if (e.request.method !== 'GET') return;
  if (url.origin !== self.location.origin && !url.hostname.includes('fonts.g')) return;

  const isNavigation = e.request.mode === 'navigate';
  const isAsset = /\.(css|js|png|jpg|svg|woff2?|ico)$/.test(url.pathname);

  if (isNavigation) {
    // Network-first for HTML pages
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request).then(cached => cached || caches.match('/404.html')))
    );
  } else if (isAsset || url.hostname.includes('fonts.g')) {
    // Cache-first for assets
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
          return res;
        });
      })
    );
  }
});
