/**
 * Unit tests for the explain effort-orientation content transformer (WS-B, D1.1).
 *
 * The transformer assembles the curated behaviour shell (authored clean) plus a
 * stable effort-overview extracted from README/VISION, behind three firewalls. These
 * tests describe the OUTPUT properties (the system state), not internal structure.
 * Pure function; no IO, no global clock — `lastModified` is passed in. The canonical
 * is NOT an input (the behaviour shell is curated, not extracted); its
 * single-sourcing is verified separately by the drift-guard. The real-content firewall
 * backstop lives in D1.2 against the committed generated artefact.
 *
 * @see .agent/plans/sdk-and-mcp-enhancements/active/explain-orientation-mcp-surface.plan.md (D1.1)
 */

import { describe, it, expect } from 'vitest';
import { transformExplainContent } from './explain-content-transform.js';

// README fixture: carries effort content to keep, plus every hazard class to firewall.
const README_FIXTURE = `# Oak Open Curriculum Ecosystem

**Current status: Invite-Only Alpha** — the alpha MCP app server is live at
\`curriculum-mcp-alpha.oaknational.dev\`.

## What This Repo Provides

Oak makes a high-quality curriculum freely available, delivered into the
third-party AI assistants teachers already use. Three value-streams: schools,
teachers, and the wider ecosystem.

### Data Sources

The curriculum is organised into key stages 1 to 4, with subjects broken into
units and lessons, each fully sequenced.

### MCP Server Capabilities

37 curriculum tools covering search and browse, plus get-curriculum-model and EEF.

## Quick Start

Run \`pnpm install\` then see \`docs/setup.md\`.

## Engineering Practice

As of February 2026, every line of code has been written by agents under a
[gated, reviewer-backed practice](docs/foundation/agentic-engineering-system.md).
`;

const VISION_FIXTURE = `---
status: active
last_reviewed: 2026-06-20
---

# Vision

We are changing how Oak's curriculum reaches teachers: putting it where they
already work. Why it matters: better-supported teachers, less workload.
`;

const LAST_MODIFIED = '2026-06-24T10:04:13+01:00';

function build(): string {
  return transformExplainContent({
    readme: README_FIXTURE,
    vision: VISION_FIXTURE,
    lastModified: LAST_MODIFIED,
  });
}

describe('transformExplainContent', () => {
  describe('(a) no filesystem / repo-path coupling', () => {
    it('strips file://, repo paths, and backtick path tokens', () => {
      const body = build();
      expect(body).not.toContain('file://');
      expect(body).not.toContain('.agent/');
      expect(body).not.toContain('README.md');
      expect(body).not.toContain('docs/setup.md');
    });
    it('delinkifies markdown doc-links — keeps the link text, drops the path', () => {
      const body = build();
      expect(body).toContain('gated, reviewer-backed practice'); // link text retained
      expect(body).not.toContain('docs/foundation'); // link target dropped
      expect(body).not.toContain('](');
    });
  });

  describe('(b) carries the curated behaviour shell', () => {
    it('includes the discernment contract, the three modes, escalation, honesty, access-aware', () => {
      const body = build().toLowerCase();
      expect(body).toContain('at most three');
      expect(body).toContain('never a menu');
      expect(body).toContain('specific');
      expect(body).toContain('overview');
      expect(body).toContain('tour');
      expect(body).toContain('escalation ladder');
      expect(body).toContain('exists');
      expect(body).toContain('planned');
      expect(body).toContain('teammate');
    });
  });

  describe('(c) carries the stable effort-overview', () => {
    it('keeps purpose / why-it-matters and names curriculum only as what the effort serves', () => {
      const body = build().toLowerCase();
      expect(body).toContain('freely available');
      expect(body).toContain('value-stream');
      expect(body).toContain('why it matters');
      expect(body).toContain('curriculum'); // permitted: what the effort serves
    });
  });

  describe('(d) curriculum DOMAIN firewall', () => {
    it('does not describe curriculum structure/content', () => {
      const body = build().toLowerCase();
      expect(body).not.toContain('key stages 1 to 4');
      expect(body).not.toContain('units and lessons');
    });
    it('does not name curriculum tools or data surfaces', () => {
      const body = build();
      expect(body).not.toContain('get-curriculum-model');
      expect(body).not.toContain('EEF');
    });
  });

  describe('(e) volatility firewall', () => {
    it('excludes point-in-time status, lifecycle, counts, and deployment URLs', () => {
      const body = build();
      expect(body).not.toContain('Invite-Only Alpha');
      expect(body).not.toContain('curriculum-mcp-alpha.oaknational.dev');
      expect(body).not.toMatch(/as of \w+ \d{4}/i);
      expect(body).not.toMatch(/\d+\s+curriculum tools/i);
    });
  });

  describe('(f) carries the passed-in lastModified', () => {
    it('embeds the lastModified value (no global/build clock)', () => {
      expect(build()).toContain(LAST_MODIFIED);
    });
  });
});
