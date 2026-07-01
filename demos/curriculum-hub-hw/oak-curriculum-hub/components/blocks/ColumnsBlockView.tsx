import type { ReactElement } from 'react';

import type { ColumnsBlock } from '@/lib/blocks/types';

/**
 * Renders a {@link ColumnsBlock} as one labelled column per entry, each a
 * heading over its bullet list. The multi-column grid fidelity lands in the
 * styling pass.
 */
export function ColumnsBlockView({ block }: { block: ColumnsBlock }): ReactElement {
  return (
    <div>
      {block.cols.map((col) => (
        <section key={col.title} aria-label={col.title}>
          <h4>{col.title}</h4>
          <ul>
            {col.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
