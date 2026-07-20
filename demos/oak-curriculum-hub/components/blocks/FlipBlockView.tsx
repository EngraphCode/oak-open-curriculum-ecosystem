'use client';

import { useId, useMemo, useState } from 'react';
import type { ReactElement } from 'react';

import type { FlipBlock, FlipCard } from '@/lib/blocks/types';

import { DashedMediaSlot } from './DashedMediaSlot';
import { mdGridCols } from './md-grid-cols';

/**
 * One flip card: a button swapping between the export's two faces — front: surface-role card, chip badge,
 * bold title, "Tap to reveal ↻" hint; back: the chip tint with the detail text and a black offset
 * shadow. BOTH faces stay in the DOM (`hidden` swaps them), so content persists for assistive tech
 * instead of vanishing on toggle; `aria-expanded` announces the state. The button's accessible name
 * is PINNED to the front title via `aria-labelledby` (a hidden reference still names) — without it
 * the name churned to the whole back text on flip (SC 4.1.2 quality). The swap is state-driven (no
 * 3D animation), so it is perceivable and operable without motion. The visible "Tap to reveal"
 * wording is the export's copy, kept for fidelity (full-reproduction principle).
 */
function FlipCardView({
  card,
  chip,
  frontImage,
}: {
  readonly card: FlipCard;
  readonly chip: string;
  readonly frontImage: boolean;
}): ReactElement {
  const [flipped, setFlipped] = useState(false);
  const titleId = useId();
  return (
    <li className="flex">
      <button
        type="button"
        aria-expanded={flipped}
        aria-labelledby={titleId}
        onClick={() => setFlipped((value) => !value)}
        style={flipped ? { backgroundColor: chip } : undefined}
        className={`flex min-h-[210px] w-full flex-col items-start rounded-[14px] border-2 border-line p-[18px] text-left ${
          flipped ? 'shadow-ink-brand' : 'bg-surface shadow-accent-brand'
        }`}
      >
        <span hidden={!flipped} className="text-[16px] font-light leading-[23px]">
          {card.back}
        </span>
        <span hidden={flipped} className="flex w-full flex-1 flex-col items-start">
          <CardFront card={card} chip={chip} frontImage={frontImage} titleId={titleId} />
        </span>
      </button>
    </li>
  );
}

/** The unflipped face: chip badge, the naming title, optional image slot, reveal hint. */
function CardFront({
  card,
  chip,
  frontImage,
  titleId,
}: {
  readonly card: FlipCard;
  readonly chip: string;
  readonly frontImage: boolean;
  readonly titleId: string;
}): ReactElement {
  return (
    <>
      <span
        aria-hidden="true"
        style={{ backgroundColor: chip }}
        className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full border-2 border-line text-[15px] font-bold"
      >
        {card.badge}
      </span>
      <span id={titleId} className="mt-3 text-[20px] font-bold leading-[26px]">
        {card.front}
      </span>
      {frontImage && (
        <span className="mt-3 flex w-full flex-1">
          <DashedMediaSlot label="Drop image" compact />
        </span>
      )}
      <span className="mt-auto flex items-center gap-1.5 pt-3 text-[13px] font-light text-ink-subdued">
        Tap to reveal{' '}
        <span aria-hidden="true" className="text-[15px]">
          ↻
        </span>
      </span>
    </>
  );
}

/**
 * Renders a {@link FlipBlock} as the export's flip-card grid: one column on small viewports (the
 * export's own mobile behaviour), up to three from `md:`. `chip` tints the badge and the revealed
 * back.
 */
export function FlipBlockView({ block }: { readonly block: FlipBlock }): ReactElement {
  // Stable per-card keys so duplicate front text does not drop or mis-associate
  // flip state (a content key would collide on repeated fronts).
  const keys = useMemo(() => block.cards.map((_card, index) => `card-${index}`), [block.cards]);
  return (
    <ul className={`grid grid-cols-1 gap-4 ${mdGridCols(block.cards.length, 3)}`}>
      {block.cards.map((card, index) => (
        <FlipCardView
          key={keys[index]}
          card={card}
          chip={block.chip}
          frontImage={block.frontImage ?? false}
        />
      ))}
    </ul>
  );
}
