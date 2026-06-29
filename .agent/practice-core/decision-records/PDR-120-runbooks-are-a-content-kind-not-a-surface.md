---
pdr_kind: governance
---

# PDR-120: Runbooks Are a Content Kind, Delivered Through Existing Surfaces

**Status**: Accepted
**Date**: 2026-06-28
**Related**:
[PDR-051](PDR-051-vendor-agnostic-skills-standardisation.md)
(vendor-agnostic skills standardisation — skills are the sole invocable-workflow
surface; this PDR places the runbook *content kind* against that surface);
[PDR-035](PDR-035-agent-work-capabilities-belong-to-the-practice.md)
(agent-work capabilities belong to the Practice — runbooks for agent-work
procedures are Practice substance by default);
[PDR-018](PDR-018-planning-discipline.md)
(planning discipline — a plan completes; a runbook recurs, which is why a runbook
is not a plan).

## Context

"Runbook" is long-standing informal vocabulary across the Practice corpus, but it
was never defined as a recognised artefact **kind**. The taxonomy named decisions
(ADRs/PDRs), policy (directives), always-applied constraints (rules), reusable
solution/failure shapes (patterns), bounded work (plans), and invocable workflows
(skills) — with no entry for the *repeatable operational procedure*. Real runbooks
nonetheless exist and recur: index/data-refresh management procedures, deploy and
rollback steps, codegen and benchmark runs, the gate-burndown sequence, the
worktree-retirement checklist, the continuity-surface curation procedure.

The cost of the missing definition is **misfiling**. The triggering instance: a
continuity-surface curation procedure (a repeatable HOW plus a verification recipe)
was forced into a `current/` **plan** because no better-shaped home was named — but
a plan *completes* (bounded work with an end state) while a runbook *recurs*. A
procedure in a plan slot pollutes the plan estate (a plan that never finishes) and
risks the reusable procedure being archived as "done". Symmetrically, an invocable
procedure with no skill gets re-derived each time.

## Decision

**A runbook is a content kind, not a storage surface.** It is a *repeatable,
step-by-step operational procedure* — the **HOW** to execute a recurring task
correctly each time — often carrying a verification recipe. It is distinct from its
neighbours:

- a **plan** *completes* (bounded work, an end state); a runbook *recurs*;
- a **pattern** is a *shape to repeat* or a failure mode, not an ordered procedure;
- a **rule / ADR / PDR / directive** is the *what and why* (a constraint, decision,
  or policy), not the ordered steps.

**A runbook is delivered through existing surfaces; it does not get a new surface.**
The delivery is chosen by one calculus — the **skill-load-budget triage** (a loader
platform's active-skill discovery budget is finite, so loading is not free):

1. **A skill** — when the runbook is invocable AND its trigger is frequent enough to
   justify the discovery-budget cost. Skills are the *sole* invocable-workflow
   surface (PDR-051; parallel invocable command surfaces were deliberately retired).
   A skill body *is* a runbook with an invocation surface — every skill body is or
   contains a runbook.
2. **A reference runbook** — when the trigger is rare: a section in an operations or
   governance document, or an operational-memory procedure, *read on demand* rather
   than loaded every session.
3. **Embedded in the rule / PDR / directive it operationalises** — when the runbook
   is the operational appendage of a constraint (the steps that enact the rule).

**The relationship, stated once:** every skill body is a runbook; **not every
runbook earns a skill**. Runbook is the *content*; skill / doc-section / rule-appendix
is the *packaging*. Creating a new invocable "runbook surface" is forbidden — it would
re-open the retired parallel-command-surface decision (PDR-051) and duplicate skills.

**Discoverability is an index, not a surface.** Because runbooks live across several
surfaces, the host SHOULD maintain a *stable index* that points to each runbook
wherever it lives (a skill, a doc section, a rule appendix). The index carries
pointers, never content (no duplication; SSOT preserved).

## Consequences

- Operational procedures stop being misfiled as plans or re-derived ad hoc; each has
  a named, correctly-shaped home chosen by the triage above.
- The host wires this phenotype: name "runbook" as a content kind in the artefact
  inventory, give the routing in the extending guide, and maintain the runbook index.
- A runbook currently wearing a plan's clothes is re-homed (the content moves to its
  skill / doc-section / rule, the plan shell dissolves).

## Non-goals

- **No new canonical or adapter surface** for runbooks — they ride skills (Layer-1
  canonical) and ordinary docs/rules; there is no runbook portability layer.
- **Not a rename of skills.** A skill is a runbook plus invocation packaging; the
  kinds are distinct (content vs delivery), and most runbooks never become skills.
- Not a mandate to convert existing reference runbooks into skills; the triage decides
  per runbook, and the default for a rare-trigger procedure is a reference runbook.
