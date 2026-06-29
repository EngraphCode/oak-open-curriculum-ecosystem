---
fitness_line_target: 220
fitness_line_limit: 300
fitness_char_limit: 18000
fitness_line_length: 100
drain_strategy: "Extract settled entries to permanent docs, PDRs, rules, or archived napkins"
merge_class: append-only-narrative
fitness_content_role: drainable-buffer
---

# Napkin

Current-session observations. Append below. Rotate when over ~400 lines (`consolidate-docs`
step 6): extract every behaviour-changing entry, merge into `distilled.md` or graduate to a
permanent home, verify the home, then archive and start fresh.

## Napkin rotated (2026-06-29 deep consolidation, Falcon wakes Stratus)

Second rotation of the day. Quoll's earlier rotation (`napkin-2026-06-29-quoll-consolidation.md`)
re-bloated immediately with the rotating-cast's closeout appends (Hearth, Sirius, Kayak, Seraph,
Kraken, and Quoll's own closeout) — a worked instance of *napkin re-bloats from rotating-cast
closeouts*. Those appends are now processed and preserved verbatim in
`archive/napkin-2026-06-29-falcon-consolidation.md` (byte-identical).

This deep pass (Director-rotation closeout, owner-directed) graduated the deferred team-tooling
captures to permanent homes — the commits + the homes are the record:

- the `consolidate-at-third-consumer → consolidate-at-second-consumer` rename + 41-file slug sweep
  (the Quoll/Seraph doc-defect, **FIXED**); **gate-evasion / escape-hatch screen** →
  `patterns/fluency-is-a-failure-vector.md`; **Director craft** (Kraken's standby-burn /
  auto-update-branch-babysitter / measure-at-handoff-gate + Trawler Part-A) → `director-handoff.md`
  §Standing lessons, with the CURRENT HANDOFF STATE refreshed to a compact post-arc block;
  **timestamp-zone discipline** → `verify-dont-trust.md`; **discriminating-fixture** →
  `docs/engineering/testing-patterns.md`; repo-continuity arc-closed + Director=Falcon; the AEE
  identity row, statusline index-drift, and `data-sources-governance` index folds.

**Carry-forward (homes mapped, await an authoring pass):** the five lighter amends + Sirius's ws0
findings are staged in [`distilled.md`](distilled.md). The **PDR-117 expansion** + the **synthesis
phase** (model verdict / do-first matrix / rightsizing M1→M2 activation) are owner-routed to a
fresh-context session. **Curator-pass debt:** clear the 11 dead `commit_queue` entries + archive
the 3 stale non-team claims (Starling/Ketch/Finch); the ~2186-event comms dir awaits the
retention-gated archive-move pass.

New session observations append below.

- **gh shared rate-limit (5,000/hr) exhausted mid-closeout → #290 merge blocked ~60 min (owner-flagged
  F-110).** Proximate cause was MY `Monitor` polling `gh pr checks 290` every 30 s (~20 calls) + repeated
  `reviewThreads` GraphQL queries, against the budget shared with every agent + the Cursor/Sonar/Copilot
  bots. Lesson lived: do NOT poll `gh` in a tight Monitor loop. Owner-directed cure → **F-110**
  (rate-limit-aware agent-tools `gh` wrapper: batch one GraphQL round-trip for checks+threads+state,
  jitter, exponential backoff honouring `X-RateLimit-Reset`, shared-budget reservation). The CI-check
  Monitor recipe in the Director brief should consume that wrapper, not raw `gh`.
