/**
 * Real-content backstop for the generated explain body (WS-B, D2).
 *
 * The D1.1 transformer unit tests assert the firewalls against a FIXTURE. This test
 * asserts them against the COMMITTED GENERATED BODY built from the real README.md /
 * VISION.md — the real-content backstop the D1.1 header deferred to "D1.2 against the
 * committed generated artefact". The artefact was itself deferred to co-land with D2,
 * so this is its first home.
 *
 * It exists because the fixture was more benign than reality: the real README
 * hard-wraps the "as of <month>" dateline across a newline (slipping a literal-space
 * regex), and its "What This Repo Provides" section is a capability table plus
 * denylisted curriculum subsections with no coherent effort prose, leaving dangling
 * connective fragments. These assertions describe the SHIPPED body's required state.
 */

import { describe, it, expect } from 'vitest';
import { EXPLAIN_ORIENTATION_BODY } from '../generated/explain-content.js';

describe('generated explain body — real-content firewall backstop', () => {
  it('carries no point-in-time "as of <month> <year>" dateline, even across a line wrap', () => {
    // The real README hard-wraps "As of\nFebruary 2026" — the firewall must be
    // newline-tolerant (\s spans the wrap), unlike a literal-space regex.
    expect(EXPLAIN_ORIENTATION_BODY).not.toMatch(/\bas of\s+\w+\s+\d{4}/i);
  });

  it('carries no other point-in-time status / lifecycle claim from the real sources', () => {
    expect(EXPLAIN_ORIENTATION_BODY).not.toContain('Invite-Only Alpha');
    expect(EXPLAIN_ORIENTATION_BODY).not.toMatch(/\d+\s+curriculum tools/i);
    expect(EXPLAIN_ORIENTATION_BODY).not.toMatch(/[\w-]+\.oaknational\.dev/);
  });

  it('contains no dangling connective fragment left by stripped subsections', () => {
    // The real README "What This Repo Provides" is a table + denylisted ### subsections;
    // mechanical extraction leaves an orphaned trailer whose referents were stripped.
    expect(EXPLAIN_ORIENTATION_BODY).not.toContain('are the pillars');
  });

  it('retains the curated behaviour shell (discernment, modes, honesty, access-aware)', () => {
    const body = EXPLAIN_ORIENTATION_BODY.toLowerCase();
    expect(body).toContain('at most three');
    expect(body).toContain('never a menu');
    expect(body).toContain('escalation ladder');
    expect(body).toContain('adapt silently');
  });

  it('does not describe curriculum structure or name curriculum tools (separation firewall)', () => {
    const body = EXPLAIN_ORIENTATION_BODY.toLowerCase();
    expect(body).not.toContain('key stages 1 to 4');
    expect(body).not.toContain('units and lessons');
    expect(body).not.toContain('get-curriculum-model');
  });

  it('references no filesystem path (a remote client has no repo)', () => {
    expect(EXPLAIN_ORIENTATION_BODY).not.toContain('file://');
    expect(EXPLAIN_ORIENTATION_BODY).not.toContain('.agent/');
    expect(EXPLAIN_ORIENTATION_BODY).not.toContain('](');
  });
});
