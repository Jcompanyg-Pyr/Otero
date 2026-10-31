// Mediciones propias: compararlas con lo que preveía el modelo y entre sí.
// Objetivo: comprobar con datos reales dónde se acumula el aire frío (inversiones) y cómo cambia la
// temperatura con la altitud, la orientación y el relieve en tu terreno.
import { getJSON, online } from './sources.js';
import { fmtNum } from './geo.js';
import { html, raw } from './ui.js';

// Gradiente medio de la atmósfera: unos 0,65 °C menos cada 100 m de subida
export const LAPSE = 0.0065;

// ---------- Lo que preveía el modelo ----------
// Open-Meteo, ajustado a la altitud del punto. Sirve para horas pasadas (hasta ~3 meses).
export async function modelAt(lat, lon, ele, t) {
  const days = Math.min(92, Math.max(1, Math.ceil((Date.now() - t) / 86400e3) + 1));
  const u = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}${ele != null ? `&elevation=${Math.round(ele)}` : ''}&hourly=temperature_2m,cloud_cover,wind_speed_10m&timeformat=unixtime&past_days=${days}&forecast_days=1`;
  const d = await getJSON(u, {}, 15000);
  return modelFromHourly(d.hourly, t, 'Open-Meteo');
}
// Elige la hora más cercana (interpolando la temperatura entre las dos horas que rodean la medición)
export function modelFromHourly(h, t, src) {
  if (!h?.time?.length) return null;
  const ts = h.time.map(x => typeof x === 'number' ? x * 1000 : Date.parse(x));
  let i = ts.findIndex(x => x > t);
  if (i <= 0 || Math.abs(ts[Math.max(0, i - 1)] - t) > 2 * 3600e3) return null;
  const f = (t - ts[i - 1]) / (ts[i] - ts[i - 1]);
  const lerp = k => h[k]?.[i - 1] != null && h[k]?.[i] != null ? h[k][i - 1] + (h[k][i] - h[k][i - 1]) * f : null;
  const temp = lerp('temperature_2m');
  if (temp == null) return null;
  return { temp: Math.round(temp * 10) / 10, cloud: lerp('cloud_cover'), wind: lerp('wind_speed_10m'), src };
}
// Sin cobertura: la previsión guardada al preparar la zona (horas locales → instante real con utc_offset_seconds)
export function modelFromZone(zone, t) {
  const fc = zone?.forecast;
  if (!fc?.hourly) return null;
  const off = (fc.utc_offset_seconds || 0) * 1000;
  const h = { ...fc.hourly, time: fc.hourly.time.map(x => Date.parse(x + 'Z') - off) };
  return modelFromHourly(h, t, 'previsión guardada de la zona');
}

// ---------- ¿Es de noche? (altura aproximada del sol, fórmula sencilla de la NOAA) ----------
export function sunElevation(lat, lon, t) {
  const d = new Date(t), rad = Math.PI / 180;
  const day = (Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - Date.UTC(d.getUTCFullYear(), 0, 0)) / 86400e3;
  const g = 2 * Math.PI / 365 * (day - 1 + (d.getUTCHours() - 12) / 24);
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const eqt = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const minutes = d.getUTCHours() * 60 + d.getUTCMinutes() + eqt + 4 * lon;
  const ha = (minutes / 4 - 180) * rad;
  const cosZ = Math.sin(lat * rad) * Math.sin(decl) + Math.cos(lat * rad) * Math.cos(decl) * Math.cos(ha);
  return 90 - Math.acos(Math.max(-1, Math.min(1, cosZ))) / rad;
}

// ---------- Interpretar una medición ----------
// Devuelve { diff, level: 'ok'|'frio'|'calido', title, text } o null si no hay modelo con el que comparar
export function interpret(m) {
  if (!m.model || m.model.temp == null) return null;
  const diff = Math.round((m.temp - m.model.temp) * 10) / 10;
  const night = sunElevation(m.lat, m.lon, m.t) < -2;
  const calm = (m.model.wind ?? 99) < 10 && (m.model.cloud ?? 100) < 50;
  const low = /fondo|hondonada|ladera baja|rellano bajo|llano|paramera/i.test(m.terrain || '');
  const high = /ladera media|ladera alta|loma|cresta|cumbre/i.test(m.terrain || '');
  const n = s => fmtNum(Math.abs(s), 1);
  if (Math.abs(diff) < 1.5) return { diff, level: 'ok', title: 'Coincide con la previsión', text: `Tu termómetro y el modelo se diferencian menos de 1,5 °C: aquí, a esta hora, no había nada especial que el modelo no recogiera.` };
  if (diff < 0) {
    if (night && low && calm) return { diff, level: 'frio', title: `${n(diff)} °C más frío de lo previsto: aire frío acumulado`, text: `Noche despejada y en calma y estás en ${(m.terrain || 'una zona baja').toLowerCase()}: es lo esperable cuando el aire frío de las laderas baja y se encharca aquí (inversión térmica). El modelo no tiene resolución para «ver» estas hondonadas.` };
    if (night) return { diff, level: 'frio', title: `${n(diff)} °C más frío de lo previsto`, text: `De noche, una diferencia así suele deberse a aire frío que se acumula localmente${calm ? '' : ' (aunque el modelo daba algo de viento o nubes, que lo dificultan)'}. Mide también más arriba o más abajo para comprobarlo.` };
    return { diff, level: 'frio', title: `${n(diff)} °C más frío de lo previsto`, text: `De día puede explicarlo la sombra (umbría, bosque cerrado), el viento, la niebla o un chubasco reciente.` };
  }
  if (!night && !m.shade) return { diff, level: 'calido', title: `${n(diff)} °C más cálido de lo previsto`, text: `De día, lo más habitual es que el sol caliente el termómetro. Mide siempre a la sombra (o marca «a la sombra» al guardar) y espera 2-3 minutos.` };
  if (night && high) return { diff, level: 'calido', title: `${n(diff)} °C más templado de lo previsto`, text: `Estás en ${(m.terrain || 'zona alta').toLowerCase()}: en noches de inversión estas franjas quedan por encima del aire frío y son más templadas que el fondo del valle (el «cinturón térmico»).` };
  return { diff, level: 'calido', title: `${n(diff)} °C más cálido de lo previsto`, text: `Puede deberse a un pueblo o una roca que suelta el calor del día, a viento que mezcla el aire, o a que el termómetro aún no se había estabilizado.` };
}

// ---------- Comparar las mediciones de una misma salida ----------
// Con dos o más medidas a distinta altitud: ¿bajaba la temperatura al subir (normal) o al revés (inversión)?
export function compareSession(ms) {
  const withEle = ms.filter(m => m.ele != null);
  if (withEle.length < 2) return null;
  const lo = withEle.reduce((a, b) => (b.ele < a.ele ? b : a)), hi = withEle.reduce((a, b) => (b.ele > a.ele ? b : a));
  const dz = hi.ele - lo.ele;
  if (dz < 50) return { kind: 'plano', text: `Las mediciones están casi a la misma altitud (${fmtNum(dz)} m de diferencia): las diferencias de temperatura vienen del relieve, la orientación o la hora, no de la altura.` };
  const spanH = (Math.max(...ms.map(m => m.t)) - Math.min(...ms.map(m => m.t))) / 3600e3;
  const expected = lo.temp - dz * LAPSE;          // lo que «tocaría» arriba con el gradiente normal
  const anomaly = hi.temp - expected;             // > 0: arriba hacía más calor de lo normal
  const caveat = spanH > 3 ? ` Ojo: entre la primera y la última medición pasaron ${fmtNum(spanH, 0)} h, y la temperatura cambia también con la hora.` : '';
  if (hi.temp > lo.temp + 0.5) return { kind: 'inversion', lo, hi, dz, expected, anomaly, text: `Inversión térmica: a ${fmtNum(lo.ele)} m hacía ${fmtNum(hi.temp - lo.temp, 1)} °C MENOS que a ${fmtNum(hi.ele)} m, aunque está ${fmtNum(dz)} m más bajo. Con el gradiente normal tendría que haber hecho unos ${fmtNum(dz * LAPSE, 1)} °C más abajo, no menos.${caveat}` };
  if (anomaly > 1) return { kind: 'debil', lo, hi, dz, expected, anomaly, text: `Al subir ${fmtNum(dz)} m la temperatura bajó solo ${fmtNum(lo.temp - hi.temp, 1)} °C, menos de los ~${fmtNum(dz * LAPSE, 1)} °C habituales: hay algo de aire frío acumulado abajo (inversión débil).${caveat}` };
  if (anomaly < -1.5) return { kind: 'fuerte', lo, hi, dz, expected, anomaly, text: `Al subir ${fmtNum(dz)} m la temperatura bajó ${fmtNum(lo.temp - hi.temp, 1)} °C, más de los ~${fmtNum(dz * LAPSE, 1)} °C habituales: típico de aire muy inestable, viento en altura o sol en la parte baja.${caveat}` };
  return { kind: 'normal', lo, hi, dz, expected, anomaly, text: `Al subir ${fmtNum(dz)} m la temperatura bajó ${fmtNum(lo.temp - hi.temp, 1)} °C, lo normal (~${fmtNum(dz * LAPSE, 1)} °C): sin inversión en ese momento.${caveat}` };
}

// Gráfico sencillo: temperatura (horizontal) frente a altitud (vertical), con la línea del gradiente normal
export function sessionChart(ms) {
  const pts = ms.filter(m => m.ele != null);
  if (pts.length < 2) return '';
  const W = 300, H = 170, P = 30;
  const z0 = Math.min(...pts.map(m => m.ele)) - 50, z1 = Math.max(...pts.map(m => m.ele)) + 50;
  // línea de referencia: desde la medición más alta, bajando con el gradiente normal
  const top = pts.reduce((a, b) => (b.ele > a.ele ? b : a));
  const ref = z => top.temp + (top.ele - z) * LAPSE;
  const allT = [...pts.map(m => m.temp), ref(z0), ref(z1)];
  const t0 = Math.floor(Math.min(...allT)) - 1, t1 = Math.ceil(Math.max(...allT)) + 1;
  const x = t => P + (t - t0) / (t1 - t0) * (W - P - 10), y = z => H - P + 10 - (z - z0) / (z1 - z0) * (H - P - 10);
  return html`<svg viewBox="0 0 ${W} ${H}" class="mchart" role="img" aria-label="Temperatura frente a altitud">
    <line x1="${P}" y1="${H - P + 10}" x2="${W - 5}" y2="${H - P + 10}" stroke="#bbb"/><line x1="${P}" y1="5" x2="${P}" y2="${H - P + 10}" stroke="#bbb"/>
    <line x1="${x(ref(z0))}" y1="${y(z0)}" x2="${x(ref(z1))}" y2="${y(z1)}" stroke="#7b8b85" stroke-dasharray="4 4"/>
    ${raw(pts.map(m => `<circle cx="${x(m.temp).toFixed(1)}" cy="${y(m.ele).toFixed(1)}" r="5" fill="#c47d2c"/><text x="${(x(m.temp) + 7).toFixed(1)}" y="${(y(m.ele) + 4).toFixed(1)}" font-size="10" fill="#333">${fmtNum(m.temp, 1)}°</text>`).join(''))}
    <text x="${P}" y="${H - 4}" font-size="10" fill="#666">${fmtNum(t0, 0)} °C</text><text x="${W - 5}" y="${H - 4}" font-size="10" fill="#666" text-anchor="end">${fmtNum(t1, 0)} °C</text>
    <text x="2" y="12" font-size="10" fill="#666">${fmtNum(z1)} m</text><text x="2" y="${H - P + 8}" font-size="10" fill="#666">${fmtNum(z0)} m</text></svg>
    <p class="tiny muted" style="margin:2px 0 0">Puntos: tus mediciones. Línea discontinua: la temperatura que «tocaría» a cada altura partiendo de tu medición más alta, con el descenso normal (−0,65 °C cada 100 m). Los puntos a la izquierda de la línea estaban más fríos de lo normal: aire frío acumulado.</p>`;
}

// Completar mediciones antiguas sin dato del modelo (cuando vuelve la cobertura)
export async function backfillModels(items, save) {
  if (!online()) return 0;
  let n = 0;
  for (const m of items) {
    if (m.model || m.modelTried || Date.now() - m.t > 90 * 86400e3) continue;
    try { m.model = await modelAt(m.lat, m.lon, m.ele, m.t); m.modelTried = true; } catch (e) { continue; } // sin red: se reintentará
    await save(m); n++;
    if (n >= 10) break; // como mucho 10 por vez
  }
  return n;
}
