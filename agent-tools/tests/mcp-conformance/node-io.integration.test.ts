import { join } from 'node:path';

import { unwrapErr } from '@oaknational/result';
import { afterEach, describe, expect, it } from 'vitest';

import { buildMcpConformanceNodeIo, writeRunSummary } from '../../src/mcp-conformance/node-io.js';
import {
  cleanupSandboxes,
  readSandboxFile,
  sandbox,
  writeSandboxFile,
} from './test-helpers/io-sandbox.js';

afterEach(() => {
  cleanupSandboxes();
});

describe('retainRawReport — verbatim retention with caller-shaped paths', () => {
  it('a relative report dir writes under the repo root and reports the relative path', () => {
    const root = sandbox();
    const io = buildMcpConformanceNodeIo(root, join('tmp', 'reports'));
    const outcome = io.retainRawReport('protocol', '{"raw":"bytes"}');
    expect(outcome).toEqual({ ok: true, reportedPath: join('tmp', 'reports', 'protocol.json') });
    expect(readSandboxFile(root, 'tmp', 'reports', 'protocol.json')).toBe('{"raw":"bytes"}');
  });

  it('an absolute report dir stands as given — written there and reported verbatim', () => {
    const root = sandbox();
    const elsewhere = join(sandbox(), 'evidence');
    const io = buildMcpConformanceNodeIo(root, elsewhere);
    const outcome = io.retainRawReport('oauth', 'verbatim');
    expect(outcome).toEqual({ ok: true, reportedPath: join(elsewhere, 'oauth.json') });
    expect(readSandboxFile(elsewhere, 'oauth.json')).toBe('verbatim');
  });

  it('an unwritable target is a loud retention failure, never a throw', () => {
    const root = sandbox();
    // Occupy the report-dir path with a FILE so mkdir cannot create it.
    writeSandboxFile('a file where a directory must go', root, 'blocked');
    const io = buildMcpConformanceNodeIo(root, 'blocked');
    const outcome = io.retainRawReport('protocol', 'content');
    expect(outcome.ok).toBe(false);
    expect(!outcome.ok && outcome.error.length > 0).toBe(true);
  });

  it('the aggregate summary lands beside the raw reports with the caller-shaped path', () => {
    const root = sandbox();
    const outcome = writeRunSummary(root, join('tmp', 'reports'), '{"verdict":"pass"}');
    expect(outcome).toEqual({ ok: true, reportedPath: join('tmp', 'reports', 'summary.json') });
    expect(readSandboxFile(root, 'tmp', 'reports', 'summary.json')).toBe('{"verdict":"pass"}');
  });
});

// The resolve-and-spawn happy path is deliberately NOT proven here: test code
// must not spawn child processes (testing-strategy §Rules), and the real bin
// under the real install is exercised live by the scheduled unattended CI
// workflow on every run. This block describes OUR half of the seam only —
// the spawn-free resolution-failure branch.
describe('runMcpjam — bin-resolution failure is loud and spawn-free', () => {
  it('a root without the dependency yields a launch error naming pnpm install', () => {
    const emptyRoot = sandbox();
    const io = buildMcpConformanceNodeIo(emptyRoot, 'tmp/unused');
    const error = unwrapErr(io.runMcpjam(['--version']));
    expect(error.message).toContain('pnpm install');
  });
});
