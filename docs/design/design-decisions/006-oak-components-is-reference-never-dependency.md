---
ddr: DDR-006
title: Oak Components is reference, never dependency
status: accepted
date: 2026-08-05
deciders: Jim Cresswell (owner shaping); design lane
edges:
  depends_on: [DDR-002]
  constrains: [DDR-007, DDR-008]
  supersedes: []
  informed_by:
    - 'PR #737 — Oak Components anatomy, intent and evolution (research, open)'
    - 'PR #783 — Oak Components capability-and-value floor (draft)'
  related:
    - .agent/reports/design/oak-components-capability-floor-shaping-debate-2026-08-06.md
---

# DDR-006: Oak Components is reference, never dependency

## Context

Oak Components (and OWA behind it) is the richest evidence of what an Oak
design surface must be able to do. It is MIT-licensed, so importing from it
is legally permitted — and architecturally wrong: its styled-components
runtime contradicts the CSS-first layer model (DDR-002), and dependency
would couple this system's evolution to a codebase it exists to supersede
for its consumers.

## Decision

Oak Components is read as **reference only** — anatomy, capability
evidence, floor derivation. **No code imports, ever**, regardless of
licence. The capability floor derived from it is **necessary but not
sufficient**: this system has requirements beyond those systems, and where
they overlap, many of this system's floors are deliberately higher.

## Consequences

- A dependency on `@oaknational/oak-components` (or copied source) in any
  design workspace is non-conformant on sight.
- Floor rows derived from Oak Components are evidence, never a census;
  incompleteness of the derived floor is constitutive (owner shaping,
  2026-08-05, carried verbatim in the floor document).
- Reading the reference deeply is encouraged; resemblance in VALUES is
  governed separately by DDR-007.

## Provenance

- Owner shaping 2026-08-05: the OC/OWA-derived floor "is a necessary but
  not sufficient or complete floor…". Floor draft PR #783; research PR #737;
  the conformance shape that consumes the floor is DDR-008.
