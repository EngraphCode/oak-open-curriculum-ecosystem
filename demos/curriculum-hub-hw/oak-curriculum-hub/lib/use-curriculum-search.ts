'use client';

/**
 * Live curriculum search hook (data-plane seam for the unified hub search).
 * Demo by Heather W.
 *
 * Seam contract (option A, agreed with the styling lane): the hero owns the
 * query string; the "From the Oak curriculum" presentational group calls this
 * hook with that query and self-fetches the live lessons/units/threads. The
 * hook owns the fetch, debounce, abort, and state model; the group owns how the
 * returned {@link CurriculumSearchState} is rendered.
 *
 * Client-safe by construction: imports only the client-safe view models from
 * `@/lib/search-types` and calls the `/api/search` route — never the server-only
 * `search-client.ts` (which would drag `node:*` into the client bundle).
 */

import { useEffect, useState } from 'react';
import { isSearchResults, type SearchResults } from '@/lib/search-types';

/** The render states of a live curriculum search. `idle` is derived from an empty query. */
export type CurriculumSearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; results: SearchResults }
  | { status: 'empty' }
  | { status: 'unconfigured' }
  | { status: 'error' };

/** Map a fetch Response to the next UI state (503 = backend unconfigured). */
async function responseToState(res: Response): Promise<CurriculumSearchState> {
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
  setState: (next: CurriculumSearchState) => void,
  fetchFn: typeof fetch,
): Promise<void> {
  setState({ status: 'loading' });
  try {
    const res = await fetchFn(`/api/search?q=${encodeURIComponent(query)}`, { signal });
    setState(await responseToState(res));
  } catch (e) {
    if (e instanceof Error && e.name !== 'AbortError') {
      setState({ status: 'error' });
    }
  }
}

/**
 * Debounced (250ms) live curriculum search. `idle` is DERIVED from an empty
 * query rather than stored, so the effect never sets state synchronously during
 * render. The controller is aborted in the effect CLEANUP, which covers both
 * lifecycles with one mechanism: a query change aborts the prior in-flight
 * request (cleanup runs before the next effect), and unmount aborts whatever
 * is still in flight (nothing survives the component).
 *
 * @param query - the live search string (owned by the caller, e.g. the hero input)
 * @param fetchFn - the fetch implementation; injectable so the lifecycle
 *   contract is testable with an inline fake (defaults to the global fetch)
 * @returns the current {@link CurriculumSearchState} for the caller to render
 */
export function useCurriculumSearch(
  query: string,
  fetchFn: typeof fetch = fetch,
): CurriculumSearchState {
  const [state, setState] = useState<CurriculumSearchState>({ status: 'idle' });

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed === '') {
      return undefined;
    }
    const ac = new AbortController();
    const timer = setTimeout(() => {
      void performSearch(trimmed, ac.signal, setState, fetchFn);
    }, 250);
    return () => {
      clearTimeout(timer);
      ac.abort();
    };
  }, [query, fetchFn]);

  return query.trim() === '' ? { status: 'idle' } : state;
}
