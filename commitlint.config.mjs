import conventional from '@commitlint/config-conventional';

/**
 * Extends the conventional type set with `release`, the dedicated type for
 * semantic-release's own version-bump commits (`.releaserc.mjs` git plugin
 * `message`: `release(<version>): <version> [skip ci]`). A dedicated type
 * keeps release-automation commits structurally distinguishable from work
 * commits; the commit-analyzer maps it to no version bump.
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [...conventional.rules['type-enum'][2], 'release']],
  },
};
