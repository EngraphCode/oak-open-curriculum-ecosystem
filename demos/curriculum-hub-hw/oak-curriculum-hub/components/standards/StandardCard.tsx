import type { ReactElement } from 'react';
import type { StandardCardVM } from '@/lib/standards-view-model';

/**
 * A single quality-standard result card for the `/standards` browser: the QS id, an optional
 * type pill, the standard text, an optional rubric code, and the guidance-area + component tags —
 * reproducing the `Oak Standards.dc.html` card. The whole card is a `<button>` that opens the
 * standard's detail view (native keyboard + focus; an explicit `aria-label` gives it a concise
 * accessible name). Guidance-area tag colours are data-derived, so they are inline styles.
 */

/** Inline style for a data-derived guidance-area tag colour. */
function areaTagStyle(colour: string): { readonly backgroundColor: string } {
  return { backgroundColor: colour };
}

/** The type pill ("Required" lemon / "Model" lavender); nothing for an untyped standard. */
function TypePill({ card }: { readonly card: StandardCardVM }): ReactElement | null {
  if (card.typeVariant === 'none') {
    return null;
  }
  const tint = card.typeVariant === 'required' ? 'bg-oak-lemon' : 'bg-oak-lavender-subdued';
  return (
    <span
      className={`shrink-0 rounded-full border-2 border-oak-black px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.03em] text-oak-black ${tint}`}
    >
      {card.typeLabel}
    </span>
  );
}

/** The guidance-area + component tag row beneath a card's headline; nothing when a card has none. */
function CardTags({ card }: { readonly card: StandardCardVM }): ReactElement | null {
  if (card.areaTags.length === 0 && card.componentTags.length === 0) {
    return null;
  }
  return (
    <span className="mt-3 flex flex-wrap items-center gap-2 border-t border-dashed border-oak-grey-line pt-3">
      {card.areaTags.map((tag) => (
        <span
          key={tag.label}
          style={areaTagStyle(tag.colour)}
          className="rounded-full border-2 border-oak-black px-2.5 py-1 text-[12px] font-bold text-oak-black"
        >
          {tag.label}
        </span>
      ))}
      {card.componentTags.map((component) => (
        <span
          key={component}
          className="rounded-full border border-oak-grey-line px-2.5 py-1 text-[12px] text-oak-grey"
        >
          {component}
        </span>
      ))}
    </span>
  );
}

export function StandardCard({
  card,
  onOpen,
}: {
  readonly card: StandardCardVM;
  readonly onOpen: (id: string) => void;
}): ReactElement {
  return (
    <button
      type="button"
      aria-label={`${card.id}: ${card.text}`}
      onClick={() => onOpen(card.id)}
      className="w-full rounded-oak-l border-2 border-oak-black bg-white px-5 py-[18px] text-left shadow-oak-lemon transition-transform hover:-translate-y-0.5 hover:shadow-oak-wide-lemon"
    >
      <span className="flex items-start gap-3.5">
        <span className="shrink-0 rounded-oak-m border-2 border-oak-navy bg-oak-lavender-subdued px-2.5 py-1.5 text-[12px] font-bold text-oak-navy">
          {card.id}
        </span>
        <TypePill card={card} />
        <span className="flex-1 text-[18px] leading-[26px]">{card.text}</span>
        {card.hasCode && (
          <span className="shrink-0 rounded-oak-m border-2 border-oak-grey-line px-2 py-1.5 text-[12px] font-bold text-oak-grey">
            {card.code}
          </span>
        )}
        <span aria-hidden className="shrink-0 self-center text-[22px] font-bold text-oak-grey">
          ›
        </span>
      </span>
      <CardTags card={card} />
    </button>
  );
}
