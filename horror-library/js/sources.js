// Online metadata sources. All calls run from the browser.
//   Wikidata + Wikipedia: no key needed. Good coverage, plots from Wikipedia.
//   TMDB: free API key. Best coverage, posters, cast, runtime.
window.HL = window.HL || {};

HL.Sources = (function () {
  const WD = 'https://query.wikidata.org/sparql';
  const WP = 'https://en.wikipedia.org';
  const TMDB = 'https://api.themoviedb.org/3';
  const IMG = 'https://image.tmdb.org/t/p/';

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const yearOf = (d) => (d ? parseInt(String(d).slice(0, 4), 10) || null : null);

  async function getJSON(url, opts, tries = 3) {
    let last;
    for (let i = 0; i < tries; i++) {
      try {
        const r = await fetch(url, opts);
        if (r.status === 429 || r.status >= 500) throw new Error('HTTP ' + r.status);
        if (!r.ok) {
          const e = new Error('HTTP ' + r.status);
          e.fatal = true;
          throw e;
        }
        return await r.json();
      } catch (e) {
        last = e;
        if (e.fatal) break;
        await sleep(800 * (i + 1) * (i + 1));
      }
    }
    throw last;
  }

  // ---------- Wikidata ----------
  async function sparql(q) {
    const url = WD + '?format=json&query=' + encodeURIComponent(q);
    const j = await getJSON(url, { headers: { Accept: 'application/sparql-results+json' } });
    return j.results.bindings;
  }

  function wdChunks(fromYear, toYear) {
    const out = [];
    let y = fromYear;
    while (y <= toYear) {
      const span = y < 1950 ? 15 : y < 1980 ? 5 : y < 2000 ? 3 : 1;
      out.push([y, Math.min(toYear, y + span - 1)]);
      y += span;
    }
    return out;
  }

  function wdBulkQuery(a, b) {
    return `SELECT ?film (SAMPLE(?l) AS ?label) (MIN(YEAR(?date)) AS ?year) (SAMPLE(?imdb) AS ?imdbId)
 (SAMPLE(?article) AS ?wiki) (GROUP_CONCAT(DISTINCT ?dirName; separator="|") AS ?dirs) WHERE {
  ?film wdt:P31 wd:Q11424 ; wdt:P136 ?g . ?g wdt:P279* wd:Q200092 .
  ?film wdt:P577 ?date . FILTER(YEAR(?date) >= ${a} && YEAR(?date) <= ${b})
  ?film rdfs:label ?l . FILTER(LANG(?l) = "en")
  OPTIONAL { ?film wdt:P345 ?imdb }
  OPTIONAL { ?film wdt:P57 ?dir . ?dir rdfs:label ?dirName . FILTER(LANG(?dirName) = "en") }
  OPTIONAL { ?article schema:about ?film ; schema:isPartOf <https://en.wikipedia.org/> . }
} GROUP BY ?film`;
  }

  function wikiTitleFromUrl(u) {
    if (!u) return '';
    return decodeURIComponent(u.split('/wiki/')[1] || '').replace(/_/g, ' ');
  }

  // Pulls every film Wikidata tags as horror (or any horror subgenre). onBatch receives arrays of records.
  async function wikidataBulk({ fromYear = 1895, toYear = new Date().getFullYear(), onBatch, onProgress, signal }) {
    const chunks = wdChunks(fromYear, toYear);
    let total = 0;
    for (let i = 0; i < chunks.length; i++) {
      if (signal && signal.aborted) break;
      const [a, b] = chunks[i];
      onProgress && onProgress({ done: i, of: chunks.length, label: `${a}${a !== b ? '-' + b : ''}`, total });
      let rows = [];
      try {
        rows = await sparql(wdBulkQuery(a, b));
      } catch (e) {
        onProgress && onProgress({ done: i, of: chunks.length, label: `${a}-${b} failed (${e.message}), skipping`, total, error: true });
        continue;
      }
      const recs = rows.map((r) => ({
        title: r.label.value,
        year: r.year ? parseInt(r.year.value, 10) : null,
        wikidataId: r.film.value.split('/').pop(),
        imdbId: r.imdbId ? r.imdbId.value : '',
        wikiTitle: r.wiki ? wikiTitleFromUrl(r.wiki.value) : '',
        directors: r.dirs && r.dirs.value ? r.dirs.value.split('|') : [],
        source: 'wikidata'
      })).filter((r) => r.title && !/^Q\d+$/.test(r.title));
      total += recs.length;
      await onBatch(recs);
      await sleep(300);
    }
    onProgress && onProgress({ done: chunks.length, of: chunks.length, label: 'Done', total });
    return total;
  }

  async function wikidataDetails(qid) {
    if (!/^Q\d+$/.test(qid)) throw new Error('Bad Wikidata id');
    const lbl = (p, k) => `{ wd:${qid} wdt:${p} ?x . ?x rdfs:label ?v . FILTER(LANG(?v) = "en") BIND("${k}" AS ?k) }`;
    const q = `SELECT ?k ?v WHERE {
  ${lbl('P57', 'dir')} UNION ${lbl('P161', 'cast')} UNION ${lbl('P58', 'writer')} UNION
  ${lbl('P86', 'composer')} UNION ${lbl('P495', 'country')} UNION
  { wd:${qid} wdt:P345 ?v . BIND("imdb" AS ?k) } UNION
  { wd:${qid} wdt:P2047 ?rt . BIND("runtime" AS ?k) BIND(STR(?rt) AS ?v) }
}`;
    const rows = await sparql(q);
    const out = { directors: [], cast: [], writers: [], composers: [], countries: [] };
    for (const r of rows) {
      const k = r.k.value;
      const v = (r.v && r.v.value) || '';
      if (!v) continue;
      if (k === 'dir') out.directors.push(v);
      else if (k === 'cast') out.cast.push(v);
      else if (k === 'writer') out.writers.push(v);
      else if (k === 'composer') out.composers.push(v);
      else if (k === 'country') out.countries.push(v);
      else if (k === 'imdb') out.imdbId = v;
      else if (k === 'runtime') out.runtime = Math.round(parseFloat(v)) || null;
    }
    for (const key of ['directors', 'cast', 'writers', 'composers', 'countries']) out[key] = [...new Set(out[key])];
    out.cast = out.cast.slice(0, 15);
    return out;
  }

  // ---------- Wikipedia ----------
  async function wikiFindTitle(m) {
    const q = `${m.title} ${m.year || ''} film`;
    const url = `${WP}/w/api.php?action=query&list=search&format=json&origin=*&srlimit=5&srsearch=${encodeURIComponent(q)}`;
    const j = await getJSON(url);
    const hits = (j.query && j.query.search) || [];
    const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const t = norm(m.title);
    const best = hits.find((h) => norm(h.title).startsWith(t) && /film/i.test(h.title + h.snippet)) ||
      hits.find((h) => norm(h.title).startsWith(t)) || hits[0];
    return best ? best.title : '';
  }

  async function wikipediaDetails(m) {
    const title = m.wikiTitle || (await wikiFindTitle(m));
    if (!title) throw new Error('No Wikipedia article found');
    const sum = await getJSON(`${WP}/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`);
    const out = {
      wikiTitle: sum.title || title,
      overview: sum.extract || '',
      wikidataId: sum.wikibase_item || m.wikidataId || '',
      poster: (sum.originalimage && sum.originalimage.source) || (sum.thumbnail && sum.thumbnail.source) || ''
    };
    try {
      const ex = await getJSON(`${WP}/w/api.php?action=query&prop=extracts&explaintext=1&exsectionformat=wiki&format=json&origin=*&titles=${encodeURIComponent(out.wikiTitle)}`);
      const page = Object.values(ex.query.pages)[0];
      const text = page.extract || '';
      const match = text.match(/\n==\s*(Plot|Synopsis|Premise)\s*==\n([\s\S]*?)(\n==[^=]|$)/);
      if (match) out.plot = match[2].trim();
    } catch (e) { /* plot is optional */ }
    return out;
  }

  // ---------- TMDB ----------
  function tmdbFetch(path, key, params = {}) {
    const isBearer = key.startsWith('eyJ');
    const qs = new URLSearchParams(params);
    if (!isBearer) qs.set('api_key', key);
    const opts = isBearer ? { headers: { Authorization: 'Bearer ' + key, Accept: 'application/json' } } : {};
    return getJSON(`${TMDB}${path}?${qs}`, opts);
  }

  function tmdbBasic(r) {
    return {
      tmdbId: r.id,
      title: r.title,
      originalTitle: r.original_title !== r.title ? r.original_title : '',
      year: yearOf(r.release_date),
      overview: r.overview || '',
      poster: r.poster_path ? IMG + 'w342' + r.poster_path : '',
      popularity: r.popularity || 0,
      tmdbRating: r.vote_average || null,
      language: r.original_language || '',
      source: 'tmdb'
    };
  }

  async function tmdbSearch(key, title, year) {
    const p = { query: title, include_adult: 'false' };
    if (year) p.year = year;
    const j = await tmdbFetch('/search/movie', key, p);
    return (j.results || []).map(tmdbBasic);
  }

  async function tmdbDetails(key, id) {
    const d = await tmdbFetch(`/movie/${id}`, key, { append_to_response: 'credits,keywords,external_ids' });
    const crew = (d.credits && d.credits.crew) || [];
    const byJob = (jobs) => [...new Set(crew.filter((c) => jobs.includes(c.job)).map((c) => c.name))];
    return Object.assign(tmdbBasic(d), {
      runtime: d.runtime || null,
      tagline: d.tagline || '',
      genres: (d.genres || []).map((g) => g.name),
      countries: (d.production_countries || []).map((c) => c.name),
      directors: byJob(['Director']),
      writers: byJob(['Screenplay', 'Writer', 'Story', 'Novel']),
      composers: byJob(['Original Music Composer', 'Music']),
      cast: ((d.credits && d.credits.cast) || []).slice(0, 15).map((c) => c.character ? `${c.name} (${c.character})` : c.name),
      keywords: ((d.keywords && d.keywords.keywords) || []).map((k) => k.name),
      imdbId: d.imdb_id || (d.external_ids && d.external_ids.imdb_id) || '',
      wikidataId: (d.external_ids && d.external_ids.wikidata_id) || '',
      backdrop: d.backdrop_path ? IMG + 'w780' + d.backdrop_path : ''
    });
  }

  async function tmdbTest(key) {
    await tmdbFetch('/configuration', key);
    return true;
  }

  // Every TMDB horror film, year by year (TMDB caps a single query at 500 pages).
  async function tmdbBulk({ key, fromYear = 1895, toYear = new Date().getFullYear(), minVotes = 5, onBatch, onProgress, signal }) {
    let total = 0;
    const years = [];
    for (let y = toYear; y >= fromYear; y--) years.push(y);
    for (let i = 0; i < years.length; i++) {
      if (signal && signal.aborted) break;
      const y = years[i];
      let page = 1, pages = 1;
      do {
        if (signal && signal.aborted) break;
        onProgress && onProgress({ done: i, of: years.length, label: `${y}, page ${page}/${pages}`, total });
        let j;
        try {
          j = await tmdbFetch('/discover/movie', key, {
            with_genres: '27', include_adult: 'false', sort_by: 'popularity.desc', page: String(page),
            'primary_release_date.gte': `${y}-01-01`, 'primary_release_date.lte': `${y}-12-31`,
            'vote_count.gte': String(minVotes)
          });
        } catch (e) {
          if (e.fatal) throw e;
          break;
        }
        pages = Math.min(500, j.total_pages || 1);
        const recs = (j.results || []).map(tmdbBasic);
        total += recs.length;
        await onBatch(recs);
        page++;
        await sleep(60);
      } while (page <= pages);
    }
    onProgress && onProgress({ done: years.length, of: years.length, label: 'Done', total });
    return total;
  }

  return { wikidataBulk, wikidataDetails, wikipediaDetails, wikiFindTitle, tmdbSearch, tmdbDetails, tmdbTest, tmdbBulk };
})();
