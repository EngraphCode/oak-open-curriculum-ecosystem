/**
 * Unit tests for the curated effort-overview constant (WS-B, D2 — Option A).
 *
 * The constant is hand-authored, so its firewall compliance is its OWN tested property
 * (it is not enforced by an extraction pipeline any more). These tests describe the
 * constant's required state: effort-domain only, no point-in-time status, no fs-coupling.
 * The drift-guard (effort-source-contract.ts) keeps it aligned to the README/VISION source;
 * these tests keep it compliant.
 */

import { describe, it, expect } from 'vitest';
import { EXPLAIN_EFFORT_OVERVIEW } from './effort-overview.js';

describe('EXPLAIN_EFFORT_OVERVIEW — volatility firewall', () => {
  it('carries no "as of <month> <year>" dateline', () => {
    expect(EXPLAIN_EFFORT_OVERVIEW).not.toMatch(/\bas of\s+\w+\s+\d{4}/i);
  });

  it('carries no alpha-phase banner, live tool count, or deployment URL', () => {
    expect(EXPLAIN_EFFORT_OVERVIEW).not.toContain('Invite-Only Alpha');
    expect(EXPLAIN_EFFORT_OVERVIEW).not.toMatch(/\d+\s+curriculum tools/i);
    expect(EXPLAIN_EFFORT_OVERVIEW).not.toMatch(/[\w-]+\.oaknational\.dev/);
  });

  it('marks exists-vs-planned inline rather than dating it', () => {
    expect(EXPLAIN_EFFORT_OVERVIEW.toLowerCase()).toContain('python to follow');
  });
});

describe('EXPLAIN_EFFORT_OVERVIEW — curriculum domain firewall', () => {
  it('does not describe curriculum structure', () => {
    const body = EXPLAIN_EFFORT_OVERVIEW.toLowerCase();
    expect(body).not.toContain('key stages');
    expect(body).not.toContain('units and lessons');
    expect(body).not.toContain('subjects, units');
  });

  it('does not name curriculum tools or route to curriculum surfaces', () => {
    expect(EXPLAIN_EFFORT_OVERVIEW).not.toContain('get-curriculum-model');
    expect(EXPLAIN_EFFORT_OVERVIEW).not.toContain('getting-started');
  });

  it('names curriculum as what the effort serves (the permitted side of the domain negative)', () => {
    expect(EXPLAIN_EFFORT_OVERVIEW.toLowerCase()).toContain('curriculum');
  });
});

describe('EXPLAIN_EFFORT_OVERVIEW — fs-coupling (a remote client has no repo)', () => {
  it('references no filesystem path or markdown link target', () => {
    expect(EXPLAIN_EFFORT_OVERVIEW).not.toContain('file://');
    expect(EXPLAIN_EFFORT_OVERVIEW).not.toContain('.agent/');
    expect(EXPLAIN_EFFORT_OVERVIEW).not.toContain('](');
  });
});

describe('EXPLAIN_EFFORT_OVERVIEW — effort-domain content present', () => {
  it('carries purpose, the agent-first machinery, and how to engage', () => {
    const body = EXPLAIN_EFFORT_OVERVIEW.toLowerCase();
    expect(body).toContain('mission');
    expect(body).toContain('agent-first');
    expect(body).toContain('how to engage');
  });
});
