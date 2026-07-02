import type { ReactElement } from 'react';

import type { SummaryBlock } from '@/lib/blocks/types';

/**
 * Renders a {@link SummaryBlock} as the export's pair: a white "Key takeaways"
 * card of green-ticked points over the lemon "Reflect as you design" box with
 * its ? chip. The ticks and chip are decorative.
 */
export function SummaryBlockView({ block }: { block: SummaryBlock }): ReactElement {
  return (
    <section aria-label="Summary" className="flex flex-col gap-4">
      <div className="shadow-oak-lemon rounded-[14px] border-2 border-oak-black bg-white p-[20px_22px_22px]">
        <p className="mb-3.5 text-[13px] leading-none font-bold tracking-[0.04em] uppercase text-oak-grey">
          Key takeaways
        </p>
        <ul className="flex flex-col gap-[13px]">
          {block.points.map((point) => (
            <li
              key={point}
              className="flex items-start gap-3 text-[17px] leading-[26px] font-light"
            >
              <span
                aria-hidden="true"
                className="shrink-0 text-[19px] leading-[26px] font-bold text-oak-green"
              >
                ✓
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
      {block.question !== undefined && (
        <div className="flex gap-3.5 rounded-xl border-2 border-l-8 border-oak-black border-l-oak-lemon bg-oak-lemon-subdued p-[18px_20px]">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-oak-black bg-oak-lemon text-lg leading-none font-bold"
          >
            ?
          </span>
          <div className="flex-1">
            <p className="mb-1.5 text-[13px] leading-none font-bold tracking-[0.04em] uppercase">
              Reflect as you design
            </p>
            <p className="text-lg leading-[27px] font-normal">{block.question}</p>
          </div>
        </div>
      )}
    </section>
  );
}
