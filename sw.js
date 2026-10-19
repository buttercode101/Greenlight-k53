/* GreenLight K53 — service worker (offline-first PWA) */
const CACHE = 'greenlight-k53-v35-reference-headings';
const CORE = [
  './',
  './index.html',
  './assets/product.css?v=32',
  './study-guide.html',
  './privacy.html',
  './corrections.html',
  './icon-192.png',
  './icon-512.png',
  './assets/print.js',
  './content-register.json',
  './robots.txt',
  './sitemap.xml',
  './manifest.webmanifest',
  './icon.svg',
  './assets/signs/animal.svg',
  './assets/signs/buslane.svg',
  './assets/signs/children.svg',
  './assets/signs/crossroad.svg',
  './assets/signs/curve.svg',
  './assets/signs/cyclist.svg',
  './assets/signs/disablepark.svg',
  './assets/signs/giveway.svg',
  './assets/signs/greenman.svg',
  './assets/signs/headlightson.svg',
  './assets/signs/hill.svg',
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
  './assets/signs/slippery.svg',
  './assets/signs/speed60.svg',
  './assets/signs/speedbump.svg',
  './assets/signs/stop.svg',
  './assets/signs/taxilane.svg',
  './assets/signs/tjunction.svg',
  './assets/signs/toll.svg',
  './assets/signs/turnleft.svg',
  './assets/signs/wild.svg',
  './assets/signs/yjunction.svg',
  './assets/decision/art/O07.svg',
  './assets/decision/art/O10.svg',
  './assets/decision/art/R01.svg',
  './assets/decision/art/R02.svg',
  './assets/decision/art/R03.svg',
  './assets/decision/art/R04.svg',
  './assets/decision/art/R05.svg',
  './assets/decision/art/R06.svg',
  './assets/decision/art/R07.svg',
  './assets/decision/art/R08.svg',
  './assets/decision/art/R09.svg',
  './assets/decision/art/R10.svg',
  './assets/decision/art/R11.svg',
  './assets/decision/art/R12.svg',
  './assets/decision/art/R13.svg',
  './assets/decision/art/R14.svg',
  './assets/decision/art/R15.svg',
  './assets/decision/art/R16.svg',
  './assets/decision/art/R17.svg',
  './assets/decision/art/R18.svg',
  './assets/decision/art/R19.svg',
  './assets/decision/art/R20.svg',
  './assets/decision/art/R28.svg',
  './assets/decision/art/R32.svg',
  './assets/decision/art/R34.svg',
  './assets/decision/art/S01.svg',
  './assets/decision/art/S02.svg',
  './assets/decision/art/S03.svg',
  './assets/decision/art/S04.svg',
  './assets/decision/art/S05.svg',
  './assets/decision/art/S06.svg',
  './assets/decision/art/S07.svg',
  './assets/decision/art/S08.svg',
  './assets/decision/art/S09.svg',
  './assets/decision/art/S10.svg',
  './assets/decision/art/S11.svg',
  './assets/decision/art/S12.svg',
  './assets/decision/art/S13.svg',
  './assets/decision/art/S14.svg',
  './assets/decision/art/S15.svg',
  './assets/decision/art/S16.svg',
  './assets/decision/art/S17.svg',
  './assets/decision/art/S18.svg',
  './assets/decision/art/S19.svg',
  './assets/decision/art/S20.svg',
  './assets/decision/art/S21.svg',
  './assets/decision/art/S22.svg',
  './assets/decision/art/S23.svg',
  './assets/decision/art/S24.svg',
  './assets/decision/art/S25.svg',
  './assets/decision/art/S26.svg',
  './assets/decision/art/S27.svg',
  './assets/decision/art/S28.svg',
  './assets/decision/bank.js',
  './assets/decision/bank.js?v=32',
  './assets/decision/content-register.json',
  './assets/decision/engine.js',
  './assets/decision/engine.js?v=32',
  './assets/decision/model.js',
  './assets/decision/model.js?v=32',
  './assets/decision/practice.css',
  './assets/decision/practice.css?v=32',
  './assets/decision/practice.js',
  './assets/decision/practice.js?v=32',
  './assets/decision/session.js',
  './assets/decision/session.js?v=32',
  './assets/decision/sources.js',
  './assets/decision/sources.js?v=32',
  './assets/decision/storage.js',
  './assets/decision/storage.js?v=32',
  './assets/decision/types.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k.startsWith('greenlight-k53-') && k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Refresh navigations when online; serve the saved app shell when offline.
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;

  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then((res) => {
      if (res && res.ok) {
        const copy = res.clone();
        e.waitUntil(caches.open(CACHE).then((c) => c.put(e.request, copy)));
      }
      return res;
    }).catch(() => caches.match(e.request).then((cached) => cached || caches.match('./index.html'))));
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        // Only cache successful same-origin responses
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          e.waitUntil(caches.open(CACHE).then((c) => c.put(e.request, copy)));
        }
        return res;
      }).catch(() => Response.error());
    })
  );
});

self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
