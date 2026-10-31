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
import { modelAt, modelFromZone, interpret, compareSession, sessionChart, backfillModels } from './measures.js';

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
  // mediciones guardadas sin cobertura: completar la comparación con el modelo ahora (en segundo plano)
  backfillModels(items, m => db.put('measures', m)).then(n => { if (n && document.body.contains(c)) renderMeasures(c); }).catch(() => { });
  c.innerHTML = html`
    <div class="note blue">Apunta lo que marca tu termómetro en cada sitio. Otero lo compara con lo que preveía el modelo para ese punto y esa hora (si hacía más frío del previsto, probablemente se acumulaba aire frío) y con tus otras mediciones de la misma noche: si abajo hacía más frío que arriba, había <b>inversión térmica</b>.</div>
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
      <ul class="list">${raw(ms.slice().sort((a, b) => a.t - b.t).map(m => html`<li data-m="${m.id}"><b style="min-width:62px;color:${tempColor(m.temp)}">${fmtNum(m.temp, 1)} °C</b><div class="grow small">${m.place || `${fmtNum(m.lat, 4)}, ${fmtNum(m.lon, 4)}`}<div class="tiny muted">${new Date(m.t).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}${m.ele != null ? ` · ${fmtNum(m.ele)} m` : ''}${m.terrain ? ` · ${m.terrain}` : ''}</div>${raw(diffLine(m))}</div></li>`).join(''))}</ul>${raw(sessionHTML(ms))}</div>`;
  }).join('');
  $$('[data-m]', c).forEach(e => e.onclick = async () => {
    const m = await db.get('measures', e.dataset.m);
    if (await confirmBox(`${fmtNum(m.temp, 1)} °C el ${fmtDate(m.t)}${m.notes ? ` — ${m.notes}` : ''}. ¿Borrar esta medición?`, 'Borrar')) { await db.del('measures', m.id); renderMeasures(c); changed(); }
  });
}

// Diferencia con el modelo, en una línea
function diffLine(m) {
  const it = interpret(m);
  if (!it) return '';
  const sign = it.diff > 0 ? '+' : '−';
  return html`<div class="tiny" style="color:${it.level === 'frio' ? '#2e6b8f' : it.level === 'calido' ? '#b5432f' : 'var(--moss)'}">${it.level === 'ok' ? '≈ previsión' : `${sign}${fmtNum(Math.abs(it.diff), 1)} °C respecto a la previsión (${fmtNum(m.model.temp, 1)} °C)`}${m.shade === false ? ' · al sol' : ''}</div>`;
}
// Comparación de las mediciones de una misma noche o jornada
function sessionHTML(ms) {
  if (ms.length < 2) return '';
  const cmp = compareSession(ms);
  if (!cmp) return '';
  return html`<div class="${cmp.kind === 'inversion' ? 'note blue' : ''}" style="margin-top:6px"><p class="small" style="margin:0 0 4px;line-height:1.45">${cmp.kind === 'inversion' ? raw('<b>❄️ </b>') : ''}${cmp.text}</p>${raw(sessionChart(ms))}</div>`;
}

export const tempColor = t => t <= -5 ? '#3554a5' : t <= 0 ? '#2e6b8f' : t <= 5 ? '#4f8a8b' : t <= 12 ? '#6b8f3a' : t <= 22 ? '#c47d2c' : '#b5432f';

export function measureForm(pre = {}) {
  const pos = pre.lat != null ? pre : (state.me && Date.now() - state.me.t < 5 * 60e3 ? { lat: state.me.lat, lon: state.me.lon } : state.lastPoint);
  const b = openSheet(html`<p class="kicker">Medición</p><h2 class="title">¿Qué marca el termómetro?</h2>
    ${raw(!pos ? '<div class="note">No tengo tu posición. Toca «¿Dónde estoy?» primero para que la medición quede en el mapa.</div>' : '')}
    <div class="grid2"><div><label class="f">Temperatura (°C)</label><input type="number" id="mt" step="0.1" inputmode="decimal" placeholder="-3,5"></div><div><label class="f">Humedad (%) · opcional</label><input type="number" id="mh" step="1" inputmode="numeric"></div></div>
    <label class="row" style="gap:8px;margin:8px 0"><input type="checkbox" id="msh" checked style="width:20px;height:20px"><span>El termómetro estaba a la sombra</span></label>
    <label class="f">Notas (cielo, viento, escarcha…) · opcional</label><input type="text" id="mn" placeholder="Despejado, calma, escarcha en el coche">
    <details class="card"><summary><b>Cómo medir bien</b></summary><ul class="small" style="line-height:1.5;padding-left:18px;margin:6px 0">
      <li>A la sombra, a unos 1,5 m del suelo, lejos de paredes, coches y rocas que hayan cogido sol.</li>
      <li>No lo sujetes con la mano por el sensor: espera 2-3 minutos a que se estabilice.</li>
      <li>Para ver inversiones: mide la misma noche (o al amanecer) en el fondo del valle y más arriba, con poco tiempo entre una medida y otra.</li></ul></details>
    <p class="small muted">${pos ? `Posición: ${fmtNum(pos.lat, 5)}, ${fmtNum(pos.lon, 5)}${state.lastPoint?.label ? ` · ${state.lastPoint.label}` : ''}` : ''}</p>
    <button class="btn block" id="msave" ${pos ? '' : 'disabled'}>Guardar medición</button>`);
  $('#mt', b).focus();
  $('#msave', b).onclick = async () => {
    const temp = parseFloat(String($('#mt', b).value).replace(',', '.'));
    if (isNaN(temp)) return toast('Escribe la temperatura');
    const btn = $('#msave', b); btn.disabled = true; btn.textContent = 'Guardando y comparando…';
    const m = { id: uid(), t: Date.now(), lat: pos.lat, lon: pos.lon, temp, hum: $('#mh', b).value ? +$('#mh', b).value : null, shade: $('#msh', b).checked, notes: $('#mn', b).value, place: state.lastPoint && state.lastPoint.lat === pos.lat ? state.lastPoint.label : null, ele: null, terrain: null, model: null };
    let z = null;
    try {
      z = await zoneAt(pos.lat, pos.lon);
      let ter = z?.grid ? terrainFromGrid(z.grid, pos.lat, pos.lon) : null;
      if (!ter && online()) ter = await terrainOnline(pos.lat, pos.lon);
      if (ter) { const an = analyseTerrain(ter); m.ele = ter.ele; m.terrain = an?.cls; m.slope = an ? Math.round(an.slope) : null; m.exposure = an?.exposure || null; }
    } catch (e) { }
    // lo que preveía el modelo para este sitio y esta hora (con cobertura) o la previsión guardada de la zona
    try { m.model = online() ? await modelAt(m.lat, m.lon, m.ele, m.t) : modelFromZone(z, m.t); if (m.model) m.modelTried = true; } catch (e) { m.model = modelFromZone(z, m.t); }
    await db.put('measures', m);
    changed();
    showMeasureResult(m);
  };
}

// Resultado tras guardar: comparación con el modelo y con las otras medidas de la misma noche o jornada
async function showMeasureResult(m) {
  const it = interpret(m);
  const same = (await db.all('measures')).filter(x => sessionKey(x.t) === sessionKey(m.t));
  const cmp = same.length > 1 ? compareSession(same) : null;
  const b = openSheet(html`<p class="kicker">Medición guardada</p><h2 class="title">${fmtNum(m.temp, 1)} °C${m.ele != null ? ` a ${fmtNum(m.ele)} m` : ''}</h2>
    <p class="small muted">${m.terrain || ''}${m.exposure ? ` · ${m.exposure === 'solana' ? 'solana' : m.exposure === 'umbria' ? 'umbría' : m.exposure}` : ''}</p>
    ${raw(it ? html`<div class="note ${it.level === 'ok' ? 'blue' : it.level === 'frio' ? 'blue' : 'warn'}"><b>${it.title}.</b> ${it.text}<div class="tiny muted" style="margin-top:4px">Previsión del modelo para este sitio y hora: ${fmtNum(m.model.temp, 1)} °C (${m.model.src}).</div></div>` : html`<div class="note">Sin cobertura ni previsión guardada: compararé esta medición con el modelo cuando vuelvas a tener conexión (en Diario → Mediciones).</div>`)}
    ${raw(cmp ? html`<p class="kicker" style="margin-top:12px">${same.length === 2 ? 'Con tu otra medición' : `Con tus otras ${same.length - 1} mediciones`} de esta salida</p><p class="small" style="line-height:1.5">${cmp.text}</p>${raw(sessionChart(same))}` : '<p class="tiny muted">Consejo: mide también más arriba o más abajo esta misma noche para ver si hay inversión.</p>')}
    <button class="btn block" id="mok">Hecho</button>`);
  $('#mok', b).onclick = closeSheet;
}
const sessionKey = t => new Date(t - 12 * 3600e3).toISOString().slice(0, 10); // de 12:00 a 12:00: una noche entera junta
