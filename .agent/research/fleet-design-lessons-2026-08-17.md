# Fleet, survey, and concept-space exploration design — lessons from landscape survey round 1a

Date: 2026-08-17. Provenance: the workspace-taxonomy landscape survey
round 1a (46 walkers, archive at
`.agent/reports/workspace-taxonomy-landscape-survey/round-1-raw.json`),
its three data probes, and the owner's design rulings the same hour.
The owner's framing, verbatim: "This is good, we are learning about
survey design, fleet design and concept space exploration design."
These lessons generalise beyond this survey (`survey-method` class);
graduation to a PDR is a candidate once a second campaign exercises
them.

## The persona-uptake gradient (owner ruling, verbatim-anchored)

"I don't think persona works for Haiku, only differently stringent
constraints to give different perspectives... Sonnet needs constraints
but can take a little persona, Opus more persona, Fable a lot of
persona."

Round 1a's data is the worked instance: 41% of walkers converged on
one design shape REGARDLESS of persona — persona vocabulary changed
("Substance Type" vs "UNIT-TYPE" vs "Purpose Class") while the design
tuple did not. Small models wear a persona as a costume over an
unchanged prior; the perspective knob that actually moves them is
CONSTRAINT STRINGENCY. Fleet-design consequence: seed variation must
be tier-matched — constraint grades for the small tiers, persona depth
increasing with capability tier. (This also generalises the cricket
bindings' tier logic: the instrument you can vary depends on the tier
you address.)

## Baseline-then-deflection (the missing control, now standard)

Round 1a gave every walker a constraint, so the natural attractor was
never measured and "convergence despite constraints" conflated
weak-constraint with strong-attractor. Standard shape from here: every
seeded fleet carries an UNSEEDED baseline arm per model tier — the
tier's raw prior fingerprint — and seed effects are measured as
deflection from the tier's own baseline, never against a global
average. Cross-tier baseline agreement is the real attractor test: a
shape that every tier's baseline reaches is territory; a shape only
one tier's baseline reaches is that tier's prior.

## Challenge-not-extend (anti-anchoring for successive rounds)

The owner's requirement, verbatim: 1b "properly challenges 1a, that we
don't get stuck with the 1a lens even though we know it is
incomplete... 1a is an interesting point in the landscape that can
enrich our understanding, but we know it is biased and twisted in ways
that surprised us." Mechanisms adopted:

1. **Generation blindness**: later-round walkers never see earlier
   archives (forbidden-path lists grow to include the survey's own
   report home).
2. **Independent reduction**: each round's archive is reduced FRESH
   (own descriptor derivation) by a DIFFERENT model tier than the
   prior round's reducer; a comparator stage then joins archives and
   treats descriptor mismatch as a finding — if a new round's natural
   cell structure needs different descriptors, the old descriptors
   were partly instrument.
3. **A falsification arm**: the prior round's dominant elite design is
   handed verbatim to a few high-tier challengers whose brief is to
   find what is wrong with it and design the fix — the incumbent is
   used as a POINT to attack, never as a frame the free walkers see.
4. **Rubric blinding with variants**: requirements as prose scenarios,
   no enumerable list (1a's six-item decision-needs list correlates
   with the walkers' 5-6 classification mode — the instrument likely
   taught part of the answer it was measuring); two phrasing variants
   run in parallel so rubric-induced structure is measurable.

## Instrument economics

- **Schema stringency is tier-priced**: both 1a failures were
  small-model StructuredOutput retry exhaustion. Walker schemas stay
  minimal (prose design + a small structured summary); self-scores
  are removed entirely (they add grading bias and schema weight —
  scoring belongs to the scorer stage).
- **Read traffic dominates walker budgets**: 1a cost ~3.2× its
  estimate because repo-grounded walkers' file reads were unpriced.
  Fleet budgets price tool-read tokens explicitly, and repo-grounded
  walkers carry a read cap in-prompt.
- **Cross-vendor relays must be parsers, not transcribers**: 1a's
  codex leg had a native agent restructure codex prose (prior
  contamination). The relay pattern from here: the cross-vendor model
  emits a fenced JSON block against a stated shape; the relay
  extracts it verbatim and validates, adding nothing.

## What survived 1a as probable signal

Checked against the probes: the dominant shape is grounding-invariant
(repo-direct 9/15, facts-sheet 10/16, requirements-only 8/15 — NOT an
incumbent echo); generated-in-VCS survived almost universally except
where forbidden by constraint; the model-prior question is OPEN (40/46
walkers one model) and is exactly what 1b's tier-split baselines
measure.
