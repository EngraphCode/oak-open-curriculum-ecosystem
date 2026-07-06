import { isErr, isOk, unwrap } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import type { Candidate, TestJudgment } from '../judgment-schemas.js';
import type { MetaOutput, RecallMatch } from '../recall-schemas.js';
import type { Corroboration } from '../real-world-signal.js';
import type { BankedFreetoolEntry } from './banked-verdicts.js';
import { computeSalvageTiers } from './salvage-tiers.js';
import type { SalvageTierTable } from './salvage-tiers.js';
import type { ValidateSuccess } from './triage.js';

const judgment = (pass: boolean): TestJudgment => ({ pass, confidence: 'high' });

const keepVerdict = (): BankedFreetoolEntry['verdict'] => ({
  grounded: judgment(true),
  baseRateHolds: judgment(true),
  survivesNull: judgment(true),
  notArtefact: judgment(true),
  importance: 'med',
});

const killVerdict = (): BankedFreetoolEntry['verdict'] => ({
  ...keepVerdict(),
  notArtefact: judgment(false),
});

const opusEntry = (
  candidateId: string,
  lens: BankedFreetoolEntry['lens'],
  verdict: BankedFreetoolEntry['verdict'],
): BankedFreetoolEntry => ({ candidateId, regime: 'opus-freetool', lens, verdict });

/** A full distinct-lens ensemble voting keep/keep/kill etc., in lens order. */
const ensemble = (
  candidateId: string,
  verdicts: readonly [
    BankedFreetoolEntry['verdict'],
    BankedFreetoolEntry['verdict'],
    BankedFreetoolEntry['verdict'],
  ],
): BankedFreetoolEntry[] => [
  opusEntry(candidateId, 'correctness-grounding', verdicts[0]),
  opusEntry(candidateId, 'base-rate', verdicts[1]),
  opusEntry(candidateId, 'null-reproduction', verdicts[2]),
];

const candidate = (
  id: string,
  windows: readonly string[] = ['w01'],
  leafIds: readonly string[] = ['w01-L01'],
): Candidate => ({
  id,
  pattern: `pattern ${id}`,
  kind: 'recurrence',
  isAbsenceClaim: false,
  supportingWindows: [...windows],
  supportingLeafIds: [...leafIds],
  groundingCount: 0,
});

const validateSuccess = (
  dispositions: readonly {
    candidateId: string;
    disposition: 'keep' | 'kill' | 'reroute' | 'held-for-review';
  }[],
): ValidateSuccess => ({
  ok: true,
  validateComplete: true,
  resolvedCandidateIds: dispositions.map((entry) => entry.candidateId),
  incompleteCandidateIds: [],
  missingCandidateIds: [],
  dispositions: dispositions.map((entry) => ({ ...entry, reason: null })),
  voterOutcomes: [],
});

const metaOutput = (recallMatches: readonly RecallMatch[] = []): MetaOutput => ({
  recallMatches: [...recallMatches],
  corroborationClaims: [],
  discountNote: 'none',
  synthesisNotes: [],
});

const corroboration = (candidateId: string, corroboratedBy: readonly string[]): Corroboration => ({
  candidateId,
  corroboratedBy,
  missingClaims: [],
  isCorroborated: corroboratedBy.length > 0,
});

const tiersOrFail = (input: Parameters<typeof computeSalvageTiers>[0]): SalvageTierTable => {
  const result = computeSalvageTiers(input);
  expect(isOk(result)).toBe(true);
  return unwrap(result);
};

describe('computeSalvageTiers — opus quorum over banked verdicts', () => {
  it('quorums over the three distinct-lens verdicts only, ignoring a lens-null voter on the same candidate', () => {
    const tiers = tiersOrFail({
      candidates: [candidate('C1')],
      validateResults: [validateSuccess([{ candidateId: 'C1', disposition: 'kill' }])],
      meta: metaOutput(),
      corroborations: [],
      bankedOpusVerdicts: [
        ...ensemble('C1', [keepVerdict(), keepVerdict(), keepVerdict()]),
        opusEntry('C1', null, killVerdict()),
      ],
    });
    expect(tiers.tierC.map((entry) => entry.candidateId)).toEqual(['C1']);
    expect(tiers.opusQuorum).toEqual({
      candidatesWithLensedVerdicts: 1,
      completeQuorums: 1,
      quorumKeeps: 1,
      incompleteQuorumCandidateIds: [],
    });
  });

  it('forms no quorum from fewer than three lensed verdicts, whatever the lens-null voters say', () => {
    const tiers = tiersOrFail({
      candidates: [candidate('C2')],
      validateResults: [validateSuccess([{ candidateId: 'C2', disposition: 'kill' }])],
      meta: metaOutput(),
      corroborations: [],
      bankedOpusVerdicts: [
        opusEntry('C2', 'correctness-grounding', keepVerdict()),
        opusEntry('C2', 'base-rate', keepVerdict()),
        opusEntry('C2', null, keepVerdict()),
      ],
    });
    expect(tiers.tierC).toEqual([]);
    expect(tiers.opusQuorum.incompleteQuorumCandidateIds).toEqual(['C2']);
  });

  it('keeps on a strict majority of lensed keeps and not on a minority', () => {
    const tiers = tiersOrFail({
      candidates: [candidate('C3'), candidate('C4')],
      validateResults: [
        validateSuccess([
          { candidateId: 'C3', disposition: 'kill' },
          { candidateId: 'C4', disposition: 'kill' },
        ]),
      ],
      meta: metaOutput(),
      corroborations: [],
      bankedOpusVerdicts: [
        ...ensemble('C3', [keepVerdict(), keepVerdict(), killVerdict()]),
        ...ensemble('C4', [keepVerdict(), killVerdict(), killVerdict()]),
      ],
    });
    expect(tiers.tierC.map((entry) => entry.candidateId)).toEqual(['C3']);
  });
});

describe('computeSalvageTiers — keep stratification (tiers A and B)', () => {
  it('places corroborated or opus-quorum-kept sonnet keeps in tier A and the rest in tier B', () => {
    const tiers = tiersOrFail({
      candidates: [candidate('K1'), candidate('K2'), candidate('K3')],
      validateResults: [
        validateSuccess([
          { candidateId: 'K1', disposition: 'keep' },
          { candidateId: 'K2', disposition: 'keep' },
          { candidateId: 'K3', disposition: 'keep' },
        ]),
      ],
      meta: metaOutput(),
      corroborations: [corroboration('K1', ['.agent/rules/x.md'])],
      bankedOpusVerdicts: ensemble('K2', [keepVerdict(), keepVerdict(), keepVerdict()]),
    });
    expect(
      tiers.tierA.map((entry) => entry.candidateId).sort((a, b) => a.localeCompare(b, 'en')),
    ).toEqual(['K1', 'K2']);
    const tierAById = new Map(tiers.tierA.map((entry) => [entry.candidateId, entry]));
    expect(tierAById.get('K1')?.corroboratedBy).toEqual(['.agent/rules/x.md']);
    expect(tierAById.get('K1')?.opusQuorumKeep).toBe(false);
    expect(tierAById.get('K2')?.opusQuorumKeep).toBe(true);
    expect(tiers.tierB.map((entry) => entry.candidateId)).toEqual(['K3']);
  });
});

describe('computeSalvageTiers — kill rescue (tiers C, D, E)', () => {
  it('collects recall-matched kills and note-named kills into tier D, labelled by source, including slash-separated mentions', () => {
    const tiers = tiersOrFail({
      candidates: [candidate('C10'), candidate('C184'), candidate('C183')],
      validateResults: [
        validateSuccess([
          { candidateId: 'C10', disposition: 'kill' },
          { candidateId: 'C184', disposition: 'kill' },
          { candidateId: 'C183', disposition: 'kill' },
        ]),
      ],
      meta: metaOutput([
        {
          baselineId: 'baseline-one',
          verdict: 'partial',
          matchedCandidateId: 'C10',
          note: 'matched directly',
        },
        {
          baselineId: 'baseline-two',
          verdict: 'missed',
          note: 'the behavioural claim lives in killed C184/C183',
        },
      ]),
      corroborations: [],
      bankedOpusVerdicts: [],
    });
    const byId = new Map(tiers.tierD.map((entry) => [entry.candidateId, entry]));
    expect([...byId.keys()].sort((a, b) => a.localeCompare(b, 'en'))).toEqual([
      'C10',
      'C183',
      'C184',
    ]);
    expect(byId.get('C10')?.source).toBe('recall-matched');
    expect(byId.get('C10')?.namingBaselineIds).toEqual(['baseline-one']);
    expect(byId.get('C184')?.source).toBe('note-named');
    expect(byId.get('C183')?.source).toBe('note-named');
    expect(byId.get('C184')?.namingBaselineIds).toEqual(['baseline-two']);
  });

  it('extracts note mentions on whole-id boundaries only and ignores ids that are not candidates', () => {
    // Discriminating fixture: naive substring matching would credit C18 too ("C18" is a
    // substring of the mentioned "C185"), so the wrong implementation fails loud here.
    const tiers = tiersOrFail({
      candidates: [candidate('C18'), candidate('C185')],
      validateResults: [
        validateSuccess([
          { candidateId: 'C18', disposition: 'kill' },
          { candidateId: 'C185', disposition: 'kill' },
        ]),
      ],
      meta: metaOutput([
        {
          baselineId: 'baseline-three',
          verdict: 'missed',
          note: 'the claim lives in killed C185; C999 does not exist',
        },
      ]),
      corroborations: [],
      bankedOpusVerdicts: [],
    });
    expect(tiers.tierD.map((entry) => entry.candidateId)).toEqual(['C185']);
    expect(tiers.tierE.map((entry) => entry.candidateId)).toEqual(['C18']);
  });

  it('upgrades a note-named kill to recall-matched when a later match names it directly, merging baselines in natural order', () => {
    const tiers = tiersOrFail({
      candidates: [candidate('C77')],
      validateResults: [validateSuccess([{ candidateId: 'C77', disposition: 'kill' }])],
      meta: metaOutput([
        {
          baselineId: 'baseline-note',
          verdict: 'missed',
          note: 'the substance lives in killed C77',
        },
        {
          baselineId: 'baseline-match',
          verdict: 'partial',
          matchedCandidateId: 'C77',
          note: 'matched directly',
        },
      ]),
      corroborations: [],
      bankedOpusVerdicts: [],
    });
    expect(tiers.tierD).toEqual([
      expect.objectContaining({
        candidateId: 'C77',
        source: 'recall-matched',
        namingBaselineIds: ['baseline-match', 'baseline-note'],
      }),
    ]);
  });

  it('annotates a kill that is in both tier C and tier D on both sides and excludes it from tier E', () => {
    const tiers = tiersOrFail({
      candidates: [candidate('C20'), candidate('C21')],
      validateResults: [
        validateSuccess([
          { candidateId: 'C20', disposition: 'kill' },
          { candidateId: 'C21', disposition: 'kill' },
        ]),
      ],
      meta: metaOutput([
        {
          baselineId: 'baseline-four',
          verdict: 'missed',
          note: 'found then killed as C20',
        },
      ]),
      corroborations: [],
      bankedOpusVerdicts: ensemble('C20', [keepVerdict(), keepVerdict(), keepVerdict()]),
    });
    expect(tiers.tierC).toEqual([
      expect.objectContaining({ candidateId: 'C20', alsoInTierD: true }),
    ]);
    expect(tiers.tierD).toEqual([
      expect.objectContaining({ candidateId: 'C20', alsoInTierC: true }),
    ]);
    expect(tiers.tierE.map((entry) => entry.candidateId)).toEqual(['C21']);
  });

  it('ranks tier E by recomputed window spread, then supporting-leaf count, then natural candidate id', () => {
    const tiers = tiersOrFail({
      candidates: [
        candidate('C9', ['w01'], ['w01-L01']),
        candidate('C10', ['w01'], ['w01-L01']),
        candidate('C30', ['w01', 'w02', 'w02'], ['w01-L01']),
        candidate('C40', ['w01'], ['w01-L01', 'w01-L02', 'w01-L03']),
      ],
      validateResults: [
        validateSuccess([
          { candidateId: 'C9', disposition: 'kill' },
          { candidateId: 'C10', disposition: 'kill' },
          { candidateId: 'C30', disposition: 'kill' },
          { candidateId: 'C40', disposition: 'kill' },
        ]),
      ],
      meta: metaOutput(),
      corroborations: [],
      bankedOpusVerdicts: [],
    });
    // C30's duplicate window entry recomputes to 2 distinct windows, ranking it first.
    expect(tiers.tierE.map((entry) => entry.candidateId)).toEqual(['C30', 'C40', 'C9', 'C10']);
    expect(tiers.tierE[0]?.distinctWindows).toBe(2);
  });
});

describe('computeSalvageTiers — conservation invariant', () => {
  it('routes reroute and held-only candidates to the residual bucket rather than dropping them', () => {
    const tiers = tiersOrFail({
      candidates: [candidate('R1'), candidate('H1'), candidate('K1')],
      validateResults: [
        validateSuccess([
          { candidateId: 'R1', disposition: 'reroute' },
          { candidateId: 'H1', disposition: 'held-for-review' },
          { candidateId: 'K1', disposition: 'keep' },
        ]),
      ],
      meta: metaOutput(),
      corroborations: [],
      bankedOpusVerdicts: [],
    });
    expect(tiers.residual).toEqual([
      expect.objectContaining({ candidateId: 'R1', state: 'reroute' }),
      expect.objectContaining({ candidateId: 'H1', state: 'held-or-undisposed' }),
    ]);
    expect(tiers.tierB.map((entry) => entry.candidateId)).toEqual(['K1']);
  });

  it('fails loud on a disposition naming a candidate absent from the reduce result', () => {
    const result = computeSalvageTiers({
      candidates: [candidate('C1')],
      validateResults: [validateSuccess([{ candidateId: 'GHOST', disposition: 'kill' }])],
      meta: metaOutput(),
      corroborations: [],
      bankedOpusVerdicts: [],
    });
    expect(isErr(result)).toBe(true);
  });

  it('fails loud on a banked verdict naming a candidate absent from the reduce result', () => {
    const result = computeSalvageTiers({
      candidates: [candidate('C1')],
      validateResults: [validateSuccess([{ candidateId: 'C1', disposition: 'kill' }])],
      meta: metaOutput(),
      corroborations: [],
      bankedOpusVerdicts: [opusEntry('GHOST', null, keepVerdict())],
    });
    expect(isErr(result)).toBe(true);
  });
});
