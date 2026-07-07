import { describe, expect, it } from 'vitest';

import { sha256Hex } from './refounding-artefacts.js';
import {
  buildChallengeCommitment,
  buildChallengeKeySet,
  derivePlantedVariant,
  parseChallengeCommitment,
  parseChallengeFindings,
  parseChallengeKeySet,
  parseChallengeLedgerRow,
  scoreChallenge,
  selectDonorRow,
  selectPlantedBlockIds,
  type ChallengeLedgerRow,
} from './refound-challenge-model.js';

const row = (blockId: string): ChallengeLedgerRow =>
  ({
    block_id: blockId,
    file: 'plans/foo.plan.md',
    line_start: 40,
    line_end: 61,
    disposition: 'named-home',
    home: 'lane/semantic-search',
    binding: 'plans/foo.plan.md:40-61 detail contract',
  }) satisfies ChallengeLedgerRow;

describe('parseChallengeLedgerRow', () => {
  it('parses a valid ledger row', () => {
    expect(parseChallengeLedgerRow(row('semantic-search-0417')).ok).toBe(true);
  });

  it('rejects unknown keys and an EMPTY binding (indistinguishable from a plant)', () => {
    expect(parseChallengeLedgerRow({ ...row('x'), spare: 1 }).ok).toBe(false);
    expect(parseChallengeLedgerRow({ ...row('x'), binding: '' }).ok).toBe(false);
  });
});

describe('selectPlantedBlockIds — rate-derived selection by stable SALTED hash', () => {
  const ids = Array.from({ length: 200 }, (_, i) => `area-${String(i).padStart(4, '0')}`);

  it('is deterministic: identical inputs (salt included) give identical selections', () => {
    expect(selectPlantedBlockIds(ids, 10, 'seal-a')).toEqual(
      selectPlantedBlockIds(ids, 10, 'seal-a'),
    );
  });

  it('derives a DIFFERENT selection from a different salt (not recomputable rate-only, M5)', () => {
    expect(selectPlantedBlockIds(ids, 10, 'seal-a')).not.toEqual(
      selectPlantedBlockIds(ids, 10, 'seal-b'),
    );
  });

  it('selects everything at rate 100 and nothing at rate 0', () => {
    expect(selectPlantedBlockIds(ids, 100, 'seal-a')).toEqual(ids);
    expect(selectPlantedBlockIds(ids, 0, 'seal-a')).toEqual([]);
  });

  it('selects roughly the declared rate and monotonically grows with it', () => {
    const atTen = selectPlantedBlockIds(ids, 10, 'seal-a');
    const atFifty = selectPlantedBlockIds(ids, 50, 'seal-a');
    expect(atTen.length).toBeGreaterThan(0);
    expect(atTen.length).toBeLessThan(ids.length / 2);
    const fifty = new Set(atFifty);
    expect(atTen.every((id) => fifty.has(id))).toBe(true);
  });

  it('preserves the input order of the selected ids', () => {
    const selected = selectPlantedBlockIds(ids, 50, 'seal-a');
    const positions = selected.map((id) => ids.indexOf(id));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });
});

describe('derivePlantedVariant — the plausible-but-wrong re-point', () => {
  const donor: ChallengeLedgerRow = {
    ...row('donor'),
    file: 'plans/bar.plan.md',
    line_start: 10,
    line_end: 20,
    binding: 'plans/bar.plan.md:10-20 donor detail',
  };

  it('re-points the binding at the donor span, keeping the row detail, never emptying it', () => {
    const variant = derivePlantedVariant(row('x'), donor);
    expect(variant.binding).toBe('plans/bar.plan.md:10-20 detail contract');
    expect(variant.binding).not.toBe('');
    expect(variant.binding).not.toBe(row('x').binding);
    expect(variant).toEqual({ ...row('x'), binding: 'plans/bar.plan.md:10-20 detail contract' });
  });

  it('prefixes the donor span when the true binding carries no span reference', () => {
    const freeText = { ...row('x'), binding: 'the detail lives in the appendix' };
    expect(derivePlantedVariant(freeText, donor).binding).toBe(
      'plans/bar.plan.md:10-20 the detail lives in the appendix',
    );
  });
});

describe('selectDonorRow — the salted donor-span choice', () => {
  const rowA = row('a');
  const rows: ChallengeLedgerRow[] = [
    rowA,
    {
      ...row('b'),
      file: 'plans/bar.plan.md',
      line_start: 10,
      line_end: 20,
      binding: 'plans/bar.plan.md:10-20 detail b',
    },
    {
      ...row('c'),
      file: 'plans/baz.plan.md',
      line_start: 5,
      line_end: 9,
      binding: 'plans/baz.plan.md:5-9 detail c',
    },
  ];

  it('deterministically picks a donor that is not the row and yields a WRONG binding', () => {
    const first = selectDonorRow({ rows, row: rowA, salt: 'seal-a' });
    const second = selectDonorRow({ rows, row: rowA, salt: 'seal-a' });
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (first.ok && second.ok) {
      expect(first.value.block_id).toBe(second.value.block_id);
      expect(first.value.block_id).not.toBe('a');
      expect(derivePlantedVariant(rowA, first.value).binding).not.toBe(rowA.binding);
    }
  });

  it('refuses when every candidate re-point would reproduce the true binding', () => {
    // The only other row cites the SAME span the row's own binding cites.
    const sameSpanDonor = { ...row('twin'), binding: 'plans/foo.plan.md:40-61 twin detail' };
    const result = selectDonorRow({ rows: [row('a'), sameSpanDonor], row: row('a'), salt: 's' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('no donor span qualifies');
    }
  });
});

describe('the key set and its commitment', () => {
  it('builds a versioned key set carrying the sealed salt and sorted planted ids', () => {
    const keySet = buildChallengeKeySet({
      ratePercent: 25,
      salt: 'seal-a',
      plantedBlockIds: ['b', 'a'],
    });
    expect(keySet).toEqual({
      version: 1,
      ratePercent: 25,
      salt: 'seal-a',
      plantedBlockIds: ['a', 'b'],
    });
    expect(parseChallengeKeySet(JSON.parse(JSON.stringify(keySet))).ok).toBe(true);
    expect(parseChallengeKeySet({ ...keySet, spare: 1 }).ok).toBe(false);
    // A key set without its sealed salt is rejected at the read boundary.
    expect(parseChallengeKeySet({ version: 1, ratePercent: 25, plantedBlockIds: ['a'] }).ok).toBe(
      false,
    );
  });

  it('commits to the sha256 of the CANONICAL key-set bytes', () => {
    const bytes = Buffer.from('{"version":1}\n');
    const commitment = buildChallengeCommitment(bytes);
    expect(commitment).toEqual({ version: 1, keySetSha256: sha256Hex(bytes) });
    expect(parseChallengeCommitment(JSON.parse(JSON.stringify(commitment))).ok).toBe(true);
    expect(parseChallengeCommitment({ version: 1, keySetSha256: 'short' }).ok).toBe(false);
  });
});

describe('parseChallengeFindings', () => {
  it('parses a findings document and rejects unknown keys', () => {
    expect(parseChallengeFindings({ version: 1, lossBlockIds: ['a'] }).ok).toBe(true);
    expect(parseChallengeFindings({ version: 1, lossBlockIds: [] }).ok).toBe(true);
    expect(parseChallengeFindings({ version: 1, lossBlockIds: ['a'], spare: 1 }).ok).toBe(false);
  });
});

describe('scoreChallenge', () => {
  it('passes only when EVERY planted loss was caught', () => {
    const allCaught = scoreChallenge({
      plantedBlockIds: ['a', 'b'],
      findingBlockIds: ['b', 'a', 'z'],
    });
    expect(allCaught).toEqual({
      pass: true,
      caught: ['a', 'b'],
      missed: [],
      unplantedFindings: ['z'],
    });
  });

  it('fails when any plant is missed, naming it', () => {
    const missed = scoreChallenge({ plantedBlockIds: ['a', 'b'], findingBlockIds: ['a'] });
    expect(missed.pass).toBe(false);
    expect(missed.missed).toEqual(['b']);
    expect(missed.caught).toEqual(['a']);
  });
});
