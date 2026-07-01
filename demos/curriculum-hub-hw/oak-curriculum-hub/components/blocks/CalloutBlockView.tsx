import Link from 'next/link';
import type { ReactElement } from 'react';

import type { CalloutBlock, CalloutStandard } from '@/lib/blocks/types';

/**
 * Normalises a callout's quality-standard content to a bullet list. A
 * single-standard callout (`qs` + `text`) and a multi-standard callout
 * (`items`) both render as QS-chip-led bullets, per the export authoring rule
 * (canonical-export `CLAUDE.md`). A non-standard callout (tip/quote/warning with
 * only `text`) yields no bullets.
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
 * Renders a {@link CalloutBlock}. Quality-standard callouts show each standard
 * as a QS-code chip (deep-linking `/standards#qs=<id>`) followed by its verbatim
 * wording; other variants show their prose. Some source callouts carry no title
 * (the title `<p>` is then omitted) and a `quote` variant may carry an `attrib`,
 * rendered as a `<cite>` citation. `variant` drives colour in the styling pass
 * (kept as `data-variant` here); `role="note"` keeps it announced without colour.
 */
export function CalloutBlockView({ block }: { block: CalloutBlock }): ReactElement {
  const standards = toStandards(block);
  return (
    <aside role="note" aria-label={block.title} data-variant={block.variant}>
      {block.title !== undefined && <p>{block.title}</p>}
      {standards.length > 0 ? (
        <ul>
          {standards.map((standard) => (
            <li key={standard.qs}>
              <Link href={`/standards#qs=${standard.qs}`}>{standard.qs}</Link> {standard.text}
            </li>
          ))}
        </ul>
      ) : (
        block.text !== undefined && <p>{block.text}</p>
      )}
      {block.attrib !== undefined && (
        <p>
          <cite>— {block.attrib}</cite>
        </p>
      )}
    </aside>
  );
}
