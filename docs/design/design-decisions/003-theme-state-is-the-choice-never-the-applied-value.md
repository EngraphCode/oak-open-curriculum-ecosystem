---
ddr: DDR-003
title: Theme state is the choice, never the applied value
status: accepted
date: 2026-08-02
deciders: design lane; owner-merged landings
edges:
  depends_on: [DDR-002]
  constrains: []
  supersedes: []
  informed_by:
    - 'PR #644 (closed with pointer), PR #710, PR #715 — the choice-model landings'
  related:
    - docs/architecture/architectural-decisions/213-design-system-integration-and-component-architecture.md
---

# DDR-003: Theme state is the choice, never the applied value

## Context

A theme system has two distinct values: what the user chose (possibly
nothing) and what is currently applied (choice resolved against OS
preferences and defaults). Early demo stores conflated them — reading the
applied attribute back as if it were state — which made OS-triggered changes
masquerade as user choices.

## Decision

Observable theme state is the **explicit user choice only**. The applied
theme is presentation output and never round-trips into state. The kit
contract is the `choice(): OakThemeName | null` accessor (MCP-388); the
shared store exposes a two-level snapshot — `undefined` = no runtime (the
hydration gate), `''` = runtime present, no explicit choice — and
deliberately carries no contrast-media mirror (probe-proven inert under this
model: the OS-contrast path writes only the applied attribute).

## Consequences

- A first-time visitor has no choice; consumer selects render a placeholder
  state, never a guessed value.
- An applied-theme accessor is a separate, future contract that lands only
  at first materialised need — never by re-conflating the two values.
- Store implementations that read applied attributes into state are
  non-conformant regardless of test coverage.

## Provenance

- Kit 1.8.0 `choice()` accessor: PR #710 (2026-08-02). Shared store with the
  two-level snapshot: PR #715 (same day; ADR-213 §3 tier landing).
- The conflation defect and its cure trace through PR #644
  (closed-with-pointer at #715's landing).
