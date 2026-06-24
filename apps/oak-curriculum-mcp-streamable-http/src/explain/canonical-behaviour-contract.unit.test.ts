/**
 * Unit tests for the drift-guard fingerprint mechanism (WS-B, D1).
 *
 * These test the FUNCTION's properties on fixtures (no IO): the fingerprint is
 * deterministic, change-sensitive on the behaviour sections, and blind to
 * non-behaviour sections. The real-canonical assertion (fingerprint === EXPECTED)
 * is enforced at generation time by generate-explain-content.ts — that is where the
 * legitimate file read happens, per the repo's script-based drift convention.
 *
 * @see src/explain/canonical-behaviour-contract.ts
 */

import { describe, it, expect } from 'vitest';
import {
  fingerprintCanonicalBehaviour,
  EXPECTED_CANONICAL_BEHAVIOUR_FINGERPRINT,
} from './canonical-behaviour-contract.js';

const CANONICAL_FIXTURE = `# Explain — the orientation lens

## The Front Door (discernment contract)

Greet warmly; at most three questions; never a menu.

## The Three Delivery Modes

specific → overview → tour.

## Router Principle

Read every fact live from the docs below.

## Honesty Invariants

Distinguish what exists from what is planned.

## Access-Aware Fork (teammate vs external visitor)

Adapt silently.
`;

describe('fingerprintCanonicalBehaviour', () => {
  it('is deterministic for the same input', () => {
    expect(fingerprintCanonicalBehaviour(CANONICAL_FIXTURE)).toBe(
      fingerprintCanonicalBehaviour(CANONICAL_FIXTURE),
    );
  });

  it('changes when a behaviour-contract section changes (drift detected)', () => {
    const before = fingerprintCanonicalBehaviour(CANONICAL_FIXTURE);
    const after = fingerprintCanonicalBehaviour(
      CANONICAL_FIXTURE.replace('at most three questions', 'at most five questions'),
    );
    expect(after).not.toBe(before);
  });

  it('is blind to non-behaviour sections (Router Principle is not part of the contract)', () => {
    const before = fingerprintCanonicalBehaviour(CANONICAL_FIXTURE);
    const after = fingerprintCanonicalBehaviour(
      CANONICAL_FIXTURE.replace(
        'Read every fact live from the docs below.',
        'Totally different routing prose.',
      ),
    );
    expect(after).toBe(before);
  });

  it('pins a stable 64-char hex fingerprint of record', () => {
    expect(EXPECTED_CANONICAL_BEHAVIOUR_FINGERPRINT).toMatch(/^[0-9a-f]{64}$/);
  });
});
