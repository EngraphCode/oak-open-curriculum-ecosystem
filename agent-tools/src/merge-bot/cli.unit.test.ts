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
    readConfigFileImpl: () => {
      throw new Error('ENOENT (no repo config in this test)');
    },
    repoRoot: '/repo',
    nowEpochSeconds: () => 1_800_000_000,
    ...overrides,
  });
  return { exit, out: out.text, errText: errSink.text };
}

describe('runMergeBotCli mint-token', () => {
  it('prints ONLY the token on stdout (expiry goes to stderr)', async () => {
    const run = runWith({
      args: ['mint-token', '--app-id', '4242', '--private-key-path', '/k.pem', '--repo', 'o/r'],
    });
    expect(await run.exit).toBe(0);
    expect(run.out()).toBe('ghs_tok\n');
    expect(run.errText()).toContain('expires 2026-07-21T08:00:00Z');
  });

  it('emits a JSON object with token, expiry, and installation id under --json', async () => {
    const run = runWith({
      args: [
        'mint-token',
        '--app-id',
        '4242',
        '--private-key-path',
        '/k.pem',
        '--repo',
        'o/r',
        '--json',
      ],
    });
    expect(await run.exit).toBe(0);
    expect(JSON.parse(run.out())).toEqual({
      token: 'ghs_tok',
      expiresAt: '2026-07-21T08:00:00Z',
      installationId: 55,
    });
  });

  it('fails loudly, naming the authority, when the repo config is unreadable and no override given', async () => {
    const run = runWith({ args: ['mint-token'] });
    expect(await run.exit).toBe(2);
    expect(run.errText()).toContain('.github/merge-bot.json is the single authority');
    expect(run.out()).toBe('');
  });

  it('resolves identity and key path from the repo config — the canonical source', async () => {
    const keyReads: string[] = [];
    const run = runWith({
      args: ['mint-token'],
      env: { HOME: '/test-home' },
      readConfigFileImpl: () =>
        JSON.stringify({
          appSlug: 'jimbot-oakington-iii',
          appId: '4352989',
          repo: 'oaknational/oak-open-curriculum-ecosystem',
        }),
      readFileImpl: (path: string) => {
        keyReads.push(path);
        return Promise.resolve(privateKey);
      },
    });
    expect(await run.exit).toBe(0);
    expect(run.out()).toBe('ghs_tok\n');
    expect(keyReads).toEqual(['/test-home/.config/jimbot-oakington-iii/private-key.pem']);
  });

  it('honours explicit flag overrides above the repo config', async () => {
    const keyReads: string[] = [];
    const run = runWith({
      args: ['mint-token', '--app-id', '999', '--private-key-path', '/explicit.pem'],
      readConfigFileImpl: () =>
        JSON.stringify({ appSlug: 'jimbot-oakington-iii', appId: '4352989', repo: 'o/r' }),
      readFileImpl: (path: string) => {
        keyReads.push(path);
        return Promise.resolve(privateKey);
      },
    });
    expect(await run.exit).toBe(0);
    expect(keyReads).toEqual(['/explicit.pem']);
  });

  it('fails with exit 1 and a hint when the key file is unreadable', async () => {
    const run = runWith({
      args: ['mint-token', '--app-id', '1', '--private-key-path', '/missing.pem', '--repo', 'o/r'],
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
      args: [
        'mint-token',
        '--app-id',
        '1',
        '--private-key-path',
        '/k.pem',
        '--repo',
        'o/r',
        '--wat',
        'x',
      ],
    });
    expect(await badFlag.exit).toBe(2);
    expect(badFlag.errText()).toContain('unknown flag');
  });
});
