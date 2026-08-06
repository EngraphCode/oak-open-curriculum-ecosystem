import type { Result } from '@oaknational/result';

import type { ReadPrStateOptions } from '../pr-watch/state-gh.js';
import type { PrStateReading } from '../pr-watch/state-types.js';
import { parseMergeArgs, type MergeArgs } from './merge-args.js';
import { verdictAwaitsSettlement } from './merge-decision.js';
import {
  ReadingUnavailableError,
  runMergeExecution,
  type MergeExecutionInput,
  type MergeOutcome,
} from './merge.js';
import { mintForConfig, type MintedToken, type MintSeams } from './mint-for-config.js';
import type { GithubApiFetch } from './mint-installation-token.js';
import {
  resolveBotIdentity,
  type BotIdentity,
  type MergeBotResolveInput,
} from './resolve-identity.js';

/**
 * The `merge-bot merge` action: the bounded poll loop and outcome reporting
 * (argv contract in `merge-args.ts`). The token is minted ONCE and every
 * poll runs under it, which is why the poll budget is bounded inside the
 * token's one-hour life. Exit map: 0 merged, 1 operational failure, 2 usage,
 * 3 typed refusal — an already-MERGED PR exits 3, because another actor's
 * merge is never this invocation's success.
 *
 * Build-vs-pass-through (owner principle 2026-08-06: build value in, pass
 * through where a binary already provides it): the reading passes through
 * `gh`; the settlement verdict and identity discipline are built value no
 * binary provides. The merge call itself is the one adjudicated exception —
 * `gh pr merge --match-head-commit` covers the tip pin, but returns no
 * machine-readable merge-commit sha, so the REST PUT is kept for the
 * structured outcome and the test-pinned body; the endpoint's own 405
 * enforcement still stands underneath our settings gate.
 */

const MILLIS_PER_SECOND = 1000;

const SWEEP_NOTE =
  'note: the pr-lifecycle merge-base deletion sweep is NOT discharged by this command — ' +
  'read every deletion the merge-base diff prints before merging.\n';

/** The action's composition surface; cli.ts forwards its own injection seams. */
export interface MergeActionInput {
  readonly identityInput: MergeBotResolveInput;
  readonly stdout: Pick<NodeJS.WriteStream, 'write'>;
  readonly stderr: Pick<NodeJS.WriteStream, 'write'>;
  readonly fetchImpl?: GithubApiFetch;
  readonly readFileImpl?: (path: string) => Promise<string>;
  readonly nowEpochSeconds?: () => number;
  /** Reading seam (defaults to pr-watch's gh-backed reading, throw-translated, inside merge.ts). */
  readonly readReadingImpl?: (options: ReadPrStateOptions) => Result<PrStateReading, Error>;
  readonly sleepImpl?: (ms: number) => Promise<void>;
  /** Clock seam for the settlement verdict's quiet window. */
  readonly nowIsoImpl?: () => string;
}

function mintSeamsFrom(input: MergeActionInput): MintSeams {
  return {
    ...(input.fetchImpl === undefined ? {} : { fetchImpl: input.fetchImpl }),
    ...(input.readFileImpl === undefined ? {} : { readFileImpl: input.readFileImpl }),
    ...(input.nowEpochSeconds === undefined ? {} : { nowEpochSeconds: input.nowEpochSeconds }),
  };
}

export async function runMergeAction(
  rest: readonly string[],
  input: MergeActionInput,
): Promise<number> {
  const parsed = parseMergeArgs(rest);
  if (!parsed.ok) {
    input.stderr.write(`merge-bot merge: ${parsed.error.message}\n`);
    return 2;
  }
  const identity = resolveBotIdentity({}, input.identityInput);
  if (!identity.ok) {
    input.stderr.write(`merge-bot merge: ${identity.error.message}\n`);
    return 2;
  }
  input.stderr.write(SWEEP_NOTE);
  // Minted ONCE; every poll runs under this token (the budget bound above).
  const minted = await mintForConfig(
    { ...identity.value, scope: 'pull-request-work' },
    mintSeamsFrom(input),
  );
  if (!minted.ok) {
    input.stderr.write(`merge-bot merge: ${minted.error.message}\n`);
    return 1;
  }
  return pollUntilActionable({ parsed: parsed.value, identity: identity.value, minted, input });
}

function executionSeams(
  input: MergeActionInput,
  minted: Result<MintedToken, Error>,
): MergeExecutionInput['seams'] {
  return {
    mint: () => Promise.resolve(minted),
    ...(input.fetchImpl === undefined ? {} : { fetchImpl: input.fetchImpl }),
    ...(input.readReadingImpl === undefined ? {} : { readReading: input.readReadingImpl }),
  };
}

async function pollUntilActionable(context: {
  readonly parsed: MergeArgs;
  readonly identity: BotIdentity;
  readonly minted: Result<MintedToken, Error>;
  readonly input: MergeActionInput;
}): Promise<number> {
  const { parsed, input } = context;
  const sleep =
    input.sleepImpl ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const nowIso = input.nowIsoImpl ?? ((): string => new Date().toISOString());
  const seams = executionSeams(input, context.minted);

  // Bounded despite the open loop head: continuing requires poll < maxPolls
  // (enforced by retryLabel), and every other branch returns.
  for (let poll = 1; ; poll += 1) {
    const outcome = await runMergeExecution({
      identity: context.identity,
      prNumber: parsed.prNumber,
      expectedReviewers: parsed.expect,
      nowIso: nowIso(),
      seams,
    });
    const retry = retryLabel(outcome, poll, parsed.maxPolls);
    if (retry !== undefined) {
      writeProgress(parsed, poll, retry, input);
      await sleep(parsed.intervalSeconds * MILLIS_PER_SECOND);
      continue;
    }
    if (!outcome.ok) {
      input.stderr.write(`merge-bot merge: ${outcome.error.message}\n`);
      return 1;
    }
    if (outcome.value.kind === 'merged') {
      writeMerged(outcome.value, parsed.json, input);
      return 0;
    }
    writeRefusal(outcome.value, parsed.json, input);
    return 3;
  }
}

/**
 * Whether this poll outcome is worth another poll, and the progress label if
 * so. Two retryable shapes: a wait-class verdict (it resolves by time), and a
 * failed READING after a working first poll (a transient — a FIRST-poll
 * failure is a broken environment and fails fast). Everything else lands on
 * a terminal path.
 */
function retryLabel(
  outcome: Awaited<ReturnType<typeof runMergeExecution>>,
  poll: number,
  maxPolls: number,
): string | undefined {
  if (poll >= maxPolls) {
    return undefined;
  }
  if (!outcome.ok) {
    return outcome.error instanceof ReadingUnavailableError && poll > 1
      ? `reading unavailable (${outcome.error.message})`
      : undefined;
  }
  return outcome.value.kind === 'refused' && verdictAwaitsSettlement(outcome.value.verdictState)
    ? outcome.value.verdictState
    : undefined;
}

function writeProgress(
  parsed: MergeArgs,
  poll: number,
  verdictState: string,
  input: MergeActionInput,
): void {
  // Under --json, stdout carries EXACTLY the outcome object a machine
  // parses; progress is diagnostics and moves to stderr.
  const progress = parsed.json ? input.stderr : input.stdout;
  progress.write(
    `poll ${poll}/${parsed.maxPolls}: ${verdictState} — retrying in ${parsed.intervalSeconds}s\n`,
  );
}

/** The verdict evidence, printed line-per-ground (security H3: never silent). */
function writeEvidence(evidence: readonly string[], input: MergeActionInput): void {
  for (const line of evidence) {
    input.stderr.write(`  grounds: ${line}\n`);
  }
}

function writeMerged(
  outcome: Extract<MergeOutcome, { kind: 'merged' }>,
  json: boolean,
  input: MergeActionInput,
): void {
  if (json) {
    input.stdout.write(`${JSON.stringify(outcome)}\n`);
    return;
  }
  input.stdout.write(`merged: merge commit ${outcome.sha}\n`);
  writeEvidence(outcome.evidence, input);
}

function writeRefusal(
  outcome: Extract<MergeOutcome, { kind: 'refused' }>,
  json: boolean,
  input: MergeActionInput,
): void {
  if (json) {
    input.stdout.write(`${JSON.stringify(outcome)}\n`);
  }
  input.stderr.write(`merge-bot merge: refused: ${outcome.reason}\n`);
  writeEvidence(outcome.evidence, input);
}
