import { describe, expect, it } from 'vitest';
import { normaliseLineEndings } from './normalise-line-endings.js';

describe('normaliseLineEndings', () => {
  it('normalises CRLF and lone CR without changing LF text', () => {
    expect(normaliseLineEndings('one\r\ntwo\rthree\n')).toBe('one\ntwo\nthree\n');
  });
});
