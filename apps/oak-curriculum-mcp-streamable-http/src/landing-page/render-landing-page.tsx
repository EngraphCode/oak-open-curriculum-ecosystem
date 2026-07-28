/**
 * Main landing page renderer.
 *
 * @remarks
 * The page is a server-rendered React tree (`react-dom/server`), returned as
 * a complete HTML document string so the Express route stays a one-liner.
 * `renderToStaticMarkup` is deliberate over `renderToString`: nothing on this
 * page hydrates, so no React bookkeeping attributes need to reach the wire.
 *
 * React escapes interpolated text by construction, which is why the
 * hand-rolled `escapeHtml` the string renderers needed has gone with them.
 *
 * The document element itself is rendered by {@link LandingPageDocument};
 * only the doctype is prepended here, because React does not emit one.
 *
 * @packageDocumentation
 */

import { renderToStaticMarkup } from 'react-dom/server';

import { LandingPageDocument } from './components/landing-page-document.js';
import { deriveLandingPageViewProps, type DeriveLandingPageOptions } from './derive-view-props.js';

/**
 * Everything the landing page needs from its environment at bake time.
 *
 * @remarks
 * One declaration governs: this is the derivation's own options type under
 * the render entry's name, so a field added for the bake cannot be silently
 * dropped between the two (structural typing would let two separate
 * declarations drift without an error).
 */
export type LandingPageOptions = DeriveLandingPageOptions;

/**
 * Renders the complete landing page HTML.
 *
 * Generates a full HTML document including:
 * - HTML head with the design-system stylesheet and meta tags
 * - Oak site chrome (masthead tabs, logo bar) and footer
 * - Hero band with the phase tag, title, and explainer for teachers
 * - Connection instructions with a deployment-host-derived JSON config snippet
 * - Collapsible sections for the SERVED resources and tools
 * - Documentation links
 *
 * @param options - Runtime inputs; every field is optional and the
 *   all-defaults render is the local-development page.
 * @returns Complete HTML string for the landing page
 *
 * @example
 * ```typescript
 * // Production (Vercel)
 * const html = renderLandingPageHtml({ vercelHost: 'my-app.vercel.app' });
 *
 * // Development
 * const devHtml = renderLandingPageHtml();
 * ```
 */
export function renderLandingPageHtml(options: LandingPageOptions = {}): string {
  const markup = renderToStaticMarkup(
    <LandingPageDocument {...deriveLandingPageViewProps(options)} />,
  );

  return `<!doctype html>\n${markup}`;
}
