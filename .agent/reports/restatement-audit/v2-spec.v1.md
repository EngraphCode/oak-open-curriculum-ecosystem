# Restatement-audit v2 spec — BOUND 2026-07-16 (refutation folded)

Author: Mussel rides Coral (6f8857), Director. 2026-07-16. Status: **BOUND** — Vole hunts
Perch's refutation pass (ARC 12:50 entry: 0 REFUTED / 2 STANDS / 3 MODIFIED) is folded
below as the FOLD blocks; where a FOLD block and the original text differ, the FOLD wins.

**FOLD (a) → §1**: predicate menus ONLY where closure is measured — status-assertion
closes (6 predicates / 24 instances, measured); closed-set-membership and denominator are
trivially small; count (22/23) and threshold (11/11) DO NOT close on this corpus. For
count/threshold: join by (factClass, canonical subject) with value-shape matching against
the gazetteer's knownCanonicalValues; high unmapped rates are REDUCER LOAD (the
unmapped→reducer route makes this cost, not loss). §1's falsifier is re-bound as a
reducer-load/cost bound, never a menu-design-wrongness bound.

**FOLD (c) → §5**: re-planted key rows inherit the SAME first-hand sealing ceremony
(refound-plant-challenge-canary; owner ratification riding OG-3), and the deterministic
key-vs-tree preflight runs at EVERY gate citation, not only at re-plant time.

**FOLD (d) → §9**: the dispatch decision uses the measured MAX tokens/voter against the
ceiling, never the mean; if the max/min spread exceeds ~3x, add one organic cluster and
re-measure before deciding.

**FOLD (e) → §3**: the pipeline-integrity gate applies ONLY to text-vs-text conflict rows.
Text-vs-reality rows (v1's K5/K7 class — a doc claim vs built behaviour) are
map-recall-level rows in the key and are EXCLUDED from the pipeline-integrity leg (they
route to a different detector class in prevention, not to this fleet's join) — otherwise
the v2 gate is unsatisfiable-by-construction and recreates the v1 disease.

**Also folded**: declared-cache (§2) lands as ONE change across schemas.ts + the
agent-schemas enum-order test pins + votePrompt + grounding docs (the pins trip
otherwise); §1's predicateRaw/canonicaliseInstance sits in the post-agent/pre-checkpoint
seam beside the landed id re-mint + subjectFromGazetteer recompute. Inputs [all measured or read-first-hand]: the canary-pilot
corrected scorecard (napkin "Owner-directed re-assessment", comms `873028bb`), the
zero-spend join replay (43 predicates / 62 instances, 38 singletons), grounding fidelity
62/62 (classification precision unmeasured), the 18-agent verification fleet's six critic
angles, and the three-expert #393 review round. Supersedes the plan's Deliverable-2 v1
design details per the plan's own SUPERSEDED-PENDING-V2 banner.

## 1. Join-key architecture (cures the deepest measured defect)

The exact-join key `(factClass, subject, predicate)` stays — but every component is
CANONICALISED IN CODE before joining; the finder's free text is evidence, never the key.

- **Gazetteer v2 structure** (Director artefact): per subject — canonical id, `aliases[]`
  (measured need: OG-3 vs canary-key.rows vs canary-key for one entity),
  `knownCanonicalValues` (already present: "lane-seed.lanes":"7", "sample.files":"137" —
  now load-bearing), and a **closed predicate vocabulary per factClass** (small menus,
  e.g. count → {member-count, file-count, row-count, threshold-count}; status-assertion →
  {gate-status, workflow-status, ratification-status, liveness-status}). Free-text
  predicates remain allowed in finder OUTPUT but map to `predicateRaw`; the joinable
  `predicate` is chosen from the menu or `unmapped`.
- **Code-side canonicalisation** (module cure, Vole): `canonicaliseInstance(instance,
  gazetteer)` recomputes `subject` (alias → canonical id), `subjectFromGazetteer`
  (recomputed boolean — never trust the model's), `predicate` (menu mapping via exact +
  synonym table in the gazetteer; `unmapped` routes to the reducer, never silently joins),
  and derives the fact-key. Unit-tested against the pilot's 62 instances as fixtures —
  ACCEPTANCE: K4's two instances and the I33/I44 pair land in single clusters; the
  measured 37-singleton graveyard shrinks to a verified count of TRUE singletons on
  sampled inspection.
- **Falsifier**: if ≥30% of pilot instances still key `unmapped` after menu mapping, the
  menu design is wrong — halt, re-derive menus from the pilot corpus, do not widen
  silently.

## 2. assertionKind taxonomy extension (cures NC1's 7/9)

Add `declared-cache` to the enum: a row/line inside a SANCTIONED status-cache surface
(register tables with citation/evidence columns, files whose header declares them a
generated or sanctioned cache) citing its evidence adjacently. Finder file-class rule
compiled into the prompt: inside `owner-gate-register.md` and surfaces its header names
as sanctioned, table rows with a populated evidence/citation column are `declared-cache`,
never `authored`. History guard restated: past-tense record sections (group (h)
especially) are `history`. The voter's conjunctive `authoredNotCited` test gains
`declared-cache` as an explicit not-authored class.

## 3. Acceptance gate respec (two levels, comparands defined)

- **Map-recall gate**: PASS iff every keyed row has ≥1 map instance whose CANONICALISED
  fact-key equals the key row's, AND the negative-control battery yields zero
  authored-class instances at the keyed sites. Severity is REMOVED from the gate (the v1
  severity clause had no comparand anywhere — struck, not patched).
- **Pipeline-integrity gate**: PASS iff every keyed CONFLICT row survives join+verify to
  a ledger row with verdict conflict, and the forced-split cluster dispositions
  held-for-review. ("Found" is thereby defined at BOTH levels; v1 never said which.)
- **De-biased exemplars**: the finder prompt's trigger-2 exemplars are re-aligned so
  enumerable-total facts key as `count` (matching the gazetteer's countsAndDenominators),
  with closed-set-membership reserved for membership-of-named-element claims.

## 4. Pre-dispatch provenance protocol (cures the stale-tree class)

- ONE pinned tree SHA per run, recorded in EVERY stage checkpoint; stages refuse inputs
  whose recorded SHA differs (map→meta drift kills byte-verify silently otherwise).
- Harness-verified per-file presence + readability BEFORE dispatch (deterministic, not
  agent-reported); per-file instance counts INCLUDING zeroes in the map result envelope.
- Canary-key preflight: deterministic EXACT-line, exact-quote match of every key row
  against the pinned tree; any drift = refuse and re-plant, never fuzzy-match (the ±2
  tolerance was measurement-only; the pinned tree makes tolerance pure masking).

## 5. Canary key v2 (Director artefact)

Vocabulary aligned to the v2 menus (the v1 key itself used three predicates for one
fact); versioned + pinned to the sweep tree SHA; K6's stale line pointer fixed by the
preflight discipline; ADD the live G-ADR done-vs-ratified conflict (found un-keyed by the
pilot's working half); negative-control battery: ≥1 row per non-authored assertionKind
(citation, history, generated, declared-cache) + ≥2 group-(h) rows (past-tense-dense
handoff/ARC surfaces — the history-as-authored flood risk); re-planting policy: when
cures land and keyed conflicts die, re-plant from remaining live conflicts or the sealed
challenge-canary machinery before any re-run that cites the gate.

## 6. F8 discriminating experiment (Vole, BEFORE §7's prompt text is final)

Re-run the identical pilot window twice: (i) same prompt at higher effort (sonnet/high),
(ii) same prompt, per-file dispatch at sonnet/low. Read: parenthetical/multi-fact/
dense-prose misses persisting under (i) = structural context-shape blindness → the cure
is second-pass/completeness machinery in the prompt+harness; misses vanishing under (i)
or (ii) = capacity/window-size → the cure is tier or window arithmetic (with its spend
consequence made explicit). Budget ≈ 2× pilot ≈ 200k tokens, inside the ceiling.

## 7. Finder prompt v2 (final text AFTER F8)

Carries: the de-biased exemplars (§3), the declared-cache file-class rule (§2), the
one-instance-per-trigger rule with a compiled multi-fact sentence drill (K4+K5's sentence
as the worked exemplar), component-vs-aggregate counts (extract BOTH the five thresholds
AND "six falsifiers" when literally present; never infer an aggregate not written —
K2's lane-seed side stays unextractable by design), and per-file zero-count honesty.

## 8. Haiku calibration gate (redefined; replaces the incoherent ⊇-subjects form)

On 3 calibration windows, haiku proceeds iff: (a) BYTE-ANCHORED quote overlap — every
canary-row quote sonnet's run found, haiku's run also finds (exact-quote match, not
subject match); (b) haiku's CANONICALISED fact-key set ⊇ sonnet's on gazetteer subjects;
(c) joint misses count as FAILURES against the key (both-miss can never pass the gate).
Compiled-procedure lesson folded in (PAIR-4): any gate cited in a haiku prompt carries
its necessity test inline.

## 9. S3 cost + correctness pilot (respecced; decision-critical)

Join the existing 62 pilot instances in code → clusters; vote FIVE clusters at
sonnet/high zero-tools: 2 known-verdict (K6-class), 1 forced 1-1 split (must disposition
held-for-review), 2 organic; run meta against a DELIBERATELY advanced tree to prove the
byte-verify refusal fires. Measures: real tokens/voter (the decision datum), disposition
correctness, drift-refusal. Then the arithmetic: S1 ~3.2–3.5M [measured basis] + S3 =
measured-voter × 2 × cluster-count + S2/S4 margin; fits 6M → dispatch; exceeds → route
to the owner with the three cures (ceiling / skip-voting-with-exact-spec / cluster cap).

## 10. Struck from v1 (with reasons)

- "Finder is blind to JSON/generated sources" as a cure target — withdrawn (stale-tree
  staging artifact; untested ≠ broken). The RE-PILOT coverage matrix instead includes ≥1
  generated JSON file so the path gets tested.
- The severity clause of the v1 gate (no comparand ever existed).
- The v1 haiku ⊇-subjects gate (incoherent under measured subject divergence).

## Refutation surfaces handed to the checker

(a) the predicate-menu closure — is a closed menu per factClass actually derivable from
the pilot corpus, or does §1's falsifier fire immediately? (b) §3's severity removal —
does anything downstream consume severity that I've silently orphaned? (c) §5's
re-planting policy — does it recreate the unmaintained-key disease under a new name?
(d) §9's five-cluster sample — sufficient to bound tokens/voter, or does variance demand
more? (e) anything in §7 that contradicts the module's shipped prompts.ts structure.

— Mussel rides Coral (6f8857), Director, compound pair
