import Link from 'next/link';
import type { ReactElement } from 'react';

import type { CourseHit, StandardHit } from '@/lib/hub-search';

export const mutedClass = 'text-[14px] text-oak-grey';

/** Cream notice card for search states that need a sentence, not a result list.
 *  Shared by the hub's live group and the /curriculum showcase. */
export function Notice({ title, body }: { title: string; body: string }): ReactElement {
  return (
    <div className="max-w-[560px] rounded-[10px] border-2 border-l-[6px] border-oak-black bg-oak-notice px-[18px] py-4">
      <div className="mb-1 text-base font-semibold leading-tight">{title}</div>
      <div className="text-sm leading-[1.55] text-oak-grey">{body}</div>
    </div>
  );
}

/** A clickable result row: black-bordered white pill with a lemon hover shadow, matching the
 *  card affordance elsewhere on the hub. Used by both local-search groups below. */
const rowLinkClass =
  'flex items-center gap-3 rounded-xl border-2 border-oak-black bg-white px-4 py-3 text-oak-black no-underline transition-shadow hover:shadow-oak-lemon';

/** Tinted section header (placeholder icon tile until Oak section glyphs land), with an
 *  optional live badge + subtitle. Shared by the local groups here and the live curriculum
 *  group in HubResults (one-way import: HubResults consumes this module). */
export function GroupHeader({
  title,
  tint,
  live = false,
  subtitle,
}: {
  title: string;
  tint: string;
  live?: boolean;
  subtitle?: string;
}): ReactElement {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2.5">
      <span
        className={`h-8 w-8 shrink-0 rounded-oak-m2 border-2 border-oak-black ${tint}`}
        aria-hidden
      />
      <h3 className="text-lg font-semibold leading-none">{title}</h3>
      {live && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-oak-mint px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-oak-black">
          <span className="h-1.5 w-1.5 rounded-full bg-oak-green" aria-hidden />
          {/* explicit expression: no whitespace text-node ambiguity beside the dot */}
          {'Live'}
        </span>
      )}
      {subtitle !== undefined && <span className={mutedClass}>{subtitle}</span>}
    </div>
  );
}

/** Local "In the training courses" group: bundled course sections matched via `searchHub`, each
 *  deep-linking into the course player. Exported for component tests. */
export function TrainingGroup({ hits }: { hits: readonly CourseHit[] }): ReactElement {
  return (
    <section>
      <GroupHeader title="In the training courses" tint="bg-oak-aqua" />
      {hits.length === 0 ? (
        <p className={mutedClass}>No matching training courses.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {hits.map((h) => (
            <Link key={h.href} href={h.href} className={rowLinkClass}>
              <span className="flex-1 text-[14px] font-semibold leading-snug">{h.title}</span>
              <span className="shrink-0 text-[12px] font-bold uppercase tracking-wide text-oak-grey">
                {h.module}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

/** Local "Quality standards" group: bundled standards matched via `searchHub`, each deep-linking to
 *  `/standards#qs=<id>` (the same focus mode Course callouts target). Exported for component tests. */
export function StandardsGroup({ hits }: { hits: readonly StandardHit[] }): ReactElement {
  return (
    <section>
      <GroupHeader title="Quality standards" tint="bg-oak-lavender" />
      {hits.length === 0 ? (
        <p className={mutedClass}>No matching quality standards.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {hits.map((h) => (
            <Link key={h.id} href={h.href} className={rowLinkClass}>
              <span className="shrink-0 rounded-oak-s border border-oak-navy px-2 py-0.5 text-[11px] font-bold text-oak-navy">
                {h.id}
              </span>
              <span className="flex-1 text-[14px] leading-snug">{h.text}</span>
              {h.area !== '' && (
                <span className="shrink-0 rounded-full border border-oak-grey-line px-2.5 py-1 text-[11px] font-bold text-oak-grey">
                  {h.area}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
