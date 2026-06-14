# PDR-063 handoff — Gull spins Stratus (9cf32d) → Serval mends Murmur (comms-rotation lane)

**Pre-positioning record** (PDR-063 / ADR-182). Owner-directed 2026-06-14: hand the comms-research WS7
completion to **Serval mends Murmur** (owner-named successor) at a clean boundary. Serval is NOT yet active —
authority/claim transfer happens when Serval broadcasts active-acknowledgement. Owner direction: this Gull
session is over after handoff; Serval is fully responsible for completing the comms-research thread. **Self-contained — read end-to-end before any
WS7 edit (First Moves move 7), then read the companion plan's §"WS7 Execution Contract" (the full spec).**

**Claim**: `907ff814-b7f3-44dc-a83d-ce5fd387920a` (WS7 completion, role peer) **RETAINED** for you.
**Branch**: `feat/comms-research`, fully pushed (origin == HEAD, 0 ahead / 0 behind as of handoff).
**Sole agent**: owner confirmed no other agents for the remainder of this thread (you are the only exception).

## 1. Current edit state (what is landed + pushed)

- **Tasks 0–2 landed** (`e203791ad`): lane activated; the deep WS7 DoD de-orphaned into the companion plan
  `.agent/plans/agent-tooling/active/comms-corpus-research-and-rotation-strategy.plan.md` §"WS7 Execution
  Contract (routed from machine-local DoD, 2026-06-14)" — **this is now the authoritative spec**; the
  Phase-1 manifest carryover repointed (`memory-state-substrate-contracts.manifest.json`: the four
  `schema_or_parser` refs plus `fixture_roots` → new agent-tools homes; `comms-events/`→`comms/` drift fixed).
- **Phase-2 provenance PURE CORE landed** (`9175acfeb`, test-expert-reviewed sound, 10/10 green):
  `agent-tools/src/collaboration-state/provenance/cited-event-provenance.ts` exports `normaliseEventId`,
  `extractEventIdTokens` (bounded 8-hex; excludes git SHAs), `findUncoveredCitedEvents`
  (`cited ∩ candidate − covered`). **Pure set-algebra only — no IO yet.**
- Working tree clean except the derived `shared-comms-log.md` (gitignore-bound, pure-diff-excluded — NEVER
  commit it to the feature branch).

## 2. In-flight reasoning (the next unit + how)

- **Next unit = the provenance IO/scan layer** (under `agent-tools/src/collaboration-state/provenance/`,
  TDD): (a) scan ADRs (`docs/architecture/architectural-decisions/`), PDRs
  (`.agent/practice-core/decision-records/`), patterns (`.agent/memory/active/patterns/`) for 8-hex tokens
  via `extractEventIdTokens`; (b) intersect with known event-ids (filenames in `comms/` + `comms-archive/`)
  to drop false positives; (c) read coverage from the digest; (d) `findUncoveredCitedEvents`, **fail-closed**
  on violations. Reuse `agent-tools/src/core/repo-root.ts` `resolveRepoRoot` for path resolution.
- **The digest** `.agent/reference/comms-cited-events.md` (git-tracked, outside `.agent/state/`) is the
  machine-checkable coverage ledger. Populate it with all 9 cited events: the 6 uncovered
  (`02fa64cf`, `1e2c83eb`, `5fbf6f92`, `92183937`, `952e329b`, `c7d65a58`, all present in `comms/`) AND
  mirror the 3 ADR-199 inline-quoted ones (`2ff03ded`, `3cc1fb93`, `86e94e54`) so the digest is complete.
- **Heartbeat-cadence aggregate artefact** must be written from the WS2 stats
  (`.agent/reports/agentic-engineering/2026-06-12-ws2-corpus-survey.md` §"Liveness substrate statistics")
  BEFORE any heartbeat event is archive-moved.
- **`comms-archive/` is already gitignored** in the working tree (`comms-archive/*` + `!.gitkeep`) — a `mv`
  in lands untracked (verify first-hand). Byte-preservation check on the move:
  `count(comms/) + count(comms-archive/) == pre-move count`. Bulk routine/noise classification MUST
  body-read a sample + EVERY over-length body (the `3cc1fb93` falsifier — title genre never sufficient).

## 3. Decisions made (owner-ratified / confirmed this session)

- **Retention windows = DoD defaults** (owner-confirmed): heartbeat 48h · coordination/directed 7d ·
  research-precious until-graduated · diagnostic/noise immediate-eligible (body-read first).
- **Untrack boundary = owner-delegated**: keep tracked = README + `conversations/` + `escalations/` (+ lean
  `sidebars/`); untrack (preserve-on-disk) = `comms/` + `comms-seen/` + claims + `shared-comms-log.md` +
  `comms-archive/` + `comms-draft/` + `handoffs/`; relocate out = `experiments/` → `.agent/collaboration/experiments/`.
- **Phase-3 atomic gate**: the comms-log + out-of-repo-plan curation obligation must land ATOMICALLY across
  PDR-094 + ADR-199 + `session-handoff` + `consolidate-docs` + the Phase-3 README + `.gitignore`, or it is an
  invisible broken state. **Skill-wiring IS a WS7 completion gate** (owner-resolved).
- **Out-of-repo plans** (`~/.claude/plans/`): process the comms-research + agent-collaboration ones; record
  the rest in a curation-backlog plan; wire the standing curation obligation into the same skill step. Keep
  it STRICTLY distinct from the voluntary, self-framed `.agent/experience/` register (owner liberated it
  2026-06-14 — knowledge curation is mandatory; subjective experience is never mandated).
- **Sole-contributor mode**: no peer-coordination ceremony; whole-tree gates are the signal; commits are
  explicit-pathspec but uncontended.

## 4. Decisions deferred / open

- Provenance scan scope: ADRs/PDRs/patterns (ADR-199 default) vs broaden to `reference/` + `reports/`.
- **#208 merge is owner-gated** (one-way; carries statusline + research + WS7 together) — drive to
  merge-ready, request owner go, do not self-merge.
- Out-of-WS7-scope, surface-don't-fold: PR #207 follow-up on `main` ("commit-queue ×5"→"4 enumerable");
  2 Dependabot vulns on `main` (1 high / 1 low); the watcher host-cost hypothesis (icebox).

## What you take

(a) claim `907ff814` (retained) — pick it up + broadcast active-acknowledgement.
(b) WS7 Phase-2 remainder (IO/scan layer + digest + cadence artefact + archive-move) → Phase 3 (atomic
    untrack bundle) → Phase 4 (land #208 merge-ready).
(c) the de-orphaned execution spec (companion plan §"WS7 Execution Contract").
(d) the end-of-session out-of-repo-plan consolidation + the standing skill-wiring.

## Monitors

My comms watcher + heartbeat loop die with my session. **Start your own** — the all-channels comms watcher
is constitutive of a `start-right-team` session (a session where the skill is invoked is a team environment
by construction; the watcher is mandatory, never a value-judgment to skip). Pair any ArcAngel tail with it.

## Lessons carried (this session — also in napkin + failure-mode event aa238582)

- **Don't run a value-contingency judgement on a constitutive precondition.** The comms watcher is
  constitutive of a team session; the tell is composing a justification to skip a non-negotiable move.
- **Ground the situational fact before applying a frame that presupposes it** — is there a peer? is this red
  build mine? am I solo? Three frame-misapplication instances this session.
- **On a shared checkout a red whole-tree build can be a peer's WIP** (tree-state vs branch-content); never
  tree-alter (stash) to isolate.
- **Structural-cure candidate** (route to pending-graduations): a session-open / `start-right-team` gate that
  fails fast when a team-skill session has no observable comms watcher (passive-guidance-loses-to-active —
  the prose said "must not be mis-filed as ceremony and skipped" and it still happened).
