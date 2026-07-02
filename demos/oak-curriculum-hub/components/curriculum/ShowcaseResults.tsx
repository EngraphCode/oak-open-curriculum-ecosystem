import type { ReactElement, ReactNode } from 'react';

import { Notice, mutedClass } from '@/components/HubLocalGroups';
import { LessonCard, UnitCard, ThreadCard } from '@/components/ResultCards';
import type { CurriculumSearchState } from '@/lib/use-curriculum-search';
import type { SearchResults } from '@/lib/search-types';

type ScopeMeta = { readonly total: number; readonly took: number } | undefined;

/** One scope's header row: title plus honest stats — or the failed-scope state when the
 *  envelope carries no meta for it (absent meta = that scope FAILED, never "0 results"). */
function ScopeHeader({
  title,
  count,
  meta,
}: {
  title: string;
  count: number;
  meta: ScopeMeta;
}): ReactElement {
  return (
    <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <h2 className="text-[22px] leading-7 font-semibold">{title}</h2>
      {meta === undefined ? (
        <span className={mutedClass}>unavailable — this part of the search failed</span>
      ) : (
        <span className={mutedClass}>
          {/* The SDK's meta.total is the count RETURNED in this response, not a
              corpus-wide match count — "total matches" overstated capped searches. */}
          {meta.total} returned · showing {count} · {meta.took}&nbsp;ms
        </span>
      )}
    </div>
  );
}

/** One scope: header + the hits (or the honest zero-copy when the scope ran but matched nothing). */
function ScopeSection({
  title,
  count,
  meta,
  emptyCopy,
  children,
}: {
  title: string;
  count: number;
  meta: ScopeMeta;
  emptyCopy: string;
  children: ReactNode;
}): ReactElement {
  return (
    <section>
      <ScopeHeader title={title} count={count} meta={meta} />
      {count > 0 ? children : meta !== undefined && <p className={mutedClass}>{emptyCopy}</p>}
    </section>
  );
}

/** The combined latency stat: MAX across the scopes that ran (the three queries run in
 *  parallel, so max — never sum — is the honest wall-clock figure). */
function combinedLatency(results: SearchResults): number | null {
  const tooks = [
    results.meta?.lessons?.took,
    results.meta?.units?.took,
    results.meta?.threads?.took,
  ].filter((took): took is number => typeof took === 'number');
  return tooks.length > 0 ? Math.max(...tooks) : null;
}

function OkResults({ results }: { results: SearchResults }): ReactElement {
  const latency = combinedLatency(results);
  return (
    <div className="flex flex-col gap-10">
      {latency !== null && (
        <p className={mutedClass}>
          Live from Elasticsearch — slowest scope answered in {latency}&nbsp;ms.
        </p>
      )}
      <ScopeSection
        title="Lessons"
        count={results.lessons.length}
        meta={results.meta?.lessons}
        emptyCopy="No matching lessons."
      >
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(330px,100%),1fr))] gap-3">
          {results.lessons.map((h) => (
            <LessonCard key={h.id} hit={h} />
          ))}
        </div>
      </ScopeSection>
      <ScopeSection
        title="Units"
        count={results.units.length}
        meta={results.meta?.units}
        emptyCopy="No matching units."
      >
        <div className="flex flex-col gap-2.5">
          {results.units.map((h) => (
            <UnitCard key={h.id} hit={h} />
          ))}
        </div>
      </ScopeSection>
      <ScopeSection
        title="Learning threads"
        count={results.threads.length}
        meta={results.meta?.threads}
        emptyCopy="No matching threads."
      >
        <div className="flex flex-wrap gap-2.5">
          {results.threads.map((h) => (
            <ThreadCard key={h.id} hit={h} />
          ))}
        </div>
      </ScopeSection>
    </div>
  );
}

/** The ok-state announcement: result count plus any failed scopes, so AT users hear the
 *  same honesty the visible stats carry. */
function okAnnouncement(results: SearchResults): string {
  const total = results.lessons.length + results.units.length + results.threads.length;
  const failed = (['lessons', 'units', 'threads'] as const).filter(
    (scope) => results.meta?.[scope] === undefined,
  );
  const base = `${total} ${total === 1 ? 'result' : 'results'} from the Oak curriculum`;
  return failed.length > 0 ? `${base}; ${failed.join(' and ')} unavailable` : base;
}

/** The polite announcement text per state (silent for idle — nothing changed for AT to hear). */
function showcaseAnnouncement(state: CurriculumSearchState): string {
  if (state.status === 'loading') {
    return 'Searching the Oak curriculum';
  }
  if (state.status === 'ok') {
    return okAnnouncement(state.results);
  }
  if (state.status === 'unconfigured') {
    return 'Oak curriculum search is not configured';
  }
  if (state.status === 'error') {
    return 'Oak curriculum search failed';
  }
  return state.status === 'empty' ? 'No matching curriculum content' : '';
}

/** The state-appropriate body below the announcement. */
function ShowcaseBody({ state }: { state: CurriculumSearchState }): ReactElement {
  switch (state.status) {
    case 'idle':
      return (
        <p className={mutedClass}>
          Try a search above — results arrive live from the published national curriculum.
        </p>
      );
    case 'loading':
      return <p className={mutedClass}>Searching…</p>;
    case 'ok':
      return <OkResults results={state.results} />;
    case 'empty':
      return <p className={mutedClass}>No lessons, units or threads matched that search.</p>;
    case 'unconfigured':
      return (
        <Notice
          title="Search backend not configured"
          body="Set ELASTICSEARCH_URL and ELASTICSEARCH_API_KEY in .env to connect live curriculum search."
        />
      );
    case 'error':
      return (
        <Notice
          title="Something went wrong"
          body="The curriculum search request failed. Check the server logs."
        />
      );
  }
}

/**
 * The showcase's result surface, pure over the search state: per-scope sections with honest
 * meta stats (total / shown / took, the failed-scope state on absent meta) and the
 * max-latency line. A polite live region announces state changes (WCAG 2.2 SC 4.1.3).
 */
export function ShowcaseResults({ state }: { state: CurriculumSearchState }): ReactElement {
  return (
    <div>
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {showcaseAnnouncement(state)}
      </p>
      <ShowcaseBody state={state} />
    </div>
  );
}
