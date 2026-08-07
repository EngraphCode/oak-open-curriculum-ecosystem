---
ddr: DDR-001
title: The design system is a configured framework
status: ratified
date: 2026-08-05
deciders: Jim Cresswell (owner)
edges:
  depends_on: []
  constrains: [DDR-002, DDR-008]
  supersedes: []
  informed_by:
    - 'PR #737 — Oak Components anatomy, intent and evolution'
  related: []
---

# DDR-001: The design system is a configured framework

## Context

The Oak Open Curriculum Design System could have been built as a bespoke
component library (the shape of its reference sources, Oak Components and
OWA). The strategic question was whether value ships as hand-made artefacts
or as configuration of a general system.

## Decision

The design system is a **configured framework**: a general, portable system
whose Oak-specific identity is carried entirely by configuration (tokens,
themes, brand values), never by bespoke code paths. Deeper layers are more
general; semantic tokens are never Oak-specific.

## Consequences

- Any consumer can re-configure the system for a different identity without
  forking it; "works for any user, any machine" is a review lens, not an
  aspiration.
- Oak-specific values enter only at the configuration boundary, which is
  where identity, licensing, and attribution scrutiny concentrate
  (DDR-005, DDR-007).
- Capability commitments are made by the framework, so conformance needs a
  framework-level predicate (DDR-008), not per-artefact judgement.

## Provenance

- Strategic node ratified by owner word 2026-08-05 (session a0892f);
  ratification stamp landed in PR #782.
- The generality-depth gradient and configuration boundary are carried by
  the strategic node and the design-system completion plan.
