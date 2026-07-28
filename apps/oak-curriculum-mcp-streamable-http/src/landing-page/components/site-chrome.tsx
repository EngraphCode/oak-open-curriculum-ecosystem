/**
 * Site chrome — masthead and footer.
 *
 * @remarks
 * Oak's main-website grammar (OWA `TopNavMinimal` / `LayoutSiteFooter`)
 * reproduced from the design system's own classes and assets, with the
 * real site navigation stood in for by absolute links to
 * www.thenational.academy. This app serves one page; it does not host Oak's
 * nav, and pretending otherwise would strand a visitor in a dead menu.
 *
 * Assets come from the design system's served copy (`/oak-ds/…`) — the app
 * vendors no logo or rule artwork of its own.
 *
 * @packageDocumentation
 */

import type { JSX } from 'react';

import { OAK_DS_BASE } from './design-system-refs.js';

const OAK_WEBSITE_URL = 'https://www.thenational.academy';
const OAK_TEACHERS_URL = `${OAK_WEBSITE_URL}/teachers`;
const OAK_TERMS_URL = `${OAK_WEBSITE_URL}/legal/terms-and-conditions-api-version`;
const OAK_PRIVACY_URL = `${OAK_WEBSITE_URL}/legal/privacy-policy`;

/**
 * The masthead: Oak's black tab bar over the white logo bar.
 *
 * @remarks
 * Ships no theme control and no theme machinery — a mechanism that changes a
 * user-visible setting ships only alongside the control that changes it back
 * (ADR-217 §5), so the page declares `data-theme="light"` and stays there.
 */
export function SiteMasthead(): JSX.Element {
  return (
    <header data-region="masthead">
      <a className="oak-skip-link" href="#main">
        Skip to content
      </a>
      {/* Both bands are full-bleed with an inner `.oak-container`, the shape
          the footer already uses. Hand-rolled gutters here previously put the
          masthead logo out of line with the page's content column at every
          width, and the error reversed direction between 1200px and 1440px. */}
      <nav className="site-tabs" aria-label="Oak site areas">
        <div className="oak-container site-tabs-inner">
          <a className="oak-btn oak-btn--secondary" href={OAK_TEACHERS_URL}>
            Teachers
          </a>
          <a className="oak-btn" href={OAK_WEBSITE_URL}>
            Oak home
          </a>
        </div>
      </nav>
      <nav className="site-nav" aria-label="Site">
        <div className="oak-container site-nav-inner">
          <a
            className="site-nav-logo"
            href={OAK_WEBSITE_URL}
            aria-label="Oak National Academy home"
          >
            <img src={`${OAK_DS_BASE}/assets/logo-full-black.svg`} alt="" />
          </a>
          <a
            className="oak-btn oak-btn--secondary oak-btn--sm site-nav-back"
            href={OAK_WEBSITE_URL}
          >
            {/* Below 640px the trailing words are VISUALLY hidden (the
                .oak-visually-hidden recipe in landing-page.css, never
                display:none) so the masthead reflows at 320px while "Back to
                the main Oak website" remains the accessible name at every
                width. Keeping "Back to" + "the main Oak website" split lets
                the short form remain a sentence rather than a truncation. */}
            Back to<span className="site-nav-back__long"> the main Oak website</span>
            <span className="oak-btn__icon oak-icon--mask ic-external" aria-hidden="true" />
          </a>
        </div>
      </nav>
    </header>
  );
}

/**
 * The footer: Oak's squiggle rule, logo, legal links, and registered-company
 * line.
 *
 * @remarks
 * The legal links carry the main site's link text verbatim; the privacy URL
 * mirrors the main-site footer, while the terms URL points at Oak's
 * API-version terms by the owner's direction (2026-07-28, both verified
 * live) — this page states Oak's terms, it does not author its own.
 */
export function SiteFooter(): JSX.Element {
  return (
    <footer data-region="footer">
      <img
        className="site-footer-rule"
        src={`${OAK_DS_BASE}/assets/icons/header-underline.svg`}
        alt=""
      />
      <div className="oak-container site-footer-inner">
        <a href={OAK_WEBSITE_URL} aria-label="Oak National Academy home">
          <img src={`${OAK_DS_BASE}/assets/logo-full-black.svg`} alt="" />
        </a>
        {/* One right-hand meta column preserves the footer's ratified two-slot
            grammar (logo left, meta right); the legal links sit with the
            company details they accompany, as on the main site. */}
        <div className="oak-stack oak-stack--s">
          <nav className="site-footer-legal oak-cluster" aria-label="Legal">
            <a className="oak-link oak-body-3" href={OAK_TERMS_URL}>
              Terms &amp; conditions
            </a>
            <a className="oak-link oak-body-3" href={OAK_PRIVACY_URL}>
              Privacy policy
            </a>
          </nav>
          <address className="site-footer-meta">
            <p className="oak-body-3-bold">© Oak National Academy Limited, No 14174888</p>
            <p className="oak-body-4">1 Scott Place, 2 Hardman Street, Manchester, M3 3AA</p>
          </address>
        </div>
      </div>
    </footer>
  );
}
