import { describe, expect, it } from 'vitest';
import {
  DEPLOY_GATE_ENV_KEYS,
  filterDeployGateEnv,
  runDeployConfigValidation,
} from './validate-deploy-config.js';

/** The smallest environment the deployed server boots on (mirrors the dev-boot invariant). */
const minimalBootEnv = {
  OAK_API_KEY: 'test-oak-api-key',
  ELASTICSEARCH_URL: 'https://example-elasticsearch.test',
  ELASTICSEARCH_API_KEY: 'test-elasticsearch-api-key',
  DANGEROUSLY_DISABLE_AUTH: 'true',
  OAK_CURRICULUM_MCP_USE_STUB_TOOLS: 'true',
  APP_VERSION_OVERRIDE: '1.2.3-test',
} as const;

/** Live-shaped key material: the bytes that must never reach a build log. */
const liveShapedSecrets = {
  OAK_API_KEY: 'oak_live_9f8e7d6c5b4a3f2e1d0c',
  ELASTICSEARCH_API_KEY: 'ZXMtbGl2ZS1rZXktaWQ6ZXMtbGl2ZS1rZXktc2VjcmV0',
  CLERK_SECRET_KEY: 'sk_live_4eC39HqLyjWDarjtT1zdp7dc',
  CLERK_PUBLISHABLE_KEY: 'pk_live_Y2xlcmsubGl2ZS5leGFtcGxlJA',
  SENTRY_DSN: 'https://0a1b2c3d4e5f60718293a4b5c6d7e8f9@o4500000000.ingest.sentry.io/4500000000',
  POSTHOG_PROJECT_API_KEY: 'phc_LIVEprojectKEY0123456789abcdefghijklmnop',
} as const;

function runGate(processEnv: NodeJS.ProcessEnv): {
  readonly exitCode: 0 | 1;
  readonly out: readonly string[];
  readonly err: readonly string[];
} {
  const out: string[] = [];
  const err: string[] = [];
  const exitCode = runDeployConfigValidation({
    processEnv,
    writeOut: (line) => {
      out.push(line);
    },
    writeErr: (line) => {
      err.push(line);
    },
  });
  return { exitCode, out, err };
}

function expectNoSecretBytes(lines: readonly string[]): void {
  const output = lines.join('\n');
  for (const value of Object.values(liveShapedSecrets)) {
    expect(output).not.toContain(value);
  }
}

describe('deploy-config validation gate — the real loaders behind the entry seam', () => {
  it('skips with exit 0 outside Vercel builds, even on an environment that would not boot', () => {
    const { exitCode, out, err } = runGate({ SENTRY_MODE: 'sentry' });

    expect(exitCode).toBe(0);
    expect(out).toHaveLength(1);
    expect(out[0]).toContain('skipped');
    expect(err).toHaveLength(0);
  });

  it('passes a Vercel build whose environment boots the server', () => {
    const { exitCode, out, err } = runGate({ VERCEL: '1', ...minimalBootEnv });

    expect(exitCode).toBe(0);
    expect(out[0]).toContain('deploy configuration is valid');
    expect(err).toHaveLength(0);
  });

  it('fails a Vercel build that passes the env schema but not observability composition', () => {
    // Sentry mode without a DSN: the env schema accepts it, the Sentry
    // configuration parse refuses it, and the deployed handler would fail —
    // the boot-dead shape the gate exists to catch. Failures go to stderr.
    const { exitCode, out, err } = runGate({
      VERCEL: '1',
      ...minimalBootEnv,
      SENTRY_MODE: 'sentry',
    });

    expect(exitCode).toBe(1);
    expect(out).toHaveLength(0);
    expect(err[0]).toContain('deploy configuration is invalid');
    expect(err[0]).toMatch(/dsn/i);
  });

  it('fails a Vercel build whose environment fails the env schema, carrying the boundary message', () => {
    const { exitCode, err } = runGate({ VERCEL: '1' });

    expect(exitCode).toBe(1);
    expect(err[0]).toContain('deploy configuration is invalid');
  });
});

describe('deploy-config validation gate — filtered credentials', () => {
  it('sees only the validated variables, never build-only credentials', () => {
    const filtered = filterDeployGateEnv({
      OAK_API_KEY: 'k',
      SENTRY_AUTH_TOKEN: 'build-only',
      TURBO_TOKEN: 'build-only',
      VERCEL_OIDC_TOKEN: 'build-only',
    });

    expect(filtered).toEqual({ OAK_API_KEY: 'k' });
    expect(DEPLOY_GATE_ENV_KEYS).toContain('VERCEL');
    expect(DEPLOY_GATE_ENV_KEYS).not.toContain('SENTRY_AUTH_TOKEN');
  });
});

describe('deploy-config validation gate — output discipline', () => {
  it('prints no secret bytes on the pass path', () => {
    const { exitCode, out, err } = runGate({
      VERCEL: '1',
      ...minimalBootEnv,
      ...liveShapedSecrets,
    });

    expect(exitCode).toBe(0);
    expectNoSecretBytes([...out, ...err]);
  });

  it('prints no secret bytes when the env schema refuses', () => {
    // A test-realm publishable key on a production deployment: the schema's
    // key-locality guard refuses it, so the live secret key beside it must
    // not surface in the refusal.
    const { exitCode, out, err } = runGate({
      VERCEL: '1',
      VERCEL_ENV: 'production',
      ...minimalBootEnv,
      ...liveShapedSecrets,
      DANGEROUSLY_DISABLE_AUTH: 'false',
      CLERK_PUBLISHABLE_KEY: 'pk_test_dGVzdC5leGFtcGxlJA',
    });

    expect(exitCode).toBe(1);
    expectNoSecretBytes([...out, ...err]);
  });

  it('prints no secret bytes when observability composition refuses', () => {
    const { exitCode, out, err } = runGate({
      VERCEL: '1',
      ...minimalBootEnv,
      ...liveShapedSecrets,
      SENTRY_DSN: undefined,
      SENTRY_MODE: 'sentry',
    });

    expect(exitCode).toBe(1);
    expectNoSecretBytes([...out, ...err]);
  });
});
