// Relieve, tiempo e inversión térmica explicados.
import { dirLong, fmtNum } from './geo.js';
import { html, raw } from './ui.js';

const WC = {
  0: ['☀️', 'Despejado'], 1: ['🌤️', 'Casi despejado'], 2: ['⛅', 'Nubes y claros'], 3: ['☁️', 'Cubierto'],
  45: ['🌫️', 'Niebla'], 48: ['🌫️', 'Niebla con escarcha'], 51: ['🌦️', 'Llovizna débil'], 53: ['🌦️', 'Llovizna'], 55: ['🌧️', 'Llovizna intensa'],
  56: ['🧊', 'Llovizna helada'], 57: ['🧊', 'Llovizna helada'], 61: ['🌧️', 'Lluvia débil'], 63: ['🌧️', 'Lluvia'], 65: ['🌧️', 'Lluvia fuerte'],
  66: ['🧊', 'Lluvia helada'], 67: ['🧊', 'Lluvia helada'], 71: ['🌨️', 'Nieve débil'], 73: ['🌨️', 'Nieve'], 75: ['❄️', 'Nieve fuerte'], 77: ['🌨️', 'Granizo menudo'],
  80: ['🌦️', 'Chubascos'], 81: ['🌧️', 'Chubascos'], 82: ['⛈️', 'Chubascos fuertes'], 85: ['🌨️', 'Chubascos de nieve'], 86: ['❄️', 'Chubascos de nieve'],
  95: ['⛈️', 'Tormenta'], 96: ['⛈️', 'Tormenta con granizo'], 99: ['⛈️', 'Tormenta con granizo'],
};
export const wc = c => WC[c] || ['🌡️', '—'];

export function analyseTerrain(t) {
  if (!t) return null;
  const r1 = t.ring.slice(0, 8), r2 = t.ring.slice(8);
  const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
  const tpi1 = t.ele - mean(r1), tpi2 = t.ele - mean(r2.length ? r2 : r1);
  const all = t.ring, higher = all.filter(v => v > t.ele + 20).length;
  const range = Math.max(...all, t.ele) - Math.min(...all, t.ele);
  const minI = r1.indexOf(Math.min(...r1)), maxI = r1.indexOf(Math.max(...r1));
  let cls, score, text;
  if (range < 70) {
    cls = 'Llano o paramera'; score = 2;
    text = 'El terreno de alrededor es casi plano. En noches despejadas el aire se enfría mucho por radiación, pero no tiene a dónde escurrirse: se queda «estancado» encima. Por eso las altiplanicies y parameras de montaña figuran entre los sitios más fríos de su región.';
  } else if (tpi2 < -60 || (tpi1 < -25 && higher >= 11)) {
    cls = 'Hondonada o fondo de valle'; score = 3;
    text = `Estás unos ${fmtNum(Math.abs(tpi2))} m por debajo del terreno que te rodea. Aquí es donde se encharca el aire frío que baja de las laderas por la noche: es el sitio típico de heladas fuertes, escarcha y nieblas matinales.`;
  } else if (tpi2 < -20) {
    cls = 'Parte baja de la ladera'; score = 2;
    text = `Estás algo por debajo del terreno de alrededor (${fmtNum(Math.abs(tpi2))} m). Por la noche te llegará aire frío de arriba, aunque si hay una salida clara ladera abajo, parte se escurrirá ${dirLong(minI * 45)}.`;
  } else if (tpi2 > 40) {
    cls = 'Loma, cresta o cumbre'; score = 0;
    text = `Estás ${fmtNum(tpi2)} m por encima de lo que te rodea. El aire frío que se forma aquí por la noche resbala hacia abajo, así que estas zonas suelen helar menos que los fondos, aunque el viento se nota más.`;
  } else {
    cls = 'Ladera media'; score = 1;
    text = `Estás a media ladera. En noches de inversión, esta franja suele quedar más templada que el fondo del valle (lo que los climatólogos llaman «cinturón térmico»). El aire frío pasa por aquí escurriéndose ${dirLong(minI * 45)}.`;
  }
  return { tpi1, tpi2, range, cls, score, text, downhill: dirLong(minI * 45), uphill: dirLong(maxI * 45) };
}

export function nightOutlook(fc) {
  if (!fc?.hourly) return null;
  const h = fc.hourly, now = Date.now();
  // próxima noche: de 21:00 a 07:00 locales
  const idx = [];
  for (let i = 0; i < h.time.length; i++) {
    const t = new Date(h.time[i]);
    const hr = t.getHours();
    if (t.getTime() < now - 3600e3) continue;
    if (hr >= 21 || hr <= 7) idx.push(i);
    if (idx.length && hr === 7) break;
  }
  if (!idx.length) return null;
  const avg = k => idx.reduce((a, i) => a + (h[k][i] ?? 0), 0) / idx.length;
  const cloud = avg('cloud_cover'), wind = Math.max(...idx.map(i => h.wind_speed_10m[i] ?? 0));
  const tmin = Math.min(...idx.map(i => h.temperature_2m[i]));
  let calm, txt;
  if (cloud < 30 && wind < 9) { calm = 2; txt = 'Noche despejada y en calma: condiciones de manual para que el frío se acumule en las partes bajas.'; }
  else if (cloud < 60 && wind < 16) { calm = 1; txt = 'Noche con algo de nube o brisa: puede haber inversión, pero más débil o intermitente.'; }
  else { calm = 0; txt = 'Noche nubosa o con viento: el aire se mezcla y la inversión es poco probable.'; }
  return { cloud, wind, tmin, calm, txt, start: h.time[idx[0]] };
}

export function inversionVerdict(ter, night) {
  if (!ter || !night) return null;
  const s = ter.score + night.calm;
  if (night.calm === 0) return { level: 'baja', cls: 'ok', text: 'Riesgo bajo esta noche' };
  if (s >= 4) return { level: 'alta', cls: 'bad', text: 'Inversión muy probable esta noche' };
  if (s >= 3) return { level: 'media', cls: 'warn', text: 'Inversión probable esta noche' };
  return { level: 'baja', cls: 'ok', text: 'Riesgo bajo de que este punto quede en el frío' };
}

export function weatherHTML(fc, { compact = false } = {}) {
  if (!fc?.daily) return '';
  const c = fc.current;
  const age = fc.fetchedAt ? Math.round((Date.now() - fc.fetchedAt) / 3600e3) : 0;
  const days = fc.daily.time.slice(0, compact ? 3 : 7).map((t, i) => {
    const [e, n] = wc(fc.daily.weather_code[i]);
    const d = new Date(t);
    return html`<div style="text-align:center;flex:1;min-width:58px"><div class="tiny muted">${i === 0 ? 'Hoy' : d.toLocaleDateString('es-ES', { weekday: 'short' })}</div><div style="font-size:22px" title="${n}">${e}</div><div class="small"><b>${Math.round(fc.daily.temperature_2m_max[i])}°</b> <span class="muted">${Math.round(fc.daily.temperature_2m_min[i])}°</span></div>${fc.daily.precipitation_sum[i] > 0.4 ? raw(`<div class="tiny" style="color:var(--blue)">${fmtNum(fc.daily.precipitation_sum[i], 1)} mm</div>`) : ''}</div>`;
  }).join('');
  let fl = '';
  const h = fc.hourly;
  if (h?.freezing_level_height) {
    const i = h.time.findIndex(t => new Date(t).getTime() > Date.now());
    if (i >= 0 && h.freezing_level_height[i] != null) fl = `Cota de 0 °C ahora: ~${fmtNum(Math.round(h.freezing_level_height[i] / 50) * 50)} m.`;
  }
  const cur = c && age < 3 ? html`<div class="row"><div style="font-size:34px">${wc(c.weather_code)[0]}</div><div><b style="font-size:22px">${Math.round(c.temperature_2m)} °C</b> <span class="muted">${wc(c.weather_code)[1]}</span><div class="small muted">Viento ${Math.round(c.wind_speed_10m)} km/h · humedad ${c.relative_humidity_2m}%</div></div></div>` : '';
  return html`${raw(cur)}<div class="row" style="margin-top:8px;overflow-x:auto">${raw(days)}</div><p class="tiny muted" style="margin:6px 0 0">${fl} ${age >= 3 ? `Previsión descargada hace ${age} h.` : ''} Fuente: Open-Meteo.</p>`;
}
