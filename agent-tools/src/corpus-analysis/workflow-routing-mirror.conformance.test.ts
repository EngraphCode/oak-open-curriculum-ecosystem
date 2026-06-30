import { describe, expect, it } from 'vitest';

import { adjudicate as realAdjudicate } from './aggregation-adjudication.js';
import {
  classifyVerdict as realClassify,
  isBorderline as realBorderline,
} from './aggregation-verdict.js';
import type { AdversaryLens, AdversaryVerdict, VoterOutcome } from './judgment-schemas.js';
import {
  adjudicate as mirrorAdjudicate,
  classifyVerdict as mirrorClassify,
  isBorderline as mirrorBorderline,
} from './workflow-routing-mirror.js';

/**
 * Conformance: the sandbox mirror (`workflow-routing-mirror.ts`) MUST produce identical
 * output to the real routing module for every branch. The Workflow runs the validate
 * stage in a sandbox that cannot import repo code, so it executes a verbatim copy of the
 * mirror; this test is the pin that makes "launch with an unverified mirror" impossible —
 * a divergence in either source module turns it red. Inputs are constructed to exercise
 * every branch of `classifyVerdict`, `isBorderline`, and the `adjudicate` state machine.
 */

const judgment = (pass: boolean, confidence: 'low' | 'med' | 'high' = 'high') => ({
  pass,
  confidence,
});

const verdict = (overrides: Partial<AdversaryVerdict> = {}): AdversaryVerdict => ({
  grounded: judgment(true),
  baseRateHolds: judgment(true),
  survivesNull: judgment(true),
  notArtefact: judgment(true),
  importance: 'med',
  ...overrides,
});

// Disposition-shaped verdicts.
const cleanKeep = verdict(); // all pass at high confidence → keep, not borderline
const borderlineKeep = verdict({ grounded: judgment(true, 'low') }); // keep but marginal → borderline
const rerouteVerdict = verdict({ baseRateHolds: judgment(false), importance: 'high' }); // fails only base-rate @ high → reroute
const killBaseRateMed = verdict({ baseRateHolds: judgment(false), importance: 'med' }); // fails only base-rate, not high → kill
const killGrounded = verdict({ grounded: judgment(false) }); // fails grounded → kill
const killMultiple = verdict({ grounded: judgment(false), survivesNull: judgment(false) }); // fails two → kill

const VERDICT_FIXTURE: readonly { name: string; value: AdversaryVerdict }[] = [
  { name: 'clean keep', value: cleanKeep },
  { name: 'borderline keep (low-confidence pass)', value: borderlineKeep },
  {
    name: 'borderline keep (med-confidence pass)',
    value: verdict({ notArtefact: judgment(true, 'med') }),
  },
  { name: 'reroute (fails only base-rate @ high importance)', value: rerouteVerdict },
  { name: 'kill (fails only base-rate, med importance)', value: killBaseRateMed },
  { name: 'kill (fails grounded)', value: killGrounded },
  { name: 'kill (fails two tests)', value: killMultiple },
  {
    name: 'kill (fails base-rate + grounded @ high)',
    value: verdict({
      grounded: judgment(false),
      baseRateHolds: judgment(false),
      importance: 'high',
    }),
  },
];

const adjudicated = (
  tier: 'tier-0' | 'tier-1' | 'tier-2',
  v: AdversaryVerdict,
  voterId = 'v',
): VoterOutcome => ({ status: 'adjudicated', candidateId: 'c1', voterId, tier, verdict: v });

const unadjudicated = (
  tier: 'tier-0' | 'tier-1' | 'tier-2',
  reason: 'retry-cap' | 'quorum-tie' | 'lens-collision' = 'retry-cap',
  voterId = 'v',
): VoterOutcome => ({ status: 'unadjudicated', candidateId: 'c1', voterId, tier, reason });

const withLens = (v: AdversaryVerdict, lens: AdversaryLens): AdversaryVerdict => ({ ...v, lens });
const LENSES: readonly AdversaryLens[] = [
  'correctness-grounding',
  'base-rate',
  'null-reproduction',
];

const tier0 = adjudicated('tier-0', cleanKeep, 't0'); // present so adjudicate does not short-circuit to dispatch-tier-0

const ADJUDICATE_FIXTURE: readonly { name: string; outcomes: readonly VoterOutcome[] }[] = [
  { name: 'empty → dispatch tier-0', outcomes: [] },
  {
    name: 'tier-0 unadjudicated, no tier-1 → dispatch tier-1',
    outcomes: [unadjudicated('tier-0')],
  },
  {
    name: 'tier-0 unadjudicated + tier-1 → dispatch tier-2 from 0',
    outcomes: [unadjudicated('tier-0'), adjudicated('tier-1', cleanKeep)],
  },
  {
    name: 'tier-0 kill → escalate to tier-2 quorum (never terminal on one voter)',
    outcomes: [adjudicated('tier-0', killGrounded)],
  },
  { name: 'tier-0 reroute → dispatch tier-2', outcomes: [adjudicated('tier-0', rerouteVerdict)] },
  {
    name: 'tier-0 borderline keep → dispatch tier-2',
    outcomes: [adjudicated('tier-0', borderlineKeep)],
  },
  {
    name: 'tier-0 clean keep, no tier-1 → dispatch tier-1',
    outcomes: [adjudicated('tier-0', cleanKeep)],
  },
  {
    name: 'tier-0 keep + tier-1 keep → terminal keep',
    outcomes: [adjudicated('tier-0', cleanKeep), adjudicated('tier-1', cleanKeep)],
  },
  {
    name: 'tier-0 keep + tier-1 kill → dispatch tier-2',
    outcomes: [adjudicated('tier-0', cleanKeep), adjudicated('tier-1', killGrounded)],
  },
  {
    name: 'tier-0 keep + tier-1 unadjudicated → dispatch tier-2',
    outcomes: [adjudicated('tier-0', cleanKeep), unadjudicated('tier-1')],
  },
  {
    name: 'tier-2 partial (1) → dispatch remaining 2',
    outcomes: [tier0, adjudicated('tier-2', withLens(cleanKeep, LENSES[0]), '2a')],
  },
  {
    name: 'tier-2 partial (2) → dispatch remaining 1',
    outcomes: [
      tier0,
      adjudicated('tier-2', withLens(cleanKeep, LENSES[0]), '2a'),
      adjudicated('tier-2', withLens(killGrounded, LENSES[1]), '2b'),
    ],
  },
  {
    name: 'tier-2 full, majority keep → keep',
    outcomes: [
      tier0,
      adjudicated('tier-2', withLens(cleanKeep, LENSES[0]), '2a'),
      adjudicated('tier-2', withLens(cleanKeep, LENSES[1]), '2b'),
      adjudicated('tier-2', withLens(killGrounded, LENSES[2]), '2c'),
    ],
  },
  {
    name: 'tier-2 full, majority kill → kill',
    outcomes: [
      tier0,
      adjudicated('tier-2', withLens(cleanKeep, LENSES[0]), '2a'),
      adjudicated('tier-2', withLens(killGrounded, LENSES[1]), '2b'),
      adjudicated('tier-2', withLens(killGrounded, LENSES[2]), '2c'),
    ],
  },
  {
    name: 'tier-2 full, keep=reroute=kill split → reroute',
    outcomes: [
      tier0,
      adjudicated('tier-2', withLens(cleanKeep, LENSES[0]), '2a'),
      adjudicated('tier-2', withLens(rerouteVerdict, LENSES[1]), '2b'),
      adjudicated('tier-2', withLens(killGrounded, LENSES[2]), '2c'),
    ],
  },
  {
    name: 'tier-2 full, reroute outweighed by kills → kill',
    outcomes: [
      tier0,
      adjudicated('tier-2', withLens(killBaseRateMed, LENSES[0]), '2a'),
      adjudicated('tier-2', withLens(rerouteVerdict, LENSES[1]), '2b'),
      adjudicated('tier-2', withLens(killGrounded, LENSES[2]), '2c'),
    ],
  },
  {
    name: 'tier-2 full, all unadjudicated → held retry-cap',
    outcomes: [
      tier0,
      unadjudicated('tier-2', 'retry-cap', '2a'),
      unadjudicated('tier-2', 'retry-cap', '2b'),
      unadjudicated('tier-2', 'retry-cap', '2c'),
    ],
  },
  {
    name: 'tier-2 full, only 1 adjudicated → held retry-cap',
    outcomes: [
      tier0,
      adjudicated('tier-2', withLens(cleanKeep, LENSES[0]), '2a'),
      unadjudicated('tier-2', 'retry-cap', '2b'),
      unadjudicated('tier-2', 'retry-cap', '2c'),
    ],
  },
  {
    name: 'tier-2 full, 2 adjudicated distinct lenses tie → held quorum-tie',
    outcomes: [
      tier0,
      adjudicated('tier-2', withLens(cleanKeep, LENSES[0]), '2a'),
      adjudicated('tier-2', withLens(killGrounded, LENSES[1]), '2b'),
      unadjudicated('tier-2', 'retry-cap', '2c'),
    ],
  },
  {
    name: 'tier-2 full, duplicate lens → held lens-collision',
    outcomes: [
      tier0,
      adjudicated('tier-2', withLens(cleanKeep, LENSES[0]), '2a'),
      adjudicated('tier-2', withLens(cleanKeep, LENSES[0]), '2b'),
      adjudicated('tier-2', withLens(killGrounded, LENSES[1]), '2c'),
    ],
  },
  {
    name: 'tier-2 full, missing lens → held lens-collision',
    outcomes: [
      tier0,
      adjudicated('tier-2', cleanKeep, '2a'),
      adjudicated('tier-2', withLens(cleanKeep, LENSES[1]), '2b'),
      adjudicated('tier-2', withLens(killGrounded, LENSES[2]), '2c'),
    ],
  },
];

describe('workflow-routing-mirror conformance', () => {
  it.each(VERDICT_FIXTURE)('classifyVerdict matches the source for: $name', ({ value }) => {
    expect(mirrorClassify(value)).toStrictEqual(realClassify(value));
  });

  it.each(VERDICT_FIXTURE)('isBorderline matches the source for: $name', ({ value }) => {
    expect(mirrorBorderline(value)).toStrictEqual(realBorderline(value));
  });

  it.each(ADJUDICATE_FIXTURE)('adjudicate matches the source for: $name', ({ outcomes }) => {
    expect(mirrorAdjudicate({ outcomes })).toStrictEqual(realAdjudicate({ outcomes }));
  });

  it('the verdict fixture exercises every disposition', () => {
    const dispositions = new Set(VERDICT_FIXTURE.map((entry) => realClassify(entry.value)));
    expect(dispositions).toStrictEqual(new Set(['keep', 'kill', 'reroute']));
  });

  it('the adjudicate fixture exercises terminal and dispatch, every tier and held reason', () => {
    const steps = ADJUDICATE_FIXTURE.map((entry) => realAdjudicate({ outcomes: entry.outcomes }));
    expect(steps.some((step) => step.kind === 'terminal')).toBe(true);
    expect(steps.some((step) => step.kind === 'dispatch')).toBe(true);
    const heldReasons = new Set(
      steps.flatMap((step) => (step.kind === 'terminal' && step.reason ? [step.reason] : [])),
    );
    expect(heldReasons).toStrictEqual(new Set(['retry-cap', 'quorum-tie', 'lens-collision']));
  });
});
