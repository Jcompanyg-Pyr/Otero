// «Saber»: especies, rocas, explicaciones, guía de huellas, diccionario de nombres y «Pregúntale a Otero».
import { SPECIES, TRACK_TYPES, SCAT_TYPES } from '../content/species.js';
import { ARTICLES, articleById } from '../content/articles.js';
import { TOPONIMIA } from '../content/toponimia.js';
import { regionAt } from '../content/regions.js';
import { openView, html, raw, esc, $, $$ } from './ui.js';
import { state } from './state.js';
import { INAT_GROUPS } from './sources.js';
import { fmtNum } from './geo.js';
import { ENTRIES, entryById, GROUP_LABELS, ZONAS, SUBS, TRAITS, HABITATS, search, matchTraits, norm } from './catalog.js';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const TOX = { mortal: ['☠️ MORTAL', 'bad'], toxica: ['⚠️ Tóxica', 'bad'], 'comestible-precaucion': ['Comestible, con riesgo de confusión', 'warn'], 'no-comestible': ['No comestible', 'warn'] };

// Lo más probable en una zona y altitud, ordenado por lo bien que encaja la altitud
export function speciesFor(regionGroup, ele) {
  const fit = s => ele == null ? 0 : Math.abs(ele - (s.alt[0] + s.alt[1]) / 2) / Math.max(200, s.alt[1] - s.alt[0]);
  return SPECIES.filter(s => (!regionGroup || (s.r || []).includes(regionGroup)) && (ele == null || (ele >= s.alt[0] - 150 && ele <= s.alt[1] + 150)))
    .sort((a, b) => fit(a) - fit(b));
}

const spCard = s => html`<li data-sp="${s.id}"><span class="k">${s.em || '•'}</span><div class="grow"><b>${s.n}</b>${raw(s.tox === 'mortal' || s.tox === 'toxica' ? ` <span class="pill bad">${TOX[s.tox][0]}</span>` : '')}<div class="small sp-sci">${s.sci || SUBS[s.g]?.[s.sub] || ''}</div></div><span class="muted">›</span></li>`;

export function openLibrary(tab) {
  openView('Saber', (body) => renderLibrary(body, tab || state.libTab || 'aqui'), { root: true });
}

function renderLibrary(body, tab) {
  state.libTab = tab;
  const tabs = [['aqui', 'Aquí'], ['especies', 'Especies'], ['rocas', 'Rocas'], ['explica', 'Explicaciones'], ['huellas', 'Huellas'], ['nombres', 'Nombres']];
  body.innerHTML = html`<form id="askf" class="ask" autocomplete="off"><input type="search" id="askq" placeholder="Pregúntale a Otero: «árbol de hoja rojiza junto al río»" enterkeyhint="search"><button class="btn small">Buscar</button></form>
    <div class="seg scroll">${raw(tabs.map(([k, n]) => `<button data-t="${k}" class="${k === tab ? 'on' : ''}">${n}</button>`).join(''))}</div><div id="libc"></div>`;
  $$('.seg button', body).forEach(b => b.onclick = () => renderLibrary(body, b.dataset.t));
  $('#askf', body).onsubmit = e => { e.preventDefault(); const q = $('#askq', body).value.trim(); if (q) openAsk(q); };
  const c = $('#libc', body);
  ({ aqui: renderHere, especies: c => renderCatalog(c, 'bio'), rocas: c => renderCatalog(c, 'roc'), explica: renderArticles, huellas: renderTrackKey, nombres: renderToponimia })[tab](c);
}

// ---------- Aquí ----------
function renderHere(c) {
  const p = state.lastPoint;
  if (!p) {
    c.innerHTML = `<div class="note">Toca «¿Dónde estoy?» o cualquier punto del mapa y aquí verás lo que es más probable encontrar en ese sitio y las explicaciones de su paisaje.</div>`;
    renderArticles(c, true);
    return;
  }
  const reg = regionAt(p.lat, p.lon);
  const list = speciesFor(reg?.group, p.ele);
  const byG = Object.entries(GROUP_LABELS).map(([g, n]) => [g, n, list.filter(s => s.g === g)]).filter(([, , l]) => l.length);
  c.innerHTML = html`
    <p class="kicker">Último punto consultado</p>
    <h2 class="title" style="margin-top:0">${reg ? reg.name : 'Fuera de las sierras de la biblioteca'}</h2>
    <p class="sub">${p.label || ''}${p.ele != null ? ` · ${fmtNum(p.ele)} m` : ''}${reg ? ` · ${ZONAS[reg.group] || ''}` : ''}</p>
    ${raw(reg ? html`<div class="card"><p style="margin:0 0 8px;line-height:1.5">${reg.summary}</p>${raw(reg.climate ? html`<p class="small" style="margin:0 0 6px"><b>Clima.</b> ${reg.climate}</p>` : '')}${raw(reg.veg ? html`<p class="small" style="margin:0 0 6px"><b>Vegetación.</b> ${reg.veg}</p>` : '')}${raw(reg.fauna ? html`<p class="small" style="margin:0"><b>Fauna.</b> ${reg.fauna}</p>` : '')}${raw(reg.peaks?.length ? html`<p class="small" style="margin:6px 0 0"><b>Cumbres.</b> ${reg.peaks.join(' · ')}</p>` : '')}</div>
      <p class="kicker">Para entender este paisaje</p><ul class="list">${raw((reg.articles || []).map(articleById).filter(Boolean).map(a => html`<li data-art="${a.id}"><span class="k">${a.em}</span><b class="grow">${a.title}</b><span class="muted">›</span></li>`).join(''))}</ul>` : '')}
    <p class="kicker" style="margin-top:16px">Lo más probable aquí${p.ele != null ? ' a esta altitud' : ''}</p>
    ${raw(byG.map(([g, n, l]) => html`<details class="card" ${raw(g === 'arb' || g === 'mam' || g === 'ave' ? 'open' : '')}><summary><b>${n}</b> <span class="muted small">(${l.length})</span></summary><ul class="list">${raw(l.slice(0, 15).map(spCard).join(''))}</ul>${raw(l.length > 15 ? html`<button class="btn small sec block" data-more="${g}">Ver las ${l.length}</button>` : '')}</details>`).join(''))}
    <div id="inat-here"></div>`;
  wire(c);
  $$('[data-more]', c).forEach(b => b.onclick = () => openView(GROUP_LABELS[b.dataset.more], body => { body.innerHTML = html`<ul class="list">${raw(list.filter(s => s.g === b.dataset.more).map(spCard).join(''))}</ul>`; wire(body); }));
  const z = state.lastZone;
  if (z?.inat) {
    const box = $('#inat-here', c);
    box.innerHTML = html`<p class="kicker" style="margin-top:18px">Observado por la gente en esta zona (iNaturalist)</p>${raw(inatHTML(z.inat))}`;
  }
}

export function inatHTML(inat, max = 8) {
  return Object.entries(INAT_GROUPS).filter(([g]) => inat[g]?.length).map(([g, n]) => html`<details class="card"><summary><b>${n}</b> <span class="muted small">(${inat[g].length})</span></summary><ul class="list">${raw(inat[g].slice(0, 25).map(t => html`<li><div class="grow"><b>${t.common || t.sci}</b><div class="small sp-sci">${t.sci}</div></div><span class="tiny muted">${t.count} obs.</span></li>`).join(''))}</ul></details>`).join('');
}

// ---------- Catálogo (Especies / Rocas) con filtros por zona, grupo, subgrupo y rasgos ----------
const catState = { bio: { g: '', zona: null, sub: '', sel: {}, q: '' }, roc: { g: 'roc', zona: '', sub: '', sel: {}, q: '' } };
function renderCatalog(c, kind) {
  const st = catState[kind];
  if (st.zona == null) st.zona = regionAt(state.lastPoint?.lat ?? 0, state.lastPoint?.lon ?? 0)?.group || '';
  const pool = ENTRIES.filter(e => kind === 'roc' ? e.g === 'roc' : e.g !== 'roc');
  const groups = kind === 'roc' ? [] : Object.keys(GROUP_LABELS).filter(g => g !== 'roc' && pool.some(e => e.g === g));
  const draw = () => {
    const g = kind === 'roc' ? 'roc' : st.g;
    const traits = g ? TRAITS[g] || {} : {};
    const nSel = Object.values(st.sel).reduce((a, s) => a + s.size, 0);
    c.innerHTML = html`<input type="search" id="cq" placeholder="Filtrar por nombre" value="${st.q}">
      ${raw(groups.length ? html`<div class="chips">${raw(['', ...groups].map(k => html`<button class="chip-b ${k === st.g ? 'on' : ''}" data-g="${k}">${k ? GROUP_LABELS[k] : 'Todo'}</button>`).join(''))}</div>` : '')}
      <div class="row" style="gap:8px;margin:6px 0"><select id="cz" class="grow"><option value="">Todas las zonas de España</option>${raw(Object.entries(ZONAS).map(([k, n]) => html`<option value="${k}" ${k === st.zona ? 'selected' : ''}>${n}</option>`).join(''))}</select>
      ${raw(g && SUBS[g] ? html`<select id="cs" class="grow"><option value="">Todos los tipos</option>${raw(Object.entries(SUBS[g]).map(([k, n]) => html`<option value="${k}" ${k === st.sub ? 'selected' : ''}>${n}</option>`).join(''))}</select>` : '')}</div>
      <details class="card traits" ${raw(nSel ? 'open' : '')}><summary><b>Buscar por rasgos</b> ${raw(nSel ? `<span class="pill">${nSel}</span>` : '')} <span class="muted small">${g ? '' : '(elige antes un grupo para ver más rasgos)'}</span></summary>
        ${raw([...Object.entries(traits), ['hab', { label: 'Hábitat', opts: HABITATS }]].map(([k, def]) => html`<p class="kicker" style="margin:10px 0 4px">${def.label}</p><div class="chips">${raw(Object.entries(def.opts).map(([v, n]) => html`<button class="chip-b ${st.sel[k]?.has(v) ? 'on' : ''}" data-k="${k}" data-v="${v}">${n}</button>`).join(''))}</div>`).join(''))}
        ${raw(nSel ? '<button class="btn small sec" id="clr" style="margin-top:10px">Quitar rasgos</button>' : '')}</details>
      <p class="small muted" id="cn"></p><ul class="list" id="cl"></ul>`;
    $('#cq', c).oninput = e => { st.q = e.target.value; list(); };
    $$('[data-g]', c).forEach(b => b.onclick = () => { st.g = b.dataset.g; st.sub = ''; st.sel = {}; draw(); });
    $('#cz', c).onchange = e => { st.zona = e.target.value; list(); };
    const cs = $('#cs', c); if (cs) cs.onchange = e => { st.sub = e.target.value; list(); };
    $$('[data-k]', c).forEach(b => b.onclick = () => { const s = (st.sel[b.dataset.k] ||= new Set()); s.has(b.dataset.v) ? s.delete(b.dataset.v) : s.add(b.dataset.v); b.classList.toggle('on'); list(); });
    const clr = $('#clr', c); if (clr) clr.onclick = () => { st.sel = {}; draw(); };
    list();
  };
  const list = () => {
    const g = kind === 'roc' ? 'roc' : st.g, q = norm(st.q).trim();
    let l = pool.filter(e => (!g || e.g === g) && (!st.zona || (e.r || []).includes(st.zona)) && (!st.sub || e.sub === st.sub) && (!q || norm(e.n + ' ' + (e.sci || '') + ' ' + (e.alt_n || []).join(' ')).includes(q)));
    const scored = l.map(e => ({ e, m: matchTraits(e, st.sel) }));
    const total = scored[0]?.m.total || 0;
    let exact = total ? scored.filter(x => x.m.ok === total) : scored;
    let near = total ? scored.filter(x => x.m.ok === total - 1 && total > 1) : [];
    const ul = $('#cl', c);
    // número de rasgos elegidos, visible aunque el panel esté cerrado
    const nSel = Object.values(st.sel).reduce((a, s) => a + s.size, 0), sm = $('.card.traits summary', c);
    sm.querySelector('.pill')?.remove(); if (nSel) sm.querySelector('b').insertAdjacentHTML('afterend', ` <span class="pill">${nSel}</span>`);
    $('#cn', c).textContent = total ? `${exact.length} encajan con todos los rasgos elegidos${near.length ? ` · ${near.length} con casi todos` : ''}` : `${l.length} fichas`;
    const byGroup = arr => Object.keys(GROUP_LABELS).map(gg => [gg, arr.filter(x => x.e.g === gg)]).filter(([, a]) => a.length)
      .map(([gg, a]) => html`${raw(!g ? html`<li class="kicker" style="display:block;margin-top:10px">${GROUP_LABELS[gg]}</li>` : '')}${raw(a.map(x => spCard(x.e)).join(''))}`).join('');
    ul.innerHTML = (byGroup(exact) || '<li class="muted">Ninguna ficha encaja con todo. Quita algún rasgo o elige «Todas las zonas».</li>') +
      (near.length ? html`<li class="kicker" style="display:block;margin-top:14px">Casi (falla un rasgo)</li>${raw(near.slice(0, 20).map(x => spCard(x.e)).join(''))}` : '');
    wire(ul);
  };
  draw();
}

// ---------- Ficha ----------
export function openSpecies(id) {
  const s = entryById(id);
  if (!s) return;
  openView(s.n, body => {
    const sec = (t, v) => v ? html`<div class="sp-sec"><h4>${t}</h4><p>${v}</p></div>` : '';
    const tdefs = { ...(TRAITS[s.g] || {}), hab: { label: 'Hábitat', opts: HABITATS } };
    const traitRows = Object.entries(s.t || {}).map(([k, vals]) => tdefs[k] ? html`<dt>${tdefs[k].label}</dt><dd>${[].concat(vals).map(v => tdefs[k].opts[v] || v).join(', ')}</dd>` : '').join('');
    const tox = s.tox ? TOX[s.tox] : null;
    body.innerHTML = html`<div class="article" style="font-size:16px">
      ${raw(tox ? html`<div class="note ${tox[1] === 'bad' ? 'danger' : 'warn'}"><b>${tox[0]}.</b> ${s.g === 'hon' ? 'Nunca comas una seta identificada solo con una app o una foto: consulta a un micólogo o a una sociedad micológica.' : 'Precaución.'}</div>` : (s.g === 'hon' ? '<div class="note warn small">Nunca comas una seta identificada solo con una app o una foto.</div>' : ''))}
      <div class="sp-head"><div class="sp-em">${s.em || '•'}</div><div><h2 style="margin:0;font-size:24px">${s.n}</h2>${raw(s.sci ? html`<div class="sp-sci">${s.sci}</div>` : '')}${raw(s.alt_n?.length ? html`<div class="small muted">${s.alt_n.join(' · ')}</div>` : '')}
        <div class="small" style="margin-top:4px">${GROUP_LABELS[s.g]}${s.sub && SUBS[s.g]?.[s.sub] ? ' · ' + SUBS[s.g][s.sub] : ''}</div></div></div>
      <div class="chips" style="margin:6px 0">${raw((s.r || []).map(z => html`<span class="pill">${(ZONAS[z] || z).split(' (')[0]}</span>`).join(''))}${raw(s.alt ? html`<span class="pill">${fmtNum(s.alt[0])}–${fmtNum(s.alt[1])} m</span>` : '')}${raw(s.mes?.length ? html`<span class="pill">${s.mes.map(m => MESES[m - 1]).join(' ')}</span>` : '')}</div>
      ${raw(s.prot ? html`<div class="note small"><b>Protección.</b> ${s.prot}</div>` : '')}
      ${raw(sec('Cómo reconocerlo', s.idf))}${raw(sec('Con qué se confunde', s.sim))}${raw(sec('Dónde vive', s.hab))}${raw(sec('Comportamiento', s.beh))}
      ${raw(s.cur ? html`<div class="box"><b>Curiosidad</b>${s.cur}</div>` : '')}
      ${raw(s.trk ? sec('Huella', s.trk.desc) : '')}${raw(s.scat ? sec('Excremento', s.scat.desc) : '')}
      ${raw(s.tec ? html`<div class="box tech"><b>Datos</b>${s.tec}</div>` : '')}
      ${raw(traitRows ? html`<details class="card"><summary><b>Rasgos</b></summary><dl class="kv">${raw(traitRows)}</dl></details>` : '')}
      ${raw(s.g !== 'roc' && s.sci ? html`<p class="tiny muted">Más fotos: <a href="https://www.inaturalist.org/taxa/search?q=${encodeURIComponent(s.sci.split(/[ /,]/).slice(0, 2).join(' '))}&locale=es" target="_blank" rel="noopener">iNaturalist</a> · <a href="https://es.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(s.sci)}" target="_blank" rel="noopener">Wikipedia</a>. Textos de Otero: divulgativos; contrasta con una guía de campo.</p>` : '<p class="tiny muted">Textos de Otero: divulgativos; contrasta con una guía.</p>')}</div>`;
  });
}

// ---------- Pregúntale a Otero ----------
const KIND_LABEL = { entry: 'Fichas', article: 'Explicaciones', topo: 'Nombres de lugares', region: 'Sierras' };
const EXAMPLES = ['árbol de hoja rojiza en otoño junto al río', 'serpiente con pupila vertical', 'seta blanca mortal', 'por qué hace más frío al subir', 'qué significa paco', 'pájaro que trepa por las rocas', 'roca que hace burbujas con vinagre', 'flor azul de alta montaña en Sierra Nevada'];
export function openAsk(q = '') {
  openView('Pregúntale a Otero', body => {
    body.innerHTML = html`<form id="af" class="ask" autocomplete="off"><input type="search" id="aq" value="${q}" placeholder="Escribe como hablas…" enterkeyhint="search"><button class="btn small">Buscar</button></form>
      <p class="tiny muted" style="margin:4px 0 10px">Busca en todo lo que Otero lleva dentro (fichas, explicaciones, nombres de lugares y sierras) y funciona sin conexión. No inventa: te enseña lo que encaja y por qué.</p>
      <div id="ar"></div>`;
    const run = () => {
      const qq = $('#aq', body).value.trim();
      const out = $('#ar', body);
      if (!qq) { out.innerHTML = html`<p class="kicker">Prueba con…</p><div class="chips">${raw(EXAMPLES.map(x => html`<button class="chip-b" data-ex="${x}">${x}</button>`).join(''))}</div>`; $$('[data-ex]', out).forEach(b => b.onclick = () => { $('#aq', body).value = b.dataset.ex; run(); }); return; }
      const here = regionAt(state.lastPoint?.lat ?? 0, state.lastPoint?.lon ?? 0);
      const { pq, results } = search(qq, { here });
      const understood = [...pq.groups.map(g => GROUP_LABELS[g]), ...pq.notes, ...(pq.alt ? [pq.altCmp === 'min' ? `por encima de ${pq.alt} m` : pq.altCmp === 'max' ? `por debajo de ${pq.alt} m` : `a unos ${pq.alt} m`] : []), ...pq.terms.map(t => t.syn && t.syn !== t.w ? `${t.w} → ${t.syn.replace(/-/g, ' ')}` : t.w)];
      if (!results.length) { out.innerHTML = html`<p class="muted">No encuentro nada que encaje. Prueba con otras palabras (color, forma, dónde lo viste) o busca en Especies por rasgos.</p>`; searchCuadernos(qq, out); return; }
      const groups = {};
      for (const r of results) (groups[r.kind] ||= []).push(r);
      out.innerHTML = html`<p class="small muted">Entiendo: ${understood.join(' · ')}</p>` + (pq.intent === 'huella' ? '<div class="note small">Para saber de quién es una huella o un excremento, la <b>guía de Huellas</b> te pregunta forma y tamaño. <button class="btn small" id="gohu">Abrir la guía</button></div>' : '') + Object.entries(KIND_LABEL).filter(([k]) => groups[k]).map(([k, label]) => k === 'entry' ? entriesHTML(groups[k]) : html`<p class="kicker" style="margin-top:14px">${label}</p><ul class="list">${raw(groups[k].slice(0, 8).map(r => resultHTML(r)).join(''))}</ul>`).join('');
      wire(out);
      $$('[data-reg]', out).forEach(li => li.onclick = () => openRegion(li.dataset.reg));
      searchCuadernos(qq, out);
      const gh = $('#gohu', out); if (gh) gh.onclick = () => openLibrary('huellas');
    };
    $('#af', body).onsubmit = e => { e.preventDefault(); $('#aq', body).blur(); run(); };
    run();
  });
}
// También busca en los cuadernos de las zonas preparadas (Wikipedia y rutas guardadas)
async function searchCuadernos(q, out) {
  const words = norm(q).split(/\s+/).filter(w => w.length > 3);
  if (!words.length) return;
  const { getZones } = await import('./zones.js');
  const hits = [];
  for (const z of await getZones()) {
    const cu = z.cuaderno; if (!cu) continue;
    for (const w of cu.wiki || []) { const t = norm(w.title + ' ' + w.extract); const n = words.filter(x => t.includes(x)).length; if (n >= Math.ceil(words.length * 0.6)) hits.push({ n, h: html`<li data-cz="${z.id}"><span class="k">📖</span><div class="grow"><b>${w.title}</b><div class="tiny muted">Cuaderno «${z.name}»</div></div><span class="muted">›</span></li>` }); }
    for (const r of cu.routes || []) { const t = norm([r.ref, r.name, ...(r.via || [])].join(' ')); const n = words.filter(x => t.includes(x)).length; if (n >= Math.ceil(words.length * 0.6)) hits.push({ n, h: html`<li data-cz="${z.id}"><span class="k">🥾</span><div class="grow"><b>${r.ref} ${r.name}</b><div class="tiny muted">Cuaderno «${z.name}»</div></div><span class="muted">›</span></li>` }); }
  }
  if (!hits.length || !document.body.contains(out)) return;
  hits.sort((a, b) => b.n - a.n);
  out.insertAdjacentHTML('beforeend', html`<p class="kicker" style="margin-top:14px">En tus cuadernos de salida</p><ul class="list">${raw(hits.slice(0, 10).map(x => x.h).join(''))}</ul>`);
  $$('[data-cz]', out).forEach(li => li.onclick = () => import('./cuaderno.js').then(m => m.openCuaderno(li.dataset.cz)));
}
// Fichas: si una encaja claramente mejor, se destaca como «Lo más probable» y el resto va aparte
function entriesHTML(list) {
  const [best, second] = list;
  const clear = !second || best.score >= second.score * 1.25;
  if (!clear) return html`<p class="kicker" style="margin-top:14px">Fichas que encajan</p><ul class="list">${raw(list.slice(0, 25).map(r => resultHTML(r)).join(''))}</ul>`;
  const rest = list.slice(1);
  return html`<p class="kicker" style="margin-top:14px">Lo más probable</p><ul class="list best">${raw(resultHTML(best))}</ul>
    ${raw(rest.length ? html`<details class="card" ${raw(rest.length <= 4 ? 'open' : '')}><summary><b>Otras posibilidades</b> <span class="muted small">(${rest.length})</span></summary><ul class="list">${raw(rest.slice(0, 25).map(r => resultHTML(r)).join(''))}</ul></details>` : '')}
    <p class="tiny muted">Es una orientación: compara con la ficha («Cómo reconocerlo» y «Con qué se confunde») antes de darlo por seguro.</p>`;
}
function resultHTML(r) {
  const e = r.e;
  if (r.kind === 'entry') return html`<li data-sp="${e.id}"><span class="k">${e.em || '•'}</span><div class="grow"><b>${e.n}</b> <span class="tiny muted">${GROUP_LABELS[e.g]}</span>${raw(e.tox === 'mortal' ? ' <span class="pill bad">☠️</span>' : '')}<div class="small sp-sci">${e.sci || ''}</div>${raw(r.why.length ? html`<div class="tiny" style="color:var(--moss)">encaja: ${r.why.map(w => w.replace(/[-_]/g, ' ')).join(', ')}</div>` : '')}</div><span class="muted">›</span></li>`;
  if (r.kind === 'article') return html`<li data-art="${e.id}"><span class="k">${e.em}</span><div class="grow"><b>${e.title}</b><div class="small muted">${String(e.lead || '').slice(0, 140)}…</div></div><span class="muted">›</span></li>`;
  if (r.kind === 'topo') return html`<li style="display:block"><b>${e.t}</b>${raw(e.l ? html` <span class="tiny muted">${e.l}</span>` : '')}<div class="small" style="line-height:1.45">${e.d}</div></li>`;
  return html`<li data-reg="${e.id}"><span class="k">⛰️</span><div class="grow"><b>${e.name}</b><div class="small muted">${String(e.summary || '').slice(0, 140)}…</div></div><span class="muted">›</span></li>`;
}
function openRegion(id) {
  import('../content/regions.js').then(({ REGIONS }) => {
    const r = REGIONS.find(x => x.id === id); if (!r) return;
    openView(r.name, body => {
      body.innerHTML = html`<div class="article"><p class="kicker">${ZONAS[r.group] || ''}</p><h2>${r.name}</h2><p>${r.summary}</p>${raw(r.climate ? html`<h3>Clima</h3><p>${r.climate}</p>` : '')}${raw(r.veg ? html`<h3>Vegetación</h3><p>${r.veg}</p>` : '')}${raw(r.fauna ? html`<h3>Fauna</h3><p>${r.fauna}</p>` : '')}${raw(r.peaks?.length ? html`<h3>Cumbres</h3><p>${r.peaks.join(' · ')}</p>` : '')}
        <ul class="list">${raw((r.articles || []).map(articleById).filter(Boolean).map(a => html`<li data-art="${a.id}"><span class="k">${a.em}</span><b class="grow">${a.title}</b><span class="muted">›</span></li>`).join(''))}</ul></div>`;
      wire(body);
    });
  });
}

// ---------- Explicaciones ----------
function renderArticles(c, append = false) {
  // agrupadas por tema (Relieve, Clima, Meteorología…)
  const kickers = [...new Set(ARTICLES.map(a => a.kicker))];
  const h = html`<p class="kicker" style="margin-top:${append ? 18 : 4}px">Explicaciones (${ARTICLES.length})</p>` + kickers.map(k => html`<h3 style="margin:14px 0 6px;font-size:17px">${k}</h3><div class="grid2">${raw(ARTICLES.filter(a => a.kicker === k).map(a => html`<button class="tile" data-art="${a.id}"><span class="em">${a.em}</span><b>${a.title}</b></button>`).join(''))}</div>`).join('');
  if (append) c.insertAdjacentHTML('beforeend', h); else c.innerHTML = h;
  wire(c);
}

export function openArticle(id) {
  const a = articleById(id);
  if (!a) return;
  openView(a.kicker, body => {
    body.innerHTML = html`<article class="article"><p class="kicker">${a.kicker}</p><h2>${a.title}</h2><p class="lead">${a.lead}</p>${raw(a.body)}${raw(a.refs?.length ? html`<p class="tiny muted" style="margin-top:18px">Para saber más: ${a.refs.join(' · ')}</p>` : '')}</article>`;
    $$('[data-int]', body).forEach(el => INTERACTIVE[el.dataset.int]?.(el));
    wire(body);
  });
}

function wire(root) {
  $$('[data-sp]', root).forEach(e => e.onclick = () => openSpecies(e.dataset.sp));
  $$('[data-art]', root).forEach(e => e.onclick = () => openArticle(e.dataset.art));
}

// ---------- Guía de huellas y excrementos ----------
const TRACK_SVG = {
  hoof: '<svg viewBox="0 0 40 40"><path d="M12 6c-3 6-4 14-2 22 1 4 6 4 7 0 1-7 0-15-2-21-1-2-2-2-3-1Zm16 0c3 6 4 14 2 22-1 4-6 4-7 0-1-7 0-15 2-21 1-2 2-2 3-1Z" fill="#5b4a3a"/></svg>',
  paw4: '<svg viewBox="0 0 40 40" fill="#5b4a3a"><ellipse cx="20" cy="27" rx="8" ry="6.5"/><ellipse cx="9" cy="17" rx="3.4" ry="4.2"/><ellipse cx="16" cy="9" rx="3.4" ry="4.4"/><ellipse cx="24" cy="9" rx="3.4" ry="4.4"/><ellipse cx="31" cy="17" rx="3.4" ry="4.2"/></svg>',
  paw5: '<svg viewBox="0 0 40 40" fill="#5b4a3a"><path d="M8 26c0-5 6-7 12-7s12 2 12 7-6 7-12 7-12-2-12-7Z"/><circle cx="6" cy="16" r="3"/><circle cx="12.5" cy="10" r="3.1"/><circle cx="20" cy="8" r="3.2"/><circle cx="27.5" cy="10" r="3.1"/><circle cx="34" cy="16" r="3"/></svg>',
  hare: '<svg viewBox="0 0 40 40" fill="#5b4a3a"><ellipse cx="13" cy="9" rx="4" ry="7"/><ellipse cx="27" cy="9" rx="4" ry="7"/><ellipse cx="20" cy="24" rx="3" ry="3.5"/><ellipse cx="20" cy="33" rx="3" ry="3.5"/></svg>',
};

function renderTrackKey(c) {
  const st = { mode: 'trk', type: null, size: null, claws: null, shape: null, cont: null, reg: regionAt(state.lastPoint?.lat ?? 0, state.lastPoint?.lon ?? 0)?.group || '' };
  const draw = () => {
    const isT = st.mode === 'trk';
    const types = isT ? TRACK_TYPES : SCAT_TYPES;
    const sel = isT ? st.type : st.shape;
    c.innerHTML = html`
      <div class="seg"><button data-m="trk" class="${isT ? 'on' : ''}">🐾 Huella</button><button data-m="scat" class="${!isT ? 'on' : ''}">💩 Excremento</button></div>
      <select id="kr" style="margin:6px 0"><option value="">Todas las zonas de España</option>${raw(Object.entries(ZONAS).map(([k, n]) => html`<option value="${k}" ${k === st.reg ? 'selected' : ''}>${n}</option>`).join(''))}</select>
      <p class="kicker">1 · ¿Qué forma tiene?</p>
      <div class="grid2">${raw(Object.entries(types).map(([k, t]) => html`<button class="tile ${k === sel ? 'on' : ''}" data-k="${k}" style="${k === sel ? 'border-color:var(--forest);background:#eef3ec' : ''}">${raw(isT ? `<span style="width:34px;height:34px">${TRACK_SVG[k]}</span>` : '')}<b>${t.n}</b><span>${t.d}</span></button>`).join(''))}</div>
      <p class="kicker" style="margin-top:14px">2 · ¿Qué tamaño? ${isT ? '(largo de una huella)' : '(grosor o diámetro)'}</p>
      <div class="row"><input type="range" id="ks" min="0.5" max="${isT ? 25 : 8}" step="0.5" value="${st.size ?? (isT ? 5 : 1.5)}" class="grow"><b id="ksv" style="min-width:64px;text-align:right">${st.size == null ? 'cualquiera' : fmtNum(st.size, 1) + ' cm'}</b></div>
      <p class="tiny muted">Truco: la uña del pulgar mide más o menos 1,5 cm; una tarjeta, 8,5 cm.</p>
      ${raw(isT && (st.type === 'paw4' || st.type === 'paw5') ? html`<p class="kicker" style="margin-top:12px">3 · ¿Se marcan uñas delante de los dedos?</p><div class="seg" id="kc"><button data-c="" class="${st.claws == null ? 'on' : ''}">No sé</button><button data-c="1" class="${st.claws === true ? 'on' : ''}">Sí</button><button data-c="0" class="${st.claws === false ? 'on' : ''}">No</button></div>` : '')}
      <p class="kicker" style="margin-top:16px">Candidatos</p><ul class="list" id="kres"></ul>
      <p class="tiny muted">La guía ordena por coincidencia. Úsala como pista: confirma siempre con la ficha y, si puedes, con varias huellas seguidas (el rastro dice más que una sola huella).</p>`;
    $$('.seg [data-m]', c).forEach(b => b.onclick = () => { st.mode = b.dataset.m; st.size = null; draw(); });
    $('#kr', c).onchange = e => { st.reg = e.target.value; results(); };
    $$('[data-k]', c).forEach(b => b.onclick = () => { if (isT) st.type = st.type === b.dataset.k ? null : b.dataset.k; else st.shape = st.shape === b.dataset.k ? null : b.dataset.k; draw(); });
    const ks = $('#ks', c);
    ks.oninput = () => { st.size = parseFloat(ks.value); $('#ksv', c).textContent = fmtNum(st.size, 1) + ' cm'; results(); };
    $$('#kc button', c).forEach(b => b.onclick = () => { st.claws = b.dataset.c === '' ? null : b.dataset.c === '1'; draw(); });
    results();
  };
  const results = () => {
    const isT = st.mode === 'trk';
    const scored = SPECIES.filter(s => (isT ? s.trk : s.scat) && (!st.reg || (s.r || []).includes(st.reg))).map(s => {
      const d = isT ? s.trk : s.scat;
      let sc = 0;
      const t = isT ? st.type : st.shape;
      if (t) sc += (isT ? d.type : d.shape) === t ? 3 : -3;
      const rng = isT ? d.len : d.size;
      if (st.size != null && rng) { const [a, b] = rng; sc += st.size >= a * 0.85 && st.size <= b * 1.15 ? 2 : st.size >= a * 0.6 && st.size <= b * 1.5 ? 0 : -2; }
      if (isT && st.claws != null && d.claws != null) sc += d.claws === st.claws ? 1 : -1;
      return { s, sc, d };
    }).filter(x => x.sc >= 0).sort((a, b) => b.sc - a.sc).slice(0, 12);
    const ul = $('#kres', c);
    ul.innerHTML = scored.length ? scored.map(({ s, d, sc }) => html`<li data-sp="${s.id}"><span class="k">${s.em}</span><div class="grow"><b>${s.n}</b> ${raw(sc >= 5 ? '<span class="pill ok">encaja</span>' : '')}<div class="small muted">${d.desc}</div></div></li>`).join('') : '<li class="muted">Ninguna especie de la biblioteca encaja. Prueba con otro tamaño o pregunta a Claude con una foto.</li>';
    wire(ul);
  };
  draw();
}

// ---------- Toponimia ----------
function renderToponimia(c) {
  c.innerHTML = `<p class="small muted" style="margin-top:0">${esc(articleById('toponimia').lead)}</p>`;
  const d = document.createElement('div'); c.append(d); INTERACTIVE.toponimia(d);
}

// ---------- Esquemas interactivos ----------
const segBtns = (opts, on) => `<div class="seg">${opts.map(([k, n]) => `<button data-v="${k}" class="${k === on ? 'on' : ''}">${n}</button>`).join('')}</div>`;

const INTERACTIVE = {
  toponimia(el) {
    el.innerHTML = `<input type="search" placeholder="Buscar un nombre del mapa (p. ej. paco, tozal, ibón)"><ul class="list" style="margin-top:6px"></ul>`;
    const inp = el.querySelector('input'), ul = el.querySelector('ul');
    const draw = () => {
      const q = inp.value.trim().toLowerCase();
      ul.innerHTML = TOPONIMIA.filter(t => !q || norm(t.t + ' ' + t.d + ' ' + (t.l || '')).includes(norm(q))).map(t => html`<li style="display:block"><b>${t.t}</b>${raw(t.l ? html` <span class="tiny muted">${t.l}</span>` : '')}<div style="font-size:15px;line-height:1.45">${t.d}</div>${raw(t.tip ? html`<div class="small" style="color:var(--moss);margin-top:2px">→ ${t.tip}</div>` : '')}</li>`).join('');
    };
    inp.oninput = draw; draw();
  },

  perfil(el) {
    const views = {
      pir: { cap: 'Pirineo (corte norte-sur simplificado). En el centro, el núcleo de rocas antiguas (granitos y pizarras, en gris oscuro) levantado y fracturado; a los lados, láminas de caliza plegadas y montadas unas sobre otras. Los glaciares afilaron las cumbres y excavaron valles en U.',
        svg: `<path d="M0 200 L40 170 L70 150 L95 120 L120 135 L150 80 L170 95 L190 40 L205 60 L220 25 L240 55 L255 45 L275 85 L300 70 L330 110 L360 100 L390 140 L420 150 L460 175 L500 185 L500 260 L0 260Z" fill="#cfc6b2"/>
              <path d="M150 260 L170 120 L190 70 L210 40 L230 35 L250 60 L270 90 L290 260Z" fill="#5d6166"/>
              <path d="M60 260 L90 160 L130 150 L160 260Z M300 260 L320 140 L350 125 L380 260Z" fill="#a9a08c" opacity=".9"/>
              <path d="M70 200 Q100 150 140 185 M80 225 Q110 175 150 210 M310 200 Q340 150 370 185 M320 228 Q350 178 385 210" stroke="#7a705c" stroke-width="2" fill="none"/>
              <path d="M226 38 l-6 10 h12z" fill="#fff"/><path d="M188 42 l-5 9 h10z" fill="#fff"/>
              <text x="210" y="252" fill="#fff" font-size="11" text-anchor="middle">Rocas antiguas</text>
              <text x="110" y="252" font-size="11" text-anchor="middle" fill="#3b3a35">Calizas plegadas</text>
              <text x="345" y="252" font-size="11" text-anchor="middle" fill="#3b3a35">Calizas plegadas</text>` },
      gud: { cap: 'Gúdar / Javalambre (corte simplificado). Capas de caliza y marga casi horizontales o suavemente onduladas. La caliza dura de arriba hace de «tapadera»: muelas con cima plana, altiplanos y barrancos encajados. Sin glaciares, solo canchales al pie de los cortados.',
        svg: `<rect x="0" y="0" width="500" height="260" fill="none"/>
              <path d="M0 130 L120 128 L135 140 L150 128 L260 126 L275 190 L305 190 L320 128 L420 126 L440 150 L470 160 L500 165 L500 260 L0 260Z" fill="#d8d1bf"/>
              <path d="M0 130 L120 128 L135 140 L150 128 L260 126 L268 150 L0 152Z M320 128 L420 126 L432 145 L314 148Z" fill="#e9e4d6"/>
              <path d="M0 152 L268 150 L272 170 L0 172Z M314 148 L432 145 L440 165 L310 168Z" fill="#c9b98f"/>
              <path d="M0 172 L272 170 L275 190 L0 192Z M310 168 L440 165 L470 180 L500 182 L500 196 L300 196Z" fill="#e2dccb"/>
              <path d="M0 192 L500 196 L500 215 L0 212Z" fill="#b9ab8a"/>
              <path d="M262 132 l14 55 M318 130 l-12 58" stroke="#9a907a" stroke-width="1" stroke-dasharray="3 3"/>
              <text x="70" y="122" font-size="11" fill="#3b3a35">Muela (cima plana)</text>
              <text x="290" y="215" font-size="11" text-anchor="middle" fill="#3b3a35">Barranco</text>
              <text x="380" y="122" font-size="11" fill="#3b3a35">Paramera</text>` },
    };
    let v = 'pir';
    const draw = () => {
      el.innerHTML = `<figure>${segBtns([['pir', 'Pirineo'], ['gud', 'Gúdar / Javalambre']], v)}<svg viewBox="0 0 500 260">${views[v].svg}</svg><figcaption>${views[v].cap}</figcaption></figure>`;
      el.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { v = b.dataset.v; draw(); });
    };
    draw();
  },

  pliegue(el) {
    const cols = ['#e6dfcd', '#c9b98f', '#ddd6c3', '#b5a37f', '#e9e4d6', '#a99877'];
    const caps = [
      '1 · Las capas se depositan horizontales, la más antigua abajo, como páginas de un libro tumbado.',
      '2 · Un empuje lateral las dobla: arriba, el anticlinal (A); abajo, el sinclinal (U).',
      '3 · Millones de años de erosión: el anticlinal, roto por arriba, se vacía y queda como valle; el sinclinal, más resistente, queda en alto (sinclinal colgado).',
    ];
    let st = 0;
    const draw = () => {
      const amp = st === 0 ? 0 : 45;
      const layer = (i) => {
        const y0 = 70 + i * 26;
        let d = `M0 ${y0}`;
        for (let x = 0; x <= 500; x += 10) d += ` L${x} ${y0 - amp * Math.sin((x / 500) * Math.PI * 2)}`;
        for (let x = 500; x >= 0; x -= 10) d += ` L${x} ${y0 + 26 - amp * Math.sin((x / 500) * Math.PI * 2)}`;
        return `<path d="${d}Z" fill="${cols[i % cols.length]}" stroke="#8d826b" stroke-width=".6"/>`;
      };
      let layers = Array.from({ length: 7 }, (_, i) => layer(i)).join('');
      let surf = '';
      if (st === 2) {
        // superficie de erosión: valle sobre el anticlinal (x≈125) y alto sobre el sinclinal (x≈375)
        let d = 'M0 0 L0 95';
        for (let x = 0; x <= 500; x += 10) d += ` L${x} ${110 + 40 * Math.sin((x / 500) * Math.PI * 2)}`;
        d += ' L500 0Z';
        surf = `<path d="${d}" fill="#f7f4ee"/>`;
      }
      el.innerHTML = `<figure>${segBtns([['0', '1 · Capas'], ['1', '2 · Plegado'], ['2', '3 · Erosión']], String(st))}<svg viewBox="0 0 500 270"><rect width="500" height="270" fill="#f7f4ee"/>${layers}${surf}
        ${st >= 1 ? `<text x="125" y="${st === 2 ? 168 : 22}" text-anchor="middle" font-size="12" fill="#3b3a35">Anticlinal${st === 2 ? ' → valle' : ''}</text><text x="375" y="${st === 2 ? 62 : 250}" text-anchor="middle" font-size="12" fill="#3b3a35">Sinclinal${st === 2 ? ' → monte' : ''}</text>` : ''}
        ${st === 1 ? '<path d="M8 140 h40 M40 132 l10 8 -10 8 M492 140 h-40 M460 132 l-10 8 10 8" stroke="#b5432f" stroke-width="3" fill="none"/>' : ''}
        </svg><figcaption>${caps[st]}</figcaption></figure>`;
      el.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { st = +b.dataset.v; draw(); });
    };
    draw();
  },

  pisos(el) {
    const R = {
      pir: { base: 14, max: 3200, belts: [[0, 900, 'Colino', '#c9b77b', 'Carrasca, quejigo, boj, pino negral en el Prepirineo'], [900, 1600, 'Montano', '#6f9a5b', 'Pino silvestre; haya y abeto en umbrías húmedas'], [1600, 2300, 'Subalpino', '#3d6b4a', 'Pino negro, rododendro, enebro rastrero; urogallo'], [2300, 2900, 'Alpino', '#b6c48f', 'Pastos, sin árboles; edelweiss, marmota, sarrio'], [2900, 3404, 'Subnival', '#d7d9dc', 'Roca, líquenes, nieve casi todo el año']] },
      gud: { base: 16, max: 2030, belts: [[0, 1000, 'Mesomediterráneo', '#c9b77b', 'Carrasca, enebro de la miera, romero, pino carrasco'], [1000, 1600, 'Supramediterráneo', '#6f9a5b', 'Quejigo, pino negral, sabina albar en las parameras'], [1600, 2030, 'Oromediterráneo', '#3d6b4a', 'Pino silvestre, pino moro en el Monegro, sabina rastrera, erizón']] },
    };
    let reg = 'gud', alt = 1500;
    const draw = () => {
      const r = R[reg];
      alt = Math.min(alt, r.max);
      const top = r.max, H = 230, y = a => 240 - a / top * H;
      const belt = r.belts.find(b => alt >= b[0] && alt < b[1]) || r.belts[r.belts.length - 1];
      const t = r.base - 0.6 * alt / 100;
      const mount = `M30 240 L${reg === 'pir' ? '120 150 L160 170 L200 90 L230 105 L250 10 L275 60 L300 50 L340 130 L380 120 L470 240' : '90 160 L140 120 L200 100 L240 25 L330 22 L380 90 L470 240'}Z`;
      el.innerHTML = `<figure>${segBtns([['gud', 'Gúdar'], ['pir', 'Pirineo']], reg)}
        <svg viewBox="0 0 500 250"><defs><clipPath id="mclip"><path d="${mount}"/></clipPath></defs>
        <g clip-path="url(#mclip)">${r.belts.map(b => `<rect x="0" y="${y(b[1])}" width="500" height="${y(b[0]) - y(b[1])}" fill="${b[3]}"/>`).join('')}</g>
        <path d="${mount}" fill="none" stroke="#3b3a35" stroke-width="1.2"/>
        ${r.belts.map(b => `<text x="492" y="${(y(b[0]) + y(b[1])) / 2 + 4}" font-size="10.5" text-anchor="end" fill="#3b3a35">${b[2]}</text>`).join('')}
        <line x1="0" x2="500" y1="${y(alt)}" y2="${y(alt)}" stroke="#b5432f" stroke-width="1.5" stroke-dasharray="5 4"/>
        <text x="6" y="${y(alt) - 5}" font-size="12" fill="#b5432f" font-weight="700">${alt.toLocaleString('es-ES')} m</text></svg>
        <input type="range" min="0" max="${r.max}" step="50" value="${alt}" style="width:100%">
        <figcaption><b>${belt[2]}</b> · ${belt[4]}.<br>Temperatura media anual aproximada: <b>${t.toFixed(1).replace('.', ',')} °C</b>. Las alturas de los pisos son orientativas: suben en solanas y bajan en umbrías.</figcaption></figure>`;
      el.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { reg = b.dataset.v; draw(); });
      el.querySelector('input').oninput = e => { alt = +e.target.value; draw(); };
    };
    draw();
  },

  inversion(el) {
    let night = true;
    const draw = () => {
      const T = night ? { top: -3, mid: 1, bot: -8 } : { top: 6, mid: 10, bot: 13 };
      const sky = night ? '#1d2a44' : '#cfe5f3';
      el.innerHTML = `<figure>${segBtns([['d', '☀️ Tarde'], ['n', '🌙 Noche despejada y en calma']], night ? 'n' : 'd')}
        <svg viewBox="0 0 500 250"><rect width="500" height="250" fill="${sky}"/>
        ${night ? '<circle cx="420" cy="40" r="14" fill="#f3efd8"/>' : '<circle cx="420" cy="40" r="18" fill="#f1c35b"/>'}
        ${night ? '<path d="M60 250 C120 190 170 175 250 176 C330 175 380 190 440 250Z" fill="#7fb1e3" opacity=".55"/>' : ''}
        <path d="M0 60 C80 70 120 120 170 175 C200 205 230 215 250 215 C270 215 300 205 330 175 C380 120 420 70 500 60 L500 250 L0 250Z" fill="${night ? '#33503f' : '#7b9b5f'}"/>
        ${night ? '<path d="M70 100 q20 30 50 55 M430 100 q-20 30 -50 55" stroke="#bfe0ff" stroke-width="2.5" fill="none" marker-end="url(#ar)"/><defs><marker id="ar" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#bfe0ff"/></marker></defs>' : ''}
        ${night ? '<rect x="0" y="118" width="500" height="1.5" fill="#f1c35b" opacity=".8"/><text x="492" y="112" font-size="10.5" text-anchor="end" fill="#f1c35b">cinturón térmico (más templado)</text>' : ''}
        <g font-size="15" font-weight="700" text-anchor="middle">
          <text x="40" y="52" fill="${night ? '#fff' : '#1c1f1d'}">${T.top} °C</text>
          <text x="130" y="112" fill="${night ? '#fff' : '#1c1f1d'}">${T.mid} °C</text>
          <text x="250" y="240" fill="${night ? '#fff' : '#1c1f1d'}">${T.bot} °C</text></g>
        ${night ? '<text x="250" y="198" text-anchor="middle" font-size="11" fill="#e4f1ff">lago de aire frío</text>' : ''}
        </svg><figcaption>${night ? 'De noche, con cielo despejado y sin viento, el aire que se enfría junto al suelo resbala por las laderas y se encharca en el fondo. Arriba del lago frío queda una franja más templada. Valores ilustrativos.' : 'De día, el sol calienta el suelo y el aire: lo normal es que haga más calor abajo y más frío arriba (unos 0,6-0,7 °C menos cada 100 m).'}</figcaption></figure>`;
      el.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { night = b.dataset.v === 'n'; draw(); });
    };
    draw();
  },
};
