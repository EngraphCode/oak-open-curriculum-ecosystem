'use client';

import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';

import type { FlipBlock, FlipCard } from '@/lib/blocks/types';

/**
 * One flip card: a button swapping between the export's two faces — front: white card, chip badge,
 * bold title, "Tap to reveal ↻" hint; back: the chip tint with the detail text and a black offset
 * shadow. The swap is state-driven (no 3D animation), so it is perceivable and operable without
 * motion — no `prefers-reduced-motion` variant is needed for a non-animated swap; `aria-expanded`
 * announces the toggle.
 */
/** The export's dashed front-image slot ("Drop image"), rendered when the block sets `frontImage`. */
function FrontImageSlot(): ReactElement {
  return (
    <span className="mt-3 flex min-h-[92px] w-full flex-1 flex-col items-center justify-center gap-1.5 rounded-[10px] border-2 border-dashed border-oak-grey bg-oak-black/[.03]">
      <svg
        aria-hidden="true"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-oak-grey"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.6" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      <span className="text-[12px] font-light leading-4 text-oak-grey">Drop image</span>
    </span>
  );
}

function FlipCardView({
  card,
  chip,
  frontImage,
}: {
  card: FlipCard;
  chip: string;
  frontImage: boolean;
}): ReactElement {
  const [flipped, setFlipped] = useState(false);
  return (
    <li className="flex">
      <button
        type="button"
        aria-expanded={flipped}
        onClick={() => setFlipped((value) => !value)}
        style={flipped ? { backgroundColor: chip } : undefined}
        className={`flex min-h-[210px] w-full flex-col items-start rounded-[14px] border-2 border-oak-black p-[18px] text-left ${
          flipped ? 'shadow-[2px_2px_0_#222222]' : 'bg-white shadow-oak-lemon'
        }`}
      >
        {flipped ? (
          <span className="text-[16px] font-light leading-[23px]">{card.back}</span>
        ) : (
          <>
            <span
              aria-hidden="true"
              style={{ backgroundColor: chip }}
              className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full border-2 border-oak-black text-[15px] font-bold"
            >
              {card.badge}
            </span>
            <span className="mt-3 text-[20px] font-bold leading-[26px]">{card.front}</span>
            {frontImage && <FrontImageSlot />}
            <span className="mt-auto flex items-center gap-1.5 pt-3 text-[13px] font-light text-oak-grey">
              Tap to reveal <span aria-hidden="true" className="text-[15px]">↻</span>
            </span>
          </>
        )}
      </button>
    </li>
  );
}

/**
 * Renders a {@link FlipBlock} as the export's flip-card grid (max 3 across, 16px gap). `chip` tints
 * the badge and the revealed back.
 */
export function FlipBlockView({ block }: { block: FlipBlock }): ReactElement {
  // Stable per-card keys so duplicate front text does not drop or mis-associate
  // flip state (a content key would collide on repeated fronts).
  const keys = useMemo(() => block.cards.map((_card, index) => `card-${index}`), [block.cards]);
  const columns = Math.min(block.cards.length, 3);
  return (
    <ul className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {block.cards.map((card, index) => (
        <FlipCardView key={keys[index]} card={card} chip={block.chip} frontImage={block.frontImage ?? false} />
      ))}
    </ul>
  );
}
