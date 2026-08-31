# Existing System Inventory

Audited 2026-08-31. Scope: `seany420/calendar-feed-9f2` (this repo) plus 7 other GitHub repos
inspected at the user's direction: `Rayban-Claude-agent`, `Spector`, `Voice`, `mission-control`,
`diagnosis`, `writingclock`, `Book-Tracker`, `21-day-on-`. The account holds ~21 additional
repos (mostly Halloween/horror-themed games and guitar-tab tools — `Horror-Drop`,
`Halloween-Lore`, `Evil-dead`, `tabforge`, `fretboard`, etc.) that share no naming or thematic
connection to this project and were **not** opened; flag if any of those should actually be in
scope.

## Correcting the starting assumptions

The originating project directive assumed a mature "Personal AI Operating System" already
exists — with a shared memory layer, an orchestration brain, a bidirectional Obsidian
integration, RAG/embeddings, and multiple apps wired together. **That system was not found.**
What actually exists is a set of well-crafted but fully independent single-page tools, each with
its own `localStorage`, no shared backend, and no orchestration layer between them. The one
genuine multi-component AI agent project (`Rayban-Claude-agent`) is a fresh, single-commit MVP
scaffold, not yet running against real hardware.

No Obsidian MCP connector is configured for this session, and no vault is mounted in this
container. The only trace of Obsidian in the whole audit is an *optional* `OBSIDIAN_VAULT_PATH`
env var in `Rayban-Claude-agent`, which just adds a second jailed folder to the computer agent's
generic file tool — there is no frontmatter/tag/backlink-aware integration anywhere. If a richer
Obsidian sync exists, it lives outside anything reachable from this account/session (e.g. a
local-only Claude Desktop/Obsidian plugin on the user's own machine) — worth confirming before
any doc claims otherwise.

## Applications

### calendar-feed-9f2 (this repo)
- **Purpose**: passive data-drop. Not an app — a JSON mirror of SPECTER's calendar/todo state.
- **Tech**: static `specter-data.json` + `README.md`, no code.
- **Entry point**: none (data file only).
- **Integrations**: written by SPECTER's client-side JS via the GitHub Contents API; read by a
  "morning brief" skill (referenced in the README, not present in this repo).
- **Status**: working — auto-committed every 30–90s ("SPECTER sync …" commits) whenever the
  SPECTER app is open in a browser tab.
- **Verdict**: **KEEP** as-is. It is correctly scoped as a dumb feed; do not add application logic
  here beyond what this consolidation doc set adds.

### Spector (`seany420/spector`)
- **Purpose**: personal calendar + todo app (the "SPECTER" system).
- **Tech**: single `index.html` (~69KB, ~1,430 lines), vanilla JS, `localStorage`-backed, no build
  step, no framework.
- **Entry point**: `index.html`, deployed via GitHub Pages presumably.
- **Integrations**: GitHub Contents API. User pastes a personal access token into Settings, kept
  in `localStorage` (never hardcoded in source — checked, no literal `ghp_`/`github_pat_`
  strings in the file). On every edit it debounces 2.5s then PUTs `specter-data.json` to
  `calendar-feed-9f2` via `PUT /repos/{owner}/{repo}/contents/{path}`, auto-creating the repo on
  first run if missing.
- **Status**: working, actively used (calendar data is current through 2026-12 events).
- **Verdict**: **KEEP**. This is the actual source of truth for calendar/task data referenced
  throughout the directive's "tasks" and "project context" sections.

### Voice (`seany420/voice`)
- **Purpose**: despite the name, this is **not** a voice-input/orchestration app. It's a guitar/
  sheet-music photo transcription tool — snap a photo of tab or sheet music, it calls Claude's
  vision API directly from the browser to extract the melody line.
- **Tech**: single `index.html` (~81KB), calls `https://api.anthropic.com/v1/messages` directly
  with `anthropic-dangerous-direct-browser-access: true` and a user-pasted API key stored in
  `localStorage`.
- **Status**: working (per code); no server component.
- **Security note**: a browser-side API key, even user-supplied and local-only, is visible to
  anyone with devtools access to that browser session, and the direct-browser-access header
  exists specifically to allow this pattern for personal/local tools. Acceptable for a
  single-user local tool; **do not** reuse this pattern for anything shared or hosted for others.
- **Verdict**: **KEEP** as an independent utility. It is unrelated to the "voice interface to the
  AI OS" concept in the directive — that capability doesn't exist yet anywhere (see
  RAYBAN_INTEGRATION_ANALYSIS.md for the actual voice-agent project).

### mission-control (`seany420/mission-control`)
- **Purpose**: personal health dashboard for prediabetes management (glucose/A1C tracking,
  nutrition/GI-GL logging, education content, meal plans, mood tracking).
- **Tech**: single `index.html` (~58KB), Chart.js via CDN, `localStorage`, PWA-installable.
- **Status**: working, feature-complete per its own README.
- **Verdict**: **KEEP**. Despite the name suggesting a command-center/dashboard for the AI OS,
  it is a domain-specific health tracker with no relation to AI orchestration. Don't repurpose it
  as the "AI OS dashboard" the directive describes — that's a naming coincidence, not shared
  architecture.

### diagnosis / "The Clinical Ledger" (`seany420/diagnosis`)
- **Purpose**: a serious, well-built clinical self-assessment tool — 26 validated psychiatric
  instruments (PHQ-9, GAD-7, PCL-5, etc.), structured biopsychosocial intake, 9 structured
  interview modules, a Bayesian-style probability-weighted differential-diagnosis engine, and
  pharmacotherapy decision trees.
- **Tech**: single `index.html` (~371KB, ~4,800 JS lines), zero dependencies besides Google Fonts,
  `localStorage` only, 96 automated tests reportedly included in the file, MIT licensed.
- **Status**: mature, versioned (schema v3), clearly the most substantial single-file app in the
  account.
- **Verdict**: **KEEP**, unmodified, as a standalone clinical reference tool. This matches the
  clinical/behavioral-health work visible in the SPECTER calendar data (Clinical Committee,
  Case Consultation, Quality of Care Subcommittee entries) — it is real working infrastructure
  for the user's professional context, not a toy.

### writingclock / "FEED THE THING" (`seany420/writingclock`)
- **Purpose**: manuscript/article writing tool with word-count tracking, export to Word-compatible
  HTML.
- **Tech**: single `index.html` (~51KB), `localStorage`.
- **Verdict**: **KEEP**. This is the "writing" piece of the "articles, research, writing" theme —
  independent tool, no integration with anything else currently.

### Book-Tracker / "Bibliotheca" (`seany420/book-tracker`)
- **Purpose**: reading tracker (goals, notes, progress).
- **Tech**: single `index.html` (~93KB) + `manifest.json` + `sw.js` (installable PWA with offline
  service worker — the most "properly packaged" PWA of the set).
- **Verdict**: **KEEP**. Could plausibly feed a future "research/knowledge" layer (book notes →
  knowledge base) but nothing wires it in today.

### 21-day-on- / "Optimistic Nihilism — 21-Day Practice" (`seany420/21-day-on-`)
- **Purpose**: this is the actual "optimistic nihilism" app the user referenced — a 21-day guided
  journaling program built on Terror Management Theory, ACT, and Measurement-Based Care, with two
  validated psychometric scales (ONAS, PFUS) administered on days 1/7/14/21 and outcome graphing.
- **Tech**: single `index.html` (~82KB), `localStorage`, export/import JSON.
- **Verdict**: **KEEP**. Directly relevant to the "Beyond Meaning"/existential-anxiety themes in
  the directive — this is existing, working, on-topic content, not something to rebuild.

### Rayban-Claude-agent (`seany420/rayban-claude-agent`)
- **Purpose**: the actual AI-agent project — see `docs/RAYBAN_INTEGRATION_ANALYSIS.md` for the
  full breakdown. Summary: iPhone SwiftUI app (voice I/O + wearables) talks over an authenticated
  WebSocket to a local Node/TypeScript "computer agent" that holds the Anthropic API key, runs a
  manual tool-use loop, gates dangerous actions behind spoken confirmation, and can drive local
  MCP servers and headless Claude Code.
- **Tech**: computer-agent is TypeScript (Node 20+, `@anthropic-ai/sdk`,
  `@modelcontextprotocol/sdk`, `ws`, vitest); iOS side is SwiftUI (never compiled — built in a
  Linux dev environment with no Xcode available).
- **Status**: computer-agent reportedly builds, typechecks, and passes its full test suite (47
  tests) in its dev environment. iOS app exists as source but is unverified/uncompiled. Only one
  commit in its git history — this is a fresh scaffold, not a battle-tested system.
- **Security posture**: no secrets committed (checked — `.env.example` only, real `.env`
  correctly gitignored); HMAC-authenticated + TLS WebSocket between phone and agent; filesystem
  access jailed to a configured `WORKSPACE_PATH` with symlink-escape checks; tool/file/MCP output
  explicitly treated as untrusted in the system prompt (documented anti-prompt-injection stance).
- **Verdict**: **KEEP and continue building** — this is the correct architectural seed for
  everything the directive calls "AI orchestration layer," "tool architecture," and the
  confirmation/permission model. Do not replace it with a new design; finish it.

## AI capabilities inventory

| Capability | Where it actually exists | Notes |
|---|---|---|
| Claude API integration (server-side, tool use) | `Rayban-Claude-agent/computer-agent` | Manual agentic loop, streaming, confirmation-gated tools. |
| Claude API integration (browser, direct) | `Voice` (guitar transcription) | Vision call only, single-purpose, not general orchestration. |
| MCP support | `Rayban-Claude-agent` | Local stdio MCP servers (filesystem, github) via `@modelcontextprotocol/sdk`; both disabled by default in the example config. |
| Headless Claude Code invocation | `Rayban-Claude-agent/computer-agent/src/claudeCode` | Shells out to `claude -p ...`; unexercised end-to-end per its own docs. |
| Memory (persistent, structured) | **none found** | No memory store, no vector DB, no embeddings anywhere in the 8 repos audited. |
| RAG / embeddings | **none found** | — |
| Obsidian read/write | **none found as a real integration** | Only a generic filesystem-jail path option in the computer agent. |
| Intent detection / routing | `Rayban-Claude-agent/computer-agent/src/intent/intentRouter.ts` | Rule-based fast path for safety-critical intents (confirm/cancel), Claude-based classification for everything else. |
| Research mode | **none found** | Not implemented anywhere. |
| Document intelligence (PDF/DOCX/etc.) | **none found** | — |
| Activity/audit log | `Rayban-Claude-agent` confirmation manager | Logs confirmation decisions only, not general activity. |

## Security findings

- No hardcoded API keys, GitHub tokens, or other secrets found in any of the 8 repos (checked for
  `ghp_…`, `github_pat_…`, `sk-…` literals and common key-shaped strings).
- `Voice` and `Spector` both rely on user-pasted credentials stored in browser `localStorage` and
  used directly from client-side JS — an accepted pattern for single-user local tools, but it
  means credentials are exposed to anyone with devtools access to that browser profile. Fine as-is
  for personal use; do not extend this pattern to anything shared or multi-user.
  Note: `Spector`'s current GitHub token appears to hold **repo-write** access (it creates
  repos and pushes contents), which is broader than the single-file write it actually needs —
  consider scoping a fine-grained PAT to just `calendar-feed-9f2` contents if GitHub's
  fine-grained tokens support that scope, to reduce blast radius if the token ever leaked.
- `Rayban-Claude-agent`'s `.env.example` is properly scrubbed; the real `.env` is correctly
  excluded from git.
- The computer agent's design explicitly treats tool/file/MCP output as untrusted content in the
  system prompt — a real, deliberate mitigation against prompt injection via files or tool
  results, worth preserving as-is in any consolidation.

## What should NOT be touched

Every app above is independently working, self-contained, and has no coupling to the others.
None of them need to be merged, replaced, or retired — consolidation should be additive (a shared
layer *around* them), not a rewrite of any of them.

## Open questions for the user

1. Is there a real Obsidian vault integration running somewhere this session/account can't see
   (e.g., local Claude Desktop config on your own machine)? If so, what does it actually do today,
   so the architecture doc doesn't invent capabilities.
2. Should any of the ~21 unreviewed repos (game/guitar-tool repos) actually be pulled into this
   audit, or are they confirmed out of scope?
3. Is `mission-control`'s name a coincidence, or was it originally intended to become the AI OS
   dashboard before it turned into a health tracker? Worth knowing before a new dashboard reuses
   that name.
