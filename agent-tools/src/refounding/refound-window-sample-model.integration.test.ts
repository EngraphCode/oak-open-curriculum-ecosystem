import { describe, expect, it } from 'vitest';

import { err, ok, type Result } from '@oaknational/result';

import { type FreezeRule } from './freeze-rule-schema.js';
import { sha256Hex } from './refounding-artefacts.js';
import { type SweepHit } from './refound-sweep-model.js';
import {
  buildWindowSample,
  SAMPLE_STRIDE,
  SELECTION_RULE_V1,
  WINDOW_LINES,
} from './refound-window-sample-model.js';
import {
  parseWindowSampleManifest,
  type WindowSampleExpectations,
  type WindowSampleManifest,
} from './refound-window-sample-schema.js';
import { type ByteSource } from './refound-window-sample-universe.js';

const BASE = 'ab'.repeat(20);

const RULE: FreezeRule = {
  version: 1,
  ratifiedBy: '.agent/decisions/g1.md',
  classes: [
    { id: 'plans', globs: ['.agent/plans/**'], verdict: 'in', reason: 'estate' },
    { id: 'prompts', globs: ['.agent/prompts/**'], verdict: 'sweep', reason: 'live surface' },
  ],
};

/** In-memory {@link ByteSource} fake: listPaths in given (unsorted) order. */
function sourceOf(files: Record<string, string | Uint8Array>): ByteSource {
  const byPath = new Map<string, Uint8Array>(
    Object.entries(files).map(([relPath, content]) => [
      relPath,
      typeof content === 'string' ? Buffer.from(content, 'utf8') : content,
    ]),
  );
  return {
    listPaths: () => ok([...byPath.keys()]),
    readBytes: (relPath): Result<Uint8Array, Error> => {
      const bytes = byPath.get(relPath);
      return bytes === undefined ? err(new Error(`no bytes staged for '${relPath}'`)) : ok(bytes);
    },
  };
}

/** `n` LF-terminated lines (`splitLineBytes` counts this as exactly `n`). */
function mdLines(n: number): string {
  return Array.from({ length: n }, (_, index) => `line ${String(index + 1)}`)
    .map((line) => `${line}\n`)
    .join('');
}

function hit(file: string, line: number): SweepHit {
  return { file, line, markers: ['todo'], text: 'todo', sha256: sha256Hex(Buffer.from('todo')) };
}

function expectations(
  scannedFiles: number,
  hitFiles: number,
  hitLines: number,
): WindowSampleExpectations {
  return { scannedFiles, hitFiles, hitLines };
}

function build(input: {
  files: Record<string, string | Uint8Array>;
  hits?: readonly SweepHit[];
  expected: WindowSampleExpectations;
}): Result<WindowSampleManifest, Error> {
  return buildWindowSample({
    source: sourceOf(input.files),
    rule: RULE,
    hits: input.hits ?? [],
    expectations: input.expected,
    baseSha: BASE,
  });
}

describe('buildWindowSample — expectation halts', () => {
  it('halts on a scanned-file count disagreement, naming both numbers', () => {
    const result = build({
      files: { '.agent/prompts/a.md': mdLines(1) },
      expected: expectations(2, 0, 0),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('1');
      expect(result.error.message).toContain('2');
      expect(result.error.message).toContain('universe');
    }
  });

  it('halts on a hit-line count disagreement', () => {
    const result = build({
      files: { '.agent/prompts/a.md': mdLines(3) },
      hits: [hit('.agent/prompts/a.md', 1)],
      expected: expectations(1, 1, 2),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('hit row(s)');
    }
  });

  it('halts on a distinct-hit-file count disagreement', () => {
    const result = build({
      files: { '.agent/prompts/a.md': mdLines(3) },
      hits: [hit('.agent/prompts/a.md', 1), hit('.agent/prompts/a.md', 2)],
      expected: expectations(1, 2, 2),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('distinct hit file(s)');
    }
  });

  it('halts when a hit file is outside the scanned universe', () => {
    const result = build({
      files: { '.agent/prompts/a.md': mdLines(3) },
      hits: [hit('.agent/plans/in-class.md', 1)],
      expected: expectations(1, 1, 1),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('outside the scanned universe');
      expect(result.error.message).toContain('.agent/plans/in-class.md');
    }
  });

  it("halts when a hit line lies beyond its file's line count at base", () => {
    const result = build({
      files: { '.agent/prompts/a.md': mdLines(3) },
      hits: [hit('.agent/prompts/a.md', 9)],
      expected: expectations(1, 1, 1),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('beyond');
      expect(result.error.message).toContain('.agent/prompts/a.md');
    }
  });

  it('propagates a universe halt (glob-shape assertion) unchanged', () => {
    const driftRule: FreezeRule = {
      version: 1,
      ratifiedBy: '.agent/decisions/g1.md',
      classes: [{ id: 'drift', globs: ['.agent/*.md'], verdict: 'sweep', reason: 'drift' }],
    };
    const result = buildWindowSample({
      source: sourceOf({}),
      rule: driftRule,
      hits: [],
      expectations: expectations(0, 0, 0),
      baseSha: BASE,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('.agent/*.md');
    }
  });
});

describe('buildWindowSample — window arithmetic', () => {
  it('splits an exact multiple into full windows and marks the line-500 hit in window 0', () => {
    const result = build({
      files: { '.agent/prompts/a.md': mdLines(2 * WINDOW_LINES) },
      hits: [hit('.agent/prompts/a.md', WINDOW_LINES)],
      expected: expectations(1, 1, 1),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.universe).toEqual({
        files: 1,
        windows: 2,
        hit_windows: 1,
        non_hit_windows: 1,
      });
      expect(result.value.sample).toEqual([
        {
          file: '.agent/prompts/a.md',
          window_index: 1,
          start_line: WINDOW_LINES + 1,
          end_line: 2 * WINDOW_LINES,
          line_count: WINDOW_LINES,
        },
      ]);
    }
  });

  it('marks the line-501 hit in window 1 and counts the partial final span', () => {
    const result = build({
      files: { '.agent/prompts/a.md': mdLines(WINDOW_LINES + 1) },
      hits: [hit('.agent/prompts/a.md', WINDOW_LINES + 1)],
      expected: expectations(1, 1, 1),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.universe).toEqual({
        files: 1,
        windows: 2,
        hit_windows: 1,
        non_hit_windows: 1,
      });
      expect(result.value.sample).toEqual([
        {
          file: '.agent/prompts/a.md',
          window_index: 0,
          start_line: 1,
          end_line: WINDOW_LINES,
          line_count: WINDOW_LINES,
        },
      ]);
    }
  });

  it('gives a single-line file one one-line window', () => {
    const result = build({
      files: { '.agent/prompts/tiny.md': mdLines(1) },
      expected: expectations(1, 0, 0),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.sample).toEqual([
        {
          file: '.agent/prompts/tiny.md',
          window_index: 0,
          start_line: 1,
          end_line: 1,
          line_count: 1,
        },
      ]);
    }
  });

  it('counts a zero-line file in the universe but gives it no windows', () => {
    const result = build({
      files: {
        '.agent/prompts/empty.md': '',
        '.agent/prompts/one.md': mdLines(1),
      },
      expected: expectations(2, 0, 0),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.universe).toEqual({
        files: 2,
        windows: 1,
        hit_windows: 0,
        non_hit_windows: 1,
      });
    }
  });
});

describe('buildWindowSample — every-10th selection from index 0', () => {
  it('selects indices 0, 10, 20 of the sorted non-hit windows', () => {
    const files = Object.fromEntries(
      Array.from({ length: 2 * SAMPLE_STRIDE + 1 }, (_, index) => [
        `.agent/prompts/f${String(index).padStart(2, '0')}.md`,
        mdLines(1),
      ]),
    );
    const result = build({ files, expected: expectations(21, 0, 0) });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.sample.map((w) => w.file)).toEqual([
        '.agent/prompts/f00.md',
        '.agent/prompts/f10.md',
        '.agent/prompts/f20.md',
      ]);
    }
  });

  it('selects exactly one window when fewer than 10 non-hit windows exist', () => {
    const result = build({
      files: {
        '.agent/prompts/a.md': mdLines(1),
        '.agent/prompts/b.md': mdLines(1),
        '.agent/prompts/c.md': mdLines(1),
      },
      expected: expectations(3, 0, 0),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.universe.non_hit_windows).toBe(3);
      expect(result.value.sample.map((w) => w.file)).toEqual(['.agent/prompts/a.md']);
    }
  });

  it('re-bases the stride on the non-hit list, not on all windows', () => {
    // 11 windows in a.md plus one in b.md; a hit in a.md window 0 leaves 11
    // non-hit windows sorted [a1..a10, b0] — the sample is [a1, b0].
    const result = build({
      files: {
        '.agent/prompts/a.md': mdLines(10 * WINDOW_LINES + 1),
        '.agent/prompts/b.md': mdLines(1),
      },
      hits: [hit('.agent/prompts/a.md', 1)],
      expected: expectations(2, 1, 1),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.sample.map((w) => `${w.file}:${String(w.window_index)}`)).toEqual([
        '.agent/prompts/a.md:1',
        '.agent/prompts/b.md:0',
      ]);
    }
  });

  it('returns an empty sample when every window is hit', () => {
    const result = build({
      files: { '.agent/prompts/a.md': mdLines(1) },
      hits: [hit('.agent/prompts/a.md', 1)],
      expected: expectations(1, 1, 1),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.universe.hit_windows).toBe(1);
      expect(result.value.sample).toEqual([]);
    }
  });
});

describe('buildWindowSample — the manifest carrier', () => {
  it('carries the schema version, base, window size, selection rule, and expectations used', () => {
    const result = build({
      files: { '.agent/prompts/a.md': mdLines(1) },
      expected: expectations(1, 0, 0),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.schema_version).toBe('1');
      expect(result.value.base).toBe(BASE);
      expect(result.value.window_lines).toBe(WINDOW_LINES);
      expect(result.value.selection_rule).toBe(SELECTION_RULE_V1);
      expect(result.value.expectations).toEqual({
        scanned_files: 1,
        hit_files: 0,
        hit_lines: 0,
      });
    }
  });

  it('round-trips through parseWindowSampleManifest (closed-shape contract)', () => {
    const result = build({
      files: { '.agent/prompts/a.md': mdLines(1) },
      expected: expectations(1, 0, 0),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(parseWindowSampleManifest(result.value).ok).toBe(true);
    }
  });
});
