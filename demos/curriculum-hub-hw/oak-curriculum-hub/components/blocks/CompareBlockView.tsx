import type { ReactElement } from 'react';

import type { CompareBlock } from '@/lib/blocks/types';

/**
 * Renders a {@link CompareBlock} as an example / non-example pair. The
 * green-vs-red side-by-side treatment and icons land in the styling pass; the
 * `aria-label`s keep the two halves distinguishable without colour.
 */
export function CompareBlockView({ block }: { block: CompareBlock }): ReactElement {
  return (
    <div>
      <section aria-label="Example">
        <p>{block.goodText}</p>
        {block.goodNote !== undefined && <p>{block.goodNote}</p>}
      </section>
      <section aria-label="Non-example">
        <p>{block.badText}</p>
        {block.badNote !== undefined && <p>{block.badNote}</p>}
      </section>
    </div>
  );
}
