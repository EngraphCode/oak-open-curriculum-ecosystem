---
name: Stryker Mutation Testing Integration
overview: >
  Turn the existing no-op Stryker scaffold into a trustworthy mutation-testing
  capability through explicit unit/integration scope and evidence-gated
  workspace canaries before any broader rollout or gate decision.
todos:
  - id: re-baseline
    content: "Re-audit workspace layout, vitest configs, and dependency posture against current state."
    status: completed
  - id: phase-0-contract
    content: "Define the typed root contract, explicit unit/integration test selection, production mutation globs, and report-only semantics."
    status: pending
  - id: phase-1-unit-canary
    content: "Prove sandbox/config mechanics with a dry run and full mutation pass on the smallest suitable pure unit-test workspace."
    status: pending
  - id: phase-2-integration-canary
    content: "Prove explicit integration-test inclusion and E2E exclusion on a small integration-only workspace, then pilot one mixed workspace."
    status: pending
  - id: phase-3-evaluate-optimisations
    content: "Evaluate the TypeScript checker, incremental reuse, report retention, and invocation cadence independently from score policy."
    status: pending
  - id: phase-4-value-led-rollout
    content: "Expand by behavioural risk and value only after canary evidence, with an explicit separate decision for any blocking promotion."
    status: pending
---

# Stryker Mutation Testing Integration Plan

## Core References

- [Testing Strategy](../../../directives/testing-strategy.md)
- [Mutation Testing: Incremental Roll-out Concept Exploration](../../../reports/mutation-testing-incremental-rollout-concept-exploration-2026-07-15.md)
- [Augmented Engineering Practices (industry evidence)](../augmented-engineering-practices.research.md) — mutation testing rationale (Parts 8.1, 8.2, Part G)
- [Hallucination and Evidence Guard Adoption](hallucination-and-evidence-guard-adoption.plan.md)
- [Evidence Bundle Template](../evidence-bundle.template.md) — claim and evidence format for pilot and roll-out reporting
- [StrykerJS documentation](https://stryker-mutator.io/docs/stryker-js/introduction/) — full docs available via `@StrykerJS` in Cursor

## Intent

Deliver a dependable mutation-testing capability so that selected workspaces
can use mutation results as supplementary evidence that tests protect
behaviour. The plan does not assume that every workspace benefits equally, or
that mutation testing belongs in `pnpm check`. Coverage expansion and gate
promotion are separate, evidence-gated decisions.

### Execution Role

This is a strategic source plan (intent, milestones, and success criteria).
The authoritative execution tasks for this stream live in:

- [phase-5-mutation-testing-execution.md](../active/phase-5-mutation-testing-execution.md)

## Milestone Position

This plan is a **pre-beta gate** — mutation testing must be operational before the repository exits public alpha and enters public beta. See the [high-level plan](../../high-level-plan.md) Milestone 3.

## Current State — Re-baselined 2026-07-15

The repository has scaffolding but no operational workspace capability:

- [x] Root `package.json` exposes `pnpm mutate` through
  `turbo run --continue mutate`.
- [x] `turbo.json` defines a `mutate` task.
- [x] Root development dependencies include Stryker core, Vitest runner, and
  TypeScript checker 9.6.1.
- [x] `stryker.config.base.ts` is a generated stub without Oak source/test
  globs, thresholds, incremental state, or workspace contract.
- [x] No workspace package exposes a `mutate` script.
- [x] `pnpm exec turbo run mutate --dry=json` reports `<NONEXISTENT>` for all 26
  inspected workspaces.
- [x] The testing directive defines unit and integration tests as the intended
  in-process surface; E2E is out of scope.
- [x] Historical pilots name a deleted workspace and cannot prove current
  Stryker 9.6.1 sandbox behaviour.

The root command must not be described as enabled until at least one workspace
executes a deterministic dry run and mutation pass.

## Configuration Contract to Prove

### 1. Explicit Test and Source Selection

- Positively select only `*.unit.test.{ts,tsx}` and
  `*.integration.test.{ts,tsx}` through Stryker's test-file contract.
- Preserve Vitest's E2E exclusion as defence in depth, not the only boundary.
- Select authored production source explicitly and exclude tests, generated
  files, declarations, fixtures where applicable, and build output.
- Keep `allowEmpty` false so a bad selection cannot report success.

### 2. Typed Root Contract, Workspace-local Ownership

- Replace the generated root stub with a typed base or factory only after a RED
  canary proves the required contract.
- Keep mutation/test globs and report paths explicit in each participating
  workspace.
- Create a shared testing-config workspace only if canaries prove a reuse
  problem that the root helper cannot solve.
- Test whether the current root `buildCommand: 'pnpm build'` is needed. Do not
  impose repository-wide build cost on each mutant without evidence.

### 3. Report-only Semantics

- Begin with `thresholds.break: null`; a score is evidence, not a gate.
- Record runtime and each mutant category, then disposition survivors as
  missing behaviour coverage, equivalent mutant, dead/unreachable code,
  invalid mutation, timeout, or unsuitable mutator.
- Reject tests, exclusions, and mutator changes whose only purpose is improving
  the number.
- Decide invocation cadence only after measuring canaries.

## Strategic Roadmap

### Phase 0 — Contract and Dry-run Foundation

- Define the typed root contract and one workspace-local config through TDD.
- Prove sandbox, Vitest config, production globs, test selection, and E2E
  exclusion in dry-run-only mode.
- Do not add thresholds, CI, or a broad shared abstraction yet.

### Phase 1 — Pure Unit Canary

- Re-verify `@oaknational/type-helpers` as the preferred one-source-file,
  pure-function canary.
- Run a full non-incremental mutation pass only after the dry run succeeds.
- Triage every survivor category and capture deterministic rerun evidence.
- Record pilot claims and verification evidence using [Evidence Bundle Template](../evidence-bundle.template.md)

### Phase 2 — Integration and Mixed Canaries

- Re-verify `@oaknational/search-contracts` as the preferred small,
  integration-only canary.
- Prove integration-test inclusion and E2E exclusion independently of the unit
  canary.
- Then select one mixed unit/integration workspace to prove combined scope.

### Phase 3 — Independent Optimisation Evaluations

- Compare TypeScript-checker accuracy and runtime with the same canary evidence.
- Establish a trusted full result before evaluating incremental reuse.
- Define per-workspace result retention and an occasional forced full run.
- Measure manual, scheduled, changed-workspace, release, and possible later PR
  cadence options before selecting one.

### Phase 4 — Value-led Expansion and Separate Gate Decision

- Expand to workspaces according to behavioural risk, value, determinism, and
  feedback cost rather than a 100% adoption target.
- Document new-workspace eligibility and explicit no-op dispositions.
- Treat any blocking promotion as a separate owner decision with stable
  runtime, survivor policy, and infrastructure-failure semantics.

## Documentation Propagation Requirement

Apply the shared documentation-propagation contract:

- [Documentation Propagation component](../../../plans/templates/components/documentation-propagation.md)
- [the agentic-engineering-enhancements documentation-sync-log](../../../memory/operational/documentation-sync-logs/agentic-engineering-enhancements.md) (collection tracking)

## Success Evidence

- A dry run proves non-empty production source, exact unit/integration scope,
  E2E exclusion, and passing unmutated tests.
- A pure unit canary and an integration-only canary each produce reproducible
  full results with complete survivor dispositions.
- Runtime and result-category evidence supports the next workspace and cadence
  decision.
- No score target, exclusion, or test exists without a behavioural rationale.
- The root command reports honestly when zero workspaces are configured and is
  described as operational only after an actual workspace command exists.

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Performance overhead from long mutation runs | Small canaries, measured cadence, then incremental evaluation after a full baseline |
| Existing test flakiness amplified by mutation | Enforce deterministic test design before enabling Stryker |
| Config drift across workspaces | Typed root contract plus explicit workspace ownership; share more only when canaries prove the need |
| CI runner resource limits | Keep CI out of the first proof and profile before selecting cadence |
| Score gaming | Require behavioural survivor dispositions; treat fitness numbers as signals, not limits |

## Appendix: Historical Pilot

> The following records a pilot run from 2025-09-24 on a workspace that has since been removed. Preserved for context.

A pilot run on the former `@oaknational/mcp-providers-node` workspace produced a mutation score of **53.57%** (15 killed, 13 survived). Surviving mutants clustered around console logging branches, highlighting missing behavioural assertions.

**Historical clues, not current facts**:

- the former sandbox run failed with a relative shared Vitest configuration;
- the current Stryker 9.6.1 and current Vitest topology must be tested before
  deciding whether duplication or a shared testing-config workspace is needed.
