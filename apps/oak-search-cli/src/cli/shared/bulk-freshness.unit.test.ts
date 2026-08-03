/**
 * Unit tests for `checkBulkDataFreshness`.
 *
 * Bulk DATA files are downloaded per-checkout and gitignored, while the
 * manifest and schema are tracked — so a clean checkout carries a manifest
 * whose listed data files are absent, and checkouts with data silently
 * diverge in vintage. These tests pin the freshness contract: an unreadable
 * or invalid manifest fails loud, listed-but-absent data files fail loud
 * (the tracked manifest cannot vouch for data it ships without), data older
 * than the named age fails loud, and a fresh complete bundle surfaces its
 * vintage. Deterministic `now` and injected readers — no real filesystem,
 * no ambient clock.
 */

import { describe, it, expect } from 'vitest';
import {
  checkBulkDataFreshness,
  MAX_BULK_DATA_AGE_DAYS,
  type ManifestFsReader,
} from './bulk-freshness.js';

/**
 * A valid manifest exactly as `scripts/download-bulk.ts` writes it.
 * The shape is the downloader's output contract; the checker's schema is
 * pinned to it strictly so writer/reader drift fails loud here.
 */
const validManifest = {
  downloadedAt: '2026-08-01T08:00:00.000Z',
  source: 'https://open-api.thenational.academy/api/bulk',
  files: [{ file: 'maths-primary.json', sizeBytes: 123 }],
};

/** Reader whose directory holds every file the manifest lists. */
const readerFor = (content: string, present = ['maths-primary.json']): ManifestFsReader => ({
  readFileSync: () => content,
  readdirSync: () => present,
});

const throwingReader: ManifestFsReader = {
  readFileSync: () => {
    throw new Error('ENOENT: no such file or directory');
  },
  readdirSync: () => [],
};

const bulkDir = '/app/bulk-downloads';

describe('checkBulkDataFreshness', () => {
  it('returns err manifest_missing with the download cure when the manifest is unreadable', () => {
    const result = checkBulkDataFreshness({
      bulkDir,
      now: new Date('2026-08-03T12:00:00.000Z'),
      fs: throwingReader,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('manifest_missing');
      expect(result.error.message).toContain(bulkDir);
      expect(result.error.message).toContain('bulk:download');
    }
  });

  it('returns err manifest_invalid on unparseable JSON', () => {
    const result = checkBulkDataFreshness({
      bulkDir,
      now: new Date('2026-08-03T12:00:00.000Z'),
      fs: readerFor('not json {'),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('manifest_invalid');
    }
  });

  it('returns err manifest_invalid when downloadedAt is absent', () => {
    const withoutDate = { source: validManifest.source, files: validManifest.files };
    const result = checkBulkDataFreshness({
      bulkDir,
      now: new Date('2026-08-03T12:00:00.000Z'),
      fs: readerFor(JSON.stringify(withoutDate)),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('manifest_invalid');
    }
  });

  it('returns err manifest_invalid on writer/reader shape drift (unknown top-level key)', () => {
    const result = checkBulkDataFreshness({
      bulkDir,
      now: new Date('2026-08-03T12:00:00.000Z'),
      fs: readerFor(JSON.stringify({ ...validManifest, surprise: true })),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('manifest_invalid');
    }
  });

  it('returns err manifest_invalid on a malformed downloadedAt', () => {
    const result = checkBulkDataFreshness({
      bulkDir,
      now: new Date('2026-08-03T12:00:00.000Z'),
      fs: readerFor(JSON.stringify({ ...validManifest, downloadedAt: 'yesterday-ish' })),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('manifest_invalid');
    }
  });

  it('returns err bulk_data_missing when listed data files are absent from the directory', () => {
    // The manifest is TRACKED, so a clean checkout that never downloaded
    // carries a manifest listing files that do not exist. The check must
    // refuse — this is exactly the absent-bundle state it exists to catch.
    const result = checkBulkDataFreshness({
      bulkDir,
      now: new Date('2026-08-03T12:00:00.000Z'),
      fs: readerFor(JSON.stringify(validManifest), ['manifest.json', 'schema.json']),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('bulk_data_missing');
      expect(result.error.message).toContain('maths-primary.json');
      expect(result.error.message).toContain('bulk:download');
    }
  });

  it('returns err bulk_data_missing when the bulk directory is unreadable', () => {
    const result = checkBulkDataFreshness({
      bulkDir,
      now: new Date('2026-08-03T12:00:00.000Z'),
      fs: {
        readFileSync: () => JSON.stringify(validManifest),
        readdirSync: () => {
          throw new Error('EACCES: permission denied');
        },
      },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('bulk_data_missing');
    }
  });

  it('returns err bulk_data_stale past the named age, naming age, threshold, and cure', () => {
    const result = checkBulkDataFreshness({
      bulkDir,
      now: new Date('2026-08-03T12:00:00.000Z'),
      fs: readerFor(JSON.stringify({ ...validManifest, downloadedAt: '2026-06-10T00:00:00.000Z' })),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('bulk_data_stale');
      expect(result.error.message).toContain('2026-06-10T00:00:00.000Z');
      expect(result.error.message).toContain('54');
      expect(result.error.message).toContain(String(MAX_BULK_DATA_AGE_DAYS));
      expect(result.error.message).toContain('bulk:download');
    }
  });

  it('treats data exactly at the named age as fresh (stale is strictly past it)', () => {
    const result = checkBulkDataFreshness({
      bulkDir,
      now: new Date('2026-08-15T08:00:00.000Z'),
      fs: readerFor(JSON.stringify(validManifest)),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.ageDays).toBe(MAX_BULK_DATA_AGE_DAYS);
    }
  });

  it('returns err bulk_data_stale one day past the named age', () => {
    const result = checkBulkDataFreshness({
      bulkDir,
      now: new Date('2026-08-16T08:00:00.000Z'),
      fs: readerFor(JSON.stringify(validManifest)),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('bulk_data_stale');
    }
  });

  it('surfaces the vintage on fresh data', () => {
    const result = checkBulkDataFreshness({
      bulkDir,
      now: new Date('2026-08-03T12:00:00.000Z'),
      fs: readerFor(JSON.stringify(validManifest)),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.downloadedAt).toBe('2026-08-01T08:00:00.000Z');
      expect(result.value.ageDays).toBe(2);
    }
  });

  it('clamps a future-dated manifest to age zero rather than failing on clock skew', () => {
    const result = checkBulkDataFreshness({
      bulkDir,
      now: new Date('2026-07-31T08:00:00.000Z'),
      fs: readerFor(JSON.stringify(validManifest)),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.ageDays).toBe(0);
    }
  });
});
