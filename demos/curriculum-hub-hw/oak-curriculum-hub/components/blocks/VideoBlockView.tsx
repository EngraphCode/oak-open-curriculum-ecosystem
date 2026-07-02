import type { ReactElement } from 'react';

import { MediaBox } from '@/components/blocks/MediaBox';
import type { VideoBlock } from '@/lib/blocks/types';

/** The export's white play chip: circled triangle under a small lemon shadow. */
export function PlayChip(): ReactElement {
  return (
    <span
      aria-hidden="true"
      className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-[3px] border-oak-black bg-white shadow-[3px_3px_0_#ffe555]"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="#222222">
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  );
}

/**
 * Renders a {@link VideoBlock} as the export's video placeholder: the media
 * box with a black VIDEO pill and the play chip (no media ships in the
 * export), captioned below.
 */
export function VideoBlockView({ block }: { block: VideoBlock }): ReactElement {
  return (
    <figure>
      <MediaBox
        pill="VIDEO"
        pillTone="black"
        glyph={<PlayChip />}
        label={block.placeholder}
        ariaLabel={block.placeholder}
      />
      <figcaption className="mt-2.5 text-sm leading-5 font-light text-oak-grey">
        {block.caption}
      </figcaption>
    </figure>
  );
}
