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
- **Core-amendment scope signal (ADR-131)**: this consolidation surfaced FIVE Practice-Core
  amendment candidates (PDR-064, PDR-011 two-clause bundle, PDR-091, continuity-disposition
  PDR, self-certification synthesis) — above the >3 pause-and-stabilise threshold. All five
  are owner-gated in the register, which is the stabilise posture; do not add further Core
  restructuring candidates before the owner walks these.
- **Practice/tooling feedback** (capture-practice-tool-feedback): `agent-tools:check-commit-message`
  rejects the documented `pnpm ... -- -F file` shape (the forwarded `--` reaches the script as a
  positional and exits 2, usage); the working invocation is `pnpm agent-tools:check-commit-message
  -F file` with NO separator. Sibling gotcha: commitlint's `footer-leading-blank` warning can fire
  from body-bullet shapes alone (bisected to a bullet block, exact trigger unresolved); redrafting
  the bullets cleared it. Also `claims close` requires `--closed <path>` (full help printed on
  miss — loud-by-design worked).
- **commitlint `footer-leading-blank` body-shape trigger RESOLVED** (2026-06-11, Seaworthy
  Fathoming Pier 4a1b92): a body line containing the `PR #170` shape parses as a
  conventional-commits footer (`token #ref` separator form), and that phantom footer lacking a
  leading blank line fires the warning. Bisected empirically: removing `#<number>` cleared it;
  em-dashes and paragraph shapes were innocent. Cure: write `pull request 170` (or put the ref
  in the real footer) — this likely also explains the earlier "bullet block" instance recorded
  below as unresolved.
- **A conservation check verdict goes stale the moment you edit again** — I word-diffed the
  reflows (0 diffs, true), THEN shortened headings for width and carried the stale "loss-free"
  verdict forward; the Director's fresh word-diff caught dropped role/platform tokens in three
  files. Heading text IS content; width cures for headings move tokens to a sub-line, never
  drop them. Re-run the conservation proof after EVERY edit batch, not once per file. (Also:
  a 5-newest-events comms sweep missed a granted ruling — the inbox verb, not `ls -t | head`,
  is the read; cost was editing beyond a boundary I did not know had been drawn.)
- **Read-newest-only bit THREE times in one session** (missed grant; missed owner
  ratification relay 57d32eb1; missed pre-grant c13f2e2b — each landed seconds before my
  compose moment). Standing cure: sweep the DIRECTED BACKLOG (full inbox window since last
  sweep) immediately before composing ANY closeout, re-declaration, or coordination text —
  the compose moment is precisely when a peer's reply is most likely in flight (the
  watcher-race class; same family as the watcher-baseline boundary gap).

## 2026-06-11 — n=3 ARC reliability team, seat X (Seaworthy Fathoming Pier, 4a1b92)

- **Fixed-label heartbeat loops go stale by construction** — my loop still read
  "monitor-to-merge" three cadence windows after the lane terminated; a peer's PDR-078 stall
  ping fired on a seat that was actively working. Cure applied live: relabel-the-loop (stop +
  restart with the honest label) is a NAMED step of every lane transition — claim open, lane
  terminal, cycle advance — same discipline class as verifying a CLI write's destination.
  `candidate:` rule/PDR amendment — graduation-target: `liveness-heartbeat-cron` rule (and/or
  PDR-078 emit-side) clause "relabel at lane transitions; stop-loop-then-emit-end ordering for
  heartbeat-end"; trigger: ARC n=3 synthesis PR landing (Oceanic e05bf4 custody) or a second
  stall-ping-on-working-seat instance; source: ARC channel 2026-06-11 + Hushed's ledger event
  (five heartbeat-lifecycle data points).
- **The CLI's typed-args heartbeat constraint held loud at stand-down** — a free `--body` with
  `--tag heartbeat` was rejected at my heartbeat-end emit; compliant shape is title + typed
  state args (`cycle=stood-down`, Ethereal's precedent). Loud-by-design worked; no napkin cure
  needed, recorded as a worked instance.
