---
id: harness-capability-observability
node_type: delivery
name: "Harness capability observability — probe, record, diff, signal"
overview: "Give Codex and Claude seats a repeatable, read-only capability census whose immutable run records expose additions, removals, changes, and evidence-backed rename candidates as their harnesses evolve."
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: first-major-release
impact_areas:
  - practice-and-estate
tickets:
  - MCP-456
depends_on: []
owner_gates: []
last_updated: 2026-07-31
---

# Harness capability observability — probe, record, diff, signal

## Goal

A fresh Codex or Claude seat can establish, from evidence rather than
configuration alone, every capability exposed to its root and supported child
launch paths; preserve the complete observation with enough provenance to make
later runs comparable; and see when abilities appear, disappear, change, or
plausibly move under a new name.

## Mechanism

One cross-platform pipeline with four shared primitives:

1. **Probe.** Enumerate a fresh, complete, source-qualified ability inventory
   on every run. Keep configured, exposed, self-reported, and behaviourally
   proven facts distinct. Repository collectors gather deterministic platform
   metadata; short native test cards exercise harness-only root, child, and
   nested-child surfaces using harmless read-only canaries.
2. **Record.** The parent writes one immutable, schema-versioned, sanitised
   snapshot per run. It records the probe-set version, launch graph, model and
   effort provenance, time and duration, harness and CLI versions where
   observable, repository/environment fingerprints, complete ability IDs and
   metadata, and explicit unavailable reasons. Children never share-write the
   ledger.
3. **Diff.** Compare snapshots without rewriting history. Emit raw additions,
   removals, metadata changes, and behavioural changes. A rename is only an
   evidence-backed `rename_candidate` joining one removal to one addition;
   schema or enumerator coverage changes are reported separately so a probe
   regression cannot masquerade as a lost harness ability.
4. **Signal.** Derive a current ledger and bounded drift summary for existing
   startup/alert consumers. Signals are advisory and fail open; immutable run
   records remain the authority.

Ability IDs are stable and source-qualified (for example top-level harness,
functions-exec, MCP, skill, CLI, or hook). Exposure and behavioural outcome are
orthogonal fields with a validated coherence matrix. Full inventories are
never cached; expensive behavioural evidence may be reused only when labelled
stale with its source run and observation time.

## Acceptance criteria (each with a proof — required)

- **Every run takes a fresh full census.** Supported Codex and Claude root and
  child launch paths emit complete source-qualified ability lists, counts,
  hashes, probe-set versions, and explicit unknown/unavailable observations;
  no previous inventory can satisfy the current run.
  Proof: `repo-safe` — totality, no-cache, missing-enumerator, and launch-matrix
  fixtures; `owner-held` — one fresh seat per platform records a live run.
- **Run records are immutable, comparable, and safely attributable.** Each
  snapshot records UTC/local time, duration, run and parent/child identity,
  launch mechanism, role/context mode, requested/configured/reported model,
  effort, sandbox and approval state, harness/client/CLI versions with evidence
  or explicit unavailability, repository/environment fingerprints, warnings,
  and bounded observations. Secrets, account identifiers, connector URLs,
  absolute machine paths, and unbounded output are rejected.
  Proof: `repo-safe` — schema, immutability, sanitiser, and hostile-fixture
  tests.
- **Evidence is class-honest.** `present | absent | unknown` exposure and
  `pass | fail | unavailable | not_run | inconclusive` outcome are validated
  independently, with impossible combinations rejected; declared authority is
  recorded without exercising destructive or external mutations.
  Proof: `repo-safe` — exhaustive coherence-matrix and safe-canary tests.
- **Stored ledgers expose evolution.** Comparing any two compatible snapshots
  deterministically reports additions, removals, metadata changes, behavioural
  changes, and conservative rename candidates with their evidence; schema and
  probe-set drift remain separate dimensions.
  Proof: `repo-safe` — golden comparator fixtures covering additions,
  removals, true metadata/behaviour changes, ambiguous renames, false rename
  traps, and enumerator regression.
- **Both harness families use the shared contract.** Codex covers the root,
  native child roles/fork modes, nested/follow-up continuity, and representative
  CLI sessions; Claude covers the main session, Agent-tool children, and
  Workflow agents. Platform adapters add observations but cannot fork the
  ledger schema or comparator semantics.
  Proof: `repo-safe` — adapter contract tests; `owner-held` — recorded live
  matrices for both platforms.
- **A new seat can find and run it.** One concise Oak skill and operations
  runbook explain the safe test card, result location, diff command, evidence
  limits, and how to add a newly exposed ability or launch mechanism.
  Proof: `repo-safe` — discoverability/link checks and shipped CLI smoke;
  `owner-held` — a fresh low-power seat produces and interprets a run without
  oral guidance.
- **Signals remain projections, not authority.** Current-ledger and startup
  drift summaries regenerate deterministically from immutable snapshots and
  never block session startup merely because a capability cannot be observed.
  Proof: `repo-safe` — projection freshness and fail-open SessionStart tests.

## Todos

- **A — shared contract (round budget: at most two review rounds).** Land the
  versioned schema, source-qualified IDs, sanitiser, validator, comparator,
  immutable writer, and adversarial fixtures.
- **B — Codex probe pack (round budget: at most two review rounds).** Add the
  deterministic collector and native root/child/CLI test card, then record the
  first complete Codex matrix.
- **B-prime — Claude probe pack (round budget: at most two review rounds).**
  Add the Claude main/Agent/Workflow adapters against the shared contract and
  record the first complete Claude matrix.
- **C — projections and signal (round budget: at most two review rounds).** Add
  ledger diff/current views, conservative rename candidates, SessionStart
  signals, skill/runbook discoverability, and cross-platform acceptance.

## Out of scope

- Granting, widening, or bypassing permissions.
- Model-quality benchmarking or ranking agents by answer quality.
- Destructive, write, privileged-escalation, or external-state probes.
- Installing optional integrations merely to make a capability appear.
- Treating self-report, configuration, stale behaviour, or a rename heuristic
  as proof of effective current capability.
