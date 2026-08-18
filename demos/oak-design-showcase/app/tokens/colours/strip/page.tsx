import type { ReactElement } from 'react';

import { BASE_IDENTITY, resolveIdentity } from '../../../../components/useIdentity';
import { loadCatalogue } from '../../token-source';
import { TOKEN_VARS_HREF } from '../../token-vars';
import { colourTokens, resolveMatrixTheme } from '../colour-matrix';

import { ColourStripRows } from './ColourStripRows';
import { StripThemeApplier } from './StripThemeApplier';

import './strip.css';

/**
 * One cell of the colour matrix: the whole colour surface as it resolves
 * under exactly one identity and one theme.
 *
 * A pure exhibit — no controls, no chrome, no navigation. It is meant to be
 * framed fifteen times by the matrix page, and anything interactive here
 * would be a tab stop multiplied by fifteen for no reader's benefit. Its
 * only heading is a visually-hidden one, because the frame's own `title`
 * is what a person meets first.
 *
 * IDENTITY IS SERVER-SIDE, exactly as the specimen route does it: the sheet
 * link is rendered into the HTML from `?brand=`, so the cell is correct at
 * first paint rather than corrected after one. There is no binder here and
 * nothing to swap — a cell is one identity for its whole life, which is
 * what makes fifteen of them a matrix.
 */
export default async function ColourStripPage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<ReactElement> {
  const params = await searchParams;
  const identity = resolveIdentity(params['brand']);
  const theme = resolveMatrixTheme(params['theme']);
  const tokens = colourTokens(loadCatalogue().tokens);

  return (
    <>
      {identity === BASE_IDENTITY ? null : (
        <link rel="stylesheet" data-oak-brand={identity} href={`/brands/${identity}/brand.css`} />
      )}
      {/* The per-token bindings the swatches paint through. */}
      <link rel="stylesheet" href={TOKEN_VARS_HREF} />
      <StripThemeApplier theme={theme} />
      <div className="oak-canvas" data-page="colour-strip" data-identity={identity}>
        <h1 className="oak-visually-hidden">
          Colour tokens — {identity} — {theme}
        </h1>
        <main className="oak-main oak-region" data-region="main">
          <ColourStripRows tokens={tokens} />
        </main>
      </div>
    </>
  );
}
