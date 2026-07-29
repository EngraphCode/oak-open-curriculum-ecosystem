import { readFile } from 'node:fs/promises';

import { err, ok, type Result } from '@oaknational/result';

import {
  mintInstallationToken,
  resolveInstallationId,
  signAppJwt,
  type GithubApiFetch,
} from './mint-installation-token.js';
import { resolveMintTokenConfig, type MintTokenConfig } from './resolve-config.js';
import { permissionNamesFor, TOKEN_SCOPE_NAMES, TOKEN_SCOPES } from './token-scopes.js';

/**
 * CLI for the `merge-bot` topic (AIP-158).
 *
 * `merge-bot mint-token` prints a short-lived GitHub App installation token
 * to stdout (and nothing else there), so callers can run merge operations as
 * the bot: `GH_TOKEN=$(agent-tools merge-bot mint-token) gh pr merge …`.
 * The bot is not a ruleset bypass actor, so its merges bind to required
 * checks — the sanctioned direct-merge path under the 2026-07-21 owner
 * rulings (`--admin` always banned; direct `--merge` banned on
 * bypass-capable accounts).
 */

interface MergeBotEnvironment {
  readonly HOME?: string;
}

export interface MergeBotCliInput {
  readonly args: readonly string[];
  readonly env: MergeBotEnvironment;
  /** Repo root for `.github/merge-bot.json` resolution (usually the cwd's repo). */
  readonly repoRoot?: string;
  readonly readConfigFileImpl?: (filePath: string) => string;
  readonly stdout: Pick<NodeJS.WriteStream, 'write'>;
  readonly stderr: Pick<NodeJS.WriteStream, 'write'>;
  /** Injection seams for tests. */
  readonly fetchImpl?: GithubApiFetch;
  readonly readFileImpl?: (path: string) => Promise<string>;
  readonly nowEpochSeconds?: () => number;
}

const USAGE = `merge-bot mint-token --scope <${TOKEN_SCOPE_NAMES.join('|')}> [--app-id <id>] [--private-key-path <pem-path>] [--repo <owner/name>] [--json]
  Prints a short-lived GitHub App installation token (stdout carries ONLY the
  token unless --json, which bundles the token into the printed object). The
  repo's .github/merge-bot.json is the single authority for the bot identity;
  the private key lives at ~/.config/<appSlug>/private-key.pem, derived from
  it. Flags are explicit operator overrides (cross-repo invocation, tests) —
  not a resolution tier.

  --scope is REQUIRED and has no default: a token carries only the permissions
  its mint requests, so defaulting would make the most privileged scope the
  silent one. Scopes and what each permits are defined in token-scopes.ts.
${TOKEN_SCOPE_NAMES.map((name) => `    ${name}: ${permissionNamesFor(name).join(', ')}\n`).join('')}
  A 403 from a call made with this token means the wrong --scope, not a broken
  bot: an ungranted permission fails the mint itself with a 422.
`;

function realFetch(): GithubApiFetch {
  return async (url, init) => {
    const response = await fetch(url, init);
    return { status: response.status, json: () => response.json() };
  };
}

function signJwtResult(
  appId: string,
  privateKeyPem: string,
  nowEpochSeconds: number,
): Result<string, Error> {
  try {
    return ok(signAppJwt({ appId, privateKeyPem, nowEpochSeconds }));
  } catch (cause) {
    return err(
      new Error(
        `cannot sign the app JWT (is the PEM a valid private key?): ${cause instanceof Error ? cause.message : String(cause)}`,
      ),
    );
  }
}

async function readKeyResult(
  keyPath: string,
  readFileImpl: MergeBotCliInput['readFileImpl'],
): Promise<Result<string, Error>> {
  const readKey = readFileImpl ?? ((path: string) => readFile(path, 'utf8'));
  try {
    return ok(await readKey(keyPath));
  } catch (cause) {
    return err(
      new Error(
        `cannot read private key at ${keyPath}: ${cause instanceof Error ? cause.message : String(cause)}`,
      ),
    );
  }
}

async function mintForConfig(
  config: MintTokenConfig,
  input: MergeBotCliInput,
): Promise<Result<{ token: string; expiresAt: string; installationId: number }, Error>> {
  const privateKeyPem = await readKeyResult(config.keyPath, input.readFileImpl);
  if (!privateKeyPem.ok) {
    return privateKeyPem;
  }

  const now = input.nowEpochSeconds ?? ((): number => Math.floor(Date.now() / 1000));
  const fetchImpl = input.fetchImpl ?? realFetch();
  const appJwt = signJwtResult(config.appId, privateKeyPem.value, now());
  if (!appJwt.ok) {
    return appJwt;
  }

  const installation = await resolveInstallationId({
    appJwt: appJwt.value,
    owner: config.owner,
    repo: config.repoName,
    fetchImpl,
  });
  if (!installation.ok) {
    return installation;
  }

  const minted = await mintInstallationToken({
    appJwt: appJwt.value,
    installationId: installation.value,
    repoName: config.repoName,
    permissions: TOKEN_SCOPES[config.scope],
    fetchImpl,
  });
  if (!minted.ok) {
    return minted;
  }
  return ok({ ...minted.value, installationId: installation.value });
}

function writeSuccess(
  outcome: { token: string; expiresAt: string; installationId: number },
  json: boolean,
  input: MergeBotCliInput,
): void {
  if (json) {
    input.stdout.write(`${JSON.stringify(outcome)}\n`);
    return;
  }
  input.stdout.write(`${outcome.token}\n`);
  input.stderr.write(`token expires ${outcome.expiresAt}\n`);
}

export async function runMergeBotCli(input: MergeBotCliInput): Promise<number> {
  const [action, ...rest] = input.args;
  if (action === '--help' || action === '-h') {
    input.stdout.write(USAGE);
    return 0;
  }
  if (action === undefined) {
    input.stderr.write(USAGE);
    return 2;
  }
  if (action !== 'mint-token') {
    input.stderr.write(`merge-bot: unknown action "${action}"\n${USAGE}`);
    return 2;
  }

  const config = resolveMintTokenConfig(rest, {
    envHome: input.env.HOME,
    repoRoot: input.repoRoot,
    readConfigFileImpl: input.readConfigFileImpl,
  });
  if (!config.ok) {
    input.stderr.write(`merge-bot mint-token: ${config.error.message}\n`);
    return 2;
  }

  const outcome = await mintForConfig(config.value, input);
  if (!outcome.ok) {
    input.stderr.write(`merge-bot mint-token: ${outcome.error.message}\n`);
    return 1;
  }
  writeSuccess(outcome.value, config.value.json, input);
  return 0;
}
