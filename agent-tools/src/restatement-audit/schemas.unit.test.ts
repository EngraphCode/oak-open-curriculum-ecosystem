import { isErr, isOk, unwrap } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import {
  clusterSchema,
  finderInstanceSchema,
  ledgerRowSchema,
  parseCluster,
  parseFinderInstance,
  parseLedgerRow,
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

describe('ledgerRowSchema', () => {
  const valid = {
    id: 'L1',
    factClass: 'status-assertion',
    subject: 's0-window-sample',
    predicate: 'status',
    verdict: 'conflict',
    instances: [
      { file: 'a.md', line: 1, quote: 'completed', valueNorm: 'completed' },
      { file: 'b.md', line: 2, quote: 'in progress', valueNorm: 'in-progress' },
    ],
    sourceOfTruth: null,
    proposedCure: 'new-single-source',
    severity: 'high',
    metaNotes: 'two docs disagree on S0 status',
  };

  it('parses a well-formed ledger row with a null sourceOfTruth', () => {
    expect(ledgerRowSchema.safeParse(valid).success).toBe(true);
  });

  it('parses a well-formed ledger row with a concrete sourceOfTruth', () => {
    expect(
      ledgerRowSchema.safeParse({ ...valid, sourceOfTruth: 'owner-gate-register.md' }).success,
    ).toBe(true);
  });

  it('rejects a proposedCure outside the closed menu', () => {
    expect(
      ledgerRowSchema.safeParse({ ...valid, proposedCure: 'rewrite-everything' }).success,
    ).toBe(false);
  });

  it('rejects fewer than two instances', () => {
    expect(ledgerRowSchema.safeParse({ ...valid, instances: [valid.instances[0]] }).success).toBe(
      false,
    );
  });

  it('round-trips through parseLedgerRow into an ok Result', () => {
    const parsed = parseLedgerRow(valid);
    expect(isOk(parsed)).toBe(true);
    expect(unwrap(parsed).proposedCure).toBe('new-single-source');
  });
});
