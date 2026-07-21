# PDR-132 delivery notes — a changeset that obeys its own doctrine (2026-07-20)

Owner commission (21:56Z): "fully plan the delivery, I would say fast lane, and
then deliver it fully, keeping notes on the experience as you go, so it becomes
a meta example of itself." Deliverer: Forge rides Brimstone (398e24), Merge
Specialist. This file is both the plan record and the running experience log;
entries are timestamped and never rewritten.

## The plan (authored 21:56–22:00Z, pre-Director-gate)

**Goal (scope-from-goal):** round-count is bought at authoring time; make the
estate's planning and PR doctrine say so once, canonically, with pointers — so
the shaping principle reaches work BEFORE the PR exists.

**The changeset (predicted, the self-test):**

| # | File | Change | ~lines |
|---|------|--------|--------|
| 1 | `practice-core/decision-records/PDR-132-changeset-health-round-budgets-bind-at-authoring-time.md` | NEW: model, budget, smells, class exemption, Goodhart caution, prediction+falsifier | ~60 |
| 2 | `practice-core/decision-records/README.md` | index row | 1 |
| 3 | `skills/pr-lifecycle/SKILL-CANONICAL.md` | state-machine section: round-budget expectation note (budget-exceeded at round 3 pre-empts the round-4 arm) + silent-wait sweep clause (reviewer-requested after push; checks green after arm; every PR named a shepherd) + PDR-132 pointer | ~14 |
| 4 | `skills/plan/SKILL-CANONICAL.md` | Requirements for All Non-Trivial Plans: executable steps sliced to PR-shaped units at plan time (changeset class named; stateable as a ≤2-round PR or under-decomposed) + pointer | ~8 |
| 5 | `skills/start-right-team/SKILL-CANONICAL.md` | foundation reading list: PDR-132 pointer | ~2 |
| 6 | `reports/agentic-engineering/pr-latency-7d-2026-07-20.csv` | track the evidence snapshot (89 rows) | ~90 |
| 7 | `reports/agentic-engineering/pr-latency-7d-analysis-2026-07-20.md` | track the analysis (already authored) | ~55 |
| 8 | this file → `reports/agentic-engineering/pdr-132-delivery-notes-2026-07-20.md` | the meta-example record | ~55 |

**Predicted totals: 8 files, ~285 additions, 1 story, opened at 1–2 commits,
round budget ≤2.** Every number is inside the doctrine's own thresholds — the
delivery is the doctrine's first test case, recorded here as it runs.

**PDR-130 lane:** FAST (owner word 21:56Z: "I would say fast lane").
**Prediction line:** with round-budgeted slicing referenced from plan-time,
median commits-per-PR (rounds proxy) falls for code-class PRs born after this
lands, visible in the pr-throughput register within one month. **Falsifier:**
if median rounds-per-PR does not fall — or plan-time slicing produces
fragment-PR churn (integration cost exceeding round savings) — the plan-skill
slicing requirement reverts to advisory and this PDR records it.

**Sequencing:** (1) Director gate on this plan (owner instruction; also folds
the new PR into the endgame board). (2) Linear ticket (ticket-first). (3)
Fresh worktree off origin/main; author 1–8; markdownlint + affected checks
locally. (4) One commit, push, PR with AIP ref in title, request Copilot,
verify request registered (tonight's silent-wait lesson applied at birth). (5)
Shepherd rounds per the state machine, budget ≤2, notes here per round. (6)
Settled-READY → arm under the standing drive grant → Phase-8 → close ticket.
**Interleaving:** my #448/#450 merge-tail duties continue; monitors interrupt
this work, never the reverse.

**Named risks:** comms content gate on doctrine vocabulary (worked instance
21:40Z: "carve-out" blocked; cure = neutral phrasing); moving-target hook on
PDR prose (cure = durable facts, no event ids); the notes file and the PDR
citing each other is a cycle only in narrative, not in authority (PDR is the
doctrine; this file is evidence); the plan-skill edit must not restate the
budget numbers (pointer only — consolidate-at-second-consumer is the point).

## Experience log (append-only below; predicted-vs-actual per step)

- **21:56–22:00Z, planning + gate.** Plan authored in one pass; predicted-vs-
  actual table opened. Before the Director gate even cleared, the merge tail
  interrupted exactly as the plan's interleaving clause predicted: #450's
  round trajectory hit 2→5→6 and fired the mechanical step-back — so the
  gate message to the Director carried two items (step-back verdict + this
  plan) instead of one. Datum for the doctrine: round-budget breaches arrive
  on the *reviewer's* clock, not the author's — a shepherd cannot schedule
  around them, only classify fast. Also a live specimen of WHY the budget
  matters upstream: #450's r2 cure text was authored under ruling pressure
  without cross-doc consistency checks, and round 3 is the bill.

- **22:02–22:08Z, authoring.** Ticket AIP-156 opened first (In Progress at
  creation — lead will equal cycle, the discipline the Linear data showed).
  Worktree cut from main at 1.79.1. Predicted-vs-actual surprises so far:
  (1) main's pr-lifecycle text differs from the coordination branch's — the
  anchor I planned against (a clause riding the unmerged #434) does not
  exist on main, so the state-machine edit re-anchored to main's actual
  text; the doctrine lesson is that pointer-edits authored against a branch
  you are not landing on are unverified assertions until grepped on the
  target base. (2) The PDR-131 README row is also not on main yet — the
  PDR-132 row appends after PDR-128 and the later #434 merge will union
  them. (3) The plan-skill list had 7 requirements, not 4 — the plan's
  "~8 lines" prediction for that edit held, but only because the edit was
  pointer-form; a restating edit would have ballooned. Files 6–8 rode as
  copies, zero authoring cost.

- **22:08Z, opening snapshot (the promised actuals).** PR #451 opened: 8
  files (predicted 8 — exact), 330 additions (predicted ~285 — over by 45,
  all of it this log's own growth), 1 commit at open, Copilot requested
  with the request-leg verified by watch. Warning-threshold disposition:
  330 crosses the >300-additions smell; re-examined for hidden second
  stories per the doctrine — verdict: one story (the doctrine and its
  evidence), archival-heavy mix (145 of the additions are the CSV +
  analysis evidence, record-class), no split. The round budget carries
  the real test.
- **22:46–23:05Z, round 1: ten findings, and the changeset failed its own
  doctrine three ways.** The named plan risk ("the skill edits must not
  restate the budget numbers") HAPPENED ANYWAY — both pr-lifecycle
  insertions and the plan-skill item hard-coded two/three; cured to
  symbolic PDR references. Also caught: a portability-rule violation (the
  Core PDR cited host-local report paths), an unobservable falsifier (it
  named register dimensions the register does not record — cured to the
  corpus-methodology re-run with the register extension as a named
  follow-up), a mediation over-claim and undefined thresholds in the
  analysis (cured with reproducible definitions and a reverse-path
  caveat), a window mislabel (~7.5 days labelled 7d — defined, not
  recomputed), an instance/class count error (four instances, three
  classes), and this log missing its own promised opening snapshot (the
  entry above, appended in the same cure batch). Meta-lesson for the
  doctrine: naming a risk in the plan does not prevent it — only a
  mechanical check does; a future candidate is a pre-open grep for the
  budget literals outside the PDR.

- **2026-07-21 ~05:40Z, seat closeout (banked, not finished).** The fleet gh
  token went invalid at ~00:02Z, freezing every review clock; the board
  ended entirely owner-gated and the Director called WRAP GO. #451 state at
  the freeze: round-1 cures pushed (1f678e7fe), 6 threads shown unresolved
  by the last authenticated read — resolution attempts during the outage
  could not be verified, so the round-2 verify re-runs first-hand at gh
  re-auth. The ≤2-round self-test is therefore UNRESOLVED at this seat's
  close — honestly recorded as the doctrine demands, not scored optimistic.
  Seat misses recorded for the meta-example: a ~30-minute harvest-act gap
  on a round already read; a card-answer (owner decision) relayed hours
  late; gh polls left running ~5h into a stop order while heads-down. One
  generator: event-driven wake breaks silently when the seat's main loop
  is saturated — the silent-wait class applies to SEATS, not just PRs.
  Successor instruction: at re-auth, re-verify #451 threads first-hand,
  finish the round, arm at settled-READY under the standing grant.

- **2026-07-21 05:43Z, round 2 verified at re-auth: 6 findings — BUDGET
  EXCEEDED, recorded per the doctrine's own transition.** The self-test's
  verdict is a fail-and-learn: round 3 now opens, so the generator question
  ran immediately (the budget's designed effect, and it caught something).
  Generator classification: findings 1+4 are the SAME restatement/
  single-source generator that round 1 cured at the skill surface — it
  survived at the PDR-vs-analysis and PDR-vs-log surfaces, confirming the
  round-1 meta-lesson (vigilance does not kill this class; a mechanical
  pre-open check for budget literals and claim-strength drift across
  surfaces would). Findings 2+5 are one cross-branch dependency generator:
  the PDR cited sibling doctrine (PDR-130/131) present in the author's
  coordination context but absent from the landing base — the same class
  as the round-1 "anchor authored against a branch you are not landing
  on" surprise, now at the citation level; cured by making both references
  self-contained. Finding 3 (archival over-budget had no defined action)
  and finding 6 (Linear evidence not reproducible from the changeset,
  cured by conserving the 26-issue timestamp CSV) are singletons. Doctrine
  candidate for the weekly read: a pre-open mechanical sweep — grep budget
  literals outside the PDR, verify every cited decision record resolves on
  the LANDING base, verify every quantitative claim's evidence file rides
  the changeset.
