# F8 discriminating experiment — v1 (FINAL: arm ii complete; arm i unrunnable at the 3-attempt bound)

Author: Vole hunts Perch (36c6ca), restatement-audit seat. 2026-07-16. Spec: bound
`v2-spec.v1.md` §6. Status: FINAL — arm (i) declared UNRUNNABLE-UNDER-HARNESS after
3 attempts with 3 distinct failure mechanisms (detail below); the §6 read stands on
arm (ii) + the pilot, with arm (i)'s effort-discriminator question recorded as OPEN,
not answered.

## Design (as executed)

Both arms re-run the pilot's 8-file canary window against the pinned tree
`SHA:c01e46b0a`, read from a detached worktree (6 of 8 live window files had drifted
from the pin at dispatch time — the pin is honoured by construction). Preflight: key
v1.1, 13/13 line-anchored instances exact-match [measured, 2026-07-16 ~14:24Z].

- **Pilot (baseline)**: 1 window × 8 files, sonnet/low — 62 instances (run
  `wf_bda50d7b-7a3`, stale-tree caveat recorded in the corrected scorecard).
- **Arm (i)**: 1 window × 8 files, sonnet/HIGH. Treatment applied as a one-literal
  local build modification (`effort: 'low'` → `'high'` in `map.workflow.ts`; artifact
  verified to carry it; source reverted clean — the knob is not landed code).
- **Arm (ii)**: 8 windows × 1 file, sonnet/low (pure run-data change).

Documented deviations from pilot conditions, identical across arms (so between-arm
comparisons are unconfounded; pilot-vs-arm comparisons carry them): absolute paths into
the pinned worktree in the window lists; the pinned tree itself (the pilot read a stale
live tree).

## Arm (ii) results [measured]

Run `wf_05320b61-258`: 8/8 windows complete, `mapComplete: true`, zero agent errors,
269,716 subagent tokens, 5.8 min wall.

- **Gross recall: 250 instances vs the pilot's 62** on identical files, prompt, model,
  and effort — the window-capacity variable alone quadruples extraction mass.
  Per-window: F8B-1 37, F8B-2 33, F8B-3 20, F8B-4 21, F8B-5 29, F8B-6 41, F8B-7 41,
  F8B-8 28.
- **Key-anchor recall: 8/10 line-anchored key instances hit within ±2 lines** (join on
  basename + line window; the finders reported mixed path shapes — some repo-relative,
  some bare basenames — an output-hygiene defect worth a prompt clause, noted below).
  K1 ×2, K2 ×4, K3 ×7, K4 ×15+1, K5 ×15, K6 ×4+9 hits.
- **Persistent misses, both the SAME class**: K7
  (`comms-all-channels-watcher.md:91`, "opts into the legacy narrow view" — a
  behaviour claim mid-paragraph) and K8 (`repo-continuity.md:302`, "Reactivation is
  owner-directed." — a trailing three-word sentence). Both are dense-prose claims with
  no status-word or numeric surface marker; the finder extracted instances at lines
  83–121 and 292–297 around them and skipped both. The dense-prose miss class
  SURVIVES per-file dispatch at low effort.

## Arm (i) results: UNRUNNABLE-UNDER-HARNESS [measured, 3 attempts]

- Attempt 1 (`wf_e5d164e3-158`): harness-level safety-classifier block at dispatch,
  0 agents ran; the completeness envelope correctly returned `mapComplete: false` /
  0 instances — the first live exercise of the review-round honesty machinery.
- Attempt 2 (resume of the same run): agent WEDGED mid-run — 230KB transcript, then
  26 minutes silent, journal `started` with no `result`; stopped via TaskStop.
- Attempt 3 (fresh run `wf_fafcd340-d6b`): agent completed the full read phase
  (101,057 tokens, 9 tool uses, 465KB transcript, 16.6 min) and died with "API Error:
  Server error mid-response" while emitting the structured output; envelope again
  honestly `mapComplete: false` / 0 instances.

Three attempts, three distinct mechanisms, all on the 8-file concatenated window at
effort high; arm (ii) processed the SAME content as 8 per-file windows with zero
errors. Whatever effort buys in structural reading, the delivery vehicle (one agent,
one big window, one huge structured output) is the failure surface. The 3-attempt
bound (declared in advance, loop-exit-criteria discipline) fires: no fourth attempt.
Attempt 3's transcript survives for forensics; its mid-stream extractions are NOT
salvaged into results — they never passed the schema boundary.

## Pair-refutation amendments (2026-07-16, Director's five corrections adjudicated)

Corrections 1, 3, 4 ACCEPTED and applied below; 5 PARTIALLY accepted; 2 REFUTED with
citation. Record: (1) "capacity-DOMINANT" softened — arm (i) delivered no recall, so
the defensible claim is "capacity has a large measured effect; effort unmeasured".
(2) REFUTED: the pilot's map-stage token cost IS on the record — 100,727 tokens,
measured and cited twice in the ARC channel by the Director (11:56 measured-basis
line and the ceiling recompute); the ~2.7× uses that figure vs arm (ii)'s 269,716
(journal, run `wf_05320b61-258`), and there is no contradiction with the 4.6M
projection, which is linear in FILES (137/8 × 270k), not instances. (3) ACCEPTED —
pilot-vs-arm-ii carries the tree-pin confound (6/8 files drifted); the WITHIN-arm
key-anchor recall (8/10 at the pin) is the unconfounded measurement. (4) ACCEPTED —
"one class" was post-hoc at n=2; the drill stands, phrased as a candidate class.
(5) PARTIAL — the 3-attempt bound's pre-declaration is this report's own draft status
line (written before attempt 3 completed); bookkeeping corrected to three attempts
across two run ids; the reliability note downgrades to one genuine wedge + two
likely-transient API failures. Journals: session dir
`subagents/workflows/wf_05320b61-258/journal.jsonl` (arm ii),
`wf_e5d164e3-158/` and `wf_fafcd340-d6b/` (arm i attempts).

## §6 read (FINAL, as amended)

1. **Capacity/window-size has a large measured effect on gross recall (effort
   unmeasured — the accepted correction bars a dominance claim)** — cure: window arithmetic (smaller
   windows; per-file at the limit), with the spend consequence explicit: arm (ii) cost
   ~270k tokens vs the pilot's ~101k for the same files — ~2.7× per unit corpus.
   Extrapolated to the T3+U corpus (137 files), per-file dispatch at this rate is
   ~4.6M tokens for map alone against the 6M ceiling — window arithmetic must find the
   recall/cost knee, not default to per-file.
2. **A structural residue is real and survives capacity**: the dense-prose class (K7,
   K8) needs prompt/second-pass machinery regardless of windows — spec §7's
   multi-fact sentence drill should gain a dense-prose drill (claims without status
   words or numerals: behaviour claims, short imperative statements).
3. **Output hygiene**: finders report file paths inconsistently (repo-relative vs
   basename) when given absolute window paths — add a prompt clause pinning the
   reported `file` to the exact string from the window list, and/or a code-side
   normalisation in the post-agent seam (beside the id re-mint).
4. **Arm (i)'s harness-failure pattern** (3 failures, 3 mechanisms, all on the big
   window; 0 failures per-file on the same content) is operational evidence FOR
   smaller windows independent of recall: the big-window arm is fragile at dispatch
   (classifier), mid-run (wedge), and at output (server error on the large structured
   emission).

## Window-knee experiment design (obligated by read §1; DESIGN ONLY — no dispatch)

Fulfils this report's knee-finding obligation at the design level so Job 2 arithmetic
can start the moment its gates open. Not dispatched: Job 2 is halted and the v2 fold
(the Director's) may amend this.

- **Arms**: the same pinned 8-file canary corpus regrouped as 4 windows × 2 files and
  2 windows × 4 files, sonnet/low, unchanged prompt — two runs, ~2 agents-worth of
  spend each (bounded by the arm-(ii) measurement: ≤ ~270k tokens total for both).
- **Measures per arm**: instance count, key-anchor recall (the 13-anchor battery),
  dense-prose misses (K7/K8 as the capacity-immune controls — expected missed in ALL
  arms until the §7 drill lands), tokens per file.
- **Decision rule**: choose the largest window size whose key-anchor recall is within
  1 anchor of the per-file arm's 8/10 — spend scales ~linearly with instance mass, so
  the largest recall-preserving window minimises Job 2 cost. Tie-breaks favour the
  smaller window (harness reliability: this report's arm-(i) evidence).
- **Falsifier**: if recall degrades monotonically with any grouping (even 2-file), the
  knee does not exist on this corpus and Job 2 arithmetic must price per-file dispatch
  (~4.6M map tokens) against the ceiling honestly — or the ceiling goes back to the
  owner.

## Falsifier status

The §1-fold falsifier (unmapped-rate as reducer-load bound) is untouched by this
experiment. The §6 question resolves as: **capacity has a large measured effect (tree-confounded vs the pilot; unconfounded within-arm); effort is UNMEASURED**. Window arithmetic
is the primary cure (with the ~2.7×-per-unit-corpus spend consequence stated above and
a knee-finding obligation before Job 2 arithmetic), plus a dense-prose prompt drill for
the structural residue (K7/K8 class). Whether HIGH EFFORT alone also recovers the
dense-prose class in a big window is OPEN — unanswerable under the current harness at
this window size, and moot for v2 design if window arithmetic lands (small windows +
the drill cover both hypotheses' cures).

— Vole hunts Perch (36c6ca)
