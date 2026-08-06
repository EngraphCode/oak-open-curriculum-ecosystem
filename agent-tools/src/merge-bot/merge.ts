import { execFileSync } from 'node:child_process';

import { err, ok, type Result } from '@oaknational/result';
import { z } from 'zod';

import { parseWithSchema } from '../core/schema-parse.js';
import type { GhCommandExecutor } from '../pr-watch/gh.js';
import { readPrStateReading, type ReadPrStateOptions } from '../pr-watch/state-gh.js';
import type { PrStateReading, PrVerdict } from '../pr-watch/state-types.js';
import { computePrVerdict } from '../pr-watch/states.js';
import { decideMergeAction } from './merge-decision.js';
import { mintForConfig, type MintedToken, type MintSeams } from './mint-for-config.js';
import type { GithubApiFetch } from './mint-installation-token.js';
import type { BotIdentity } from './resolve-identity.js';

/**
 * The `merge-bot merge` execution: mint → read → verdict → gate → merge.
 *
 * Composes pr-watch's reading and verdict (one settlement implementation,
 * never a re-derivation) and merges over merge-bot's own fetch port so the
 * call shape is an HTTP body a test can pin. The PUT carries the VERDICTED
 * tip's sha — a tip that moves between verdict and merge gets the API's 409,
 * never an unverdicted merge. Merge method is `merge`, always: the repo
 * settings gate refuses when merge commits are disallowed rather than ever
 * changing method (the never-squash ruling as behaviour).
 */

/** The seams a caller may inject; the CLI supplies the real composition. */
interface MergeExecutionSeams {
  /** Mint thunk (defaults to mintForConfig at scope pull-request-work). */
  readonly mint?: () => Promise<Result<MintedToken, Error>>;
  /** Reading assembly (defaults to pr-watch's gh-backed reading). */
  readonly readReading?: (options: ReadPrStateOptions) => PrStateReading;
  readonly fetchImpl?: GithubApiFetch;
  readonly mintSeams?: MintSeams;
  readonly ghPath?: string;
  /** Base environment for the tokenised gh executor (CLI passes process.env). */
  readonly baseEnv?: Readonly<Record<string, string | undefined>>;
}

export interface MergeExecutionInput {
  readonly identity: BotIdentity;
  readonly prNumber: number;
  /** DECLARED expected reviewer set — required; a defaulted set never merges. */
  readonly expectedReviewers: readonly string[];
  readonly nowIso: string;
  readonly seams: MergeExecutionSeams;
}

/** The execution outcome: merged, or a typed refusal the caller reports by name. */
export type MergeOutcome =
  | { readonly kind: 'merged'; readonly sha: string }
  | {
      readonly kind: 'refused';
      readonly reason: string;
      /** The verdict as a FIELD, so the poll loop reads it by name, never by parsing prose. */
      readonly verdictState: PrVerdict['state'];
    };

const GITHUB_API = 'https://api.github.com';

/** Only the field this gate consumes; unknown repo fields are irrelevant here. */
const mergeSettingsSchema = z.object({ allow_merge_commit: z.boolean() });

const mergeResponseSchema = z.object({ merged: z.literal(true), sha: z.string().min(1) });

function realFetch(): GithubApiFetch {
  return async (url, init) => {
    const response = await fetch(url, init);
    return { status: response.status, json: () => response.json() };
  };
}

function apiHeaders(token: string): Record<string, string> {
  return {
    accept: 'application/vnd.github+json',
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
  };
}

/** Wraps an executor so every gh call runs under the minted token, never the keyring. */
function tokenisedExecutor(
  token: string,
  baseEnv: Readonly<Record<string, string | undefined>>,
): GhCommandExecutor {
  return (file, args, options) =>
    execFileSync(file, args, { ...options, env: { ...baseEnv, GH_TOKEN: token } });
}

async function readMergeSettings(
  fetchImpl: GithubApiFetch,
  token: string,
  identity: BotIdentity,
): Promise<Result<boolean, Error>> {
  const response = await fetchImpl(`${GITHUB_API}/repos/${identity.owner}/${identity.repoName}`, {
    method: 'GET',
    headers: apiHeaders(token),
  });
  if (response.status !== 200) {
    return err(new Error(`repo settings read answered ${response.status}`));
  }
  const parsed = parseWithSchema({
    label:
      'repo merge settings (allow_merge_commit is REQUIRED — a missing field refuses, never assumes)',
    schema: mergeSettingsSchema,
    value: await response.json(),
  });
  if (!parsed.ok) {
    return parsed;
  }
  return ok(parsed.value.allow_merge_commit);
}

async function putMerge(
  fetchImpl: GithubApiFetch,
  token: string,
  input: { readonly identity: BotIdentity; readonly prNumber: number; readonly headRefOid: string },
): Promise<Result<MergeOutcome, Error>> {
  const response = await fetchImpl(
    `${GITHUB_API}/repos/${input.identity.owner}/${input.identity.repoName}/pulls/${input.prNumber}/merge`,
    {
      method: 'PUT',
      headers: apiHeaders(token),
      body: JSON.stringify({ merge_method: 'merge', sha: input.headRefOid }),
    },
  );
  const body: unknown = await response.json();
  if (response.status !== 200) {
    const message = z.object({ message: z.string() }).safeParse(body);
    return err(
      new Error(
        `merge endpoint answered ${response.status} for verdicted tip ${input.headRefOid}: ${message.success ? message.data.message : 'no message'}`,
      ),
    );
  }
  const parsed = parseWithSchema({
    label: 'merge response',
    schema: mergeResponseSchema,
    value: body,
  });
  if (!parsed.ok) {
    return parsed;
  }
  return ok({ kind: 'merged', sha: parsed.value.sha });
}

function defaultMint(input: MergeExecutionInput): () => Promise<Result<MintedToken, Error>> {
  return () =>
    mintForConfig({ ...input.identity, scope: 'pull-request-work' }, input.seams.mintSeams ?? {});
}

/** Run the whole merge execution over the injected (or real) seams. */
export async function runMergeExecution(
  input: MergeExecutionInput,
): Promise<Result<MergeOutcome, Error>> {
  const mint = input.seams.mint ?? defaultMint(input);
  const minted = await mint();
  if (!minted.ok) {
    return minted;
  }
  if (minted.value.token === '') {
    return err(
      new Error(
        'minted token is empty — refusing before any call: an empty GH_TOKEN reads as unset and gh would run as the signed-in human',
      ),
    );
  }
  const token = minted.value.token;

  const readReading =
    input.seams.readReading ??
    ((options: ReadPrStateOptions): PrStateReading =>
      readPrStateReading({
        ...options,
        execFileSync: tokenisedExecutor(token, input.seams.baseEnv ?? {}),
      }));
  const reading = readReading({
    target: { number: input.prNumber, repo: `${input.identity.owner}/${input.identity.repoName}` },
    ghPath: input.seams.ghPath,
    expectedReviewers: input.expectedReviewers,
  });

  return gateAndMerge({ input, reading, token });
}

/** The verdict → settings-gate → decide → merge tail, split for the size gate. */
async function gateAndMerge(context: {
  readonly input: MergeExecutionInput;
  readonly reading: PrStateReading;
  readonly token: string;
}): Promise<Result<MergeOutcome, Error>> {
  const { input, reading, token } = context;
  const verdict = computePrVerdict(reading, input.nowIso);
  const fetchImpl = input.seams.fetchImpl ?? realFetch();
  const allowMergeCommit = await readMergeSettings(fetchImpl, token, input.identity);
  if (!allowMergeCommit.ok) {
    return allowMergeCommit;
  }

  const decision = decideMergeAction({
    verdict,
    allowMergeCommit: allowMergeCommit.value,
    expectedDeclared: reading.expectedDeclared,
  });
  if (decision.kind === 'refuse') {
    return ok({ kind: 'refused', reason: decision.reason, verdictState: verdict.state });
  }
  return putMerge(fetchImpl, token, {
    identity: input.identity,
    prNumber: input.prNumber,
    headRefOid: reading.headRefOid,
  });
}
