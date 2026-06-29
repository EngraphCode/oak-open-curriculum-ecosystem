import { isErr, isOk, unwrap } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import {
  baselineSchema,
  metaOutputSchema,
  parseBaseline,
  parseMetaOutput,
  recallMatchSchema,
} from './recall-schemas.js';

describe('baselineSchema', () => {
  const valid = {
    id: 'b1',
    statement: 'claims-doctrine evolution',
    kind: 'trajectory',
    population: 'emergent',
    sourceCitations: [{ synthesis: 'historical-napkin-synthesis-2026-05-29.md', locator: '§3' }],
  };

  it('parses a baseline with a pinned population and at least one citation', () => {
    expect(baselineSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a baseline with no source citations', () => {
    expect(baselineSchema.safeParse({ ...valid, sourceCitations: [] }).success).toBe(false);
  });

  it('round-trips a valid baseline through parseBaseline into an ok Result', () => {
    const parsed = parseBaseline(valid);
    expect(isOk(parsed)).toBe(true);
    expect(unwrap(parsed).population).toBe('emergent');
  });
});

describe('recallMatchSchema invariant', () => {
  it('parses a re-found match that names its candidate', () => {
    expect(
      recallMatchSchema.safeParse({
        baselineId: 'b1',
        verdict: 'subsumes',
        matchedCandidateId: 'c1',
        note: 're-found at finer grain',
      }).success,
    ).toBe(true);
  });

  it('parses a missed match with no candidate', () => {
    expect(
      recallMatchSchema.safeParse({ baselineId: 'b2', verdict: 'missed', note: 'out of remit' })
        .success,
    ).toBe(true);
  });

  it('rejects a missed match that names a candidate', () => {
    expect(
      recallMatchSchema.safeParse({
        baselineId: 'b2',
        verdict: 'missed',
        matchedCandidateId: 'c1',
        note: 'contradiction',
      }).success,
    ).toBe(false);
  });

  it('rejects a re-found match with no candidate', () => {
    expect(
      recallMatchSchema.safeParse({ baselineId: 'b1', verdict: 'partial', note: 'no candidate' })
        .success,
    ).toBe(false);
  });
});

describe('metaOutputSchema', () => {
  const valid = {
    recallMatches: [
      { baselineId: 'b1', verdict: 'subsumes', matchedCandidateId: 'c1', note: 'ok' },
    ],
    discountNote: 'treat the validated set as the recurring spine, not a complete inventory',
    synthesisNotes: ['the enforce-edge recurs across the series'],
  };

  it('parses a well-formed meta envelope of atomic judgments and prose', () => {
    expect(isOk(parseMetaOutput(valid))).toBe(true);
  });

  it('rejects a smuggled aggregate — the exact shape of the v1 defect', () => {
    // The whole point of v2: the meta agent cannot even emit a self-reported recall
    // number. The strict boundary rejects { ...valid, reFound: 13 } so the 0.72 defect
    // is structurally impossible at the schema, not merely corrected downstream.
    expect(metaOutputSchema.safeParse({ ...valid, reFound: 13 }).success).toBe(false);
    expect(isErr(parseMetaOutput({ ...valid, recall: 0.72 }))).toBe(true);
  });
});
