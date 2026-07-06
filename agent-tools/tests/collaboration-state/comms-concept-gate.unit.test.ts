import { err, ok } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import { enforceCommsConceptGates } from '../../src/collaboration-state/cli-comms-commands.js';
import {
  COMMS_GATED_CONCEPTS,
  checkCommsTextAgainstConceptGates,
  formatCommsConceptGateRefusal,
  requireCommsGatedBlocks,
  selectCommsGatedBlocks,
} from '../../src/collaboration-state/comms-concept-gate.js';
import type { ScopedContentBlockGroup } from '../../src/hook-policy/types.js';

/**
 * The comms concept gate (owner-ratified 2026-07-02) runs the PDR-044
 * hedging trip-list and the indefinite-deferral regex family over comms
 * event titles and bodies before the event file is written. These tests
 * describe the gate's contract: concept selection from the policy's block
 * set (never a duplicated list), the recursive-exclusion exemption for
 * tagged capture events, uniform title+body coverage, and a Result-typed
 * refusal whose rendering teaches (citation + reappraisal) rather than
 * only refusing.
 */

function block(
  concept: string,
  overrides: Partial<ScopedContentBlockGroup> = {},
): ScopedContentBlockGroup {
  const base: ScopedContentBlockGroup = {
    concept,
    kind: 'literal',
    patterns: ['carve-out'],
    include_paths: ['.agent/plans/'],
    exclude_paths: [],
    citation: 'PDR-044; principles.md §Architectural Excellence Over Expediency',
    reappraisal: 'Describe the coordination directly, without the exception-shape.',
  };
  return { ...base, ...overrides };
}

describe('selectCommsGatedBlocks', () => {
  it('selects exactly the ratified comms-gated concepts from the policy set', () => {
    const groups = [
      block('expediency-hedging'),
      block('sha-in-permanent-doc'),
      block('indefinite-deferral'),
      block('menu-framing'),
      block('machine-local-path'),
    ];

    const selected = selectCommsGatedBlocks(groups);

    expect(selected.map((group) => group.concept)).toEqual([
      'expediency-hedging',
      'indefinite-deferral',
    ]);
    // The exported constant is the same closed set the selection encodes.
    expect(COMMS_GATED_CONCEPTS).toEqual(['expediency-hedging', 'indefinite-deferral']);
  });
});

describe('requireCommsGatedBlocks (fail closed)', () => {
  it('returns the selected gated blocks when every ratified concept is present', () => {
    const result = requireCommsGatedBlocks([
      block('expediency-hedging'),
      block('sha-in-permanent-doc'),
      block('indefinite-deferral'),
    ]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.map((group) => group.concept)).toEqual([
        'expediency-hedging',
        'indefinite-deferral',
      ]);
    }
  });

  it('refuses a policy missing one ratified concept group, naming it', () => {
    // A partial group list would gate one concept and silently wave the other
    // through — enforcement half-disabled with no signal.
    const result = requireCommsGatedBlocks([block('expediency-hedging')]);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('indefinite-deferral');
      expect(result.error).not.toContain('expediency-hedging');
      expect(result.error).toContain('fails closed');
      expect(result.error).toContain('.agent/hooks/policy.json');
    }
  });

  it('refuses an empty group list (policy without scoped_blocks), naming every missing concept', () => {
    const result = requireCommsGatedBlocks([]);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('expediency-hedging');
      expect(result.error).toContain('indefinite-deferral');
    }
  });
});

describe('checkCommsTextAgainstConceptGates', () => {
  const groups = [block('expediency-hedging')];

  it('passes clean coordination text', () => {
    const result = checkCommsTextAgainstConceptGates({
      title: 'scoped area handover for the cycle',
      body: 'boundary adjustment, returns after the cycle',
      tags: [],
      groups,
    });

    expect(result.ok).toBe(true);
  });

  it('refuses with the typed match when the body trips a gated concept', () => {
    const result = checkCommsTextAgainstConceptGates({
      title: 'coordination',
      body: 'proposing a carve-out for this file',
      tags: [],
      groups,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.group.concept).toBe('expediency-hedging');
      expect(result.error.matchedText).toBe('carve-out');
    }
  });

  it('gates the title with the same patterns as the body', () => {
    const result = checkCommsTextAgainstConceptGates({
      title: 'CARVE-OUT granted',
      body: 'clean body',
      tags: [],
      groups,
    });

    expect(result.ok).toBe(false);
  });

  it.each(['failure-mode', 'behaviour-note'])(
    'exempts events tagged %s as capture surfaces (recursive exclusion)',
    (tag) => {
      const result = checkCommsTextAgainstConceptGates({
        title: 'correction',
        body: 'the phrase "carve-out" bred across four agents — stop using it',
        tags: [tag],
        groups,
      });

      expect(result.ok).toBe(true);
    },
  );

  it('gates heartbeat-tagged events like any non-capture event', () => {
    const result = checkCommsTextAgainstConceptGates({
      title: 'Heartbeat: agent — carve-out pending',
      body: 'active',
      tags: ['heartbeat'],
      groups,
    });

    expect(result.ok).toBe(false);
  });
});

describe('enforceCommsConceptGates (CLI write boundary)', () => {
  it('fails the write closed when the loader reports missing concept groups', async () => {
    await expect(
      enforceCommsConceptGates(
        {
          loadCommsConceptGateBlocks: async () =>
            err('comms concept gate: missing indefinite-deferral'),
        },
        { title: 'coordination', body: 'clean body', tags: [] },
      ),
    ).rejects.toThrow('missing indefinite-deferral');
  });

  it('lets clean text through when the loader succeeds', async () => {
    await expect(
      enforceCommsConceptGates(
        { loadCommsConceptGateBlocks: async () => ok([block('expediency-hedging')]) },
        { title: 'coordination', body: 'clean body', tags: [] },
      ),
    ).resolves.toBeUndefined();
  });
});

describe('formatCommsConceptGateRefusal', () => {
  it('renders the teaching payload: concept, matched text, citation, reappraisal, exemption pointer', () => {
    const result = checkCommsTextAgainstConceptGates({
      title: 'coordination',
      body: 'a carve-out here',
      tags: [],
      groups: [block('expediency-hedging')],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      const rendered = formatCommsConceptGateRefusal(result.error);
      expect(rendered).toContain('"carve-out" fires the expediency-hedging block');
      expect(rendered).toContain('Citation: PDR-044');
      expect(rendered).toContain('Reappraisal:');
      expect(rendered).toContain('failure-mode or behaviour-note');
    }
  });
});
