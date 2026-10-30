// Utilidades geográficas: distancias, rumbos, teselas, polígonos.
const R = 6371008.8;
const toRad = d => d * Math.PI / 180;
const toDeg = r => r * 180 / Math.PI;

export function distance(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function bearing(lat1, lon1, lat2, lon2) {
  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export function destination(lat, lon, brg, dist) {
  const d = dist / R, b = toRad(brg), p1 = toRad(lat), l1 = toRad(lon);
  const p2 = Math.asin(Math.sin(p1) * Math.cos(d) + Math.cos(p1) * Math.sin(d) * Math.cos(b));
  const l2 = l1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(p1), Math.cos(d) - Math.sin(p1) * Math.sin(p2));
  return [toDeg(p2), ((toDeg(l2) + 540) % 360) - 180];
}

const DIRS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
export const dirName = b => DIRS[Math.round(b / 22.5) % 16];
const DIRS_LONG = { N: 'al norte', NE: 'al nordeste', E: 'al este', SE: 'al sureste', S: 'al sur', SO: 'al suroeste', O: 'al oeste', NO: 'al noroeste' };
export const dirLong = b => DIRS_LONG[['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'][Math.round(b / 45) % 8]];

export function fmtDist(m) {
  if (m < 1000) return `${Math.round(m / 10) * 10} m`;
  if (m < 10000) return `${(m / 1000).toFixed(1).replace('.', ',')} km`;
  return `${Math.round(m / 1000)} km`;
}

export const fmtNum = (n, d = 0) => Number(n).toLocaleString('es-ES', { maximumFractionDigits: d, minimumFractionDigits: d });

// Teselas Web Mercator
export function lon2tile(lon, z) { return Math.floor((lon + 180) / 360 * 2 ** z); }
export function lat2tile(lat, z) {
  const r = toRad(lat);
  return Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * 2 ** z);
}
export function tilesForBBox(b, z) {
  // b = {s, w, n, e}
  const x1 = lon2tile(b.w, z), x2 = lon2tile(b.e, z), y1 = lat2tile(b.n, z), y2 = lat2tile(b.s, z);
  const out = [];
  for (let x = x1; x <= x2; x++) for (let y = y1; y <= y2; y++) out.push({ x, y, z });
  return out;
}
export function tileBBox3857(x, y, z) {
  const size = 2 * Math.PI * 6378137 / 2 ** z, o = Math.PI * 6378137;
  return [x * size - o, o - (y + 1) * size, (x + 1) * size - o, o - y * size];
}

export function bboxAround(lat, lon, km) {
  const dLat = km / 111.32, dLon = km / (111.32 * Math.cos(toRad(lat)));
  return { s: lat - dLat, n: lat + dLat, w: lon - dLon, e: lon + dLon };
}
export const inBBox = (b, lat, lon) => lat >= b.s && lat <= b.n && lon >= b.w && lon <= b.e;
export function bboxKm(b) {
  const h = distance(b.s, b.w, b.n, b.w) / 1000, w = distance(b.s, b.w, b.s, b.e) / 1000;
  return { w, h };
}

// Punto en polígono (rings: [[lat,lon],...]; regla par-impar sobre todos los anillos)
export function pointInRings(lat, lon, rings) {
  let inside = false;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [yi, xi] = ring[i], [yj, xj] = ring[j];
      if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}

// Distancia de un punto a una polilínea (aprox. local plana)
export function distToLine(lat, lon, pts) {
  let best = Infinity;
  const kx = 111320 * Math.cos(toRad(lat)), ky = 110574;
  for (let i = 0; i < pts.length - 1; i++) {
    const ax = (pts[i][1] - lon) * kx, ay = (pts[i][0] - lat) * ky;
    const bx = (pts[i + 1][1] - lon) * kx, by = (pts[i + 1][0] - lat) * ky;
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    let t = l2 ? -(ax * dx + ay * dy) / l2 : 0;
    t = Math.max(0, Math.min(1, t));
    const px = ax + t * dx, py = ay + t * dy;
    best = Math.min(best, Math.hypot(px, py));
  }
  return best;
}

// Une las vías de una relación multipolígono en anillos cerrados
export function assembleRings(ways) {
  const segs = ways.filter(w => w && w.length > 1).map(w => w.slice());
  const rings = [];
  const key = p => p[0].toFixed(7) + ',' + p[1].toFixed(7);
  while (segs.length) {
    let ring = segs.shift();
    let guard = 0;
    while (key(ring[0]) !== key(ring[ring.length - 1]) && guard++ < 5000) {
      const end = key(ring[ring.length - 1]);
      const idx = segs.findIndex(s => key(s[0]) === end || key(s[s.length - 1]) === end);
      if (idx < 0) break;
      let s = segs.splice(idx, 1)[0];
      if (key(s[0]) !== end) s = s.reverse();
      ring = ring.concat(s.slice(1));
    }
    if (ring.length > 3) rings.push(ring);
  }
  return rings;
}

// Simplificación Douglas-Peucker ligera (para guardar fronteras sin ocupar mucho)
export function simplify(pts, tol = 0.0002) {
  if (pts.length < 4) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let maxD = 0, idx = -1;
    const [y1, x1] = pts[a], [y2, x2] = pts[b];
    const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy);
    for (let i = a + 1; i < b; i++) {
      const d = l < 1e-12 ? Math.hypot(pts[i][0] - y1, pts[i][1] - x1) : Math.abs(dy * pts[i][1] - dx * pts[i][0] + x2 * y1 - y2 * x1) / l;
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > tol && idx > 0) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
