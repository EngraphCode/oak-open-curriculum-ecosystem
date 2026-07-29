import type { ReactElement } from 'react';

/**
 * Card specimen: one composed component — surface, border, radius, shadow
 * and type slots all resolve through the token contract.
 */
export function CardSpecimen(): ReactElement {
  return (
    <section className="oak-stack oak-stack--s" aria-labelledby="specimen-card">
      <h2 className="oak-heading-4" id="specimen-card">
        Card
      </h2>
      <div className="oak-card oak-stack oak-stack--s">
        <h3 className="oak-heading-5">One HTML, many faces</h3>
        <p className="oak-body-2">
          Plain CSS custom properties are the portability layer: identity and theme recompose this
          same markup through the token contract, never through new HTML.
        </p>
        <a
          className="oak-link oak-body-2"
          href="https://github.com/oaknational/oak-open-curriculum-ecosystem/tree/main/packages/design/oak-design-system"
        >
          Read the kit&rsquo;s consumption guides
        </a>
      </div>
    </section>
  );
}
