'use client';

import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';

import type { HotspotBlock } from '@/lib/blocks/types';

/** The export's fixed marker position table; spots beyond it centre (export fallback). */
const POSITIONS = [
  { left: '26%', top: '34%' },
  { left: '52%', top: '58%' },
  { left: '76%', top: '38%' },
  { left: '40%', top: '72%' },
  { left: '64%', top: '24%' },
] as const;

const CENTRE = { left: '50%', top: '50%' } as const;

/** One numbered circle marker at its fixed export position on the canvas. */
function HotspotMarker({
  index,
  title,
  active,
  onSelect,
}: {
  readonly index: number;
  readonly title: string;
  readonly active: boolean;
  readonly onSelect: () => void;
}): ReactElement {
  return (
    <button
      type="button"
      aria-label={`${index + 1}: ${title}`}
      aria-pressed={active}
      style={POSITIONS.at(index) ?? CENTRE}
      className={`absolute z-[2] flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-line text-[17px] leading-none font-bold transition-all ${
        active
          ? 'scale-[1.15] bg-selected shadow-[0_0_0_4px_rgba(255,229,85,0.6)]'
          : 'shadow-ink-brand bg-white'
      }`}
      onClick={onSelect}
    >
      {index + 1}
    </button>
  );
}

/** The white detail card announcing the active spot: number chip, title, text. */
function SpotDetail({
  num,
  title,
  text,
}: {
  readonly num: number;
  readonly title: string;
  readonly text: string;
}): ReactElement {
  return (
    // Native <output> carries the implicit status role; the inner rows are
    // block-styled phrasing elements (output's content model) — a live region
    // announcing title + text needs no paragraph semantics.
    <output className="mt-3.5 block min-h-[90px] rounded-xl border-2 border-line bg-white p-[16px_18px]">
      <span className="mb-1.5 flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-inverted text-sm leading-none font-bold text-ink-inverted"
        >
          {num}
        </span>
        <span className="text-[17px] leading-[22px] font-bold">{title}</span>
      </span>
      <span className="block max-w-[64ch] text-base leading-6 font-light">{text}</span>
    </output>
  );
}

/**
 * Renders a {@link HotspotBlock} as the export's lavender 16:9 canvas with
 * numbered circle markers at the source's fixed positions; selecting one
 * reveals its title + text in the `role="status"` detail card below. Markers
 * are real buttons in DOM order (keyboard-operable, `aria-pressed`); their
 * accessible names carry the visible number AND the spot title.
 */
export function HotspotBlockView({ block }: { readonly block: HotspotBlock }): ReactElement {
  const [active, setActive] = useState(0);
  const spot = block.spots.at(active);
  // Stable per-spot keys so duplicate titles do not drop or mis-associate
  // roving state (a content key would collide on repeated titles).
  const keys = useMemo(() => block.spots.map((_entry, index) => `spot-${index}`), [block.spots]);
  return (
    <div>
      <div className="shadow-accent-wide-brand relative aspect-[16/9] overflow-hidden rounded-2xl border-[3px] border-line bg-decorative-3-subtle">
        <div
          role="img"
          aria-label={block.placeholder}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2"
        >
          {/* Only the glyph is faded: 50% on the whole box composited the label to 2.15:1 (AA 1.4.3). */}
          <svg
            width="42"
            height="42"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#575757"
            strokeWidth="1.5"
            aria-hidden="true"
            className="opacity-50"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 16l5-5 4 4 3-3 6 6" />
          </svg>
          <span className="text-[13px] leading-[18px] font-light text-ink-subdued">
            {block.placeholder}
          </span>
        </div>
        {block.spots.map((entry, index) => (
          <HotspotMarker
            key={keys[index]}
            index={index}
            title={entry.title}
            active={index === active}
            onSelect={() => setActive(index)}
          />
        ))}
      </div>
      {spot !== undefined && <SpotDetail num={active + 1} title={spot.title} text={spot.text} />}
    </div>
  );
}
