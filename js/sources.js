// Fuentes de datos públicas y gratuitas. Ninguna necesita cuenta salvo Pl@ntNet (opcional).
import { assembleRings, simplify, destination } from './geo.js';

const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
const IGME_REST = 'https://mapas.igme.es/gis/rest/services/Cartografia_Geologica/IGME_MAGNA_50/MapServer';

export const online = () => navigator.onLine !== false;

async function getJSON(url, opts = {}, ms = 25000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { ...opts, signal: ctl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } finally { clearTimeout(t); }
}

export async function overpass(query, ms = 60000) {
  let lastErr;
  for (const ep of OVERPASS) {
    try {
      return await getJSON(ep, { method: 'POST', body: 'data=' + encodeURIComponent(query), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }, ms);
    } catch (e) { lastErr = e; }
  }
  throw lastErr;
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

function parsePlaces(elements) {
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
  const d1 = await overpass(q1, 100000);
  const { places, waters } = parsePlaces(d1.elements);

  onStep('Términos municipales y comarcas');
  const q2 = `[out:json][timeout:120];rel["boundary"="administrative"]["admin_level"~"^(7|8)$"](${bb});out geom;`;
  let boundaries = [];
  try { boundaries = parseBoundaries((await overpass(q2, 130000)).elements); } catch (e) { console.warn('límites', e); }

  onStep('Picos lejanos (para la brújula, 50 km)');
  const cLat = (b.s + b.n) / 2, cLon = (b.w + b.e) / 2;
  const q3 = `[out:json][timeout:90];node["natural"~"^(peak|volcano)$"]["name"](around:50000,${cLat},${cLon});out;`;
  let farPeaks = [];
  try { farPeaks = parsePlaces((await overpass(q3, 100000)).elements).places.filter(p => p.ele); } catch (e) { console.warn('picos', e); }

  onStep('Provincia y país');
  let admin = {};
  try { admin = await adminAt(cLat, cLon); } catch (e) { }
  return { places, waters, boundaries, farPeaks, admin };
}

// Términos municipales en un punto (en línea)
export async function adminAt(lat, lon) {
  const q = `[out:json][timeout:25];is_in(${lat},${lon})->.a;rel(pivot.a)["boundary"="administrative"]["admin_level"~"^(2|4|6|7|8)$"];out tags;`;
  const d = await overpass(q, 30000);
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

export async function placesAround(lat, lon, radius = 5000) {
  const area = `around:${radius},${lat},${lon}`;
  const q = `[out:json][timeout:40];(${PLACE_FILTER(area)});out center tags;way["waterway"~"^(river|stream)$"]["name"](around:2000,${lat},${lon});out geom;`;
  return parsePlaces((await overpass(q, 45000)).elements);
}

export async function peaksAround(lat, lon, radius = 50000) {
  const q = `[out:json][timeout:60];node["natural"~"^(peak|volcano)$"]["name"](around:${radius},${lat},${lon});out;`;
  return parsePlaces((await overpass(q, 65000)).elements).places.filter(p => p.ele);
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

// Puntos en anillos a 1 y 2,5 km para saber si estás en hondonada o en loma
export function ringPoints(lat, lon) {
  const pts = [[lat, lon]];
  for (const d of [1000, 2500]) for (let a = 0; a < 360; a += 45) pts.push(destination(lat, lon, a, d));
  return pts;
}

export async function terrainOnline(lat, lon) {
  const el = await elevations(ringPoints(lat, lon));
  return { ele: el[0], ring: el.slice(1) };
}

export function terrainFromGrid(g, lat, lon) {
  const pts = ringPoints(lat, lon).map(p => gridValue(g, p[0], p[1]));
  if (pts[0] == null) return null;
  const ring = pts.slice(1).filter(v => v != null);
  if (ring.length < 8) return null;
  return { ele: pts[0], ring };
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

// Geología bajo un punto (IGME, MAGNA 1:50.000; solo España)
export async function geologyAt(lat, lon) {
  const ext = `${lon - 0.01},${lat - 0.01},${lon + 0.01},${lat + 0.01}`;
  const u = `${IGME_REST}/identify?geometry=${lon},${lat}&geometryType=esriGeometryPoint&sr=4326&layers=all:0&tolerance=1&mapExtent=${ext}&imageDisplay=400,400,96&returnGeometry=false&f=json`;
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
  const r = await fetch(u, { method: 'POST', body: fd });
  if (!r.ok) {
    const txt = await r.text().catch(() => '');
    throw new Error(r.status === 401 ? 'Clave de Pl@ntNet no válida' : r.status === 429 ? 'Has superado el cupo diario de Pl@ntNet' : r.status === 404 ? 'Pl@ntNet no reconoce ninguna planta en la foto' : `Pl@ntNet respondió ${r.status} ${txt.slice(0, 80)}`);
  }
  const d = await r.json();
  return (d.results || []).map(x => ({ score: x.score, sci: x.species.scientificNameWithoutAuthor, common: (x.species.commonNames || [])[0] || '', family: x.species.family?.scientificNameWithoutAuthor || '' }));
}
