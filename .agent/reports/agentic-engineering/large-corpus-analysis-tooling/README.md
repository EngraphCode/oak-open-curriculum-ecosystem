# Large-corpus-analysis v2 — conserved tooling

The working tooling from the v2 rerun (2026-06-30), conserved so the **v3** run and any future
corpus analysis is **repeatable, not heroic**. These are reference artefacts: promoting them to
proper agent-tools scripts + a driving skill is a named v3 task (see the thread record). They
embody [PDR-122](../../../practice-core/decision-records/PDR-122-agentic-judgment-pipelines.md)
(atomic judgment, deterministic aggregation, conserve-by-default) and feed the conservation
machinery (PDR-014 `consolidate-docs` / `consolidate-until-done`).

## Files

- **`map-reduce-validate-meta.workflow.mjs`** — the full harness Workflow: map ×N (Sonnet/low)
  → reduce (Opus/high) → validate (mirror-driven Tier-0/1/2 adversary) → meta. The partition is
  inlined (re-derive at launch — never trust a frozen count). Pass via `scriptPath`, NOT `args`
  (the harness delivers `args` as a JSON string; inline the data instead).
- **`validate-meta.workflow.template.mjs`** — the reusable validate+meta template with a
  `__CANDIDATES_SEED__` placeholder and a `MAX_CONCURRENCY` throughput knob. Used to seed a
  validate-only re-run from committed leaves+candidates without re-spending map/reduce, and for the
  kill top-up. **The mirror in this file is the corrected (quorum-floor) routing.**
- **`meta.workflow.template.mjs`** — meta-over-all-candidates with a `__CANDIDATES_FOR_META__`
  placeholder; run after dispositions settle.
- **`data/v2-rerun-corrected-findings-2026-06-30.json`** — the full corrected findings: 50
  candidates, 45 keep / 5 kill dispositions, 182 voter outcomes, 18 recall matches, 31
  corroboration claims. The conservation source for graduating the discovered patterns.

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
- A sandbox mirror MUST be pinned by `workflow-routing-mirror.conformance.test.ts` AND
  re-checked against the pasted copy before each launch.
- Cost reality: ~50k tokens/voter at high effort over grounding-heavy prompts (not ~11k). Re-run
  the post-reduce cost gate (`validateStagePlan`) with the REAL candidate count.
