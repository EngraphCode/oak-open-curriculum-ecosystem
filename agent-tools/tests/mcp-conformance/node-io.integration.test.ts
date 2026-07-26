import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { buildMcpConformanceNodeIo } from '../../src/mcp-conformance/node-io.js';
import {
  cleanupSandboxes,
  readSandboxFile,
  sandbox,
  writeSandboxFile,
} from './test-helpers/io-sandbox.js';

// The real repository root: three levels up from agent-tools/tests/mcp-conformance.
const REPO_ROOT = join(import.meta.dirname, '..', '..', '..');

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
});

describe('runMcpjam — lockfile-resolved bin under the current Node', () => {
  it('resolves and runs the installed mcpjam from the real repo root (--version, no network)', () => {
    const io = buildMcpConformanceNodeIo(REPO_ROOT, 'tmp/unused');
    const result = io.runMcpjam(['--version']);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.exitCode).toBe(0);
      expect(result.value.stdout).toMatch(/\d+\.\d+\.\d+/u);
    }
  });

  it('a root without the dependency yields a launch error naming pnpm install', () => {
    const emptyRoot = sandbox();
    const io = buildMcpConformanceNodeIo(emptyRoot, 'tmp/unused');
    const result = io.runMcpjam(['--version']);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('pnpm install');
    }
  });
});
