/**
 * Unit tests for getMcpResourceUrl.
 *
 * The builder delegates origin derivation to `deriveSelfOrigin` — scheme
 * and allowlist states proven in `host-validation-error.unit.test.ts`,
 * canonical-origin supersession proven end-to-end in
 * `canonical-origin.integration.test.ts` — and appends the fixed MCP
 * resource path. These states prove only what this function adds: the expected
 * RFC 8707 audience is exactly the resource the PRM document advertises —
 * origin plus `/mcp`, nothing from the request URL — and validation
 * failures surface as `Err` for the caller's 403 mapping.
 *
 * CodeQL `js/regex/missing-regexp-anchor` alerts #226 and #227 locate the
 * dataflow SOURCE at the `['example.com']` allow-list literals below. The
 * SINK is `hostPatternToRegex` in `host-header-validation.ts`, which composes
 * `'^' + … + '$'` — anchored at both ends — and is only reached for entries
 * containing `*`, which these are not. That file is unchanged by this work.
 * Same class and same reasoning as the previously dismissed #83–#86; the
 * alert numbers are new only because this file was rewritten.
 */

import { describe, it, expect } from 'vitest';
import { getMcpResourceUrl } from './get-mcp-resource-url.js';

describe('getMcpResourceUrl', () => {
  it('the expected audience is the fixed /mcp resource on the derived origin', () => {
    const req = { get: (header: string) => (header === 'host' ? 'example.com' : undefined) };

    const result = getMcpResourceUrl(req, ['example.com']);

    expect(result).toStrictEqual({ ok: true, value: 'https://example.com/mcp' });
  });

  it('a configured canonical origin yields the canonical resource', () => {
    const req = { get: () => 'curriculum-mcp-alpha.oaknational.dev' };

    const result = getMcpResourceUrl(req, [], 'https://www.thenational.academy');

    expect(result).toStrictEqual({ ok: true, value: 'https://www.thenational.academy/mcp' });
  });

  it('surfaces a host-validation failure as Err for the caller to map to 403', () => {
    const req = { get: () => undefined };

    const result = getMcpResourceUrl(req, ['example.com']);

    expect(result).toStrictEqual({ ok: false, error: { type: 'missing_host' } });
  });
});
