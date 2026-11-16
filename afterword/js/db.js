// Local storage: everything lives in IndexedDB on this device.

const DB_NAME = 'afterword';
const STORES = ['entries', 'conversations', 'checkins'];
let dbp;

function open() {
  if (!dbp) {
    dbp = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        for (const s of STORES) {
          if (!req.result.objectStoreNames.contains(s)) req.result.createObjectStore(s, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbp;
}

async function tx(store, mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const req = fn(t.objectStore(store));
    t.oncomplete = () => resolve(req?.result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

export const db = {
  all: async (store) => ((await tx(store, 'readonly', (s) => s.getAll())) || []).sort((a, b) => (b.createdAt || b.startedAt || 0) - (a.createdAt || a.startedAt || 0)),
  get: (store, id) => tx(store, 'readonly', (s) => s.get(id)),
  put: (store, value) => tx(store, 'readwrite', (s) => s.put(value)),
  del: (store, id) => tx(store, 'readwrite', (s) => s.delete(id)),
};

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// ---- settings (small, synchronous)
const KEY = 'afterword.settings';
export const DEFAULTS = {
  apiKey: '',
  name: '',
  grieving: '',
  about: '',
  style: 'balanced',
  lenses: { philosophy: true, mindfulness: true, horror: false, humor: false },
  voice: 'marin',
  model: 'gpt-realtime-2.1',
  sttModel: 'gpt-4o-transcribe',
  textModel: 'gpt-5.4-mini',
  remember: true,
  autoTranscribe: true,
  lastBackup: 0,
};

export function loadSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { ...DEFAULTS, ...raw, lenses: { ...DEFAULTS.lenses, ...(raw.lenses || {}) } };
  } catch {
    return structuredClone(DEFAULTS);
  }
}

export function saveSettings(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* private mode */ }
}
