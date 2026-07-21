import { createSign } from 'node:crypto';

import { z } from 'zod';

import { parseWithSchema } from '../core/schema-parse.js';
import { err, ok, type Result } from '@oaknational/result';

/**
 * GitHub App installation-token minting for the oak merge bot (AIP-158).
 *
 * The merge bot is deliberately NOT a ruleset bypass actor: merges executed
 * with its installation token physically bind to required checks and thread
 * resolution, which is the whole point (owner rulings 2026-07-21: `--admin`
 * always banned; direct `--merge` banned on bypass-capable accounts).
 *
 * Flow: RS256 app JWT (iss = app id, ≤10-minute lifetime) → resolve the
 * repo's installation id → POST for a short-lived installation token.
 */

const JWT_BACKDATE_SECONDS = 60;
const JWT_LIFETIME_SECONDS = 540;

const INSTALLATION_SCHEMA = z.object({ id: z.number().int().positive() });

const INSTALLATION_TOKEN_SCHEMA = z.object({
  token: z.string().min(1),
  expires_at: z.string().min(1),
});

export type GithubApiFetch = (
  url: string,
  init: {
    readonly method: string;
    readonly headers: Readonly<Record<string, string>>;
  },
) => Promise<{
  readonly status: number;
  readonly json: () => Promise<unknown>;
}>;

function base64Url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

/**
 * Sign a GitHub App JWT (RS256). `nowEpochSeconds` is injected so callers
 * control time; the token is backdated 60s against clock skew and lives
 * 9 minutes (GitHub's ceiling is 10).
 */
export function signAppJwt(input: {
  readonly appId: string;
  readonly privateKeyPem: string;
  readonly nowEpochSeconds: number;
}): string {
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64Url(
    JSON.stringify({
      iat: input.nowEpochSeconds - JWT_BACKDATE_SECONDS,
      exp: input.nowEpochSeconds + JWT_LIFETIME_SECONDS,
      iss: input.appId,
    }),
  );
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${payload}`);
  const signature = signer.sign(input.privateKeyPem).toString('base64url');
  return `${header}.${payload}.${signature}`;
}

function githubHeaders(bearer: string): Readonly<Record<string, string>> {
  return {
    accept: 'application/vnd.github+json',
    authorization: `Bearer ${bearer}`,
    'user-agent': 'oak-merge-bot',
    'x-github-api-version': '2022-11-28',
  };
}

/** Resolve the app's installation id on a repository. */
export async function resolveInstallationId(input: {
  readonly appJwt: string;
  readonly owner: string;
  readonly repo: string;
  readonly apiBaseUrl?: string;
  readonly fetchImpl: GithubApiFetch;
}): Promise<Result<number, Error>> {
  const base = input.apiBaseUrl ?? 'https://api.github.com';
  const response = await input.fetchImpl(
    `${base}/repos/${input.owner}/${input.repo}/installation`,
    { method: 'GET', headers: githubHeaders(input.appJwt) },
  );
  if (response.status !== 200) {
    return err(
      new Error(
        `installation lookup failed for ${input.owner}/${input.repo}: HTTP ${String(response.status)} (is the app installed on the repo?)`,
      ),
    );
  }
  const parsed = parseWithSchema({
    label: 'GET /repos/{owner}/{repo}/installation',
    schema: INSTALLATION_SCHEMA,
    value: await response.json(),
  });
  return parsed.ok ? ok(parsed.value.id) : parsed;
}

/** Mint a short-lived installation access token. */
export async function mintInstallationToken(input: {
  readonly appJwt: string;
  readonly installationId: number;
  readonly apiBaseUrl?: string;
  readonly fetchImpl: GithubApiFetch;
}): Promise<Result<{ token: string; expiresAt: string }, Error>> {
  const base = input.apiBaseUrl ?? 'https://api.github.com';
  const response = await input.fetchImpl(
    `${base}/app/installations/${String(input.installationId)}/access_tokens`,
    { method: 'POST', headers: githubHeaders(input.appJwt) },
  );
  if (response.status !== 201) {
    return err(new Error(`installation token mint failed: HTTP ${String(response.status)}`));
  }
  const parsed = parseWithSchema({
    label: 'POST /app/installations/{id}/access_tokens',
    schema: INSTALLATION_TOKEN_SCHEMA,
    value: await response.json(),
  });
  return parsed.ok ? ok({ token: parsed.value.token, expiresAt: parsed.value.expires_at }) : parsed;
}
