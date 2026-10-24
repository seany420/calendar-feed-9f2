// IndexedDB storage. Movies live in one store, settings in another.
window.HL = window.HL || {};

HL.DB = (function () {
  const NAME = 'dread-ledger';
  const VERSION = 1;
  let db = null;

  function req(r) {
    return new Promise((resolve, reject) => {
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  }

  function open() {
    return new Promise((resolve, reject) => {
      const r = indexedDB.open(NAME, VERSION);
      r.onupgradeneeded = () => {
        const d = r.result;
        if (!d.objectStoreNames.contains('movies')) d.createObjectStore('movies', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('meta')) d.createObjectStore('meta');
      };
      r.onsuccess = () => { db = r.result; resolve(db); };
      r.onerror = () => reject(r.error);
    });
  }

  function store(name, mode) {
    return db.transaction(name, mode).objectStore(name);
  }

  function done(tx) {
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  return {
    open,
    all: () => req(store('movies', 'readonly').getAll()),
    put: (m) => req(store('movies', 'readwrite').put(m)),
    del: (id) => req(store('movies', 'readwrite').delete(id)),
    async putMany(list) {
      const tx = db.transaction('movies', 'readwrite');
      const s = tx.objectStore('movies');
      for (const m of list) s.put(m);
      return done(tx);
    },
    async clearMovies() {
      const tx = db.transaction('movies', 'readwrite');
      tx.objectStore('movies').clear();
      return done(tx);
    },
    getMeta: (k) => req(store('meta', 'readonly').get(k)),
    setMeta: (k, v) => req(store('meta', 'readwrite').put(v, k))
  };
})();
