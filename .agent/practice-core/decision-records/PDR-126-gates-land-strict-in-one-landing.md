---
pdr_kind: governance
---

# PDR-126: Gates Land Strict, in One Landing — Never at Warn Over an Allowlist

**Status**: Accepted
**Date**: 2026-07-08
**Related**:
[PDR-038](PDR-038-stated-principles-require-structural-enforcement.md) (stated
principles require structural enforcement — this PDR governs the *landing
shape* of that enforcement);
[PDR-044](PDR-044-memetic-immune-system.md) (the immune-system layers a gate
joins when it lands — see §Decision point 5 for the delimitation);
the host's `never-disable-checks` rule (the post-landing invariant; this PDR
is its landing-time complement) and its `precedent-compounding` pattern
instance (the failure mechanism this PDR structurally forecloses) — both
host-named, not path-bound, so this record travels.

## Context

The estate accumulated warn-tier enforcement surfaces: a lint rule landed at
`warn` over a frozen violation-allowlist (~33 real-IO test files, with a
recorded-reason process for additions), a ~1000-warning no-throw migration,
and a "new rules start at warn" authoring convention. Each looked disciplined
— citations, closure clauses, review approval for additions.

The owner correction (2026-07-07, deepened the same sitting): *"there should
never have been an IO allowlist — strict, everywhere, all the time… the creep
is entropy, and the repo is vulnerable to it."* The generator-level insight: a
violation-allowlist is an **escape hatch with paperwork** — it
institutionalises exceptions to a rule whose whole point is
exceptionlessness, and its process discipline *manufactures legitimacy for
drift*. Process-compliance is not principle-compliance: in one session an
agent union'd two allowlist entries in a merge and a six-seat review gateway
rated the allowlist-ADD discipline PASS — every step procedurally correct,
every step entropy. Precedent compounding is the mechanism: each landed
exception normalises the next, and reviewers recommend the landed shape.

## Decision

**A gate (lint rule, validator, scanner, check) lands at ERROR with full
conformance, in ONE landing.** Concretely:

1. Existing violations are **fixed or category-moved as part of the
   landing** — never held behind a warn tier, a violation-allowlist, a
   grandfather list, or a "tighten later" note. This is the atomic-landing
   invariant (test and product code land together) applied to gates: the
   gate and the estate's conformance to it are two halves of one act.
2. **Category-relocation is the cure for genuine non-fits, never
   exemption.** Work that truly cannot satisfy the rule is not an exempted
   instance — it is a different category with a different home (a validator
   script for filesystem checks, a smoke test, a benchmark instrument for
   cost budgets). Move it; the rule then applies without exception.
3. **If the estate cannot be brought conformant in one landing, the gate
   does not land yet** — the conformance work is sequenced first (a
   migration plan whose *final* slice lands the gate at error). A gate that
   cannot yet be strict is future work, not a warn-tier resident.
4. **Existing warn-tier surfaces** are transition debt, not precedent: each
   gets this ruling applied (a conformance plan ending in error-tier) or an
   explicit owner-ratified distinct disposition. They are never cited as a
   licence for new warn-tier landings. A live migration lane's warn-tier
   rule REMAINS IN PLACE while its conformance plan runs — the debt is
   drained to error-tier, never deleted-then-relanded; removing the rule
   mid-lane would strip the migration of its progress signal.
5. **Delimitation — detector-calibration dispositions are not violation
   inventories.** False-positive and acknowledged-context dispositions on a
   detector (PDR-044's logged fingerprint dispositions; per-site
   quality-tool dismissals grounded in a specific architectural tension)
   are calibration instruments on an ENFORCED gate: the gate fires, the
   disposition is per-instance, recorded, and feeds detector tuning. What
   this PDR forbids is the inverse shape — a gate that does NOT fire on a
   known set (a warn tier, a violation inventory, a grandfather list) held
   as a standing exemption.

## Scope

**Adopter scope**: every Practice-bearing repo that lands enforcement
surfaces. The principle is host-independent; the category-relocation homes
(validator estate, smoke tier, benchmark instruments) are host-specific.

## Rationale

A warn tier converts a boundary into a gradient, and a gradient erodes: every
allowlist addition is locally reasonable and globally entropic, and the
recorded-reason ceremony makes the erosion auditable rather than preventing
it. The only stable states for a rule are *enforced* and *absent*. The
one-landing shape also keeps the gate honest at birth — a gate proven against
a conformant estate has demonstrated it can distinguish, whereas a gate born
at warn over an inventory has never fired for real.

## Consequences

**Enables**: exceptionless gates; conformance work sized honestly before
landing; reviewers can reject allowlist-shaped cures by citation.

**Costs**: landing a gate on a non-conformant estate becomes a larger,
sequenced piece of work. That cost is the point — it prices the estate's
actual distance from the rule instead of hiding it.

**Forbids**: new warn-tier rules with violation inventories;
grandfather/allowlist mechanisms for rule landings; citing an existing
warn-tier surface as precedent for a new one.

## Falsifiability

Shown wrong if a gate class emerges where a warn-tier interim measurably
*reduces* total violations faster than sequenced-conformance-then-error
landings do, without the allowlist growing — i.e. the gradient proves
self-draining rather than entropic. The recorded evidence to date (the
io-allowlist absorbing new entries under full process discipline) shows the
opposite.

## Source

Graduates an owner correction chain (2026-07-07): a zero-IO-in-tests ruling
whose deepening named the generator ("the creep is entropy"). The worked
entropy instance: an allowlist union performed in a merge and rated PASS by
a full multi-seat review gateway — procedurally correct at every step. Host
adoption context (transition-debt inventories, owning plans, enforcement
wiring) lives at the host layer: in the adopting repo's plans, rules, and
registers, not in this record.

## Enforcement note

This PDR is prose until the adopting host wires it into its reviewer cadence
(per PDR-038): the natural hooks are the host's never-disable-checks-class
rule (extend the hard-reject from gate-weakening diffs to
new-gate-at-warn / new-allowlist diffs) and its config-review specialists.
An adoption without that wiring should name the gap explicitly.
