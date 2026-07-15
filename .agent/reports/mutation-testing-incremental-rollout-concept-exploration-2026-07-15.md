# Mutation Testing: Incremental Roll-out Concept Exploration

**Date**: 2026-07-15  
**Status**: Decision-ready exploration; no Stryker run or configuration change
authorised  
**Scope**: Unit and integration tests only

## Review Contract

This report tests how Oak can turn its existing Stryker scaffold into a
trustworthy mutation-testing capability without attempting a monorepo-wide
roll-out first. Review should challenge the current-state evidence, test-scope
contract, canary order, score semantics, and promotion criteria.

The report uses first-hand repository inspection and current official StrykerJS
documentation. It does not claim that Stryker currently runs in any workspace,
that sandbox-relative Vitest configuration works with the installed version,
or that any mutation threshold is calibrated. It authorises no dependency,
configuration, test, CI, or gate change.

## Executive Synthesis

Oak has Stryker dependencies, a root base-config stub, a Turbo task, and a root
`pnpm mutate` script, but no workspace exposes a `mutate` task. Turbo therefore
resolves the command as non-existent for all 26 inspected workspaces. The
repository has scaffolding, not an operational mutation-testing capability.

The best next move is a sequence of small canaries, not all-workspace
configuration. Begin with a pure, dependency-light library to prove Stryker's
mechanics and explicit unit-test selection. Then use an integration-only
library to prove that the scope includes integration tests without admitting
E2E tests. Only after those two contracts work should Oak attempt a mixed
workspace, incremental result reuse, CI scheduling, or broader roll-out.

Mutation score must begin as evidence, not a target or gate. A surviving mutant
requires behavioural triage; it does not automatically demand a test. An
equivalent mutant, unreachable code, invalid mutation, or unsuitable mutator
can reveal something different from missing behavioural protection.

## Problem Frame

Line coverage says that code executed. Mutation testing asks whether tests
notice a controlled behavioural change. That makes it a meta-quality audit of
the test surface, consistent with
[`testing-strategy.md`](../directives/testing-strategy.md) and
[`principles.md`](../directives/principles.md).

Mutation testing is also expensive and configuration-sensitive. A broad first
roll-out would combine several unknowns at once: source selection, test
selection, Vitest sandbox configuration, type-checking behaviour, runtime,
mutant interpretation, report retention, and CI orchestration. An incremental
roll-out should make each unknown observable separately.

## First-Hand Current State

The repository currently contains:

- root dependencies on `@stryker-mutator/core`,
  `@stryker-mutator/typescript-checker`, and
  `@stryker-mutator/vitest-runner`, all at 9.6.1;
- a root [`pnpm mutate`](../../package.json) script that invokes
  `turbo run --continue mutate`;
- a [`mutate` task](../../turbo.json) in Turbo;
- a generated [`stryker.config.base.ts`](../../stryker.config.base.ts) stub.

The base stub selects pnpm, Vitest, per-test coverage, HTML/console/progress
reporters, and a repository build command. It does not define production
mutation globs, unit/integration test globs, thresholds, incremental result
storage, or a workspace config contract. It lists only the Vitest runner plugin
despite the installed TypeScript checker.

No workspace package defines a `mutate` script. A Turbo dry run reports
`<NONEXISTENT>` as the command for all 26 workspaces. `pnpm mutate` is therefore
misleadingly present but operationally empty.

The existing implementation plan is also stale in material ways: its
prerequisite checklist asks an executor to verify that the root command, Turbo
task, and dependencies do not exist, although they do. Its historical pilots
name deleted workspaces. Historical findings remain useful clues but are not
current proof.

## Test-Scope Contract

Oak's test doctrine separates:

- unit tests: `*.unit.test.ts` and `*.unit.test.tsx`;
- integration tests: `*.integration.test.ts` and
  `*.integration.test.tsx`;
- E2E tests: out-of-process tests that must not enter mutation runs.

The Stryker config should explicitly select unit and integration test files. It
should not rely only on a Vitest config's E2E exclusion. Redundant positive
selection makes the intended contract inspectable and reduces the chance that
a future Vitest include change expands the mutation surface silently.

The source mutation glob should likewise select authored production code and
exclude tests, generated files, declarations, fixtures where appropriate, and
build output. `allowEmpty` should remain false so a bad glob cannot report
success.

## Assumptions Challenged

### Assumption: the root command means Stryker is enabled

It does not. Turbo task presence is orchestration scaffolding. A workspace
command and config are needed before any mutation occurs.

### Assumption: the smallest workspace is automatically the best pilot

Raw file count is useful, but the first canary should minimise behavioural and
environmental ambiguity. Pure functions with direct unit tests are a better
mechanics probe than a similarly small workspace with default filesystem or
process dependencies.

### Assumption: one pilot can prove the full test contract

A unit-only canary cannot prove integration-test inclusion. A second,
integration-only canary is necessary before claiming that Oak's intended test
surface is configured.

### Assumption: an initial mutation score should become a target

An untriaged score combines missing assertions, equivalent mutants, dead code,
compile errors, timeouts, and mutator suitability. Optimising the number first
would reward exclusion and mutant-specific tests.

### Assumption: incremental mode makes the first run cheap

Incremental mode reuses compatible previous results. It cannot replace a
trusted full baseline, and the dry run still executes. It belongs after the
basic configuration is proven.

### Assumption: installed TypeScript checker means it should be enabled first

The checker can classify type-invalid mutants as compile errors, but it adds
cost and configuration. Its value should be measured after or alongside the
mechanics canary. Compile-error mutants are excluded from the mutation score,
so checker policy must be documented rather than used to make a score look
better.

## Canary Selection

First-hand workspace inspection identified these low-complexity candidates:

| Candidate | Production shape | Test shape | Role in the sequence |
|---|---|---|---|
| `@oaknational/type-helpers` | One source file, about 70 lines, pure runtime helpers | One unit-test file | Recommended first mechanics canary |
| `@oaknational/safe-path` | One source file, about 56 lines, injectable boundary with a real-I/O default | One unit-test file | Useful second unit canary if boundary behaviour needs proof |
| `@oaknational/result` | One source file, about 245 lines | One unit-test file | Small topology but a larger mutant surface |
| `@oaknational/search-contracts` | Three source files | One integration-test file and no unit-test file | Recommended second contract canary |
| `@oaknational/env-resolution` | Four source files with environment/filesystem interaction | Unit and integration tests | Later mixed-surface canary |

`@oaknational/type-helpers` is the preferred first canary because its purity
reduces the chance of confusing Stryker mechanics with sandbox I/O. The next
important canary is `@oaknational/search-contracts`, not an app: it proves that
explicit integration-test selection works while keeping the source surface
small. A mixed unit/integration workspace follows only after those two facts are
separately established.

These are planning candidates, not guaranteed current package names forever.
The executor must re-verify them immediately before implementation.

## Configuration Shape to Prove

### Typed root contract, workspace-local selection

The root should provide a typed factory or base contract for shared semantics,
while each participating workspace owns explicit mutation and test globs and a
workspace-local report location. A new shared configuration workspace should
be created only if canaries demonstrate a reuse problem that a root helper
cannot solve.

The current root `buildCommand: 'pnpm build'` is likely inappropriate for a
Vitest-based TypeScript canary. Stryker documents `buildCommand` for cases where
the test runner does not compile or transpile the code. Running a repository
build in each mutant sandbox would mix unrelated build cost into the pilot.
This must be tested, not removed on assumption.

### Dry run before mutation

The first executable phase should run Stryker's dry-run-only mode. It must prove:

- the workspace config loads inside the sandbox;
- the intended Vitest config resolves;
- exactly the unit or integration tests intended by the canary are selected;
- no E2E test is discovered;
- the production mutation glob is non-empty;
- the unmutated test suite passes.

Only then should the phase create mutants.

### Report-only score semantics

Initial thresholds should not break the command. Stryker's configuration
supports `thresholds.break: null`, which keeps the score informational. Reports
should include runtime, total mutants, killed/survived/no-coverage/timed-out
categories, and a survivor disposition ledger. No exclusion or mutator change
should be accepted solely because it increases the score.

### Incremental only after a trusted full result

After a full canary result is reproducible, incremental result storage can
reduce repeat work. The contract should retain per-workspace state, document
compatibility invalidation, and schedule an occasional forced full run to
detect reuse blind spots.

## Recommended Sequence

1. **Correct the plan's current truth without changing code.**
   - Warrant: the current plan asserts that existing scaffolding is absent.
   - Falsifier: live files change before implementation; re-baseline again.
2. **Define a typed root config contract and the explicit unit/integration
   selection contract.**
   - Warrant: the current generated stub does not express Oak's test doctrine.
   - Falsifier: the installed Stryker version cannot reliably select tests with
     the Vitest runner, requiring a different orchestration design.
3. **Run a dry-run-only `@oaknational/type-helpers` canary.**
   - Warrant: pure, small code isolates configuration mechanics.
   - Falsifier: the package has changed materially or hidden runtime coupling is
     discovered.
4. **Run its first full mutation pass and triage every survivor category.**
   - Warrant: a full baseline is required before incremental reuse.
   - Falsifier: sandbox/configuration remains nondeterministic; stop and fix the
     mechanics rather than tuning mutants.
5. **Run an integration-only `@oaknational/search-contracts` canary.**
   - Warrant: the first canary cannot prove integration inclusion.
   - Falsifier: the integration test is actually out-of-process or otherwise
     violates the testing-strategy boundary.
6. **Pilot a mixed unit/integration workspace.**
   - Warrant: separate test-kind proofs have passed.
   - Falsifier: runtime or isolation cost already makes the local feedback loop
     unusable; investigate scheduling before broadening.
7. **Evaluate the TypeScript checker and incremental mode independently.**
   - Warrant: each changes performance and result interpretation.
   - Falsifier: either feature adds no decision-useful accuracy or speed.
8. **Choose an invocation cadence before expanding workspace coverage.**
   - Warrant: mutation testing is too expensive to assume it belongs in every
     local or pull-request gate.
   - Falsifier: measured canary runtime is sufficiently small and deterministic
     for a tighter cadence.
9. **Roll out by risk and value, not by a 100% workspace metric.**
   - Warrant: high-value behavioural surfaces may deserve mutation evidence
     before low-risk wrappers or generated packages.
   - Falsifier: a cheap, reliable shared configuration makes complete adoption
     more economical without weakening interpretation.

## Promotion and Ownership

Mutation testing should begin as an explicitly invoked or scheduled
supplementary signal, outside `pnpm check`. Promotion to a blocking gate is a
separate decision that requires stable runtime, deterministic tests, clear
survivor policy, and an agreed response to infrastructure failure. Even then,
blocking should concern a reviewed policy—such as an unexplained regression in
a high-value workspace—not an arbitrary universal score.

The source plan is
[`mutation-testing-implementation.plan.md`](../plans/agentic-engineering-enhancements/current/mutation-testing-implementation.plan.md),
with executable sequencing in
[`phase-5-mutation-testing-execution.md`](../plans/agentic-engineering-enhancements/active/phase-5-mutation-testing-execution.md).
Both need their stale current-state claims corrected before implementation.

## Unresolved Evidence

- Whether Stryker 9.6.1 sandboxes the repository's relative root Vitest config
  successfully. Historical failure on a deleted workspace is a clue, not proof.
- Whether `related: true`, Stryker's Vitest default, selects exactly the intended
  tests once Oak also supplies explicit `testFiles`.
- Whether the root build command is unnecessary for every canary.
- The measured runtime, memory use, and determinism of each canary.
- The effect and cost of the TypeScript checker on this codebase.
- Which report artefacts should be retained in CI and for how long.
- Which named owner triages surviving mutants and records equivalence decisions.
- What cadence—manual, scheduled, changed-workspace, release, or later PR
  integration—delivers the best feedback-to-cost ratio.
- Whether a mixed TS/TSX or browser-adjacent workspace introduces unsupported
  Vitest Browser Mode; official Stryker documentation says Browser Mode is not
  supported.

## Official Documentation Used

- [Vitest runner options and limitations](https://stryker-mutator.io/docs/stryker-js/vitest-runner/)
- [Incremental mode](https://stryker-mutator.io/docs/stryker-js/incremental/)
- [Core configuration, test files, mutation globs, and thresholds](https://stryker-mutator.io/docs/stryker-js/configuration/)
- [TypeScript checker](https://stryker-mutator.io/docs/stryker-js/typescript-checker/)
- [Mutation score treatment of compile and error mutants](https://stryker-mutator.io/docs/General/faq/)
