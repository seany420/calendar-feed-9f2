# AI OS Architecture — Current State and Target

## Read this first

The audit (`EXISTING_SYSTEM_INVENTORY.md`) found no existing orchestration layer, memory system,
or Obsidian integration to consolidate — those don't exist yet in any repo reachable from this
account. What exists is: a calendar/todo data feed (`calendar-feed-9f2` + `Spector`), a set of
independent single-page personal tools (health tracker, clinical self-assessment, writing tool,
reading tracker, 21-day journaling program, guitar transcription tool), and one real but unbuilt
AI agent project (`Rayban-Claude-agent`). This document proposes a target architecture sized to
that reality — not to the much larger system the originating brief assumed already existed.
Per the brief's own instruction (§28), this stays intentionally small: no new databases, no
microservices, no agent framework beyond what `Rayban-Claude-agent` already has.

## Existing architecture (as-built, today)

```mermaid
flowchart LR
    subgraph Independent single-page apps (each its own localStorage, no shared state)
        Spector[Spector<br/>calendar/todo]
        MC[mission-control<br/>health tracker]
        CL[diagnosis<br/>Clinical Ledger]
        WC[writingclock<br/>manuscript tool]
        BT[Book-Tracker]
        ON[21-day-on-<br/>Optimistic Nihilism]
        VO[Voice<br/>guitar transcription]
    end
    Spector -- "GitHub Contents API<br/>(user PAT)" --> Feed[(calendar-feed-9f2<br/>specter-data.json)]
    Feed -. read by .-> Brief[morning brief skill<br/>referenced, not in-repo]
    VO -- "direct browser call" --> AnthropicAPI[api.anthropic.com]

    subgraph rayban-claude-agent (separate, unbuilt-on-hardware)
        iOS[iPhone SwiftUI app] -- "wss, HMAC+TLS" --> Agent[Computer agent<br/>Node/TS]
        Agent --> Claude[Anthropic Messages API]
        Agent --> FS[Jailed workspace filesystem]
        Agent --> MCPs[Local MCP servers<br/>disabled by default]
        Agent --> CC[Claude Code CLI<br/>headless]
    end
```

No arrows connect the single-page apps to `rayban-claude-agent` or to each other. That's the gap
the consolidation plan addresses — not a rewrite, an *additive* connective layer.

## Target architecture

Keep every existing app exactly as it is. Add one thing: let the already-built
`rayban-claude-agent` computer agent (Node/TypeScript, already has an `IntentRouter`, a
`ToolRegistry`, an `MCPRegistry`, and a confirmation gate) also read/write the data these apps
already produce, instead of building a second brain.

```mermaid
flowchart TB
    subgraph Inputs (modality-independent by the time they reach the agent)
        Text[Typed prompt]
        Voice[Voice via iPhone/glasses<br/>or browser Bluetooth-headset path]
    end
    Text --> Router
    Voice -- "on-device transcription<br/>(Apple Speech / browser SpeechRecognition)" --> Router

    Router[IntentRouter<br/>existing, in computer-agent] --> Session[AgentSession state machine<br/>existing]
    Session --> ClaudeSvc[ClaudeService<br/>existing]
    ClaudeSvc --> Tools[ToolRegistry]

    Tools --> WS[WorkspaceFsTool<br/>existing: jailed filesystem]
    Tools --> NewCal[new: calendar/todo tool<br/>reads/writes Spector's synced JSON]
    Tools --> NewApp[new: app-data tool<br/>reads exported JSON from the<br/>single-page apps, read-only at first]
    Tools --> MCPs[MCPRegistry<br/>existing]

    Session --> Confirm[ConfirmationManager<br/>existing: gates destructive/consequential actions]
    Session --> Log[Activity log<br/>extend existing confirmation<br/>audit log to all tool calls]
```

### Why this shape and not something bigger

- The computer agent already has the pieces the brief calls "orchestration layer," "tool
  architecture," and "permissions" (§9, §10, §17) — INTENT → CONTEXT → REASONING → TOOL → ACTION →
  RESULT is already `IntentRouter → AgentSession → ClaudeService → ToolRegistry → confirmation →
  response`. Building a second orchestration layer elsewhere would violate "one canonical AI OS
  brain" (§9) by creating two.
- Text and voice already converge on the same backend by construction: the iPhone app's
  `AgentClient` and the browser talk page both speak the identical WebSocket protocol into the
  same `AgentSession`. A typed-prompt web UI is just a third client of that same protocol — no new
  business logic needed, matching §6's requirement directly.
- Memory and Obsidian integration are deliberately **not** designed here in detail, because no
  real usage pattern exists yet to design against. Recommendation: don't build a memory store
  before there's at least one working "save this" / "recall this" round-trip through the agent.
  Start with the narrowest possible version (see Consolidation Plan, P1) and let real use shape
  the schema, rather than pre-building the seven-tier memory taxonomy in §11 speculatively.

### Data flow for a concrete example

`"What do I have going on this week?"` (voice, through the glasses-as-Bluetooth-headset path):

1. Browser talk page captures speech → Web Speech API transcribes → sent as `user_utterance` over
   the existing WebSocket protocol.
2. `IntentRouter` classifies as a read/query intent (automatic, no confirmation needed per §17).
3. New `calendar tool` (the only genuinely new code in this flow) reads `specter-data.json` — either
   by fetching the raw GitHub URL Spector already publishes, or, if the computer agent's
   `WORKSPACE_PATH`/`OBSIDIAN_VAULT_PATH` is pointed at a local clone of `calendar-feed-9f2`, via
   the existing `WorkspaceFsTool` with zero new code.
4. `ClaudeService` reasons over the returned events, composes an answer.
5. Response streams back over the same WebSocket, chunked on sentence boundaries for TTS
   (existing `sentenceChunker.ts`), spoken through the glasses' Bluetooth audio route.

No new AI logic, no new memory system — one small new tool.

## Components

| Component | Status | Role |
|---|---|---|
| Computer agent (`rayban-claude-agent/computer-agent`) | Exists, tested | The one orchestration brain |
| iPhone app | Exists, unbuilt on hardware | Voice/wearable client |
| Browser talk page | Exists, working | Voice client requiring no iOS build |
| `Spector` | Exists, working | Source of calendar/todo truth, synced to `calendar-feed-9f2` |
| `calendar-feed-9f2` | Exists, working | Read surface for calendar/todo data |
| New: calendar/todo tool | To build (P1) | Lets the agent read (and later write) Spector's data |
| New: typed-prompt web client | To build (P1/P2) | Third client of the existing WebSocket protocol, for text-only use without the iPhone app |
| New: app-data tool(s) | To build (P2), one per app, only if wanted | Read-only bridges into the other single-page apps' exported JSON |
| Memory store | Does not exist | Deliberately deferred — design after first real usage, not speculatively |
| Obsidian integration | Does not exist beyond a raw folder path | Deferred pending confirmation of what (if anything) already exists outside this session |

## Security and permissions

Unchanged from `Rayban-Claude-agent`'s existing model (see `RAYBAN_INTEGRATION_ANALYSIS.md` §9):
reads happen automatically; anything destructive or externally visible goes through the existing
`ConfirmationManager`. New tools added under this plan follow the same rule — a calendar-read tool
needs no confirmation; a future calendar-write tool would.

## Deployment

No new deployment surface. The computer agent already runs locally on the user's own machine; the
single-page apps already deploy as static GitHub Pages sites. Nothing here requires a server,
cloud database, or hosting change.

## Future expansion (not being built now)

- A real memory store, once there's a concrete "the agent should remember X" case to design
  against.
- A genuine Obsidian integration (frontmatter-aware read/write), once the user confirms whether
  one already exists elsewhere or needs to be built from scratch.
- Research mode / document intelligence — nothing in the current codebase to build on; would be
  new work, correctly deferred to P3 in the consolidation plan.
