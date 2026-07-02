import Link from 'next/link';
import type { ReactElement } from 'react';

import type { CalloutBlock, CalloutStandard } from '@/lib/blocks/types';

/**
 * Normalises a callout's quality-standard content to a bullet list. A single-standard callout
 * (`qs` + `text`) and a multi-standard callout (`items`) both render as QS-chip-led bullets, per the
 * export authoring rule (canonical-export `CLAUDE.md`). A non-standard callout (tip/quote/warning
 * with only `text`) yields no bullets.
 */
function toStandards(block: CalloutBlock): readonly CalloutStandard[] {
  if (block.items !== undefined) {
    return block.items;
  }
  if (block.qs !== undefined && block.text !== undefined) {
    const { text } = block;
    return block.qs.map((qs) => ({ qs, text }));
  }
  return [];
}

/**
 * The per-variant colour treatment (border accent + tint), matched to the canonical export: `tip` is
 * green (the "Welcome" box), `info` is navy/blue (the quality-standard callout — border + QS chip per
 * the export `CLAUDE.md`), `warning` is amber on its subdued tint and `quote` is lemon on
 * lemon-subdued (both read from the export's variant map, source lines ~1882-1886). The
 * `data-variant` attribute is retained (Director ruling) so a post-merge CSS extraction can key off it.
 */
function variantClass(variant: CalloutBlock['variant']): string {
  let className: string;
  switch (variant) {
    case 'tip':
      className = 'border-oak-green bg-oak-mint-subdued';
      break;
    case 'info':
      className = 'border-oak-navy bg-oak-lavender-subdued';
      break;
    case 'warning':
      className = 'border-oak-amber bg-oak-amber-subdued';
      break;
    case 'quote':
      className = 'border-oak-lemon bg-oak-lemon-subdued';
      break;
  }
  return className;
}

/**
 * Renders a {@link CalloutBlock} as a tinted, left-accented box. Quality-standard callouts show each
 * standard as a QS-code chip (deep-linking `/standards#qs=<id>`) followed by its verbatim wording;
 * other variants show their prose. Some source callouts carry no title (the title is then omitted) and
 * a `quote` variant may carry an `attrib`. A styled `<div>` (not a landmark/`role="note"`): with ~76
 * callouts on the course page, a note/complementary role each would flood the landmark map — the bold
 * title carries the meaning.
 */
export function CalloutBlockView({ block }: { block: CalloutBlock }): ReactElement {
  const standards = toStandards(block);
  return (
    <div
      data-variant={block.variant}
      className={`rounded-xl border-2 border-l-[6px] px-5 py-4 ${variantClass(block.variant)}`}
    >
      {block.title !== undefined && <p className="mb-1.5 font-bold leading-tight">{block.title}</p>}
      {standards.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {standards.map((standard) => (
            <li key={standard.qs} className="flex items-baseline gap-2">
              <Link
                href={`/standards#qs=${standard.qs}`}
                className="shrink-0 rounded-md border-2 border-oak-navy bg-white px-1.5 py-0.5 text-[12px] font-bold text-oak-navy no-underline"
              >
                {standard.qs}
              </Link>
              <span className="font-light leading-snug">{standard.text}</span>
            </li>
          ))}
        </ul>
      ) : (
        block.text !== undefined && (
          <p
            className={
              block.variant === 'quote'
                ? 'text-[20px] leading-[29px] font-normal italic'
                : 'font-light leading-relaxed'
            }
          >
            {block.text}
          </p>
        )
      )}
      {block.attrib !== undefined && (
        <p className="mt-2 text-[14px] font-light text-oak-grey">
          <cite>— {block.attrib}</cite>
        </p>
      )}
    </div>
  );
}
