import type { ReactElement } from 'react';

import type { TextBlock } from '@/lib/blocks/types';

/**
 * Renders a {@link TextBlock} as one paragraph per entry. Keyed by content
 * (paragraphs are distinct prose; `no-array-index-key` forbids the index).
 * Oak body type-scale fidelity lands in the styling pass.
 */
export function TextBlockView({ block }: { block: TextBlock }): ReactElement {
  return (
    <>
      {block.paras.map((para) => (
        <p key={para}>{para}</p>
      ))}
    </>
  );
}
