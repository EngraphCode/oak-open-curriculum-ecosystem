import type { ReactElement } from 'react';

import type { AccordionBlock, AccordionItem } from '@/lib/blocks/types';

import { DashedMediaSlot } from './DashedMediaSlot';

/** One accordion item: an export-exact white card `<details>` with chip badge, dashed divider body. */
function AccordionItemView({
  item,
  chip,
}: {
  item: AccordionItem;
  chip: string | undefined;
}): ReactElement {
  return (
    <details className="overflow-hidden rounded-xl border-2 border-oak-black bg-white shadow-oak-lemon">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-[18px] py-4 text-[18px] font-bold leading-6 [&::-webkit-details-marker]:hidden">
        {item.badge !== undefined && (
          <span
            aria-hidden="true"
            style={chip === undefined ? undefined : { backgroundColor: chip }}
            className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full border-2 border-oak-black text-[14px] font-bold ${
              chip === undefined ? 'bg-(--module-accent)' : ''
            }`}
          >
            {item.badge}
          </span>
        )}
        <span className="flex-1">{item.q}</span>
        <span aria-hidden="true" className="text-[22px] leading-none text-oak-grey">
          +
        </span>
      </summary>
      <div className="border-t border-dashed border-oak-grey-40 px-[18px] pb-[18px] pt-3.5">
        {item.a.map((para) => (
          <p key={para} className="mb-2.5 text-[17px] font-light leading-[27px]">
            {para}
          </p>
        ))}
        {item.img !== undefined && (
          <figure className="mb-3.5 mt-1">
            <DashedMediaSlot label={item.img.placeholder} badge="IMAGE" />
          </figure>
        )}
        {item.features !== undefined && <FeatureList features={item.features} />}
      </div>
    </details>
  );
}

/** The export's green-ticked "In Oak lessons" feature list inside an opened accordion item. */
function FeatureList({ features }: { features: readonly string[] }): ReactElement {
  return (
    <div className="mt-1.5">
      <p className="mb-2 text-[13px] font-bold uppercase leading-none tracking-[0.04em] text-oak-green">
        In Oak lessons
      </p>
      <ul className="flex flex-col gap-1.5">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-[9px] text-[16px] font-light leading-[23px]"
          >
            <span aria-hidden="true" className="shrink-0 font-bold text-oak-green">
              ✓
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Renders an {@link AccordionBlock} using native `<details>`/`<summary>` (keyboard-operable and
 * screen-reader-announced without JavaScript — the most robust WCAG-AA choice), styled export-exact:
 * white cards with lemon shadow, chip badges tinted `block.chip` or the module accent
 * (`--module-accent`, set by the player's module gate), dashed body divider, green feature ticks.
 */
export function AccordionBlockView({ block }: { block: AccordionBlock }): ReactElement {
  return (
    <div className="flex flex-col gap-3">
      {block.items.map((item) => (
        <AccordionItemView key={item.q} item={item} chip={block.chip} />
      ))}
    </div>
  );
}
