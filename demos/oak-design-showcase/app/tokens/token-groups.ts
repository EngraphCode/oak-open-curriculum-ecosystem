import type { CatalogueToken, TokenTier } from './token-catalogue';

/**
 * The catalogue as the page's outline: tiers in order, and within each tier
 * the families in the order the kit declares them.
 *
 * The grouping is DERIVED, never curated. A family added upstream appears on
 * the page with nothing here edited, and a family removed upstream vanishes
 * from it — which is the only way a reference page stays true to a system
 * that is still moving. Family is the first segment of the property name,
 * which is the system's own vocabulary rather than a taxonomy invented for
 * this page.
 */

interface TokenFamily {
  readonly family: string;
  readonly tokens: readonly CatalogueToken[];
}

export interface TokenTierGroup {
  readonly tier: TokenTier;
  readonly families: readonly TokenFamily[];
}

const TIERS: readonly TokenTier[] = [1, 2, 3];

function familiesOf(tokens: readonly CatalogueToken[], tier: TokenTier): readonly TokenFamily[] {
  const families = new Map<string, CatalogueToken[]>();
  for (const token of tokens) {
    if (token.tier === tier) {
      const bucket = families.get(token.family);
      if (bucket === undefined) {
        families.set(token.family, [token]);
      } else {
        bucket.push(token);
      }
    }
  }
  return [...families].map(([family, familyTokens]) => ({ family, tokens: familyTokens }));
}

/** Every tier, each with its families in declaration order. */
export function groupByTier(tokens: readonly CatalogueToken[]): readonly TokenTierGroup[] {
  return TIERS.map((tier) => ({ tier, families: familiesOf(tokens, tier) }));
}
