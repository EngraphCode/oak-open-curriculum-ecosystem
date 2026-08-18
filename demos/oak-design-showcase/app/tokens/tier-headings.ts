import type { TokenTier } from './token-catalogue';

/**
 * What each tier IS, in the system's own words (`colors_and_type.css`
 * header, README §Tokens).
 *
 * The note beside each title is the CONTRACT that comes with the tier, not
 * a description of it. A reader arriving at this page is usually deciding
 * whether they may use a token they have found, and tier 1's rule — literals
 * live here, reference them only inside token definitions — is the one that
 * gets broken, so it is stated where the tokens are rather than left in a
 * document somewhere else.
 */
export const TIER_HEADINGS: Readonly<Record<TokenTier, { title: string; note: string }>> = {
  1: {
    title: 'Tier 1 — primitives',
    note: 'Literal values live only here. Reference a primitive inside a token definition, or for deliberately fixed art — never at the point of use.',
  },
  2: {
    title: 'Tier 2 — roles',
    note: 'Themable meaning, composed from primitives. This is the public surface: build interfaces out of these.',
  },
  3: {
    title: 'Tier 3 — component tokens',
    note: 'Per-part decisions composed from roles and scales. The class library and the compiled React components consume the same ones, so the two paths cannot drift.',
  },
};

/** The id of a family's section, shared by the heading, the jump link and
 *  the table that the heading names. */
export function sectionId(tier: TokenTier, family: string): string {
  return `tokens-t${String(tier)}-${family}`;
}
