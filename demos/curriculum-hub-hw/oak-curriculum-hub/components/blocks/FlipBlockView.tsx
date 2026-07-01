'use client';

import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';

import type { FlipBlock, FlipCard } from '@/lib/blocks/types';

/**
 * One flip card: a button toggling between front and back. The back text is
 * revealed by state (not by a CSS-only transform), so it is perceivable and
 * operable without animation; `aria-expanded` announces the toggle. The 3D flip
 * is a styling-pass enhancement gated by `prefers-reduced-motion`.
 */
function FlipCardView({
  card,
  frontImage,
}: {
  card: FlipCard;
  frontImage: boolean;
}): ReactElement {
  const [flipped, setFlipped] = useState(false);
  return (
    <li data-front-image={frontImage || undefined}>
      <button type="button" aria-expanded={flipped} onClick={() => setFlipped((value) => !value)}>
        <span aria-hidden>{card.badge}</span>
        <span>{card.front}</span>
        {flipped && <span>{card.back}</span>}
      </button>
    </li>
  );
}

/**
 * Renders a {@link FlipBlock} as a grid of flip cards. `chip` tints the accent in
 * the styling pass (`data-chip`); when `frontImage` is set, the card fronts get the
 * image treatment (`data-front-image`), also deferred to the styling pass.
 */
export function FlipBlockView({ block }: { block: FlipBlock }): ReactElement {
  // Stable per-card keys so duplicate front text does not drop or mis-associate
  // flip state (a content key would collide on repeated fronts).
  const keys = useMemo(() => block.cards.map((_card, index) => `card-${index}`), [block.cards]);
  const frontImage = block.frontImage ?? false;
  return (
    <ul data-chip={block.chip}>
      {block.cards.map((card, index) => (
        <FlipCardView key={keys[index]} card={card} frontImage={frontImage} />
      ))}
    </ul>
  );
}
