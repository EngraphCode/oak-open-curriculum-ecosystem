import type { ReactElement } from 'react';

import type { HeadingBlock } from '@/lib/blocks/types';

/**
 * Renders a {@link HeadingBlock} as a sub-section heading (`<h4>`, one level below the section `<h3>`
 * the course shell assigns, so an in-content heading does not flatten the hierarchy). Visual fidelity
 * lands in the styling pass.
 */
export function HeadingBlockView({ block }: { block: HeadingBlock }): ReactElement {
  return <h4>{block.text}</h4>;
}
