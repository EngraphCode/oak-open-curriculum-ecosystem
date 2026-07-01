import type { ReactElement } from 'react';

import type { VideoImportBlock } from '@/lib/blocks/types';

/**
 * Renders a {@link VideoImportBlock} as a described media slot with its caption
 * and duration. `data-embed` names the embedded component (e.g. the learning
 * framework) so the framework reproduction cycle can wire it; the slot shows the
 * duration, labelled by the caption.
 */
export function VideoImportBlockView({ block }: { block: VideoImportBlock }): ReactElement {
  return (
    <figure>
      <div role="img" aria-label={block.caption} data-embed={block.embed}>
        {block.duration}
      </div>
      <figcaption>{block.caption}</figcaption>
    </figure>
  );
}
