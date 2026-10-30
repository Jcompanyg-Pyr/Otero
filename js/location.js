// Tu posición real (GPS del móvil), con su precisión y su hora. No confundir con
// el punto seleccionado en el mapa (state.lastPoint) ni con el centro del mapa.
import { state } from './state.js';
import { fmtNum } from './geo.js';

export const GOOD_ACC = 30;      // m: a partir de aquí dejamos de esperar
export const APPROX_ACC = 500;   // m: por encima, la posición es aproximada (wifi/antenas o «Ubicación exacta» apagada)
export const STALE_MS = 5 * 60e3;

export function quality(acc) {
  if (acc == null) return 'desconocida';
  if (acc <= 50) return 'precisa';
  if (acc <= APPROX_ACC) return 'aceptable';
  return 'aproximada';
}

export const fmtAcc = acc => acc == null ? '¿?' : acc < 1000 ? `±${Math.round(acc)} m` : `±${fmtNum(acc / 1000, acc < 10000 ? 1 : 0)} km`;

export function fmtAge(t, now = Date.now()) {
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 60) return 'ahora mismo';
  if (s < 3600) return `hace ${Math.round(s / 60)} min`;
  return `a las ${new Date(t).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
}

export const isFresh = (me, ms = STALE_MS) => !!me && Date.now() - me.t < ms;

const MSG = {
  1: 'Sin permiso de ubicación. En el iPhone: Ajustes → Privacidad y seguridad → Localización → Safari (o «Sitios web de Safari») → «Mientras se usa», y activa «Ubicación exacta».',
  2: 'El móvil no consigue tu posición. Sal al aire libre o comprueba que la Localización esté activada.',
  3: 'El GPS no ha respondido a tiempo. Prueba al aire libre y vuelve a intentarlo.',
};

export class LocationError extends Error {
  constructor(code) { super(MSG[code] || MSG[2]); this.code = code; }
}

// Escucha el GPS unos segundos y se queda con la lectura más precisa.
// La primera lectura del iPhone suele venir de wifi/antenas (cientos de metros o kilómetros de error).
export function locate({ maxWait = 15000, goodAcc = GOOD_ACC, onProgress, geo = navigator.geolocation } = {}) {
  return new Promise((res, rej) => {
    if (!geo) return rej(new Error('Este navegador no da la ubicación'));
    let best = null, done = false, id = null, timer = null;
    const finish = err => {
      if (done) return; done = true;
      clearTimeout(timer);
      if (id != null) geo.clearWatch(id);
      if (best) { state.me = best; res(best); } else rej(err || new LocationError(3));
    };
    id = geo.watchPosition(pos => {
      const c = pos.coords;
      const fix = { lat: c.latitude, lon: c.longitude, acc: c.accuracy, alt: c.altitude, altAcc: c.altitudeAccuracy, t: pos.timestamp || Date.now(), source: 'gps' };
      if (!Number.isFinite(fix.lat) || !Number.isFinite(fix.lon)) return;
      if (!best || fix.acc <= best.acc || fix.t - best.t > 30e3) best = fix;
      onProgress?.(best);
      if (best.acc <= goodAcc) finish();
    }, err => {
      // Denegado: no hay nada que esperar. Otros errores: si ya tenemos algo, nos quedamos con eso.
      if (err.code === 1 || !best) finish(new LocationError(err.code));
    }, { enableHighAccuracy: true, maximumAge: 0, timeout: maxWait });
    timer = setTimeout(() => finish(), maxWait);
  });
}

// Estado del permiso, si el navegador lo deja saber ('granted' | 'denied' | 'prompt' | null)
export async function permissionState() {
  try { return (await navigator.permissions.query({ name: 'geolocation' })).state; } catch (e) { return null; }
}

// Descripción breve para mostrar: «±12 m · ahora mismo»
export const describeFix = me => `${fmtAcc(me.acc)} · ${fmtAge(me.t)}`;
