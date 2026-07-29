/**
 * Unit tests for getPRMUrl.
 *
 * The builder delegates origin derivation to `deriveSelfOrigin` — whose
 * scheme and allowlist states are proven in
 * `host-validation-error.unit.test.ts`, and whose canonical-origin
 * supersession is proven end-to-end in
 * `canonical-origin.integration.test.ts` — and appends the RFC 9728
 * path-qualified well-known suffix. These states prove only what this
 * function adds: the appended path on success, that the canonical origin
 * is forwarded, and validation failures surfacing as `Err` for the
 * caller's 403 mapping.
 *
 * CodeQL `js/regex/missing-regexp-anchor` alerts #228 and #229 locate the
 * dataflow SOURCE at the `['example.com']` allow-list literals below. The
 * SINK is `hostPatternToRegex` in `host-header-validation.ts`, which composes
 * `'^' + … + '$'` — anchored at both ends — and is only reached for entries
 * containing `*`, which these are not. That file is unchanged by this work.
 * Same class and same reasoning as the previously dismissed #83–#86; the
 * alert numbers are new only because this file was rewritten.
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc9728#section-3.1 | RFC 9728 Section 3.1}
 */

import { describe, it, expect } from 'vitest';
import { getPRMUrl } from './get-prm-url.js';

describe('getPRMUrl', () => {
  it('appends the path-qualified well-known suffix to the derived origin', () => {
    const req = { get: (header: string) => (header === 'host' ? 'example.com' : undefined) };

    const result = getPRMUrl(req, ['example.com']);

    expect(result).toStrictEqual({
      ok: true,
      value: 'https://example.com/.well-known/oauth-protected-resource/mcp',
    });
  });

  it('appends the same suffix to a configured canonical origin', () => {
    const req = { get: () => 'curriculum-mcp-alpha.oaknational.dev' };

    const result = getPRMUrl(req, [], 'https://www.thenational.academy');

    expect(result).toStrictEqual({
      ok: true,
      value: 'https://www.thenational.academy/.well-known/oauth-protected-resource/mcp',
    });
  });

  it('surfaces a host-validation failure as Err for the caller to map to 403', () => {
    const req = { get: () => 'evil.com' };

    const result = getPRMUrl(req, ['example.com']);

    expect(result).toStrictEqual({
      ok: false,
      error: { type: 'not_allowed', hostname: 'evil.com' },
    });
  });
});
