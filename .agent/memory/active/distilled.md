---
fitness_line_target: 120
fitness_line_limit: 180
fitness_char_limit: 12000
fitness_line_length: 100
drain_strategy: "Extract settled entries to permanent docs (ADRs, PDRs, governance, READMEs, patterns)"
merge_class: curated-learning-register
fitness_content_role: drainable-buffer
fitness_rationale: >-
  Lowered 2026-05-25 after owner-requested processing through `oak-consolidate-docs`.
  The active file carries the conservation role and graduation pointers.
  Falsifiability: if a napkin rotation adds high-signal learning that has no
  stable permanent home, preserve it first and revise the envelope by substance
  rather than trimming the lesson.
---

# Distilled Cross-Session Lessons

A brief staging surface for cross-session lessons between a napkin rotation and
their promotion to a permanent home. An entry lands here only when a rotation
surfaces a lesson that is not immediately homed; it is **promoted on the next
consolidation by judgment** — to a `patterns/` file, a rule, a PDR/ADR, or a
governance doc.

**Promote on the first instance.** We do not hold a lesson here waiting for a
second sighting; we promote it and trust the Practice to invalidate a wrong
promotion through experience (owner direction, 2026-06-27). A lesson sitting in
this buffer does not fire when the next agent needs it — graduation is the whole
point. Apply judgment about *which* home, not about *whether* the lesson has
earned promotion.

New napkin rotations append below; the next consolidation promotes them out.

## 2026-06-30 — v2 corpus-analysis discovered patterns awaiting graduation (Laurel turns Stamen)

The v2 large-corpus-analysis rerun (a discovery FEEDER per
[PDR-122](../../practice-core/decision-records/PDR-122-agentic-judgment-pipelines.md)) surfaced a
validated work-list for the conservation machinery to graduate. Promote on the next
`consolidate-until-done`:

- **13 un-homed kept patterns** — work-list + full statements in the `agentic-engineering-enhancements`
  thread record (§NEXT-SESSION PICKUP) and
  [`reports/agentic-engineering/large-corpus-analysis-tooling/data/v2-rerun-corrected-findings-2026-06-30.json`](../../reports/agentic-engineering/large-corpus-analysis-tooling/data/v2-rerun-corrected-findings-2026-06-30.json).
  Triage each: novel → pattern / rule / PDR / guidance; else note already-covered. High-value: C24
  (build-artefacts-as-codegen-DI), C33 (process-with-no-committed-assets), C38 (context-depth
  confabulation), C20 (TDD-atomic), C35 (data-is-the-source-of-truth), C47 (reshape-needs-full-sweep),
  C49 (schedule-not-scope-reduction).
- **Workflow/tooling operational footguns** (args-arrives-as-a-JSON-string; `.output` wraps the return
  under `.result`; `node --check` false-positives top-level `return`; ~50k tokens/voter at high
  effort; seeded-continuation > blind resume) — conserved in
  [`reports/agentic-engineering/large-corpus-analysis-tooling/README.md`](../../reports/agentic-engineering/large-corpus-analysis-tooling/README.md);
  graduate to a harness-workflow guidance/pattern if not already covered.
