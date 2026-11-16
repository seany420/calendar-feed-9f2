import { db, uid, loadSettings, saveSettings } from './db.js';
import { LEARN, EXERCISES, EXERCISE_CATS, STORY_PROMPTS, FOCUSES } from './content.js';
import { buildInstructions, SUMMARY_PROMPT } from './prompt.js';
import { VoiceSession, transcribe, summarize } from './openai.js';
import { makeZip, readZip } from './zip.js';

// ---------- helpers
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const main = $('#main');
let S = loadSettings();
const ui = { focus: 'open', filter: 'all', prompt: pick(STORY_PROMPTS), pruneId: null, pacer: null, audioUrl: null };

function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
const fmtDate = (t) => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
const fmtTime = (t) => new Date(t).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
const clock = (sec) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
const dayKey = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const slug = (s) => (s || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'untitled';
const extFor = (mime = '') => (/mp4|m4a|aac/.test(mime) ? 'm4a' : /ogg/.test(mime) ? 'ogg' : /wav/.test(mime) ? 'wav' : 'webm');
const exById = (id) => EXERCISES.find((e) => e.id === id);

let toastTimer;
function toast(msg, ms = 3200) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), ms);
}

async function deliver(blob, filename) {
  const file = new File([blob], filename, { type: blob.type || 'application/octet-stream' });
  if (matchMedia('(pointer: coarse)').matches && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: filename }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 30000);
}

let wake;
async function keepAwake(on) {
  try {
    if (on) wake = await navigator.wakeLock?.request('screen');
    else { await wake?.release(); wake = null; }
  } catch { /* unsupported */ }
}

// ---------- markdown export
function entryMd(e) {
  const ex = e.exerciseId && exById(e.exerciseId);
  return [
    `# ${e.title || 'Untitled'}`,
    '',
    `Date: ${fmtDate(e.createdAt)} ${fmtTime(e.createdAt)}`,
    `Type: ${e.kind === 'recorded' ? 'Recorded memory' : 'Written'}${ex ? ` (exercise: ${ex.title})` : ''}`,
    e.duration ? `Length: ${clock(e.duration)}` : null,
    e.tags ? `Tags: ${e.tags}` : null,
    e.prompt ? `Prompt: ${e.prompt}` : null,
    '',
    e.text || '(no text yet)',
    '',
  ].filter((l) => l !== null).join('\n');
}

function convMd(c) {
  return [
    `# ${c.title || 'Conversation'}`,
    '',
    `Date: ${fmtDate(c.startedAt)} ${fmtTime(c.startedAt)}`,
    c.label ? `Focus: ${c.label}` : null,
    c.summary ? `\nSummary: ${c.summary}` : null,
    '',
    ...c.turns.map((t) => `**${t.role === 'user' ? (S.name || 'Me') : 'Companion'}:** ${t.text}\n`),
  ].filter((l) => l !== null).join('\n');
}

// ---------- router
const routes = { talk: viewTalk, memories: viewMemories, practice: viewPractice, learn: viewLearn, more: viewMore };

async function render() {
  const [, tab = 'talk', a, b] = location.hash.split('/');
  stopPacer();
  if (ui.audioUrl) { URL.revokeObjectURL(ui.audioUrl); ui.audioUrl = null; }
  if (ui.pruneId) {
    const id = ui.pruneId;
    ui.pruneId = null;
    const e = await db.get('entries', id);
    if (e && !e.audio && !(e.text || '').trim()) await db.del('entries', id);
  }
  document.querySelectorAll('.tabs a').forEach((el) => el.classList.toggle('on', el.dataset.tab === tab));
  const view = routes[tab] || viewTalk;
  main.innerHTML = await view(a, b);
  window.scrollTo(0, 0);
  main.querySelector('[autofocus]')?.focus();
}
window.addEventListener('hashchange', render);

// ---------- Talk
async function viewTalk(sub, id) {
  if (sub === 'c' && id) return viewConversation(id);
  const [convs, checkins] = await Promise.all([db.all('conversations'), db.all('checkins')]);
  const today = checkins.find((c) => c.id === dayKey());
  const hello = S.name ? `${esc(S.name)}.` : 'Hello.';
  return `
    <div class="hero">
      <h1>${hello}</h1>
      <p class="muted">Talk out loud with a companion who knows grief. Stop whenever you want.</p>
    </div>
    ${S.apiKey ? '' : `<div class="card banner"><p>Voice needs your OpenAI API key. It stays on this phone.</p><a class="btn small" href="#/more">Add it in Settings</a></div>`}
    <div class="chips" role="radiogroup" aria-label="What kind of conversation">
      ${FOCUSES.map((f) => `<button class="chip ${ui.focus === f.id ? 'on' : ''}" data-act="focus" data-id="${f.id}">${esc(f.label)}</button>`).join('')}
    </div>
    <button class="btn primary big" data-act="call-start">Start talking</button>

    <h2 class="section-h">Today</h2>
    <div class="card">
      ${today && !ui.editCheckin ? `
        <div class="row spread">
          <span>Grief at <strong>${today.level}</strong> of 10${today.side ? `, ${esc(SIDES[today.side])}` : ''}.</span>
          <button class="link" data-act="checkin-edit">Change</button>
        </div>
        ${today.note ? `<p class="muted small" style="margin-top:8px">${esc(today.note)}</p>` : ''}
      ` : `
        <div class="row">
          <div class="grow">
            <label for="ci-level" style="margin-top:0">How heavy is it today?</label>
            <input id="ci-level" type="range" min="0" max="10" step="1" value="${today?.level ?? 5}" data-input="ci-level">
            <div class="scale"><span>0 quiet</span><span>10 flattening</span></div>
          </div>
          <div class="big-num" id="ci-num">${today?.level ?? 5}</div>
        </div>
        <label>Where has today pointed?</label>
        <div class="chips" id="ci-sides">
          ${Object.entries(SIDES).map(([k, v]) => `<button class="chip ${today?.side === k ? 'on' : ''}" data-act="ci-side" data-id="${k}">${esc(v)}</button>`).join('')}
        </div>
        <input id="ci-note" type="text" placeholder="A line about today (optional)" value="${esc(today?.note || '')}">
        <div style="margin-top:12px"><button class="btn small" data-act="checkin-save">Save check-in</button></div>
      `}
    </div>

    <h2 class="section-h">Earlier conversations</h2>
    ${convs.length ? `<ul class="list">${convs.map((c) => `
      <li><a href="#/talk/c/${c.id}">
        <span class="item-title">${esc(c.title || 'Conversation')}</span>
        <span class="item-sub">${fmtDate(c.startedAt)}, ${fmtTime(c.startedAt)} · ${c.turns.length} turns</span>
      </a></li>`).join('')}</ul>` : `<p class="empty">Nothing yet. Conversations save here as transcripts.</p>`}
  `;
}
const SIDES = { loss: 'facing the loss', rebuild: 'rebuilding', both: 'some of both', numb: 'numb' };

async function viewConversation(id) {
  const c = await db.get('conversations', id);
  if (!c) return `<a class="back" href="#/talk">‹ Talk</a><p class="empty">That conversation is gone.</p>`;
  return `
    <a class="back" href="#/talk">‹ Talk</a>
    <h1>${esc(c.title || 'Conversation')}</h1>
    <p class="muted small">${fmtDate(c.startedAt)}, ${fmtTime(c.startedAt)}${c.label ? ' · ' + esc(c.label) : ''}</p>
    ${c.summary ? `<div class="card"><p class="small muted" style="margin-bottom:4px">Summary</p><p>${esc(c.summary)}</p></div>` : ''}
    <div class="row" style="margin-bottom:18px">
      <button class="btn small" data-act="conv-export" data-id="${c.id}">Export</button>
      <button class="btn small" data-act="conv-to-memory" data-id="${c.id}">Save as a memory</button>
      <button class="btn small danger" data-act="conv-del" data-id="${c.id}">Delete</button>
    </div>
    ${turnsHtml(c.turns)}
  `;
}

function turnsHtml(turns) {
  return turns.filter((t) => t.text).map((t) => `
    <div class="turn ${t.role}"><span class="who">${t.role === 'user' ? esc(S.name || 'You') : 'Companion'}</span><p>${esc(t.text)}</p></div>`).join('');
}

// ---------- Memories
async function viewMemories(id) {
  if (id) return viewEntry(id);
  const all = await db.all('entries');
  const list = all.filter((e) => ui.filter === 'all' || (ui.filter === 'exercise' ? e.exerciseId : e.kind === ui.filter));
  const stale = all.length >= 3 && Date.now() - (S.lastBackup || 0) > 14 * 864e5;
  const filters = [['all', 'All'], ['recorded', 'Recorded'], ['written', 'Written'], ['exercise', 'Exercises']];
  return `
    <h1>Memories</h1>
    <p class="muted">Say it out loud or write it down. Everything here stays on this phone until you export it.</p>
    <div class="card">
      <p class="small muted" style="margin-bottom:4px">A place to start</p>
      <p style="font-family:var(--serif);font-size:1.2rem">${esc(ui.prompt)}</p>
      <div class="row">
        <button class="btn primary" data-act="rec-start" data-prompt="1">Record</button>
        <button class="btn" data-act="write-new" data-prompt="1">Write</button>
        <button class="link" data-act="prompt-shuffle">Another</button>
      </div>
    </div>
    ${stale ? `<div class="card banner"><p>You have ${all.length} memories and no recent backup. Phones lose things.</p><button class="btn small" data-act="backup">Back up now</button></div>` : ''}
    <div class="chips">${filters.map(([k, v]) => `<button class="chip ${ui.filter === k ? 'on' : ''}" data-act="filter" data-id="${k}">${v}</button>`).join('')}</div>
    ${list.length ? `<ul class="list">${list.map((e) => `
      <li><a href="#/memories/${e.id}">
        <span class="item-title">${esc(e.title || 'Untitled')}</span>
        <span class="item-sub">${fmtDate(e.createdAt)} · ${e.kind === 'recorded' ? 'Recorded ' + clock(e.duration || 0) : 'Written'}${e.exerciseId ? ' · ' + esc(exById(e.exerciseId)?.title || 'Exercise') : ''}${e.kind === 'recorded' && !e.text ? ' · no transcript' : ''}</span>
      </a></li>`).join('')}</ul>` : `<p class="empty">Nothing here yet.</p>`}
  `;
}

async function viewEntry(id) {
  const e = await db.get('entries', id);
  if (!e) return `<a class="back" href="#/memories">‹ Memories</a><p class="empty">That entry is gone.</p>`;
  ui.pruneId = id;
  const ex = e.exerciseId && exById(e.exerciseId);
  if (e.audio) ui.audioUrl = URL.createObjectURL(e.audio);
  return `
    <a class="back" href="#/memories">‹ Memories</a>
    <input class="title" type="text" value="${esc(e.title)}" placeholder="Title" data-input="entry" data-id="${e.id}" data-field="title" aria-label="Title">
    <p class="muted small">${fmtDate(e.createdAt)}, ${fmtTime(e.createdAt)}${ex ? ` · <a href="#/practice/${ex.id}">${esc(ex.title)}</a>` : ''}</p>
    ${e.prompt ? `<p class="muted" style="font-family:var(--serif)">${esc(e.prompt)}</p>` : ''}
    ${ex && e.kind === 'written' ? `<details class="card"><summary>Steps</summary><ol class="steps" style="margin-top:10px">${ex.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></details>` : ''}
    ${e.audio ? `<audio controls preload="metadata" src="${ui.audioUrl}"></audio>` : ''}
    ${e.audio ? `<div class="row" style="margin-bottom:6px">
      <button class="btn small" id="tr-btn" data-act="entry-transcribe" data-id="${e.id}">${e.text ? 'Transcribe again' : 'Transcribe'}</button>
      <button class="btn small" data-act="entry-audio" data-id="${e.id}">Save audio file</button>
    </div>` : ''}
    <label for="entry-text">${e.kind === 'recorded' ? 'Transcript (edit freely)' : 'Text'}</label>
    <textarea id="entry-text" class="tall" data-input="entry" data-id="${e.id}" data-field="text" placeholder="${e.kind === 'recorded' ? 'The transcript will land here.' : 'Start anywhere.'}" ${e.kind === 'written' && !e.text ? 'autofocus' : ''}>${esc(e.text)}</textarea>
    <label for="entry-tags">Tags</label>
    <input id="entry-tags" type="text" value="${esc(e.tags)}" placeholder="dad, the ridge, 1994" data-input="entry" data-id="${e.id}" data-field="tags">
    <p class="muted small" id="entry-saved" style="margin-top:8px">Saves as you type.</p>
    <div class="row" style="margin-top:14px">
      <button class="btn small" data-act="entry-export" data-id="${e.id}">Export text</button>
      <button class="btn small danger" data-act="entry-del" data-id="${e.id}">Delete</button>
    </div>
  `;
}

// ---------- Practice
async function viewPractice(id) {
  if (id) return viewExercise(id);
  return `
    <h1>Practice</h1>
    <p class="muted">Exercises drawn from grief treatment, mindfulness, and philosophy. Do them with the companion, on paper, or out loud.</p>
    ${EXERCISE_CATS.map((c) => `
      <h2 class="section-h">${esc(c.title)}</h2>
      <ul class="list">${EXERCISES.filter((e) => e.cat === c.id).map((e) => `
        <li><a href="#/practice/${e.id}">
          <span class="item-title">${esc(e.title)}</span>
          <span class="item-sub">${e.mins} min · ${esc(e.blurb)}</span>
        </a></li>`).join('')}</ul>`).join('')}
  `;
}

async function viewExercise(id) {
  const e = exById(id);
  if (!e) return `<a class="back" href="#/practice">‹ Practice</a><p class="empty">Not found.</p>`;
  const past = (await db.all('entries')).filter((x) => x.exerciseId === id);
  const btn = { talk: `<button class="btn primary" data-act="call-start" data-exercise="${e.id}">Do it with the companion</button>`, write: `<button class="btn" data-act="write-new" data-exercise="${e.id}">Write it</button>`, record: `<button class="btn" data-act="rec-start" data-exercise="${e.id}">Record it</button>` };
  return `
    <a class="back" href="#/practice">‹ Practice</a>
    <div class="article">
      <h1>${esc(e.title)}</h1>
      <p class="muted small">About ${e.mins} minutes</p>
      <p>${esc(e.why)}</p>
      ${e.caution ? `<div class="card caution"><p style="font-family:var(--sans);font-size:.95rem">${esc(e.caution)}</p></div>` : ''}
      <ol class="steps">${e.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
    </div>
    ${e.pacer ? `<div id="pacer-slot"><button class="btn block" data-act="pacer">Start the pacer</button></div>` : ''}
    <div class="row">${e.modes.map((m) => btn[m]).join('')}</div>
    ${past.length ? `<h2 class="section-h">Your earlier passes</h2><ul class="list">${past.map((p) => `<li><a href="#/memories/${p.id}"><span class="item-title">${esc(p.title || 'Untitled')}</span><span class="item-sub">${fmtDate(p.createdAt)}</span></a></li>`).join('')}</ul>` : ''}
  `;
}

function stopPacer() { clearInterval(ui.pacer); ui.pacer = null; }
function startPacer() {
  const slot = $('#pacer-slot');
  slot.innerHTML = `<div class="pacer"><div class="pacer-ball"></div><div class="pacer-label" id="pacer-label">In</div><button class="btn small ghost" data-act="pacer-stop">Stop</button></div>`;
  const t0 = performance.now();
  ui.pacer = setInterval(() => {
    const el = $('#pacer-label');
    if (!el) return stopPacer();
    const sec = (performance.now() - t0) / 1000;
    const phase = sec % 10;
    el.textContent = `${phase < 4 ? 'In' : 'Out'} · ${clock(sec)}`;
  }, 200);
}

// ---------- Learn
async function viewLearn(id) {
  if (id) {
    const a = LEARN.find((x) => x.id === id);
    if (!a) return `<a class="back" href="#/learn">‹ Learn</a><p class="empty">Not found.</p>`;
    return `
      <a class="back" href="#/learn">‹ Learn</a>
      <div class="article">
        <h1>${esc(a.title)}</h1>
        <p class="muted">${esc(a.blurb)}</p>
        ${a.sections.map((s) => `<h3>${esc(s.h)}</h3>${s.p.map((p) => `<p>${esc(p)}</p>`).join('')}`).join('')}
      </div>
      <button class="btn primary block" style="margin-top:20px" data-act="call-start" data-topic="${a.id}">Talk this through</button>
    `;
  }
  return `
    <h1>Learn</h1>
    <p class="muted">What the research and the old books say about grief, in plain language.</p>
    <ul class="list">${LEARN.map((a) => `
      <li><a href="#/learn/${a.id}"><span class="item-title">${esc(a.title)}</span><span class="item-sub">${esc(a.blurb)}</span></a></li>`).join('')}</ul>
  `;
}

// ---------- More / settings
const VOICES = ['marin', 'cedar', 'alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse'];
const MODELS = ['gpt-realtime-2.1', 'gpt-realtime-2.1-mini', 'gpt-realtime-2', 'gpt-realtime', 'gpt-realtime-mini'];

async function viewMore() {
  const checkins = (await db.all('checkins')).slice(0, 30).reverse();
  const opt = (list, cur) => (list.includes(cur) ? list : [cur, ...list]).map((v) => `<option ${v === cur ? 'selected' : ''}>${esc(v)}</option>`).join('');
  const chk = (path, label) => `<label class="check"><input type="checkbox" data-set="${path}" ${path.split('.').reduce((o, k) => o?.[k], S) ? 'checked' : ''}><span>${label}</span></label>`;
  return `
    <h1>More</h1>

    <h2 class="section-h">Check-in history</h2>
    <div class="card">${checkins.length > 1 ? chart(checkins) + `<p class="muted small" style="margin-top:8px">Grief intensity, last ${checkins.length} check-ins. Expect it to zigzag.</p>` : `<p class="muted">Check in on a few different days and a line will show up here.</p>`}</div>

    <h2 class="section-h">About you</h2>
    <div class="card">
      <label for="s-name" style="margin-top:0">What should the companion call you?</label>
      <input id="s-name" type="text" data-set="name" value="${esc(S.name)}" autocomplete="off">
      <label for="s-grieving">Who or what are you grieving?</label>
      <textarea id="s-grieving" data-set="grieving" placeholder="Their name, who they were to you, when and how you lost them. As much or as little as you want.">${esc(S.grieving)}</textarea>
      <label for="s-about">Anything else the companion should know about you?</label>
      <textarea id="s-about" data-set="about" placeholder="Your work, your beliefs, what you can't stand hearing.">${esc(S.about)}</textarea>
    </div>

    <h2 class="section-h">How the companion talks</h2>
    <div class="card">
      <div class="chips" style="margin-bottom:6px">
        ${[['gentle', 'Gentle'], ['balanced', 'Balanced'], ['direct', 'Direct']].map(([k, v]) => `<button class="chip ${S.style === k ? 'on' : ''}" data-act="set-style" data-id="${k}">${v}</button>`).join('')}
      </div>
      ${chk('lenses.philosophy', 'Bring in philosophy')}
      ${chk('lenses.mindfulness', 'Bring in mindfulness and the body')}
      ${chk('lenses.horror', 'Horror is fair game as metaphor')}
      ${chk('lenses.humor', 'Dark humor is welcome')}
      ${chk('remember', 'Remember earlier conversations and memories')}
    </div>

    <h2 class="section-h">Voice and connection</h2>
    <div class="card">
      <label for="s-key" style="margin-top:0">OpenAI API key</label>
      <input id="s-key" type="password" data-set="apiKey" value="${esc(S.apiKey)}" placeholder="sk-..." autocomplete="off" autocapitalize="off" spellcheck="false">
      <p class="muted small" style="margin-top:6px">Stored only in this browser. Create one at platform.openai.com under API keys. Voice time is billed to your OpenAI account.</p>
      <label for="s-voice">Voice</label>
      <select id="s-voice" data-set="voice">${opt(VOICES, S.voice)}</select>
      <label for="s-model">Voice model</label>
      <select id="s-model" data-set="model">${opt(MODELS, S.model)}</select>
      ${chk('autoTranscribe', 'Transcribe recordings automatically')}
      <details style="margin-top:10px"><summary class="muted small">Advanced</summary>
        <label for="s-stt">Transcription model</label>
        <input id="s-stt" type="text" data-set="sttModel" value="${esc(S.sttModel)}" autocapitalize="off">
        <label for="s-text">Summary model</label>
        <input id="s-text" type="text" data-set="textModel" value="${esc(S.textModel)}" autocapitalize="off">
        <label for="s-custom-model">Custom voice model ID</label>
        <input id="s-custom-model" type="text" data-set="model" value="${esc(S.model)}" autocapitalize="off">
      </details>
    </div>

    <h2 class="section-h">Your data</h2>
    <div class="card">
      <p>One zip with every recording, transcript, conversation, and check-in. Text comes out as Markdown, ready for a manuscript or Obsidian.</p>
      <button class="btn primary block" data-act="backup">Export everything</button>
      <button class="btn block" data-act="restore">Restore from a backup</button>
      <p class="muted small">${S.lastBackup ? 'Last export: ' + fmtDate(S.lastBackup) + '.' : 'No export yet.'}</p>
    </div>

    <h2 class="section-h">Privacy, plainly</h2>
    <div class="card">
      <p>Recordings, writing, and transcripts are stored on this device only. There's no account and no server of ours.</p>
      <p>When you talk with the companion or transcribe a recording, that audio and text go to OpenAI through your own API key, under their API terms.</p>
      <p class="muted small">This is a companion and a notebook. It can't assess risk or stand in for a therapist. If you're in danger, use the Crisis help button at the top.</p>
    </div>
  `;
}

function chart(rows) {
  const W = 300, H = 110, pad = 8;
  const x = (i) => pad + (i * (W - pad * 2)) / (rows.length - 1);
  const y = (v) => pad + ((10 - v) * (H - pad * 2)) / 10;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Grief intensity over recent check-ins">
    <line x1="${pad}" x2="${W - pad}" y1="${y(5)}" y2="${y(5)}" stroke-dasharray="3 4"/>
    <polyline points="${rows.map((r, i) => `${x(i).toFixed(1)},${y(r.level).toFixed(1)}`).join(' ')}"/>
    ${rows.map((r, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(r.level).toFixed(1)}" r="2.5"><title>${r.id}: ${r.level}</title></circle>`).join('')}
  </svg>`;
}

// ---------- voice call
let call = null; // { session, conv, timer }

async function startCall({ exerciseId, topicId } = {}) {
  if (call) return;
  if (!S.apiKey) { toast('Add your OpenAI API key in Settings first.'); location.hash = '#/more'; return; }
  if (!window.RTCPeerConnection || !navigator.mediaDevices?.getUserMedia) { toast('This browser can\'t do live voice. Try Safari or Chrome.'); return; }

  const exercise = exerciseId && exById(exerciseId);
  const article = topicId && LEARN.find((a) => a.id === topicId);
  const focus = FOCUSES.find((f) => f.id === ui.focus);
  const label = exercise ? exercise.title : article ? article.title : focus.label;

  let summaries = [], memories = [];
  if (S.remember) {
    summaries = (await db.all('conversations')).filter((c) => c.summary).slice(0, 4);
    memories = (await db.all('entries')).slice(0, 8).map((e) => ({ title: e.title || 'Untitled', text: e.text || '' }));
  }
  const instructions = buildInstructions({ settings: S, focus, exercise, topic: article?.talk, summaries, memories });

  const conv = { id: uid(), startedAt: Date.now(), title: label, label, exerciseId: exerciseId || null, turns: [], summary: '' };
  const el = $('#call');
  $('#call-label').textContent = label;
  $('#call-log').innerHTML = '';
  $('#call-err').hidden = true;
  $('#call-mute').textContent = 'Mute';
  el.hidden = false;
  keepAwake(true);

  let lastSave = 0;
  const session = new VoiceSession({
    apiKey: S.apiKey, model: S.model, voice: S.voice, sttModel: S.sttModel, instructions,
    onState: (st) => {
      $('#orb').dataset.state = st;
      $('#call-status').textContent = { mic: 'Waiting for the microphone', connecting: 'Connecting', listening: session.muted ? 'Muted' : 'Listening', hearing: 'Listening', thinking: '…', speaking: 'Speaking' }[st] || '';
    },
    onTurns: (turns) => {
      const log = $('#call-log');
      log.innerHTML = turnsHtml(turns);
      log.scrollTop = log.scrollHeight;
      if (Date.now() - lastSave > 15000) { lastSave = Date.now(); conv.turns = session.cleanTurns(); if (conv.turns.some((t) => t.role === 'user')) db.put('conversations', conv); }
    },
    onError: (msg) => { const e = $('#call-err'); e.textContent = msg; e.hidden = false; },
    onEnd: (reason) => { toast(reason); finishCall(); },
  });
  const t0 = Date.now();
  call = { session, conv, timer: setInterval(() => ($('#call-time').textContent = clock((Date.now() - t0) / 1000)), 1000) };
  $('#call-time').textContent = '0:00';
  session.o.onState('connecting');

  try {
    await session.start();
  } catch (e) {
    const failed = call;
    call = null;
    clearInterval(failed.timer);
    session.stop();
    el.hidden = true;
    keepAwake(false);
    toast(e.message, 6000);
  }
}

async function finishCall() {
  if (!call) return;
  const { session, conv, timer } = call;
  call = null;
  clearInterval(timer);
  conv.turns = session.cleanTurns();
  conv.endedAt = Date.now();
  session.stop();
  $('#call').hidden = true;
  keepAwake(false);

  if (!conv.turns.some((t) => t.role === 'user')) {
    await db.del('conversations', conv.id);
    render();
    return;
  }
  await db.put('conversations', conv);
  navigator.storage?.persist?.();
  location.hash = `#/talk/c/${conv.id}`;
  render();

  try {
    const text = conv.turns.map((t) => `${t.role === 'user' ? 'Person' : 'Companion'}: ${t.text}`).join('\n');
    const out = await summarize({ apiKey: S.apiKey, model: S.textModel, system: SUMMARY_PROMPT, text: text.slice(-24000) });
    if (out.title) conv.title = String(out.title).slice(0, 80);
    if (out.summary) conv.summary = String(out.summary);
    await db.put('conversations', conv);
    if (location.hash === `#/talk/c/${conv.id}`) render();
  } catch (e) {
    console.warn('summary failed', e);
  }
}

// ---------- recorder
let rec = null;

async function startRecorder({ exerciseId, prompt } = {}) {
  if (rec || call) return;
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { toast('This browser can\'t record audio.'); return; }
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
  } catch (e) {
    toast(e.name === 'NotAllowedError' ? 'Microphone access was blocked. Allow it for this site in your browser settings.' : 'No microphone found.', 6000);
    return;
  }
  const mime = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg'].find((m) => MediaRecorder.isTypeSupported?.(m)) || '';
  const mr = new MediaRecorder(stream, { ...(mime ? { mimeType: mime } : {}), audioBitsPerSecond: 48000 });
  const chunks = [];
  mr.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  mr.start(1000);

  const ex = exerciseId && exById(exerciseId);
  rec = { mr, stream, chunks, mime: mr.mimeType || mime || 'audio/webm', exerciseId: exerciseId || null, prompt: prompt || '', elapsed: 0, last: Date.now(), paused: false };
  $('#rec-prompt-text').textContent = ex ? ex.title : prompt || 'Say whatever\'s there.';
  $('#rec-orb').dataset.state = 'recording';
  $('#rec-status').textContent = 'Recording';
  $('#rec-pause').textContent = 'Pause';
  $('#rec-time').textContent = '0:00';
  $('#rec').hidden = false;
  keepAwake(true);

  // level meter, so it's obvious the mic is hearing something
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    rec.ctx = new AC();
    const an = rec.ctx.createAnalyser();
    an.fftSize = 512;
    rec.ctx.createMediaStreamSource(stream).connect(an);
    const buf = new Uint8Array(an.fftSize);
    const loop = () => {
      if (!rec) return;
      an.getByteTimeDomainData(buf);
      let peak = 0;
      for (const v of buf) peak = Math.max(peak, Math.abs(v - 128));
      $('#rec-orb').style.setProperty('--lvl', rec.paused ? 0 : Math.min(1, peak / 60).toFixed(2));
      rec.raf = requestAnimationFrame(loop);
    };
    loop();
  } catch { /* meter is optional */ }

  rec.timer = setInterval(() => {
    if (!rec.paused) { rec.elapsed += (Date.now() - rec.last) / 1000; }
    rec.last = Date.now();
    $('#rec-time').textContent = clock(rec.elapsed);
  }, 250);
}

function closeRecorder() {
  const r = rec;
  rec = null;
  clearInterval(r.timer);
  cancelAnimationFrame(r.raf);
  r.stream.getTracks().forEach((t) => t.stop());
  r.ctx?.close().catch(() => {});
  $('#rec').hidden = true;
  keepAwake(false);
  return r;
}

async function finishRecorder(save) {
  if (!rec) return;
  const r = rec;
  if (!r.paused) r.elapsed += (Date.now() - r.last) / 1000;
  const stopped = new Promise((res) => (r.mr.onstop = res));
  if (r.mr.state !== 'inactive') r.mr.stop(); else stopped.then(() => {});
  await Promise.race([stopped, new Promise((res) => setTimeout(res, 1500))]);
  closeRecorder();
  if (!save) return;
  const blob = new Blob(r.chunks, { type: r.mime });
  if (!blob.size) { toast('Nothing was recorded.'); return; }
  const ex = r.exerciseId && exById(r.exerciseId);
  const entry = {
    id: uid(), kind: 'recorded', createdAt: Date.now(),
    title: ex ? `${ex.title}, ${fmtDate(Date.now())}` : `Memory, ${fmtDate(Date.now())}`,
    text: '', tags: '', prompt: ex ? '' : r.prompt, exerciseId: r.exerciseId,
    audio: blob, mime: r.mime, duration: Math.round(r.elapsed),
  };
  await db.put('entries', entry);
  navigator.storage?.persist?.();
  location.hash = `#/memories/${entry.id}`;
  await render();
  if (S.autoTranscribe && S.apiKey) runTranscribe(entry.id);
}

async function runTranscribe(id) {
  const e = await db.get('entries', id);
  if (!e?.audio) return;
  if (!S.apiKey) { toast('Add your OpenAI API key in Settings to transcribe.'); return; }
  const onPage = () => location.hash === `#/memories/${id}`;
  const btn = () => (onPage() ? $('#tr-btn') : null);
  if (btn()) { btn().disabled = true; btn().textContent = 'Transcribing…'; }
  try {
    const text = await transcribe({ apiKey: S.apiKey, model: S.sttModel, blob: e.audio, mime: e.mime });
    const fresh = await db.get('entries', id);
    if (!fresh) return;
    fresh.text = text;
    await db.put('entries', fresh);
    if (onPage()) render();
    else toast('Transcript ready.');
  } catch (err) {
    toast(err.message, 6000);
    if (btn()) { btn().disabled = false; btn().textContent = 'Transcribe'; }
  }
}

// ---------- backup / restore
async function backup() {
  toast('Building your export…', 20000);
  const [entries, conversations, checkins] = await Promise.all([db.all('entries'), db.all('conversations'), db.all('checkins')]);
  const files = [];
  const meta = [];
  const used = new Set();
  const name = (dir, t, title, ext) => {
    let base = `${dir}/${dayKey(t)}-${slug(title)}`, n = base, i = 2;
    while (used.has(`${n}.${ext}`)) n = `${base}-${i++}`;
    used.add(`${n}.${ext}`);
    return `${n}.${ext}`;
  };
  for (const e of entries) {
    const { audio, ...rest } = e;
    if (audio) {
      rest.audioFile = name('audio', e.createdAt, e.title, extFor(e.mime));
      files.push({ name: rest.audioFile, data: audio, date: new Date(e.createdAt) });
    }
    meta.push(rest);
    files.push({ name: name('memories', e.createdAt, e.title, 'md'), data: entryMd(e), date: new Date(e.createdAt) });
  }
  for (const c of conversations) files.push({ name: name('conversations', c.startedAt, c.title, 'md'), data: convMd(c), date: new Date(c.startedAt) });
  if (checkins.length) {
    files.push({ name: 'checkins.csv', data: 'date,level,orientation,note\n' + checkins.map((c) => `${c.id},${c.level},${c.side || ''},"${(c.note || '').replace(/"/g, '""')}"`).join('\n') + '\n' });
  }
  const { apiKey, ...settings } = S;
  files.push({ name: 'backup.json', data: JSON.stringify({ app: 'afterword', version: 1, exportedAt: new Date().toISOString(), settings, entries: meta, conversations, checkins }, null, 2) });
  files.push({ name: 'README.txt', data: 'Afterword export.\n\nmemories/       your recorded and written memories as Markdown\naudio/          the original recordings\nconversations/  transcripts of conversations with the companion\ncheckins.csv    daily check-ins\nbackup.json     used by the app to restore everything (More > Restore from a backup)\n' });
  const zip = await makeZip(files);
  S.lastBackup = Date.now();
  saveSettings(S);
  $('#toast').hidden = true;
  await deliver(zip, `afterword-${dayKey()}.zip`);
  if (location.hash.startsWith('#/more') || location.hash.startsWith('#/memories')) render();
}

async function restore(file) {
  try {
    const zip = await readZip(file);
    const manifest = zip.get('backup.json');
    if (!manifest) throw new Error('That zip has no backup.json. It doesn\'t look like an Afterword export.');
    const data = JSON.parse(await manifest.text());
    if (data.app !== 'afterword') throw new Error('That file isn\'t an Afterword export.');
    let n = 0;
    for (const e of data.entries || []) {
      const { audioFile, ...entry } = e;
      if (audioFile && zip.get(audioFile)) entry.audio = new Blob([await zip.get(audioFile).arrayBuffer()], { type: entry.mime || 'audio/webm' });
      await db.put('entries', entry);
      n++;
    }
    for (const c of data.conversations || []) { await db.put('conversations', c); n++; }
    for (const c of data.checkins || []) await db.put('checkins', c);
    if (data.settings) {
      S = { ...S, ...data.settings, apiKey: S.apiKey, lenses: { ...S.lenses, ...(data.settings.lenses || {}) } };
      saveSettings(S);
    }
    toast(`Restored ${n} items.`);
    render();
  } catch (e) {
    toast(e.message || 'Could not read that backup.', 6000);
  }
}

// ---------- actions
const acts = {
  crisis: () => ($('#sheet').hidden = false),
  'sheet-close': () => ($('#sheet').hidden = true),
  focus: (el) => { ui.focus = el.dataset.id; render(); },
  filter: (el) => { ui.filter = el.dataset.id; render(); },
  'prompt-shuffle': () => { ui.prompt = pick(STORY_PROMPTS.filter((p) => p !== ui.prompt)); render(); },

  'call-start': (el) => startCall({ exerciseId: el.dataset.exercise, topicId: el.dataset.topic }),
  'call-end': () => finishCall(),
  'call-mute': (el) => {
    if (!call) return;
    const m = !call.session.muted;
    call.session.setMuted(m);
    el.textContent = m ? 'Unmute' : 'Mute';
    if (call.session.state === 'listening') $('#call-status').textContent = m ? 'Muted' : 'Listening';
  },

  'rec-start': (el) => startRecorder({ exerciseId: el.dataset.exercise, prompt: el.dataset.prompt ? ui.prompt : '' }),
  'rec-pause': (el) => {
    if (!rec) return;
    if (rec.paused) { rec.mr.resume?.(); rec.paused = false; rec.last = Date.now(); } else { rec.elapsed += (Date.now() - rec.last) / 1000; rec.mr.pause?.(); rec.paused = true; }
    el.textContent = rec.paused ? 'Resume' : 'Pause';
    $('#rec-orb').dataset.state = rec.paused ? 'paused' : 'recording';
    $('#rec-status').textContent = rec.paused ? 'Paused' : 'Recording';
  },
  'rec-finish': () => finishRecorder(true),
  'rec-discard': () => { if (!rec || rec.elapsed < 5 || confirm('Discard this recording?')) finishRecorder(false); },
  'rec-shuffle': () => { if (!rec || rec.exerciseId) return; rec.prompt = pick(STORY_PROMPTS.filter((p) => p !== rec.prompt)); $('#rec-prompt-text').textContent = rec.prompt; },

  'write-new': async (el) => {
    const ex = el.dataset.exercise && exById(el.dataset.exercise);
    const entry = { id: uid(), kind: 'written', createdAt: Date.now(), title: ex ? `${ex.title}, ${fmtDate(Date.now())}` : '', text: '', tags: '', prompt: el.dataset.prompt ? ui.prompt : '', exerciseId: ex?.id || null };
    await db.put('entries', entry);
    location.hash = `#/memories/${entry.id}`;
  },
  'entry-transcribe': (el) => runTranscribe(el.dataset.id),
  'entry-audio': async (el) => { const e = await db.get('entries', el.dataset.id); if (e?.audio) deliver(e.audio, `${dayKey(e.createdAt)}-${slug(e.title)}.${extFor(e.mime)}`); },
  'entry-export': async (el) => { const e = await db.get('entries', el.dataset.id); if (e) deliver(new Blob([entryMd(e)], { type: 'text/markdown' }), `${dayKey(e.createdAt)}-${slug(e.title)}.md`); },
  'entry-del': async (el) => { if (!confirm('Delete this for good? There\'s no undo.')) return; ui.pruneId = null; await db.del('entries', el.dataset.id); location.hash = '#/memories'; },

  'conv-export': async (el) => { const c = await db.get('conversations', el.dataset.id); if (c) deliver(new Blob([convMd(c)], { type: 'text/markdown' }), `${dayKey(c.startedAt)}-${slug(c.title)}.md`); },
  'conv-del': async (el) => { if (!confirm('Delete this conversation for good?')) return; await db.del('conversations', el.dataset.id); location.hash = '#/talk'; },
  'conv-to-memory': async (el) => {
    const c = await db.get('conversations', el.dataset.id);
    if (!c) return;
    const text = c.turns.filter((t) => t.role === 'user').map((t) => t.text).join('\n\n');
    const entry = { id: uid(), kind: 'written', createdAt: Date.now(), title: c.title, text, tags: 'from conversation', prompt: '', exerciseId: c.exerciseId || null };
    await db.put('entries', entry);
    toast('Saved your side of it to Memories.');
    location.hash = `#/memories/${entry.id}`;
  },

  'ci-side': (el) => { el.parentElement.querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', c === el && !el.classList.contains('on'))); },
  'checkin-edit': () => { ui.editCheckin = true; render(); },
  'checkin-save': async () => {
    const side = $('#ci-sides .chip.on')?.dataset.id || '';
    await db.put('checkins', { id: dayKey(), createdAt: Date.now(), level: Number($('#ci-level').value), side, note: $('#ci-note').value.trim() });
    ui.editCheckin = false;
    render();
  },

  pacer: () => startPacer(),
  'pacer-stop': () => { stopPacer(); render(); },
  'set-style': (el) => { S.style = el.dataset.id; saveSettings(S); render(); },
  backup: () => backup().catch((e) => toast(e.message || 'Export failed.', 6000)),
  restore: () => $('#restore-file').click(),
};

document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]');
  if (el) { ev.preventDefault(); acts[el.dataset.act]?.(el, ev); return; }
  if (ev.target.id === 'sheet') $('#sheet').hidden = true;
});

// settings and entry fields save as you type
const pending = new Map();
document.addEventListener('input', (ev) => {
  const el = ev.target;
  if (el.dataset.set) {
    const path = el.dataset.set.split('.');
    const val = el.type === 'checkbox' ? el.checked : el.value.trim();
    if (path.length === 2) S[path[0]][path[1]] = val; else S[path[0]] = val;
    saveSettings(S);
  } else if (el.dataset.input === 'ci-level') {
    $('#ci-num').textContent = el.value;
  } else if (el.dataset.input === 'entry') {
    const id = el.dataset.id;
    clearTimeout(pending.get(id + el.dataset.field));
    pending.set(id + el.dataset.field, setTimeout(async () => {
      const e = await db.get('entries', id);
      if (!e) return;
      e[el.dataset.field] = el.value;
      await db.put('entries', e);
      const s = $('#entry-saved');
      if (s) s.textContent = `Saved ${fmtTime(Date.now())}.`;
    }, 400));
  }
});

$('#call-form').addEventListener('submit', (ev) => {
  ev.preventDefault();
  const inp = $('#call-input');
  const text = inp.value.trim();
  if (!text || !call || call.session.dc?.readyState !== 'open') return;
  call.session.sendText(text);
  inp.value = '';
});

$('#restore-file').addEventListener('change', (ev) => {
  const f = ev.target.files[0];
  ev.target.value = '';
  if (f) restore(f);
});

// don't lose a recording or a call to an accidental swipe
window.addEventListener('beforeunload', (ev) => { if (rec || call) { ev.preventDefault(); ev.returnValue = ''; } });

if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
if (!location.hash) location.hash = '#/talk'; else render();
