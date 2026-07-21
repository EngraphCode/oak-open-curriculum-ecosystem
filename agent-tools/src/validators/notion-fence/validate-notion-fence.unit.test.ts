import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { FENCED_PAGE_ID_SHA256, scanForFenceViolations } from './validate-notion-fence-helpers.js';

const NO_EXEMPTIONS: ReadonlySet<string> = new Set();

describe('scanForFenceViolations', () => {
  it('flags workspace-page hosts, line-anchored', () => {
    const content = 'line one\nsee https://app.notion.com/p/whatever\n';
    const violations = scanForFenceViolations('doc.md', content, NO_EXEMPTIONS);
    expect(violations).toEqual([{ path: 'doc.md', line: 2, reason: 'workspace-host' }]);
  });

  it('flags notion.so with and without www', () => {
    const content = 'https://www.notion.so/x\nhttps://notion.so/y\n';
    const violations = scanForFenceViolations('doc.md', content, NO_EXEMPTIONS);
    expect(violations).toHaveLength(2);
  });

  it('does NOT flag the public developer-docs host', () => {
    const content = 'see https://developers.notion.com for the API\n';
    expect(scanForFenceViolations('doc.md', content, NO_EXEMPTIONS)).toEqual([]);
  });

  it('flags a 32-hex token whose hash matches the fenced digest', () => {
    const fixtureId = 'deadbeefdeadbeefdeadbeefdeadbeef';
    const fixtureDigest = createHash('sha256').update(fixtureId).digest('hex');
    const violations = scanForFenceViolations(
      'doc.md',
      `see page ${fixtureId} here\n`,
      NO_EXEMPTIONS,
      fixtureDigest,
    );
    expect(violations).toEqual([{ path: 'doc.md', line: 1, reason: 'fenced-page-id' }]);
  });

  it('passes a 32-hex token whose hash does not match (default digest)', () => {
    const benign = 'deadbeefdeadbeefdeadbeefdeadbeef';
    expect(createHash('sha256').update(benign).digest('hex')).not.toBe(FENCED_PAGE_ID_SHA256);
    expect(scanForFenceViolations('doc.md', `id: ${benign}\n`, NO_EXEMPTIONS)).toEqual([]);
  });

  it('skips exempt paths entirely', () => {
    const content = 'https://app.notion.com/p/x\n';
    const exempt: ReadonlySet<string> = new Set(['fence.ts']);
    expect(scanForFenceViolations('fence.ts', content, exempt)).toEqual([]);
  });

  it('is silent on clean content', () => {
    expect(
      scanForFenceViolations('doc.md', '# Nothing to see\nplain text\n', NO_EXEMPTIONS),
    ).toEqual([]);
  });
});
