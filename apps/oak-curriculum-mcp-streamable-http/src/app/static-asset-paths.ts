/**
 * Served-path layout of the build-time asset copies.
 *
 * @remarks
 * Runtime-neutral by design: both the deployed server (`static-content.ts`)
 * and the build-time copier (`build-scripts/copy-oak-ds.ts`) need these
 * names, and the server must not import a build script onto the deploy
 * bundle's graph — the shared constants live here, on the `src/` side of
 * that boundary, and the build script imports downward from it.
 */

/** Directory name the copied design system occupies under the served root. */
export const OAK_DS_PUBLIC_DIRNAME = 'oak-ds';

/** Where the brand-asset copy is published, relative to the served root. */
export const OAK_ASSETS_PUBLIC_DIRNAME = 'oak-assets';

/**
 * Boot markers: one file per copied tree whose presence proves the copy ran.
 *
 * @remarks
 * `styles.css` is the design system's root stylesheet; the logo is the one
 * brand asset the landing page's masthead references today (it is also the
 * only entry in the copier's `OAK_ASSETS_MANIFEST` — keep the two in step).
 */
export const OAK_DS_MARKER = `${OAK_DS_PUBLIC_DIRNAME}/styles.css`;
export const OAK_ASSETS_MARKER = `${OAK_ASSETS_PUBLIC_DIRNAME}/assets/oak-national-academy-logo-512.png`;
