import type { ReactElement } from 'react';

import { LearningFramework } from '@/components/framework/LearningFramework';
import type { VideoImportBlock } from '@/lib/blocks/types';

/**
 * Renders a {@link VideoImportBlock}. The `learningframework` embed is reproduced as the interactive
 * {@link LearningFramework} (Option A — `data-embed` named the component precisely so this slot could
 * be wired without new schema). Every other embed renders a described media slot: the duration
 * labelled by its caption.
 */
export function VideoImportBlockView({ block }: { block: VideoImportBlock }): ReactElement {
  if (block.embed === 'learningframework') {
    return <LearningFramework />;
  }
  return (
    <figure>
      <div role="img" aria-label={block.caption} data-embed={block.embed}>
        {block.duration}
      </div>
      <figcaption>{block.caption}</figcaption>
    </figure>
  );
}
