'use client';

/**
 * Children inline at wide, behind a kit disclosure at narrow (owner ruling
 * 2026-08-18: narrow navigation and control rows become a slide-out
 * disclosure instead of scrolling or clipping — everything visible when
 * open, nothing behind a gesture with no affordance when closed).
 *
 * Built on the kit's native `<details class="oak-disclosure">`, so the
 * closed/open contract needs no script of its own and works before
 * hydration: the server renders the NARROW shape (narrow first, wide
 * follows), and a wide viewport dissolves the wrapper at mount, restoring
 * the inline arrangement. A pre-hydration wide visitor has a working
 * native disclosure rather than a broken control — the enhancement is the
 * dissolution, not the behaviour.
 *
 * THE TRADE, priced deliberately: a wide first paint ships the CLOSED
 * disclosure and expands at hydration — a one-time layout shift on
 * desktop loads, and the disclosure form is permanent with JS off.
 * Narrow-first makes the phone's first paint the honest one; the
 * pure-CSS alternative (forcing the panel visible at wide) cannot be
 * done against a closed `<details>` in today's browsers.
 *
 * Framedness's sibling: viewport width is a client-only fact, so it is
 * read through an external-store subscription (never an effect setState),
 * which keeps the server snapshot honest and the client render
 * cascade-free.
 */
import { useCallback, useSyncExternalStore } from 'react';
import type { ReactElement, ReactNode } from 'react';

function useMediaQueryMatch(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void): (() => void) => {
      const list = globalThis.matchMedia?.(query);
      list?.addEventListener('change', onChange);
      return () => {
        list?.removeEventListener('change', onChange);
      };
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => globalThis.matchMedia?.(query).matches === true,
    () => false,
  );
}

export function NarrowDisclosure({
  summary,
  wideQuery,
  className,
  children,
}: {
  /** The closed state's whole promise — name the contents, not "menu". */
  readonly summary: string;
  /** The media query at which the wrapper dissolves and children render
   *  inline — the same seam the surrounding layout band uses. */
  readonly wideQuery: string;
  readonly className?: string;
  readonly children: ReactNode;
}): ReactElement {
  const wide = useMediaQueryMatch(wideQuery);
  if (wide) {
    return <>{children}</>;
  }
  return (
    <details className={className === undefined ? 'oak-disclosure' : `oak-disclosure ${className}`}>
      <summary>{summary}</summary>
      {children}
    </details>
  );
}
