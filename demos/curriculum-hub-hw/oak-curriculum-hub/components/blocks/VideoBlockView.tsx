import type { ReactElement } from 'react';

import type { VideoBlock } from '@/lib/blocks/types';

/**
 * Renders a {@link VideoBlock} as a described media slot with its caption,
 * mirroring the export's placeholder treatment (no embedded media decoded). A
 * real player is a styling-pass enrichment.
 */
export function VideoBlockView({ block }: { block: VideoBlock }): ReactElement {
  return (
    <figure>
      <div role="img" aria-label={block.placeholder} data-placeholder>
        {block.placeholder}
      </div>
      <figcaption>{block.caption}</figcaption>
    </figure>
  );
}
