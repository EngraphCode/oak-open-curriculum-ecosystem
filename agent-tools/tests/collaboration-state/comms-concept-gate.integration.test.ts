import { describe, expect, it } from 'vitest';

import {
  checkCommsTextAgainstConceptGates,
  loadCommsConceptGateBlocks,
} from '../../src/collaboration-state/comms-concept-gate.js';

/**
 * SSOT proof: the comms concept gate reads the SAME trip-list and regex
 * definitions the Edit/Write hook enforces — `.agent/hooks/policy.json` is
 * the single source of truth and this module never restates a list
 * (consolidate-at-second-consumer: comms is the second consumer of the
 * scoped-block machinery). These tests load the LIVE policy file, so a
 * policy edit (adding or removing a phrase) propagates to the comms gate
 * with no code change — and a break here means the policy shape moved.
 */

describe('comms concept gate against the live hook policy', () => {
  it('loads exactly the ratified concepts from the live policy', async () => {
    const blocks = await loadCommsConceptGateBlocks();

    expect(blocks.map((group) => group.concept).toSorted((a, b) => a.localeCompare(b))).toEqual([
      'expediency-hedging',
      'indefinite-deferral',
    ]);
  });

  it('fires the live hedging trip-list on a comms body', async () => {
    const blocks = await loadCommsConceptGateBlocks();

    const result = checkCommsTextAgainstConceptGates({
      title: 'coordination',
      body: 'granting a carve-out for the config trio',
      tags: [],
      groups: blocks,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.group.concept).toBe('expediency-hedging');
      expect(result.error.group.citation).toContain('PDR-044');
    }
  });

  it('fires the live indefinite-deferral family on a comms body', async () => {
    const blocks = await loadCommsConceptGateBlocks();

    const result = checkCommsTextAgainstConceptGates({
      title: 'status',
      body: 'that item is parked until someone picks it up',
      tags: [],
      groups: blocks,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.group.concept).toBe('indefinite-deferral');
    }
  });

  it('never false-positives on agent display names containing family substrings', async () => {
    const blocks = await loadCommsConceptGateBlocks();

    const result = checkCommsTextAgainstConceptGates({
      title: 'Team start report: Sparking Melting Magma',
      body: 'Sparking Melting Magma registers on the thread; boundary follows.',
      tags: [],
      groups: blocks,
    });

    expect(result.ok).toBe(true);
  });
});
