import type { ReactElement } from 'react';

import { mdGridCols } from '@/components/blocks/md-grid-cols';
import type { ColumnsBlock } from '@/lib/blocks/types';

/**
 * Renders a {@link ColumnsBlock} as the export's card columns: white cards
 * under the lemon shadow, a module-accent header bar per column, and the
 * green-ticked point list, up to three columns from `md`.
 */
export function ColumnsBlockView({ block }: { readonly block: ColumnsBlock }): ReactElement {
  return (
    <div className={`grid grid-cols-1 gap-4 ${mdGridCols(block.cols.length, 3)}`}>
      {block.cols.map((col) => (
        <section
          key={col.title}
          aria-label={col.title}
          className="shadow-accent-brand flex flex-col overflow-hidden rounded-[14px] border-2 border-line bg-white"
        >
          <h4 className="border-b-2 border-line bg-(--module-accent) p-[13px_18px] text-[17px] leading-[23px] font-bold text-ink">
            {col.title}
          </h4>
          <ul className="flex flex-col gap-[11px] p-[16px_18px]">
            {col.points.map((point) => (
              <li
                key={point}
                className="flex items-start gap-2.5 text-base leading-[23px] font-light"
              >
                <span aria-hidden="true" className="shrink-0 font-bold text-success">
                  ✓
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
