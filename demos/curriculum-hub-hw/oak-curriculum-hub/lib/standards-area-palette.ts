/**
 * Guidance-area colour palette for the standards browser. Reproduces the canonical
 * `Oak Standards.dc.html` palette, assigning each area a stable colour by its first appearance
 * across the corpus so tags keep the same colour across renders.
 */

import { qualityStandards } from './static-quality-standards';

/** The canonical guidance-area tag palette (verbatim from `Oak Standards.dc.html`). */
const AREA_PALETTE: readonly string[] = [
  '#bef2bd',
  '#a0b6f2',
  '#b0e2de',
  '#deb7d5',
  '#fff2aa',
  '#ffc8a6',
  '#cdbdf2',
  '#93e892',
  '#7cd8d0',
];

/** Neutral tag colour for an area with no palette entry (defensive; every area gets one below). */
export const AREA_FALLBACK_COLOUR = '#eeeeee';

/** Map each guidance area to a stable colour by first appearance across the corpus. */
function buildAreaColours(): ReadonlyMap<string, string> {
  const colours = new Map<string, string>();
  for (const standard of qualityStandards) {
    for (const area of standard.areas) {
      if (!colours.has(area)) {
        const colour = AREA_PALETTE[colours.size % AREA_PALETTE.length] ?? AREA_FALLBACK_COLOUR;
        colours.set(area, colour);
      }
    }
  }
  return colours;
}

/** Computed once: the corpus is a build-time constant, so the colour map never changes. */
const AREA_COLOURS = buildAreaColours();

/** Distinct guidance areas, alphabetically ordered, for the filter rail. */
export const AREA_ORDER: readonly string[] = [...AREA_COLOURS.keys()].sort((a, b) => a.localeCompare(b));

/** Drop the "(CfUs)" qualifier for a compact display label. */
export function displayArea(area: string): string {
  return area.replace(/\s*\(CfUs\)/, '');
}

/** The colour assigned to a guidance area (fallback for the unexpected unmapped case). */
export function areaColour(area: string): string {
  return AREA_COLOURS.get(area) ?? AREA_FALLBACK_COLOUR;
}
