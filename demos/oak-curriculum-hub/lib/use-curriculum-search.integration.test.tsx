import { describe, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';

import { useCurriculumSearch } from './use-curriculum-search';

/**
 * The hook's lifecycle contract: an in-flight request must not survive unmount
 * (the abort belongs to the effect cleanup, not only to the next query). The
 * fetch is INJECTED (inline fake capturing its AbortSignal, never resolving —
 * a permanently in-flight request), so the contract is describable without
 * prohibited mechanisms.
 */

interface Capture {
  signal: AbortSignal | null;
}

const inFlightFetch =
  (capture: Capture): typeof fetch =>
  (_input, init) => {
    capture.signal = init?.signal ?? null;
    return new Promise<Response>(() => {
      // never resolves: the request stays in flight for the test's lifetime
    });
  };

function Probe({ query, fetchFn }: { query: string; fetchFn: typeof fetch }): React.JSX.Element {
  const state = useCurriculumSearch(query, fetchFn);
  return <output>{state.status}</output>;
}

describe('useCurriculumSearch lifecycle', () => {
  it('aborts the in-flight request on unmount', async () => {
    const capture: Capture = { signal: null };
    const { unmount } = render(<Probe query="photosynthesis" fetchFn={inFlightFetch(capture)} />);

    // The debounce (250ms) must elapse before the request starts.
    await waitFor(() => expect(capture.signal).not.toBeNull(), { timeout: 2000 });
    expect(capture.signal?.aborted).toBe(false);

    unmount();

    expect(capture.signal?.aborted).toBe(true);
  });

  it('aborts the prior in-flight request when the query changes', async () => {
    const capture: Capture = { signal: null };
    const fetchFn = inFlightFetch(capture);
    const { rerender } = render(<Probe query="photosynthesis" fetchFn={fetchFn} />);

    await waitFor(() => expect(capture.signal).not.toBeNull(), { timeout: 2000 });
    const first = capture.signal;

    rerender(<Probe query="fractions" fetchFn={fetchFn} />);

    await waitFor(() => expect(first?.aborted).toBe(true), { timeout: 2000 });
  });
});

const envelopeFetch =
  (body: unknown): typeof fetch =>
  () =>
    Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));

const scopeMeta = { total: 0, took: 3 };

describe('useCurriculumSearch degraded-scope honesty', () => {
  it('reports error, not empty, when zero hits coincide with a failed scope', async () => {
    // A failed SDK scope is omitted from meta; zero hits from the surviving
    // scopes must not read as "no matching results" when part of the index
    // never answered.
    const degraded = {
      lessons: [],
      units: [],
      threads: [],
      meta: { lessons: scopeMeta },
    };
    render(<Probe query="photosynthesis" fetchFn={envelopeFetch(degraded)} />);
    await waitFor(() => expect(document.querySelector('output')?.textContent).toBe('error'), {
      timeout: 2000,
    });
  });

  it('reports empty when zero hits come from a fully answered search', async () => {
    const genuineEmpty = {
      lessons: [],
      units: [],
      threads: [],
      meta: { lessons: scopeMeta, units: scopeMeta, threads: scopeMeta },
    };
    const { rerender } = render(
      <Probe query="zzz-no-hits" fetchFn={envelopeFetch(genuineEmpty)} />,
    );
    rerender(<Probe query="zzz-no-hits" fetchFn={envelopeFetch(genuineEmpty)} />);
    await waitFor(() => expect(document.querySelector('output')?.textContent).toBe('empty'), {
      timeout: 2000,
    });
  });
});
