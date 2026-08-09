/**
 * Holds the page's design-system references to the design system itself.
 *
 * @remarks
 * These are the two values the page cannot express as a token at its point of
 * use, so they are the two places it can drift away from the system without
 * anything going red. Each is pinned against the real package here, rather
 * than trusted to a comment.
 *
 * Lives beside the copy-manifest tests because it needs the same real IO for
 * the same reason (the `no-real-io-in-tests` rule's structural allowlist):
 * the subject is a value copied OUT of the package, and a fixture would
 * assert the copy against itself.
 *
 * @packageDocumentation
 */

import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { OAK_DS_PUBLIC_DIRNAME, ROUTED_ASSET_BASE } from '../src/app/static-asset-paths.js';
import { OAK_DS_BASE, OAK_MINT } from '../src/landing-page/components/design-system-refs.js';
import { resolveOakDsPackageRoot } from './copy-oak-ds.js';
import { readPackageText } from './test-helpers/oak-ds-fixtures.js';

/**
 * The mint token at its known DTCG address — a throw-guard parse, never a
 * search: a moved or renamed token fails here loudly instead of a DFS
 * returning `undefined` that reads the same as real drift.
 */
const PALETTE_MINT = z
  .object({
    oak: z.object({
      color: z.object({
        mint: z.object({ $value: z.string() }).loose(),
      }),
    }),
  })
  .loose();

describe('design-system references', () => {
  it('serves the design system from the directory the copy step publishes', () => {
    // The URL prefix in the markup and the directory the build writes are one
    // decision. Split them and the page 404s every asset with a green suite.
    //
    // Since MCP-509 the prefix carries a third participant: the routed base the
    // canonical host actually forwards to this app. All three are now one
    // decision, so this assertion composes them rather than naming a literal.
    expect(OAK_DS_BASE).toBe(`${ROUTED_ASSET_BASE}/${OAK_DS_PUBLIC_DIRNAME}`);
  });

  it('pins the theme-colour literal to the design system’s mint token', async () => {
    // <meta> resolves no var(), so this colour has to be literal in the markup.
    // That makes it the page's only un-tokenised colour, and the one value a
    // palette change would leave stale with nothing to catch it.
    const palette = await readPackageText(resolveOakDsPackageRoot(), 'dtcg/palette.json');
    const mint = PALETTE_MINT.parse(JSON.parse(palette));

    expect(mint.oak.color.mint.$value).toBe(OAK_MINT);
  });
});
