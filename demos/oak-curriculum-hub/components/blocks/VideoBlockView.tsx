import type { ReactElement } from 'react';

import { MediaBox } from '@/components/blocks/MediaBox';
import { PlayChip } from '@/components/blocks/PlayChip';
import type { VideoBlock } from '@/lib/blocks/types';

/**
 * Renders a {@link VideoBlock} as the export's video placeholder: the media
 * box with a black VIDEO pill and the play chip (no media ships in the
 * export), captioned below.
 */
export function VideoBlockView({ block }: { block: VideoBlock }): ReactElement {
  return (
    <figure>
      <MediaBox pill="VIDEO" pillTone="black" glyph={<PlayChip />} label={block.placeholder} />
      <figcaption className="mt-2.5 text-sm leading-5 font-light text-oak-grey">
        {block.caption}
      </figcaption>
    </figure>
  );
}
