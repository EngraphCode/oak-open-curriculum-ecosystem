/**
 * Unit tests for the explain effort-orientation assembler.
 *
 * The assembler is a pure composition function. These tests inject TRIVIAL FAKES for the
 * two parts and assert its composition BEHAVIOUR — the freshness header carries the given
 * `lastModified`, the behaviour shell precedes the effort overview, and the output is
 * deterministic. They never assert real prose: what the curated constants say is a content
 * property held by authoring and review, not by this test.
 */

import { describe, it, expect } from 'vitest';
import { transformExplainContent } from './explain-content-transform.js';

const INPUTS = {
  behaviourShell: 'BEHAVIOUR-SHELL-PART',
  effortOverview: 'EFFORT-OVERVIEW-PART',
  lastModified: '2026-06-24T10:04:13+01:00',
} as const;

describe('transformExplainContent (assembler)', () => {
  it('carries the injected lastModified in the freshness header', () => {
    expect(transformExplainContent(INPUTS)).toContain(INPUTS.lastModified);
  });

  it('includes both injected parts', () => {
    const body = transformExplainContent(INPUTS);
    expect(body).toContain(INPUTS.behaviourShell);
    expect(body).toContain(INPUTS.effortOverview);
  });

  it('places the behaviour shell before the effort overview', () => {
    const body = transformExplainContent(INPUTS);
    expect(body.indexOf(INPUTS.behaviourShell)).toBeLessThan(body.indexOf(INPUTS.effortOverview));
  });

  it('is deterministic for the same inputs', () => {
    expect(transformExplainContent(INPUTS)).toBe(transformExplainContent(INPUTS));
  });
});
