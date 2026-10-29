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

// ¿Qué base usar por defecto según dónde estés? (Francia al norte de la divisoria, a grandes rasgos)
export function likelyFrance(lat, lon) {
  if (lat > 43.4) return true;
  if (lat < 42.3) return false;
  // aproximación de la frontera pirenaica: de Hendaya (43.37,-1.79) a Portbou (42.43,3.16)
  const borderLat = 43.37 + (lon + 1.79) * (42.43 - 43.37) / (3.16 + 1.79);
  return lat > borderLat + 0.08;
}
