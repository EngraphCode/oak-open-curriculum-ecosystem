import type { ReactElement } from 'react';

/**
 * The export's white play chip: circled triangle under a small lemon shadow.
 * Shared by the video placeholder and the video-import fallback (extracted at
 * its second consumer).
 */
export function PlayChip(): ReactElement {
  return (
    <span
      aria-hidden="true"
      className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-[3px] border-line bg-white shadow-[3px_3px_0_#ffe555]"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="#222222">
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  );
}
