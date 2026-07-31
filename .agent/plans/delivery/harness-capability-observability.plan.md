---
id: harness-capability-observability
node_type: delivery
name: "Harness capability observability — probe, record, diff, signal"
overview: "Give Codex and Claude seats a repeatable, read-only capability census whose immutable run records expose additions, removals, changes, and evidence-backed rename candidates as their harnesses evolve."
status: ratified
ratified_by: "Jim Cresswell"
ratified_date: 2026-07-31
ratified_where: "PR #671 ratification provenance record: https://github.com/oaknational/oak-open-curriculum-ecosystem/pull/671#issuecomment-5147146228"
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
   nested-child surfaces using harmless read-only canaries. Before collection,
   an independently maintained, versioned `ProbeSetDefinition` fixes the
   expected launch and enumerator coverage without consulting that run's
   observed output. The collector has read-only access, records the exact
   definition-content digest, and rejects a changed digest under an unchanged
   version, so a snapshot cannot certify its own completeness.
2. **Record.** The parent writes one immutable, schema-versioned, sanitised
   snapshot per run. It records the probe-set version and content digest,
   launch graph, model and effort provenance at thread creation and observation
   time, resolved tool family, root activity state, wake-path evidence, time
   and duration, harness and CLI versions where observable,
   repository/environment fingerprints, complete ability IDs and metadata,
   and explicit unavailable reasons. Children never share-write the ledger.
3. **Diff.** Compare snapshots without rewriting history. Emit raw additions,
   removals, metadata changes, and behavioural changes. A rename is only an
   evidence-backed `rename_candidate` joining one removal to one addition;
   stable semantic launch keys, never run-local launch IDs, bind comparisons.
   Schema, probe-set content, launch/enumerator coverage, and behavioural
   evidence-age drift are reported separately. Incompatible structural
   coverage suppresses per-ability inference; incompatible freshness
   suppresses behavioural-change inference. A probe regression or stale/fresh
   comparison therefore cannot masquerade as a lost or currently changed
   harness ability.
4. **Signal.** Derive a current ledger and bounded drift summary for existing
   startup/alert consumers. Signals are advisory and fail open; immutable run
   records remain the authority.

Ability IDs are stable and source-qualified (for example top-level harness,
functions-exec, MCP, skill, CLI, or hook). Exposure and behavioural outcome are
orthogonal fields with a validated coherence matrix. Full inventories are
never cached; expensive behavioural evidence may be reused only when labelled
stale with its source run and observation time, and freshness compatibility is
required before behavioural-change inference. Transport `DELIVERY`, creation
of a reasoning turn (`NOTIFY`), and content-bearing engagement (`ABSORB`) are
independent observations: no lower class implies a higher one.

Every live `owner-held` proof is verified from outside the probed seat by Jim
Cresswell or the serving Director. Bounded evidence—run IDs, external-observer
identity, challenge/reply or deliverable-movement references, and sanitised
result links—is recorded on MCP-456 and the implementation pull request.
`NOTIFY`, `LOOP`, `ABSORB`, `CAPABILITY`, and `PROGRESS` are never
self-certifiable; a root snapshot may record those classes only with the
external observer and evidence reference that certified them.

## Acceptance criteria (each with a proof — required)

- **Every run takes a fresh full census.** Supported Codex and Claude root and
  child launch paths emit complete source-qualified ability lists, counts,
  hashes, probe-set versions, and explicit unknown/unavailable observations;
  no previous inventory can satisfy the current run, and completeness is
  checked against the pre-run independent probe-set definition rather than
  snapshot self-report. The snapshot binds the definition's exact content
  digest, and version/digest disagreement is rejected.
  Proof: `repo-safe` — totality, no-cache, pre-run-independence,
  version/digest, missing-enumerator, and launch-matrix fixtures; `owner-held`
  — Jim Cresswell or the serving Director, external to each probed seat,
  verifies the platform runs and records their run IDs and bounded evidence
  links on MCP-456 and the implementation pull request.
- **Run records are immutable, comparable, and safely attributable.** Each
  snapshot records UTC/local time, duration, run and parent/child identity,
  launch mechanism, role/context mode, thread-creation and observation-time
  requested/configured/reported model, effort, resolved tool family, root
  activity state, wake path, sandbox and approval state, harness/client/CLI
  versions with evidence or explicit unavailability, probe-definition content
  digest, repository/environment fingerprints, warnings, and bounded
  observations. Secrets, account identifiers, connector URLs, absolute machine
  paths, and unbounded output are rejected.
  Proof: `repo-safe` — schema, immutability, sanitiser, and hostile-fixture
  tests.
- **Evidence is class-honest.** `present | absent | unknown` exposure and
  `pass | fail | unavailable | not_run | inconclusive` outcome are validated
  independently, with impossible combinations rejected; `DELIVERY`, `NOTIFY`,
  and `ABSORB` are also recorded independently, and declared authority is
  recorded without exercising destructive or external mutations.
  Proof: `repo-safe` — exhaustive coherence-matrix, liveness-class, and
  safe-canary tests; `owner-held` — Jim Cresswell or the serving Director
  certifies every claimed never-self-certifiable class through an externally
  observed deliverable movement or content-bearing challenge reply, and
  records the observer, event, reply or movement reference, and result on
  MCP-456 and the implementation pull request.
- **Stored ledgers expose evolution.** Comparing any two compatible snapshots
  deterministically reports additions, removals, metadata changes, behavioural
  changes, and conservative rename candidates with their evidence. Schema,
  probe-set content, coverage, and evidence-age drift remain separate
  dimensions; incompatible coverage suppresses unsafe mass add/remove or
  rename inference, while incompatible freshness suppresses behavioural-change
  inference.
  Proof: `repo-safe` — golden comparator fixtures covering additions,
  removals, true metadata/behaviour changes, ambiguous renames, false rename
  traps, enumerator regression, stale/fresh comparison, and
  freshness-compatible comparison.
- **Both harness families use the shared contract.** Codex covers the root,
  native child roles/fork modes, nested/follow-up continuity, and representative
  CLI sessions; Claude covers the main session, Agent-tool children, Agent
  Teams, and Workflow agents. A launch family disabled or unsupported in the
  tested version remains a required matrix row with its explicit unavailable
  reason. Platform adapters add observations but cannot fork the ledger schema
  or comparator semantics.
  Proof: `repo-safe` — adapter contract tests; `owner-held` — Jim Cresswell or
  the serving Director verifies the recorded live matrices from outside the
  probed seats and records their run IDs and bounded evidence links on MCP-456
  and the implementation pull request.
- **A new seat can find and run it.** One concise Oak skill and operations
  runbook explain the safe test card, result location, diff command, evidence
  limits, and how to add a newly exposed ability or launch mechanism.
  Proof: `repo-safe` — discoverability/link checks and shipped CLI smoke;
  `owner-held` — Jim Cresswell or the serving Director observes a fresh
  low-power seat producing and interpreting a run without oral guidance, then
  records the run ID and bounded result on MCP-456 and the implementation pull
  request.
- **Signals remain projections, not authority.** Current-ledger and startup
  drift summaries regenerate deterministically from immutable snapshots and
  never block session startup merely because a capability cannot be observed.
  Proof: `repo-safe` — projection freshness and fail-open SessionStart tests.

## Todos

- **A — shared contract (round budget: at most two review rounds).** Land the
  versioned schema and independently maintained pre-run probe-set definition,
  definition-content binding, source-qualified IDs, stable launch keys,
  sanitiser, validator, freshness-aware comparator, immutable writer, and
  adversarial fixtures.
- **B — Codex probe pack (round budget: at most two review rounds).** Add the
  deterministic collector and native root/child/CLI test card, then record the
  first complete Codex matrix.
- **B-prime — Claude probe pack (round budget: at most two review rounds).**
  Add the Claude main/Agent-tool/Agent Teams/Workflow adapters against the
  shared contract and record the first complete Claude matrix, retaining an
  explicit unavailable row for any launch family the tested version cannot
  exercise.
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
- Implementing or operating a Codex idle-wake bridge. MCP-456 records that
  capability and its evidence but cannot authorise runtime delivery; any such
  work requires its own separately ratified delivery plan.
