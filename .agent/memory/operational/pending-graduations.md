---
fitness_line_target: 1100
fitness_line_limit: 1467
fitness_char_limit: 200000
fitness_line_length: 100
fitness_item_count: required
fitness_item_count_target: 0
fitness_item_count_soft: 2
fitness_item_count_hard: 3
fitness_item_dwell_target: 2
fitness_item_dwell_soft: 4
fitness_item_dwell_hard: 7
lifecycle_model: >-
  canonical pending-graduations register — every live item is decision-debt
  (status pending/due/overdue) until it is graduated, rejected, or marked
  duplicate. Provenance and adaptation are the safety net for a wrong call.
access_pattern: >-
  consolidation-pass-only — read at consolidations and drain sessions; not
  loaded every session by every agent
drain_strategy: >-
  Drain by DECIDING: graduate (write the doctrine into its rule/PDR/ADR/pattern/
  governance-doc home, then remove the entry) or reject (decided not worth a
  home, with the reason). The decision-debt count falls only through a recorded
  terminal disposition — never by deleting an undecided item and never by raising
  a limit. Do not split, shard, or hide buffer depth.
fitness_rationale: >-
  The primary health signal for this buffer is the decision-debt count
  (fitness_item_count, target 0) — a flow-rate reading of whether graduation is
  keeping pace with capture. The line and character limits are a secondary
  structural signal: drain-cadence back-pressure for a consolidation-pass-only
  buffer, not a size cap. Recalibrated 2026-06-08: line hard 2200 -> 1467, target
  1500 -> 1100, so line-critical (hard x 1.5, the global ADR-144 ratio) lands at
  ~2200. Both signals are reported and acted on, never chased: substance is never
  trimmed to clear a zone (knowledge-preservation), and the register is drained
  down by deciding items, not by tombstone-removal.
merge_class: mostly-append-register
fitness_content_role: drainable-buffer
---

# Pending Graduations

The canonical register of **learned doctrine awaiting its permanent home** —
a lesson, pattern, or decision that is *already settled* and simply not yet
written into the rule / PDR / ADR / pattern file / governance doc where it will
live and fire. Every live entry is decision-debt (`status: pending/due/overdue`),
drained by **graduating** it (write it into its home, verify, then remove the
entry) or **rejecting** it (decided not worth a home, with the reason). The
target is empty (`fitness_item_count_target: 0`); provenance and adaptation are
the safety net for a wrong call.

## What belongs here — and what does not

An entry belongs ONLY if all three hold:

1. **It is learned doctrine** — a settled lesson, pattern, or decision, validated
   by implementation, by surviving at least one later session uncorrected, or by
   an owner correction. Not a hypothesis, not a proposal, not a question.
2. **Its home is a doctrine surface** — a rule, PDR, ADR, `patterns/` file, or
   governance doc. (If the natural home is a *plan* or a *report*, the item is
   future work or a proposal, not a graduation — see below.)
3. **It is not yet written there** — the only outstanding act is authoring it
   into that home.

**Belongs** (worked shapes):

- *"The prove-the-checker-with-a-negative-control lesson is stable across three
  instances and has no pattern file yet."* → graduates to a `patterns/` file.
- *"The decision-locus doctrine (product scope is the owner's; engineering is
  collaborative) is settled and uncorrected, but lives only in the napkin."* →
  graduates to a `user-collaboration.md` section.

**Does NOT belong** — route via the destinations table in
[`ephemeral-to-permanent-homing.md`](ephemeral-to-permanent-homing.md):

- **Future work / a build to do later** (*"author the portable Core PDR when a
  second repo adopts X"; "build the IDE plugin once the owner approves"*) → a
  `plans/` entry (in `future/` with a promotion trigger). The underlying doctrine
  may already be homed; the *doing-it-later* is a plan, not a graduation.
- **A proposal or feasibility finding** (*"here is a design for an IDE
  integration plane"*) → a `reports/` or `research/` artefact, promoted to a plan
  on owner GO.
- **An open question** (*"what liveness primitive should the operating model
  carry?"*) → [`open-questions.md`](open-questions.md) if strategic, or an
  exploration plan if it is a design decision needing a session.
- **An operational what-next or owner decision** (*"should we re-establish the
  Director seat?"*) → [`repo-continuity.md`](repo-continuity.md) (Next Safe Steps
  / Open Owner-Decision Items) or the owning thread record.
- **A tooling gap** → the frictions register.

The test: if you cannot name the *exact* rule / PDR / ADR / pattern / doc section
the entry will be written into, it is probably not a graduation — find its real
home above. An item only remains live decision-debt when it is genuinely settled
doctrine, has a doctrine home, and that home just has not been authored yet.

## Draining and dwell

Each consolidation decides *every* decidable item — graduate or reject — toward
an empty register. An item stays only when a named constraint genuinely blocks
authoring its home now. The anti-starvation guard is the **dwell-time axis**
(`fitness_item_dwell_*`, target 2 / soft 4 / hard 7 days): it surfaces the
*oldest* undecided item's age and escalates it. The dwell reading is **age, not
a hedge** — a short dwell is never licence to leave a decidable item undecided.

New capture appends below as inline-bracket entries — `- **<title>**` then a
backtick-wrapped inline `[…]` block (may wrap across lines) with pipe-separated
`captured / source / target / trigger / size / status` fields (schema:
`agent-tools/src/practice-fitness/item-count.ts`). The bracket must NOT be fenced
— a fenced or unwrapped block is silently uncounted (it raises a malformed
finding). `target` must name a doctrine surface (rule / PDR / ADR / pattern /
governance doc); if it names a plan or report, the item belongs elsewhere.

<!-- New pending-graduation capture appends below as inline-bracket entries. -->

- **Director operating model — drive via owner-launched peers + READ-ONLY reviewers (never implementer sub-agents); don't park/retire lanes mid-session (relay to an immediately-active successor); decide-and-drive, surface only constitutively-owner residue** `[captured: 2026-07-01 | source: napkin Lantern Director-closeout + comms 497f39cd/201cd6ef + user-memory director-operating-model | target: PDR-117 (Director & Implementer roles) amendment | trigger: owner-corrected 3x and validated this session (curriculum-hub-demo) | size: M | status: due]`
  - **Amendment nuance (Hawthorn #4, 2026-07-01):** the SKILL's degenerate "one-agent team" exception to Director-doesn't-execute is for a coordinator doing a *small* bit of work with *no successor coming* — it does NOT license the Director to seize a large remaining workload when the whole implementer cast relays at once. In a rotating-cast pause with substantial work left, the doctrine-right move is to **pause clean + surface the cast-replenish to the owner** (launching peer sessions is constitutively-owner; the Director cannot launch peers and must not grind the build via implementer sub-agents), not collapse into implementer mode. Worked instance: both curriculum-hub implementers retired simultaneously (PDR-063); Director surfaced the need, owner launched Cinder/Linnet + pre-provisioned Sycamore. Include in the PDR-117 expansion (Part B: Director-as-orchestrator / arc-closeout axis).
  - **Amendment nuance (Birch #7, 2026-07-02): the Director PROPOSES landing points.** Reviewed-green work accumulating uncommitted across a multi-agent tree is risk (validator blockades, mixed-slice trees); landing cadence is the Director's to drive — propose a Director-run commit train at every reviewed slice boundary, don't wait for the owner to request commits. Worked instance: 2026-07-02 four-window train.
- **Closed discriminated union + no-throw + no-silent-skip forces an EXHAUSTIVE total-function renderer (compiler-proven complete, no error path); safe-by-construction when the data boundary validates schema-first (strict-validation-at-boundary composes with the exhaustive renderer)** `[captured: 2026-07-01 | source: napkin + curriculum-hub-demo spine BlockRenderer.tsx + comms 3cedeefd | target: .agent/memory/active/patterns/ (repo engineering pattern instance) | trigger: survives a 2nd Claude-Design demo or a later session uncorrected | size: S | status: pending]`
- **A type/schema inferred from SAMPLED data must be validated against the COMPLETE corpus before it is trusted; a compile-time gate (typed literal `: T` annotation over the whole dataset) is the falsifier that a subset-review cannot be.** The Block union was built during the spine from a content subset; the first full 214-block extraction under the generator's `: Course` gate surfaced 5 real field gaps human subset-review had missed → schema-first union extension. Reliability-ladder instance: don't climb from "renders the samples" to "is complete". `[captured: 2026-07-01 | source: napkin Eclipse + curriculum-hub-demo scripts/course-extract.ts + lib/course/oak-course.generated.ts + comms 27c92b0e | target: .agent/memory/active/patterns/ (schema-first / validate-against-full-corpus pattern) | trigger: a 2nd instance of a sampled-schema gap OR a later session uncorrected | size: S | status: due]`
  - **Second instance (Birch #7, 2026-07-02) — the fallacy recurs one layer up, in VERIFICATION:** a workflow verifier CONFIRMED "the token package carries the SAME values" from two sampled anchors; the assumptions-expert corpus-complete check found only 3 of 20 demo values present (WS1 resized). Universal claims ("carries the values") need corpus-complete checks even in confirm-verdicts. Trigger FIRED → status due.
- **Principled ESLint zoning reconciles never-disable-checks with build-tooling/generated-artefact reality: relax a rule ONLY in a scoped block whose glob matches build tooling (`scripts/**`) or generated artefacts (`*.generated.ts`), justified from the RULE'S OWN PURPOSE (no-throw exists for app control flow → a build script that fails loud on bad vendored data uses throw correctly), mirroring an in-repo precedent (`oak-sdk-codegen/eslint.config.ts`); hand-authored tooling KEEPS `max-lines` (split the file, don't exempt); EXCLUDE `*.test.ts` so tests-of-tooling stay full-strict; app + real-logic never relaxed.** `[captured: 2026-07-01 | source: napkin Eclipse + curriculum-hub-demo eslint.config.ts + config-expert PASS verdict + comms 033ab989/ff4205ac | target: .agent/memory/active/patterns/ (config/eslint zoning pattern instance) | trigger: a 2nd generator/tooling-bearing workspace re-derives it OR a later session uncorrected | size: S | status: pending]`
- **Parametric test-fake admissibility boundary (5 conditions): constant object-literal fakes are the DEFAULT; a parametric fake is admissible only when (a) the parameter is contract data flowing through the seam (b) the fake models the collaborator's DOCUMENTED semantics, stated in a comment (c) it is a single branch-free pure expression of its params (d) assertions stay output-shaped (e) fixtures are sized to discriminate; argument-reflector fakes only where the seam's contract IS forwarding; branch-requiring collaborator semantics belong to a higher test scale.** `[captured: 2026-07-02 | source: test-expert E3 ruling + comms 8024962a + napkin Birch closeout | target: testing-strategy.md / testing-tdd-recipes.md amendment (mock-simplicity section) | trigger: a 2nd cycle invokes the boundary OR the next consolidation | size: S | status: pending]`
- **Multi-writer landing order: a tracked-file DELETION in any live worktree blocks ALL estate commits (the tracked-file scan fail-louds on tracked-but-missing); the cure is landing ORDER — the deleting lane's cycle commits first — never resurrection of final-intent deletions; compose with the one-index multi-cycle commit-train technique (pathspec-commit → index-snapshot-commit → add+commit).** `[captured: 2026-07-02 | source: napkin Birch closeout + worked instance 05:54Z + handoffs/2026-07-02-curriculum-hub-director-birch.md §Operating protocol | target: .agent/memory/active/patterns/ (multi-writer commit-window pattern) | trigger: a 2nd multi-writer commit blockade OR the next consolidation | size: S | status: pending]`
- **The comms concept gate is a NEW enforcement substrate on the comms stream (PDR-044 innate immunity extended to the write path): SSOT-loaded from the hook policy, capture-tag recursive exclusion (failure-mode/behaviour-note exempt by declared nature, no override flag), Result-typed with a single CLI throw-translation, teaching-payload refusals.** Landed `09b576704`, owner-ratified route, live and dogfooding. `[captured: 2026-07-02 | source: comms concept gate cycle (Thyme) + reviewer rulings f4a2fdf0 + agent-tools/src/collaboration-state/comms-concept-gate.ts | target: ADR (comms write-path concept gate — composes ADR-183 tag namespace + the hook-policy scoped-blocks substrate) | trigger: next consolidation OR the first widening of COMMS_GATED_CONCEPTS (widening is a governance act and needs the ADR first) | size: M | status: pending]`
- **Process-liveness is not delivery-liveness: a comms watcher can pass `assert-watcher-live` (its own heartbeat file) while delivering ZERO events (a muting filter, a wedged pipe) — the founding instance ran mute for ~40 min; the cure pair is (a) corpus-test any watcher filter against a real inbox snapshot BEFORE arming (pass/leak counts proven, not assumed) and (b) a mechanical delivery-side check (e.g. assert-watcher-live comparing the heartbeat's `emitted_count` against stream activity in the window).** `[captured: 2026-07-02 | source: Thyme failure-mode event 4b68eb00 + Galago corroboration (inverse symptom, same wrong render assumption) + the corpus-test cure adopted by 3 agents same-day | target: comms-all-channels-watcher.md rule amendment (mechanical filter-proof + delivery-check clauses) | trigger: next consolidation OR a 3rd muted/leaking watcher instance | size: S | status: due]`
- **Views take state as PROPS; hooks bind in a two-line default export; tests render the VIEW with literal states — zero mocks (the DI-seam-for-views pattern).** Three test-expert rulings converged on it in one day (search-core extraction → house doctrine per the binding ruling; HubResultsView — the vi.mock shape ruled BLOCKING with proof the mock wasn't even load-bearing under the hook's debounce; use-curriculum-search injectable fetchFn for abort-lifecycle tests), and the jest-axe suite then consumed the same seams to render 8 surface states mock-free — the pattern pays twice (testability + a11y-audit surface). `[captured: 2026-07-02 | source: test-expert rulings (comms 08ef36f6 lineage + the E1+E2 BLOCKING verdict) + components/HubResults.tsx / curriculum/CurriculumShowcase.tsx / lib/use-curriculum-search.ts + a11y-axe.test.tsx | target: .agent/memory/active/patterns/ (view-binder DI seam pattern) + a testing-strategy.md cross-ref | trigger: next consolidation (three instances + a second consumer already observed — the bar is met) | size: S | status: due]`

## Homes authored 2026-07-06 (dedicated pass, Nettle tracks Acorn) — entries CONSERVED above

Owner direction: keep all information in the sources; write homes additively; do not drain by
removal. Every item above now has its authored home (verify there before re-authoring):
Director operating model → PDR-117 §Amendment 2026-07-06 (six clauses, incl. the Hawthorn and
Birch nuances and rulings-as-artefacts) · exhaustive total-function renderer →
`patterns/exhaustive-total-function-renderer.md` · sampled-schema corpus validation →
`patterns/validate-sampled-schema-against-complete-corpus.md` · principled eslint zoning →
`patterns/principled-eslint-zoning.md` · parametric test-fake five-condition boundary →
`testing-strategy.md` (mock rules) · multi-writer landing order →
`patterns/multi-writer-landing-order.md` · comms concept gate → ADR-210 · process-liveness ≠
delivery-liveness → `comms-all-channels-watcher.md` §Process-liveness is not delivery-liveness ·
view-binder DI seam → `patterns/view-binder-di-seam.md`.

- **Sequence-first over smallest-first shipping (owner reframe)** —
  `[captured: 2026-07-04 | source: tier-E drain E-b8 item C230 (single corpus window): the
  owner reframed "smallest impactful thing to ship first" as sequence-first — the full
  interface, architectural home, and envelope exist from day one and only implementation
  timing varies — accepting roughly 10-15 percent more total work for earlier first delivery
  without future drift | target: PDR-018 amendment (planning discipline) | trigger: owner
  ratification that the sequence-first reframe is standing doctrine — owner direction is
  session-scoped until declared standing, and this reframe is known only from one corpus
  window; PDR-101's reviewer quorum then applies at minting time as it does to every
  graduation | size: S | status: pending]`

- **Doctrine-lookup tripwires at disposition and review-dispatch time** —
  `[captured: 2026-07-06 | source: PR-308 ADR-153 guard arc (napkin 2026-07-06 + distilled):
  two structural cures proposed in the session reflection and appreciated but not yet
  explicitly approved by the owner — (1) a sonarqube-mcp-instructions rule clause requiring a
  governing-doctrine lookup (grep the ADR estate; ADR-153 by name for value-is-X sites) before
  any finding is fixed or dispositioned; (2) an invoke-code-experts clause requiring reviewer
  dispatches to name the governing ADRs and reviewers to cite what they read, plus first-hand
  verification of load-bearing subagent claims before acceptance | target: rule amendment
  (sonarqube-mcp-instructions) + executive-memory amendment (invoke-code-experts) | trigger:
  owner approval of the 2026-07-06 reflection proposals, or the next consolidation pass
  judging them settled | size: S | status: pending]`
