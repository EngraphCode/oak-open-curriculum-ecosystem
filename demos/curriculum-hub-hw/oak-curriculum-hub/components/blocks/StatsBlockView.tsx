import type { ReactElement } from 'react';

import { mdGridCols } from '@/components/blocks/md-grid-cols';
import type { StatsBlock } from '@/lib/blocks/types';

/**
 * The export's stat-tile palette, cycled by position (`palette[i % 7]` — the data carries no
 * per-item colour). Export-exact values: four match Oak tokens (mint, lavender, aqua, pink);
 * #fff2aa, #ffc8a6 and #cdbdf2 exist only in the export's tile palette, so all stay literal.
 */
const TILE_PALETTE = [
  '#bef2bd',
  '#a0b6f2',
  '#b0e2de',
  '#deb7d5',
  '#fff2aa',
  '#ffc8a6',
  '#cdbdf2',
] as const;

/**
 * Renders a {@link StatsBlock} as the export's pastel tile grid (max 4 across; 2px black border,
 * 12px radius, lemon offset shadow; big bold value over a light label), with the optional intro and
 * note as plain paragraphs. Two tile columns on small viewports (the export's own mobile
 * behaviour), up to four from `md:`. Semantic list retained — the value leads each item so it
 * reads first.
 */
export function StatsBlockView({ block }: { block: StatsBlock }): ReactElement {
  return (
    <section aria-label="Statistics">
      {block.intro !== undefined && <p className="mb-4 text-[17px] font-light leading-[27px]">{block.intro}</p>}
      <ul className={`grid grid-cols-2 gap-3 ${mdGridCols(block.items.length, 4)}`}>
        {block.items.map((item, index) => (
          <li
            key={item.label}
            style={{ backgroundColor: TILE_PALETTE[index % TILE_PALETTE.length] }}
            className="rounded-xl border-2 border-oak-black px-4 pb-[18px] pt-4 shadow-oak-lemon"
          >
            <strong className="block text-[26px] font-bold leading-tight">{item.value}</strong>
            <span className="mt-1 block text-[14px] font-light leading-snug">{item.label}</span>
          </li>
        ))}
      </ul>
      {block.note !== undefined && (
        <p className="mt-3 text-[13px] font-light leading-[18px] text-oak-grey">{block.note}</p>
      )}
    </section>
  );
}
