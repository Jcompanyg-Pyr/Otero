// Ayudas de interfaz: hoja inferior, vistas, avisos.
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function html(strings, ...vals) {
  // plantilla con escape automático salvo valores marcados como raw()
  return strings.reduce((a, s, i) => a + s + (i < vals.length ? (vals[i]?.__raw ?? esc(vals[i])) : ''), '');
}
export const raw = s => ({ __raw: s ?? '' });

// ---- Hoja inferior ----
const sheet = () => $('#sheet');
export function openSheet(content, { tall = false } = {}) {
  const s = sheet();
  s.classList.remove('hidden');
  s.classList.toggle('tall', tall);
  const body = $('.sheet-body', s);
  body.onclick = null;
  delete body.dataset.dl; // el panel deja de ser el de una descarga en curso
  if (typeof content === 'string') body.innerHTML = content; else { body.innerHTML = ''; body.append(content); }
  body.scrollTop = 0;
  $('#mainactions').classList.add('hidden');
  return body;
}
export function closeSheet() {
  sheet().classList.add('hidden');
  $('.sheet-body', sheet()).innerHTML = '';
  $('.sheet-body', sheet()).onclick = null;
  delete $('.sheet-body', sheet()).dataset.dl;
  $('#mainactions').classList.remove('hidden');
  sheetCloseHandlers.forEach(f => f());
}
const sheetCloseHandlers = [];
export const onSheetClose = f => sheetCloseHandlers.push(f);

// ---- Vista a pantalla completa con historial propio ----
const stack = [];
export function openView(title, render, { tools = '', root = false } = {}) {
  if (root) stack.length = 0;
  stack.push({ title, render, tools });
  drawView();
}
function drawView() {
  const v = $('#view');
  const top = stack[stack.length - 1];
  if (!top) { v.classList.add('hidden'); return; }
  v.classList.remove('hidden');
  $('h1', v).textContent = top.title;
  $('.back', v).classList.toggle('invisible', stack.length < 2);
  $('.view-tools', v).innerHTML = top.tools || '';
  const body = $('.view-body', v);
  body.innerHTML = '';
  body.scrollTop = 0;
  top.render(body, $('.view-tools', v));
}
export function backView() { stack.pop(); drawView(); }
export function closeViews() { stack.length = 0; drawView(); }
export function redrawView() { drawView(); }
export const viewDepth = () => stack.length;

// ---- Modal ----
export function modal(content) {
  const m = $('#modal');
  const b = $('.modal-body', m);
  if (typeof content === 'string') b.innerHTML = content; else { b.innerHTML = ''; b.append(content); }
  m.classList.remove('hidden');
  return b;
}
export const closeModal = () => $('#modal').classList.add('hidden');

export function confirmBox(text, okText = 'Aceptar') {
  return new Promise(res => {
    const b = modal(html`<p style="font-size:16px;line-height:1.45">${text}</p><div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn sec" data-a="0">Cancelar</button><button class="btn" data-a="1">${okText}</button></div>`);
    b.onclick = e => { const a = e.target.closest('[data-a]'); if (a) { closeModal(); b.onclick = null; res(a.dataset.a === '1'); } };
  });
}

let tt;
export function toast(msg, ms = 2600) {
  const t = $('#toast');
  t.textContent = msg; t.classList.remove('hidden');
  clearTimeout(tt); tt = setTimeout(() => t.classList.add('hidden'), ms);
}

export function el(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'html') e.innerHTML = v;
    else if (v !== false && v != null) e.setAttribute(k, v);
  }
  for (const k of kids) if (k != null) e.append(k);
  return e;
}

export function fmtDate(ts, withTime = true) {
  const d = new Date(ts);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) + (withTime ? ' · ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '');
}

// Leer archivo como imagen reducida (para no llenar el móvil)
export async function shrinkImage(file, max = 2400, quality = 0.85) {
  const bmp = await loadImage(file);
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise(r => c.toBlob(b => r(b), 'image/jpeg', quality));
}
export function loadImage(blob) {
  return new Promise((res, rej) => {
    const img = new Image();
    const u = URL.createObjectURL(blob);
    img.onload = () => { res(img); setTimeout(() => URL.revokeObjectURL(u), 1000); };
    img.onerror = () => rej(new Error('No se pudo abrir la imagen'));
    img.src = u;
  });
}

export function pickFiles({ accept = 'image/*', multiple = false, capture = null } = {}) {
  return new Promise(res => {
    const i = document.createElement('input');
    i.type = 'file'; i.accept = accept; i.multiple = multiple;
    if (capture) i.setAttribute('capture', capture);
    i.style.display = 'none';
    i.onchange = () => { res([...i.files]); i.remove(); };
    i.oncancel = () => { res([]); i.remove(); }; // si cancelas, que no se quede esperando
    document.body.append(i);
    i.click();
  });
}
