/**
 * Pure SC 1.4.11 (non-text contrast) calculator for a focus ring expressed
 * as a computed `box-shadow` list, operationalised as the criterion's own
 * ADJACENCY CHAIN — never best-of-any-layer: WCAG 2.2 Understanding 1.4.11
 * defines adjacency pairwise ("the adjacent color might be another part of
 * the component"; "either part of the indicator could provide contrast").
 * Geometry-bearing, non-inset layers order outermost→innermost by spread;
 * the surface prepends the chain; the ring passes when any ADJACENT PAIR
 * holds the ratio. Layer colours composite their alpha over the surface
 * before measuring — a 5% alpha layer must score as rendered, not nominal
 * (a mid-transition frame is exactly that shape). `none`, transparent-only
 * and geometry-less shadows score 0.
 *
 * Zero IO: the Playwright spec owns the browser reads (computed shadow +
 * nearest non-transparent ancestor background) and delegates every
 * judgement here, so the measurement logic is unit-testable with literal
 * fixtures instead of living untested inside a spec file.
 */

export type Rgba = readonly [number, number, number, number];

export function parseColour(c: string): Rgba | null {
  const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/.exec(c);
  return m === null
    ? null
    : [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])];
}

function luminance(c: Rgba): number {
  const [r, g, b] = [c[0], c[1], c[2]].map((v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

function contrastRatio(a: Rgba, b: Rgba): number {
  const [la, lb] = [luminance(a), luminance(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Split a computed box-shadow list at top-level commas only — colour
 *  functions carry commas inside their parens. */
function splitShadowLayers(shadow: string): readonly string[] {
  const layers: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < shadow.length; i += 1) {
    if (shadow[i] === '(') {
      depth += 1;
    } else if (shadow[i] === ')') {
      depth -= 1;
    } else if (shadow[i] === ',' && depth === 0) {
      layers.push(shadow.slice(start, i));
      start = i + 1;
    }
  }
  layers.push(shadow.slice(start));
  return layers;
}

function compositeOverSurface(layer: Rgba, surface: Rgba): Rgba {
  const alpha = layer[3];
  return [
    alpha * layer[0] + (1 - alpha) * surface[0],
    alpha * layer[1] + (1 - alpha) * surface[1],
    alpha * layer[2] + (1 - alpha) * surface[2],
    1,
  ];
}

/** The adjacency-chain verdict: best contrast over the ADJACENT pairs of
 *  [surface, outermost layer, …, innermost layer], with layer colours
 *  composited over the surface first. Inset layers paint over the control's
 *  own background, not the ring boundary, and are excluded. */
export function ringChainContrast(shadow: string, surface: Rgba): number {
  if (shadow === 'none') {
    return 0;
  }
  const layers = splitShadowLayers(shadow)
    .filter((layer) => !/\binset\b/.test(layer))
    .flatMap((layer) => {
      // No regex for the length grammar: every regex form here (alternation
      // or greedy-class-before-literal) is genuinely super-linear on
      // non-matching runs — Sonar was right three patterns in a row. The
      // computed serialisation is whitespace-tokenised, so a linear split
      // plus Number() is the whole parse; a malformed token scores as zero
      // geometry, holding the layer's index positions stable.
      const px = layer
        .split(/\s+/)
        .filter((token) => token.endsWith('px'))
        .map((token) => Number(token.slice(0, -2)))
        .map((value) => (Number.isNaN(value) ? 0 : value));
      const colour = parseColour(layer);
      return colour !== null && px.some((n) => n !== 0) ? [{ colour, spread: px[3] ?? 0 }] : [];
    })
    .sort((a, b) => b.spread - a.spread);
  let previous = surface;
  let best = 0;
  for (const layer of layers) {
    const composited = compositeOverSurface(layer.colour, surface);
    best = Math.max(best, contrastRatio(previous, composited));
    previous = composited;
  }
  return best;
}
