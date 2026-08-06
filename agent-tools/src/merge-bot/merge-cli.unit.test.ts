import { describe, expect, it } from 'vitest';

import type { PrStateReading } from '../pr-watch/state-types.js';
import { runMergeBotCli, type MergeBotCliInput } from './cli.js';
import { parseMergeArgs } from './merge-args.js';
import type { GithubApiFetch } from './mint-installation-token.js';

import { generateKeyPairSync } from 'node:crypto';

/**
 * The `merge-bot merge` front door: argv contract, exit map (0=merged,
 * 1=operational, 2=usage, 3=typed refusal — MERGED exits 3), the bounded
 * poll loop under ONE minted token, and the two review pins: the minted
 * token appears in NEITHER output stream on any path (A7), and the
 * pr-lifecycle merge-base deletion sweep is named as undischarged (A6).
 */

const { privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

const TOKEN = 'sekrit-installation-token';
const HEAD_OID = 'abc123def456abc123def456abc123def456abc1';

/** A settled reading — quiet window comfortably elapsed at the injected now. */
function settledReading(overrides: Partial<PrStateReading> = {}): PrStateReading {
  // Twin of merge.integration.test.ts's fixture; kept local because each file
  // varies different legs and a shared mutable fixture module would couple
  // their variation needs.
  return {
    number: 42,
    url: 'https://github.com/acme/widgets/pull/42',
    state: 'OPEN',
    isDraft: false,
    mergeable: 'MERGEABLE',
    mergeStateStatus: 'CLEAN',
    headRefOid: HEAD_OID,
    checks: { total: 3, passed: 3, failed: 0, pending: 0 },
    namedChecks: [{ name: 'lint', bucket: 'passed' }],
    checksGreenAt: '2026-08-06T08:00:00Z',
    reviewThreads: { total: 1, unresolved: 0 },
    autoMergeArmed: false,
    reviewRequests: [],
    expectedReviewers: ['copilot-pull-request-reviewer'],
    expectedDeclared: true,
    reviews: [
      {
        author: 'copilot-pull-request-reviewer',
        state: 'COMMENTED',
        body: 'review round complete',
        commitOid: HEAD_OID,
        submittedAt: '2026-08-06T08:05:00Z',
      },
    ],
    reviewRuns: { kind: 'read', runs: [] },
    ...overrides,
  };
}

function runningChecksReading(): PrStateReading {
  return settledReading({
    checks: { total: 3, passed: 2, failed: 0, pending: 1 },
    namedChecks: [{ name: 'e2e', bucket: 'pending' }],
    checksGreenAt: null,
  });
}

function capture(): { text: () => string; sink: Pick<NodeJS.WriteStream, 'write'> } {
  let buffer = '';
  return {
    text: () => buffer,
    sink: {
      write(chunk: string): boolean {
        buffer += chunk;
        return true;
      },
    },
  };
}

/** Serves mint, repo-settings, and merge endpoints; records every call URL. */
function mergeFetch(input: { mergeStatus?: number; mergeBody?: unknown } = {}): {
  fetchImpl: GithubApiFetch;
  urls: string[];
} {
  const urls: string[] = [];
  const fetchImpl: GithubApiFetch = (url) => {
    urls.push(url);
    if (url.endsWith('/installation')) {
      return Promise.resolve({ status: 200, json: () => Promise.resolve({ id: 55 }) });
    }
    if (url.endsWith('/access_tokens')) {
      return Promise.resolve({
        status: 201,
        json: () => Promise.resolve({ token: TOKEN, expires_at: '2026-08-06T10:00:00Z' }),
      });
    }
    if (url.endsWith('/pulls/42/merge')) {
      return Promise.resolve({
        status: input.mergeStatus ?? 200,
        json: () => Promise.resolve(input.mergeBody ?? { merged: true, sha: 'mergesha1' }),
      });
    }
    return Promise.resolve({
      status: 200,
      json: () => Promise.resolve({ allow_merge_commit: true }),
    });
  };
  return { fetchImpl, urls };
}

function runMerge(input: {
  readonly args: readonly string[];
  /** Non-empty: the LAST reading repeats once the queue drains. */
  readonly readings: readonly [PrStateReading, ...PrStateReading[]];
  readonly fetch?: ReturnType<typeof mergeFetch>;
  readonly overrides?: Partial<MergeBotCliInput>;
}): {
  exit: Promise<number>;
  out: () => string;
  errText: () => string;
  sleeps: number[];
  expectSeen: (readonly string[])[];
  urls: string[];
} {
  const out = capture();
  const errSink = capture();
  const sleeps: number[] = [];
  const expectSeen: (readonly string[])[] = [];
  const { fetchImpl, urls } = input.fetch ?? mergeFetch();
  const readings = [...input.readings];
  const exit = runMergeBotCli({
    args: ['merge', ...input.args],
    env: { HOME: '/test-home' },
    stdout: out.sink,
    stderr: errSink.sink,
    fetchImpl,
    readFileImpl: () => Promise.resolve(privateKey),
    readConfigFileImpl: () =>
      JSON.stringify({ appSlug: 'jimbot-oakington-iii', appId: '4352989', repo: 'acme/widgets' }),
    repoRoot: '/repo',
    nowEpochSeconds: () => 1_800_000_000,
    readReadingImpl: (options) => {
      expectSeen.push(options.expectedReviewers ?? []);
      const next = readings.length > 1 ? readings.shift() : readings[0];
      return next ?? input.readings[0];
    },
    sleepImpl: (ms) => {
      sleeps.push(ms);
      return Promise.resolve();
    },
    nowIsoImpl: () => '2026-08-06T09:00:00Z',
    ...input.overrides,
  });
  return { exit, out: out.text, errText: errSink.text, sleeps, expectSeen, urls };
}

const EXPECT_ARGS = ['--pr', '42', '--expect', 'copilot-pull-request-reviewer'] as const;

describe('parseMergeArgs', () => {
  it('parses the full flag line', () => {
    const parsed = parseMergeArgs([
      ...EXPECT_ARGS,
      '--expect',
      'second-reviewer',
      '--json',
      '--interval',
      '20',
      '--max-polls',
      '10',
    ]);

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value).toEqual({
        prNumber: 42,
        expect: ['copilot-pull-request-reviewer', 'second-reviewer'],
        json: true,
        intervalSeconds: 20,
        maxPolls: 10,
      });
    }
  });

  it('defaults the poll budget inside the token hour', () => {
    const parsed = parseMergeArgs([...EXPECT_ARGS]);

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.intervalSeconds).toBe(30);
      expect(parsed.value.maxPolls).toBe(90);
      expect(parsed.value.intervalSeconds * parsed.value.maxPolls).toBeLessThanOrEqual(3000);
      expect(parsed.value.json).toBe(false);
    }
  });

  it('requires --pr as a positive integer', () => {
    const missing = parseMergeArgs(['--expect', 'reviewer']);
    expect(missing.ok).toBe(false);
    if (!missing.ok) {
      expect(missing.error.message).toContain('--pr');
    }

    const wordy = parseMergeArgs(['--pr', 'seventeen', '--expect', 'reviewer']);
    expect(wordy.ok).toBe(false);
    if (!wordy.ok) {
      expect(wordy.error.message).toContain('--pr');
    }
  });

  it('requires at least one --expect, teaching why a defaulted set cannot merge', () => {
    const parsed = parseMergeArgs(['--pr', '42']);

    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.error.message).toContain('--expect');
      expect(parsed.error.message).toContain('defaulted');
    }
  });

  it('bounds interval times max-polls under the one-hour token lifetime', () => {
    const over = parseMergeArgs([...EXPECT_ARGS, '--interval', '60', '--max-polls', '51']);
    expect(over.ok).toBe(false);
    if (!over.ok) {
      expect(over.error.message).toContain('hour');
      expect(over.error.message).toContain('3060');
    }

    const atBound = parseMergeArgs([...EXPECT_ARGS, '--interval', '60', '--max-polls', '50']);
    expect(atBound.ok).toBe(true);
  });

  it('refuses a repeated single-valued flag and unknown flags', () => {
    const repeated = parseMergeArgs([...EXPECT_ARGS, '--pr', '43']);
    expect(repeated.ok).toBe(false);
    if (!repeated.ok) {
      expect(repeated.error.message).toContain('more than once');
    }

    const unknown = parseMergeArgs([...EXPECT_ARGS, '--wat', 'x']);
    expect(unknown.ok).toBe(false);
    if (!unknown.ok) {
      expect(unknown.error.message).toContain('--wat');
    }
  });
});

describe('runMergeBotCli merge', () => {
  it('merges a settled PR: exit 0, sha on stdout, sweep note and grounds on stderr, token in neither stream', async () => {
    const run = runMerge({ args: [...EXPECT_ARGS], readings: [settledReading()] });

    expect(await run.exit).toBe(0);
    expect(run.out()).toContain('mergesha1');
    expect(run.errText()).toContain('merge-base deletion sweep');
    expect(run.errText()).toContain('NOT discharged');
    // The irreversible act discloses its grounds (security H3): the verdict
    // evidence prints, so "merged with nobody having reviewed" can never be
    // silent.
    expect(run.errText()).toContain('every expected reviewer leg settled');
    expect(run.out()).not.toContain(TOKEN);
    expect(run.errText()).not.toContain(TOKEN);
  });

  it('passes the declared --expect set through to the reading', async () => {
    const run = runMerge({
      args: ['--pr', '42', '--expect', 'rev-a', '--expect', 'rev-b'],
      readings: [settledReading()],
    });

    await run.exit;
    expect(run.expectSeen[0]).toEqual(['rev-a', 'rev-b']);
  });

  it('emits the structured outcome with its grounds under --json', async () => {
    const run = runMerge({ args: [...EXPECT_ARGS, '--json'], readings: [settledReading()] });

    expect(await run.exit).toBe(0);
    const outcome: unknown = JSON.parse(run.out());
    expect(outcome).toMatchObject({ kind: 'merged', sha: 'mergesha1' });
    expect(JSON.stringify(outcome)).toContain('every expected reviewer leg settled');
  });

  it('refuses a non-wait verdict immediately: exit 3, verdict named, no sleep', async () => {
    const red = settledReading({
      checks: { total: 3, passed: 2, failed: 1, pending: 0 },
      namedChecks: [{ name: 'lint', bucket: 'failed' }],
      checksGreenAt: null,
    });
    const run = runMerge({ args: [...EXPECT_ARGS], readings: [red] });

    expect(await run.exit).toBe(3);
    expect(run.errText()).toContain('CHECKS-RED');
    expect(run.sleeps).toEqual([]);
    expect(run.errText()).not.toContain(TOKEN);
    expect(run.out()).not.toContain(TOKEN);
  });

  it('exits 3 on MERGED — another actor merging is never this invocation succeeding', async () => {
    const run = runMerge({
      args: [...EXPECT_ARGS],
      readings: [settledReading({ state: 'MERGED' })],
    });

    expect(await run.exit).toBe(3);
    expect(run.errText()).toContain('another');
  });

  it('polls through a wait verdict under ONE minted token, then merges', async () => {
    const run = runMerge({
      args: [...EXPECT_ARGS],
      readings: [runningChecksReading(), settledReading()],
    });

    expect(await run.exit).toBe(0);
    expect(run.sleeps).toEqual([30_000]);
    expect(run.out()).toContain('CHECKS-RUNNING');
    expect(run.urls.filter((url) => url.endsWith('/access_tokens'))).toHaveLength(1);
  });

  it('keeps --json stdout pure on a polled run: progress to stderr, outcome alone on stdout', async () => {
    const run = runMerge({
      args: [...EXPECT_ARGS, '--json'],
      readings: [runningChecksReading(), settledReading()],
    });

    expect(await run.exit).toBe(0);
    expect(JSON.parse(run.out())).toMatchObject({ kind: 'merged', sha: 'mergesha1' });
    expect(run.errText()).toContain('poll 1/');
  });

  it('exhausts the poll budget on a persistent wait verdict as a typed refusal', async () => {
    const run = runMerge({
      args: [...EXPECT_ARGS, '--max-polls', '2'],
      readings: [runningChecksReading()],
    });

    expect(await run.exit).toBe(3);
    expect(run.sleeps).toHaveLength(1);
    expect(run.errText()).toContain('CHECKS-RUNNING');
  });

  it('reports a refusal machine-readably under --json', async () => {
    const run = runMerge({
      args: [...EXPECT_ARGS, '--json'],
      readings: [settledReading({ isDraft: true })],
    });

    expect(await run.exit).toBe(3);
    const outcome: unknown = JSON.parse(run.out());
    expect(outcome).toMatchObject({ kind: 'refused', verdictState: 'DRAFT' });
    // A7 holds on the one refusal path whose stdout carries a serialised
    // product object — any future outcome field bearing token material would
    // leak exactly here.
    expect(run.out()).not.toContain(TOKEN);
    expect(run.errText()).not.toContain(TOKEN);
  });

  it('surfaces a moved tip as an operational failure without leaking the token', async () => {
    const run = runMerge({
      args: [...EXPECT_ARGS],
      readings: [settledReading()],
      fetch: mergeFetch({ mergeStatus: 409, mergeBody: { message: 'Head branch was modified.' } }),
    });

    expect(await run.exit).toBe(1);
    expect(run.errText()).toContain('409');
    expect(run.out()).not.toContain(TOKEN);
    expect(run.errText()).not.toContain(TOKEN);
  });

  it('rejects a missing --expect as a usage error before any call', async () => {
    const run = runMerge({ args: ['--pr', '42'], readings: [settledReading()] });

    expect(await run.exit).toBe(2);
    expect(run.errText()).toContain('--expect');
    expect(run.urls).toEqual([]);
  });

  it('fails as usage when the repo config authority is unreadable', async () => {
    const run = runMerge({
      args: [...EXPECT_ARGS],
      readings: [settledReading()],
      overrides: {
        // An unparseable authority file fails the same authority-naming path
        // as an unreadable one, without a thrown fixture.
        readConfigFileImpl: () => 'not-json',
      },
    });

    expect(await run.exit).toBe(2);
    expect(run.errText()).toContain('single authority');
  });

  it('documents the merge action and the undischarged sweep in the usage text', async () => {
    const out = capture();
    const errSink = capture();
    const exit = runMergeBotCli({
      args: ['--help'],
      env: {},
      stdout: out.sink,
      stderr: errSink.sink,
    });

    expect(await exit).toBe(0);
    expect(out.text()).toContain('merge --pr');
    expect(out.text()).toContain('merge-base deletion sweep');
  });
});
