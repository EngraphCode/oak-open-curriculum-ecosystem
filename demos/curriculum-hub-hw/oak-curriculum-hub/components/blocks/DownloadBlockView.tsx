import type { ReactElement } from 'react';

import type { DownloadBlock } from '@/lib/blocks/types';

/**
 * Renders a {@link DownloadBlock} as a download link to a bundled asset. Uses a
 * plain `<a download>` (not `next/link`) because the target is a static asset,
 * not an app route. The card fidelity + PDF icon land in the styling pass.
 */
export function DownloadBlockView({ block }: { block: DownloadBlock }): ReactElement {
  return (
    <a href={block.href} download>
      <span>{block.title}</span>
      <span>{block.desc}</span>
      <span>{block.meta}</span>
    </a>
  );
}
