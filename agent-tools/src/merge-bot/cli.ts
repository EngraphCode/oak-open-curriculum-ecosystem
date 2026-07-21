import { readFile } from 'node:fs/promises';

import { err, ok, type Result } from '@oaknational/result';

import {
  mintInstallationToken,
  resolveInstallationId,
  signAppJwt,
  type GithubApiFetch,
} from './mint-installation-token.js';

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
  readonly OAK_MERGE_BOT_APP_ID?: string;
  readonly OAK_MERGE_BOT_PRIVATE_KEY_PATH?: string;
  readonly OAK_MERGE_BOT_REPO?: string;
}

export interface MergeBotCliInput {
  readonly args: readonly string[];
  readonly env: MergeBotEnvironment;
  readonly stdout: Pick<NodeJS.WriteStream, 'write'>;
  readonly stderr: Pick<NodeJS.WriteStream, 'write'>;
  /** Injection seams for tests. */
  readonly fetchImpl?: GithubApiFetch;
  readonly readFileImpl?: (path: string) => Promise<string>;
  readonly nowEpochSeconds?: () => number;
}

const USAGE = `merge-bot mint-token [--app-id <id>] [--private-key-path <pem-path>] [--repo <owner/name>] [--json]
  Prints a short-lived GitHub App installation token (stdout carries ONLY the
  token unless --json). Defaults from env: OAK_MERGE_BOT_APP_ID,
  OAK_MERGE_BOT_PRIVATE_KEY_PATH, OAK_MERGE_BOT_REPO
  (fallback repo: oaknational/oak-open-curriculum-ecosystem).
`;

const DEFAULT_REPO = 'oaknational/oak-open-curriculum-ecosystem';

interface MintTokenConfig {
  readonly appId: string;
  readonly keyPath: string;
  readonly owner: string;
  readonly repoName: string;
  readonly json: boolean;
}

function realFetch(): GithubApiFetch {
  return async (url, init) => {
    const response = await fetch(url, init);
    return { status: response.status, json: () => response.json() };
  };
}

function parseFlags(
  rest: readonly string[],
  env: MergeBotEnvironment,
): Result<{ appId?: string; keyPath?: string; repo: string; json: boolean }, Error> {
  let appId = env.OAK_MERGE_BOT_APP_ID;
  let keyPath = env.OAK_MERGE_BOT_PRIVATE_KEY_PATH;
  let repo = env.OAK_MERGE_BOT_REPO ?? DEFAULT_REPO;
  let json = false;

  for (let i = 0; i < rest.length; i += 1) {
    const flag = rest[i];
    if (flag === '--json') {
      json = true;
      continue;
    }
    const value = rest[i + 1];
    if (value === undefined) {
      return err(new Error(`${flag} needs a value`));
    }
    if (flag === '--app-id') {
      appId = value;
    } else if (flag === '--private-key-path') {
      keyPath = value;
    } else if (flag === '--repo') {
      repo = value;
    } else {
      return err(new Error(`unknown flag "${flag}"\n${USAGE}`));
    }
    i += 1;
  }
  return ok({ appId, keyPath, repo, json });
}

function isBlank(value: string | undefined): value is undefined | '' {
  return value === undefined || value === '';
}

function splitRepo(repo: string): Result<{ owner: string; repoName: string }, Error> {
  const [owner, repoName] = repo.split('/');
  if (isBlank(owner) || isBlank(repoName)) {
    return err(new Error(`--repo must be owner/name, got "${repo}"`));
  }
  return ok({ owner, repoName });
}

function resolveConfig(
  rest: readonly string[],
  env: MergeBotEnvironment,
): Result<MintTokenConfig, Error> {
  const flags = parseFlags(rest, env);
  if (!flags.ok) {
    return flags;
  }
  const { appId, keyPath, repo, json } = flags.value;
  if (isBlank(appId) || isBlank(keyPath)) {
    return err(
      new Error(
        '--app-id and --private-key-path (or OAK_MERGE_BOT_APP_ID / OAK_MERGE_BOT_PRIVATE_KEY_PATH) are required',
      ),
    );
  }
  const split = splitRepo(repo);
  if (!split.ok) {
    return split;
  }
  return ok({ appId, keyPath, owner: split.value.owner, repoName: split.value.repoName, json });
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

  const config = resolveConfig(rest, input.env);
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
