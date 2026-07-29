# Cricket two-pair tally — operating record (2026-07-26 → 2026-07-29, closed)

Successor to the closed experiment record
[`cricket-ab-tally-2026-07-16.md`](cricket-ab-tally-2026-07-16.md). The owner closed that
experiment 2026-07-25 (~15:06Z, Director card): neither model flipped nor retired — **both
run permanently, always as pairs**; implementation pointered to Linear (MCP-161, minted
2026-07-25). This file is the durable record of pair runs under the permanent regime.
Consolidated 2026-07-29 at owner word ("please bring all the data together", in-session at
the Altair seat) from the comms stream and the napkin; comms events are transport — this
file is the storage.

## Governing words

- **Owner ruling 2026-07-25 ~15:06Z** (final entry of the closed record): both models
  continue permanently, two pairs — one on the current cricket instructions, one focused on
  counterfactuals and adversarial perspectives. The severity-only divergence corpus stands
  as the evidence base; haiku's strict evidence bar is retained as signal inside each pair.
- **Owner standing order 2026-07-25 ~20:57Z** (Director broadcasts 03d1373e, 24aa1766): two
  paired checks at each cycle boundary, at least hourly — one normal pair, one pair prompted
  adversarially (refute that the current work is the right priority against the V1 chain);
  route to the Director only divergent pairs or non-ON-TRACK verdicts, with evidence.
- **Owner directive 2026-07-28 ~21:47Z, verbatim** (event 25a14cfa): "Always run Cricket in
  A/B pairs, and I recommend two pairs, one normal, one adversarial." Director's operational
  reading (attributed to Moon rides Penumbra, not the owner): each cricket moment fires four
  background agents — cricket + cricket-haiku on the standard framing, cricket +
  cricket-haiku with an explicit refute-stance; identical supplied context within each pair;
  divergences route to the Director; results feed this tally.

## Current instructions and configuration (verified first-hand 2026-07-29)

- Claude Code wrappers `.claude/agents/cricket.md` and `.claude/agents/cricket-haiku.md`:
  thin by design — frontmatter config (cricket: `model: sonnet`; cricket-haiku:
  `model: haiku`; both `tools: Read` with Write/Edit/Bash/Grep/Glob disallowed) plus a
  mandatory first-read pointer to the canonical template.
- Canonical templates `.agent/sub-agents/templates/cricket.md` (judgement shape: four
  mandatory questions — CONSUMER / DISPLACEMENT / GATES / PROPORTION — two-Read budget,
  under-200-word output contract) and `cricket-haiku.md` (compiled decision procedure:
  stakes line, intake audit incl. claims-within-items, quote-anchored four questions with
  the PAIR-4 necessity test, total eight-row verdict table, banned gap-bridging vocabulary).
- The adversarial legs have **no dedicated template**: the refute-stance is supplied by the
  dispatcher in the frame, per the Director's operational reading of 25a14cfa. Dedicated
  adversarial agent definitions remain the unbuilt MCP-161 implementation item.
- **Drift finding (named, not silently fixed):** the haiku surfaces still describe the
  CONCLUDED experiment — `cricket-haiku.md` template §Delegation Triggers says
  "EXPERIMENTAL VARIANT under evaluation… If this variant wins the evaluation window it
  becomes the cricket", and the wrapper description says "testing whether Haiku can match
  the sonnet cricket". Both are stale against the 2026-07-25 permanent-regime ruling;
  re-true belongs with MCP-161's implementation scope.

## Interregnum run — 2026-07-26 ~15:20Z (Director seat, three perspectives)

Owner-directed: three maximally-separated perspectives (release-clock, teacher-value,
practice-health), each an identical-context sonnet+haiku pair. Source: napkin 2026-07-26
block; the cross-perspective convergent finding routed via event b0f13619 → MCP-185.

| Perspective | Sonnet | Haiku | Adjudication |
| --- | --- | --- | --- |
| release-clock | ON-TRACK | ON-TRACK | Convergent. |
| teacher-value | DRIFTING | WRONG-PRIORITY | Same-direction over-grade: the haiku's WRONG-PRIORITY rested partly on a pedantic GATES fail, yet contributed a real cure the sonnet missed (only one of two critical-path lanes named in the recovery window). Grade with the sonnet; adopt the haiku's cure. |
| practice-health | DRIFTING | DRIFTING (label only) | Not evidence-convergent: the perspective deliberately withholds an objective frame, so the compiled procedure graded CONSUMER/DISPLACEMENT UNVERIFIABLE and derived DRIFTING from frame absence. Reading rule established: check the procedure's preconditions were satisfiable by the supplied frame before counting a haiku verdict as independent confirmation — frame-free perspectives are outside the compiled procedure's domain. |

Convergent finding across the teacher + practice lenses: the comms-watcher failure loop was
being absorbed by re-arms instead of a fix — routed with wedge evidence as MCP-185.

## Two-pair directive era (2026-07-28 evening →)

Verdict key: ON = ON-TRACK, DR = DRIFTING, WP = WRONG-PRIORITY. Columns: sonnet-normal /
sonnet-adversarial / haiku-normal / haiku-adversarial.

| # | Seat, moment (event) | S-n | S-a | H-n | H-a | Divergent? |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Moon (Director), Thursday-prep routing, 2026-07-28 ~21:50Z (a8db83ae) | ON | ON | ON | DR | yes |
| 2 | Raccoon, MCP-241 PR-B mid-diagnosis, 21:53Z (028c1ac2) | ON | ON | ON | DR | yes |
| 3 | Schooner, MCP-333 lane, 21:59Z (c6e05a06 §cricket) | ON | ON | DR | DR | yes |
| 4 | Altair, #582 merge-runbook wait, 22:19Z (890d23a1) | ON | ON | ON | DR | yes |
| 5 | Moon (Director), handoff-state boundary, 22:56Z (988db362) | ON | DR | DR | DR | yes |
| 6 | Altair, #620 endgame, 2026-07-29 07:11Z (0e05c32f) | ON | ON | ON | ON | no — first fully convergent run |
| 7 | Raccoon, MCP-338 lane-open, 07:20Z (90da287f) | DR | ON | ON | DR | yes — new axis |
| 8 | Schooner, trio-lane boundary, 08:14Z (3ad438ea) | ON | ON | ON | WP | yes |
| 9 | Schooner, identical re-ask addendum, 08:16Z (63245cc1) | — | — | ON→DR | — | flip-flop, new signal |
| 10 | Altair, this consolidation, ~08:30Z (tally event follows) | ON | ON | ON | ON | no — second fully convergent run |

Run notes and adjudications:

1. **Moon run-1**: pair-1 convergent; adversarial sonnet's redirection (put the
   Thursday-prep disposition on the record) executed at d6b9f29e. Haiku-adversarial DRIFTING
   via its Row-5 rule on frame incompleteness — the grounding existed in the owner
   conversation but not the frame. Calibration note: the same detection surfaced as a
   VERDICT from haiku and a REDIRECTION from sonnet — different severity mapping, no
   manufactured drift.
2. **Raccoon run-1**: haiku-adversarial leg (a) PARTIALLY UPHELD (the owed reflective
   harvests were then delivered — the check moved work forward); leg (b) refuted on the
   record. Pattern named: haiku's mechanical rows price supplied-frame completeness where
   sonnet prices the work itself.
3. **Schooner run-1**: both haiku legs DRIFTING on frame completeness (record-truing read
   as ceremony; a non-gate read as a gate — refuted by the Director's ruling clause plus
   first-hand confirmation). Adversarial sonnet's redirection adopted: prove the head clean
   before writing corrections.
4. **Altair run-1**: haiku-adversarial DRIFTING REFUTED on transcript evidence — the
   "unverified" measurement was first-hand and pre-disposition; the haiku judged the word
   "measured" as assertion because it cannot see tool transcripts (fourth same-night
   instance of the frame-grounding mode). One convergent sonnet redirection absorbed as
   doctrine: deadline-bound event waits declare a time-fallback at arm time. Pair-1 flagged
   the Copilot-selective-vs-full-condition tension → closed by Director clarification
   d8970d02.
5. **Moon run-2** (1 ON / 3 DR): convergent CROSS-TIER redirection — sonnet-adversarial and
   haiku-normal attacked the same needless gate ("write the durable handoff only when the
   board is fully quiet"); executed in real time. Haiku-adversarial's MCP-334 challenge was
   legitimate: the hold lacked stated forcing facts, which were then stated (no schedule
   pressure; shared-substrate wants a claim-holding seat; tier economy). Remaining DRIFTING
   substance was frame-grounding strictness. Calibration: the adversarial stance catches
   real sequencing defects the normal stance passes — the two-pair shape earned its cost
   twice in one night.
6. **Altair run-2** (4/4 ON): the frame carried PROVENANCE for its conditions (who ruled
   what, when, by event id) per the run-1 cure — and the haiku frame-grounding DRIFTING
   mode, fired in all three prior fleet runs, did not fire. The dispatcher-side cure
   validated. One redirection absorbed: spot-check scope-rule applications at adjudication
   time.
7. **Raccoon run-2** (DIVERGENT 2/2, new axis): the split was normal-vs-adversarial WITHIN
   each model, not haiku-vs-sonnet — sonnet-normal's DRIFTING was wrong (its own adversarial
   leg tested and rejected the same refutation). Cause: one compressed frame sentence mixing
   absorbed scope with routed-away findings. Cure absorbed: frames carry ABSORBED scope and
   ROUTED-AWAY findings as two labelled lists, never one sentence. Two further cures:
   prose-expert dropped from a docs review set as unforced ceremony; the one contestable
   classification delegated to test-expert by name with the independence concern stated.
8. **Schooner trio run**: haiku-adversarial WRONG-PRIORITY on three grounds, all failed on
   first-hand adjudication (the deep-read WAS the pickup instruction; the trio batching IS
   the route's priority ruling; the pre-execution code-expert review is a standing rule
   outside the frame). Endorsed by the sitting Director (a174d253) with the principle stated:
   **a verdict cannot fault compliance with a standing rule its own frame omitted.**
9. **Schooner addendum — NEW SIGNAL**: the haiku-normal seat issued a second, contradictory
   verdict on an identical re-ask (ON-TRACK → DRIFTING, same context, same already-refuted
   ground). First recorded instance of haiku verdict instability across identical re-asks;
   the sonnet pair was stable. n=1 — watch for recurrence; if it recurs it is a
   template-review trigger.
10. **Altair consolidation run** (this file's own cycle, 4/4 ON): second fully convergent
    run on a provenance-carrying frame. The normal sonnet's redirection was absorbed into
    this file (the Coverage section below); the adversarial legs tested displacement of the
    armed MCP-303 hold, seat-ownership, and write-scope refutations — none survived the
    cited provenance.

## Standing patterns (the regime's current calibration)

1. **Haiku legs price supplied-frame completeness; sonnet legs price the work itself.**
   Recurring across runs 1–5 and 8, continuous with the closed record's 2026-07-20 corpus.
   Not a defect — the compiled procedure behaving as designed; the cure sits with the
   dispatcher.
2. **The frame-provenance cure is validated**: frames citing ruling events by id (who ruled
   what, when) eliminated the haiku frame-grounding DRIFTING mode (runs 6 and 10, against
   runs 1–5). Standing dispatch discipline for every seat.
3. **The adversarial stance earns its cost**: it caught a real needless gate (run 5) and
   correctly rejected a refutation its own normal leg fell for (run 7).
4. **Severity mapping differs by tier**: for the same detection, haiku emits a verdict where
   sonnet emits a redirection (run 1). Read paired verdicts accordingly.
5. **Adjudication principles now standing**: a verdict cannot fault compliance with a
   standing rule its frame omitted (run 8, Director-endorsed); check the compiled
   procedure's preconditions were satisfiable before counting a haiku verdict as independent
   confirmation (interregnum pair 3).
6. **Open signal**: haiku verdict instability on identical re-asks (run 9, n=1).

## Doctrine cures absorbed this era

- Deadline-bound event waits declare a time-fallback at arm time (run 4, convergent;
  applied live by Raccoon at #621, event 7a4b9e34).
- Cricket frames carry provenance (ruling event IDs) for every condition they state (runs
  4→6).
- Frames separate ABSORBED scope from ROUTED-AWAY findings as two labelled lists (run 7).
- Carried forward from the closed record: frames define drive-specific vocabulary that
  collides with quoted owner directives (class cure v4).

## Coverage

All 28 post-close cricket-mentioning comms events (live stream + archive,
2026-07-25T15:06Z → 2026-07-29T08:25Z) were read in full for this consolidation. Ten carry
pair-run data and are consolidated above (a8db83ae, 028c1ac2, c6e05a06, 890d23a1,
988db362, 0e05c32f, 90da287f, 3ad438ea, 63245cc1, b0f13619) together with the napkin's
2026-07-26 block. Four carry governing words or adjudications and are cited in context
(25a14cfa, 03d1373e/24aa1766, a174d253, d8970d02). The remaining events reference the
cricket mandate without pair data — team starts and Moment-2 acknowledgements re-affirming
the standing order (40d65e3c, 52efc567, f6f3df3a, 2f3d2101, 735d63ea, f1d9a6f2, 7df5649e),
closeouts and freezes noting cadence state (7c9c5fa7 which records MCP-161's minting,
a22fe0a2, 33711fc8 which owns a cadence miss, 6b3931cd), and outcome events already cited
(d6b9f29e, 7a4b9e34) — nothing with verdict data is omitted.

## Maintenance

Assembled 2026-07-29 ~08:40Z by Altair turns Infinity (7a97a1) at owner word. This
record is CLOSED (see Succession below): quartet-era runs post the tally comms event at
occurrence (transport) and append to the successor record
[`cricket-quartet-tally-2026-07-29.md`](cricket-quartet-tally-2026-07-29.md) (storage) —
the transport/storage split remains the Director's ruling a174d253. Nothing further is
appended here.

## Succession

The two-pair era closed 2026-07-29 at owner word: the unit widened from the A/B pair to
the A/B/C/D quartet (Fable-low / Opus-medium / Sonnet-high / Haiku-xhigh, two stances
per moment). The successor operating record is
[`cricket-quartet-tally-2026-07-29.md`](cricket-quartet-tally-2026-07-29.md); this file
is closed history — the calibration patterns above carry forward as the quartet's
baseline.
