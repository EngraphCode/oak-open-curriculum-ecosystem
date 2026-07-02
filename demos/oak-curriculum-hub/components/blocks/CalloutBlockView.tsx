import Link from 'next/link';
import type { ReactElement } from 'react';

import type { CalloutBlock, CalloutStandard } from '@/lib/blocks/types';

/**
 * Normalises a callout's quality-standard content to a bullet list. A single-standard callout
 * (`qs` + `text`) and a multi-standard callout (`items`) both render as QS-chip-led bullets, per the
 * export authoring rule (canonical-export `CLAUDE.md` — which also forbids the template's
 * chip-beside-the-title layout, so that branch is deliberately not reproduced). A non-standard
 * callout (tip/quote/warning with only `text`) yields no bullets.
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
 * The export's per-variant treatment: left-accent + tint + the 34px circled icon chip (source
 * variant map, lines ~1882-1886). `#93e892` exists only in the export's tip border — literal, like
 * the stats tile palette. Quality-standard callouts override to the export's QS blue family.
 */
const VARIANTS = {
  tip: { accent: 'border-l-[#93e892] bg-oak-green-subdued', icon: '★', iconBg: 'bg-oak-mint' },
  info: {
    accent: 'border-l-oak-lavender bg-oak-lavender-subdued',
    icon: 'i',
    iconBg: 'bg-oak-lavender',
  },
  warning: { accent: 'border-l-oak-amber bg-oak-amber-subdued', icon: '!', iconBg: 'bg-oak-amber' },
  quote: { accent: 'border-l-oak-lemon bg-oak-lemon-subdued', icon: '“', iconBg: 'bg-oak-lemon' },
} as const;

/** The export's QS blue family (#2a6fdb / #e7f0fd / #143b78 — course-export-only values). */
const QS_ACCENT = 'border-l-[#2a6fdb] bg-[#e7f0fd]';
const QS_CHIP =
  'shrink-0 rounded-full border-2 border-[#2a6fdb] bg-white px-[9px] py-[5px] text-[11px] leading-none font-bold tracking-[0.03em] text-[#143b78] no-underline';

/** The QS-chip-led bullet list: each standard verbatim behind its deep-linking code chip. */
function StandardsList({
  standards,
}: {
  readonly standards: readonly CalloutStandard[];
}): ReactElement {
  return (
    <ul className="flex flex-col gap-2">
      {standards.map((standard) => (
        <li key={standard.qs} className="flex items-baseline gap-2">
          <Link href={`/standards#qs=${standard.qs}`} className={QS_CHIP}>
            {standard.qs}
          </Link>
          <span className="min-w-0 flex-1 font-light leading-snug break-words">
            {standard.text}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** The export's "View in quality standards →" call to action, deep-linking every code. */
function QsCta({ standards }: { readonly standards: readonly CalloutStandard[] }): ReactElement {
  const codes = standards.map((standard) => standard.qs).join(',');
  return (
    <Link
      href={`/standards#qs=${codes}`}
      className="mt-3 inline-flex items-center gap-[7px] rounded-lg border-2 border-[#2a6fdb] bg-white p-[9px_13px] text-sm leading-none font-bold text-[#143b78] no-underline shadow-[2px_2px_0_#bcd5f7]"
    >
      View in quality standards <span aria-hidden="true">→</span>
    </Link>
  );
}

/**
 * Renders a {@link CalloutBlock} as the export's callout: black 2px frame with an 8px accent on the
 * left, the variant's tinted body, and the circled icon chip leading the content. Quality-standard
 * callouts take the QS blue family, chip-led verbatim bullets and the view-in-standards call to
 * action; a `quote` shows its prose at the export's italic scale with an optional `attrib`. A styled
 * `<div>` (not a landmark/`role="note"`): with ~76 callouts on the course page, a note/complementary
 * role each would flood the landmark map — the bold title carries the meaning. `data-variant` is
 * retained (Director ruling) so a post-merge CSS extraction can key off it.
 */
export function CalloutBlockView({ block }: { readonly block: CalloutBlock }): ReactElement {
  const standards = toStandards(block);
  const qsLed = standards.length > 0;
  const variant = VARIANTS[block.variant];
  return (
    <div
      data-variant={block.variant}
      className={`flex gap-3.5 rounded-xl border-2 border-oak-black border-l-8 p-[18px_20px] ${qsLed ? QS_ACCENT : variant.accent}`}
    >
      <span
        aria-hidden="true"
        className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border-2 border-oak-black text-lg leading-none font-bold ${variant.iconBg}`}
      >
        {variant.icon}
      </span>
      <div className="min-w-0 flex-1">
        {block.title !== undefined && (
          <p className="mb-1 text-[17px] leading-6 font-bold">{block.title}</p>
        )}
        {qsLed ? (
          <StandardsList standards={standards} />
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
        {qsLed && <QsCta standards={standards} />}
      </div>
    </div>
  );
}
