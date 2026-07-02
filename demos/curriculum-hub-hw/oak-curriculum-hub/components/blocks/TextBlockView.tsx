import type { ReactElement } from 'react';

import type { TextBlock } from '@/lib/blocks/types';

/**
 * Renders a {@link TextBlock} as one paragraph per entry in the export's body
 * scale (light 18/29, slightly tightened tracking). Keyed by content
 * (paragraphs are distinct prose; `no-array-index-key` forbids the index).
 */
export function TextBlockView({ block }: { block: TextBlock }): ReactElement {
  return (
    <>
      {block.paras.map((para) => (
        <p key={para} className="mb-3.5 text-lg leading-[29px] font-light tracking-[-0.005rem]">
          {para}
        </p>
      ))}
    </>
  );
}
