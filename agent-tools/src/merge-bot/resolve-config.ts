import { err, ok, type Result } from '@oaknational/result';

import { defaultPrivateKeyPath, loadMergeBotRepoConfig } from './repo-config.js';
import { isTokenScopeName, TOKEN_SCOPE_NAMES, type TokenScopeName } from './token-scopes.js';

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
  /** The requested scope NAME; permissions are looked up once, at the mint. */
  readonly scope: TokenScopeName;
  readonly json: boolean;
}

/** The scope list, always derived, so usage text cannot drift from the table. */
function scopeList(): string {
  return TOKEN_SCOPE_NAMES.join(', ');
}

/**
 * A usage failure that teaches the whole replacement command, not just the
 * missing flag — a stale paste then self-cures in one step.
 */
function scopeUsageError(problem: string): Error {
  return new Error(
    `${problem} Valid scopes: ${scopeList()}.\n` +
      `  e.g. pnpm --silent agent-tools merge-bot mint-token --scope ${TOKEN_SCOPE_NAMES[0] ?? ''}`,
  );
}

/** Every flag that takes a value. `--json` is a bare switch and is separate. */
const VALUE_FLAGS = ['--app-id', '--private-key-path', '--repo', '--scope'] as const;
type ValueFlag = (typeof VALUE_FLAGS)[number];

/** Widened at the declaration, so membership needs no assertion. */
const VALUE_FLAG_SET: ReadonlySet<string> = new Set(VALUE_FLAGS);

function isValueFlag(flag: string): flag is ValueFlag {
  return VALUE_FLAG_SET.has(flag);
}

/**
 * Collects `--flag value` pairs generically, so adding a flag does not add a
 * branch. Order-independent; a repeated flag takes its last occurrence.
 */
function collectValueFlags(
  rest: readonly string[],
): Result<{ values: Partial<Record<ValueFlag, string>>; json: boolean }, Error> {
  const values: Partial<Record<ValueFlag, string>> = {};
  let json = false;

  for (let i = 0; i < rest.length; i += 1) {
    const flag = rest[i] ?? '';
    if (flag === '--json') {
      json = true;
      continue;
    }
    if (!isValueFlag(flag)) {
      return err(new Error(`unknown flag "${flag}"`));
    }
    const value = rest[i + 1];
    if (value === undefined || value.startsWith('--')) {
      return err(new Error(`${flag} needs a value`));
    }
    values[flag] = value;
    i += 1;
  }
  return ok({ values, json });
}

function parseFlagsForMint(
  rest: readonly string[],
): Result<
  { appId?: string; keyPath?: string; repo?: string; scope: TokenScopeName; json: boolean },
  Error
> {
  const collected = collectValueFlags(rest);
  if (!collected.ok) {
    return collected;
  }
  const { values, json } = collected.value;

  const scope = requireScope(values['--scope']);
  if (!scope.ok) {
    return scope;
  }
  return ok({
    appId: values['--app-id'],
    keyPath: values['--private-key-path'],
    repo: values['--repo'],
    scope: scope.value,
    json,
  });
}

/**
 * Required, with no default: a token carries only what its mint requests, so
 * defaulting would make the most privileged scope the silent one.
 */
function requireScope(scope: string | undefined): Result<TokenScopeName, Error> {
  if (scope === undefined) {
    return err(scopeUsageError('--scope is required.'));
  }
  if (!isTokenScopeName(scope)) {
    return err(scopeUsageError(`unknown --scope "${scope}".`));
  }
  return ok(scope);
}

function isBlank(value: string | undefined): value is undefined | '' {
  return value === undefined || value === '';
}

const OWNER_GRAMMAR = /^[A-Za-z0-9-]+$/;
const REPO_GRAMMAR = /^[A-Za-z0-9._-]+$/;

function splitRepo(repo: string): Result<{ owner: string; repoName: string }, Error> {
  const [owner, repoName, ...extra] = repo.split('/');
  if (
    extra.length > 0 ||
    isBlank(owner) ||
    isBlank(repoName) ||
    !OWNER_GRAMMAR.test(owner) ||
    !REPO_GRAMMAR.test(repoName)
  ) {
    return err(new Error(`--repo must be owner/name in GitHub grammar, got "${repo}"`));
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
  const { appId, keyPath, repo, scope, json } = flags.value;

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
    scope,
    json,
  });
}
