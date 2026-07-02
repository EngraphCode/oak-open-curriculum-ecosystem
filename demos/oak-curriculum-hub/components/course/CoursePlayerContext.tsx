'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';
import type { ReactElement, ReactNode } from 'react';

import { resolveActiveSection } from './course-player';
import type { PlayerEntry } from './course-player';

/**
 * The paginated-player state (plan Ratified decision #7): the active section id, the ordered section
 * sequence, and the navigate action. `activeSectionId === null` is the pre-hydration state — every
 * section stays visible, so the server-rendered full document is also the no-JS fallback.
 */
export interface CoursePlayerValue {
  readonly activeSectionId: string | null;
  readonly entries: readonly PlayerEntry[];
  readonly navigate: (sectionId: string) => void;
}

const CoursePlayerContext = createContext<CoursePlayerValue>({
  activeSectionId: null,
  entries: [],
  navigate: () => undefined,
});

/** Reads the player state (the all-visible pre-hydration default when no provider is above). */
export function useCoursePlayer(): CoursePlayerValue {
  return useContext(CoursePlayerContext);
}

interface PlayerSnapshot {
  readonly activeSectionId: string | null;
  readonly focusTargetId: string | null;
}

/** The server (and hydration first-pass) snapshot: no active section, so every section renders. */
const SERVER_SNAPSHOT: PlayerSnapshot = { activeSectionId: null, focusTargetId: null };

interface PlayerStore {
  readonly subscribe: (onChange: () => void) => () => void;
  readonly getSnapshot: () => PlayerSnapshot;
  readonly getServerSnapshot: () => PlayerSnapshot;
}

/**
 * The hash-derived player store. The location hash is the single source of truth; the store owns the
 * one genuinely stateful rule — STICKINESS — outside React (neither a ref read during render nor
 * setState in an effect, both lint-banned shapes here):
 *
 * - `#section=<id>` / `#<moduleId>` resolve to a section, which also becomes the focus target.
 * - An UNRESOLVABLE NON-EMPTY hash keeps the last-resolved section active and moves no focus (an
 *   in-content anchor must not reset the player — see {@link resolveActiveSection}'s constraint).
 * - An EMPTY hash shows the first section; when it follows a resolved section (history-back to the
 *   hashless URL) the first section's heading becomes the focus target, so focus never silently
 *   drops to `<body>`. On a plain arrival there is no prior section, so nothing takes focus.
 */
function createPlayerStore(entries: readonly PlayerEntry[]): PlayerStore {
  const first = entries[0]?.sectionId ?? null;
  let lastResolved: string | null = null;
  let snapshot: PlayerSnapshot | null = null;
  const compute = (): PlayerSnapshot => {
    const hash = globalThis.location.hash;
    const resolved = resolveActiveSection(hash, entries);
    let focusTargetId: string | null = null;
    if (resolved !== null) {
      lastResolved = resolved;
      focusTargetId = resolved;
    } else if (hash === '') {
      focusTargetId = lastResolved === null ? null : first;
      lastResolved = null;
    }
    return { activeSectionId: resolved ?? lastResolved ?? first, focusTargetId };
  };
  return {
    subscribe: (onChange: () => void): (() => void) => {
      const handler = (): void => {
        snapshot = compute();
        onChange();
      };
      globalThis.addEventListener('hashchange', handler);
      return () => {
        globalThis.removeEventListener('hashchange', handler);
      };
    },
    getSnapshot: (): PlayerSnapshot => {
      snapshot ??= compute();
      return snapshot;
    },
    getServerSnapshot: (): PlayerSnapshot => SERVER_SNAPSHOT,
  };
}

/**
 * Owns the player's active-section view over the server-rendered all-sections DOM, backed by the
 * hash store above — the active section is DERIVED, never synced into component state. Focus follows
 * every view change post-commit (SC 2.4.3) — after the gates have revealed the target, since
 * focusing a still-hidden element is a silent no-op — and lands on the section's H3
 * (`section-h-<id>`), so screen readers announce "<title>, heading, level 3" instead of a nameless
 * container. A plain arrival produces no focus target: stealing focus from the top of the page on
 * load is its own accessibility failure.
 */
export function CoursePlayerProvider({
  entries,
  children,
}: {
  entries: readonly PlayerEntry[];
  children: ReactNode;
}): ReactElement {
  const store = useMemo(() => createPlayerStore(entries), [entries]);
  const { activeSectionId, focusTargetId } = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  useEffect(() => {
    if (focusTargetId !== null) {
      document.getElementById(`section-h-${focusTargetId}`)?.focus();
    }
  }, [focusTargetId]);

  const navigate = useCallback((sectionId: string) => {
    globalThis.location.hash = `#section=${sectionId}`;
    // Browsers fire hashchange asynchronously; dispatching it here makes navigation synchronous for
    // the store's subscribers. The later native event recomputes an identical snapshot — a no-op.
    globalThis.dispatchEvent(new HashChangeEvent('hashchange'));
  }, []);

  const value = useMemo(
    () => ({ activeSectionId, entries, navigate }),
    [activeSectionId, entries, navigate],
  );
  return <CoursePlayerContext.Provider value={value}>{children}</CoursePlayerContext.Provider>;
}
