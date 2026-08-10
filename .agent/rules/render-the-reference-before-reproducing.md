# Render the Reference Before Reproducing

Reproduction work builds against pixels it has seen. Any work whose
acceptance is "matches X" — a page against a design export, a component
against a mock, an artefact against a reference of any kind — opens by
RENDERING X and capturing it, and every fidelity claim the work makes
cites that captured reference.

## Trigger

Beginning work whose acceptance criterion is likeness to a reference
artefact; or reviewing such work's fidelity claim.

## Action

1. Serve or render the reference ITSELF — not a description of it, not its
   source — and look at it before building anything against it.
2. Capture it at the canonical measurement widths
   ([DDR-009](../../docs/design/design-decisions/009-measurement-happens-at-canonical-widths.md);
   values owned by
   [`measurement-widths.ts`](../../demos/oak-design-showcase/tools/measurement-widths.ts))
   into the work's reference set. Playwright is the standard instrument
   for both capture and probes.
3. Cite the captured reference in every "matches" claim. A likeness claim
   with no reference capture behind it is unverifiable, and is treated as
   unmade.
4. Compare at the same widths, reference against rebuild, from the first
   buildable slice onward — never only at the end.

## Why This Rule Exists (Worked Instance)

2026-08-10: a seat reproduced a design export for a full working window
without once rendering it. Every instrument pointed at the export — the
fidelity pair map targeted it, a naming census counted it, review verdicts
quoted its line numbers — and every gate ran green while the built page,
placed beside the target, was a broken sliver next to a finished product.
The owner caught it by eye; the method permitted it structurally, because
nothing required the reference to be SEEN before building began. This rule
closes that path: the comparison exists from the first commit, not the
last.

## Related Surfaces

- [DDR-009 — measurement happens at canonical widths](../../docs/design/design-decisions/009-measurement-happens-at-canonical-widths.md)
  and the measurement-widths module: the WHERE of every capture.
- [The Claude Design conversion playbook](../../docs/engineering/claude-design-conversion-playbook.md)
  §"Reference first" — this rule's application inside that pipeline.
- [`fidelity-review` SKILL](../skills/fidelity-review/SKILL-CANONICAL.md)
  — the comparison-and-disposition workflow this rule front-loads.
- [`design-values-come-from-the-system`](design-values-come-from-the-system.md)
  — the sibling discipline for the build side of the same work.

## Enforcement

Behavioural at work-start; mechanical downstream. The fidelity capture
tooling refuses free-hand widths (`assertCanonicalWidth` beside the
canonical set), so a comparison outside the canonical widths cannot be
produced; and the review workflow requires every declared pair to carry a
reference target or an explicit exemption — absence is recorded, never
silent.
