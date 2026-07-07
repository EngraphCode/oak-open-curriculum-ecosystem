import { describe, expect, it } from 'vitest';

import { resolveDevCommand } from './dev-server';

const NODE_BIN = '/versions/node/v24.15.0/bin/node';

describe('resolveDevCommand', () => {
  it('runs a corepack pnpm.mjs entry under the current node binary', () => {
    const result = resolveDevCommand('/cache/node/corepack/v1/pnpm/11.10.0/bin/pnpm.mjs', NODE_BIN);
    expect(result.ok && result.value).toEqual({
      bin: NODE_BIN,
      args: ['/cache/node/corepack/v1/pnpm/11.10.0/bin/pnpm.mjs', 'dev'],
    });
  });

  it('runs a pnpm.cjs entry under the current node binary', () => {
    const result = resolveDevCommand('/lib/node_modules/pnpm/bin/pnpm.cjs', NODE_BIN);
    expect(result.ok && result.value).toEqual({
      bin: NODE_BIN,
      args: ['/lib/node_modules/pnpm/bin/pnpm.cjs', 'dev'],
    });
  });

  it('runs a legacy pnpm.js entry under the current node binary', () => {
    const result = resolveDevCommand('/usr/local/lib/node_modules/pnpm/bin/pnpm.js', NODE_BIN);
    expect(result.ok && result.value).toEqual({
      bin: NODE_BIN,
      args: ['/usr/local/lib/node_modules/pnpm/bin/pnpm.js', 'dev'],
    });
  });

  it('runs a native pnpm binary directly by its absolute path', () => {
    const result = resolveDevCommand('/opt/homebrew/bin/pnpm', NODE_BIN);
    expect(result.ok && result.value).toEqual({
      bin: '/opt/homebrew/bin/pnpm',
      args: ['dev'],
    });
  });

  it('fails loud when npm_execpath is absent (tool run outside a pnpm script)', () => {
    const result = resolveDevCommand(undefined, NODE_BIN);
    expect(!result.ok && result.error).toContain('npm_execpath is not set');
  });

  it('fails loud when npm_execpath is empty', () => {
    const result = resolveDevCommand('', NODE_BIN);
    expect(!result.ok && result.error).toContain('npm_execpath is not set');
  });

  it('rejects a non-pnpm package manager — this repo is pnpm-only', () => {
    const result = resolveDevCommand('/usr/lib/node_modules/npm/bin/npm-cli.js', NODE_BIN);
    expect(!result.ok && result.error).toContain('pnpm-only');
  });
});
