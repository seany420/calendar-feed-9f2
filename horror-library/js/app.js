// Dread Ledger: app shell, state, and views.
(function () {
  const HLX = window.HL;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/^(the|a|an) /, '').replace(/[^a-z0-9]/g, '');
  const slug = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const today = () => new Date().toISOString().slice(0, 10);
  const has = (s) => !!(s && String(s).trim());
  const uid = () => Math.random().toString(36).slice(2, 10);
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } };

  // ---------- State ----------
  const S = HLX.state = {
    movies: new Map(),
    settings: null,
    idx: { key: new Map(), tmdb: new Map(), wd: new Map(), imdb: new Map(), title: new Map() }
  };

  const DEFAULT_SETTINGS = () => ({
    libraryName: 'Dread Ledger',
    authorName: '',
    authorBio: 'I\'m a clinical social worker in integrated primary care. I write about burnout, optimistic nihilism, and horror as a clinical lens.',
    blogName: '',
    showName: '',
    tmdbKey: '',
    template: JSON.parse(JSON.stringify(HLX.DEFAULT_QUESTIONS)),
    scoreDims: JSON.parse(JSON.stringify(HLX.DEFAULT_SCORES)),
    ranked: [],
    voice: Object.assign({}, HLX.DEFAULT_VOICE),
    seedVersion: 0,
    lastBackup: null,
    lastImport: null
  });

  function newMovie(f) {
    const now = Date.now();
    return Object.assign({
      id: '', title: '', originalTitle: '', year: null, directors: [], writers: [], composers: [], cast: [], countries: [],
      subgenres: [], keywords: [], runtime: null, overview: '', plot: '', tagline: '', poster: '', backdrop: '',
      tmdbId: null, imdbId: '', wikidataId: '', wikiTitle: '', popularity: 0, tmdbRating: null, language: '',
      source: 'manual', enrichedAt: null,
      status: 'unseen', rating: null, scores: {}, watchDates: [], lenses: [], lensNotes: {}, answers: {},
      critique: '', contentNotes: '', pipeline: 'none', publishedUrl: '', episode: '', personalNotes: '',
      createdAt: now, updatedAt: now
    }, f);
  }

  const keyOf = (m) => norm(m.title) + '|' + (m.year || '');

  function indexMovie(m) {
    const I = S.idx;
    I.key.set(keyOf(m), m.id);
    const t = norm(m.title);
    if (!I.title.has(t)) I.title.set(t, new Set());
    I.title.get(t).add(m.id);
    if (m.tmdbId) I.tmdb.set(String(m.tmdbId), m.id);
    if (m.wikidataId) I.wd.set(m.wikidataId, m.id);
    if (m.imdbId) I.imdb.set(m.imdbId, m.id);
  }

  function rebuildIndex() {
    S.idx = { key: new Map(), tmdb: new Map(), wd: new Map(), imdb: new Map(), title: new Map() };
    for (const m of S.movies.values()) indexMovie(m);
  }

  function findExisting(r) {
    const I = S.idx;
    if (r.tmdbId && I.tmdb.has(String(r.tmdbId))) return S.movies.get(I.tmdb.get(String(r.tmdbId)));
    if (r.wikidataId && I.wd.has(r.wikidataId)) return S.movies.get(I.wd.get(r.wikidataId));
    if (r.imdbId && I.imdb.has(r.imdbId)) return S.movies.get(I.imdb.get(r.imdbId));
    if (I.key.has(keyOf(r))) return S.movies.get(I.key.get(keyOf(r)));
    // Sources disagree on release year by 1 all the time.
    const same = I.title.get(norm(r.title));
    if (same && r.year) {
      for (const id of same) {
        const m = S.movies.get(id);
        if (m && m.year && Math.abs(m.year - r.year) <= 1) return m;
      }
    }
    return null;
  }

  const INFO_FIELDS = ['originalTitle', 'year', 'directors', 'writers', 'composers', 'cast', 'countries', 'keywords', 'runtime', 'overview', 'plot', 'tagline', 'poster', 'backdrop', 'tmdbId', 'imdbId', 'wikidataId', 'wikiTitle', 'popularity', 'tmdbRating', 'language'];

  // Fill in info fields. Never touches personal fields (status, answers, rating...).
  function applyInfo(m, r, overwrite) {
    for (const k of INFO_FIELDS) {
      const v = r[k];
      if (v == null || v === '' || (Array.isArray(v) && !v.length)) continue;
      const cur = m[k];
      const empty = cur == null || cur === '' || cur === 0 || (Array.isArray(cur) && !cur.length);
      if (overwrite || empty) m[k] = v;
    }
    if (r.subgenres && r.subgenres.length) m.subgenres = [...new Set([...(m.subgenres || []), ...r.subgenres])];
  }

  // Merge a batch of incoming records into the library. Returns {added, updated}.
  async function mergeRecords(recs) {
    const changed = [];
    let added = 0, updated = 0;
    for (const r of recs) {
      if (!r.title) continue;
      const ex = findExisting(r);
      if (ex) {
        applyInfo(ex, r, false);
        changed.push(ex);
        indexMovie(ex);
        updated++;
      } else {
        const id = r.tmdbId ? 'tmdb-' + r.tmdbId : r.wikidataId ? 'wd-' + r.wikidataId : 'm-' + slug(r.title) + '-' + (r.year || uid());
        const m = newMovie({ id: S.movies.has(id) ? id + '-' + uid() : id, title: r.title, source: r.source || 'manual' });
        applyInfo(m, r, true);
        S.movies.set(m.id, m);
        indexMovie(m);
        changed.push(m);
        added++;
      }
    }
    if (changed.length) await HLX.DB.putMany(changed);
    return { added, updated };
  }

  function parseSeed() {
    return HLX.SEED.trim().split('\n').map((line) => {
      const [title, year, dirs, subs] = line.split('|');
      return { title: title.trim(), year: parseInt(year, 10) || null, directors: dirs ? dirs.split(';').map((s) => s.trim()) : [], subgenres: subs ? subs.split(',').map((s) => s.trim()) : [], source: 'seed' };
    });
  }

  async function seedIfNeeded() {
    if ((S.settings.seedVersion || 0) >= HLX.SEED_VERSION) return;
    const recs = parseSeed();
    // Seed ids are stable so re-seeding never duplicates.
    const fresh = [];
    for (const r of recs) {
      if (findExisting(r)) continue;
      const m = newMovie(Object.assign({ id: 'seed-' + slug(r.title) + '-' + r.year }, r));
      S.movies.set(m.id, m);
      indexMovie(m);
      fresh.push(m);
    }
    if (fresh.length) await HLX.DB.putMany(fresh);
    S.settings.seedVersion = HLX.SEED_VERSION;
    await saveSettings();
  }

  const pendingSaves = new Map();
  const flushSaves = debounce(async () => {
    const list = [...pendingSaves.values()];
    pendingSaves.clear();
    if (list.length) await HLX.DB.putMany(list);
  }, 400);

  function saveMovie(m, quiet) {
    m.updatedAt = Date.now();
    S.movies.set(m.id, m);
    pendingSaves.set(m.id, m);
    flushSaves();
    if (!quiet) updateSavedIndicator();
  }

  function updateSavedIndicator() {
    const el = $('#savedAt');
    if (el) el.textContent = 'Saved ' + new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  async function saveSettings() {
    await HLX.DB.setMeta('settings', S.settings);
  }

  async function deleteMovie(id) {
    S.movies.delete(id);
    S.settings.ranked = S.settings.ranked.filter((x) => x !== id);
    await HLX.DB.del(id);
    await saveSettings();
    rebuildIndex();
  }

  // ---------- UI helpers ----------
  function toast(msg, ms = 2600) {
    const t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast.t);
    toast.t = setTimeout(() => { t.hidden = true; }, ms);
  }

  function openModal(html, opts = {}) {
    const m = $('#modal');
    m.innerHTML = `<div class="modal-box ${opts.wide ? 'wide' : ''}" role="dialog" aria-modal="true">${html}</div>`;
    m.hidden = false;
    const close = () => { m.hidden = true; m.innerHTML = ''; document.removeEventListener('keydown', onKey); opts.onClose && opts.onClose(); };
    const onKey = (e) => { if (e.key === 'Escape' && !opts.locked) close(); };
    document.addEventListener('keydown', onKey);
    m.onclick = (e) => { if (e.target === m && !opts.locked) close(); };
    $$('[data-close]', m).forEach((b) => (b.onclick = close));
    return { el: m.firstElementChild, close };
  }

  function confirmBox(msg, okLabel = 'Delete') {
    return new Promise((resolve) => {
      const { el, close } = openModal(`<p>${esc(msg)}</p><div class="row"><span class="spacer"></span><button data-close>Cancel</button><button class="btn-primary" id="okBtn">${esc(okLabel)}</button></div>`, { onClose: () => resolve(false) });
      $('#okBtn', el).onclick = () => { resolve(true); close(); };
    });
  }

  function download(name, text, type = 'text/plain') {
    const blob = new Blob([text], { type: type + ';charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); toast('Copied'); }
    catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast('Copied'); } catch (e2) { toast('Copy failed. Select and copy manually.'); }
      ta.remove();
    }
  }

  function hue(s) {
    let h = 0;
    for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return h;
  }

  function posterHtml(m, cls = 'poster') {
    if (m.poster) return `<img class="${cls}" src="${esc(m.poster)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.outerHTML='${esc(placeholder(m)).replace(/'/g, '&#39;')}'">`;
    return placeholder(m);
  }

  function placeholder(m) {
    const h = hue(m.title);
    const a = [350, 0, 270, 220, 20, 300][h % 6];
    const l = 12 + (h % 9);
    return `<div class="poster-ph" style="background:linear-gradient(160deg,hsl(${a} 45% ${l + 10}%),hsl(${a} 50% ${l}%) 60%,#070607)"><span>${esc(m.title)}</span><span style="font:500 12px var(--sans);opacity:.75;margin-top:4px">${esc(m.year || '')}</span></div>`;
  }

  const subLabel = (s) => HLX.SUBGENRES[s] || s;
  const rankOf = (id) => { const i = S.settings.ranked.indexOf(id); return i >= 0 ? i + 1 : null; };
  const answeredCount = (m) => S.settings.template.filter((q) => has(m.answers[q.id])).length;

  // ---------- Router ----------
  const routes = {};
  function parseHash() {
    const h = location.hash.replace(/^#\/?/, '');
    const [path, qs] = h.split('?');
    const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
    return { name: parts[0] || 'library', args: parts.slice(1), q: new URLSearchParams(qs || '') };
  }

  function render() {
    const r = parseHash();
    $$('#nav a').forEach((a) => a.classList.toggle('active', a.dataset.nav === (r.name === 'm' ? 'library' : r.name === 'lens' ? 'lenses' : r.name)));
    const fn = routes[r.name] || routes.library;
    window.scrollTo(0, 0);
    fn(r);
    renderBanner();
  }

  function renderBanner() {
    const seen = [...S.movies.values()].filter((m) => m.status === 'seen' || answeredCount(m)).length;
    const last = S.settings.lastBackup;
    const stale = seen >= 3 && (!last || Date.now() - last > 14 * 864e5);
    $('#banner').innerHTML = stale ? `<div class="note"><span>Your writing lives in this browser only. ${last ? 'Last backup ' + new Date(last).toLocaleDateString() + '.' : 'No backup yet.'}</span><span class="spacer"></span><button class="btn-sm btn-primary" id="bannerBackup">Download backup</button></div>` : '';
    const b = $('#bannerBackup');
    if (b) b.onclick = backup;
  }

  // ---------- Library ----------
  const LIB_DEFAULT = { q: '', status: 'all', sub: '', decade: '', lens: '', sort: 'popular', view: 'grid', limit: 60 };
  let lib = Object.assign({}, LIB_DEFAULT, lsGet('dl-lib', {}), { limit: 60 });

  function filtered() {
    const q = norm(lib.q);
    const qRaw = lib.q.trim().toLowerCase();
    let out = [];
    for (const m of S.movies.values()) {
      if (lib.status === 'seen' && m.status !== 'seen') continue;
      if (lib.status === 'watchlist' && m.status !== 'watchlist') continue;
      if (lib.status === 'unseen' && m.status === 'seen') continue;
      if (lib.status === 'writing' && !(m.status === 'seen' && m.pipeline !== 'published')) continue;
      if (lib.status === 'unranked' && !(m.status === 'seen' && !rankOf(m.id))) continue;
      if (lib.sub && !(m.subgenres || []).includes(lib.sub)) continue;
      if (lib.decade && !(m.year && Math.floor(m.year / 10) * 10 === +lib.decade)) continue;
      if (lib.lens && !(m.lenses || []).includes(lib.lens)) continue;
      if (q) {
        const hay = norm(m.title) + ' ' + norm(m.originalTitle) + ' ' + (m.year || '');
        const people = [...(m.directors || []), ...(m.cast || [])].join(' ').toLowerCase();
        if (!hay.includes(q) && !people.includes(qRaw) && String(m.year) !== qRaw) continue;
      }
      out.push(m);
    }
    const t = (a, b) => norm(a.title).localeCompare(norm(b.title));
    const sorters = {
      popular: (a, b) => (b.status === 'seen') - (a.status === 'seen') || (b.popularity || 0) - (a.popularity || 0) || (a.source === 'seed' ? -1 : 0) - (b.source === 'seed' ? -1 : 0) || (b.year || 0) - (a.year || 0),
      title: t,
      newest: (a, b) => (b.year || 0) - (a.year || 0) || t(a, b),
      oldest: (a, b) => (a.year || 9999) - (b.year || 9999) || t(a, b),
      rating: (a, b) => (b.rating ?? -1) - (a.rating ?? -1) || t(a, b),
      rank: (a, b) => (rankOf(a.id) || 1e9) - (rankOf(b.id) || 1e9) || t(a, b),
      updated: (a, b) => b.updatedAt - a.updatedAt
    };
    out.sort(sorters[lib.sort] || sorters.popular);
    return out;
  }

  routes.library = function () {
    const decades = [...new Set([...S.movies.values()].map((m) => m.year && Math.floor(m.year / 10) * 10).filter(Boolean))].sort();
    const total = S.movies.size;
    const seen = [...S.movies.values()].filter((m) => m.status === 'seen').length;
    $('#main').innerHTML = `
      <div class="lib-head">
        <div><h1 style="margin:0">Library</h1><div class="muted small">${total.toLocaleString()} films. ${seen} seen. ${S.settings.ranked.length} ranked.</div></div>
        <div class="row">
          <button id="randomBtn" title="Pick something unseen from the current filter">Surprise me</button>
          <button class="btn-primary" id="addBtn">+ Add film</button>
        </div>
      </div>
      ${total < 1000 ? `<div class="card small" style="margin-bottom:14px">The starter list has ${total} essentials. To load every horror film on record (30,000+ titles), go to <a href="#/settings">Settings &gt; Import the full catalogue</a>.</div>` : ''}
      <div class="toolbar">
        <input class="search" id="q" type="search" placeholder="Search title, director, actor, year" value="${esc(lib.q)}">
        <select id="status">
          ${[['all', 'All films'], ['seen', 'Seen'], ['watchlist', 'Want to watch'], ['unseen', 'Not seen'], ['writing', 'Seen, not published'], ['unranked', 'Seen, not ranked']].map(([v, l]) => `<option value="${v}" ${lib.status === v ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
        <select id="sub"><option value="">All subgenres</option>${Object.entries(HLX.SUBGENRES).map(([k, v]) => `<option value="${k}" ${lib.sub === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
        <select id="decade"><option value="">All decades</option>${decades.map((d) => `<option value="${d}" ${+lib.decade === d ? 'selected' : ''}>${d}s</option>`).join('')}</select>
        <select id="lens"><option value="">All lenses</option>${HLX.LENSES.map((l) => `<option value="${l.id}" ${lib.lens === l.id ? 'selected' : ''}>${esc(l.name)}</option>`).join('')}</select>
        <select id="sort">${[['popular', 'Sort: Seen, then popular'], ['title', 'Title A-Z'], ['newest', 'Newest'], ['oldest', 'Oldest'], ['rating', 'My rating'], ['rank', 'My rank'], ['updated', 'Recently edited']].map(([v, l]) => `<option value="${v}" ${lib.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
        <button id="viewBtn" class="btn-ghost" title="Grid or list">${lib.view === 'grid' ? '☰ List' : '▦ Grid'}</button>
      </div>
      <div id="results"></div>`;
    const rerender = () => { lsSet('dl-lib', Object.assign({}, lib, { limit: undefined })); renderResults(); };
    $('#q').oninput = debounce((e) => { lib.q = e.target.value; lib.limit = 60; rerender(); }, 160);
    for (const id of ['status', 'sub', 'decade', 'lens', 'sort']) $('#' + id).onchange = (e) => { lib[id] = e.target.value; lib.limit = 60; rerender(); };
    $('#viewBtn').onclick = () => { lib.view = lib.view === 'grid' ? 'list' : 'grid'; routes.library(); };
    $('#addBtn').onclick = addFilmModal;
    $('#randomBtn').onclick = () => {
      const pool = filtered().filter((m) => m.status !== 'seen');
      if (!pool.length) return toast('Nothing unseen in this filter');
      location.hash = '#/m/' + encodeURIComponent(pool[Math.floor(Math.random() * pool.length)].id);
    };
    renderResults();
  };

  function renderResults() {
    const list = filtered();
    const shown = list.slice(0, lib.limit);
    const el = $('#results');
    if (!list.length) {
      el.innerHTML = `<div class="empty">No films match. <button id="addFromSearch" class="btn-sm">Add "${esc(lib.q || 'a film')}"</button></div>`;
      $('#addFromSearch').onclick = () => addFilmModal(lib.q);
      return;
    }
    const card = (m) => {
      const r = rankOf(m.id);
      return `<a class="mcard" href="#/m/${encodeURIComponent(m.id)}">
        ${posterHtml(m)}
        <div class="corner">${m.status === 'seen' ? '<span class="badge seen">Seen</span>' : m.status === 'watchlist' ? '<span class="badge watchlist">Watch</span>' : ''}${r ? `<span class="badge">#${r}</span>` : ''}</div>
        ${m.rating != null ? `<span class="rating">${m.rating}</span>` : ''}
        <div class="quick">
          ${m.status !== 'seen' ? `<button data-q="seen" data-id="${esc(m.id)}" title="Mark seen">✓ Seen</button>` : ''}
          ${m.status === 'unseen' ? `<button data-q="watchlist" data-id="${esc(m.id)}" title="Add to watchlist">+ List</button>` : ''}
        </div>
        <div class="meta"><div class="t">${esc(m.title)}</div><div class="s">${esc(m.year || '')}${m.directors && m.directors.length ? ' · ' + esc(m.directors[0]) : ''}</div></div>
      </a>`;
    };
    const row = (m) => {
      const r = rankOf(m.id);
      return `<a class="mrow" href="#/m/${encodeURIComponent(m.id)}">
        ${m.poster ? `<img class="thumb" src="${esc(m.poster)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : '<div class="thumb"></div>'}
        <div><div style="font-weight:600">${esc(m.title)} <span class="muted">(${esc(m.year || 'n.d.')})</span></div>
          <div class="muted small">${esc((m.directors || []).join(', '))}${m.subgenres && m.subgenres.length ? ' · ' + esc(m.subgenres.map(subLabel).join(', ')) : ''}</div></div>
        <div class="row" style="gap:6px">${m.status === 'seen' ? '<span class="badge seen">Seen</span>' : m.status === 'watchlist' ? '<span class="badge watchlist">Watch</span>' : ''}${r ? `<span class="badge">#${r}</span>` : ''}${m.rating != null ? `<strong>${m.rating}</strong>` : ''}</div>
      </a>`;
    };
    el.innerHTML = `<div class="muted small" style="margin-bottom:8px">Showing ${shown.length.toLocaleString()} of ${list.length.toLocaleString()}</div>
      ${lib.view === 'grid' ? `<div class="grid">${shown.map(card).join('')}</div>` : `<div class="list-view">${shown.map(row).join('')}</div>`}
      ${list.length > shown.length ? '<div class="more"><button id="moreBtn">Show more</button></div>' : ''}`;
    const more = $('#moreBtn');
    if (more) {
      more.onclick = () => { lib.limit += 120; renderResults(); };
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((ents) => { if (ents[0].isIntersecting) { io.disconnect(); lib.limit += 120; renderResults(); } }, { rootMargin: '400px' });
        io.observe(more);
      }
    }
    $$('.quick button', el).forEach((b) => (b.onclick = (e) => {
      e.preventDefault(); e.stopPropagation();
      const m = S.movies.get(b.dataset.id);
      setStatus(m, b.dataset.q);
      toast(b.dataset.q === 'seen' ? `Marked ${m.title} as seen` : `Added ${m.title} to your watchlist`);
      renderResults();
    }));
  }

  function setStatus(m, status) {
    m.status = status;
    if (status === 'seen') {
      if (!m.watchDates.length) m.watchDates.push(today());
    } else {
      S.settings.ranked = S.settings.ranked.filter((x) => x !== m.id);
      saveSettings();
    }
    saveMovie(m);
  }

  // ---------- Add film ----------
  function addFilmModal(prefill) {
    const { el, close } = openModal(`
      <h2>Add a film</h2>
      <div class="row"><input class="grow" id="afTitle" placeholder="Title" value="${esc(typeof prefill === 'string' ? prefill : '')}"><input id="afYear" placeholder="Year" style="width:90px" inputmode="numeric"></div>
      <div class="row" style="margin-top:10px"><button class="btn-primary" id="afSearch">Search online</button><button id="afManual">Add manually</button><span class="spacer"></span><button data-close class="btn-ghost">Close</button></div>
      <div id="afOut" class="search-results"></div>
      <p class="muted small" style="margin-top:12px">${S.settings.tmdbKey ? 'Searching TMDB.' : 'Searching Wikipedia. Add a free TMDB key in Settings for posters and better matches.'}</p>`);
    const out = $('#afOut', el);
    const title = () => $('#afTitle', el).value.trim();
    const year = () => parseInt($('#afYear', el).value, 10) || null;
    $('#afTitle', el).focus();
    $('#afTitle', el).onkeydown = (e) => { if (e.key === 'Enter') $('#afSearch', el).click(); };
    $('#afManual', el).onclick = async () => {
      if (!title()) return toast('Add a title first');
      const ex = findExisting({ title: title(), year: year() });
      if (ex) { close(); location.hash = '#/m/' + encodeURIComponent(ex.id); return toast('Already in your library'); }
      const m = newMovie({ id: 'm-' + slug(title()) + '-' + uid(), title: title(), year: year() });
      S.movies.set(m.id, m); indexMovie(m); await HLX.DB.put(m);
      close(); location.hash = '#/m/' + encodeURIComponent(m.id);
    };
    $('#afSearch', el).onclick = async () => {
      if (!title()) return toast('Add a title first');
      out.innerHTML = '<p class="muted">Searching...</p>';
      try {
        let results = [];
        if (S.settings.tmdbKey) {
          results = await HLX.Sources.tmdbSearch(S.settings.tmdbKey, title(), year());
        } else {
          const wt = await HLX.Sources.wikiFindTitle({ title: title(), year: year() });
          if (wt) {
            const d = await HLX.Sources.wikipediaDetails({ title: title(), year: year(), wikiTitle: wt });
            const yr = year() || parseInt((wt.match(/\((\d{4})/) || [])[1], 10) || parseInt(((d.overview || '').match(/\b(19|20)\d{2}\b/) || [])[0], 10) || null;
            results = [Object.assign({ title: wt.replace(/\s*\(.*film\)$/i, ''), year: yr, source: 'wikipedia' }, d)];
          }
        }
        if (!results.length) { out.innerHTML = '<p class="muted">No matches. Try another spelling or add it manually.</p>'; return; }
        out.innerHTML = results.slice(0, 10).map((r, i) => `<button data-i="${i}">${r.poster ? `<img src="${esc(r.poster)}" alt="" referrerpolicy="no-referrer">` : ''}<span><strong>${esc(r.title)}</strong> (${esc(r.year || '?')})<br><span class="muted small">${esc((r.overview || '').slice(0, 140))}${(r.overview || '').length > 140 ? '...' : ''}</span></span></button>`).join('');
        $$('button[data-i]', out).forEach((b) => (b.onclick = async () => {
          const r = results[+b.dataset.i];
          await mergeRecords([r]);
          const m = findExisting(r);
          close();
          location.hash = '#/m/' + encodeURIComponent(m.id);
        }));
      } catch (e) {
        out.innerHTML = `<p class="muted">Search failed (${esc(e.message)}). You can still add it manually.</p>`;
      }
    };
  }

  // ---------- Enrichment ----------
  async function enrich(m, opts = {}) {
    const key = S.settings.tmdbKey;
    let got = false;
    const errors = [];
    if (key) {
      try {
        let id = m.tmdbId;
        if (!id) {
          const res = await HLX.Sources.tmdbSearch(key, m.title, m.year);
          const pick = res.find((r) => norm(r.title) === norm(m.title) && (!m.year || Math.abs((r.year || 0) - m.year) <= 1)) || (m.year ? null : res[0]);
          if (pick) id = pick.tmdbId;
        }
        if (id) {
          const d = await HLX.Sources.tmdbDetails(key, id);
          applyInfo(m, d, !!opts.overwrite);
          if (!m.subgenres.length) m.subgenres = guessSubgenres(d.keywords || []);
          got = true;
        }
      } catch (e) { errors.push('TMDB: ' + e.message); }
    }
    try {
      const w = await HLX.Sources.wikipediaDetails(m);
      applyInfo(m, { wikiTitle: w.wikiTitle, plot: w.plot, wikidataId: w.wikidataId, overview: w.overview, poster: key ? '' : w.poster }, false);
      got = true;
    } catch (e) { errors.push('Wikipedia: ' + e.message); }
    if (m.wikidataId && (!m.directors.length || !m.cast.length || !m.runtime)) {
      try {
        const d = await HLX.Sources.wikidataDetails(m.wikidataId);
        applyInfo(m, d, false);
        got = true;
      } catch (e) { errors.push('Wikidata: ' + e.message); }
    }
    if (got) {
      m.enrichedAt = Date.now();
      rebuildIndex();
      saveMovie(m, true);
    }
    return { got, errors };
  }

  function guessSubgenres(keywords) {
    const k = keywords.join(' ').toLowerCase();
    const map = { slasher: 'slasher', 'serial killer': 'slasher', zombie: 'zombie', vampire: 'vampire', werewolf: 'werewolf', possession: 'possession', exorcism: 'possession', 'haunted house': 'haunted-house', ghost: 'supernatural', 'found footage': 'found-footage', 'body horror': 'body', 'folk horror': 'folk', cult: 'folk', witch: 'witchcraft', lovecraft: 'cosmic', cannibal: 'cannibal', 'home invasion': 'home-invasion', alien: 'sci-fi', monster: 'creature', creature: 'creature', satan: 'satanic', giallo: 'giallo', anthology: 'anthology', 'horror comedy': 'comedy', survival: 'survival' };
    return [...new Set(Object.entries(map).filter(([w]) => k.includes(w)).map(([, s]) => s))];
  }

  // ---------- Film page ----------
  routes.m = function (r) {
    const m = S.movies.get(r.args[0]);
    if (!m) { $('#main').innerHTML = '<div class="empty">That film isn\'t in the library anymore. <a href="#/">Back to the library</a></div>'; return; }
    const st = S.settings;
    const r0 = rankOf(m.id);
    const pct = Math.round(answeredCount(m) / Math.max(1, st.template.length) * 100);
    const facts = [
      ['Directed by', (m.directors || []).join(', ')], ['Written by', (m.writers || []).join(', ')], ['Starring', (m.cast || []).slice(0, 8).join(', ')],
      ['Runtime', m.runtime ? m.runtime + ' min' : ''], ['Country', (m.countries || []).join(', ')], ['Music', (m.composers || []).join(', ')],
      ['Original title', m.originalTitle], ['TMDB rating', m.tmdbRating ? m.tmdbRating.toFixed(1) + '/10' : '']
    ].filter((f) => has(f[1]));
    const links = [
      m.imdbId && `<a href="https://www.imdb.com/title/${esc(m.imdbId)}/" target="_blank" rel="noopener">IMDb</a>`,
      m.tmdbId && `<a href="https://www.themoviedb.org/movie/${esc(m.tmdbId)}" target="_blank" rel="noopener">TMDB</a>`,
      m.wikiTitle && `<a href="https://en.wikipedia.org/wiki/${encodeURIComponent(m.wikiTitle.replace(/ /g, '_'))}" target="_blank" rel="noopener">Wikipedia</a>`,
      `<a href="https://letterboxd.com/search/${encodeURIComponent(m.title + ' ' + (m.year || ''))}/" target="_blank" rel="noopener">Letterboxd</a>`,
      `<a href="https://www.justwatch.com/us/search?q=${encodeURIComponent(m.title)}" target="_blank" rel="noopener">Where to stream</a>`,
      `<a href="https://www.doesthedogdie.com/search?q=${encodeURIComponent(m.title)}" target="_blank" rel="noopener">Content warnings</a>`
    ].filter(Boolean).join(' · ');

    $('#main').innerHTML = `
      <div class="row" style="margin-bottom:12px"><a href="#/" class="muted small">← Library</a><span class="spacer"></span><span id="savedAt" class="muted small"></span></div>
      <div class="film-hero">
        <div>${posterHtml(m)}</div>
        <div>
          <h1>${esc(m.title)} <span class="muted" style="font-weight:500">${esc(m.year || '')}</span></h1>
          ${m.tagline ? `<p class="muted" style="font-style:italic">${esc(m.tagline)}</p>` : ''}
          <div class="chips" style="margin-bottom:8px">${(m.subgenres || []).map((s) => `<span class="chip">${esc(subLabel(s))}</span>`).join('')}</div>
          ${facts.length ? `<dl class="film-facts">${facts.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>` : '<p class="muted">No details yet.</p>'}
          ${m.overview ? `<p>${esc(m.overview)}</p>` : ''}
          ${m.plot ? `<details><summary class="muted">Full plot (spoilers)</summary><p class="plot small">${esc(m.plot)}</p></details>` : ''}
          <div class="small muted" style="margin:8px 0">${links}</div>
          <div class="row" style="margin-top:10px">
            <button id="enrichBtn">${m.enrichedAt ? '↻ Refresh details' : '⤓ Fetch details'}</button>
            <button id="editInfoBtn">Edit info</button>
            <button id="delBtn" class="btn-ghost btn-danger">Delete</button>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <h3>Status</h3>
          <div class="chips" id="statusChips">${[['unseen', 'Not seen'], ['watchlist', 'Want to watch'], ['seen', 'Seen']].map(([v, l]) => `<button class="chip ${m.status === v ? 'on' : ''}" data-v="${v}">${l}</button>`).join('')}</div>
          <div class="field" style="margin-top:14px">
            <label>Watched on</label>
            <div class="chips" id="dates">${(m.watchDates || []).map((d, i) => `<span class="chip on">${esc(d)} <button class="btn-ghost" style="border:0;padding:0 2px" data-di="${i}" aria-label="Remove date">×</button></span>`).join('')}</div>
            <div class="row" style="margin-top:6px"><input type="date" id="dateIn" value="${today()}" style="width:auto"><button class="btn-sm" id="addDate">+ Add watch</button></div>
          </div>
          <div class="field">
            <label>Writing pipeline</label>
            <select id="pipeline">${Object.entries(HLX.PIPELINE).map(([k, v]) => `<option value="${k}" ${m.pipeline === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
          </div>
          <div class="row">
            <div class="grow"><label>Published link</label><input id="pubUrl" value="${esc(m.publishedUrl)}" placeholder="https://..."></div>
            <div style="width:110px"><label>Episode #</label><input id="episode" value="${esc(m.episode)}"></div>
          </div>
        </div>
        <div class="card">
          <div class="row"><h3 style="margin:0">My rating</h3><span class="spacer"></span><span class="rating-big" id="ratingOut">${m.rating != null ? m.rating : '–'}</span><span class="muted">/10</span></div>
          <input type="range" id="rating" min="0" max="10" step="0.5" value="${m.rating != null ? m.rating : 5}" aria-label="Rating out of 10">
          <div class="row small" style="margin:4px 0 14px"><button class="btn-sm btn-ghost" id="clearRating">Clear</button><span class="spacer"></span>
            ${m.status === 'seen' ? (r0 ? `<span>Ranked <strong>#${r0}</strong> of ${st.ranked.length}</span><button class="btn-sm" id="rerankBtn">Re-place</button>` : '<button class="btn-sm btn-primary" id="rankBtn">Place in my rankings</button>') : '<span class="muted">Mark as seen to rank it</span>'}
          </div>
          ${st.scoreDims.map((d) => `<div class="score-row"><span class="small">${esc(d.label)}</span><div class="dots" data-score="${esc(d.id)}">${[1, 2, 3, 4, 5].map((n) => `<button class="${(m.scores[d.id] || 0) >= n ? 'on' : ''}" data-n="${n}">${n}</button>`).join('')}</div></div>`).join('')}
        </div>
      </div>

      <div class="section-title"><h2 style="margin:0">Lenses</h2><a class="small muted" href="#/lenses">What are these?</a></div>
      <div class="chips" id="lensChips">${HLX.LENSES.map((l) => `<button class="chip ${m.lenses.includes(l.id) ? 'on' : ''}" data-l="${l.id}" title="${esc(l.blurb)}">${esc(l.name)}</button>`).join('')}</div>
      <div id="lensBoxes">${lensBoxes(m)}</div>

      <div class="section-title"><h2 style="margin:0">The questions</h2><div style="min-width:160px"><div class="small muted" style="text-align:right" id="pctLabel">${answeredCount(m)}/${st.template.length} answered</div><div class="progress"><span id="pctBar" style="width:${pct}%"></span></div></div></div>
      <div id="qs">${st.template.map((q) => `
        <div class="q"><label for="q-${esc(q.id)}">${esc(q.label)}</label><div class="prompt">${esc(q.prompt)}</div>
        <textarea id="q-${esc(q.id)}" data-qid="${esc(q.id)}" rows="${q.id === 'verdict' ? 2 : 4}">${esc(m.answers[q.id] || '')}</textarea><div class="wc" data-wc="${esc(q.id)}">${HLX.Export.words(m.answers[q.id])} words</div></div>`).join('')}
      </div>

      <div class="q"><label for="critique" style="font:700 20px var(--serif)">Critique</label><div class="prompt">Free-form. The long version. Draft here.</div><textarea id="critique" rows="12">${esc(m.critique)}</textarea><div class="wc" data-wc="critique">${HLX.Export.words(m.critique)} words</div></div>
      <div class="grid-2">
        <div class="q"><label for="contentNotes">Content notes</label><textarea id="contentNotes" rows="3" placeholder="Self-harm, animal death, medical gore...">${esc(m.contentNotes)}</textarea></div>
        <div class="q"><label for="personalNotes">Private notes</label><div class="prompt">Never exported.</div><textarea id="personalNotes" rows="3">${esc(m.personalNotes)}</textarea></div>
      </div>

      <div class="sticky-actions row">
        <a class="btn btn-primary" href="#/studio?f=blog&m=${encodeURIComponent(m.id)}">Write it up</a>
        <a class="btn" href="#/studio?f=podcast&m=${encodeURIComponent(m.id)}">Podcast run sheet</a>
        <a class="btn" href="#/studio?f=prompt&m=${encodeURIComponent(m.id)}">Prompt for Claude</a>
        <span class="spacer"></span><button id="voiceBtn" class="btn-ghost">Voice check</button>
      </div>`;

    // Wiring
    $$('#statusChips .chip').forEach((b) => (b.onclick = () => { setStatus(m, b.dataset.v); routes.m(r); }));
    $('#addDate').onclick = () => { const v = $('#dateIn').value; if (v && !m.watchDates.includes(v)) { m.watchDates.push(v); m.watchDates.sort(); if (m.status !== 'seen') m.status = 'seen'; saveMovie(m); routes.m(r); } };
    $$('#dates [data-di]').forEach((b) => (b.onclick = () => { m.watchDates.splice(+b.dataset.di, 1); saveMovie(m); routes.m(r); }));
    $('#pipeline').onchange = (e) => { m.pipeline = e.target.value; saveMovie(m); };
    $('#pubUrl').oninput = debounce((e) => { m.publishedUrl = e.target.value.trim(); if (m.publishedUrl && m.pipeline !== 'published') { m.pipeline = 'published'; $('#pipeline').value = 'published'; } saveMovie(m); }, 400);
    $('#episode').oninput = debounce((e) => { m.episode = e.target.value; saveMovie(m); }, 400);
    $('#rating').oninput = (e) => { m.rating = parseFloat(e.target.value); $('#ratingOut').textContent = m.rating; if (m.status !== 'seen') { m.status = 'seen'; if (!m.watchDates.length) m.watchDates.push(today()); } saveMovie(m); };
    $('#clearRating').onclick = () => { m.rating = null; saveMovie(m); routes.m(r); };
    const rb = $('#rankBtn') || $('#rerankBtn');
    if (rb) rb.onclick = () => placeByComparison(m, () => routes.m(r));
    $$('.dots').forEach((d) => $$('button', d).forEach((b) => (b.onclick = () => {
      const k = d.dataset.score, n = +b.dataset.n;
      m.scores[k] = m.scores[k] === n ? n - 1 : n;
      $$('button', d).forEach((x) => x.classList.toggle('on', +x.dataset.n <= m.scores[k]));
      saveMovie(m);
    })));
    $$('#lensChips .chip').forEach((b) => (b.onclick = () => {
      const id = b.dataset.l;
      m.lenses = m.lenses.includes(id) ? m.lenses.filter((x) => x !== id) : [...m.lenses, id];
      b.classList.toggle('on');
      $('#lensBoxes').innerHTML = lensBoxes(m);
      wireLensNotes(m);
      saveMovie(m);
    }));
    wireLensNotes(m);
    const updPct = () => {
      const c = answeredCount(m);
      $('#pctLabel').textContent = `${c}/${st.template.length} answered`;
      $('#pctBar').style.width = Math.round(c / st.template.length * 100) + '%';
      if (c && m.pipeline === 'none') { m.pipeline = 'notes'; $('#pipeline').value = 'notes'; }
    };
    $$('#qs textarea').forEach((t) => (t.oninput = () => {
      m.answers[t.dataset.qid] = t.value;
      $(`[data-wc="${t.dataset.qid}"]`).textContent = HLX.Export.words(t.value) + ' words';
      updPct();
      saveMovie(m);
    }));
    $('#critique').oninput = (e) => { m.critique = e.target.value; $('[data-wc="critique"]').textContent = HLX.Export.words(m.critique) + ' words'; saveMovie(m); };
    $('#contentNotes').oninput = (e) => { m.contentNotes = e.target.value; saveMovie(m); };
    $('#personalNotes').oninput = (e) => { m.personalNotes = e.target.value; saveMovie(m); };
    $('#enrichBtn').onclick = async () => {
      const b = $('#enrichBtn');
      b.disabled = true; b.textContent = 'Fetching...';
      const res = await enrich(m, { overwrite: !!m.enrichedAt && !!S.settings.tmdbKey });
      if (res.got) { toast('Details updated'); routes.m(r); }
      else { b.disabled = false; b.textContent = '⤓ Fetch details'; toast('Couldn\'t fetch details. ' + (res.errors[0] || 'Check your connection.'), 5000); }
    };
    $('#editInfoBtn').onclick = () => editInfoModal(m, () => routes.m(r));
    $('#delBtn').onclick = async () => {
      const work = answeredCount(m) || has(m.critique);
      if (await confirmBox(`Delete ${m.title}?${work ? ' Your notes on it go too.' : ''}`)) { await deleteMovie(m.id); toast('Deleted'); location.hash = '#/'; }
    };
    $('#voiceBtn').onclick = () => {
      const text = [...st.template.map((q) => m.answers[q.id] || ''), m.critique, ...Object.values(m.lensNotes || {})].join('\n\n');
      voiceModal(text);
    };
    // Auto-fetch once for films that have never been enriched.
    if (!m.enrichedAt && !m.autoTried && navigator.onLine !== false) {
      m.autoTried = true;
      enrich(m).then((res) => { if (res.got && parseHash().args[0] === m.id) routes.m(r); });
    }
  };

  function lensBoxes(m) {
    return (m.lenses || []).map((id) => {
      const l = HLX.LENSES.find((x) => x.id === id);
      if (!l) return '';
      return `<div class="lens-box"><strong>${esc(l.name)}</strong><ul>${l.prompts.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
        <textarea data-lens="${l.id}" rows="3" placeholder="Notes through the ${esc(l.name.toLowerCase())} lens">${esc((m.lensNotes || {})[l.id] || '')}</textarea></div>`;
    }).join('');
  }

  function wireLensNotes(m) {
    $$('#lensBoxes textarea').forEach((t) => (t.oninput = () => { m.lensNotes = m.lensNotes || {}; m.lensNotes[t.dataset.lens] = t.value; saveMovie(m); }));
  }

  function editInfoModal(m, after) {
    const arr = (a) => (a || []).join('; ');
    const { el, close } = openModal(`
      <h2>Edit info</h2>
      <div class="row"><div class="grow"><label>Title</label><input id="eTitle" value="${esc(m.title)}"></div><div style="width:100px"><label>Year</label><input id="eYear" value="${esc(m.year || '')}" inputmode="numeric"></div><div style="width:100px"><label>Minutes</label><input id="eRuntime" value="${esc(m.runtime || '')}" inputmode="numeric"></div></div>
      <div class="field" style="margin-top:10px"><label>Directors <span class="muted small">(separate with ;)</span></label><input id="eDirectors" value="${esc(arr(m.directors))}"></div>
      <div class="field"><label>Writers</label><input id="eWriters" value="${esc(arr(m.writers))}"></div>
      <div class="field"><label>Cast</label><textarea id="eCast" rows="2">${esc(arr(m.cast))}</textarea></div>
      <div class="field"><label>Countries</label><input id="eCountries" value="${esc(arr(m.countries))}"></div>
      <div class="field"><label>Subgenres</label><div class="chips" id="eSubs">${Object.entries(HLX.SUBGENRES).map(([k, v]) => `<button class="chip ${(m.subgenres || []).includes(k) ? 'on' : ''}" data-s="${k}">${v}</button>`).join('')}</div></div>
      <div class="field"><label>Short synopsis</label><textarea id="eOverview" rows="3">${esc(m.overview)}</textarea></div>
      <div class="field"><label>Full plot</label><textarea id="ePlot" rows="5">${esc(m.plot)}</textarea></div>
      <div class="field"><label>Poster image URL</label><input id="ePoster" value="${esc(m.poster)}"></div>
      <div class="row"><div class="grow"><label>IMDb id</label><input id="eImdb" value="${esc(m.imdbId)}" placeholder="tt0000000"></div><div class="grow"><label>TMDB id</label><input id="eTmdb" value="${esc(m.tmdbId || '')}"></div></div>
      <div class="row" style="margin-top:14px"><span class="spacer"></span><button data-close>Cancel</button><button class="btn-primary" id="eSave">Save</button></div>`, { wide: true });
    $$('#eSubs .chip', el).forEach((b) => (b.onclick = () => b.classList.toggle('on')));
    $('#eSave', el).onclick = () => {
      const split = (id) => $(id, el).value.split(';').map((s) => s.trim()).filter(Boolean);
      const t = $('#eTitle', el).value.trim();
      if (!t) return toast('Title can\'t be empty');
      Object.assign(m, {
        title: t, year: parseInt($('#eYear', el).value, 10) || null, runtime: parseInt($('#eRuntime', el).value, 10) || null,
        directors: split('#eDirectors'), writers: split('#eWriters'), cast: split('#eCast'), countries: split('#eCountries'),
        subgenres: $$('#eSubs .chip.on', el).map((b) => b.dataset.s),
        overview: $('#eOverview', el).value.trim(), plot: $('#ePlot', el).value.trim(), poster: $('#ePoster', el).value.trim(),
        imdbId: $('#eImdb', el).value.trim(), tmdbId: parseInt($('#eTmdb', el).value, 10) || null
      });
      saveMovie(m); rebuildIndex(); close(); after && after();
    };
  }

  // ---------- Rankings ----------
  function placeByComparison(m, after) {
    const ranked = S.settings.ranked.filter((id) => id !== m.id && S.movies.has(id));
    if (!ranked.length) {
      S.settings.ranked = [m.id];
      saveSettings(); toast(`${m.title} is #1. Rank more to build the list.`); after && after();
      return;
    }
    let lo = 0, hi = ranked.length, steps = 0;
    const maxSteps = Math.ceil(Math.log2(ranked.length + 1));
    const { el, close } = openModal('<div id="vsBody"></div>', { wide: true });
    const finish = (pos) => {
      ranked.splice(pos, 0, m.id);
      S.settings.ranked = ranked;
      saveSettings();
      close();
      toast(`${m.title} placed at #${pos + 1} of ${ranked.length}`);
      after && after();
    };
    const ask = () => {
      if (lo >= hi) return finish(lo);
      const mid = Math.floor((lo + hi) / 2);
      const o = S.movies.get(ranked[mid]);
      steps++;
      $('#vsBody', el).innerHTML = `
        <div class="row"><h2 style="margin:0">Which one is better?</h2><span class="spacer"></span><span class="muted small">Question ${steps} of about ${maxSteps}</span></div>
        <p class="muted small">Go with your gut. You're placing <strong>${esc(m.title)}</strong> into ${ranked.length} ranked films.</p>
        <div class="versus">
          <button class="pick" id="pickNew">${posterHtml(m)}<strong>${esc(m.title)}</strong><span class="muted small">${esc(m.year || '')}${m.rating != null ? ' · ' + m.rating + '/10' : ''}</span></button>
          <div class="vs">vs</div>
          <button class="pick" id="pickOld">${posterHtml(o)}<strong>${esc(o.title)}</strong><span class="muted small">${esc(o.year || '')} · now #${mid + 1}${o.rating != null ? ' · ' + o.rating + '/10' : ''}</span></button>
        </div>
        <div class="row" style="margin-top:14px"><button data-close class="btn-ghost">Cancel</button><span class="spacer"></span><button id="pickBottom" class="btn-sm">Just put it at the bottom</button></div>`;
      $('#pickNew', el).onclick = () => { hi = mid; ask(); };
      $('#pickOld', el).onclick = () => { lo = mid + 1; ask(); };
      $('#pickBottom', el).onclick = () => finish(ranked.length);
      $$('[data-close]', el).forEach((b) => (b.onclick = close));
    };
    ask();
  }

  routes.rank = function () {
    const st = S.settings;
    st.ranked = st.ranked.filter((id) => S.movies.has(id));
    const ranked = st.ranked.map((id) => S.movies.get(id));
    const unranked = [...S.movies.values()].filter((m) => m.status === 'seen' && !st.ranked.includes(m.id)).sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    $('#main').innerHTML = `
      <div class="lib-head"><div><h1 style="margin:0">Rankings</h1><div class="muted small">${ranked.length} ranked. Drag to reorder, or use the arrows.</div></div>
        <div class="row"><button id="byRating">Sort by my rating</button><a class="btn" href="#/studio?f=ranked">Export list</a></div></div>
      ${unranked.length ? `<div class="card" style="margin-bottom:18px"><h3>Seen but not ranked (${unranked.length})</h3><p class="muted small">"Place" asks you a few head-to-head questions and slots the film in. About ${Math.max(1, Math.ceil(Math.log2(ranked.length + 1)))} questions each.</p>
        <div class="stack">${unranked.slice(0, 50).map((m) => `<div class="row"><span class="grow"><a href="#/m/${encodeURIComponent(m.id)}">${esc(m.title)}</a> <span class="muted">(${esc(m.year || '')})${m.rating != null ? ' · ' + m.rating + '/10' : ''}</span></span><button class="btn-sm btn-primary" data-place="${esc(m.id)}">Place</button><button class="btn-sm" data-bottom="${esc(m.id)}">Add to bottom</button></div>`).join('')}</div></div>` : ''}
      ${ranked.length ? `<ol class="rank-list" id="rankList">${ranked.map((m, i) => `
        <li class="rank-item" draggable="true" data-id="${esc(m.id)}">
          <span class="rank-num">${i + 1}</span>
          ${m.poster ? `<img class="thumb" src="${esc(m.poster)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : '<div class="thumb"></div>'}
          <div><a href="#/m/${encodeURIComponent(m.id)}" style="font-weight:600">${esc(m.title)}</a> <span class="muted small">(${esc(m.year || '')})</span>
            <div class="muted small">${m.rating != null ? m.rating + '/10' : 'unrated'}${has(m.answers.verdict) ? ' · ' + esc(m.answers.verdict.slice(0, 90)) : ''}</div></div>
          <div class="acts"><span class="handle" title="Drag">⋮⋮</span><button data-up="${i}" aria-label="Move up">↑</button><button data-down="${i}" aria-label="Move down">↓</button><button data-move="${i}" title="Move to position">#</button><button data-unrank="${i}" aria-label="Remove from ranking">×</button></div>
        </li>`).join('')}</ol>` : '<div class="empty">No rankings yet. Mark films as seen, then place them here.</div>'}`;
    const redo = () => { saveSettings(); routes.rank(); };
    $$('[data-place]').forEach((b) => (b.onclick = () => placeByComparison(S.movies.get(b.dataset.place), routes.rank)));
    $$('[data-bottom]').forEach((b) => (b.onclick = () => { st.ranked.push(b.dataset.bottom); redo(); }));
    $$('[data-up]').forEach((b) => (b.onclick = () => { const i = +b.dataset.up; if (i > 0) { [st.ranked[i - 1], st.ranked[i]] = [st.ranked[i], st.ranked[i - 1]]; redo(); } }));
    $$('[data-down]').forEach((b) => (b.onclick = () => { const i = +b.dataset.down; if (i < st.ranked.length - 1) { [st.ranked[i + 1], st.ranked[i]] = [st.ranked[i], st.ranked[i + 1]]; redo(); } }));
    $$('[data-unrank]').forEach((b) => (b.onclick = () => { st.ranked.splice(+b.dataset.unrank, 1); redo(); }));
    $$('[data-move]').forEach((b) => (b.onclick = () => {
      const i = +b.dataset.move;
      const to = parseInt(prompt(`Move to position (1 to ${st.ranked.length})`, i + 1), 10);
      if (!to || to < 1) return;
      const [id] = st.ranked.splice(i, 1);
      st.ranked.splice(Math.min(to - 1, st.ranked.length), 0, id);
      redo();
    }));
    $('#byRating').onclick = async () => {
      if (!await confirmBox('Re-sort all seen films by your rating? Ties keep their current order. Films without a rating go to the bottom.', 'Re-sort')) return;
      const seen = [...S.movies.values()].filter((m) => m.status === 'seen');
      const cur = (id) => { const i = st.ranked.indexOf(id); return i < 0 ? 1e9 : i; };
      st.ranked = seen.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1) || cur(a.id) - cur(b.id)).map((m) => m.id);
      redo();
    };
    const list = $('#rankList');
    if (list) {
      let dragId = null;
      $$('.rank-item', list).forEach((li) => {
        li.ondragstart = (e) => { dragId = li.dataset.id; li.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; };
        li.ondragend = () => li.classList.remove('dragging');
        li.ondragover = (e) => { e.preventDefault(); li.classList.add('over'); };
        li.ondragleave = () => li.classList.remove('over');
        li.ondrop = (e) => {
          e.preventDefault();
          li.classList.remove('over');
          if (!dragId || dragId === li.dataset.id) return;
          const from = st.ranked.indexOf(dragId);
          st.ranked.splice(from, 1);
          const to = st.ranked.indexOf(li.dataset.id);
          st.ranked.splice(from <= to ? to + 1 : to, 0, dragId);
          redo();
        };
      });
    }
  };

  // ---------- Studio ----------
  const FORMATS = [
    ['blog', 'Blog / Substack post', 'film'],
    ['essay', 'Essay scaffold', 'film'],
    ['podcast', 'Podcast run sheet + show notes', 'film'],
    ['social', 'Short posts', 'film'],
    ['prompt', 'Prompt for Claude (draft in my voice)', 'film'],
    ['theme', 'Theme compilation (book chapter seed)', 'lens'],
    ['ranked', 'Ranked list post', 'none'],
    ['catalogue', 'Everything I\'ve written (Markdown)', 'none']
  ];

  routes.studio = function (r) {
    const st = S.settings;
    const f = r.q.get('f') || 'blog';
    const fmt = FORMATS.find((x) => x[0] === f) || FORMATS[0];
    const candidates = [...S.movies.values()].filter((m) => m.status === 'seen' || answeredCount(m) || has(m.critique)).sort((a, b) => b.updatedAt - a.updatedAt);
    const mid = r.q.get('m') || (candidates[0] && candidates[0].id) || '';
    const lensId = r.q.get('l') || 'burnout';
    const opts = { spoilers: r.q.get('sp') !== '0', factbox: r.q.get('fb') !== '0', scores: r.q.get('sc') !== '0', show: st.showName };
    let text = '';
    let title = 'export';
    const m = S.movies.get(mid);
    if (fmt[2] === 'film') {
      if (m) {
        title = slug(m.title + '-' + (m.year || '')) + '-' + f;
        text = f === 'blog' ? HLX.Export.blog(m, opts) : f === 'essay' ? HLX.Export.essay(m) : f === 'podcast' ? HLX.Export.podcast(m, opts) : f === 'social' ? HLX.Export.social(m) : HLX.Export.aiPrompt(m, 'Substack essay');
      } else text = 'Mark a film as seen or answer some questions first.';
    } else if (f === 'theme') {
      const films = [...S.movies.values()].filter((x) => (x.lenses || []).includes(lensId));
      title = 'theme-' + lensId;
      text = films.length ? HLX.Export.theme(lensId, films) : `No films tagged with this lens yet. Tag films on their pages, then come back.`;
    } else if (f === 'ranked') {
      const n = parseInt(r.q.get('n'), 10) || 0;
      title = 'rankings';
      text = st.ranked.length ? HLX.Export.rankedList(n) : 'Rank some films first.';
    } else if (f === 'catalogue') {
      title = 'catalogue';
      text = HLX.Export.catalogueMd(candidates);
    }
    const setQ = (k, v) => { const q = new URLSearchParams(r.q); q.set(k, v); location.hash = '#/studio?' + q.toString(); };
    $('#main').innerHTML = `
      <h1>Studio</h1>
      <div class="studio">
        <div class="stack">
          <div class="field"><label>Format</label><select id="sFmt">${FORMATS.map(([k, l]) => `<option value="${k}" ${k === f ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
          ${fmt[2] === 'film' ? `<div class="field"><label>Film</label><select id="sFilm">${candidates.map((x) => `<option value="${esc(x.id)}" ${x.id === mid ? 'selected' : ''}>${esc(x.title)} (${esc(x.year || '')})${answeredCount(x) ? ` · ${answeredCount(x)} answers` : ''}</option>`).join('') || '<option>No films yet</option>'}</select></div>` : ''}
          ${fmt[2] === 'lens' ? `<div class="field"><label>Lens</label><select id="sLens">${HLX.LENSES.map((l) => `<option value="${l.id}" ${l.id === lensId ? 'selected' : ''}>${esc(l.name)} (${[...S.movies.values()].filter((x) => (x.lenses || []).includes(l.id)).length})</option>`).join('')}</select></div>` : ''}
          ${f === 'ranked' ? `<div class="field"><label>How many</label><select id="sN">${[0, 5, 10, 13, 25, 31, 50, 100].map((n) => `<option value="${n}" ${String(n) === (r.q.get('n') || '0') ? 'selected' : ''}>${n ? 'Top ' + n : 'All'}</option>`).join('')}</select></div>` : ''}
          ${f === 'blog' ? `<label><input type="checkbox" id="oSp" ${opts.spoilers ? 'checked' : ''}> Spoiler warning before the scene</label><label><input type="checkbox" id="oFb" ${opts.factbox ? 'checked' : ''}> Include film fact box</label><label><input type="checkbox" id="oSc" ${opts.scores ? 'checked' : ''}> Include scores</label>` : ''}
          ${m && fmt[2] === 'film' ? `<a class="btn" href="#/m/${encodeURIComponent(m.id)}">← Back to ${esc(m.title)}</a>` : ''}
          <div class="card"><h3>Voice check</h3><div id="vcSummary" class="small"></div><div class="issues" id="vcList"></div><button class="btn-sm" id="fixDash" style="margin-top:8px">Replace dashes with commas</button></div>
        </div>
        <div>
          <div class="row" style="margin-bottom:8px">
            <div class="tabs"><button class="btn-sm" id="tabEdit">Markdown</button><button class="btn-sm" id="tabPrev">Preview</button></div>
            <span class="spacer"></span>
            <button class="btn-sm btn-primary" id="cpMd">Copy</button>
            <button class="btn-sm" id="cpHtml">Copy as HTML</button>
            <button class="btn-sm" id="dlMd">.md</button>
            <button class="btn-sm" id="dlHtml">.html</button>
            <button class="btn-sm" id="dlTxt">.txt</button>
          </div>
          <textarea class="out" id="out">${esc(text)}</textarea>
          <div class="preview" id="prev" hidden></div>
          <p class="muted small">Edits here are a scratchpad and aren't saved back to the film. Copy or download when you're happy.</p>
        </div>
      </div>`;
    const out = $('#out');
    const runVoice = (first) => {
      if (f === 'prompt' && first === true) { $('#vcSummary').textContent = 'Skipped for prompts. Run it on the draft Claude gives back by pasting it here.'; $('#vcList').innerHTML = ''; return; }
      const issues = HLX.Export.voiceCheck(out.value, st.voice);
      const fix = issues.filter((i) => i.sev === 'fix').length;
      $('#vcSummary').innerHTML = issues.length ? `<strong style="color:var(--accent)">${fix} to fix</strong>, ${issues.length - fix} to consider.` : '<span style="color:var(--ok)">Clean.</span>';
      $('#vcList').innerHTML = issues.slice(0, 80).map((i) => `<div class="issue"><span class="sev ${i.sev}">${i.sev === 'fix' ? 'Fix' : 'Consider'}</span>${esc(i.label)}: <code>${esc(i.match.slice(0, 80))}</code></div>`).join('');
    };
    runVoice(true);
    out.oninput = debounce(runVoice, 300);
    $('#fixDash').onclick = () => { out.value = HLX.Export.fixDashes(out.value); runVoice(); };
    $('#tabEdit').onclick = () => { out.hidden = false; $('#prev').hidden = true; };
    $('#tabPrev').onclick = () => { $('#prev').innerHTML = HLX.Export.mdToHtml(out.value); out.hidden = true; $('#prev').hidden = false; };
    $('#cpMd').onclick = () => copy(out.value);
    $('#cpHtml').onclick = () => copy(HLX.Export.mdToHtml(out.value));
    $('#dlMd').onclick = () => download(title + '.md', out.value, 'text/markdown');
    $('#dlTxt').onclick = () => download(title + '.txt', out.value.replace(/^#+\s*/gm, '').replace(/\*\*?/g, ''));
    $('#dlHtml').onclick = () => download(title + '.html', HLX.Export.htmlDoc(title, out.value), 'text/html');
    $('#sFmt').onchange = (e) => setQ('f', e.target.value);
    if ($('#sFilm')) $('#sFilm').onchange = (e) => setQ('m', e.target.value);
    if ($('#sLens')) $('#sLens').onchange = (e) => setQ('l', e.target.value);
    if ($('#sN')) $('#sN').onchange = (e) => setQ('n', e.target.value);
    if ($('#oSp')) $('#oSp').onchange = (e) => setQ('sp', e.target.checked ? '1' : '0');
    if ($('#oFb')) $('#oFb').onchange = (e) => setQ('fb', e.target.checked ? '1' : '0');
    if ($('#oSc')) $('#oSc').onchange = (e) => setQ('sc', e.target.checked ? '1' : '0');
  };

  function voiceModal(text) {
    const issues = HLX.Export.voiceCheck(text, S.settings.voice);
    openModal(`<h2>Voice check</h2>${issues.length ? `<p>${issues.filter((i) => i.sev === 'fix').length} to fix, ${issues.filter((i) => i.sev !== 'fix').length} to consider.</p><div class="issues">${issues.map((i) => `<div class="issue"><span class="sev ${i.sev}">${i.sev === 'fix' ? 'Fix' : 'Consider'}</span>${esc(i.label)}: <code>${esc(i.match.slice(0, 80))}</code></div>`).join('')}</div>` : '<p style="color:var(--ok)">Clean. Nothing flagged.</p>'}<div class="row" style="margin-top:12px"><span class="spacer"></span><button data-close>Close</button></div>`);
  }

  // ---------- Lenses ----------
  routes.lenses = function () {
    const count = (id) => [...S.movies.values()].filter((m) => (m.lenses || []).includes(id)).length;
    $('#main').innerHTML = `
      <h1>Lenses</h1>
      <p class="muted" style="max-width:720px">Tag a film with a lens and its prompts show up on the film page. Each lens collects its films into a theme compilation you can pull into a chapter, a series, or a season of the podcast.</p>
      <div class="lens-grid">${HLX.LENSES.map((l) => `
        <div class="card lens-card"><h3>${esc(l.name)} <span class="muted small">${count(l.id)} films</span></h3><p class="small">${esc(l.blurb)}</p>
          <ul class="small muted" style="padding-left:18px">${l.prompts.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
          ${l.refs.length ? `<div class="refs">${l.refs.map(esc).join('<br>')}</div>` : ''}
          <div class="row" style="margin-top:10px"><a class="btn btn-sm" href="#/lens/${l.id}">Films</a><a class="btn btn-sm" href="#/studio?f=theme&l=${l.id}">Compile</a></div></div>`).join('')}</div>`;
  };

  routes.lens = function (r) {
    const l = HLX.LENSES.find((x) => x.id === r.args[0]);
    if (!l) return routes.lenses();
    lib = Object.assign({}, LIB_DEFAULT, { lens: l.id, sort: 'rank', view: lib.view });
    lsSet('dl-lib', lib);
    location.hash = '#/';
  };

  // ---------- Stats ----------
  routes.stats = function () {
    const all = [...S.movies.values()];
    const seen = all.filter((m) => m.status === 'seen');
    const rated = seen.filter((m) => m.rating != null);
    const avg = rated.length ? (rated.reduce((a, m) => a + m.rating, 0) / rated.length).toFixed(1) : '–';
    const words = all.reduce((a, m) => a + HLX.Export.words(Object.values(m.answers || {}).join(' ') + ' ' + (m.critique || '') + ' ' + Object.values(m.lensNotes || {}).join(' ')), 0);
    const pipe = Object.keys(HLX.PIPELINE).map((k) => [HLX.PIPELINE[k], seen.filter((m) => (m.pipeline || 'none') === k).length]);
    const tally = (arr) => { const t = new Map(); arr.forEach((x) => t.set(x, (t.get(x) || 0) + 1)); return [...t.entries()].sort((a, b) => b[1] - a[1]); };
    const byDecade = tally(seen.filter((m) => m.year).map((m) => Math.floor(m.year / 10) * 10 + 's')).sort((a, b) => a[0].localeCompare(b[0]));
    const bySub = tally(seen.flatMap((m) => (m.subgenres || []).map(subLabel))).slice(0, 12);
    const byLens = tally(seen.flatMap((m) => (m.lenses || []).map(HLX.Export.lensName))).slice(0, 12);
    const byDir = tally(seen.flatMap((m) => m.directors || [])).filter((x) => x[1] > 1).slice(0, 10);
    const byMonth = tally(seen.flatMap((m) => (m.watchDates || []).map((d) => d.slice(0, 7)))).sort((a, b) => a[0].localeCompare(b[0])).slice(-12);
    const ratingDist = tally(rated.map((m) => String(Math.floor(m.rating)))).sort((a, b) => +a[0] - +b[0]);
    const bars = (rows, label) => rows.length ? `<div class="card"><h3>${label}</h3><div class="bars">${rows.map(([k, n]) => { const max = Math.max(...rows.map((x) => x[1])); return `<div class="bar"><span>${esc(k)}</span><div class="track"><div class="fill" style="width:${(n / max) * 100}%"></div></div><span class="n">${n}</span></div>`; }).join('')}</div></div>` : '';
    const subTotals = tally(all.flatMap((m) => m.subgenres || []));
    const gaps = subTotals.map(([s, n]) => [subLabel(s), seen.filter((m) => (m.subgenres || []).includes(s)).length, n]).filter((x) => x[2] >= 5).sort((a, b) => a[1] / a[2] - b[1] / b[2]).slice(0, 6);
    $('#main').innerHTML = `
      <h1>Stats</h1>
      <div class="kpis">
        <div class="kpi"><div class="v">${seen.length}</div><div class="l">films seen of ${all.length.toLocaleString()}</div></div>
        <div class="kpi"><div class="v">${S.settings.ranked.length}</div><div class="l">ranked</div></div>
        <div class="kpi"><div class="v">${avg}</div><div class="l">average rating</div></div>
        <div class="kpi"><div class="v">${words.toLocaleString()}</div><div class="l">words written</div></div>
        <div class="kpi"><div class="v">${all.filter((m) => m.status === 'watchlist').length}</div><div class="l">on the watchlist</div></div>
      </div>
      <div class="grid-2">
        ${bars(pipe, 'Writing pipeline (seen films)')}
        ${bars(byMonth, 'Watched per month')}
        ${bars(ratingDist.map(([k, n]) => [k + '/10', n]), 'Rating spread')}
        ${bars(byDecade, 'Seen by decade')}
        ${bars(bySub, 'Seen by subgenre')}
        ${bars(byLens, 'Lenses you reach for')}
        ${bars(byDir, 'Directors you keep coming back to')}
        ${gaps.length ? `<div class="card"><h3>Blind spots</h3><p class="muted small">Subgenres where you've seen the smallest share of what's in the library.</p>${gaps.map(([l, s, n]) => `<div class="row small"><span class="grow">${esc(l)}</span><span class="muted">${s} of ${n}</span></div>`).join('')}</div>` : ''}
      </div>
      ${!seen.length ? '<div class="empty">Stats fill in as you mark films seen.</div>' : ''}`;
  };

  // ---------- Settings ----------
  routes.settings = function () {
    const st = S.settings;
    const counts = { all: S.movies.size, seen: [...S.movies.values()].filter((m) => m.status === 'seen').length };
    $('#main').innerHTML = `
      <h1>Settings</h1>
      <div class="card">
        <h2>Import the full catalogue</h2>
        <p>The library starts with ${HLX.SEED.trim().split('\n').length} essentials. Pull every horror film on record and the library grows to tens of thousands. Your ratings and notes are never touched by an import. Re-run any time to pick up new releases.</p>
        <div class="grid-2">
          <div><h3>Wikidata (no key)</h3><p class="small muted">Every film tagged horror or a horror subgenre. Title, year, director, IMDb link. Plots load from Wikipedia when you open a film. Takes a few minutes.</p><button class="btn-primary" id="impWd">Import from Wikidata</button></div>
          <div><h3>TMDB (free key)</h3><p class="small muted">Every film in TMDB's horror genre, with posters, synopsis, and popularity. Needs the key below. Takes 10 to 20 minutes.</p>
            <div class="row"><label class="small" style="margin:0">Min. votes</label><select id="minVotes" style="width:auto">${[0, 5, 20, 100].map((n) => `<option ${n === 5 ? 'selected' : ''}>${n}</option>`).join('')}</select><button class="btn-primary" id="impTmdb" ${st.tmdbKey ? '' : 'disabled'}>Import from TMDB</button></div></div>
        </div>
        <div class="row" style="margin-top:12px"><label class="small" style="margin:0">Years</label><input id="yFrom" value="1895" style="width:80px" inputmode="numeric"><span>to</span><input id="yTo" value="${new Date().getFullYear()}" style="width:80px" inputmode="numeric"></div>
        ${st.lastImport ? `<p class="small muted" style="margin-top:10px">Last import: ${esc(st.lastImport)}</p>` : ''}
      </div>

      <div class="card">
        <h2>TMDB key</h2>
        <p class="small">Free at <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener">themoviedb.org/settings/api</a>. Paste either the "API Key" or the "API Read Access Token". It stays in this browser.</p>
        <div class="row"><input class="grow" id="tmdbKey" value="${esc(st.tmdbKey)}" placeholder="TMDB API key or read access token" autocomplete="off"><button id="saveKey">Save and test</button></div>
        <div class="row" style="margin-top:10px"><button id="enrichSeen" ${st.tmdbKey ? '' : ''}>Fetch details for all seen and watchlist films</button><span class="small muted" id="enrichLog"></span></div>
      </div>

      <div class="card">
        <h2>Backup, export, import</h2>
        <p class="small">Everything lives in this browser's storage. Download a backup regularly and keep it somewhere synced (iCloud, Drive, Dropbox). ${st.lastBackup ? 'Last backup ' + new Date(st.lastBackup).toLocaleString() + '.' : 'No backup yet.'}</p>
        <div class="row">
          <button class="btn-primary" id="bkBtn">Download full backup (.json)</button>
          <button id="bkLite">Backup of my films only</button>
          <label class="btn" style="margin:0">Restore backup<input type="file" id="restore" accept=".json,application/json" hidden></label>
        </div>
        <div class="row" style="margin-top:10px">
          <button id="csvSeen">Spreadsheet of seen films (.csv)</button>
          <button id="csvAll">Spreadsheet of everything (.csv)</button>
          <button id="mdAll">All writing (.md)</button>
          <button id="lbOut">Letterboxd import file (.csv)</button>
        </div>
        <div class="row" style="margin-top:10px">
          <label class="btn" style="margin:0">Import from Letterboxd (.csv)<input type="file" id="lbIn" accept=".csv,text/csv" hidden></label>
          <span class="small muted">Use ratings.csv, diary.csv, or watched.csv from Letterboxd's data export. Marks films seen and converts 5-star ratings to /10.</span>
        </div>
      </div>

      <div class="card">
        <h2>About you</h2>
        <div class="grid-2">
          <div class="field"><label>Library name</label><input id="libName" value="${esc(st.libraryName)}"></div>
          <div class="field"><label>Your name</label><input id="authorName" value="${esc(st.authorName)}"></div>
          <div class="field"><label>Blog / Substack name</label><input id="blogName" value="${esc(st.blogName)}"></div>
          <div class="field"><label>Podcast name</label><input id="showName" value="${esc(st.showName)}"></div>
        </div>
        <div class="field"><label>Short bio (goes into the Claude prompt)</label><textarea id="authorBio" rows="2">${esc(st.authorBio)}</textarea></div>
      </div>

      <div class="card">
        <h2>Question template</h2>
        <p class="small muted">The questions every film gets. Rename, rewrite, reorder, add your own. Answers are stored by question, so editing a prompt keeps existing answers. Removing a question hides its answers (they come back if you restore defaults).</p>
        <div id="tpl">${st.template.map((q, i) => `<div class="tpl-row" data-i="${i}"><input data-k="label" value="${esc(q.label)}"><textarea data-k="prompt" rows="2">${esc(q.prompt)}</textarea><div class="row" style="gap:4px"><button class="btn-sm" data-up="${i}">↑</button><button class="btn-sm" data-down="${i}">↓</button><button class="btn-sm btn-danger" data-rm="${i}">×</button></div></div>`).join('')}</div>
        <div class="row"><button id="tplAdd">+ Add question</button><button id="tplReset" class="btn-ghost">Restore defaults</button></div>
        <h3 style="margin-top:20px">Score dimensions (1 to 5)</h3>
        <input id="scoreDims" value="${esc(st.scoreDims.map((d) => d.label).join(', '))}">
        <p class="small muted">Comma-separated. Renaming keeps scores only if the name maps to the same position.</p>
      </div>

      <div class="card">
        <h2>Voice rules</h2>
        <p class="small muted">Used by the voice checker and pasted into the Claude prompt.</p>
        <div class="field"><label>Banned words</label><textarea id="vWords" rows="2">${esc(st.voice.bannedWords)}</textarea></div>
        <div class="field"><label>Banned phrases</label><textarea id="vPhrases" rows="2">${esc(st.voice.bannedPhrases)}</textarea></div>
        <div class="chips" style="margin-bottom:12px">${[['checkEmDash', 'Flag em dashes'], ['checkParallelism', 'Flag negative parallelisms'], ['checkContractions', 'Suggest contractions'], ['checkNumbers', 'Suggest digits'], ['checkParagraphs', 'Flag long paragraphs']].map(([k, l]) => `<label class="chip ${st.voice[k] ? 'on' : ''}"><input type="checkbox" data-vk="${k}" ${st.voice[k] ? 'checked' : ''} hidden>${l}</label>`).join('')}</div>
        <div class="field"><label>Voice guide</label><textarea id="vGuide" rows="9">${esc(st.voice.guide)}</textarea></div>
      </div>

      <div class="card">
        <h2>Danger zone</h2>
        <p class="small muted">${counts.all.toLocaleString()} films in the library, ${counts.seen} seen.</p>
        <div class="row"><button id="pruneBtn">Remove films I haven't touched</button><button class="btn-danger" id="wipeBtn">Erase everything</button></div>
      </div>`;

    const saveNow = () => saveSettings().then(() => toast('Saved'));
    const bind = (id, fn) => { $(id).onchange = (e) => { fn(e.target.value); saveNow(); }; };
    bind('#libName', (v) => { st.libraryName = v || 'Dread Ledger'; applyBrand(); });
    bind('#authorName', (v) => (st.authorName = v));
    bind('#blogName', (v) => (st.blogName = v));
    bind('#showName', (v) => (st.showName = v));
    bind('#authorBio', (v) => (st.authorBio = v));
    bind('#vWords', (v) => (st.voice.bannedWords = v));
    bind('#vPhrases', (v) => (st.voice.bannedPhrases = v));
    bind('#vGuide', (v) => (st.voice.guide = v));
    $$('[data-vk]').forEach((c) => (c.onchange = () => { st.voice[c.dataset.vk] = c.checked; c.parentElement.classList.toggle('on', c.checked); saveNow(); }));
    bind('#scoreDims', (v) => {
      const labels = v.split(',').map((s) => s.trim()).filter(Boolean);
      st.scoreDims = labels.map((l, i) => {
        const ex = st.scoreDims.find((d) => d.label.toLowerCase() === l.toLowerCase());
        return ex || { id: (st.scoreDims[i] && st.scoreDims[i].id) || slug(l) || 's' + i, label: l };
      });
    });

    // Template editor
    $$('#tpl .tpl-row').forEach((row) => {
      const i = +row.dataset.i;
      $$('[data-k]', row).forEach((inp) => (inp.onchange = () => { st.template[i][inp.dataset.k] = inp.value; saveNow(); }));
    });
    $$('#tpl [data-up]').forEach((b) => (b.onclick = () => { const i = +b.dataset.up; if (i > 0) { [st.template[i - 1], st.template[i]] = [st.template[i], st.template[i - 1]]; saveSettings(); routes.settings(); } }));
    $$('#tpl [data-down]').forEach((b) => (b.onclick = () => { const i = +b.dataset.down; if (i < st.template.length - 1) { [st.template[i + 1], st.template[i]] = [st.template[i], st.template[i + 1]]; saveSettings(); routes.settings(); } }));
    $$('#tpl [data-rm]').forEach((b) => (b.onclick = async () => { if (await confirmBox(`Remove "${st.template[+b.dataset.rm].label}"? Existing answers stay stored but hidden.`, 'Remove')) { st.template.splice(+b.dataset.rm, 1); saveSettings(); routes.settings(); } }));
    $('#tplAdd').onclick = () => { st.template.push({ id: 'c-' + uid(), label: 'New question', prompt: 'What do you want to ask every film?' }); saveSettings(); routes.settings(); };
    $('#tplReset').onclick = async () => {
      if (!await confirmBox('Restore the default questions? Custom questions are removed from the template (answers stay stored).', 'Restore')) return;
      st.template = JSON.parse(JSON.stringify(HLX.DEFAULT_QUESTIONS));
      saveSettings(); routes.settings();
    };

    // TMDB key
    $('#saveKey').onclick = async () => {
      const k = $('#tmdbKey').value.trim();
      st.tmdbKey = k;
      await saveSettings();
      if (!k) { toast('Key removed'); return routes.settings(); }
      try { await HLX.Sources.tmdbTest(k); toast('TMDB key works'); }
      catch (e) { toast('Saved, but TMDB rejected it (' + e.message + ')', 5000); }
      routes.settings();
    };
    $('#enrichSeen').onclick = async () => {
      const list = [...S.movies.values()].filter((m) => m.status !== 'unseen' && !m.enrichedAt);
      const log = $('#enrichLog');
      let ok = 0;
      for (let i = 0; i < list.length; i++) {
        log.textContent = `${i + 1}/${list.length}: ${list[i].title}`;
        const r = await enrich(list[i]);
        if (r.got) ok++;
      }
      log.textContent = list.length ? `Done. Updated ${ok} of ${list.length}.` : 'Nothing to fetch. Seen and watchlist films already have details.';
    };

    // Imports
    const years = () => [parseInt($('#yFrom').value, 10) || 1895, parseInt($('#yTo').value, 10) || new Date().getFullYear()];
    $('#impWd').onclick = () => { const [a, b] = years(); runImport('Wikidata', (h) => HLX.Sources.wikidataBulk(Object.assign({ fromYear: a, toYear: b }, h))); };
    $('#impTmdb').onclick = () => { const [a, b] = years(); runImport('TMDB', (h) => HLX.Sources.tmdbBulk(Object.assign({ key: st.tmdbKey, fromYear: a, toYear: b, minVotes: +$('#minVotes').value }, h))); };

    // Backups and files
    $('#bkBtn').onclick = backup;
    $('#bkLite').onclick = () => backup(true);
    $('#restore').onchange = (e) => e.target.files[0] && restore(e.target.files[0]);
    const seenList = () => [...S.movies.values()].filter((m) => m.status === 'seen');
    $('#csvSeen').onclick = () => download(`horror-seen-${today()}.csv`, HLX.Export.csv(seenList()), 'text/csv');
    $('#csvAll').onclick = () => download(`horror-all-${today()}.csv`, HLX.Export.csv([...S.movies.values()]), 'text/csv');
    $('#mdAll').onclick = () => download(`horror-writing-${today()}.md`, HLX.Export.catalogueMd([...S.movies.values()].filter((m) => answeredCount(m) || has(m.critique))), 'text/markdown');
    $('#lbOut').onclick = () => download(`letterboxd-import-${today()}.csv`, HLX.Export.letterboxdCsv([...S.movies.values()]), 'text/csv');
    $('#lbIn').onchange = (e) => e.target.files[0] && importLetterboxd(e.target.files[0]);

    $('#pruneBtn').onclick = async () => {
      const untouched = [...S.movies.values()].filter((m) => m.status === 'unseen' && !answeredCount(m) && !has(m.critique) && m.rating == null && m.source !== 'seed');
      if (!untouched.length) return toast('Nothing to remove');
      if (!await confirmBox(`Remove ${untouched.length.toLocaleString()} imported films you haven't seen, rated, or written about? You can re-import them later.`, 'Remove')) return;
      for (const m of untouched) S.movies.delete(m.id);
      await HLX.DB.clearMovies();
      await HLX.DB.putMany([...S.movies.values()]);
      rebuildIndex();
      toast(`Removed ${untouched.length.toLocaleString()}`);
      routes.settings();
    };
    $('#wipeBtn').onclick = async () => {
      if (!await confirmBox('Erase every film, rating, ranking, and note in this browser? Download a backup first. This can\'t be undone.', 'Erase everything')) return;
      await HLX.DB.clearMovies();
      S.movies.clear();
      const keepKey = st.tmdbKey;
      S.settings = Object.assign(DEFAULT_SETTINGS(), { tmdbKey: keepKey });
      await saveSettings();
      rebuildIndex();
      await seedIfNeeded();
      toast('Erased. Starter list restored.');
      location.hash = '#/';
    };
  };

  function runImport(label, start) {
    const ctrl = new AbortController();
    let added = 0, updated = 0;
    const { el, close } = openModal(`<h2>Importing from ${esc(label)}</h2>
      <div class="progress" style="margin:10px 0"><span id="ipBar" style="width:0%"></span></div>
      <div id="ipStatus">Starting...</div><div class="progress-log" id="ipLog"></div>
      <p class="small muted">Keep this tab open. You can stop any time; whatever has loaded stays.</p>
      <div class="row"><span class="spacer"></span><button id="ipStop">Stop</button></div>`, { locked: true });
    const log = (s) => { const l = $('#ipLog', el); l.textContent += s + '\n'; l.scrollTop = l.scrollHeight; };
    $('#ipStop', el).onclick = () => { ctrl.abort(); $('#ipStop', el).textContent = 'Stopping...'; };
    start({
      signal: ctrl.signal,
      onBatch: async (recs) => { const r = await mergeRecords(recs); added += r.added; updated += r.updated; },
      onProgress: (p) => {
        $('#ipBar', el).style.width = Math.round((p.done / p.of) * 100) + '%';
        $('#ipStatus', el).textContent = `${p.label}. ${added.toLocaleString()} new, ${updated.toLocaleString()} matched.`;
        if (p.error) log(p.label);
      }
    }).then(async () => {
      S.settings.lastImport = `${label}, ${new Date().toLocaleString()}: ${added.toLocaleString()} new, ${updated.toLocaleString()} updated`;
      await saveSettings();
      $('#ipStatus', el).textContent = `Done. ${added.toLocaleString()} new films, ${updated.toLocaleString()} matched to existing.`;
    }).catch((e) => {
      log('Stopped: ' + e.message);
      $('#ipStatus', el).textContent = `Stopped. ${added.toLocaleString()} new films loaded before the error.`;
    }).finally(() => {
      const b = $('#ipStop', el);
      b.textContent = 'Close';
      b.onclick = () => { close(); routes.settings(); };
    });
  }

  async function backup(liteOrEvent) {
    const lite = liteOrEvent === true;
    const movies = [...S.movies.values()].filter((m) => !lite || m.status !== 'unseen' || answeredCount(m) || has(m.critique) || m.rating != null);
    const data = { app: 'dread-ledger', version: 1, exportedAt: new Date().toISOString(), settings: S.settings, movies };
    download(`dread-ledger-${lite ? 'my-films' : 'backup'}-${today()}.json`, JSON.stringify(data), 'application/json');
    S.settings.lastBackup = Date.now();
    await saveSettings();
    renderBanner();
  }

  async function restore(file) {
    let data;
    try { data = JSON.parse(await file.text()); } catch (e) { return toast('That file isn\'t valid JSON'); }
    if (!data || !Array.isArray(data.movies)) return toast('That doesn\'t look like a Dread Ledger backup');
    const { el, close } = openModal(`<h2>Restore backup</h2><p>${data.movies.length.toLocaleString()} films from ${esc(data.exportedAt || 'unknown date')}.</p>
      <p class="small"><strong>Merge</strong> adds films from the backup and keeps the newer version when a film exists in both. <strong>Replace</strong> wipes this browser first.</p>
      <div class="row"><span class="spacer"></span><button data-close>Cancel</button><button id="rsMerge">Merge</button><button class="btn-primary" id="rsReplace">Replace</button></div>`);
    $('#rsMerge', el).onclick = async () => {
      let n = 0;
      for (const m of data.movies) {
        const cur = S.movies.get(m.id);
        if (!cur || (m.updatedAt || 0) > (cur.updatedAt || 0)) { S.movies.set(m.id, Object.assign(newMovie({}), m)); n++; }
      }
      await HLX.DB.putMany([...S.movies.values()]);
      if (data.settings && Array.isArray(data.settings.ranked)) {
        const seenIds = new Set(S.settings.ranked);
        for (const id of data.settings.ranked) if (!seenIds.has(id) && S.movies.has(id)) S.settings.ranked.push(id);
      }
      await saveSettings();
      rebuildIndex();
      close(); toast(`Merged. ${n} films added or updated.`); render();
    };
    $('#rsReplace', el).onclick = async () => {
      await HLX.DB.clearMovies();
      S.movies.clear();
      for (const m of data.movies) S.movies.set(m.id, Object.assign(newMovie({}), m));
      await HLX.DB.putMany([...S.movies.values()]);
      S.settings = Object.assign(DEFAULT_SETTINGS(), data.settings || {});
      await saveSettings();
      rebuildIndex();
      applyBrand();
      close(); toast('Restored'); render();
    };
  }

  async function importLetterboxd(file) {
    const rows = HLX.Export.parseCsv(await file.text());
    if (!rows.length || !('Name' in rows[0])) return toast('Expected a Letterboxd CSV with a Name column');
    let added = 0, matched = 0;
    for (const r of rows) {
      const rec = { title: r.Name.trim(), year: parseInt(r.Year, 10) || null, source: 'letterboxd' };
      let m = findExisting(rec);
      if (!m) { await mergeRecords([rec]); m = findExisting(rec); added++; } else matched++;
      if (!m) continue;
      m.status = 'seen';
      const d = r['Watched Date'] || r.Date;
      if (d && !m.watchDates.includes(d)) { m.watchDates.push(d); m.watchDates.sort(); }
      if (r.Rating && m.rating == null) m.rating = Math.round(parseFloat(r.Rating) * 2 * 2) / 2;
      if (r.Review && !has(m.critique)) m.critique = r.Review;
      saveMovie(m, true);
    }
    toast(`Letterboxd: ${matched} matched, ${added} added. All marked seen.`, 4000);
    routes.settings();
  }

  function applyBrand() {
    $('#brandName').textContent = S.settings.libraryName || 'Dread Ledger';
    document.title = S.settings.libraryName || 'Dread Ledger';
  }

  // ---------- Theme ----------
  function initTheme() {
    const saved = lsGet('dl-theme', null);
    if (saved) document.documentElement.dataset.theme = saved;
    $('#themeBtn').onclick = () => {
      const cur = document.documentElement.dataset.theme || 'dark';
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      lsSet('dl-theme', next);
    };
  }

  // ---------- Boot ----------
  async function init() {
    initTheme();
    try {
      await HLX.DB.open();
    } catch (e) {
      $('#main').innerHTML = `<div class="empty">This browser blocked local storage (${esc(e.message)}). Try a regular, non-private window.</div>`;
      return;
    }
    S.settings = Object.assign(DEFAULT_SETTINGS(), (await HLX.DB.getMeta('settings')) || {});
    S.settings.voice = Object.assign({}, HLX.DEFAULT_VOICE, S.settings.voice || {});
    for (const m of await HLX.DB.all()) S.movies.set(m.id, Object.assign(newMovie({}), m));
    rebuildIndex();
    await seedIfNeeded();
    applyBrand();
    window.addEventListener('hashchange', render);
    window.addEventListener('beforeunload', () => { if (pendingSaves.size) HLX.DB.putMany([...pendingSaves.values()]); });
    render();
  }

  init();
})();
