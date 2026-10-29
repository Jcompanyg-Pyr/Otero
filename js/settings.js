// «Más»: preparar salidas, ajustes, copia de seguridad, almacenamiento y créditos.
import { state } from './state.js';
import { openView, redrawView, html, raw, esc, $, $$, toast, openSheet, closeSheet, confirmBox, fmtDate, pickFiles, closeViews } from './ui.js';
import { db } from './db.js';
import { prepareZone, deleteZone, getZones, planTiles, estimateMB, parseGPX, bboxOfPoints } from './zones.js';
import { bboxAround, bboxKm, fmtNum } from './geo.js';
import { BASES, OVERLAYS, likelyFrance } from './layers.js';
import { online } from './sources.js';

export const APP_VERSION = '1.0';

export function openMore() {
  openView('Más', body => {
    body.innerHTML = html`
      <div class="grid2">
        <button class="tile" data-o="zones"><span class="em">🎒</span><b>Preparar salida</b><span>Mapas y datos sin cobertura</span></button>
        <button class="tile" data-o="settings"><span class="em">⚙️</span><b>Ajustes</b><span>Pl@ntNet, mapa</span></button>
        <button class="tile" data-o="backup"><span class="em">💾</span><b>Copia de seguridad</b><span>Exportar e importar</span></button>
        <button class="tile" data-o="install"><span class="em">📲</span><b>Instalar en el iPhone</b><span>Y cómo actualizar</span></button>
        <button class="tile" data-o="credits"><span class="em">📚</span><b>Fuentes y créditos</b><span>De dónde salen los datos</span></button>
        <button class="tile" data-o="storage"><span class="em">📦</span><b>Almacenamiento</b><span>Cuánto ocupa</span></button>
      </div>
      <p class="tiny muted" style="margin-top:16px">Otero ${APP_VERSION} · Tus datos (diario, paneles, mediciones) se guardan solo en este móvil.</p>`;
    $$('[data-o]', body).forEach(b => b.onclick = () => ({ zones: openZones, settings: openSettings, backup: openBackup, install: openInstall, credits: openCredits, storage: openStorage })[b.dataset.o]());
  }, { root: true });
}

// ---------------- Zonas ----------------
export function openZones() {
  openView('Preparar salida', async body => {
    const zs = (await getZones(true)).sort((a, b) => b.created - a.created);
    body.innerHTML = html`
      <div class="note blue">Antes de salir, con wifi o buena cobertura, descarga la zona: satélite, mapa topográfico, geología, nombres de picos, masías y fuentes, términos municipales, relieve (para las inversiones), previsión de 7 días y especies observadas. Allí arriba todo funcionará solo con el GPS.</div>
      <div class="grid2">
        <button class="tile" data-n="view"><span class="em">🗺️</span><b>Lo que veo en el mapa</b><span>Encuadra y descarga</span></button>
        <button class="tile" data-n="gpx"><span class="em">〰️</span><b>Desde un track GPX</b><span>Ruta + 2 km alrededor</span></button>
        <button class="tile" data-n="here"><span class="em">📍</span><b>Alrededor de un punto</b><span>Último punto o tu posición</span></button>
      </div>
      <p class="kicker" style="margin-top:18px">Zonas guardadas</p>
      ${raw(zs.length ? '' : '<p class="muted">Ninguna todavía.</p>')}
      <ul class="list">${raw(zs.map(z => html`<li><span class="k">🎒</span><div class="grow"><b>${z.name}</b><div class="tiny muted">${fmtDate(z.created, false)} · ${fmtNum(z.sizeKm?.w || 0)}×${fmtNum(z.sizeKm?.h || 0)} km · ${z.tiles || 0} trozos de mapa${z.places ? ` · ${z.places.length} nombres` : ''}${z.forecast ? ` · tiempo del ${new Date(z.forecast.fetchedAt).toLocaleDateString('es-ES')}` : ''}</div>${raw(z.errors?.length ? html`<div class="tiny" style="color:var(--red)">${z.errors.join(' · ')}</div>` : '')}</div><div class="row" style="flex-direction:column;gap:4px"><button class="btn small sec" data-go="${z.id}">Ver</button><button class="btn small sec" data-up="${z.id}">↻</button><button class="btn small sec" data-del="${z.id}" style="color:var(--red)">✕</button></div></li>`).join(''))}</ul>
      ${raw(zs.length ? '<p class="tiny muted">↻ vuelve a descargar los datos y la previsión (los mapas ya bajados no se repiten).</p>' : '')}`;
    $$('[data-n]', body).forEach(b => b.onclick = () => newZone(b.dataset.n));
    $$('[data-go]', body).forEach(b => b.onclick = () => { const z = zs.find(x => x.id === b.dataset.go); document.dispatchEvent(new CustomEvent('show-bbox', { detail: z.bbox })); });
    $$('[data-del]', body).forEach(b => b.onclick = async () => { const z = zs.find(x => x.id === b.dataset.del); if (await confirmBox(`¿Borrar la zona «${z.name}» y sus mapas?`, 'Borrar')) { await deleteZone(z); await getZones(true); redrawView(); document.dispatchEvent(new CustomEvent('data-changed')); } });
    $$('[data-up]', body).forEach(b => b.onclick = async () => { const z = zs.find(x => x.id === b.dataset.up); await deleteZoneDataOnly(z); startDownload({ name: z.name, bbox: z.bbox, track: z.track, layers: z.layers || ['sat', 'topo', 'geo'], extraDetail: false }); });
  });
}

async function deleteZoneDataOnly(z) { await db.del('zones', z.id); await getZones(true); }

async function newZone(kind) {
  if (kind === 'view') {
    closeViews();
    document.dispatchEvent(new CustomEvent('frame-zone', { detail: { cb: (bbox) => zoneDialog({ bbox, name: '' }) } }));
  } else if (kind === 'gpx') {
    const [f] = await pickFiles({ accept: '.gpx,application/gpx+xml,application/xml,text/xml' });
    if (!f) return;
    try {
      const { pts, name } = parseGPX(await f.text());
      const step = Math.max(1, Math.floor(pts.length / 800));
      zoneDialog({ bbox: bboxOfPoints(pts, 2), name: name || f.name.replace(/\.gpx$/i, ''), track: pts.filter((_, i) => i % step === 0) });
    } catch (e) { toast(e.message); }
  } else {
    const p = state.me || state.lastPoint;
    if (!p) return toast('Toca «¿Dónde estoy?» o un punto del mapa primero');
    zoneDialog({ center: p, name: state.lastPoint?.label || '' });
  }
}

function zoneDialog(z) {
  let radius = 6;
  const fr = z.bbox ? likelyFrance((z.bbox.s + z.bbox.n) / 2, (z.bbox.w + z.bbox.e) / 2) : z.center ? likelyFrance(z.center.lat, z.center.lon) : false;
  const layers = new Set(fr ? ['satfr', 'topofr', 'sat'] : ['sat', 'topo', 'geo']);
  let extra = false;
  const b = openSheet('', { tall: true });
  const draw = () => {
    const bbox = z.bbox || bboxAround(z.center.lat, z.center.lon, radius);
    const km = bboxKm(bbox);
    const n = planTiles(bbox, { layers: [...layers], extraDetail: extra }).length;
    const big = n > 9000;
    b.innerHTML = html`<p class="kicker">Nueva zona</p><h2 class="title">Preparar salida</h2>
      <label class="f">Nombre</label><input type="text" id="zn" value="${z.name}" placeholder="Ej.: Valdelinares - Peñarroya">
      ${raw(z.center ? html`<label class="f">Radio: ${radius} km</label><input type="range" id="zr" min="2" max="15" value="${radius}" style="width:100%">` : '')}
      <p class="small muted">${fmtNum(km.w, 1)} × ${fmtNum(km.h, 1)} km${z.track ? ` · track de ${z.track.length} puntos` : ''}</p>
      <label class="f">Mapas a descargar</label>
      ${raw(Object.entries({ ...BASES, ...OVERLAYS }).filter(([, d]) => d.offline).map(([k, d]) => html`<label class="row" style="padding:6px 0"><input type="checkbox" data-l="${k}" ${layers.has(k) ? 'checked' : ''} style="width:20px;height:20px"><span class="grow">${d.name}</span></label>`).join(''))}
      <label class="row" style="padding:6px 0"><input type="checkbox" id="zx" ${extra ? 'checked' : ''} style="width:20px;height:20px"><span class="grow">Satélite con detalle extra (zoom 17, ocupa ~4 veces más)</span></label>
      <div class="note ${big ? '' : 'blue'}">${n.toLocaleString('es-ES')} trozos de mapa · unos <b>${estimateMB(n)} MB</b>. ${big ? 'Es mucho: reduce la zona o quita alguna capa.' : 'Mejor con wifi.'} Los datos (nombres, relieve, tiempo, especies) ocupan muy poco.</div>
      <button class="btn block" id="zgo" ${big ? 'disabled' : ''}>Descargar</button>`;
    const zr = $('#zr', b); if (zr) zr.oninput = e => { radius = +e.target.value; z.name = $('#zn', b).value; draw(); };
    $$('[data-l]', b).forEach(c => c.onchange = () => { c.checked ? layers.add(c.dataset.l) : layers.delete(c.dataset.l); z.name = $('#zn', b).value; draw(); });
    $('#zx', b).onchange = e => { extra = e.target.checked; z.name = $('#zn', b).value; draw(); };
    $('#zgo', b).onclick = () => {
      const name = $('#zn', b).value.trim() || `Zona del ${new Date().toLocaleDateString('es-ES')}`;
      startDownload({ name, bbox, track: z.track, layers: [...layers], extraDetail: extra });
    };
  };
  draw();
}

let ctl = null;
async function startDownload(opts) {
  if (!online()) return toast('Necesitas conexión para preparar la zona');
  try { await navigator.storage?.persist?.(); } catch (e) { }
  ctl = new AbortController();
  const b = openSheet(html`<p class="kicker">Preparando «${opts.name}»</p><h2 class="title">Descargando…</h2>
    <p id="zp" class="small">Empezando…</p><div class="bar"><i id="zb"></i></div>
    <p class="tiny muted">Puedes dejar la app abierta en esta pantalla. Si la cierras, se queda a medias.</p>
    <button class="btn sec block" id="zc">Cancelar</button>`);
  $('#zc', b).onclick = () => ctl.abort();
  try {
    const z = await prepareZone(opts, ({ phase, done, total }) => {
      if (!document.body.contains(b)) return;
      $('#zp', b).textContent = total ? `${phase}: ${done.toLocaleString('es-ES')} de ${total.toLocaleString('es-ES')}` : phase + '…';
      if (total) $('#zb', b).style.width = `${Math.round(done / total * 100)}%`;
    }, ctl.signal);
    await getZones(true);
    document.dispatchEvent(new CustomEvent('data-changed'));
    b.innerHTML = html`<p class="kicker">Zona lista</p><h2 class="title">${z.name}</h2>
      <p>${z.places?.length || 0} nombres, ${z.boundaries?.length || 0} términos municipales, ${z.farPeaks?.length || 0} picos para la brújula, relieve ${z.grid ? '✓' : '✗'}, previsión ${z.forecast ? '✓' : '✗'}, especies ${z.inat ? '✓' : '✗'}, ${z.tiles - (z.tilesFailed || 0)} trozos de mapa.</p>
      ${raw(z.errors?.length ? html`<div class="note">Avisos: ${z.errors.join(' · ')}</div>` : '')}
      <p class="small muted">Consejo: pon el móvil en modo avión y toca un punto de la zona para comprobar que todo funciona sin cobertura.</p>
      <button class="btn block" id="zok">Ver en el mapa</button>`;
    $('#zok', b).onclick = () => { closeSheet(); closeViews(); document.dispatchEvent(new CustomEvent('show-bbox', { detail: z.bbox })); };
  } catch (e) {
    if (document.body.contains(b)) b.innerHTML = html`<p class="kicker">Zona</p><h2 class="title">${e.message === 'Cancelado' ? 'Cancelado' : 'Algo falló'}</h2><p>${e.message === 'Cancelado' ? 'Lo descargado hasta ahora se queda guardado.' : e.message}</p>`;
    await getZones(true);
  }
}

// ---------------- Ajustes ----------------
function openSettings() {
  openView('Ajustes', async body => {
    const key = await db.getKV('plantnetKey', '');
    const host = location.host || 'tu-usuario.github.io';
    body.innerHTML = html`
      <div class="card"><h3>🌿 Pl@ntNet (identificar plantas)</h3>
        <p class="small" style="line-height:1.5">Gratis hasta 500 identificaciones al día. Necesitas una clave propia:</p>
        <ol class="small" style="line-height:1.55;padding-left:18px">
          <li>Crea una cuenta en <a href="https://my.plantnet.org/" target="_blank" rel="noopener">my.plantnet.org</a>.</li>
          <li>En tu cuenta, ve a la configuración de la clave (API key) y activa <b>«Expose my API key»</b>.</li>
          <li>En <b>«Authorized domains»</b> añade: <code>${host}</code></li>
          <li>Copia la clave y pégala aquí.</li>
        </ol>
        <input type="text" id="pk" value="${key}" placeholder="Tu clave de Pl@ntNet" autocomplete="off" autocapitalize="off" spellcheck="false">
        <button class="btn block" id="pks">Guardar clave</button>
        <p class="tiny muted">La clave se guarda solo en este móvil.</p></div>`;
    $('#pks', body).onclick = async () => { await db.setKV('plantnetKey', $('#pk', body).value.trim()); toast('Clave guardada'); };
  });
}

// ---------------- Copia de seguridad ----------------
const b64 = blob => new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(blob); });
const unb64 = async s => (await fetch(s)).blob();

async function exportData(withPhotos) {
  const out = { app: 'otero', v: APP_VERSION, t: Date.now(), stores: {} };
  for (const s of ['panels', 'diary', 'measures']) {
    const items = await db.all(s);
    out.stores[s] = [];
    for (const it of items) {
      const o = { ...it };
      for (const k of ['blob', 'thumb', 'edited', 'photo']) {
        if (o[k] instanceof Blob) o[k] = withPhotos || k === 'thumb' ? await b64(o[k]) : null;
      }
      out.stores[s].push(o);
    }
  }
  const blob = new Blob([JSON.stringify(out)], { type: 'application/json' });
  const name = `otero-copia-${new Date().toISOString().slice(0, 10)}${withPhotos ? '-con-fotos' : ''}.json`;
  const file = new File([blob], name, { type: 'application/json' });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Copia de Otero' }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.append(a); a.click(); a.remove();
}

async function importData() {
  const [f] = await pickFiles({ accept: '.json,application/json' });
  if (!f) return;
  try {
    const d = JSON.parse(await f.text());
    if (d.app !== 'otero') throw new Error('No es una copia de Otero');
    let n = 0;
    for (const [s, items] of Object.entries(d.stores || {})) {
      for (const it of items) {
        for (const k of ['blob', 'thumb', 'edited', 'photo']) if (typeof it[k] === 'string' && it[k].startsWith('data:')) it[k] = await unb64(it[k]);
        if (s === 'panels' && !it.blob && it.thumb) it.blob = it.thumb;
        const existing = await db.get(s, it.id);
        if (!existing) { await db.put(s, it); n++; }
      }
    }
    toast(`${n} elemento(s) recuperado(s)`);
    document.dispatchEvent(new CustomEvent('data-changed'));
  } catch (e) { toast('No se pudo importar: ' + e.message); }
}

function openBackup() {
  openView('Copia de seguridad', body => {
    body.innerHTML = html`<div class="note">Todo lo tuyo vive en este móvil. Si borras los datos de Safari o cambias de móvil, se pierde. Haz una copia de vez en cuando y guárdala en iCloud Drive o en Archivos.</div>
      <button class="btn block" id="e1">💾 Exportar datos (sin fotos, ligero)</button>
      <button class="btn block" id="e2">🖼️ Exportar todo con fotos (puede ocupar mucho)</button>
      <button class="btn sec block" id="i1">📂 Importar una copia</button>
      <p class="tiny muted">La importación añade lo que falte; no borra nada de lo que ya tienes. Los mapas descargados no entran en la copia: se vuelven a bajar desde «Preparar salida».</p>`;
    $('#e1', body).onclick = () => exportData(false);
    $('#e2', body).onclick = () => exportData(true);
    $('#i1', body).onclick = importData;
  });
}

function openInstall() {
  openView('Instalar en el iPhone', body => {
    const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    body.innerHTML = html`<div class="article" style="font-size:16px">
      ${raw(standalone ? '<div class="note blue">✅ Ya la estás usando instalada.</div>' : '')}
      <h3>Instalar</h3><ol style="line-height:1.6;padding-left:20px"><li>Abre esta página en <b>Safari</b>.</li><li>Pulsa el botón <b>Compartir</b> (cuadrado con flecha).</li><li>Elige <b>«Añadir a pantalla de inicio»</b> y confirma.</li><li>Abre Otero desde el icono: funcionará a pantalla completa y sin cobertura.</li></ol>
      <h3>Permisos</h3><p>La primera vez te pedirá la <b>ubicación</b> (para «¿Dónde estoy?») y, al usar la brújula, el permiso de <b>movimiento y orientación</b>.</p>
      <h3>Actualizaciones</h3><p>Cuando haya versión nueva, se descarga sola la próxima vez que abras la app con cobertura y se aplica al volver a abrirla.</p>
      <h3>Importante</h3><p>Usa siempre la app desde el icono, no desde Safari: el iPhone guarda los datos de la app instalada aparte y no los borra aunque pases semanas sin abrirla.</p></div>`;
  });
}

function openCredits() {
  openView('Fuentes y créditos', body => {
    body.innerHTML = html`<ul class="list small">
      <li style="display:block"><b>Ortofotos y mapa topográfico de España</b>: PNOA y MTN © Instituto Geográfico Nacional (CC BY 4.0).</li>
      <li style="display:block"><b>Ortofotos y mapa de Francia</b>: © IGN France, Géoplateforme (Licence Ouverte).</li>
      <li style="display:block"><b>Mapa geológico</b>: MAGNA 1:50.000 © IGME-CSIC.</li>
      <li style="display:block"><b>Nombres, picos, masías, fuentes y términos municipales</b>: © colaboradores de OpenStreetMap (ODbL), vía Overpass API.</li>
      <li style="display:block"><b>Altitud y tiempo</b>: Open-Meteo (CC BY 4.0), modelo de elevación Copernicus GLO-90.</li>
      <li style="display:block"><b>Especies observadas</b>: iNaturalist (observaciones de grado investigación).</li>
      <li style="display:block"><b>Identificación de plantas</b>: «The image-based plant species identification service used, is based on the Pl@ntNet recognition API, regularly updated and accessible through the site https://my.plantnet.org/».</li>
      <li style="display:block"><b>Mapa topográfico mundial</b>: © OpenTopoMap (CC-BY-SA).</li>
      <li style="display:block"><b>Textos de la biblioteca</b>: redactados para Otero. Son divulgativos: para identificaciones delicadas, contrasta con una guía de campo.</li>
      <li style="display:block"><b>Librerías</b>: Leaflet (BSD-2), exifr (MIT).</li></ul>`;
  });
}

function openStorage() {
  openView('Almacenamiento', async body => {
    const est = await navigator.storage?.estimate?.().catch(() => null);
    const persisted = await navigator.storage?.persisted?.().catch(() => null);
    const counts = {};
    for (const s of ['panels', 'diary', 'measures', 'zones']) counts[s] = (await db.all(s).catch(() => [])).length;
    body.innerHTML = html`<dl class="kv"><dt>Usado</dt><dd>${est ? Math.round(est.usage / 1048576) + ' MB' : '—'}</dd><dt>Disponible</dt><dd>${est ? Math.round(est.quota / 1048576).toLocaleString('es-ES') + ' MB' : '—'}</dd><dt>Protegido</dt><dd>${persisted ? 'Sí' : 'No (instálala en la pantalla de inicio)'}</dd>
      <dt>Paneles</dt><dd>${counts.panels}</dd><dt>Diario</dt><dd>${counts.diary}</dd><dt>Mediciones</dt><dd>${counts.measures}</dd><dt>Zonas</dt><dd>${counts.zones}</dd></dl>
      <button class="btn sec block" id="clr">Vaciar mapas vistos recientemente</button><p class="tiny muted">Las zonas preparadas no se tocan.</p>`;
    $('#clr', body).onclick = async () => { await caches.delete('otero-tiles-recent'); toast('Hecho'); redrawView(); };
  });
}
