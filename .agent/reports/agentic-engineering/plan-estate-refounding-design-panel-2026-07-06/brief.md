# Design brief — Oak plan-corpus refounding protocol (2026-07-06)

You are one designer in a six-facet independent design panel (PDR-123 shape).
Design YOUR facet only, deeply; note interfaces to other facets rather than
designing them. Restraint by default: every mechanism must carry its warrant.

## The owner directive (this session, near-verbatim)

Design a super efficient and provably complete and lossless protocol for
transforming (refounding) this repo's planning corpus so it is organised by
intent and value provision — like the Resonance repo just did, using similar
methods and adopting their epistemic advances. It can and will be done, in
appropriately sized batches, with error correction and loss checks. Use
hyper-efficient low-context subagents that make NO judgements — "if they make
judgements we lose information". This is an intermediate step ON THE ROAD TO
the ADR-200 intent graph (not instead of it): stabilise part of the pipeline
and make it immediately useful as the new plan corpus. Key difference from
Resonance: not all Oak plans align with the current vision/strategy — that
means understand them fully, identify what they express, and re-express it
coherently in new plans in new intent-derived lanes (including newly
identified lanes, or a safe holding lane for not-currently-strategic
material). NEVER discard contents or concepts.

## Oak estate facts (measured 2026-07-06, first-hand)

- Live plans surface: `.agent/plans/**` = 618 md files / 165,066 lines
  (335 `*.plan.md`; 17 area directories; 2 areas ≈49% of plans; 149/355 docs
  unlinked from any index chain; 59 stale executables; templates/, notes/,
  speculative/ subdirs; lifecycle folders active/current/future/archive).
- Adjacent surfaces: `.agent/plans-old-archive/**` (571 md — pre-relocated
  archive; Wave-0 sweep input, NOT a freeze source), `.agent/milestones/` (5),
  `.agent/proposals/` (6). Intent also leaks into `.agent/prompts/` and
  thread records under `.agent/memory/operational/threads/`.
- Known defects (recorded): ~30 emergent free-text `status:` values; two
  parallel status vocabularies; ungoverned `serves_stream` free-text axis;
  orphan `serves_thread` references; no plan→thread reference-integrity gate;
  no plan-state recomputation tool exists.
- The estate is LIVE: multiple active threads, daily remediation branches
  merging to main, an active claims registry, running multi-agent sessions.
  Freeze must not copy out from under an active lane without coordination.
- The V0 plan-node schema (`.agent/plans/product-development-governance/plan-node-schema.v0.md`)
  is the ratified authored form for new plans: orthogonal axes
  (kind strategic|executable; terminal disposition enum; expiring gate object;
  execution status Linear-projected NOT stored), typed edges
  (serves_strategic_choice, derives_from, supersedes/superseded_by,
  depends_on{blocking|beneficial}, thread, projects_to, realized_by,
  validated_by), migration map §3.5 from all ~30 emergent status values,
  folder collapse verdict. NOTE: V0 todos are `{id, content, status}` — NO
  proof field; adopting proof-typed todos (resonance recomputable-state
  doctrine) is an additive extension requiring owner sign-off.
- ADR-200 (Accepted): ideas are the fundamental unit; idea-graph = SSOT;
  documents = co-equal projections via frontmatter edges. Rewrite plan
  `.agent/plans/product-development-governance/current/planning-estate-rewrite.plan.md`:
  WS1 done, WS2 (idea schema+id-minting) next, WS4 thin-slice = HARD GATE
  before WS6 deep harvest, WS7 = synthesise/rewrite/no-loss-audit/retire.
  Owner: WS2/WS4 proceed independently and must NOT wait. Vision + strategy
  STAND (not re-authored). Governing invariant: every organising axis needs
  a registry + validation (no free-text axes).
- The corpus-analysis instrument (`agent-tools/src/corpus-analysis/`, PDR-122)
  and its ratified D1–D9 kernel topology: calibration-first canaries behind a
  deterministic abort breaker; cellular single-turn extraction with overlap;
  progressive power (cheap wide → expensive only on contested/synthesis);
  pilot-first sizing (~1/10th); pre-run cost declaration in every billing
  denomination; batch-sequential validate; profiling-derived briefs +
  blindness probe; raw-exposure + paired blind duplication; output-bounding +
  completion tracking. PDR-122 invariants: agents judge atomically, code
  computes/routes; conserve-by-default; schema-pinned boundaries; cost is
  deterministic and orthogonal to rigour (dominant cost lever = turns ×
  context, NOT model tier; least-privilege agent types are an economic
  primitive, measured 7–17×); stages checkpointed; calibrate before scaling
  spend. MEASURED: 3 same-model lenses ≈ 1.4 effective votes of 3 (phi≈0.55);
  cross-regime disagreement 40%, one-directional toward kill → irreversible
  dispositions need cross-regime concurrence.
- Oak lossless doctrine: PDR-049 semantic-union merges; first-hand loss-scan
  (non-delegable); knowledge-preservation-over-fitness; conserve-by-default;
  validators-must-recompute-not-just-record; never-use-git-to-remove-work;
  no-machine-local-paths (PII); markdown-code-blocks-must-have-language.

## Resonance ground truth (READ these, repo-root-relative)

1. The box file (the synthesis + ten-item hyper-efficiency kit + seams):
   `.agent/practice-core/incoming/resonance-plan-estate-refounding-synthesis-2026-07-06.md`
2. The ARC channel (Kiln tracks Basalt's Q1–Q5 answers + draft invariants
   I1–I12 — treat these as ground-truth constraints to build on; challenge
   only with evidence):
   `.agent/collaboration/rapid-comms/wildfire-herds-sulphur-and-kiln-tracks-basalt.md`
3. Oak's durable copy of resonance doctrine (worker verification, recomputable
   plan/team state): `.agent/reference/resonance-practice-knowledge.md`

Resonance sizing prior: 15 sources / 4,452 lines / 1,443 inventory lines /
223 ledger rows ≈ 17h wall incl. owner gates; adversarial passes produced
essentially all new semantic truth; mechanical waves = cheap insurance that
twice caught worker fabrication. Oak is ~37× the line count.

## The six facets

- F1 mechanical-substrate: freeze rule + denominator + scripted inventory
  (extraction nets as deterministic code) + tiling arithmetic + byte-identity
  + batch/stable-point structure + denominator re-derivation at merge. What
  scripts exist vs must be built (extend agent-tools/repo-validators?).
- F2 worker-layer: where LLM reading is unavoidable, design the zero-judgement
  worker roles (envelope: tools, turns, context; brief templates with refusal
  clauses; output schemas verbatim-anchored), the 100% four-step verification
  protocol, and the task-design rule (a refusal firing = task mis-design).
- F3 judgement-and-error-correction: where judgement is PLACED (rule
  authoring, mapping tables, adjudication, dispositions, owner gates); quorum
  design per PDR-122 + measured n_eff; disposition-class-stratified
  adversarial challenge (challenge ALL loss-bearing-class rows, probe the
  rest); canary/pilot gating; per-batch loss checks; halt conditions.
- F4 intent-layer-and-lanes: how destination lanes are derived from
  VISION.md + docs/strategy (streams/strategic choices) + what the estate
  actually expresses; newly-identified lanes; the conserving holding lane for
  not-currently-strategic material; the owner walk designs (lane-taxonomy
  ratification; batched mid-flight rulings; final recomputed-state walk);
  coexistence/accretion policy; live-lane coordination during freeze.
- F5 recomputable-state: the plan-state recomputation tool (build FIRST?
  extend repo-validators regenerate-and-compare); proof-typed todos as
  additive V0 extension (owner gate); the two-verdict audit probe set for oak
  (gates/git-facts/gh/validators); the versioned status-mapping table;
  attested-count as quality signal; team-state join (claims registry ⋈ plan
  todos ⋈ git facts).
- F6 sequencing-and-roadmap: the cohesive long-term plan — current estate →
  refounded corpus → ADR-200 intent graph. Phase structure with stable
  points; what the refounding consumes/produces for WS2–WS7 (WS6 harvests
  the NEW corpus); relationship to the corpus-generalisation Phase 0/P2 work
  and its pending atomic landing set; pilot area choice (which plan area
  first); batch ordering across 17 areas; multi-session cast design
  (Director + implementers per PDR-117); what lands in which repo surface.

## Output contract (all designers)

Write your full design as markdown to `tmp/refounding-designs/<facet-id>.md`
relative to the repo root (the directory exists; facet-id is F1..F6). The
design must state: decisions (each with warrant + falsifier), the mechanism
specification concrete enough to execute, interfaces to other facets,
owner-gate items, open questions, rejected alternatives with reasons, and a
cost model sketch (tokens/wall-clock) grounded in the measured priors above.
British spelling. Every code block needs a language tag. No machine-local
absolute paths anywhere in your output — repo-root-relative paths only.
