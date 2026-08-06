import { describe, expect, it } from 'vitest';

import { runMergeBotCli, type MergeBotCliInput } from './cli.js';
import type { GithubApiFetch } from './mint-installation-token.js';
import type { GitCommandResult, GitExecutor } from './push-git.js';

import { generateKeyPairSync } from 'node:crypto';

/**
 * The `merge-bot push` front door over injected seams (fetch, key, config,
 * git): the exit map (0=pushed, 1=operational, 2=usage, 3=typed refusal), the
 * never-commit-to-main refusal as behaviour, and the credential discipline —
 * the token reaches git ONLY as `GH_PUSH_TOKEN` in the child environment, read
 * by a static credential helper, and appears in NEITHER argv nor either output
 * stream on any path. The pure argv contract lives in push-args.unit.test.ts.
 */

const { privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

const TOKEN = 'sekrit-installation-token';
const GIT_PATH = '/usr/bin/git';
const BRANCH = 'jimcresswell/mcp-508-slice';
const REMOTE = 'https://github.com/acme/widgets.git';
const TRANSFER = `To ${REMOTE}\n   abc1234..def5678  HEAD -> ${BRANCH}\n`;

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

interface GitCall {
  readonly file: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly env: Readonly<Record<string, string | undefined>>;
}

/** Value-returning git seam (ADR-088): a non-zero exit is a RESULT, never a throw. */
function gitFake(overrides: { revParse?: GitCommandResult; push?: GitCommandResult } = {}): {
  gitExecutor: GitExecutor;
  calls: GitCall[];
} {
  const calls: GitCall[] = [];
  const gitExecutor: GitExecutor = (file, args, options) => {
    calls.push({ file, args, cwd: options.cwd, env: options.env });
    if (args[0] === 'rev-parse') {
      return overrides.revParse ?? { status: 0, stdout: `${BRANCH}\n`, stderr: '' };
    }
    return overrides.push ?? { status: 0, stdout: '', stderr: TRANSFER };
  };
  return { gitExecutor, calls };
}

/** Serves the mint endpoints and records every call URL and body. */
function mintFetch(token = TOKEN): {
  fetchImpl: GithubApiFetch;
  urls: string[];
  bodies: { url: string; body: string }[];
} {
  const urls: string[] = [];
  const bodies: { url: string; body: string }[] = [];
  const fetchImpl: GithubApiFetch = (url, init) => {
    urls.push(url);
    if (init?.body !== undefined) {
      bodies.push({ url, body: String(init.body) });
    }
    if (url.endsWith('/installation')) {
      return Promise.resolve({ status: 200, json: () => Promise.resolve({ id: 55 }) });
    }
    return Promise.resolve({
      status: 201,
      json: () => Promise.resolve({ token, expires_at: '2026-08-06T10:00:00Z' }),
    });
  };
  return { fetchImpl, urls, bodies };
}

const BASE_ENV = { PATH: '/usr/bin', HOME: '/test-home' } as const;

function runPush(input: {
  readonly args?: readonly string[];
  readonly git?: ReturnType<typeof gitFake>;
  readonly fetch?: ReturnType<typeof mintFetch>;
  readonly overrides?: Partial<MergeBotCliInput>;
}): {
  exit: Promise<number>;
  out: () => string;
  errText: () => string;
  calls: GitCall[];
  urls: string[];
  bodies: { url: string; body: string }[];
} {
  const out = capture();
  const errSink = capture();
  const { gitExecutor, calls } = input.git ?? gitFake();
  const { fetchImpl, urls, bodies } = input.fetch ?? mintFetch();
  const exit = runMergeBotCli({
    args: ['push', ...(input.args ?? [])],
    env: { HOME: '/test-home' },
    stdout: out.sink,
    stderr: errSink.sink,
    fetchImpl,
    readFileImpl: () => Promise.resolve(privateKey),
    readConfigFileImpl: () =>
      JSON.stringify({ appSlug: 'jimbot-oakington-iii', appId: '4352989', repo: 'acme/widgets' }),
    repoRoot: '/repo',
    nowEpochSeconds: () => 1_800_000_000,
    gitExecutor,
    gitPath: GIT_PATH,
    baseEnv: BASE_ENV,
    ...input.overrides,
  });
  return { exit, out: out.text, errText: errSink.text, calls, urls, bodies };
}

function pushCall(calls: readonly GitCall[]): GitCall | undefined {
  return calls.find((call) => call.args.includes('push'));
}

describe('runMergeBotCli push', () => {
  it('pushes the checked-out branch: exit 0, transfer output on stderr, token in neither stream', async () => {
    const run = runPush({});

    expect(await run.exit).toBe(0);
    expect(run.out()).toContain(BRANCH);
    expect(run.errText()).toContain('abc1234..def5678');
    expect(run.out()).not.toContain(TOKEN);
    expect(run.errText()).not.toContain(TOKEN);
    expect(run.calls[0]?.args).toEqual(['rev-parse', '--abbrev-ref', 'HEAD']);
    expect(run.calls[0]?.cwd).toBe('/repo');
  });

  it('puts the token ONLY in the child environment, behind a static credential helper', async () => {
    const run = runPush({});

    expect(await run.exit).toBe(0);
    const push = pushCall(run.calls);
    expect(push?.file).toBe(GIT_PATH);
    // The whole call, pinned: inherited helpers cleared, then the ONE static
    // helper literal; the remote carries no credentials; the refspec is
    // HEAD:<branch>. Nothing else is on the line — no force, no --no-verify.
    expect(push?.args).toEqual([
      '-c',
      'credential.helper=',
      '-c',
      'credential.helper=!f() { echo username=x-access-token; echo "password=$GH_PUSH_TOKEN"; }; f',
      'push',
      REMOTE,
      `HEAD:${BRANCH}`,
    ]);
    expect(push?.args.join(' ')).not.toContain(TOKEN);
    expect(push?.args).not.toContain('--no-verify');
    // Exactly ONE environment variable carries the token, and it is the one
    // the helper reads: a second carrier would widen the leak surface to every
    // child git itself spawns (hooks included).
    const carriers = Object.entries(push?.env ?? {})
      .filter(([, value]) => value === TOKEN)
      .map(([name]) => name);
    expect(carriers).toEqual(['GH_PUSH_TOKEN']);
    // The base environment travels wholesale — git needs it — with the token
    // spread on top, never replacing it.
    expect(push?.env.PATH).toBe('/usr/bin');
  });

  it('mints the pull-request-work scope — a push can touch .github/workflows', async () => {
    const run = runPush({});

    expect(await run.exit).toBe(0);
    const mint = run.bodies.find((call) => call.url.endsWith('/access_tokens'));
    expect(mint).toBeDefined();
    expect(JSON.parse(mint?.body ?? '{}').permissions).toEqual({
      pull_requests: 'write',
      contents: 'write',
      workflows: 'write',
    });
  });

  it('pushes an explicitly named branch without asking git which branch HEAD is on', async () => {
    const run = runPush({ args: ['--branch', 'other-lane'] });

    expect(await run.exit).toBe(0);
    expect(run.calls.map((call) => call.args[0])).toEqual(['-c']);
    expect(pushCall(run.calls)?.args.at(-1)).toBe('HEAD:other-lane');
  });

  it('emits EXACTLY the outcome object on stdout under --json, transfer output on stderr', async () => {
    const run = runPush({ args: ['--json'] });

    expect(await run.exit).toBe(0);
    expect(JSON.parse(run.out())).toEqual({ kind: 'pushed', branch: BRANCH, remote: REMOTE });
    expect(run.errText()).toContain('abc1234..def5678');
    expect(run.out()).not.toContain(TOKEN);
  });

  it('refuses to push the default branch by name, before minting anything', async () => {
    for (const branch of ['main', 'master']) {
      const run = runPush({
        git: gitFake({ revParse: { status: 0, stdout: `${branch}\n`, stderr: '' } }),
      });

      expect(await run.exit).toBe(3);
      expect(run.errText()).toContain(branch);
      expect(run.errText()).toContain('pull request');
      // A refusal mints no token and runs no push: the refusal is the whole
      // behaviour, not a check the push then ignores.
      expect(run.urls).toEqual([]);
      expect(pushCall(run.calls)).toBeUndefined();
    }
  });

  it('reports the default-branch refusal machine-readably under --json', async () => {
    const run = runPush({
      args: ['--json'],
      git: gitFake({ revParse: { status: 0, stdout: 'main\n', stderr: '' } }),
    });

    expect(await run.exit).toBe(3);
    const outcome: unknown = JSON.parse(run.out());
    expect(outcome).toMatchObject({ kind: 'refused' });
    expect(JSON.stringify(outcome)).toContain('pull request');
  });

  it('refuses a detached HEAD by naming the state, never guessing a branch', async () => {
    const run = runPush({
      git: gitFake({ revParse: { status: 0, stdout: 'HEAD\n', stderr: '' } }),
    });

    expect(await run.exit).toBe(3);
    expect(run.errText()).toContain('detached');
    expect(run.urls).toEqual([]);
    expect(pushCall(run.calls)).toBeUndefined();
  });

  it('refuses an explicitly named default branch too — the guard is on the target', async () => {
    const run = runPush({ args: ['--branch', 'main'] });

    expect(await run.exit).toBe(3);
    expect(run.errText()).toContain('pull request');
    expect(pushCall(run.calls)).toBeUndefined();
  });

  it('surfaces a non-zero git push as an operational failure, with git own stderr', async () => {
    const run = runPush({
      git: gitFake({
        push: {
          status: 1,
          stdout: '',
          stderr: '! [rejected] HEAD -> lane (non-fast-forward)\n',
        },
      }),
    });

    expect(await run.exit).toBe(1);
    expect(run.errText()).toContain('non-fast-forward');
    expect(run.out()).not.toContain(TOKEN);
    expect(run.errText()).not.toContain(TOKEN);
  });

  it('never lets an EMPTY token reach git — the run fails first', async () => {
    // An empty GH_PUSH_TOKEN would make the helper emit an empty password and
    // git fall back to prompting: the signed-in human, under the bot's name.
    // The state pinned here is that no push runs; which of the two guards
    // fires (the mint's own schema, or the point-of-use backstop in
    // push-cli.ts) is an implementation detail.
    const run = runPush({ fetch: mintFetch('') });

    expect(await run.exit).toBe(1);
    expect(run.errText()).toMatch(/token/u);
    expect(pushCall(run.calls)).toBeUndefined();
  });

  it('surfaces an unreadable current branch as an operational failure', async () => {
    const run = runPush({
      git: gitFake({
        revParse: { status: 128, stdout: '', stderr: 'fatal: not a git repository\n' },
      }),
    });

    expect(await run.exit).toBe(1);
    expect(run.errText()).toContain('not a git repository');
    expect(run.urls).toEqual([]);
  });

  it('fails as usage when the repo config authority is unreadable', async () => {
    const run = runPush({ overrides: { readConfigFileImpl: () => 'not-json' } });

    expect(await run.exit).toBe(2);
    expect(run.errText()).toContain('single authority');
    expect(run.calls).toEqual([]);
  });

  it('answers push --help with the usage on stdout, exit 0 — never the unknown-flag path', async () => {
    const run = runPush({ args: ['--help'] });

    expect(await run.exit).toBe(0);
    expect(run.out()).toContain('push [--branch');
    expect(run.calls).toEqual([]);
    expect(run.urls).toEqual([]);
  });

  it('documents the push action in the topic usage text', async () => {
    const out = capture();
    const errSink = capture();
    const exit = runMergeBotCli({
      args: ['--help'],
      env: {},
      stdout: out.sink,
      stderr: errSink.sink,
    });

    expect(await exit).toBe(0);
    expect(out.text()).toContain('push [--branch');
    // The absence of a bypass is part of the published contract, not a
    // private implementation choice.
    expect(out.text()).toContain('no force flag');
  });
});
