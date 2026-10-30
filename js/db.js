// Almacenamiento local (IndexedDB). Todo se queda en el móvil.
const DB_NAME = 'otero', VERSION = 1;
const STORES = ['panels', 'diary', 'measures', 'zones', 'kv'];
let dbp;

// Migraciones: MIGRATIONS[n] lleva la base de la versión n a la n+1. Solo añaden; nunca borran datos.
// Para cambiar la estructura: sube VERSION y añade aquí la función correspondiente.
const MIGRATIONS = [
  // 0 → 1: base inicial
  db => { for (const s of STORES) if (!db.objectStoreNames.contains(s)) db.createObjectStore(s, { keyPath: 'id' }); },
];

function open() {
  if (dbp) return dbp;
  dbp = new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, VERSION);
    r.onupgradeneeded = e => {
      const db = r.result;
      for (let v = e.oldVersion; v < VERSION; v++) MIGRATIONS[v]?.(db, r.transaction);
      // por si falta algún almacén (instalaciones antiguas a medias)
      for (const s of STORES) if (!db.objectStoreNames.contains(s)) db.createObjectStore(s, { keyPath: 'id' });
    };
    r.onsuccess = () => {
      const db = r.result;
      // Si otra pestaña abre una versión más nueva de la base, cerrar esta para no bloquearla
      db.onversionchange = () => { db.close(); dbp = null; };
      res(db);
    };
    r.onerror = () => { dbp = null; rej(r.error); };
    r.onblocked = () => console.warn('Base de datos bloqueada por otra pestaña de Otero');
  });
  return dbp;
}

async function tx(store, mode, fn) {
  const db = await open();
  return new Promise((res, rej) => {
    const t = db.transaction(store, mode);
    const s = t.objectStore(store);
    let out;
    const r = fn(s);
    if (r) r.onsuccess = () => { out = r.result; };
    t.oncomplete = () => res(out);
    t.onerror = () => rej(t.error);
    t.onabort = () => rej(t.error);
  });
}

export const db = {
  get: (store, id) => tx(store, 'readonly', s => s.get(id)),
  all: (store) => tx(store, 'readonly', s => s.getAll()),
  put: (store, obj) => tx(store, 'readwrite', s => s.put(obj)),
  del: (store, id) => tx(store, 'readwrite', s => s.delete(id)),
  clear: (store) => tx(store, 'readwrite', s => s.clear()),
  async getKV(k, def = null) { const r = await this.get('kv', k).catch(() => null); return r ? r.v : def; },
  setKV(k, v) { return this.put('kv', { id: k, v }); },
  STORES,
  VERSION,
};

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
