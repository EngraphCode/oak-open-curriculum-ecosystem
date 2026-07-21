---
fitness_line_target: 700
fitness_line_limit: 1100
fitness_char_limit: 70000
fitness_line_length: 100
fitness_content_role: reference
overflow_disposition: 'leave-if-live; else conserve-insight-and-delete — never archive/split/rotate/shard (see continuity-practice.md §Disposition of Continuity Surfaces)'
merge_class: index-narrative-tables
---
# Next-Session Record — `architectural-budget-system` thread

**Last refreshed**: 2026-07-15 (Spark seeks Pumice / codex / GPT-5 / 019f61
— read-only concept exploration and documentation handoff. First-hand
inspection showed that the unwired `max-files-per-dir` ESLint rule requires an
external inventory and is the wrong execution layer for repository-level
directory analysis. A decision-ready report and re-founded child plan propose
non-blocking architectural-fitness signals; owner ratification remains pending.
No validator, rule, threshold, refactor, ADR amendment, or gate was implemented.)

## Participating Agent Identities

| Agent name | Platform | Model | Session id prefix | Role | First session | Last session |
| --- | --- | --- | --- | --- | --- | --- |
| `Nebulous Weaving Dusk` | `codex` | `GPT-5` | `019dd7` | `architectural-budget-planning-and-adr-handoff` | 2026-04-29 | 2026-04-29 |
| `Spark seeks Pumice` | `codex` | `GPT-5` | `019f61` | `architectural-fitness-concept-exploration-and-handoff` | 2026-07-15 | 2026-07-15 |

Identity discipline remains additive per
[PDR-027](../../../../practice-core/decision-records/PDR-027-threads-sessions-and-agent-identity.md):
new sessions add rows; matching platform/model/agent_name updates
`last_session`.

---

## Landing Target (per PDR-026)

Landed on disk, uncommitted: decision-ready architectural-fitness evidence and
reconciled planning topology are in place, with no enforcement or validator
code enabled.

Evidence:

- [ADR-166](../../../../../docs/architecture/architectural-decisions/166-architectural-budget-system-across-scales.md)
- [Architectural Budget System Across Scales](../../../../plans-backlog-2026-07/architecture-and-infrastructure/future/architectural-budget-system-across-scales.plan.md)
- [Architectural Budget Visibility Layer](../../../../plans-backlog-2026-07/architecture-and-infrastructure/future/architectural-budget-visibility-layer.plan.md)
- [Architectural Budget Enforcement Layer](../../../../plans-backlog-2026-07/architecture-and-infrastructure/future/architectural-budget-enforcement-layer.plan.md)
- [Directory Complexity Enablement](../../../../plans-backlog-2026-07/developer-experience/current/directory-complexity-enablement.execution.plan.md)
- [Architectural Fitness Functions: Concept Exploration](../../../../reports/architectural-fitness-functions-concept-exploration-2026-07-15.md)

Validation evidence:

- `pnpm markdownlint-check:root`
- `git diff --check` scoped to the touched ADR/planning files

## Next Landing Target

The next action is an owner decision, not implementation: ratify, revise, or
reject the proposal that directory cardinality should be a non-blocking signal
in the repository validator framework rather than a per-file ESLint gate.

If ratified, the next executable landing is Phase 2 of the re-founded child
plan: deterministic discovery, explicit file-role classification, and stable
human/JSON output written through TDD. Do not wire or delete the custom ESLint
rule before replacement-equivalence proof. Do not promote count to a blocking
gate without new longitudinal evidence and a separate owner decision.

## Session Shape and Grounding Order

1. Read
   [repo-continuity](../../repo-continuity.md) and this thread
   record.
2. Read
   [ADR-166](../../../../../docs/architecture/architectural-decisions/166-architectural-budget-system-across-scales.md).
3. Read the parent plan and the child plan that matches the owner-selected
   landing.
4. Re-read ADR-041, ADR-121, ADR-154, and ADR-155 before drafting any
   enforcement or workspace-boundary change.
5. Read the
   [2026-07-15 concept report](../../../../reports/architectural-fitness-functions-concept-exploration-2026-07-15.md).
6. Re-check live branch and shared-worktree state before editing or running
   gates.

## Lane State

### Owning Plans

- Parent:
  [Architectural Budget System Across Scales](../../../../plans-backlog-2026-07/architecture-and-infrastructure/future/architectural-budget-system-across-scales.plan.md)
- Visibility child:
  [Architectural Budget Visibility Layer](../../../../plans-backlog-2026-07/architecture-and-infrastructure/future/architectural-budget-visibility-layer.plan.md)
- Enforcement child:
  [Architectural Budget Enforcement Layer](../../../../plans-backlog-2026-07/architecture-and-infrastructure/future/architectural-budget-enforcement-layer.plan.md)
- Directory-cardinality execution child:
  [Directory Complexity Enablement](../../../../plans-backlog-2026-07/developer-experience/current/directory-complexity-enablement.execution.plan.md)
- Related workspace topology owner:
  [Workspace Layer Separation Audit](../../../../plans-backlog-2026-07/architecture-and-infrastructure/current/workspace-layer-separation-audit.plan.md)

### Current Objective

Keep function, file, directory, workspace, package API, and dependency-graph
budgets aligned so complexity cannot simply move upward, sideways, or into
proxy workspaces. ADR-166 is the doctrine source; child plans own executable
rollout.

### Current State

- ADR-166 is accepted and now includes lifecycle-managed visibility reports,
  expiring baseline exceptions, hollow-package rejection, wildcard-export
  discipline, and informational-or-blocking gate semantics.
- The parent architectural-budget plan is future/strategic, not executable.
- The visibility and enforcement layers are future briefs; the first promoted
  visibility slice must serve one named consumer trigger.
- The current rule is not exported or configured. Its external-inventory
  dependency and silent empty-inventory behaviour make it a poor home for
  repository-wide analysis.
- A read-only production-source baseline found 1,632 files across 217
  directories; 77 directories exceed the rule's old default of eight and 28
  exceed twelve. The results mix behaviour code with coherent registry/data
  shapes, falsifying count-as-diagnosis.
- The re-founded child plan proposes deterministic, report-only discovery in
  the established validator framework. The visibility and enforcement plans,
  quality-gate plan, and agentic-enforcement plans record the proposal without
  claiming owner ratification.
- ADR-166 remains the current authority and has not been amended.

### Blockers / Low-Confidence Areas

- Owner ratification of the signal-versus-invariant semantics is pending.
- File-role classification and named consumer/cadence are not yet selected.
- Current branch contains extensive unrelated and concurrent documentation,
  plan, state, and source changes. Preserve those boundaries.
- No threshold is selected. The report recommends distributions and
  role-separated observations rather than a compliance line.

### Next Safe Step

Ask the owner to ratify, revise, or reject the 2026-07-15 report-only proposal.
If ratified, cheaply re-verify current truth, then implement the validator's
discovery/classification contract with RED tests. If rejected, record the
evidence that makes count a strict invariant before returning to ESLint or gate
design.

### Active Track Links

None.

### Promotion Watchlist

- ADR-121/build-system updates only when an actual gate surface changes.
- ADR-166 amendment candidate: clarify that architectural budgets can be
  heuristic signals and that only explicit invariants are enforcement
  candidates. Do not amend before owner ratification.
