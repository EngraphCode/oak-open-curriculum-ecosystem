'use client';

import type { ReactElement } from 'react';
import { useCurriculumSearch, type CurriculumSearchState } from '@/lib/use-curriculum-search';
import { searchHub } from '@/lib/hub-search';
import type { SearchResults } from '@/lib/search-types';
import { GroupHeader, mutedClass, TrainingGroup, StandardsGroup } from './HubLocalGroups';
import { LessonCard, UnitCard, ThreadCard } from './ResultCards';

const groupLabelClass = 'mb-2.5 text-xs font-bold uppercase tracking-[0.05em] text-oak-grey';

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
 * The unified hub-wide search results view: the static training-courses and quality-standards
 * groups first (the hub's own specialist content), then the live curriculum group below as
 * the secondary tier (E2 — the primary/secondary hierarchy the flat ordering blurred), all
 * keyed off one query. Pure over its inputs — the curriculum search state arrives as a prop
 * (the same seam {@link CurriculumGroup} models), so the ordering contract is testable
 * without stubbing the hook. Exported for component tests.
 */
export function HubResultsView({
  query,
  onClear,
  curriculum,
}: {
  query: string;
  onClear: () => void;
  curriculum: CurriculumSearchState;
}): ReactElement {
  const { courseHits, stdHits } = searchHub(query);
  return (
    <div className="mx-auto max-w-[1080px] px-6 pt-8 pb-20">
      <ResultsHeader query={query} onClear={onClear} />
      <div className="flex flex-col gap-9">
        <TrainingGroup hits={courseHits} />
        <StandardsGroup hits={stdHits} />
        <CurriculumGroup state={curriculum} />
      </div>
    </div>
  );
}

/** Binds the live curriculum search to the view (the module's only hook consumer). */
export default function HubResults({
  query,
  onClear,
}: {
  query: string;
  onClear: () => void;
}): ReactElement {
  return <HubResultsView query={query} onClear={onClear} curriculum={useCurriculumSearch(query)} />;
}
