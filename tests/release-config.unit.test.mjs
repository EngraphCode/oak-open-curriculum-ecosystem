import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

import releaseConfig from '../.releaserc.mjs';

const require = createRequire(import.meta.url);
const semanticReleaseEntry = require.resolve('semantic-release');
const semanticReleaseRequire = createRequire(semanticReleaseEntry);
const commitAnalyzerEntry = semanticReleaseRequire.resolve('@semantic-release/commit-analyzer');
const { analyzeCommits } = await import(commitAnalyzerEntry);

function findPlugin(name) {
  const plugin = releaseConfig.plugins.find((entry) =>
    Array.isArray(entry) ? entry[0] === name : entry === name,
  );

  assert.ok(plugin, `Expected ${name} in the semantic-release configuration`);
  return plugin;
}

const commitAnalyzerPlugin = findPlugin('@semantic-release/commit-analyzer');
assert.ok(Array.isArray(commitAnalyzerPlugin));
const commitAnalyzerOptions = commitAnalyzerPlugin[1];

async function determineReleaseType(...messages) {
  return analyzeCommits(commitAnalyzerOptions, {
    commits: messages.map((message) => ({ message })),
    logger: { log() {} },
  });
}

describe('semantic-release configuration', () => {
  it('releases documentation and maintenance commits as patches', async () => {
    assert.equal(await determineReleaseType('docs: clarify release behaviour'), 'patch');
    assert.equal(await determineReleaseType('chore: refresh dependencies'), 'patch');
  });

  it('preserves the default release types and highest-impact precedence', async () => {
    assert.equal(await determineReleaseType('fix: correct an error'), 'patch');
    assert.equal(await determineReleaseType('perf: reduce response time'), 'patch');
    assert.equal(
      await determineReleaseType('chore: refresh dependencies', 'feat: add a capability'),
      'minor',
    );
    assert.equal(
      await determineReleaseType(
        'docs: update migration notes\n\nBREAKING CHANGE: remove the legacy interface',
      ),
      'major',
    );
  });

  it('keeps generated chore(release) commits from starting another CI cycle', async () => {
    const gitPlugin = findPlugin('@semantic-release/git');
    assert.ok(Array.isArray(gitPlugin));
    assert.match(gitPlugin[1].message, /\[skip ci\]/u);
    assert.equal(await determineReleaseType('chore(release): 1.65.0 [skip ci]'), 'patch');
  });
});
