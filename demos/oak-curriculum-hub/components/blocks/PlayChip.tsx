import type { ReactElement } from 'react';

/**
 * The export's play chip: a surface-role circle with a triangle under a small accent shadow.
 * Shared by the video placeholder and the video-import fallback (extracted at
 * its second consumer).
 */
export function PlayChip(): ReactElement {
  return (
    <span
      aria-hidden="true"
      className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-[3px] border-line bg-surface text-ink shadow-[3px_3px_0_var(--color-accent)]"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  );
}
