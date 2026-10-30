// Capas del mapa. Las marcadas como "offline" se pueden descargar para usar sin cobertura.
import { tileBBox3857 } from './geo.js';

const ignWMTS = (svc, layer, fmt) => (x, y, z) =>
  `https://www.ign.es/wmts/${svc}?request=GetTile&service=WMTS&version=1.0.0&layer=${layer}&style=default&tilematrixset=GoogleMapsCompatible&TileMatrix=${z}&TileCol=${x}&TileRow=${y}&format=${fmt}`;
const geopf = (layer, fmt) => (x, y, z) =>
  `https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layer}&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX=${z}&TILEROW=${y}&TILECOL=${x}&FORMAT=${fmt}`;
const igmeWMS = (x, y, z) => {
  const b = tileBBox3857(x, y, z).map(v => v.toFixed(2)).join(',');
  return `https://mapas.igme.es/gis/services/Cartografia_Geologica/IGME_MAGNA_50/MapServer/WMSServer?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=0&STYLES=&CRS=EPSG:3857&BBOX=${b}&WIDTH=256&HEIGHT=256&FORMAT=image/png&TRANSPARENT=TRUE`;
};

export const BASES = {
  sat: { name: 'Satélite (PNOA, España)', url: ignWMTS('pnoa-ma', 'OI.OrthoimageCoverage', 'image/jpeg'), max: 19, offline: [11, 16], attr: 'PNOA © IGN España' },
  topo: { name: 'Topográfico (IGN, España)', url: ignWMTS('mapa-raster', 'MTN', 'image/jpeg'), max: 18, offline: [11, 15], attr: 'MTN © IGN España' },
  satfr: { name: 'Satélite (IGN Francia)', url: geopf('ORTHOIMAGERY.ORTHOPHOTOS', 'image/jpeg'), max: 19, offline: [11, 16], attr: 'Orthophotos © IGN France' },
  topofr: { name: 'Topográfico (IGN Francia)', url: geopf('GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2', 'image/png'), max: 18, offline: [11, 15], attr: 'Plan IGN © IGN France' },
  otm: { name: 'Topo mundial (solo con cobertura)', url: (x, y, z) => `https://tile.opentopomap.org/${z}/${x}/${y}.png`, max: 17, offline: null, attr: '© OpenTopoMap (CC-BY-SA), © OpenStreetMap' },
};
export const OVERLAYS = {
  geo: { name: 'Geología (IGME 1:50.000)', url: igmeWMS, max: 18, offline: [11, 14], opacity: 0.55, attr: 'MAGNA 50 © IGME-CSIC' },
};

export function makeLayer(L, def, extra = {}) {
  const Layer = L.TileLayer.extend({ getTileUrl(c) { return def.url(c.x, c.y, c.z); } });
  return new Layer('', { maxZoom: 19, maxNativeZoom: def.max, attribution: def.attr, opacity: def.opacity ?? 1, ...extra });
}

// ¿En qué país cae un punto? Aproximación con cajas (sirve para elegir capas, no para fronteras exactas).
// aproximación de la frontera pirenaica: de Hendaya (43.37,-1.79) a Portbou (42.43,3.16)
const pyreneesBorderLat = lon => 43.37 + (lon + 1.79) * (42.43 - 43.37) / (3.16 + 1.79);
export function inFrance(lat, lon) {
  if (lat < 42.3 || lat > 51.15 || lon < -5.2 || lon > 8.3) return lat >= 41.3 && lat <= 43.1 && lon >= 8.5 && lon <= 9.6; // Córcega
  if (lat < 43.4 && lon > -1.8 && lon < 3.3) return lat > pyreneesBorderLat(lon) + 0.08;
  if (lat < 43.4 && lon <= -1.8) return false; // País Vasco español
  return true;
}
export function inSpain(lat, lon) {
  if (lat >= 27.6 && lat <= 29.5 && lon >= -18.2 && lon <= -13.4) return true; // Canarias
  if (lat < 35.9 || lat > 43.8 || lon < -9.4 || lon > 4.4) return false;
  if (lat > 36.9 && lat < 41.87 && lon < portugalBorderLon(lat)) return false; // Portugal (aprox.)
  if (lon < -7.6 && lat <= 36.9) return false;
  return !inFrance(lat, lon);
}
// Frontera hispano-portuguesa simplificada: longitud de la raya según la latitud
const PT_BORDER = [[36.9, -7.42], [37.2, -7.42], [38.0, -6.95], [38.8, -7.05], [39.6, -7.5], [40.0, -6.95], [41.0, -6.9], [41.87, -6.2]];
function portugalBorderLon(lat) {
  for (let i = 1; i < PT_BORDER.length; i++) {
    const [a, la] = PT_BORDER[i - 1], [b, lb] = PT_BORDER[i];
    if (lat <= b) return la + (lb - la) * (lat - a) / (b - a);
  }
  return -6.2;
}
// Compatibilidad con el código anterior
export const likelyFrance = (lat, lon) => inFrance(lat, lon);

// ¿Cubre esta capa ese punto? (las de IGN/IGME solo su país; OpenTopoMap, todo el mundo)
export function covers(key, lat, lon) {
  if (key === 'sat' || key === 'topo' || key === 'geo') return inSpain(lat, lon);
  if (key === 'satfr' || key === 'topofr') return inFrance(lat, lon);
  return true;
}
// Fondo recomendado para un punto
export const baseFor = (lat, lon) => inSpain(lat, lon) ? 'sat' : inFrance(lat, lon) ? 'satfr' : 'otm';
