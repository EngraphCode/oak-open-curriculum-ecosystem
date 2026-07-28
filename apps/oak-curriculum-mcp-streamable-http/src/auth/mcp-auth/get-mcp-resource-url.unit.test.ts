import { describe, it, expect } from 'vitest';
import { getMcpResourceUrl } from './get-mcp-resource-url.js';

describe('getMcpResourceUrl', () => {
  it('returns canonical MCP resource URL for allowed host', () => {
    const req = {
      protocol: 'https',
      get: () => 'example.com',
      originalUrl: '/mcp',
    };

    expect(getMcpResourceUrl(req, ['example.com'])).toBe('https://example.com/mcp');
  });

  it('throws when host is missing', () => {
    const req = {
      protocol: 'https',
      get: () => undefined,
      originalUrl: '/mcp',
    };

    expect(() => getMcpResourceUrl(req, ['example.com'])).toThrow(
      'Cannot generate MCP resource URL: missing host header',
    );
  });

  it('throws when host is malformed', () => {
    const req = {
      protocol: 'https',
      get: () => '[::1]evil',
      originalUrl: '/mcp',
    };

    expect(() => getMcpResourceUrl(req, ['::1'])).toThrow(
      'Cannot generate MCP resource URL: invalid host header format: [::1]evil',
    );
  });

  it('throws when host is not allow-listed', () => {
    const req = {
      protocol: 'https',
      get: () => 'evil.com',
      originalUrl: '/mcp',
    };

    expect(() => getMcpResourceUrl(req, ['example.com'])).toThrow(
      'Cannot generate MCP resource URL: host not allowed: evil.com',
    );
  });

  describe('with a configured canonical origin (MCP-269)', () => {
    // The allow-list is passed EMPTY throughout: the canonical origin must not
    // consult it, so an empty list makes any accidental per-request derivation
    // fail loudly instead of passing by coincidence.
    const CANONICAL = 'https://www.thenational.academy';

    it('uses the canonical origin instead of the request host', () => {
      const req = {
        protocol: 'https',
        get: () => 'curriculum-mcp-alpha.oaknational.dev',
        originalUrl: '/mcp',
      };

      expect(getMcpResourceUrl(req, [], CANONICAL)).toBe('https://www.thenational.academy/mcp');
    });

    it('ignores req.protocol — the canonical origin fixes the scheme', () => {
      const req = {
        protocol: 'http',
        get: () => 'curriculum-mcp-alpha.oaknational.dev',
        originalUrl: '/mcp',
      };

      expect(getMcpResourceUrl(req, [], CANONICAL)).toBe('https://www.thenational.academy/mcp');
    });

    it('preserves the request path so the resource identifies the served endpoint', () => {
      const req = {
        protocol: 'https',
        get: () => 'curriculum-mcp-alpha.oaknational.dev',
        originalUrl: '/mcp',
      };

      expect(getMcpResourceUrl(req, [], CANONICAL)).toBe('https://www.thenational.academy/mcp');
    });
  });
});
