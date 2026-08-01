import { describe, expect, it } from 'vitest';

import { shellSingleQuote } from './shell-single-quote.js';

// Quoting contract for the one shared POSIX single-quoting primitive
// (consolidate-at-second-consumer: the Claude SessionStart env-file lines and
// the spawn launch-command render both rely on exactly these renderings).
describe('shellSingleQuote', () => {
  it('wraps a plain value in single quotes', () => {
    expect(shellSingleQuote('abc123')).toBe("'abc123'");
  });

  it('keeps a value with spaces and metacharacters a single argument', () => {
    expect(shellSingleQuote('a path/with spaces & ; | * ?')).toBe("'a path/with spaces & ; | * ?'");
  });

  it('escapes an embedded single quote by close-escape-reopen', () => {
    expect(shellSingleQuote("it's")).toBe(String.raw`'it'\''s'`);
  });

  it('escapes every embedded single quote independently', () => {
    expect(shellSingleQuote("a'b'c")).toBe(String.raw`'a'\''b'\''c'`);
  });

  it('renders the degenerate lone-quote value', () => {
    expect(shellSingleQuote("'")).toBe(String.raw`''\'''`);
  });

  it('renders the empty string as an empty quoted argument', () => {
    expect(shellSingleQuote('')).toBe("''");
  });

  it('leaves backslashes untouched (single quotes have no backslash escape)', () => {
    expect(shellSingleQuote(String.raw`a\b`)).toBe(String.raw`'a\b'`);
  });

  it('neutralises dollar expansion and command substitution', () => {
    expect(shellSingleQuote('$HOME')).toBe("'$HOME'");
    expect(shellSingleQuote('`id`')).toBe("'`id`'");
  });

  it('preserves an interior newline (argument safety, not line safety)', () => {
    expect(shellSingleQuote('a\nb')).toBe("'a\nb'");
  });

  it('is not idempotent — apply once, to a raw value', () => {
    expect(shellSingleQuote(shellSingleQuote('a'))).toBe(String.raw`''\''a'\'''`);
  });
});
