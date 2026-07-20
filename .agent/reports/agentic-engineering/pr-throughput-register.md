# PR throughput register (PDR-131)

Fitness-informational trend register written by `pnpm agent-tools:pr-throughput`
(always exit 0). Each row is one trailing-window reading over PRs merged to
`main`, excluding coordination trackers (`coordination/*` head branches);
a merged PR is never draft at merge, so no draft classification exists in
this corpus. Cycle time is open-to-merged, in minutes, nearest-rank
percentiles.

Governing doctrine (both records ride the coordination branch until its next
main reconciliation):
[PDR-131 — merge concurrency is free; quality binds at settled-READY](https://github.com/oaknational/oak-open-curriculum-ecosystem/blob/coordination/estate-2026-07/.agent/practice-core/decision-records/PDR-131-merge-concurrency-is-free-quality-binds-at-settled-ready.md)
supplies the mechanics this register measures;
[PDR-130 — two-speed learning](https://github.com/oaknational/oak-open-curriculum-ecosystem/blob/coordination/estate-2026-07/.agent/practice-core/decision-records/PDR-130-two-speed-learning.md)
supplies the prediction form (a falsifiable prediction whose failure triggers
investigation, never retelling).

**Prediction (PDR-130 form):** under PDR-131 mechanics (settled-READY + green
checks arm auto-merge under Director grant; concurrent landings normal) with
the strict-currency ruleset policy dropped, the measured cycle-time p50 —
across ALL counted PRs, since no story-size classification exists in the
record — falls to 45 minutes or below as single-story PRs stop queueing
behind the serial treadmill. **Falsifier:** two consecutive weekly windows
with p50 above 45 minutes means the doctrine is not being applied (or the aggregate
proxy hides the effect — either way, the actual binding constraint gets
investigated instead of the claim being retold).

| Date | Window | Merges | Merges/day | p50 (min) | p90 (min) | Note |
| ---- | ------ | ------ | ---------- | --------- | --------- | ---- |
| 2026-07-20 | 7d | 67 | 9.57 | 135 | 802 | founding window: incl. 2026-07-20 net-to-zero drive (23 merges, serial-slot + queue-cascade eras) |
