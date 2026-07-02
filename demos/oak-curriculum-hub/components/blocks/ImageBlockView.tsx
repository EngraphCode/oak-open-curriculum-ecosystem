import Image from 'next/image';
import type { ReactElement } from 'react';

import { MediaBox } from '@/components/blocks/MediaBox';
import type { ImageBlock } from '@/lib/blocks/types';

/**
 * Intrinsic dimensions of bundled assets (`next/image` requires them; the
 * course data carries none). An asset absent here renders the placeholder box
 * instead — honest, never a broken image.
 */
const ASSET_DIMENSIONS = new Map([['assets/learning-framework.png', { width: 630, height: 550 }]]);

/** The export's image-placeholder glyph (landscape frame with a peak line). */
function ImageGlyph(): ReactElement {
  return (
    <svg
      width="46"
      height="46"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#575757"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.6" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

/** The export's framed real image: black frame, wide lemon shadow, optional `maxWidth` centring. */
function FramedImage({
  block,
  src,
  dims,
}: {
  readonly block: ImageBlock;
  readonly src: string;
  readonly dims: { width: number; height: number };
}): ReactElement {
  return (
    <Image
      src={`/${src}`}
      alt={block.alt ?? block.caption ?? block.placeholder}
      width={dims.width}
      height={dims.height}
      sizes="(min-width: 768px) 426px, 100vw"
      className="shadow-oak-wide-lemon h-auto w-full rounded-2xl border-[3px] border-oak-black"
      style={
        block.maxWidth !== undefined
          ? { maxWidth: block.maxWidth, display: 'block', margin: '0 auto' }
          : undefined
      }
    />
  );
}

/**
 * Renders an {@link ImageBlock}. A bundled asset with known dimensions renders
 * as the export's framed image; everything else renders the corner-pilled
 * placeholder box, faithful to the export (most course images ship undecoded).
 */
export function ImageBlockView({ block }: { readonly block: ImageBlock }): ReactElement {
  const dims = block.src !== undefined ? ASSET_DIMENSIONS.get(block.src) : undefined;
  return (
    <figure>
      {block.src !== undefined && dims !== undefined ? (
        <FramedImage block={block} src={block.src} dims={dims} />
      ) : (
        <MediaBox
          pill="IMAGE"
          pillTone="lemon"
          glyph={<ImageGlyph />}
          label={block.placeholder}
          ariaLabel={block.alt ?? block.placeholder}
        />
      )}
      {block.caption !== undefined && (
        <figcaption className="mt-2.5 text-sm leading-5 font-light text-oak-grey">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}
