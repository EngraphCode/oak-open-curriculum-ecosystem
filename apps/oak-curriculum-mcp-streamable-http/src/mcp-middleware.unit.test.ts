import { describe, it, expect } from 'vitest';

import { selectsHtmlLeg } from './mcp-middleware.js';

/**
 * Unit coverage for the negotiation decision (MCP-122 layer-a proof).
 * The behavioural surface — serving, headers, guard and limiter order,
 * HEAD bodies, and the untouched protocol legs — is proven end-to-end in
 * mcp-html-negotiation.integration.test.ts against the real app.
 */
describe('selectsHtmlLeg', () => {
  it('U1: GET with text/event-stream takes the protocol leg', () => {
    expect(selectsHtmlLeg('GET', 'text/event-stream')).toBe(false);
  });

  it('U2: GET with text/html selects the HTML leg', () => {
    expect(selectsHtmlLeg('GET', 'text/html')).toBe(true);
  });

  it('U2a: GET with application/xhtml+xml selects the HTML leg', () => {
    expect(selectsHtmlLeg('GET', 'application/xhtml+xml')).toBe(true);
  });

  it('U3: GET with both html and event-stream tokens prefers the protocol leg', () => {
    expect(selectsHtmlLeg('GET', 'text/html, text/event-stream')).toBe(false);
    expect(selectsHtmlLeg('GET', 'text/event-stream, text/html')).toBe(false);
  });

  it('U4: a browser-realistic Accept selects the HTML leg', () => {
    expect(
      selectsHtmlLeg('GET', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'),
    ).toBe(true);
  });

  it('U5: */* alone never selects HTML', () => {
    expect(selectsHtmlLeg('GET', '*/*')).toBe(false);
  });

  it('U6: an absent Accept never selects HTML', () => {
    expect(selectsHtmlLeg('GET', undefined)).toBe(false);
    expect(selectsHtmlLeg('GET', '')).toBe(false);
  });

  it('U7: malformed Accept values never throw and never select HTML', () => {
    for (const accept of [';;q=,', 'text/', ',,,', ';', '   ', 'q=0.9']) {
      expect(selectsHtmlLeg('GET', accept)).toBe(false);
    }
  });

  it('U8: non-GET/HEAD methods never select HTML', () => {
    for (const method of ['POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']) {
      expect(selectsHtmlLeg(method, 'text/html')).toBe(false);
    }
  });

  it('U10: HEAD mirrors GET negotiation', () => {
    expect(selectsHtmlLeg('HEAD', 'text/html')).toBe(true);
    expect(selectsHtmlLeg('HEAD', 'text/event-stream')).toBe(false);
    expect(selectsHtmlLeg('HEAD', '*/*')).toBe(false);
  });

  it('matches tokens case-insensitively and ignores media-range parameters', () => {
    expect(selectsHtmlLeg('GET', 'TEXT/HTML;q=0.9')).toBe(true);
    expect(selectsHtmlLeg('GET', 'Text/Event-Stream')).toBe(false);
  });
});
