---
ddr: DDR-007
title: Palette values derive, never copy
status: accepted
date: 2026-08-05
deciders: Jim Cresswell (owner-endorsed mechanism)
edges:
  depends_on: [DDR-005, DDR-006]
  constrains: []
  supersedes: []
  informed_by:
    - 'PR #784 — design sitting records 2026-08-05 (accumulating; carries the trap-street audit)'
  related:
    - .agent/plans/delivery/design-system-completion.plan.md
---

# DDR-007: Palette values derive, never copy

## Context

The Figma kit and Oak Components palettes are Oak-copyrighted expression. A
2026-08-05 audit found 68 of 83 palette values in this repo were exact Oak
Components matches — meaning a **verbatim value match is treated as evidence
of copying**, and independent derivation needs to be demonstrable, not
asserted.

## Decision

Expressive palette values are **derived, never copied**: a seeded,
deterministic, per-family perturbation in OKLCH (delta-E ≈ 1–2 — invisible
in use, decisive under hex inspection), iterated against the system's own
contrast machinery to a fixed point so no accessibility obligation is
weakened. The mechanism applies to expressive families only; functional
`ci-*` values that must match an external contract stay exact and carry
explicit attribution.

## Consequences

- Palette review checks derivability: same seed, same output; a value equal
  to a reference value without an attribution row is a defect.
- Contrast machinery (across all five themes, DDR-004) is the fixed-point
  constraint — a perturbation that breaks it is re-derived, never waived.
- The audit that motivated this decision lives in the sitting records;
  execution sequencing lives in the completion plan, not here.

## Provenance

- Mechanism sketched and owner-endorsed 2026-08-05 (design sitting, relayed
  on the design-lane channel); trap-street audit recorded in the sitting
  records (PR #784).
