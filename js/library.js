// «Saber»: especies, explicaciones, guía de huellas y diccionario de nombres.
import { SPECIES, GROUPS, TRACK_TYPES, SCAT_TYPES } from '../content/species.js';
import { ARTICLES, articleById } from '../content/articles.js';
import { TOPONIMIA } from '../content/toponimia.js';
import { REGIONS, regionAt } from '../content/regions.js';
import { openView, html, raw, esc, $, $$ } from './ui.js';
import { state } from './state.js';
import { INAT_GROUPS } from './sources.js';
import { fmtNum } from './geo.js';

export function speciesFor(regionGroup, ele) {
  return SPECIES.filter(s => (!regionGroup || s.r.includes(regionGroup)) && (ele == null || (ele >= s.alt[0] - 150 && ele <= s.alt[1] + 150)));
}

const spCard = s => html`<li data-sp="${s.id}"><span class="k">${s.em}</span><div class="grow"><b>${s.n}</b><div class="small sp-sci">${s.sci}</div></div><span class="muted">›</span></li>`;

export function openLibrary(tab) {
  openView('Saber', (body) => renderLibrary(body, tab || state.libTab || 'aqui'), { root: true });
}

function renderLibrary(body, tab) {
  state.libTab = tab;
  const tabs = [['aqui', 'Aquí'], ['especies', 'Especies'], ['explica', 'Explicaciones'], ['huellas', 'Huellas'], ['nombres', 'Nombres']];
  body.innerHTML = html`<div class="seg">${raw(tabs.map(([k, n]) => `<button data-t="${k}" class="${k === tab ? 'on' : ''}">${n}</button>`).join(''))}</div><div id="libc"></div>`;
  $$('.seg button', body).forEach(b => b.onclick = () => renderLibrary(body, b.dataset.t));
  const c = $('#libc', body);
  ({ aqui: renderHere, especies: renderSpecies, explica: renderArticles, huellas: renderTrackKey, nombres: renderToponimia })[tab](c);
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
  const byG = Object.entries(GROUPS).map(([g, n]) => [n, list.filter(s => s.g === g)]).filter(([, l]) => l.length);
  c.innerHTML = html`
    <p class="kicker">Último punto consultado</p>
    <h2 class="title" style="margin-top:0">${reg ? reg.name : 'Fuera de las regiones de la biblioteca'}</h2>
    <p class="sub">${p.label || ''}${p.ele != null ? ` · ${fmtNum(p.ele)} m` : ''}</p>
    ${raw(reg ? html`<div class="card"><p style="margin:0 0 8px;line-height:1.5">${reg.summary}</p><p class="small" style="margin:0 0 6px"><b>Clima.</b> ${reg.climate}</p><p class="small" style="margin:0"><b>Vegetación.</b> ${reg.veg}</p></div>
      <p class="kicker">Para entender este paisaje</p><ul class="list">${raw(reg.articles.map(id => articleById(id)).map(a => html`<li data-art="${a.id}"><span class="k">${a.em}</span><b class="grow">${a.title}</b><span class="muted">›</span></li>`).join(''))}</ul>` : '<div class="note">La biblioteca cubre por ahora Gúdar, Javalambre, Maestrazgo, Albarracín, el resto del Sistema Ibérico y el Pirineo. Te muestro todas las especies.</div>')}
    <p class="kicker" style="margin-top:16px">Lo más probable a esta altitud</p>
    ${raw(byG.map(([n, l]) => html`<h3 style="margin:12px 0 2px;font-size:17px">${n}</h3><ul class="list">${raw(l.map(spCard).join(''))}</ul>`).join(''))}
    <div id="inat-here"></div>`;
  wire(c);
  const z = state.lastZone;
  if (z?.inat) {
    const box = $('#inat-here', c);
    box.innerHTML = html`<p class="kicker" style="margin-top:18px">Observado por la gente en esta zona (iNaturalist)</p>${raw(inatHTML(z.inat))}`;
  }
}

export function inatHTML(inat, max = 8) {
  return Object.entries(INAT_GROUPS).filter(([g]) => inat[g]?.length).map(([g, n]) => html`<details class="card"><summary><b>${n}</b> <span class="muted small">(${inat[g].length})</span></summary><ul class="list">${raw(inat[g].slice(0, 25).map(t => html`<li><div class="grow"><b>${t.common || t.sci}</b><div class="small sp-sci">${t.sci}</div></div><span class="tiny muted">${t.count} obs.</span></li>`).join(''))}</ul></details>`).join('');
}

// ---------- Especies ----------
function renderSpecies(c) {
  c.innerHTML = html`<input type="search" id="spq" placeholder="Buscar (nombre o latín)"><div class="seg" id="spr"><button data-r="" class="on">Todas</button><button data-r="iberico">Teruel / Ibérico</button><button data-r="pirineo">Pirineo</button></div><div id="spl"></div>`;
  let r = '';
  const draw = () => {
    const q = $('#spq', c).value.trim().toLowerCase();
    const l = SPECIES.filter(s => (!r || s.r.includes(r)) && (!q || (s.n + ' ' + s.sci).toLowerCase().includes(q)));
    $('#spl', c).innerHTML = Object.entries(GROUPS).map(([g, n]) => {
      const gl = l.filter(s => s.g === g);
      return gl.length ? html`<h3 style="margin:14px 0 2px;font-size:17px">${n}</h3><ul class="list">${raw(gl.map(spCard).join(''))}</ul>` : '';
    }).join('') || '<p class="muted">Nada con ese nombre.</p>';
    wire($('#spl', c));
  };
  $('#spq', c).oninput = draw;
  $$('#spr button', c).forEach(b => b.onclick = () => { r = b.dataset.r; $$('#spr button', c).forEach(x => x.classList.toggle('on', x === b)); draw(); });
  draw();
}

export function openSpecies(id) {
  const s = SPECIES.find(x => x.id === id);
  if (!s) return;
  openView(s.n, body => {
    const sec = (t, v) => v ? html`<div class="sp-sec"><h4>${t}</h4><p>${v}</p></div>` : '';
    body.innerHTML = html`<div class="article" style="font-size:16px">
      <div class="sp-head"><div class="sp-em">${s.em}</div><div><h2 style="margin:0;font-size:24px">${s.n}</h2><div class="sp-sci">${s.sci}</div><div>${raw(s.r.map(r => `<span class="pill">${r === 'iberico' ? 'Teruel / Ibérico' : 'Pirineo'}</span>`).join(''))}<span class="pill">${fmtNum(s.alt[0])}–${fmtNum(s.alt[1])} m</span></div></div></div>
      ${raw(sec('Cómo reconocerlo', s.idf))}${raw(sec('Dónde vive', s.hab))}${raw(sec('Comportamiento', s.beh))}
      ${raw(s.cur ? html`<div class="box"><b>Curiosidad</b>${s.cur}</div>` : '')}
      ${raw(s.trk ? sec('Huella', s.trk.desc) : '')}${raw(s.scat ? sec('Excremento', s.scat.desc) : '')}
      ${raw(s.tec ? html`<div class="box tech"><b>Datos</b>${s.tec}</div>` : '')}
      <p class="tiny muted">Más fotos: <a href="https://www.inaturalist.org/taxa/search?q=${encodeURIComponent(s.sci.split(/[ /,]/).slice(0, 2).join(' '))}&locale=es">iNaturalist</a> · <a href="https://es.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(s.sci.split(/[/,]/)[0].trim())}">Wikipedia</a> (con cobertura).</p></div>`;
  });
}

// ---------- Explicaciones ----------
function renderArticles(c, append = false) {
  const h = html`<p class="kicker" style="margin-top:${append ? 18 : 4}px">Explicaciones del paisaje</p><div class="grid2">${raw(ARTICLES.map(a => html`<button class="tile" data-art="${a.id}"><span class="em">${a.em}</span><span>${a.kicker}</span><b>${a.title}</b></button>`).join(''))}</div>`;
  if (append) c.insertAdjacentHTML('beforeend', h); else c.innerHTML = h;
  wire(c);
}

export function openArticle(id) {
  const a = articleById(id);
  if (!a) return;
  openView(a.kicker, body => {
    body.innerHTML = html`<article class="article"><p class="kicker">${a.kicker}</p><h2>${a.title}</h2><p class="lead">${a.lead}</p>${raw(a.body)}</article>`;
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
      <div class="seg" id="kr"><button data-r="" class="${!st.reg ? 'on' : ''}">Todas las zonas</button><button data-r="iberico" class="${st.reg === 'iberico' ? 'on' : ''}">Teruel</button><button data-r="pirineo" class="${st.reg === 'pirineo' ? 'on' : ''}">Pirineo</button></div>
      <p class="kicker">1 · ¿Qué forma tiene?</p>
      <div class="grid2">${raw(Object.entries(types).map(([k, t]) => html`<button class="tile ${k === sel ? 'on' : ''}" data-k="${k}" style="${k === sel ? 'border-color:var(--forest);background:#eef3ec' : ''}">${raw(isT ? `<span style="width:34px;height:34px">${TRACK_SVG[k]}</span>` : '')}<b>${t.n}</b><span>${t.d}</span></button>`).join(''))}</div>
      <p class="kicker" style="margin-top:14px">2 · ¿Qué tamaño? ${isT ? '(largo de una huella)' : '(grosor o diámetro)'}</p>
      <div class="row"><input type="range" id="ks" min="0.5" max="${isT ? 25 : 8}" step="0.5" value="${st.size ?? (isT ? 5 : 1.5)}" class="grow"><b id="ksv" style="min-width:64px;text-align:right">${st.size == null ? 'cualquiera' : fmtNum(st.size, 1) + ' cm'}</b></div>
      <p class="tiny muted">Truco: la uña del pulgar mide más o menos 1,5 cm; una tarjeta, 8,5 cm.</p>
      ${raw(isT && (st.type === 'paw4' || st.type === 'paw5') ? html`<p class="kicker" style="margin-top:12px">3 · ¿Se marcan uñas delante de los dedos?</p><div class="seg" id="kc"><button data-c="" class="${st.claws == null ? 'on' : ''}">No sé</button><button data-c="1" class="${st.claws === true ? 'on' : ''}">Sí</button><button data-c="0" class="${st.claws === false ? 'on' : ''}">No</button></div>` : '')}
      <p class="kicker" style="margin-top:16px">Candidatos</p><ul class="list" id="kres"></ul>
      <p class="tiny muted">La guía ordena por coincidencia. Úsala como pista: confirma siempre con la ficha y, si puedes, con varias huellas seguidas (el rastro dice más que una sola huella).</p>`;
    $$('.seg [data-m]', c).forEach(b => b.onclick = () => { st.mode = b.dataset.m; st.size = null; draw(); });
    $$('#kr button', c).forEach(b => b.onclick = () => { st.reg = b.dataset.r; draw(); });
    $$('[data-k]', c).forEach(b => b.onclick = () => { if (isT) st.type = st.type === b.dataset.k ? null : b.dataset.k; else st.shape = st.shape === b.dataset.k ? null : b.dataset.k; draw(); });
    const ks = $('#ks', c);
    ks.oninput = () => { st.size = parseFloat(ks.value); $('#ksv', c).textContent = fmtNum(st.size, 1) + ' cm'; results(); };
    $$('#kc button', c).forEach(b => b.onclick = () => { st.claws = b.dataset.c === '' ? null : b.dataset.c === '1'; draw(); });
    results();
  };
  const results = () => {
    const isT = st.mode === 'trk';
    const scored = SPECIES.filter(s => (isT ? s.trk : s.scat) && (!st.reg || s.r.includes(st.reg))).map(s => {
      const d = isT ? s.trk : s.scat;
      let sc = 0;
      const t = isT ? st.type : st.shape;
      if (t) sc += (isT ? d.type : d.shape) === t ? 3 : -3;
      const rng = isT ? d.len : d.size;
      if (st.size != null && rng) { const [a, b] = rng; sc += st.size >= a * 0.85 && st.size <= b * 1.15 ? 2 : st.size >= a * 0.6 && st.size <= b * 1.5 ? 0 : -2; }
      if (isT && st.claws != null && d.claws != null) sc += d.claws === st.claws ? 1 : -1;
      return { s, sc, d };
    }).filter(x => x.sc >= 0).sort((a, b) => b.sc - a.sc).slice(0, 8);
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
      ul.innerHTML = TOPONIMIA.filter(t => !q || (t.t + ' ' + t.d).toLowerCase().includes(q)).map(t => html`<li style="display:block"><b>${t.t}</b><div style="font-size:15px;line-height:1.45">${t.d}</div>${raw(t.tip ? html`<div class="small" style="color:var(--moss);margin-top:2px">→ ${t.tip}</div>` : '')}</li>`).join('');
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
