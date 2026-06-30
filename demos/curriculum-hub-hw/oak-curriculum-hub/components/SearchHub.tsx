'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { isSearchResults, type SearchResults } from '@/lib/search-types';
import { LessonCard, UnitCard, ThreadCard } from './ResultCards';

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; results: SearchResults }
  | { status: 'empty' }
  | { status: 'unconfigured' }
  | { status: 'error' };

const sectionLabelClass = 'mb-2.5 text-xs font-bold uppercase tracking-[0.05em] text-oak-grey';

/** Map a fetch Response to the next UI state. */
async function responseToState(res: Response): Promise<State> {
  if (res.status === 503) {
    return { status: 'unconfigured' };
  }
  if (!res.ok) {
    return { status: 'error' };
  }
  const data: unknown = await res.json();
  if (!isSearchResults(data)) {
    return { status: 'error' };
  }
  const total = data.lessons.length + data.units.length + data.threads.length;
  return total === 0 ? { status: 'empty' } : { status: 'ok', results: data };
}

async function performSearch(
  query: string,
  signal: AbortSignal,
  setState: (next: State) => void,
): Promise<void> {
  setState({ status: 'loading' });
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal });
    setState(await responseToState(res));
  } catch (e) {
    if (e instanceof Error && e.name !== 'AbortError') {
      setState({ status: 'error' });
    }
  }
}

/**
 * Debounced live curriculum search. Idle is DERIVED from an empty query rather
 * than stored, so the effect never sets state synchronously during render.
 */
function useCurriculumSearch(q: string): State {
  const [state, setState] = useState<State>({ status: 'idle' });
  const acRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const query = q.trim();
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (query !== '') {
      acRef.current?.abort();
      const ac = new AbortController();
      acRef.current = ac;
      timer = setTimeout(() => {
        void performSearch(query, ac.signal, setState);
      }, 250);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [q]);

  return q.trim() === '' ? { status: 'idle' } : state;
}

export default function SearchHub(): ReactElement {
  const [q, setQ] = useState('');
  const state = useCurriculumSearch(q);

  return (
    <div className="mx-auto max-w-[1080px] px-6 pb-20">
      <SearchField value={q} onChange={setQ} loading={state.status === 'loading'} />
      <StatusView state={state} />
    </div>
  );
}

function SearchField({
  value,
  onChange,
  loading,
}: {
  value: string;
  onChange: (next: string) => void;
  loading: boolean;
}): ReactElement {
  return (
    <div className="mt-2 mb-7 flex items-center gap-3 rounded-[14px] border-2 border-oak-black bg-white px-[18px] py-3.5 shadow-oak-lemon">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-oak-black"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search lessons, units and threads — try ‘comparing fractions’ or ‘the Romans’"
        aria-label="Search the curriculum"
        className="flex-1 border-none bg-transparent text-[17px] font-light leading-snug text-oak-black outline-none placeholder:text-oak-grey"
      />
      {loading && <span className="text-[13px] font-light text-oak-grey">Searching…</span>}
    </div>
  );
}

function StatusView({ state }: { state: State }): ReactElement | null {
  if (state.status === 'idle') {
    return (
      <p className="max-w-[520px] text-[15px] font-light leading-relaxed text-oak-grey">
        Start typing to search Oak&rsquo;s fully sequenced curriculum. Results come live from the
        curriculum search service.
      </p>
    );
  }
  if (state.status === 'unconfigured') {
    return (
      <Notice
        title="Search backend not configured"
        body="Set ELASTICSEARCH_URL and ELASTICSEARCH_API_KEY in .env to connect to the Elasticsearch Serverless instance."
      />
    );
  }
  if (state.status === 'error') {
    return <Notice title="Something went wrong" body="The search request failed. Check the server logs." />;
  }
  if (state.status === 'empty') {
    return <Notice title="Nothing matches that yet" body="Try a broader term, a subject, or a key concept." />;
  }
  if (state.status === 'ok') {
    return <Results results={state.results} />;
  }
  return null;
}

function Results({ results }: { results: SearchResults }): ReactElement {
  return (
    <div className="flex flex-col gap-7">
      {results.lessons.length > 0 && (
        <section>
          <div className={sectionLabelClass}>Lessons</div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(330px,1fr))] gap-3">
            {results.lessons.map((h) => (
              <LessonCard key={h.id} hit={h} />
            ))}
          </div>
        </section>
      )}

      {results.units.length > 0 && (
        <section>
          <div className={sectionLabelClass}>Units</div>
          <div className="flex flex-col gap-2.5">
            {results.units.map((h) => (
              <UnitCard key={h.id} hit={h} />
            ))}
          </div>
        </section>
      )}

      {results.threads.length > 0 && (
        <section>
          <div className={sectionLabelClass}>Learning threads</div>
          <div className="flex flex-wrap gap-2.5">
            {results.threads.map((h) => (
              <ThreadCard key={h.id} hit={h} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Notice({ title, body }: { title: string; body: string }): ReactElement {
  return (
    <div className="max-w-[560px] rounded-[10px] border-2 border-l-[6px] border-oak-black bg-oak-notice px-[18px] py-4">
      <div className="mb-1 text-base font-semibold leading-tight">{title}</div>
      <div className="text-sm font-light leading-[1.55] text-oak-grey">{body}</div>
    </div>
  );
}
