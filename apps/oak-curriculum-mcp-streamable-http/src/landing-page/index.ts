/**
 * Landing page module for the MCP HTTP server.
 *
 * This module provides the public API for rendering the landing page that
 * explains the MCP server capabilities and how to connect to it. The render
 * runs at BUILD time (the bake step) — the request path serves the baked
 * artefact and never renders.
 *
 * @example
 * ```typescript
 * import { renderLandingPageHtml } from '../src/landing-page/index.js';
 *
 * // In the build-time bake step
 * const html = renderLandingPageHtml({
 *   vercelHost: process.env['VERCEL_PROJECT_PRODUCTION_URL'],
 *   appVersion: buildVersion,
 * });
 * await writeFile(artefactPath, html);
 * ```
 */

export { renderLandingPageHtml, type LandingPageOptions } from './render-landing-page.js';
