import type { ReactElement } from 'react';

/**
 * Tag specimen: the decorative-surface tints on subject chips. The tints
 * ride the decorative ramp roles, so each identity re-derives them on its
 * own hue axes.
 */
export function TagsSpecimen(): ReactElement {
  return (
    <section className="oak-stack oak-stack--s" aria-labelledby="specimen-tags">
      <h2 className="oak-heading-4" id="specimen-tags">
        Tags
      </h2>
      <div className="oak-cluster oak-cluster--s">
        <span className="oak-tag oak-tag--mint">English</span>
        <span className="oak-tag oak-tag--aqua">Maths</span>
        <span className="oak-tag oak-tag--lavender">Science</span>
        <span className="oak-tag oak-tag--pink">History</span>
        <span className="oak-tag oak-tag--grey">Geography</span>
      </div>
    </section>
  );
}
