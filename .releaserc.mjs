/**
 * Semantic Release Configuration
 *
 * Versions the repo on merge to main: bumps the root and SDK package.json,
 * updates the changelog, and cuts a git tag + GitHub release. Nothing is
 * published to npm (npmPublish is false on both npm plugin entries).
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
            type: 'style',
            release: 'patch',
          },
          {
            type: 'refactor',
            release: 'patch',
          },
          {
            type: 'test',
            release: 'patch',
          },
          {
            type: 'build',
            release: 'patch',
          },
          {
            type: 'ci',
            release: 'patch',
          },
          {
            type: 'revert',
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
