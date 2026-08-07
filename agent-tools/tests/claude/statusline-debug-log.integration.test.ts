import { appendDebugLogEntry, type DebugLogFs } from '../../src/claude/statusline-debug-log';

/**
 * In-memory fake of the narrow fs surface, recording calls and options.
 * No IO anywhere in this suite: the OS filesystem bridge is not ours to
 * prove — these tests prove our code's behaviour at the injected seam
 * (testing-strategy §Test Types; ADR-078).
 */
function fakeFs(behaviour: { mkdirThrows?: boolean; appendThrows?: boolean } = {}): {
  fs: DebugLogFs;
  appended: { path: string; data: string; mode: number }[];
  mkdirs: { path: string; mode: number }[];
} {
  const appended: { path: string; data: string; mode: number }[] = [];
  const mkdirs: { path: string; mode: number }[] = [];
  return {
    appended,
    mkdirs,
    fs: {
      mkdirSync(path, options) {
        if (behaviour.mkdirThrows === true) {
          throw new Error('EACCES: mkdir denied');
        }
        mkdirs.push({ path, mode: options.mode });
      },
      appendFileSync(path, data, options) {
        if (behaviour.appendThrows === true) {
          throw new Error('EACCES: append denied');
        }
        appended.push({ path, data, mode: options.mode });
      },
    },
  };
}

describe('appendDebugLogEntry', () => {
  it('appends one timestamped line per invocation, creating the parent privately', () => {
    const { fs, appended, mkdirs } = fakeFs();
    appendDebugLogEntry('/base/dir/statusline.log', '{"a":1}', '2026-08-07T15:00:00.000Z', fs);
    expect(mkdirs).toEqual([{ path: '/base/dir', mode: 0o700 }]);
    expect(appended).toEqual([
      {
        path: '/base/dir/statusline.log',
        data: '2026-08-07T15:00:00.000Z {"a":1}\n',
        mode: 0o600,
      },
    ]);
  });

  it('flattens a multi-line payload so one invocation is one greppable line', () => {
    const { fs, appended } = fakeFs();
    appendDebugLogEntry('/d/s.log', '{\n  "a": 1\n}', '2026-08-07T15:00:00.000Z', fs);
    expect(appended[0]?.data).toBe('2026-08-07T15:00:00.000Z { "a": 1 }\n');
  });

  it('accumulates successive invocations as successive lines through the same seam', () => {
    const { fs, appended } = fakeFs();
    appendDebugLogEntry('/d/s.log', '{"n":1}', '2026-08-07T15:00:00.000Z', fs);
    appendDebugLogEntry('/d/s.log', '{"n":2}', '2026-08-07T15:00:10.000Z', fs);
    expect(appended.map((entry) => entry.data)).toEqual([
      '2026-08-07T15:00:00.000Z {"n":1}\n',
      '2026-08-07T15:00:10.000Z {"n":2}\n',
    ]);
  });

  it('swallows write failures — the statusline never breaks for its own logging', () => {
    const { fs } = fakeFs({ appendThrows: true });
    expect(() =>
      appendDebugLogEntry('/d/s.log', '{"a":1}', '2026-08-07T15:00:00.000Z', fs),
    ).not.toThrow();
  });

  it('swallows mkdir failures the same way', () => {
    const { fs } = fakeFs({ mkdirThrows: true });
    expect(() =>
      appendDebugLogEntry('/d/s.log', '{"a":1}', '2026-08-07T15:00:00.000Z', fs),
    ).not.toThrow();
  });
});
