import { isErr, isOk, unwrap } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import { ledgerRowSchema, metaAgentRowSchema, parseLedgerRow } from './ledger-rows.js';

const instanceA = { file: 'a.md', line: 1, quote: 'completed', valueNorm: 'completed' };
const instanceB = { file: 'b.md', line: 2, quote: 'in progress', valueNorm: 'in-progress' };

const agentRow = {
  id: 'L1',
  factClass: 'status-assertion',
  subject: 's0-window-sample',
  predicate: 'status',
  verdict: 'conflict',
  instances: [instanceA, instanceB],
  droppedMembers: [],
  sourceOfTruth: null,
  proposedCure: 'new-single-source',
  severity: 'high',
  metaNotes: 'two docs disagree on S0 status',
};

const droppedMember = {
  file: 'b.md',
  line: 2,
  quote: 'in progress',
  reason: 'quote absent from live file — section rewritten',
};

/** Build a copy without one key — destructuring-rest would leave an unused binding. */
function omit(value: Record<string, unknown>, key: string): Record<string, unknown> {
  return Object.fromEntries(Object.entries(value).filter(([entryKey]) => entryKey !== key));
}

describe('metaAgentRowSchema (the meta agent contract row — no disposition)', () => {
  it('parses a well-formed row with an explicit empty droppedMembers', () => {
    expect(metaAgentRowSchema.safeParse(agentRow).success).toBe(true);
  });

  it('rejects a row that omits droppedMembers — a drop must be expressible, so the field is required', () => {
    expect(metaAgentRowSchema.safeParse(omit(agentRow, 'droppedMembers')).success).toBe(false);
  });

  it('rejects a proposedCure outside the closed menu', () => {
    expect(
      metaAgentRowSchema.safeParse({ ...agentRow, proposedCure: 'rewrite-everything' }).success,
    ).toBe(false);
  });

  it('accepts a DEGRADED row — one survivor plus one named drop covers the member floor', () => {
    const degraded = { ...agentRow, instances: [instanceA], droppedMembers: [droppedMember] };
    expect(metaAgentRowSchema.safeParse(degraded).success).toBe(true);
  });

  it('accepts a fully degraded row — zero survivors, every member named as dropped', () => {
    const fullyDegraded = {
      ...agentRow,
      instances: [],
      droppedMembers: [droppedMember, { ...droppedMember, file: 'a.md', line: 1 }],
    };
    expect(metaAgentRowSchema.safeParse(fullyDegraded).success).toBe(true);
  });

  it('rejects a row below the ≥2 member floor — a member cannot leave without being named as dropped', () => {
    const silentlyShrunk = { ...agentRow, instances: [instanceA], droppedMembers: [] };
    expect(metaAgentRowSchema.safeParse(silentlyShrunk).success).toBe(false);
  });

  it('rejects a dropped member without a reason', () => {
    expect(
      metaAgentRowSchema.safeParse({
        ...agentRow,
        instances: [instanceA],
        droppedMembers: [omit(droppedMember, 'reason')],
      }).success,
    ).toBe(false);
  });
});

describe('ledgerRowSchema (the disposition-discriminated ledger union)', () => {
  const flaggedRow = { ...agentRow, disposition: 'flagged' };
  const heldRow = {
    disposition: 'held-for-review',
    id: 'H1',
    factClass: 'status-assertion',
    subject: 's0-window-sample',
    predicate: 'status',
    verdict: 'latent',
    instances: [instanceA, { ...instanceA, file: 'b.md', line: 9 }],
    heldNote: 'voters disagreed — triage via the validate checkpoint voterVerdicts',
  };

  it('parses a flagged row', () => {
    expect(ledgerRowSchema.safeParse(flaggedRow).success).toBe(true);
  });

  it('parses a held-for-review row', () => {
    expect(ledgerRowSchema.safeParse(heldRow).success).toBe(true);
  });

  it('rejects a row with no disposition — every ledger row is distinctly marked', () => {
    expect(ledgerRowSchema.safeParse(agentRow).success).toBe(false);
  });

  it('rejects a held row that smuggles in a cure — held rows carry no judgment fields', () => {
    expect(ledgerRowSchema.safeParse({ ...heldRow, proposedCure: 'cite-register' }).success).toBe(
      false,
    );
  });

  it('rejects a held row missing its heldNote triage pointer', () => {
    expect(ledgerRowSchema.safeParse(omit(heldRow, 'heldNote')).success).toBe(false);
  });

  it('rejects a held row with fewer than two instances — nothing was byte-verified away', () => {
    expect(ledgerRowSchema.safeParse({ ...heldRow, instances: [instanceA] }).success).toBe(false);
  });

  it('re-applies the member floor to flagged rows at the union', () => {
    expect(
      ledgerRowSchema.safeParse({ ...flaggedRow, instances: [instanceA], droppedMembers: [] })
        .success,
    ).toBe(false);
  });

  it('round-trips a flagged row through parseLedgerRow into an ok Result', () => {
    const parsed = parseLedgerRow(flaggedRow);
    expect(isOk(parsed)).toBe(true);
    expect(unwrap(parsed).disposition).toBe('flagged');
  });

  it('returns an err Result for a malformed row rather than throwing', () => {
    expect(isErr(parseLedgerRow({ id: 'x' }))).toBe(true);
  });
});
