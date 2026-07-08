import { describe, expect, it } from 'vitest';

import {
  compareRatifiedList,
  extractBacktickListParagraph,
} from './validate-ratified-lists-helpers.js';

/**
 * Pure behaviours of the ratified-lists validator: backtick-list extraction
 * from a section (including wrapped paragraphs), the refusal set (missing
 * section; section without a list paragraph), and exact-order comparison.
 * String fixtures only — the validator entry owns the file IO.
 */

const PACKET = [
  '# Packet',
  '',
  '## 1. Other section',
  '',
  'Prose only here.',
  '',
  '## 2. Net-C keyword list (ratification item 2)',
  '',
  'Prose paragraph before the list, which must be skipped.',
  '',
  '`alpha`, `beta gamma`,',
  '`delta`',
  '',
  'Trailing prose after the list.',
  '',
  '### 2a. Census completion-keyword list',
  '',
  '`one`, `two`',
  '',
].join('\n');

describe('extractBacktickListParagraph', () => {
  it('extracts the first backtick paragraph, in order, across wrapped lines', () => {
    const tokens = extractBacktickListParagraph(PACKET, '## 2. Net-C keyword list');
    expect(tokens.ok).toBe(true);
    if (tokens.ok) {
      expect(tokens.value).toEqual(['alpha', 'beta gamma', 'delta']);
    }
  });

  it('extracts a subsection list without leaking the parent section paragraph', () => {
    const tokens = extractBacktickListParagraph(PACKET, '### 2a. Census completion-keyword list');
    expect(tokens.ok).toBe(true);
    if (tokens.ok) {
      expect(tokens.value).toEqual(['one', 'two']);
    }
  });

  it('refuses a missing section', () => {
    const tokens = extractBacktickListParagraph(PACKET, '## 9. Absent');
    expect(tokens.ok).toBe(false);
    if (!tokens.ok) {
      expect(tokens.error.message).toContain('not found');
    }
  });

  it('refuses a section with no backtick list paragraph', () => {
    const tokens = extractBacktickListParagraph(PACKET, '## 1. Other section');
    expect(tokens.ok).toBe(false);
    if (!tokens.ok) {
      expect(tokens.error.message).toContain('no backtick list paragraph');
    }
  });
});

describe('compareRatifiedList', () => {
  it('returns no drift for identical lists in identical order', () => {
    expect(compareRatifiedList({ label: 'x', packet: ['a', 'b'], code: ['a', 'b'] })).toEqual([]);
  });

  it('reports drift on a reordered, missing, or extra token', () => {
    expect(
      compareRatifiedList({ label: 'x', packet: ['a', 'b'], code: ['b', 'a'] }).length,
    ).toBeGreaterThan(0);
    expect(
      compareRatifiedList({ label: 'x', packet: ['a'], code: ['a', 'b'] }).length,
    ).toBeGreaterThan(0);
  });
});
