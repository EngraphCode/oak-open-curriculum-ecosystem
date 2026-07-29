import type { ReactElement } from 'react';

/**
 * Button specimen: the kit's button variants. Radius, fill, shadow and the
 * press signature are all tokens — Freedonia flattens them to the
 * mechanical GDS edge, EMC² inflates them.
 */
export function ButtonsSpecimen(): ReactElement {
  return (
    <section className="oak-stack oak-stack--s" aria-labelledby="specimen-buttons">
      <h2 className="oak-heading-4" id="specimen-buttons">
        Buttons
      </h2>
      <div className="oak-cluster oak-cluster--s">
        <button className="oak-btn" type="button">
          Primary action
        </button>
        <button className="oak-btn oak-btn--secondary" type="button">
          Secondary action
        </button>
        <button className="oak-btn oak-btn--sm" type="button">
          Small action
        </button>
      </div>
    </section>
  );
}
