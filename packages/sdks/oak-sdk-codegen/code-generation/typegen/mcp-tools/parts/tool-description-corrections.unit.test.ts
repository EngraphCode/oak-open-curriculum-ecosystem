import { describe, it, expect } from 'vitest';
import { applyDescriptionCorrections } from './tool-description-corrections.js';

/**
 * Unit tests for applyDescriptionCorrections pure function.
 *
 * Proves: an upstream description claim that is observably false at the served
 * surface is replaced with the observed behaviour for the keyed operation, the
 * correction is keyed to the exact upstream sentence (an upstream rewording
 * passes through unchanged — the removal-condition test owns the loud signal),
 * and every other description passes through untouched.
 */
describe('applyDescriptionCorrections', () => {
  const upstreamKeywordsSentence =
    'The keywords are returned in order of frequency, with the most common keywords appearing first.';

  it('replaces the false frequency-ordering claim for /keywords GET with the observed behaviour', () => {
    const description = `Keywords\n\nThis tool returns a list of keywords for a given key stage and subject. ${upstreamKeywordsSentence}`;

    const result = applyDescriptionCorrections(description, '/keywords', 'get');

    expect(result).not.toContain('in order of frequency');
    expect(result).toContain('alphabetical order');
    expect(result).toContain('no frequency field');
    expect(result).toContain('Keywords\n\nThis tool returns a list of keywords');
  });

  it('matches the operation method case-insensitively', () => {
    const description = `Keywords\n\n${upstreamKeywordsSentence}`;

    const result = applyDescriptionCorrections(description, '/keywords', 'GET');

    expect(result).not.toContain('in order of frequency');
    expect(result).toContain('alphabetical order');
  });

  it('passes a reworded upstream description through unchanged', () => {
    const reworded =
      'Keywords\n\nThis tool returns keywords ranked by frequency with a lessonCount field.';

    const result = applyDescriptionCorrections(reworded, '/keywords', 'get');

    expect(result).toBe(reworded);
  });

  it('leaves descriptions of operations without corrections unchanged', () => {
    const description = `Other tool\n\n${upstreamKeywordsSentence}`;

    const result = applyDescriptionCorrections(description, '/lessons/{lesson}/summary', 'get');

    expect(result).toBe(description);
  });

  it('returns undefined when description is undefined', () => {
    expect(applyDescriptionCorrections(undefined, '/keywords', 'get')).toBeUndefined();
  });
});
