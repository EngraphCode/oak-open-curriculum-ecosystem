# PR flow analysis — 7 days to 2026-07-20 (companion to pr-latency-7d-2026-07-20.csv)

Dataset: the 89 PRs merged in the 2026-07-13 → 07-20 merge window (first merge
2026-07-13 08:15Z, last 2026-07-20 21:24Z — ~7.5 days across eight calendar
dates; "7d" in the filenames names this window, not an exact 168-hour cut;
the quantiles are per-PR and unaffected by the label) with ready→merged
latency draft-adjusted, commits, comments, reviews, diff size + 26 Linear
Done issues in the same window (timestamps conserved in
`linear-cycle-7d-2026-07-20.csv` beside this file, so the Linear findings
below reproduce from the changeset).

Definitions (reproducible against the CSV): a "heavy review" is a PR whose
FINAL commit count is 6 or more (the rounds proxy at roughly 3+ cure
pushes; the CSV has no opening-commit field, so any opening-time commit
warning is inference awaiting instrumentation, not a measurement here); the
size-bucket table below IS the threshold derivation — heavy-review
incidence by additions bucket: ≤50 → 8% (2/25), 51–150 → 40% (6/15),
151–300 → 40% (4/10), >300 → 74% (29/39); by files: 1–3 → 24%, 4–8 → 50%,
9–15 → 65%, >15 → 74%. "Triples" compares the ≤300 pooled rate (24%)
with the >300 rate (74%).

## Headline distribution

ready→merged: min 2m · p25 25m · p50 1.3h · p75 4.2h · p90 11.7h · max 4.7d

## Findings

1. **Rounds dominate latency; the size effect is consistent with mediation
   through rounds.** Commits (cure-push proxy) correlate with latency at
   Spearman +0.63; additions only +0.25, while additions→commits and
   additions→review-threads are both +0.62. These are pairwise associations:
   the mediation reading (size → findings → rounds → latency) is the
   parsimonious causal story and matches the round mechanics, but this
   corpus has not been analysed with the mediator controlled, and elapsed
   latency itself permits more rounds (reverse-path caveat). Treat as
   strong-signal, not proof. Buckets are monotonic: 1–2 commits p50 12m;
   11+ commits p50 3.3h.
2. **Per-commit associations are stable.** Crude OLS: latency ≈ 52m +
   38m/commit; median latency-per-commit 14m; median comments-per-commit
   3.0. These are final-aggregate per-COMMIT associations — commits proxy
   rounds, so per-round cost and per-push comment draw are inferences
   awaiting round-level instrumentation, not measurements. The convergence
   reading they support: reviews do not converge by attrition; generator-
   killing cures end them. (Consistent with the fix-the-generator ruling.)
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
