import { describe, expect, it } from 'vitest';

import { buildCatalogue, type DtcgTree } from './token-catalogue';
import { groupByTier } from './token-groups';

/**
 * The grouping is the page's outline, and it is derived rather than
 * curated — so what matters is that it follows the kit's own order and
 * vocabulary instead of imposing one. A curated list would be a second place
 * to keep in step with upstream, which is the failure this shape exists to
 * avoid.
 */

function tree(file: string, tier: 1 | 2 | 3, theme: string | null, data: unknown): DtcgTree {
  return { file, tier, theme, data };
}

describe('groupByTier', () => {
  it('keeps families in the kit’s own declaration order under each tier', () => {
    const catalogue = buildCatalogue([
      tree('semantic.light.json', 2, 'light', {
        text: { primary: { $value: '#000', $type: 'color' } },
        bg: { primary: { $value: '#fff', $type: 'color' } },
      }),
      tree('component.json', 3, null, { btn: { 'min-h': { $value: '48px', $type: 'dimension' } } }),
    ]);
    expect(
      groupByTier(catalogue.tokens).map((group) => group.families.map((family) => family.family)),
    ).toEqual([[], ['text', 'bg'], ['btn']]);
  });

  it('gathers every token of a family under one heading', () => {
    const catalogue = buildCatalogue([
      tree('semantic.light.json', 2, 'light', {
        text: {
          primary: { $value: '#000', $type: 'color' },
          subdued: { $value: '#555', $type: 'color' },
        },
      }),
    ]);
    const [, roles] = groupByTier(catalogue.tokens);
    expect(roles?.families[0]?.tokens.map((token) => token.name)).toEqual([
      '--text-primary',
      '--text-subdued',
    ]);
  });

  it('returns all three tiers even when a tier has nothing in it', () => {
    expect(groupByTier([]).map((group) => group.tier)).toEqual([1, 2, 3]);
  });
});

describe('groupByTier across tiers', () => {
  it('sends a family declared in two tiers to the tier that declared each token', () => {
    // --border-solid-* is a tier-1 scale and --border-primary a tier-2
    // role: one family name, two homes, and the page's section ids depend
    // on the split staying real.
    const catalogue = buildCatalogue([
      tree('primitives.json', 1, null, {
        border: { 'solid-m': { $value: '2px', $type: 'dimension' } },
      }),
      tree('semantic.light.json', 2, 'light', {
        border: { primary: { $value: '#000', $type: 'color' } },
      }),
    ]);
    const [primitives, roles] = groupByTier(catalogue.tokens);
    expect(primitives?.families[0]?.tokens.map((token) => token.name)).toEqual([
      '--border-solid-m',
    ]);
    expect(roles?.families[0]?.tokens.map((token) => token.name)).toEqual(['--border-primary']);
  });
});
