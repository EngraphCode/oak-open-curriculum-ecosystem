---
id: design-system-as-configured-framework
node_type: strategic
name: "The design system as a configured framework"
overview: "The Oak Open Curriculum Design System as a layered, identity-agnostic framework in which Oak itself is configuration: general mechanism below, identity data above, with the constrained (non-MIT) surface kept structurally minimal. Professional-designer visual quality is the acceptance bar for every surface that presents the system."
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: APP-1
impact_areas:
  - design-system
gate_expiry_default: P21D
depends_on: []
owner_gates: []
tickets: []
last_updated: 2026-08-02
---

# The design system as a configured framework

## Kernel (owner words, 2026-08-02, Director session Magnetar binds Oblivion 74d914)

- "A system broken down into layers. The bottom layers are the most reusable, the top
  layers the most specific."
- "The Oak specific parts are kept as thin as possible, ideally no more than some config
  passed to a general framework."
- The system "trivially" supports an arbitrary number of identities; each identity an
  arbitrary number of themes, with light, dark, and high-contrast non-negotiable and
  colour-safe a sensible default inclusion.
- The visual bar, verbatim: "a way that a professional designer would look at and think
  'wow, that looks good'" — later strengthened to "I want to look at each and every demo
  and think 'wow, that looks _amazing_'".

## Why strategic

The identity-as-configuration thesis is the same split the licensing model makes legible
(code MIT, content OGL, marks reserved — owner ruling 2026-08-02): the reusability
argument and the constraint-surface argument are one architecture seen from two sides.
Every delivery decision in this strand resolves against the kernel above: mechanism
generalises downward, identity thins upward, and quality claims become structural
(schemas, gates, generated documentation) rather than remembered.

## Falsifiability

The thesis fails if adding or modifying an identity requires framework-code changes
(the identity-№N test), or if the constrained brand surface grows faster than the
general mechanism beneath it. Delivery nodes serving this strand carry the mechanical
forms of these falsifiers.
