# DDR-010 — Comparison is visual first, statistics direct the looking

- **Status**: accepted (owner-directed, 2026-08-10)
- **IRI**: `urn:uuid:1f8a4c6e-4b0d-4f2f-9d5b-7c2e8a913d47`
- **Depends on**: [DDR-009 — measurement happens at canonical widths](009-measurement-happens-at-canonical-widths.md)

## Decision

Judging whether a rebuild matches its reference is done on **rendered
images, looked at**, never on markup, styling, or computed styles alone —
and the looking is directed by **windowed statistical rejection**, not by
linear pixel subtraction.

The method, end to end:

1. **Capture a pair at a matched canonical width** (DDR-009's set; the
   enforcement seam refuses free-hand widths). Same-width pairs are the
   only fair comparison — a mismatched simulated width once manufactured
   four phantom deltas in one screenshot ("black outlines, curved
   corners, smaller fonts" were a single 1440-vs-1280 scale artefact).
2. **Run the rejection statistics** (`visual-stats` in
   `@oaknational/fidelity-review`): per-pixel luma differences, a ROBUST
   noise scale (median absolute deviation × 1.4826 — divergent regions
   cannot hide themselves by inflating a naive σ), and per-window
   z-scores. A window "rejects being trivially different" at the stated
   threshold (default 6σ, 32px windows).
3. **Look at three images with the stats beside them**: left, right, and
   the heatmap (rejecting windows tinted ∝ z). The σ-scores are ordinal
   attention weights, not calibrated probabilities — pixel noise is
   neither independent nor Gaussian — so they ORDER the looking; the
   verdict on each region (matched-by-intent / divergent / instrument
   artefact) is the reader's, human or LLM.
4. **Corroborate with computed styles** to name the causal property once
   a region is flagged — computed probes localise causes, they never
   decide matches. The recorded failure mode: a computed-style probe
   over matched selectors reported near-total equality while the
   rendered pair showed an inverted band, a 64px inset, and a rhythm
   divergence the probe's selectors never framed.

## Reading discipline

- **The causal frontier**: one vertical offset shifts everything below
  it, so every later window rejects too. Read from the FIRST rejecting
  row downward (the tool prints it); the deepest-red window is rarely
  the cause.
- **Ruled divergences stay divergent**: a rejecting window over a
  register-dispositioned divergence is the instrument working, not a
  finding — adjudicate against the register, never re-tune the
  threshold to make ruled differences disappear (thresholds are method
  constants, not per-pair knobs).

## Instrument

`demos/oak-design-showcase/tools/capture-pair.ts`
(`pnpm exec tsx tools/capture-pair.ts --left <url> --right <url>
--width <canonical> --out <dir>`) writes
`<tag>-{left,right,heatmap}.png` + `<tag>-stats.json` and prints the
summary with the causal frontier. The statistics and PNG codec live in
`@oaknational/fidelity-review` (`/visual-stats`, `/png-codec`) — the
estate's one home for pixel machinery; the fidelity pipeline's
pixelmatch diff remains the regression-mass instrument, this method the
attention instrument.

## Known limits (roadmap, not caveats to hide behind)

Full-page pairs cascade after the first structural offset; per-region
alignment (compare region-by-region after anchoring on landmarks) and
viewport-height capture sets are the named next steps if the frontier
discipline proves insufficient in practice.
