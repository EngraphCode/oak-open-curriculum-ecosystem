import type { ReactElement } from 'react';

/**
 * The export's dashed media-placeholder slot: an optional badge, the image glyph, and one visible
 * label. Decorative by construction — the glyph is `aria-hidden` and the label is ordinary visible
 * text, so screen readers hear it exactly once (never a `role="img"` double-announce). Shared by the
 * accordion item images and the flip card fronts (the second consumer is why it consolidated here;
 * compare panels carry no images in the course corpus).
 */
export function DashedMediaSlot({
  label,
  badge,
  compact = false,
}: {
  readonly label: string;
  /** The small lemon corner badge (e.g. "IMAGE"); omitted on compact slots. */
  readonly badge?: string;
  /** Compact slots (flip fronts) shrink the glyph and minimum height. */
  readonly compact?: boolean;
}): ReactElement {
  return (
    <span
      className={`relative flex w-full flex-col items-center justify-center border-2 border-dashed border-line-neutral bg-surface-inverted/[.03] text-center ${
        compact
          ? 'min-h-[92px] gap-1.5 rounded-[10px] p-3'
          : 'min-h-[150px] max-w-[440px] gap-2 rounded-xl p-[18px]'
      }`}
    >
      {badge !== undefined && (
        <span className="absolute left-2 top-2 rounded-full border-2 border-line bg-decorative-5 px-[9px] py-1 text-[10px] font-bold tracking-[0.03em]">
          {badge}
        </span>
      )}
      <svg
        aria-hidden="true"
        width={compact ? 28 : 34}
        height={compact ? 28 : 34}
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-ink-subdued"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.6" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      <span
        className={`font-light text-ink-subdued ${compact ? 'text-[12px] leading-4' : 'text-[13px] leading-[18px]'}`}
      >
        {label}
      </span>
    </span>
  );
}
