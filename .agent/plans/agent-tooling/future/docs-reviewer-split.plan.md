---
plan_id: docs-reviewer-split
title: "Split the docs reviewer into a documentation-infrastructure expert and a prose expert"
type: governance-delivery
status: future
lifecycle: future
lineage:
  serves_thread: agentic-engineering-enhancements
  serves_stream: agentic-framework
  strategic_choice: FRAME
  derives_from:
    - ../../../../docs/architecture/architectural-decisions/127-documentation-as-foundational-infrastructure.md
    - ../../../directives/principles.md
    - ../../../directives/editorial-tone.md
last_updated: 2026-06-28
---

# Split the docs reviewer into a documentation-infrastructure expert and a prose expert

> **Strategic brief (`future/`). Owner-ratified direction (2026-06-28); not yet executable.**
> Execution decisions finalise only at promotion of this brief to `current/`. Do not build
> from this file; promote first, with `subagent-architect` and `assumptions-expert` readiness review.

## Problem and intent

The single `docs-adr-expert` reviewer conflates two genuinely distinct concerns, so neither is
served well:

1. **Documentation infrastructure and accuracy** — drift, ADR completeness, cross-reference
   integrity, reference direction, archive discipline, and (newly, per
   [ADR-127 §5](../../../../docs/architecture/architectural-decisions/127-documentation-as-foundational-infrastructure.md))
   the software-_design_ principles applied to documentation structure: SSOT, DRY, single
   responsibility (no god-documents), decoupling, stable indexes.
2. **Prose craft and voice** — clarity, concision, active voice, omit-needless-words (general
   craft), plus Oak's outward editorial voice ([`editorial-tone.md`](../../../directives/editorial-tone.md)).
   The current reviewer carries **none** of this: there is no carrier in the roster for prose
   craft or the Oak voice, so outward copy (VISION, strategy, public README) and the readability
   of every authored doc go unreviewed for craft.

**Who it harms.** Readers of outward copy (teachers, leaders, builders, partners) get prose that
no specialist shaped to the voice; readers of internal docs get structure-and-accuracy review but
no craft review. **Mechanism.** This is the single-responsibility principle applied to the agent
roster itself — the reflexive case of ADR-127 §5 (documentation is infrastructure): one reviewer
owning two unrelated knowledge bases (ADR/structure doctrine vs Strunk & White + the Oak voice)
serves both shallowly, exactly as a god-class does.

## End goal, mechanism, and means

- **End goal.** Two composable reviewers, each with a single responsibility and its own knowledge
  base, so a document can be reviewed for **structure/accuracy** and for **craft/voice**
  independently and well — and outward copy finally has a voice specialist.
- **Mechanism.** Split by _concern_, not by document type. The two reviewers **compose** on one
  document (an ADR gets both lenses) and **coordinate** at the one shared edge (plain language) with
  `accessibility-expert`. Distinct knowledge bases and distinct trigger conditions are what make the
  split earn its keep over one reviewer with two checklists.
- **Means.** (a) Overhaul the existing `docs-adr-expert` into the **documentation-infrastructure
  expert** (keep its full current remit; add the ADR-127 §5 design-principles lens). (b) Author a new
  **prose expert**. (c) Wire both into the reviewer matrix (`invoke-code-experts`) and regenerate
  platform adapters. Authoring is via `subagent-architect`.

## The two reviewers (domain boundaries)

### Documentation-infrastructure expert (overhaul of `docs-adr-expert`)

- **Owns:** documentation drift/accuracy, TSDoc accuracy, ADR/PDR completeness and WHAT-not-HOW
  discipline, cross-reference integrity, reference direction, archive discipline, no-moving-targets,
  and the **ADR-127 §5 design lens** — SSOT (one canonical home; others point), DRY (no duplicated
  content; cite the stable interface), single responsibility (flag god-documents), decoupling and
  stable indexes.
- **Does NOT own:** prose craft, sentence-level readability, or the Oak editorial voice.
- **Naming (decide at promotion):** rename to `docs-infrastructure-expert` for clarity, _or_ keep
  `docs-adr-expert` and extend in place. Recommendation: extend in place to avoid rename churn across
  the reviewer matrix and adapters, unless the owner prefers the clearer name. Either way the remit,
  not the label, is what changes.

### Prose expert (new)

- **Owns, in two scoped layers:**
  - **Universal craft (all prose, every doc):** clarity, concision, active voice, omit-needless-words,
    plain words, lead-with-the-point — the Strunk & White discipline. Applies to ADRs, plans, READMEs,
    and outward copy alike.
  - **Oak outward voice (scoped):** the `editorial-tone.md` voice — empower-the-reader, personable,
    British English, teacher-as-protagonist — applied **only** where `editorial-tone.md` says it
    applies (VISION, strategy, public-facing README narrative, outward copy) and explicitly **not** to
    the precise-transmission docs that directive excludes.
- **Does NOT own:** documentation structure, accuracy, ADR completeness, or cross-references (that is
  the infrastructure expert); WCAG conformance (that is `accessibility-expert`).

### Composition and coordination

- **Compose on one doc.** An ADR or README gets the infrastructure lens (structure/accuracy) and the
  prose lens (craft/voice) independently; neither blocks the other.
- **Coordinate at the plain-language edge** with `accessibility-expert`: the prose expert improves
  clarity as _craft_; `accessibility-expert` owns the WCAG 3.1 plain-language _conformance_
  requirement. The prose expert defers conformance verdicts to it and they do not duplicate.
- **Adjacent, non-overlapping:** `onboarding-expert` owns onboarding journey/discoverability (the
  prose expert reviews only the sentence craft of onboarding prose); `design-system-expert` and
  `react-component-expert` own UI, not prose.

## Domain boundaries and non-goals

- **Non-goal:** a third "documentation" reviewer — two concerns, two reviewers, no more.
- **Non-goal:** splitting by document _type_ (e.g. an "ADR reviewer" vs a "README reviewer"). The
  split is by _concern_ (structure vs craft); both reviewers see all doc types.
- **Non-goal:** moving WCAG/plain-language ownership out of `accessibility-expert`.
- **Non-goal:** changing what `editorial-tone.md` governs or where the Oak voice applies — the prose
  expert _consumes_ that directive's scope, it does not redefine it.
- **Non-goal:** making either reviewer modify files; both stay observe-and-report.

## Dependencies and sequencing

- **`subagent-architect` and `assumptions-expert` currency — `blocking`, and the first work (owner-directed
  prerequisite, 2026-06-28).** Before this split is built, both agents that will author and review the new
  reviewers must be **checked against official/current documentation, new sources, and guidance, and updated
  as necessary** — because they are the tools that produce and gate the work, and a stale architect or a
  stale assumptions reviewer propagates its drift into every reviewer they touch. This currency check is the
  first task at promotion; it gates the rest of the plan. Minimum shippable shape if deferred: none — this is
  a hard prerequisite, not a beneficial one.
- **ADR-127 §5 + the `principles.md` clause** — `blocking` for the infrastructure expert's new design
  lens (the doctrine it enforces). **Landed 2026-06-28**, so this prerequisite is met.
- **`editorial-tone.md`** — `blocking` for the prose expert's voice layer. Exists (Accepted directive).
- **`subagent-architect` (as authoring tool)** — `beneficial` for the authoring step, not blocking _it_
  (but gated by the currency prerequisite above). Minimum shippable shape without it: author the two
  definitions by hand against `.agent/sub-agents/` conventions and run `pnpm subagents:check` +
  `pnpm portability:check`. `subagent-architect` raises quality and spec-conformance.
- **The reviewer matrix (`invoke-code-experts` executive memory)** — `blocking` for discoverability:
  both reviewers must be wired into the invocation matrix and timing tiers, or they will not be invoked.

## Strategic acceptance criteria and success signals

- The roster has exactly two doc reviewers with **non-overlapping, stated** responsibilities; a
  reader of either definition can say what it does NOT own.
- A worked review of one outward-copy doc (e.g. a strategy page) and one internal doc (e.g. an ADR)
  shows the prose expert applying craft to both and the Oak voice only to the outward one — proving
  the scoped-voice boundary holds.
- The plain-language edge with `accessibility-expert` is covered once, not twice (no duplicated
  verdict, no gap).
- `pnpm subagents:check` and `pnpm portability:check` pass for both definitions across all supported
  platforms.

## Risks and unknowns

| Risk | Mitigation |
| --- | --- |
| The split adds coordination overhead greater than its focus benefit | The two concerns have distinct knowledge bases and trigger conditions; compose without blocking, coordinate at only one edge. Re-test the warrant at promotion. |
| Prose expert and `accessibility-expert` duplicate or gap on plain language | State the craft-vs-conformance boundary explicitly in both definitions; prose expert defers conformance. |
| Rename churn if `docs-adr-expert` is renamed | Default to extend-in-place; treat the rename as an optional clarity move with its own reference-sweep cost. |
| Two reviewers invoked where one was, raising seat cost | Both are cheap observe-and-report sub-agents; invoke the prose expert proportionately (outward copy and significant authored prose), not on every trivial doc touch. |

## Promotion trigger (`future/` -> `current/`)

Promote when the owner authorises building the reviewers. **The first task at promotion is the currency
prerequisite above** — check `subagent-architect` and `assumptions-expert` against official/current
documentation and guidance and update them as necessary; only then use them. After that, finalise: the
infrastructure-expert naming decision (rename vs extend-in-place), the exact prose-expert knowledge
base (which Strunk & White principles to encode, plus `editorial-tone.md`), the reviewer-matrix wiring,
and the adapter regeneration. Author with the (now-current) `subagent-architect`; readiness review by
`assumptions-expert` (proportionality) and a docs/onboarding reviewer.

## Foundation alignment

ADR-127 (documentation as foundational infrastructure, §5 design principles); `principles.md`
§"Documentation Is Infrastructure"; `editorial-tone.md` (the Oak voice and its scope); the
`new-rule-vs-pdr-clause` and subagent-authoring conventions under `.agent/sub-agents/`.
