/**
 * Unit tests for the explain effort-orientation assembler (WS-B — Option A shape).
 *
 * The assembler composes the freshness header, the curated behaviour shell, and the curated
 * effort overview. The firewall properties (volatility / curriculum / fs-coupling) are held
 * BY CONSTRUCTION in the curated constants and are tested there (effort-overview.unit.test.ts)
 * and on the generated body (explain-content-generated.unit.test.ts); this file tests the
 * ASSEMBLY — the system state the assembler produces — not extraction (there is none).
 *
 * @see .agent/plans/sdk-and-mcp-enhancements/active/explain-orientation-mcp-surface.plan.md (D2)
 */

import { describe, it, expect } from 'vitest';
import { transformExplainContent } from './explain-content-transform.js';
import { EXPLAIN_BEHAVIOUR_SHELL } from './behaviour-shell.js';
import { EXPLAIN_EFFORT_OVERVIEW } from './effort-overview.js';

const LAST_MODIFIED = '2026-06-24T10:04:13+01:00';

describe('transformExplainContent (assembler)', () => {
  it('assembles the freshness header, the curated behaviour shell, and the curated effort overview', () => {
    const body = transformExplainContent({ lastModified: LAST_MODIFIED });
    expect(body).toContain('# Orienting someone to the Oak effort');
    expect(body).toContain(LAST_MODIFIED);
    expect(body).toContain(EXPLAIN_BEHAVIOUR_SHELL);
    expect(body).toContain(EXPLAIN_EFFORT_OVERVIEW);
  });

  it('orders the behaviour shell before the effort overview', () => {
    const body = transformExplainContent({ lastModified: LAST_MODIFIED });
    expect(body.indexOf(EXPLAIN_BEHAVIOUR_SHELL)).toBeLessThan(
      body.indexOf(EXPLAIN_EFFORT_OVERVIEW),
    );
  });

  it('is deterministic for a given lastModified', () => {
    expect(transformExplainContent({ lastModified: LAST_MODIFIED })).toBe(
      transformExplainContent({ lastModified: LAST_MODIFIED }),
    );
  });

  it('introduces no point-in-time dateline of its own', () => {
    const body = transformExplainContent({ lastModified: LAST_MODIFIED });
    expect(body).not.toMatch(/\bas of\s+\w+\s+\d{4}/i);
  });
});
