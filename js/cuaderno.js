// Cuaderno de la salida: un «libro» de la zona preparada para leer sin conexión.
// Se rellena al preparar la zona (o después, con «Completar cuaderno») a partir de fuentes abiertas:
// Wikipedia (lugares), Waymarked Trails + OpenStreetMap (rutas señalizadas), IGME/Macrostrat (rocas),
// iNaturalist (especies observadas) y las fichas y explicaciones de Otero.
import { getJSON, geologyAt, macrostratAt, online } from './sources.js';
import { inSpain } from './layers.js';
import { simplify, distance, fmtDist, fmtNum } from './geo.js';
import { regionAt } from '../content/regions.js';
import { articleById } from '../content/articles.js';
import { ENTRIES, GROUP_LABELS, ZONAS } from './catalog.js';
import { openView, html, raw, $, $$, toast } from './ui.js';
import { db } from './db.js';
import { getZones } from './zones.js';
import { INAT_GROUPS } from './sources.js';

// ---------- Recopilar ----------
let SIG = null; // señal de cancelación de la recopilación en curso
const get = (u, ms) => { if (SIG?.aborted) throw new Error('Cancelado'); return getJSON(u, { signal: SIG }, ms); };
export async function buildCuaderno(zone, onStep = () => { }, signal) {
  const b = zone.bbox, c = { lat: (b.s + b.n) / 2, lon: (b.w + b.e) / 2 };
  const cu = { built: Date.now(), errors: [] };
  SIG = signal || null;
  const step = async (name, fn) => { if (signal?.aborted) throw new Error('Cancelado'); onStep(name); try { await fn(); } catch (e) { if (signal?.aborted) throw new Error('Cancelado'); cu.errors.push(`${name}: ${e.message}`); } };
  await step('Cuaderno: pueblos y lugares (Wikipedia)', async () => { cu.wiki = await wikiAround(b, c); });
  await step('Cuaderno: rutas señalizadas', async () => { cu.routes = await routesIn(b); });
  await step('Cuaderno: rocas de la zona', async () => { cu.rocks = await rocksIn(b); });
  return cu;
}

// Artículos de Wikipedia con coordenadas dentro de la zona (puntos de consulta repartidos; radio máx. 10 km)
async function wikiAround(b, c) {
  const pts = [[c.lat, c.lon]];
  const dLat = (b.n - b.s) / 4, dLon = (b.e - b.w) / 4;
  if (Math.max(b.n - b.s, b.e - b.w) > 0.12) for (const [i, j] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) pts.push([c.lat + i * dLat, c.lon + j * dLon]);
  const pages = new Map();
  for (const [la, lo] of pts) {
    const d = await get(`https://es.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${la.toFixed(5)}%7C${lo.toFixed(5)}&gsradius=10000&gslimit=60&format=json&origin=*`, 15000);
    for (const p of d?.query?.geosearch || []) if (p.lat >= b.s && p.lat <= b.n && p.lon >= b.w && p.lon <= b.e) pages.set(p.pageid, p);
  }
  const list = [...pages.values()].map(p => ({ ...p, d: distance(c.lat, c.lon, p.lat, p.lon) })).sort((a, b) => a.d - b.d).slice(0, 40);
  const out = [];
  for (let i = 0; i < list.length; i += 20) {
    const ids = list.slice(i, i + 20).map(p => p.pageid).join('|');
    const d = await get(`https://es.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&exlimit=20&pageids=${ids}&format=json&origin=*`, 15000);
    for (const p of list.slice(i, i + 20)) {
      const ex = d?.query?.pages?.[p.pageid]?.extract?.trim();
      if (ex) out.push({ title: p.title, extract: ex.slice(0, 1800), lat: p.lat, lon: p.lon, url: `https://es.wikipedia.org/?curid=${p.pageid}` });
    }
  }
  return out;
}

// Rutas señalizadas (GR, PR, SL…) que pasan por la zona. Trazado solo de las cortas (≤ 30 km).
const to3857 = (lat, lon) => [lon * 20037508.34 / 180, Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180) * 20037508.34 / 180];
async function routesIn(b) {
  const [x1, y1] = to3857(b.s, b.w), [x2, y2] = to3857(b.n, b.e);
  const d = await get(`https://hiking.waymarkedtrails.org/api/v1/list/by_area?bbox=${Math.round(x1)},${Math.round(y1)},${Math.round(x2)},${Math.round(y2)}&limit=40`, 20000);
  const routes = [];
  for (const r of (d?.results || []).slice(0, 30)) {
    const item = { id: r.id, ref: r.ref || '', name: r.name || r.ref || 'Ruta sin nombre', group: r.group, via: r.itinerary || [] };
    try {
      const det = await get(`https://hiking.waymarkedtrails.org/api/v1/details/relation/${r.id}`, 12000);
      const len = det.official_length || det.route?.length;
      item.km = len ? Math.round(len / 100) / 10 : null;
      item.url = det.url || det.tags?.website || null;
      item.desc = det.tags?.description || det.tags?.note || null;
      item.from = det.tags?.from || null; item.to = det.tags?.to || null;
      item.circular = det.linear === 'no' || det.tags?.roundtrip === 'yes';
    } catch (e) { }
    if (item.km != null && item.km <= 30) { try { item.geom = await routeGeometry(r.id); } catch (e) { } }
    routes.push(item);
  }
  const order = { LOC: 0, REG: 1, NAT: 2, INT: 3 };
  return routes.sort((a, b) => (order[a.group] ?? 9) - (order[b.group] ?? 9) || (a.km ?? 99) - (b.km ?? 99));
}
// Trazado de una relación de OpenStreetMap → polilíneas simplificadas [[lat, lon], …]
async function routeGeometry(id) {
  const d = await get(`https://api.openstreetmap.org/api/0.6/relation/${id}/full.json`, 20000);
  const nodes = new Map(), lines = [];
  for (const e of d.elements || []) if (e.type === 'node') nodes.set(e.id, [e.lat, e.lon]);
  for (const e of d.elements || []) if (e.type === 'way') { const pts = e.nodes.map(n => nodes.get(n)).filter(Boolean); if (pts.length > 1) lines.push(simplify(pts, 0.00008)); }
  return lines;
}

// Rocas: muestreo en una malla de 3×3 puntos (IGME en España; Macrostrat fuera)
async function rocksIn(b) {
  const es = inSpain((b.s + b.n) / 2, (b.w + b.e) / 2);
  const seen = new Map();
  for (const fy of [0.2, 0.5, 0.8]) for (const fx of [0.2, 0.5, 0.8]) {
    const la = b.s + (b.n - b.s) * fy, lo = b.w + (b.e - b.w) * fx;
    if (SIG?.aborted) throw new Error('Cancelado');
    const g = es ? await geologyAt(la, lo).catch(() => null) : await macrostratAt(la, lo).catch(() => null);
    const desc = g ? (g.fields.map(f => f[1]).join(' · ') || g.value) : null;
    if (desc) seen.set(desc, (seen.get(desc) || 0) + 1);
  }
  return [...seen.entries()].sort((a, b) => b[1] - a[1]).map(([desc, n]) => ({ desc, n, src: es ? 'IGME, MAGNA 1:50.000' : 'Macrostrat (escala regional, orientativo)' }));
}

// ¿Puede completarse ahora el cuaderno de una zona ya preparada?
export async function completeCuaderno(zone, onStep) {
  if (!online()) throw new Error('Necesitas conexión para completar el cuaderno');
  zone.cuaderno = await buildCuaderno(zone, onStep);
  await db.put('zones', zone);
  await getZones(true);
  return zone;
}

// ---------- Leer ----------
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
export function openCuaderno(zoneId) {
  getZones(true).then(zs => {
    const z = zs.find(x => x.id === zoneId);
    if (!z) return toast('No encuentro esa zona');
    openView(`Cuaderno · ${z.name}`, body => drawCuaderno(body, z));
  });
}

function drawCuaderno(body, z) {
  const b = z.bbox, c = { lat: (b.s + b.n) / 2, lon: (b.w + b.e) / 2 };
  const reg = regionAt(c.lat, c.lon), cu = z.cuaderno || {};
  const lifeGroup = reg?.group;
  // Fichas de Otero: las de la zona natural + las observadas en iNaturalist que Otero tenga
  const inatSci = new Set(Object.values(z.inat || {}).flat().map(t => norm(t.sci)));
  const inOtero = ENTRIES.filter(e => e.g !== 'roc' && e.sci && inatSci.has(norm(e.sci)));
  const zoneSp = ENTRIES.filter(e => e.g !== 'roc' && lifeGroup && (e.r || []).includes(lifeGroup));
  const peaks = (z.farPeaks || []).filter(p => p.lat >= b.s && p.lat <= b.n && p.lon >= b.w && p.lon <= b.e).sort((a, b) => b.ele - a.ele).slice(0, 12);
  const pois = (z.places || []).filter(p => ['refugio', 'fuente', 'mirador', 'cueva', 'collado', 'lago', 'árbol singular'].includes(p.kind));
  const chap = (id, t, inner, open = false) => html`<details class="card" id="${id}" ${raw(open ? 'open' : '')}><summary><b>${t}</b></summary>${raw(inner)}</details>`;
  const fc = z.forecast?.daily;
  body.innerHTML = html`<div class="article" style="font-size:16px">
    <p class="kicker">Cuaderno de la salida · sin conexión</p><h2 style="margin-top:0">${z.name}</h2>
    <p class="small muted">Preparado el ${new Date(z.created).toLocaleDateString('es-ES')}${cu.built ? '' : ' · sin cuaderno todavía'}${reg ? ` · ${reg.name}` : ''}${z.admin?.provincia ? ` · ${z.admin.provincia}` : ''}</p>
    <input type="search" id="cuq" placeholder="Buscar en este cuaderno…" style="margin:4px 0 10px">
    <div id="cures"></div>
    ${raw(!cu.built ? html`<div class="note">Esta zona se preparó antes de que existiera el cuaderno. <button class="btn small" id="cucomp">Completar cuaderno</button> (necesita conexión)</div>` : '')}
    ${raw(chap('c-paisaje', '🏔️ El paisaje', reg ? html`<p>${reg.summary}</p>${raw(reg.climate ? html`<p><b>Clima.</b> ${reg.climate}</p>` : '')}${raw(reg.veg ? html`<p><b>Vegetación.</b> ${reg.veg}</p>` : '')}${raw(reg.fauna ? html`<p><b>Fauna.</b> ${reg.fauna}</p>` : '')}<ul class="list">${raw((reg.articles || []).map(articleById).filter(Boolean).map(a => html`<li data-art="${a.id}"><span class="k">${a.em}</span><b class="grow">${a.title}</b><span class="muted">›</span></li>`).join(''))}</ul>` : '<p class="muted">Sin ficha de sierra para esta zona.</p>', true))}
    ${raw(cu.wiki?.length ? chap('c-lugares', `🏘️ Pueblos y lugares (${cu.wiki.length})`, cu.wiki.map(w => html`<details class="sub"><summary>${w.title} <span class="tiny muted">${fmtDist(distance(c.lat, c.lon, w.lat, w.lon))}</span></summary><p class="small" style="line-height:1.5;white-space:pre-line">${w.extract}</p><p class="tiny"><a href="${w.url}" target="_blank" rel="noopener">Wikipedia</a> · <a href="#" data-map="${w.lat},${w.lon}">Ver en el mapa</a></p></details>`).join('') + '<p class="tiny muted">Textos: Wikipedia (CC BY-SA), introducción de cada artículo.</p>') : '')}
    ${raw(cu.routes?.length ? chap('c-rutas', `🥾 Rutas señalizadas (${cu.routes.length})`, cu.routes.map(r => html`<div class="route"><b>${r.ref && r.ref !== r.name ? r.ref + ' · ' : ''}${r.name}</b><div class="small muted">${r.km != null ? fmtNum(r.km, 1) + ' km' : ''}${r.circular ? ' · circular' : ''}${r.via?.length ? ' · ' + r.via.join(' → ') : ''}${r.geom ? ' · trazado en el mapa' : ''}</div>${raw(r.desc ? html`<p class="small">${r.desc}</p>` : '')}${raw(r.url ? html`<p class="tiny"><a href="${r.url}" target="_blank" rel="noopener">Ficha oficial</a> (con conexión)</p>` : '')}</div>`).join('') + '<p class="tiny muted">Rutas: Waymarked Trails y OpenStreetMap. Comprueba el estado del camino antes de salir: la señalización y los datos pueden estar desactualizados.</p>') : '')}
    ${raw(peaks.length || pois.length ? chap('c-puntos', '⛰️ Cumbres y puntos de interés', (peaks.length ? html`<p class="kicker">Cumbres</p><ul class="list">${raw(peaks.map(p => html`<li><span class="k">⛰️</span><b class="grow">${p.name}</b><span class="small">${fmtNum(p.ele)} m</span></li>`).join(''))}</ul>` : '') + (pois.length ? html`<p class="kicker">Refugios, fuentes, miradores…</p><ul class="list">${raw(pois.slice(0, 40).map(p => html`<li><span class="k">📍</span><div class="grow"><b>${p.name}</b><div class="tiny muted">${p.kind}${p.ele ? ' · ' + fmtNum(p.ele) + ' m' : ''}</div></div></li>`).join(''))}</ul>` : '')) : '')}
    ${raw(cu.rocks?.length ? chap('c-roca', '🪨 Las rocas', html`<ul class="list">${raw(cu.rocks.map(r => html`<li style="display:block">${r.desc}</li>`).join(''))}</ul><p class="tiny muted">Muestreo de 9 puntos de la zona. Fuente: ${cu.rocks[0].src}.</p>`) : '')}
    ${raw(chap('c-vida', '🌿 Qué vive aquí', (inOtero.length ? html`<p class="kicker">Observado en la zona y con ficha en Otero (${inOtero.length})</p><ul class="list">${raw(inOtero.slice(0, 60).map(e => html`<li data-sp="${e.id}"><span class="k">${e.em || '•'}</span><div class="grow"><b>${e.n}</b><div class="tiny muted">${GROUP_LABELS[e.g]}</div></div><span class="muted">›</span></li>`).join(''))}</ul>` : '') +
      (z.inat ? html`<p class="kicker">Todo lo observado (iNaturalist)</p>${raw(Object.entries(INAT_GROUPS).filter(([g]) => z.inat[g]?.length).map(([g, n]) => html`<details class="sub"><summary>${n} (${z.inat[g].length})</summary><ul class="list">${raw(z.inat[g].map(t => html`<li><div class="grow"><b>${t.common || t.sci}</b><div class="tiny sp-sci">${t.sci}</div></div><span class="tiny muted">${t.count} obs.</span></li>`).join(''))}</ul></details>`).join(''))}` : '') +
      (zoneSp.length ? html`<p class="kicker">Fichas de Otero de ${(ZONAS[lifeGroup] || '').split(' (')[0]} (${zoneSp.length})</p><button class="btn small sec" id="cusp">Ver por grupos</button>` : '')))}
    ${raw(fc ? chap('c-tiempo', '🌦️ Tiempo guardado', html`<p class="small">Previsión descargada el ${new Date(z.forecast.fetchedAt).toLocaleString('es-ES')}:</p><ul class="list">${raw(fc.time.map((t, i) => html`<li><b class="grow">${new Date(t).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}</b><span class="small">${Math.round(fc.temperature_2m_min[i])}° / ${Math.round(fc.temperature_2m_max[i])}° · ${fc.precipitation_sum[i] ? fmtNum(fc.precipitation_sum[i], 1) + ' mm · ' : ''}sol ${String(fc.sunrise?.[i] || '').slice(11, 16)}–${String(fc.sunset?.[i] || '').slice(11, 16)}</span></li>`).join(''))}</ul>`) : '')}
    ${raw(chap('c-notas', '✏️ Mis notas', html`<textarea id="cunotes" rows="5" placeholder="Apuntes para esta salida (se guardan en el móvil)">${z.notes || ''}</textarea>`))}
    ${raw(cu.errors?.length ? html`<p class="tiny muted">No se pudo completar: ${cu.errors.join(' · ')}</p>` : '')}
  </div>`;
  $$('[data-art]', body).forEach(e => e.onclick = () => import('./library.js').then(m => m.openArticle(e.dataset.art)));
  $$('[data-sp]', body).forEach(e => e.onclick = () => import('./library.js').then(m => m.openSpecies(e.dataset.sp)));
  $$('[data-map]', body).forEach(a => a.onclick = ev => { ev.preventDefault(); const [la, lo] = a.dataset.map.split(',').map(Number); document.dispatchEvent(new CustomEvent('go-place', { detail: { lat: la, lon: lo, name: a.closest('details')?.querySelector('summary')?.firstChild?.textContent?.trim() } })); });
  const sp = $('#cusp', body); if (sp) sp.onclick = () => openView('Qué vive aquí', bb => { bb.innerHTML = Object.entries(GROUP_LABELS).filter(([g]) => zoneSp.some(e => e.g === g)).map(([g, n]) => html`<details class="card"><summary><b>${n}</b> (${zoneSp.filter(e => e.g === g).length})</summary><ul class="list">${raw(zoneSp.filter(e => e.g === g).map(e => html`<li data-sp="${e.id}"><span class="k">${e.em || '•'}</span><b class="grow">${e.n}</b><span class="muted">›</span></li>`).join(''))}</ul></details>`).join(''); $$('[data-sp]', bb).forEach(e => e.onclick = () => import('./library.js').then(m => m.openSpecies(e.dataset.sp))); });
  const notes = $('#cunotes', body);
  let t; notes.oninput = () => { clearTimeout(t); t = setTimeout(async () => { z.notes = notes.value; await db.put('zones', z); }, 600); };
  const comp = $('#cucomp', body);
  if (comp) comp.onclick = async () => {
    comp.disabled = true;
    try { await completeCuaderno(z, s => { comp.textContent = s + '…'; }); drawCuaderno(body, z); document.dispatchEvent(new CustomEvent('data-changed')); }
    catch (e) { toast(e.message, 4000); comp.disabled = false; comp.textContent = 'Completar cuaderno'; }
  };
  // Buscar dentro del cuaderno (texto de todos los capítulos)
  const q = $('#cuq', body), res = $('#cures', body);
  q.oninput = () => {
    const words = norm(q.value).split(/\s+/).filter(w => w.length > 2);
    if (!words.length) { res.innerHTML = ''; return; }
    const hits = [];
    for (const w of cu.wiki || []) { const txt = norm(w.title + ' ' + w.extract); if (words.every(x => txt.includes(x))) hits.push(html`<li style="display:block"><b>${w.title}</b><div class="small">${snippet(w.extract, words)}</div></li>`); }
    for (const r of cu.routes || []) { const txt = norm([r.ref, r.name, ...(r.via || []), r.desc].join(' ')); if (words.every(x => txt.includes(x))) hits.push(html`<li style="display:block"><b>🥾 ${r.ref} ${r.name}</b></li>`); }
    for (const p of [...(z.places || []), ...(z.farPeaks || [])]) { if (words.every(x => norm(p.name).includes(x))) hits.push(html`<li><b class="grow">📍 ${p.name}</b><span class="tiny muted">${p.kind || 'pico'}</span></li>`); if (hits.length > 40) break; }
    res.innerHTML = hits.length ? html`<ul class="list">${raw(hits.slice(0, 40).join(''))}</ul>` : '<p class="small muted">Nada en este cuaderno con esas palabras. Prueba en «Pregúntale a Otero».</p>';
  };
}
function snippet(text, words) {
  const n = norm(text), i = Math.max(0, n.indexOf(words[0]) - 80);
  return (i > 0 ? '…' : '') + text.slice(i, i + 220) + '…';
}
