/**
 * Unit tests for the explain tool's result builder (D3).
 *
 * Behaviour under test: `buildExplainToolResult` serves the effort-orientation
 * body in the ADR-058 dual shape — both content slots (a human-readable summary
 * and the JSON-encoded body) AND `structuredContent`. The body is compared to
 * the imported `EXPLAIN_ORIENTATION_BODY` constant in every slot — never
 * grepped for prose — so the test describes the serving behaviour, not the
 * content (the curriculum / volatility / compliance firewalls are held by
 * construction and PR review, never by tests; see the plan's test-doctrine
 * correction).
 */

import { describe, it, expect } from 'vitest';
import { buildExplainToolResult } from './explain-tool.js';
import { EXPLAIN_ORIENTATION_BODY } from '../generated/explain-content.js';

describe('buildExplainToolResult (unit)', () => {
  it('serves the orientation body in both content slots (ADR-058 dual shape), as a success result', () => {
    const result = buildExplainToolResult();

    // Two content items: a human-readable summary, then the JSON body for
    // backwards-compatible readers.
    expect(result.content).toHaveLength(2);

    const [summary, jsonBody] = result.content;
    expect(summary).toHaveProperty('type', 'text');
    // content[0] (the summary) carries human-readable lead-in text.
    expect(summary.type === 'text' ? summary.text.length : 0).toBeGreaterThan(0);

    // content[1] (the JSON body) carries the committed orientation body.
    expect(jsonBody).toHaveProperty('type', 'text');
    const parsed: unknown = JSON.parse(jsonBody.type === 'text' ? jsonBody.text : '');
    expect(parsed).toEqual({ orientation: EXPLAIN_ORIENTATION_BODY });

    // The orientation is content, never an error.
    expect(result.isError).not.toBe(true);
  });

  it('exposes the committed orientation body in structuredContent for reasoning clients', () => {
    const result = buildExplainToolResult();

    expect(result.structuredContent).toHaveProperty('orientation', EXPLAIN_ORIENTATION_BODY);
  });
});
