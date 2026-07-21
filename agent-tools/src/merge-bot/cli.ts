import { readFile } from 'node:fs/promises';

import { err, ok, type Result } from '@oaknational/result';

import {
  mintInstallationToken,
  resolveInstallationId,
  signAppJwt,
  type GithubApiFetch,
} from './mint-installation-token.js';
import { resolveMintTokenConfig, type MintTokenConfig } from './resolve-config.js';

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

const USAGE = `merge-bot mint-token [--app-id <id>] [--private-key-path <pem-path>] [--repo <owner/name>] [--json]
  Prints a short-lived GitHub App installation token (stdout carries ONLY the
  token unless --json). The repo's .github/merge-bot.json is the single
  authority for the bot identity; the private key lives at
  ~/.config/<appSlug>/private-key.pem, derived from it. Flags are explicit
  operator overrides (cross-repo invocation, tests) — not a resolution tier.
`;

function realFetch(): GithubApiFetch {
  return async (url, init) => {
    const response = await fetch(url, init);
    return { status: response.status, json: () => response.json() };
  };
}

async function mintForConfig(
  config: MintTokenConfig,
  input: MergeBotCliInput,
): Promise<Result<{ token: string; expiresAt: string; installationId: number }, Error>> {
  const readKey = input.readFileImpl ?? ((path: string) => readFile(path, 'utf8'));
  let privateKeyPem: string;
  try {
    privateKeyPem = await readKey(config.keyPath);
  } catch (cause) {
    return err(
      new Error(
        `cannot read private key at ${config.keyPath}: ${cause instanceof Error ? cause.message : String(cause)}`,
      ),
    );
  }

  const now = input.nowEpochSeconds ?? ((): number => Math.floor(Date.now() / 1000));
  const fetchImpl = input.fetchImpl ?? realFetch();
  const appJwt = signAppJwt({ appId: config.appId, privateKeyPem, nowEpochSeconds: now() });

  const installation = await resolveInstallationId({
    appJwt,
    owner: config.owner,
    repo: config.repoName,
    fetchImpl,
  });
  if (!installation.ok) {
    return installation;
  }

  const minted = await mintInstallationToken({
    appJwt,
    installationId: installation.value,
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
  if (action === undefined || action === '--help' || action === '-h') {
    input.stderr.write(USAGE);
    return action === undefined ? 2 : 0;
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
