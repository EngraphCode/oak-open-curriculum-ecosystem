import { err, ok, type Result } from '@oaknational/result';
import { z } from 'zod';

import { parseWithSchema } from '../core/schema-parse.js';
import { readJsonBody, type GithubApiFetch } from './mint-installation-token.js';
import type { BotIdentity } from './resolve-identity.js';

/**
 * The merge execution's two REST calls: the settings-gate read and the merge
 * PUT. Split from `merge.ts` to keep both files inside the size gates. Every
 * response body goes through the Result-translating reader — an unreadable
 * answer to the PUT reports the merge state as UNKNOWN (security D2): the
 * call was sent, so anything firmer invites a supervisor retry against an
 * already-merged PR.
 */

const GITHUB_API = 'https://api.github.com';

/** Only the field this gate consumes; unknown repo fields are irrelevant here. */
const mergeSettingsSchema = z.object({ allow_merge_commit: z.boolean() });

const mergeResponseSchema = z.object({ merged: z.literal(true), sha: z.string().min(1) });

/** The real fetch, wrapped to the port shape at this one boundary. */
export function realFetch(): GithubApiFetch {
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

/** Read the repo's `allow_merge_commit` — REQUIRED; a missing field refuses, never assumes. */
export async function readMergeSettings(
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
  const body = await readJsonBody(response, 'repo settings read');
  if (!body.ok) {
    return body;
  }
  const parsed = parseWithSchema({
    label:
      'repo merge settings (allow_merge_commit is REQUIRED — a missing field refuses, never assumes)',
    schema: mergeSettingsSchema,
    value: body.value,
  });
  if (!parsed.ok) {
    return parsed;
  }
  return ok(parsed.value.allow_merge_commit);
}

/** PUT the merge (method `merge`, the VERDICTED tip's sha); returns the merge-commit sha. */
export async function putMerge(
  fetchImpl: GithubApiFetch,
  token: string,
  input: { readonly identity: BotIdentity; readonly prNumber: number; readonly headRefOid: string },
): Promise<Result<string, Error>> {
  const response = await fetchImpl(
    `${GITHUB_API}/repos/${input.identity.owner}/${input.identity.repoName}/pulls/${input.prNumber}/merge`,
    {
      method: 'PUT',
      headers: apiHeaders(token),
      body: JSON.stringify({ merge_method: 'merge', sha: input.headRefOid }),
    },
  );
  const body = await readJsonBody(response, 'merge response');
  if (!body.ok) {
    // The PUT was SENT: an unreadable answer (edge drop mid-body, gateway
    // HTML) leaves the merge state indeterminate.
    return err(
      new Error(
        `merge state UNKNOWN for PR #${input.prNumber} at tip ${input.headRefOid} — the PUT was sent, answered ${response.status}, and its body was unreadable (${body.error.message}); re-read the PR before retrying`,
      ),
    );
  }
  if (response.status !== 200) {
    const message = z.object({ message: z.string() }).safeParse(body.value);
    return err(
      new Error(
        `merge endpoint answered ${response.status} for verdicted tip ${input.headRefOid}: ${message.success ? message.data.message : 'no message'}`,
      ),
    );
  }
  const parsed = parseWithSchema({
    label: 'merge response',
    schema: mergeResponseSchema,
    value: body.value,
  });
  if (!parsed.ok) {
    return parsed;
  }
  return ok(parsed.value.sha);
}
