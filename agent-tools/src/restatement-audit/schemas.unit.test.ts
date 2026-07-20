import { isErr, isOk, unwrap } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import {
  clusterSchema,
  finderInstanceSchema,
  parseCluster,
  parseFinderInstance,
  parseVoterVerdict,
  voterVerdictSchema,
} from './schemas.js';

describe('finderInstanceSchema', () => {
  const valid = {
    id: 'f1',
    file: '.agent/plans-refounding/r2-lane-seed.v1.md',
    line: 42,
    quote: 'S0 completed 2026-07-14',
    factClass: 'status-assertion',
    subject: 's0-window-sample',
    subjectFromGazetteer: true,
    predicate: 'status',
    valueNorm: 'completed',
    assertionKind: 'authored',
    confidence: 'high',
  };

  it('parses a well-formed finder instance', () => {
    expect(finderInstanceSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an unknown field (strict boundary)', () => {
    expect(finderInstanceSchema.safeParse({ ...valid, extra: 1 }).success).toBe(false);
  });

  it('rejects a quote over 200 chars', () => {
    expect(finderInstanceSchema.safeParse({ ...valid, quote: 'x'.repeat(201) }).success).toBe(
      false,
    );
  });

  it('rejects a ":" inside subject or predicate — the fact-key join delimiter must not collide', () => {
    expect(finderInstanceSchema.safeParse({ ...valid, subject: 'a:b' }).success).toBe(false);
    expect(finderInstanceSchema.safeParse({ ...valid, predicate: 'b:c' }).success).toBe(false);
  });

  it('rejects a non-positive line', () => {
    expect(finderInstanceSchema.safeParse({ ...valid, line: 0 }).success).toBe(false);
  });

  it('round-trips a valid instance through parseFinderInstance into an ok Result', () => {
    const parsed = parseFinderInstance(valid);
    expect(isOk(parsed)).toBe(true);
    expect(unwrap(parsed).subject).toBe('s0-window-sample');
  });

  it('returns an err Result for an invalid instance rather than throwing', () => {
    expect(isErr(parseFinderInstance({ id: 'x' }))).toBe(true);
  });
});

describe('clusterSchema', () => {
  const conflict = {
    id: 'c1',
    clusterKind: 'exact-key',
    factClass: 'status-assertion',
    subject: 's0-window-sample',
    predicate: 'status',
    verdict: 'conflict',
    distinctValueNorms: ['completed', 'in-progress'],
    memberInstanceIds: ['f1', 'f2'],
  };
  const latent = { ...conflict, id: 'c2', verdict: 'latent', distinctValueNorms: ['completed'] };

  it('parses a well-formed conflict cluster', () => {
    expect(clusterSchema.safeParse(conflict).success).toBe(true);
  });

  it('parses a well-formed latent cluster', () => {
    expect(clusterSchema.safeParse(latent).success).toBe(true);
  });

  it('rejects a conflict cluster with only one distinct valueNorm', () => {
    expect(
      clusterSchema.safeParse({ ...conflict, distinctValueNorms: ['completed'] }).success,
    ).toBe(false);
  });

  it('rejects a latent cluster with more than one distinct valueNorm', () => {
    expect(
      clusterSchema.safeParse({ ...latent, distinctValueNorms: ['completed', 'done'] }).success,
    ).toBe(false);
  });

  it('rejects duplicated distinctValueNorms — a repeated norm is one value, never a conflict', () => {
    expect(
      clusterSchema.safeParse({ ...conflict, distinctValueNorms: ['done', 'done'] }).success,
    ).toBe(false);
  });

  it('rejects distinctValueNorms that collide UNDER normalizeValue — ["done", "Done."] is one value masquerading as a conflict', () => {
    expect(
      clusterSchema.safeParse({ ...conflict, distinctValueNorms: ['done', 'Done.'] }).success,
    ).toBe(false);
  });

  it('rejects a distinctValueNorm that is not its own normal form — the join computes every entry through normalizeValue, so a drifted checkpoint value fails loudly', () => {
    expect(clusterSchema.safeParse({ ...latent, distinctValueNorms: ['Completed.'] }).success).toBe(
      false,
    );
    expect(clusterSchema.safeParse({ ...latent, distinctValueNorms: ['completed'] }).success).toBe(
      true,
    );
  });

  it('rejects duplicate member instance ids', () => {
    expect(clusterSchema.safeParse({ ...conflict, memberInstanceIds: ['f1', 'f1'] }).success).toBe(
      false,
    );
  });

  it('rejects fewer than two members', () => {
    expect(clusterSchema.safeParse({ ...conflict, memberInstanceIds: ['f1'] }).success).toBe(false);
  });

  it('round-trips a valid cluster through parseCluster into an ok Result', () => {
    const parsed = parseCluster(conflict);
    expect(isOk(parsed)).toBe(true);
    expect(unwrap(parsed).verdict).toBe('conflict');
  });
});

describe('voterVerdictSchema', () => {
  const valid = {
    sameFact: { pass: true, confidence: 'high' },
    authoredNotCited: { pass: true, confidence: 'high' },
    genuineConflict: { pass: false, confidence: 'med' },
    liveSurface: { pass: true, confidence: 'high' },
    importance: 'high',
  };

  it('parses the four conjunctive tests plus importance', () => {
    expect(voterVerdictSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a missing test', () => {
    expect(
      voterVerdictSchema.safeParse({
        sameFact: { pass: true, confidence: 'high' },
        authoredNotCited: { pass: true, confidence: 'high' },
        liveSurface: { pass: true, confidence: 'high' },
        importance: 'high',
      }).success,
    ).toBe(false);
  });

  it('round-trips through parseVoterVerdict into an ok Result', () => {
    const parsed = parseVoterVerdict(valid);
    expect(isOk(parsed)).toBe(true);
    expect(unwrap(parsed).importance).toBe('high');
  });
});
