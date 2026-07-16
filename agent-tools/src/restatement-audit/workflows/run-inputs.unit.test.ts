import { isErr, isOk, unwrap } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import { metaRunDataFrom, reduceRunDataFrom, validateRunDataFrom } from './run-inputs.js';
import type { MapResult, ReduceResult, ValidateResult } from './stage-io.js';
import type { FinderInstance } from '../schemas.js';

function instance(overrides: Partial<FinderInstance> & Pick<FinderInstance, 'id'>): FinderInstance {
  return {
    file: 'a.md',
    line: 1,
    quote: 'stub',
    factClass: 'status-assertion',
    subject: 'G1',
    subjectFromGazetteer: true,
    predicate: 'status',
    valueNorm: 'done',
    assertionKind: 'authored',
    confidence: 'high',
    ...overrides,
  };
}

const mapResult: MapResult = {
  ok: true,
  partition: [{ window: 'W01', fileCount: 1 }],
  coverage: [{ window: 'W01', instanceCount: 2 }],
  mapComplete: true,
  incompleteWindows: [],
  instanceCount: 2,
  instances: [
    instance({ id: 'f1', file: 'a.md', line: 1, quote: 'discharged', valueNorm: 'discharged' }),
    instance({ id: 'f2', file: 'b.md', line: 2, quote: 'done', valueNorm: 'done' }),
  ],
};

const reduceResult: ReduceResult = {
  ok: true,
  instanceCount: 2,
  clusters: [
    {
      id: 'exact:status-assertion:G1:status',
      clusterKind: 'exact-key',
      factClass: 'status-assertion',
      subject: 'G1',
      predicate: 'status',
      verdict: 'conflict',
      distinctValueNorms: ['discharged', 'done'],
      memberInstanceIds: ['f1', 'f2'],
    },
  ],
};

describe('reduceRunDataFrom', () => {
  it('extracts instances from a successful map result', () => {
    const result = reduceRunDataFrom(mapResult);
    expect(isOk(result)).toBe(true);
    expect(unwrap(result).instances).toHaveLength(2);
  });

  it('errs on a failed map result', () => {
    expect(isErr(reduceRunDataFrom({ ok: false, error: 'boom' }))).toBe(true);
  });
});

describe('validateRunDataFrom', () => {
  it('joins reduce clusters with map-result grounding instances', () => {
    const result = validateRunDataFrom({
      mapResult,
      reduceResult,
      priorValidateResults: [],
      validateTokenCeiling: 1000,
    });
    expect(isOk(result)).toBe(true);
    const data = unwrap(result);
    expect(data.clusters).toHaveLength(1);
    expect(data.groundingInstances.map((i) => i.id).sort((a, b) => a.localeCompare(b))).toEqual([
      'f1',
      'f2',
    ]);
    expect(data.validateTokenCeiling).toBe(1000);
  });

  it('narrows to the unresolved tail on resume, using prior resolved ids', () => {
    const priorValidateResults: ValidateResult[] = [
      {
        ok: true,
        validateComplete: false,
        resolvedClusterIds: ['exact:status-assertion:G1:status'],
        incompleteClusterIds: [],
        missingClusterIds: [],
        dispositions: [],
        voterVerdicts: [],
      },
    ];
    const result = validateRunDataFrom({
      mapResult,
      reduceResult,
      priorValidateResults,
      validateTokenCeiling: 1000,
    });
    expect(isErr(result)).toBe(true);
  });

  it('errs on a failed reduce result', () => {
    const result = validateRunDataFrom({
      mapResult,
      reduceResult: { ok: false, error: 'boom' },
      priorValidateResults: [],
      validateTokenCeiling: 1000,
    });
    expect(isErr(result)).toBe(true);
  });
});

describe('metaRunDataFrom', () => {
  const flaggedValidateResult: ValidateResult = {
    ok: true,
    validateComplete: true,
    resolvedClusterIds: ['exact:status-assertion:G1:status'],
    incompleteClusterIds: [],
    missingClusterIds: [],
    dispositions: [
      { clusterId: 'exact:status-assertion:G1:status', disposition: 'flagged', reason: null },
    ],
    voterVerdicts: [],
  };

  it('projects only flagged clusters, with instance grounding', () => {
    const result = metaRunDataFrom({
      mapResult,
      reduceResult,
      validateResults: [flaggedValidateResult],
    });
    expect(isOk(result)).toBe(true);
    const data = unwrap(result);
    expect(data.clusters).toHaveLength(1);
    expect(data.clusters[0]?.instances).toHaveLength(2);
  });

  it('errs when no cluster is flagged', () => {
    const dismissed: ValidateResult = {
      ...flaggedValidateResult,
      dispositions: [
        { clusterId: 'exact:status-assertion:G1:status', disposition: 'dismissed', reason: null },
      ],
    };
    expect(isErr(metaRunDataFrom({ mapResult, reduceResult, validateResults: [dismissed] }))).toBe(
      true,
    );
  });

  it('keeps the LAST recorded disposition across multiple validate attempts for one cluster', () => {
    const first: ValidateResult = {
      ...flaggedValidateResult,
      dispositions: [
        {
          clusterId: 'exact:status-assertion:G1:status',
          disposition: 'held-for-review',
          reason: null,
        },
      ],
    };
    const second = flaggedValidateResult;
    const result = metaRunDataFrom({ mapResult, reduceResult, validateResults: [first, second] });
    expect(isOk(result)).toBe(true);
    expect(unwrap(result).clusters).toHaveLength(1);
  });

  it('errs on a failed reduce result', () => {
    const result = metaRunDataFrom({
      mapResult,
      reduceResult: { ok: false, error: 'boom' },
      validateResults: [flaggedValidateResult],
    });
    expect(isErr(result)).toBe(true);
  });
});
