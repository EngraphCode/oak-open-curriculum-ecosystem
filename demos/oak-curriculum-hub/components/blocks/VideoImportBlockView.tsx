import type { ReactElement } from 'react';

import { MediaBox } from '@/components/blocks/MediaBox';
import { PlayChip } from '@/components/blocks/PlayChip';
import { LearningFramework } from '@/components/framework/LearningFramework';
import type { VideoImportBlock } from '@/lib/blocks/types';

/**
 * Renders a {@link VideoImportBlock}. The `learningframework` embed is reproduced as the interactive
 * {@link LearningFramework} (Option A — `data-embed` named the component precisely so this slot could
 * be wired without new schema); the course corpus carries exactly that one videoimport. Any other
 * embed renders a described media slot under the export's black IMPORT VIDEO pill (the export's
 * empty-stage upload wireframe is deliberately not reproduced — it is the prototype's fake state
 * machine, unreachable from course data). The duration joins the accessible name — visible-only
 * content inside a `role="img"` is never announced.
 */
export function VideoImportBlockView({
  block,
}: {
  readonly block: VideoImportBlock;
}): ReactElement {
  if (block.embed === 'learningframework') {
    return <LearningFramework />;
  }
  return (
    <figure data-embed={block.embed}>
      <MediaBox
        pill="IMPORT VIDEO"
        pillTone="black"
        glyph={<PlayChip />}
        label={block.duration}
        ariaLabel={`${block.caption} — ${block.duration}`}
      />
      <figcaption className="mt-2.5 text-sm leading-5 font-light text-ink-subdued">
        {block.caption}
      </figcaption>
    </figure>
  );
}
