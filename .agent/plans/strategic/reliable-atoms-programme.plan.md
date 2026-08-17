---
id: reliable-atoms-programme
node_type: strategic
name: "Reliable atoms — the estate's fundamental building blocks at engineering excellence"
overview: "Factor the estate's fundamental code, data structures, algorithms, and patterns into small single-responsibility core modules with strict public APIs, extensive TSDoc carrying positive and negative examples, behavioural and performance test suites — utterly reliable atoms, brought to true engineering and developer-experience excellence."
status: sketch
serves: TOOLS-2
impact_areas:
  - practice-and-estate
gate_expiry_default: P21D
depends_on:
  - plan: survey-machinery-deconstruction
    kind: beneficial
owner_gates: []
tickets: []
last_updated: 2026-08-17
---

# Reliable atoms programme

## Outcome

The owner's direction, verbatim (2026-08-17): "where we can factor out
code, data structures, algorithms, patterns, into small, single
responsibility, well tested, well encapsulated modules, with a strict
public API, and put those in the core, I want us to do that, each one
with extensive TSDoc, including multiple positive and negative
examples... all the most fundamental building blocks standardised and
brought up to a level of true engineering and developer experience
excellence... performance tested."

The world this node reaches: a committed **atom register** enumerates
the estate's fundamental building blocks; every registered atom meets
the excellence bar below, provable by a conformance instrument, and
every candidate not yet at the bar is a named register row with a
disposition — never an unrecorded aspiration.

## The bet

Reliability compounds at the atom tier: the frame's own law is that a
lower layer's fan-out multiplies a defect's blast radius, so the atom
tier is the cheapest place in the estate to buy correctness once and
inherit it everywhere. For a workforce that is primarily AI agents the
leverage doubles: agents read TSDoc at the moment of use, so a negative
example (this misuse, this failure) closes a misuse class that no
convention or review vigilance reliably closes; a perf budget makes a
regression visible at the layer where it is a one-function fix.

This drive is deliberately tangential to the workspace-basis and
reorganisation questions (the owner's words: "creating utterly reliable
atoms, rather than designing the conceptual space") — an atom's
excellence is location-independent, and this node is robust to any
basis ruling: atoms land in today's `packages/core/` strata and move
wholesale if the conceptual space later renames their home.

## The bar

The per-atom checklist is the ratified excellence contract
(`.agent/reports/typescript-estate-consolidation-review/foundational-building-blocks-frame.md`
§"Excellence contract for a future core package": one responsibility,
small total API, provider-neutral, Result-based failure, TDD with
mutation testing mandatory, packed-form smoke proof, progressive
README, removal condition), **extended by this node's owner directive
with three requirements the contract lacks**:

1. **TSDoc example pairs**: every public symbol carries extensive
   TSDoc including at least two positive examples and at least two
   negative examples — each negative showing a concrete misuse and the
   failure it produces (compile error, Result error, or named
   behavioural consequence).
2. **Performance tested**: every atom ships benchmarks over its public
   contract with recorded budgets; regression detection runs on a
   declared cadence. Budgets are relative regression fences, never
   absolute-milliseconds vanity numbers; optimisation work happens
   only on a measured budget breach.
3. **Strict public API, validated**: the export surface is explicit
   and minimal; the conformance instrument fails on incidental exports
   and on any public symbol missing its example pairs.

## Mechanism

- **Atom register first**: candidates enumerated from the existing
  `packages/core/*` members (brought up to the bar, not grandfathered),
  the census's generic-foundation rows, measured independent clusters
  (e.g. the pure image-mathematics slice), and — when the
  machinery-deconstruction ledger (MCP-603) lands — its
  construct-scale `generalises-to` rows. The register is a committed
  artefact with one disposition per row.
- **Gates hold; the directive sets ambition**: the frame's ten-gate
  promotion test still filters what becomes core. Where a would-be
  atom fails a gate today (typically the multiple-real-consumers
  gate), it is registered as a candidate-in-waiting and the batch's
  gate conflicts route to the owner at a card — the standing direction
  is read as raising priority and the excellence bar, never as
  deleting the gates. The owner may override per batch.
- **Conformance instrument at tranche one**: a validator that
  RECOMPUTES the bar — per-symbol TSDoc example-pair coverage, bench
  presence, export-surface strictness, packed smoke — so atom status
  is falsifiable structure, never a claim. Benchmark harness selection
  is verified against current vendor documentation at the first
  tranche's authoring, not prescribed here.
- **Per-tranche delivery nodes at pickup**, each a small-PR series
  (one atom or one coherent family per PR), declaring
  `serves: reliable-atoms-programme` — enumerate them by search,
  never a hand-kept list.

## Success looks like

- The atom register exists, is committed, and every row carries a
  disposition (at-bar / candidate / in-waiting with its gate blocker).
- The conformance instrument is green over every at-bar row, and its
  checks are recomputed, not recorded.
- Every existing `packages/core/*` member either meets the bar or
  holds a register row naming exactly what it lacks.
- Not claimed: performance optimisation beyond budget fences; any
  workspace-architecture outcome (the basis drive owns that space);
  extraction completeness — the register grows as the ledger and the
  landscape survey land, and rows are cheap.

## Delivery

Delivery plans serving this node declare
`serves: reliable-atoms-programme` and are authored by their
implementers at pickup. The first tranche's natural shape: the
register + the conformance instrument + one exemplar atom brought to
the full bar (proving the bar is reachable and the instrument honest)
— the exemplar chosen for high fan-out and small surface. Milestones
live in Linear; this node points, never mirrors.
