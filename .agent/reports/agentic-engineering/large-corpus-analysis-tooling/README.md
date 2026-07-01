# Large-corpus-analysis v2 — conserved tooling

The working tooling from the v2 rerun (2026-06-30), conserved so the **v3** run and any future
corpus analysis is **repeatable, not heroic**. These are reference artefacts: promoting them to
proper agent-tools scripts + a driving skill is a named v3 task (see the thread record). They
embody [PDR-122](../../../practice-core/decision-records/PDR-122-agentic-judgment-pipelines.md)
(atomic judgment, deterministic aggregation, conserve-by-default) and feed the conservation
machinery (PDR-014 `consolidate-docs` / `consolidate-until-done`).

## Files

- **`map-reduce-validate-meta.workflow.mjs`** — **RETIRED as a run path** (commit 91ee28474 split it
  into `map.workflow` + `reduce.workflow`). Kept ONLY as the prompt/mirror source of truth and a
  complete straight-through reference. **Do NOT run it for the full discovery** — it still carries the
  stale 16M `VALIDATE_TOKEN_CEILING` literal (the split templates have NO default — fill the placeholder
  from the probe-calibrated count) and the lost-map-spend risk the split cures. Run the split instead
  (`map.workflow` → commit leaves → `reduce.workflow` → commit candidates → seeded `validate-meta`).
  Reference shape: map ×N (Sonnet/low) → reduce (Opus/high) → validate (mirror-driven Tier-0/1/2) →
  meta; carries the post-reduce hard-abort re-gate and the actuator-grain + longitudinal prompts; the
  inlined `PARTITION_WINDOWS` is the current valid 15-window partition (corpus byte-unchanged 2026-06-30).
- **`map.workflow.template.mjs`** — **checkpoint-1a**: map ×N ONLY (Sonnet/low), `__PARTITION__`
  placeholder. Returns `leaves` for commit to `data/`. mapPrompt is kept **byte-identical** to
  `map-reduce-validate-meta.workflow.mjs` (`__MAP_PROMPT_*__` markers; edit both, re-diff at launch).
- **`reduce.workflow.template.mjs`** — **checkpoint-1b**: reduce ONLY (Opus/high) over the committed
  leaves (`__LEAVES__` placeholder), returns `candidates`. reducePrompt is byte-identical to the
  straight-through workflow (`__REDUCE_PROMPT_*__` markers). **Split from map (was one combined
  template) because the 2026-06-30 grain-probe proved reduce can fail AFTER a successful map
  (truncation / kind-error), and the Workflow sandbox has no file-write — so only a map→commit→reduce
  split makes reduce independently resumable without re-spending map.** The reduce prompt bounds
  output (≤10 representative `supportingLeafIds` per candidate; `groundingCount` carries the true
  total) and disambiguates candidate-`kind` from leaf-category — both probe-hardened.
- **`validate-meta.workflow.template.mjs`** — **checkpoint-2**: the reusable validate+meta template
  with `__CANDIDATES_SEED__`, `__RESOLVED_IDS__` (candidate-granular resume — re-validate only the
  unresolved tail), and `__VALIDATE_TOKEN_CEILING__` placeholders, plus `MAX_CONCURRENCY` and a
  `JITTER_MS` knob (deterministic per-voter jitter). Seeds a validate run from committed
  leaves+candidates without re-spending map/reduce. **The routing mirror is the corrected
  (quorum-floor) routing; the orchestration mirror (`__ORCH_MIRROR_*__`) is the hard-abort re-gate /
  completeness / resume / jitter logic.** On a resume run, meta is deferred to
  `meta.workflow.template.mjs` over the MERGED dispositions.
- **`meta.workflow.template.mjs`** — meta-over-all-candidates with a `__CANDIDATES_FOR_META__`
  placeholder; run after dispositions settle.
- **`data/v2-rerun-corrected-findings-2026-06-30.json`** — the full corrected findings: 50
  candidates, 45 keep / 5 kill dispositions, 182 voter outcomes, 18 recall matches, 31
  corroboration claims. The conservation source for graduating the discovered patterns.
- **`data/probe-w08-w10-w11-{leaves,candidates}-2026-06-30.json`** — the WS1 grain-probe outputs
  (167 leaves, 75 candidates over the 3 windows). The candidates file carries the gate verdict
  (PASS) and the full-run count/cost calibration finding. Probe evidence, NOT validated discovery
  (map+reduce only — no adversary/recall); survival is re-checked at the full run.

## The aggregation driver (deterministic post-run layer)

Not conserved as a file (it is thin glue, reconstructed cheaply from the module). Its shape: read
the Workflow result JSON, then call the REAL `agent-tools/src/corpus-analysis/` module —
`parseMetaOutput` + `parseVoterOutcome` (strict re-parse at the boundary),
`findRecallIntegrityViolations` (must be empty), `recallReport` (stratified fractions),
`meetsGraduateGate({minStrictWithinRemit:0.6, minLooseWithinRemit:0.85})` (Choice B),
`checkMapCoverage`, `corroborateAgainstHomes` (scan `.agent/memory/active/patterns/` +
`.agent/rules/`), and **independently recompute every disposition** by replaying `adjudicate` over
the voter outcomes (recompute, do not record). Place it in `agent-tools/` to import the module by
relative path.

## Critical operational notes (verified first-hand this run)

- The Workflow `.output` file wraps the script's return under `.result` (alongside `summary`,
  `logs`, `totalTokens`).
- `node --check` flags the script's top-level `return` as illegal — false positive; wrap the body
  in `async function(){…}` to syntax-check.
- The **routing** mirror is pinned by `workflow-routing-mirror.conformance.test.ts` (39 cases).
  The **orchestration** mirror (`__ORCH_MIRROR_*__`) is a type-stripped copy of
  `agent-tools/src/corpus-analysis/run-orchestration.ts` (unit-tested there: resume / completeness /
  re-gate / jitter); the **map/reduce prompts** are duplicated between the straight-through workflow
  and the checkpoint-1 template. None of these three pasted/duplicated blocks is machine-pinned by a
  test (a `.mjs`-reading conformance test fought four lint rules; the right home is a repo-validator
  added when the tooling is promoted to `agent-tools` scripts). Until then, **re-check each pasted /
  duplicated block against its source before each launch** (same discipline as the routing mirror).
- Cost reality: ~50k tokens/voter at high effort over grounding-heavy prompts (not ~11k). The
  corrected calibration (`OBSERVED_VALIDATE_TOKENS_PER_VOTER = 50_000`, modelled flat — no double
  multiplier) lives in `run-orchestration.ts`; the post-reduce re-gate now **hard-aborts** (throws)
  on a ceiling breach instead of only logging. Re-derive the ceiling from the real candidate count
  at launch.
- **Ceiling vs the removed count cap.** The v3 reduce removes the 15–25 count cap to surface more
  distinct-actuator candidates, so a finer-grain reduce legitimately yields MORE candidates than v2's
  50. Re-derive `VALIDATE_TOKEN_CEILING` UP from the projected count at launch — the hard-abort is the
  **runaway backstop** (over-fragmentation collapsing recall), NOT a substitute cap. A legitimately
  larger candidate set should raise the ceiling (or fall back to checkpointed/concurrency-capped
  validation), never be thrown away after paying the map+reduce spend.
- **Merged-set completeness before deferred meta.** On a resumed run, meta is deferred to
  `meta.workflow.template.mjs` over the MERGED candidate set (this run's tail dispositions + the prior
  run's resolved set). `assessValidateCompleteness` guards each individual validate run, but nothing
  re-asserts the MERGE. Before injecting `__CANDIDATES_FOR_META__`, the operator MUST verify the merged
  set has the expected candidate count and no duplicate or missing ids, or meta scores recall over a
  wrong denominator silently.
