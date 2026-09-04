import { mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { runDeployConfigValidation } from './validate-deploy-config.js';

/** The smallest environment the deployed server boots on (mirrors the dev-boot invariant). */
const minimalBootEnv = {
  OAK_API_KEY: 'test-oak-api-key',
  ELASTICSEARCH_URL: 'https://example-elasticsearch.test',
  ELASTICSEARCH_API_KEY: 'test-elasticsearch-api-key',
  DANGEROUSLY_DISABLE_AUTH: 'true',
  OAK_CURRICULUM_MCP_USE_STUB_TOOLS: 'true',
  APP_VERSION_OVERRIDE: '1.2.3-test',
} as const;

/** An env-file-free start directory, so only the injected environment is read. */
async function emptyStartDir(): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), 'deploy-config-gate-'));
}

async function runGate(processEnv: NodeJS.ProcessEnv): Promise<{
  readonly exitCode: 0 | 1;
  readonly lines: readonly string[];
}> {
  const lines: string[] = [];
  const exitCode = runDeployConfigValidation({
    processEnv,
    startDir: await emptyStartDir(),
    writeLine: (line) => {
      lines.push(line);
    },
  });

  return { exitCode, lines };
}

describe('deploy-config validation gate — the real loaders behind the entry seam', () => {
  it('skips with exit 0 outside Vercel builds, even on an environment that would not boot', async () => {
    const { exitCode, lines } = await runGate({ SENTRY_MODE: 'sentry' });

    expect(exitCode).toBe(0);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain('skipped');
  });

  it('passes a Vercel build whose environment boots the server', async () => {
    const { exitCode, lines } = await runGate({ VERCEL: '1', ...minimalBootEnv });

    expect(exitCode).toBe(0);
    expect(lines[0]).toContain('deploy configuration is valid');
  });

  it('fails a Vercel build that passes the env schema but not observability composition', async () => {
    // Sentry mode without a DSN: the env schema accepts it, the Sentry
    // configuration parse refuses it, and the deployed handler would fail —
    // the boot-dead shape the gate exists to catch.
    const { exitCode, lines } = await runGate({
      VERCEL: '1',
      ...minimalBootEnv,
      SENTRY_MODE: 'sentry',
    });

    expect(exitCode).toBe(1);
    expect(lines[0]).toContain('deploy configuration is invalid');
    expect(lines[0]).toMatch(/dsn/i);
  });

  it('fails a Vercel build whose environment fails the env schema, carrying the boundary message', async () => {
    const { exitCode, lines } = await runGate({ VERCEL: '1' });

    expect(exitCode).toBe(1);
    expect(lines[0]).toContain('deploy configuration is invalid');
  });
});
