---
pdr_kind: governance
---

# PDR-127: The Team-Branch Coordination Protocol

**Status**: Accepted
**Date**: 2026-07-14
**Related**: [PDR-117](PDR-117-director-and-implementer-roles.md) (Director
and Implementer roles — this PDR governs the shared git surface those roles
operate against); PDR-094 (`PDR-094-comms-corpus-preservation-and-retention.md`)
(comms events are untracked-by-design — this PDR's clause 3 is the
consolidation-time consequence of that design; an adopting host's own
ADR, where one exists, is a host-local companion record, not this PDR's
dependency); `never-commit-to-main` (the team branch this
PDR governs is always a regular non-`main` branch; every commit this
protocol describes lands there or on a product branch, never on local
`main`, so that rule's prohibition applies unchanged throughout).

## Context

A multi-agent team session accumulates two structurally different kinds of
change while it runs: **coordination/knowledge state** (napkin, distilled,
memory buffers, thread records, ARC channels, claims archives — the
substance a team needs to see and build on live) and **work product** (source,
docs, config changes destined for the product). Before this protocol, both
kinds landed through the same path-or-lack-of-one: work product correctly
went worktree → PR → `main` with full review, but coordination state had no
settled landing surface, so it either piled up uncommitted on a shared
primary checkout (a fragile, single-point-of-failure working tree that
every team member's session depended on staying intact) or leaked into
product PRs as an unrelated rider.

The owner ratified a three-clause protocol during the first PDR-117 Director
seat's team session (2026-07-14), across three live rulings issued within
one sitting, to give coordination state its own disposable landing surface
without weakening the product airlock. The protocol existed only as
comms-stream narrative at ratification time — comms events are
untracked-by-design (PDR-094) and cited nowhere else, so without this record
the ruling would have had no durable, version-controlled home at all.

## Decision

**Clause 1 — Scope.** A **team branch** (e.g. `team/<effort-name>`) is where
collaboration and communication state COMMITS: continuity surfaces, napkin
and memory buffers, thread records, ARC channels, claims archives. Work
product NEVER commits there — every source or docs change destined for the
product still goes worktree → PR → targeting `main`, with the full airlock
(checks, review, branch protection) unchanged. A tracked file that is
genuinely work product (e.g. a config-file wiring change, repo-wide tooling
behaviour) lands via the ordinary worktree → PR → `main` path even if it
was touched during a team session — team-branch eligibility is determined
by the file's *kind* (coordination/knowledge vs product), never by which
session touched it.

**Clause 2 — Reconciliation is one paired ritual, event-driven.** Team
branch ↔ `main` reconciliation always happens together as a single
operation: `main` merges INTO the team branch first (conflicts resolved
there under semantic-merge discipline — concepts, not lines, for every
memory/state file), then the team branch lands INTO `main` via an ordinary
PR. The trigger is a **significant change on either side** — a notable
merge to `main`, or a notable knowledge settlement on the team branch — not
a clock cadence. A **30-minute fallback timer** runs the ritual if it has
not fired by event in that window; a fallback-triggered run that is a
no-op (nothing to carry either direction) twice in a row stands the timer
down — the event-driven trigger re-arms it at its next firing (bounded per
`loop-exit-criteria-required`, never an unbounded poll). **Release-automation
commits on `main`** (the `chore(release)` commits minted by the ritual's own
branch→main merges) do NOT count as significant change — without this
exclusion the ritual would re-trigger itself through its own releases. The
Director seat (or whichever seat owns coordination for the session) owns
recognising the trigger and running or routing the ritual. Named consequence,
accepted by design: under this model, each team-branch→main merge mints a
patch release.

**Clause 3 — Comms events are never committed; sweeps make their knowledge
durable.** `.agent/state/collaboration/comms/` stays untracked, exactly as
PDR-094 already establishes. What this clause adds is the *reason it
is safe* under the team-branch model: because every seat resolves the comms
directory via the coordination-home mechanism (a worktree-local decoy
directory is the named threat to this invariant), regular and vital
knowledge-curation sweeps (`consolidate-docs`, dedicated consolidation
passes) can always find and absorb the live signal into version-controlled
homes. Events are the live signal tier; the sweep is the mechanism that
makes their substance durable. Never commit the events themselves; never
skip the sweeps that carry their knowledge forward.

## Consequences

**Enables**: coordination and knowledge state can accumulate safely across
a multi-agent team session without either destabilising a shared primary
checkout or leaking into product PRs; the product airlock (worktree → PR →
`main`, full review) stays untouched by team-session volume.

**Costs**: a patch release mints on every team-branch→main landing under the
every-merge release model — accepted by design, not a defect to fix.
Coordination state briefly diverges between the team branch and `main`
between reconciliation ritual runs; the 30-minute fallback bounds how long
that divergence can persist without a significant-change trigger.

**Forbids**: committing work product to a team branch (it must go through
the ordinary worktree → PR → `main` path regardless of which session
touched it); committing raw comms events anywhere; treating the
reconciliation ritual as optional once a significant change has landed on
either side.

## Falsifiability

Shown wrong if teams repeatedly need work product to land via the team
branch (evidence the scope clause is misdrawn — the fix is amending clause
1's boundary, not routing product through the coordination surface); if the
30-minute fallback timer fires so often on genuine (non-no-op) work that it
functions as a disguised clock cadence rather than a backstop (evidence the
event-driven trigger itself is under-firing); or if a comms-sweep cadence
proves unable to keep pace with live event volume, leaving durable knowledge
stranded in the untracked tier for materially longer than a session (evidence
clause 3's safety argument does not hold at the observed volume).

## Source

Graduates a chain of owner rulings issued in one team session (2026-07-14,
first PDR-117 Director seat): a founding ruling establishing the
scope/reconciliation/comms-events shape, a first amendment proposing a
daily reconciliation cadence, and a final amendment replacing that cadence
with the event-driven paired ritual — the 30-minute fallback and the
release-commit exclusion — recorded in clause 2 above. Each ruling
superseded the previous reconciliation wording in turn; this record carries
only the final, superseding form, per this Practice's own supersession
discipline (old wording is conserved in the session's napkin and comms
history, not here). The rulings existed only as untracked comms narrative
before this record; this PDR is their first durable, version-controlled
home.

## Enforcement note

This PDR is prose until each adopting host wires the team-branch scope
discipline into its own team-bootstrap workflow and Director-role brief
(where those surfaces exist). An adoption without that wiring should name
the gap explicitly.
