# plans-backlog-2026-07 — the conserved prior planning estate

This directory is the **complete, lossless** conservation of
`.agent/plans/` as it stood at the 2026-07-21 release pivot (owner
directive: pause the plan-corpus refounding and the intent graph,
backlog the entire planning estate, found a minimal corpus for the
first major release). The move commit is R100-pure: every one of the
671 tracked files landed here byte-identical; the proof is the commit's
own `git diff --name-status -M100%` output (671 R100 rows, nothing
else).

**Owner's word: "we lose nothing."** This backlog is a waypoint, not a
graveyard. The full-corpus transformation to the
[V0 plan-node form](../plans-v0-sketch-2026-07-21/plan-node-schema.v0.md) and the intent
graph both RESUME after the first major release; every plan here is a
migration candidate under the corpus admission rule (V0-conform →
move into `.agent/plans/`).

## What moved back out (the founding members)

Admitted to the reborn corpus in the same PR, under the admission rule:

| Old path (here) | New path |
|---|---|
| `product-development-governance/current/release-planning-corpus-reset.plan.md` | `.agent/plans/practice/release-planning-corpus-reset.plan.md` |
| `product-development-governance/plan-node-schema.v0.md` | `.agent/plans/plan-node-schema.v0.md` |
| `templates/` (whole directory) | `.agent/plans/templates/` |
| `agent-tooling/current/pr-state-instrumentation.plan.md` | `.agent/plans/practice/pr-state-instrumentation.plan.md` |

## Path mapping for the paused refounding

`.agent/plans-refounding/` (untouched by this move) carries path
strings that name the old root — `freeze-rule.json` globs,
`denominator.v1.json`, ledger path strings, and the g1/g2/g3 packet
files. These are **deliberately not rewritten** (never rewrite frozen
history): when the refounding resumes, it re-baselines against this
mapping — every `.agent/plans/<x>` string in those artefacts resolves
to `.agent/plans-backlog-2026-07/<x>`, except the four founding-member
paths above, which resolve to their new-corpus homes.

Live-state pointers (comms events, handoff records, claim intents)
that name old paths are historical records and stay as written; the
claims registry was swept at the S2 landing so no OPEN claim points at
a stale path.

## Resumption intent

- **Full V0 migration**: per-collection, under the admission rule,
  scheduled after the first major release ships (see the corpus-reset
  plan's Sequencing).
- **Intent graph**: resumes on the migrated corpus; V0 is the ADR-200
  bridge form, so nothing here needs re-authoring to become
  graph-ready — the schema was designed for exactly this resumption.
