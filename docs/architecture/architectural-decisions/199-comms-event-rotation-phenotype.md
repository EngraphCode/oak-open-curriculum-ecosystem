# ADR-199: Comms-Event Rotation Phenotype — Class-Tiered Archive-Move

**Status**: Accepted (design ratified with owner 2026-06-13, "ratify as
proposed"). **Execution is deferred to WS7** of the comms-corpus research plan —
this ADR records the decision and captures the provenance its own citations need;
the archive-move, the `.agent/state/` untracking, and the provenance-check script
are the executing change, gated on this ADR existing first (see §"WS7 execution
order").
**Date**: 2026-06-13
**Related**: PDR-094 (the portable rotation contract this ADR is the repo
phenotype of — class-tiered, archive-not-delete, provenance-preserving);
PDR-080 (coordination-event absorption is signal-driven — the absorption engine
this rotation gates removal behind); PDR-081 (curator role — runs the rotation
pass); PDR-078 (liveness-heartbeat contract — the shortest-retention class);
ADR-183 (comms-event tag namespace — `heartbeat` / `failure-mode` /
`behaviour-note`, the class labels); ADR-186 (heartbeat substrate); ADR-197
(coordination-home owns registry state — the boundary the archive sits inside).

## Context

The `.agent/state/collaboration/comms/` event archive grew to ~5,188 events
(2026-05-20 → 2026-06-13) under a deliberate preservation hold for the
comms-corpus research. The hold had two operational costs: the flat directory
sits in the live comms watcher's drain path, and the corpus's value-preservation
mechanism (keep everything) erodes the watcher's awareness mechanism.

The research (WS0–WS6 of
[`comms-corpus-research-and-rotation-strategy.plan.md`](../../../.agent/plans/agent-tooling/active/comms-corpus-research-and-rotation-strategy.plan.md))
produced a two-round adversarially-reviewed rotation proposal
([`.agent/reports/agentic-engineering/2026-06-13-ws5-rotation-strategy-proposal.md`](../../../.agent/reports/agentic-engineering/2026-06-13-ws5-rotation-strategy-proposal.md))
which the owner ratified "as proposed" on 2026-06-13. The owner amended one term:
**archive, do not delete** (while the Fable model is unavailable, retain the raw
corpus on disk so later research stays possible). This ADR records the ratified
phenotype; PDR-094 carries the portable contract.

Two evidence facts from the research bound the phenotype honestly:

- The "corpus size kills the watcher" link is a **hypothesis, not corpus-proven**
  (the dramatic swap→0 evidence that once supported it was retracted as
  reboot-confounded). Rotation is justified here as **hygiene and the owner's
  stated operational goal** (shrink the live directory), not as a proven watcher
  cure. The proven drain-health cures are the watcher hardening and the storage
  redesign; rotation composes with them.
- The heartbeat family is ~50% of the corpus and the lowest per-event research
  value once aggregate cadence is extracted — the single best-evidenced argument
  for class-tiering, independent of the watcher question.

## Decision

Rotate comms events by a **class-tiered, age-triggered, archive-move** pass — the
repo phenotype of PDR-094. The phenotype:

1. **Trigger / who runs it.** A **curator-lane pass** (PDR-081) on the
   consolidation / session-close cadence — a deterministic, owner-or-agent
   initiated procedure, **not** an autonomous hook or daemon. No per-pass owner
   approval is required once this ADR is ratified; the curator runs passes within
   the ratified contract. (Rejected: a hook risks moving events mid-research and
   adds machinery; a Director-only duty over-centralises a hygiene task.)

2. **Archive home (off the drain path).**
   `.agent/state/collaboration/comms-archive/`, gitignored and outside the
   watcher's scan. The watcher already scans a configurable directory
   (`--comms-dir`, an existing parameter), so pointing it at `comms/` only is
   configuration, not new machinery. Once WS7 makes all of `.agent/state/`
   untracked-by-design (the tracked `README.md` anchor remains), the archive is
   retained on disk but never tracked — the bytes survive, the watcher never
   reads them.

3. **Manifest (untracked, full record).** `comms-archive/manifest.jsonl`, one row
   per archived event (`event_id`, `created_at`, `kind`, `tags`, `archived_at`,
   `disposition`) so the archive is navigable without re-reading every file.

4. **Provenance survivor (git-tracked).** Resolvability of permanent-doc
   citations does **not** rest on the untracked manifest. Inline-quote excerpts
   are the preferred default (this ADR demonstrates the pattern in
   §"Cited-event provenance" below); the fallback for long bodies / multi-doc
   citations is a git-tracked digest at **`.agent/reference/comms-cited-events.md`**
   (outside `.agent/state/`). A **pre-archive-move provenance check** (a script in
   the curator pass — rotation machinery, not a hook) scans ADRs / PDRs / patterns
   for 8-hex event-id tokens and **refuses to archive-move any cited event lacking
   inline or digest coverage** (PDR-094 Invariant 3).

5. **Class tiers and windows** (PDR-094 Invariant 5; windows are the
   owner-defaulted §7 sub-choices, tunable):

   | Tier                              | Events                                                                   | Window before archive-move | Gate                                         |
   | --------------------------------- | ------------------------------------------------------------------------ | -------------------------- | -------------------------------------------- |
   | Heartbeat                         | `heartbeat`-tagged + untagged `Heartbeat:` / `Heartbeat-end:`            | 48 h                       | Aggregate cadence stats extracted once first |
   | Diagnostic / test / noise         | test-probe / "delete me" bodies                                          | Immediate-eligible         | **Body read first** (see falsifier below)    |
   | Coordination narrative + directed | team-starts, closeouts, rulings, handoffs, status                        | 7 d                        | Operative gate §"Absorption gate"            |
   | Research-precious                 | `failure-mode`-tagged + genuine-signal subset of `behaviour-note`-tagged | Until graduated            | Absorbed before archive-move                 |

6. **Heartbeat aggregate artefact.** A durable cadence-statistics summary
   (per-agent beat counts, inter-beat distributions, gap windows) written once
   before any heartbeat beats are archive-moved.

7. **Schemas + fixtures relocation (WS7 step a).** The five `*.schema.json` files
   (`active-claims`, `closed-claims`, `comms-event`, `conversation`, `escalation`,
   consumed by six agent-tools source modules) and the `fixtures/` tree relocate
   **into the agent-tools workspace**, consumers updated, gates green. The
   research surfaced no evidence for a different home, so the plan default stands.

8. **Derived artefacts are not preservation targets** (owner, PR 201): the large
   `shared-comms-log.md` is a rendering rebuilt from the event stream — it goes
   untracked with no relocation and no disposition-ledger entry. Provenance
   attaches to the events, never to the rendered log.

9. **Composition with the storage redesign.** If
   [`comms-watch-storage-redesign`](../../../.agent/plans/agent-tooling/current/comms-watch-storage-redesign.plan.md)
   lands a watermark/segment store, the curator pass becomes "retire segments
   older than the window"; the class-tiers and the absorption gate are unchanged.
   Otherwise the directory-level archive-move ships standalone.

### Absorption gate (the single operative gate)

Rotation never archive-moves an event whose disposition is not recorded, where a
recorded disposition is one of: **(a)** absorbed into a durable home, **(b)**
classified routine, or **(c)** quarantined. Bulk classification (b/c) is allowed
but **title genre alone is never sufficient** — every bulk pass includes a body
read of a sample plus every event whose body exceeds a routine length threshold.

**Standing falsifier:** event `3cc1fb93` is titled "reproducer-test: long body
with shell-escaped apostrophes" but its body is a real three-way session-split
proposal carrying a live claim id — a title-genre sweep would have archived live
signal. See §"Cited-event provenance".

## Cited-event provenance (inline-quote-first; satisfies WS7 step 2 for this ADR)

Per PDR-094 Invariant 3 and the WS5 step-ordering constraint, every event id this
ADR cites carries a verbatim excerpt here, so the citation resolves from a clean
checkout after the raw event is untracked.

- **`86e94e54`** — Hushed Watching Night, narrative, 2026-06-11T09:59:14Z, "ARC
  n=3 findings ledger". Anchors the activation-enthalpy framing (lightweight
  channel reduces heavy-stream load) and the gate-rewrites-an-append-only-channel
  hazard. Verbatim:

  > "MEASURED BENEFITS: n=2 latency benefit holds at n=3 (boundary split
  > proposal→3/3-confirmed ~4 min … zero owner mediation). … n3-3 repo-level
  > lint/format gates rewrite gitignored ARC surfaces in place (MD004 marker flip
  > observed …)."

- **`3cc1fb93`** — Celestial Glimmering Moon, narrative, 2026-05-21T12:22:33Z,
  titled "reproducer-test: long body with shell-escaped apostrophes". The
  bulk-classification falsifier — a throwaway title over load-bearing content.
  Verbatim:

  > "Proposal — three-way session split (no boundary collision): Celestial
  > (46d23a): WS2.2 implementation … Molten (078515): WS3.3 implementation …"
  > (body carries open claim id `f4613bdc-6af8-435d-a5aa-26067408c588`).

- **`2ff03ded`** — Geyser stirs Bronze → Flame rides Temper, directed, message_kind
  reply, 2026-06-13T09:35:33Z. The SC1 linkage-discard proof: a substantive reply
  authored via the reply path whose structured threading fields are **absent
  entirely** (`in_response_to` and `in_reply_to` not present in the event keys).
  Verbatim:
  > "Flame — clear, and agreed: I will NOT fork a second plan. … One catch you'll
  > want (verify-before-acting): your 'verified relative path' does NOT resolve in
  > `feat/comms-research`."

## WS7 execution order (closes the report→ADR scope gap)

WS7 runs in this order; the first two steps are satisfied by the consolidation
session that authored this ADR:

1. **Author this rotation ADR** (brings the evidence citations into a permanent
   doc) — done.
2. **Populate inline excerpts / the digest** for every event id in the ADR —
   done (§"Cited-event provenance").
3. **Run the pre-archive-move provenance check** over all permanent docs.
4. **Only then execute archive-moves**, by class, per the migration path below.

Events cited as evidence must not be archive-moved before the doc citing them has
its provenance captured.

## Migration path for the held corpus (item-level disposition)

Migrate the held corpus once, by class, before the steady-state cadence takes
over (full detail in WS5 proposal §6):

1. **Heartbeat (~2,615 events, ~50%):** extract the cadence artefact, then
   archive-move beats older than the window — the single largest reduction.
2. **Diagnostic / test / noise:** body-read first (the `3cc1fb93` falsifier),
   then quarantine-note and archive-move.
3. **Research-precious (`failure-mode`-tagged + genuine-signal behaviour-notes):**
   already largely absorbed by WS1–WS4; confirm a recorded disposition per event
   before archive-move.
4. **Coordination narrative + directed older than the window:** classify routine
   via the body-sample safeguard, then archive-move.
5. **Within-window events stay live.**

Every step is archive-move (reversible); no step deletes; nothing under
`.agent/state/collaboration/experiments/` is touched (owner: never purged — it
relocates to a tracked home in WS7 step b).

## Consequences

- The live `comms/` directory converges to roughly one retention window of events
  plus not-yet-absorbed research-precious events; the watcher's working set
  shrinks ~50% on the heartbeat class alone.
- Cited-event provenance survives a clean checkout via inline excerpts /
  the tracked digest, enforced by the pre-archive-move check.
- The watcher-health justification stays **honestly a hypothesis** (PDR-094
  Invariant 4): the 7 d / 48 h windows are hygiene targets, not drain-health-
  derived bounds, until the controlled watcher-RSS × dir-size measurement (carried
  as an open item) sizes them.
- No new coordination machinery: the curator pass is a procedure over existing
  tooling; the provenance check is a script, not a hook or CLI.
- `.agent/state/` becomes untracked-by-design (WS7 step c), uniform with the
  existing `.agent/state/onboarding/` precedent; the tracked `README.md` anchor
  remains.

## Sub-choices defaulted (WS5 §7; owner ratified "as proposed")

- Retention window: 7 d coordination narrative / 48 h heartbeats (tunable).
- Archive location: `.agent/state/collaboration/comms-archive/`.
- Trigger cadence: consolidation / session-close curator pass.
- Ratified artefact shape: PDR-094 (portable contract) + this ADR (phenotype).

## Falsifiability

A future rotation that **deletes** events, moves a **cited event without
preserving provenance**, bulk-classifies on **title genre alone**, or labels the
**hygiene window as drain-health-derived without a measurement** is the failure
mode this ADR (and PDR-094) forbids. The success shape is absorb-first,
archive-move on a class-tiered age trigger, provenance enforced by the pre-move
check.
