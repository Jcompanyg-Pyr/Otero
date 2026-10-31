// Ficha de un punto: dónde estás, qué hay alrededor, qué roca pisas, qué tiempo hará y qué vive aquí.
import { state } from './state.js';
import { openSheet, html, raw, $, esc, toast } from './ui.js';
import { distance, bearing, dirName, fmtDist, fmtNum, pointInRings, distToLine } from './geo.js';
import { zoneAt } from './zones.js';
import { adminAt, placesAround, terrainOnline, terrainFromGrid, geologyAt, igmeViewer, forecast, online, macrostratAt, inatTop } from './sources.js';
import { inSpain } from './layers.js';
import { quality, fmtAcc, fmtAge, isFresh } from './location.js';
import { isFavorite } from './places.js';
import { analyseTerrain, nightOutlook, inversionVerdict, weatherHTML } from './climate.js';
import { regionAt } from '../content/regions.js';
import { speciesFor, openSpecies, openArticle, inatHTML } from './library.js';
import { articleById } from '../content/articles.js';

const KIND_EM = { pico: '⛰️', collado: '〰️', mirador: '👁️', fuente: '💧', cueva: '🕳️', 'árbol singular': '🌳', lago: '🏞️', masía: '🏠', refugio: '🛖', núcleo: '🏘️', paraje: '📍', lugar: '📍', río: '🌊', barranco: '🌊' };

let seq = 0;
export async function showPoint(lat, lon, opts = {}) {
  const my = ++seq;
  // src: 'gps' (tu posición real), 'map' (punto tocado en el mapa) o 'search' (lugar buscado/favorito)
  const src = opts.src || (opts.fromGPS ? 'gps' : 'map');
  const fix = src === 'gps' ? (opts.fix || { acc: opts.acc, alt: opts.alt, t: Date.now() }) : null;
  const info = { lat, lon, src, fix, gps: fix ? { alt: fix.alt, acc: fix.acc } : null, label: opts.name || null, t: Date.now() };
  state.lastInfo = info;
  const kicker = src === 'gps' ? 'Tu posición (GPS)' : src === 'search' ? 'Lugar buscado' : 'Punto seleccionado en el mapa';
  const body = openSheet(html`
    <p class="kicker">${kicker}</p>
    <h2 class="title" id="pt-title">${opts.name || 'Mirando…'}</h2>
    <p class="sub"><span id="pt-ele"></span>${fmtNum(lat, 5)}, ${fmtNum(lon, 5)}</p>
    ${raw(fixHTML(src, fix, lat, lon))}
    <div class="row wrap" id="pt-actions" style="margin:6px 0 2px">
      <button class="btn small" data-a="diary">📓 Guardar</button>
      <button class="btn small sec fav" data-a="fav" aria-label="Favorito">☆ Favorito</button>
      <button class="btn small sec" data-a="measure">🌡️ Medir aquí</button>
      <button class="btn small sec" data-a="claude">✨ Preguntar a Claude</button>
      <button class="btn small sec" data-a="peaks">🧭 Picos</button>
    </div>
    <div id="pt-where" class="card"><h3>Dónde</h3><div class="loading">Buscando término municipal…</div></div>
    <div id="pt-around" class="card"><h3>Alrededor</h3><div class="loading">Buscando nombres cercanos…</div></div>
    <div id="pt-terrain" class="card"><h3>Relieve y frío nocturno</h3><div class="loading">Calculando el relieve…</div></div>
    <div id="pt-weather" class="card"><h3>Tiempo</h3><div class="loading">Cargando previsión…</div></div>
    <div id="pt-geo" class="card"><h3>Roca bajo tus pies</h3><div class="loading">Consultando el mapa geológico…</div></div>
    <div id="pt-life" class="card"><h3>Qué vive aquí</h3><div class="loading">…</div></div>
  `);
  body.onclick = e => { const a = e.target.closest('[data-art]'); if (a) openArticle(a.dataset.art); };
  body.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
    if (b.dataset.a === 'retry-gps') return document.getElementById('btn-where')?.click();
    document.dispatchEvent(new CustomEvent('point-action', { detail: { action: b.dataset.a, lat, lon, info, btn: b } }));
  });
  isFavorite(lat, lon).then(on => body.querySelector('.fav')?.classList.toggle('on', on)).catch(() => { });
  const alive = () => my === seq && document.body.contains(body);
  const set = (id, h) => { if (alive()) $(id, body).innerHTML = h; };
  const sect = (id, title, h) => set(id, `<h3>${title}</h3>` + h);

  const zone = await zoneAt(lat, lon).catch(() => null);
  state.lastZone = zone;
  info.zone = zone?.name || null;
  const net = online();

  // ---- Dónde ----
  const whereP = (async () => {
    let admin = {};
    if (zone?.boundaries?.length) {
      for (const b of zone.boundaries) if (pointInRings(lat, lon, b.rings)) { if (b.level === 8) admin.municipio = b.name; if (b.level === 7) admin.comarca = b.name; }
      admin.provincia = zone.admin?.provincia; admin.region = zone.admin?.region; admin.pais = zone.admin?.pais;
    }
    if (!admin.municipio && net) { try { admin = await adminAt(lat, lon); } catch (e) { } }
    info.admin = admin;
    const reg = regionAt(lat, lon);
    info.region = reg?.name;
    if (!admin.municipio && !reg) return sect('#pt-where', 'Dónde', `<p class="muted small">${net ? 'No he podido saber el municipio (el servidor de OpenStreetMap no responde o no hay datos).' : 'Sin cobertura y sin zona preparada aquí: no tengo los límites municipales.'}</p>`);
    const es = inSpain(lat, lon);
    sect('#pt-where', 'Dónde', html`<dl class="kv">
      ${raw(admin.municipio ? html`<dt>${es ? 'Término' : 'Municipio'}</dt><dd><b>${admin.municipio}</b></dd>` : '')}
      ${raw(admin.comarca ? html`<dt>${es ? 'Comarca' : 'Distrito'}</dt><dd>${admin.comarca}</dd>` : '')}
      ${raw(admin.provincia || admin.region ? html`<dt>${es ? 'Provincia' : 'Región'}</dt><dd>${[admin.provincia, admin.region].filter(Boolean).join(' · ')}</dd>` : '')}
      ${raw(admin.pais && !es ? html`<dt>País</dt><dd>${admin.pais}</dd>` : '')}
      ${raw(admin.aprox ? '<dt></dt><dd class="tiny muted">Según el buscador Photon (OpenStreetMap no respondía): puede ser la localidad más cercana, no el término exacto.</dd>' : '')}
      ${raw(reg ? html`<dt>Región natural</dt><dd>${reg.name}</dd>` : '')}</dl>
      ${raw(reg ? html`<p class="small" style="margin:8px 0 0;line-height:1.45">${reg.summary}</p>` : '')}`);
    return admin;
  })();

  // ---- Alrededor ----
  const aroundP = (async () => {
    let places = [], waters = [];
    if (zone?.places) { places = zone.places; waters = zone.waters || []; }
    else if (net) { try { ({ places, waters } = await placesAround(lat, lon, 6000)); } catch (e) { } }
    const near = places.map(p => ({ ...p, d: distance(lat, lon, p.lat, p.lon), b: bearing(lat, lon, p.lat, p.lon) })).filter(p => p.d < 6000).sort((a, b) => a.d - b.d);
    // prioriza variedad: picos, masías, fuentes...
    const pick = [], seen = new Set();
    for (const p of near) { if (pick.length >= 9) break; const k = p.name + p.kind; if (seen.has(k)) continue; seen.add(k); pick.push(p); }
    const w = waters.map(x => ({ ...x, d: distToLine(lat, lon, x.pts) })).filter(x => x.d < 1500).sort((a, b) => a.d - b.d).slice(0, 2);
    info.near = pick.slice(0, 5).map(p => `${p.name} (${p.kind}, ${fmtDist(p.d)} al ${dirName(p.b)})`);
    const closest = pick[0];
    const title = opts.name || (closest && closest.d < 350 ? `${closest.name}` : (info.admin?.municipio ? `${inSpain(lat, lon) ? 'Término' : 'Municipio'} de ${info.admin.municipio}` : src === 'gps' ? 'Tu posición' : 'Punto en el mapa'));
    if (alive()) { $('#pt-title', body).textContent = title; }
    info.label = title;
    state.lastPoint = { lat, lon, ele: info.ele, label: title, src };
    if (!pick.length && !w.length) return sect('#pt-around', 'Alrededor', `<p class="muted small">${net || zone ? 'No hay nombres registrados en 6 km (o el servidor de OpenStreetMap no ha respondido).' : 'Sin cobertura y sin zona preparada: prepara la zona antes de salir para tener los nombres.'}</p>`);
    sect('#pt-around', 'Alrededor', html`<ul class="list">
      ${raw(w.map(x => html`<li><span class="k">🌊</span><div class="grow">${x.name}</div><span class="small muted">a ${fmtDist(x.d)}</span></li>`).join(''))}
      ${raw(pick.map(p => html`<li><span class="k">${KIND_EM[p.kind] || '📍'}</span><div class="grow"><b>${p.name}</b><div class="tiny muted">${p.kind}${p.ele ? ` · ${fmtNum(p.ele)} m` : ''}</div></div><span class="small" style="text-align:right">${fmtDist(p.d)}<br><span class="muted">${dirName(p.b)}</span></span></li>`).join(''))}
    </ul><p class="tiny muted" style="margin:6px 0 0">Nombres de OpenStreetMap. Los paneles de miradores que guardes también aparecen en el mapa.</p>`);
  })();

  // ---- Relieve e inversión + tiempo ----
  const terrP = (async () => {
    let ter = zone?.grid ? terrainFromGrid(zone.grid, lat, lon) : null;
    if (!ter && net) { try { ter = await terrainOnline(lat, lon); } catch (e) { } }
    const ele = ter?.ele ?? opts.alt ?? null;
    info.ele = ele;
    if (state.lastPoint) state.lastPoint.ele = ele;
    if (alive() && ele != null) $('#pt-ele', body).textContent = `${fmtNum(ele)} m de altitud${ter ? ' (modelo del terreno)' : ' (GPS)'} · `;
    let fc = null;
    if (net) { try { fc = await forecast(lat, lon, ele); } catch (e) { } }
    if (!fc && zone?.forecast) fc = zone.forecast;
    info.weather = fc?.current ? `${Math.round(fc.current.temperature_2m)} °C` : null;
    const an = analyseTerrain(ter), night = nightOutlook(fc), v = inversionVerdict(an, night);
    info.terrain = an?.cls;
    if (!an) sect('#pt-terrain', 'Relieve y frío nocturno', `<p class="muted small">Sin datos de relieve aquí (sin cobertura y fuera de zonas preparadas).</p>`);
    else sect('#pt-terrain', 'Relieve y frío nocturno', html`
      <div class="row wrap"><span class="pill">${an.cls}</span>${raw(v ? `<span class="pill ${v.cls}">${esc(v.text)}</span>` : '')}</div>
      <p style="margin:8px 0 6px;line-height:1.5">${an.text}</p>
      <p class="tiny muted" style="margin:0 0 6px">${an.how}</p>
      ${raw(night ? html`<p class="small" style="margin:0 0 6px"><b>Esta noche:</b> ${night.txt} Nubosidad media ${Math.round(night.cloud)} %, viento máx. ${Math.round(night.wind)} km/h, mínima prevista ~${Math.round(night.tmin)} °C${an.score >= 2 && night.calm >= 1 ? ', aunque aquí probablemente baje más' : ''}.</p>` : '')}
      <button class="btn small sec" data-art="inversion">¿Cómo funciona la inversión?</button>`);
    if (fc) sect('#pt-weather', 'Tiempo', weatherHTML(fc) + (zone?.forecast === fc ? '<p class="tiny muted">Previsión guardada al preparar la zona.</p>' : ''));
    else sect('#pt-weather', 'Tiempo', '<p class="muted small">Sin previsión (sin cobertura). Prepara la zona antes de salir para tenerla guardada.</p>');
    return ele;
  })();

  // ---- Geología ----
  const geoTail = () => html`<div class="row wrap" style="margin-top:8px">${raw(inSpain(lat, lon) ? html`<a class="btn small sec" href="${igmeViewer(lat, lon)}" target="_blank" rel="noopener">Abrir visor del IGME</a>` : '')}<button class="btn small sec" data-art="colores">Leer los colores</button><button class="btn small sec" data-art="pliegues">Pliegues</button></div>`;
  (async () => {
    if (!net) return sect('#pt-geo', 'Roca bajo tus pies', `<p class="muted small">El detalle de la roca necesita cobertura. Si has preparado la zona, activa la capa «Geología» en el mapa para ver los colores del mapa geológico.</p>${geoTail()}`);
    try {
      // España: IGME (1:50.000, detallado). Fuera, o si el IGME no tiene datos: Macrostrat (escala regional).
      let g = null, srcName = 'IGME, MAGNA 1:50.000';
      if (inSpain(lat, lon)) { try { g = await geologyAt(lat, lon); } catch (e) { } }
      if (!g) { srcName = 'Macrostrat, escala regional: orientativo, puede no coincidir con la roca exacta del punto'; g = await macrostratAt(lat, lon); }
      info.geology = g ? (g.fields.map(f => f[1]).join(' · ') || g.value) : null;
      info.geologySource = g ? srcName.split(',')[0] : null;
      if (!g) return sect('#pt-geo', 'Roca bajo tus pies', `<p class="muted small">Ni el IGME (solo España) ni Macrostrat tienen datos geológicos de este punto.</p>${geoTail()}`);
      sect('#pt-geo', 'Roca bajo tus pies', html`<dl class="kv">${raw(g.fields.slice(0, 6).map(([k, v]) => html`<dt>${prettyKey(k)}</dt><dd>${v}</dd>`).join('') || html`<dt>Unidad</dt><dd>${g.value}</dd>`)}</dl><p class="tiny muted" style="margin:6px 0 0">Fuente: ${srcName}.</p>${raw(geoTail())}`);
    } catch (e) {
      sect('#pt-geo', 'Roca bajo tus pies', html`<p class="muted small">No he podido consultar el mapa geológico ahora mismo.</p>${raw(geoTail())}`);
    }
  })();

  // ---- Vida ----
  terrP.then(async ele => { // no espera a «Dónde»: solo necesita la altitud
    const reg = regionAt(lat, lon);
    if (!reg) {
      // Fuera de las regiones con fichas de Otero: solo observaciones reales cercanas, sin lista inventada
      let inat = zone?.inat || null;
      if (!inat && net) { try { inat = await inatTop(lat, lon, 10); } catch (e) { } }
      const has = inat && Object.values(inat).some(a => a?.length);
      return sect('#pt-life', 'Qué vive aquí', `<p class="small muted" style="margin:0 0 4px">Otero todavía no tiene fichas propias de esta región.</p>` +
        (has ? `<p class="kicker" style="margin-top:8px">Observado a menos de 10 km (iNaturalist, observaciones verificadas)</p>${inatHTML(inat)}` : `<p class="muted small">${net ? 'iNaturalist no tiene observaciones verificadas cerca o no ha respondido.' : 'Sin cobertura: no puedo consultar observaciones.'}</p>`));
    }
    const list = speciesFor(reg?.group, ele);
    const pickBy = g => list.filter(s => s.g === g);
    const sample = [...pickBy('mam').slice(0, 5), ...pickBy('arb').slice(0, 5), ...pickBy('ave').slice(0, 4)];
    sect('#pt-life', 'Qué vive aquí', html`<p class="small muted" style="margin:0 0 4px">${reg ? `Lo más probable en ${reg.name}${ele != null ? ` a ${fmtNum(ele)} m` : ''}:` : ''}</p>
      <ul class="list">${raw(sample.map(s => html`<li data-sp="${s.id}"><span class="k">${s.em}</span><b class="grow">${s.n}</b><span class="muted">›</span></li>`).join(''))}</ul>
      <button class="btn small sec block" data-lib="1">Ver todo en «Saber»</button>
      ${raw(zone?.inat ? `<p class="kicker" style="margin-top:12px">Observado en esta zona (iNaturalist)</p>${inatHTML(zone.inat)}` : '')}`);
    if (!alive()) return;
    body.querySelectorAll('#pt-life [data-sp]').forEach(e => e.onclick = () => openSpecies(e.dataset.sp));
    const lb = body.querySelector('[data-lib]'); if (lb) lb.onclick = () => document.dispatchEvent(new CustomEvent('go-tab', { detail: 'library' }));
  }).catch(e => { console.warn('vida', e); sect('#pt-life', 'Qué vive aquí', '<p class="muted small">No disponible ahora mismo.</p>'); });
}

function prettyKey(k) {
  const m = { descripcion: 'Descripción', litologia: 'Litología', edad: 'Edad', era: 'Era', periodo: 'Periodo', sistema: 'Sistema', serie: 'Serie', piso: 'Piso', leyenda: 'Leyenda' };
  const kk = k.toLowerCase().replace(/[^a-záéíóúñ]/g, '');
  for (const [a, b] of Object.entries(m)) if (kk.includes(a)) return b;
  return k.charAt(0).toUpperCase() + k.slice(1).toLowerCase().replace(/_/g, ' ');
}

// Texto con todo el contexto del punto, para pegar en Claude
export function contextText(info, extra = '') {
  const a = info?.admin || {};
  const lines = [
    `Estoy en la montaña y quiero que me expliques lo que estoy viendo.`,
    `${info.src === 'gps' ? 'Mi posición GPS' : 'Lugar consultado (no es necesariamente donde estoy)'}: ${fmtNum(info.lat, 4)}, ${fmtNum(info.lon, 4)}${info.fix?.acc ? ` (precisión ±${Math.round(info.fix.acc)} m)` : ''}${info.ele != null ? `, a unos ${Math.round(info.ele)} m` : ''}.`,
    a.municipio ? `Término municipal: ${a.municipio}${a.comarca ? ` (${a.comarca})` : ''}${a.provincia ? `, ${a.provincia}` : ''}.` : '',
    info.region ? `Región natural: ${info.region}.` : '',
    info.terrain ? `Posición en el relieve: ${info.terrain}.` : '',
    info.geology ? `Mapa geológico (${info.geologySource || 'IGME'}) en el punto: ${info.geology}.` : '',
    info.near?.length ? `Cerca: ${info.near.join('; ')}.` : '',
    `Fecha y hora: ${new Date(info.t || Date.now()).toLocaleString('es-ES')}.`,
    extra,
    `Te adjunto una foto. Dime qué es (o las 2-3 opciones más probables y cómo distinguirlas), por qué está aquí y alguna curiosidad. Explícamelo con detalle pero sin tecnicismos innecesarios.`,
  ];
  return lines.filter(Boolean).join('\n');
}

// Recuadro con la calidad de la posición: precisión, hora y qué hacer si es aproximada.
function fixHTML(src, fix, lat, lon) {
  if (src === 'gps' && fix) {
    const q = quality(fix.acc);
    const warn = q === 'aproximada' ? html`<div class="note warn small" style="margin:6px 0">⚠️ Posición <b>aproximada</b> (${fmtAcc(fix.acc)}): puede estar a kilómetros de donde estás. Suele pasar si el iPhone tiene apagada la <b>Ubicación exacta</b> (Ajustes → Privacidad y seguridad → Localización → Safari / Sitios web de Safari) o si aún no ha captado el GPS.
      <div class="row wrap" style="margin-top:6px"><button class="btn small" data-a="retry-gps">Reintentar</button></div></div>` : '';
    return html`<p class="tiny muted fixline">Precisión ${fmtAcc(fix.acc)} (${q}) · obtenida ${fmtAge(fix.t)}</p>${raw(warn)}`;
  }
  const me = state.me;
  if (me && isFresh(me)) return html`<p class="tiny muted fixline">Este punto no es tu posición: estás a ${fmtDist(distance(me.lat, me.lon, lat, lon))} ${me.acc > 500 ? `(tu posición es aproximada, ${fmtAcc(me.acc)})` : ''}</p>`;
  return '<p class="tiny muted fixline">Este punto no es tu posición.</p>';
}
