# PR round ledger — design-lane PRs #907 #908 #909 #910 (shepherd: Yarrow stirs Undergrowth, ab1066)

Working notes per the pr-lifecycle review-round state machine (item 2 tally
store + item 3 expected-reviewer declaration). Untracked working surface;
substance graduates to the thread record at session close.

## Expected reviewer set (declared at harvest, 2026-08-18 ~17:1xZ)

- `copilot-pull-request-reviewer` — repo config fires it on push; requested
  via MCP on #907/#909 at open (binding proven by `review_requested`
  timeline events, Director confirmation 15:5xZ). Re-assesses on demand.
- `mantagen` — Matt's PR Review Warden (agent-authored under MG's account,
  self-declared in each review). NOT on-demand: cure honestly, then dismiss
  the stale round per the dismiss-at-cure path; never request re-review.
- `claude[bot]` — SKIP MARKER this round on all four PRs: org overage spend
  limit (scope-declared: until credits restored; re-check each round).
- `chatgpt-codex-connector` — SKIP MARKER (usage limits; same treatment).

## Round 1 tally (all reviews bind each PR's frozen tip; no pushes since open)

| PR | tip | review findings (threads + bodies) | check legs |
| --- | --- | --- | --- |
| #907 | 3b276f0d6 | 12 (6 Copilot threads + 5 mantagen + 1 mantagen axe-matrix-coverage) | Sonar QG FAIL (21 issues); browser-tests FAIL (specimen creature 320px SC 1.4.10 overflow); run-quality-gates FAIL (aggregate) |
| #908 | a5ccc6ebe | 4 (mantagen body; record-consistency class) | all green |
| #909 | cd84e490c | 6 (2 Copilot threads + 3 mantagen + 1 mantagen test-shape note) | all green |
| #910 | 6e88cb407 | 4 (mantagen body; record-truth class) | all green |

Cross-review dedupe note (#909): Copilot thread `boundary-inventory.ts:107`
and mantagen finding 3 state the same data-only-invariant gap — two tally
rows (different reviews), ONE cure.

CI-failure root (#907): a11y spec `specimen-a11y.spec.ts:143` — creature at
320px, horizontal scroll (SC 1.4.10). Green locally at freeze, red in CI —
reproduce against the built artefact in the lane worktree before curing.
Convergent with the owner's open visual item 3 (hard no-overflow rule);
in-PR cure stays minimal (the failing surface), the rework stays queued.

Scope discipline: the owner's four open visual-feedback items do NOT ride
these cure pushes (a growing round is a routing failure) — they remain the
next execution round after the harvests, per the recorded morning order.
Overlaps (tokens thead ↔ two-column rework; composition control rows) get
minimal in-PR cures only.

## Round 1 disposition worksheet (Phase 4 triage; updated as verified)

Status legend: VERIFY (to check first-hand) / FIX (cure in PR) /
REJECT (with verified reasoning) / TICKET (route + resolve).

### #910 (records-truth)
1. design-system-completion sketch still active + showcase dep — VERIFY
2. rubric v0.1 blocking contradiction — VERIFY
3. DDR-009 false decision text above correction; six-vs-seven widths — VERIFY
4. showcase README claims a motion control — VERIFY

### #908 (tango node + DDR-012)
1. Plan T1c/T2 still describe runtime overlay vs DDR-012 — VERIFY
2. T1a-i simultaneously obsolete/discharged/"landed" — VERIFY
3. T2 dependency graph vs declared edges; "four slices" stale — VERIFY
4. DDR-012 circular authority + missing Provenance section — VERIFY

### #909 (T1a-i)
1. collect-all still throws on fs/manifest shapes; read errors mislabeled — VERIFY
2. whitespace-only licence passes — VERIFY
3. data-only invariant unenforced (also Copilot thread) — VERIFY
4. ADR-041 flat-six claim vs nested tier (Copilot thread) — VERIFY
5. test-shape: pre-decided states vs reachable paths — folds into 1–3 cures

### #907 (demo day)
Copilot threads: narrow faces for four layouts; ExhibitThemeApplier
post-hydration flash; live-token-values head-only observer; focus-ring on
inverted band; useFrameObservedState gap-state; StripThemeApplier
first-paint — ALL VERIFY.
mantagen: scaled-frame target size (2.5.8); tokens thead display:none;
forced-colours radio mark; composition stale accessible content;
colour-matrix label divergence; axe-matrix coverage of new routes — ALL
VERIFY.
Sonar 21 (list: scratchpad pr-907-sonar.txt): mechanical classes (S4666
duplicate selectors ×5, S6754 ×4, S6843 ×3, S6822 ×2, S6772 ×2, S6819,
S6845, S7761, S8786 regex, S6606).
CI: creature 320px overflow — reproduce, cure at source.

## Round 1 dispositions (verified, ~18:5xZ)

- **#910**: all four findings FIX — cured at `4d74164b5` (sketch archived
  with disposition + showcase edge removed; rubric pre-recalibration
  advisory regime stated; DDR-009 decision text re-trued in place, seven
  widths, module comment aligned; README motion proof described honestly).
- **#908**: all four findings FIX — cured at `41db188a0` (DDR-012
  Provenance section with owner verbatim as the durable authority anchor +
  informed_by re-anchored; plan/DDR mechanism reconciliation — completeness
  admission makes the base-fallback path structurally dead, cascade
  position is byte mechanics; T1a-i implemented-in-review status +
  discharged-instruction amendment, readiness record "executed" not
  "landed"; full slice consumption graph declared, six-slice count).
- **#909**: findings 2/3/4 + test-shape FIX — cured at `83c95cc03`
  (licence trim + pinned; closed pack-anatomy leg on contents with
  contract tests for source/config/unadmitted/permitted paths; ADR-041
  nested-tier amendment in both cited places). Finding 1 (collect-all
  fs/manifest failure-as-data) = CLASS P to the NAMED T1b parcel
  (readiness record execution addendum; the fs-adapter injection is what
  makes those script paths honestly testable) — reply cites the home.
- **#907**: all six Copilot threads FIX; all five mantagen findings +
  the axe-coverage note FIX; Sonar 21/21 addressed (S6845 watch item:
  tabIndex now rides role="region" — the WAI scrollable-region pattern;
  if the next scan re-fires it, per-site disposition with that rationale).
  CI root RE-DIAGNOSED with rendered/measured proof: not animation
  timing — the strip's visually-hidden helpers escaped the util-inner
  scroll clip (static positions past the nowrap row → a 312px document
  floor; green under macOS overlay scrollbars, red the moment CI's
  classic scrollbar narrows the layout viewport). Cure: the scroll
  container is now the containing block (`position: relative` on
  util-inner); measured floor after cure ≤296px. The sway-plate inset
  cure stands alongside as the real-user no-preference case (animation
  phase must never extend scrollable overflow). The `.mast`
  duplicate-selector merge fixed a REAL dead-declaration bug (the
  below-strip offset was silently overridden to 0).

## Round history

- **Round 1 CLOSED at ~18:2xZ**: one multi-ref bot push advanced all four
  lanes (gate suite paid once) — #907 `62df2091c`, #908 `41db188a0`,
  #909 `83c95cc03`, #910 `4d74164b5`. Every thread replied-with-evidence
  and RESOLVED (6 on #907, 2 on #909); response comment per PR (author
  read-back: jimbot-oakington-iii[bot] on every write); all four
  mantagen CHANGES_REQUESTED rounds DISMISSED with the cure message
  (dismiss-at-cure path; verified DISMISSED ×4); Copilot RE-REQUESTED on
  #907/#909 (timeline `review_requested` events verified bound); #910's
  PR body scope note updated for the comment-only ts true-up; token file
  deleted. Round-1 tally rows: #907 12→cured, #908 4→cured, #909 6→(5
  cured + 1 Class-P to the named T1b parcel), #910 4→cured.
- **Gateway pass absorbed before the push** (code-expert on opus,
  probe-verified in Chromium): blocker (percentage grid track vs the
  authored-css gate) + items 2/3/4 cured, plus 6/7/8/9/12/13 taken cheap;
  carried residue with named dispositions — three-expressions-of-theme
  logic (item 5, consolidation candidate at the kit), region-landmark
  cardinality on /tokens (item 11 — Sonar S6819 forced the choice; names
  unique via sectionId; watch S6845 at the next Sonar scan), load-listener
  teardown nit (16), cross-document textContent write class (17). The
  forced-colours radio dot is rendered-proof verified (SelectedItem on
  Canvas, screenshot in the session scratchpad).
- Round 2 OPENS when reviewers respond to the new tips. Four pr-watch
  monitors armed (120s, wake-signal only — Phase 3 full harvest on every
  wake). Merge legs remain at the Director's seat at settled; auto-merge
  stays off per the warden's standing ask.
