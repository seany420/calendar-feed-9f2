# Existing System Inventory

**This replaces the version written under the prior, more sweeping "Personal AI OS" prompt.**
That run didn't know about the Obsidian vault, the `program-repository-`/launchpad app, or several
other pieces found here. Nothing from that run is assumed below — everything here was re-verified
in this session: repos cloned and read directly, or (for the Obsidian vault) inferred from a
concrete, user-authored configuration file rather than guessed.

Audited 2026-08-31, same container/session as before (clones persisted on disk). Scope: the 9
repos opened previously (`calendar-feed-9f2`, `Rayban-Claude-agent`, `Spector`, `Voice`,
`mission-control`, `diagnosis`, `writingclock`, `Book-Tracker`, `21-day-on-`) plus 6 more opened
this pass (`Flash`, `fretboard`, `tabforge`, `tablitureforge`, `Program-repository-`,
`verbose-palm-tree`) — 15 of the ~29 repos on the account. The remaining ~14
(`Horror-Drop`, `Halloween-Advent-Calendar-`, `Halloween-Lore`, `Evil-dead`, `Kookie-Game`,
`Pookie-Game`, `Skate-or-bleed[-revised]`, `Keep-your-head`, `Haunted-brain`, `Slasher`,
`Stretchy`, `Feed-it-exercise-`, `Horror-diagnosis`) were **not opened** — marked UNKNOWN below,
with what the launchpad data (see §2) says about the ones it names.

## 1. Obsidian vault — confirmed real, not reachable from this session

**Status: confirmed to exist. Access from here: none.**

No Obsidian MCP server, connector, or mounted filesystem path exists in this remote session —
checked `ListConnectors`, the session's MCP config, and the container filesystem directly. But a
**user-authored** skill file synced into this account's skill library
(`obsidian-research-writer`, marked `source: custom`) documents the vault concretely:

- **Location**: `C:\Users\seanm\OneDrive\Documents\Obsidian Vault` — a Windows path, synced via
  OneDrive. This is a different machine/session entirely from this remote Linux container.
- **Access mechanism**: plain filesystem read (`Read every .md file in the specified folder(s)`)
  — no Obsidian plugin, no MCP server, no sync API. This only works when Claude Code/Desktop runs
  **locally** on that Windows machine with the OneDrive folder actually mounted.
- **Write access: unconfirmed, likely manual/one-way.** The skill's own output step produces a
  `.md` draft described as "ready to paste into Obsidian" — i.e., the skill does not write back
  into the vault itself; the user pastes the result in by hand. Nothing in this skill or elsewhere
  in this audit shows Claude writing directly into vault files.
- **Reliability caveat, in the skill's own words**: a note left in the file says the vault "was
  not mounted during the session when this skill was updated" — meaning even locally, access
  depends on OneDrive actually being synced and mounted at that path when the session starts, not
  something you can assume is always live.
- **Folder structure** (per the skill file): `00 - Inbox/`, `10-Research/` (10.1 Theory, 10.2
  Empirical, 10.3 Clinical), `20-Ideas/`, `30-Projects/`, `40-Clinical/`, `50-Philosophy/`
  (optimistic nihilism, TMT), `60-Psychology-Sociology/`, `80-References/`, `90-Meta/Templates/`.
  Research notes follow a template: YAML frontmatter (`citation_apa`, `authors`, `year`, `journal`,
  `doi`) + `## Key Findings` + `## AI Summary` + `## Citation` fallback.
- **The 7 named philosophy vaults** (Adler, Marx, Weber, Nietzsche, Becker, *The Worm at the
  Core*, *Handbook of TMT*) are independently corroborated — the `program-repository-` launchpad
  data (§2) has a line item: "Obsidian Philosophy Vaults... 7 drop-in vaults... All 7 delivered
  June 2026. Drop-in zip format." That means these were generated as a zip and manually imported
  into the vault at some point — they are vault **content**, not something tracked in any git repo
  this session can see.

**Call: UNKNOWN for what's actually usable — the vault plainly exists and has real structure and
content, but nothing about it is reachable or verifiable from this remote session.** To act on it
at all, either (a) run the control-center work from a local Claude Code/Desktop session on the
Windows machine with the vault mounted, or (b) tell me another way to reach it from here (a
synced copy, an export, a connector). I'm not going to guess vault contents beyond what this
config file already states.

## 2. The launchpad — likely already found

**`Program-repository-`** (deployed page title: "SDJ · Project Repository") is a single-file
React app (localStorage-backed, ~320 lines) that is almost certainly the launchpad described in
the brief, or a direct source/copy of it. Evidence: its own hardcoded project list includes an
entry for "Feed The Thing" whose `url` field is literally `https://seany420.github.io` — i.e.,
the app's own data describes itself as living at that address.

I could not independently confirm the live `seany420.github.io` site: no repo named
`seany420/seany420.github.io` is visible to this session's GitHub access (checked via the repo
list and a direct lookup — not found or not authorized), and this sandbox's network egress
policy blocks fetching arbitrary custom domains including that one (confirmed: blocked by the
proxy, same as it would be for the Substack). **So: the launchpad's existence and content is
corroborated by strong internal evidence, but the live site and its exact current state are
UNVERIFIED from here.** Two live possibilities, and I'd need you to confirm which: either a
separate `seany420.github.io` repo exists that this session's GitHub connection just isn't
authorized for, or the Pages site is deployed from this repo under a different mechanism.

What the app's own hardcoded catalog (18 entries, as of ~June 2026) lists — useful as a
cross-check against everything else in this inventory:

| Entry | Category | Status (per its own data) |
|---|---|---|
| Feed The Thing | Apps & Tools | Live — matches `writingclock` in this account |
| Scream Profile / Horror Diagnosis | Apps & Tools | Active — **not the same app as `diagnosis`/Clinical Ledger**; a separate horror-themed psychological screening tool, presumably in the `Horror-diagnosis` repo (not opened this session) |
| Clinical Ledger | Clinical & Research | Active — matches `diagnosis` in this account |
| Mission Control | Apps & Tools | Active — matches `mission-control` |
| IFS-BPD Screening Tool | Clinical & Research | Complete — not found in any repo opened so far; UNKNOWN location |
| PT Home Exercise Program | Personal | Live — not found in any repo opened so far; UNKNOWN location |
| OCD Brain Neuroscience Visualization | Apps & Tools | Complete — UNKNOWN location |
| Burnout Review Cards + Flashcard Apps | Apps & Tools | Complete — a *second*, separate flashcard app from `Flash`/"Void Deck"; UNKNOWN location |
| MBI & AAQ-II PowerPoint Decks | Clinical & Research | Complete — UNKNOWN location |
| Obsidian Philosophy Vaults | Philosophy & ON | Active — see §1 |
| The Cheerful Void | Writing | Active — Substack, external, matches `Flash`'s "Void Deck" branding |
| Positive Nihilism (manuscript) | Writing | In Progress — the ON book, ~75k words, composite character "Maya"; UNKNOWN where the Scrivener file itself lives (not in any repo — expected, Scrivener projects aren't typically git-tracked as plain text) |
| Horror Movies in Therapy — Clinical Manual | Writing | In Progress — noted as living in a separate Claude Project, not a repo |
| ON for Anxiety — ACT Facilitator's Guide | Writing | Complete — UNKNOWN location |
| ONAS / PFUS Scales | Clinical & Research | Complete — the two self-authored psychometric instruments named in the brief; UNKNOWN if tracked anywhere versioned |
| IBH Peer Review QI Manuscript | Clinical & Research | In Progress — matches the brief's "IBH peer review QI manuscript"; UNKNOWN location |
| EXTRACT Research Tool | Apps & Tools | Complete — UNKNOWN location |
| UCSD Burnout Presentation | Clinical & Research | Complete — UNKNOWN location |

Notably absent from this catalog: `Spector`/SPECTER, `Rayban-Claude-agent`, `Voice`, `Book-Tracker`,
`21-day-on-`, and the guitar apps (`fretboard`/`tabforge`/`tablitureforge`). Either the catalog
predates them or they were never added — worth knowing before treating this as a complete list.
Also worth flagging: the app loads from `localStorage` first and only falls back to this
hardcoded list if empty — so whatever's live on the actual deployed site may already differ from
what's checked into this repo, and edits made through the live UI don't sync back to git.

**Call: this is very likely already ~80% of the control center the brief asks for** — a working,
searchable, categorized, linked catalog with live/chat-link buttons per project. Recommend
extending it (add missing repos, wire it to also surface Obsidian-note search once §1 is
resolved) rather than building a new dashboard. See summary at the end for what "extending" would
concretely take.

## 3. SPECTER / Ray-Ban — verified against actual code, not assumed

**Status: SPECTER is a real, working voice-controlled PWA. It does not use any Ray-Ban/Meta-specific
API.** Checked directly in `Spector/index.html`:

- Voice input/output is implemented with the standard browser **Web Speech API**
  (`SpeechRecognition`/`webkitSpeechRecognition` for input, speech synthesis for TTS output) — real,
  working code: listens, parses commands, asks for spoken yes/no confirmation before adding
  events, supports a hands-free mode that re-arms listening after each turn.
  This is not a mockup — the command parsing, confirmation flow, and TTS feedback are fully
  implemented.
- "Ray-Ban glasses" support is exactly the same mechanism documented in `Rayban-Claude-agent`'s own
  README: the glasses register as a **generic Bluetooth microphone/speaker** at the OS level, and
  if the user sets them as the default mic/speaker, the browser's standard Web Speech API picks up
  audio through them. There is no Meta Wearables SDK, no DAT integration, no Bluetooth-pairing code
  specific to Meta hardware anywhere in this file. The in-app copy ("I hear you through the
  glasses") is UI framing over the same OS Bluetooth-headset trick, not a hardware integration.
- Also has working ICS (Outlook/any calendar) import with RRULE parsing, and the GitHub Contents
  API sync into this repo (previously verified).

**Call: KEEP.** This is a genuinely functional voice-controlled calendar/task app. The "pairs with
Ray-Ban glasses" framing is accurate only in the loose Bluetooth-headset sense — not a fair
description as a dedicated Meta-hardware integration, and shouldn't be treated as one when
planning further Ray-Ban work (see the separate `Rayban-Claude-agent` project for that).

## 4. Guitar apps — a real duplication found

- **`tabforge`** ("TabForge — Guitar Tab Editor", public, 875 lines): a tab editor. Distinct
  purpose from the other two. **KEEP**, no overlap.
- **`fretboard`** (private) and **`tablitureforge`** (public) are **the same app** — both titled
  "AXELAB — Advanced Guitar Trainer," identical manifest, near-identical code. `tablitureforge`
  has strictly more: a "Riff Lab" (paste/import a riff, find matching scales/keys) and audio
  engine improvements (dynamics compressor, per-technique gain staging) that `fretboard` lacks.
  This looks like `fretboard` was the earlier/private working copy and `tablitureforge` is the
  newer, public, actively-developed one — or the reverse naming history; direction unconfirmed.
  **Call: MERGE** — pick one canonical repo (recommend `tablitureforge`, since it's the more
  complete version) and either archive or explicitly retire the other, rather than maintaining
  two copies of the same app that will keep drifting apart.

## 5. Full per-project table

| Project | Purpose | Tech | Location | Status | Call |
|---|---|---|---|---|---|
| calendar-feed-9f2 | Data mirror of SPECTER's calendar/todo state | Static JSON | this repo | Working, auto-synced every 30–90s | KEEP |
| Spector | Voice-controlled calendar/task PWA ("SPECTER") | Single-file HTML/JS, Web Speech API, GitHub Contents API sync | `seany420/Spector` | Working, verified (§3) | KEEP |
| Rayban-Claude-agent | iPhone+computer-agent voice assistant, Claude-backed, MCP/Claude-Code capable | SwiftUI (uncompiled) + Node/TS (tested, 47 passing) | `seany420/Rayban-Claude-agent` | Computer agent works; iOS never compiled; single-commit scaffold | KEEP, continue building |
| Voice | Guitar/sheet-music photo transcription via Claude vision API | Single-file HTML, direct browser→Anthropic API call, user-pasted key | `seany420/Voice` | Working | KEEP (note: name is misleading — not a general voice-input tool) |
| mission-control | Prediabetes health dashboard | Single-file HTML, Chart.js, localStorage | `seany420/mission-control` | Working, feature-complete | KEEP |
| diagnosis ("The Clinical Ledger") | Clinical self-assessment: 26 instruments, probability-weighted differential, pharmacotherapy trees | Single-file HTML (~371KB), localStorage, 96 tests reported | `seany420/diagnosis` | Working, mature (schema v3) | KEEP |
| writingclock ("FEED THE THING") | Manuscript/writing tool, word-count + export | Single-file HTML, localStorage | `seany420/writingclock` | Working | KEEP — likely the launchpad's #1 catalog entry |
| Book-Tracker ("Bibliotheca") | Reading tracker | Single-file HTML + manifest + service worker (installable PWA) | `seany420/Book-Tracker` | Working | KEEP |
| 21-day-on- ("Optimistic Nihilism — 21-Day Practice") | 21-day TMT/ACT journaling program, 2 validated scales (ONAS, PFUS) | Single-file HTML, localStorage | `seany420/21-day-on-` | Working | KEEP |
| Flash ("Void Deck — The Cheerful Void") | Flashcard deck app for Cheerful Void/ON content | Single-file HTML, flip-card UI, localStorage | `seany420/Flash` | Working (verified structure; not fully read) | KEEP |
| Program-repository- ("SDJ · Project Repository") | Project launchpad/catalog — very likely the seany420.github.io site | Single-file React (CDN), localStorage | `seany420/Program-repository-` | Working; live-site link unverified (§2) | KEEP, extend — likely core of the control center |
| tabforge | Guitar tab editor | Single-file HTML | `seany420/tabforge` | Working | KEEP |
| tablitureforge | Guitar trainer ("AXELAB"), newer/fuller | Single-file HTML | `seany420/tablitureforge` | Working, ahead of `fretboard` | KEEP as canonical (see §4) |
| fretboard | Guitar trainer ("AXELAB"), older/behind copy | Single-file HTML | `seany420/fretboard` | Working but stale relative to tablitureforge | MERGE into tablitureforge (§4) |
| verbose-palm-tree | Unknown — auto-generated repo name, README only, no other content | — | `seany420/verbose-palm-tree` | Empty/abandoned | RETIRE (confirm nothing was meant to go here before deleting) |
| Horror-diagnosis | "Scream Profile" — horror-themed psychological screening (per launchpad data only) | Unknown | `seany420/Horror-diagnosis` | Not opened this session | UNKNOWN |
| Horror-Drop, Halloween-Advent-Calendar-, Halloween-Lore, Evil-dead, Kookie-Game, Pookie-Game, Skate-or-bleed[-revised], Keep-your-head, Haunted-brain, Slasher, Stretchy, Feed-it-exercise- | Presumed games/hobby projects by name; not in the launchpad catalog | Unknown | account repos | Not opened this session | UNKNOWN |
| IFS-BPD Screening Tool, PT Home Exercise Program, OCD Brain Visualization, Burnout Review Cards/Flashcards, MBI & AAQ-II Decks, ON for Anxiety ACT Guide, ONAS/PFUS Scales (as a tracked artifact), IBH QI Manuscript, EXTRACT Research Tool, UCSD Burnout Presentation | Per launchpad catalog only | Unknown | Not found in any repo opened this session | UNKNOWN — ask where these live (another repo? local files? Obsidian vault?) |
| Positive Nihilism manuscript, T-CARE provider survey instrument | Per the brief; Scrivener/local files presumed | Scrivener (manuscript); unknown (T-CARE) | Not a git artifact by nature (Scrivener) / not found | UNVERIFIED — expected not to be in git; confirm where each actually lives if you want them wired into the control center |
| seany420.github.io | The Pages site itself | Unknown/likely = Program-repository- | Not accessible from this session (§2) | UNVERIFIED |
| Obsidian vault | Research/writing knowledge base | Markdown files, OneDrive sync | `C:\Users\seanm\OneDrive\Documents\Obsidian Vault` (local machine only) | Exists, structure confirmed; reachability from any Claude session depends on where that session runs (§1) | KEEP as-is; don't touch structure |

## 6. MCP servers actually configured (this remote session)

Checked the session's live MCP config directly: `github`, `Audible`, `Spotify`, `PubMed`, `Canva`,
plus `ICD-10 Codes`, `Scite`, and `Play Sheet Music` (deferred tools, confirmed available). None of
these are Obsidian- or vault-related. No local MCP servers are configured in this remote session
beyond what's built into `Rayban-Claude-agent` itself (disabled-by-default `filesystem`/`github`
stdio servers in its own example config, previously audited).

## 7. Security — flagged, not fixed

Same findings as the prior audit hold (re-verified, nothing new found this pass):

- No hardcoded API keys, GitHub tokens, or secrets in any of the 15 repos checked (searched for
  `ghp_…`, `github_pat_…`, `sk-…`-shaped literals).
- `Spector` and `Voice` both use user-pasted credentials stored in browser `localStorage`, called
  directly from client-side JS. Acceptable for personal single-user tools; `Spector`'s GitHub
  token currently appears to hold repo-write scope (it can create repos), broader than the
  single-file write it performs — worth narrowing to a fine-grained, single-repo-scoped PAT if
  GitHub's token model supports it.
- `Rayban-Claude-agent`'s `.env.example` is clean; no real `.env` committed.
- No obviously broken code found in anything actually opened. Nothing evaluated as UNKNOWN above
  has been checked for security issues yet — flag when opened.

## 8. Open questions for you

1. **Is `Program-repository-` really the source of `seany420.github.io`, or is that a separate
   repo I need access to?** If separate, either share it or note that this session's GitHub
   connection needs it added.
2. **Where do the ten UNKNOWN-location items in §5 actually live** (IFS-BPD tool, PT HEP, OCD viz,
   burnout flashcards, MBI/AAQ-II decks, ON-for-Anxiety guide, ONAS/PFUS as a tracked file, IBH QI
   manuscript, EXTRACT tool, burnout presentation)? Another repo, local files, the Obsidian vault,
   or a Claude Project (the launchpad references several by `chatUrl`, suggesting some only ever
   existed as Claude conversation outputs, never saved anywhere durable)?
3. **Do you want the 13 unopened repos checked**, or are they confirmed out of scope (games/hobby
   projects unrelated to this project)?
4. **`fretboard` vs `tablitureforge`** — can you confirm which one you actually use/deploy, so the
   merge direction in §4 is right before anything gets archived?
5. **Obsidian vault reachability (§1)** — do you want this control-center work to actually run from
   a local Claude Code/Desktop session on the Windows machine (where the vault and Scrivener files
   are), or is there another way to expose vault content to a remote session like this one?
