// Otero — arranque, mapa y navegación.
import { state } from './state.js';
import { $, $$, html, raw, esc, toast, closeSheet, openSheet, closeViews, onSheetClose, el, fmtDate } from './ui.js';
import { BASES, OVERLAYS, makeLayer, baseFor, covers } from './layers.js';
import { db } from './db.js';
import { getZones } from './zones.js';
import { showPoint } from './point.js';
import { openIdentify, claudeFlow } from './identify.js';
import { openLibrary } from './library.js';
import { openDiary, noteForm, measureForm, tempColor, openEntry } from './diary.js';
import { openPanels, openPanel, panelsForMap } from './panels.js';
import { openCompass } from './compass.js';
import { openMore, openZones } from './settings.js';
import { fmtNum, inBBox } from './geo.js';
import { locate, quality, fmtAcc, isFresh } from './location.js';
import { openSearch, toggleFavorite } from './places.js';
import { initUpdates } from './updates.js';
import { openCuaderno } from './cuaderno.js';

const L = window.L;

// localStorage puede fallar (modo privado, datos corruptos): la app debe arrancar igualmente
const loadPref = (k, def) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? def; } catch (e) { return def; } };
const savePref = (k, v) => { try { localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); } catch (e) { } };

// ---------- Mapa ----------
// Sin vista guardada se abre en una vista general de la península; nunca se usa como «tu posición».
const saved = loadPref('otero:view', null);
const map = L.map('map', { zoomControl: false, attributionControl: true, worldCopyJump: false, tap: true })
  .setView(saved ? [saved.lat, saved.lon] : [40.2, -3.5], saved ? saved.z : 6);
state.map = map;
L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);
map.attributionControl.setPrefix('');

let baseKey = (() => { try { return localStorage.getItem('otero:base'); } catch (e) { return null; } })() || baseFor(map.getCenter().lat, map.getCenter().lng);
let baseLayer = null, geoLayer = null;
const show = loadPref('otero:show', { panels: true, diary: true, measures: true, zones: true, names: true });
let geoOn = loadPref('otero:geo', 0) === 1;

function setBase(k) {
  if (!BASES[k]) k = 'sat';
  baseKey = k; savePref('otero:base', k);
  if (baseLayer) map.removeLayer(baseLayer);
  baseLayer = makeLayer(L, BASES[k]).addTo(map);
  baseLayer.bringToBack();
}
function setGeo(on) {
  geoOn = on; savePref('otero:geo', on ? '1' : '0');
  if (geoLayer) { map.removeLayer(geoLayer); geoLayer = null; }
  if (on) geoLayer = makeLayer(L, OVERLAYS.geo, { zIndex: 5 }).addTo(map);
}
setBase(baseKey); setGeo(geoOn);

map.on('moveend', () => {
  const c = map.getCenter();
  savePref('otero:view', { lat: c.lat, lon: c.lng, z: map.getZoom() });
  updateZoneChip(); drawNames();
});

// ---------- Capas de datos ----------
const groups = { panels: L.layerGroup().addTo(map), diary: L.layerGroup().addTo(map), measures: L.layerGroup().addTo(map), zones: L.layerGroup().addTo(map), names: L.layerGroup().addTo(map), lines: L.layerGroup().addTo(map) };
const icon = (cls, inner, size = [26, 26], style = '') => L.divIcon({ className: '', html: `<div class="mk ${cls}" style="${style}">${inner}</div>`, iconSize: size, iconAnchor: [size[0] / 2, size[1] / 2] });

async function drawData() {
  Object.values(groups).forEach(g => g.clearLayers());
  if (show.panels) for (const p of await panelsForMap()) {
    L.marker([p.lat, p.lon], { icon: icon('panel', '🏔️') }).addTo(groups.panels).on('click', () => panelPopup(p));
  }
  if (show.diary) for (const d of (await db.all('diary').catch(() => [])).filter(d => d.lat != null)) {
    L.marker([d.lat, d.lon], { icon: icon('diary', d.kind === 'planta' ? '🌿' : d.kind === 'nota' ? '✏️' : '📷') }).addTo(groups.diary).on('click', () => { closeSheet(); openEntry(d.id); setTab('diary', false); });
  }
  if (show.measures) for (const m of (await db.all('measures').catch(() => []))) {
    L.marker([m.lat, m.lon], { icon: icon('measure', `${Math.round(m.temp)}°`, [34, 22], `background:${tempColor(m.temp)}`) }).addTo(groups.measures)
      .bindPopup(`<b>${fmtNum(m.temp, 1)} °C</b><br>${fmtDate(m.t)}${m.ele != null ? `<br>${fmtNum(m.ele)} m · ${esc(m.terrain || '')}` : ''}${m.notes ? `<br>${esc(m.notes)}` : ''}`);
  }
  if (show.zones) for (const z of await getZones()) {
    L.rectangle([[z.bbox.s, z.bbox.w], [z.bbox.n, z.bbox.e]], { color: '#c47d2c', weight: 1.5, dashArray: '6 5', fill: false, interactive: false }).addTo(groups.zones);
    if (z.track) L.polyline(z.track, { color: '#e2533b', weight: 3, opacity: .85, interactive: false }).addTo(groups.zones);
    // rutas señalizadas del cuaderno
    for (const r of z.cuaderno?.routes || []) if (r.geom) L.polyline(r.geom, { color: '#7b3fa0', weight: 2.5, opacity: .8, dashArray: '6 4' }).bindTooltip(`${r.ref ? r.ref + ' · ' : ''}${r.name}`, { sticky: true }).addTo(groups.zones);
  }
  drawNames();
}

// nombres de picos de las zonas preparadas (para ver el mapa «etiquetado» sin cobertura)
async function drawNames() {
  groups.names.clearLayers();
  if (!show.names || map.getZoom() < 13) return;
  const b = map.getBounds();
  const zs = await getZones();
  let n = 0;
  for (const z of zs) for (const p of z.places || []) {
    if (p.kind !== 'pico' || !b.contains([p.lat, p.lon]) || n > 60) continue;
    n++;
    L.marker([p.lat, p.lon], { icon: L.divIcon({ className: '', html: `<div class="lbl-peak">▲ ${esc(p.name)}${p.ele ? ' ' + Math.round(p.ele) : ''}</div>`, iconSize: null, iconAnchor: [0, 8] }), interactive: false }).addTo(groups.names);
  }
}

async function panelPopup(p) {
  groups.lines.clearLayers();
  for (const k of p.peaks || []) if (k.lat != null) {
    L.polyline([[p.lat, p.lon], [k.lat, k.lon]], { color: '#f1c35b', weight: 2, opacity: .9, dashArray: '4 6', interactive: false }).addTo(groups.lines);
    L.marker([k.lat, k.lon], { icon: L.divIcon({ className: '', html: `<div class="lbl-peak">▲ ${esc(k.name)}</div>`, iconSize: null, iconAnchor: [0, 8] }), interactive: false }).addTo(groups.lines);
  }
  const u = URL.createObjectURL(p.thumb);
  const b = openSheet(html`<div class="row" style="gap:12px;margin-top:6px"><img src="${u}" style="width:96px;height:96px;object-fit:cover;border-radius:12px"><div class="grow"><p class="kicker">Panel</p><h3 style="margin:0;font-size:19px">${p.name || 'Sin nombre'}</h3><p class="small muted" style="margin:4px 0">${(p.peaks || []).length} picos señalados</p><button class="btn small" id="po">Abrir</button></div></div>`);
  $('#po', b).onclick = () => { closeSheet(); openPanel(p.id); setTab('panels', false); };
}
onSheetClose(() => { groups.lines.clearLayers(); if (tempMarker) { map.removeLayer(tempMarker); tempMarker = null; } });

// ---------- Ubicación ----------
// Punto azul = tu posición real (GPS) con su círculo de precisión. Gris = antigua; hueco = aproximada.
let meMarker = null, accCircle = null;
function drawMe() {
  const me = state.me;
  if (!me) return;
  const cls = 'me-dot' + (quality(me.acc) === 'aproximada' ? ' approx' : '') + (isFresh(me) ? '' : ' stale');
  const icon = L.divIcon({ className: '', html: `<div class="${cls}"></div>`, iconSize: [18, 18], iconAnchor: [9, 9] });
  if (!meMarker) {
    meMarker = L.marker([me.lat, me.lon], { icon, interactive: false, zIndexOffset: 1000 }).addTo(map);
    accCircle = L.circle([me.lat, me.lon], { radius: me.acc, weight: 1, color: '#2a7ae4', fillOpacity: .08, interactive: false }).addTo(map);
  } else { meMarker.setLatLng([me.lat, me.lon]).setIcon(icon); accCircle.setLatLng([me.lat, me.lon]).setRadius(me.acc); }
}
setInterval(drawMe, 30e3); // para que el punto se vuelva gris cuando la posición se queda antigua
document.addEventListener('me-updated', drawMe);

function centerOnMe() {
  const me = state.me;
  // Si la precisión es mala, enseña todo el círculo: así se ve que la posición es dudosa
  if (me.acc > 300) map.fitBounds(accCircle.getBounds(), { maxZoom: 15, padding: [30, 30] });
  else map.setView([me.lat, me.lon], Math.max(map.getZoom(), 14));
  ensureBase(me.lat, me.lon);
}

async function findMe(btn) {
  const label = btn?.lastChild?.nodeType === 3 ? btn.lastChild : null;
  const old = label?.textContent;
  if (btn) btn.disabled = true;
  if (label) label.textContent = 'Buscando GPS…';
  try {
    let first = true;
    const me = await locate({
      onProgress: f => {
        state.me = f; drawMe();
        if (first) { first = false; centerOnMe(); }
        if (label) label.textContent = `Afinando… ${fmtAcc(f.acc)}`;
      },
    });
    drawMe(); centerOnMe();
    return me;
  } finally { if (btn) btn.disabled = false; if (label) label.textContent = old; }
}

$('#btn-locate').onclick = () => findMe().catch(e => toast(e.message, 6000));
$('#btn-where').onclick = async () => {
  try { const me = await findMe($('#btn-where')); showPoint(me.lat, me.lon, { src: 'gps', fix: me }); }
  catch (e) { locationErrorSheet(e); }
};
$('#btn-what').onclick = () => openIdentify();
$('#btn-compass').onclick = () => openCompass();
$('#btn-layers').onclick = () => layersSheet();
$('#btn-search').onclick = () => openSearch();

function locationErrorSheet(e) {
  const b = openSheet(html`<p class="kicker">Ubicación</p><h2 class="title">No tengo tu posición</h2><p style="line-height:1.5">${e.message}</p>
    <div class="row wrap"><button class="btn" data-a="retry">Reintentar</button><button class="btn sec" data-a="pick">Elegir en el mapa</button><button class="btn sec" data-a="search">Buscar un lugar</button></div>`);
  b.onclick = ev => {
    const a = ev.target.closest('[data-a]')?.dataset.a; if (!a) return;
    closeSheet();
    if (a === 'retry') $('#btn-where').click();
    if (a === 'pick') toast('Toca el mapa en el sitio donde estás', 4000);
    if (a === 'search') openSearch();
  };
}

// Si el fondo elegido no cubre el sitio (p. ej. ortofoto de España en los Alpes), cambia al topo mundial
function ensureBase(lat, lon) {
  if (covers(baseKey, lat, lon)) return;
  const k = baseFor(lat, lon);
  setBase(k);
  toast(`El fondo anterior no cubre esta zona: uso «${BASES[k].name}»`, 4000);
}

let tempMarker = null;
let pickMode = null;
map.on('click', e => {
  const { lat, lng } = e.latlng;
  if (pickMode) { const cb = pickMode.cb; endPick(); cb(lat, lng); return; }
  if (frameMode) return;
  if (tempMarker) map.removeLayer(tempMarker);
  tempMarker = L.marker([lat, lng], { interactive: false }).addTo(map);
  showPoint(lat, lng, { src: 'map' });
});
// Lugar elegido en el buscador o en favoritos
document.addEventListener('go-place', e => {
  const p = e.detail;
  closeViews(); setTab('map', false);
  map.setView([p.lat, p.lon], Math.max(map.getZoom(), 13));
  ensureBase(p.lat, p.lon);
  if (tempMarker) map.removeLayer(tempMarker);
  tempMarker = L.marker([p.lat, p.lon], { interactive: false }).addTo(map);
  showPoint(p.lat, p.lon, { src: 'search', name: p.name });
});

// ---------- Capas (hoja) ----------
function layersSheet() {
  const b = openSheet(html`<p class="kicker">Mapa</p><h2 class="title">Capas</h2>
    <p class="kicker" style="margin-top:10px">Fondo</p>
    ${raw(Object.entries(BASES).map(([k, d]) => html`<label class="row" style="padding:7px 0"><input type="radio" name="base" value="${k}" ${k === baseKey ? 'checked' : ''} style="width:20px;height:20px"><span class="grow">${d.name}</span></label>`).join(''))}
    <p class="kicker" style="margin-top:12px">Encima</p>
    <label class="row" style="padding:7px 0"><input type="checkbox" id="lg" ${geoOn ? 'checked' : ''} style="width:20px;height:20px"><span class="grow">${OVERLAYS.geo.name}</span></label>
    ${raw([['panels', '🏔️ Paneles de miradores'], ['diary', '📓 Diario'], ['measures', '🌡️ Mediciones'], ['zones', '🎒 Zonas preparadas y tracks'], ['names', '▲ Nombres de picos (zonas preparadas)']].map(([k, n]) => html`<label class="row" style="padding:7px 0"><input type="checkbox" data-s="${k}" ${show[k] ? 'checked' : ''} style="width:20px;height:20px"><span class="grow">${n}</span></label>`).join(''))}
    <p class="tiny muted">Los fondos de España y Francia se pueden descargar para usarlos sin cobertura (Más → Preparar salida). El mapa geológico solo cubre España.</p>`);
  $$('input[name=base]', b).forEach(r => r.onchange = () => setBase(r.value));
  $('#lg', b).onchange = e => setGeo(e.target.checked);
  $$('[data-s]', b).forEach(c => c.onchange = () => { show[c.dataset.s] = c.checked; savePref('otero:show', show); drawData(); });
}

// ---------- Pestañas ----------
function setTab(t, open = true) {
  $$('#tabbar button').forEach(b => b.classList.toggle('on', b.dataset.tab === t));
  if (!open) return;
  if (t === 'map') { closeViews(); return; }
  closeSheet();
  ({ panels: openPanels, library: () => openLibrary(), diary: () => openDiary(), more: openMore })[t]();
}
$$('#tabbar button').forEach(b => b.onclick = () => setTab(b.dataset.tab));
$('#view .back').onclick = () => import('./ui.js').then(m => m.backView());
$('#sheet .sheet-close').onclick = closeSheet;
$('#modal').onclick = e => { if (e.target.id === 'modal') $('#modal').classList.add('hidden'); };

// ---------- Eventos entre módulos ----------
document.addEventListener('data-changed', () => drawData());
document.addEventListener('go-tab', e => setTab(e.detail));
document.addEventListener('open-compass', () => { closeSheet(); openCompass(); });
document.addEventListener('show-on-map', e => {
  closeViews(); setTab('map', false);
  map.setView([e.detail.lat, e.detail.lon], Math.max(map.getZoom(), 15));
  if (e.detail.panel) panelsForMap().then(ps => { const p = ps.find(x => x.id === e.detail.panel); if (p) { panelPopup(p); map.fitBounds(L.latLngBounds([[p.lat, p.lon], ...(p.peaks || []).filter(k => k.lat != null).map(k => [k.lat, k.lon])]).pad(0.1)); } });
});
document.addEventListener('show-bbox', e => { closeViews(); setTab('map', false); const b = e.detail; map.fitBounds([[b.s, b.w], [b.n, b.e]]); });
document.addEventListener('point-action', e => {
  const { action, lat, lon } = e.detail;
  if (action === 'diary') noteForm({ lat, lon });
  if (action === 'measure') measureForm({ lat, lon });
  if (action === 'claude') claudeFlow();
  if (action === 'peaks') { const { info } = e.detail; closeSheet(); openCompass({ lat, lon, ele: info?.ele ?? null, label: info?.label, src: info?.src, acc: info?.fix?.acc, t: info?.fix?.t }); }
  if (action === 'fav') toggleFavorite({ lat, lon, name: e.detail.info?.label }).then(on => { toast(on ? '☆ Guardado en favoritos' : 'Quitado de favoritos'); e.detail.btn?.classList.toggle('on', on); });
});

// Elegir un punto en el mapa (para situar un panel)
let pickBanner = null;
document.addEventListener('pick-location', e => {
  closeViews(); closeSheet(); setTab('map', false);
  pickMode = e.detail;
  pickBanner = el('div', { class: 'chip', style: 'position:fixed;top:calc(var(--sat) + 56px);left:10px;right:10px;z-index:950;justify-content:space-between;padding:10px 12px' });
  pickBanner.innerHTML = html`<span>${e.detail.prompt}</span><button class="btn small sec">Cancelar</button>`;
  pickBanner.querySelector('button').onclick = endPick;
  document.body.append(pickBanner);
});
function endPick() { pickMode = null; pickBanner?.remove(); pickBanner = null; }

// Encuadrar una zona para descargar
let frameMode = null, frameBanner = null;
document.addEventListener('frame-zone', e => {
  setTab('map', false); closeSheet();
  frameMode = e.detail;
  frameBanner = el('div', { class: 'chip', style: 'position:fixed;top:calc(var(--sat) + 56px);left:10px;right:10px;z-index:950;flex-wrap:wrap;padding:10px 12px;border-radius:14px' });
  frameBanner.innerHTML = html`<span style="flex:1 1 100%">Mueve y amplía el mapa hasta que la zona ocupe la pantalla.</span><span id="fk" class="small muted" style="flex:1"></span><button class="btn small sec" data-a="no">Cancelar</button><button class="btn small" data-a="ok">Usar esta vista</button>`;
  const upd = () => { const b = map.getBounds(); const w = map.distance([b.getSouth(), b.getWest()], [b.getSouth(), b.getEast()]) / 1000, h = map.distance([b.getSouth(), b.getWest()], [b.getNorth(), b.getWest()]) / 1000; const k = frameBanner?.querySelector('#fk'); if (k) k.textContent = `${fmtNum(w, 1)} × ${fmtNum(h, 1)} km`; };
  map.on('move', upd); upd();
  frameBanner.onclick = ev => {
    const a = ev.target.closest('[data-a]')?.dataset.a; if (!a) return;
    const b = map.getBounds(); const cb = frameMode.cb;
    map.off('move', upd); frameBanner.remove(); frameBanner = null; frameMode = null;
    if (a === 'ok') cb({ s: b.getSouth(), n: b.getNorth(), w: b.getWest(), e: b.getEast() });
  };
  document.body.append(frameBanner);
});

// ---------- Estado de red y zona ----------
function updateNet() {
  const c = $('#netchip');
  const on = navigator.onLine !== false;
  c.className = 'chip' + (on ? '' : ' off');
  c.textContent = on ? '● Con cobertura' : '○ Sin cobertura';
}
async function updateZoneChip() {
  const c = map.getCenter();
  const z = (await getZones()).find(z => inBBox(z.bbox, c.lat, c.lng));
  const chip = $('#zonechip');
  chip.classList.toggle('hidden', !z);
  if (z) { chip.className = 'chip zone'; chip.textContent = `📖 ${z.name}`; chip.onclick = () => openCuaderno(z.id); }
}
window.addEventListener('online', updateNet); window.addEventListener('offline', updateNet);
updateNet(); updateZoneChip(); drawData();

// ---------- Service worker (modo sin conexión) ----------
initUpdates();
// Pedir que el iPhone no borre los datos
navigator.storage?.persist?.().catch(() => { });

// Primera vez
if (!loadPref('otero:welcome', 0)) {
  savePref('otero:welcome', '1');
  openSheet(html`<p class="kicker">Bienvenido</p><h2 class="title">Otero, tu cuaderno de campo</h2>
    <ul class="list">
      <li><span class="k">📍</span><div><b>¿Dónde estoy?</b> Término, picos y masías cercanas, roca, tiempo e inversión térmica.</div></li>
      <li><span class="k">🗺️</span><div>Toca <b>cualquier punto del mapa</b> para su ficha.</div></li>
      <li><span class="k">🔍</span><div><b>¿Qué es esto?</b> Plantas, huellas, sonidos, montañas o pregunta a Claude.</div></li>
      <li><span class="k">🏔️</span><div><b>Paneles</b>: importa tus fotos de miradores.</div></li>
      <li><span class="k">🎒</span><div>Antes de salir: <b>Más → Preparar salida</b>, para usarla sin cobertura.</div></li>
    </ul><button class="btn block" id="wok">Empezar</button>`);
  $('#wok').onclick = closeSheet;
}
