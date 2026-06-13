Agents are carrying out more pull request creations, reviews, responding to comments, and merging.

We need rules, guidance, best practices, and conventions for pull request creation, review, response, and merging.

This needs to be backed up with mechanism, rules, skills, and tools.

## WS3-grounded evidence base (candidate inputs — NOT yet ratified rules)

The comms-corpus research (WS3 failure-mode taxonomy, 2026-06-13) surfaced a coherent PR/commit
failure family, every class grounded in first-hand-verified comms events. **This is the evidence
base for this plan, not its conclusions.** The cure-shapes below are candidate inputs: the plan's
own design process should narrow them, several consolidate EXISTING rules rather than add new ones,
and the eventual rule/skill/tool set is open. Full analysis + cited events:
`.agent/reports/agentic-engineering/2026-06-13-ws3-deep-dives.md` (§D) and the taxonomy
`2026-06-13-ws3-failure-mode-taxonomy.md` (super-category D + T1/T7, H1, R1, P1).

### Candidate inputs, by lifecycle stage

**Commit (multi-writer shared tree):**

- **COMMIT_EDITMSG message-identity isolation.** `.git/COMMIT_EDITMSG` is shared single-writer
  state; pathspec protects file scope but not the message — a peer can overwrite it during your
  pre-commit window, landing your files under their message (`230f3200`). Candidate: inline `-m`
  or per-intent message files. **GAP** (no existing rule).
- **Explicit-pathspec staging + verify-staged-set.** Foreign-staged files get absorbed +
  misattributed when staging trusts the ambient index (`0ba2c822`). **EXISTING:**
  `stage-by-explicit-pathspec` + commit-queue verify-staged — reference/consolidate.
- **Pre-flight commit-subject length** (commitlint 100; composite subjects overrun) —
  `e7878e41` / `31998f7a`. **EXISTING:** commit skill enumerates it; candidate to make structural.

**Push:**

- **Push proof = transfer line + `git ls-remote`, never the hook banner** (`e589b3c7`,
  false-green push ×2). Candidate rule/skill clause (in distilled; graduation candidate).
- **Prefer the direct gated commit (Path-B) over the commit-queue wrapper** until the wrapper's
  captured-hook-output defect is fixed (`5ef5f1c0`, five instances). **TOOL-FIX** (agent-tools) +
  interim convention.

**Gate / hooks:**

- **`--no-verify` is owner-authorised per instance; a hook block is a question** (`054f1469`).
  **EXISTING:** `no-verify-requires-fresh-authorisation` — reference.
- **Whole-tree-gate ⇄ commit-scope alignment in shared trees** — a peer's untracked edits can
  break your gate. Candidate guidance + gate-scoping tool consideration. **GAP.**

**Review / response / merge:**

- **Review-dispatch before the commit/merge; no backfill** (`3d56f233`). **EXISTING:** no-backfill.
- **Pin the SHA when pre-grounding a peer PR** (`git show <head-sha>:<path>`, never a live
  worktree) — `b46ccedd`. **EXISTING:** pin-SHA-when-pre-grounding.
- **Merge-window liveness: ping-before-escalate + git-evidence** before reading silence as
  retirement (`5fb2bcd9` / `670cc290`). **EXISTING:** PDR-078 / ping-before-escalate.

### What worked (encourage, not mandate)

Two-moments warden handoff for the commit/push-window singleton (PDR-064); execution-start
re-verification before routing PR work; ls-remote / RED-first as proof disciplines.

### Scope note (read before authoring rules)

Most items above are EXISTING rules to consolidate/reference, not re-author
(`consolidate-at-third-consumer`). The genuine NEW gaps are narrow: COMMIT_EDITMSG message
isolation, whole-tree-gate ⇄ commit-scope alignment, and the commit-queue-wrapper tool-fix.
Whether each becomes a rule, skill clause, tool change, or guidance is THIS plan's decision —
this section preserves the evidence, deliberately not the conclusion.
