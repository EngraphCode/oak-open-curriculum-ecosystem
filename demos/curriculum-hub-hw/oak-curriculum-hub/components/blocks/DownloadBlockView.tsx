import type { ReactElement } from 'react';

import type { DownloadBlock } from '@/lib/blocks/types';

/** The export's lemon-tinted PDF file chip beside the download card's copy. */
function FileChip(): ReactElement {
  return (
    <span
      aria-hidden="true"
      className="flex h-[58px] w-[50px] shrink-0 flex-col items-center justify-center gap-[3px] rounded-lg border-2 border-oak-black bg-oak-lemon-subdued"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#222222"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
      </svg>
      <span className="text-[9px] leading-none font-bold tracking-[0.06em]">PDF</span>
    </span>
  );
}

/**
 * Renders a {@link DownloadBlock} as the export's download card: file chip,
 * title/description/meta, and the black Download pill. Uses a plain
 * `<a download>` (not `next/link`) because the target is a bundled static
 * asset, not an app route; the data's relative `href` resolves from the site
 * root (`/assets/…`).
 */
export function DownloadBlockView({ block }: { block: DownloadBlock }): ReactElement {
  return (
    <a
      href={`/${block.href}`}
      download
      className="shadow-oak-wide-lemon flex flex-wrap items-center gap-4 rounded-[14px] border-[3px] border-oak-black bg-white p-[18px_20px] text-oak-black no-underline"
    >
      <FileChip />
      <span className="min-w-[180px] flex-1">
        <span className="block text-lg leading-6 font-bold">{block.title}</span>
        <span className="mt-[3px] block text-[15px] leading-[22px] font-light text-oak-grey">
          {block.desc}
        </span>
        <span className="mt-[9px] block text-[13px] leading-none font-bold text-oak-grey">
          {block.meta}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2 rounded-lg border-2 border-oak-black bg-oak-black p-[11px_16px] text-sm leading-none font-bold text-white">
        Download
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <path d="M7 10l5 5 5-5" />
          <path d="M12 15V3" />
        </svg>
      </span>
    </a>
  );
}
