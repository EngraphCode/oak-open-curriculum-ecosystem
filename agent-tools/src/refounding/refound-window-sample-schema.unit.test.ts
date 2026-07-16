import { describe, expect, it } from 'vitest';

import {
  expectationsFromEvidence,
  parseWindowSampleEvidence,
  parseWindowSampleManifest,
  sweepHitsDigestFromEvidence,
} from './refound-window-sample-schema.js';

const BASE = 'ab'.repeat(20);
const HITS_SHA256 = 'c1'.repeat(32);

describe('parseWindowSampleEvidence / expectationsFromEvidence', () => {
  const valid = (): Record<string, unknown> => ({
    schemaVersion: 1,
    runBaseSha: BASE,
    artifacts: [
      {
        path: '.agent/plans-refounding/inventory.v1.jsonl',
        sha256: 'd2'.repeat(32),
        bytes: 18958318,
      },
      {
        path: '.agent/plans-refounding/sweep/sweep-hits.v1.jsonl',
        sha256: HITS_SHA256,
        bytes: 1473731,
        physicalLines: 3514,
      },
    ],
    sweep: { filesScanned: 694, hits: 3514, filesWithHits: 523 },
    extraTopLevelField: 'tolerated — the evidence artefact is owned elsewhere',
  });

  it('parses the S1 evidence shape and maps the sweep counts to expectations', () => {
    const evidence = parseWindowSampleEvidence(valid());
    expect(evidence.ok).toBe(true);
    if (evidence.ok) {
      expect(evidence.value.runBaseSha).toBe(BASE);
      expect(expectationsFromEvidence(evidence.value)).toEqual({
        scannedFiles: 694,
        hitFiles: 523,
        hitLines: 3514,
      });
    }
  });

  it('rejects a malformed run-base sha and missing sweep counts', () => {
    expect(parseWindowSampleEvidence({ ...valid(), runBaseSha: 'zz' }).ok).toBe(false);
    expect(parseWindowSampleEvidence({ ...valid(), sweep: { hits: 3514 } }).ok).toBe(false);
  });

  const dropKey = (record: Record<string, unknown>, key: string): Record<string, unknown> =>
    Object.fromEntries(Object.entries(record).filter(([entryKey]) => entryKey !== key));

  it('rejects a wrong or missing evidence schema version (v1 binding)', () => {
    expect(parseWindowSampleEvidence({ ...valid(), schemaVersion: 2 }).ok).toBe(false);
    expect(parseWindowSampleEvidence(dropKey(valid(), 'schemaVersion')).ok).toBe(false);
  });

  it('rejects missing artefact digests and a malformed sha256', () => {
    expect(parseWindowSampleEvidence(dropKey(valid(), 'artifacts')).ok).toBe(false);
    expect(
      parseWindowSampleEvidence({
        ...valid(),
        artifacts: [{ path: 'sweep/sweep-hits.v1.jsonl', sha256: 'not-hex' }],
      }).ok,
    ).toBe(false);
  });

  it('extracts the recorded sweep-hits digest, and halts on zero or ambiguous matches', () => {
    const parsed = parseWindowSampleEvidence(valid());
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      const digest = sweepHitsDigestFromEvidence(parsed.value);
      expect(digest.ok).toBe(true);
      if (digest.ok) {
        expect(digest.value).toBe(HITS_SHA256);
      }
    }
    const noEntry = parseWindowSampleEvidence({
      ...valid(),
      artifacts: [{ path: '.agent/plans-refounding/inventory.v1.jsonl', sha256: 'd2'.repeat(32) }],
    });
    expect(noEntry.ok).toBe(true);
    if (noEntry.ok) {
      const digest = sweepHitsDigestFromEvidence(noEntry.value);
      expect(digest.ok).toBe(false);
      if (!digest.ok) {
        expect(digest.error.message).toContain('exactly one is required');
      }
    }
    const twoEntries = parseWindowSampleEvidence({
      ...valid(),
      artifacts: [
        { path: 'sweep/sweep-hits.v1.jsonl', sha256: 'a3'.repeat(32) },
        { path: 'elsewhere/sweep/sweep-hits.v1.jsonl', sha256: 'b4'.repeat(32) },
      ],
    });
    expect(twoEntries.ok).toBe(true);
    if (twoEntries.ok) {
      expect(sweepHitsDigestFromEvidence(twoEntries.value).ok).toBe(false);
    }
  });
});

describe('parseWindowSampleManifest', () => {
  const valid = (): Record<string, unknown> => ({
    schema_version: '1',
    base: BASE,
    window_lines: 500,
    selection_rule: 'sorted-(file,window)-every-10th-from-0',
    universe: { files: 2, windows: 3, hit_windows: 1, non_hit_windows: 2 },
    expectations: { scanned_files: 2, hit_files: 1, hit_lines: 1 },
    sample: [
      {
        file: '.agent/prompts/a.md',
        window_index: 1,
        start_line: 501,
        end_line: 600,
        line_count: 100,
      },
    ],
  });

  it('parses a valid manifest', () => {
    expect(parseWindowSampleManifest(valid()).ok).toBe(true);
  });

  it('rejects unknown keys at every level (closed shape)', () => {
    expect(parseWindowSampleManifest({ ...valid(), spare: 1 }).ok).toBe(false);
    expect(
      parseWindowSampleManifest({
        ...valid(),
        universe: { files: 2, windows: 3, hit_windows: 1, non_hit_windows: 2, spare: 1 },
      }).ok,
    ).toBe(false);
  });

  it('rejects a wrong schema version and a malformed base sha', () => {
    expect(parseWindowSampleManifest({ ...valid(), schema_version: '2' }).ok).toBe(false);
    expect(parseWindowSampleManifest({ ...valid(), base: 'not-a-sha' }).ok).toBe(false);
  });

  it('rejects algorithm-drifted v1 constants (window size and selection rule are literals)', () => {
    expect(parseWindowSampleManifest({ ...valid(), window_lines: 100 }).ok).toBe(false);
    expect(parseWindowSampleManifest({ ...valid(), selection_rule: 'newest-first' }).ok).toBe(
      false,
    );
  });

  it('rejects sample windows that violate the span invariant', () => {
    const window = (overrides: Record<string, unknown>): Record<string, unknown> => ({
      ...valid(),
      sample: [
        {
          file: '.agent/prompts/a.md',
          window_index: 1,
          start_line: 501,
          end_line: 600,
          line_count: 100,
          ...overrides,
        },
      ],
    });
    expect(parseWindowSampleManifest(window({ end_line: 500 })).ok).toBe(false);
    expect(parseWindowSampleManifest(window({ line_count: 1 })).ok).toBe(false);
    expect(parseWindowSampleManifest(window({})).ok).toBe(true);
  });

  it('rejects sample windows that violate the v1 window arithmetic', () => {
    const window = (overrides: Record<string, unknown>): Record<string, unknown> => ({
      ...valid(),
      sample: [
        {
          file: '.agent/prompts/a.md',
          window_index: 1,
          start_line: 501,
          end_line: 600,
          line_count: 100,
          ...overrides,
        },
      ],
    });
    // start_line must equal window_index * WINDOW_LINES + 1.
    expect(parseWindowSampleManifest(window({ window_index: 0 })).ok).toBe(false);
    expect(parseWindowSampleManifest(window({ start_line: 502, line_count: 99 })).ok).toBe(false);
    // The span can never exceed the v1 window size.
    expect(parseWindowSampleManifest(window({ end_line: 1001, line_count: 501 })).ok).toBe(false);
    // A full window is exactly WINDOW_LINES lines.
    expect(parseWindowSampleManifest(window({ end_line: 1000, line_count: 500 })).ok).toBe(true);
  });
});
