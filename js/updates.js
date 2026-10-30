// Actualizaciones: detecta una versión nueva publicada en GitHub Pages y ofrece aplicarla.
// Los datos personales (diario, paneles, mediciones, zonas, favoritos) viven en IndexedDB y no se tocan.
import { el, toast } from './ui.js';

let reg = null, lastCheck = 0, reloading = false;
let wantReload = false; // solo se recarga sola si el usuario pulsó «Actualizar»
const CHECK_EVERY = 30 * 60e3;

export function initUpdates() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  // Recarga una sola vez cuando la versión nueva toma el control
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading || !wantReload) return;
    reloading = true;
    location.reload();
  });
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(r => {
    reg = r;
    if (r.waiting && navigator.serviceWorker.controller) offer(r.waiting);
    r.addEventListener('updatefound', () => {
      const nw = r.installing;
      nw?.addEventListener('statechange', () => {
        // «installed» con una versión ya en uso = hay una nueva esperando
        if (nw.state === 'installed' && navigator.serviceWorker.controller) offer(nw);
      });
    });
  }).catch(e => console.warn('SW', e));
  // El iPhone no recarga la app al volver a ella: comprobar al ponerse en primer plano y al recuperar cobertura
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkForUpdate(); });
  window.addEventListener('online', () => checkForUpdate());
}

export async function checkForUpdate(force = false) {
  if (!reg || (!force && Date.now() - lastCheck < CHECK_EVERY)) return null;
  lastCheck = Date.now();
  try { await reg.update(); } catch (e) { return false; }
  return !!(reg.waiting || reg.installing);
}

let bar = null;
function offer(worker) {
  if (bar) return;
  bar = el('div', { id: 'updbar', role: 'status' });
  bar.innerHTML = '<span>Hay una versión nueva de Otero.</span><button class="btn small" data-a="ok">Actualizar</button><button class="btn small sec" data-a="no" aria-label="Más tarde">Luego</button>';
  bar.onclick = e => {
    const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return;
    if (a === 'ok') { wantReload = true; worker.postMessage({ type: 'SKIP_WAITING' }); bar.querySelector('span').textContent = 'Actualizando…'; }
    else { bar.remove(); bar = null; toast('Se aplicará cuando cierres Otero del todo, o desde Más → Instalar y actualizar'); }
  };
  document.body.append(bar);
}

// Versión instalada (la dice el service worker activo)
export function installedVersion() {
  const ctl = navigator.serviceWorker?.controller;
  if (!ctl) return Promise.resolve(null);
  return new Promise(res => {
    const ch = new MessageChannel();
    const t = setTimeout(() => res(null), 1500);
    ch.port1.onmessage = e => { clearTimeout(t); res(e.data?.version || null); };
    ctl.postMessage({ type: 'GET_VERSION' }, [ch.port2]);
  });
}

// Para el botón «Buscar actualizaciones» de Ajustes
export async function manualCheck() {
  if (!reg) return 'Las actualizaciones automáticas no están disponibles en este navegador.';
  if (reg.waiting) { offer(reg.waiting); return 'Hay una versión nueva lista: pulsa «Actualizar» abajo.'; }
  const r = await checkForUpdate(true);
  if (r === false) return 'No he podido comprobarlo (¿sin cobertura?).';
  if (r) return 'Descargando la versión nueva… En unos segundos aparecerá «Actualizar».';
  return 'Ya tienes la última versión.';
}
