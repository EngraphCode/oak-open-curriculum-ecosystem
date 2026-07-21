import { describe, expect, it } from 'vitest';

import {
  countOpenOwnerJobs,
  formatOwnerAttention,
  parseOwnerJobsLink,
} from './statusline-owner-jobs.js';

const JOBS_FILE = `# Owner jobs — Jim's visible queue

## OJ-1 Drop the release documents
- state: open
- class: material

## OJ-2 Milestone date
- state: open
- class: decision

## OJ-3 Old thing
- state: done (2026-07-21)
- class: word

## OJ-4 Abandoned thing
- state: dropped
- class: decision
`;

describe('countOpenOwnerJobs', () => {
  it('counts only jobs whose state line is open', () => {
    expect(countOpenOwnerJobs(JOBS_FILE)).toBe(2);
  });

  it('returns zero for an absent file', () => {
    expect(countOpenOwnerJobs(undefined)).toBe(0);
  });

  it('returns zero when every job is discharged', () => {
    expect(countOpenOwnerJobs('## OJ-1 x\n- state: done\n')).toBe(0);
  });

  it('does not count the word open in prose or other fields', () => {
    const prose = '## OJ-1 open the pod bay doors\n- state: done\n- ask: open question\n';
    expect(countOpenOwnerJobs(prose)).toBe(0);
  });
});

describe('parseOwnerJobsLink', () => {
  it('reads the link line from the generated header', () => {
    const content =
      '<!-- GENERATED PROJECTION\n     link: https://linear.app/oaknational/label/owner-ask\n-->\n';
    expect(parseOwnerJobsLink(content)).toBe('https://linear.app/oaknational/label/owner-ask');
  });

  it('tolerates surrounding whitespace on the link line', () => {
    const content = 'link:   https://linear.app/oaknational/label/owner-ask   \n';
    expect(parseOwnerJobsLink(content)).toBe('https://linear.app/oaknational/label/owner-ask');
  });

  it('is undefined when absent or for a non-https value', () => {
    expect(parseOwnerJobsLink(undefined)).toBeUndefined();
    expect(parseOwnerJobsLink('no link here')).toBeUndefined();
    expect(parseOwnerJobsLink('link: javascript:alert(1)')).toBeUndefined();
  });

  it('rejects control characters that could break out of the OSC 8 escape', () => {
    expect(parseOwnerJobsLink('link: https://x.example/a\x1b]8;;evil\x07b')).toBeUndefined();
    expect(parseOwnerJobsLink('link: https://x.example/a\x07bell')).toBeUndefined();
    expect(parseOwnerJobsLink('link: https://x.example/a\u{9c}c1')).toBeUndefined();
  });
});

describe('formatOwnerAttention', () => {
  it('renders the bell and count as one bold-yellow sequence', () => {
    // Exact sequence: colour BEFORE bold — YELLOW's leading `0;` SGR resets
    // prior attributes, so BOLD must follow it (the established bold-colour
    // ordering in statusline-segments).
    expect(formatOwnerAttention(3)).toBe('\x1b[0;33m\x1b[1m\u{1F514}3\x1b[0m');
  });

  it('wraps the styled bell in an OSC 8 hyperlink when a link is given', () => {
    expect(formatOwnerAttention(5, 'https://linear.app/oaknational/label/owner-ask')).toBe(
      '\x1b]8;;https://linear.app/oaknational/label/owner-ask\x1b\\' +
        '\x1b[0;33m\x1b[1m\u{1F514}5\x1b[0m' +
        '\x1b]8;;\x1b\\',
    );
  });

  it('is absent at zero open jobs', () => {
    expect(formatOwnerAttention(0)).toBeUndefined();
  });

  it('is absent when the count is unresolved', () => {
    expect(formatOwnerAttention(undefined)).toBeUndefined();
  });
});
