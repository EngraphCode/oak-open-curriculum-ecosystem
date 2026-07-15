import { describe, expect, it } from 'vitest';

import {
  expectationsFromEvidence,
  parseWindowSampleEvidence,
  parseWindowSampleManifest,
} from './refound-window-sample-schema.js';

const BASE = 'ab'.repeat(20);

describe('parseWindowSampleEvidence / expectationsFromEvidence', () => {
  const valid = (): Record<string, unknown> => ({
    schemaVersion: 1,
    runBaseSha: BASE,
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
});
