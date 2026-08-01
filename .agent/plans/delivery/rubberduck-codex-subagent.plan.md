---
id: rubberduck-codex-subagent
node_type: delivery
name: "Rubberduck Codex subagent — bounded multi-turn cross-model dialogue"
overview: "One Claude wrapper that gives a live seat a bounded multi-turn reflective dialogue with a Codex interlocutor via a per-child codex mcp-server process; the returned synthesis, carrying Codex's position verbatim, is the record."
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: first-major-release
impact_areas:
  - practice-and-estate
tickets: []
depends_on: []
owner_gates:
  - awaiting: owner-decision
    clears_when: >-
      Jim Cresswell rules on five named decisions: (1) the differentiator — a
      named multi-turn use case that Cricket, ARC, and the codex-exec recipe
      cannot serve, else the null option wins and this collapses to a Cricket
      variant; (2) the instrument-not-citizen ruling and the deliberate
      Claude-to-Codex one-directionality; (3) the
      one-child/one-process/one-thread topology with the spawned Codex side
      pinned sandbox read-only and approvals never; (4) the ADR-135
      specialist classification whose model default (claude-sonnet-5, effort
      high) is ratified as a coupled pair with the
      labelled-verbatim-Codex-position output contract, with the reviewer-tier
      doctrine conflict named; (5) the lineage demotion — no ledger, no
      hooks, no CLI; the returned synthesis is the record — presented
      explicitly so a "no" resurrects a reduced ledger deliberately. He also
      rules the sequencing question against the codex-app-server-idle-wake
      plan's open gates and the serves/naming/cost questions carried in the
      decision memo.
    expires: 2026-08-15
last_updated: 2026-08-01
---

# Rubberduck Codex subagent — bounded multi-turn cross-model dialogue

## Goal and differentiation

A Claude parent invokes `rubberduck-codex` through Claude Code's ordinary
subagent mechanism and receives a bounded, multi-turn reflective dialogue with
a Codex-family model: the uncertainty restated, assumptions probed over
several genuine exchanges, and a synthesis returned that carries Codex's own
final position verbatim. Codex MCP tools never load into the parent.

This multi-turn reading is the re-true's PROPOSED intent, not the sketch's
own words — the sketch's goal was "receive a reflective Codex response",
which existing mechanisms already serve; gate item (1) is where the owner
confirms this differentiator or the null option wins.

The one capability this adds — and its whole warrant: Cricket
judgement/procedure delivers single-shot cross-model verdicts; the
oak-codex-helper `codex exec` recipe is one-shot delegation without thread
state; ArcAngel rapid-comms requires a second live seat; the owner's standing
second-opinion grant is permission, not mechanism. None provides stateful
multi-turn cross-model dialogue to a solo live seat. This plan instantiates
exactly that gap under PDR-029's perturbation framing, rather than
re-deriving why cross-model diversity helps.

Falsifier: after a trial window, review invocation turn counts. If dialogues
routinely complete in one exchange the multi-turn delta is unused — fold the
capability into a Cricket variant and delete this agent.

## Position in the Practice

The child is an instrument, not a citizen (precedent: Cricket's Codex wrapper
legs). No identity registration, no comms presence, no claims; it exists only
within the caller's turn; its Codex thread is process-local ephemera,
discarded at exit. The Claude-to-Codex one-directionality is a deliberate,
owner-visible choice; a Codex-side counterpart wrapper is a pointer only (its
mechanism is unverified), not a spec.

## Decided shape

One canonical template at `.agent/sub-agents/templates/rubberduck-codex.md`
and one thin wrapper at `.claude/agents/rubberduck-codex.md`, per ADR-114.
The agent is classified under ADR-135 as a specialist (narrow, fixed
contract, agent-to-agent) reusing
`.agent/sub-agents/components/contracts/specialist-input.md`; the context
packet reuses Cricket's shape (OBJECTIVE FRAME / INTENT / QUESTION / RECENT
ACTIONS) rather than minting a new format. The template's delegation triggers
state what Cricket cannot do — multi-turn stateful dialogue — and route
single-shot second opinions to Cricket and live-peer dialogue to ARC.

Wrapper frontmatter equivalent:

```yaml
---
name: rubberduck-codex
description: >-
  Use when a live seat needs a bounded multi-turn reflective dialogue with a
  Codex-family interlocutor and no Codex peer seat is live. Single-shot
  second opinions route to Cricket; live-peer dialogue routes to ARC.
model: claude-sonnet-5
effort: high
tools: Read, mcp__codex__codex, mcp__codex__codex-reply
mcpServers:
  codex:
    type: stdio
    command: codex
    args:
      [
        "mcp-server",
        "-c",
        "sandbox_mode=read-only",
        "-c",
        "approval_policy=never",
      ]
---
```

Model policy: `claude-sonnet-5` at `effort: high` is the ADR-135
specialist-class default, not a bespoke pin, and is ratified at the owner
gate as a coupled pair with the verbatim-dissent output contract — with
passthrough the Claude child is a conduit plus bounded prober and
adjudication stays with the parent. If the response contract ever reverts to
synthesis-only, the tier question reopens toward Opus per reviewer-tier
doctrine. Host caveat (VERIFIED): Claude Code silently skips an excluded
model value and runs the subagent on the inherited model — the live
acceptance run must verify the EFFECTIVE model and that effort high is active
on it; a silent fallback is a stop-for-owner-decision.

Tools note: `Read` is required so the wrapper can load its template as its
first action (every Cricket wrapper grants it); a two-tool grant makes that
first action impossible.

## Topology: one child, one process, one thread

Each child owns exactly one `codex mcp-server` stdio process, spawned at
child start and disconnected at child end (VERIFIED inline-mcpServers
lifecycle), and exactly one Codex thread taken from
`structuredContent.threadId` of a single `codex` call; every later turn is
`codex-reply` against that exact ID. No `.mcp.json` registration, no shared
daemon, no thread reuse. N live children imply N processes.

Divergence note, recorded so it is not re-derived: the documented Codex
app-server is multi-thread-per-process with thread/resume and turn/steer and
would suit long-lived dialogue — but that is the owner-gated
`codex-app-server-idle-wake` plan's problem space (gates expire 2026-08-03),
and `codex mcp-server`'s own single-process multi-thread concurrency is
UNVERIFIABLE from documentation. Per-child processes rest entirely on
documented behaviour and make the unverifiable question irrelevant. This
dependency is load-bearing: any future pooling or shared-daemon change
re-opens the unverified concurrency question and requires first-hand
re-verification.

Codex authority pin — at the PROCESS, not per call: the wrapper's own
`mcpServers` args launch `codex mcp-server -c sandbox_mode=read-only -c
approval_policy=never` (accepted by the installed codex-cli 0.146.0,
verified first-hand 2026-08-01), so every thread in the child's process is
read-only/no-approvals regardless of what any individual call passes. This
is the same mechanism as the estate precedent (the cricket-judgement Codex
TOMLs pin `sandbox_mode = read-only`, `approval_policy = never` at config
level) and it is repo-safe testable — `pnpm subagents:check` can assert the
args line. The template's first `codex` call passes the per-call
sandbox/approval parameters as belt-and-braces where the probe confirms
them. Without a process-level pin the reflection-only claim is untrue at
the process level: a child that skipped a per-call pin would run Codex
under ambient machine config, which can permit writes. The Codex MODEL
stays unpinned; the CLI's configured default remains outside this
wrapper's contract.

Host load: one live rubberduck child per seat, bounding load to N seats.
This is convention, not mechanism; a hook-enforced cap is a named hardening
candidate if fleet fan-out misuse is observed.

## Dialogue protocol

Restate the uncertainty; send a bounded Cricket-shaped packet carrying only
the minimum context the parent supplies; probe the disagreement or hidden
assumption over at most six exchanges (default budget), stopping earlier when
positions stabilise or diverge irreconcilably. The child never delegates
execution, edits files, or dumps transcripts.

Response contract, in order:

1. A labelled verbatim (or minimally edited and marked) quote of Codex's
   final position. Warrant, cited honestly: the Cricket tallies MEASURED
   supply-side compression loss (summarised evidence sent into legs loses
   forcing facts); requiring verbatim passthrough on the RETURN path is an
   extrapolation of that measured loss class, not itself a measurement. A
   same-family compression of the dissent would reintroduce the correlated
   channel this feature exists to escape.
2. The child's synthesis: what changed the caller's mind, unresolved
   disagreement, suggested next evidence.
3. One operational line: turn count and the tested Codex CLI version. No
   thread ID — the thread is dead at child exit, has no consumer, and the
   identifier class is operationally sensitive.

## Invariants — stated honestly

One `codex` initialisation per child, every reply to that exact thread,
transport closed at exit: these are template discipline, not machine
enforcement. v1 ships no guard hooks. The violation cost of the
one-thread discipline is wasted spend and a muddled dialogue — the
AUTHORITY invariant does not share that soft cost profile, which is
exactly why it is pinned at process level in the wrapper args rather
than left to discipline. The turn-count line makes thread-discipline
violations visible to the caller. The verified hook primitives
(PreToolUse deny, PostToolUse payload capture, SubagentStop) are the named
hardening path if misuse is observed — a decision then, not machinery now.
The sketch's "fails closed" language does not survive into this plan.

## Conservation instead of telemetry

No lineage ledger, no hooks, no CLI. The returned synthesis is the record;
the caller homes any decision-changing insight through the existing
conserve-at-close / napkin / permanent-docs discipline, exactly as ARC
dialogues fold today. A dialogue that changes nothing conserves nothing, by
design. If systematic adoption evidence is ever wanted, the compose-correct
retrofit is a one-line event on the existing comms surface at dialogue close
— a pointer, not a spec.

## Pre-build verification

Before authoring the template: run `codex mcp-server` locally (with the
process-level `-c` pins), drive one bounded codex → threadId → codex-reply
exchange end-to-end, confirm the per-call sandbox/approval parameters are
accepted, and record the tested Codex CLI version in the implementation PR.
This probe is now the durable contract evidence: the vendor's MCP reference
has drifted (the sketch's URL redirects to a page that no longer documents
the tools). PR 1 lands the probe as a RUNNABLE script wired to the recorded
CLI version, so a version-bump re-run is a one-command act; no automatic
trigger fires it at upgrades (stated, not hidden), and a broken dialogue is
otherwise the detection mechanism.

## Acceptance criteria (each with a proof)

- Wrapper exact and discoverable: named `rubberduck-codex`, loads the
  template first, grants Read plus the two Codex tools only, declares the
  inline server. Proof: repo-safe — wrapper-schema, composition, and
  `pnpm subagents:check` tests.
- Per-child isolation: two concurrent children show two distinct
  `codex mcp-server` PIDs with independent teardown; nothing appears in
  parent MCP config. Proof: owner-held — live run with bounded PID and
  teardown evidence.
- Codex authority pinned: the wrapper's `mcpServers` args carry the
  process-level `-c sandbox_mode=read-only -c approval_policy=never` pins
  (proof: repo-safe — wrapper-args assertion in `pnpm subagents:check`),
  and a live probe shows a write attempt refused (proof: owner-held).
- Response contract honoured: labelled verbatim Codex position, synthesis,
  and turn count present; no thread ID. Proof: repo-safe golden test on the
  template contract plus one owner-held live dialogue.
- Effective model verified: the live run confirms `claude-sonnet-5` is
  actually active with effort high (the host silently substitutes the
  inherited model on excluded values). Proof: owner-held.
- Host contract first-hand: pinned Claude Code and Codex CLI versions,
  proven inline-MCP lifecycle and threadId round-trip, linked from the
  implementation PR with secrets and conversation content removed. Proof:
  owner-held.

## Delivery

Ticket first, embargo-aware: mint an MCP-team ticket before any PR — but
Linear is out of bounds until 2026-08-10 08:00 London (owner ruling,
2026-08-01; exceptions are one-off owner statements only). Gate-pass
before that date holds the lane at ticket-blocked rather than minting;
`tickets: []` stands until the embargo lifts or the owner names an
exception.

- PR 1 (single story): the template, the Claude wrapper, the subagent
  inventory entry, routing guidance (Cricket / ARC / here), and a short
  usage section in the sub-agents docs, carrying the pre-build probe
  evidence; the owner-held acceptance run is linked before merge.
- PR 2 (optional, evidence-gated): Codex/Cursor parity wrappers for ADR-114
  lockstep, only after PR 1 proves real use.

Done-test: one real seat runs one dialogue that produces a conserved,
decision-relevant synthesis.

## Out of scope

- Unprompted Codex wake or any long-lived shared Codex process (the
  owner-gated codex-app-server-idle-wake plan's space).
- Reusing or resuming Codex threads across children.
- Parent-side Codex MCP tools.
- Persisting prompts, responses, transcripts, summaries, or credentials.
- Any lineage store, guard hooks, or lineage CLI (deliberate demotion — see
  owner gate item 5).
- Practice-citizen surfaces for the child (identity registration, comms
  events, claims).
- A Codex-initiated Claude rubberduck (recorded asymmetry; pointer only).
- Pinning the Codex model.
- Changes to Cricket or ARC.

## External contract references (verification status)

- Claude Code sub-agents — inline per-agent `mcpServers` (stdio; connected at
  subagent start, disconnected at finish): VERIFIED 2026-08-01.
  <https://code.claude.com/docs/en/sub-agents>
- Frontmatter `model` full IDs and `effort` field; silent skip of excluded
  model values to the inherited model: VERIFIED, same source.
- Hooks (PreToolUse deny via exit 2; PostToolUse `session_id` / `agent_id` /
  `tool_response`; SubagentStop): VERIFIED at
  <https://code.claude.com/docs/en/hooks> — not used in v1; named hardening
  path only.
- `codex mcp-server` stdio; `codex` / `codex-reply` tools;
  `structuredContent.threadId` round-trip; per-call approval-policy and
  sandbox-mode parameters: VERIFIED against the grounding record
  (learn.chatgpt.com/docs/mcp-server.md and the codex-rs MCP interface doc),
  but the original reference URL has drifted — the pre-build probe against
  the installed CLI is the durable evidence.
- `codex mcp-server` single-process multi-thread concurrency: UNVERIFIABLE
  from documentation — made irrelevant by per-child processes; re-verify
  first-hand before any pooling.
- Codex app-server (multi-thread per process; thread/resume; turn/steer):
  VERIFIED as a documented alternative; deliberately not used (divergence
  note above).
