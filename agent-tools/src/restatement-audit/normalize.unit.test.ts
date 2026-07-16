import { describe, expect, it } from 'vitest';

import { normalizeValue } from './normalize.js';

describe('normalizeValue', () => {
  it('lowercases', () => {
    expect(normalizeValue('Completed')).toBe('completed');
  });

  it('trims leading and trailing whitespace', () => {
    expect(normalizeValue('  completed  ')).toBe('completed');
  });

  it('collapses internal whitespace runs to a single space', () => {
    expect(normalizeValue('in   progress')).toBe('in progress');
  });

  it('strips a single trailing period', () => {
    expect(normalizeValue('completed.')).toBe('completed');
  });

  it('strips trailing punctuation runs', () => {
    expect(normalizeValue('completed.,;:')).toBe('completed');
  });

  it('strips mixed trailing whitespace-and-punctuation runs without leaving a trailing space', () => {
    expect(normalizeValue('completed .')).toBe('completed');
    expect(normalizeValue('completed . , ;')).toBe('completed');
    expect(normalizeValue('done 2026-07-07 .')).toBe('done 2026-07-07');
  });

  it.each([
    ['Completed'],
    ['  completed  '],
    ['in   progress'],
    ['completed.'],
    ['completed .'],
    ['completed . , ;'],
    ['8,058 files'],
    ['~15 rows, pending'],
    ['merged to main, PR #337, 2026-07-09'],
    ['.'],
    [''],
  ])('is idempotent over %j', (raw) => {
    expect(normalizeValue(normalizeValue(raw))).toBe(normalizeValue(raw));
  });

  it('treats formatting variants of the same fact as equal', () => {
    expect(normalizeValue('  Completed. ')).toBe(normalizeValue('completed'));
  });

  it('does not strip punctuation that is not trailing', () => {
    expect(normalizeValue('8,058 files')).toBe('8,058 files');
  });

  it('is total over the empty string', () => {
    expect(normalizeValue('')).toBe('');
  });
});
