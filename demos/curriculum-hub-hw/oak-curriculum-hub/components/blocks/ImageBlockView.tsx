import type { ReactElement } from 'react';

import type { ImageBlock } from '@/lib/blocks/types';

/**
 * Renders an {@link ImageBlock}. The canonical export ships these as described
 * placeholders (no embedded source), so the placeholder description is rendered
 * faithfully as a labelled region with its caption. A real `src` (via
 * `next/image`) is a styling-pass enrichment; `alt` (falling back to the
 * placeholder) is the accessible name.
 */
export function ImageBlockView({ block }: { block: ImageBlock }): ReactElement {
  return (
    <figure>
      <div role="img" aria-label={block.alt ?? block.placeholder} data-placeholder>
        {block.placeholder}
      </div>
      {block.caption !== undefined && <figcaption>{block.caption}</figcaption>}
    </figure>
  );
}
