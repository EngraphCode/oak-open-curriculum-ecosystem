/**
 * Static `md:` grid-column class literals, indexed by column count. Shared by
 * the columns, flip and stats grids (each caps the count to its own maximum).
 * Static literals because Tailwind's scanner cannot see runtime-composed class
 * strings, and a bare `repeat(n, 1fr)` floors at min-content and reflow-fails
 * at 320px (WCAG 1.4.10).
 */
const MD_GRID_COLS = [
  'md:grid-cols-1',
  'md:grid-cols-2',
  'md:grid-cols-3',
  'md:grid-cols-4',
] as const;

/** The `md:` grid class for `count` columns, capped at `max` (1..4). */
export function mdGridCols(count: number, max: number): string {
  const capped = Math.max(1, Math.min(count, max, MD_GRID_COLS.length));
  return MD_GRID_COLS[capped - 1] ?? MD_GRID_COLS[0];
}
