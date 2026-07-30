---
id: mcp-393-delivery-signal
node_type: delivery
name: "Delivery signal for directed coordination — distinguish delivery-dark from working"
overview: "Make absorption of directed coordination mechanically visible within ~10 minutes — a practice that reaches ABSORB first, the smallest read surface over it second — without weakening heartbeat semantics."
status: ratified
ratified_by: "Jim Cresswell"
ratified_date: 2026-07-30
ratified_where: >-
  Owner card answers, both recorded 2026-07-30: "Ratify as-is" at the
  implementer seat's in-session card (~07:22Z, Possum weaves Midnight
  d5848b), and "Ratify the sketch" at the Director's card (~06:56Z),
  the latter recorded on the comms stream in Falcon hunts Flight's
  directed event 3f1348b6-9641-4181-9d79-ea15a826ac80 (07:23:06Z)
serves: first-major-release
impact_areas:
  - practice-and-estate
tickets:
  - MCP-393
depends_on: []
owner_gates: []
last_updated: 2026-07-30
---

# Delivery signal for directed coordination — distinguish delivery-dark from working

## Goal

The Director can distinguish a delivery-dark seat (directed events will
never wake its reasoning loop) from a working seat within ~10 minutes of
sending a directed event, from evidence rather than configuration. Today
a heartbeat-fresh seat that is comms-deaf reads identically to a seat
that is thinking, and every instance so far was cured by a hand-delivered
unblock (three on 2026-07-29 alone). The deeper outcome: owner and
Director attention buys judgment, not verification.

## Problem frame

- **Gap**: no routine positive signal is produced by a seat's reasoning
  loop when it absorbs a directed event; every liveness surface the
  Director can read is emitted by scheduling layers that keep running
  while the reasoning loop sleeps.
- **Mechanism of the failure** (PDR-133 vocabulary): heartbeats certify
  `EMIT` only (never `LOOP` — §5); watcher health certifies the
  `PROCESS`–`DELIVERY` path. `ABSORB` requires a wake AND a running
  loop, is never-self-certifiable, and has exactly one sound external
  instrument short of observed deliverable movement: a content-bearing
  reply (§6 instrument 2). Attested sibling mechanisms with dated
  provenance: a watcher re-armed as a plain background shell consumed
  events with no wake path (2026-07-25, watcher rule); background
  heartbeat loops ticking through a ~64-minute harness suspension
  (2026-07-20/21, heartbeat rule).
- **Constraints**: heartbeat semantics must not be weakened — the cure
  ADDS a delivery signal. Absence-of-events is NOT usable as a
  delivery-dark signal on its own: back-tested over the live corpus,
  "directed event + fresh heartbeat + no substantive authored event in
  10 minutes" fires ~21×/day against 3 known true instances (~1.4%
  precision) — quiet heads-down work dominates. The signal must
  therefore come from an expected-reply that did not arrive, not from
  generic silence.

## Mechanism

The practice first, the smallest read surface over it second.

1. **Absorption-ack convention (doctrine).** Directed events that carry
   routing or an ask include the literal token `ACK-REQUESTED` in the
   subject. On absorbing one, the receiving seat replies with a
   content-bearing narrative event threading the antecedent:
   `comms send --in-response-to <event-id>` (the `in_response_to` field
   exists on the narrative shape today — verified against the wire
   schema; the `directed` shape does NOT carry it, so a directed-shape
   ack is a schema extension deliberately deferred, not assumed). This
   makes PDR-133 §6 instrument 2 routine instead of exceptional. An
   unanswered `ACK-REQUESTED` event is a bounded-challenge non-reply —
   meaningful in a way generic silence is not.
2. **The smallest read surface.** Extend the existing `comms
   peer-liveness` classifier (the sibling read model — its
   input-to-verify disclaimer and vocabulary discipline are inherited)
   or, only if extension proves unfit, add a sibling subcommand. It
   reports, per outstanding `ACK-REQUESTED` directed event: recipient
   seat; whether the event-id is a member of the seat's seen set (the
   seen-file is an unordered UUID set — membership, never "cursor
   position"; seat identity resolved from the watcher heartbeat
   sidecar's `watcher_identity.agent_name`, never the filename);
   whether a threading reply exists (`in_response_to` match — ABSORB
   evidence); heartbeat freshness from the PDR-078 comms-event stream
   (EMIT — never the watcher sidecar, which certifies the scheduler);
   and the sidecar's `emitted_count`/`last_emit_at` where schema `0.2.0`
   provides them, separating DELIVERY-dark from NOTIFY-dark (`0.1.0`
   sidecars lacking `watched_comms_dir` are reported as
   `source-unverifiable`, classified conservatively). Verdict labels are
   class-honest: `absorbed`, `pending`, `absorb-absent` (never
   "delivery-dark" — the observation cannot reach NOTIFY vs LOOP),
   `consumption-stalled`, `silent`; every verdict names the PDR-133
   classes it read AND the classes it did not. The classifier is
   input-to-verify for `ping-before-escalate` and the PDR-133 §9
   absence conjunction (observed deliverable movement, including remote
   `gh` surfaces, stays the operator's obligation and is named in the
   output).
3. **Doctrine wiring and the ledger.** Rule amendments (the ack
   convention; Director reads the surface at routing moments and before
   any stall diagnosis); the three 2026-07-29 instances recorded in the
   PDR-133 platform-declaration ledger
   (`cross-platform-agent-surface-matrix.md` §Platform Liveness
   Declaration) with MCP-393 linked — which also lands the owed Claude
   Code `NOTIFY`/`ABSORB` declaration rows (PDR-133 §8 names the first
   liveness question as the landing moment; this ticket is it).

## Dependencies and reuse (named so load-bearing proxies survive)

The frontmatter `depends_on` is empty by constraint, not by absence: both
dependencies below live in the legacy plans-backlog outside the
plan-node estate, which the closed `depends_on` graph cannot reference —
this section is their named home, and both are `beneficial`-class
(informing slice B's authoring), not blocking.

- **`comms-watch-storage-redesign.plan.md`** (agent-tooling backlog):
  its WS2 watermark replaces the seen-file UUID set and its WS3 moves
  cursor state machine-local — either destroys this surface's
  seen-membership evidence. Not a sequencing blocker (that plan is
  backlog, WS3 owner-held), but the reciprocal "downstream consumer"
  entry lands there in slice A so the proxy is named (PDR-133 §Notes:
  unnamed proxies get optimised away).
- **`coordination-home-cli-path-defaulting.plan.md`** todo `ws1b`:
  the new/extended read surface joins the omit-path
  coordination-home-defaulting set from birth — a Director diagnostic
  that can silently read a decoy home is the worst failure shape for
  this command.
- **Reuse**: `comms-relevant-events.ts` (per-identity relevance +
  seen-set read) is the composition base. The human-composer TUI plan's
  WS8 `receipt-state-reader` names the same seen-membership fact — one
  home for the fact, both consumers read it (resolved at slice B
  authoring).

## Acceptance criteria (each with a proof)

1. **Absorb-absent discrimination within the threshold.** A simulated
   non-absorbing seat (ACK-REQUESTED directed event written; event-id
   present in the seat's seen set via a consumer that never wakes a
   loop; no threading reply) classifies `absorb-absent` at threshold
   (default 10 min), while a seat with a content-bearing threading
   reply classifies `absorbed`. Heartbeat-tagged events are excluded
   from the ABSORB evidence set (they are scheduling-layer artefacts —
   without this exclusion the classifier never fires).
   Proof: `repo-safe` — the read surface's integration tests
   (agent-tools Vitest), red-first.
2. **Heartbeat semantics untouched.** No change to heartbeat emission,
   cadence, thresholds, or the claims-registry surface.
   Proof: `repo-safe` — the diff touches no heartbeat emit path; the
   existing heartbeat suites stay green unmodified.
3. **Verdicts are class-honest.** Every classification names the
   PDR-133 classes whose evidence it read and the classes it did not.
   Proof: `repo-safe` — asserted in the read surface's tests.
4. **The ledger rows exist.** The three 2026-07-29 instances recorded
   in the PDR-133 platform-declaration surface with MCP-393 linked,
   including the Claude Code NOTIFY/ABSORB declaration rows.
   Proof: `repo-safe` — the rows exist and cite MCP-393.
5. **Live worked instance.** The Director uses the convention plus the
   read surface on the live fleet and records one worked reading on
   the ticket. Proof: `owner-held` — ticket comment naming the reading.

## Todos (slices, each a single-story PR, default round budget ≤2)

1. **Slice A — doctrine + ledger first.** The ACK-REQUESTED/ack
   convention as rule amendments; the PDR-133 ledger entries + Claude
   Code declaration rows (acceptance 4); the reciprocal
   downstream-consumer entry in the storage-redesign plan; fleet
   adoption broadcast. Zero code — the practice generates the signal
   the read surface needs.
2. **Slice B — the read surface.** Extend `peer-liveness` (or the
   smallest sibling if extension proves unfit) per Mechanism 2, TDD
   red-first (acceptance 1–3). Pre-execution code-expert review per
   standing rules. Runs only after slice A so it reads a signal that
   exists. Acceptance 5 follows as the first live use — and gates
   whether this slice needed to exist at its full shape (see
   falsifier below).

**Slice-B falsifier (named before it runs):** if after slice A a live
worked instance shows the Director answering the 10-minute question with
existing tools alone, slice B shrinks to whatever gap that instance
actually demonstrates.

## Out of scope

- **A directed-shape `in_response_to` schema extension** — the
  narrative-shape ack works today with zero code; the wire-schema
  extension (JSON Schema + Zod + factory + option lists + validator) is
  a named follow-on if ack-channel noise proves real, never assumed in.
- **A new `comms ack` sugar command** — same reasoning; the convention
  uses an existing verb.
- **Live-derived heartbeat labels** (a ticket candidate) — the
  consumer-side lane-state-from-PR/merge-truth discipline already in
  force makes label staleness non-load-bearing, and rewriting the
  heartbeat loop risks exactly the semantics acceptance 2 protects.
- **A heartbeat-carried cursor watermark** — seen-membership is already
  readable at its one home; a second home for the same fact is the
  defect the reuse section exists to prevent.
- **Automatic escalation/takeover on any verdict** — the classifier
  feeds `ping-before-escalate` and the PDR-133 §9 both-instruments
  conjunction; it never replaces them.
- **Curing the platform's NOTIFY gap itself** — wake-primitive fixes
  stay with PDR-133 §8 and the platform rules; this lane adds the
  detection surface, not the wake.

## First-principles check

The `plan-body-first-principles-check` fires on the shape choice —
could it be simpler: yes, and the review round made it so (the practice
carries the cure; the tool shrank from a new command to an extension of
an existing classifier, population-scoped to challenge-carrying events
after the generic-silence signature back-tested at ~1.4% precision) —
and on the landing path (agent-tools workspace, TDD, reviewed PR per
no-code-without-first-hand-review). No vendor calls are involved.

## Review record

Assumptions-expert review (Opus, 2026-07-30 ~06:45Z): verdict
ready-with-amendments, twelve amendments, all absorbed in this revision —
including two falsified load-bearing claims (the directed-shape
`in_response_to` assumption; a signature that could not fire because
heartbeats are themselves seat-authored events) and the corpus
back-test that re-centred the design from tool-first to practice-first.
