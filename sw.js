/* K53 Weekend Warrior — service worker (offline-first PWA) */
const CACHE = 'greenlight-k53-v2';
const CORE = [
  './',
  './index.html',
  './study-guide.html',
  './robots.txt',
  './sitemap.xml',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './assets/signs/animal.svg',
  './assets/signs/buslane.svg',
  './assets/signs/children.svg',
  './assets/signs/crossroad.svg',
  './assets/signs/curve.svg',
  './assets/signs/cyclist.svg',
  './assets/signs/dir.svg',
  './assets/signs/disablepark.svg',
  './assets/signs/giveway.svg',
  './assets/signs/greenman.svg',
  './assets/signs/headlightson.svg',
  './assets/signs/hill.svg',
  './assets/signs/hospital.svg',
  './assets/signs/keepleft.svg',
  './assets/signs/minspeed.svg',
  './assets/signs/narrow.svg',
  './assets/signs/noentry.svg',
  './assets/signs/noleft.svg',
  './assets/signs/noovertake.svg',
  './assets/signs/nopark.svg',
  './assets/signs/noright.svg',
  './assets/signs/nostop.svg',
  './assets/signs/nouturn.svg',
  './assets/signs/parking.svg',
  './assets/signs/ped.svg',
  './assets/signs/pedcrossing.svg',
  './assets/signs/railway.svg',
  './assets/signs/redman.svg',
  './assets/signs/rightofway.svg',
  './assets/signs/robot.svg',
  './assets/signs/roundabout.svg',
  './assets/signs/school.svg',
  './assets/signs/slippery.svg',
  './assets/signs/speed60.svg',
  './assets/signs/speedbump.svg',
  './assets/signs/stop.svg',
  './assets/signs/taxilane.svg',
  './assets/signs/tjunction.svg',
  './assets/signs/toll.svg',
  './assets/signs/turnleft.svg',
  './assets/signs/wild.svg',
  './assets/signs/yjunction.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Cache-first for same-origin GET, falling back to network then cache.
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        // Only cache successful same-origin responses
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});