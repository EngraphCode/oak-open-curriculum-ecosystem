---
status: future
kind: strategic
owner_decision_required: false
lineage:
  serves_thread: agentic-engineering-enhancements
  derives_from: .agent/directives/continuity-practice.md#disposition-of-continuity-surfaces
---

# Continuity-surface drift prevention (Phase 2)

> **Strategic brief.** Phase 1 (the one-time curation) was applied this session (commit
> `6ad02e953`); its reusable runbook now lives embedded in
> [`continuity-practice.md` §Disposition](../../../directives/continuity-practice.md) (per PDR-120,
> a runbook embedded in the rule it enacts — not a standalone plan). This brief owns the
> *recurrence* — keeping `repo-continuity.md` and the thread `*.next-session.md` records in their
> compact-active-state role without a periodic manual catch-up. Decision-lens resolved
> (`principles.md` §Decision Lenses); routed into existing homes, not forked.

## Problem and intent

`repo-continuity.md` drifts from *"compact repo-level active state"* into a reverse-chronological
session-landing log because the lightweight session-handoff loop **appends** a Current-State entry
each session while the conserve-and-delete of *finished* entries lags (it is assigned to the deep
consolidation loop, which does not run every session). Append-rate > drain-rate → monotonic
accretion → periodic critical-fitness catch-up. Intent: make drain-rate ≥ append-rate structurally,
so the surface stays a fast, truthful pickup surface and no live forward-pointer is buried.

## End goal, mechanism, means (decision-lens resolved)

Three candidate cures, resolved through the lenses in order:

- Lens 1 (LTAE): generated/derived state beats authored state → **(c) derive the surface** is the
  end-state; **(b)** is the strongest *now-buildable* structural cure; **(a)** alone is passive
  discipline (`passive-guidance-loses-to-artefact-gravity`), insufficient.
- Lens 2 (strict everywhere): a prose-discipline-only cure is "rely on diligence" (cf. F-95) → a
  **mechanical gate (b)** is required, not (a) alone.
- Lens 3 (simpler without compromise): **reuse** — AX WS-4 already builds a recompute-not-record
  drain-fix validator for the sibling frictions register, with a "drain-lag" class. Extend its scope
  to continuity surfaces rather than build new.
- Lens 4 (simpler if the system changed): **(c)** dissolves it — the convergence target
  ([[project_graph_approach_is_practice_convergence_target]]).

**Verdict — three routed workstreams (no fork; each homes in an existing surface):**

- **(a) Doctrine — curate-not-append** (`agentic-engineering-enhancements`). Amend
  `continuity-practice.md` §Disposition / §Continuation Records and the `session-handoff` skill §2 so
  "refresh the continuity contract" is an explicit *curate* step (drain the predecessor's
  now-finished entry as you add yours), not an append. Smallest; behaviour shift.
- **(b) Structural enforcement — extend AX WS-4** (`agent-tooling`,
  [`agent-experience-improvement.plan.md`](../../agent-tooling/current/agent-experience-improvement.plan.md)).
  Add a **continuity drain-lag class** to the drain-fix validator: a `repo-continuity.md` /
  thread-record entry whose cited commit/PR is merged yet still carries full landing narrative.
  Report-first, then blocking — mirrors the frictions-register WS-4 lifecycle. This is the spine.
- **(c) Convergence — derive the surface** (`cost-of-collaboration`, already in the locked scope).
  The session-landing log should be *derived* from the F-98 binding view + commit/PR graph (PDR-119
  memory-event-graph) rather than hand-authored. Already inside Beluga's team-tooling locked scope
  (F-98 binding view, OQ5); this brief references it, does not duplicate it.

## Domain boundaries and non-goals

- Not the one-time curation (Phase 1).
- (b) extends the existing AX WS-4 validator; it does not create a parallel continuity validator.
- (c) is owned by the work-state/liveness convergence (cost-of-collaboration locked scope); this
  brief contributes the continuity-surface consumer view, not a competing design.

## Dependencies and sequencing

- (a) is independent and shippable now (a doctrine + skill edit).
- (b) is `beneficial`-blocked on AX WS-4 landing (currently `pending`); minimum shippable shape
  without WS-4 = (a) alone, accepting periodic manual curation (Phase 1's runbook).
- (c) is `blocking`-gated on the F-98 binding view (team-tooling session).

## Strategic acceptance / success signals

`repo-continuity.md` stays within fitness thresholds across multiple sessions **without** a dedicated
catch-up pass; the drain-lag validator (b) flags a stale entry before it accretes; (c) removes the
hand-authoring step entirely.

## Promotion trigger

Promote (a) to `current/` whenever the next continuity-curation pass runs (cheap, do it inline).
Promote (b) when AX WS-4 reaches its A2 (failure-class) cycle — add the continuity drain-lag class
there. (c) promotes with the F-98 binding-view build.
