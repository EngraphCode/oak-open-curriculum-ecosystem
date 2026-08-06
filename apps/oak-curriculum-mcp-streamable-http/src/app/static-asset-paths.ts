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

/**
 * URL prefix every first-party asset reference sits beneath.
 *
 * @remarks
 * MCP-509. The canonical deployment reaches this app through a Cloudflare
 * origin rule scoped to `/mcp` and `/mcp/*`; a root-relative asset request
 * never arrives here at all, it stays on the main website and gets that
 * site's 404 HTML. So the page's own references must live inside the routed
 * surface, and the static mount must answer there.
 *
 * Deliberately the SAME value the MCP endpoint occupies, not a sibling path:
 * widening the Cloudflare rule to claim root-level `/oak-ds/*` or
 * `/favicons/*` on `www` would put this app in the main website's namespace,
 * which is a collision review nobody has done. Staying inside the existing
 * contained route needs no edge change at all.
 *
 * Assets survive the shared prefix because the static mount is registered
 * BEFORE the `/mcp` accept-header gate and Clerk auth (see `application.ts`
 * ordering), and `express.static` calls `next()` on a miss — so `GET /mcp`
 * and `POST /mcp` still reach the MCP handler untouched. That ordering is
 * load-bearing and asserted in `oak-ds-static.integration.test.ts`.
 */
export const ROUTED_ASSET_BASE = '/mcp';

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
