/**
 * Unit tests for `buildOakUnderTheHoodToolResult` (baked-content shape),
 * behaviour-only.
 *
 * These describe the SHAPE the tool returns — the ADR-058 dual shape carrying
 * the orientation body on BOTH channels (summary + markdown body in `content`,
 * the same body in `structuredContent`), with the curriculum firewall held
 * structurally (no `oakContextHint`). The body is asserted by IDENTITY with
 * the generated module, never by prose pins: content CORRECTNESS is proved by
 * the generator's parity gate (`validate-under-the-hood-content`), and a prose
 * pin here would only prove the fixture, not the behaviour.
 */

import { describe, it, expect } from 'vitest';

import { OAK_UNDER_THE_HOOD_ORIENTATION } from '../generated/oak-under-the-hood-content.js';
import { buildOakUnderTheHoodToolResult } from './oak-under-the-hood-tool.js';

describe('buildOakUnderTheHoodToolResult (unit)', () => {
  it('returns a non-error ADR-058 dual shape: the orientation body rides both channels', () => {
    const result = buildOakUnderTheHoodToolResult();

    expect(result.isError).not.toBe(true);
    expect(result.content).toHaveLength(2);
    const body = result.content[1];
    if (body?.type !== 'text') {
      throw new Error('expected the second content block to be a text block');
    }
    expect(result.content[0]?.type).toBe('text');
    expect(body.text).toBe(OAK_UNDER_THE_HOOD_ORIENTATION);
    expect(result.structuredContent?.orientation).toBe(OAK_UNDER_THE_HOOD_ORIENTATION);
  });

  it('carries informational citations only — the pointer shape is gone', () => {
    const result = buildOakUnderTheHoodToolResult();
    const structured = result.structuredContent;

    expect(structured?.repositoryUrl).toMatch(/^https:\/\/github\.com\//);
    expect(Array.isArray(structured?.oakSources)).toBe(true);
    // No fetch-and-follow surface remains (directory policy §2.F, MCP-353).
    expect(structured).not.toHaveProperty('canonicalUrl');
    expect(structured).not.toHaveProperty('trigger');
    expect(result.content.map((block) => block.type)).not.toContain('resource_link');
    expect(JSON.stringify(result)).not.toContain('raw.githubusercontent.com');
  });

  it('does not carry oakContextHint (curriculum firewall, held structurally)', () => {
    const result = buildOakUnderTheHoodToolResult();
    expect(result.structuredContent).not.toHaveProperty('oakContextHint');
  });
});
