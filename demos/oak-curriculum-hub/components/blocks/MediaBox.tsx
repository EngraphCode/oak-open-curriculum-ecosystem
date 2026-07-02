import type { ReactElement, ReactNode } from 'react';

/**
 * The export's solid media placeholder box (`mediaBox` binding): black 3px
 * frame on the paper tint under the wide lemon shadow, a corner pill naming
 * the media kind, a centred glyph, and the placeholder description. Shared by
 * the image, video and video-import placeholder branches (the dashed
 * equivalent is `DashedMediaSlot`).
 */
export function MediaBox({
  pill,
  pillTone,
  glyph,
  label,
  ariaLabel,
}: {
  readonly pill: string;
  readonly pillTone: 'lemon' | 'black';
  readonly glyph: ReactNode;
  readonly label: string;
  /** Overrides the accessible name when it should differ from the visible label. */
  readonly ariaLabel?: string;
}): ReactElement {
  return (
    <div
      role="img"
      aria-label={ariaLabel ?? label}
      className="shadow-oak-wide-lemon relative flex min-h-[230px] flex-col items-center justify-center rounded-2xl border-[3px] border-oak-black bg-[#f9f9f9] p-6 text-center"
    >
      <span
        className={`absolute top-2.5 left-2.5 rounded-full px-2.5 py-[5px] text-[11px] leading-none font-bold tracking-[0.03em] ${
          pillTone === 'lemon'
            ? 'border-2 border-oak-black bg-oak-lemon text-oak-black'
            : 'bg-oak-black text-white'
        }`}
      >
        {pill}
      </span>
      {glyph}
      <span className="mt-2.5 max-w-[80%] text-sm leading-5 font-light text-oak-grey">{label}</span>
    </div>
  );
}
