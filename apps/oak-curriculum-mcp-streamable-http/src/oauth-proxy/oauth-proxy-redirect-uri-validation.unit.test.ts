import { describe, it, expect } from 'vitest';

import { findRedirectUriRejection } from './oauth-proxy-redirect-uri-validation.js';

/**
 * The registration boundary's `redirect_uris` contract (MCP-188).
 *
 * RFC 9700 §2.1: an authorization server MUST NOT allow redirection URIs
 * using the `http` scheme except for loopback redirection per RFC 8252 §7.3.
 * RFC 7591 §3.2.2 names the error codes returned to the client.
 */
describe('findRedirectUriRejection', () => {
  describe('conformant values are accepted', () => {
    it.each([
      // RFC 8252 §7.3 loopback IP literals — any port must be permitted, and
      // IPv4 loopback is the whole 127.0.0.0/8 range, not just 127.0.0.1.
      'http://127.0.0.1:61154/callback',
      'http://127.0.0.2/callback',
      'http://[::1]:3000/callback',
      // RFC 8252 §8.3 — permitted though NOT RECOMMENDED; Inspector-class
      // clients register it.
      'http://localhost:8080/callback',
      'https://client.example/callback',
      // RFC 8252 §7.1 private-use scheme. Cursor registers exactly this
      // shape, so the §8.4 reverse-domain SHOULD is deliberately not
      // enforced here.
      'cursor://callback',
    ])('accepts %s', (redirectUri) => {
      expect(findRedirectUriRejection({ redirect_uris: [redirectUri] })).toBeUndefined();
    });

    it('accepts a registration with no redirect_uris field', () => {
      expect(findRedirectUriRejection({ client_name: 'Cursor' })).toBeUndefined();
    });

    it('accepts an empty redirect_uris array', () => {
      expect(findRedirectUriRejection({ redirect_uris: [] })).toBeUndefined();
    });

    it('accepts a body that is not an object', () => {
      expect(findRedirectUriRejection(undefined)).toBeUndefined();
    });
  });

  describe('non-loopback http is rejected', () => {
    it.each([
      'http://evil.example/callback',
      // The WHATWG parser case-folds scheme and host before we compare.
      'HTTP://EVIL.EXAMPLE/callback',
      // Hosts that a prefix or substring test would misread as loopback.
      // These are the concrete holes an exact-equality check closes.
      'http://127.evil.example/callback',
      'http://127.0.0.1.evil.example/callback',
      'http://localhost.evil.example/callback',
      // Userinfo masking a non-loopback host: `hostname` is evil.example, so
      // reading `hostname` (never `host` or the raw string) rejects it.
      'http://localhost@evil.example/callback',
      // Anchoring matters: a prefix test on `127.` would accept this.
      'http://127.0.0.1.evil.example/callback',
      // 0.0.0.0 binds every interface and is not loopback.
      'http://0/callback',
    ])('rejects %s', (redirectUri) => {
      expect(findRedirectUriRejection({ redirect_uris: [redirectUri] })).toMatchObject({
        error: 'invalid_redirect_uri',
      });
    });

    it('rejects when only one entry of several is non-conformant', () => {
      const rejection = findRedirectUriRejection({
        redirect_uris: ['https://good.example/cb', 'http://evil.example/cb'],
      });

      expect(rejection).toMatchObject({ error: 'invalid_redirect_uri' });
    });

    it('never echoes the submitted URI back to the client', () => {
      const rejection = findRedirectUriRejection({
        redirect_uris: ['http://evil.example/callback?secret=leaked'],
      });

      expect(rejection?.description).not.toContain('evil.example');
      expect(rejection?.description).not.toContain('leaked');
    });
  });

  describe('refusal stays scoped to the one obliged case', () => {
    // ADR-115's advertised-AS exception permits refusing only what a cited
    // clause obliges and the upstream demonstrably does not, and forbids
    // scheme preferences. Non-http schemes carry neither, so they pass
    // through to the upstream authorisation server unrefused — even ones we
    // would prefer to reject on general principle.
    it.each(['javascript:alert(1)', 'data:text/html,<script></script>', 'file:///etc/passwd'])(
      'forwards %s rather than refusing beyond the cited obligation',
      (redirectUri) => {
        expect(findRedirectUriRejection({ redirect_uris: [redirectUri] })).toBeUndefined();
      },
    );

    it('forwards an https redirect_uri carrying userinfo', () => {
      expect(
        findRedirectUriRejection({ redirect_uris: ['https://user@client.example/cb'] }),
      ).toBeUndefined();
    });
  });

  describe('unclassifiable values fail closed', () => {
    it('rejects a redirect_uris value that is not an array', () => {
      // Iterating only arrays would let a bare string skip validation
      // entirely and reach an upstream that does not validate it.
      expect(findRedirectUriRejection({ redirect_uris: 'http://evil.example/cb' })).toMatchObject({
        error: 'invalid_client_metadata',
      });
    });

    it('rejects an array entry that is not a string', () => {
      expect(findRedirectUriRejection({ redirect_uris: [42] })).toMatchObject({
        error: 'invalid_redirect_uri',
      });
    });

    it.each(['not a url', '', '//localhost/cb', 'http://127.0.0.1:65536/cb'])(
      'rejects the unparseable value %s',
      (redirectUri) => {
        expect(findRedirectUriRejection({ redirect_uris: [redirectUri] })).toMatchObject({
          error: 'invalid_redirect_uri',
        });
      },
    );
  });

  describe('obfuscated loopback forms are canonicalised by the parser', () => {
    // The WHATWG parser normalises these to 127.0.0.1 before comparison,
    // so they are accepted rather than treated as novel hosts.
    it.each([
      'http://127.0.0.1/cb',
      'http://127.1/cb',
      'http://2130706433/cb',
      'http://0x7f000001/cb',
    ])('accepts the canonicalising form %s', (redirectUri) => {
      expect(findRedirectUriRejection({ redirect_uris: [redirectUri] })).toBeUndefined();
    });
  });
});
