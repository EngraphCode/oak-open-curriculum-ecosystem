---
pdr_kind: pattern
---

# PDR-129: Diagnosis Reads Whole Surfaces First; Failure Catalogues Are Open Sets

**Status**: Accepted
**Date**: 2026-07-20
**Related**: the authoring-time face of the same generator is the host rule
`no-moving-targets-in-permanent-docs` §Authoring-Time Open-Set Clause (closure
claims over open sets); [PDR-098](PDR-098-doctrine-traction-firing-detection-response.md)
(recurrence-despite-home detection);
[PDR-122](PDR-122-agentic-judgment-pipelines.md) (judgment pipelines whose
verifier stages this discipline shapes).

## Context

A mature Practice accumulates a catalogue of named failure classes — worked
instances, patterns, frictions, review-round histories. The catalogue is an
asset at authoring time and a liability at DIAGNOSIS time: under pressure, a
seat diagnosing an anomaly reaches for serial pattern-matching against the
named classes ("is it the policy-lag class? the never-fires class?") instead
of reading the governing surface whole. The catalogue invites treating
itself as closed — and the true cause of any given anomaly is frequently a
class nobody has named yet, or a configuration change nobody's catalogue
contains.

The founding evidence (one merge drive, 2026-07-20): a merge-wall diagnosis
ran ~20 minutes of closed-set matching with three compounding evidence
errors — a field-filtered read of the governing rules that discarded the
answer-bearing entry, empty query artefacts treated as evidence of absence,
and serial named-class matching — while the actual cause (a vendor check
re-enabled in settings minutes earlier) was readable in about one minute
from the vendor's own composite UI. Independently, the same day: an import
sweep declared a reference graph "closed" after a link-pattern regex pass,
and outside eyes immediately named a member the pattern could not see —
the sweep had filtered by pattern instead of reading.

## Decision

1. **On any composite/component disagreement or anomalous refusal, read the
   ENTIRE governing surface unfiltered before hypothesis-matching.** The
   governing surface is whatever owns the behaviour: the full ruleset (not a
   field-filtered projection), the whole config file, the vendor's own
   composite UI, the complete error trail. Field filters, pattern greps, and
   projections are applied AFTER the whole read has bounded the hypothesis
   space, never as the first contact.
2. **Named-failure catalogues are open sets.** Matching an anomaly against
   known classes is a hypothesis-generation step, never an elimination
   proof: "matches no named class" means the catalogue is incomplete, not
   that the anomaly is noise. A diagnosis may conclude only from evidence
   about THIS instance.
3. **An empty read is not evidence of absence** until the instrument is
   verified against a known-present control: empty query artefacts
   (abbreviated identifiers, wrong keys, unauthenticated tiers, shallow
   checkouts) reproduce "absence" indefinitely.
4. **The cheapest sufficient instrument may be human eyes on the vendor
   surface.** When a maintained composite view exists (a merge box, a
   dashboard), reading it — or asking the owner to — precedes API
   spelunking.

## Rationale

The generator this cures is closure applied to reasoning: the same
mechanism that makes closed counts and closed class-sets fail review
(closure claims over an open set survive kills by climbing one abstraction
level) climbs, at diagnosis time, into the diagnostic procedure itself.
Reading whole surfaces first is the only move the generator cannot climb
past, because it does not assert a closed set at any level.

## Falsifiability (PDR-026)

- If unfiltered-first reads cost more than they save across a run of
  diagnoses (measured against the matched-first counterfactual), clause 1's
  default inverts to hypothesis-first with a bounded budget.
- If a post-adoption diagnosis spiral recurs WITH the whole-read performed,
  the mechanism is misidentified — re-open the analysis rather than adding
  clauses.
