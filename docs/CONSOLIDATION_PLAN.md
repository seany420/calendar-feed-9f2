# Consolidation Plan

Ranked per the directive's own scheme. Every item is additive — nothing here proposes deleting,
replacing, or rewriting any of the working apps catalogued in `EXISTING_SYSTEM_INVENTORY.md`.

## P0 — Critical (blocking before anything else makes sense)

### P0.1 — Confirm the Obsidian question
- **What exists**: no Obsidian integration reachable from this account/session; only an optional
  raw folder path in `rayban-claude-agent`'s `.env`.
- **What changes**: nothing yet — this is a question, not code. Ask the user directly whether a
  vault sync already runs somewhere outside this session (e.g., local Claude Desktop config on
  their own machine) before any doc or plan assumes one exists.
- **Why P0**: several later items (memory design, knowledge-layer design) depend on knowing
  whether real Obsidian content already exists to connect to.
- **Risk of skipping**: designing a rich Obsidian integration around a system that isn't there
  wastes the highest-leverage part of this whole project.

### P0.2 — Get the iOS app compiled once
- **What exists**: SwiftUI source, `project.yml`, tests — never built (no Xcode available in this
  dev environment).
- **What changes**: on a real Mac, run `xcodegen generate && open RayBanClaude.xcodeproj`, fix
  whatever first-compile issues surface (expected for code that's never been built), confirm the
  Simulator voice loop works end-to-end.
- **Dependencies**: a Mac with Xcode — not available in this session.
- **Risk/complexity**: low complexity, but requires hardware/environment this session doesn't
  have. The browser-talk-page path (already working) is a legitimate fallback in the meantime.

## P1 — High priority

### P1.1 — Calendar/todo read tool in the computer agent
- **What exists**: `Spector` syncs `specter-data.json` to `calendar-feed-9f2`; the computer agent
  has a generic `WorkspaceFsTool` but no calendar-aware tool.
- **What changes**: add one small tool that fetches/parses `specter-data.json` (either via the raw
  GitHub URL Spector already publishes, or via a local clone if `WORKSPACE_PATH`/
  `OBSIDIAN_VAULT_PATH` is pointed at it) and answers "what's on my calendar" / "what are my
  todos" style questions.
- **What's preserved**: `Spector` itself is untouched — it keeps writing the same file the same
  way.
- **Dependencies**: none beyond P0.2's fallback (the browser talk page already works without it).
- **Risk**: low. Read-only, no confirmation gating needed (§17).
- **Complexity**: small — a fetch + JSON parse + a few Claude-facing tool descriptions.

### P1.2 — Typed-prompt web client
- **What exists**: the WebSocket protocol (`docs/PROTOCOL.md`) already supports any client that
  speaks it; today only the iPhone app and the browser talk page do.
- **What changes**: a minimal text-input page (or extend the existing talk page) that sends
  `user_utterance` messages without audio, satisfying §6's "text and voice reach the same
  orchestration layer" requirement with no new business logic.
- **Dependencies**: none.
- **Risk**: low — read/write behavior is governed entirely by existing confirmation rules.

## P2 — Useful

### P2.1 — Confirm DAT mic-streaming and exercise the Claude Code intent
- Per `RAYBAN_INTEGRATION_ANALYSIS.md` §5 — needs the live (currently unreachable from this
  session) Meta developer docs, and a real `claude` CLI session to test against.
- **Risk**: capability may turn out unsupported; the existing `MetaWearablesService` abstraction
  already isolates this so no other code needs to change either way.

### P2.2 — Read-only app-data tools, one at a time, only on request
- **What exists**: each single-page app supports JSON export (`Book-Tracker`, `mission-control`,
  `diagnosis`, `21-day-on-` all have explicit export/import).
- **What changes**: if/when the user wants the agent to answer "what have I logged in my Optimistic
  Nihilism journal this week," add a narrow tool that reads that specific export format. Build one
  only when there's a real request for it — don't pre-build bridges for all seven apps
  speculatively (this is exactly the over-engineering the brief warns against in §28).
- **Dependencies**: P1.1 as the template for "how a new read tool gets added."

### P2.3 — GitHub token scope reduction for Spector
- Per the security finding in `EXISTING_SYSTEM_INVENTORY.md`: check whether GitHub's fine-grained
  PATs can be scoped to just `calendar-feed-9f2` contents, and if so, have the user swap Spector's
  token for a narrower one. No code change in Spector itself required if fine-grained token scopes
  are compatible with the existing Contents-API calls.

## P3 — Future

### P3.1 — Real persistent memory
- Deliberately not designed yet (see `AI_OS_ARCHITECTURE.md`). Design it after P1.1/P1.2 produce
  at least one real "the agent should remember this" interaction to model the schema against,
  per the directive's own §11 guidance that not everything should become permanent memory.

### P3.2 — Genuine Obsidian integration
- Blocked on P0.1's answer. If a vault exists and should be connected, scope it to read + create
  notes first (§17's "automatic" tier), with update/delete requiring confirmation, following the
  existing `ConfirmationManager` pattern rather than inventing a new permission system.

### P3.3 — Research mode / document intelligence
- Nothing in the current codebase to build on. New work, correctly last in priority since no
  existing functionality depends on it.

## Summary table

| Item | Priority | What exists | Depends on | Risk |
|---|---|---|---|---|
| Confirm Obsidian status | P0 | Nothing found | — | Wrong assumptions downstream |
| Compile iOS app | P0 | Uncompiled source | Mac + Xcode | Environment-only, code risk low |
| Calendar read tool | P1 | Spector + feed repo | — | Low |
| Typed-prompt web client | P1 | Existing protocol | — | Low |
| DAT mic-streaming confirmation | P2 | Unconfirmed docs | Live Meta docs | Capability may not exist |
| Read-only app-data tools | P2 | Export/import in each app | P1.1 pattern | Low, build on demand only |
| Spector token scope reduction | P2 | Broad-scope PAT today | GitHub fine-grained PAT support | Low |
| Persistent memory | P3 | Nothing found | Real usage from P1 | Design risk if built too early |
| Obsidian integration | P3 | Nothing found | P0.1 | Depends entirely on P0.1's answer |
| Research mode | P3 | Nothing found | — | New build, no urgency |
