import { describe, expect, it } from 'vitest';

import { parseLatestUsage } from './usage.js';

function usageLine(input: number, cacheCreation: number, cacheRead: number): string {
  return JSON.stringify({
    type: 'assistant',
    message: {
      usage: {
        input_tokens: input,
        cache_creation_input_tokens: cacheCreation,
        cache_read_input_tokens: cacheRead,
        output_tokens: 999,
      },
    },
  });
}

describe('parseLatestUsage', () => {
  it('sums input + cache_creation + cache_read of the latest usage turn', () => {
    const transcript = [usageLine(2, 30, 70), usageLine(5, 100, 200)].join('\n');

    expect(parseLatestUsage(transcript)).toStrictEqual({ usedTokens: 305 });
  });

  it('takes the LATEST usage when several lines carry usage', () => {
    const transcript = [usageLine(1000, 0, 0), usageLine(7, 0, 0), usageLine(42, 0, 0)].join('\n');

    expect(parseLatestUsage(transcript)).toStrictEqual({ usedTokens: 42 });
  });

  it('excludes output_tokens from occupancy', () => {
    expect(parseLatestUsage(usageLine(10, 0, 0))).toStrictEqual({ usedTokens: 10 });
  });

  it('defaults absent cache fields to zero', () => {
    const line = JSON.stringify({ message: { usage: { input_tokens: 12 } } });

    expect(parseLatestUsage(line)).toStrictEqual({ usedTokens: 12 });
  });

  it('skips malformed lines and blank lines, finding the last valid usage', () => {
    const transcript = ['not json', '', usageLine(3, 1, 1), '{ broken', ''].join('\n');

    expect(parseLatestUsage(transcript)).toStrictEqual({ usedTokens: 5 });
  });

  it('returns undefined when no line carries a usage object', () => {
    const transcript = [JSON.stringify({ type: 'user', message: { role: 'user' } }), ''].join('\n');

    expect(parseLatestUsage(transcript)).toBeUndefined();
  });
});
