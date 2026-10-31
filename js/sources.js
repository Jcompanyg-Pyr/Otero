// Fuentes de datos públicas y gratuitas. Ninguna necesita cuenta salvo Pl@ntNet (opcional).
import { assembleRings, simplify, destination } from './geo.js';

const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
const IGME_REST = 'https://mapas.igme.es/gis/rest/services/Cartografia_Geologica/IGME_MAGNA_50/MapServer';

export const online = () => navigator.onLine !== false;

// Error de una fuente de datos. kind: 'timeout' | 'http' | 'busy' | 'bad' | 'network' | 'offline'
export class SourceError extends Error {
  constructor(kind, msg, status) { super(msg); this.kind = kind; this.status = status; }
}
export function explainError(e) {
  switch (e?.kind) {
    case 'offline': return 'Sin cobertura';
    case 'timeout': return 'El servidor no ha respondido a tiempo';
    case 'busy': return 'El servidor está saturado ahora mismo';
    case 'http': return `El servidor respondió con un error (${e.status})`;
    case 'bad': return 'El servidor devolvió una respuesta incompleta';
    default: return 'No se pudo conectar con el servidor';
  }
}

// fetch + JSON con tiempo máximo. También se puede cancelar desde fuera con opts.signal.
export async function getJSON(url, opts = {}, ms = 25000) {
  if (!online()) throw new SourceError('offline', 'Sin cobertura');
  const ctl = new AbortController(), outer = opts.signal;
  const onOuter = () => ctl.abort();
  outer?.addEventListener('abort', onOuter);
  let timedOut = false;
  const t = setTimeout(() => { timedOut = true; ctl.abort(); }, ms);
  try {
    const r = await fetch(url, { ...opts, signal: ctl.signal });
    if (!r.ok) throw new SourceError(r.status === 429 || r.status === 504 ? 'busy' : 'http', `HTTP ${r.status}`, r.status);
    try { return await r.json(); } catch (e) { if (ctl.signal.aborted) throw e; throw new SourceError('bad', 'Respuesta no válida'); }
  } catch (e) {
    if (e instanceof SourceError) throw e;
    if (timedOut) throw new SourceError('timeout', 'Tiempo agotado');
    if (outer?.aborted) throw e; // cancelado por quien llamó
    throw new SourceError('network', e.message || 'Error de red');
  } finally { clearTimeout(t); outer?.removeEventListener('abort', onOuter); }
}

// Overpass con varios servidores: empieza por el primero y, si en `stagger` ms no ha contestado
// (o falla antes), lanza también el siguiente. Gana el primero que responde bien; los demás se cancelan.
export async function overpass(query, ms = 25000, { signal, stagger = 5000, endpoints = OVERPASS } = {}) {
  if (!online()) throw new SourceError('offline', 'Sin cobertura');
  const ctls = endpoints.map(() => new AbortController());
  const stopAll = () => ctls.forEach(c => c.abort());
  signal?.addEventListener('abort', stopAll);
  const errors = [], kick = [];
  try {
    return await Promise.any(endpoints.map(async (ep, i) => {
      if (i) await new Promise(r => {
        const t = setTimeout(r, i * stagger);
        kick[i] = () => { clearTimeout(t); r(); };
        ctls[i].signal.addEventListener('abort', kick[i]); // cancelado: no esperar su turno
      });
      if (ctls[i].signal.aborted) throw new SourceError('network', 'Cancelado');
      try {
        const d = await getJSON(ep, { method: 'POST', body: 'data=' + encodeURIComponent(query), headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, signal: ctls[i].signal }, ms);
        // Overpass a veces responde 200 con un aviso de error y resultados a medias
        if (d?.remark && /runtime error|timed out|out of memory/i.test(d.remark)) throw new SourceError('busy', d.remark);
        if (!Array.isArray(d?.elements)) throw new SourceError('bad', 'Respuesta sin datos');
        ctls.forEach((c, j) => j !== i && c.abort());
        return d;
      } catch (e) { errors.push(e); kick[i + 1]?.(); throw e; }
    }));
  } catch (e) {
    if (signal?.aborted) throw new DOMException('Cancelado', 'AbortError');
    throw errors.find(x => x.kind === 'busy') || errors.find(x => x.kind === 'timeout') || errors[0] || new SourceError('network', 'Sin respuesta');
  } finally { signal?.removeEventListener('abort', stopAll); }
}

// --- Clasificación de elementos de OSM a algo legible ---
const KIND = [
  [t => t.natural === 'peak' || t.natural === 'volcano', 'pico'],
  [t => t.natural === 'saddle' || t.mountain_pass === 'yes', 'collado'],
  [t => t.tourism === 'viewpoint', 'mirador'],
  [t => t.natural === 'spring' || t.amenity === 'drinking_water', 'fuente'],
  [t => t.natural === 'cave_entrance', 'cueva'],
  [t => t.natural === 'tree', 'árbol singular'],
  [t => t.natural === 'water' || t.water === 'lake' || t.water === 'pond', 'lago'],
  [t => t.place === 'isolated_dwelling' || t.place === 'farm' || t.building === 'farm' || t.building === 'farmhouse', 'masía'],
  [t => t.tourism === 'alpine_hut' || t.tourism === 'wilderness_hut' || t.amenity === 'shelter', 'refugio'],
  [t => ['village', 'town', 'hamlet', 'city'].includes(t.place), 'núcleo'],
  [t => t.place === 'locality' || t.natural === 'valley' || t.natural === 'ridge' || t.natural === 'cliff', 'paraje'],
];
export function kindOf(tags) { for (const [f, k] of KIND) if (f(tags)) return k; return 'lugar'; }

export function parsePlaces(elements) {
  const places = [], waters = [];
  for (const el of elements) {
    const t = el.tags || {};
    if (!t.name) continue;
    if (el.type === 'way' && t.waterway && el.geometry) {
      waters.push({ name: t.name, kind: t.waterway === 'river' ? 'río' : 'barranco', pts: simplify(el.geometry.map(g => [g.lat, g.lon]), 0.0003) });
      continue;
    }
    const lat = el.lat ?? el.center?.lat, lon = el.lon ?? el.center?.lon;
    if (lat == null) continue;
    places.push({ name: t.name, lat, lon, kind: kindOf(t), ele: t.ele ? parseFloat(String(t.ele).replace(',', '.')) : null });
  }
  return { places, waters };
}

function parseBoundaries(elements) {
  const out = [];
  for (const el of elements) {
    if (el.type !== 'relation' || !el.tags?.name) continue;
    const outer = el.members.filter(m => m.type === 'way' && m.role !== 'inner' && m.geometry).map(m => m.geometry.map(g => [g.lat, g.lon]));
    const rings = assembleRings(outer).map(r => simplify(r, 0.00015));
    if (rings.length) out.push({ name: el.tags.name, level: +el.tags.admin_level, rings });
  }
  return out;
}

const PLACE_FILTER = (area) => `
  node["natural"~"^(peak|volcano|saddle|spring|cave_entrance)$"]["name"](${area});
  node["natural"="tree"]["name"](${area});
  node["mountain_pass"="yes"]["name"](${area});
  node["tourism"~"^(viewpoint|alpine_hut|wilderness_hut)$"]["name"](${area});
  node["amenity"="shelter"]["name"](${area});
  node["place"~"^(isolated_dwelling|farm|hamlet|village|town|locality)$"]["name"](${area});
  nwr["building"~"^(farm|farmhouse)$"]["name"](${area});
  nwr["natural"~"^(water|valley|ridge|cliff)$"]["name"](${area});`;

// Datos de una zona completa (para usar sin cobertura)
export async function zoneData(b, onStep = () => { }) {
  const bb = `${b.s},${b.w},${b.n},${b.e}`;
  onStep('Nombres de picos, masías, fuentes y barrancos');
  const q1 = `[out:json][timeout:90];(${PLACE_FILTER(bb)});out center tags;way["waterway"~"^(river|stream)$"]["name"](${bb});out geom;`;
  const d1 = await overpass(q1, 100000, { stagger: 40000 });
  const { places, waters } = parsePlaces(d1.elements);

  onStep('Términos municipales y comarcas');
  const q2 = `[out:json][timeout:120];rel["boundary"="administrative"]["admin_level"~"^(7|8)$"](${bb});out geom;`;
  let boundaries = [];
  try { boundaries = parseBoundaries((await overpass(q2, 130000, { stagger: 40000 })).elements); } catch (e) { console.warn('límites', e); }

  onStep('Picos lejanos (para la brújula, 50 km)');
  const cLat = (b.s + b.n) / 2, cLon = (b.w + b.e) / 2;
  const q3 = `[out:json][timeout:90];node["natural"~"^(peak|volcano)$"]["name"](around:50000,${cLat},${cLon});out;`;
  let farPeaks = [];
  try { farPeaks = parsePlaces((await overpass(q3, 100000, { stagger: 40000 })).elements).places.filter(p => p.ele); } catch (e) { console.warn('picos', e); }

  onStep('Provincia y país');
  let admin = {};
  try { admin = await adminAt(cLat, cLon); } catch (e) { }
  return { places, waters, boundaries, farPeaks, admin };
}

// Términos municipales en un punto (en línea)
// Municipio, comarca, provincia… Primero Nominatim (usa los límites municipales de OpenStreetMap y
// responde rápido); si falla, Overpass; si también falla, Photon (menos fiable: lo marca como aproximado).
export async function adminAt(lat, lon) {
  try { const r = await adminNominatim(lat, lon); if (r.municipio || r.pais) return r; } catch (e) { }
  try { return await adminOverpass(lat, lon); }
  catch (e) {
    const r = await adminPhoton(lat, lon).catch(() => null);
    if (r && (r.municipio || r.pais)) return r;
    throw e;
  }
}
export async function adminNominatim(lat, lon) {
  // zoom=10: el resultado es el término municipal que contiene el punto
  const d = await getJSON(`https://nominatim.openstreetmap.org/reverse?lat=${lat.toFixed(5)}&lon=${lon.toFixed(5)}&zoom=10&format=jsonv2&accept-language=es`, {}, 8000);
  return parseNominatimAdmin(d);
}
export function parseNominatimAdmin(d) {
  if (!d || d.error) return {};
  const a = d.address || {};
  const isMuni = d.category === 'boundary' || ['village', 'town', 'city', 'municipality', 'hamlet'].includes(d.addresstype);
  return {
    municipio: (isMuni ? d.name : null) || a.municipality || a.city || a.town || a.village || null,
    comarca: a.county && a.county !== a.province ? a.county : null,
    provincia: a.province || a.county || null, region: a.state || null, pais: a.country || null,
    cc: a.country_code ? a.country_code.toUpperCase() : null,
  };
}
export async function adminPhoton(lat, lon) {
  const d = await getJSON(`https://photon.komoot.io/reverse?lat=${lat.toFixed(5)}&lon=${lon.toFixed(5)}&limit=1`, {}, 8000);
  return parsePhotonAdmin(d);
}
export function parsePhotonAdmin(d) {
  const p = d?.features?.[0]?.properties;
  if (!p) return {};
  // Si el resultado ES el término municipal (admin_level 8), su nombre es el municipio;
  // el campo «city» de Photon a veces trae otro pueblo de la comarca (p. ej. Benabarre en vez de Bonansa).
  const muni = p.extra?.admin_level === '8' || p.osm_key === 'boundary' ? p.name : (p.osm_value === 'village' || p.osm_value === 'town' || p.osm_value === 'city') ? p.name : (p.city || p.town || p.village || null);
  return { municipio: muni, provincia: p.county || null, region: p.state || null, pais: p.country || null, aprox: true };
}
async function adminOverpass(lat, lon) {
  const q = `[out:json][timeout:15];is_in(${lat},${lon})->.a;rel(pivot.a)["boundary"="administrative"]["admin_level"~"^(2|4|6|7|8)$"];out tags;`;
  const d = await overpass(q, 15000, { stagger: 4000 });
  const out = {};
  for (const el of d.elements) {
    const l = +el.tags.admin_level, n = el.tags['name:es'] || el.tags.name;
    if (l === 8) out.municipio = el.tags.name;
    if (l === 7) out.comarca = el.tags.name;
    if (l === 6) out.provincia = n;
    if (l === 4) out.region = n;
    if (l === 2) out.pais = n;
  }
  return out;
}

// Nombres cercanos. OpenStreetMap completo (Overpass) si contesta en unos segundos;
// si no, los mismos datos de OpenStreetMap a través de Photon, que es mucho más rápido.
export async function placesAround(lat, lon, radius = 5000, { wait = 4000 } = {}) {
  const area = `around:${radius},${lat},${lon}`;
  const q = `[out:json][timeout:20];(${PLACE_FILTER(area)});out center tags;way["waterway"~"^(river|stream)$"]["name"](around:2000,${lat},${lon});out geom;`;
  const ctl = new AbortController();
  const osm = overpass(q, 20000, { stagger: 4000, signal: ctl.signal }).then(d => ({ ...parsePlaces(d.elements), source: 'OpenStreetMap' }));
  osm.catch(() => { });
  const quick = await Promise.race([osm.catch(() => null), new Promise(r => setTimeout(() => r('tarde'), wait))]);
  if (quick && quick !== 'tarde') return quick;
  try {
    const p = await photonAround(lat, lon, radius / 1000);
    if (p.places.length || p.waters.length) { ctl.abort(); return p; }
  } catch (e) { }
  return await osm; // último intento: esperar a Overpass (o su error)
}
const PHOTON_TAGS = ['natural:peak', 'natural:saddle', 'natural:spring', 'natural:cave_entrance', 'natural:valley', 'natural:ridge', 'natural:cliff', 'natural:water', 'natural:tree', 'place:village', 'place:hamlet', 'place:isolated_dwelling', 'place:farm', 'place:locality', 'tourism:viewpoint', 'tourism:alpine_hut', 'tourism:wilderness_hut', 'amenity:shelter', 'mountain_pass', 'waterway:river', 'waterway:stream'];
export async function photonAround(lat, lon, km = 6) {
  const base = `https://photon.komoot.io/reverse?lat=${lat.toFixed(5)}&lon=${lon.toFixed(5)}&radius=${km}&limit=50`;
  // dos consultas: todo lo cercano y, aparte, picos (si no, los picos quedan fuera de los 50 más próximos)
  const [all, peaks] = await Promise.all([
    getJSON(base + '&' + PHOTON_TAGS.map(t => 'osm_tag=' + t).join('&'), {}, 8000),
    getJSON(base + '&osm_tag=natural:peak&limit=20', {}, 8000).catch(() => null),
  ]);
  return { ...parsePhotonPlaces([...(all?.features || []), ...(peaks?.features || [])]), source: 'OpenStreetMap (vía Photon)' };
}
export function parsePhotonPlaces(features) {
  const places = [], waters = [], seen = new Set();
  for (const f of features) {
    const p = f.properties || {}, c = f.geometry?.coordinates;
    if (!p.name || !c) continue;
    const key = p.osm_type + p.osm_id;
    if (seen.has(key)) continue; seen.add(key);
    const [lon, lat] = c;
    if (p.osm_key === 'waterway') {
      if (waters.some(w => w.name === p.name)) continue;
      waters.push({ name: p.name, kind: p.osm_value === 'river' ? 'río' : 'barranco', pts: [[lat, lon]] });
      continue;
    }
    places.push({ name: p.name, lat, lon, kind: kindOf({ [p.osm_key]: p.osm_value }), ele: null });
  }
  return { places, waters };
}

// Picos con nombre y altitud alrededor de un punto.
// Primero OpenStreetMap (Overpass); si no responde, Wikidata (menos picos, pero cobertura mundial).
// Devuelve { peaks, source }. Si ninguna fuente responde, lanza el error (no es lo mismo que «no hay picos»).
export let OSM_BUDGET_MS = 15000;
export const _setOsmBudget = ms => { OSM_BUDGET_MS = ms; }; // solo para las pruebas
export async function peaksAround(lat, lon, radius = 50000, { signal, onStep } = {}) {
  const q = `[out:json][timeout:25];node["natural"~"^(peak|volcano)$"]["name"]["ele"](around:${radius},${lat},${lon});out qt;`;
  let osmErr;
  // Como mucho 15 s para OpenStreetMap (entre todos sus servidores); después, la alternativa
  const budget = new AbortController();
  const onOuter = () => budget.abort();
  signal?.addEventListener('abort', onOuter);
  const timer = setTimeout(() => budget.abort(), OSM_BUDGET_MS);
  try {
    onStep?.('Consultando OpenStreetMap…');
    const peaks = parsePlaces((await overpass(q, 15000, { signal: budget.signal, stagger: 4000 })).elements).places.filter(p => Number.isFinite(p.ele));
    return { peaks, source: 'OpenStreetMap' };
  } catch (e) {
    if (signal?.aborted) throw e;
    osmErr = e instanceof SourceError ? e : new SourceError('timeout', 'OpenStreetMap no respondió a tiempo');
  } finally { clearTimeout(timer); signal?.removeEventListener('abort', onOuter); }
  try {
    onStep?.('OpenStreetMap no responde; probando con Wikidata…');
    return { peaks: await wikidataPeaks(lat, lon, radius / 1000, { signal }), source: 'Wikidata', osmError: osmErr };
  } catch (e) {
    if (signal?.aborted) throw e;
    throw osmErr;
  }
}

// Montañas de Wikidata con coordenadas y altitud (P2044) en un radio (km)
export async function wikidataPeaks(lat, lon, km, { signal } = {}) {
  const sparql = `SELECT ?item ?itemLabel ?coord ?ele WHERE {
    SERVICE wikibase:around { ?item wdt:P625 ?coord . bd:serviceParam wikibase:center "Point(${lon} ${lat})"^^geo:wktLiteral . bd:serviceParam wikibase:radius "${Math.min(km, 100)}" . }
    ?item wdt:P31/wdt:P279* wd:Q8502 . ?item wdt:P2044 ?ele .
    SERVICE wikibase:label { bd:serviceParam wikibase:language "es,ca,eu,gl,fr,it,de,en". }
  } ORDER BY DESC(?ele) LIMIT 400`;
  const d = await getJSON('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(sparql), { signal, headers: { Accept: 'application/sparql-results+json' } }, 20000);
  return parseWikidataPeaks(d);
}
export function parseWikidataPeaks(d) {
  const out = [];
  for (const b of d?.results?.bindings || []) {
    const m = /Point\(([-\d.]+) ([-\d.]+)\)/.exec(b.coord?.value || '');
    const name = b.itemLabel?.value;
    const ele = parseFloat(b.ele?.value);
    // sin etiqueta en ningún idioma, Wikidata devuelve el código Q…: no sirve como nombre
    if (!m || !name || /^Q\d+$/.test(name) || !Number.isFinite(ele)) continue;
    out.push({ name, lat: +m[2], lon: +m[1], kind: 'pico', ele });
  }
  return out;
}

// --- Buscar lugares en cualquier país ---
// Photon (OpenStreetMap, sin clave) y, si falla, el buscador de Open-Meteo (GeoNames).
export async function searchPlaces(q, { near, signal } = {}) {
  q = q.trim();
  if (q.length < 2) return { results: [], source: null };
  try {
    const bias = near ? `&lat=${near.lat.toFixed(3)}&lon=${near.lon.toFixed(3)}` : '';
    const d = await getJSON(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=10${bias}`, { signal }, 8000);
    return { results: parsePhoton(d), source: 'OpenStreetMap (Photon)' };
  } catch (e) {
    if (signal?.aborted) throw e;
    const d = await getJSON(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=10&language=es`, { signal }, 8000);
    return { results: parseOpenMeteoGeo(d), source: 'GeoNames (Open-Meteo)' };
  }
}
export function parsePhoton(d) {
  return (d?.features || []).filter(f => f.geometry?.coordinates && f.properties?.name).map(f => {
    const p = f.properties, [lon, lat] = f.geometry.coordinates;
    const where = [p.city || p.county, p.state, p.country].filter((x, i, a) => x && a.indexOf(x) === i && x !== p.name).join(', ');
    return { name: p.name, lat, lon, kind: PHOTON_KIND[p.osm_value] || '', where, cc: p.countrycode || null };
  });
}
const PHOTON_KIND = { peak: 'pico', volcano: 'volcán', saddle: 'collado', village: 'pueblo', town: 'población', city: 'ciudad', hamlet: 'aldea', water: 'agua', lake: 'lago', valley: 'valle', viewpoint: 'mirador', alpine_hut: 'refugio', spring: 'fuente', forest: 'bosque', wood: 'bosque', ridge: 'cresta', glacier: 'glaciar', nature_reserve: 'espacio protegido', national_park: 'parque nacional' };
export function parseOpenMeteoGeo(d) {
  return (d?.results || []).map(r => ({ name: r.name, lat: r.latitude, lon: r.longitude, kind: r.feature_code?.startsWith('PPL') ? 'población' : r.feature_code === 'MT' || r.feature_code === 'PK' ? 'pico' : '', where: [r.admin2, r.admin1, r.country].filter(Boolean).join(', '), cc: r.country_code || null, ele: r.elevation ?? null }));
}

// --- Geología fuera de España: Macrostrat (mapas geológicos mundiales a escala regional, CC BY 4.0) ---
export async function macrostratAt(lat, lon) {
  const d = await getJSON(`https://macrostrat.org/api/v2/geologic_units/map?lat=${lat.toFixed(5)}&lng=${lon.toFixed(5)}&scale=medium`, {}, 15000);
  const u = (d?.success?.data || [])[0];
  if (!u) return null;
  const fields = [['Unidad', u.name], ['Litología', u.lith], ['Edad', [u.b_int_name, u.t_int_name].filter((x, i, a) => x && a.indexOf(x) === i).join(' – ')], ['Descripción', u.descrip]]
    .filter(([, v]) => v && String(v).trim()).map(([k, v]) => [k, String(v).slice(0, 300)]);
  return { layer: 'Macrostrat', value: u.name, fields, ref: u.ref?.ref_title || null };
}

// --- Especies observadas cerca, en una sola consulta (iNaturalist, grado investigación) ---
export async function inatTop(lat, lon, radiusKm = 10) {
  const u = `https://api.inaturalist.org/v1/observations/species_counts?lat=${lat.toFixed(4)}&lng=${lon.toFixed(4)}&radius=${radiusKm}&quality_grade=research&locale=es&per_page=40`;
  const d = await getJSON(u, {}, 15000);
  const out = {};
  for (const r of d.results || []) {
    const g = r.taxon?.iconic_taxon_name;
    if (!INAT_GROUPS[g]) continue;
    (out[g] ||= []).push({ sci: r.taxon.name, common: r.taxon.preferred_common_name || '', count: r.count, photo: r.taxon.default_photo?.square_url || null, id: r.taxon.id });
  }
  return out;
}

// Altitud (modelo Copernicus 90 m vía Open-Meteo); hasta 100 puntos por llamada
export async function elevations(points) {
  const out = [];
  for (let i = 0; i < points.length; i += 100) {
    const ch = points.slice(i, i + 100);
    const u = `https://api.open-meteo.com/v1/elevation?latitude=${ch.map(p => p[0].toFixed(5)).join(',')}&longitude=${ch.map(p => p[1].toFixed(5)).join(',')}`;
    const d = await getJSON(u);
    out.push(...d.elevation);
  }
  return out;
}

export async function elevGrid(b, n = 30) {
  const pts = [];
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++)
    pts.push([b.s + (b.n - b.s) * j / (n - 1), b.w + (b.e - b.w) * i / (n - 1)]);
  const values = await elevations(pts);
  return { n, bbox: b, values };
}

export function gridValue(g, lat, lon) {
  const { n, bbox: b, values } = g;
  const fx = (lon - b.w) / (b.e - b.w) * (n - 1), fy = (lat - b.s) / (b.n - b.s) * (n - 1);
  if (fx < 0 || fy < 0 || fx > n - 1 || fy > n - 1) return null;
  const x0 = Math.floor(fx), y0 = Math.floor(fy), x1 = Math.min(n - 1, x0 + 1), y1 = Math.min(n - 1, y0 + 1);
  const tx = fx - x0, ty = fy - y0, v = (x, y) => values[y * n + x];
  return (v(x0, y0) * (1 - tx) + v(x1, y0) * tx) * (1 - ty) + (v(x0, y1) * (1 - tx) + v(x1, y1) * tx) * ty;
}

// Anillos de 8 puntos (N, NE, E…) a varias distancias: los cercanos dan la pendiente y su orientación;
// los lejanos, si estás en el fondo, a media ladera o en lo alto.
export const RING_RADII = [150, 400, 1000, 2500];
export function ringPoints(lat, lon) {
  const pts = [[lat, lon]];
  for (const d of RING_RADII) for (let a = 0; a < 360; a += 45) pts.push(destination(lat, lon, a, d));
  return pts;
}
const toRings = vals => RING_RADII.map((_, i) => vals.slice(1 + i * 8, 9 + i * 8));

export async function terrainOnline(lat, lon) {
  const el = await elevations(ringPoints(lat, lon));
  return { ele: el[0], rings: toRings(el), radii: RING_RADII, src: 'online' };
}

// Desde la malla de una zona preparada (más gruesa: la pendiente es menos fina)
export function terrainFromGrid(g, lat, lon) {
  const pts = ringPoints(lat, lon).map(p => gridValue(g, p[0], p[1]));
  if (pts[0] == null || pts.some(v => v == null)) return null;
  return { ele: pts[0], rings: toRings(pts), radii: RING_RADII, src: 'grid' };
}

// Tiempo (Open-Meteo, modelos de AEMET/Météo-France/ECMWF combinados)
export async function forecast(lat, lon, ele) {
  const u = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}` + (ele != null ? `&elevation=${Math.round(ele)}` : '') +
    `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,cloud_cover,weather_code` +
    `&hourly=temperature_2m,cloud_cover,wind_speed_10m,precipitation_probability,snowfall,freezing_level_height,weather_code` +
    `&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,weather_code,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=7`;
  const d = await getJSON(u);
  d.fetchedAt = Date.now();
  return d;
}

// Geología bajo un punto (IGME, MAGNA 1:50.000; solo España). Capa 11 = litologías.
// (La capa 0 es el índice de hojas: devolvía el nombre de la hoja, p. ej. «El Pont de Suert», no la roca.)
export async function geologyAt(lat, lon) {
  const ext = `${lon - 0.01},${lat - 0.01},${lon + 0.01},${lat + 0.01}`;
  const u = `${IGME_REST}/identify?geometry=${lon},${lat}&geometryType=esriGeometryPoint&sr=4326&layers=all:11&tolerance=1&mapExtent=${ext}&imageDisplay=400,400,96&returnGeometry=false&f=json`;
  const d = await getJSON(u, {}, 20000);
  const res = (d.results || [])[0];
  if (!res) return null;
  const skip = /^(objectid|shape|fid|id|hoja|ogc|st_|gid)/i;
  const fields = Object.entries(res.attributes || {}).filter(([k, v]) => !skip.test(k) && v && String(v).trim() && String(v) !== 'Null' && !/^\d+(\.\d+)?$/.test(String(v)));
  return { layer: res.layerName, value: res.value, fields };
}
export const igmeViewer = (lat, lon) => `https://info.igme.es/visor/?Configuracion=magna&Extension=${lon - 0.03},${lat - 0.02},${lon + 0.03},${lat + 0.02},4326`;

// Especies observadas por la gente (iNaturalist, grado investigación)
export const INAT_GROUPS = { Mammalia: 'Mamíferos', Aves: 'Aves', Plantae: 'Plantas', Reptilia: 'Reptiles', Amphibia: 'Anfibios', Insecta: 'Insectos', Fungi: 'Hongos' };
export async function inatSpecies(lat, lon, radiusKm = 10) {
  const out = {};
  for (const g of Object.keys(INAT_GROUPS)) {
    try {
      const u = `https://api.inaturalist.org/v1/observations/species_counts?lat=${lat.toFixed(4)}&lng=${lon.toFixed(4)}&radius=${radiusKm}&iconic_taxa=${g}&quality_grade=research&locale=es&per_page=25`;
      const d = await getJSON(u, {}, 20000);
      out[g] = d.results.map(r => ({ sci: r.taxon.name, common: r.taxon.preferred_common_name || '', count: r.count, photo: r.taxon.default_photo?.square_url || null, id: r.taxon.id }));
    } catch (e) { out[g] = []; }
  }
  return out;
}

// Pl@ntNet (identificación de plantas por foto). Gratis hasta 500 al día con tu propia clave.
export async function plantnet(blob, key, organ = 'auto') {
  const fd = new FormData();
  fd.append('images', blob, 'foto.jpg');
  fd.append('organs', organ);
  const u = `https://my-api.plantnet.org/v2/identify/all?api-key=${encodeURIComponent(key)}&lang=es&nb-results=5&include-related-images=false`;
  const r = await fetch(u, { method: 'POST', body: fd, signal: AbortSignal.timeout?.(45000) });
  if (!r.ok) {
    const txt = await r.text().catch(() => '');
    throw new Error(r.status === 401 ? 'Clave de Pl@ntNet no válida' : r.status === 429 ? 'Has superado el cupo diario de Pl@ntNet' : r.status === 404 ? 'Pl@ntNet no reconoce ninguna planta en la foto' : `Pl@ntNet respondió ${r.status} ${txt.slice(0, 80)}`);
  }
  const d = await r.json();
  return (d.results || []).map(x => ({ score: x.score, sci: x.species.scientificNameWithoutAuthor, common: (x.species.commonNames || [])[0] || '', family: x.species.family?.scientificNameWithoutAuthor || '' }));
}
