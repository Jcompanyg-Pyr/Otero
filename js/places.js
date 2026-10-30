// Buscar lugares de cualquier país y guardar favoritos.
// Los favoritos se guardan en el almacén «kv» que ya existía: no cambia la estructura de la base de datos.
import { state } from './state.js';
import { openSheet, closeSheet, html, $, toast } from './ui.js';
import { db, uid } from './db.js';
import { searchPlaces, explainError, online } from './sources.js';
import { fmtNum } from './geo.js';

const KEY = 'favorites';
const same = (a, b) => Math.abs(a.lat - b.lat) < 1e-4 && Math.abs(a.lon - b.lon) < 1e-4;

export async function getFavorites() { return (await db.getKV(KEY, [])) || []; }
export async function isFavorite(lat, lon) { return (await getFavorites()).some(f => same(f, { lat, lon })); }

// Añade o quita; devuelve true si queda guardado
export async function toggleFavorite({ lat, lon, name }) {
  const favs = await getFavorites();
  const i = favs.findIndex(f => same(f, { lat, lon }));
  if (i >= 0) favs.splice(i, 1);
  else favs.unshift({ id: uid(), name: name || `${fmtNum(lat, 4)}, ${fmtNum(lon, 4)}`, lat, lon, added: Date.now() });
  await db.setKV(KEY, favs);
  return i < 0;
}

const go = p => { closeSheet(); document.dispatchEvent(new CustomEvent('go-place', { detail: p })); };

export async function openSearch() {
  const b = openSheet(html`<p class="kicker">Lugares</p><h2 class="title">Buscar un sitio</h2>
    <form id="sf" class="row" style="gap:8px" autocomplete="off"><input id="sq" type="search" class="grow" placeholder="Pico, pueblo, valle, refugio…" enterkeyhint="search" style="font-size:16px"><button class="btn small">Buscar</button></form>
    <ul class="list" id="sr"></ul>
    <p class="kicker" style="margin-top:14px">Favoritos</p><ul class="list" id="sfav"><li class="muted small">…</li></ul>`, { tall: true });
  const input = $('#sq', b), out = $('#sr', b);
  let ctl = null, timer = null;
  const run = async () => {
    const q = input.value;
    ctl?.abort(); ctl = new AbortController();
    if (q.trim().length < 2) { out.innerHTML = ''; return; }
    if (!online()) { out.innerHTML = '<li class="muted small">Sin cobertura: la búsqueda necesita conexión. Tus favoritos sí están disponibles.</li>'; return; }
    out.innerHTML = '<li class="muted small">Buscando…</li>';
    try {
      const c = state.map?.getCenter();
      const { results, source } = await searchPlaces(q, { near: c ? { lat: c.lat, lon: c.lng } : null, signal: ctl.signal });
      out.innerHTML = results.length
        ? results.map((r, i) => html`<li data-i="${i}"><span class="k">📍</span><div class="grow"><b>${r.name}</b><div class="tiny muted">${[r.kind, r.where].filter(Boolean).join(' · ')}</div></div><span class="muted">›</span></li>`).join('') + html`<li class="tiny muted" style="display:block">Resultados: ${source}</li>`
        : '<li class="muted small">No encuentro ningún lugar con ese nombre.</li>';
      out.onclick = e => { const li = e.target.closest('[data-i]'); if (li) go(results[+li.dataset.i]); };
    } catch (e) {
      if (e.name === 'AbortError') return;
      out.innerHTML = html`<li class="small" style="display:block">No he podido buscar: ${explainError(e)}. <button class="btn small sec" id="sre">Reintentar</button></li>`;
      $('#sre', out).onclick = run;
    }
  };
  $('#sf', b).onsubmit = e => { e.preventDefault(); clearTimeout(timer); input.blur(); run(); };
  // búsqueda al escribir, sin saturar el servicio (espera a que dejes de teclear)
  input.oninput = () => { clearTimeout(timer); timer = setTimeout(run, 600); };
  drawFavs(b);
  setTimeout(() => input.focus(), 50);
}

async function drawFavs(b) {
  const ul = $('#sfav', b);
  const favs = await getFavorites().catch(() => []);
  if (!ul) return;
  ul.innerHTML = favs.length
    ? favs.map(f => html`<li data-id="${f.id}"><span class="k">☆</span><div class="grow" data-go="1"><b>${f.name}</b><div class="tiny muted">${fmtNum(f.lat, 4)}, ${fmtNum(f.lon, 4)}</div></div><button class="btn small sec" data-del="1" aria-label="Quitar">✕</button></li>`).join('')
    : '<li class="muted small">Aún no tienes favoritos. Abre la ficha de un sitio y pulsa «☆ Favorito».</li>';
  ul.onclick = async e => {
    const li = e.target.closest('[data-id]'); if (!li) return;
    const f = favs.find(x => x.id === li.dataset.id); if (!f) return;
    if (e.target.closest('[data-del]')) { await toggleFavorite(f); toast('Quitado de favoritos'); return drawFavs(b); }
    go(f);
  };
}
