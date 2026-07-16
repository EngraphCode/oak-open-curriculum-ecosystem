import { describe, expect, it } from 'vitest';

import { screenWindowMembership } from './window-membership.js';
import type { PartitionWindow } from './stage-io.js';

const windows: PartitionWindow[] = [
  { window: 'W01', files: ['a.md', 'b.md'] },
  { window: 'W02', files: ['c.md'] },
];

function result(files: readonly string[]) {
  return { instances: files.map((file, index) => ({ file, id: `i${index}` })) };
}

describe('screenWindowMembership', () => {
  it('passes windows whose every instance file belongs to the window', () => {
    const { screened, violations } = screenWindowMembership(windows, [
      result(['a.md', 'b.md', 'a.md']),
      result(['c.md']),
    ]);
    expect(violations).toEqual([]);
    expect(screened[0]).not.toBeNull();
    expect(screened[1]).not.toBeNull();
  });

  it('fails a window WHOLE when any instance names a file outside it — hallucinated paths must not enter the evidence graph', () => {
    const { screened, violations } = screenWindowMembership(windows, [
      result(['a.md', '/etc/passwd', 'z.md']),
      result(['c.md']),
    ]);
    expect(violations).toEqual([{ window: 'W01', alienFiles: ['/etc/passwd', 'z.md'] }]);
    expect(screened[0]).toBeNull();
    expect(screened[1]).not.toBeNull();
  });

  it('rejects a file from ANOTHER window — membership is per-window, not corpus-wide', () => {
    const { screened, violations } = screenWindowMembership(windows, [
      result(['a.md']),
      result(['a.md']),
    ]);
    expect(violations).toEqual([{ window: 'W02', alienFiles: ['a.md'] }]);
    expect(screened[1]).toBeNull();
  });

  it('passes dead (null) windows through unchanged — they are already incomplete', () => {
    const { screened, violations } = screenWindowMembership(windows, [null, result(['c.md'])]);
    expect(violations).toEqual([]);
    expect(screened[0]).toBeNull();
  });

  it('passes a clean zero-instance window', () => {
    const { screened, violations } = screenWindowMembership(windows, [
      result([]),
      result(['c.md']),
    ]);
    expect(violations).toEqual([]);
    expect(screened[0]).not.toBeNull();
  });
});
