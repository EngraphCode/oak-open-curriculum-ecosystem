---
fitness_line_target: 220
fitness_line_limit: 300
fitness_char_limit: 18000
fitness_line_length: 100
drain_strategy: "Extract settled entries to permanent docs, PDRs, rules, or archived napkins"
merge_class: append-only-narrative
fitness_content_role: drainable-buffer
---

## Session: 2026-06-11 — napkin rotated (Arboreal Swaying Thicket curation pass)

Rotated the 2026-06-09 → 2026-06-11 window during a dedicated knowledge-curation
session. The processed window is preserved verbatim at
[`napkin-2026-06-11-arboreal-curation.md`](archive/napkin-2026-06-11-arboreal-curation.md).
Every behaviour-changing lesson was verified live in a home before rotation:
review-adjudication + defect-class sweep in `invoke-code-experts` §Finding
Adjudication; the export-contract gotcha in `typescript-gotchas.md`; the
self-filter-audit clause in `verify-dont-trust`; the flag-engine clause in
`testing-strategy.md`; worktree/Director operational gotchas merged to
`distilled.md`; succession + citable-gate substance and the liveness/watcher
rule clauses conserved in `pending-graduations.md` (rules under live Director
claim); the shared-tree rotation reflex in `consolidate-docs` step 6. Fresh
capture continues below.

## 2026-06-11 — dedicated consolidation session (Arboreal Swaying Thicket, d2947e)

- **A consolidation seat arriving into a live Director window negotiates the lane, then
  proceeds on the curation buffers**: claim opened marked pending-routing, one direct request
  to the Director, owner direction "minimum ceremony" resolved the wait — curation buffers are
  not in the Director's active churn; live team-state surfaces (repo-continuity Current State,
  eef record, team opener) stay Director-owned, deltas handed over instead of edited.
- **Reflowing a width-critical register trades width for line count** — the line-count HARD on
  a drainable buffer is designed back-pressure (its own `fitness_rationale` says so); reflow
  cures the loop-failure width signal without touching substance. Wrap-safety gotcha: a wrapped
  continuation line must not start with a list-marker character (`+`, `-`, `*`) — markdownlint
  MD004 caught one; audit wrap output for accidental markdown semantics.
- **`awk 'length > 100'` counts bytes, not characters** — multibyte punctuation (—, →) makes
  byte counts overshoot; the fitness validator counts characters. Use python `len()` or the
  validator itself to enumerate over-wide lines.
- **A conservation check verdict goes stale the moment you edit again** — I word-diffed the
  reflows (0 diffs, true), THEN shortened headings for width and carried the stale "loss-free"
  verdict forward; the Director's fresh word-diff caught dropped role/platform tokens in three
  files. Heading text IS content; width cures for headings move tokens to a sub-line, never
  drop them. Re-run the conservation proof after EVERY edit batch, not once per file. (Also:
  a 5-newest-events comms sweep missed a granted ruling — the inbox verb, not `ls -t | head`,
  is the read; cost was editing beyond a boundary I did not know had been drawn.)
