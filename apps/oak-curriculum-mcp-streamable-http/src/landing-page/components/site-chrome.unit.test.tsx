/**
 * The footer carries Oak's standard legal links — terms & conditions and
 * privacy policy — grouped in a named navigation landmark and pointing at the
 * main site's canonical /legal/ pages (link text and URLs verbatim from
 * www.thenational.academy's footer).
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { SiteFooter } from './site-chrome.js';

describe('SiteFooter legal links', () => {
  const html = renderToStaticMarkup(<SiteFooter />);
  // Scoped to the landmark: an unscoped toContain stays green on a footer
  // whose links have escaped the nav, or whose two hrefs are swapped.
  const legalNav = /<nav[^>]*aria-label="Legal"[^>]*>([\s\S]*?)<\/nav>/.exec(html)?.[1] ?? '';

  it('groups the legal links in a navigation named for assistive technology', () => {
    expect(legalNav).not.toBe('');
  });

  it("links Oak's terms & conditions at the canonical URL", () => {
    // React escapes the ampersand; renderToStaticMarkup is also what the page
    // ships through, so the text carries no hydration markers.
    expect(legalNav).toMatch(
      /<a[^>]*href="https:\/\/www\.thenational\.academy\/legal\/terms-and-conditions"[^>]*>Terms &amp; conditions<\/a>/,
    );
  });

  it("links Oak's privacy policy at the canonical URL", () => {
    expect(legalNav).toMatch(
      /<a[^>]*href="https:\/\/www\.thenational\.academy\/legal\/privacy-policy"[^>]*>Privacy policy<\/a>/,
    );
  });

  it('keeps the design-system link affordance on both anchors', () => {
    // .oak-link supplies :visited/:hover/:focus-visible; base colour and
    // underline survive its loss, which is what makes the regression silent.
    expect(legalNav.match(/\boak-link\b/g)).toHaveLength(2);
  });
});
