import { err, ok, type Result } from '@oaknational/result';

import { defaultPrivateKeyPath, loadMergeBotRepoConfig } from './repo-config.js';

/**
 * Identity resolution for `merge-bot mint-token`.
 *
 * `.github/merge-bot.json` is the single AUTHORITY for the bot identity;
 * flags are explicit operator overrides (cross-repo invocation, tests) —
 * never a resolution tier. Split from cli.ts to keep both files inside the
 * size and complexity gates.
 */

interface MergeBotResolveInput {
  readonly envHome?: string;
  readonly repoRoot?: string;
  readonly readConfigFileImpl?: (filePath: string) => string;
}

export interface MintTokenConfig {
  readonly appId: string;
  readonly keyPath: string;
  readonly owner: string;
  readonly repoName: string;
  readonly json: boolean;
}

function parseFlagsForMint(
  rest: readonly string[],
): Result<{ appId?: string; keyPath?: string; repo?: string; json: boolean }, Error> {
  let appId: string | undefined;
  let keyPath: string | undefined;
  let repo: string | undefined;
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
      return err(new Error(`unknown flag "${flag}"`));
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

interface IdentityValues {
  readonly appId: string;
  readonly keyPath: string;
  readonly repo: string;
}

/**
 * The repo config is the AUTHORITY for the bot identity, not a tier a
 * resolution ladder lands on; an override is an explicit flag choice.
 */
function applyAuthority(
  partial: { appId?: string; keyPath?: string; repo?: string },
  input: MergeBotResolveInput,
): Result<IdentityValues, Error> {
  const repoConfig = loadMergeBotRepoConfig({
    repoRoot: input.repoRoot ?? process.cwd(),
    readFileImpl: input.readConfigFileImpl,
  });
  if (!repoConfig.ok) {
    return err(
      new Error(
        `the repo's merge-bot identity is unreadable — .github/merge-bot.json is the single authority; fix it (${repoConfig.error.message}); flags exist only as explicit overrides`,
      ),
    );
  }
  const keyPath = isBlank(partial.keyPath)
    ? deriveKeyPath(input.envHome, repoConfig.value.appSlug)
    : ok(partial.keyPath);
  if (!keyPath.ok) {
    return keyPath;
  }
  return ok({
    appId: isBlank(partial.appId) ? repoConfig.value.appId : partial.appId,
    repo: isBlank(partial.repo) ? repoConfig.value.repo : partial.repo,
    keyPath: keyPath.value,
  });
}

function deriveKeyPath(home: string | undefined, appSlug: string): Result<string, Error> {
  if (isBlank(home)) {
    return err(new Error('cannot derive the key path: HOME is unset'));
  }
  return ok(defaultPrivateKeyPath({ home, appSlug }));
}

export function resolveMintTokenConfig(
  rest: readonly string[],
  input: MergeBotResolveInput,
): Result<MintTokenConfig, Error> {
  const flags = parseFlagsForMint(rest);
  if (!flags.ok) {
    return flags;
  }
  const { appId, keyPath, repo, json } = flags.value;

  const identity: Result<IdentityValues, Error> =
    !isBlank(appId) && !isBlank(keyPath) && !isBlank(repo)
      ? ok({ appId, keyPath, repo })
      : applyAuthority({ appId, keyPath, repo }, input);
  if (!identity.ok) {
    return identity;
  }

  const split = splitRepo(identity.value.repo);
  if (!split.ok) {
    return split;
  }
  return ok({
    appId: identity.value.appId,
    keyPath: identity.value.keyPath,
    owner: split.value.owner,
    repoName: split.value.repoName,
    json,
  });
}
