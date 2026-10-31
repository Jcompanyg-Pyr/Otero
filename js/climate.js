// Relieve, tiempo e inversión térmica explicados.
import { fmtNum } from './geo.js';
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

// Relieve alrededor de un punto, a partir de anillos de altitudes (ver ringPoints en sources.js).
// Calcula la pendiente y hacia dónde mira (con los anillos de 150 y 400 m) y la posición
// entre el fondo y lo alto (con los de 1 y 2,5 km). Es una estimación con un modelo de 90 m.
const DIR16 = ['norte', 'nornordeste', 'nordeste', 'estenordeste', 'este', 'estesureste', 'sureste', 'sursureste', 'sur', 'sursuroeste', 'suroeste', 'oestesuroeste', 'oeste', 'oestenoroeste', 'noroeste', 'nornoroeste'];
const dir8 = b => ['norte', 'nordeste', 'este', 'sureste', 'sur', 'suroeste', 'oeste', 'noroeste'][Math.round(((b % 360) + 360) % 360 / 45) % 8];

// Gradiente de un plano ajustado a un anillo: [este, norte] en m por m
function ringGradient(ring, r) {
  let gx = 0, gy = 0;
  ring.forEach((e, i) => { const a = i * Math.PI / 4; gx += e * Math.sin(a); gy += e * Math.cos(a); });
  return [gx / (4 * r), gy / (4 * r)];
}

export function slopeOf(t) {
  const radii = t.radii || [150, 400, 1000, 2500];
  const g1 = ringGradient(t.rings[0], radii[0]), g2 = ringGradient(t.rings[1], radii[1]);
  const gx = (g1[0] + g2[0]) / 2, gy = (g1[1] + g2[1]) / 2;
  const slope = Math.atan(Math.hypot(gx, gy)) * 180 / Math.PI;
  const aspect = (Math.atan2(-gx, -gy) * 180 / Math.PI + 360) % 360; // hacia dónde baja (hacia dónde «mira»)
  return { slope, aspect };
}

export function exposure(aspect, slope) {
  if (slope < 5) return null;
  const a = ((aspect % 360) + 360) % 360;
  if (a >= 112.5 && a <= 247.5) return { key: 'solana', text: 'solana: le da mucho el sol; se calienta antes, la nieve y la escarcha duran menos' };
  if (a >= 292.5 || a <= 67.5) return { key: 'umbria', text: 'umbría: recibe poco sol, sobre todo en invierno; es más fresca de día y la nieve, el hielo y la humedad duran más' };
  return { key: a < 180 ? 'levante' : 'poniente', text: a < 180 ? 'mira a levante: sol de mañana, se calienta pronto y se queda en sombra por la tarde' : 'mira a poniente: sol de tarde, tarda en deshelar por la mañana pero acumula calor por la tarde' };
}

export function analyseTerrain(t) {
  if (!t?.rings || t.rings.length < 4) return null;
  const [r150, r400, r1k, r2k] = t.rings, e = t.ele;
  const all = [e, ...r150, ...r400, ...r1k, ...r2k];
  const lo = Math.min(...all), hi = Math.max(...all), relief = hi - lo;
  const pos = relief > 0 ? (e - lo) / relief : 0.5;          // 0 = lo más bajo en 2,5 km, 1 = lo más alto
  const near = [...r150, ...r400], higherNear = near.filter(v => v > e + 5).length;
  const { slope, aspect } = slopeOf(t);
  const exp = exposure(aspect, slope);
  // Fondo más bajo cercano y en qué dirección
  const far = [...r1k, ...r2k], minI = far.indexOf(Math.min(...far));
  const below = Math.max(0, e - Math.min(...far)), belowDir = dir8((minI % 8) * 45);
  const r = n => fmtNum(Math.round(n / 10) * 10);
  const facing = `mira al ${DIR16[Math.round(aspect / 22.5) % 16]}`;
  let cls, score, text;
  if (relief < 60 && slope < 3) {
    cls = 'Llano o paramera'; score = 2;
    text = 'El terreno de alrededor es casi plano. En noches despejadas el suelo pierde calor y enfría el aire que tiene encima, que no tiene a dónde escurrirse: se queda «estancado». Por eso los llanos y parameras de montaña pueden ser muy fríos de madrugada.';
  } else if (pos < 0.12 && slope >= 6) {
    // Lo más bajo de los alrededores, pero con paredes cerca: fondo de un valle estrecho o barranco
    cls = 'Fondo de valle encajado'; score = 3;
    text = `Estás prácticamente en lo más bajo de los alrededores (${r(hi - e)} m por debajo de lo más alto en 2,5 km), en un valle o barranco estrecho con laderas empinadas cerca. De noche, el aire frío de las laderas baja hasta aquí y se encauza valle abajo: suele hacer bastante frío de madrugada, con escarcha o niebla, y el sol tarda en llegar por las mañanas.`;
  } else if (slope < 6 && pos < 0.25) {
    cls = 'Fondo de valle u hondonada'; score = 3;
    text = `Estás en la parte baja del relieve (unos ${r(e - lo)} m sobre lo más bajo y ${r(hi - e)} m por debajo de lo más alto en 2,5 km), en terreno poco inclinado. Aquí es donde se encharca el aire frío que baja de las laderas por la noche: sitio típico de heladas, escarcha y nieblas al amanecer.`;
  } else if (higherNear <= 2 && pos > 0.7) {
    cls = 'Loma, cresta o cumbre'; score = 0;
    text = `Estás en un punto alto: casi todo lo que te rodea queda por debajo (unos ${r(e - lo)} m sobre el fondo más bajo cercano). El aire frío que se forma aquí por la noche resbala hacia abajo, así que suele helar menos que en los fondos, aunque el viento se nota más y la sensación térmica baja.`;
  } else if (slope >= 5) {
    const tramo = pos < 0.33 ? 'baja' : pos < 0.7 ? 'media' : 'alta';
    cls = `Ladera ${tramo}`; score = tramo === 'baja' ? 2 : tramo === 'media' ? 1 : 0;
    const noche = tramo === 'baja'
      ? `De noche, el aire frío de más arriba baja por aquí y se va acumulando: puede helar casi tanto como en el fondo.`
      : `De noche, el aire frío que se forma en la ladera no se queda: resbala ladera abajo (aquí, hacia el ${dir8(aspect)}) y acaba en lo más bajo de los alrededores (unos ${r(below)} m más abajo, hacia el ${belowDir}). Por eso ${tramo === 'media' ? 'las laderas medias suelen ser de las zonas menos frías en noches despejadas: es el «cinturón térmico»' : 'la parte alta de las laderas hiela menos que el fondo, aunque está más expuesta al viento'}.`;
    text = `Estás en una ladera de unos ${fmtNum(Math.round(slope))}° que ${facing}${exp ? ` (${exp.text})` : ''}. ${noche}`;
  } else {
    cls = pos < 0.4 ? 'Rellano bajo' : 'Rellano a media altura'; score = pos < 0.4 ? 2 : 1;
    text = `Estás en un rellano poco inclinado (unos ${fmtNum(Math.round(slope))}°), ${r(e - lo)} m por encima de lo más bajo en 2,5 km. Un rellano puede retener algo de aire frío por la noche, pero menos que un fondo cerrado; el resto sigue bajando hacia el ${belowDir}.`;
  }
  const how = `Pendiente ~${fmtNum(Math.round(slope))}°, ${slope >= 5 ? facing + ', ' : ''}a un ${Math.round(pos * 100)} % entre lo más bajo y lo más alto en 2,5 km (desnivel ${r(relief)} m). Estimación de Otero con el modelo del terreno Copernicus de 90 m${t.src === 'grid' ? ' guardado al preparar la zona (menos detallado)' : ''}: puede fallar en barrancos estrechos o terreno muy abrupto.`;
  return { cls, score, text, how, slope, aspect, exposure: exp?.key || null, pos, relief, below, downhill: dir8(aspect) };
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

// ¿Quedará ESTE punto dentro del aire frío esta noche? (no es lo mismo que «habrá inversión en la zona»)
export function inversionVerdict(ter, night) {
  if (!ter || !night) return null;
  if (night.calm === 0) return { level: 'baja', cls: 'ok', text: 'Noche con viento o nubes: poca inversión' };
  if (ter.score <= 1) return { level: 'baja', cls: 'ok', text: ter.score === 0 ? 'Aquí arriba, por encima del frío' : 'Posible inversión abajo; aquí, menos frío' };
  if (ter.score + night.calm >= 4) return { level: 'alta', cls: 'bad', text: 'Aquí se acumulará el frío esta noche' };
  return { level: 'media', cls: 'warn', text: 'Aquí puede acumularse el frío esta noche' };
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
