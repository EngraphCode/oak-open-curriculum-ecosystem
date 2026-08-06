import { describe, expect, it } from 'vitest';

import { tokenisedEnv } from './merge.js';

/**
 * Pure environment construction for the tokenised gh executor — params in,
 * object out, no fakes.
 */

describe('tokenisedEnv', () => {
  it('injects the fresh token LAST — a stale GH_TOKEN in the base never wins', () => {
    const env = tokenisedEnv('fresh-token', { PATH: '/usr/bin', GH_TOKEN: 'stale-token' });

    expect(env.GH_TOKEN).toBe('fresh-token');
    expect(env.PATH).toBe('/usr/bin');
  });

  it('pins the host and strips the enterprise-token fallbacks (security H1)', () => {
    // An ambient GH_HOST would steer gh's READS off github.com — where the
    // injected GH_TOKEN does not apply and gh falls back to stored human
    // credentials — while the merge PUT stays pinned to api.github.com.
    const env = tokenisedEnv('fresh-token', {
      GH_HOST: 'ghe.example.com',
      GH_ENTERPRISE_TOKEN: 'enterprise-secret',
      GITHUB_ENTERPRISE_TOKEN: 'legacy-secret',
    });

    expect(env.GH_HOST).toBe('github.com');
    expect(env.GH_ENTERPRISE_TOKEN).toBeUndefined();
    expect(env.GITHUB_ENTERPRISE_TOKEN).toBeUndefined();
    expect(env.GH_TOKEN).toBe('fresh-token');
  });
});
