---
status: c0-ratified-pending-readiness-reviewers
created: 2026-06-11
collection: user-experience/educator-end-users
todos:
  - id: w1-c0-owner-design-gate
    content: >-
      COMPLETED 2026-06-11 (owner, via AskUserQuestion in the authoring
      session): NEW PROMPT ratified — a seventh prompt owning ONLY
      position→next resolution, chaining into lesson-planning; argument set as
      recommended (subject, yearGroup, justCovered required; classNotes
      optional). The prompt NAME still lands through the S2 fixed vocabulary
      with owner sign-off at the PR (candidates: continue-teaching,
      plan-next-lesson, where-next — the get-keyword-graph /
      curriculum-mapping precedent).
    status: completed
  - id: w1-c1-prompt-cycle
    content: >-
      TDD cycle: prompt-surface tests describe the served prompt (definition,
      arguments, message orchestration incl. the KS4-science sequences caveat
      and attribution block) -> add the prompt definition + message generator;
      ADR-123 prompt count + table row; e2e prompts/get parity. One PR,
      Director-serialised.
    status: pending
    depends_on: [w1-c0-owner-design-gate]
  - id: w2-c1-impact-language-alignment
    content: >-
      Bounded outward-language alignment pass: sequencing / builds-on /
      curriculum-connected impact vocabulary across the named surfaces, every
      claim verified against delivered tool behaviour; includes the
      curriculum-mapping NC-coverage over-claim verify-and-ground item.
      Landing-page surface sequences BEHIND the item-5 claim (Hushed, seat Z).
    status: pending
---

# Position-Anchored Teaching Continuity (prompt + impact language)

## Problem and end goal

Every served MCP prompt today is **topic-anchored**: the teacher must already
know what to teach (`lesson-planning(topic, yearGroup)`,
`learning-progression(concept, subject)`, `curriculum-mapping(subject,
keyStage)`). The highest-frequency real entry point is **position-anchored**:
*"my class just finished X — plan what comes next, building on what they have
covered."* No surface owns the position→next resolution, while every tool it
needs shipped with Track-G (2026-06-11).

**End goal**: a teacher (through any MCP client) states where their class is
and receives a next-step lesson plan that demonstrably builds on what came
before — assumed prior knowledge surfaced as a checkable readiness list,
upcoming misconceptions anticipated, sequencing taken from Oak's threads
rather than model guesswork.

## Mechanism

A new MCP prompt owns ONLY the position→next resolution and then chains into
the existing `lesson-planning` flow for the resolved next lesson. This honours
the owner-ratified S3 reconciliation discipline ("extend/merge, never a third
planning surface", PR #162 precedent): planning substance stays single-sourced
in `lesson-planning`; the new prompt contributes the entry point that no
surface has.

Orchestration shape (agent-executed; the server stays a deterministic data
surface per ADR-191 — no server-side composition tool):

1. Resolve the stated position: `search` (scope units/lessons, year-narrowed)
   from the free-text `justCovered` to unit/lesson slugs; confirm the thread.
2. Derive what comes next: `get-thread-progressions` for the year-ordered
   sequence (KS4 science via `get-sequences` — carry the existing
   curriculum-mapping caveat verbatim).
3. Readiness check: `get-prior-knowledge-graph` anchored at the NEXT unit —
   its assumed prior knowledge is precisely what the class should now have
   secured; present it as a checkable list against `classNotes` if provided.
4. Anticipate: `get-misconception-graph` for the upcoming content.
5. Chain into the `lesson-planning` steps for the resolved topic (reference,
   not restatement), attribution carried.

Arguments: `subject` (required), `yearGroup` (required), `justCovered`
(required, free text — the topic/unit/lesson the class last completed),
`classNotes` (optional, e.g. "they struggled with equivalent fractions").
**Stateless by design** — the teacher states the position each invocation.

## Workstreams

### W1 — the prompt (c0 gate, then one TDD cycle)

- **c0 (owner design gate)**: name + argument set + chaining shape, mirroring
  the S3 c0 shape. Candidates above; owner decides; name lands through the S2
  fixed vocabulary with sign-off at the PR.
- **c1 (one cycle, one PR)**: prompt-surface tests describe the served prompt
  (definition + arguments + message orchestration incl. KS4 caveat + OGL
  attribution block, mirroring the landed prompt tests); implementation in
  `mcp-prompts.ts` + `mcp-prompt-messages.ts`; ADR-123 prompt count/table;
  e2e `prompts/get` parity. Director-serialised merge.

### W2 — outward impact-language alignment (one bounded pass)

Owner direction (2026-06-11): do not map tools/skills to the article
explicitly; align language, impact, and stated intent so readers draw the
conclusions naturally. One pass over the outward surfaces, with **every claim
verified against delivered behaviour** before it is written:

- MCP server instructions block (the "AI Agent Guidance" served text) and
  `get-curriculum-model` orientation copy.
- Prompt descriptions (sequencing / builds-on-what-came-before vocabulary).
- Root README + the MCP app landing page (hero/tools copy) — the landing-page
  file sequences BEHIND the live item-5 claim (seat Z) to avoid collision.
- **Named verify-and-ground item**: the live `curriculum-mapping` prompt asks
  for a "national curriculum coverage" output column, but no tool surfaces
  `nationalCurriculumContent` (verified 2026-06-11: zero hits in SDK source
  and codegen output; the field exists only in the bulk export schema). Either
  ground that step in a real surface or soften the claim — an unsupported NC
  claim is precisely the credibility failure the impact language must avoid.
  The full NC surface remains owned by the future
  `nc-knowledge-taxonomy-surface` plan (separate; not pulled in here).

## Prerequisites

- Track-G graph tools — **blocking, satisfied** (merged through #173).
- S3 attribution-validation owner step — **not a prerequisite** (this prompt
  derives from no oak-skills content; it composes served tools only).
- Item 5 (AGGREGATED_TOOL_ORDER) — **beneficial** for W2's landing-page file
  only (collision avoidance); minimum shippable shape: land W2 minus that one
  file, or sequence behind seat Z's PR.

## Non-goals

- **Stateful class profiles / persistence** — privacy + user-identity gated
  (Clerk thread); the stateless teacher-stated position delivers the value
  without it. Revisit only on observed real demand post-release.
- **A server-side composition tool** (e.g. `get-class-position-context`) —
  rejected on ADR-191 (the agent is the only reasoner) and the EEF t6a
  precedent (server-side contextual narrowing rejected; the agent selects).
- **A public curriculum-alignment benchmark for third-party tools** — owner
  acknowledges this likely sits with a different Oak team; at most a future
  report, explicitly out of this plan.
- **Quoting or mapping to the Tes article** in any shipped text.

## Proof contract

| Id | Acceptance | Proof level | Command / observation |
| --- | --- | --- | --- |
| P1 | Prompt served with correct definition + arguments | integration | prompt unit/integration tests green (`pnpm --filter @oaknational/curriculum-sdk test`) |
| P2 | Prompt retrievable end-to-end | e2e | `prompts/get` e2e parity test green (`pnpm test:e2e`) |
| P3 | Workflow delivers position→next value on real data | value-proxy | live MCP round-trip (D6-style recipe: server on :3333, invoke the prompt, follow the orchestration with real tool calls, verify the readiness list matches the next unit's prior-knowledge subgraph) |
| P4 | Outward claims match delivered behaviour | non-code | W2 review checklist: each changed sentence paired with the tool/test that evidences it |
| P5 | Delivered teacher value | release-and-observe | post-merge observation per the value-proven-by-release doctrine; no pre-release proxy claimed |

## Risks

- **Position resolution ambiguity** (free-text `justCovered` matches several
  units): the prompt instructs candidate presentation + teacher confirmation
  rather than silent selection — mitigation lives in the message text; test
  asserts the instruction is present.
- **Prompt-estate sprawl** (a seventh prompt): mitigated by the c0 gate and
  the chaining shape — if the owner judges entry-point-by-argument is better
  served extending `lesson-planning` with an optional `justCovered` argument,
  c0 records that and c1 reshapes accordingly (the analysis verdict prefers
  the new prompt because `lesson-planning` requires `topic`, which the
  position-first teacher does not yet know; inverting a required argument's
  contract is the worse reconciliation).
- **Language drift in W2** (marketing-style over-claim): the per-sentence
  evidence pairing in P4 is the control.

## Foundation alignment and lifecycle

- `principles.md` first question: the simplest shape that delivers the value
  is one prompt + one language pass — no new tools, no new data surfaces, no
  state.
- `schema-first-execution.md`: no schema-derived surfaces change; prompts are
  static content (existing pattern).
- `testing-strategy.md` / TDD: w1-c1 is one cycle, tests + prompt landing
  together; e2e in the same PR.
- Plan-body first-principles check: fires at w1-c1 start (re-verify the
  prompt-test idiom against the then-current estate) and before any W2
  sentence lands (re-verify the evidenced behaviour).
- Lifecycle triggers: per
  [`lifecycle-triggers.md`](../../../templates/components/lifecycle-triggers.md)
  — claim per workstream, handoff record on mid-cycle retirement,
  consolidation at completion.
- Readiness reviewers (before any DECISION-COMPLETE/execution-ready claim):
  `assumptions-expert` (proportionality + the chaining-shape assumption) +
  `mcp-expert` (prompt-surface correctness). Dispatch verdicts adjudicated
  first-hand.

## Relationship to the estate

- Source analysis: the 2026-06-11 research-appraisal session (this plan's c0
  carries the verdict; the owner ratified "absolutely our area" for the
  workflow and report-not-scope for third-party assessment).
- Single-sourced planning substance: `lesson-planning` prompt (S3 / PR #162).
- NC surface: future `nc-knowledge-taxonomy-surface` plan (unchanged).
- Distribution of the resulting capability: `external-facing-capability-
  distribution.plan.md` (unchanged; this plan only improves what is served).
