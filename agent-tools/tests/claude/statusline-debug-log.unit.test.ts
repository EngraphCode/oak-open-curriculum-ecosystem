import { resolveDebugLogPath } from '../../src/claude/statusline-debug-log';

describe('resolveDebugLogPath', () => {
  it('returns undefined when OAK_STATUSLINE_LOG_FILE is unset', () => {
    expect(resolveDebugLogPath({})).toBeUndefined();
  });

  it('returns undefined for an empty or whitespace-only value', () => {
    expect(resolveDebugLogPath({ OAK_STATUSLINE_LOG_FILE: '' })).toBeUndefined();
    expect(resolveDebugLogPath({ OAK_STATUSLINE_LOG_FILE: '   ' })).toBeUndefined();
  });

  it('returns the path when the value ends with .log', () => {
    expect(resolveDebugLogPath({ OAK_STATUSLINE_LOG_FILE: '/tmp/statusline.log' })).toBe(
      '/tmp/statusline.log',
    );
  });

  it('refuses a path without the .log suffix — the append-anywhere guard', () => {
    // The env var drives a file append, so the surface is deliberately narrowed
    // to *.log destinations; anything else resolves to "logging disabled".
    expect(resolveDebugLogPath({ OAK_STATUSLINE_LOG_FILE: '/tmp/notes.txt' })).toBeUndefined();
    expect(resolveDebugLogPath({ OAK_STATUSLINE_LOG_FILE: '/tmp/log' })).toBeUndefined();
  });
});
