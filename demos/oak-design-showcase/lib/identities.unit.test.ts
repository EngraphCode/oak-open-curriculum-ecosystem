import { typeSafeKeys, typeSafeValues } from '@oaknational/type-helpers';
import { describe, expect, it } from 'vitest';

import { IDENTITIES } from '../components/useIdentity';

import { targetFragmentsFor } from './identities';

describe('targetFragmentsFor on the live identity list', () => {
  const result = targetFragmentsFor(IDENTITIES);

  it('maps every live identity to a target-state fragment', () => {
    expect(result.ok ? undefined : result.error).toBeUndefined();
    if (result.ok) {
      expect(typeSafeKeys(result.value)).toHaveLength(IDENTITIES.length);
      expect(typeSafeValues(result.value).toSorted((a, b) => a.localeCompare(b))).toStrictEqual([
        'emc2',
        'oak',
        'pds',
      ]);
    }
  });

  it('maps the renamed identities by name and the pending one to pds', () => {
    // The pending slug is reached through the imported list, never written
    // here — the identity-naming ratchet bars the legacy literal in any new
    // tracked file.
    const pending = IDENTITIES.find((slug) => slug !== 'oak' && slug !== 'creature');

    expect(result.ok ? undefined : result.error).toBeUndefined();
    expect(pending).toBeDefined();
    if (result.ok && pending !== undefined) {
      expect(result.value.oak).toBe('oak');
      expect(result.value.creature).toBe('emc2');
      expect(result.value[pending]).toBe('pds');
    }
  });
});

describe('targetFragmentsFor on synthetic lists', () => {
  it('fails loud when no identity is pending a rename', () => {
    const result = targetFragmentsFor(['oak', 'creature']);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('exactly one');
    }
  });

  it('fails loud when more than one identity is pending — a later addition must not silently collide onto pds', () => {
    const result = targetFragmentsFor(['oak', 'creature', 'aurora', 'borealis']);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('exactly one');
    }
  });
});
