import { describe, expect, it } from 'vitest';

import playwrightConfig from '../playwright.config.js';
import { HttpEnvSchema } from '../src/env.js';
import { resolveHttpDevExecutionPlan } from './development/http-dev-contract.js';

/**
 * The developer's ambient app `.env.local` analytics selection, modelled
 * as the lowest layer of the merge the webServer child sees. In the real
 * chain these keys arrive through `resolveEnv`'s file layers, BELOW
 * process env — so a key the config block pins is overridden and a key
 * it omits reaches the server. Spreading the file layer first reproduces
 * that precedence without reading any real env file.
 */
const ambientPosthogSelection = {
  OBSERVABILITY_SINKS: '["posthog"]',
  POSTHOG_PROJECT_API_KEY: 'phc_test_dummy',
  POSTHOG_HOST: 'https://eu.i.posthog.com',
  POSTHOG_PSEUDONYM_ACTIVE_KEY_ID: 'k_test',
  POSTHOG_PSEUDONYM_KEYRING: '[{"id":"k_test","key":"test-key"}]',
};

const webServer = playwrightConfig.webServer;

// A missing or multi-entry webServer block empties the pinned layer, which
// fails the boot assertion below on required keys — the shape test names
// the cause directly so the diagnosis does not start at the env contract.
const uiWebServerEnv: NodeJS.ProcessEnv =
  webServer === undefined || Array.isArray(webServer) ? {} : { ...webServer.env };

function serverEnvSeenBy(composedParentEnv: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const plan = resolveHttpDevExecutionPlan({
    mode: 'observe-noauth',
    workspaceRoot: '/workspace/apps/oak-curriculum-mcp-streamable-http',
    parentEnv: composedParentEnv,
    now: new Date(2026, 6, 30, 9, 0, 0),
  });
  return plan.server.env;
}

describe('test:ui webServer analytics-axis pin', () => {
  it('declares exactly one webServer block carrying the pinned env', () => {
    expect(webServer).toBeDefined();
    expect(Array.isArray(webServer)).toBe(false);
    expect(uiWebServerEnv.OBSERVABILITY_SINKS).toBe('[]');
  });

  it('boots under an ambient posthog selection because the config layer pins the axis', () => {
    const result = HttpEnvSchema.safeParse(
      serverEnvSeenBy({ ...ambientPosthogSelection, ...uiWebServerEnv }),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.OBSERVABILITY_SINKS).toStrictEqual([]);
    }
  });

  it('cannot boot when the config layer stops pinning the axis: posthog under disabled auth is refused', () => {
    const unpinned = { ...uiWebServerEnv };
    delete unpinned.OBSERVABILITY_SINKS;
    const result = HttpEnvSchema.safeParse(
      serverEnvSeenBy({ ...ambientPosthogSelection, ...unpinned }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message).join('; ');
      expect(messages).toContain(
        'posthog cannot be selected while DANGEROUSLY_DISABLE_AUTH is true',
      );
    }
  });
});
