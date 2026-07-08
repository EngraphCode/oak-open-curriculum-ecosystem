import { describe, expect, expectTypeOf, it } from 'vitest';

import { derivePlanState, type PlanStateInput } from './plan-state-engine.js';
import { decideGateVerdict, serialisePlanStateReport } from './plan-state-verdict.js';
import {
  type ClaimRow,
  type EvidenceVerdict,
  type PlanStateTable,
  type ProofKind,
  type RecomputableProofKind,
} from './plan-state-model.js';

// Compile-time anchor: the recomputable set is exactly ProofKind minus attested
// (fails compilation on drift in either direction; no runtime assertion).
expectTypeOf<RecomputableProofKind>().toEqualTypeOf<Exclude<ProofKind, 'attested'>>();

/**
 * A literal probe table so engine behaviour is decoupled from the
 * owner-ratifiable production table (`status-mapping/v1.ts` owns that).
 */
const TEST_TABLE: PlanStateTable = {
  version: 7,
  entries: [
    { value: 'completed', verdict: 'completed' },
    { value: 'done', verdict: 'completed' },
    { value: 'pending', verdict: 'pending' },
  ],
};

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
  derivePlanState({ claims: [], evidence: [], table: TEST_TABLE, ...input });

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

  it('flags recorded-pending-but-green with the full row echoed (mutation direction 2)', () => {
    // In-memory copy of the live instance this branch trued at 7c984a555.
    const key =
      'plans/product-development-governance/active/plan-corpus-refounding.plan.md#r0a-mechanical-instrument';
    const report = reportOf({
      claims: [claim({ key, recordedStatus: ' pending' })],
      evidence: [green(key, { detail: 'proofs green on main' })],
    });
    expect(report?.tableVersion).toBe(TEST_TABLE.version);
    expect(report?.rows[0]).toEqual({
      key,
      recordedStatus: ' pending', // verbatim, never the trimmed form
      canonicalClaim: 'pending',
      rowClass: 'recorded-pending-but-green',
      evidence: [{ kind: 'gate', verdict: 'green', detail: 'proofs green on main' }],
    });
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
    const mapped = (ids: readonly string[]) =>
      ids.map((id) => claim({ key: `a.md#${id}`, recordedStatus: 'pending' }));
    const atBand = derive({
      claims: [
        claim({ key: 'a.md#t1', recordedStatus: 'mystery' }),
        ...mapped(['t2', 't3', 't4', 't5']),
      ],
    });
    expect(atBand.ok).toBe(true); // 1 of 5 = exactly 20%: no halt
    const overBandNarrow = derive({
      claims: [claim({ key: 'a.md#t1', recordedStatus: 'mystery' }), ...mapped(['t2', 't3', 't4'])],
    });
    expect(overBandNarrow.ok).toBe(false); // 1 of 4 = 25%: halt (tight bracket)
    const overBandWide = derive({
      claims: [
        claim({ key: 'a.md#t0', recordedStatus: 'enigma' }),
        claim({ key: 'a.md#t1', recordedStatus: 'mystery' }),
        ...mapped(['t2', 't3', 't4']),
      ],
    });
    expect(overBandWide.ok).toBe(false); // 2 of 5 = 40%: halt
    if (!overBandWide.ok) {
      expect(overBandWide.error.message).toContain('halt-and-inspect');
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
    // Ten rows, two unmapped: exactly the 20% band edge, so no halt fires.
    // d#t1 carries a same-kind green+red pair (the verdict tie-break);
    // both unmapped values differ (the distinctValues sort).
    const claims = [
      claim({ key: 'b.md#t1', recordedStatus: 'pending' }),
      claim({ key: 'a.md#t2', recordedStatus: 'completed' }),
      claim({ key: 'a.md#t1', recordedStatus: 'nonesuch' }),
      claim({ key: 'e.md#t1', recordedStatus: 'enigma' }),
      claim({ key: 'd.md#t1', recordedStatus: 'completed' }),
      claim({ key: 'c.md#t1', recordedStatus: 'completed' }),
      claim({ key: 'c.md#t2', recordedStatus: 'done' }),
      claim({ key: 'f.md#t1', recordedStatus: 'pending' }),
      claim({ key: 'f.md#t2', recordedStatus: 'pending' }),
      claim({ key: 'f.md#t3', recordedStatus: 'pending' }),
    ];
    const evidence = [
      green('b.md#t1'),
      red('a.md#t2'),
      green('a.md#t2', { kind: 'probe' }),
      green('c.md#t2'),
      red('d.md#t1'),
      green('d.md#t1'),
    ];
    return {
      claims: order === 'forward' ? claims : [...claims].reverse(),
      evidence: order === 'forward' ? evidence : [...evidence].reverse(),
      table: TEST_TABLE,
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

  it('sorts rows, same-kind evidence by verdict, and distinct unmapped values', () => {
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
      'd.md#t1',
      'e.md#t1',
      'f.md#t1',
      'f.md#t2',
      'f.md#t3',
    ]);
    const sameKindPair = result.value.rows.find((row) => row.key === 'd.md#t1');
    expect(sameKindPair?.evidence).toEqual([
      { kind: 'gate', verdict: 'green', detail: null },
      { kind: 'gate', verdict: 'red', detail: null },
    ]);
    expect(result.value.summary.unmapped.distinctValues).toEqual(['enigma', 'nonesuch']);
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
  /** The gate verdict for an input, or null on refusal. */
  const verdictOf = (input: Partial<PlanStateInput>) => {
    const report = reportOf(input);
    return report === null ? null : decideGateVerdict(report);
  };

  it('exits non-zero on each divergence class and zero on consistent', () => {
    expect(verdictOf({ claims: [claim({ key: 'k#1' })], evidence: [red('k#1')] })?.exitCode).toBe(
      1,
    );
    expect(
      verdictOf({
        claims: [claim({ key: 'k#1', recordedStatus: 'pending' })],
        evidence: [green('k#1')],
      })?.exitCode,
    ).toBe(1);
    expect(verdictOf({ claims: [claim({ key: 'k#1' })], evidence: [green('k#1')] })?.exitCode).toBe(
      0,
    );
  });

  it('never gates on the counted classes, and names an unverified green', () => {
    const verdict = verdictOf({
      claims: [
        claim({ key: 'k#1', recordedStatus: 'nonesuch' }),
        claim({ key: 'k#2' }),
        claim({ key: 'k#3', proof: { kind: 'attested', ref: 'owner' } }),
        claim({ key: 'k#4', recordedStatus: 'pending' }),
        claim({ key: 'k#5', recordedStatus: 'pending' }),
      ],
    });
    expect(verdict?.exitCode).toBe(0);
    expect(verdict?.lines[0]).toContain('no recomputation performed');
  });

  it('does not carry the unverified marker once any row is recomputed consistent', () => {
    const verdict = verdictOf({
      claims: [claim({ key: 'k#1' }), claim({ key: 'k#2' })],
      evidence: [green('k#1')],
    });
    expect(verdict?.exitCode).toBe(0);
    expect(verdict?.lines[0]).not.toContain('no recomputation performed');
  });

  it('refuses to pass a vacuous report', () => {
    const verdict = verdictOf({});
    expect(verdict?.exitCode).toBe(1);
    expect(verdict?.lines[0]).toContain('VACUOUS');
  });
});
