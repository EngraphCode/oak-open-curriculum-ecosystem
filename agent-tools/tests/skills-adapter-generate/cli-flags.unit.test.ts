import { describe, expect, it } from 'vitest';

import { parseCliFlags } from '../../src/skills-adapter-generate/cli-flags';

describe('parseCliFlags', () => {
  it('parses the pinned generate and check invocations', () => {
    expect(parseCliFlags(['--prefix=oak-'])).toEqual({
      kind: 'ok',
      flags: { clear: false, check: false, prefix: 'oak-' },
    });
    expect(parseCliFlags(['--check', '--prefix=oak-'])).toEqual({
      kind: 'ok',
      flags: { clear: false, check: true, prefix: 'oak-' },
    });
    expect(parseCliFlags(['--clear', '--prefix=oak-'])).toEqual({
      kind: 'ok',
      flags: { clear: true, check: false, prefix: 'oak-' },
    });
  });

  it('refuses an unrecognised argument by name instead of silently generating', () => {
    const result = parseCliFlags(['--chekc', '--prefix=oak-']);
    expect(result.kind).toBe('error');
    expect(result.kind === 'error' && result.message).toContain('--chekc');
  });

  it('answers --help as help, never as a prefix error', () => {
    expect(parseCliFlags(['--help'])).toEqual({ kind: 'help' });
    expect(parseCliFlags(['-h'])).toEqual({ kind: 'help' });
  });

  it('refuses a missing or empty prefix with the pinned-script guidance', () => {
    const missing = parseCliFlags([]);
    expect(missing.kind).toBe('error');
    expect(missing.kind === 'error' && missing.message).toContain('skills:generate');
    const empty = parseCliFlags(['--prefix=']);
    expect(empty.kind).toBe('error');
  });
});
