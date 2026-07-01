import type { ReactElement } from 'react';

import type { SummaryBlock } from '@/lib/blocks/types';

/**
 * Renders a {@link SummaryBlock} as key-takeaway bullets plus an optional
 * reflection prompt. Visual fidelity (lemon reflection box) lands in the
 * styling pass.
 */
export function SummaryBlockView({ block }: { block: SummaryBlock }): ReactElement {
  return (
    <section aria-label="Summary">
      <ul>
        {block.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      {block.question !== undefined && <p>{block.question}</p>}
    </section>
  );
}
