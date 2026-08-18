import type { ReactElement } from 'react';

import type { Catalogue } from './token-catalogue';

/**
 * What this catalogue contains, and what it leaves out.
 *
 * Every number here is COUNTED at build time from the trees and sheets the
 * page was built from, never written down. A reference page that states its
 * own scope from memory is one upstream change away from lying about
 * itself, and this is the page where that would matter most.
 */
export function CatalogueNote({
  catalogue,
  treeCount,
}: {
  readonly catalogue: Catalogue;
  readonly treeCount: number;
}): ReactElement {
  return (
    <section className="tok-contract" aria-labelledby="tokens-contract-heading">
      <h2 className="oak-heading-6" id="tokens-contract-heading">
        What this catalogue contains
      </h2>
      <p className="oak-body-3">
        {catalogue.tokens.length} custom properties, flattened from the {treeCount} DTCG token trees
        the design system publishes &mdash; {catalogue.leafCount} declarations in total, because the
        theme trees re-declare the same roles. Each property is listed once, showing the value its
        current theme gives it.
      </p>
      <p className="oak-body-3">
        Icon URL properties (<span className="oak-code-3">--i-*</span> and the{' '}
        <span className="oak-code-3">--ic-*</span> roles) are excluded. They are
        environment-relative asset paths rather than design decisions, so the kit&rsquo;s export
        leaves them out deliberately and this catalogue filters the same shapes to keep that true if
        the export ever changes. Excluded from these trees: {catalogue.excludedIconCount}.
      </p>
      <p className="oak-body-3">
        &ldquo;Re-pointed by&rdquo; is read from the identity stylesheets themselves, at build time,
        so it states what those sheets actually declare rather than what a list here remembers. The
        base identity carries no override sheet &mdash; it is the kit&rsquo;s own tokens.
      </p>
    </section>
  );
}
