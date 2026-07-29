import type { ReactElement } from 'react';

/**
 * Button specimen: the kit's button variants. Radius, fill and shadow are
 * all tokens — Freedonia flattens them to the mechanical GDS edge, EMC²
 * rounds and re-shadows them. (EMC²'s hover/press STATE garnish is gated
 * on the kit's .oak-scope marker, which this page adopts only after the
 * routed kit cure to the scope's paragraph-colour rule lands — recorded on
 * MCP-371.)
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
