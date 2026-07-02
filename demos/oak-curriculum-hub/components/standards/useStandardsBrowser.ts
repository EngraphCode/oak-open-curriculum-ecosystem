'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import {
  DEFAULT_LIMIT,
  buildStandardsView,
  initialBrowseState,
  parseFocusIds,
  type StandardsBrowseState,
  type StandardsView,
} from '@/lib/standards-view-model';

/** Everything the standards browser component renders and wires — the view plus intent handlers. */
export interface StandardsBrowserModel {
  readonly view: StandardsView;
  readonly query: string;
  readonly regionRef: RefObject<HTMLElement | null>;
  readonly detailRef: RefObject<HTMLDivElement | null>;
  readonly search: (query: string) => void;
  readonly filterTo: (patch: Partial<StandardsBrowseState>) => void;
  readonly reset: () => void;
  readonly showMore: () => void;
  readonly showAll: () => void;
  readonly open: (id: string) => void;
  readonly back: () => void;
}

/** Read `#qs=` deep-link focus ids from the URL on mount and whenever the hash changes. */
function useHashFocusIds(onFocus: (ids: readonly string[] | null) => void): void {
  useEffect(() => {
    const apply = (): void => onFocus(parseFocusIds(globalThis.location.hash));
    apply();
    globalThis.addEventListener('hashchange', apply);
    return () => globalThis.removeEventListener('hashchange', apply);
  }, [onFocus]);
}

/**
 * State, focus management, and intent handlers for the `/standards` browser. Focus moves to the
 * results region on a deep-link / pagination / detail-close and into the detail view on open —
 * but never on a filter/search keystroke (`pendingFocus` is only set by view-changing actions),
 * so typing in the search box is never interrupted. The view is memoised (a pure function of state).
 */
export function useStandardsBrowser(): StandardsBrowserModel {
  const [state, setState] = useState<StandardsBrowseState>(initialBrowseState);
  const regionRef = useRef<HTMLElement | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);
  const pendingFocus = useRef<'region' | 'detail' | null>(null);

  const setFocusIds = useCallback((focusIds: readonly string[] | null): void => {
    pendingFocus.current = focusIds === null ? null : 'region';
    setState((prev) => ({ ...prev, focusIds, openId: null, limit: DEFAULT_LIMIT }));
  }, []);
  useHashFocusIds(setFocusIds);

  useEffect(() => {
    const target = pendingFocus.current;
    if (target === null) {
      return;
    }
    pendingFocus.current = null;
    (target === 'detail' ? detailRef : regionRef).current?.focus();
  });

  const view = useMemo(() => buildStandardsView(state), [state]);
  const filterTo = (patch: Partial<StandardsBrowseState>): void =>
    setState((prev) => ({ ...prev, ...patch, focusIds: null, openId: null, limit: DEFAULT_LIMIT }));
  const paginate = (limit: number): void => {
    pendingFocus.current = 'region';
    setState((prev) => ({ ...prev, limit }));
  };
  const setPendingThen = (
    patch: Partial<StandardsBrowseState>,
    focus: 'region' | 'detail',
  ): void => {
    pendingFocus.current = focus;
    setState((prev) => ({ ...prev, ...patch }));
  };

  return {
    view,
    query: state.query,
    regionRef,
    detailRef,
    search: (query) => filterTo({ query }),
    filterTo,
    reset: () => setState(initialBrowseState),
    showMore: () => paginate(state.limit + DEFAULT_LIMIT),
    showAll: () => paginate(view.showAllCount),
    open: (openId) => setPendingThen({ openId }, 'detail'),
    back: () => setPendingThen({ openId: null }, 'region'),
  };
}
