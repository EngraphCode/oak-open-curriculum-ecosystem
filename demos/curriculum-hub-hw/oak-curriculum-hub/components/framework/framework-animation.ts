/**
 * Pure geometry + timing helpers for the Learning Framework embed, reproduced from the canonical
 * export's `embeds/LearningFramework.jsx`. Kept pure and framework-embed-local so the ring geometry
 * and walk-through timing are unit-testable independently of the animated React island that consumes
 * them. Only the helpers the reproduction actually needs are ported — not the export's full generic
 * Stage/Sprite animation engine (per the "match appearance, not port the engine" directive).
 */

/**
 * A cartesian point on a circle of radius `r` centred at `(cx, cy)`. Screen-space angles: 0deg points
 * right, 90deg points down. Used to place the seven ring segments and their labels.
 */
export function polar(cx: number, cy: number, r: number, degrees: number): readonly [number, number] {
  const radians = (degrees * Math.PI) / 180;
  return [cx + r * Math.cos(radians), cy + r * Math.sin(radians)];
}

/** Geometry for one ring chevron: inner/outer radii, start/end angles (deg), and the chevron point. */
export interface ChevronSpec {
  readonly cx: number;
  readonly cy: number;
  readonly innerR: number;
  readonly outerR: number;
  readonly startDeg: number;
  readonly endDeg: number;
  /** Angular offset (deg) of the chevron's point beyond its trailing edge. */
  readonly pointDeg: number;
}

/**
 * SVG path for one chevron ring segment (an arc band with a forward point), reproduced from the
 * export's `chevronPath`. Composed from {@link polar} points; returned as an `<path d>` string.
 */
export function chevronPath(spec: ChevronSpec): string {
  const { cx, cy, innerR, outerR, startDeg, endDeg, pointDeg } = spec;
  const midR = (innerR + outerR) / 2;
  const [p1x, p1y] = polar(cx, cy, innerR, startDeg);
  const [p2x, p2y] = polar(cx, cy, innerR, endDeg);
  const [p3x, p3y] = polar(cx, cy, midR, endDeg + pointDeg);
  const [p4x, p4y] = polar(cx, cy, outerR, endDeg);
  const [p5x, p5y] = polar(cx, cy, outerR, startDeg);
  const [p6x, p6y] = polar(cx, cy, midR, startDeg + pointDeg);
  return `M${p1x},${p1y} A${innerR},${innerR} 0 0 1 ${p2x},${p2y} L${p3x},${p3y} L${p4x},${p4y} A${outerR},${outerR} 0 0 0 ${p5x},${p5y} L${p6x},${p6y} Z`;
}

/**
 * The active stage index for a looping walk-through: which of `stageCount` stages is showing after
 * `elapsedMs`, each shown for `perStageMs`, wrapping back to 0. Returns 0 for a non-positive interval
 * or an empty stage set (defensive — the caller then shows the first stage).
 */
export function walkStageIndex(elapsedMs: number, perStageMs: number, stageCount: number): number {
  if (perStageMs <= 0 || stageCount <= 0) {
    return 0;
  }
  const step = Math.floor(elapsedMs / perStageMs);
  return ((step % stageCount) + stageCount) % stageCount;
}
