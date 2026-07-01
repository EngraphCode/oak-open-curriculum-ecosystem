'use client';

import type { ReactElement } from 'react';
import Link from 'next/link';
import { useCurriculumSearch, type CurriculumSearchState } from '@/lib/use-curriculum-search';
import { searchHub, type CourseHit, type StandardHit } from '@/lib/hub-search';
import type { SearchResults } from '@/lib/search-types';
import { LessonCard, UnitCard, ThreadCard } from './ResultCards';

const groupLabelClass = 'mb-2.5 text-xs font-bold uppercase tracking-[0.05em] text-oak-grey';
const mutedClass = 'text-[14px] text-oak-grey';

/** A clickable result row: black-bordered white pill with a lemon hover shadow, matching the
 *  card affordance elsewhere on the hub. Used by both local-search groups below. */
const rowLinkClass =
  'flex items-center gap-3 rounded-xl border-2 border-oak-black bg-white px-4 py-3 text-oak-black no-underline transition-shadow hover:shadow-oak-lemon';

/** Tinted section header (placeholder icon tile until Oak section glyphs land), with an
 *  optional live badge + subtitle. */
function GroupHeader({
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
          Live
        </span>
      )}
      {subtitle !== undefined && <span className={mutedClass}>{subtitle}</span>}
    </div>
  );
}

function Notice({ title, body }: { title: string; body: string }): ReactElement {
  return (
    <div className="max-w-[560px] rounded-[10px] border-2 border-l-[6px] border-oak-black bg-oak-notice px-[18px] py-4">
      <div className="mb-1 text-base font-semibold leading-tight">{title}</div>
      <div className="text-sm leading-[1.55] text-oak-grey">{body}</div>
    </div>
  );
}

function CurriculumBody({ results }: { results: SearchResults }): ReactElement {
  return (
    <div className="flex flex-col gap-6">
      {results.lessons.length > 0 && (
        <div>
          <div className={groupLabelClass}>Lessons</div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(330px,1fr))] gap-3">
            {results.lessons.map((h) => (
              <LessonCard key={h.id} hit={h} />
            ))}
          </div>
        </div>
      )}
      {results.units.length > 0 && (
        <div>
          <div className={groupLabelClass}>Units</div>
          <div className="flex flex-col gap-2.5">
            {results.units.map((h) => (
              <UnitCard key={h.id} hit={h} />
            ))}
          </div>
        </div>
      )}
      {results.threads.length > 0 && (
        <div>
          <div className={groupLabelClass}>Learning threads</div>
          <div className="flex flex-wrap gap-2.5">
            {results.threads.map((h) => (
              <ThreadCard key={h.id} hit={h} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** A polite screen-reader announcement of the live-curriculum search state, so its async resolution
 *  (loading → results / empty / error) is not silent to AT users (WCAG 2.2 SC 4.1.3). */
function curriculumAnnouncement(state: CurriculumSearchState): string {
  if (state.status === 'ok') {
    const { lessons, units, threads } = state.results;
    const total = lessons.length + units.length + threads.length;
    return `${total} ${total === 1 ? 'result' : 'results'} from the Oak curriculum`;
  }
  if (state.status === 'loading') {
    return 'Searching the Oak curriculum';
  }
  if (state.status === 'unconfigured') {
    return 'Oak curriculum search is not configured';
  }
  if (state.status === 'error') {
    return 'Oak curriculum search failed';
  }
  // 'empty' and 'idle' both announce the no-results state (idle only occurs off-screen).
  return state.status === 'empty' ? 'No matching Oak curriculum results' : '';
}

/** The live "From the Oak curriculum" group — lessons, units and threads via the SDK seam. A polite
 *  live region announces the async search state. Exported for direct component tests. */
export function CurriculumGroup({ state }: { state: CurriculumSearchState }): ReactElement {
  return (
    <section>
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {curriculumAnnouncement(state)}
      </p>
      <GroupHeader
        title="From the Oak curriculum"
        tint="bg-oak-mint"
        live
        subtitle="Lessons, units and threads from thenational.academy"
      />
      {state.status === 'loading' && <p className={mutedClass}>Searching…</p>}
      {state.status === 'ok' && <CurriculumBody results={state.results} />}
      {state.status === 'empty' && <p className={mutedClass}>No matching lessons, units or threads.</p>}
      {state.status === 'unconfigured' && (
        <Notice
          title="Search backend not configured"
          body="Set ELASTICSEARCH_URL and ELASTICSEARCH_API_KEY in .env to connect live curriculum search."
        />
      )}
      {state.status === 'error' && (
        <Notice title="Something went wrong" body="The curriculum search request failed. Check the server logs." />
      )}
    </section>
  );
}

/** Local "In the training courses" group: the bundled training sections matched via `searchHub`,
 *  each linking to its `/course#section=<id>` anchor. Exported for direct component tests. */
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

/** Results header: a polite live region (WCAG 2.2 SC 4.1.3) announcing the results view for the
 *  query — the destinations→results toggle is otherwise silent to AT users — plus a clear-search
 *  control. Focus is deliberately NOT moved. Exported for direct component tests. */
export function ResultsHeader({ query, onClear }: { query: string; onClear: () => void }): ReactElement {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="text-[22px] font-semibold leading-tight"
      >
        Results for &ldquo;{query.trim()}&rdquo;
      </p>
      <button
        type="button"
        onClick={onClear}
        className="shrink-0 rounded-full border-2 border-oak-black bg-white px-4 py-1.5 text-[13px] font-bold text-oak-black transition-shadow hover:shadow-oak-lemon"
      >
        Clear search
      </button>
    </div>
  );
}

/**
 * The unified hub-wide search results: the live curriculum group plus the static
 * training-courses and quality-standards groups, all keyed off one query. Rendered by
 * HubLanding when the hero query is non-empty.
 */
export default function HubResults({
  query,
  onClear,
}: {
  query: string;
  onClear: () => void;
}): ReactElement {
  const curriculum = useCurriculumSearch(query);
  const { courseHits, stdHits } = searchHub(query);
  return (
    <div className="mx-auto max-w-[1080px] px-6 pt-8 pb-20">
      <ResultsHeader query={query} onClear={onClear} />
      <div className="flex flex-col gap-9">
        <CurriculumGroup state={curriculum} />
        <TrainingGroup hits={courseHits} />
        <StandardsGroup hits={stdHits} />
      </div>
    </div>
  );
}
