---
pdr_kind: governance
---

# PDR-121: Planning Vocabulary

**Status**: Accepted
**Date**: 2026-06-28
**Related**:
[PDR-018](PDR-018-planning-discipline.md) (planning discipline — the plan as a
load-bearing artefact);
[PDR-027](PDR-027-threads-sessions-and-agent-identity.md) (the thread as the
continuity unit);
[PDR-026](PDR-026-per-session-landing-commitment.md) (the session and its landing);
[PDR-037](PDR-037-substrate-vs-axis-plan-categorisation.md) (substrate-vs-axis plan
categorisation);
[PDR-079](PDR-079-pdr-vs-adr-portability-distinction.md) (why the portable semantics
live in a PDR and the host realisation in a host ADR — this PDR is the portable half
of a mirrored pair).

## Context

Agents organise work through a family of terms — plan, thread, programme, and the
units around them. The terms were defined piecemeal across separate decision records,
and the cross-cutting grouping term had no definition at all, so it was used before it
was defined. Without one portable glossary the terms drift in meaning between sessions
and repos. This PDR is that glossary: the portable semantics of how agent work is
organised. A host instantiates them — directories, lifecycle lanes, file conventions,
how membership is recorded — in a mirroring host ADR (PDR-079).

## Decision

The planning vocabulary is defined here as portable Practice concepts. Each term has
one meaning; where a term is already owned by another record, this glossary cites it
rather than restating it.

- **Plan** — a load-bearing artefact encoding intended work (PDR-018). **Strategic** =
  intent, boundaries, and a promotion trigger; **executable** = work items with
  acceptance criteria and deterministic validation.
- **Thread** — the continuity unit: a multi-session stream of work carrying identity
  across sessions (PDR-027). (Worded "conceptual lane" until 2026-07-24; retermed when
  the lane gained its own definition — the coherence-surface-bounded unit of routed
  work, PDR-117 dated amendment — to keep the two concepts distinct: the thread
  carries continuity, the lane is what a seat holds.)
- **Arc** — a coherent sequence of sessions or slices delivering one substantial
  outcome on a thread; informally named.
- **Programme** — a cross-cutting grouping of work that spans the host's primary
  organising groupings, gathered so shared, interdependent work is discoverable and
  sequenced. A programme is recorded as a **navigable view** (which owns membership)
  plus a **membership edge** on each member. It is a *view over* work, not a container
  that *owns* it: members keep their home; the programme points.
- **Phase** — an ordered sequence of workstreams within a plan.
- **Workstream** — a unit within a plan scoped to one concern; decomposes into cycles.
- **Cycle** — the unit of landing: a failing test, the product code that greens it,
  and any refactor, together.
- **Lifecycle states** — work moves *later → next → now → done*; a host names the
  surfaces that hold each state.

Higher-altitude organising terms (**vision**, **strategy**, **stream**) project the
same work at decreasing altitude; a host may define them further where it expresses
intent at those altitudes.

## Rationale

One glossary stops the drift and gives the cross-cutting grouping a definition before
more uses accrue. The semantics are portable, so they live in a PDR; the realisation
(which directories, which file names, how membership is stored) is host-specific, so it
lives in a mirroring host ADR (PDR-079). Alternatives rejected: leaving the terms
scattered (the drift continues, and the new term stays undefined); a single combined
document (it would carry host file paths and so could not travel).

## Consequences

- One portable home for the vocabulary; the cross-cutting grouping term is defined.
- A host cites this PDR and records its instantiation in a mirroring ADR; the host's
  template/index surfaces point to that pair rather than re-defining terms.
- The glossary is interim against a host's move to a machine-readable intent graph: the
  terms become node and edge types, and these definitions inform those types — the
  definitions persist as the decision even as the embodiment shifts.

## Disambiguation

A host domain may reuse one of these words for an unrelated concept — for example a
curriculum, catalogue, or product "programme". Disambiguate by **context**: the
planning sense applies within the work-organisation surface, the domain sense within
the domain. Where a single surface is genuinely ambiguous, **prefix explicitly** (the
planning sense as a "planning programme", the domain sense by its own qualified name).
The host ADR records the specific homonyms its domain creates.
