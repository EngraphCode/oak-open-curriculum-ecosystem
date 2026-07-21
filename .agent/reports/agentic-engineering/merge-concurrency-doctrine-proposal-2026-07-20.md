# Proposal: merge concurrency is free — quality binds at settled-READY, not at the merge moment

**Status**: RATIFIED — the proposal graduated to
[PDR-131](../../practice-core/decision-records/PDR-131-merge-concurrency-is-free-quality-binds-at-settled-ready.md)
(owner-ratified 2026-07-20) with the executable amendment folded into the
pr-lifecycle skill; this report is conserved as the natural-experiment evidence
record. (Drafted by Forge rides Brimstone 398e24, Director, 2026-07-20 ~19:24Z;
owner's framing verbatim: "2.5–3 hours was not a measure of how long it should
take, it was a measure of the broken merge approach we currently use".)

## The natural experiment (2026-07-20)

Same PRs, same quality bar, two mechanisms:

- **Serial slot mechanics** (the drive's standing model): settled-round predicate → Director slot grant → one update-branch → post-update round → bare merge → ~5-min release-bump gap → next. Measured cost for an 11-PR tail: estimated 2.5–3 hours; earlier in the day, real landings ran ~15–25 minutes each.
- **Concurrent auto-merge** (accidental, 19:12–19:20Z): the queue-era armed intents fired on merge-queue-rule removal; **eleven PRs landed in ~6 minutes**, every one on a previously settled review round with all four required checks green. Outcome: main green, Sonar gate green (all four conditions OK), releases shipping, every Phase-8 harvest clean, zero breakage.

## What serialisation was actually defending — decomposed

1. **The up-to-date treadmill**: the ruleset's strict-currency policy re-BEHINDs every sibling at each landing; serialisation + bump-gaps were a coping strategy for that rule, not a quality mechanism.
2. **The composing-round race** (real): defended by the settled-round predicate BEFORE merge-eligibility and the Phase-8 harvest AFTER — serialisation adds nothing.
3. **Cross-PR semantic drift** (the honest residual): two PRs each green against pre-sibling main can conflict semantically. Today ran this risk eleven-wide and held; the recovery stack (test-merge CI, main's own CI, Phase-8, fix-forward, the parity-test tripwire class) is the defence, and its worked instance today was a catch, not a miss.

## Proposed doctrine amendments

1. **Narrow the no-auto-merge ruling** (born when arming happened at PR-open, pre-settlement — the #390/#391-era races): arming auto-merge is PERMITTED exactly and only **at settled-READY under a Director grant**. Arming before settlement stays forbidden.
2. **Retire the serial slot machinery** (one-at-a-time grants, bump-gap waits) as default mechanics; the Director grants merge-eligibility (the predicate check), not queue position. Concurrent landings are normal.
3. **Phase-8 stays mandatory** per landing; the parity-copy/test-merge classes stay the named residual-risk recoveries.
4. **The strict-currency ruleset policy is the named cost-driver**: it is the owner's deliberate keep-or-drop. Kept, PRs need currency at arm-time only (auto-merge waits); dropped, the treadmill class disappears entirely with the §residual above as the accepted trade.
5. **New failure-mode already captured** (event 94ba2d22): enqueue/arm intents survive queue-rule removal and fire silently — before removing any queue/branch-protection rule, disarm all armed intents first.

## Evidence anchors

Vendor sources for the queue/auto-merge claims: GitHub Docs, "Managing a
merge queue" (merge-group check semantics — required checks must report on
`merge_group` refs):
<https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue>;
github/codeql-action issue #1537 (CodeQL default setup cannot report on
merge-group refs; open at capture time):
<https://github.com/github/codeql-action/issues/1537>. The armed-intents
survive-rule-removal behaviour is first-hand observed (the 19:12–19:20Z
cascade), not vendor-documented — an empirical claim, flagged as such.

23 merges on 2026-07-20 with zero breakage; the 11-wide cascade (19:12–19:20Z, merge SHAs on main d92bfa307…c20201d78); Sonar gate re-read OK at 19:26Z; Phase-8 records on-stream; the day's serial-era landing latencies in the comms trail (#431 13:07→13:08 grant-to-merge but ~25 min cycle incl. update-branch and rounds; #413/#414 cycles similar).

## Route

Owner ratifies → the amendment lands on `pr-lifecycle` SKILL (state-machine items 4–5 + Phase 7's arming clause) and the drive-rulings register at the next doctrine writer's touch; this report is the graduation source.
