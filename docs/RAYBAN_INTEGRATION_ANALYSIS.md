# Ray-Ban Integration Analysis

This synthesizes what already exists in `seany420/rayban-claude-agent` (audited 2026-08-31) rather
than re-deriving it — that repo's own `ARCHITECTURE.md`, `docs/CURRENT_CAPABILITIES.md`,
`docs/PROTOCOL.md`, and `SECURITY.md` are the primary sources and already answer most of what the
consolidation directive asked for here. This document restates it in one place, judges its
readiness, and adds the "what next" the directive wants.

**Important correction to the originating brief's assumption**: there is no existing "PC
application" for the Ray-Ban glasses beyond this repo. `rayban-claude-agent` has a single commit
and has never been run against real hardware — the iOS half has never even been compiled (built
in a Linux dev environment with no Xcode). Nothing here needs to be "ported from PC to iPhone";
the iPhone app already **is** the design, it just hasn't been built and run yet.

## 1. Current architecture

```
Ray-Ban Meta Wayfarer 2 (Bluetooth audio route)
        │
        ▼
iPhone App (SwiftUI)
  MetaWearablesService (protocol)
    ├─ SimulatorWearablesService — iPhone mic/speaker, default, always works
    └─ DATWearablesService       — wraps meta-wearables-dat-ios, extension point only
  AppleSpeechRecognizer / AppleSpeechSynthesizer
  ConversationManager, AgentClient (WebSocket+TLS, HMAC-authed), KeychainStore
        │  wss://<mac-host>:<port>/agent (TLS, HMAC-signed pairing token)
        ▼
Computer Agent (Node/TypeScript, local-first)
  WsServer, PairingAuth (HMAC-SHA256), IntentRouter, AgentSession (state machine)
  ClaudeService (Anthropic Messages API, streaming, manual tool loop)
  ConfirmationManager (dangerous-op gating, audit log)
  ToolRegistry: WorkspaceFsTool (jailed to WORKSPACE_PATH), McpRegistry (local stdio servers),
    ClaudeCodeInvoker (shells out to `claude -p ...`)
        │
        ▼
Local filesystem, git, MCP servers, `claude` CLI
```

The split is deliberate: the iPhone owns "being a device the user talks to" (audio, wearables, UI,
local secrets — it never holds the Anthropic API key); the computer agent owns "doing things on a
computer" and is the only thing that touches the filesystem, runs allowlisted shell commands, or
invokes MCP/Claude Code, always behind confirmation for anything dangerous.

## 2. What already works (per the repo's own docs and test results)

- Computer agent: builds, typechecks, and passes its full test suite (47 tests) in its dev
  environment. This is real, verified code, not just a design doc.
- A no-phone-needed path already works today: pair the glasses to a computer's Bluetooth audio as
  a plain headset (confirmed in the field on Windows), open the computer agent's browser talk page
  (`computer-agent/src/webClient/talkPage.ts`) in Chrome/Edge, and talk to Claude through the
  glasses' mic/speaker — no Mac, no iPhone, no Meta developer account required. This is the
  fastest path to "speak to Claude through the glasses" available right now.
- `SimulatorWearablesService` makes the full voice loop (mic → Claude → speech) testable on a
  plain iPhone/Simulator with zero glasses hardware.
- Security model is implemented, not just designed: HMAC pairing, TLS, workspace jail with
  symlink-escape checks, and confirmation gating for dangerous tool calls.

## 3. Technical limitations (researched against live Meta/Anthropic docs, 2026-08-30)

| Capability | Status |
|---|---|
| Custom wake word ("Hey Claude" via the glasses' own always-on pipeline) | **Not supported.** No public hook into "Hey Meta." The MVP uses tap-to-talk in the iPhone app instead. |
| Microphone streaming directly from the glasses (via Meta's Wearables DAT SDK) | **Unconfirmed.** DAT marketing lists mic access as a capability; the actual API reference page was unreachable from this environment. Needs re-verification against `wearables.developer.meta.com` before relying on it. |
| Custom audio output routed to the glasses via a Meta API | **Not supported as far as could be confirmed.** Audio output works today only via the standard iOS Bluetooth audio route (A2DP/HFP) — which is sufficient, since the glasses register as a normal Bluetooth speaker. |
| Photo/video capture from the glasses camera | **Supported** via the DAT SDK (`meta-wearables-dat-ios`), extension point wired but unused by the MVP. |
| Wayfarer 2 (non-Display) hardware support in DAT | Likely supported for camera+mic; no definitive supported-hardware matrix was reachable to confirm. |
| Developer enrollment for DAT | Requires a gated Meta Wearables developer account (organization + release channel model). |

**Net effect**: the "say a wake phrase and the glasses themselves start listening" experience is
not achievable with the currently documented public API surface. What's buildable now — and what
the MVP targets — is tap-to-talk (or iPhone-mic listening) as the trigger, with audio output over
the standard Bluetooth route.

## 4. What can be reused

- The entire computer-agent service as-is: WebSocket transport, pairing auth, intent router,
  confirmation manager, tool registry, MCP registry, Claude Code invoker.
- The `MetaWearablesService` abstraction: it already isolates every DAT-specific assumption behind
  one protocol, so if/when Meta ships confirmed mic-streaming or a wake-word hook, only
  `DATWearablesService` needs to change.
- The browser-based talk page as a glasses-as-Bluetooth-headset path that needs no iOS build at
  all — useful as an immediate, low-effort way to validate the voice loop end-to-end today.

## 5. What must change before this is a real product

1. **Compile and run the iOS app for the first time.** It has never been built — `xcodegen
   generate` + Xcode on an actual Mac is a hard prerequisite, listed in the repo's own
   `docs/MANUAL_STEPS.md`.
2. **Confirm or refute glasses mic-streaming via DAT** against the real (currently unreachable)
   API reference before promising that capability to the user.
3. **Decide the wake-word UX** given no glasses-side wake hook exists: tap-to-talk button vs.
   iPhone-foregrounded listening vs. accepting the browser/Bluetooth-headset workaround as the
   primary path for now.
4. **Exercise the Claude Code intent end-to-end** (`ClaudeCodeInvoker`) — the repo's own docs flag
   this as unexercised in this build pass.
5. **Get a Meta Wearables developer account** if/when camera capture or confirmed mic streaming is
   wanted — this is a real, gated prerequisite, not a code change.

## 6. Recommended architecture

Keep the current split. Don't introduce a second backend, a cloud relay, or a different agent
framework — the local-first design (phone never holds the API key; computer agent is the sole
tool-executor, jailed and confirmation-gated) is exactly right for a personal system and matches
the directive's own security requirements (§21) almost verbatim already.

## 7. iPhone strategy

Short term: use the Bluetooth-headset + browser-talk-page path (§3 of the repo README) to validate
the voice loop today with zero iOS build effort. Medium term: get the SwiftUI app compiled and
running on a real Mac/Xcode — this is a one-time environment problem (this dev session had no
Xcode), not an architecture problem. Long term: extend `DATWearablesService` once Meta's mic
streaming is confirmed, so camera and true glasses-mic input become available without touching
anything else in the app.

## 8. Backend strategy

No new backend needed. The existing local-first computer agent is the correct "backend" — it's
already the natural home for the orchestration layer the wider consolidation plan calls for (see
`AI_OS_ARCHITECTURE.md`): its `ToolRegistry`/`IntentRouter`/`AgentSession` are a reasonable seed
for a shared tool layer across text, voice, and (eventually) the other single-page apps.

## 9. Security considerations

Already well handled: HMAC + TLS on the phone↔agent link, workspace jail with symlink-escape
checks, confirmation gating for dangerous ops, and tool/file/MCP output treated as untrusted
content in the system prompt (a real prompt-injection mitigation, not just a comment). Two things
worth tracking as this grows: (a) once MCP servers beyond the disabled-by-default
filesystem/github examples are enabled, each new server's tool surface needs the same "dangerous:
true → confirmation required" review; (b) `ALLOWLISTED_COMMANDS` in `.env` is the actual shell
attack surface — keep it minimal and reviewed as it's extended.

## 10. Implementation roadmap

- **P0**: Compile and run the iOS app once on a real Mac; validate the Bluetooth-headset +
  browser-talk-page path end-to-end as an immediate fallback.
- **P1**: Confirm DAT mic-streaming capability against live docs; exercise the Claude Code intent
  path end-to-end.
- **P2**: Meta Wearables developer enrollment if camera/confirmed-mic features are wanted; wire a
  real wake-word UX decision.
- **P3**: Extend `DATWearablesService` once mic streaming is confirmed; consider whether this
  computer agent becomes the shared orchestration backend for the other tools in
  `EXISTING_SYSTEM_INVENTORY.md` (see `AI_OS_ARCHITECTURE.md` §"Orchestration").
