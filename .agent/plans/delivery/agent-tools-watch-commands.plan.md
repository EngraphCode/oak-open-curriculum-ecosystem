---
id: agent-tools-watch-commands
node_type: delivery
name: "Agent-tools watch commands: the recurring watch patterns as front-door CLI"
overview: "Give every seat the recurring watch patterns — heartbeat loop, release/deploy watch, settled-green merge — as single front-door agent-tools commands, retiring per-session tmp-script reinvention."
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: agent-platform-citizenship
impact_areas:
  - practice-and-estate
tickets: []
depends_on: []
owner_gates:
  - awaiting: "owner-decision"
    clears_when: "a Linear ticket is named in tickets AND the ratification stamp lands — the serving strategic node is ticket-anchored (validator: plan-execution-anchors), so the owner either authorises an early ticket mint or the stamp lands with the ticket at the embargo lift"
    expires: 2026-08-10
last_updated: 2026-08-06
---

# Agent-tools watch commands: the recurring watch patterns as front-door CLI

## Goal

Any seat, on any platform, arms the estate's recurring watch patterns as
single-argv agent-tools commands — the same front-door class as `comms
watch` and `pr-watch` — so no session ever re-derives them as ad-hoc
shell loops or tmp-script wrappers again. The owner's ruling
(2026-08-06, verbatim substance): recurring watch patterns — PR watches,
release watches, deploy watches, heartbeat loops — belong IN
agent-tools, "they are things we do over and over"; the worktree
isolation guard is a forcing function — "it will force us to only use
the tools we built, and so finally make them work well and for us."
Single-argv commands satisfy the guard's plain-command requirement by
construction.

## Problem

The gap: three watch patterns every active seat runs have no CLI home,
so each session re-implements them as shell loops. Who it harms: every
seat (re-derivation cost, drift between implementations, the guard now
refuses the compound forms outright), and the owner (review burden over
repeated bespoke shells). Mechanism of harm, observed first-hand
2026-08-06 at the extraction-pilot seat: the heartbeat loop and a PR
settle-watch each needed a /tmp script wrapper to pass the isolation
guard; the wrapper class is retired by the same ruling that
commissions this plan. Success: the patterns exist once, tested, with
the conventions the estate already ratified (supervisor-pid guard,
timeout backstop, one-timestamp-per-tick, relabel-at-transition,
terminal-state coverage) built in.

## Decisions already made

- **Owner ruling** (2026-08-06, at the Director seat, canonical event
  9457a815): the backlog is release/deploy watch + heartbeat-loop
  commands; `pr-watch` already exists as the pattern exemplar; in-repo
  plans only until the Linear embargo lifts 2026-08-10.
- **Named tooling gap** (flagged the same hour, event 7ba78908):
  `merge-bot` has `mint-token` only — the settled-green REST merge
  still needs a `gh` wrapper each time. A `merge-bot merge` subcommand
  subsumes the PR settle-watch (poll to settled, then merge) — one
  command, not two.
- **Build-vs-buy**: the vendor surface is GitHub's REST API, already
  consumed via the estate's own minted-token discipline. GitHub's
  first-party merge automation IS available in bot identity (the
  sanctioned `gh pr merge --auto` form is documented in merge-bot's
  own header, and PDR-131 permits arming it at settled-READY under a
  Director grant) — it is rejected on capability, not identity:
  GitHub enforces only checks and review threads, never the estate's
  round-owed and body-tally settlement legs, so auto-merge cannot
  encode the settlement verdict, and the pr-watch state model types
  `ARMED-BEHIND-RED` as "progresses nothing, alerts nobody".
  Actions-based watchers cannot anchor the claims/comms substrate the
  heartbeat loop writes. The in-house CLI shape `pr-watch` already
  chose is the standing answer, extended not re-decided.

## Mechanism

Three commands, each mirroring the established `pr-watch` topic shape
(`agent-tools/src/pr-watch/` — topic table in
`agent-tools/src/bin/agent-tools-cli.ts` with handlers in
`agent-tools/src/bin/agent-tools-cli-topics.ts`, its own module
directory, unit tests over pure decision logic, integration tests over
injected ports; the `collaboration-state` topic is bespoke-wired in
the CLI rather than uniform-handled, and its new subcommand inherits
that wiring). Polling is the sanctioned wake shape here because none
of these sources emits a stream a session can consume without a
server (the same justification `pr-watch` records):

1. **`collaboration-state heartbeat-loop`** — the PDR-078 loop as one
   command: per tick, one derived timestamp drives `comms send --tag
   heartbeat` AND `claims heartbeat` (the F-92 both-surfaces
   discipline); required `--claim-id`, typed state args
   (`--intent-id`, `--branch`, `--current-cycle-label`); cadence
   defaulting to 240s; `--supervisor-pid` self-exit and the
   loud-failure line convention carried over from `comms watch`.
   Relabelling stays a restart (stop, re-arm with new args) — the
   loop stays a dumb emitter by design.
2. **`release-watch` / `deploy-watch`** — poll a named surface until
   a terminal state, emitting one line per state transition and one
   terminal line. The two surfaces are concrete in this repo today:
   `release-watch` polls Actions workflow runs for the
   semantic-release workflow (terminal conclusions: success, failure,
   cancelled, timed_out, skipped); `deploy-watch` polls GitHub
   Deployments and their `deployment_status` events as Vercel emits
   them (terminal states: success, failure, error, inactive). EVERY
   terminal state emits per the silence-is-never-liveness discipline;
   bounded by poll-count and the timeout backstop, exit code carried
   in-band.
3. **`merge-bot merge --pr <n>`** — the settled-green merge as one
   act: mint scoped token, COMPOSE the existing `pr state` settlement
   verdict (`pr-watch/settlement.ts` — no third polling
   implementation) until it reads settled, refusing loudly on any
   failing leg; verify the repo's allowed merge methods still include
   merge commits before merging (the `allow_merge_commit` setting has
   silently reverted before); REST-merge with merge-commit method
   (never squash); print the merge sha. The recorded `pr watch` (D2)
   intent in `pr-watch/state-cli.ts` stays with the pr-watch lane —
   this command consumes the state reading, it does not absorb D2.

Why this produces the goal: single-argv commands pass the isolation
guard by construction; one tested implementation replaces N session
copies (the same consolidate-at-second-consumer economics as the
extraction pilot, applied to operational tooling); and the conventions
live in code where the estate's gates prove them instead of in rule
prose each session must re-read.

## Acceptance criteria (each with a proof)

- Each command exists, registered in the CLI topic table, with unit
  tests over its decision logic (tick composition, terminal-state
  classification, settled derivation) and integration tests over
  injected process/HTTP ports — `repo-safe`: suites green in the
  agent-tools workspace; the whole-tree gates green at landing.
- A worktree-resident seat arms each command as a single plain
  command with no wrapper — `repo-safe`: the isolation guard accepts
  the documented invocation verbatim (the documented form IS the
  tested form); `owner-held`: the next live fleet window runs them in
  anger and the owner sees no tmp-script forms minted.
- The heartbeat loop writes both liveness surfaces per tick with one
  timestamp — `repo-safe`: integration test asserts the paired writes
  and the shared timestamp.
- `merge-bot merge` refuses a non-settled or failing PR loudly and
  merges a settled-green one with the merge-commit method —
  `repo-safe`: integration tests over an injected GitHub port pin
  refusal messages and the merge call shape; never-squash is a
  test-pinned invariant.
- `liveness-heartbeat-cron` §Canonical invocation is re-pointed at
  the `heartbeat-loop` command in the same landing as slice 2 —
  `repo-safe`: no rule text left prescribing a shell loop the command
  now owns (misleading-docs are blocking).
- The owner-held criterion above records its verification in the
  node's completion note (the archival disposition) citing the fleet
  window's comms events — the named recording surface the proof
  contract requires.

## Out of scope

- Rebuilding `comms watch` or `pr-watch` — they exist; this plan only
  adds siblings and re-points prose.
- Any scheduling daemon, cron substrate, or background-task manager —
  the platform's Monitor/background primitive stays the supervisor;
  these commands are what it runs.
- New vendor integrations — GitHub REST via the existing minted-token
  discipline only.
- Linear tickets before the embargo lifts (2026-08-10) — the `tickets`
  field is backfilled at the lift (same pattern as the
  shared-construct-extraction-pilot node).
- The `comms-all-channels-watcher` arm ceremony — it composes `comms
  watch`, which is out of scope above; its shell block remains until a
  watch-arm command exists (a follow-on the rule's own text can
  commission when this plan's pattern is proven).
- The F-75 peer-liveness delta poll (`liveness-heartbeat-cron`
  §Surfacing peer heartbeat-silence) — the emission side ships in
  slice 2; the detector side stays with the rule's own recorded
  follow-on (`comms watch --alert-stale-peers`).

## Todos (each slice a single-story PR; PDR-132 budgets bind at authoring)

1. **`merge-bot merge`** — the smallest slice with the sharpest
   recorded pain (flagged as a gap the hour this plan was
   commissioned); lands with its tests and the settled-derivation
   logic.
2. **`heartbeat-loop`** — the highest-frequency pattern; lands with
   the rule re-point in `liveness-heartbeat-cron`.
3. **`release-watch` / `deploy-watch`** — one slice sharing one
   polling core.

Sequence is definite (1 → 2 → 3); no conditional triggers. Slices are
independent landings; slice 2 carries the `liveness-heartbeat-cron`
re-point in the same PR. Slice ordering note for the ratification
card: `merge-bot merge` is scope the ruling did not name (it cures
the gap flagged the same hour, event 7ba78908) and is placed first on
recorded pain — the owner may reorder at the stamp.

## Review path

Authored at the implementer seat per the plan skill; the
plan-body-first-principles-check fires on this body's shape
(mechanism-only, no vendor literals beyond the named API class, no
invented phase vocabulary — the three todos are the owner-ruled
backlog verbatim plus the same hour's flagged gap).
`assumptions-expert` review precedes the ratification ask;
ratification is the owner's act, routed as a card via the Director.
