import { createRequire } from 'node:module';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { resolveRepoRoot } from '../src/core/repo-root';

/**
 * Contract test for the root semantic-release configuration
 * (`.releaserc.mjs`).
 *
 * @remarks
 * The release pipeline maps Conventional Commit types to version bumps via
 * `@semantic-release/commit-analyzer` release rules. This suite drives the
 * exact analyzer copy the root `semantic-release` installation resolves
 * (via `createRequire` chaining, so a duplicate direct dependency cannot
 * drift from the copy releases actually use) against the real configuration,
 * so a config edit that silently changes release behaviour fails here — on
 * the shared `test` task (pre-commit, pre-push, CI, and `pnpm check`;
 * ADR-121) — rather than on the next merge to `main`.
 */

const repoRoot = resolveRepoRoot(import.meta.url, { projectDir: undefined });
const rootRequire = createRequire(join(repoRoot, 'package.json'));

const pluginOptionsSchema = z.looseObject({});
const pluginTupleSchema = z.tuple([z.string(), pluginOptionsSchema]);
const releaseConfigSchema = z.object({
  default: z.looseObject({
    plugins: z.array(z.union([z.string(), pluginTupleSchema])),
  }),
});

// require(esm) is stable on the repo's pinned Node 24 (`.nvmrc`, `engines`)
// for modules without top-level await, so requiring the ESM `.releaserc.mjs`
// does NOT throw ERR_REQUIRE_ESM. Dynamic import() is banned
// (@oaknational/no-dynamic-import); createRequire is the repo's lint-clean
// runtime-loading boundary.
const releaseConfigModule: unknown = rootRequire(join(repoRoot, '.releaserc.mjs'));
const releaseConfig = releaseConfigSchema.parse(releaseConfigModule).default;

function findPluginOptions(name: string): Record<string, unknown> {
  const entry = releaseConfig.plugins.find((candidate) =>
    Array.isArray(candidate) ? candidate[0] === name : candidate === name,
  );

  return pluginTupleSchema.parse(entry, {
    error: () => `Expected ${name} to be configured with options in .releaserc.mjs`,
  })[1];
}

/**
 * The `analyzeCommits` plugin-step signature this suite exercises: it maps a
 * set of commits to a release type (`'major' | 'minor' | 'patch'`) or `null`
 * when nothing is releasable.
 */
type AnalyzeCommits = (
  pluginConfig: Record<string, unknown>,
  context: {
    readonly commits: readonly { readonly message: string }[];
    readonly logger: { readonly log: (...args: readonly unknown[]) => void };
  },
) => Promise<string | null>;

// Resolve `@semantic-release/commit-analyzer` through the root
// `semantic-release` installation so the test exercises the exact copy the
// release run uses.
const semanticReleaseEntry = rootRequire.resolve('semantic-release');
const commitAnalyzerModule: unknown = createRequire(semanticReleaseEntry)(
  '@semantic-release/commit-analyzer',
);

const { analyzeCommits } = z
  .object({
    analyzeCommits: z.custom<AnalyzeCommits>((value) => typeof value === 'function'),
  })
  .parse(commitAnalyzerModule);

async function determineReleaseType(...messages: readonly string[]): Promise<string | null> {
  return analyzeCommits(findPluginOptions('@semantic-release/commit-analyzer'), {
    commits: messages.map((message) => ({ message })),
    logger: {
      log: () => {
        // The analyzer logs its per-commit analysis; the test needs silence.
      },
    },
  });
}

describe('semantic-release configuration', () => {
  it('releases documentation and maintenance commits as patches', async () => {
    expect(await determineReleaseType('docs: clarify release behaviour')).toBe('patch');
    expect(await determineReleaseType('chore: refresh dependencies')).toBe('patch');
  });

  it('preserves the default release types and highest-impact precedence', async () => {
    expect(await determineReleaseType('fix: correct an error')).toBe('patch');
    expect(await determineReleaseType('perf: reduce response time')).toBe('patch');
    expect(
      await determineReleaseType('chore: refresh dependencies', 'feat: add a capability'),
    ).toBe('minor');
    expect(
      await determineReleaseType(
        'docs: update migration notes\n\nBREAKING CHANGE: remove the legacy interface',
      ),
    ).toBe('major');
  });

  it('maps every commitlint-permitted work-commit type to a version bump', async () => {
    // The every-merge release model: every deployment from `main` carries a
    // distinct version, so every commit type a human can land (the commitlint
    // type-enum, minus the automation-only `release` type) must trigger a
    // bump. Reading the live commitlint config pins the two configs together.
    const commitlintModule: unknown = rootRequire(join(repoRoot, 'commitlint.config.mjs'));
    const typeEnum = z
      .object({
        default: z.looseObject({
          rules: z.looseObject({
            'type-enum': z.tuple([z.number(), z.string(), z.array(z.string())]),
          }),
        }),
      })
      .parse(commitlintModule).default.rules['type-enum'][2];

    const workTypes = typeEnum.filter((type) => type !== 'release');
    expect(workTypes.length).toBeGreaterThan(0);

    const releaseTypes = await Promise.all(
      workTypes.map(
        async (type) =>
          [type, await determineReleaseType(`${type}: exercise the ${type} rule`)] as const,
      ),
    );

    for (const [type, releaseType] of releaseTypes) {
      expect(releaseType, `expected \`${type}:\` commits to trigger a release`).not.toBeNull();
    }
  });

  it('commits the version bump with the dedicated release type and the CI loop guard', () => {
    const gitPluginOptions = z
      .object({ message: z.string() })
      .parse(findPluginOptions('@semantic-release/git'));

    expect(gitPluginOptions.message).toBe(
      'release(${nextRelease.version}): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
    );
  });

  it('never lets a release-typed commit trigger another version bump', async () => {
    const analyzerOptions = z
      .object({ releaseRules: z.array(z.looseObject({})) })
      .parse(findPluginOptions('@semantic-release/commit-analyzer'));

    expect(analyzerOptions.releaseRules).toContainEqual({ type: 'release', release: false });
    expect(await determineReleaseType('release(1.65.0): 1.65.0 [skip ci]')).toBeNull();
  });
});
