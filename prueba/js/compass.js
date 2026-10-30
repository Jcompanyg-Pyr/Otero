// «Apunta y dime»: apunta con el móvil y te dice qué picos hay en esa dirección.
import { state } from './state.js';
import { html, raw, $, toast, el } from './ui.js';
import { distance, bearing, dirName, fmtDist, fmtNum } from './geo.js';
import { getZones } from './zones.js';
import { peaksAround, online, terrainOnline, explainError } from './sources.js';
import { locate, isFresh, describeFix, quality, fmtAcc } from './location.js';

const FOV = 12; // grados a cada lado
const RADIUS = 50000;
let ui = null, heading = null, listener = null, peaks = [], me = null, ctl = null, seq = 0, source = null;

// origin (opcional): { lat, lon, ele, label, src: 'gps' | 'map' | 'search' }. Sin él: tu posición GPS reciente.
export async function openCompass(origin) {
  if (ui) closeCompass();
  ui = el('div', { class: 'compass' });
  ui.innerHTML = html`<div class="view-head"><button class="back" aria-label="Cerrar">‹</button><h1 style="color:#fff">Apunta a una montaña</h1></div>
    <div class="from small" id="from"></div>
    <div class="heading" id="hd">—</div>
    <div class="dial" id="dial"></div>
    <div class="row" style="justify-content:center;gap:8px;padding:0 12px"><button class="btn ochre small" id="perm">🧭 Activar brújula</button><input type="range" id="man" min="0" max="359" value="0" class="grow hidden" aria-label="Rumbo manual"></div>
    <ul class="list peaklist" id="pl"><li class="muted">Preparando…</li></ul>`;
  document.body.append(ui);
  $('.back', ui).onclick = closeCompass;
  $('#perm', ui).onclick = startSensor;
  $('#man', ui).oninput = e => { heading = +e.target.value; draw(); };
  // Android y escritorio: probar sin pedir permiso
  if (typeof DeviceOrientationEvent === 'undefined' || typeof DeviceOrientationEvent.requestPermission !== 'function') startSensor();
  draw();

  if (origin) me = { ...origin };
  else if (isFresh(state.me, 10 * 60e3)) me = { ...state.me, src: 'gps' };
  else me = null;
  if (!me) return askOrigin();
  load();
}

// Sin posición reciente: no usar en silencio el último punto tocado; preguntar.
function askOrigin() {
  setFrom('');
  const lp = state.lastPoint;
  $('#pl', ui).innerHTML = html`<li style="display:block">¿Desde dónde miras?
    <div class="row wrap" style="margin-top:8px"><button class="btn small" id="o-gps">📍 Usar mi posición</button>${raw(lp ? html`<button class="btn small sec" id="o-pt">Desde «${lp.label || 'punto seleccionado'}»</button>` : '')}</div></li>`;
  $('#o-gps', ui).onclick = useGPS;
  const b = $('#o-pt', ui); if (b) b.onclick = () => { me = { ...lp, src: lp.src || 'map' }; load(); };
}

async function useGPS() {
  if (!ui) return;
  $('#pl', ui).innerHTML = '<li class="muted">Buscando tu posición…</li>';
  try {
    const fix = await locate({ onProgress: f => { if (ui) $('#pl', ui).innerHTML = `<li class="muted">Buscando tu posición… ${fmtAcc(f.acc)}</li>`; } });
    if (!ui) return;
    document.dispatchEvent(new CustomEvent('me-updated'));
    me = { ...fix, src: 'gps' };
    load();
  } catch (e) {
    if (!ui) return;
    $('#pl', ui).innerHTML = html`<li style="display:block">${e.message}<div class="row wrap" style="margin-top:8px"><button class="btn small" id="o-retry">Reintentar</button></div></li>`;
    $('#o-retry', ui).onclick = useGPS;
  }
}

function setFrom(txt) { const f = ui && $('#from', ui); if (f) f.textContent = txt; }
function fromText() {
  if (me.src === 'gps') return `Desde tu posición (${describeFix(me)})${quality(me.acc) === 'aproximada' ? ' ⚠️ aproximada: los rumbos pueden fallar' : ''}`;
  if (me.src === 'search') return `Desde el lugar buscado: ${me.label || ''}`;
  return `Desde el punto seleccionado en el mapa${me.label ? `: ${me.label}` : ''} (no es tu posición)`;
}

async function load() {
  const my = ++seq;
  ctl?.abort(); ctl = new AbortController();
  const alive = () => ui && my === seq;
  const status = t => { if (alive()) $('#pl', ui).innerHTML = html`<li class="muted">${t}</li>`; };
  setFrom(fromText());
  peaks = []; source = null; draw();
  status('Buscando picos guardados…');
  let list = [], err = null;
  try {
    const zs = await getZones();
    for (const z of zs) for (const k of (z.farPeaks || [])) list.push(k);
    list = list.filter(k => distance(me.lat, me.lon, k.lat, k.lon) < RADIUS);
    if (list.length >= 5) source = 'zona preparada';
    else if (online()) {
      const r = await peaksAround(me.lat, me.lon, RADIUS, { signal: ctl.signal, onStep: status });
      list = r.peaks; source = r.source;
    } else if (!list.length) err = { kind: 'offline' };
  } catch (e) {
    if (e.name === 'AbortError' || !alive()) return;
    err = e;
    if (list.length) source = 'zona preparada (incompleta)';
  }
  if (!alive()) return;
  if (!list.length && err) return showError(err);
  source ||= 'zona preparada';
  peaks = prepare(list);
  draw();
  // La altitud solo afina el ángulo ▲/▼: se calcula después, sin bloquear la lista
  if (me.ele == null && me.alt == null && online()) {
    try { me.ele = (await terrainOnline(me.lat, me.lon)).ele; } catch (e) { }
    if (alive()) { peaks = prepare(list); draw(); }
  }
}

function showError(e) {
  const offline = e.kind === 'offline';
  $('#pl', ui).innerHTML = html`<li style="display:block"><b>No he podido consultar los picos.</b> ${offline ? 'Sin cobertura y sin zona preparada aquí: prepara la zona antes de salir para tenerlos.' : explainError(e) + '. Esto no significa que no haya picos.'}
    <div class="row wrap" style="margin-top:8px"><button class="btn small" id="retry">Reintentar</button></div></li>`;
  $('#retry', ui).onclick = load;
}

function prepare(list) {
  const p = me, ele = p.ele ?? p.alt ?? null;
  const seen = new Set();
  const R = 6371000;
  return list.filter(k => { const key = k.name + Math.round(k.lat * 500); if (seen.has(key)) return false; seen.add(key); return true; }).map(k => {
    const d = distance(p.lat, p.lon, k.lat, k.lon);
    const drop = d * d / (2 * R) * 0.87; // curvatura terrestre con refracción
    const ang = ele != null && k.ele != null ? Math.atan2(k.ele - ele - drop, d) * 180 / Math.PI : null;
    return { ...k, d, b: bearing(p.lat, p.lon, k.lat, k.lon), ang };
  }).filter(k => k.d > 200);
}

function startSensor() {
  const handler = e => {
    let h = null;
    if (typeof e.webkitCompassHeading === 'number') {
      h = e.webkitCompassHeading;
      // iPhone: precisión negativa o muy grande = brújula sin calibrar
      if (typeof e.webkitCompassAccuracy === 'number' && (e.webkitCompassAccuracy < 0 || e.webkitCompassAccuracy > 30)) calibWarn();
    }
    else if (e.absolute && e.alpha != null) h = 360 - e.alpha;
    if (h == null) return;
    const so = (screen.orientation?.angle || window.orientation || 0);
    h = (h + so + 360) % 360;
    if (heading == null) heading = h;
    else { let dlt = ((h - heading + 540) % 360) - 180; heading = (heading + dlt * 0.25 + 360) % 360; }
    draw();
  };
  const attach = () => {
    listener = handler;
    window.addEventListener('deviceorientationabsolute', handler, true);
    window.addEventListener('deviceorientation', handler, true);
    $('#perm', ui)?.classList.add('hidden');
    setTimeout(() => { if (heading == null && ui) { $('#man', ui).classList.remove('hidden'); toast('No detecto la brújula: mueve la barra para elegir el rumbo a mano', 4000); } }, 2500);
  };
  const manual = msg => { toast(msg, 6000); $('#man', ui)?.classList.remove('hidden'); };
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(r => { if (r === 'granted') attach(); else manual('Sin permiso de brújula. Si lo denegaste, cierra Otero del todo y vuelve a abrirla para que lo pida de nuevo. Mientras, usa la barra.'); })
      .catch(() => manual('No he podido activar la brújula. Usa la barra para elegir el rumbo.'));
  } else attach();
}

let calibShown = false;
function calibWarn() { if (calibShown) return; calibShown = true; toast('La brújula parece poco precisa: mueve el móvil dibujando un 8 para calibrarla', 5000); }

function draw() {
  if (!ui) return;
  const h = heading;
  $('#hd', ui).textContent = h == null ? 'Gira el móvil' : `${Math.round(h)}° ${dirName(h)}`;
  // dial
  const S = 300, C = S / 2, Rr = 135, rot = h == null ? 0 : -h;
  const pos = (b, d) => { const r = 30 + Math.min(1, Math.log10(1 + d / 1000) / Math.log10(51)) * (Rr - 38); const a = (b + rot - 90) * Math.PI / 180; return [C + r * Math.cos(a), C + r * Math.sin(a)]; };
  const card = ['N', 'E', 'S', 'O'].map((t, i) => { const a = (i * 90 + rot - 90) * Math.PI / 180; return `<text x="${C + (Rr - 2) * Math.cos(a)}" y="${C + (Rr - 2) * Math.sin(a) + 5}" text-anchor="middle" font-size="15" font-weight="700" fill="${t === 'N' ? '#f08a5d' : '#fff'}">${t}</text>`; }).join('');
  const inFov = k => h != null && Math.abs(((k.b - h + 540) % 360) - 180) <= FOV;
  const dots = peaks.map(k => { const [x, y] = pos(k.b, k.d); return `<circle cx="${x}" cy="${y}" r="${inFov(k) ? 4.5 : 2.5}" fill="${inFov(k) ? '#f1c35b' : 'rgba(255,255,255,.55)'}"/>`; }).join('');
  const wedge = h == null ? '' : (() => { const a1 = (-FOV - 90) * Math.PI / 180, a2 = (FOV - 90) * Math.PI / 180; return `<path d="M${C} ${C} L${C + Rr * Math.cos(a1)} ${C + Rr * Math.sin(a1)} A${Rr} ${Rr} 0 0 1 ${C + Rr * Math.cos(a2)} ${C + Rr * Math.sin(a2)}Z" fill="rgba(241,195,91,.16)"/>`; })();
  $('#dial', ui).innerHTML = `<svg viewBox="0 0 ${S} ${S}"><circle cx="${C}" cy="${C}" r="${Rr}" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.3)"/><circle cx="${C}" cy="${C}" r="${(Rr + 30) / 2}" fill="none" stroke="rgba(255,255,255,.12)"/>${wedge}${card}${dots}<circle cx="${C}" cy="${C}" r="5" fill="#2a7ae4" stroke="#fff" stroke-width="2"/><path d="M${C} 4 l-7 12 h14z" fill="#f1c35b"/></svg>`;
  if (!source) return; // la lista muestra el estado de carga o el error
  // lista
  let list;
  if (h == null) list = peaks.slice().sort((a, b) => (b.ele || 0) - (a.ele || 0)).slice(0, 15);
  else list = peaks.filter(inFov).sort((a, b) => a.d - b.d).slice(0, 20);
  const pl = $('#pl', ui);
  const empty = !peaks.length ? `<li class="muted">${source} no tiene picos con nombre y altitud a menos de 50 km de aquí.</li>` : '';
  pl.innerHTML = empty || (h == null ? '<li class="muted small">Los más altos en 50 km (activa la brújula para filtrar por dirección):</li>' : list.length ? '' : '<li class="muted">Ningún pico con nombre en esa dirección (50 km).</li>') +
    list.map(k => html`<li><span class="k">⛰️</span><div class="grow"><b>${k.name}</b><div class="tiny muted">${k.ele ? fmtNum(k.ele) + ' m · ' : ''}${fmtDist(k.d)} · ${Math.round(k.b)}° ${dirName(k.b)}${raw(k.ang != null ? ` · ${k.ang >= 0 ? '▲' : '▼'} ${fmtNum(Math.abs(k.ang), 1)}°` : '')}</div></div></li>`).join('') +
    (list.length ? '<li class="tiny muted" style="display:block">▲/▼: cuántos grados por encima o por debajo de tu horizonte queda la cima (con la curvatura de la Tierra). Un pico lejano puede estar tapado por otro más cercano: el más próximo de la lista que esté «▲» suele ser el que ves en primer plano.</li>' : '') +
    html`<li class="tiny muted" style="display:block">Picos: ${source}${source === 'Wikidata' ? ' (OpenStreetMap no respondía; Wikidata tiene menos picos pequeños)' : ''}.</li>`;
}

function closeCompass() {
  if (listener) { window.removeEventListener('deviceorientationabsolute', listener, true); window.removeEventListener('deviceorientation', listener, true); }
  ctl?.abort(); ctl = null; seq++;
  listener = null; heading = null; ui?.remove(); ui = null;
}
