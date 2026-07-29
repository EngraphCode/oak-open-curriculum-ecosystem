import type { ReactElement } from 'react';

/** Hero region: the page's single h1 and the one-sentence thesis. */
export function Hero(): ReactElement {
  return (
    <section className="oak-region" data-region="hero">
      <div className="oak-container hero-inner">
        <h1 className="oak-heading-1">Oak Open Curriculum Design System</h1>
        <p className="oak-body-1">
          One page of markup, many faces: the kit consumed the plain-CSS way &mdash; its aggregate
          stylesheet, its own classes and tokens, its self-hosted fonts. Switch the identity and the
          theme; the markup never changes.
        </p>
      </div>
    </section>
  );
}
