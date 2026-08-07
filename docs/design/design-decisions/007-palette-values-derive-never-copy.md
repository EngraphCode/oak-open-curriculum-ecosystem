---
ddr: DDR-007
title: Palette values derive, never copy
status: ratified
date: 2026-08-05
deciders: Jim Cresswell (owner endorsement, 2026-08-05); design lane
edges:
  depends_on: [DDR-005, DDR-006]
  supersedes: []
  informed_by:
    - 'PR #784 — design sitting records 2026-08-05, carrying the trap-street audit'
  related: []
---

# DDR-007: Palette values derive, never copy

## Context

The Figma kit and Oak Components palettes are Oak-copyrighted expression. A
2026-08-05 audit found 68 of 83 palette values in this repo were exact Oak
Components matches — meaning a **verbatim value match is treated as evidence
of copying**, and independent derivation needs to be demonstrable, not
asserted.

## Decision

Expressive palette values are **derived, never copied**: every expressive
value is demonstrably derived (same seed, same output — reproducible by
anyone), differs from its reference under inspection while remaining
invisible in use, and no contrast or accessibility obligation is weakened
by derivation. Functional `ci-*` values that must match an external
contract stay exact and carry explicit attribution. Mechanism detail
(colour space, tolerances, iteration) is execution, homed in the delivery
plan, not here.

## Consequences

- Palette review checks derivability: same seed, same output; a value equal
  to a reference value without an attribution row is a defect.
- Contrast machinery (across all five themes, DDR-004) binds every
  derivation — a derived value that breaks it is re-derived, never waived.
- The audit that motivated this decision lives in the sitting records;
  execution sequencing lives in the completion plan, not here.

## Provenance

- Mechanism sketched and owner-endorsed 2026-08-05 (design sitting, relayed
  on the design-lane channel); trap-street audit recorded in the sitting
  records (PR #784).
