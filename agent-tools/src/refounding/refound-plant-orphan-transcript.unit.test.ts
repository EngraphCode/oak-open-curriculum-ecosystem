import { describe, expect, it } from 'vitest';

import {
  buildDiscriminationTranscript,
  parseDiscriminationTranscript,
  type PlantOrphanOutcome,
} from './refound-plant-orphan-transcript.js';

/**
 * Pure behaviours of the transcript boundary: a rendered transcript
 * round-trips through the strict parse, and the parse REFUSES everything a
 * genuine proof run could not have written — no machine block, corrupt
 * JSON, schema violations, and recorded outcomes whose
 * every-detector-fired invariants do not hold.
 */

const sampleOutcome = (): PlantOrphanOutcome => ({
  preamble: {
    file: 'plans/pilot/a.md',
    lineStart: 1,
    lineEnd: 30,
    reasons: ['file-preamble'],
  },
  keyword: {
    file: 'plans/pilot/a.md',
    plantedLine: 2,
    misspeltInInventory: false,
    misspeltInResidueBlock: true,
    controlNets: ['C'],
    netCShift: 1,
  },
  sweep: {
    file: 'prompts/opener.md',
    plantedLine: 3,
    plantPresentInCopy: true,
    sweepHitsForPlant: 0,
    sweepHitsForControl: 1,
  },
});

describe('parseDiscriminationTranscript', () => {
  it('round-trips a rendered transcript back to its outcome', () => {
    const outcome = sampleOutcome();
    const parsed = parseDiscriminationTranscript(buildDiscriminationTranscript(outcome));
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value).toEqual(outcome);
    }
  });

  it('refuses a header-only stub (the founding path-only-gate hole)', () => {
    const parsed = parseDiscriminationTranscript('# Orphan-discrimination proof (v1)\n');
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.error.message).toContain('no machine-readable outcome block');
    }
  });

  it('refuses corrupt JSON and unknown-key outcomes (closed schema)', () => {
    expect(parseDiscriminationTranscript('```json\nnot json\n```\n').ok).toBe(false);
    const extraKey = { ...sampleOutcome(), extra: true };
    expect(
      parseDiscriminationTranscript(`\`\`\`json\n${JSON.stringify(extraKey, null, 2)}\n\`\`\`\n`)
        .ok,
    ).toBe(false);
  });

  it('refuses a recorded outcome whose detectors did not all fire', () => {
    const tampered: PlantOrphanOutcome = {
      ...sampleOutcome(),
      sweep: { ...sampleOutcome().sweep, sweepHitsForPlant: 1 },
    };
    const parsed = parseDiscriminationTranscript(buildDiscriminationTranscript(tampered));
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.error.message).toContain('invariants unsatisfied');
      expect(parsed.error.message).toContain('marker-free sweep plant was hit');
    }
  });
});
