---
name: agent-operability-plan-corpus-rationalisation
type: report
status: DRAFT — research output (NAMES the rationalisation; the owner decides the shape)
created: 2026-06-27
created_by: Cedar lifts Canopy (claude-code / claude-opus-4-8[1m] / 435d30)
thread: agent-operability-plan-consolidation
related:
  - .agent/rules/worktree-hygiene.md
  - .agent/memory/operational/threads/statusline-enhancements.next-session.md
---

# Agent-operability plan-corpus rationalisation

> **Research output, not a decision.** This report NAMES redundancy, duplication,
> contradictions, and misplaced concepts across the plan corpus, and proposes how
> the corpus could be fewer plans, better ordered, or better staged. It does not
> execute any change. The owner decides the final shape; edits to any live-lane
> plan are routed through the Director (Oyster spins Coral) first.

## Why this report exists

Owner direction (2026-06-27): assess, collate, and **sanitise** the scattered
plans addressing four facets of one underlying concern, and additionally look for
**redundancies, duplication, contradictions, and misplaced concepts between the
plans** — could there be **fewer plans**, could the concepts be **better expressed
in a different order, in different stages, or in different plans**?

The four facets are one concern seen from four angles:

1. **Statusline** — what an operator sees of session and team state at a glance.
2. **Agent working locations** — where agents work (primary checkout vs linked worktrees).
3. **Agent tooling locations** — where tooling and shared state *resolve* (the coordination home).
4. **Team-state records** — how team and work state is recorded, made durable, and shown.

The thesis to test: these are not four independent problems but one — *where agents
work, where their tooling and state resolve, and how that state is recorded and
surfaced* — fragmented across many plans in `current/` and `future/` across two
plan trees plus two thread hubs, a git-ignored map, and (now on main) the
worktree-hygiene rule.

## Method

- Scope precisely to plans that materially address the four facets (below); do not
  boil the ocean of the full plan estate.
- Read the anchor plans first-hand; extract a structured concept inventory across
  the full in-scope corpus (coverage), critically assessing every extract against
  its source.
- Assess live surfaces against their current trajectory, not a stale snapshot
  (per Director intel 2026-06-27): the statusline + operability plans move via
  PR #250; the cross-worktree map is Oyster's and in-flight; the
  orientation-skills-family plans are Peony's and growing.
- Output names the rationalisation and the open decisions; the owner decides.

## In-scope corpus (working scope — refined during assessment)

Facet key: **S** statusline · **W** working locations · **T** tooling locations · **R** team-state records.

| Document | Tree / stage | Facet(s) |
| --- | --- | --- |
| `session-and-team-state-statusline-icons.plan.md` | agent-tooling/current | S, R |
| `statusline-logo-modularisation.plan.md` | agent-tooling/current | S |
| `statusline-enhancements.next-session.md` | threads (hub) | S |
| `comms-and-worktree-operability.plan.md` | agent-tooling/current | W, T |
| `agent-work-state-registry.plan.md` | agent-tooling/future | W, R |
| `worktree-per-agent-transition.plan.md` | agentic-eng/future | W |
| `worktree-pilot-consolidation-and-model-verdict.plan.md` | agentic-eng/current | W |
| `.agent/rules/worktree-hygiene.md` | rules (on main) | W |
| `coordination-home-explicit-targeting-migration.plan.md` | agent-tooling/future | T |
| `coordination-watcher-canonicalisation.plan.md` | agent-tooling/current | T |
| `collaboration-state-write-safety.plan.md` | agent-tooling/current | T |
| `collaboration-state-domain-model-and-comms-reliability.plan.md` | agent-tooling/future | T, R |
| `agent-coordination-cli-ergonomics-and-request-correlation.plan.md` | agent-tooling/future | T |
| `multi-agent-collaboration-protocol.plan.md` | agent-tooling/current | R |
| `collaboration-substrate-coordination-rightsizing.plan.md` (+ `.m1-inventory.md`) | agent-tooling/future | R, T |
| `collaboration-state-surface-restructure.plan.md` | agentic-eng/current | R |
| `continuity-surfaces-are-state-not-memory.plan.md` | agentic-eng/future | R |
| cross-worktree work-state map (git-ignored) | state/collaboration | W, R |

## Concept inventory

_To be populated from first-hand reading + verified extraction._

## Findings

### Redundancy and duplication

_Same concept stated in more than one plan._

### Contradictions

_Plans that disagree on the same concept._

### Misplaced concepts

_A concept living in the wrong plan, tree, or stage._

## Proposed rationalisation

### Could there be fewer plans?

_Merge candidates, with rationale._

### Better order / stages / distribution

_Re-sequencing and re-homing proposals._

## Sanitisation findings

_Machine-local paths, PII, stale status markers, dead cross-references._

## Open decisions for the owner

_The decisions this report surfaces but does not make._
