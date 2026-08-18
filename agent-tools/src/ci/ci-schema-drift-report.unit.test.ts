import { describe, expect, it } from 'vitest';

import {
  buildSchemaDriftReport,
  buildSkippedSchemaDriftReport,
  STATUS_DESCRIPTION_LIMIT,
} from './ci-schema-drift-report.js';

/**
 * The report builder is the pure core of the drift signal: every consuming
 * surface (warning annotation, step summary, commit status) renders from one
 * verdict, so a drift that fires on one surface cannot silently miss another.
 */

const CACHED_070 = '{"info":{"version":"0.7.0"},"paths":{"/changelog":{}}}';
const LIVE_0110 = '{"info":{"version":"0.11.0"},"paths":{}}';

describe('buildSchemaDriftReport', () => {
  it('reports drifted with both versions when the versions differ', () => {
    const report = buildSchemaDriftReport(CACHED_070, LIVE_0110);

    expect(report.outcome).toBe('drifted');
    expect(report.cachedVersion).toBe('0.7.0');
    expect(report.liveVersion).toBe('0.11.0');
    expect(report.annotation).toContain('::warning');
    expect(report.annotation).toContain('Cached: 0.7.0, live: 0.11.0');
    expect(report.summaryMarkdown).toContain('0.7.0');
    expect(report.summaryMarkdown).toContain('0.11.0');
    expect(report.statusDescription.startsWith('Drift:')).toBe(true);
    expect(report.statusDescription).toContain('0.11.0');
  });

  it('reports drifted content under one version without inventing a version gap', () => {
    const cached = '{"info":{"version":"0.9.0"},"paths":{"/a":{}}}';
    const live = '{"info":{"version":"0.9.0"},"paths":{"/a":{},"/b":{}}}';

    const report = buildSchemaDriftReport(cached, live);

    expect(report.outcome).toBe('drifted');
    expect(report.annotation).toContain('content differs');
    expect(report.statusDescription).toContain('0.9.0');
  });

  it('reports in-sync with a positive statement, never an empty signal', () => {
    const text = '{"info":{"version":"0.11.0"},"paths":{}}';

    const report = buildSchemaDriftReport(text, text);

    expect(report.outcome).toBe('in-sync');
    expect(report.annotation).toBeUndefined();
    expect(report.summaryMarkdown).toContain('in sync');
    expect(report.summaryMarkdown).toContain('0.11.0');
    expect(report.statusDescription.startsWith('In sync')).toBe(true);
  });

  it('keeps every status description within the commit-status API limit', () => {
    const longVersion = `0.11.0-${'x'.repeat(200)}`;
    const cached = JSON.stringify({ info: { version: `0.7.0-${'y'.repeat(200)}` }, paths: {} });
    const live = JSON.stringify({ info: { version: longVersion }, paths: { '/a': {} } });

    const report = buildSchemaDriftReport(cached, live);

    expect(report.statusDescription.length).toBeLessThanOrEqual(STATUS_DESCRIPTION_LIMIT);
  });

  it('reads unparseable input as version unknown and still reports drift honestly', () => {
    const report = buildSchemaDriftReport('not json', LIVE_0110);

    expect(report.outcome).toBe('drifted');
    expect(report.cachedVersion).toBe('unknown');
    expect(report.liveVersion).toBe('0.11.0');
  });

  it('escapes workflow-command metacharacters in an upstream version so no surface is injectable', () => {
    const live = JSON.stringify({
      info: { version: '0.12.0\n::error::owned' },
      paths: { '/a': {} },
    });

    const report = buildSchemaDriftReport(CACHED_070, live);

    expect(report.liveVersion).not.toContain('\n');
    expect(report.annotation).not.toContain('\n::error::');
    expect(report.statusDescription).not.toContain('\n');
  });

  it('keeps BOTH version numbers inside the status description at the cap — truncation eats only the tail', () => {
    const cached = JSON.stringify({ info: { version: `0.7.0-${'y'.repeat(80)}` }, paths: {} });
    const live = JSON.stringify({
      info: { version: `0.11.0-${'x'.repeat(80)}` },
      paths: { '/a': {} },
    });

    const report = buildSchemaDriftReport(cached, live);

    expect(report.statusDescription.length).toBeLessThanOrEqual(STATUS_DESCRIPTION_LIMIT);
    expect(report.statusDescription).toContain('0.7.0');
    expect(report.statusDescription).toContain('0.11.0');
    expect(report.statusDescription.startsWith('Drift:')).toBe(true);
  });
});

describe('buildSkippedSchemaDriftReport', () => {
  it('yields a full verdict for a run whose comparison never happened — absence is never the signal', () => {
    const report = buildSkippedSchemaDriftReport('upstream returned HTTP 503');

    expect(report.outcome).toBe('skipped');
    expect(report.annotation).toBeUndefined();
    expect(report.summaryMarkdown).toContain('skipped');
    expect(report.summaryMarkdown).toContain('HTTP 503');
    expect(report.statusDescription.startsWith('Skipped')).toBe(true);
    expect(report.statusDescription.length).toBeLessThanOrEqual(STATUS_DESCRIPTION_LIMIT);
  });
});
