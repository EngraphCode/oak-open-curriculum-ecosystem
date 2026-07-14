/**
 * Semantic Release Configuration
 *
 * Publishes @oaknational/curriculum-sdk to npm on merge to main.
 * Only the SDK is published; all other workspaces remain private.
 */

/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  branches: [
    {
      name: 'main',
    },
  ],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        releaseRules: [
          {
            breaking: true,
            release: 'major',
          },
          {
            type: 'docs',
            release: 'patch',
          },
          {
            type: 'chore',
            release: 'patch',
          },
          {
            // The release automation's own version-bump commits (the git
            // plugin `message` below) must never trigger another release.
            // Explicit, not left to the analyzer's default treatment of
            // unknown types.
            type: 'release',
            release: false,
          },
        ],
      },
    ],
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
      },
    ],
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
      },
    ],
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
        pkgRoot: 'packages/sdks/oak-curriculum-sdk',
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: [
          'CHANGELOG.md',
          'package.json',
          'packages/sdks/oak-curriculum-sdk/package.json',
          'pnpm-lock.yaml',
        ],
        message:
          'release(${nextRelease.version}): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
    '@semantic-release/github',
  ],
};
