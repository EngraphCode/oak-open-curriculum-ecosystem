/**
 * Pure computation of session context metadata from occupancy + window size.
 *
 * @remarks
 * Maps raw occupancy onto the owner-taught effectiveness curve in five bands:
 * healthy (under 40%), peak (40 to 50%), past-peak (50 to 65%), mistake-prone
 * (65 to 80%), degraded (80% and above). The zone is ADVISORY — a self-awareness
 * hint, never a forced action. Pure: no IO, no global state.
 *
 * @packageDocumentation
 */

/**
 * Advisory effectiveness zone derived from context occupancy. Module-private:
 * it surfaces structurally through {@link SessionContextMetadata.zone}; no
 * external consumer names it directly yet (re-export when one does).
 */
type EffectivenessZone = 'healthy' | 'peak' | 'past-peak' | 'mistake-prone' | 'degraded';

/** Structured session context metadata. */
export interface SessionContextMetadata {
  readonly usedTokens: number;
  readonly windowTokens: number;
  readonly remainingTokens: number;
  readonly pctUsed: number;
  readonly pctRemaining: number;
  readonly zone: EffectivenessZone;
  readonly advice: string;
}

interface ZoneAdvice {
  readonly zone: EffectivenessZone;
  readonly advice: string;
}

/**
 * Compute session context metadata from occupancy and window size.
 *
 * @param input - `usedTokens` (current occupancy) and `windowTokens` (model window).
 * @returns Structured metadata including remaining tokens, percentages, and the
 *   advisory effectiveness zone.
 */
export function computeMetadata(input: {
  readonly usedTokens: number;
  readonly windowTokens: number;
}): SessionContextMetadata {
  const remainingTokens = Math.max(0, input.windowTokens - input.usedTokens);
  const pctUsed = roundTo1(percentage(input.usedTokens, input.windowTokens));
  // Derive from the floored remaining so the two never disagree when occupancy
  // exceeds the window (a caller can pass a smaller window than the real one).
  const pctRemaining = roundTo1(percentage(remainingTokens, input.windowTokens));
  const { zone, advice } = classifyZone(pctUsed);

  return {
    usedTokens: input.usedTokens,
    windowTokens: input.windowTokens,
    remainingTokens,
    pctUsed,
    pctRemaining,
    zone,
    advice,
  };
}

function percentage(used: number, window: number): number {
  return window <= 0 ? 0 : (used / window) * 100;
}

function classifyZone(pctUsed: number): ZoneAdvice {
  if (pctUsed < 40) {
    return { zone: 'healthy', advice: 'full capacity; carry on' };
  }
  if (pctUsed < 50) {
    return { zone: 'peak', advice: 'best work; start eyeing a handover point' };
  }
  if (pctUsed < 65) {
    return { zone: 'past-peak', advice: 'past peak; pre-position a successor and hand off soon' };
  }
  if (pctUsed < 80) {
    return { zone: 'mistake-prone', advice: 'hand off now; reflect before acting' };
  }
  return { zone: 'degraded', advice: 'stop; hand off immediately' };
}

function roundTo1(value: number): number {
  return Math.round(value * 10) / 10;
}
