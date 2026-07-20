/**
 * Deterministic disposition from voter verdicts — layer-2 counting. Code computes the
 * disposition; the two voters never emit one (`.agent/rules/validators-must-recompute-not-just-record.md`).
 *
 * @remarks
 * Two independent voters judge each judgment-needed cluster against the four conjunctive
 * tests (`sameFact`, `authoredNotCited`, `genuineConflict`, `liveSurface`). `flagged`
 * requires both voters to pass all four; `dismissed` requires both voters to AGREE at
 * least one test fails (a genuine, uncontested rejection); anything else — including any
 * disagreement on the OUTCOME is `held-for-review`, never silently resolved either way.
 * The tests are CONJUNCTIVE: agreement that any ONE necessary test fails is agreement on
 * the verdict-determining fact, and dismisses regardless of disagreement on other tests
 * (which cannot change the outcome once a necessary condition failed with agreement).
 *
 * @packageDocumentation
 */

import type { Disposition, VoterVerdict } from './schemas.js';

const CONJUNCTIVE_TESTS = [
  'sameFact',
  'authoredNotCited',
  'genuineConflict',
  'liveSurface',
] as const;

type ConjunctiveTest = (typeof CONJUNCTIVE_TESTS)[number];

function passes(verdict: VoterVerdict, test: ConjunctiveTest): boolean {
  return verdict[test].pass;
}

/** Both voters pass every conjunctive test. */
function bothPassAll(a: VoterVerdict, b: VoterVerdict): boolean {
  return CONJUNCTIVE_TESTS.every((test) => passes(a, test) && passes(b, test));
}

/** Both voters agree (fail together) on at least one conjunctive test. */
function agreeOnAFailure(a: VoterVerdict, b: VoterVerdict): boolean {
  return CONJUNCTIVE_TESTS.some((test) => !passes(a, test) && !passes(b, test));
}

/**
 * Compute one cluster's disposition from exactly two voter verdicts. The two voters are
 * unordered — the function is symmetric in its two arguments.
 */
export function dispositionFromVoters(a: VoterVerdict, b: VoterVerdict): Disposition {
  if (bothPassAll(a, b)) {
    return 'flagged';
  }
  if (agreeOnAFailure(a, b)) {
    return 'dismissed';
  }
  return 'held-for-review';
}
