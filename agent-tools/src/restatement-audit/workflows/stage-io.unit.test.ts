import { isErr, isOk } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import {
  parseMapResult,
  parseMapRunData,
  parseMetaResult,
  parseMetaRunData,
  parseReduceResult,
  parseReduceRunData,
  parseValidateResult,
  parseValidateRunData,
} from './stage-io.js';

/**
 * VALUE-loads `stage-io.ts` and exercises all eight boundary parsers. The value-load is
 * itself the regression pin: the module once crashed at load on the seeding path
 * (`.pick()` on a refined zod object schema) while the suite stayed green because every
 * test import of this module was type-only — erased at compile time, so the crashing
 * module never loaded under vitest.
 */

const gazetteer = {
  subjects: { gates: ['G1'] },
  statusVocabulary: ['done', 'discharged'],
};

const finderInstance = {
  id: 'W01-I01',
  file: 'a.md',
  line: 1,
  quote: 'G1 — DONE 2026-07-07',
  factClass: 'status-assertion',
  subject: 'G1',
  subjectFromGazetteer: true,
  predicate: 'status',
  valueNorm: 'done',
  assertionKind: 'authored',
  confidence: 'high',
};
const secondInstance = {
  ...finderInstance,
  id: 'W01-I02',
  file: 'b.md',
  quote: 'G1 — DISCHARGED 2026-07-07',
  valueNorm: 'discharged',
};

const cluster = {
  id: 'exact:status-assertion:G1:status',
  clusterKind: 'exact-key',
  factClass: 'status-assertion',
  subject: 'G1',
  predicate: 'status',
  verdict: 'conflict',
  distinctValueNorms: ['done', 'discharged'],
  memberInstanceIds: ['W01-I01', 'W01-I02'],
};

const groundingInstance = {
  id: 'W01-I01',
  file: 'a.md',
  line: 1,
  quote: 'G1 — DONE 2026-07-07',
  valueNorm: 'done',
  assertionKind: 'authored',
};
const secondGrounding = { ...groundingInstance, id: 'W01-I02', valueNorm: 'discharged' };

const ledgerRow = {
  disposition: 'flagged',
  id: 'exact:status-assertion:G1:status',
  factClass: 'status-assertion',
  subject: 'G1',
  predicate: 'status',
  verdict: 'conflict',
  instances: [
    { id: 'W01-I01', file: 'a.md', line: 1, quote: 'G1 — DONE 2026-07-07', valueNorm: 'done' },
    {
      id: 'W01-I02',
      file: 'b.md',
      line: 2,
      quote: 'G1 — DISCHARGED 2026-07-07',
      valueNorm: 'discharged',
    },
  ],
  droppedMembers: [],
  sourceOfTruth: null,
  proposedCure: 'cite-register',
  severity: 'high',
  metaNotes: '',
};

const heldLedgerRow = {
  disposition: 'held-for-review',
  id: 'exact:status-assertion:G1:ratification-status',
  factClass: 'status-assertion',
  subject: 'G1',
  predicate: 'ratification-status',
  verdict: 'latent',
  instances: [
    { id: 'W01-I03', file: 'a.md', line: 3, quote: 'G1 ratified', valueNorm: 'ratified' },
    { id: 'W01-I04', file: 'b.md', line: 4, quote: 'G1 ratified', valueNorm: 'ratified' },
  ],
  heldNote: 'voters disagreed — triage via the validate checkpoint voterVerdicts',
};

describe('run-data parsers', () => {
  it('parseMapRunData accepts a windowed partition with the projected gazetteer', () => {
    const result = parseMapRunData({
      windows: [{ window: 'W01', files: ['a.md'] }],
      gazetteer,
    });
    expect(isOk(result)).toBe(true);
  });

  it('parseMapRunData rejects an empty partition', () => {
    expect(isErr(parseMapRunData({ windows: [], gazetteer }))).toBe(true);
  });

  it('parseReduceRunData accepts instances, including an EMPTY set — a complete zero-instance map is a clean corpus that must be seedable', () => {
    expect(isOk(parseReduceRunData({ instances: [finderInstance] }))).toBe(true);
    expect(isOk(parseReduceRunData({ instances: [] }))).toBe(true);
  });

  it('parseReduceRunData rejects an instance whose value normalises to the empty string', () => {
    const empty = { ...finderInstance, valueNorm: '.' };
    expect(isErr(parseReduceRunData({ instances: [empty] }))).toBe(true);
  });

  it('parseValidateRunData accepts clusters with grounding and an explicit ceiling', () => {
    const result = parseValidateRunData({
      clusters: [cluster],
      groundingInstances: [groundingInstance, secondGrounding],
      resolvedClusterIds: [],
      validateTokenCeiling: 500_000,
    });
    expect(isOk(result)).toBe(true);
  });

  it('parseValidateRunData rejects a missing ceiling', () => {
    expect(
      isErr(
        parseValidateRunData({
          clusters: [cluster],
          groundingInstances: [groundingInstance],
          resolvedClusterIds: [],
        }),
      ),
    ).toBe(true);
  });

  it('parseMetaRunData accepts EMPTY cluster sets — a clean audit seeds a zero-row ledger', () => {
    expect(isOk(parseMetaRunData({ clusters: [], heldClusters: [] }))).toBe(true);
  });

  it('parseMetaRunData accepts flagged + held clusters and rejects duplicate cluster ids across both', () => {
    const metaCluster = {
      id: cluster.id,
      factClass: cluster.factClass,
      subject: cluster.subject,
      predicate: cluster.predicate,
      verdict: cluster.verdict,
      instances: [groundingInstance, secondGrounding],
    };
    expect(isOk(parseMetaRunData({ clusters: [metaCluster], heldClusters: [] }))).toBe(true);
    expect(isOk(parseMetaRunData({ clusters: [], heldClusters: [metaCluster] }))).toBe(true);
    expect(
      isErr(parseMetaRunData({ clusters: [metaCluster, metaCluster], heldClusters: [] })),
    ).toBe(true);
    // A cluster cannot be flagged AND held — the duplicate check spans both arrays.
    expect(isErr(parseMetaRunData({ clusters: [metaCluster], heldClusters: [metaCluster] }))).toBe(
      true,
    );
  });

  it('parseMetaRunData rejects data missing heldClusters', () => {
    expect(isErr(parseMetaRunData({ clusters: [] }))).toBe(true);
  });
});

describe('result parsers', () => {
  it('parseMapResult accepts both arms of the discriminated union', () => {
    expect(isOk(parseMapResult({ ok: false, error: 'boom' }))).toBe(true);
    expect(
      isOk(
        parseMapResult({
          ok: true,
          partition: [{ window: 'W01', fileCount: 1 }],
          coverage: [{ window: 'W01', instanceCount: 2 }],
          mapComplete: true,
          incompleteWindows: [],
          instanceCount: 2,
          instances: [finderInstance, secondInstance],
        }),
      ),
    ).toBe(true);
  });

  it('parseMapResult rejects duplicate instance ids across windows', () => {
    expect(
      isErr(
        parseMapResult({
          ok: true,
          partition: [{ window: 'W01', fileCount: 1 }],
          coverage: [{ window: 'W01', instanceCount: 2 }],
          mapComplete: true,
          incompleteWindows: [],
          instanceCount: 2,
          instances: [finderInstance, finderInstance],
        }),
      ),
    ).toBe(true);
  });

  it('parseReduceResult requires the completeness envelope fields', () => {
    expect(
      isOk(
        parseReduceResult({
          ok: true,
          instanceCount: 2,
          clusters: [cluster],
          reduceComplete: true,
          incompleteChunks: [],
        }),
      ),
    ).toBe(true);
    expect(isErr(parseReduceResult({ ok: true, instanceCount: 2, clusters: [cluster] }))).toBe(
      true,
    );
  });

  it('parseValidateResult accepts a full verdict envelope', () => {
    const verdict = {
      sameFact: { pass: true, confidence: 'high' },
      authoredNotCited: { pass: true, confidence: 'high' },
      genuineConflict: { pass: true, confidence: 'med' },
      liveSurface: { pass: true, confidence: 'high' },
      importance: 'high',
    };
    expect(
      isOk(
        parseValidateResult({
          ok: true,
          validateComplete: true,
          resolvedClusterIds: [cluster.id],
          incompleteClusterIds: [],
          missingClusterIds: [],
          dispositions: [{ clusterId: cluster.id, disposition: 'flagged', reason: null }],
          voterVerdicts: [{ clusterId: cluster.id, voterId: 'v1', verdict }],
        }),
      ),
    ).toBe(true);
  });

  it('parseMetaResult accepts flagged AND held ledger rows, and rejects a malformed row', () => {
    expect(isOk(parseMetaResult({ ok: true, rows: [ledgerRow, heldLedgerRow] }))).toBe(true);
    expect(
      isErr(parseMetaResult({ ok: true, rows: [{ ...ledgerRow, proposedCure: 'improvise' }] })),
    ).toBe(true);
  });
});
