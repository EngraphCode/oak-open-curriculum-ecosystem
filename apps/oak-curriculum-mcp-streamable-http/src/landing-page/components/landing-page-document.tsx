/**
 * The complete landing-page document.
 *
 * @remarks
 * Renders the whole `<html>` element so the head and the body are one tree
 * with one set of invariants rather than a template string spliced around a
 * component.
 *
 * The theme posture: the page declares `data-theme="light"` and ships no
 * theme machinery — the design system's theme script auto-applies
 * `high-contrast` on an OS contrast preference, which without a control
 * would leave a visitor on a theme the page never offered and they cannot
 * leave. Machinery and affordance ship together (ADR-217 §5), so a page
 * with no control ships neither: the ratified light design for everyone.
 *
 * One ordering constraint in the head is load-bearing: `landing-page.css`
 * follows `styles.css`, because the page layer composes on top of the
 * system's classes. The order holds precisely because NEITHER link carries
 * React's `precedence` prop — adding it to one would hoist that stylesheet
 * into React's managed precedence group and silently invert the cascade.
 * The render unit suite asserts the emitted order.
 *
 * @packageDocumentation
 */

import type { JSX } from 'react';

import type { LandingPageViewProps } from '../view-props.js';
import { ROUTED_ASSET_BASE } from '../../app/static-asset-paths.js';
import {
  OAK_DS_BASE,
  OAK_MINT,
  OAK_SITE_NAME,
  SHARE_IMAGE_PATH,
  SHARE_IMAGE_SIZE,
} from './design-system-refs.js';
import { ConnectSection, DocumentationCard, PAGE_DESCRIPTION, PageHero } from './page-sections.js';
import { ResourcesSection } from './resources-section.js';
import { SiteFooter, SiteMasthead } from './site-chrome.js';
import { ToolsSection } from './tools-section.js';

/**
 * The page's title, shared by `<title>` and the share card.
 *
 * @remarks
 * One constant because a browser tab and a shared link showing different names
 * for the same page is a defect nobody notices until someone shares it.
 */
const PAGE_TITLE = 'Oak Curriculum MCP (HTTP)';

/**
 * Share and search metadata.
 *
 * @remarks
 * The tag set follows the main Oak website's — title, description, site name,
 * locale, type, url, image, and a Twitter card. The machinery does not: there,
 * each field is its own optional public env var defaulting to null, and the
 * image URL is string-built from one of them, so an unset variable yields a
 * card pointing at `null/...`. Here every value is either the owner's copy or
 * derived from the deployment, and there is nothing to leave unset.
 *
 * `summary`, not `summary_large_image`: a large card wants purpose-made
 * 1200x630 artwork, and this page has a square logo.
 */
function ShareMetadata({ siteOrigin }: { readonly siteOrigin: string }): JSX.Element {
  return (
    <>
      <meta name="description" content={PAGE_DESCRIPTION} />
      <link rel="canonical" href={siteOrigin} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={OAK_SITE_NAME} />
      <meta property="og:locale" content="en_GB" />
      <meta property="og:title" content={PAGE_TITLE} />
      <meta property="og:description" content={PAGE_DESCRIPTION} />
      <meta property="og:url" content={siteOrigin} />
      <meta property="og:image" content={`${siteOrigin}${SHARE_IMAGE_PATH}`} />
      <meta property="og:image:width" content={String(SHARE_IMAGE_SIZE)} />
      <meta property="og:image:height" content={String(SHARE_IMAGE_SIZE)} />
      <meta property="og:image:alt" content={OAK_SITE_NAME} />
      <meta name="twitter:card" content="summary" />
    </>
  );
}

function DocumentHead({
  siteOrigin,
  appVersion,
}: {
  readonly siteOrigin: string;
  readonly appVersion?: string;
}): JSX.Element {
  return (
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{PAGE_TITLE}</title>
      {/* `--oak-mint`, the hero band's fill. A <meta> cannot take var(), so
          this is the one literal on the page — but its provenance is not
          guesswork: it is the design system's `colour.mint` DTCG token, and
          a test holds the two equal so the value cannot drift silently.
          Single-valued because only the light theme ships; a theme-aware
          pair would need `media` variants, which is work for the change that
          makes the other themes reachable. */}
      <meta name="theme-color" content={OAK_MINT} />
      <ShareMetadata siteOrigin={siteOrigin} />
      {appVersion !== undefined && <meta name="app-version" content={appVersion} />}
      {/* Every href below is routed-base-prefixed (MCP-509): the canonical
          host only forwards `/mcp*` to this app, so a root-relative asset
          request lands on the main website's 404 instead. */}
      <link rel="icon" href={`${ROUTED_ASSET_BASE}/favicons/favicon.ico`} sizes="any" />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href={`${ROUTED_ASSET_BASE}/favicons/favicon-32x32.png`}
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href={`${ROUTED_ASSET_BASE}/favicons/favicon-16x16.png`}
      />
      <link rel="apple-touch-icon" href={`${ROUTED_ASSET_BASE}/favicons/apple-touch-icon.png`} />
      <link rel="stylesheet" href={`${OAK_DS_BASE}/styles.css`} />
      <link rel="stylesheet" href={`${ROUTED_ASSET_BASE}/landing-page.css`} />
    </head>
  );
}

export function LandingPageDocument({
  aggregatedTools,
  generatedTools,
  resources,
  siteOrigin,
  mcpEndpointUrl,
  protectedResourceMetadataUrl,
  appVersion,
}: LandingPageViewProps): JSX.Element {
  return (
    // Explicit rather than relying on the stylesheet's default: an explicit
    // choice also beats a polarity-flipped brand default, so the page is
    // light under any brand layer a consumer adds later.
    <html lang="en-GB" data-theme="light">
      <DocumentHead siteOrigin={siteOrigin} appVersion={appVersion} />
      <body className="oak-scope">
        <div className="oak-canvas" data-page="home">
          <SiteMasthead />
          {/* tabIndex={-1}: the skip link targets this fragment, and WebKit
              does not move sequential focus to a non-focusable fragment
              target — programmatic focusability is what makes the skip link
              a real skip everywhere. */}
          <main
            data-region="main"
            className="oak-main"
            id="main"
            aria-labelledby="title"
            tabIndex={-1}
          >
            <PageHero />
            <section data-region="content">
              <div className="oak-band band-lemon">
                <div className="oak-container">
                  <ConnectSection
                    mcpEndpointUrl={mcpEndpointUrl}
                    protectedResourceMetadataUrl={protectedResourceMetadataUrl}
                  />
                </div>
              </div>
              <div className="oak-container oak-stack">
                <ResourcesSection resources={resources} />
                <ToolsSection aggregatedTools={aggregatedTools} generatedTools={generatedTools} />
                <DocumentationCard />
              </div>
            </section>
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
