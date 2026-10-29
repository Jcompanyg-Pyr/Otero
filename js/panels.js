// Paneles de miradores: importar fotos, situarlas en el mapa, mejorarlas y enlazar sus picos.
import { state } from './state.js';
import { openView, backView, redrawView, html, raw, esc, $, $$, toast, fmtDate, pickFiles, shrinkImage, loadImage, confirmBox, openSheet, closeSheet, el } from './ui.js';
import { db, uid } from './db.js';
import { distance, bearing, dirName, fmtDist, fmtNum } from './geo.js';
import { getZones, zoneAt } from './zones.js';
import { overpass, peaksAround, online } from './sources.js';

const changed = () => document.dispatchEvent(new CustomEvent('data-changed'));
const urlCache = new Map();
const url = (key, blob) => { if (!blob) return ''; const k = key + ':' + blob.size; if (!urlCache.has(k)) urlCache.set(k, URL.createObjectURL(blob)); return urlCache.get(k); };

export function openPanels() {
  openView('Paneles de miradores', renderList, { root: true, tools: '<button class="btn small" id="pimp">＋ Importar</button>' });
}

async function renderList(body, tools) {
  const items = (await db.all('panels')).sort((a, b) => (b.t || b.added) - (a.t || a.added));
  const imp = $('#pimp', tools); if (imp) imp.onclick = () => importPanels();
  body.innerHTML = html`
    ${raw(items.length ? '' : html`<div class="card"><h3>Junta aquí todos tus paneles</h3>
      <p style="line-height:1.5;margin:0 0 8px">1. En la app <b>Fotos</b> del iPhone, busca «mirador», «panorámica», «vista» o el nombre de un pico: Fotos encuentra el texto dentro de las imágenes.</p>
      <p style="line-height:1.5;margin:0 0 8px">2. Selecciónalas y pulsa <b>＋ Importar</b>. Si las fotos tienen ubicación, cada panel cae solo en su mirador.</p>
      <p style="line-height:1.5;margin:0">3. Ábrelos para enderezarlos, mejorar el contraste y marcar qué picos señalan. En el mapa verás líneas del mirador a cada pico.</p>
      <button class="btn block" id="pimp2">＋ Importar fotos de paneles</button></div>`)}
    ${raw(items.length ? html`<p class="small muted" style="margin:0 0 8px">${items.length} panel(es) · ${raw(items.filter(i => i.lat == null).length ? `<b>${items.filter(i => i.lat == null).length} sin ubicación</b>` : 'todos en el mapa')}</p>` : '')}
    <div class="thumbs">${raw(items.map(p => html`<button data-p="${p.id}"><img src="${url(p.id + 't', p.thumb)}" loading="lazy" alt=""><span class="cap">${p.name || 'Sin nombre'}${p.lat == null ? ' · 📍?' : ''}</span></button>`).join(''))}</div>`;
  const i2 = $('#pimp2', body); if (i2) i2.onclick = () => importPanels();
  $$('[data-p]', body).forEach(b => b.onclick = () => openPanel(b.dataset.p));
}

async function readMeta(file) {
  let lat = null, lon = null, t = null;
  try { const g = await window.exifr.gps(file); if (g && isFinite(g.latitude)) { lat = g.latitude; lon = g.longitude; } } catch (e) { }
  try { const m = await window.exifr.parse(file, ['DateTimeOriginal', 'CreateDate']); const d = m?.DateTimeOriginal || m?.CreateDate; if (d) t = new Date(d).getTime(); } catch (e) { }
  return { lat, lon, t: t || file.lastModified || Date.now() };
}

async function importPanels() {
  const files = await pickFiles({ accept: 'image/*', multiple: true });
  if (!files.length) return;
  const b = openSheet(html`<p class="kicker">Importando</p><h2 class="title">${files.length} foto(s)</h2><div class="bar"><i id="ib"></i></div><p class="small muted" id="it">Leyendo ubicación y fecha…</p>`);
  const added = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    try {
      const meta = await readMeta(f);
      const blob = await shrinkImage(f, 3600, 0.88);
      const thumb = await shrinkImage(blob, 420, 0.8);
      const p = { id: uid(), added: Date.now(), ...meta, blob, thumb, name: '', peaks: [], notes: '' };
      p.name = await nameFromZones(p) || '';
      await db.put('panels', p);
      added.push(p);
    } catch (e) { console.warn(e); }
    $('#ib', b).style.width = `${Math.round((i + 1) / files.length * 100)}%`;
    $('#it', b).textContent = `${i + 1} de ${files.length}`;
  }
  const noGps = added.filter(p => p.lat == null).length;
  $('#it', b).innerHTML = html`Listo: ${added.length} importado(s).${noGps ? ` ${noGps} no tienen ubicación: ábrelos y sitúalos en el mapa.` : ''}${online() ? ' Ahora busco el nombre de cada mirador…' : ''}`;
  changed(); redrawView();
  if (online()) await nameOnline(added.filter(p => !p.name && p.lat != null), b);
  setTimeout(closeSheet, 1500);
}

async function nameFromZones(p) {
  if (p.lat == null) return null;
  const z = await zoneAt(p.lat, p.lon);
  if (!z?.places) return null;
  const v = z.places.filter(x => x.kind === 'mirador' || x.kind === 'pico').map(x => ({ ...x, d: distance(p.lat, p.lon, x.lat, x.lon) })).filter(x => x.d < 300).sort((a, b) => a.d - b.d)[0];
  return v ? v.name : null;
}

async function nameOnline(list, sheetBody) {
  for (let i = 0; i < list.length; i++) {
    const p = list[i];
    try {
      const q = `[out:json][timeout:20];(node["tourism"="viewpoint"]["name"](around:400,${p.lat},${p.lon});node["natural"="peak"]["name"](around:250,${p.lat},${p.lon});node["place"]["name"](around:1500,${p.lat},${p.lon}););out;`;
      const d = await overpass(q, 25000);
      const els = d.elements.map(e => ({ ...e, d: distance(p.lat, p.lon, e.lat, e.lon) })).sort((a, b) => a.d - b.d);
      const v = els.find(e => e.tags.tourism === 'viewpoint') || els.find(e => e.tags.natural === 'peak');
      const town = els.find(e => e.tags.place);
      p.name = v ? v.tags.name : town ? `Mirador cerca de ${town.tags.name}` : '';
      if (p.name) await db.put('panels', p);
      if (sheetBody && document.body.contains(sheetBody)) $('#it', sheetBody).textContent = `Nombres: ${i + 1} de ${list.length}`;
    } catch (e) { }
    await new Promise(r => setTimeout(r, 1100));
  }
  changed(); redrawView();
}

export async function openPanel(id) {
  const p = await db.get('panels', id);
  if (!p) return;
  openView(p.name || 'Panel', async body => {
    const img = p.edited || p.blob;
    body.innerHTML = html`
      <button id="pv" style="border:0;padding:0;background:#111;border-radius:14px;overflow:hidden;width:100%;display:block"><img src="${url(p.id + (p.edited ? 'e' : 'o'), img)}" style="width:100%;display:block;max-height:46vh;object-fit:contain"></button>
      <p class="tiny muted" style="margin:4px 0 8px">Toca la imagen para verla a pantalla completa, ampliar, enderezar y mejorar.</p>
      <label class="f">Nombre del mirador</label><input type="text" id="pn" value="${p.name}" placeholder="Mirador de…">
      <p class="small muted">${fmtDate(p.t, false)}${raw(p.lat != null ? ` · ${fmtNum(p.lat, 4)}, ${fmtNum(p.lon, 4)}` : ' · <b>sin ubicación</b>')}</p>
      <div class="row wrap" style="gap:8px">
        ${raw(p.lat != null ? '<button class="btn small sec" id="pmap">🗺️ Ver en el mapa</button>' : '')}
        <button class="btn small sec" id="pplace">📍 ${p.lat != null ? 'Mover' : 'Situar en el mapa'}</button>
        <button class="btn small sec" id="pdel" style="color:var(--red)">Borrar</button>
      </div>
      <div class="card" style="margin-top:14px"><h3>Picos que señala este panel</h3><div id="pk"></div>
        <div class="row wrap" style="gap:8px;margin-top:8px">
          <button class="btn small" id="padd" ${p.lat == null ? 'disabled' : ''}>＋ Elegir de la lista</button>
          <button class="btn small sec" id="ppaste">📋 Pegar nombres</button>
          <button class="btn small sec" id="pclaude">✨ Leerlo con Claude</button>
        </div>
        ${raw(p.lat == null ? '<p class="tiny muted">Sitúa el panel en el mapa para poder calcular direcciones y distancias.</p>' : '')}
      </div>
      <label class="f">Notas</label><textarea id="pnotes" placeholder="Qué se ve, qué día hacía…">${p.notes || ''}</textarea>
      <button class="btn block" id="psave">Guardar</button>`;
    drawPeaks(p, $('#pk', body));
    $('#pv', body).onclick = () => openViewer(p);
    $('#psave', body).onclick = async () => { p.name = $('#pn', body).value.trim(); p.notes = $('#pnotes', body).value; await db.put('panels', p); toast('Guardado'); changed(); };
    const pm = $('#pmap', body); if (pm) pm.onclick = () => document.dispatchEvent(new CustomEvent('show-on-map', { detail: { lat: p.lat, lon: p.lon, panel: p.id } }));
    $('#pplace', body).onclick = () => document.dispatchEvent(new CustomEvent('pick-location', { detail: { prompt: `Toca en el mapa dónde está «${p.name || 'este mirador'}»`, cb: async (lat, lon) => { p.lat = lat; p.lon = lon; await db.put('panels', p); changed(); toast('Panel situado'); openPanel(p.id); } } }));
    $('#pdel', body).onclick = async () => { if (await confirmBox('¿Borrar este panel? La foto original sigue en tu galería.', 'Borrar')) { await db.del('panels', p.id); backView(); changed(); } };
    $('#padd', body).onclick = () => choosePeaks(p, () => drawPeaks(p, $('#pk', body)));
    $('#ppaste', body).onclick = () => pasteNames(p, () => drawPeaks(p, $('#pk', body)));
    $('#pclaude', body).onclick = () => claudeRead();
  });
}

function drawPeaks(p, box) {
  if (!p.peaks?.length) { box.innerHTML = '<p class="small muted" style="margin:0">Aún ninguno. Elige de la lista de picos alrededor del mirador, o pide a Claude que lea los nombres del panel y pégalos.</p>'; return; }
  const list = p.peaks.map(k => ({ ...k, d: k.lat != null && p.lat != null ? distance(p.lat, p.lon, k.lat, k.lon) : null, b: k.lat != null && p.lat != null ? bearing(p.lat, p.lon, k.lat, k.lon) : null })).sort((a, b) => (a.b ?? 999) - (b.b ?? 999));
  box.innerHTML = html`<ul class="list">${raw(list.map((k, i) => html`<li><span class="k">⛰️</span><div class="grow"><b>${k.name}</b><div class="tiny muted">${k.ele ? fmtNum(k.ele) + ' m' : ''}${k.d != null ? ` · ${fmtDist(k.d)} hacia el ${dirName(k.b)} (${Math.round(k.b)}°)` : ' · sin situar'}</div></div><button class="btn small sec" data-rm="${esc(k.name)}">✕</button></li>`).join(''))}</ul>`;
  $$('[data-rm]', box).forEach(b => b.onclick = async () => { p.peaks = p.peaks.filter(x => x.name !== b.dataset.rm); await db.put('panels', p); drawPeaks(p, box); changed(); });
}

async function candidatePeaks(p) {
  const zs = await getZones();
  let peaks = [];
  for (const z of zs) for (const k of (z.farPeaks || [])) if (distance(p.lat, p.lon, k.lat, k.lon) < 70000) peaks.push(k);
  if (!peaks.length && online()) peaks = await peaksAround(p.lat, p.lon, 60000);
  const seen = new Set();
  return peaks.filter(k => { const key = k.name + Math.round(k.lat * 1000); if (seen.has(key)) return false; seen.add(key); return true; })
    .map(k => ({ ...k, d: distance(p.lat, p.lon, k.lat, k.lon), b: bearing(p.lat, p.lon, k.lat, k.lon) })).filter(k => k.d > 150);
}

async function choosePeaks(p, done) {
  const b = openSheet(html`<p class="kicker">Picos alrededor de ${p.name || 'este mirador'}</p><h2 class="title">¿Cuáles salen en el panel?</h2><div class="loading">Buscando picos en 60 km…</div>`, { tall: true });
  let cands;
  try { cands = await candidatePeaks(p); } catch (e) { b.innerHTML = '<p>No he podido cargar los picos (¿sin cobertura?). Prepara la zona antes o usa «Pegar nombres».</p>'; return; }
  const sel = new Set(p.peaks.map(k => k.name));
  let sort = 'b', q = '';
  const draw = () => {
    const l = cands.filter(k => !q || k.name.toLowerCase().includes(q)).sort((a, c) => sort === 'b' ? a.b - c.b : sort === 'd' ? a.d - c.d : (c.ele || 0) - (a.ele || 0)).slice(0, 250);
    $('#cl', b).innerHTML = l.map(k => html`<li><label class="row grow" style="gap:10px"><input type="checkbox" data-n="${k.name}" ${sel.has(k.name) ? 'checked' : ''} style="width:22px;height:22px"><div class="grow"><b>${k.name}</b><div class="tiny muted">${k.ele ? fmtNum(k.ele) + ' m · ' : ''}${fmtDist(k.d)} · ${dirName(k.b)} (${Math.round(k.b)}°)</div></div></label></li>`).join('');
    $$('[data-n]', b).forEach(cb => cb.onchange = () => { cb.checked ? sel.add(cb.dataset.n) : sel.delete(cb.dataset.n); });
  };
  b.innerHTML = html`<p class="kicker">Picos alrededor</p><h2 class="title">¿Cuáles salen en el panel?</h2>
    <p class="small muted" style="margin:0 0 6px">Ordenados de izquierda a derecha según el rumbo (como suelen ir en los paneles). ${cands.length} picos con nombre en 60 km.</p>
    <input type="search" id="cq" placeholder="Buscar">
    <div class="seg"><button data-s="b" class="on">Por rumbo</button><button data-s="d">Por distancia</button><button data-s="e">Por altura</button></div>
    <ul class="list" id="cl"></ul><button class="btn block" id="cok" style="position:sticky;bottom:0">Guardar selección</button>`;
  $('#cq', b).oninput = e => { q = e.target.value.toLowerCase(); draw(); };
  $$('[data-s]', b).forEach(x => x.onclick = () => { sort = x.dataset.s; $$('[data-s]', b).forEach(y => y.classList.toggle('on', y === x)); draw(); });
  $('#cok', b).onclick = async () => {
    const keep = p.peaks.filter(k => k.lat == null && sel.has(k.name));
    p.peaks = keep.concat(cands.filter(k => sel.has(k.name)).map(({ name, lat, lon, ele }) => ({ name, lat, lon, ele })));
    const names = new Set(); p.peaks = p.peaks.filter(k => !names.has(k.name) && names.add(k.name));
    await db.put('panels', p); closeSheet(); done(); changed();
  };
  draw();
}

const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\b(pico|pic|tuca|tuc|punta|tozal|tossal|cerro|alto|peña|penya|el|la|los|las|de|del|d)\b/g, '').replace(/[^a-z0-9]/g, '');

async function pasteNames(p, done) {
  const b = openSheet(html`<p class="kicker">Pegar nombres</p><h2 class="title">Un nombre por línea</h2>
    <textarea id="pt" style="min-height:180px" placeholder="Peñarroya&#10;Monegro&#10;Javalambre"></textarea>
    <p class="small muted">Otero buscará cada nombre entre los picos de alrededor y los situará. Los que no encuentre se guardan igual, sin posición.</p>
    <button class="btn block" id="pgo">Añadir</button>`);
  $('#pgo', b).onclick = async () => {
    const names = $('#pt', b).value.split(/\n|;|,/).map(s => s.replace(/^[\s\-•*\d.)]+/, '').replace(/\(.*?\)/g, '').trim()).filter(s => s.length > 1);
    let cands = [];
    if (p.lat != null) { try { cands = await candidatePeaks(p); } catch (e) { } }
    let found = 0;
    for (const n of names) {
      const nn = norm(n);
      const m = cands.filter(k => { const kn = norm(k.name); return kn && nn && (kn === nn || kn.includes(nn) || nn.includes(kn)); }).sort((a, c) => a.d - c.d)[0];
      if (p.peaks.some(k => k.name === (m ? m.name : n))) continue;
      if (m) { p.peaks.push({ name: m.name, lat: m.lat, lon: m.lon, ele: m.ele }); found++; } else p.peaks.push({ name: n });
    }
    await db.put('panels', p); closeSheet(); done(); changed();
    toast(`${found} de ${names.length} situados en el mapa`);
  };
}

function claudeRead() {
  const prompt = 'Te adjunto la foto de un panel interpretativo de un mirador de montaña. Escribe todos los nombres de picos, sierras, pueblos y lugares que aparecen señalados, de izquierda a derecha, uno por línea y sin nada más (sin numerar ni comentar). Si alguno no se lee bien, ponlo con un signo de interrogación al final.';
  const b = openSheet(html`<p class="kicker">Leerlo con Claude</p><h2 class="title">Transcribir el panel</h2>
    <p class="small" style="line-height:1.5">1. Copia este texto y abre Claude. 2. Pega y adjunta la foto del panel. 3. Copia la lista que te devuelva y vuelve aquí a «Pegar nombres».</p>
    <textarea id="cp" style="min-height:120px;font-size:14px">${prompt}</textarea>
    <div class="row" style="margin-top:8px"><button class="btn grow" id="cc">📋 Copiar</button><a class="btn ochre grow" target="_blank" rel="noopener" href="https://claude.ai/new?q=${encodeURIComponent(prompt)}">Abrir Claude ›</a></div>`);
  $('#cc', b).onclick = async () => { try { await navigator.clipboard.writeText(prompt); toast('Copiado'); } catch (e) { toast('Cópialo a mano'); } };
}

// ---------------- Visor: zoom, mejora y enderezado ----------------
async function openViewer(p) {
  const v = el('div', { class: 'viewer' });
  v.innerHTML = html`<div class="viewer-top"><span class="t">${p.name || 'Panel'}</span><button data-a="close">Cerrar</button></div>
    <div class="viewer-stage"></div>
    <div class="viewer-bottom"><button data-a="enh">✨ Mejorar</button><button data-a="quad">⬚ Enderezar</button><button data-a="fit">⤢ Ajustar</button>${raw(p.edited ? '<button data-a="orig">↺ Original</button>' : '')}<button data-a="save" class="hidden">💾 Guardar</button><button data-a="cancel" class="hidden">Cancelar</button></div>`;
  document.body.append(v);
  const stage = $('.viewer-stage', v);
  let img = await loadImage(p.edited || p.blob);
  let canvas = document.createElement('canvas');
  const setCanvasFrom = (src) => { canvas.width = src.naturalWidth || src.width; canvas.height = src.naturalHeight || src.height; canvas.getContext('2d').drawImage(src, 0, 0); };
  setCanvasFrom(img);
  stage.append(canvas);
  let s = 1, tx = 0, ty = 0, mode = 'view', dirty = false;
  const apply = () => { canvas.style.transform = `translate(${tx}px,${ty}px) scale(${s})`; drawQuad(); };
  const fit = () => { const W = stage.clientWidth, H = stage.clientHeight; s = Math.min(W / canvas.width, H / canvas.height) * 0.96; tx = (W - canvas.width * s) / 2; ty = (H - canvas.height * s) / 2; apply(); };
  requestAnimationFrame(fit);

  // gestos
  const pts = new Map(); let last = null;
  stage.addEventListener('pointerdown', e => { if (e.target.classList.contains('corner')) return; stage.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); last = null; });
  stage.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, [e.clientX, e.clientY]);
    const arr = [...pts.values()];
    const r = stage.getBoundingClientRect();
    if (arr.length === 1) {
      const [x, y] = arr[0];
      if (last?.n === 1) { tx += x - last.x; ty += y - last.y; apply(); }
      last = { n: 1, x, y };
    } else if (arr.length >= 2) {
      const [a, b] = arr; const cx = (a[0] + b[0]) / 2 - r.left, cy = (a[1] + b[1]) / 2 - r.top, d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (last?.n === 2) { const k = d / last.d; tx = cx - (last.cx - tx) * k; ty = cy - (last.cy - ty) * k; s *= k; apply(); }
      last = { n: 2, cx, cy, d };
    }
  });
  const up = e => { pts.delete(e.pointerId); last = null; };
  stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
  stage.addEventListener('wheel', e => { e.preventDefault(); const r = stage.getBoundingClientRect(); const k = e.deltaY < 0 ? 1.15 : 1 / 1.15; const cx = e.clientX - r.left, cy = e.clientY - r.top; tx = cx - (cx - tx) * k; ty = cy - (cy - ty) * k; s *= k; apply(); }, { passive: false });
  let lastTap = 0;
  stage.addEventListener('pointerup', e => { const now = Date.now(); if (now - lastTap < 300 && mode === 'view') { const r = stage.getBoundingClientRect(); const k = 2.2; const cx = e.clientX - r.left, cy = e.clientY - r.top; tx = cx - (cx - tx) * k; ty = cy - (cy - ty) * k; s *= k; apply(); } lastTap = now; });

  // esquinas para enderezar
  let quad = null; const handles = [];
  const svgq = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svgq.setAttribute('class', 'quad hidden'); stage.append(svgq);
  function drawQuad() {
    if (!quad) return;
    const P = quad.map(([x, y]) => [x * s + tx, y * s + ty]);
    handles.forEach((h, i) => { h.style.left = P[i][0] + 'px'; h.style.top = P[i][1] + 'px'; });
    svgq.innerHTML = `<polygon points="${P.map(p => p.join(',')).join(' ')}" fill="rgba(196,125,44,.12)" stroke="#c47d2c" stroke-width="2"/>`;
  }
  function startQuad() {
    mode = 'quad'; fit();
    const w = canvas.width, h = canvas.height, m = 0.08;
    quad = [[w * m, h * m], [w * (1 - m), h * m], [w * (1 - m), h * (1 - m)], [w * m, h * (1 - m)]];
    svgq.classList.remove('hidden');
    for (let i = 0; i < 4; i++) {
      const hd = el('div', { class: 'corner' }); stage.append(hd); handles.push(hd);
      hd.addEventListener('pointerdown', e => { e.stopPropagation(); hd.setPointerCapture(e.pointerId); });
      hd.addEventListener('pointermove', e => { if (!hd.hasPointerCapture(e.pointerId)) return; const r = stage.getBoundingClientRect(); quad[i] = [Math.max(0, Math.min(canvas.width, (e.clientX - r.left - tx) / s)), Math.max(0, Math.min(canvas.height, (e.clientY - r.top - ty) / s))]; drawQuad(); });
    }
    drawQuad();
    toast('Arrastra las cuatro esquinas a las del panel y pulsa Guardar', 3500);
    setBtns(true);
  }
  function endQuad() { mode = 'view'; quad = null; handles.forEach(h => h.remove()); handles.length = 0; svgq.classList.add('hidden'); setBtns(dirty); }
  const setBtns = (editing) => {
    $('[data-a=save]', v).classList.toggle('hidden', !editing);
    $('[data-a=cancel]', v).classList.toggle('hidden', !(mode === 'quad'));
    $('[data-a=quad]', v).classList.toggle('hidden', mode === 'quad');
    $('[data-a=enh]', v).classList.toggle('hidden', mode === 'quad');
  };

  v.querySelector('.viewer-bottom').onclick = async e => {
    const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return;
    if (a === 'fit') fit();
    if (a === 'enh') { toast('Mejorando…'); await new Promise(r => setTimeout(r, 30)); enhance(canvas); dirty = true; setBtns(true); }
    if (a === 'quad') startQuad();
    if (a === 'cancel') endQuad();
    if (a === 'orig') { if (await confirmBox('¿Volver a la foto original y descartar las mejoras?', 'Volver')) { p.edited = null; await db.put('panels', p); img = await loadImage(p.blob); setCanvasFrom(img); fit(); changed(); } }
    if (a === 'save') {
      if (mode === 'quad') { toast('Enderezando…'); await new Promise(r => setTimeout(r, 30)); const out = warp(canvas, quad); endQuad(); canvas.replaceWith(out); canvas = out; stage.prepend(canvas); fit(); }
      const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.9));
      p.edited = blob; p.thumb = await shrinkImage(blob, 420, 0.8);
      await db.put('panels', p); dirty = false; setBtns(false); toast('Guardado'); changed();
    }
  };
  v.querySelector('[data-a=close]').onclick = () => { v.remove(); backView(); openPanel(p.id); };
}

// Estirado de niveles por canal + algo de saturación + enfoque suave
function enhance(c) {
  const ctx = c.getContext('2d');
  const d = ctx.getImageData(0, 0, c.width, c.height), a = d.data, n = a.length / 4;
  const hist = [new Uint32Array(256), new Uint32Array(256), new Uint32Array(256)];
  for (let i = 0; i < a.length; i += 16) { hist[0][a[i]]++; hist[1][a[i + 1]]++; hist[2][a[i + 2]]++; }
  const tot = n / 4, lo = [], hi = [];
  for (let ch = 0; ch < 3; ch++) {
    let acc = 0, l = 0, h = 255;
    for (let v = 0; v < 256; v++) { acc += hist[ch][v]; if (acc > tot * 0.01) { l = v; break; } }
    acc = 0; for (let v = 255; v >= 0; v--) { acc += hist[ch][v]; if (acc > tot * 0.01) { h = v; break; } }
    lo[ch] = l; hi[ch] = Math.max(l + 10, h);
  }
  const lut = [0, 1, 2].map(ch => { const t = new Uint8ClampedArray(256); for (let v = 0; v < 256; v++) t[v] = (v - lo[ch]) * 255 / (hi[ch] - lo[ch]); return t; });
  for (let i = 0; i < a.length; i += 4) {
    let r = lut[0][a[i]], g = lut[1][a[i + 1]], b = lut[2][a[i + 2]];
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    a[i] = y + (r - y) * 1.15; a[i + 1] = y + (g - y) * 1.15; a[i + 2] = y + (b - y) * 1.15;
  }
  // enfoque (máscara de desenfoque 3x3)
  const w = c.width, h = c.height, src = new Uint8ClampedArray(a);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = (y * w + x) * 4;
    for (let ch = 0; ch < 3; ch++) {
      const j = i + ch;
      const blur = (src[j - 4] + src[j + 4] + src[j - w * 4] + src[j + w * 4] + 4 * src[j]) / 8;
      a[j] = src[j] + (src[j] - blur) * 0.9;
    }
  }
  ctx.putImageData(d, 0, 0);
}

// Corrección de perspectiva: lleva el cuadrilátero a un rectángulo
function solve(A, b) {
  const n = b.length;
  for (let i = 0; i < n; i++) {
    let m = i; for (let k = i + 1; k < n; k++) if (Math.abs(A[k][i]) > Math.abs(A[m][i])) m = k;
    [A[i], A[m]] = [A[m], A[i]]; [b[i], b[m]] = [b[m], b[i]];
    for (let k = i + 1; k < n; k++) { const f = A[k][i] / A[i][i]; for (let j = i; j < n; j++) A[k][j] -= f * A[i][j]; b[k] -= f * b[i]; }
  }
  const x = new Array(n);
  for (let i = n - 1; i >= 0; i--) { let s = b[i]; for (let j = i + 1; j < n; j++) s -= A[i][j] * x[j]; x[i] = s / A[i][i]; }
  return x;
}
function homography(from, to) {
  const A = [], b = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = from[i], [u, v] = to[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
  }
  return [...solve(A, b), 1];
}
function warp(c, q) {
  const d = (p, r) => Math.hypot(p[0] - r[0], p[1] - r[1]);
  let W = Math.round(Math.max(d(q[0], q[1]), d(q[3], q[2]))), H = Math.round(Math.max(d(q[0], q[3]), d(q[1], q[2])));
  const k = Math.min(1, 3600 / Math.max(W, H)); W = Math.round(W * k); H = Math.round(H * k);
  const Hm = homography([[0, 0], [W, 0], [W, H], [0, H]], q);
  const sctx = c.getContext('2d'), sd = sctx.getImageData(0, 0, c.width, c.height).data, sw = c.width, sh = c.height;
  const out = document.createElement('canvas'); out.width = W; out.height = H;
  const octx = out.getContext('2d'), od = octx.createImageData(W, H), o = od.data;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const den = Hm[6] * x + Hm[7] * y + 1;
    const sx = (Hm[0] * x + Hm[1] * y + Hm[2]) / den, sy = (Hm[3] * x + Hm[4] * y + Hm[5]) / den;
    const x0 = Math.floor(sx), y0 = Math.floor(sy);
    if (x0 < 0 || y0 < 0 || x0 >= sw - 1 || y0 >= sh - 1) continue;
    const fx = sx - x0, fy = sy - y0, i00 = (y0 * sw + x0) * 4, i10 = i00 + 4, i01 = i00 + sw * 4, i11 = i01 + 4, oi = (y * W + x) * 4;
    for (let ch = 0; ch < 3; ch++) o[oi + ch] = (sd[i00 + ch] * (1 - fx) + sd[i10 + ch] * fx) * (1 - fy) + (sd[i01 + ch] * (1 - fx) + sd[i11 + ch] * fx) * fy;
    o[oi + 3] = 255;
  }
  octx.putImageData(od, 0, 0);
  return out;
}

export async function panelsForMap() { return (await db.all('panels').catch(() => [])).filter(p => p.lat != null); }
