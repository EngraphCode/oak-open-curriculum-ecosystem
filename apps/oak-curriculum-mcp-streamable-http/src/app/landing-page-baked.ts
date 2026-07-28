/**
 * The baked landing page, inlined into the bundle at build time.
 *
 * @remarks
 * The bake step (`build-scripts/bake-landing-page.ts`, run by
 * `esbuild.config.ts` BEFORE the bundle step) writes the rendered page to
 * `.generated/landing-page.html`; esbuild's `text` loader then inlines that
 * file's content into every bundle importing this module. The deployed
 * function therefore carries the page with NO runtime filesystem
 * dependency — the cure for the PR 583 boot-throw, where the function
 * environment lacked the gitignored artefact and every request died on the
 * missing file before any log line. A missing artefact now fails the BUILD
 * (esbuild cannot resolve the import), never the deployment.
 *
 * Bundled contexts only: tsx-run surfaces (the dev server, the harness)
 * keep reading the artefact from disk via `landing-page-artefact.ts`.
 *
 * @packageDocumentation
 */

import bakedLandingPageHtml from '../../.generated/landing-page.html';

/** The build's rendered landing-page document, carried inside the bundle. */
export const BAKED_LANDING_PAGE_HTML: string = bakedLandingPageHtml;
