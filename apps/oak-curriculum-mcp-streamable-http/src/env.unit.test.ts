import { describe, it, expect } from 'vitest';
import { HttpEnvSchema } from './env.js';

const baseEnv = {
  OAK_API_KEY: 'test-key',
  ELASTICSEARCH_URL: 'http://localhost:9200',
  ELASTICSEARCH_API_KEY: 'test-api-key',
};

const withClerkKeys = {
  ...baseEnv,
  CLERK_PUBLISHABLE_KEY: 'pk_test_123',
  CLERK_SECRET_KEY: 'sk_test_123',
};

describe('Environment Schema', () => {
  it('requires CLERK_PUBLISHABLE_KEY when auth enabled', () => {
    const result = HttpEnvSchema.safeParse(baseEnv);
    expect(result.success).toBe(false);
  });

  it('requires CLERK_SECRET_KEY when auth enabled', () => {
    const result = HttpEnvSchema.safeParse({
      ...baseEnv,
      CLERK_PUBLISHABLE_KEY: 'pk_test_123',
    });
    expect(result.success).toBe(false);
  });

  it('strips unknown fields like ENABLE_LOCAL_AS', () => {
    const result = HttpEnvSchema.safeParse({
      ...withClerkKeys,
      ENABLE_LOCAL_AS: 'true',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect('ENABLE_LOCAL_AS' in result.data).toBe(false);
    }
  });

  it('requires ELASTICSEARCH_URL', () => {
    const result = HttpEnvSchema.safeParse({
      OAK_API_KEY: 'test-key',
      CLERK_PUBLISHABLE_KEY: 'pk_test_123',
      CLERK_SECRET_KEY: 'sk_test_123',
      ELASTICSEARCH_API_KEY: 'test-api-key',
    });
    expect(result.success).toBe(false);
  });

  it('requires ELASTICSEARCH_API_KEY', () => {
    const result = HttpEnvSchema.safeParse({
      OAK_API_KEY: 'test-key',
      CLERK_PUBLISHABLE_KEY: 'pk_test_123',
      CLERK_SECRET_KEY: 'sk_test_123',
      ELASTICSEARCH_URL: 'http://localhost:9200',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid configuration with Clerk keys', () => {
    const result = HttpEnvSchema.safeParse(withClerkKeys);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.CLERK_PUBLISHABLE_KEY).toBe('pk_test_123');
      expect(result.data.CLERK_SECRET_KEY).toBe('sk_test_123');
    }
  });

  it('does not include CORS_MODE or ALLOWED_ORIGINS in the schema', () => {
    const result = HttpEnvSchema.safeParse({
      ...withClerkKeys,
      CORS_MODE: 'automatic',
      ALLOWED_ORIGINS: 'http://localhost:3000',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect('CORS_MODE' in result.data).toBe(false);
      expect('ALLOWED_ORIGINS' in result.data).toBe(false);
    }
  });
});

describe('Conditional Clerk keys (DANGEROUSLY_DISABLE_AUTH)', () => {
  it('accepts missing Clerk keys when DANGEROUSLY_DISABLE_AUTH=true', () => {
    const result = HttpEnvSchema.safeParse({
      ...baseEnv,
      DANGEROUSLY_DISABLE_AUTH: 'true',
    });

    expect(result.success).toBe(true);
  });

  it('rejects missing Clerk keys when auth enabled (no DANGEROUSLY_DISABLE_AUTH)', () => {
    const result = HttpEnvSchema.safeParse(baseEnv);
    expect(result.success).toBe(false);
  });

  it('rejects missing Clerk keys when DANGEROUSLY_DISABLE_AUTH=false', () => {
    const result = HttpEnvSchema.safeParse({
      ...baseEnv,
      DANGEROUSLY_DISABLE_AUTH: 'false',
    });

    expect(result.success).toBe(false);
  });

  it('accepts Clerk keys when auth enabled', () => {
    const result = HttpEnvSchema.safeParse(withClerkKeys);
    expect(result.success).toBe(true);
  });

  it('accepts Clerk keys even when DANGEROUSLY_DISABLE_AUTH=true', () => {
    const result = HttpEnvSchema.safeParse({
      ...withClerkKeys,
      DANGEROUSLY_DISABLE_AUTH: 'true',
    });

    expect(result.success).toBe(true);
  });

  it('rejects DANGEROUSLY_DISABLE_AUTH=true in production', () => {
    const result = HttpEnvSchema.safeParse({
      ...withClerkKeys,
      DANGEROUSLY_DISABLE_AUTH: 'true',
      VERCEL_ENV: 'production',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('DANGEROUSLY_DISABLE_AUTH');
    }
  });

  it('allows DANGEROUSLY_DISABLE_AUTH=true in preview and development', () => {
    for (const env of ['preview', 'development'] as const) {
      const result = HttpEnvSchema.safeParse({
        ...baseEnv,
        DANGEROUSLY_DISABLE_AUTH: 'true',
        VERCEL_ENV: env,
      });
      expect(result.success).toBe(true);
    }
  });

  describe('CANONICAL_HOST', () => {
    it('accepts an environment without it — per-request derivation is the default', () => {
      const result = HttpEnvSchema.safeParse(withClerkKeys);
      expect(result.success).toBe(true);
    });

    it('accepts a bare hostname', () => {
      const result = HttpEnvSchema.safeParse({
        ...withClerkKeys,
        CANONICAL_HOST: 'www.thenational.academy',
      });

      expect(result.success).toBe(true);
    });

    it.each([
      ['a port', 'www.thenational.academy:8443'],
      ['a scheme', 'https://www.thenational.academy'],
      ['a path', 'www.thenational.academy/mcp'],
      ['userinfo', 'www.thenational.academy:443@evil.example'],
      ['a comma-joined pair', 'www.thenational.academy,evil.example'],
      ['whitespace', 'www.thenational.academy evil.example'],
      ['an empty value', ''],
      ['a loopback name', 'localhost'],
    ])('rejects %s at startup rather than at request time', (_label, value) => {
      const result = HttpEnvSchema.safeParse({ ...withClerkKeys, CANONICAL_HOST: value });

      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path.join('.'));
        expect(paths).toContain('CANONICAL_HOST');
      }
    });
  });
});

describe('PostHog product-analytics selection (OBSERVABILITY_SINKS)', () => {
  const ZERO_KEY = Buffer.alloc(32, 0).toString('base64url');
  const validPostHogVars = {
    POSTHOG_PROJECT_API_KEY: 'phc_test_project_key',
    POSTHOG_HOST: 'https://eu.i.posthog.com',
    POSTHOG_PSEUDONYM_ACTIVE_KEY_ID: 'k2026_01',
    POSTHOG_PSEUDONYM_KEYRING: JSON.stringify([{ id: 'k2026_01', key: ZERO_KEY }]),
  };

  it('accepts a selection without posthog and requires no PostHog variables', () => {
    const result = HttpEnvSchema.safeParse({
      ...withClerkKeys,
      OBSERVABILITY_SINKS: '["sentry"]',
    });
    expect(result.success).toBe(true);
  });

  it('ignores PostHog variable content when posthog is not selected', () => {
    const result = HttpEnvSchema.safeParse({
      ...withClerkKeys,
      OBSERVABILITY_SINKS: '["sentry"]',
      POSTHOG_PROJECT_API_KEY: '',
      POSTHOG_HOST: 'https://us.i.posthog.com',
      POSTHOG_PSEUDONYM_KEYRING: 'not json',
    });
    expect(result.success).toBe(true);
  });

  it('accepts the complete closed configuration when posthog is selected', () => {
    const result = HttpEnvSchema.safeParse({
      ...withClerkKeys,
      OBSERVABILITY_SINKS: '["sentry","posthog"]',
      ...validPostHogVars,
    });
    expect(result.success).toBe(true);
  });

  it.each([
    'POSTHOG_PROJECT_API_KEY',
    'POSTHOG_HOST',
    'POSTHOG_PSEUDONYM_ACTIVE_KEY_ID',
    'POSTHOG_PSEUDONYM_KEYRING',
  ])('requires %s when posthog is selected', (missingKey) => {
    const result = HttpEnvSchema.safeParse({
      ...withClerkKeys,
      OBSERVABILITY_SINKS: '["sentry","posthog"]',
      ...validPostHogVars,
      [missingKey]: undefined,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain(missingKey);
    }
  });

  it('rejects any POSTHOG_HOST other than the exact EU ingestion host', () => {
    const result = HttpEnvSchema.safeParse({
      ...withClerkKeys,
      OBSERVABILITY_SINKS: '["sentry","posthog"]',
      ...validPostHogVars,
      POSTHOG_HOST: 'https://us.i.posthog.com',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('POSTHOG_HOST');
    }
  });

  it('rejects selecting posthog while authentication is disabled', () => {
    const result = HttpEnvSchema.safeParse({
      ...baseEnv,
      DANGEROUSLY_DISABLE_AUTH: 'true',
      OBSERVABILITY_SINKS: '["sentry","posthog"]',
      ...validPostHogVars,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('OBSERVABILITY_SINKS');
    }
  });

  it('rejects a deployment-supplied POSTHOG_CAPTURE_MODE when posthog is selected', () => {
    const result = HttpEnvSchema.safeParse({
      ...withClerkKeys,
      OBSERVABILITY_SINKS: '["sentry","posthog"]',
      ...validPostHogVars,
      POSTHOG_CAPTURE_MODE: 'immediate',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('POSTHOG_CAPTURE_MODE');
    }
  });

  it('tolerates POSTHOG_CAPTURE_MODE content when posthog is not selected — deselection never fails boot', () => {
    const result = HttpEnvSchema.safeParse({
      ...withClerkKeys,
      OBSERVABILITY_SINKS: '["sentry"]',
      ...validPostHogVars,
      POSTHOG_CAPTURE_MODE: 'immediate',
    });
    expect(result.success).toBe(true);
  });

  it('treats an empty POSTHOG_CAPTURE_MODE as absent — a cleared variable never fails boot', () => {
    const result = HttpEnvSchema.safeParse({
      ...withClerkKeys,
      OBSERVABILITY_SINKS: '["sentry","posthog"]',
      ...validPostHogVars,
      POSTHOG_CAPTURE_MODE: '',
    });
    expect(result.success).toBe(true);
  });

  it('rejects posthog as the only sink in production — product analytics is not a diagnostic sink', () => {
    const result = HttpEnvSchema.safeParse({
      ...withClerkKeys,
      VERCEL_ENV: 'production',
      OBSERVABILITY_SINKS: '["posthog"]',
      ...validPostHogVars,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('OBSERVABILITY_SINKS');
    }
  });

  it('accepts posthog alongside a diagnostic sink in production', () => {
    const result = HttpEnvSchema.safeParse({
      ...withClerkKeys,
      VERCEL_ENV: 'production',
      OBSERVABILITY_SINKS: '["sentry","posthog"]',
      ...validPostHogVars,
    });
    expect(result.success).toBe(true);
  });
});
