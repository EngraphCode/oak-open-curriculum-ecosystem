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
- **Worked example → graduate to a pattern: the Decision Lenses can overturn, refine, AND prune a
  reviewed-and-committed design.** This session ran the already-committed, four-lens-reviewed
  kill-terminal-on-one adversary design through `principles.md` §Decision Lenses: **Lens 1 mandated**
  the change (precedence-is-not-approval), **Lens 3/4 refined** it from a minimal patch to the cleaner
  quorum-floor, and the matrix **retracted a cost/rigour "knob"** I had been about to offer (a
  cheap-cure violation caught by the matrix itself). Plus FRAME-1 self-similarity: the session lived
  candidates C33 (process-with-no-committed-assets) and C41 (dogfooding) in real time — the owner's
  "have the napkins actually been processed?" fired exactly the metacognition the corpus had just
  discovered. Reinforces existing doctrine (Decision Lenses, no-cheap-cure, precedence-is-not-approval,
  FRAME-1) as a strong worked instance.

## 2026-06-30 — discovery-first re-rooting + means-vs-ends metacognition (Linnet binds Leeward)

Routed for the next `consolidate-until-done` (the conservation plan's drain). Two cross-session lessons:

- **Run a means-vs-ends screen on any "prove X against a golden/reference set" framing.** The golden set
  / recall gate TUNES the instrument; the discovery (or whatever the work actually produces) is the end.
  It is easy to harden the tuning dial into the milestone — the corpus-analysis arc did exactly this
  (`graduate-or-decide` PASS/FAILed on recall, owner-corrected). Instance of
  [[legitimate-principle-as-avoidance-cover]] / the cowpath at the success-criterion altitude. Tell: the
  success criterion measures the instrument's fidelity, not the work's value. Candidate home: a
  metacognition/reasoning pattern, or an amendment to the cowpath / Decision-Lenses doctrine.
- **A reshape sweep (C47) must reach the `derives_from` source — and check whether the source was right
  and the *derivative* drifted.** Reconciling only the leaf plan would have missed that the design report
  held the truer framing all along while the plan layer inverted it. Refines the
  reshape-needs-full-sweep pattern: the sweep includes verifying the source, not only propagating the
  leaf's new shape.

## 2026-07-01 — full-run preflight: recurrence-despite-home + unpinned-block drift (Flare hunts Obsidian)

Sharp lessons from instantiating + adversarially verifying the napkin-corpus full-run preflight. For the
next `consolidate-until-done`:

- **Recurrence-despite-home ([PDR-098](../../practice-core/decision-records/PDR-098-doctrine-traction-firing-detection-response.md)):
  I re-hit the documented Workflow footguns by authoring the Workflow without reading their home.**
  [[bounded-structured-output-for-workflows]] already documents args-arrives-unparsed (guard
  `typeof args==='string'?JSON.parse:args`) AND verifier-quota-death (treat verify results sparse) —
  also flagged in this file (2026-06-30) and the tooling README. I still passed an object `args` (arrived
  undefined → verifiers inspected the wrong file → a false NO_GO) and lost verifiers to a quota trip. Three
  passive homes, none fires at Workflow-authoring time. First-class evidence for the action-time-interrupt
  lane (PDR-098 empty quadrant / `action-time-structural-interrupt-design-space.plan.md`): a
  "read the Workflow-footgun pattern before authoring a Workflow" firing gate. Do NOT re-home the footgun.
- **Unpinned hand-pasted blocks keep drifting — a 4th block found.** metaPrompt had drifted (ASCII `in`
  vs the source's `∈`) between the straight-through source and the split templates, unguarded by any test
  (conformance pins only the routing state machine). v2 found the routing mirror drifted; this session
  found metaPrompt. Reinforces the WS-C repo-validator machine-pin (conservation plan). Until then: re-diff
  ALL FOUR duplicated blocks (map/reduce/meta prompts + ORCH_MIRROR) against source at each launch.
- **Adversarial launch-readiness verification of a one-way artefact catches drift self-review misses.**
  The metaPrompt drift and the scratchpad-unreachable-by-subagents flaw were both surfaced by the
  fresh-reader panel, not my own re-diffs — and put launch-ready/verification artefacts IN-REPO (subagents
  cannot read the scratchpad). Candidate: a pattern (pre-spend adversarial verification of a one-way action).

## 2026-07-02 — TS rebuild of the workflow suite + the money-gate fork (Perseus wakes Oblivion)

For the next `consolidate-until-done`:

- **A sandbox constraint is a BUILD instruction, not a licence to hand-write.** "The harness cannot
  import repo code" was read for weeks as "hand-author plain `.mjs` with pasted mirrors" when the
  repo's own answer everywhere else is "compile and bundle to a self-contained artefact". The
  misread propagated into mirrors, hand JSON schemas, splice tokens, and a re-diff checklist — an
  entire drift ecosystem downstream of one wrong inference. Tell: the moment a surface feels
  "special" enough to exempt from TypeScript/DRY/strictness, that feeling IS the cowpath signal;
  the standards exist precisely for the surfaces that feel special. (Owner-corrected 2026-07-01;
  candidate: pattern, or an amendment to the cowpath doctrine.)
- **Mirrors drift wherever they are not machine-held — including the "source of truth" itself.**
  The migration equivalence check found a FIFTH never-pinned duplicated block (votePrompt) that had
  drifted between the straight-through "source" and the template that actually ran — the SOURCE was
  the stale copy. Re-diff-by-discipline missed it for weeks because the block was never on the
  checklist. The cure that ends the class is bundling from one source; checklists only ever pin the
  blocks someone remembered to list.
- **Pre-execution review of one-way tooling pays at extreme odds.** Three independent reviewer
  lenses converged on the same guard hole (wrong-stage seeding), and code-expert's content-blind
  contract-scan catch (inlined corpus quotes contain `process.env` verbatim) would have stranded
  the 30M run AFTER the map spend, at the exact moment the pressure would be to weaken the gate.
  Compact-vs-pretty JSON was the difference between a 363KB artefact and breaching the 524,288-char
  harness cap. All caught pre-spend for ~450k of review tokens.
- **Workflow data transport physics:** data passed as `Workflow(args)` rides through the OPERATOR'S
  context (~120k tokens for a leaves-sized payload) and hand-inlined data competes with code for
  the 524,288-char script cap. The shape that works: committed checkpoint JSONs → zod-validated at
  build → stage-projected → compact-inlined into the artefact by the build, with a stage
  discriminant so wrong-stage seeding is a zero-spend typed failure.
- **A cost backstop firing is a fork, not a failure — and budget-doubling is owner-scope even under
  broad overnight authority.** Reduce legitimately yielded 246 candidates (2× projection; verified
  not-fragmentation by distribution analysis before deciding anything). The right autonomous move
  was: analyse first-hand, prepare both launch-ready forks, commit the checkpoints, surface with a
  brief, stop the spend. "Whatever you think is appropriate" covers execution, not re-authorising
  2× the owner-set ceiling.
