# Design sitting records — 2026-08-05 (pre-register)

Durable recording of the owner's sitting verdicts and tweak enumeration from
the 2026-08-05 design-lane reopening sittings (W0.9 hub pre-read, W0.10
counter-identity pre-reads, W0.5 tweak enumeration), recorded at occurrence
by the design seat (Saffron guards Hedgerow, 8a4280) per the Director's
dispatch (comms event 2026-08-05T14:47:40Z). **Marked PRE-REGISTER**: the
wow-verdict register does not exist yet (the completion plan's W0.7 mints
it); every verdict row below migrates into that register at its minting, and
tweak entries feed W0.5's intake surface. Owner words are verbatim where
quoted; relay provenance is named per entry.

## Verdict 1 — showcase root: pre-read FAIL

- **Surface**: the design-showcase root page (served localhost:3020), browsed
  by the owner ~14:55Z.
- **Verdict**: FAIL (pre-read). Owner verbatim (Director relay, comms event
  14:56:30Z): "the showcase as is doesn't work, the 'oak' page has no
  relevant content and no styling, and I am pretty sure it doesn't use the
  design system we built."
- **Defects named**: no relevant content; no styling at render. Extends the
  standing 2026-08-02 rejection of the showcase page (recorded in the
  completion plan's taste calibration) with these two named defects.
- **Mechanism note** (Director first-hand, same event — a nuance on the
  consuming-suspicion, not a softening of the verdict): the root page markup
  DOES reference kit classes (`oak-canvas` / `oak-region` / `oak-container` /
  `oak-cluster` at `app/page.tsx:21-28`), so the defect surface is the CSS
  delivery/resolution path — or those structural classes lacking rules — not
  the markup's vocabulary. Diagnosis belongs to the lane at W1.5/W0.2; the
  verdict stands regardless of mechanism.
- **Sitting consequence**: the sitting moved to the Claude Design export
  (served statically at localhost:3030 from
  `packages/design/oak-design-system/studio-source/`), at the owner's
  instruction. Export-sitting verdicts follow below as they arrive.
