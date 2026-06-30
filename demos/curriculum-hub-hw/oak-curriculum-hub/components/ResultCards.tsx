import type { ReactElement } from 'react';
import type { Hit } from '@/lib/search-client';
import { subjectName, subjectBg, keyStageLabel } from './subjects';

// Static chip shape; the background colour is data-driven (subjects.ts owns the
// per-subject pastel palette), so it stays an inline style on the element.
const chipClass =
  'inline-flex items-center rounded-full border-2 border-oak-black px-2.5 py-[5px] text-[11px] font-bold text-oak-black';
const ksChipClass =
  'inline-flex items-center rounded-full border border-oak-grey-line px-[9px] py-[5px] text-[11px] font-bold text-oak-grey';

// Oak's signature interaction: lemon offset shadow that widens on hover and
// collapses as the card translates +2/+2 on press.
const lemonCardClass =
  'flex no-underline text-oak-black border-2 border-oak-black bg-white shadow-oak-lemon ' +
  'transition-[box-shadow,transform] duration-150 hover:shadow-oak-wide-lemon ' +
  'active:translate-x-0.5 active:translate-y-0.5 active:shadow-none';

export function LessonCard({ hit }: { hit: Hit }): ReactElement {
  return (
    <a
      href={hit.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${lemonCardClass} flex-col gap-[9px] rounded-xl px-[17px] py-[15px]`}
    >
      <div className="flex flex-wrap items-center gap-[7px]">
        {hit.subjectSlug && (
          <span className={chipClass} style={{ backgroundColor: subjectBg(hit.subjectSlug) }}>
            {subjectName(hit.subjectSlug)}
          </span>
        )}
        {hit.keyStage && (
          <span className={ksChipClass}>
            {keyStageLabel(hit.keyStage)}
            {hit.years?.length ? ` · Year ${hit.years.join(', ')}` : ''}
          </span>
        )}
      </div>
      <span className="text-base font-semibold leading-[22px]">{hit.title}</span>
      {hit.unitTitle && (
        <span className="text-[13px] font-light leading-[18px] text-oak-grey">
          Unit: {hit.unitTitle}
        </span>
      )}
      {hit.snippet && (
        <span
          className="text-[13px] font-light leading-[18px] text-oak-grey"
          // ES highlight markup is trusted server content; render emphasis.
          dangerouslySetInnerHTML={{ __html: hit.snippet }}
        />
      )}
      <span className="mt-0.5 text-[13px] font-bold text-oak-navy">Open lesson on Oak ↗</span>
    </a>
  );
}

export function UnitCard({ hit }: { hit: Hit }): ReactElement {
  return (
    <a
      href={hit.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${lemonCardClass} items-center gap-[14px] rounded-xl px-[18px] py-[14px]`}
    >
      {hit.subjectSlug && (
        <span className={chipClass} style={{ backgroundColor: subjectBg(hit.subjectSlug) }}>
          {subjectName(hit.subjectSlug)}
        </span>
      )}
      <span className="flex-1 text-base font-semibold leading-[22px]">{hit.title}</span>
      {typeof hit.lessonCount === 'number' && (
        <span className={`${ksChipClass} flex-none`}>{hit.lessonCount} lessons</span>
      )}
      <span className="flex-none text-[13px] font-bold text-oak-navy">↗</span>
    </a>
  );
}

export function ThreadCard({ hit }: { hit: Hit }): ReactElement {
  return (
    <a
      href={hit.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2.5 rounded-full border-2 border-oak-black bg-oak-pink-subdued px-4 py-[9px] text-oak-black no-underline shadow-oak-grey transition-transform duration-150 active:translate-x-0.5 active:translate-y-0.5"
    >
      <span className="text-[15px] font-semibold leading-none">{hit.title}</span>
      {typeof hit.unitCount === 'number' && (
        <span className="text-xs font-bold text-oak-grey">{hit.unitCount} units</span>
      )}
    </a>
  );
}
