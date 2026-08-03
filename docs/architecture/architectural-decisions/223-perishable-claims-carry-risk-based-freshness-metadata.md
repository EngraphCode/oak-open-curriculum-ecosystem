# ADR-223: Perishable external-surface claims carry risk-based freshness metadata

- **Status**: Accepted (owner rulings 2026-08-03, recorded verbatim below)
- **Date**: 2026-08-03
- **Deciders**: Jim Cresswell (owner); recorded at the implementer seat
  (Lava lifts Brimstone, b3467b) during the hook-policy truth-decay lane

## Context

The estate records claims about external, fast-moving surfaces — agent
platform CLIs, vendor hook contracts, protocol capabilities. On
2026-08-03 the canonical hook policy's `platform_support` block was
found asserting "no native agent hook surface at time of writing" for
three platforms where the claim had been false for months; the
explanatory mirrors were current while the canonical layer rotted,
because mirror updates ride whichever research pass touches them while
the canonical file survived on memory. The claims carried no dates: "at
time of writing" never started a clock, so nothing could compute the
claims' age, and no mechanism ever fired a re-check. Truth maintenance
rested on vigilance, and the estate's standing principle is that a
surface needing vigilance to stay true is not finished.

The falsehood was not cosmetic: the stale codex row hid a missing
enforcement vertical (a reader had no reason to attempt work the record
said was impossible), and `platform_support.claude_code.status`
mechanically gates what two validators check. Stale capability claims
misroute work and disarm guards.

## Decision (owner rulings, 2026-08-03, verbatim)

On the decay model:

> "something true today has an exponentially falling chance of remaining
> true as time moves on, and we can model that in front matter and a
> validator"

On the quantity being modelled and its risk weighting:

> "the chance of a review being valuable is at the very least a
> convolution of the chance of the original statement no longer being
> true and the level of risk (likelihood X impact) of that fact being
> wrong"

with the fast-class ceiling: the likelihood a review provides value
should be treated as reaching ~100% at **30 days** for fast-moving,
high-reliance surfaces.

On the enforcement posture:

> "fail open and noisy for tools, fail hard and fast and noisy for
> product code so we can fix it"

The decision, stated as the estate's should-be:

1. **Every claim on a registered perishable surface carries three
   freshness fields**: `grounded_at` (the ISO date the claim was last
   verified first-hand against its source — the claim's own evidence
   date, never the date the field was added), `pinned_to` (the version
   of the external surface it was verified against — or explicitly
   `null` where no version was ever observed, PDR-133 §8's
   explicitly-unverified shape: an honest hole that stands as a
   re-verification obligation, never a completeness pass), and
   `review_by` (the ISO date by which it must be re-verified).
2. **A version-pinned observation never decays; the inference to the
   present does.** "Verified against codex-cli 0.145.0 on 2026-07-25"
   is a permanent historical fact. What rots is "…and this still
   describes the current surface", under two decay drivers: unobserved
   change (time — the exponential) and observed change (the installed
   surface no longer matches `pinned_to`, which short-circuits the
   clock and obliges re-verification immediately).
3. **The review horizon is set by risk, not by hazard alone**: referent
   hazard (how fast the outside surface churns — a property of the
   world) multiplied by reliance impact (what in this estate breaks or
   is misrouted when the claim is stale — a property of our wiring).
   Absence claims ("X has no Y") sit in the fast band by construction:
   they are falsified by any addition. Ratified doctrine is exempt —
   it decays by decision, not by time.
4. **The classification is per-surface, held in a reviewed registry
   beside the enforcing validator, never a per-row opinion.** Each
   registered surface declares its class and maximum review interval;
   the fast/high-reliance class ceiling is 30 days. The registry is
   code: contestable in a diff, changed deliberately.
5. **Enforcement follows the failure-posture ruling, split across two
   instruments** (the shape the estate already ratified for plan
   gate-expiry drift, 2026-07-31). The **gate validator** is a
   deterministic function of repository content with no clock input:
   completeness and integrity defects — a missing field, a malformed
   date, `review_by` not after `grounded_at`, an interval exceeding the
   surface's registered ceiling — fail the run hard; they are defects
   in the record being edited, fixable at the keyboard that introduced
   them, and can never redden an unrelated lane by clock rollover. The
   **session-open drift instrument** owns everything clock- or
   environment-bearing: an expired `review_by`, a null pin, and —
   where an allow-listed local binary exists — an installed version
   that no longer matches `pinned_to` are injected as session-open
   context, repeating until the rows change, and surfaced by the health
   probe. The version collector is deliberately narrow: no shell,
   allow-listed binaries resolved to absolute paths, a strictly-matched
   version string the only child output ever injected. Expiry
   therefore never blocks a build and never depends on anyone reading
   gate logs: it is an alarm clock firing at a decision moment, not a
   tombstone and not a tolerated warning — which is the difference
   between this decision and both the "no moving targets in permanent
   docs" failure class and the no-warning-toleration rule it must
   coexist with.
6. **Re-attestation is the maintenance loop**: re-verify against the
   live surface, bump `grounded_at` and `pinned_to`, push `review_by`
   forward. It is deliberately cheap — minutes of agent work — so the
   certainty-horizon obligation stays light.

## Alternatives considered

- **A computed decay engine** (survival probabilities evaluated in the
  validator): rejected. The exponential informs the _choice_ of
  interval per class; the enforcement predicate must be trivially
  falsifiable at review time ("the date passed"), and computed
  probabilities add pseudo-precision no reviewer can contest.
- **Document-level freshness**: rejected. A document decays at the rate
  of its most volatile claim, masking which claim needs the re-check;
  granularity is per-claim wherever claims are structured.
- **Hard-failing builds on expiry**: rejected by the posture ruling. A
  clock-triggered red build lands on whichever unrelated lane commits
  next and pressures authors toward fabricated dates — an escape hatch
  by social means.
- **A non-blocking expiry notice inside the blocking gate run**: the
  first-draft shape, rejected in adversarial review as a tolerated
  warning and a vigilance mechanism — gate output that fails nothing is
  read by no one, and the estate's no-warning-toleration rule exists
  precisely because such channels rot.
- **Undated prose** ("at time of writing"): the status quo this
  decision retires; it is how the motivating incident happened.

## Relationship to PDR-133 §8

PDR-133 §8 already governs platform-capability declarations: claims are
version-pinned from first-hand observation at a stated version, and a
class without a verified observation is recorded explicitly unverified
— "a matrix of confident unverified rows is worse than a matrix with
honest holes". This decision is that discipline extended with the time
axis: `pinned_to` carries §8's version pin (null = §8's honest hole),
observed pin-drift short-circuits the calendar, and `review_by` is the
backstop for drift nobody was watching.

## Consequences

- The first registered surface is the hook policy's `platform_support`
  block; the pilot (metadata, validator, registry, README guidance) is
  carried by the delivery plan
  `claim-freshness-and-guard-degraded-states` (MCP-476). Means live
  there, not here.
- Extending the registry to further perishable surfaces (capability
  catalogues, surface matrices, version-pinned rule mechanics) is
  follow-on work under the same contract; each addition classifies the
  surface's hazard and reliance in the registry diff.
- Scheduled sweeps that convert expiry notices into routed obligations
  are a named follow-up; the notice channel is designed so the estate's
  no-warning-toleration discipline makes an expired claim actionable by
  whichever agent's gate run surfaces it in the meantime.
