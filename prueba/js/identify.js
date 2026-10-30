// «¿Qué es esto?»: plantas por foto (Pl@ntNet), huellas, sonidos, montañas y «Preguntar a Claude».
import { state } from './state.js';
import { openSheet, html, raw, esc, toast, pickFiles, shrinkImage, closeSheet, $ } from './ui.js';
import { db, uid } from './db.js';
import { plantnet, online } from './sources.js';
import { SPECIES } from '../content/species.js';
import { openSpecies, openLibrary } from './library.js';
import { contextText } from './point.js';
import { fmtNum } from './geo.js';

const SOUNDS = [
  ['corzo', 'Ladrido ronco y seco en el bosque, como un perro afónico', 'Corzo alarmado'],
  ['ciervo', 'Bramido grave y largo al anochecer en septiembre-octubre', 'Berrea del ciervo'],
  ['sarrio', 'Silbido-resoplido agudo por la nariz en roquedos', 'Sarrio alarmado'],
  ['marmota', 'Silbido muy agudo y fuerte en prados alpinos', 'Marmota'],
  ['zorro', 'Gritos agudos, casi humanos, de noche en invierno', 'Zorro en celo'],
  ['buho', '«U-hu» grave, de noche, en barrancos (sobre todo en invierno)', 'Búho real'],
  ['carabo', '«Uuu-u-uuuu» trémulo y «ki-uik» agudo de noche', 'Cárabo'],
  ['picapinos', 'Redoble rápido y seco en un tronco, en primavera', 'Pico picapinos'],
  ['pitonegro', '«Kli-kli-kli» fuerte en hayedos y abetales', 'Picamaderos negro'],
  ['arrendajo', 'Chillido áspero de alarma en el bosque', 'Arrendajo'],
  ['chova', '«Chiaa» metálico en cortados, en grupo', 'Chova piquirroja'],
  ['cuervo', '«Croc» grave y ronco', 'Cuervo'],
  ['piquituerto', '«Yip-yip» metálico de un bando pasando sobre el pinar', 'Piquituerto'],
  ['perdiz', '«Chuc-chuc-chukar» rítmico en campos y laderas', 'Perdiz roja'],
  ['urogallo', 'Clics, «descorche» y siseo al amanecer en primavera', 'Urogallo'],
];

export function openIdentify() {
  const b = openSheet(html`
    <p class="kicker">¿Qué es esto?</p><h2 class="title">¿Qué estás viendo?</h2>
    <div class="grid2" style="margin-top:8px">
      <button class="tile" data-w="plant"><span class="em">🌿</span><b>Planta o árbol</b><span>Foto → Pl@ntNet (gratis)</span></button>
      <button class="tile" data-w="track"><span class="em">🐾</span><b>Huella o excremento</b><span>Guía de descarte</span></button>
      <button class="tile" data-w="sound"><span class="em">👂</span><b>Un sonido</b><span>Pistas y Merlin</span></button>
      <button class="tile" data-w="peak"><span class="em">⛰️</span><b>Una montaña</b><span>Apunta con el móvil</span></button>
      <button class="tile" data-w="claude"><span class="em">✨</span><b>Otra cosa</b><span>Roca, paisaje, insecto… pregunta a Claude</span></button>
      <button class="tile" data-w="photo"><span class="em">📷</span><b>Solo guardar</b><span>Foto al diario para luego</span></button>
    </div>`);
  b.querySelectorAll('[data-w]').forEach(x => x.onclick = () => ({
    plant: plantFlow, track: () => { closeSheet(); openLibrary('huellas'); }, sound: soundFlow,
    peak: () => document.dispatchEvent(new CustomEvent('open-compass')), claude: () => claudeFlow(), photo: savePhotoFlow,
  })[x.dataset.w]());
}

async function here() {
  // posición para guardar: GPS reciente, o último punto consultado
  if (state.me && Date.now() - state.me.t < 5 * 60e3) return { lat: state.me.lat, lon: state.me.lon, ele: state.lastPoint?.ele ?? state.me.alt ?? null };
  if (state.lastPoint) return { lat: state.lastPoint.lat, lon: state.lastPoint.lon, ele: state.lastPoint.ele };
  return null;
}

async function plantFlow() {
  const key = await db.getKV('plantnetKey');
  const [file] = await pickFiles({ accept: 'image/*', capture: 'environment' });
  if (!file) return;
  const blob = await shrinkImage(file, 1600, 0.85);
  const pos = await here();
  const entry = { id: uid(), kind: 'planta', t: Date.now(), ...(pos || {}), photo: blob, title: 'Planta sin identificar', status: 'pendiente' };
  const b = openSheet(html`<p class="kicker">Planta</p><h2 class="title">Identificando…</h2><img id="pimg" style="width:100%;border-radius:12px;max-height:240px;object-fit:cover"><div id="pres" style="margin-top:10px"></div>`);
  $('#pimg', b).src = URL.createObjectURL(blob);
  const res = $('#pres', b);
  if (!key) {
    await db.put('diary', entry);
    res.innerHTML = html`<div class="note">Guardada en el diario. Para identificar plantas automáticamente necesitas tu clave gratuita de Pl@ntNet (500 al día). Ponla en <b>Más → Ajustes</b>.</div><button class="btn block" data-a="claude">✨ Preguntar a Claude con esta foto</button>`;
    res.querySelector('[data-a]').onclick = () => claudeFlow('Es una planta.');
    return;
  }
  if (!online()) {
    await db.put('diary', entry);
    res.innerHTML = `<div class="note">Sin cobertura. La he guardado en el diario como pendiente: cuando vuelvas a tener señal, ábrela y pulsa «Identificar».</div>`;
    return;
  }
  try {
    const r = await plantnet(blob, key);
    entry.results = r; entry.status = 'ok';
    entry.title = r[0] ? (r[0].common || r[0].sci) : 'Planta sin identificar';
    await db.put('diary', entry);
    b.querySelector('.title').textContent = entry.title;
    res.innerHTML = plantResultsHTML(r);
    res.querySelectorAll('[data-sp]').forEach(e => e.onclick = () => openSpecies(e.dataset.sp));
  } catch (e) {
    await db.put('diary', entry);
    res.innerHTML = html`<div class="note">${e.message}. La foto queda guardada en el diario.</div>`;
  }
}

export function plantResultsHTML(r) {
  if (!r?.length) return '<p class="muted">Sin resultados.</p>';
  return html`<ul class="list">${raw(r.map(x => {
    const sp = SPECIES.find(s => s.sci.toLowerCase().startsWith(x.sci.toLowerCase().split(' ').slice(0, 2).join(' ')));
    const pct = Math.round(x.score * 100);
    return html`<li ${raw(sp ? `data-sp="${sp.id}"` : '')}><div class="grow"><b>${x.common || x.sci}</b> ${raw(sp ? '<span class="pill ok">en tu biblioteca</span>' : '')}<div class="small sp-sci">${x.sci}${x.family ? ` · ${x.family}` : ''}</div></div><span class="pill ${pct > 60 ? 'ok' : pct > 25 ? 'warn' : ''}">${pct} %</span></li>`;
  }).join(''))}</ul><p class="tiny muted">Identificación de Pl@ntNet. Por debajo del 25 % tómalo como pista: haz otra foto de la hoja, la flor o el fruto por separado.</p>`;
}

export async function identifyPending(entry) {
  const key = await db.getKV('plantnetKey');
  if (!key) throw new Error('Falta la clave de Pl@ntNet (Más → Ajustes)');
  const r = await plantnet(entry.photo, key);
  entry.results = r; entry.status = 'ok'; entry.title = r[0] ? (r[0].common || r[0].sci) : entry.title;
  await db.put('diary', entry);
  return entry;
}

function soundFlow() {
  const b = openSheet(html`<p class="kicker">Un sonido</p><h2 class="title">¿A qué se parece?</h2>
    <ul class="list">${raw(SOUNDS.map(([id, d, n]) => html`<li data-sp="${id}"><div class="grow"><b>${n}</b><div class="small muted">${d}</div></div><span class="muted">›</span></li>`).join(''))}</ul>
    <div class="note blue" style="margin-top:12px"><b>Para pájaros, usa Merlin</b> (gratis, del Cornell Lab). Graba y te dice en tiempo real qué especie canta, y funciona sin cobertura si te descargas antes el paquete de aves de Europa Occidental.<br><a href="https://apps.apple.com/app/merlin-bird-id-by-cornell-lab/id773457673">Merlin en la App Store</a></div>`);
  b.querySelectorAll('[data-sp]').forEach(e => e.onclick = () => openSpecies(e.dataset.sp));
}

async function savePhotoFlow() {
  const [file] = await pickFiles({ accept: 'image/*', capture: 'environment' });
  if (!file) return;
  const blob = await shrinkImage(file, 2000, 0.85);
  const pos = await here();
  await db.put('diary', { id: uid(), kind: 'foto', t: Date.now(), ...(pos || {}), photo: blob, title: 'Foto', status: 'ok' });
  toast('Guardada en el diario');
  document.dispatchEvent(new CustomEvent('data-changed'));
  closeSheet();
}

export async function claudeFlow(extra = '') {
  const info = state.lastInfo || (state.me ? { lat: state.me.lat, lon: state.me.lon, t: Date.now() } : null);
  const text = info ? contextText(info, extra) : `Estoy en la montaña. ${extra} Te adjunto una foto: dime qué es, por qué está aquí y alguna curiosidad.`;
  const url = 'https://claude.ai/new?q=' + encodeURIComponent(text);
  const b = openSheet(html`<p class="kicker">Preguntar a Claude</p><h2 class="title">Con todo el contexto del sitio</h2>
    <p class="small" style="line-height:1.5">Esto entra en tu suscripción, sin coste extra. Copia el texto, abre Claude, pégalo y <b>adjunta la foto</b> con el clip.</p>
    ${raw(info ? '' : '<div class="note">Primero toca «¿Dónde estoy?» para que el texto incluya el sitio, la altitud y la roca.</div>')}
    <textarea id="ctx" style="min-height:170px;font-size:14px">${text}</textarea>
    <div class="row" style="margin-top:8px"><button class="btn grow" id="cp">📋 Copiar texto</button><a class="btn ochre grow" href="${url}" target="_blank" rel="noopener">Abrir Claude ›</a></div>
    <p class="tiny muted">Necesita cobertura. Si no hay, haz la foto con «Solo guardar» y pregunta luego desde el diario.</p>`);
  $('#cp', b).onclick = async () => {
    try { await navigator.clipboard.writeText($('#ctx', b).value); toast('Copiado. Ahora abre Claude y pégalo.'); }
    catch (e) { $('#ctx', b).select(); toast('Selecciona el texto y cópialo'); }
  };
}
