// Catálogo y buscador de la biblioteca («Pregúntale a Otero»).
// No es una IA generativa: entiende la pregunta (sinónimos, rasgos, sierras, altitud) y devuelve
// las fichas y explicaciones de Otero que mejor encajan, diciendo por qué. Funciona sin conexión.
import { SPECIES, GROUPS } from '../content/species.js';
import ROCKS from '../content/rocks.js';
import { ARTICLES } from '../content/articles.js';
import { TOPONIMIA } from '../content/toponimia.js';
import { REGIONS } from '../content/regions.js';
import { ZONAS, SUBS, TRAITS, HABITATS } from '../content/traits.js';

export const GROUP_LABELS = { ...GROUPS, roc: 'Rocas, minerales y fósiles' };
export const ENTRIES = [...SPECIES, ...ROCKS];
export const entryById = id => ENTRIES.find(e => e.id === id);
export { ZONAS, SUBS, TRAITS, HABITATS };

// ---------- Texto ----------
export const norm = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ\s-]/g, ' ');
// Raíz muy simple para el español: quita plurales y la vocal final (rojizo/rojiza/rojizos → rojiz)
export function stem(w) {
  if (w.length <= 3) return w;
  let s = w;
  if (s.length > 4 && s.endsWith('es')) s = s.slice(0, -2);
  else if (s.endsWith('s')) s = s.slice(0, -1);
  if (s.length > 4 && /[aoe]$/.test(s)) s = s.slice(0, -1);
  return s;
}
const STOP = new Set('el la los las un una unos unas de del al a en y o u que qué con sin por para como cómo es son se su sus mi me lo le les hay muy mas más pero este esta esto ese esa eso aqui aquí alli allí donde dónde cual cuál cuales quien quién cuando cuándo tiene tienen tengo ver visto vi he ha han hace hacen sobre entre algo alguna alguno tipo cosa cosas tan ya tambien también no si sí puede pueden ser estar está estoy junto color forma especie especies encontrado encontre vi visto ves parecia parece parecido creo era seria será sera habia había alguien'.split(' ').map(norm));
export const tokens = s => norm(s).split(/[\s-]+/).filter(w => w && !STOP.has(w));

// Sinónimos y palabras de la calle → términos del vocabulario de Otero
const SYN = {
  rojiz: 'rojo', roj: 'rojo', granate: 'rojo', encarnad: 'rojo', escarlata: 'rojo', bermej: 'rojo', colorad: 'rojo',
  amarill: 'amarillo', dorad: 'amarillo', naranj: 'naranja', anaranjad: 'naranja', verd: 'verde', azul: 'azul', azulad: 'azul',
  negr: 'negro', gri: 'gris', rosa: 'rosa', oscur: 'negro', blanc: 'blanco', blanquecin: 'blanco', gris: 'gris', grisace: 'gris', pard: 'pardo', marron: 'pardo', castan: 'pardo',
  morad: 'morado', violet: 'morado', lila: 'morado', purpur: 'morado', ros: 'rosa', rosad: 'rosa',
  arbol: '#arb', arbust: '#arb', mata: '#arb', pajar: '#ave', ave: '#ave', pajaro: '#ave', bich: '#ins', insect: '#ins', mariposa: 'mariposa',
  seta: ['#hon', '!liquen'], hong: ['#hon', '!liquen'], liquen: ['#hon', 'liquen'], culebr: ['#rep', 'serpiente'], vibor: ['#rep', 'serpiente'], serpient: ['#rep', 'serpiente'], lagartij: ['#rep', 'lagarto'], lagart: ['#rep', 'lagarto'], salamanques: ['#rep', 'salamanquesa'], tortug: ['#rep', 'tortuga'],
  ran: ['#anf', 'rana'], rana: ['#anf', 'rana'], sap: ['#anf', 'sapo'], sapo: ['#anf', 'sapo'], salamandr: ['#anf', 'salamandra'], trito: ['#anf', 'triton'], flor: '#pla', plant: '#pla', hierb: '#pla', helech: ['#pla', 'helecho'],
  pared: 'roquedo', roqued: 'roquedo', roc: ['~#roc', 'roquedo'], roca: ['~#roc', 'roquedo'], piedr: ['~#roc', 'canchal'], mineral: ['#roc', 'mineral'], fosil: ['#roc', 'fosil'], mamifer: '#mam', animal: '#animal', trep: 'trepa', pin: ['pino', 'pinar'], pino: ['pino', 'pinar'], encin: 'bosque-mediterraneo', hay: 'bosque-caducifolio', mariposa: ['#ins', 'mariposa'], polill: ['#ins', 'polilla'], escarabaj: ['#ins', 'escarabajo'], arañ: ['#ins', 'arana'], aran: ['#ins', 'arana'], escorpion: ['#ins', 'escorpion'], libelul: ['#ins', 'libelula'], hormig: ['#ins', 'hormiga'], avisp: ['#ins', 'avispa'], abej: ['#ins', 'abeja'], saltamont: ['#ins', 'saltamontes'], rapaz: ['#ave', 'rapaz'], aguil: '#ave', buho: '#ave', buh: '#ave', pic: 'pico', canta: 'canto', cantan: 'canto',
  pinch: 'espinosa', espin: 'espinosa', pincho: 'espinosa', agujas: 'aguja', aguj: 'aguja', bellot: 'bellota', piñ: 'pina', pina: 'pina',
  baya: 'baya', rio: 'ribera', arroy: 'ribera', barranc: 'umbria', agua: 'agua-dulce', lago: 'agua-dulce', charc: 'agua-dulce',
  cumbr: 'alta-montana', cima: 'alta-montana', cortad: 'roquedo', robledal: 'bosque-caducifolio', pinar: 'pinar', hayed: 'bosque-caducifolio',
  robled: 'bosque-caducifolio', encinar: 'bosque-mediterraneo', prad: 'pastizal', past: 'pastizal', noch: 'nocturno', nocturn: 'nocturno', dia: 'diurno',
  venenos: 'venenosa', peligros: 'venenosa', mortal: 'mortal', toxic: 'toxica', comestible: 'comestible-precaucion', pica: 'pica', urtic: 'urticante',
  oton: 'otono', otono: 'otono', inviern: 'invierno', grand: 'grande', primaver: 'primavera', veran: 'verano', grande: 'grande', pequeñ: 'pequeno', pequen: 'pequeno', diminut: 'diminuto',
  huell: 'huella', excrement: 'excremento', caca: 'excremento', cagarru: 'excremento', cant: 'canto', frio: 'frio', helad: 'heladas', niev: 'nieve', nub: 'nubes', vient: 'viento',  torment: 'tormentas',
};
const PER_GROUP_TOKENS = { '#animal': ['mam', 'ave', 'rep', 'anf', 'ins'] };

// ---------- Índice ----------
let INDEX = null;
const W = { name: 12, sci: 8, alt_n: 8, trait: 5, sub: 4, group: 3, zone: 2, text: 1 };
function addTokens(map, text, w) { for (const t of tokens(text)) { const s = stem(t); map.set(s, Math.max(map.get(s) || 0, w)); } }

// Palabras corrientes dentro de los nombres («Fresno de hoja ancha», «Rosa común»): no identifican la especie
const GENERIC = new Set(['hoj', 'hoja', 'flor', 'frut', 'comun', 'grand', 'pequen', 'montan', 'alt', 'baj', 'falso', 'fals', 'tipo', 'ancha', 'anch', 'estrech']);
function addName(m, text, w) { for (const t of tokens(text)) { const s = stem(t); const ww = GENERIC.has(s) ? 3 : w; m.set(s, Math.max(m.get(s) || 0, ww)); } }
function indexEntry(e) {
  const m = new Map(), traitVals = new Set();
  addName(m, e.n, W.name); addTokens(m, e.sci, W.sci); (e.alt_n || []).forEach(a => addName(m, a, W.alt_n));
  const tg = TRAITS[e.g] || {};
  for (const [k, vals] of Object.entries(e.t || {})) for (const v of [].concat(vals)) {
    traitVals.add(v); traitVals.add(k + ':' + v);
    m.set(v, Math.max(m.get(v) || 0, W.trait));
    const label = k === 'hab' ? HABITATS[v] : tg[k]?.opts?.[v];
    if (label) addTokens(m, label, W.trait - 1);
  }
  // el nombre del rasgo también cuenta un poco («otoño», «corteza», «pupila»…)
  for (const k of Object.keys(e.t || {})) { if (tg[k]) addTokens(m, tg[k].label, 2); if (k === 'otono') m.set('otono', Math.max(m.get('otono') || 0, 3)); }
  if (e.sub) { m.set(e.sub, W.sub); addTokens(m, SUBS[e.g]?.[e.sub], W.sub); }
  m.set('#' + e.g, W.group); addTokens(m, GROUP_LABELS[e.g], W.group);
  for (const z of e.r || []) { m.set('@' + z, W.zone); }
  if (e.tox) m.set(e.tox, W.trait);
  for (const f of ['idf', 'hab', 'cur', 'beh', 'sim', 'tec']) addTokens(m, e[f], W.text);
  return { kind: 'entry', e, m, traitVals };
}
function indexArticle(a) {
  const m = new Map();
  addTokens(m, a.title, 10); (a.tags || []).forEach(t => addTokens(m, t, 7)); addTokens(m, a.kicker, 3); addTokens(m, a.lead, 3);
  addTokens(m, String(a.body || '').replace(/<[^>]+>/g, ' '), 1);
  return { kind: 'article', e: a, m };
}
function indexTopo(t) { const m = new Map(); addTokens(m, t.t, 12); addTokens(m, t.d, 2); addTokens(m, t.tip, 1); addTokens(m, t.l, 2); return { kind: 'topo', e: t, m }; }
function indexRegion(r) { const m = new Map(); addTokens(m, r.name, 12); addTokens(m, r.summary, 1); addTokens(m, r.veg, 1); addTokens(m, r.fauna, 1); (r.peaks || []).forEach(p => addTokens(m, p, 5)); return { kind: 'region', e: r, m }; }

export function buildIndex() {
  if (INDEX) return INDEX;
  INDEX = [...ENTRIES.map(indexEntry), ...ARTICLES.map(indexArticle), ...TOPONIMIA.map(indexTopo), ...REGIONS.map(indexRegion)];
  return INDEX;
}

// ---------- Entender la pregunta ----------
export function parseQuery(q, { here } = {}) {
  const raw = tokens(q);
  const terms = [], groups = new Set(), soft = new Set(), zones = new Set(), notes = [], notSub = new Set();
  let alt = null;
  const nq = norm(q);
  // ¿Qué tipo de pregunta es? (significado de un nombre, una huella…)
  const intent = /signific|quiere decir|de donde viene|origen del nombre|toponim/.test(nq) ? 'nombre' : /\bhuell|\brastro|excrement|\bcaca|cagarrut|\bexcremento/.test(nq) ? 'huella' : null;
  // «a más de 2000 m», «por encima de 1800», «por debajo de 1000 metros», «a 1500 m»
  let altCmp = null;
  const am = nq.match(/(mas de|por encima de|encima de|sobre|superior a|arriba de|menos de|por debajo de|debajo de|inferior a)?\s*(los\s*)?(\d{3,4})\s*(m|metros|msnm)?\b/);
  if (am && (am[4] || am[1])) { alt = +am[3]; altCmp = !am[1] ? 'at' : /menos|debajo|inferior/.test(am[1]) ? 'max' : 'min'; }
  if (/\baqui\b|\bdonde estoy\b|\bcerca\b/.test(nq) && here?.group) { zones.add(here.group); notes.push(`zona: ${ZONAS[here.group]}`); }
  // sierras o zonas nombradas
  for (const r of REGIONS) {
    const rn = norm(r.name).replace(/^(sierra|montes?|serrania|cordillera|sistema|macizo|puertos?) (de |del |de la |de los )?/, '');
    if (rn.length > 3 && nq.includes(rn)) { zones.add(r.group); notes.push(`zona: ${r.name}`); }
  }
  for (const w of raw) {
    if (/^\d+$/.test(w) || w === 'm' || w === 'metros') continue;
    const s = stem(w);
    const syns = [].concat(SYN[s] || SYN[w] || []);
    let termSyn = null;
    for (const syn of syns) {
      if (syn.startsWith('!')) notSub.add(syn.slice(1));
      else if (syn.startsWith('~#')) soft.add(syn.slice(2));
      else if (syn.startsWith('#')) { if (PER_GROUP_TOKENS[syn]) PER_GROUP_TOKENS[syn].forEach(g => groups.add(g)); else groups.add(syn.slice(1)); }
      else termSyn = syn;
    }
    if (termSyn || !syns.length) terms.push({ w, s, syn: termSyn, syns: syns.filter(x => !/^[#~!]/.test(x)) });
  }
  // «roca» sola = buscar rocas; «roca» con un grupo de seres vivos = roquedo (hábitat)
  return { notSub: [...notSub], altCmp, terms: intent === 'nombre' ? terms.filter(t => !/^signific|^nombre|^quier|^decir/.test(t.s)) : terms, groups: [...groups], soft: groups.size ? [] : [...soft], zones: [...zones], alt, notes, intent };
}

// ---------- Buscar ----------
export function search(q, opts = {}) {
  const idx = buildIndex();
  const pq = parseQuery(q, opts);
  if (!pq.terms.length && !pq.groups.length && !pq.zones.length) return { pq, results: [] };
  const res = [];
  for (const it of idx) {
    let score = 0; const why = [];
    for (const t of pq.terms) {
      // si la palabra se ha traducido a otro término de Otero, la coincidencia literal pesa la mitad
      const keepsWord = !t.syns?.length || t.syns.some(x => stem(x) === t.s || x === t.w);
      const lit = Math.max(it.m.get(t.s) || 0, it.m.get(t.w) || 0) * (keepsWord ? 1 : 0.5);
      const v = Math.max(lit, ...(t.syns || []).map(x => it.m.get(x) || it.m.get(stem(x)) || 0));
      if (it.kind === 'entry' && v >= W.name) why.push('nombre');
      if (v) { score += v; if (v >= W.trait && v < W.name && it.kind === 'entry') why.push(lit >= v ? t.w : (t.syns || []).find(x => (it.m.get(x) || it.m.get(stem(x))) === v) || t.w); }
      // prefijo (p. ej. «quebranta» → quebrantahuesos), solo para palabras largas
      else if (t.s.length >= 5) { for (const [k, w] of it.m) if (w >= 8 && k.startsWith(t.s)) { score += w / 2; break; } }
    }
    if (it.kind === 'entry') {
      const e = it.e;
      if (pq.groups.length && !pq.groups.includes(e.g)) continue; // preguntan por árboles: solo árboles
      if (pq.notSub.includes(e.sub)) continue; // «seta» no es un liquen
      if (pq.groups.length) score += pq.terms.length ? 3 : 4;
      if (pq.soft.includes(e.g)) score += 3;
      if (pq.zones.length) { if ((e.r || []).some(z => pq.zones.includes(z))) { score += 3; } else if (score > 0) score -= 4; }
      // altitud: descarta lo que no llega y premia lo que vive sobre todo en ese rango
      if (pq.alt != null && e.alt) {
        const [lo, hi] = e.alt, span = Math.max(100, hi - lo);
        const mid = (lo + hi) / 2;
        if (pq.altCmp === 'min') { if (hi < pq.alt) continue; score += 10 * Math.min(1, (hi - Math.max(lo, pq.alt)) / span) + (mid >= pq.alt ? 4 : 0); why.push(`vive entre ${lo} y ${hi} m`); }
        else if (pq.altCmp === 'max') { if (lo > pq.alt) continue; score += 10 * Math.min(1, (Math.min(hi, pq.alt) - lo) / span) + (mid <= pq.alt ? 4 : 0); why.push(`vive entre ${lo} y ${hi} m`); }
        else { if (pq.alt < lo - 150 || pq.alt > hi + 150) continue; score += 3; }
      }
      // la zona donde estás (si la sabemos) cuenta un poco aunque no la nombres
      if (opts.here?.group && !pq.zones.length && (e.r || []).includes(opts.here.group)) { score += 2; why.push('en tu zona'); }
    } else if (pq.groups.length && !pq.terms.length) score = 0;
    else if (pq.groups.length) score *= 0.5; // preguntan por un ser vivo o una roca: lo demás, menos
    if (pq.intent === 'nombre') score *= it.kind === 'topo' ? 2.5 : 0.4;
    if (pq.intent === 'huella' && it.kind === 'entry') score += it.e.trk || it.e.scat ? 4 : -4;
    if (score > 0) res.push({ ...it, score, why: [...new Set(why)] });
  }
  res.sort((a, b) => b.score - a.score);
  // quitar resultados muy por debajo del mejor
  const top = res[0]?.score || 0;
  // si hay una coincidencia clara, no rellenar con resultados flojos
  return { pq, results: res.filter(r => r.score >= Math.max(2, top * (top >= 12 ? 0.5 : 0.25))).slice(0, 60) };
}

// ---------- Filtro por rasgos (pestaña Especies/Rocas) ----------
// sel: { clave: Set(valores) } → la ficha encaja si tiene al menos uno de los valores elegidos de CADA clave
export function matchTraits(e, sel) {
  let ok = 0, total = 0;
  for (const [k, vals] of Object.entries(sel)) {
    if (!vals.size) continue;
    total++;
    const have = [].concat(e.t?.[k] || []);
    if (have.some(v => vals.has(v))) ok++;
  }
  return { ok, total };
}
