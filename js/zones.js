// "Preparar salida": descarga mapas y datos de una zona para usarla sin cobertura.
import { tilesForBBox, inBBox, bboxKm } from './geo.js';
import { BASES, OVERLAYS } from './layers.js';
import { db, uid } from './db.js';
import { zoneData, elevGrid, forecast, inatSpecies, elevations } from './sources.js';
import { buildCuaderno } from './cuaderno.js';

export const TILE_CACHE = 'otero-tiles';

export function planTiles(b, opts) {
  const jobs = [];
  for (const [key, def] of Object.entries({ ...BASES, ...OVERLAYS })) {
    if (!opts.layers.includes(key) || !def.offline) continue;
    const [z0, z1] = def.offline;
    const zMax = key.startsWith('sat') && opts.extraDetail ? 17 : z1;
    for (let z = z0; z <= zMax; z++) for (const t of tilesForBBox(b, z)) jobs.push(def.url(t.x, t.y, t.z));
  }
  return jobs;
}
const AVG_KB = 22;
export const estimateMB = n => Math.round(n * AVG_KB / 1024);

async function fetchTile(cache, url, signal) {
  if (await cache.match(url)) return 'hit';
  let r;
  try { r = await fetch(url, { mode: 'cors', signal }); } catch (e) { if (signal?.aborted) throw e; r = null; }
  if (!r || (!r.ok && r.type !== 'opaque')) r = await fetch(url, { mode: 'no-cors', signal });
  if (r.ok || r.type === 'opaque') { await cache.put(url, r); return 'ok'; }
  throw new Error('tile ' + r.status);
}

// Pasos de la preparación (para la barra de progreso: los 5 primeros ocupan el 30 %, los mapas el resto)
export const PREP_STEPS = ['Nombres y lugares', 'Relieve', 'Tiempo', 'Especies', 'Cuaderno', 'Mapas'];
export async function prepareZone({ name, bbox, track, layers, extraDetail }, onProgress, signal) {
  let step = 0;
  const report = (phase, done, total) => onProgress && onProgress({ phase, done, total, step, steps: PREP_STEPS.length });
  const chk = () => { if (signal?.aborted) throw new Error('Cancelado'); };
  const errors = [];
  const zone = { id: uid(), name, bbox, track: track || null, created: Date.now(), layers, sizeKm: bboxKm(bbox) };

  // 1. Datos (ligeros, primero: son lo más valioso)
  try { Object.assign(zone, await zoneData(bbox, s => report(s, 0, 0), signal)); } catch (e) { chk(); errors.push('Nombres y términos: ' + e.message); }
  chk(); step = 1;
  report('Relieve (para detectar hondonadas e inversiones)', 0, 0);
  try { zone.grid = await elevGrid(bbox, 30, signal); } catch (e) { chk(); errors.push('Relieve: ' + e.message); }
  chk(); step = 2;
  const c = [(bbox.s + bbox.n) / 2, (bbox.w + bbox.e) / 2];
  report('Previsión del tiempo (7 días)', 0, 0);
  try {
    const e = zone.grid ? null : (await elevations([c], signal))[0];
    zone.forecast = await forecast(c[0], c[1], e, signal);
  } catch (e) { chk(); errors.push('Tiempo: ' + e.message); }
  chk(); step = 3;
  report('Especies observadas en la zona (iNaturalist)', 0, 0);
  try {
    const km = Math.max(5, Math.min(25, Math.round(Math.max(zone.sizeKm.w, zone.sizeKm.h) / 2 + 3)));
    zone.inat = await inatSpecies(c[0], c[1], km, signal);
  } catch (e) { chk(); errors.push('Especies: ' + e.message); }
  chk(); step = 4;
  // Cuaderno: lugares (Wikipedia), rutas señalizadas y rocas, para leer sin conexión
  try { zone.cuaderno = await buildCuaderno(zone, s => report(s, 0, 0), signal); } catch (e) { chk(); errors.push('Cuaderno: ' + e.message); }
  await db.put('zones', zone);
  step = 5;

  // 2. Teselas de mapa
  const urls = planTiles(bbox, { layers, extraDetail });
  zone.tiles = urls.length;
  const cache = await caches.open(TILE_CACHE);
  let done = 0, failed = 0, i = 0;
  const worker = async () => {
    while (i < urls.length) {
      if (signal?.aborted) return;
      const u = urls[i++];
      try { await fetchTile(cache, u, signal); } catch (e) { if (signal?.aborted) return; failed++; }
      done++;
      if (done % 10 === 0 || done === urls.length) report('Mapas', done, urls.length);
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  if (signal?.aborted) { await db.put('zones', zone); throw new Error('Cancelado'); }
  zone.tilesFailed = failed;
  if (failed) errors.push(`${failed} de ${urls.length} trozos de mapa no se pudieron bajar`);
  zone.errors = errors;
  zone.tileUrls = urls; // para poder borrarlos luego
  await db.put('zones', zone);
  return zone;
}

export async function deleteZone(z) {
  const all = await db.all('zones');
  const others = new Set(all.filter(o => o.id !== z.id).flatMap(o => o.tileUrls || []));
  const cache = await caches.open(TILE_CACHE);
  for (const u of z.tileUrls || []) if (!others.has(u)) await cache.delete(u);
  await db.del('zones', z.id);
}

let zonesCache = null;
export async function getZones(force) {
  if (!zonesCache || force) zonesCache = await db.all('zones').catch(() => []);
  return zonesCache;
}
export async function zoneAt(lat, lon) {
  const zs = await getZones();
  return zs.filter(z => inBBox(z.bbox, lat, lon)).sort((a, b) => b.created - a.created)[0] || null;
}

// GPX → puntos y caja
export function parseGPX(text) {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  const pts = [...doc.querySelectorAll('trkpt, rtept, wpt')].map(p => [parseFloat(p.getAttribute('lat')), parseFloat(p.getAttribute('lon'))]).filter(p => !isNaN(p[0]));
  if (!pts.length) throw new Error('El archivo no tiene puntos de track');
  const name = doc.querySelector('trk > name, metadata > name, rte > name')?.textContent?.trim();
  return { pts, name };
}
export function bboxOfPoints(pts, padKm = 2) {
  let s = 90, n = -90, w = 180, e = -180;
  for (const [la, lo] of pts) { s = Math.min(s, la); n = Math.max(n, la); w = Math.min(w, lo); e = Math.max(e, lo); }
  const dLat = padKm / 111.32, dLon = padKm / (111.32 * Math.cos((s + n) / 2 * Math.PI / 180));
  return { s: s - dLat, n: n + dLat, w: w - dLon, e: e + dLon };
}
