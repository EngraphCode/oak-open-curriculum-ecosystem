import type { ReactElement } from 'react';

import type { HeadingBlock } from '@/lib/blocks/types';

/**
 * Renders a {@link HeadingBlock} as a sub-section heading (`<h4>`, one level below the section `<h3>`
 * the course shell assigns, so an in-content heading does not flatten the hierarchy), in the export's
 * in-content heading scale (semibold 24/30).
 */
export function HeadingBlockView({ block }: { block: HeadingBlock }): ReactElement {
  return (
    <h4 className="mt-2 mb-1 text-2xl leading-[30px] font-semibold tracking-[0.0115rem]">
      {block.text}
    </h4>
  );
}
