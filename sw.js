// Service worker de Otero: la app funciona sin cobertura.
const VERSION = 'otero-v1';
const SHELL = [
  './', './index.html', './styles.css', './manifest.webmanifest',
  './lib/leaflet.js', './lib/leaflet.css', './lib/exifr.js',
  './lib/images/marker-icon.png', './lib/images/marker-icon-2x.png', './lib/images/marker-shadow.png', './lib/images/layers.png', './lib/images/layers-2x.png',
  './js/app.js', './js/state.js', './js/geo.js', './js/db.js', './js/sources.js', './js/layers.js', './js/zones.js', './js/ui.js', './js/point.js',
  './js/panels.js', './js/compass.js', './js/library.js', './js/diary.js', './js/identify.js', './js/settings.js', './js/climate.js',
  './content/species.js', './content/articles.js', './content/regions.js', './content/toponimia.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png',
];
const TILE_CACHE = 'otero-tiles';
const RECENT = 'otero-tiles-recent';
const TILE_HOSTS = ['www.ign.es', 'data.geopf.fr', 'mapas.igme.es', 'tile.opentopomap.org'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('otero-v') && k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

let recentCount = 0;
async function trimRecent() {
  const c = await caches.open(RECENT);
  const keys = await c.keys();
  if (keys.length > 3000) for (const k of keys.slice(0, keys.length - 2500)) await c.delete(k);
}

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const isTile = TILE_HOSTS.includes(url.hostname) && /GetTile|GetMap|\.png$/i.test(url.href) && !url.pathname.includes('/rest/');
  if (isTile) {
    e.respondWith((async () => {
      const hit = (await caches.match(e.request.url, { cacheName: TILE_CACHE })) || (await caches.match(e.request.url, { cacheName: RECENT }));
      if (hit) return hit;
      try {
        const r = await fetch(e.request);
        if (r.ok || r.type === 'opaque') {
          const c = await caches.open(RECENT);
          c.put(e.request.url, r.clone());
          if (++recentCount % 200 === 0) trimRecent();
        }
        return r;
      } catch (err) {
        return new Response('', { status: 504 });
      }
    })());
    return;
  }
  if (url.origin === self.location.origin) {
    // App: primero caché (rápido y sin cobertura), y se actualiza en segundo plano
    e.respondWith((async () => {
      const c = await caches.open(VERSION);
      const hit = await c.match(e.request, { ignoreSearch: true });
      const net = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => null);
      return hit || (await net) || new Response('Sin conexión', { status: 503 });
    })());
  }
});
