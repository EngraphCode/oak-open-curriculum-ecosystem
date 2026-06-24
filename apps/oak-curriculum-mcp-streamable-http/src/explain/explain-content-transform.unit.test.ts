/**
 * Unit tests for the explain effort-orientation content transformer (WS-B, D1.1).
 *
 * The transformer projects the explain lens onto a self-contained body for a
 * remote MCP client: it bakes the lens BEHAVIOUR SHELL (from the canonical) plus
 * a stable EFFORT-OVERVIEW (from README/VISION), behind two firewalls:
 *
 *   - curriculum DOMAIN firewall — describe the effort, never describe curriculum
 *     structure/content; naming curriculum as what the effort SERVES is allowed.
 *   - volatility firewall — exclude every point-in-time status/lifecycle claim
 *     (alpha phase, "as of <month>", live counts, deployment URLs), not only the
 *     live progress report.
 *
 * These tests describe the OUTPUT properties (the system state), not the
 * transformer's internal structure. Pure function; no IO, no global clock —
 * `lastModified` is passed in. The real-content drift backstop lives in D1.2
 * against the committed generated artefact.
 *
 * @see .agent/plans/sdk-and-mcp-enhancements/active/explain-orientation-mcp-surface.plan.md (D1.1)
 */

import { describe, it, expect } from 'vitest';
import { transformExplainContent } from './explain-content-transform.js';

// --- Representative source fixtures -----------------------------------------
// Each fixture carries both the elements that MUST be retained and the hazards
// that MUST be firewalled, so the assertions exercise both directions.

const CANONICAL_FIXTURE = `---
name: explain
---

# Explain — the orientation lens

## The Front Door (discernment contract)

Greet warmly. Discern adaptively, in at most three conversational questions —
never a menu. The routing model below is private.

## The Three Delivery Modes

The modes form an escalation ladder — specific → overview → tour.

### Specific answer
### Area overview
### Guided tour

## Router Principle

Every fact is read from the live documents below at answer time.

| Source document | What it holds |
| --- | --- |
| \`README.md\` | Audience routing |
| \`.agent/plans/high-level-plan.md\` | Live delivery roadmap |

Read the file at \`.agent/HUMANS.md\` and resolve file://paths live.

## Honesty Invariants

Distinguish what exists from what is planned. This repo is one of Oak's AI
efforts, not the whole of how Oak does AI.

## Access-Aware Fork (teammate vs external visitor)

Ask whether they are joining the Oak team or exploring from outside only when it
changes what you would offer.

## Platform Adapters

Generated thin pointers — do not hand-edit.
`;

const README_FIXTURE = `# Oak Open Curriculum Ecosystem

**Current status: Invite-Only Alpha** — the alpha MCP app server is live at
\`curriculum-mcp-alpha.oaknational.dev\`.

## What This Repo Provides

Oak makes a high-quality curriculum freely available, delivered into the
third-party AI assistants teachers already use. Three value-streams: schools,
teachers, and the wider ecosystem.

## Data Sources

The curriculum is organised into key stages 1 to 4, with subjects broken into
units and lessons, each fully sequenced.

## MCP Server Capabilities

37 curriculum tools (24 generated plus 13 aggregated) covering search and browse.

## Engineering Practice

As of February 2026, every line of code has been written by agents under a
gated, reviewer-backed practice.
`;

const VISION_FIXTURE = `---
status: active
last_reviewed: 2026-06-20
---

# Vision

We are changing how Oak's curriculum reaches teachers: putting it where they
already work. Why it matters: better-supported teachers, less workload.
`;

const LAST_MODIFIED = '2026-06-24T10:04:00Z';

function build(): string {
  return transformExplainContent({
    canonical: CANONICAL_FIXTURE,
    readme: README_FIXTURE,
    vision: VISION_FIXTURE,
    lastModified: LAST_MODIFIED,
  });
}

describe('transformExplainContent', () => {
  describe('(a) no filesystem / repo-path coupling', () => {
    it('strips file:// references, repo paths, and "read the file" directives', () => {
      const body = build();
      expect(body).not.toContain('file://');
      expect(body).not.toContain('.agent/');
      expect(body).not.toContain('README.md');
      expect(body.toLowerCase()).not.toContain('read the file');
    });
  });

  describe('(b) retains the behaviour shell', () => {
    it('keeps the discernment contract, the three modes, escalation ladder, honesty, and access-aware fork', () => {
      const body = build();
      expect(body.toLowerCase()).toContain('at most three');
      expect(body.toLowerCase()).toContain('never a menu');
      expect(body.toLowerCase()).toContain('specific');
      expect(body.toLowerCase()).toContain('overview');
      expect(body.toLowerCase()).toContain('tour');
      expect(body.toLowerCase()).toContain('escalation ladder');
      expect(body.toLowerCase()).toContain('exists');
      expect(body.toLowerCase()).toContain('planned');
      expect(body.toLowerCase()).toContain('teammate');
    });
  });

  describe('(c) carries the stable effort-overview, excludes restated invariants', () => {
    it('keeps purpose / why-it-matters and names curriculum only as what the effort serves', () => {
      const body = build();
      expect(body.toLowerCase()).toContain('freely available');
      expect(body.toLowerCase()).toContain('value-stream');
      expect(body.toLowerCase()).toContain('why it matters');
      // naming curriculum as the thing the effort SERVES is permitted
      expect(body.toLowerCase()).toContain('curriculum');
    });
  });

  describe('(d) curriculum DOMAIN firewall (domain negative, not just tool-name negative)', () => {
    it('does not describe curriculum structure/content', () => {
      const body = build().toLowerCase();
      expect(body).not.toContain('key stages 1 to 4');
      expect(body).not.toContain('units and lessons');
      expect(body).not.toMatch(/organised into key stages/);
    });
    it('does not name curriculum tools or curriculum data surfaces', () => {
      const body = build();
      expect(body).not.toContain('get-curriculum-model');
      expect(body).not.toContain('EEF');
      expect(body).not.toContain('getting-started');
    });
  });

  describe('(e) volatility firewall (broader than the progress report)', () => {
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
