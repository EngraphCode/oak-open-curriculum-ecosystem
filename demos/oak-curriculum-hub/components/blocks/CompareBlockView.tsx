import type { ReactElement } from 'react';

import type { CompareBlock } from '@/lib/blocks/types';

/**
 * Renders a {@link CompareBlock} as the export's example / non-example pair:
 * a green "✓ Example" and red "✕ Non-example" bar heading each tinted panel,
 * side by side from `md`. Each panel's accessible name matches its visible
 * bar text; the bar glyphs are decorative. The export template's dashed image
 * slot is not reproduced — no compare block in the course corpus carries
 * `goodImg`/`badImg` (the bindings exist only in the template).
 */
export function CompareBlockView({ block }: { readonly block: CompareBlock }): ReactElement {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* aria-label (matching the visible bar exactly) rather than aria-labelledby: this is a
          server component, so useId is unavailable and blocks carry no stable per-block id. */}
      <section
        aria-label="Example"
        className="overflow-hidden rounded-[14px] border-2 border-line-success bg-success-subtle"
      >
        <p className="flex items-center gap-2 bg-success-subtle p-[10px_16px] text-[15px] leading-[1.3] font-bold text-ink">
          <span aria-hidden="true" className="text-lg">
            ✓
          </span>{' '}
          Example
        </p>
        <div className="p-[16px_18px]">
          <p className="mb-2.5 text-base leading-6 font-light">{block.goodText}</p>
          {block.goodNote !== undefined && (
            <p className="mt-2.5 text-sm leading-[21px] font-light text-ink-subdued">
              {block.goodNote}
            </p>
          )}
        </div>
      </section>
      <section
        aria-label="Non-example"
        className="overflow-hidden rounded-[14px] border-2 border-line-error bg-error-subtle"
      >
        <p className="flex items-center gap-2 bg-error-subtle p-[10px_16px] text-[15px] leading-[1.3] font-bold text-ink">
          <span aria-hidden="true" className="text-lg">
            ✕
          </span>{' '}
          Non-example
        </p>
        <div className="p-[16px_18px]">
          <p className="mb-2.5 text-base leading-6 font-light">{block.badText}</p>
          {block.badNote !== undefined && (
            <p className="mt-2.5 text-sm leading-[21px] font-light text-ink-subdued">
              {block.badNote}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
