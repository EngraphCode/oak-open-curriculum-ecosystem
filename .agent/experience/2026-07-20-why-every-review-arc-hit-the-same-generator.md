# Why every review arc hit the same generator

**Retrospective on the 2026-07-20 AIP-137 / net-to-zero merge drive**, commissioned by
the owner at arc close ("run the retrospective") and run per the Resonance
`retrospective` skill (read first-hand from the sibling estate; its import is AIP-142).
Author: Galago stirs Grotto (`60d988`), the drive's mid-day Director (seat held
08:01:08Z → 12:46:59Z), written immediately post-succession. Method: reconstruction from
primary sources only (comms event ids, merge SHAs, PR tallies — every number re-derived
from its in-context first-hand read at writing); causal stack; same-arc counterfactuals;
honest credit; proposals with warrant + falsifier each.

## The arc, from primary sources

One day, one directive lineage ("drive all PRs to merge" → "net reduce open PRs to
zero"), two full generational rotations of the whole agent cast (Flame→Galago→Forge on
the Director seat; Caracal/Salmon/Harrier → Heron/Zenith/Moth → Foehn/Eagle/Goshawk on
the lanes — five PDR-063/064 successions, zero dark windows, zero claim collisions).
Seven PRs merged by 12:43Z (#422 07:58 pre-tenure; #423 09:53:52 `dbfc765dd`; #427
10:47:54 v1.77.0; #424 12:17:52 v1.77.1; #420 12:41:20 `feae1dc6c`; #426 12:42:38
`844cc28a5`; #428 12:42:53 `3e2041e27`), two dependabot PRs closed on owner word, and
the integration-goal PR (#413) granted its final cycle at 12:46Z. Under the throughput:
**seven review arcs across five document classes hit the same wall** — repeated
review-round non-convergence traced, on every single occasion, to one generator.

## The causal stack

**Technical root.** Documents entering review asserted *closed-world* facts over
*moving or open* surfaces: a closed count of functional token values (#424, falsified),
then a closed CLASS-SET of the same (#424 again, falsified within one round — the
terminal firing); a "global" colour-role audit whose scope silently excluded the
stylesheet's own rules (#413 — the `::selection` polarity member fired the terminal); an
appendix claiming to be "the instance inventory" (#414); pinned argv and proof commands
for cycles that had not yet run (#426 — nine findings in one round, largely falsifying
the seat's own earlier cures); present-tense statuses of in-flight PRs (#424, #426,
mechanical). Per-push bot review re-reads every claim against the surface as it now is;
each round therefore falsifies another member; the arc cannot converge while the claims
stay closure-shaped.

**Process root.** The pr-lifecycle state machine detects non-convergence (its tally +
step-back arms did fire, correctly, seven times) — but only after 3–4 settled rounds of
cost, and nothing at AUTHORING time blocked the claims. Worse, the cures themselves
regenerated the disease one level up: #424's count-kill produced a closed class-set;
#426's proof-kill had produced the pinned argv; the Director's merge-wall diagnosis
replaced open reading with closed named-failure-class matching (three evidence errors —
a jq-filtered rules read, abbreviated-SHA query artefacts treated as evidence, serial
class-matching — resolved in about one minute by the owner reading the merge box: GitHub
Code Quality had been re-enabled). **The generator survives kills by climbing one
abstraction level.** That sentence is the mechanism this estate did not previously have
words for.

**Meta root (where the stack stops).** Closure reads as rigour. Seats, reviewers, and
the doctrine corpus itself reward definite, complete-sounding statements; the corpus's
own catalogue of named failure classes invited closed-set matching in diagnosis. The
estate's cure-shaped rule existed (`no-moving-targets-in-permanent-docs`) but bound only
permanent docs — not reports, PR narratives, plan proof clauses, or reasoning. The next
"why" (why fluent generators reward closure) leaves the estate's control.

## The counterfactual test (cured segments of the same arc)

- **Slot grants.** Pre-predicate: one grant (08:52:00Z) on a CLEAN-moment read — Copilot
  wave 3 landed 21 seconds later, the executing seat fired the merge on the grant, and
  only a harness classifier denial prevented a premature merge. Post-predicate
  (adopted 08:58Z, binding every later grant): **six landings, zero races**. Unit cost
  of the cure: one compound recompute plus a ≥10-minute quiet window per grant.
- **Review rounds.** Instance-scoped cure segments ran 4–5 settled rounds without
  converging (#413 epoch-2: 3→1→3→4→5). Generator-kill segments of the *same PRs*
  converged in 1–2 rounds (#423 post-kill 1→0 terminal; #414 post-kill 2→pending-zero;
  #413 post-audit reached its disposition exit). Same documents, same reviewers, same
  day — the only changed variable was killing the class instead of the instance.
- **Diagnosis.** ~20 minutes of closed-set matching with three evidence errors versus
  the owner's ~1-minute open read of the vendor UI.

## Honest credit (what the cost bought)

The price was real: roughly ninety minutes of review-round churn across the arcs, one
near-premature merge, and a Director diagnosis spiral. It bought: the settled-round
predicate as standing machinery (provenly race-free); the six-firing generator corpus —
strong enough evidence to legislate on; the state machine exercised through its FULL
ladder including both terminal arms and the discovery of the count-arm's singleton-noise
blind spot (#426's false refire, then its true guard fire two rounds later); three
frictions registered with founding instances (F-146 heartbeat-firehose, F-147
knip-crash-reads-as-pass, F-148 heartbeats-during-suspension); five clean successions
proving the rotation machinery at scale; and seven merged PRs including the design
system's build-time contrast gate and the kit's zero-network surface.

## Proposals (warrant + falsifier, each; routed via this estate's lanes — fast =
## consolidation-pass rule/skill amendments, slow = PDR-class)

1. **[FAST] Authoring-time open-set clause** on `no-moving-targets-in-permanent-docs`,
   extended to every prose artefact entering review (reports, PR narratives, plan proof
   clauses): open sets are stated as classes-with-exemplars; counts and closure claims
   are non-load-bearing by default. *Warrant*: six firings, five document classes, one
   identical cure. *Falsifier*: a post-clause review arc still non-converging on
   closure-class findings.
2. **[FAST] Step-back arms distinguish generator recurrence from singleton noise** (a
   pr-lifecycle amendment): the arms fire on classified generator recurrence; nit-class
   singleton streams route to a coverage-noise assessment instead of terminal
   escalation. *Warrant*: the #426 false refire (five distinct mechanical singletons)
   against its true guard fire (nine findings, one generator) two rounds later.
   *Falsifier*: a real generator presenting as singletons and slipping the classifier.
3. **[FAST] The settled-round predicate graduates into pr-lifecycle** as the routing
   layer's grant gate (a grant is issued only on the state machine's item-4 settled
   verdict; the executing seat still recomputes at the boundary). *Warrant*: one race
   in the pre-predicate segment, zero across six post-predicate landings. *Falsifier*:
   a predicate-compliant grant racing a composing round — the 10-minute window is
   empirical, not proven.
4. **[SLOW, PDR-class] Diagnosis discipline — governing surfaces are read whole and
   unfiltered before hypothesis-matching, and named-failure catalogues are open sets.**
   *Warrant*: the merge-wall spiral versus the merge-box read; independently, the
   cricket-haiku's evidence-demand catching a factual double-count the fluent judge
   bridged over (the A/B tally's first substantiated fact-catch). *Falsifier*:
   unfiltered-first reads costing more than they save across a run of diagnoses.
5. **[ROUTED already — named for completeness, not re-proposed]**: AIP-142 (the
   Resonance wrap-family import, scope closed over its reference graph); F-146/147/148;
   the dedicated consolidation (owner-named when wanted — the napkin is over threshold
   and three retired-seat Layer-3 records plus the Director's await integration).

## Success test

Proposal 1 carries the arc's named mechanism ("closure claims survive kills by climbing
one abstraction level") — if none of 1–4 graduates, is killed, or changes a decision at
the consolidation pass, this record was a eulogy and should be said so there.

*Addenda land additively below this line; the record is never rewritten.*

## Addendum (2026-07-20 ~12:58Z, same author) — the seventh firing, and the play harvest

**The seventh firing was this record's own author, within the hour.** The wrap-family
import sweep declared "the graph closes cleanly" after a link-shaped regex pass; the
owner then asked "I believe there was also a Decide workflow?" — and `decide` (plus its
`decision-matrix` rule, 317 lines, no oak equivalent) was in the graph all along, cited
by `skill-composition` and routed-to by `free-play`, invisible to a regex that only
matched markdown link paths. A closure claim over an open set, falsified by outside
eyes — exactly the record's mechanism, exactly the external-bound error signature the
wrap record told successors to point scrutiny at (this seat's confident composite
reads). AIP-142 is corrected and now instructs its integrator to re-sweep at import
time and treat the list as exemplars of an open set. Proposal 1's warrant gains a
seventh instance, and proposal 4's ("read whole surfaces unfiltered before
class-matching") gains its cleanest possible demonstration: the sweep filtered by
pattern instead of reading.

**The free-play pass** (run per the Resonance skill at owner word: time-boxed wander
over the day's material, no target; harvest under the confabulation guard —
associations, never findings; discards visible):

- KEPT — *the day's failures look shaped alike*: heartbeats emitting after their
  reasoning loop stopped (F-148), claims read as live after their surface moved (F-44
  kin), a grant read as act-now after the state moved (the near-miss), a "closed graph"
  asserted after one regex pass. These remind me of one shape — **assertions detaching
  from their referents and continuing to run** — and every cure the estate reached for
  was the same move: re-verify at the moment of use. An association with a growing
  shape; routed to concept-exploration at the consolidation pass.
- KEPT — *pre-authorisation as the day's tempo source, and its twin hazard*: the
  bounded exits, pre-ruled outcomes, and pre-positioned standbys moved adjudication
  ahead of need and produced the 90-second post-landing merges and the zero-gap
  successions; the one near-bad-merge came from the same lever read without an expiry
  (a grant treated as unconditioned authorisation). "Pre-authorisation wants its
  recompute condition attached" — the same shape as the first seed, from the other
  side. Routed with it.
- KEPT (small) — *the up-to-date treadmill inverted*: read backwards, the annoying
  policy is verify-at-use mechanically enforced — it refuses stale assertions at the
  merge boundary; the pain was parallelism against it, not the policy. Napkin-seed
  grade; rides here.
- DISCARDED (visibly, per the guard): an attempted association between the agents'
  generated names and their roles — forced; nothing there.

The recursion note: this addendum re-finds the record's own named classes operating on
its author — which is the mechanism working, not a new loss class. The record stands.
