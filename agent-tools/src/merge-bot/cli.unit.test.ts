import { describe, expect, it } from 'vitest';

import { runMergeBotCli, type MergeBotCliInput } from './cli.js';
import type { GithubApiFetch } from './mint-installation-token.js';

import { generateKeyPairSync } from 'node:crypto';

const { privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

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

function happyFetch(): GithubApiFetch {
  return (url) => {
    if (url.endsWith('/installation')) {
      return Promise.resolve({ status: 200, json: () => Promise.resolve({ id: 55 }) });
    }
    return Promise.resolve({
      status: 201,
      json: () => Promise.resolve({ token: 'ghs_tok', expires_at: '2026-07-21T08:00:00Z' }),
    });
  };
}

function runWith(overrides: Partial<MergeBotCliInput> & { args: readonly string[] }): {
  exit: Promise<number>;
  out: () => string;
  errText: () => string;
} {
  const out = capture();
  const errSink = capture();
  const exit = runMergeBotCli({
    env: {},
    stdout: out.sink,
    stderr: errSink.sink,
    fetchImpl: happyFetch(),
    readFileImpl: () => Promise.resolve(privateKey),
    nowEpochSeconds: () => 1_800_000_000,
    ...overrides,
  });
  return { exit, out: out.text, errText: errSink.text };
}

describe('runMergeBotCli mint-token', () => {
  it('prints ONLY the token on stdout (expiry goes to stderr)', async () => {
    const run = runWith({
      args: ['mint-token', '--app-id', '4242', '--private-key-path', '/k.pem'],
    });
    expect(await run.exit).toBe(0);
    expect(run.out()).toBe('ghs_tok\n');
    expect(run.errText()).toContain('expires 2026-07-21T08:00:00Z');
  });

  it('emits a JSON object with token, expiry, and installation id under --json', async () => {
    const run = runWith({
      args: ['mint-token', '--app-id', '4242', '--private-key-path', '/k.pem', '--json'],
    });
    expect(await run.exit).toBe(0);
    expect(JSON.parse(run.out())).toEqual({
      token: 'ghs_tok',
      expiresAt: '2026-07-21T08:00:00Z',
      installationId: 55,
    });
  });

  it('falls back to OAK_MERGE_BOT_* env values', async () => {
    const run = runWith({
      args: ['mint-token'],
      env: {
        OAK_MERGE_BOT_APP_ID: '4242',
        OAK_MERGE_BOT_PRIVATE_KEY_PATH: '/k.pem',
        OAK_MERGE_BOT_REPO: 'oaknational/some-repo',
      },
    });
    expect(await run.exit).toBe(0);
    expect(run.out()).toBe('ghs_tok\n');
  });

  it('fails loudly with exit 2 when app id or key path are missing', async () => {
    const run = runWith({ args: ['mint-token'] });
    expect(await run.exit).toBe(2);
    expect(run.errText()).toContain('--app-id and --private-key-path');
    expect(run.out()).toBe('');
  });

  it('fails with exit 1 and a hint when the key file is unreadable', async () => {
    const run = runWith({
      args: ['mint-token', '--app-id', '1', '--private-key-path', '/missing.pem'],
      readFileImpl: () => Promise.reject(new Error('ENOENT')),
    });
    expect(await run.exit).toBe(1);
    expect(run.errText()).toContain('cannot read private key at /missing.pem');
  });

  it('rejects malformed --repo values', async () => {
    const run = runWith({
      args: ['mint-token', '--app-id', '1', '--private-key-path', '/k.pem', '--repo', 'nope'],
    });
    expect(await run.exit).toBe(2);
    expect(run.errText()).toContain('owner/name');
  });

  it('rejects unknown actions and flags with usage', async () => {
    const bad = runWith({ args: ['do-magic'] });
    expect(await bad.exit).toBe(2);
    expect(bad.errText()).toContain('unknown action');

    const badFlag = runWith({
      args: ['mint-token', '--app-id', '1', '--private-key-path', '/k.pem', '--wat', 'x'],
    });
    expect(await badFlag.exit).toBe(2);
    expect(badFlag.errText()).toContain('unknown flag');
  });
});
