---
id: mutation-testing-core-canary
node_type: delivery
name: "Mutation-testing capability canary on the simplest core packages"
overview: "Turn the inert Stryker scaffold into a proven, report-only mutation-testing capability via two canaries — a pure-unit core package, then an integration-only contracts package — with survivor triage that classifies rather than spawns mutant-shaped tests."
status: sketch
ratified_by: "Jim Cresswell"
ratified_date: 2026-08-05
ratified_where: "Owner instruction in session Drake spins Obsidian (46636e), 2026-08-05: 'I want the mutation testing set up on the simplest core package we have' + decision card answer 'Tonight, full canary sequence', comms event 690e92d8-1c69-408f-9e89-a346b4eb4987 (owner mutation-quality doctrine captured verbatim)."
serves: outcome-informed-practice-learning
impact_areas:
  - practice-and-estate
tickets: []
depends_on: []
owner_gates: []
last_updated: 2026-08-05
---

# Mutation-testing capability canary on the simplest core packages

## Goal

The repository can run trustworthy, report-only mutation testing on a
workspace, and has done so on two contrasting canaries: the simplest
pure-unit core package and an integration-test-only contracts package.
Today the scaffold is inert — Stryker dependencies, a root `pnpm mutate`
script, and a Turbo task exist, but no workspace exposes a `mutate` task,
so the command is operationally empty (first-hand finding,
`.agent/reports/mutation-testing-incremental-rollout-concept-exploration-2026-07-15.md`,
re-verified 2026-08-05). When this lands, mutation evidence exists for
real packages, every surviving mutant carries a recorded disposition, and
the estate knows the runtime and determinism cost of the capability —
the admission evidence the foundational building-block excellence
contract requires (mutation assurance is a core-promotion gate in the
estate review's promotion frame).

## Design constraint — owner doctrine (2026-08-05, binding)

Mutants are killed through higher-quality testing, never through
highly-targeted testing. Writing an assertion whose purpose is to kill a
named mutant overfits the suite to the instrument and proves nothing
about product value or resilience. Operationally: a surviving mutant
routes to (a) classification as equivalent or unreachable under the
public contract, or (b) an assessment that the suite's description of
the public behavioural contract is incomplete — cured, if at all, by a
behaviour-describing test that would have been correct to write anyway,
authored against the contract, not against the mutant. The mutation
score is evidence, never a target; no threshold gates anything in this
plan.

## Mechanism

Follow the decision-ready sequence from the 2026-07-15 concept
exploration (the plan-of-record for shape; its stale current-state
claims are corrected by this node, and the conserved backlog copies in
`.agent/plans-backlog-2026-07/agentic-engineering-enhancements/` remain
untouched historical evidence per the append-never conservation rule):

1. Re-verify the simplest-core-package claim live (candidate:
   `@oaknational/type-helpers` — one pure source file, one unit-test
   file) and record the verification.
2. Give the canary workspace an explicit Stryker config: production
   mutation globs (authored source only), explicit
   `*.unit.test.ts`/`*.integration.test.ts` selection, `allowEmpty:
   false`, `thresholds.break: null` (report-only), and a workspace
   `mutate` script wired to the existing Turbo task. Test whether the
   root `buildCommand` is needed at all for a Vitest canary rather than
   assuming it.
3. Dry-run first: prove config load, correct test discovery (no E2E
   admitted), non-empty mutation glob, and a passing unmutated suite —
   before any mutant is created.
4. Full mutation pass on `@oaknational/type-helpers`; preserve the
   report (runtime, mutant counts by category) as evidence.
5. Triage every surviving mutant under the design constraint above;
   record a disposition ledger (fleet-assisted classification is
   permitted; disposition authority stays with the adjudicating seat
   sampling the actual source).
6. Repeat the contract proof on `@oaknational/search-contracts`
   (integration-test-only selection — proves the test-scope contract the
   first canary cannot).
7. Record measured runtime, determinism observations, and open
   questions (TypeScript checker value, incremental mode, cadence) as
   evidence for the later rollout decision. Rollout beyond the canaries
   is a separate decision, not this plan.

## Acceptance criteria (each with a proof — required)

- The type-helpers canary runs to completion with a preserved report and
  a complete survivor-disposition ledger — `repo-safe`: the committed
  evidence artefacts (report output + ledger) referenced from the
  workspace README or evidence directory.
- The search-contracts canary proves explicit integration-test selection
  with zero E2E tests discovered — `repo-safe`: the dry-run discovery
  output preserved alongside the run report.
- No quality gate, CI job, `pnpm check` membership, or threshold changed
  anywhere — `repo-safe`: the PR diff contains only canary-workspace
  config/scripts and evidence artefacts.
- Every surviving mutant's disposition names contract-completeness or
  equivalence/unreachability, never a mutant-targeted test — `repo-safe`:
  ledger review; any test added cites the public-contract gap it
  describes independently of the mutant.
- The stale current-state claims of the 2026-07-15 exploration's
  successor plans are corrected in THIS node (not by editing conserved
  backlog copies) — `repo-safe`: this node's §Mechanism preamble.

## Todos

1. Verify simplest-package claim + author workspace Stryker config +
   dry-run proof (single-story PR 1, default PDR-132 budget).
2. Full type-helpers pass + survivor ledger (same PR 1 if the diff stays
   single-story; else PR 2).
3. search-contracts integration canary + evidence (PR 2/3).

## Out of scope

- Any blocking gate, threshold, or CI scheduling — promotion to a gate
  is a separate owner decision with its own evidence.
- Mutation runs on any workspace beyond the two named canaries — rollout
  is value-led and separately decided.
- Editing the conserved backlog mutation plans — append-never corpus;
  this node is the live owner of current truth.
- A Linear ticket at authoring time — the ticket embargo (only the
  upstream-update lane mints tickets before 2026-08-10, owner ruling
  2026-08-04) defers the `tickets` entry; mint at embargo lift and
  backfill the field then.
- Expanding `validation-strategy.md` — its taxonomy is deliberately
  deferred; the canary EVIDENCE is an input to that later
  crystallisation, not a licence to author it now.
