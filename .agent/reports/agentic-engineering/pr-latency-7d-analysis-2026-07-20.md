# PR flow analysis — 7 days to 2026-07-20 (companion to pr-latency-7d-2026-07-20.csv)

Dataset: 89 PRs merged 2026-07-13..20 (ready→merged latency draft-adjusted, commits,
comments, reviews, diff size) + 26 Linear Done issues in the same window.

## Headline distribution

ready→merged: min 2m · p25 25m · p50 1.3h · p75 4.2h · p90 11.7h · max 4.7d

## Findings

1. **Rounds dominate latency; size only acts through rounds.** Commits (cure-push
   proxy) correlate with latency at Spearman +0.63; additions only +0.25. But
   additions→commits and additions→review-threads are both +0.62: big diffs cause
   findings, findings cause rounds, rounds cause latency — the size effect is
   fully mediated. Buckets are monotonic: 1–2 commits p50 12m; 11+ commits p50 3.3h.
2. **Round cost is roughly constant.** Crude OLS: latency ≈ 52m + 38m/commit;
   median latency-per-commit 14m. Comments-per-commit holds near 3.0 — each cure
   push draws ~3 new comments, so rounds do not converge by themselves; only
   generator-killing cures end a review. (Empirical backing for the
   fix-the-generator ruling.)
3. **Non-review comments are free.** Issue-comment count correlates with latency
   at 0.00. Review threads (+0.49) are the costly kind. Process chatter costs
   nothing; unresolved findings cost rounds.
4. **The latency tail is availability, not process.** 9 of the 11 PRs with >10h
   latency went ready 16:00Z or later — the owner-away window. PDR-131's
   arm-at-settled-READY is the exact cure: armed intents land without presence
   (worked instance: #439 landed 21:24Z with the owner away).
5. **Fast/slow profiles.** Sub-30m PRs (n=23): 2 commits, 5 comments, 42 additions.
   Over-4h PRs (n=23): 9 commits, 17 comments, 272 additions.
6. **Linear (OCE team): ticket-first discipline is real** — lead ≈ cycle (p50 both
   4.6h; tickets start at creation). The 2026-07-20 nine-ticket batch carries the
   serial-era merge wait in its 4–5.5h cycles; AIP-155 (born and merged under
   PDR-131 mechanics) cycled in **14m** — the new floor. Contrast: Curriculum
   Alignment tickets cycle in 45m but lead 21.3d — queue-wait dominates there;
   same lesson (wait, not work, is the cost) at a different scale.
7. **Ticket linkage is partial**: 27/89 merged PRs carry an AIP ref in the title.
   If Linear is to be the DORA view, PR-title ticket refs need to be universal.

## Model

latency ≈ (rounds × ~35–40m) + availability-wait. PDR-131 removed the mechanics
term; universal arm-at-settled-READY removes availability-wait; the residual
lever is round count, which is fixed at authoring time (scope + first-pass
quality). Register refinement: record commits and review-threads per PR and split
the p50 prediction by born-before/born-after PDR-131.
