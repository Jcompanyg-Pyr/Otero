// Service worker de Otero: la app funciona sin cobertura y se actualiza sin reinstalar.
// IMPORTANTE: cambia VERSION en cada publicación (fecha + número). Es lo que hace que el iPhone
// detecte la versión nueva, la descargue entera y ofrezca «Actualizar». Los datos personales
// (IndexedDB) no se tocan nunca desde aquí.
const VERSION = '2026.10.31-6';
const APP_CACHE = 'otero-app-' + VERSION;
const SHELL = [
  './', './index.html', './styles.css', './manifest.webmanifest',
  './lib/leaflet.js', './lib/leaflet.css', './lib/exifr.js',
  './lib/images/marker-icon.png', './lib/images/marker-icon-2x.png', './lib/images/marker-shadow.png', './lib/images/layers.png', './lib/images/layers-2x.png',
  './js/app.js', './js/state.js', './js/geo.js', './js/db.js', './js/sources.js', './js/layers.js', './js/zones.js', './js/ui.js', './js/point.js',
  './js/panels.js', './js/compass.js', './js/library.js', './js/diary.js', './js/identify.js', './js/settings.js', './js/climate.js',
  './js/location.js', './js/places.js', './js/updates.js', './js/catalog.js', './js/cuaderno.js', './js/measures.js',
  './content/species.js', './content/articles.js', './content/regions.js', './content/toponimia.js',
  './content/traits.js', './content/sierras.js', './content/rocks.js', './content/articles/meteo.js', './content/articles/paisaje.js',
  './content/species/mam.js', './content/species/ave.js', './content/species/arb.js', './content/species/pla.js', './content/species/rep.js', './content/species/anf.js', './content/species/ins.js', './content/species/hon.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png',
];
const TILE_CACHE = 'otero-tiles';
const RECENT = 'otero-tiles-recent';
const TILE_HOSTS = ['www.ign.es', 'data.geopf.fr', 'mapas.igme.es', 'tile.opentopomap.org'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(APP_CACHE);
    // cache: 'reload' salta la caché HTTP de GitHub Pages (10 min): así se baja de verdad la versión nueva, entera
    await c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })));
    // Si viene de la versión antigua (sin aviso de actualización), activarse sin esperar
    if (await caches.has('otero-v1')) await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) {
      if ((k.startsWith('otero-v') || k.startsWith('otero-app-')) && k !== APP_CACHE) await caches.delete(k);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (e.data?.type === 'GET_VERSION') e.ports[0]?.postMessage({ version: VERSION });
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
          e.waitUntil(c.put(e.request.url, r.clone()));
          if (++recentCount % 200 === 0) e.waitUntil(trimRecent());
        }
        return r;
      } catch (err) {
        return new Response('', { status: 504 });
      }
    })());
    return;
  }
  if (url.origin === self.location.origin) {
    // App: siempre desde la caché de ESTA versión (todos los archivos de la misma versión, nunca mezclados).
    // Las versiones nuevas llegan instalando un service worker nuevo, no archivo a archivo.
    e.respondWith((async () => {
      const c = await caches.open(APP_CACHE);
      const hit = await c.match(e.request, { ignoreSearch: true });
      if (hit) return hit;
      try { return await fetch(e.request); }
      catch (err) {
        // sin conexión: cualquier página de la app abre la app (la página principal guardada)
        if (e.request.mode === 'navigate') { const idx = await c.match('./index.html'); if (idx) return idx; }
        return new Response('Sin conexión', { status: 503 });
      }
    })());
  }
});
