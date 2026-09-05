# Pre-Merge Divergence Analysis

Operationalises [ADR-121 (Quality Gate Surfaces)](../../docs/architecture/architectural-decisions/121-quality-gate-surfaces.md) — pre-merge type-check is a canonical surface — and [ADR-216 (The plan-node estate)](../../docs/architecture/architectural-decisions/216-plan-node-estate.md) — plan-level merge strategy lives in the governing delivery plan.

When merging branches that have diverged significantly (100+ files changed
on either side, or 10+ conflicts in a dry-run merge), follow the
[Pre-Merge Divergence Analysis](../../docs/engineering/pre-merge-analysis.md)
guide before attempting the merge.

The scope is set by the trigger above, not by branch topology: two
long-lived diverged branches (feature-vs-feature, or a stale branch against a
fast-moving `main`) that trip the thresholds. A routine feature-vs-main
ready-check that trips no threshold is a standard pre-merge sanity check
(enumerate the branch's unique commits, check what landed on `main` since the
cut, dry-run the merge) — call it that, and reserve "divergence analysis" for
the threshold-tripping scenario this rule and the `complex-merge` skill own.

Standard text-level conflict resolution misses:

- **Deleted-file import cascades** — a file auto-merges from your branch but
  imports a module the other branch deleted
- **Signature mismatches in auto-merged files** — the other branch changed a
  function signature in a file you didn't touch, but your callers use the old
  signature
- **Required parameter gaps** — your branch adds a required parameter to a
  shared interface, breaking the other branch's new test files that auto-merge
  cleanly
- **Numbering collisions** — both branches create an ADR or plan with the
  same number but different content and different filenames

Always run `pnpm type-check` immediately after resolving text conflicts —
this catches the silent breaks that Git cannot detect.

## Derive Merge Risk From Content, Not From Raw Name-Status

Merge and divergence **risk** is content-derived, never read off a raw
`HEAD..origin` (or branch-vs-branch) `--name-status` count. A long
name-status list can be a zero-risk merge (identical content, pure
fast-forward, or already-applied changes) and a short one can hide a
breaking signature change. Prove the risk from the merge algorithm itself
(a dry-run merge, the conflict set) or from an **empty content diff**, not
from how many files appear in a name-status listing. The raw list is a
discovery hint; the verdict comes from the content.

For the full agent-executable workflow, use the
[complex-merge skill](../skills/change-custody/complex-merge/SKILL-CANONICAL.md).

For **agent memory and state files** (`napkin.md`, `repo-continuity.md`, thread
`*.next-session.md` records, registers — anything carrying a `merge_class:`
frontmatter key), the hazard is different in kind: git line-merges silently
corrupt the *meaning* even when no conflict marker appears, and both git AND the
merging agent can be "confident and wrong". Reconcile those by CONCEPT via the
[semantic-merge skill](../skills/change-custody/semantic-merge/SKILL-CANONICAL.md), never by
trusting the conflict count.
