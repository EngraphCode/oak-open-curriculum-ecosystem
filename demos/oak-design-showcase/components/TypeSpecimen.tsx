import type { ReactElement } from 'react';

/**
 * Type ramp specimen: heading and body classes rendered self-describing.
 * Counter-brands re-point the ramp tokens (face, weight, tracking, sizes)
 * and every line here follows.
 */
export function TypeSpecimen(): ReactElement {
  return (
    <section className="oak-stack oak-stack--s" aria-labelledby="specimen-type">
      <h2 className="oak-heading-4" id="specimen-type">
        Type
      </h2>
      <p className="oak-heading-2">Heading two</p>
      <p className="oak-heading-5">Heading five</p>
      <p className="oak-body-1">Body one &mdash; the reading size for lesson content.</p>
      <p className="oak-body-3">Body three &mdash; captions, labels and metadata.</p>
    </section>
  );
}
