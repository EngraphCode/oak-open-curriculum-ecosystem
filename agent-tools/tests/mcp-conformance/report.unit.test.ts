import { err, ok, type Result } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import {
  runMcpConformance,
  type BaselineLoadOutcome,
  type McpConformanceIo,
  type RetentionOutcome,
} from '../../src/mcp-conformance/report.js';
import {
  composeSuiteArgs,
  UNATTENDED_SUITES,
  type McpjamSpawnResult,
} from '../../src/mcp-conformance/runner.js';
import { type Baseline } from '../../src/mcp-conformance/types.js';
import {
  loadBaseline,
  loadFixtureRaw,
  rawWithSchemaVersion,
} from './test-helpers/fixture-loader.js';

const PROTOCOL_RAW = loadFixtureRaw('protocol-unauth-alpha-2026-07-26.json');
const OAUTH_RAW = loadFixtureRaw('oauth-dcr-headless-alpha-2026-07-26.json');

function loaded(baseline: Baseline): BaselineLoadOutcome {
  return { kind: 'loaded', baseline };
}

const UNATTENDED_BASELINES = {
  protocol: loaded(loadBaseline('protocol-unattended.json')),
  oauth: loaded(loadBaseline('oauth-dcr-unattended.json')),
};

const TARGET = 'https://mcp.example.test/mcp';

const DEFAULT_RUN_RESULTS: Readonly<Record<string, Result<McpjamSpawnResult, Error>>> = {
  protocol: ok({ exitCode: 1, stdout: PROTOCOL_RAW, stderr: '' }),
  oauth: ok({ exitCode: 1, stdout: OAUTH_RAW, stderr: '' }),
};

const DEFAULT_RETENTION: Readonly<Record<string, RetentionOutcome>> = {
  protocol: { ok: true, reportedPath: 'tmp/mcp-conformance/test/protocol.json' },
  oauth: { ok: true, reportedPath: 'tmp/mcp-conformance/test/oauth.json' },
};

/**
 * Fake IO in the sibling's branch-free shape: behaviour is data — object
 * literals keyed by suite, spread over defaults — and every seam method is
 * a single lookup expression. Retained content is recorded for the
 * verbatim-retention assertions.
 */
function fakeIo(overrides?: {
  readonly runResults?: Readonly<Record<string, Result<McpjamSpawnResult, Error>>>;
  readonly retention?: Readonly<Record<string, RetentionOutcome>>;
}): McpConformanceIo & { readonly retained: Map<string, string> } {
  const retained = new Map<string, string>();
  const runResults = { ...DEFAULT_RUN_RESULTS, ...overrides?.runResults };
  const retention = { ...DEFAULT_RETENTION, ...overrides?.retention };
  return {
    retained,
    runMcpjam: (args) =>
      runResults[args[0] ?? ''] ?? err(new Error(`no canned result for suite "${args[0] ?? ''}"`)),
    retainRawReport: (suite, content) => {
      retained.set(suite, content);
      return retention[suite] ?? { ok: false, error: `no canned retention for "${suite}"` };
    },
  };
}

describe('composeSuiteArgs — reproducible lockfile-run invocations', () => {
  it('protocol suite composes url + json-summary reporter', () => {
    expect(composeSuiteArgs({ suite: 'protocol', mode: 'unattended', target: TARGET })).toEqual([
      'protocol',
      'conformance',
      '--url',
      TARGET,
      '--reporter',
      'json-summary',
    ]);
  });

  it('unattended oauth pins headless DCR at spec 2025-11-25 and omits --conformance-checks (attended-gated upstream)', () => {
    expect(composeSuiteArgs({ suite: 'oauth', mode: 'unattended', target: TARGET })).toEqual([
      'oauth',
      'conformance',
      '--url',
      TARGET,
      '--protocol-version',
      '2025-11-25',
      '--registration',
      'dcr',
      '--auth-mode',
      'headless',
      '--reporter',
      'json-summary',
    ]);
  });

  it('attended oauth is interactive and requests the negative probes', () => {
    const args = composeSuiteArgs({ suite: 'oauth', mode: 'attended', target: TARGET });
    expect(args).toContain('--conformance-checks');
    expect(args).toContain('interactive');
  });

  it('credentialed suites pass the credentials file through', () => {
    expect(
      composeSuiteArgs({
        suite: 'apps',
        mode: 'attended',
        target: TARGET,
        credentialsFile: 'tmp/creds.json',
      }),
    ).toEqual([
      'apps',
      'conformance',
      '--url',
      TARGET,
      '--credentials-file',
      'tmp/creds.json',
      '--reporter',
      'json-summary',
    ]);
  });
});

describe('runMcpConformance — aggregation and evidence retention', () => {
  const unattendedInput = {
    target: TARGET,
    mode: 'unattended' as const,
    suites: UNATTENDED_SUITES,
    baselines: UNATTENDED_BASELINES,
  };

  it('the unattended plan against the observed alpha shapes verdicts pass with exit 0', () => {
    const { report, exitCode } = runMcpConformance(fakeIo(), unattendedInput);
    expect(report.verdict).toBe('pass');
    expect(exitCode).toBe(0);
    expect(report.suites.map((s) => [s.suite, s.verdict])).toEqual([
      ['protocol', 'pass'],
      ['oauth', 'pass'],
    ]);
    // The oauth baseline's named residual masking window rides the outcome.
    expect(report.suites[1]?.baselineResidualMasking).toContain('attended');
  });

  it('raw stdout is retained verbatim for every suite before any parsing', () => {
    const io = fakeIo();
    runMcpConformance(io, unattendedInput);
    expect(io.retained.get('protocol')).toBe(PROTOCOL_RAW);
    expect(io.retained.get('oauth')).toBe(OAUTH_RAW);
  });

  it('a launch failure fails that suite by name without aborting the rest', () => {
    const io = fakeIo({
      runResults: {
        protocol: err(new Error('spawn ENOENT')),
        oauth: err(new Error('spawn ENOENT')),
      },
    });
    const { report, exitCode } = runMcpConformance(io, unattendedInput);
    expect(exitCode).toBe(1);
    expect(report.suites).toHaveLength(2);
    for (const suite of report.suites) {
      expect(suite.verdict).toBe('fail');
      expect(suite.failureReason).toContain('spawn ENOENT');
    }
  });

  it('unparseable stdout is a loud failure naming the suite, the syntax cause, and the retained path', () => {
    const io = fakeIo({
      runResults: { protocol: ok({ exitCode: 1, stdout: 'not json at all', stderr: '' }) },
    });
    const { report, exitCode } = runMcpConformance(io, unattendedInput);
    expect(exitCode).toBe(1);
    const protocol = report.suites.find((s) => s.suite === 'protocol');
    expect(protocol?.verdict).toBe('fail');
    expect(protocol?.failureReason).toContain('"protocol" suite was not JSON');
    expect(protocol?.failureReason).toContain('tmp/mcp-conformance/test/protocol.json');
    // Retention happened even though parsing failed — the evidence survives.
    expect(io.retained.get('protocol')).toBe('not json at all');
    // The other suite still ran and passed.
    expect(report.suites.find((s) => s.suite === 'oauth')?.verdict).toBe('pass');
  });

  it('a reporter schemaVersion bump fails at the parse boundary, never half-matches', () => {
    const io = fakeIo({
      runResults: {
        protocol: ok({ exitCode: 1, stdout: rawWithSchemaVersion(PROTOCOL_RAW, 2), stderr: '' }),
      },
    });
    const { report } = runMcpConformance(io, unattendedInput);
    expect(report.suites.find((s) => s.suite === 'protocol')?.failureReason).toContain(
      'schemaVersion',
    );
  });

  it('a suite without a baseline has no verdict semantics and fails loudly', () => {
    const { report, exitCode } = runMcpConformance(fakeIo(), {
      ...unattendedInput,
      baselines: { protocol: UNATTENDED_BASELINES.protocol },
    });
    expect(exitCode).toBe(1);
    const oauth = report.suites.find((s) => s.suite === 'oauth');
    expect(oauth?.verdict).toBe('fail');
    expect(oauth?.failureReason).toContain('no unattended baseline');
  });

  it('an invalid baseline fails with its true cause, never masquerading as absent', () => {
    const { report, exitCode } = runMcpConformance(fakeIo(), {
      ...unattendedInput,
      baselines: {
        protocol: UNATTENDED_BASELINES.protocol,
        oauth: { kind: 'invalid', reason: 'oauth-dcr-unattended.json is not valid JSON: boom' },
      },
    });
    expect(exitCode).toBe(1);
    const oauth = report.suites.find((s) => s.suite === 'oauth');
    expect(oauth?.verdict).toBe('fail');
    expect(oauth?.failureReason).toContain('unusable');
    expect(oauth?.failureReason).toContain('not valid JSON: boom');
  });

  it('retention failure is loud even when the comparison itself passes', () => {
    const io = fakeIo({ retention: { protocol: { ok: false, error: 'disk full' } } });
    const { report, exitCode } = runMcpConformance(io, {
      ...unattendedInput,
      suites: ['protocol'],
    });
    expect(exitCode).toBe(1);
    expect(report.suites[0]?.verdict).toBe('fail');
    expect(report.suites[0]?.failureReason).toContain('disk full');
  });
});
