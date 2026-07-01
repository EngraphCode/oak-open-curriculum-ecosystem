import type { ReactElement } from 'react';

import type { HeadingBlock } from '@/lib/blocks/types';

/**
 * Renders a {@link HeadingBlock} as a section-level heading (`<h3>`, the
 * export's in-section heading level). Visual fidelity lands in the styling pass.
 */
export function HeadingBlockView({ block }: { block: HeadingBlock }): ReactElement {
  return <h3>{block.text}</h3>;
}
