/**
 * Unit tests for the effort-source drift-guard (WS-B, D2 — Option A).
 *
 * Mirrors canonical-behaviour-contract.unit.test.ts: the fingerprint must be deterministic,
 * must change when the effort source it anchors changes, and must ignore README sections
 * outside the effort allow-list. This is what makes single-sourcing a TESTED relationship —
 * a source change can only land loudly (the generation step asserts live == pinned).
 */

import { describe, it, expect } from 'vitest';
import { fingerprintEffortSource } from './effort-source-contract.js';

const README = `# Repo

## What This Repo Provides

Three capabilities, powered by open data.

## Engineering Practice

Agent-first, people in the lead.

## Quick Start

Run the installer — outside the effort allow-list.
`;

const VISION = `---
status: active
last_reviewed: 2026-06-20
---

# Vision

Putting the curriculum where teachers already work. Why it matters: less workload.
`;

describe('fingerprintEffortSource', () => {
  it('is deterministic for the same source', () => {
    expect(fingerprintEffortSource(README, VISION)).toBe(fingerprintEffortSource(README, VISION));
  });

  it('changes when a README effort section changes', () => {
    const changed = README.replace('Three capabilities', 'Four capabilities');
    expect(fingerprintEffortSource(changed, VISION)).not.toBe(
      fingerprintEffortSource(README, VISION),
    );
  });

  it('changes when the VISION body changes', () => {
    const changed = VISION.replace('less workload', 'a different reason');
    expect(fingerprintEffortSource(README, changed)).not.toBe(
      fingerprintEffortSource(README, VISION),
    );
  });

  it('ignores README sections outside the effort allow-list', () => {
    const changed = README.replace('Run the installer', 'Run a different installer');
    expect(fingerprintEffortSource(changed, VISION)).toBe(fingerprintEffortSource(README, VISION));
  });

  it('ignores the VISION frontmatter and H1 title', () => {
    const changed = VISION.replace(
      'last_reviewed: 2026-06-20',
      'last_reviewed: 2027-01-01',
    ).replace('# Vision', '# Vision (renamed)');
    expect(fingerprintEffortSource(README, changed)).toBe(fingerprintEffortSource(README, VISION));
  });
});
