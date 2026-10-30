// Diario de campo y mediciones propias de temperatura.
import { state } from './state.js';
import { openView, backView, html, raw, esc, $, $$, toast, fmtDate, modal, closeModal, confirmBox, openSheet, closeSheet } from './ui.js';
import { db, uid } from './db.js';
import { fmtNum } from './geo.js';
import { plantResultsHTML, identifyPending, claudeFlow } from './identify.js';
import { openSpecies } from './library.js';
import { online, terrainOnline, terrainFromGrid } from './sources.js';
import { analyseTerrain } from './climate.js';
import { zoneAt } from './zones.js';

const changed = () => document.dispatchEvent(new CustomEvent('data-changed'));
const urls = new Map();
const blobURL = (id, blob) => { if (!blob) return ''; if (!urls.has(id)) urls.set(id, URL.createObjectURL(blob)); return urls.get(id); };

export function openDiary(tab = 'diario') {
  openView('Diario', body => render(body, tab), { root: true });
}

async function render(body, tab) {
  body.innerHTML = html`<div class="seg"><button data-t="diario" class="${tab === 'diario' ? 'on' : ''}">📓 Diario</button><button data-t="med" class="${tab === 'med' ? 'on' : ''}">🌡️ Mediciones</button></div><div id="dc"></div>`;
  $$('.seg button', body).forEach(b => b.onclick = () => render(body, b.dataset.t));
  const c = $('#dc', body);
  if (tab === 'diario') renderDiary(c); else renderMeasures(c);
}

async function renderDiary(c) {
  const items = (await db.all('diary')).sort((a, b) => b.t - a.t);
  const pend = items.filter(i => i.status === 'pendiente' && i.kind === 'planta');
  c.innerHTML = html`
    <div class="row"><button class="btn grow" id="addnote">✏️ Nota aquí</button></div>
    ${raw(pend.length && online() ? html`<button class="btn ochre block" id="idpend">Identificar ${pend.length} planta(s) pendiente(s)</button>` : '')}
    ${raw(items.length ? '' : '<p class="muted" style="margin-top:16px">Aún no hay nada. Usa «¿Qué es esto?» o «Guardar» en la ficha de un punto y aparecerá aquí con su foto y su sitio.</p>')}
    <ul class="list" style="margin-top:8px">${raw(items.map(i => html`<li data-id="${i.id}">${raw(i.photo ? `<img src="${blobURL(i.id, i.photo)}" style="width:56px;height:56px;object-fit:cover;border-radius:10px">` : `<span class="k">${i.kind === 'nota' ? '✏️' : '📍'}</span>`)}<div class="grow"><b>${i.title}</b>${raw(i.status === 'pendiente' ? ' <span class="pill warn">pendiente</span>' : '')}<div class="small muted">${fmtDate(i.t)}${i.place ? ' · ' + esc(i.place) : ''}</div></div><span class="muted">›</span></li>`).join(''))}</ul>`;
  $$('[data-id]', c).forEach(e => e.onclick = () => openEntry(e.dataset.id));
  $('#addnote', c).onclick = () => noteForm();
  const ip = $('#idpend', c);
  if (ip) ip.onclick = async () => {
    ip.disabled = true; ip.textContent = 'Identificando…';
    let ok = 0;
    for (const p of pend) { try { await identifyPending(p); ok++; } catch (e) { toast(e.message); break; } }
    toast(`${ok} identificada(s)`); renderDiary(c); changed();
  };
}

function placeLabel() {
  const p = state.lastPoint;
  return p?.label || null;
}

export function noteForm(prefill = {}) {
  const pos = prefill.lat != null ? prefill : (state.me && Date.now() - state.me.t < 5 * 60e3 ? { lat: state.me.lat, lon: state.me.lon } : state.lastPoint);
  const b = openSheet(html`<p class="kicker">Nueva nota</p><h2 class="title">¿Qué has visto?</h2>
    <label class="f">Título</label><input type="text" id="nt" placeholder="Ej.: rastro de jabalí junto a la fuente">
    <label class="f">Notas</label><textarea id="nn"></textarea>
    <p class="small muted">${pos ? `Se guardará en ${fmtNum(pos.lat, 4)}, ${fmtNum(pos.lon, 4)}${state.lastPoint?.label ? ` (${state.lastPoint.label})` : ''}.` : 'Sin posición: toca «¿Dónde estoy?» antes si quieres guardarla en el mapa.'}</p>
    <button class="btn block" id="ns">Guardar</button>`);
  $('#ns', b).onclick = async () => {
    const title = $('#nt', b).value.trim() || 'Nota';
    await db.put('diary', { id: uid(), kind: 'nota', t: Date.now(), lat: pos?.lat, lon: pos?.lon, ele: state.lastPoint?.ele ?? null, place: placeLabel(), title, notes: $('#nn', b).value, status: 'ok' });
    toast('Guardado'); closeSheet(); changed();
  };
}

export async function openEntry(id) {
  const e = await db.get('diary', id);
  if (!e) return;
  openView(e.title, body => {
    body.innerHTML = html`
      ${raw(e.photo ? `<img src="${blobURL(e.id, e.photo)}" style="width:100%;border-radius:14px;max-height:55vh;object-fit:contain;background:#000">` : '')}
      <p class="small muted">${fmtDate(e.t)}${e.lat != null ? ` · ${fmtNum(e.lat, 5)}, ${fmtNum(e.lon, 5)}` : ''}${e.ele != null ? ` · ${fmtNum(e.ele)} m` : ''}${e.place ? ' · ' + esc(e.place) : ''}</p>
      <label class="f">Título</label><input type="text" id="et" value="${e.title}">
      <label class="f">Notas</label><textarea id="en">${e.notes || ''}</textarea>
      ${raw(e.results ? `<p class="kicker" style="margin-top:14px">Identificación</p>${plantResultsHTML(e.results)}` : '')}
      <div class="row wrap" style="margin-top:12px;gap:8px">
        <button class="btn" id="es">Guardar cambios</button>
        ${raw(e.lat != null ? '<button class="btn sec" id="em">🗺️ Ver en el mapa</button>' : '')}
        ${raw(e.kind === 'planta' && e.status === 'pendiente' ? '<button class="btn ochre" id="eid">Identificar</button>' : '')}
        <button class="btn sec" id="ec">✨ Preguntar a Claude</button>
        <button class="btn sec" id="ed" style="color:var(--red)">Borrar</button>
      </div>`;
    $$('[data-sp]', body).forEach(x => x.onclick = () => openSpecies(x.dataset.sp));
    $('#es', body).onclick = async () => { e.title = $('#et', body).value.trim() || e.title; e.notes = $('#en', body).value; await db.put('diary', e); toast('Guardado'); changed(); };
    const em = $('#em', body); if (em) em.onclick = () => document.dispatchEvent(new CustomEvent('show-on-map', { detail: { lat: e.lat, lon: e.lon } }));
    const ei = $('#eid', body); if (ei) ei.onclick = async () => { ei.disabled = true; try { await identifyPending(e); backView(); openEntry(e.id); changed(); } catch (err) { toast(err.message); ei.disabled = false; } };
    $('#ec', body).onclick = () => { state.lastInfo = state.lastInfo && state.lastInfo.lat === e.lat ? state.lastInfo : { lat: e.lat, lon: e.lon, ele: e.ele, t: e.t }; claudeFlow(e.notes ? `Notas mías: ${e.notes}` : ''); };
    $('#ed', body).onclick = async () => { if (await confirmBox('¿Borrar esta entrada del diario?', 'Borrar')) { await db.del('diary', e.id); backView(); changed(); } };
  });
}

// ---------- Mediciones ----------
async function renderMeasures(c) {
  const items = (await db.all('measures')).sort((a, b) => b.t - a.t);
  c.innerHTML = html`
    <div class="note blue">Apunta lo que marca tu termómetro en cada sitio. Otero guarda la hora, la posición, la altitud y si el punto está en hondonada, ladera o loma. Con unas cuantas noches verás dónde se forma el lago de aire frío en tu terreno.</div>
    <button class="btn block" id="madd">🌡️ Nueva medición aquí</button>
    ${raw(items.length ? html`<button class="btn sec block" id="mcsv">📋 Copiar todo (para Excel)</button>` : '')}
    <div id="mnights"></div>`;
  $('#madd', c).onclick = () => measureForm();
  const csv = $('#mcsv', c);
  if (csv) csv.onclick = async () => {
    const rows = [['fecha', 'hora', 'lat', 'lon', 'altitud_m', 'temp_C', 'humedad_%', 'relieve', 'sitio', 'notas']]
      .concat(items.slice().reverse().map(m => { const d = new Date(m.t); return [d.toLocaleDateString('es-ES'), d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }), m.lat?.toFixed(5), m.lon?.toFixed(5), m.ele != null ? Math.round(m.ele) : '', String(m.temp).replace('.', ','), m.hum ?? '', m.terrain || '', m.place || '', (m.notes || '').replace(/\t|\n/g, ' ')]; }));
    try { await navigator.clipboard.writeText(rows.map(r => r.join('\t')).join('\n')); toast('Copiado: pégalo en una hoja de cálculo'); } catch (e) { toast('No se pudo copiar'); }
  };
  // agrupar por «noche» o jornada (de 12:00 a 12:00)
  const groups = {};
  for (const m of items) { const d = new Date(m.t - 12 * 3600e3); const k = d.toISOString().slice(0, 10); (groups[k] = groups[k] || []).push(m); }
  $('#mnights', c).innerHTML = Object.entries(groups).map(([k, ms]) => {
    const temps = ms.map(m => m.temp), mn = Math.min(...temps), mx = Math.max(...temps);
    const d = new Date(k + 'T12:00:00');
    return html`<div class="card"><div class="row"><b class="grow">${d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })} → ${new Date(d.getTime() + 86400e3).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}</b>${raw(ms.length > 1 ? `<span class="pill ${mx - mn >= 4 ? 'bad' : 'warn'}">Δ ${fmtNum(mx - mn, 1)} °C</span>` : '')}</div>
      <ul class="list">${raw(ms.slice().sort((a, b) => a.t - b.t).map(m => html`<li data-m="${m.id}"><b style="min-width:62px;color:${tempColor(m.temp)}">${fmtNum(m.temp, 1)} °C</b><div class="grow small">${m.place || `${fmtNum(m.lat, 4)}, ${fmtNum(m.lon, 4)}`}<div class="tiny muted">${new Date(m.t).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}${m.ele != null ? ` · ${fmtNum(m.ele)} m` : ''}${m.terrain ? ` · ${m.terrain}` : ''}</div></div></li>`).join(''))}</ul></div>`;
  }).join('');
  $$('[data-m]', c).forEach(e => e.onclick = async () => {
    const m = await db.get('measures', e.dataset.m);
    if (await confirmBox(`${fmtNum(m.temp, 1)} °C el ${fmtDate(m.t)}${m.notes ? ` — ${m.notes}` : ''}. ¿Borrar esta medición?`, 'Borrar')) { await db.del('measures', m.id); renderMeasures(c); changed(); }
  });
}

export const tempColor = t => t <= -5 ? '#3554a5' : t <= 0 ? '#2e6b8f' : t <= 5 ? '#4f8a8b' : t <= 12 ? '#6b8f3a' : t <= 22 ? '#c47d2c' : '#b5432f';

export function measureForm(pre = {}) {
  const pos = pre.lat != null ? pre : (state.me && Date.now() - state.me.t < 5 * 60e3 ? { lat: state.me.lat, lon: state.me.lon } : state.lastPoint);
  const b = openSheet(html`<p class="kicker">Medición</p><h2 class="title">¿Qué marca el termómetro?</h2>
    ${raw(!pos ? '<div class="note">No tengo tu posición. Toca «¿Dónde estoy?» primero para que la medición quede en el mapa.</div>' : '')}
    <div class="grid2"><div><label class="f">Temperatura (°C)</label><input type="number" id="mt" step="0.1" inputmode="decimal" placeholder="-3,5"></div><div><label class="f">Humedad (%) · opcional</label><input type="number" id="mh" step="1" inputmode="numeric"></div></div>
    <label class="f">Notas (cielo, viento, escarcha…) · opcional</label><input type="text" id="mn" placeholder="Despejado, calma, escarcha en el coche">
    <p class="small muted">${pos ? `Posición: ${fmtNum(pos.lat, 5)}, ${fmtNum(pos.lon, 5)}${state.lastPoint?.label ? ` · ${state.lastPoint.label}` : ''}` : ''}</p>
    <button class="btn block" id="msave" ${pos ? '' : 'disabled'}>Guardar medición</button>`);
  $('#mt', b).focus();
  $('#msave', b).onclick = async () => {
    const temp = parseFloat(String($('#mt', b).value).replace(',', '.'));
    if (isNaN(temp)) return toast('Escribe la temperatura');
    const m = { id: uid(), t: Date.now(), lat: pos.lat, lon: pos.lon, temp, hum: $('#mh', b).value ? +$('#mh', b).value : null, notes: $('#mn', b).value, place: state.lastPoint && state.lastPoint.lat === pos.lat ? state.lastPoint.label : null, ele: null, terrain: null };
    try {
      const z = await zoneAt(pos.lat, pos.lon);
      let ter = z?.grid ? terrainFromGrid(z.grid, pos.lat, pos.lon) : null;
      if (!ter && online()) ter = await terrainOnline(pos.lat, pos.lon);
      if (ter) { m.ele = ter.ele; m.terrain = analyseTerrain(ter)?.cls; }
    } catch (e) { }
    await db.put('measures', m);
    toast('Medición guardada'); closeSheet(); changed();
  };
}
