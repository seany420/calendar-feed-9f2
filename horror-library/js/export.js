// Turns structured answers into blog posts, essays, podcast run sheets, and data files.
// Also holds the voice checker and small CSV / Markdown helpers.
window.HL = window.HL || {};

HL.Export = (function () {
  const words = (s) => (s || '').trim().split(/\s+/).filter(Boolean).length;
  const has = (s) => !!(s && String(s).trim());
  const list = (a) => (a || []).filter(Boolean).join(', ');
  const stripChar = (s) => String(s).replace(/\s*\(.*\)$/, '');

  function ctx() {
    const S = HL.state;
    return { S, q: S.settings.template, scores: S.settings.scoreDims, ranked: S.settings.ranked };
  }

  function rankOf(m) {
    const r = HL.state.settings.ranked.indexOf(m.id);
    return r >= 0 ? r + 1 : null;
  }

  function lensName(id) {
    const l = HL.LENSES.find((x) => x.id === id);
    return l ? l.name : id;
  }

  function infoLine(m) {
    const bits = [];
    if (m.directors && m.directors.length) bits.push('Directed by ' + list(m.directors));
    if (m.year) bits.push(String(m.year));
    if (m.runtime) bits.push(m.runtime + ' min');
    if (m.countries && m.countries.length) bits.push(list(m.countries));
    return bits.join('. ');
  }

  function scoreLine(m) {
    const { scores } = ctx();
    const parts = scores.filter((d) => m.scores && m.scores[d.id]).map((d) => `${d.label} ${m.scores[d.id]}/5`);
    return parts.join(' | ');
  }

  function ratingLine(m) {
    const bits = [];
    if (m.rating != null) bits.push(`**My rating:** ${m.rating}/10`);
    const r = rankOf(m);
    if (r) bits.push(`**Rank:** #${r} of ${HL.state.settings.ranked.length}`);
    return bits.join('  \n');
  }

  function answer(m, id) {
    return (m.answers && m.answers[id]) || '';
  }

  // Questions that aren't part of the default set still need a home in exports.
  function customQuestions() {
    const known = new Set(HL.DEFAULT_QUESTIONS.map((q) => q.id));
    return ctx().q.filter((q) => !known.has(q.id));
  }

  function labelFor(id) {
    const q = ctx().q.find((x) => x.id === id);
    return q ? q.label : id;
  }

  function section(title, body, level = 2) {
    if (!has(body)) return '';
    return `${'#'.repeat(level)} ${title}\n\n${body.trim()}\n\n`;
  }

  function lensNotes(m) {
    let out = '';
    for (const id of m.lenses || []) {
      const note = (m.lensNotes || {})[id];
      if (has(note)) out += section(`Through the lens: ${lensName(id)}`, note, 3);
    }
    return out;
  }

  function refsFor(lensIds) {
    const refs = new Set();
    for (const id of lensIds) {
      const l = HL.LENSES.find((x) => x.id === id);
      if (l) l.refs.forEach((r) => refs.add(r));
    }
    return [...refs];
  }

  function factBox(m) {
    const rows = [
      ['Year', m.year], ['Director', list(m.directors)], ['Writers', list(m.writers)],
      ['Starring', list((m.cast || []).slice(0, 6).map(stripChar))], ['Runtime', m.runtime ? m.runtime + ' min' : ''],
      ['Country', list(m.countries)], ['Subgenre', list((m.subgenres || []).map((s) => HL.SUBGENRES[s] || s))]
    ].filter((r) => has(r[1]));
    if (!rows.length) return '';
    return '| | |\n|---|---|\n' + rows.map((r) => `| ${r[0]} | ${String(r[1]).replace(/\|/g, '/')} |`).join('\n') + '\n\n';
  }

  // ---------- Single-film formats ----------
  function blog(m, o = {}) {
    let md = `# ${m.title}${m.year ? ` (${m.year})` : ''}\n\n`;
    if (has(answer(m, 'verdict'))) md += `> ${answer(m, 'verdict').trim()}\n\n`;
    const info = infoLine(m);
    if (info) md += `*${info}.*\n\n`;
    if (o.ratings !== false) {
      const rl = ratingLine(m);
      if (rl) md += rl + '\n\n';
      const sl = scoreLine(m);
      if (sl && o.scores !== false) md += `*${sl}*\n\n`;
    }
    const order = ['gut', 'context', 'premise', 'monster', 'scene', 'coping', 'burnout', 'system', 'nihilism', 'room', 'craft', 'takeaway'];
    for (const id of order) {
      if (!o.spoilers && id === 'scene' && has(answer(m, id))) md += '*Spoilers below.*\n\n';
      md += section(labelFor(id), answer(m, id));
    }
    for (const q of customQuestions()) md += section(q.label, answer(m, q.id));
    md += lensNotes(m);
    md += section('Critique', m.critique);
    md += section(labelFor('warnings'), [answer(m, 'warnings'), m.contentNotes].filter(has).join('\n\n'));
    if (o.factbox !== false) md += section('The file', factBox(m));
    if (m.lenses && m.lenses.length) md += `*Filed under: ${m.lenses.map(lensName).join(', ')}.*\n`;
    return md.trim() + '\n';
  }

  function essay(m) {
    const T = (s, hint) => (has(s) ? s.trim() : `[TODO: ${hint}]`);
    const lens = (m.lenses || []).map(lensName);
    let md = `# ${m.title}${lens.length ? ` and ${lens[0].toLowerCase()}` : ''}\n\n`;
    md += `*Working title. ${m.title} (${m.year || 'n.d.'}), ${list(m.directors) || 'director unknown'}.*\n\n`;
    md += `## Opening scene\n\n${T(answer(m, 'gut'), 'open in the body. Where were you, what did your chest do?')}\n\n`;
    if (has(answer(m, 'context'))) md += `${answer(m, 'context').trim()}\n\n`;
    md += `## The claim\n\n${T(answer(m, 'monster'), 'what the monster really is, stated as a claim you can defend')}\n\n`;
    md += `## Evidence from the film\n\n${T(answer(m, 'scene'), 'the scene that proves the claim')}\n\n`;
    if (has(answer(m, 'coping'))) md += `${answer(m, 'coping').trim()}\n\n`;
    md += `## The clinical turn\n\n${T(answer(m, 'room'), 'bring it into the exam room')}\n\n`;
    if (has(answer(m, 'burnout'))) md += `${answer(m, 'burnout').trim()}\n\n`;
    if (has(answer(m, 'system'))) md += `${answer(m, 'system').trim()}\n\n`;
    md += lensNotes(m);
    md += `## What survives\n\n${T(answer(m, 'nihilism'), 'the optimistic nihilist turn: what meaning gets made anyway')}\n\n`;
    if (has(m.critique)) md += `## Critique\n\n${m.critique.trim()}\n\n`;
    md += `## Ending image\n\n${T(answer(m, 'takeaway') || answer(m, 'verdict'), 'end on a concrete image or a blunt binary')}\n\n`;
    const refs = refsFor(m.lenses || []);
    if (refs.length) md += `---\n\n**Sources to consider**\n\n${refs.map((r) => '- ' + r).join('\n')}\n`;
    return md.trim() + '\n';
  }

  function bullets(s) {
    if (!has(s)) return '';
    const parts = s.split(/\n+|(?<=[.!?])\s+(?=[A-Z0-9"'])/).map((x) => x.trim()).filter(Boolean);
    return parts.map((p) => '- ' + p).join('\n');
  }

  function podcast(m, o = {}) {
    const wpm = 150;
    const segs = [
      { t: 'Cold open', ids: ['verdict', 'gut'], min: 1 },
      { t: 'Intro and where I watched it', ids: ['context'], min: 2 },
      { t: 'The setup (spoiler-light)', ids: ['premise'], min: 2, facts: true },
      { t: 'Spoiler warning, then: the monster, really', ids: ['monster', 'scene'], min: 5 },
      { t: 'Clinical segment', ids: ['coping', 'room'], min: 5 },
      { t: 'Burnout and the system', ids: ['burnout', 'system'], min: 4 },
      { t: 'The optimistic nihilist turn', ids: ['nihilism'], min: 3 },
      { t: 'Craft talk', ids: ['craft'], min: 3, critique: true },
      { t: 'Rating, rank, and who should watch', ids: ['warnings'], min: 2, rating: true },
      { t: 'Take it home (outro)', ids: ['takeaway'], min: 1 }
    ];
    let md = `# Episode: ${m.title}${m.year ? ` (${m.year})` : ''}\n\n`;
    if (o.show) md += `*${o.show}*\n\n`;
    let clock = 0;
    let body = '';
    for (const s of segs) {
      let txt = s.ids.map((id) => answer(m, id)).filter(has).join('\n');
      let extra = '';
      if (s.facts) extra += `- Film file: ${infoLine(m) || 'add details'}\n` + (m.cast && m.cast.length ? `- Starring ${list(m.cast.slice(0, 4).map(stripChar))}\n` : '');
      if (s.critique && has(m.critique)) txt += '\n' + m.critique;
      if (s.rating) extra += (m.rating != null ? `- Rating reveal: ${m.rating}/10\n` : '') + (rankOf(m) ? `- Rank reveal: #${rankOf(m)} of ${HL.state.settings.ranked.length}\n` : '') + (scoreLine(m) ? `- Scores: ${scoreLine(m)}\n` : '');
      if (s.ids.includes('coping')) {
        for (const id of m.lenses || []) if (has((m.lensNotes || {})[id])) txt += `\n${lensName(id)}: ${m.lensNotes[id]}`;
      }
      const est = Math.max(s.min, Math.round(words(txt) / wpm * 1.6));
      const stamp = `${String(Math.floor(clock / 60)).padStart(2, '0')}:${String(clock % 60).padStart(2, '0')}`;
      body += `## [${stamp}] ${s.t} (~${est} min)\n\n${extra}${bullets(txt) || '- [TODO: talking points]'}\n\n`;
      clock += est;
    }
    md += `**Estimated runtime:** ~${clock} min\n\n${body}`;
    md += `---\n\n# Show notes\n\n`;
    md += `${has(answer(m, 'premise')) ? answer(m, 'premise').trim() + '\n\n' : ''}`;
    md += `**This episode:** ${m.title}${m.year ? ` (${m.year})` : ''}. ${infoLine(m)}\n\n`;
    if (m.lenses && m.lenses.length) md += `**Lenses:** ${m.lenses.map(lensName).join(', ')}\n\n`;
    if (has(answer(m, 'warnings')) || has(m.contentNotes)) md += `**Content notes:** ${[answer(m, 'warnings'), m.contentNotes].filter(has).join(' ')}\n\n`;
    const refs = refsFor(m.lenses || []);
    if (refs.length) md += `**Referenced:**\n\n${refs.map((r) => '- ' + r).join('\n')}\n\n`;
    md += `*If this episode stirred something up, call or text 988 (US) for the Suicide and Crisis Lifeline.*\n`;
    return md.trim() + '\n';
  }

  function social(m) {
    const out = [];
    const v = answer(m, 'verdict');
    if (has(v)) out.push(`${m.title} (${m.year}): ${v.trim()}`);
    const first = (s) => (has(s) ? s.trim().split(/(?<=[.!?])\s+/)[0] : '');
    for (const id of ['monster', 'burnout', 'nihilism', 'room', 'takeaway']) {
      const f = first(answer(m, id));
      if (f) out.push(`${f} #${m.title.replace(/[^A-Za-z0-9]/g, '')} #horror`);
    }
    if (m.rating != null) out.push(`${m.title}: ${m.rating}/10.${rankOf(m) ? ` Sits at #${rankOf(m)} in my rankings.` : ''}`);
    return `# Short posts: ${m.title}\n\n` + (out.length ? out.map((p) => `- ${p}`).join('\n') : '- [Answer the questions first]') + '\n';
  }

  function aiPrompt(m, kind) {
    const S = HL.state.settings;
    const notes = ctx().q.filter((q) => has(answer(m, q.id))).map((q) => `### ${q.label}\n${answer(m, q.id).trim()}`).join('\n\n');
    const lenses = (m.lenses || []).map((id) => `- ${lensName(id)}${has((m.lensNotes || {})[id]) ? ': ' + m.lensNotes[id].trim() : ''}`).join('\n');
    return `Draft a ${kind || 'Substack essay'} in my voice about ${m.title} (${m.year || 'n.d.'}), using only my notes below. Keep my claims and my stance. Don't invent experiences I didn't describe. Mark gaps as [TODO].

About me: ${S.authorBio || 'I write about horror through a clinical lens.'}

## Voice rules
${S.voice.guide}

## Film
${infoLine(m)}
${m.cast && m.cast.length ? 'Starring: ' + list(m.cast.slice(0, 6).map(stripChar)) : ''}
${has(m.plot || m.overview) ? 'Synopsis: ' + (m.overview || '').slice(0, 800) : ''}

## My rating
${m.rating != null ? m.rating + '/10' : 'unrated'}${rankOf(m) ? `, ranked #${rankOf(m)} of ${S.ranked.length}` : ''}
${scoreLine(m)}

## Lenses
${lenses || '(none)'}

## My notes
${notes || '(none yet)'}

${has(m.critique) ? '## My critique\n' + m.critique.trim() : ''}
`.replace(/\n{3,}/g, '\n\n');
  }

  // ---------- Multi-film formats ----------
  function sortedByRank(ms) {
    const ranked = HL.state.settings.ranked;
    return ms.slice().sort((a, b) => {
      const ra = ranked.indexOf(a.id), rb = ranked.indexOf(b.id);
      if (ra >= 0 && rb >= 0) return ra - rb;
      if (ra >= 0) return -1;
      if (rb >= 0) return 1;
      return (b.rating || 0) - (a.rating || 0);
    });
  }

  function theme(lensId, films) {
    const l = HL.LENSES.find((x) => x.id === lensId);
    const name = l ? l.name : lensId;
    const ms = sortedByRank(films);
    let md = `# ${name} in horror\n\n`;
    md += `## Opening scene\n\n[TODO: open in a room. A patient, a shift, a night on the couch with one of these films.]\n\n`;
    if (l) md += `## The frame\n\n${l.blurb}\n\n`;
    for (const m of ms) {
      md += `## ${m.title} (${m.year || 'n.d.'})\n\n`;
      const bits = [];
      if (has((m.lensNotes || {})[lensId])) bits.push(m.lensNotes[lensId].trim());
      const pick = lensId === 'burnout' ? ['burnout', 'system'] : lensId === 'optimistic-nihilism' ? ['nihilism'] : ['monster', 'room'];
      for (const id of pick) if (has(answer(m, id))) bits.push(answer(m, id).trim());
      if (has(answer(m, 'verdict'))) bits.push(`> ${answer(m, 'verdict').trim()}`);
      md += (bits.join('\n\n') || '[TODO: no notes yet for this lens]') + '\n\n';
    }
    md += `## What these films agree on\n\n[TODO]\n\n## Ending image\n\n[TODO]\n\n`;
    if (l && l.refs.length) md += `---\n\n**Sources to consider**\n\n${l.refs.map((r) => '- ' + r).join('\n')}\n`;
    return md.trim() + '\n';
  }

  function rankedList(n) {
    const S = HL.state;
    const ids = S.settings.ranked.slice(0, n || undefined);
    let md = `# My horror rankings${n ? `: top ${ids.length}` : ''}\n\n*${S.settings.ranked.length} films ranked as of ${new Date().toLocaleDateString()}.*\n\n`;
    ids.forEach((id, i) => {
      const m = S.movies.get(id);
      if (!m) return;
      md += `${i + 1}. **${m.title}** (${m.year || 'n.d.'})${m.rating != null ? `, ${m.rating}/10` : ''}${has(answer(m, 'verdict')) ? `. ${answer(m, 'verdict').trim()}` : ''}\n`;
    });
    return md.trim() + '\n';
  }

  // ---------- Data files ----------
  function csvCell(v) {
    const s = v == null ? '' : Array.isArray(v) ? v.join('; ') : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function csv(ms) {
    const S = HL.state.settings;
    const head = ['Title', 'Year', 'Directors', 'Status', 'Rating10', 'Rank', 'WatchDates', 'Subgenres', 'Lenses', 'Pipeline', 'Verdict', ...S.scoreDims.map((d) => d.label), ...S.template.map((q) => q.label), 'Critique', 'TMDB', 'IMDb', 'Wikidata'];
    const rows = ms.map((m) => [m.title, m.year, m.directors, m.status, m.rating, rankOf(m), m.watchDates, m.subgenres, (m.lenses || []).map(lensName), HL.PIPELINE[m.pipeline] || '', answer(m, 'verdict'),
      ...S.scoreDims.map((d) => (m.scores || {})[d.id] || ''), ...S.template.map((q) => answer(m, q.id)), m.critique, m.tmdbId, m.imdbId, m.wikidataId]);
    return [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');
  }

  function letterboxdCsv(ms) {
    const rows = ms.filter((m) => m.status === 'seen').map((m) => [m.title, m.year, m.imdbId || '', m.rating != null ? m.rating : '', (m.watchDates || []).slice(-1)[0] || '', m.critique || answer(m, 'verdict')]);
    return [['Title', 'Year', 'imdbID', 'Rating10', 'WatchedDate', 'Review'], ...rows].map((r) => r.map(csvCell).join(',')).join('\n');
  }

  function catalogueMd(ms) {
    let md = `# Horror catalogue\n\n*Exported ${new Date().toLocaleString()}. ${ms.length} films.*\n\n`;
    for (const m of sortedByRank(ms)) {
      md += `## ${m.title} (${m.year || 'n.d.'})\n\n`;
      const meta = [infoLine(m), m.rating != null ? `Rating ${m.rating}/10` : '', rankOf(m) ? `Rank #${rankOf(m)}` : '', m.status !== 'unseen' ? `Status: ${m.status}` : ''].filter(Boolean);
      md += meta.join(' | ') + '\n\n';
      for (const q of HL.state.settings.template) if (has(answer(m, q.id))) md += `**${q.label}.** ${answer(m, q.id).trim()}\n\n`;
      if (has(m.critique)) md += `**Critique.** ${m.critique.trim()}\n\n`;
    }
    return md;
  }

  function parseCsv(text) {
    const rows = [];
    let row = [], cell = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') q = false;
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(cell); rows.push(row); row = []; cell = '';
      } else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    const head = (rows.shift() || []).map((h) => h.trim());
    return rows.filter((r) => r.some((c) => c.trim())).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] || ''])));
  }

  // ---------- Markdown to HTML (small, enough for previews and .html export) ----------
  function mdToHtml(md) {
    const e = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const inline = (s) => e(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, '$1<em>$2</em>')
      .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2">$1</a>');
    const lines = md.split('\n');
    let html = '', para = [], listType = null, table = [];
    const flushPara = () => { if (para.length) { html += `<p>${para.map(inline).join('<br>')}</p>\n`; para = []; } };
    const flushList = () => { if (listType) { html += `</${listType}>\n`; listType = null; } };
    const flushTable = () => {
      if (!table.length) return;
      const cells = (r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const rows = table.filter((r) => !/^\|[\s\-|:]+\|$/.test(r));
      html += '<table>' + rows.map((r) => '<tr>' + cells(r).map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</table>\n';
      table = [];
    };
    for (const raw of lines) {
      const line = raw.replace(/ {2}$/, '').replace(/\s+$/, '');
      if (/^\|/.test(line)) { flushPara(); flushList(); table.push(line); continue; }
      flushTable();
      let mm;
      if (!line.trim()) { flushPara(); flushList(); continue; }
      if ((mm = line.match(/^(#{1,4})\s+(.*)/))) { flushPara(); flushList(); html += `<h${mm[1].length}>${inline(mm[2])}</h${mm[1].length}>\n`; continue; }
      if (/^---+$/.test(line)) { flushPara(); flushList(); html += '<hr>\n'; continue; }
      if ((mm = line.match(/^>\s?(.*)/))) { flushPara(); flushList(); html += `<blockquote>${inline(mm[1])}</blockquote>\n`; continue; }
      if ((mm = line.match(/^[-*]\s+(.*)/))) { flushPara(); if (listType !== 'ul') { flushList(); html += '<ul>'; listType = 'ul'; } html += `<li>${inline(mm[1])}</li>`; continue; }
      if ((mm = line.match(/^\d+\.\s+(.*)/))) { flushPara(); if (listType !== 'ol') { flushList(); html += '<ol>'; listType = 'ol'; } html += `<li>${inline(mm[1])}</li>`; continue; }
      flushList();
      para.push(line);
    }
    flushPara(); flushList(); flushTable();
    return html;
  }

  function htmlDoc(title, md) {
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title.replace(/</g, '&lt;')}</title>
<style>body{font:18px/1.65 Georgia,serif;max-width:680px;margin:40px auto;padding:0 16px;color:#1d1a17;background:#fbf8f2}h1,h2,h3{font-family:Georgia,serif;line-height:1.2}blockquote{border-left:3px solid #9b1c24;margin:0;padding:4px 16px;font-style:italic}table{border-collapse:collapse}td{border-bottom:1px solid #ddd;padding:4px 10px;vertical-align:top}a{color:#9b1c24}</style></head><body>
${mdToHtml(md)}</body></html>`;
  }

  // ---------- Voice check ----------
  function voiceCheck(text, v) {
    const issues = [];
    const add = (sev, label, re) => {
      let m;
      re.lastIndex = 0;
      while ((m = re.exec(text))) {
        issues.push({ sev, label, match: m[0], index: m.index });
        if (m[0].length === 0) re.lastIndex++;
      }
    };
    if (v.checkEmDash) add('fix', 'Em/en dash', /\u2014|\u2013|(?<=\w) ?-- ?(?=\w)/g);
    const bw = (v.bannedWords || '').split(',').map((s) => s.trim()).filter(Boolean);
    for (const w of bw) {
      const stem = w.length > 4 && /e$/.test(w) ? w.slice(0, -1) : w;
      add('fix', `Banned word: ${w}`, new RegExp(`\\b${stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\w*\\b`, 'gi'));
    }
    const bp = (v.bannedPhrases || '').split(',').map((s) => s.trim()).filter(Boolean);
    for (const p of bp) add('fix', `Banned phrase: ${p}`, new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/'/g, "['\u2019]")}\\b`, 'gi'));
    if (v.checkParallelism) {
      const A = "['\u2019]";
      add('fix', 'Negative parallelism', new RegExp(`\\b(it${A}?s|this is|that${A}?s|they${A}?re|we${A}?re|he${A}?s|she${A}?s|it is|this isn${A}t|it isn${A}t)\\s+(not\\s+)?(just|only|merely|about)?\\s*[^.!?;\\n]{1,60}?[,;:]\\s*(it${A}?s|but|this is|that${A}?s|they${A}?re|it is)\\b`, 'gi'));
      add('fix', 'Negative parallelism', /\bnot\s+(just|only|merely)\b[^.!?\n]{1,80}\bbut\b/gi);
      add('fix', 'Negative parallelism', new RegExp(`\\b(isn${A}t|wasn${A}t|aren${A}t|is not|was not)\\b[^.!?\\n]{1,60}[,;]\\s*(it${A}?s|it was|they${A}?re|it is)\\b`, 'gi'));
      add('fix', 'Negative parallelism', /\bthe (question|point|problem|issue|answer) (isn['\u2019]t|is not|was never)\b/gi);
      add('fix', 'Negative parallelism', /\bforget\b[^.!?\n]{1,40}[.,;:]\s*(this|it)\s+is\b/gi);
      add('fix', 'Negative parallelism', /\bstop\s+\w+ing\b[^.!?\n]{0,60}\band\s+start\b/gi);
    }
    if (v.checkContractions) add('consider', 'Use a contraction', /\b(do not|does not|did not|is not|are not|was not|were not|can not|cannot|will not|would not|should not|could not|it is|that is|I am|I have|you are|they are|we are|I will|I would|there is)\b/gi);
    if (v.checkNumbers) add('consider', 'Number as digits', /\b(two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|hundred)\b/gi);
    add('consider', '"Represents": try "is"', /\brepresents?\b/gi);
    if (v.checkParagraphs) {
      const paras = text.split(/\n\s*\n/);
      let pos = 0;
      for (const p of paras) {
        const isProse = p.trim() && !/^\s*([#>|\-*]|\d+\.)/.test(p);
        const n = (p.match(/[.!?](\s|$)/g) || []).length;
        if (isProse && n > 3) issues.push({ sev: 'consider', label: `Paragraph has ${n} sentences (aim for 1 to 3)`, match: p.slice(0, 60) + '...', index: text.indexOf(p, pos) });
        pos += p.length + 2;
      }
    }
    issues.sort((a, b) => a.index - b.index);
    return issues;
  }

  function fixDashes(text) {
    return text.replace(/\s*[\u2014]\s*/g, ', ').replace(/(\d)\u2013(\d)/g, '$1-$2').replace(/\s*\u2013\s*/g, ', ').replace(/(\w) -- (\w)/g, '$1, $2');
  }

  return { blog, essay, podcast, social, aiPrompt, theme, rankedList, csv, letterboxdCsv, catalogueMd, parseCsv, mdToHtml, htmlDoc, voiceCheck, fixDashes, words, lensName, infoLine };
})();
