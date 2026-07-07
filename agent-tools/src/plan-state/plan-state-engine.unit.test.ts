import { describe, expect, it } from 'vitest';

import {
  decideGateVerdict,
  derivePlanState,
  serialisePlanStateReport,
  type PlanStateInput,
} from './plan-state-engine.js';
import {
  type ClaimRow,
  type EvidenceVerdict,
  type ProofKind,
  type RecomputableProofKind,
} from './plan-state-model.js';
import { STATUS_MAPPING_TABLE_V1 } from './status-mapping/v1.js';

/** Compile-time proof: the recomputable set is exactly ProofKind minus attested. */
type MutuallyEqual<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never;
const recomputableIsProofMinusAttested: MutuallyEqual<
  RecomputableProofKind,
  Exclude<ProofKind, 'attested'>
> = true;

const claim = (over: Partial<ClaimRow> & Pick<ClaimRow, 'key'>): ClaimRow => ({
  recordedStatus: 'completed',
  proof: null,
  ...over,
});

const green = (key: string, over: Partial<EvidenceVerdict> = {}): EvidenceVerdict => ({
  key,
  kind: 'gate',
  verdict: 'green',
  detail: null,
  ...over,
});

const red = (key: string, over: Partial<EvidenceVerdict> = {}): EvidenceVerdict => ({
  ...green(key, over),
  verdict: 'red',
});

const derive = (input: Partial<PlanStateInput>) =>
  derivePlanState({ claims: [], evidence: [], table: STATUS_MAPPING_TABLE_V1, ...input });

/** The derived report, or null on refusal (assertions then read as undefined). */
const reportOf = (input: Partial<PlanStateInput>) => {
  const result = derive(input);
  return result.ok ? result.value : null;
};

const rowsOf = (input: Partial<PlanStateInput>) => reportOf(input)?.rows ?? [];

describe('derivePlanState — the two-direction gate', () => {
  it('flags recorded-done-but-red: a falsified completed status goes red (mutation direction 1)', () => {
    const rows = rowsOf({
      claims: [claim({ key: 'p.md#t1', recordedStatus: 'completed' })],
      evidence: [red('p.md#t1')],
    });
    expect(rows[0]?.rowClass).toBe('recorded-done-but-red');
  });

  it('flags recorded-pending-but-green: the truing worked example (mutation direction 2)', () => {
    // In-memory copy of the live instance this branch trued at 7c984a555.
    const rows = rowsOf({
      claims: [
        claim({
          key: 'plans/product-development-governance/active/plan-corpus-refounding.plan.md#r0a-mechanical-instrument',
          recordedStatus: ' pending',
        }),
      ],
      evidence: [
        green(
          'plans/product-development-governance/active/plan-corpus-refounding.plan.md#r0a-mechanical-instrument',
        ),
      ],
    });
    expect(rows[0]?.rowClass).toBe('recorded-pending-but-green');
    expect(rows[0]?.canonicalClaim).toBe('pending');
  });

  it('reads consistent in both honest directions', () => {
    const rows = rowsOf({
      claims: [
        claim({ key: 'p.md#done', recordedStatus: 'completed' }),
        claim({ key: 'p.md#open', recordedStatus: 'pending' }),
      ],
      evidence: [green('p.md#done'), red('p.md#open')],
    });
    expect(rows.map((row) => row.rowClass)).toEqual(['consistent', 'consistent']);
  });

  it('poisons a completed claim on ANY red among mixed evidence', () => {
    const rows = rowsOf({
      claims: [claim({ key: 'p.md#t1', recordedStatus: 'done' })],
      evidence: [green('p.md#t1'), red('p.md#t1', { kind: 'artifact' })],
    });
    expect(rows[0]?.rowClass).toBe('recorded-done-but-red');
  });

  it('holds a pending claim consistent when evidence disagrees internally', () => {
    const rows = rowsOf({
      claims: [claim({ key: 'p.md#t1', recordedStatus: 'pending' })],
      evidence: [green('p.md#t1'), red('p.md#t1', { kind: 'artifact' })],
    });
    expect(rows[0]?.rowClass).toBe('consistent');
  });
});

describe('derivePlanState — counted, never-gating classes', () => {
  it('counts unmapped-status residue with distinct trimmed values', () => {
    const result = derive({
      claims: [
        claim({ key: 'a.md#t1', recordedStatus: 'superseded' }),
        claim({ key: 'a.md#t2', recordedStatus: 'completed' }),
        claim({ key: 'a.md#t3', recordedStatus: 'completed' }),
        claim({ key: 'a.md#t4', recordedStatus: 'pending' }),
        claim({ key: 'a.md#t5', recordedStatus: 'done' }),
      ],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value.summary.unmapped).toEqual({ count: 1, distinctValues: ['superseded'] });
    expect(result.value.rows[0]?.rowClass).toBe('unmapped-status');
    expect(result.value.rows[0]?.canonicalClaim).toBeNull();
  });

  it('halts strictly over the 20% UNMAPPED band and writes nothing (integer arithmetic)', () => {
    const mapped = ['t2', 't3', 't4', 't5'].map((id) =>
      claim({ key: `a.md#${id}`, recordedStatus: 'pending' }),
    );
    const atBand = derive({
      claims: [claim({ key: 'a.md#t1', recordedStatus: 'mystery' }), ...mapped],
    });
    expect(atBand.ok).toBe(true); // 1 of 5 = exactly 20%: no halt
    const overBand = derive({
      claims: [
        claim({ key: 'a.md#t0', recordedStatus: 'enigma' }),
        claim({ key: 'a.md#t1', recordedStatus: 'mystery' }),
        ...mapped.slice(0, 3),
      ],
    });
    expect(overBand.ok).toBe(false); // 2 of 5 = 40%: halt
    if (!overBand.ok) {
      expect(overBand.error.message).toContain('halt-and-inspect');
    }
  });

  it('classes a proof-less claim with no evidence as no-evidence, never green-by-absence', () => {
    const rows = rowsOf({ claims: [claim({ key: 'a.md#t1', recordedStatus: 'completed' })] });
    expect(rows[0]?.rowClass).toBe('no-evidence');
  });

  it('classes an attested-proof claim as attested (reported signal, never a gate)', () => {
    const rows = rowsOf({
      claims: [
        claim({
          key: 'a.md#t1',
          recordedStatus: 'completed',
          proof: { kind: 'attested', ref: 'owner-2026-07-06' },
        }),
      ],
    });
    expect(rows[0]?.rowClass).toBe('attested');
  });
});

describe('derivePlanState — refusals (Err, nothing computed)', () => {
  it('refuses duplicate claim keys', () => {
    const result = derive({
      claims: [claim({ key: 'a.md#t1' }), claim({ key: 'a.md#t1' })],
    });
    expect(result.ok).toBe(false);
  });

  it('refuses evidence for an unknown claim key', () => {
    const result = derive({
      claims: [claim({ key: 'a.md#t1' })],
      evidence: [green('a.md#ghost')],
    });
    expect(result.ok).toBe(false);
  });

  it('refuses evidence injected against an attested proof', () => {
    const result = derive({
      claims: [claim({ key: 'a.md#t1', proof: { kind: 'attested', ref: 'owner-2026-07-06' } })],
      evidence: [green('a.md#t1')],
    });
    expect(result.ok).toBe(false);
  });

  it('refuses evidence whose kind contradicts the declared proof kind', () => {
    const result = derive({
      claims: [claim({ key: 'a.md#t1', proof: { kind: 'artifact', ref: 'reports/x.md' } })],
      evidence: [green('a.md#t1', { kind: 'gate' })],
    });
    expect(result.ok).toBe(false);
  });

  it('refuses evidence supplied with zero claims', () => {
    const result = derive({ evidence: [green('a.md#t1')] });
    expect(result.ok).toBe(false);
  });
});

describe('derivePlanState — determinism and the vacuous class', () => {
  const shuffledInput = (order: 'forward' | 'reverse'): PlanStateInput => {
    // Five rows, one unmapped: exactly the 20% band edge, so no halt fires.
    const claims = [
      claim({ key: 'b.md#t1', recordedStatus: 'pending' }),
      claim({ key: 'a.md#t2', recordedStatus: 'completed' }),
      claim({ key: 'a.md#t1', recordedStatus: 'nonesuch' }),
      claim({ key: 'c.md#t1', recordedStatus: 'completed' }),
      claim({ key: 'c.md#t2', recordedStatus: 'done' }),
    ];
    const evidence = [
      green('b.md#t1'),
      red('a.md#t2'),
      green('a.md#t2', { kind: 'probe' }),
      green('c.md#t2'),
    ];
    return {
      claims: order === 'forward' ? claims : [...claims].reverse(),
      evidence: order === 'forward' ? evidence : [...evidence].reverse(),
      table: STATUS_MAPPING_TABLE_V1,
    };
  };

  it('serialises byte-identically across double-run AND input permutation', () => {
    const first = derivePlanState(shuffledInput('forward'));
    const second = derivePlanState(shuffledInput('forward'));
    const permuted = derivePlanState(shuffledInput('reverse'));
    expect(first.ok && second.ok && permuted.ok).toBe(true);
    if (!first.ok || !second.ok || !permuted.ok) {
      return;
    }
    const bytes = serialisePlanStateReport(first.value);
    expect(serialisePlanStateReport(second.value)).toBe(bytes);
    expect(serialisePlanStateReport(permuted.value)).toBe(bytes);
    expect(bytes.endsWith('\n')).toBe(true);
  });

  it('sorts rows by key and includes every class in the closed byClass list', () => {
    const result = derivePlanState(shuffledInput('forward'));
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value.rows.map((row) => row.key)).toEqual([
      'a.md#t1',
      'a.md#t2',
      'b.md#t1',
      'c.md#t1',
      'c.md#t2',
    ]);
    expect(result.value.summary.byClass.map((entry) => entry.rowClass)).toEqual([
      'consistent',
      'recorded-done-but-red',
      'recorded-pending-but-green',
      'unmapped-status',
      'no-evidence',
      'attested',
    ]);
  });

  it('emits the named vacuous report on zero claims', () => {
    const result = derive({});
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value.summary.vacuous).toBe(true);
    expect(result.value.rows).toEqual([]);
  });
});

describe('decideGateVerdict — the gate-semantics table', () => {
  /** The gate exit code for an input, or null on refusal. */
  const gateExit = (input: Partial<PlanStateInput>): number | null => {
    const report = reportOf(input);
    return report === null ? null : decideGateVerdict(report).exitCode;
  };

  it('exits non-zero on each divergence class and zero on consistent', () => {
    expect(gateExit({ claims: [claim({ key: 'k#1' })], evidence: [red('k#1')] })).toBe(1);
    expect(
      gateExit({
        claims: [claim({ key: 'k#1', recordedStatus: 'pending' })],
        evidence: [green('k#1')],
      }),
    ).toBe(1);
    expect(gateExit({ claims: [claim({ key: 'k#1' })], evidence: [green('k#1')] })).toBe(0);
  });

  it('never gates on the counted classes (unmapped within band, no-evidence, attested)', () => {
    expect(
      gateExit({
        claims: [
          claim({ key: 'k#1', recordedStatus: 'nonesuch' }),
          claim({ key: 'k#2' }),
          claim({ key: 'k#3', proof: { kind: 'attested', ref: 'owner' } }),
          claim({ key: 'k#4', recordedStatus: 'pending' }),
          claim({ key: 'k#5', recordedStatus: 'pending' }),
        ],
      }),
    ).toBe(0);
  });

  it('refuses to pass a vacuous report', () => {
    const report = reportOf({});
    expect(report).not.toBeNull();
    if (report === null) {
      return;
    }
    const verdict = decideGateVerdict(report);
    expect(verdict.exitCode).toBe(1);
    expect(verdict.lines[0]).toContain('VACUOUS');
  });
});

// Referenced so the compile-time proof cannot be elided by noUnusedLocals.
it('recomputable proof kinds are exactly the proof kinds minus attested', () => {
  expect(recomputableIsProofMinusAttested).toBe(true);
});
